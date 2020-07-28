from mindspore.ops import operations as P
import mindspore.nn as nn
import sqlite3
from enum import Enum, unique

@unique
class NODE_SCALAR_TYPE(Enum):
    Activation = 0
    Gradient = 1
    Weight = 2

@unique
class MODEL_SCALAR_TYPE(Enum):
    TrainLoss = 0
    LearningRate = 1

conn = sqlite3.connect('alex-normal-100.db')
c = conn.cursor()
c.execute('''CREATE TABLE METADATA
       (KEY     CHAR(50)    PRIMARY KEY     NOT NULL,
       VALUE    TEXT                        NOT NULL);''')

c.execute('''CREATE TABLE MODEL_SCALARS
       (step INT PRIMARY KEY   NOT NULL,
       train_loss       REAL,
       test_loss        REAL,
       train_accuracy   REAL,
       test_accuracy    REAL,
       learning_rate    REAL);''')

c.execute('''CREATE TABLE ACTIVATION_SCALARS
       (step        I   NT     NOT NULL,
       node             CHAR(50)  NOT NULL,
       activation_min   REAL,
       activation_mean  REAL,
       activation_max   REAL);''')

c.execute('''CREATE TABLE GRADIENT_SCALARS
       (step        I   NT     NOT NULL,
       node             CHAR(50)  NOT NULL,
       gradient_min     REAL,
       gradient_mean    REAL,
       gradient_max     REAL);''')

c.execute('''CREATE TABLE WEIGHT_SCALARS
       (step        I   NT     NOT NULL,
       node             CHAR(50)  NOT NULL,
       weight_min       REAL,
       weight_mean      REAL,
       weight_max       REAL);''')

c.execute("INSERT INTO METADATA (KEY,VALUE) \
      VALUES ('max_step', '1')")
c.execute("INSERT INTO METADATA (KEY,VALUE) \
      VALUES ('is_training', 'true')")

conn.commit()

step = 1

def save_model_scalar(type, num):
    if type == MODEL_SCALAR_TYPE.TrainLoss:
        c.execute('''INSERT OR REPLACE INTO MODEL_SCALARS(step, train_loss)
                    VALUES(%d, %s);''' % (step, str(num)))
        conn.commit()
    elif type == MODEL_SCALAR_TYPE.LearningRate:
        c.execute('''UPDATE MODEL_SCALARS set learning_rate = %s where step=%d;''' % (str(num), step))
        conn.commit()

def save_node_scalar(name, tensor, type):
    num = tensor.asnumpy()
    if type == NODE_SCALAR_TYPE.Activation:
        c.execute('''INSERT OR REPLACE INTO ACTIVATION_SCALARS(step, node, activation_min, activation_mean, activation_max)
                                    VALUES(%d, '%s', %f, %f, %f);''' % (step, name, num.min(), num.mean(), num.max()))
        conn.commit()
    if type == NODE_SCALAR_TYPE.Gradient:
        c.execute('''INSERT OR REPLACE INTO GRADIENT_SCALARS(step, node, gradient_min, gradient_mean, gradient_max)
                                    VALUES(%d, '%s', %f, %f, %f);''' % (step, name, num.min(), num.mean(), num.max()))
        conn.commit()
    if type == NODE_SCALAR_TYPE.Weight:
        c.execute('''INSERT OR REPLACE INTO WEIGHT_SCALARS(step, node, weight_min, weight_mean, weight_max)
                                    VALUES(%d, '%s', %f, %f, %f);''' % (step, name, num.min(), num.mean(), num.max()))
        conn.commit()



def set_iteration(_step):
    global step
    step = _step
    c.execute("UPDATE METADATA set VALUE = '%d' where KEY='max_step'" % step)
    conn.commit()


def stop_traning():
    c.execute("UPDATE METADATA set VALUE = 'false' where KEY='is_training'")
    conn.commit()
