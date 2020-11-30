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
from mindspore.train.callback import Callback
import mindspore
import random
import os
import time
import numpy as np
import mindspore.nn as nn
from mindspore import Tensor
from mindspore.ops import operations as P
from mindspore.common.initializer import initializer
from mindspore.common import dtype as mstype


def weight_variable(shape):
    """weight_variable"""
    return initializer('XavierUniform', shape=shape, dtype=mstype.float32)


def weight_variable_uniform(shape):
    """weight_variable_uniform"""
    return initializer('Uniform', shape=shape, dtype=mstype.float32)


def weight_variable_0(shape):
    """weight_variable_0"""
    zeros = np.zeros(shape).astype(np.float32)
    return Tensor(zeros)


def weight_variable_1(shape):
    """weight_variable_1"""
    ones = np.ones(shape).astype(np.float32)
    return Tensor(ones)


def conv3x3(in_channels, out_channels, stride=1, padding=0):
    """3x3 convolution """
    weight_shape = (out_channels, in_channels, 3, 3)
    weight = weight_variable(weight_shape)
    return nn.Conv2d(in_channels, out_channels,
                     kernel_size=3, stride=stride, padding=padding, weight_init=weight, has_bias=False, pad_mode="same")


def conv1x1(in_channels, out_channels, stride=1, padding=0):
    """1x1 convolution"""
    weight_shape = (out_channels, in_channels, 1, 1)
    weight = weight_variable(weight_shape)
    return nn.Conv2d(in_channels, out_channels,
                     kernel_size=1, stride=stride, padding=padding, weight_init=weight, has_bias=False, pad_mode="same")


def conv7x7(in_channels, out_channels, stride=1, padding=0):
    """1x1 convolution"""
    weight_shape = (out_channels, in_channels, 7, 7)
    weight = weight_variable(weight_shape)
    return nn.Conv2d(in_channels, out_channels,
                     kernel_size=7, stride=stride, padding=padding, weight_init=weight, has_bias=False, pad_mode="same")


def bn_with_initialize(out_channels):
    """bn_with_initialize"""
    shape = (out_channels)
    mean = weight_variable_0(shape)
    var = weight_variable_1(shape)
    beta = weight_variable_0(shape)
    gamma = weight_variable_uniform(shape)
    bn = nn.BatchNorm2d(out_channels, momentum=0.99, eps=0.00001, gamma_init=gamma,
                        beta_init=beta, moving_mean_init=mean, moving_var_init=var)
    return bn


def bn_with_initialize_last(out_channels):
    """bn_with_initialize_last"""
    shape = (out_channels)
    mean = weight_variable_0(shape)
    var = weight_variable_1(shape)
    beta = weight_variable_0(shape)
    gamma = weight_variable_uniform(shape)
    bn = nn.BatchNorm2d(out_channels, momentum=0.99, eps=0.00001, gamma_init=gamma,
                        beta_init=beta, moving_mean_init=mean, moving_var_init=var)
    return bn


def fc_with_initialize(input_channels, out_channels):
    """fc_with_initialize"""
    weight_shape = (out_channels, input_channels)
    weight = weight_variable(weight_shape)
    bias_shape = (out_channels)
    bias = weight_variable_uniform(bias_shape)
    return nn.Dense(input_channels, out_channels, weight, bias)


class ResidualBlock(nn.Cell):
    """ResidualBlock"""
    expansion = 4

    def __init__(self,
                 in_channels,
                 out_channels,
                 stride=1):
        """init block"""
        super(ResidualBlock, self).__init__()

        out_chls = out_channels // self.expansion
        self.conv1 = conv1x1(in_channels, out_chls, stride=stride, padding=0)
        self.bn1 = bn_with_initialize(out_chls)

        self.conv2 = conv3x3(out_chls, out_chls, stride=1, padding=0)
        self.bn2 = bn_with_initialize(out_chls)

        self.conv3 = conv1x1(out_chls, out_channels, stride=1, padding=0)
        self.bn3 = bn_with_initialize_last(out_channels)

        self.relu = P.ReLU()
        self.add = P.TensorAdd()

    def construct(self, x):
        """construct"""
        identity = x

        out = self.conv1(x)
        out = self.bn1(out)
        out = self.relu(out)

        out = self.conv2(out)
        out = self.bn2(out)
        out = self.relu(out)

        out = self.conv3(out)
        out = self.bn3(out)

        out = self.add(out, identity)
        out = self.relu(out)

        return out


