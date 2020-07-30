import sqlite3
import _thread


def save_loss_function(db_file_name, step, num):
    conn = sqlite3.connect(db_file_name)
    c = conn.cursor()
    c.execute('''INSERT OR REPLACE INTO MODEL_SCALARS(step, train_loss)
                        VALUES(%d, %s);''' % (step, str(num)))
    conn.commit()
    conn.close()


def save_lr_function(db_file_name, step, num):
    conn = sqlite3.connect(db_file_name)
    c = conn.cursor()
    c.execute('''UPDATE MODEL_SCALARS set learning_rate = %s where step=%d;''' % (str(num), step))
    conn.commit()
    conn.close()


def save_activation_scalars_function(db_file_name, step, name, minimum, mean, maxmum):
    conn = sqlite3.connect(db_file_name)
    c = conn.cursor()
    c.execute('''INSERT OR REPLACE INTO ACTIVATION_SCALARS(step, node, activation_min, activation_mean, activation_max)
                                        VALUES(%d, '%s', %f, %f, %f);''' % (
        step, name, minimum, mean, maxmum))
    conn.commit()
    conn.close()


def save_gradient_scalars_function(db_file_name, step, name, minimum, mean, maxmum):
    conn = sqlite3.connect(db_file_name)
    c = conn.cursor()
    c.execute('''INSERT OR REPLACE INTO GRADIENT_SCALARS(step, node, gradient_min, gradient_mean, gradient_max)
                                            VALUES(%d, '%s', %f, %f, %f);''' % (
        step, name, minimum, mean, maxmum))
    conn.commit()
    conn.close()


def save_weight_scalars_function(db_file_name, step, name, minimum, mean, maxmum):
    conn = sqlite3.connect(db_file_name)
    c = conn.cursor()
    c.execute('''INSERT OR REPLACE INTO WEIGHT_SCALARS(step, node, weight_min, weight_mean, weight_max)
                                        VALUES(%d, '%s', %f, %f, %f);''' % (
        step, name, minimum, mean, maxmum))
    conn.commit()
    conn.close()


class SqliteHelper():
    def __init__(self, db_file_name):
        self.db_file_name = db_file_name

        conn = sqlite3.connect(db_file_name)
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
               (step        I   NT     NOT NULL,
               node             CHAR(50)  NOT NULL,
               activation_min   REAL,
               activation_mean  REAL,
               activation_max   REAL,
               PRIMARY KEY (step, node));''')

        c.execute('''CREATE TABLE GRADIENT_SCALARS
               (step        I   NT     NOT NULL,
               node             CHAR(50)  NOT NULL,
               gradient_min     REAL,
               gradient_mean    REAL,
               gradient_max     REAL,
               PRIMARY KEY (step, node));''')

        c.execute('''CREATE TABLE WEIGHT_SCALARS
               (step        I   NT     NOT NULL,
               node             CHAR(50)  NOT NULL,
               weight_min       REAL,
               weight_mean      REAL,
               weight_max       REAL,
               PRIMARY KEY (step, node));''')

        c.execute("INSERT INTO METADATA (KEY,VALUE) \
              VALUES ('max_step', '1')")
        c.execute("INSERT INTO METADATA (KEY,VALUE) \
              VALUES ('is_training', 'true')")

        self.c = c
        self.conn = conn
        conn.commit()
        # conn.close()

    def save_loss(self, step, loss):
        self.c.execute('''INSERT OR REPLACE INTO MODEL_SCALARS(step, train_loss)
                                VALUES(%d, %s);''' % (step, str(loss)))
        self.conn.commit()
        # _thread.start_new_thread(save_loss_function, (self.db_file_name, step, loss))

    def save_lr(self, step, lr):
        self.c.execute('''UPDATE MODEL_SCALARS set learning_rate = %s where step=%d;''' % (str(lr), step))
        self.conn.commit()
        # _thread.start_new_thread(save_loss_function, (self.db_file_name, step, lr))

    def save_activation_scalars(self, step, name, minimum, mean, maxmum):
        self.c.execute('''INSERT OR REPLACE INTO ACTIVATION_SCALARS(step, node, activation_min, activation_mean, activation_max)
                                                VALUES(%d, '%s', %f, %f, %f);''' % (
            step, name, minimum, mean, maxmum))
        self.conn.commit()        # _thread.start_new_thread(save_activation_scalars_function,
        #                          (self.db_file_name, step, name, minimum, mean, maxmum))

    def save_gradient_scalars(self, step, name, minimum, mean, maxmum):
        self.c.execute('''INSERT OR REPLACE INTO GRADIENT_SCALARS(step, node, gradient_min, gradient_mean, gradient_max)
                                                    VALUES(%d, '%s', %f, %f, %f);''' % (
            step, name, minimum, mean, maxmum))
        self.conn.commit()        # _thread.start_new_thread(save_gradient_scalars_function, (self.db_file_name, step, name, minimum, mean, maxmum))

    def save_weight_scalars(self, step, name, minimum, mean, maxmum):
        self.c.execute('''INSERT OR REPLACE INTO WEIGHT_SCALARS(step, node, weight_min, weight_mean, weight_max)
                                                VALUES(%d, '%s', %f, %f, %f);''' % (
            step, name, minimum, mean, maxmum))
        self.conn.commit()        # _thread.start_new_thread(save_weight_scalars_function, (self.db_file_name, step, name, minimum, mean, maxmum))
