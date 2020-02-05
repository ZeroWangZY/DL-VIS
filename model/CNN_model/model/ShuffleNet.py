import time
from model.ops_shuffle import *
from model.utils import *
from model.BaseNet import BaseNet
class ShuffleNet(BaseNet):
    def __init__(self, sess, args, model_scale=1.0, shuffle_group=2):
        super().__init__(sess, args)
        self.first_conv_channel = 24
        self.model_name = 'Shuffle'
        self.model_scale = model_scale
        self.channel_sizes = self._select_channel_size(model_scale)
        self.shuffle_group = shuffle_group
        self.cls = self.label_dim

    ##################################################################################
    # Generator
    ##################################################################################

    def _select_channel_size(self, model_scale):
        if model_scale == 0.5:
            return [(48, 4), (96, 8), (192, 4), (1024, 1)]
        elif model_scale == 1.0:
            return [(116, 4), (232, 8), (464, 4), (1024, 1)]
        elif model_scale == 1.5:
            return [(176, 4), (352, 8), (704, 4), (1024, 1)]
        elif model_scale == 2.0:
            return [(244, 4), (488, 8), (976, 4), (2048, 1)]
        else:
            raise ValueError('Unsupported model size.')
    
    def network(self, x, is_training=True, reuse=False):
        name = "train_network" if (is_training==True) else "test_network"
        with tf.variable_scope(name, reuse=reuse):
            with slim.arg_scope([slim.batch_norm], is_training=is_training):
                with tf.variable_scope('init_block'):
                    out = conv_bn_relu(x, self.first_conv_channel, 3, 2)
                    out = slim.max_pool2d(out, 3, 2, padding='SAME')

                for idx, block in enumerate(self.channel_sizes[:-1]):
                    with tf.variable_scope('shuffle_block_{}'.format(idx)):
                        out_channel, repeat = block

                        # First block is downsampling
                        out = shufflenet_v2_block(out, out_channel, 3, 2, shuffle_group=self.shuffle_group)

                        # Rest blocks
                        for i in range(repeat-1):
                            out = shufflenet_v2_block(out, out_channel, 3, shuffle_group=self.shuffle_group)

                with tf.variable_scope('end_block'):
                    out = conv_bn_relu(out, self.channel_sizes[-1][0], 1)

                with tf.variable_scope('prediction'):
                    out = global_avg_pool2D(out)
                    out = slim.conv2d(out, self.cls, 1, activation_fn=None, biases_initializer=None)
                    out = tf.reshape(out, shape=[-1, self.cls])
                    out = tf.identity(out, name='cls_prediction')
                    return out



