# CNN-Tensorflow
Simple Tensorflow implementation of ***pre-activation*** ResNet, VGG, ShuffleNet
## Summary
### dataset
* [tiny_imagenet](https://tiny-imagenet.herokuapp.com/)
* cifar10, cifar100, mnist, fashion-mnist in `keras` (`pip install keras`)

### get pbtxt
we can specifc model name (such as  VGG, shuffle, resnet)
* python main.py --phase pb --model VGG

### Train
* python main.py --phase train --dataset cifar10 --res_n 18 --lr 0.1 --model resnet

### Test
* python main.py --phase test --dataset cifar10 --res_n 18 --lr 0.1

