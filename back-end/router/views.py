import sys

from django.shortcuts import render
import json
import numpy as np
import time
import importlib
from django.http import HttpResponse
import sqlite3
import os
from graph.data_access.loaders.data_loader import DataLoader
# from mindinsight.datavisual.data_transform.data_loader import DataLoader
# from mindinsight.datavisual.common.enums import PluginNameEnum
from graph.data_access.common.enums import PluginNameEnum
# from graph.data_access.proto_files import anf_ir_pb2
from mindspore.train import anf_ir_pb2
from google.protobuf import json_format
from threading import Timer
from dao.data_helper import DataHelper
from dao.node_mapping import alex_node_map
import random
import pandas as pd
import math
from sklearn.manifold import TSNE
from sklearn.cluster import KMeans
from logs.resnet.resnet_data_runner import ResnetDataRunner
from logs.lenet.lenet_data_runner import LenetDataRunner
# from logs.bert.bert_data_runner import BertDataRunner

from logs.resnet.get_neuron_order import get_neuron_order
from logs.resnet.get_scale_std import get_scale_std

resnet_data_runner = ResnetDataRunner()
# bert_data_runner = BertDataRunner()
lenet_data_runner = LenetDataRunner()
useLabelsAsSrcs = False

from service.service import get_node_line_service, get_cluster_data_service, get_model_scalars_service, \
    get_tensor_heatmap_service, get_tensor_heatmap_service_realtime

DB_FILES = {
    'normal': 'data/alex-normal-8000.db',
    'param_error': 'data/alexnet-parameter-outlier-sigma-1.db',
    'lr_error': 'data/alexnet-lr-0.00001.db',
    'with_activation': 'data/alexnet-with-activation-tensors.db'
}

db_file = DB_FILES['normal']

SUMMARY_DIR = os.getenv("SUMMARY_DIR")

dp = DataHelper(db_file)
DB_MAX_STEP = int(dp.get_metadata('max_step'))
dp.close()
del dp

max_step = DB_MAX_STEP
is_training = False
usePCAMatrix = False


def normalize(series):
    a = min(series)
    b = max(series)
    return (series - a) / (b - a)


def normalize_1(series, a, b):
    return (series - a) / (b - a)

def softmax(x):
    x_row_max = x.max(axis=-1)
    x_row_max = x_row_max.reshape(list(x.shape)[:-1]+[1])
    x = x - x_row_max
    x_exp = np.exp(x)
    x_exp_row_sum = x_exp.sum(axis=-1).reshape(list(x.shape)[:-1]+[1])
    softmax = x_exp / x_exp_row_sum
    return softmax

def start_training():
    global max_step
    global is_training
    max_step = 0
    is_training = True

    def tick():
        global max_step
        global is_training
        if is_training:
            max_step += 1
            Timer(3, tick).start()
        if max_step > DB_MAX_STEP:
            is_training = False

    Timer(1, tick).start()


def index(request):
    return render(request, 'index.html')


def get_summary_graph(request):
    data_loader = None
    graph_name = request.GET.get('graph_name', default='lenet')
    if SUMMARY_DIR:
        data_loader = DataLoader(SUMMARY_DIR + os.sep + graph_name)
        data_loader.load()
    try:
        if not data_loader:
            raise Exception("invalid summary path")
        events_data = data_loader.get_events_data()
        graph_tag = events_data.list_tags_by_plugin(PluginNameEnum.GRAPH)[0]
        graph_data = events_data.tensors(graph_tag)[0].value
        return HttpResponse(json.dumps({
            "message": "success",
            "data": graph_data
        }), content_type="application/json")
    except Exception as ex:
        response = HttpResponse(json.dumps({
            "message": str(ex),
            "data": None
        }), content_type="application/json")
    response.status_code = 500
    return response


