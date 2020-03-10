# _*_coding:utf-8 _*_
# 此文件包含所收集和手写的一些可视化工具

import cv2
import numpy as np
import matplotlib.pyplot as plt
from keras import backend as K


def deprocess_image(x):
    """util function to convert a tensor into a valid image.
    Args:
           x: tensor of filter.
    Returns:
           x: deprocessed tensor.
    """
    # normalize tensor: center on 0., ensure std is 0.1
    x -= x.mean()
    x /= (x.std() + 1e-5)
    x *= 0.1

    # clip to [0, 1]
    x += 0.5
    x = np.clip(x, 0, 1)

    # convert to RGB array
    x *= 255
    if K.image_data_format() == 'channels_first':
        x = x.transpose((1, 2, 0))
    x = np.clip(x, 0, 255).astype('uint8')

    return x


def filter_show(filters, nx=8):
    FH, FW, C, FN= filters.shape
    ny = int(np.ceil(FN / nx))
    fig = plt.figure()
    fig.subplots_adjust(left=0, right=1, bottom=0, top=1, hspace=0.05, wspace=0.05)
    for i in range(FN):
        ax = fig.add_subplot(ny, nx, i+1, xticks=[], yticks=[])
        ax.imshow(filters[:, :, :, i], cmap=plt.cm.gray_r, interpolation='nearest')
    plt.show()


def vis_conv(images, n, name, t):
    """visualize conv output and conv filter.
    Args:
           img: original image.
           n: number of col and row.
           t: vis type.
           name: save name.
    """
    size = 64
    margin = 5

    if t == 'filter':
        results = np.zeros((n * size + 7 * margin, n * size + 7 * margin, 3))
    if t == 'conv':
        results = np.zeros((n * size + 7 * margin, n * size + 7 * margin))

    for i in range(n):
        for j in range(n):
            if t == 'filter':
                filter_img = images[i + (j * n)]
            if t == 'conv':
                filter_img = images[..., i + (j * n)]
            filter_img = cv2.resize(filter_img, (size, size))

            # Put the result in the square `(i, j)` of the results grid
            horizontal_start = i * size + i * margin
            horizontal_end = horizontal_start + size
            vertical_start = j * size + j * margin
            vertical_end = vertical_start + size
            if t == 'filter':
                # print(filter_img)
                results[horizontal_start: horizontal_end, vertical_start: vertical_end, :] = filter_img
            if t == 'conv':
                results[horizontal_start: horizontal_end, vertical_start: vertical_end] = filter_img

    # Display the results grid
    if t == 'filter':
        results = np.uint8(results)  # same as results.astype(np.int16)
    plt.imshow(results)
    plt.savefig('{}_{}.png'.format(t, name), dpi=600)
    plt.show()


def picnormalize(array):
    """
    normalize conv_filter(including negative) value to 0-255
    :param array: the Keras models weights
    :return: normalized picture
    """
    c, w, h, n = array.shape  # channel, width, height, number
    for num in range(n):
        for element in array[:, :, :, num]:
            ymax = 255
            ymin = 0
            xmax = max(map(max, element))
            xmin = min(map(min, element))
            for i in range(w):
                for j in range(h):
                    element[i][j] = round(((ymax-ymin)*(element[i][j]-xmin)/(xmax-xmin))+ymin)
    return array.astype('uint8')


