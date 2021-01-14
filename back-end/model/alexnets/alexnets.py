from mindspore.train.callback import SummaryCollector, Callback
import argparse
from src.config import alexnet_cfg as cfg
from src.dataset import create_dataset_mnist
from src.generator_lr import get_lr
from src.alexnet import AlexNet
import mindspore.nn as nn
from mindspore import context
from mindspore import Tensor
from mindspore.train import Model
from mindspore.nn.metrics import Accuracy
from mindspore.train.callback import ModelCheckpoint, CheckpointConfig, LossMonitor, TimeMonitor
from mindspore.ops import operations as P
# from src.tools import set_iteration, save_model_scalar, save_node_scalar, MODEL_SCALAR_TYPE, NODE_SCALAR_TYPE


# class MyOptimizer(nn.Momentum):
#     def __init__(self, *args, **kwargs):
#         super().__init__(*args, **kwargs)
#         self._original_construct = super().construct
#         self.scalar_summary = P.ScalarSummary()
#         self.histogram_summary = P.HistogramSummary()
#         self.weight_names = [param.name for param in self.parameters]
#         self.gradient_names = [param.name + ".gradient" for param in self.parameters]
#
#     def construct(self, grads):
#         for i in range(len(self.weight_names)):
#             save_node_scalar(self.weight_names[i], self.parameters[i].data, NODE_SCALAR_TYPE.Weight)
#             save_node_scalar(self.gradient_names[i], grads[i], NODE_SCALAR_TYPE.Gradient)
#         save_model_scalar(MODEL_SCALAR_TYPE.LearningRate, self.get_lr()[0])
#         return self._original_construct(grads)

# class MyLoss(nn.SoftmaxCrossEntropyWithLogits):
#     def __init__(self, *args, **kwargs):
#         super().__init__(*args, **kwargs)
#         self._original_construct = super().construct
#
#     def construct(self, *args, **kwargs):
#         loss = self._original_construct(*args, **kwargs)
#         save_model_scalar(MODEL_SCALAR_TYPE.TrainLoss, loss)
#         return loss


class MyCallback(Callback):
    def __init__(self):
        super(MyCallback, self).__init__()

    def step_end(self, run_context):
        cb_params = run_context.original_args()
        # set_iteration(cb_params.cur_step_num)


context.set_context(mode=context.GRAPH_MODE, device_target="GPU")

network = AlexNet(num_classes=10)
ds_train = create_dataset_mnist("./dataset/10-batches-bin", cfg.batch_size, cfg.epoch_size)
loss = nn.SoftmaxCrossEntropyWithLogits(sparse=True, reduction="mean")
lr = Tensor(get_lr(0, cfg.learning_rate, cfg.epoch_size, ds_train.get_dataset_size()))
opt = nn.Momentum(network.trainable_params(), lr, cfg.momentum)

model = Model(network, loss, opt, metrics={"Accuracy": Accuracy()})

summary_collector = SummaryCollector(summary_dir='./summary_dir', collect_freq=1)

# Note: dataset_sink_mode should be set to False, else you should modify collect freq in SummaryCollector
model.train(epoch=1, train_dataset=ds_train, callbacks=[summary_collector], dataset_sink_mode=False)