def get_local_ms_graph(request):
    if request.method == 'GET':
        graph_name = request.GET.get('graph_name', default='lenet')
        f = open("ms-graph/" + graph_name + ".pb", "rb")
        model = anf_ir_pb2.ModelProto()
        model.ParseFromString(f.read())
        return HttpResponse(json.dumps({
            "message": "success",
            "data": json.loads(json_format.MessageToJson(model.graph))
        }), content_type="application/json")

    return HttpResponse(json.dumps({
        "message": "method undefined",
        "data": None
    }), content_type="application/json")


def get_model_scalars(request):
    if request.method == 'GET':
        # data_helper = DataHelper(db_file)
        graph_name = request.GET.get('graph_name', default='lenet')
        start_step = int(request.GET.get('start_step', default='1'))
        end_step = int(request.GET.get('end_step', default='10'))
        mode = request.GET.get('mode', default='mock')
        if mode == "mock":
            data_helper = DataHelper(db_file)
        elif mode == "realtime":
            data_helper = DataHelper(SUMMARY_DIR + os.sep + graph_name + os.sep + "data.db")
        return HttpResponse(json.dumps({
            "message": "success",
            "data": data_helper.get_model_scalars(start_step, end_step)
        }), content_type="application/json")
        data_helper.close()
        result = get_model_scalars_service(graph_name, start_step, end_step)

        return HttpResponse(json.dumps({
            "message": "success",
            "data": result
        }), content_type="application/json")
    return HttpResponse(json.dumps({
        "message": "method undefined",
        "data": None
    }), content_type="application/json")


def get_metadata(request):
    if request.method == 'GET':
        # data_helper = DataHelper(db_file)
        mode = request.GET.get('mode', default='mock')
        graph_name = request.GET.get('graph_name', default='lenet')
        try:
            if mode == "mock":
                data_helper = DataHelper(db_file)
                db_max_step = int(data_helper.get_metadata('max_step'))
            elif mode == "realtime":
                data_helper = DataHelper(SUMMARY_DIR + os.sep + graph_name + os.sep + "data.db")
                db_max_step = int(data_helper.get_realtime_metadata('max_step'))
        except Exception:
            return HttpResponse(json.dumps({
                "message": "db not exist",
                "data": None
            }), content_type="application/json")
        db_is_training = data_helper.get_metadata('is_training') == 'true'

        data_helper.close()
        if mode == "mock":
            return HttpResponse(json.dumps({
                "message": "success",
                "data": {
                    "max_step": max_step,
                    "is_training": is_training
                }
            }), content_type="application/json", status="422")
        elif mode == "realtime":
            return HttpResponse(json.dumps({
                "message": "success",
                "data": {
                    "max_step": db_max_step,
                    "is_training": is_training
                }
            }), content_type="application/json")
    return HttpResponse(json.dumps({
        "message": "method undefined",
        "data": None
    }), content_type="application/json")

def get_layer_scalars(request):
    if request.method == 'GET':
        graph_name = request.GET.get('graph_name', default='lenet')
        node_ids = request.GET.getlist('node_id')
        start_step = int(request.GET.get('start_step', default='1'))
        end_step = int(request.GET.get('end_step', default='10'))
        mode = request.GET.get('mode', default='mock')
        type = request.GET.get('type', default='activation')

        if mode == "mock":
            data_helper = DataHelper(DB_FILES['with_activation'])
        elif mode == "realtime":
            data_helper = DataHelper(SUMMARY_DIR + os.sep + graph_name + os.sep + "data.db")
        
        res = {}
        node_id = node_ids[0]
        db_node_id = alex_node_map.get(node_id)
        if db_node_id != None:
            res[node_id] = data_helper.get_layer_scalars( start_step, end_step)

        data_helper.close()
        return HttpResponse(json.dumps({
            "message": "success",
            "data": res
        }), content_type="application/json")
    return HttpResponse(json.dumps({
        "message": "method undefined",
        "data": None
    }), content_type="application/json")

