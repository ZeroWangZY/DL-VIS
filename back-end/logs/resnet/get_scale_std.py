"""
获取神经元的排列顺序
"""
import os
import json
import numpy as np
import math
import pandas as pd
# import matplotlib.pyplot as plt
from sklearn.decomposition import PCA

SUMMARY_DIR = os.getenv("SUMMARY_DIR")
useLabelsAsSrcs = True

def softmax(x):
    x_row_max = x.max(axis=-1)
    x_row_max = x_row_max.reshape(list(x.shape)[:-1]+[1])
    x = x - x_row_max
    x_exp = np.exp(x)
    x_exp_row_sum = x_exp.sum(axis=-1).reshape(list(x.shape)[:-1]+[1])
    softmax = x_exp / x_exp_row_sum
    return softmax


def get_scale_std(epochNum, stepNum, node_id, data_runner, type, graph_name):
    indicesFilePath = SUMMARY_DIR + graph_name + os.sep + "indices" + os.sep + str(epochNum) + ".json"
    with open(indicesFilePath, 'r', encoding='utf-8') as fp:
        indices = json.load(fp)
        if type != "activation":
            node_id = node_id + ".weight"
        ckpt_file = SUMMARY_DIR + graph_name + os.sep + "weights" + os.sep + "-" + str(epochNum) + "_" + str(stepNum) + ".ckpt"
        [resdata, labels] = data_runner.get_tensor_from_training(indices[0:32], ckpt_file=ckpt_file, node_name=node_id, data_type=type)
        if not "fc" in node_id:
            resdata = np.mean(resdata, axis=(2, 3)).swapaxes(0, 1)
        else:
            resdata = resdata.swapaxes(0, 1)

        df = pd.DataFrame(resdata)
        df['angle'] = np.load(SUMMARY_DIR + graph_name + os.sep + "order" + os.sep + "-" + str(epochNum) + "_" + str(
            stepNum) + "-" + node_id + "-" + type + ".npy")
        sectorData = []
        if useLabelsAsSrcs == True:
            for i in range(10):
                leftMargin = -9 / 10 * math.pi + i * math.pi / 5
                rightMargin = -7 / 10 * math.pi + i * math.pi / 5
                currentSectorData = list(
                    filter(lambda item: item['angle'] > leftMargin and item['angle'] < rightMargin,
                           df.iloc))
                if len(currentSectorData) != 0:
                    currentSectorData = np.array(currentSectorData)
                    currentSectorData = np.mean(currentSectorData, axis=0)[:-1]
                    mean = np.mean(currentSectorData)
                    std = np.std(currentSectorData)
                    max = mean + 2 * std
                    min = mean - 2 * std
                    sectorData.append([min, max])
                else:
                    sectorData.append([0, 0])
        else:
            for i in range(8):
                leftMargin = -7 / 8 * math.pi + i * math.pi / 4
                rightMargin = -5 / 8 * math.pi + i * math.pi / 4
                currentSectorData = list(
                    filter(lambda item: item['angle'] > leftMargin and item['angle'] < rightMargin,
                           df.iloc))
                if len(currentSectorData) != 0:
                    currentSectorData = np.array(currentSectorData)
                    currentSectorData = np.mean(currentSectorData, axis=0)[:-1]
                    mean = np.mean(currentSectorData)
                    std = np.std(currentSectorData)
                    max = mean + 2 * std
                    min = mean - 2 * std
                    sectorData.append([min, max])
                else:
                    sectorData.append([0, 0])
        if not os.path.exists(SUMMARY_DIR + graph_name + "/scale"):
            os.mkdir(SUMMARY_DIR + graph_name + "/scale")
        np.save(SUMMARY_DIR + graph_name + "/scale" + os.sep + "-" + str(epochNum) + "_" + str(
            stepNum) + "-" + node_id + "-" + type + ".npy", np.array(sectorData))
