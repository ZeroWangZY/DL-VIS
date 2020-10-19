import mindspore.common.dtype as mstype
import mindspore.dataset as ds
import mindspore.dataset.vision.c_transforms as C
import mindspore.dataset.transforms.c_transforms as C2
from mindspore.nn.loss import SoftmaxCrossEntropyWithLogits
from mindspore.nn.optim.momentum import Momentum
from mindspore.train.model import Model
from mindspore import context
from mindspore.train.callback import LossMonitor
from mindspore.train.serialization import load_checkpoint
from mindspore.ops.primitive import Primitive
from resnet import resnet50
from mindspore.train.callback import Callback
import random
import os


os.environ['CUDA_VISIBLE_DEVICES']="2"
random.seed(1)
data_home = "./dataset/10-batches-bin"
batch_size = 32
num_classes = 10

context.set_context(mode=context.PYNATIVE_MODE, device_target="GPU")


class FixedIndeciesSampler(ds.Sampler):
    def __init__(self, indices):
        super(FixedIndeciesSampler, self).__init__()
        self.indices = indices

    def __iter__(self):
        for i in self.indices:
            yield i


def create_dataset(indices, repeat_num=1, training=True):
    """
    create data for next use such as training or infering
    """
    cifar_ds = ds.Cifar10Dataset(data_home, sampler=FixedIndeciesSampler(indices))

    resize_height = 224
    resize_width = 224
    rescale = 1.0 / 255.0
    shift = 0.0

    # define map operations
    random_crop_op = C.RandomCrop((32, 32), (4, 4, 4, 4))  # padding_mode default CONSTANT
    random_horizontal_op = C.RandomHorizontalFlip()
    resize_op = C.Resize((resize_height, resize_width))  # interpolation default BILINEAR
    rescale_op = C.Rescale(rescale, shift)
    normalize_op = C.Normalize((0.4914, 0.4822, 0.4465), (0.2023, 0.1994, 0.2010))
    changeswap_op = C.HWC2CHW()
    type_cast_op = C2.TypeCast(mstype.int32)

    c_trans = []
    if training:
        c_trans = [random_crop_op, random_horizontal_op]
    c_trans += [resize_op, rescale_op, normalize_op,
                changeswap_op]

    # apply map operations on images
    cifar_ds = cifar_ds.map(operations=type_cast_op, input_columns="label")
    cifar_ds = cifar_ds.map(operations=c_trans, input_columns="image")

    # apply batch operations
    cifar_ds = cifar_ds.batch(batch_size=batch_size, drop_remainder=True)

    # apply repeat operations
    cifar_ds = cifar_ds.repeat(repeat_num)

    return cifar_ds


class DataInterceptionCallback(Callback):
    def __init__(self, node_name, data_type):
        super(DataInterceptionCallback, self).__init__()
        self.result = None
        self.node_name = node_name
        self.data_type = data_type

    def begin(self, run_context):
        params = run_context.original_args()

        # overwrite optimizer
        opt = params.optimizer
        old_construct = opt.construct
        weight_names = [param.name for param in opt.parameters]

        def new_construct(grads):
            for i in range(len(weight_names)):
                if weight_names[i] == self.node_name:
                    if self.data_type == "gradient":
                        self.result = grads[i].asnumpy()
                    if self.data_type == "weight":
                        self.result = opt.parameters[i].asnumpy()
            return old_construct(grads)

        opt.construct = new_construct

        # overwrite Primitive.__call__
        call_method = getattr(Primitive, '__call__')

        def new_call_method(self_, *args):
            output = call_method(self_, *args)
            should_save = False
            parameter_name = None
            for arg in args:
                if hasattr(arg, 'requires_grad') and getattr(arg,
                                                             'requires_grad'):
                    should_save = True
                    parameter_name = arg.name
                    break
            if should_save and parameter_name[
                               0:parameter_name.rfind('.')] == self.node_name and self.data_type == "activation":
                self.result = output.asnumpy()
            return output

        setattr(Primitive, '__call__', new_call_method)


def get_tensor_from_training(indices, ckpt_file="/tmp/pycharm_project_589/summary_dir-202010191622/weights/-1_350.ckpt",
                             node_name="conv1.weight", data_type="gradient"):
    context.set_context(reserve_class_name_in_scope=False)
    net = resnet50(batch_size, num_classes)
    load_checkpoint(ckpt_file, net=net)
    ls = SoftmaxCrossEntropyWithLogits(sparse=True, reduction="mean")
    opt = Momentum(filter(lambda x: x.requires_grad, net.get_parameters()), 0.01, 0.9)
    model = Model(net, loss_fn=ls, optimizer=opt, metrics={'acc'})
    dataset = create_dataset(indices)

    data_inception_callback = DataInterceptionCallback(node_name=node_name, data_type=data_type)
    model.train(1, dataset,
                callbacks=[LossMonitor(), data_inception_callback],
                dataset_sink_mode=False)
    return data_inception_callback.result

if __name__ == "__main__":
    input_indices = list(range(32))
    print(get_tensor_from_training(input_indices))