def get_node_scalars(request):
    if request.method == 'GET':
        graph_name = request.GET.get('graph_name', default='lenet')
        node_ids = request.GET.getlist('node_id')
        start_step = int(request.GET.get('start_step', default='1'))
        end_step = int(request.GET.get('end_step', default='10'))
        type = request.GET.get('type', default='activation')
        mode = request.GET.get('mode', default='mock')

        # data_helper = DataHelper(db_file)
        if mode == "mock":
            data_helper = DataHelper(db_file)
            res = {}
            for node_id in node_ids:
                db_node_id = alex_node_map.get(node_id)
                if db_node_id != None:
                    if type == 'activation':
                        res[node_id] = data_helper.get_activation_scalars(db_node_id, start_step, end_step)
                    elif type == 'gradient':
                        res[node_id] = data_helper.get_gradient_scalars(db_node_id, start_step, end_step)
                    elif type == 'weight':
                        res[node_id] = data_helper.get_weight_scalars(db_node_id, start_step, end_step)
                    continue
                data = []
                last_value = [random.random(), random.random(), random.random()]
                for i in range(start_step, end_step):
                    for j in range(len(last_value)):
                        last_value[j] = last_value[j] + random.random() / 20 - 0.5 / 20
                        if last_value[j] < 0:
                            last_value[j] = 0.01
                    data.append({
                        "step": i,
                        type + "_min": last_value[0],
                        type + "_max": last_value[1],
                        type + "_mean": last_value[2],
                    })
                res[node_id] = data
            data_helper.close()
        elif mode == "realtime":
            data_helper = DataHelper(SUMMARY_DIR + os.sep + graph_name + os.sep + "data.db")
            res = {}
            lenet_dict = {
                '9': "fc1.weight",
                '12': "fc2.weight",
                '15': "fc3.weight",
            }
            for node_id in node_ids:
                if type == 'activation':
                    if graph_name.find("lenet") != -1 and node_id.find("_") != -1:
                        res[node_id] = data_helper.get_activation_scalars(node_id.split("_")[0] + ".weight", start_step, end_step)
                    else:
                        res[node_id] = data_helper.get_activation_scalars(node_id, start_step, end_step)
                elif type == 'gradient':
                    if graph_name.find("resnet") != -1:
                        res[node_id] = data_helper.get_gradient_scalars(node_id + ".weight", start_step, end_step)
                    elif graph_name.find("lenet") != -1:
                        if node_id.find("_") != -1:
                            res[node_id] = data_helper.get_gradient_scalars(node_id.split("_")[0] + ".weight", start_step, end_step)
                        else:
                            res[node_id] = data_helper.get_gradient_scalars(lenet_dict[node_id], start_step, end_step)
                    else:
                        res[node_id] = data_helper.get_gradient_scalars(node_id, start_step, end_step)
                elif type == 'weight':
                    if graph_name.find("resnet") != -1:
                        res[node_id] = data_helper.get_weight_scalars(node_id + ".weight", start_step, end_step)
                    elif graph_name.find("lenet") != -1:
                        if node_id.find("_") != -1:
                            res[node_id] = data_helper.get_weight_scalars(node_id.split("_")[0] + ".weight", start_step, end_step)
                        else:
                            res[node_id] = data_helper.get_weight_scalars(lenet_dict[node_id], start_step, end_step)
                    else:
                        res[node_id] = data_helper.get_weight_scalars(node_id, start_step, end_step)
                continue
                data = []
                last_value = [random.random(), random.random(), random.random()]
                for i in range(start_step, end_step):
                    for j in range(len(last_value)):
                        last_value[j] = last_value[j] + random.random() / 20 - 0.5 / 20
                        if last_value[j] < 0:
                            last_value[j] = 0.01
                    data.append({
                        "step": i,
                        type + "_min": last_value[0],
                        type + "_max": last_value[1],
                        type + "_mean": last_value[2],
                    })
                res[node_id] = data
            data_helper.close()

        return HttpResponse(json.dumps({
            "message": "success",
            "data": res
        }), content_type="application/json")
    return HttpResponse(json.dumps({
        "message": "method undefined",
        "data": None
    }), content_type="application/json")


