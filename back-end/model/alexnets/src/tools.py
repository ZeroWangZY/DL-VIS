from mindspore.ops import operations as P
import mindspore.nn as nn
epoch=1
step=1

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

def save_model_scalar(name, num):
    print(epoch, step, name, num)

def save_node_scalar(name, tensor):
    num = tensor.asnumpy()
    print(epoch, step, name, num.min(), num.mean(), num.max())

def set_iteration(_epoch, _step):
    global epoch
    global step
    epoch = _epoch
    step = _step