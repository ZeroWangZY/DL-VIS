from mindspore.ops import operations as P
import mindspore.nn as nn
import sqlite3
from enum import Enum, unique
from src.sqlite_helper import SqliteHelper
import numpy as np

@unique
class NODE_SCALAR_TYPE(Enum):
    Activation = 0
    Gradient = 1
    Weight = 2

@unique
class MODEL_SCALAR_TYPE(Enum):
    TrainLoss = 0
    LearningRate = 1


SQLITE_FILE_NAME = 'alexnet-with-activation-tensors.db'

sqlite_helper = SqliteHelper(SQLITE_FILE_NAME)

conn = sqlite3.connect(SQLITE_FILE_NAME)
c = conn.cursor()

step = 1

def save_model_scalar(type, num):
    if type == MODEL_SCALAR_TYPE.TrainLoss:
        sqlite_helper.save_loss(step, num)
    elif type == MODEL_SCALAR_TYPE.LearningRate:
        sqlite_helper.save_lr(step, num)

def save_node_scalar(name, tensor, type):
    num = tensor.asnumpy()
    if type == NODE_SCALAR_TYPE.Activation:
        sqlite_helper.save_activation_scalars(step, name, num.min(), num.mean(), num.max())
    if type == NODE_SCALAR_TYPE.Gradient:
        sqlite_helper.save_gradient_scalars(step, name, num.min(), num.mean(), num.max())
    if type == NODE_SCALAR_TYPE.Weight:
        sqlite_helper.save_weight_scalars(step, name, num.min(), num.mean(), num.max())

def save_node_tensor(name, tensor, type):
    num = tensor.asnumpy()
    if type == NODE_SCALAR_TYPE.Activation:
        np.save('output_tensors/' + str(step) + '-' + name + '-activation.npy', num)


def set_iteration(_step):
    global step
    step = _step
    c.execute("UPDATE METADATA set VALUE = '%d' where KEY='max_step'" % step)
    conn.commit()


def stop_traning():
    c.execute("UPDATE METADATA set VALUE = 'false' where KEY='is_training'")
    conn.commit()