def get_node_tensors(request):
    if request.method == 'GET':
        graph_name = request.GET.get('graph_name', default='lenet')
        node_id = request.GET.get('node_id')
        start_step = int(request.GET.get('start_step', default='1'))
        end_step = int(request.GET.get('end_step', default='10'))
        if end_step - start_step > 20:
            return HttpResponse(json.dumps({
                "message": "do not support such large steps",
                "data": None
            }), content_type="application/json")

        if start_step % 3 == 0:
            res = np.random.randn(end_step - start_step, 16, 24, 24, 3)
        elif start_step % 3 == 1:
            res = np.random.randn(end_step - start_step, 32, 100)
        elif start_step % 3 == 2:
            res = np.random.randn(end_step - start_step, 64, 32, 32)

        return HttpResponse(json.dumps({
            "message": "success",
            "data": res.tolist()
        }), content_type="application/json")
    return HttpResponse(json.dumps({
        "message": "method undefined",
        "data": None
    }), content_type="application/json")

def get_node_tensor(request):   # 鼠标点击某一个数据时，返回雷达图数据
    if request.method == 'GET':
        graph_name = request.GET.get('graph_name', default='resnet')
        node_id = request.GET.get('node_id', default='layer3.f.conv1')
        step = int(request.GET.get('step', default='1'))
        data_index = int(request.GET.get('data_index', default='-1'))    # 默认是整个step
        type = request.GET.get('type', default='activation')
        # mode = request.GET.get('mode', default='normal')
        mode = request.GET.get('mode', default='radial')                 # mode可选radial或者heatmap
        dim = request.GET.get('dim', default='radial')                   # 维度，做扇区采样就没有维度了呀，radviz的维度就是这个
        scale = request.GET.get('scale', default='false')

        ckptList = os.listdir(SUMMARY_DIR + os.sep + graph_name + os.sep + "weights")
        if len(ckptList) == 0:
            return HttpResponse(json.dumps({
                "message": "No ckpt usable",
            }), content_type="application/json")

        stepNumList = []
        for i in range(len(ckptList)):
            epochAndStep = ckptList[i].split(".")[0].split("_")
            epochNum = abs((int)(epochAndStep[0]))
            stepNum = (int)(epochAndStep[1])
            stepNumList.append((epochNum - 1) * 1875 + stepNum)
        difList = [abs(item - step) for item in stepNumList]
        minIndex = difList.index(min(difList))
        ckpt_file_name = ckptList[minIndex]
        ckpt_file_path = SUMMARY_DIR + os.sep + graph_name + os.sep + "weights" + os.sep + ckpt_file_name

        epochAndStep = ckptList[minIndex].split(".")[0].split("_")
        epochNum = abs((int)(epochAndStep[0]))
        stepNum = (int)(epochAndStep[1])

        if graph_name.find("resnet") != -1:
            data_runner = resnet_data_runner
            batch_size = 32
            labelsNum = 10
        elif graph_name.find("lenet") != -1:
            batch_size = 32
            labelsNum = 10
            data_runner = lenet_data_runner
        else:
            batch_size = 16
            labelsNum = 15
            # data_runner = bert_data_runner
        if usePCAMatrix == True:
            if not os.path.exists(
                    SUMMARY_DIR + graph_name + os.sep + "order" + os.sep + "-" + str(epochNum) + "_" + str(
                            stepNum) + "-" + node_id + "-" + type + "-matrix" + ".npy"):
                get_neuron_order(epochNum, stepNum, node_id, data_runner, type, graph_name)
        if not os.path.exists(SUMMARY_DIR + graph_name + os.sep + "order" + os.sep + "-" + str(epochNum) + "_" + str(stepNum) + "-" + node_id + "-" + type + ".npy"):
            get_neuron_order(epochNum, stepNum, node_id, data_runner, type, graph_name)
        if not os.path.exists(SUMMARY_DIR + graph_name + os.sep + "scale" + os.sep + "-" + str(epochNum) + "_" + str(stepNum) + "-" + node_id + "-" + type + ".npy"):
            get_scale_std(epochNum, stepNum, node_id, data_runner, type, graph_name)

        resultData = []
        if mode == "radial":
            jsonPath = SUMMARY_DIR + os.sep + graph_name + os.sep + "indices" + os.sep + str(epochNum) +".json"
            with open(jsonPath, 'r', encoding='utf-8') as fp:  # 拿到数据编号
                indices = json.load(fp)
                indices = indices[(step - 1) * batch_size : step * batch_size]   # 找到对应的数据编号，需要调用data_runner.py中的函数

                [resdata, labels] = data_runner.get_tensor_from_training(indices, node_name=node_id, data_type=type, ckpt_file=ckpt_file_path)
                print(indices)
                print(labels)
                if graph_name.find("resnet") != -1:
                    labels = labels.asnumpy()
                if not "fc" in node_id and graph_name.find("resnet") != -1:
                    resdata = np.mean(resdata, axis=(2, 3)).swapaxes(0, 1)
                else:
                    resdata = resdata.swapaxes(0, 1)
                resdata = (np.abs(resdata) + resdata) / 2.0 # relu整流
                print(resdata.shape) # 64 * batch_size 一个batch有batch_size个数据，64个神经元
                if usePCAMatrix == True:
                    pcaMatrix = np.load(SUMMARY_DIR + graph_name + os.sep + "order" + os.sep + "-" + str(epochNum) + "_" + str(stepNum) + "-" + node_id + "-" + type + "-matrix" + ".npy")
                    resdata = np.dot(resdata.swapaxes(0, 1), pcaMatrix)
                    for i in range(batch_size):   # 这里数据要改成活的
                        resultData.append({
                            "value": normalize(resdata[i]).tolist(),
                            "label": labels.tolist()[i],
                            "index": indices[i]
                        })
                    return HttpResponse(json.dumps({
                        "message": "success",
                        "data": resultData
                    }), content_type="application/json")
                if resdata.shape[0] <= 16:
                    sectorData = []
                    for i in range(resdata.shape[0]):
                        currentSectorData = normalize(resdata[i])
                        sectorData.append(currentSectorData)
                    for i in range(batch_size):   # 这里数据要改成活的
                        resultData.append({
                            "value": np.array(sectorData).swapaxes(0, 1)[i].tolist(),  # (8,)
                            "label": labels.tolist()[i],
                            "index": indices[i]
                        })
                    return HttpResponse(json.dumps({
                        "message": "success",
                        "data": resultData
                    }), content_type="application/json")

                # 使用radviz得到的angle进行聚类
                df = pd.DataFrame(resdata)
                df['angle'] = np.load(SUMMARY_DIR + graph_name + os.sep + "order" + os.sep + "-" + str(epochNum) + "_" + str(stepNum) + "-" + node_id + "-" + type + ".npy")
                scaleStd = np.load(SUMMARY_DIR + graph_name + os.sep + "scale" + os.sep + "-" + str(epochNum) + "_" + str(stepNum) + "-" + node_id + "-" + type + ".npy")
                sectorData = []
                if useLabelsAsSrcs == True:
                    for i in range(labelsNum):
                        leftMargin = -(batch_size - 1) / batch_size * math.pi + i * math.pi / (batch_size / 2)
                        rightMargin = -(batch_size - 3) / batch_size * math.pi + i * math.pi / (batch_size / 2)
                        currentSectorData = list(
                            filter(lambda item: item['angle'] > leftMargin and item['angle'] < rightMargin,
                                   df.iloc))

                        if len(currentSectorData) != 0:
                            currentSectorData = np.mean(currentSectorData, axis=0)[:-1]
                            currentSectorData = normalize(currentSectorData)
                            sectorData.append(currentSectorData)
                        #     curScaleData = scaleStd[i]
                        #     curmin = curScaleData[0]
                        #     curmax = curScaleData[1]
                        #     currentSectorData = np.mean(currentSectorData, axis=0)[:-1]
                        #     dataList = [item for item in currentSectorData]
                        #     dataedited = 0
                        #     for i in range(len(dataList)):
                        #         if dataList[i] < curmin:
                        #             dataList[i] = curmin
                        #             dataedited = dataedited + 1
                        #         if dataList[i] > curmax:
                        #             dataList[i] = curmax
                        #             dataedited = dataedited + 1
                        #     print("data edited: ", dataedited, " ", len(dataList))
                        #     currentSectorData = normalize_1(dataList, curmin, curmax)
                        #     # currentSectorData = currentSectorData ** 3
                        #     sectorData.append(currentSectorData)
                else:
                    for i in range(8):
                        leftMargin = -7 / 8 * math.pi + i * math.pi / 4
                        rightMargin = -5 / 8 * math.pi + i * math.pi / 4
                        currentSectorData = list(
                            filter(lambda item: item['angle'] > leftMargin and item['angle'] < rightMargin,
                                   df.iloc))
                        if len(currentSectorData) != 0:
                            currentSectorData = np.mean(currentSectorData, axis=0)[:-1]
                            currentSectorData = normalize(currentSectorData)
                            sectorData.append(currentSectorData)
                        # if len(currentSectorData) != 0:
                        #     curScaleData = scaleStd[i]
                        #     curmin = curScaleData[0]
                        #     curmax = curScaleData[1]
                        #     currentSectorData = np.mean(currentSectorData, axis=0)[:-1]
                        #     dataList = [item for item in currentSectorData]
                        #     dataedited = 0
                        #     for i in range(len(dataList)):
                        #         if dataList[i] < curmin:
                        #             dataList[i] = curmin
                        #             dataedited = dataedited + 1
                        #         if dataList[i] > curmax:
                        #             dataList[i] = curmax
                        #             dataedited = dataedited + 1
                        #     print("data edited: ", dataedited, " ", len(dataList))
                        #     currentSectorData = normalize_1(dataList, curmin, curmax)
                        #     sectorData.append(currentSectorData)
                if data_index == -1:
                    for i in range(batch_size):   # 这里数据要改成活的
                        resultData.append({
                            "value": np.array(sectorData).swapaxes(0, 1)[i].tolist(), # (8,)
                            "label": labels.tolist()[i],
                            "index": indices[i]
                        })
                else:
                    resultData.append({
                        "value": np.array(sectorData).swapaxes(0, 1)[data_index].tolist(),
                        "label": labels.tolist()[data_index],
                        "index": indices[data_index]
                    })
        elif mode == "heatmap":
            jsonPath = SUMMARY_DIR + os.sep + graph_name + os.sep + "indices" + os.sep + str(epochNum) + ".json"
            with open(jsonPath, 'r', encoding='utf-8') as fp:  # 拿到数据编号
                indices = json.load(fp)
                indices = indices[(step - 1) * batch_size: step * batch_size]  # 找到对应的数据编号，需要调用data_runner.py中的函数

                [resdata, labels] = data_runner.get_tensor_from_training(indices, node_name=node_id, data_type=type,
                                                                         ckpt_file=ckpt_file_path)
                resultData = get_tensor_heatmap_service_realtime(resdata, data_index)
        return HttpResponse(json.dumps({
            "message": "success",
            "data": resultData
        }), content_type="application/json")
    return HttpResponse(json.dumps({
        "message": "method undefined",
        "data": None
    }), content_type="application/json")


