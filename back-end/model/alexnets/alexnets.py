from mindspore.train.callback import SummaryCollector
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

context.set_context(mode=context.GRAPH_MODE, device_target="GPU")

network = AlexNet(num_classes=10)
ds_train = create_dataset_mnist("./dataset/10-batches-bin", cfg.batch_size, cfg.epoch_size)

loss = nn.SoftmaxCrossEntropyWithLogits(is_grad=False, sparse=True, reduction="mean")

lr = Tensor(get_lr(0, cfg.learning_rate, cfg.epoch_size, ds_train.get_dataset_size()))

opt = nn.Momentum(network.trainable_params(), lr, cfg.momentum)
model = Model(network, loss, opt, metrics={"Accuracy": Accuracy()})

time_cb = TimeMonitor(data_size=ds_train.get_dataset_size())
config_ck = CheckpointConfig(save_checkpoint_steps=cfg.save_checkpoint_steps,
                             keep_checkpoint_max=cfg.keep_checkpoint_max)
ckpoint_cb = ModelCheckpoint(prefix="checkpoint_alexnet", directory="./ckpt", config=config_ck)
summary_collector = SummaryCollector(summary_dir='./summary_dir', collect_freq=1)

model.train(cfg.epoch_size, ds_train, callbacks=[time_cb, ckpoint_cb, LossMonitor(), summary_collector],
            dataset_sink_mode=False)