class ResidualBlockWithDown(nn.Cell):
    """ResidualBlockWithDown"""
    expansion = 4

    def __init__(self,
                 in_channels,
                 out_channels,
                 stride=1,
                 down_sample=False):
        """init block with down"""
        super(ResidualBlockWithDown, self).__init__()

        out_chls = out_channels // self.expansion
        self.conv1 = conv1x1(in_channels, out_chls, stride=stride, padding=0)
        self.bn1 = bn_with_initialize(out_chls)

        self.conv2 = conv3x3(out_chls, out_chls, stride=1, padding=0)
        self.bn2 = bn_with_initialize(out_chls)

        self.conv3 = conv1x1(out_chls, out_channels, stride=1, padding=0)
        self.bn3 = bn_with_initialize_last(out_channels)

        self.relu = P.ReLU()
        self.down_sample = down_sample

        self.conv_down_sample = conv1x1(in_channels, out_channels, stride=stride, padding=0)
        self.bn_down_sample = bn_with_initialize(out_channels)
        self.add = P.TensorAdd()

    def construct(self, x):
        """construct"""
        identity = x

        out = self.conv1(x)
        out = self.bn1(out)
        out = self.relu(out)

        out = self.conv2(out)
        out = self.bn2(out)
        out = self.relu(out)

        out = self.conv3(out)
        out = self.bn3(out)

        identity = self.conv_down_sample(identity)
        identity = self.bn_down_sample(identity)

        out = self.add(out, identity)
        out = self.relu(out)

        return out


class MakeLayer0(nn.Cell):
    """MakeLayer0"""

    def __init__(self, block, in_channels, out_channels, stride):
        """init"""
        super(MakeLayer0, self).__init__()
        self.a = ResidualBlockWithDown(in_channels, out_channels, stride=1, down_sample=True)
        self.b = block(out_channels, out_channels, stride=stride)
        self.c = block(out_channels, out_channels, stride=1)

    def construct(self, x):
        """construct"""
        x = self.a(x)
        x = self.b(x)
        x = self.c(x)

        return x


class MakeLayer1(nn.Cell):
    """MakeLayer1"""

    def __init__(self, block, in_channels, out_channels, stride):
        """init"""
        super(MakeLayer1, self).__init__()
        self.a = ResidualBlockWithDown(in_channels, out_channels, stride=stride, down_sample=True)
        self.b = block(out_channels, out_channels, stride=1)
        self.c = block(out_channels, out_channels, stride=1)
        self.d = block(out_channels, out_channels, stride=1)

    def construct(self, x):
        """construct"""
        x = self.a(x)
        x = self.b(x)
        x = self.c(x)
        x = self.d(x)

        return x


class MakeLayer2(nn.Cell):
    """MakeLayer2"""

    def __init__(self, block, in_channels, out_channels, stride):
        """init"""
        super(MakeLayer2, self).__init__()
        self.a = ResidualBlockWithDown(in_channels, out_channels, stride=stride, down_sample=True)
        self.b = block(out_channels, out_channels, stride=1)
        self.c = block(out_channels, out_channels, stride=1)
        self.d = block(out_channels, out_channels, stride=1)
        self.e = block(out_channels, out_channels, stride=1)
        self.f = block(out_channels, out_channels, stride=1)

    def construct(self, x):
        """construct"""
        x = self.a(x)
        x = self.b(x)
        x = self.c(x)
        x = self.d(x)
        x = self.e(x)
        x = self.f(x)

        return x


class MakeLayer3(nn.Cell):
    """MakeLayer3"""

    def __init__(self, block, in_channels, out_channels, stride):
        """init"""
        super(MakeLayer3, self).__init__()
        self.a = ResidualBlockWithDown(in_channels, out_channels, stride=stride, down_sample=True)
        self.b = block(out_channels, out_channels, stride=1)
        self.c = block(out_channels, out_channels, stride=1)

    def construct(self, x):
        """construct"""
        x = self.a(x)
        x = self.b(x)
        x = self.c(x)

        return x


class ResNet(nn.Cell):
    """ResNet"""

    def __init__(self, block, num_classes=100, batch_size=32):
        """init"""
        super(ResNet, self).__init__()
        self.batch_size = batch_size
        self.num_classes = num_classes

        self.conv1 = conv7x7(3, 64, stride=2, padding=0)

        self.bn1 = bn_with_initialize(64)
        self.relu = P.ReLU()
        self.maxpool = nn.MaxPool2d(kernel_size=3, stride=2, pad_mode="same")

        self.layer1 = MakeLayer0(block, in_channels=64, out_channels=256, stride=1)
        self.layer2 = MakeLayer1(block, in_channels=256, out_channels=512, stride=2)
        self.layer3 = MakeLayer2(block, in_channels=512, out_channels=1024, stride=2)
        self.layer4 = MakeLayer3(block, in_channels=1024, out_channels=2048, stride=2)

        self.pool = P.ReduceMean(keep_dims=True)
        self.squeeze = P.Squeeze(axis=(2, 3))
        self.fc = fc_with_initialize(512 * block.expansion, num_classes)

    def construct(self, x):
        """construct"""
        x = self.conv1(x)
        x = self.bn1(x)
        x = self.relu(x)
        x = self.maxpool(x)

        x = self.layer1(x)
        x = self.layer2(x)
        x = self.layer3(x)
        x = self.layer4(x)

        x = self.pool(x, (2, 3))
        x = self.squeeze(x)
        x = self.fc(x)
        return x