def get_tensor_evolution(request):
    if request.method == 'GET':
        graph_name = request.GET.get('graph_name', default='resnet')
        node_id = request.GET.get('node_id', default='layer3.f.conv1')
        step = int(request.GET.get('step', default='1'))
        data_index = int(request.GET.get('data_index', default='-1'))  # 默认是整个step
        type = request.GET.get('type', default='activation')

def get_cluster_data(request):
    if request.method == 'GET':
        graph_name = request.GET.get('graph_name', default='lenet')
        node_id = request.GET.get('node_id')
        current_step = int(request.GET.get('start_step', default='1'))
        type = request.GET.get('type', default='activation')

        data_pca_tsne = get_cluster_data_service(graph_name, node_id, current_step, type)

        return HttpResponse(json.dumps({
            "message": "success",
            "data": data_pca_tsne.tolist()
        }), content_type="application/json")
    return HttpResponse(json.dumps({
        "message": "method undefined",
        "data": None
    }), content_type="application/json")


def get_node_line(request):
    if request.method == 'GET':
        graph_name = request.GET.get('graph_name', default='lenet')
        node_id = request.GET.get('node_id')
        start_step = int(request.GET.get('start_step', default='1'))
        end_step = int(request.GET.get('end_step', default='10'))  # 开区间
        type = request.GET.get('type', default='activation')

        if end_step - start_step > 20:
            return HttpResponse(json.dumps({
                "message": "do not support such large steps",
                "data": None
            }), content_type="application/json")

        try:
            result = get_node_line_service(graph_name, node_id, start_step, end_step, type)
        except FileNotFoundError:
            return HttpResponse(json.dumps({
                "message": "failure",
                "data": ""
            }), content_type="application/json")
        return HttpResponse(json.dumps({
            "message": "success",
            "data": result
        }), content_type="application/json")
    return HttpResponse(json.dumps({
        "message": "method undefined",
        "data": None
    }), content_type="application/json")


