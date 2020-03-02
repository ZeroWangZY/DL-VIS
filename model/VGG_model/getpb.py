import os
import numpy as np
import tensorflow as tf
from lib.data_loader.data_loader import CIFAR10BinDataLoader
from lib.utils.config import ConfigReader, TrainNetConfig, DataConfig
from lib.vgg.vgg16 import VGG16

#if tf.__version__ < '1.6.0':
#    from lib.vgg.vgg16_legacy import VGG16L as VGG16
#else:
#    from lib.vgg.vgg16 import VGG16


def train():
    config_reader = ConfigReader('experiments/configs/vgg16.yml')
    train_config = TrainNetConfig(config_reader.get_train_config())
    data_config = DataConfig(config_reader.get_train_config())

    train_log_dir = './logs/train/'
    val_log_dir = './logs/val/'

    if not os.path.exists(train_log_dir):
        os.makedirs(train_log_dir)
    if not os.path.exists(val_log_dir):
        os.makedirs(val_log_dir)

    net = VGG16(train_config)

    # with tf.name_scope('input'):
    #     train_loader = CIFAR10BinDataLoader(data_config, is_train=True, is_shuffle=True)
    #     train_image_batch, train_label_batch = train_loader.generate_batch()
    #     val_loader = CIFAR10BinDataLoader(data_config, is_train=False, is_shuffle=False)
    #     val_image_batch, val_label_batch = val_loader.generate_batch()

    train_op = net.build_model()
    summaries = net.get_summary()

    # saver = tf.train.Saver(tf.global_variables())
    # summary_op = tf.summary.merge(summaries)

    init = tf.global_variables_initializer()
    sess = tf.Session()
    sess.run(init)

    # net.load_with_skip(train_config.pre_train_weight, sess, ['fc6', 'fc7', 'fc8'])

    # coord = tf.train.Coordinator()
    # threads = tf.train.start_queue_runners(sess=sess, coord=coord)
    with open("vgg.pbtxt", "w") as f:
        f.write(str(sess.graph.as_graph_def()))
    train_summary_writer = tf.summary.FileWriter(train_log_dir, sess.graph)
    # val_summary_writer = tf.summary.FileWriter(val_log_dir, sess.graph)
    sess.close()
    return
    


def main():
    train()


if __name__ == '__main__':
    main()