def resnet50(batch_size, num_classes):
    """create resnet50"""
    return ResNet(ResidualBlock, num_classes, batch_size)

monitored_operations = {'Conv2D',
                        'ReLU', 'MatMul',
                        'MaxPool', 'Reshape'}

SUMMARY_DIR = os.getenv("SUMMARY_DIR")
os.environ['CUDA_VISIBLE_DEVICES']="1"
random.seed(1)
data_home = "./logs/resnet/dataset/10-batches-bin"
batch_size = 32
num_classes = 10

context.set_context(mode=context.PYNATIVE_MODE, device_target="GPU")
mindspore.set_seed(1)

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
    # if training:
    #     c_trans = [random_crop_op, random_horizontal_op]
    c_trans += [resize_op, rescale_op, normalize_op,
                changeswap_op]

    # apply map operations on images
    cifar_ds = cifar_ds.map(operations=type_cast_op, input_columns="label")
    cifar_ds = cifar_ds.map(operations=c_trans, input_columns="image")

    # apply batch operations
    cifar_ds = cifar_ds.batch(batch_size=batch_size, drop_remainder=False)

    # apply repeat operations
    cifar_ds = cifar_ds.repeat(repeat_num)

    return cifar_ds


class DataInterceptionCallback(Callback):
    def __init__(self, node_name, data_type):
        super(DataInterceptionCallback, self).__init__()
        self.result = None
        self.labels = None
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
                                                             'requires_grad') and self_.name in monitored_operations:
                    should_save = True
                    parameter_name = arg.name
                    break
            if should_save and parameter_name[
                               0:parameter_name.rfind('.')] == self.node_name and self.data_type == "activation":
                self.result = output.asnumpy()
            return output

        setattr(Primitive, '__call__', new_call_method)
    def step_begin(self, run_context):
        params = run_context.original_args()
        self.labels = params.train_dataset_element[1]

class DataEvolutionCallback(Callback):
    def __init__(self, data_type):
        super(DataEvolutionCallback, self).__init__()
        self.result = None
        self.labels = None
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
                                                             'requires_grad') and self_.name in monitored_operations:
                    should_save = True
                    parameter_name = arg.name
                    break
            print(parameter_name[0:parameter_name.rfind('.')])
            if should_save and parameter_name[
                               0:parameter_name.rfind('.')] == self.node_name and self.data_type == "activation":
                self.result = output.asnumpy()
            return output

        setattr(Primitive, '__call__', new_call_method)
    def step_begin(self, run_context):
        params = run_context.original_args()
        self.labels = params.train_dataset_element[1]


class ResnetDataRunner:
    def __init__(self):
        context.set_context(reserve_class_name_in_scope=False)
        net = resnet50(batch_size, num_classes)
        ls = SoftmaxCrossEntropyWithLogits(sparse=True, reduction="mean")
        opt = Momentum(filter(lambda x: x.requires_grad, net.get_parameters()), 0.01, 0.9)
        model = Model(net, loss_fn=ls, optimizer=opt, metrics={'acc'})
        self.model = model
        self.model.train(1, create_dataset(list(range(32))), dataset_sink_mode=False)


    def get_tensor_from_training(self, indices, ckpt_file="./logs/resnet/weights/-1_30.ckpt",
                                 node_name="fc", data_type="activation"):
        dataset = create_dataset(indices)
        load_checkpoint(ckpt_file, net=self.model._network)
        data_inception_callback = DataInterceptionCallback(node_name=node_name, data_type=data_type)

        self.model.train(1, dataset,
                    callbacks=[LossMonitor(), data_inception_callback],
                    dataset_sink_mode=False)
        return data_inception_callback.result, data_inception_callback.labels

    def get_tensor_evolution_data(self, indices, ckpt_file, data_type="activation"):
        indices = [1]
        dataset = create_dataset(indices)
        load_checkpoint(ckpt_file, net=self.model._network)
        data_evolution_callback = DataEvolutionCallback(data_type=data_type)

        self.model.train(1, dataset,
                     callbacks=[LossMonitor(), data_evolution_callback],
                     dataset_sink_mode=False)
        return data_evolution_callback.result

if __name__ == "__main__":
    input_indices = list(range(32))
    # input_indices = [0]
    # start = time.time()
    data_runner = DataRunner()
    # end = time.time()
    # print(end-start)
    # start = time.time()
    print(data_runner.get_tensor_from_training(input_indices)[1])
    # end = time.time()
    # print(end-start)