def get_tensor_heatmap(request):
    if request.method == 'GET':
        graph_name = request.GET.get('graph_name', default='lenet')
        node_id = request.GET.get('node_id')
        step = int(request.GET.get('step', default='1'))
        data_index = int(request.GET.get('data_index', default='1'))
        type = request.GET.get('type', default='activation')

        result = get_tensor_heatmap_service(step, node_id, data_index, type)

        return HttpResponse(json.dumps({
            "message": "success",
            "data": result
        }), content_type="application/json")
    return HttpResponse(json.dumps({
        "message": "method undefined",
        "data": None
    }), content_type="application/json")

def emit_action(request):
    if request.method != 'GET':
        return HttpResponse(json.dumps({
            "message": "method undefined",
            "data": None
        }), content_type="application/json")
    global max_step
    global is_training
    global DB_MAX_STEP
    global db_file
    action = request.GET.get('action', default='reset_training')
    if action == "reset_training":
        max_step = DB_MAX_STEP
        is_training = False
    elif action == "start_training":
        start_training()
    elif action == "stop_training":
        is_training = False
    elif action == 'set_normal_data':
        db_file = DB_FILES['normal']
        dp = DataHelper(db_file)
        DB_MAX_STEP = int(dp.get_metadata('max_step'))
        dp.close()
        del dp
        max_step = DB_MAX_STEP
        is_training = False
    elif action == 'set_params_error_data':
        db_file = DB_FILES['param_error']
        dp = DataHelper(db_file)
        DB_MAX_STEP = int(dp.get_metadata('max_step'))
        dp.close()
        del dp
        max_step = DB_MAX_STEP
        is_training = False
    elif action == 'set_lr_error_data':
        db_file = DB_FILES['lr_error']
        dp = DataHelper(db_file)
        DB_MAX_STEP = int(dp.get_metadata('max_step'))
        dp.close()
        del dp
        max_step = DB_MAX_STEP
        is_training = False
    elif action == 'set_with_activation_data':
        db_file = DB_FILES['with_activation']
        dp = DataHelper(db_file)
        DB_MAX_STEP = int(dp.get_metadata('max_step'))
        dp.close()
        del dp
        max_step = DB_MAX_STEP
        is_training = False
    else:
        return HttpResponse(json.dumps({
            "message": "action undefined",
            "data": None
        }), content_type="application/json")
    return HttpResponse(json.dumps({
        "message": "success",
        "data": None
    }), content_type="application/json")
