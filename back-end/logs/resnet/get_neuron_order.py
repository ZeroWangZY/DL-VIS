"""
获取神经元的排列顺序
"""
import os
import json
import numpy as np
import math
import pandas as pd
from logs.resnet.get_pca_matrix import PCAMatrix
# import matplotlib.pyplot as plt
from sklearn.decomposition import PCA

SUMMARY_DIR = os.getenv("SUMMARY_DIR")

usePCAMatrix = False
useLabelsAsSrcs = False

def softmax(x):
    x_row_max = x.max(axis=-1)
    x_row_max = x_row_max.reshape(list(x.shape)[:-1]+[1])
    x = x - x_row_max
    x_exp = np.exp(x)
    x_exp_row_sum = x_exp.sum(axis=-1).reshape(list(x.shape)[:-1]+[1])
    softmax = x_exp / x_exp_row_sum
    return softmax


def get_neuron_order(epochNum, stepNum, node_id, data_runner, type, graph_name):
    if graph_name.find("resnet") != -1 or graph_name.find("lenet") != -1:
        indicesFilePath = SUMMARY_DIR + graph_name + os.sep + "indices" + os.sep + str(epochNum) + ".json"
        labelsNum = 10
        labelsCols = ['n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9', 'n10']
    else:
        indicesFilePath = SUMMARY_DIR + graph_name + os.sep + "indices" + os.sep + "1.json"
        labelsNum = 15
        labelsCols = ['n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9', 'n10', 'n11', 'n12', 'n13', 'n14', 'n15']
    with open(indicesFilePath, 'r', encoding='utf-8') as fp:
        indices = json.load(fp)
        if type != "activation":
            node_id = node_id + ".weight"
        ckpt_file = SUMMARY_DIR + graph_name + os.sep + "weights" + os.sep + "-" + str(epochNum) + "_" + str(stepNum) + ".ckpt"
        if graph_name.find("resnet") != -1 or graph_name.find("lenet") != -1:
            [resdata, labels] = data_runner.get_tensor_from_training(indices[0:32], ckpt_file=ckpt_file, node_name=node_id, data_type=type)
        else:
            [resdata, labels] = data_runner.get_tensor_from_training(indices[0:6784:106], ckpt_file=ckpt_file, node_name=node_id, data_type=type, type="gno")
        if not "fc" in node_id and graph_name.find("resnet") != -1:
            resdata = np.mean(np.array(resdata), axis=(2, 3))

        dataNum = resdata.shape[1] # batch_size * neroun nums

        if usePCAMatrix == True:
            pcaMatrix = PCAMatrix()
            resMatrix = pcaMatrix.fit_transform(resdata, labelsNum).swapaxes(0, 1)
            if not os.path.exists(SUMMARY_DIR + graph_name + "/order"):
                os.mkdir(SUMMARY_DIR + graph_name + "/order")
            np.save(SUMMARY_DIR + graph_name + "/order" + os.sep + "-" + str(epochNum) + "_" + str(
                stepNum) + "-" + node_id + "-" + type + "-matrix" + ".npy", resMatrix)
            return

        if useLabelsAsSrcs == True:  # 使用标签作为力源
            df = pd.DataFrame(resdata)
            if graph_name.find("resnet") != -1:
                df['labels'] = labels.asnumpy()
            else:
                df['labels'] = labels
            data = []
            for i in range(labelsNum):
                currentList = list(filter(lambda item: item['labels'] == i, df.iloc))
                data.append(np.mean(np.array(currentList), axis=0)[:-1])
            data = np.array(data).swapaxes(0, 1)
            data = (np.abs(data) + data) / 2.0  # relu整流
            df = pd.DataFrame(data, columns=labelsCols)
            m = labelsNum
        else:
            data = resdata.swapaxes(0, 1)
            data = (np.abs(data) + data) / 2.0  # relu整流
            pca = PCA(n_components=8)
            data = pca.fit_transform(data)
            df = pd.DataFrame(data, columns=['n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8'])
            m = 8

        # for i in range(resdata.shape[1]):
        #     data[i] = softmax(np.sign(data[i]) * (2 ** abs(data[i])))


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
        # print(disList[int(dataNum / 2)])

        # 计算角度值
        angleList = []
        for i in range(len(to_plot[0])):
            x = to_plot[0][i]
            y = to_plot[1][i]
            # 删除中心点坐标，相当于剔除死神经元
            # if x ** 2 + y ** 2 < disList[int(dataNum / 2)]:
            #     angleList.append(-100)
            #     continue
            theta = math.atan2(y, x)
            # print(theta)
            if useLabelsAsSrcs == True:
                if theta < -(labelsNum - 1) / labelsNum * math.pi:
                    theta = theta + 2 * math.pi
            else:
                if theta < -7 / 8 * math.pi:
                    theta = theta + 2 * math.pi
            if math.isnan(theta):
                angleList.append(-100)
            else:
                angleList.append(theta)
        if not os.path.exists(SUMMARY_DIR + graph_name + "/order"):
            os.mkdir(SUMMARY_DIR + graph_name + "/order")
        np.save(SUMMARY_DIR + graph_name + "/order" + os.sep + "-" + str(epochNum) + "_" + str(stepNum) + "-" + node_id + "-" + type + ".npy", angleList)
        # plt.figure()
        # plt.scatter(to_plot[0], to_plot[1])
        # plt.show()