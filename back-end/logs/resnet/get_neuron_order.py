"""
获取神经元的排列顺序
"""
import os
import json
import numpy as np
import math
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.decomposition import PCA

def softmax(x):
    x_row_max = x.max(axis=-1)
    x_row_max = x_row_max.reshape(list(x.shape)[:-1]+[1])
    x = x - x_row_max
    x_exp = np.exp(x)
    x_exp_row_sum = x_exp.sum(axis=-1).reshape(list(x.shape)[:-1]+[1])
    softmax = x_exp / x_exp_row_sum
    return softmax

indicesFilePath = "./logs/resnet/indices" + os.sep + "1.json"

def get_neuron_order(checkpoint_step, node_id, data_runner):
    with open(indicesFilePath, 'r', encoding='utf-8') as fp:
        indices = json.load(fp)
        [resdata, labels] = data_runner.get_tensor_from_training(indices[0:32], ckpt_file="logs/resnet/weights/-1_" + str(checkpoint_step) + ".ckpt", node_name="layer3.f.conv1")
        resdata = np.mean(np.array(resdata), axis=(2, 3))

        # 测试使用
        # resdata = np.load("resdata.npy")
        # labels = np.load("labels.npy")

        dataNum = resdata.shape[1]

        data = resdata.swapaxes(0, 1)
        pca = PCA(n_components=8)
        data = pca.fit_transform(data)

        for i in range(resdata.shape[1]):
            data[i] = softmax(np.sign(data[i]) * (2 ** abs(data[i])))

        df = pd.DataFrame(data, columns=['n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8'])

        m = 8
        to_plot = [[], []]

        s = np.array(
            [
                (np.cos(t), np.sin(t))
                for t in [2.0 * np.pi * (i / float(m)) for i in range(m)]
            ]
        )

        for k in range(dataNum):
            row = df.iloc[k].values
            row_ = np.repeat(np.expand_dims(row, axis=1), 2, axis=1)
            y = (s * row_).sum(axis=0) / row.sum()
            # if y[0] ** 2 + y[1] ** 2 > 0.5023174516746712:
            to_plot[0].append(y[0])
            to_plot[1].append(y[1])

        # 这部分代码用于删除中心
        # disList = np.array(to_plot[0]) ** 2 + np.array(to_plot[1]) ** 2
        # disList = np.sort(disList)
        # print(disList[200])

        # 计算角度值
        angleList = []
        for i in range(len(to_plot[0])):
            x = to_plot[0][i]
            y = to_plot[1][i]
            # 删除中心点坐标，相当于剔除死神经元
            # if x ** 2 + y ** 2 < disList[200]:
            #     angleList.append(-100)
            #     continue
            theta = math.atan2(y, x)
            # print(theta)
            if theta < -7 / 8 * math.pi:
                theta = theta + 2 * math.pi
            angleList.append(theta)

        np.save("./logs/resnet/order" + os.sep + str(checkpoint_step) + "-" + node_id + ".npy", angleList)
        plt.figure()
        plt.scatter(to_plot[0], to_plot[1])
        plt.show()