from easydict import EasyDict as edict

mnist_cfg = edict({
    'num_classes': 10,
    'lr': 0.01,
    'momentum': 0.9,
    'epoch_size': 1,
    'batch_size': 32,
    'buffer_size': 1000,
    'image_height': 32,
    'image_width': 32,
    'save_checkpoint_steps': 1875,
    'keep_checkpoint_max': 10,
})
