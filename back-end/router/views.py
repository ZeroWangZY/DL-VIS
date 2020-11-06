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
from logs.resnet.data_runner import DataRunner
from logs.resnet.get_neuron_order import get_neuron_order

data_runner = DataRunner()

from service.service import get_node_line_service, get_cluster_data_service, get_model_scalars_service, \
    get_tensor_heatmap_service

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



def normalize(series):
    a = min(series)
    b = max(series)
    return (series - a) / (b - a)

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

        if mode == "mock":
            data_helper = DataHelper(db_file)
            db_max_step = int(data_helper.get_metadata('max_step'))
        elif mode == "realtime":
            data_helper = DataHelper(SUMMARY_DIR + os.sep + graph_name + os.sep + "data.db")
            db_max_step = int(data_helper.get_realtime_metadata('max_step'))
            
        db_is_training = data_helper.get_metadata('is_training') == 'true'

        data_helper.close()
        if mode == "mock":
            return HttpResponse(json.dumps({
                "message": "success",
                "data": {
                    "max_step": max_step,
                    "is_training": is_training
                }
            }), content_type="application/json")
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
            for node_id in node_ids:
                if type == 'activation':
                    res[node_id] = data_helper.get_activation_scalars(node_id, start_step, end_step)
                elif type == 'gradient':
                    res[node_id] = data_helper.get_gradient_scalars(node_id, start_step, end_step)
                elif type == 'weight':
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


def get_node_tensors(request):  # 鼠标点击step时，返回雷达图数据
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
        mode = request.GET.get('mode', default='radial')
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
        ckpt_file_name = ckptList[difList.index(min(difList))]
        ckpt_file_path = SUMMARY_DIR + os.sep + graph_name + os.sep + "weights" + os.sep + ckpt_file_name
        
        # if checkpointstep < 10:
        #     # 要判断一下maxstep，决定是否可以计算
        #     data_helper = DataHelper(SUMMARY_DIR + os.sep + graph_name + os.sep + "data.db")
        #     db_max_step = data_helper.get_realtime_metadata('max_step')
        #     if db_max_step < 10:
        #         return HttpResponse(json.dumps({
        #             "message": "Too few training steps",
        #         }), content_type="application/json")
        #     else:
        #         checkpointstep = 10
        if not os.path.exists(SUMMARY_DIR + graph_name + os.sep + "order" + os.sep + "-" + str(epochNum) + "_" + str(stepNum) + "-" + node_id + "-" + type + ".npy"):
            get_neuron_order(epochNum, stepNum, node_id, data_runner, type, graph_name)


        resultData = []
        if mode == "radial":
            jsonPath = SUMMARY_DIR + os.sep + graph_name + os.sep + "indices" + os.sep + "1.json"
            with open(jsonPath, 'r', encoding='utf-8') as fp:  # 拿到数据编号
                indices = json.load(fp)
                indices = indices[(step - 1) * 32 : step * 32]   # 找到对应的数据编号，需要调用data_runner.py中的函数

                [resdata, labels] = data_runner.get_tensor_from_training(indices, node_name=node_id, data_type=type, ckpt_file=ckpt_file_path)
                resdata = np.mean(resdata, axis=(2, 3)).swapaxes(0, 1)
                df = pd.DataFrame(resdata)
                df['angle'] = np.load(SUMMARY_DIR + graph_name + os.sep + "order" + os.sep + "-" + str(epochNum) + "_" + str(stepNum) + "-" + node_id + "-" + type + ".npy")

                sectorData = []
                for i in range(8):
                    leftMargin = -7 / 8 * math.pi + i * math.pi / 4
                    rightMargin = -5 / 8 * math.pi + i * math.pi / 4
                    currentSectorData = list(
                        filter(lambda item: item['angle'] > leftMargin and item['angle'] < rightMargin,
                               df.iloc))
                    currentSectorData = np.mean(currentSectorData, axis=0)[:-1]
                    currentSectorData = normalize(currentSectorData)
                    sectorData.append(currentSectorData)
                if data_index == -1:
                    for i in range(32):   # 这里数据要改成活的
                        resultData.append({
                            "value": np.array(sectorData).swapaxes(0, 1)[i].tolist(), # (8,)
                            "label": labels.asnumpy().tolist()[i],
                            "index": indices[i]
                        })
                else:
                    resultData.append({
                        "value": np.array(sectorData).swapaxes(0, 1)[data_index].tolist(),
                        "label": labels.asnumpy().tolist()[data_index],
                        "index": indices[data_index]
                    })
        return HttpResponse(json.dumps({
            "message": "success",
            "data": resultData
        }), content_type="application/json")
    return HttpResponse(json.dumps({
        "message": "method undefined",
        "data": None
    }), content_type="application/json")


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
