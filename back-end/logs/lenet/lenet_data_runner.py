import os
import argparse
import mindspore.dataset as ds
import mindspore.nn as nn
from mindspore import context, Model
from mindspore.train.serialization import load_checkpoint, load_param_into_net
from mindspore.common.initializer import Normal
from mindspore.train.callback import ModelCheckpoint, CheckpointConfig, LossMonitor, SummaryCollector
import mindspore.dataset.vision.c_transforms as CV
import mindspore.dataset.transforms.c_transforms as C
from mindspore.dataset.vision import Inter
from mindspore.nn.metrics import Accuracy
from mindspore import dtype as mstype
from mindspore.nn.loss import SoftmaxCrossEntropyWithLogits
import mindspore.common.dtype as mstype
from mindspore import context
from mindspore import log as logger
from mindspore.nn.wrap.loss_scale import DynamicLossScaleUpdateCell
from mindspore.nn.optim import AdamWeightDecay, Lamb, Momentum
from mindspore.ops.primitive import Primitive
from mindspore.train.model import Model
from mindspore.train.callback import Callback
from mindspore.train.callback import CheckpointConfig, ModelCheckpoint, TimeMonitor, SummaryCollector
from mindspore.train.serialization import load_checkpoint, load_param_into_net

_cur_dir = os.getcwd()
count = 0
weight_dict = {           # 后端计数器与前端的映射
    "conv1_Conv2d": "conv1.weight",
    "conv2_Conv2d": "conv2.weight",
    "9": "fc1.weight",
    "12": "fc2.weight",
    "15": "fc3.weight"
}

back_target_dict = {
    1: "conv1_Conv2d",
    4: "conv2_Conv2d",
    10: "9",
    13: "12",
    16: "15"
}

class LeNet5(nn.Cell):
    """Lenet network structure."""
    # define the operator required
    def __init__(self, num_class=10, num_channel=1):
        super(LeNet5, self).__init__()
        self.conv1 = nn.Conv2d(num_channel, 6, 5, pad_mode='valid')
        self.conv2 = nn.Conv2d(6, 16, 5, pad_mode='valid')
        self.fc1 = nn.Dense(16 * 5 * 5, 120, weight_init=Normal(0.02))
        self.fc2 = nn.Dense(120, 84, weight_init=Normal(0.02))
        self.fc3 = nn.Dense(84, num_class, weight_init=Normal(0.02))
        self.relu = nn.ReLU()
        self.max_pool2d = nn.MaxPool2d(kernel_size=2, stride=2)
        self.flatten = nn.Flatten()

    # use the preceding operators to construct networks
    def construct(self, x):
        x = self.max_pool2d(self.relu(self.conv1(x)))
        x = self.max_pool2d(self.relu(self.conv2(x)))
        x = self.flatten(x)
        x = self.relu(self.fc1(x))
        x = self.relu(self.fc2(x))
        x = self.fc3(x)
        return x

class FixedIndeciesSampler(ds.Sampler):
    def __init__(self, indices):
        super(FixedIndeciesSampler, self).__init__()
        self.indices = indices

    def __iter__(self):
        for i in self.indices:
            yield i

