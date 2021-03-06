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
"""
Data operations, will be used in run_pretrain.py
"""
import os
import json
import random
import mindspore.common.dtype as mstype
import mindspore.dataset.engine.datasets as de
from mindspore.dataset import GeneratorDataset, Sampler
from mindspore.dataset.engine.datasets import SourceDataset, Shuffle, Schema, _select_sampler, get_num_rows
from mindspore.dataset.engine.validators import check_tfrecorddataset
import mindspore.dataset.transforms.c_transforms as C
from mindspore import log as logger
from .config import cfg

class FixedIndeciesSampler(Sampler):
    def __init__(self, indices):
        super(FixedIndeciesSampler, self).__init__()
        self.indices = indices

    def __iter__(self):
        for i in self.indices:
            yield i

class SaveIndeciesSampler(Sampler):
    def __init__(self, summary_dir):
        super(SaveIndeciesSampler, self).__init__()
        self.summary_dir = summary_dir
        os.makedirs(os.path.join(self.summary_dir, "indices"))
        self.epoch_num = 0

    def __iter__(self):
        self.epoch_num += 1
        indices = random.sample(range(self.dataset_size), self.dataset_size)
        self.save_data_index(indices)
        for i in indices:
            yield i

    def save_data_index(self, indices):
        file = open(os.path.join(self.summary_dir, "indices", str(self.epoch_num) + ".json"), 'w')
        file.write(json.dumps(indices))
        file.close()

class MyDatasetGenerator:
    def __init__(self, data, indices):
        self.indices = indices
        self.__index = 0
        self.__data = data

    def __getitem__(self, index):
        return tuple(self.__data[self.indices[index]])

    def __next__(self):
        if self.__index >= len(self.indices):
            raise StopIteration
        else:
            item = tuple(self.__data[self.indices[self.__index]])
            self.__index += 1
            return item

    def __iter__(self):
        return self

    def __len__(self):
        return len(self.indices)


def create_bert_dataset(device_num=1, rank=0, do_shuffle="true", data_dir=None, schema_dir=None):
    """create train dataset"""
    # apply repeat operations
    files = os.listdir(data_dir)
    data_files = []
    for file_name in files:
        if "tfrecord" in file_name:
            data_files.append(os.path.join(data_dir, file_name))
    ds = de.TFRecordDataset(data_files, schema_dir if schema_dir != "" else None,
                            columns_list=["input_ids", "input_mask", "segment_ids", "next_sentence_labels",
                                          "masked_lm_positions", "masked_lm_ids", "masked_lm_weights"],
                            shuffle=de.Shuffle.FILES if do_shuffle == "true" else False,
                            num_shards=device_num, shard_id=rank, shard_equal_rows=True)
    ori_dataset_size = ds.get_dataset_size()
    print('origin dataset size: ', ori_dataset_size)
    type_cast_op = C.TypeCast(mstype.int32)
    ds = ds.map(operations=type_cast_op, input_columns="masked_lm_ids")
    ds = ds.map(operations=type_cast_op, input_columns="masked_lm_positions")
    ds = ds.map(operations=type_cast_op, input_columns="next_sentence_labels")
    ds = ds.map(operations=type_cast_op, input_columns="segment_ids")
    ds = ds.map(operations=type_cast_op, input_columns="input_mask")
    ds = ds.map(operations=type_cast_op, input_columns="input_ids")
    # apply batch operations
    ds = ds.batch(cfg.batch_size, drop_remainder=True)
    logger.info("data size: {}".format(ds.get_dataset_size()))
    logger.info("repeat count: {}".format(ds.get_repeat_count()))
    return ds


def create_ner_dataset(batch_size=1, repeat_count=1, assessment_method="accuracy",
                       data_file_path=None, schema_file_path=None, do_shuffle=True):
    """create finetune or evaluation dataset"""
    type_cast_op = C.TypeCast(mstype.int32)
    ds = de.TFRecordDataset([data_file_path], schema_file_path if schema_file_path != "" else None,
                            columns_list=["input_ids", "input_mask", "segment_ids", "label_ids"], shuffle=do_shuffle)
    if assessment_method == "Spearman_correlation":
        type_cast_op_float = C.TypeCast(mstype.float32)
        ds = ds.map(operations=type_cast_op_float, input_columns="label_ids")
    else:
        ds = ds.map(operations=type_cast_op, input_columns="label_ids")
    ds = ds.map(operations=type_cast_op, input_columns="segment_ids")
    ds = ds.map(operations=type_cast_op, input_columns="input_mask")
    ds = ds.map(operations=type_cast_op, input_columns="input_ids")
    ds = ds.repeat(repeat_count)
    # apply batch operations
    ds = ds.batch(batch_size, drop_remainder=True)
    return ds


def create_classification_dataset(indices, batch_size=1, repeat_count=1, assessment_method="accuracy",
                                  data_file_path=None, schema_file_path=None, do_shuffle=True):
    """create finetune or evaluation dataset"""
    type_cast_op = C.TypeCast(mstype.int32)
    ds = de.TFRecordDataset([data_file_path], schema_file_path if schema_file_path != "" else None,
                            columns_list=["input_ids", "input_mask", "segment_ids", "label_ids"], shuffle=do_shuffle)
    # 重建Dataset
    data = []
    for d in ds.create_tuple_iterator():
        data.append([d[0].asnumpy(), d[1].asnumpy(), d[2].asnumpy(), d[3].asnumpy()])
    dataset_generator = MyDatasetGenerator(data, indices)
    ds = GeneratorDataset(dataset_generator, ["input_ids", "input_mask", "segment_ids", "label_ids"], shuffle=False)

    if assessment_method == "Spearman_correlation":
        type_cast_op_float = C.TypeCast(mstype.float32)
        ds = ds.map(operations=type_cast_op_float, input_columns="label_ids")
    else:
        ds = ds.map(operations=type_cast_op, input_columns="label_ids")
    ds = ds.map(operations=type_cast_op, input_columns="segment_ids")
    ds = ds.map(operations=type_cast_op, input_columns="input_mask")
    ds = ds.map(operations=type_cast_op, input_columns="input_ids")


    ds = ds.repeat(repeat_count)
    # apply batch operations
    ds = ds.batch(batch_size, drop_remainder=True)
    return ds


def create_squad_dataset(batch_size=1, repeat_count=1, data_file_path=None, schema_file_path=None,
                         is_training=True, do_shuffle=True):
    """create finetune or evaluation dataset"""
    type_cast_op = C.TypeCast(mstype.int32)
    if is_training:
        ds = de.TFRecordDataset([data_file_path], schema_file_path if schema_file_path != "" else None,
                                columns_list=["input_ids", "input_mask", "segment_ids", "start_positions",
                                              "end_positions", "unique_ids", "is_impossible"],
                                shuffle=do_shuffle)
        ds = ds.map(operations=type_cast_op, input_columns="start_positions")
        ds = ds.map(operations=type_cast_op, input_columns="end_positions")
    else:
        ds = de.TFRecordDataset([data_file_path], schema_file_path if schema_file_path != "" else None,
                                columns_list=["input_ids", "input_mask", "segment_ids", "unique_ids"])
    ds = ds.map(operations=type_cast_op, input_columns="segment_ids")
    ds = ds.map(operations=type_cast_op, input_columns="input_mask")
    ds = ds.map(operations=type_cast_op, input_columns="input_ids")
    ds = ds.repeat(repeat_count)
    # apply batch operations
    ds = ds.batch(batch_size, drop_remainder=True)
    return ds
