import sqlite3
import os
from mindspore.train.callback import Callback, RunContext, ModelCheckpoint, SummaryCollector
from mindspore.ops.primitive import Primitive
import numpy as np
import time
from multiprocessing import Process, Queue, Pool

monitored_operations = {'Conv2D',
                        'ReLU', 'MatMul',
                        'MaxPool', 'Reshape'}


def cul_activation_percentile(step, activations, parameter_name):
    percentiles = np.array([0, 25, 50, 75, 100])
    res = []
    data = activations.asnumpy()
    res.append(
        [step, parameter_name[0:parameter_name.rfind('.')], -1] + np.percentile(data, percentiles).tolist()
    )
    for i in range(data.shape[0]):
        res.append(
            [step, parameter_name[0:parameter_name.rfind('.')], i] + np.percentile(data[i], percentiles).tolist()
        )
    return res


def cul_weight_percentile(step, weights, weight_names):
    res = []
    percentiles = np.array([0, 25, 50, 75, 100])
    for i in [i for i in range(len(weight_names)) if weight_names[i][-7:] == ".weight"]:
        # 存weight
        weight = weights[i].asnumpy()
        res.append(
            [step, weight_names[i]] + np.percentile(weight, percentiles).tolist()
        )
    return res


def cul_gradient_percentile(step, grads, weight_names):
    res = []
    percentiles = np.array([0, 25, 50, 75, 100])
    for i in [i for i in range(len(weight_names)) if weight_names[i][-7:] == ".weight"]:
        # gradient
        grad = grads[i].asnumpy()
        res.append(
            [step, weight_names[i]] + np.percentile(grad, percentiles).tolist()
        )
    return res


class DataSaverCallback(Callback):
    def __init__(self, summary_dir='summary_dir'):
        super(DataSaverCallback, self).__init__()
        self.db_writer = DataWriter(summary_dir)
        self.p = Pool()
        self.activation_res = []
        self.weight_res = []
        self.gradient_res = []

    def begin(self, run_context):
        params = run_context.original_args()

        # overwrite optimizer
        opt = params.optimizer
        old_construct = opt.construct
        weight_names = [param.name for param in opt.parameters]

        def new_construct(grads):
            self.db_writer.cache['lr'] = opt.get_lr().asnumpy().tolist()
            self.weight_res.append(self.p.apply_async(cul_weight_percentile, args=(
                self.db_writer.cache['step'], opt.parameters, weight_names)))
            self.gradient_res.append(self.p.apply_async(cul_gradient_percentile, args=(
                self.db_writer.cache['step'], grads, weight_names)))
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
            if should_save:
                self.activation_res.append(self.p.apply_async(cul_activation_percentile, args=(
                self.db_writer.cache['step'], output, parameter_name)))
            return output

        setattr(Primitive, '__call__', new_call_method)

    def step_begin(self, run_context):
        params = run_context.original_args()
        self.db_writer.cache['step'] = params.cur_step_num
        self.db_writer.cache['epoch'] = params.cur_epoch_num

    def step_end(self, run_context):
        if self.db_writer.cache['step'] % 5 == 0:
            time_start = time.time()
            for res in self.activation_res:
                self.db_writer.cache['activations'] += res.get()
            for res in self.weight_res:
                self.db_writer.cache['weights'] += res.get()
            for res in self.gradient_res:
                self.db_writer.cache['gradients'] += res.get()
            self.activation_res = []
            self.weight_res = []
            self.gradient_res = []
            time_end = time.time()
            print('res.get() time cost', time_end - time_start, 's')


        self.db_writer.cache['train_loss'] = run_context.original_args()['net_outputs']
        self.db_writer.save()


class DataWriter():
    def __init__(self, summary_dir):
        self.summary_dir = summary_dir
        self.init_db()
        self.reset_cache()

    def init_db(self):
        self.db_file_name = os.path.join(self.summary_dir, 'data.db')
        if not os.path.exists(self.summary_dir):
            os.makedirs(self.summary_dir)
        conn = sqlite3.connect(self.db_file_name)
        c = conn.cursor()
        c.execute('''PRAGMA synchronous = OFF''')
        c.execute('''PRAGMA journal_mode = OFF''')
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
                       (step            INT     NOT NULL,
                       node             CHAR(50)  NOT NULL,
                       data_index       REAL,
                       activation_min   REAL,
                       activation_q1    REAL,
                       activation_median REAL, 
                       activation_mean  REAL,
                       activation_q3    REAL,
                       activation_max   REAL,
                       PRIMARY KEY (step, node, data_index));''')

        c.execute('''CREATE TABLE GRADIENT_SCALARS
                       (step            INT     NOT NULL,
                       node             CHAR(50)  NOT NULL,
                       gradient_min     REAL,
                       gradient_q1      REAL,
                       gradient_median  REAL,
                       gradient_mean    REAL,
                       gradient_q3      REAL,
                       gradient_max     REAL,
                       PRIMARY KEY (step, node));''')

        c.execute('''CREATE TABLE WEIGHT_SCALARS
                       (step            INT     NOT NULL,
                       node             CHAR(50)  NOT NULL,
                       weight_min       REAL,
                       weight_q1        REAL,
                       weight_median    REAL,
                       weight_mean      REAL,
                       weight_q3        REAL,
                       weight_max       REAL,
                       PRIMARY KEY (step, node));''')

        c.execute("INSERT INTO METADATA (KEY,VALUE) \
                      VALUES ('max_step', '1')")
        c.execute("INSERT INTO METADATA (KEY,VALUE) \
                      VALUES ('is_training', 'true')")

        self.c = c
        self.conn = conn
        conn.commit()

    def reset_cache(self):
        self.cache = {
            'lr': 0,
            'train_loss': 0,
            'step': 0,
            'epoch': 0,
            'activations': [],
            'weights': [],
            'gradients': [],
        }

    def save(self):
        time_start = time.time()
        self.c.execute(
            '''INSERT OR REPLACE INTO MODEL_SCALARS(step, train_loss, learning_rate)  VALUES (%d, %s, %s);''' % (
                self.cache['step'], str(self.cache['train_loss']), str(self.cache['lr'])))
        self.conn.commit()

        # 插入activations
        sql = "INSERT INTO ACTIVATION_SCALARS(step, node, data_index, activation_min, activation_q1, activation_median, activation_q3, activation_max) VALUES(?, ?, ?, ?, ?, ?, ?, ?)"
        args = []
        activations = self.cache['activations']
        for i in range(len(activations)):
            args.append(tuple(activations[i]))
        self.c.executemany(sql, args)
        self.conn.commit()

        # 插入weights
        sql = "INSERT INTO WEIGHT_SCALARS(step, node, weight_min, weight_q1, weight_median, weight_q3, weight_max) VALUES(?, ?, ?, ?, ?, ?, ?)"
        args = []
        weights = self.cache['weights']
        for i in range(len(weights)):
            args.append(tuple(weights[i]))
        self.c.executemany(sql, args)
        self.conn.commit()

        # 插入gradients
        sql = "INSERT INTO GRADIENT_SCALARS(step, node, gradient_min, gradient_q1, gradient_median, gradient_q3, gradient_max) VALUES(?, ?, ?, ?, ?, ?, ?)"
        args = []
        gradients = self.cache['gradients']
        for i in range(len(gradients)):
            args.append(tuple(gradients[i]))
        self.c.executemany(sql, args)
        self.conn.commit()

        time_end = time.time()
        print('insert into sqlite time cost', time_end - time_start, 's')
        self.reset_cache()