def create_dataset(indices, data_path, batch_size=32, repeat_size=1,
                   num_parallel_workers=1):
    mnist_ds = ds.MnistDataset(data_path, sampler=FixedIndeciesSampler(indices))

    # define operation parameters
    resize_height, resize_width = 32, 32
    rescale = 1.0 / 255.0
    shift = 0.0
    rescale_nml = 1 / 0.3081
    shift_nml = -1 * 0.1307 / 0.3081

    # define map operations
    resize_op = CV.Resize((resize_height, resize_width), interpolation=Inter.LINEAR)  # Resize images to (32, 32)
    rescale_nml_op = CV.Rescale(rescale_nml, shift_nml) # normalize images
    rescale_op = CV.Rescale(rescale, shift) # rescale images
    hwc2chw_op = CV.HWC2CHW() # change shape from (height, width, channel) to (channel, height, width) to fit network.
    type_cast_op = C.TypeCast(mstype.int32) # change data type of label to int32 to fit network

    # apply map operations on images
    mnist_ds = mnist_ds.map(operations=type_cast_op, input_columns="label", num_parallel_workers=num_parallel_workers)
    mnist_ds = mnist_ds.map(operations=resize_op, input_columns="image", num_parallel_workers=num_parallel_workers)
    mnist_ds = mnist_ds.map(operations=rescale_op, input_columns="image", num_parallel_workers=num_parallel_workers)
    mnist_ds = mnist_ds.map(operations=rescale_nml_op, input_columns="image", num_parallel_workers=num_parallel_workers)
    mnist_ds = mnist_ds.map(operations=hwc2chw_op, input_columns="image", num_parallel_workers=num_parallel_workers)

    # apply DatasetOps
    # buffer_size = 10000
    # mnist_ds = mnist_ds.shuffle(buffer_size=buffer_size)  # 10000 as in LeNet train script
    mnist_ds = mnist_ds.batch(batch_size, drop_remainder=True)
    mnist_ds = mnist_ds.repeat(repeat_size)

    return mnist_ds

class DataInterceptionCallback(Callback):
    def __init__(self, node_name, data_type):
        super(DataInterceptionCallback, self).__init__()
        self.result = None
        self.labels = None
        self.origin_call_method = None
        self.node_name = node_name
        self.data_type = data_type

    def begin(self, run_context):
        global count
        global countList
        params = run_context.original_args()

        count = 0
        # overwrite optimizer
        opt = params['optimizer']
        old_construct = opt.construct
        weight_names = [param.name for param in opt.parameters]

        def new_construct(grads):
            for i in range(len(weight_names)):
                if weight_names[i][-7:] == ".weight":
                    if weight_names[i] == weight_dict[self.node_name]: # 要判一下node_name [conv1_Conv2d, conv2_Conv2d, 9, 12, 15]
                        if self.data_type == "gradient":
                            self.result = grads[i].asnumpy()
                        if self.data_type == "weight":
                            self.result = opt.parameters[i].asnumpy()
            return old_construct(grads)

        opt.construct = new_construct


    def step_begin(self, run_context):
        params = run_context.original_args()
        self.labels = params.train_dataset_element[1].asnumpy()

        # overwrite Primitive.__call__
        self.origin_call_method = getattr(Primitive, '__call__')

        def new_call_method(self_, *args):
            global count
            global countList
            output = self.origin_call_method(self_, *args)

            count = count + 1
            should_save = False

            if count in [1, 4, 10, 13, 16]:
                should_save = True
            if should_save and back_target_dict[count] == self.node_name:
                self.result = output.asnumpy()
            return output

        setattr(Primitive, '__call__', new_call_method)

    def step_end(self, run_context):
        setattr(Primitive, '__call__', self.origin_call_method)

class LenetDataRunner:
    def get_tensor_from_training(self, indices, ckpt_file="./checkpoint_lenet-1_1875.ckpt",
                                 node_name="9", data_type="activation"):
        global count
        count = 0

        # learning rate setting
        lr = 1e-2
        momentum = 0.9
        net_loss = SoftmaxCrossEntropyWithLogits(sparse=True, reduction='mean')
        # create the network
        net = LeNet5()
        load_checkpoint(ckpt_file, net) # 加载ckpt数据
        net_opt = nn.Momentum(net.trainable_params(), lr, momentum)
        model = Model(net, net_loss, net_opt, metrics={"Accuracy": Accuracy()})

        mnist_path = "./logs/lenet/MNIST_Data"
        ds_train = create_dataset(indices, os.path.join(mnist_path, "train"), 32, 1)
        summary_collector = SummaryCollector(summary_dir='./summary_dir', collect_freq=20)
        data_interception_callback = DataInterceptionCallback(node_name, data_type)
        model.train(1, ds_train,
                            callbacks=[LossMonitor(), summary_collector, data_interception_callback],
                            dataset_sink_mode=False)
        return data_interception_callback.result, data_interception_callback.labels


# if __name__ == "__main__":
#     input_indices = list(range(32))
#     print(get_tensor_from_training(input_indices))
