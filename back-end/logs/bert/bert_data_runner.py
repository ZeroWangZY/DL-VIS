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

'''
Bert finetune and evaluation script.
'''

import os
import argparse
from logs.bert.src.bert_for_finetune import BertFinetuneCell, BertCLS
from logs.bert.src.finetune_eval_config import optimizer_cfg, bert_net_cfg
from logs.bert.src.get_dataset import create_classification_dataset
from logs.bert.src.assessment_method import Accuracy, F1, MCC, Spearman_Correlation
from logs.bert.src.utils import make_directory, LossCallBack, LoadNewestCkpt, BertLearningRate
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
countList = []
os.environ['CUDA_VISIBLE_DEVICES']="1"

class DataInterceptionCallback(Callback):
    def __init__(self, node_name, data_type, type):
        super(DataInterceptionCallback, self).__init__()
        self.result = None
        self.labels = None
        self.origin_call_method = None
        self.node_name = node_name
        self.data_type = data_type
        self.type = type

    def begin(self, run_context):
        global count
        global countList
        params = run_context.original_args()

        count = 0
        # overwrite optimizer
        opt = params.network._cells['optimizer']
        old_construct = opt.construct
        weight_names = [param.name for param in opt.parameters]

        def new_construct(grads):
            id = 0
            for i in range(len(weight_names)):
                if weight_names[i][-7:] == ".weight":
                    if str(countList[id]) == self.node_name:
                        if self.data_type == "gradient":
                            self.result = grads[i].asnumpy()
                        if self.data_type == "weight":
                            self.result = opt.parameters[i].asnumpy()
                    id = id + 1
            return old_construct(grads)

        opt.construct = new_construct



    def step_begin(self, run_context):
        params = run_context.original_args()
        self.labels = params.train_dataset_element[3].asnumpy().flatten()

        # overwrite Primitive.__call__
        self.origin_call_method = getattr(Primitive, '__call__')

        def new_call_method(self_, *args):
            global count
            global countList
            output = self.origin_call_method(self_, *args)
            frontend_base_list = [58, 65, 68, 75, 79, 83]
            backend_base_list = [55, 62, 67, 78, 81, 84]
            frontend_interval = 38
            backend_interval = 53  # 后端
            count = count + 1
            print("算子：", self_.name)
            print("算子ID：", count)
            dict = {
                25: 32,
                28: 36,
                31: 40,
                662: 496,
                670: 501
            }
            if self_.name == "BiasAdd":
                print("前端ID：", count)
                if count in dict.keys():
                    # print(self_.name, ":", dict[count])
                    id = dict[count]
                else:
                    encoderId = (int)((count - 55) / backend_interval)
                    baseId = backend_base_list.index((count - 55) % backend_interval + 55)
                    id = (int)(frontend_base_list[baseId] + frontend_interval * encoderId)
                countList.append(id)
                if self.node_name == str(id):
                    self.result = output.asnumpy()
                    if type == "gno":
                        self.result = self.result.reshape(64, -1)
                    if type == "gd":
                        self.result = self.result.reshape(16, -1)
                    print(self.result.shape)
            return output

        setattr(Primitive, '__call__', new_call_method)

    def step_end(self, run_context):
        setattr(Primitive, '__call__', self.origin_call_method)

class BertDataRunner:
    def __init__(self):
        global count
        count = 0
        context.set_context(mode=context.PYNATIVE_MODE, device_target="GPU")
        network = BertCLS(bert_net_cfg, True, num_labels=15, dropout_prob=0.1,
                              assessment_method="Accuracy")

        ds = create_classification_dataset(indices=list(range(16)), batch_size=optimizer_cfg.batch_size, repeat_count=1,
                                           assessment_method="Accuracy",
                                           data_file_path="./logs/bert/tnews/train.tf_record",
                                           schema_file_path="./logs/bert/tnews/schema.json",
                                           do_shuffle=False)
        steps_per_epoch = ds.get_dataset_size()
        # optimizer
        if optimizer_cfg.optimizer == 'AdamWeightDecay':
            lr_schedule = BertLearningRate(learning_rate=optimizer_cfg.AdamWeightDecay.learning_rate,
                                           end_learning_rate=optimizer_cfg.AdamWeightDecay.end_learning_rate,
                                           warmup_steps=int(steps_per_epoch * 1 * 0.1),
                                           decay_steps=steps_per_epoch * 1,
                                           power=optimizer_cfg.AdamWeightDecay.power)
            params = network.trainable_params()
            decay_params = list(filter(optimizer_cfg.AdamWeightDecay.decay_filter, params))
            other_params = list(filter(lambda x: not optimizer_cfg.AdamWeightDecay.decay_filter(x), params))
            group_params = [{'params': decay_params, 'weight_decay': optimizer_cfg.AdamWeightDecay.weight_decay},
                            {'params': other_params, 'weight_decay': 0.0}]

            optimizer = AdamWeightDecay(group_params, lr_schedule, eps=optimizer_cfg.AdamWeightDecay.eps)
        elif optimizer_cfg.optimizer == 'Lamb':
            lr_schedule = BertLearningRate(learning_rate=optimizer_cfg.Lamb.learning_rate,
                                           end_learning_rate=optimizer_cfg.Lamb.end_learning_rate,
                                           warmup_steps=int(steps_per_epoch * 1 * 0.1),
                                           decay_steps=steps_per_epoch * 1,
                                           power=optimizer_cfg.Lamb.power)
            optimizer = Lamb(network.trainable_params(), learning_rate=lr_schedule)
        elif optimizer_cfg.optimizer == 'Momentum':
            optimizer = Momentum(network.trainable_params(), learning_rate=optimizer_cfg.Momentum.learning_rate,
                                 momentum=optimizer_cfg.Momentum.momentum)
        else:
            raise Exception("Optimizer not supported. support: [AdamWeightDecay, Lamb, Momentum]")

        update_cell = DynamicLossScaleUpdateCell(loss_scale_value=2 ** 32, scale_factor=2, scale_window=1000)
        netwithgrads = BertFinetuneCell(network, optimizer=optimizer, scale_update_cell=update_cell)
        self.model = Model(netwithgrads)
        self.model.train(1, ds, dataset_sink_mode=False)
        count = 0

    def get_tensor_from_training(self, indices, ckpt_file="./saved_ckpt/-1_190.ckpt",
                                 node_name="68", data_type="activation", type="gd"):
        # type gno get neuron order batch 64
        # type gd get data batch 16

        global count
        count = 0
        print("进来的是后count是：", count)
        if type == "gno":
            batch_size = 64
        else:
            batch_size = 16
        ds = create_classification_dataset(indices=indices, batch_size=batch_size,
                                           repeat_count=1,
                                           assessment_method="Accuracy",
                                           data_file_path="./logs/bert/tnews/train.tf_record",
                                           schema_file_path="./logs/bert/tnews/schema.json",
                                           do_shuffle=False)
        load_checkpoint(ckpt_file, net=self.model._network)
        data_inception_callback = DataInterceptionCallback(node_name=node_name, data_type=data_type, type=type)
        callbacks = [TimeMonitor(ds.get_dataset_size()), LossCallBack(ds.get_dataset_size()),
                     data_inception_callback]
        self.model.train(1, ds, callbacks=callbacks, dataset_sink_mode=False)
        count = 0
        return data_inception_callback.result, data_inception_callback.labels

# if __name__ == "__main__":
    # input_indices = list(range(16))
    # print(get_tensor_from_training(input_indices))
