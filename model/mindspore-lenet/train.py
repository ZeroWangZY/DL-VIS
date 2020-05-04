import os
import argparse
from config import mnist_cfg as cfg
from dataset import create_dataset
from mindspore.train.callback import ModelCheckpoint, CheckpointConfig, LossMonitor
from mindspore.nn.metrics import Accuracy
from mindinsight.lineagemgr import TrainLineage, EvalLineage
from mindspore import Model, nn, context
from mindspore.train.callback import SummaryStep
from mindspore.train.summary.summary_record import SummaryRecord
from mindspore.common.initializer import TruncatedNormal
from mindspore.ops import operations as P
from data_saver_callback import DataSaverCallback
def conv(in_channels, out_channels, kernel_size, stride=1, padding=0):
    """weight initial for conv layer"""
    weight = weight_variable()
    return nn.Conv2d(in_channels, out_channels,
                     kernel_size=kernel_size, stride=stride, padding=padding,
                     weight_init=weight, has_bias=False, pad_mode="valid")


def fc_with_initialize(input_channels, out_channels):
    """weight initial for fc layer"""
    weight = weight_variable()
    bias = weight_variable()
    return nn.Dense(input_channels, out_channels, weight, bias)


def weight_variable():
    """weight initial"""
    return TruncatedNormal(0.02)


class LeNet5(nn.Cell):
    def __init__(self, num_class=10):
        super(LeNet5, self).__init__()
        self.num_class = num_class
        self.batch_size = 32
        self.conv1 = conv(1, 6, 5)
        self.relu1 = nn.ReLU()

        self.conv2 = conv(6, 16, 5)
        self.relu2 = nn.ReLU()

        # self.print = P.Print()
        self.fc1 = nn.Dense(16 * 5 * 5, 120, weight_variable(), weight_variable())
        self.relu3 = nn.ReLU()
        self.fc2 = nn.Dense(120, 84, weight_variable(), weight_variable())
        self.relu4 = nn.ReLU()
        self.fc3 = nn.Dense(84, self.num_class, weight_variable(), weight_variable())
        self.max_pool2d1 = nn.MaxPool2d(kernel_size=2, stride=2)
        self.max_pool2d2 = nn.MaxPool2d(kernel_size=2, stride=2)

        self.flatten = nn.Flatten()
        # self.mean = P.ReduceMean()
        # self.sm_scalar = P.ScalarSummary()
        # self.sm_image = P.ImageSummary()
        # self.sm_tensor = P.TensorSummary()
    def construct(self, x):
        x = self.conv1(x)
        x = self.relu1(x)
        x = self.max_pool2d1(x)
        x = self.conv2(x)
        x = self.relu2(x)
        x = self.max_pool2d2(x)
        x = self.flatten(x)
        x = self.fc1(x)
        x = self.relu3(x)
        x = self.fc2(x)
        x = self.relu4(x)
        x = self.fc3(x)
        return x
    
parser = argparse.ArgumentParser(description='MindSpore MNIST Example')
parser.add_argument('--device_target', type=str, default="CPU", choices=['Ascend', 'GPU', 'CPU'],
                    help='device where the code will be implemented (default: Ascend)')
parser.add_argument('--data_path', type=str, default="./MNIST_Data",
                    help='path where the dataset is saved')
parser.add_argument('--dataset_sink_mode', type=bool, default=False, help='dataset_sink_mode is False or True')

args = parser.parse_args()

context.set_context(
    mode=context.PYNATIVE_MODE,
    device_target="GPU",
    enable_mem_reuse=False)
    # save_graphs=True, save_graphs_path="./graph/")
    # save_ms_model=True)
network = LeNet5(cfg.num_classes)
net_loss = nn.SoftmaxCrossEntropyWithLogits(is_grad=False, sparse=True, reduction="mean")
net_opt = nn.Momentum(network.trainable_params(), cfg.lr, cfg.momentum)
# config_ck = CheckpointConfig(save_checkpoint_steps=1,
#                              keep_checkpoint_max=cfg.keep_checkpoint_max)
# ckpoint_cb = ModelCheckpoint(prefix="checkpoint_lenet", directory="./ckpt", config=config_ck)
model = Model(network, net_loss, net_opt, metrics={"Accuracy": Accuracy()})
#
#
# summary_writer = SummaryRecord(log_dir='./summary13', network=network)
# summary_callback = SummaryStep(summary_writer, flush_step=1)
#
# train_callback = TrainLineage(summary_writer)
saver_callback = DataSaverCallback()
ds_train = create_dataset(os.path.join(args.data_path, "train"),
                          cfg.batch_size,
                          cfg.epoch_size)
print("============== Starting Training ==============")
model.train(cfg['epoch_size'], ds_train,
            # callbacks=[LossMonitor()],
            callbacks=[saver_callback],
            dataset_sink_mode=args.dataset_sink_mode)
# summary_writer.close()
