# Copyright 2020 Huawei Technologies Co., Ltd
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ============================================================================
"""Alexnet."""
import mindspore.nn as nn
from mindspore.common.initializer import TruncatedNormal
from mindspore.ops import operations as P

def conv(in_channels, out_channels, kernel_size, stride=1, padding=0, pad_mode="valid"):
    weight = weight_variable()
    return nn.Conv2d(in_channels, out_channels,
                     kernel_size=kernel_size, stride=stride, padding=padding,
                     weight_init=weight, has_bias=False, pad_mode=pad_mode)

def fc_with_initialize(input_channels, out_channels):
    weight = weight_variable()
    bias = weight_variable()
    return nn.Dense(input_channels, out_channels, weight, bias)

def weight_variable():
    return TruncatedNormal(0.02)  # 0.02

class StatisticCollector(nn.Cell):
    def __init__(self):
        super(StatisticCollector, self).__init__()

        self.sm_scalar = P.ScalarSummary()
        self.max = P.ReduceMax()
        # self.min = P.ReduceMin()
        self.mean = P.ReduceMean()

    def construct(self, name, tensor):

        # self.sm_scalar("conv1-min", self.min(x))
        self.sm_scalar(name + "-max", self.max(tensor))
        self.sm_scalar(name + "-mean", self.mean(tensor))
        return tensor

class AlexNet(nn.Cell):
    """
    Alexnet
    """
    def __init__(self, num_classes=10, channel=3):
        super(AlexNet, self).__init__()
        self.conv1 = conv(channel, 96, 11, stride=4)
        self.conv2 = conv(96, 256, 5, pad_mode="same")
        self.conv3 = conv(256, 384, 3, pad_mode="same")
        self.conv4 = conv(384, 384, 3, pad_mode="same")
        self.conv5 = conv(384, 256, 3, pad_mode="same")
        self.relu = nn.ReLU()
        self.max_pool2d = P.MaxPool(ksize=3, strides=2)
        self.flatten = nn.Flatten()
        self.fc1 = fc_with_initialize(6*6*256, 4096)
        self.fc2 = fc_with_initialize(4096, 4096)
        self.fc3 = fc_with_initialize(4096, num_classes)
        self.scalar_saver = StatisticCollector()

    def construct(self, x):
        x = self.conv1(x)
        self.scalar_saver("conv1", x)
        x = self.relu(x)
        x = self.max_pool2d(x)
        x = self.conv2(x)
        self.scalar_saver("conv2", x)
        x = self.relu(x)
        x = self.max_pool2d(x)
        x = self.conv3(x)
        self.scalar_saver("conv3", x)
        x = self.relu(x)
        x = self.conv4(x)
        self.scalar_saver("conv4", x)
        x = self.relu(x)
        x = self.conv5(x)
        self.scalar_saver("conv5", x)
        x = self.relu(x)
        x = self.max_pool2d(x)
        x = self.flatten(x)
        x = self.fc1(x)
        self.scalar_saver("fc1", x)
        x = self.relu(x)
        x = self.fc2(x)
        self.scalar_saver("fc2", x)
        x = self.relu(x)
        x = self.fc3(x)
        self.scalar_saver("fc3", x)
        return x
