import sys
from django.shortcuts import render
import json
import numpy as np
import time
from django.http import HttpResponse
import sqlite3
import os
from graph.data_access.loaders.data_loader import DataLoader
from graph.data_access.common.enums import PluginNameEnum
from graph.data_access.proto_files import anf_ir_pb2
from google.protobuf import json_format
from threading import Timer
from dao.data_helper import DataHelper
from dao.node_mapping import alex_node_map
import random

db_file = 'data/alexnet-parameter-outlier-sigma-1.db'
SUMMARY_DIR = os.getenv("SUMMARY_DIR")

dp = DataHelper(db_file)
DB_MAX_STEP = int(dp.get_metadata('max_step'))
dp.close()
del dp

max_step = DB_MAX_STEP
is_training = False


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


def getMiddleResult(request):
    # print(request.data)
    readJson = json.loads(request.body.decode('utf-8'))
    # print(readJson)
    step_from = readJson["STEP_FROM"]
    step_to = readJson["STEP_TO"]
    nodeids = readJson["NODE_ARRAY"]

    conn = sqlite3.connect(SUMMARY_DIR + '/test.db')
    c = conn.cursor()
    cursor = c.execute("SELECT * from LAYER_TABLE WHERE STEP >= " + str(step_from) + " AND STEP <= " + str(step_to))
    result = []
    nodeidDic = set()
    for item in nodeids:
        nodeidDic.add(item)

    # print(nodeidDic)

    for row in cursor:
        if (row[3] in nodeidDic):
            result.append({"STEP": row[1], "NODE_ID": row[2], "NODE_NAME": row[3], "ACTIVATION_MIN": row[4],
                           "ACTIVATION_MAX": row[5], "ACTIVATION_MEAN": row[6]})

    return HttpResponse(json.dumps(result), content_type="application/json")


def getLoss(request):
    conn = sqlite3.connect(SUMMARY_DIR + '/test.db')
    c = conn.cursor()

    cursor = c.execute("SELECT * from LOSS_TABLE")
    result = []
    for row in cursor:
        result.append({"STEP": row[1], "TRAIN_LOSS": row[2], "TRAIN_ACCURACY": row[3], "TEST_LOSS": row[4],
                       "TEST_ACCURACY": row[5]})

    return HttpResponse(json.dumps(result), content_type="application/json")


def getPb(request):
    file_read = open(SUMMARY_DIR + '/model.pbtxt', "r+")
    return HttpResponse(file_read, content_type="application/octet-stream")


def get_graph(request):
    data_loader = None
    if SUMMARY_DIR:
        data_loader = DataLoader(SUMMARY_DIR)
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
        data_helper = DataHelper(db_file)
        graph_name = request.GET.get('graph_name', default='lenet')
        start_step = int(request.GET.get('start_step', default='1'))
        end_step = int(request.GET.get('end_step', default='10'))
        return HttpResponse(json.dumps({
            "message": "success",
            "data": data_helper.get_model_scalars(start_step, end_step)
        }), content_type="application/json")
        data_helper.close()
        res = []
        last_value = [random.random(), random.random(), random.random(), random.random(), 0.1]
        for i in range(start_step, end_step):
            for j in range(len(last_value)):
                if j == 4:
                    last_value[j] = last_value[j] * 0.98
                    continue
                if j == 0 or j == 1:
                    last_value[j] = last_value[j] + (random.random() - 0.7) / (5 / last_value[j])
                    if last_value[j] < 0:
                        last_value[j] = 0.01
                    continue
                if j == 2 or j == 3:
                    last_value[j] = last_value[j] + (random.random() - 0.3) / (10 * last_value[j])
                    if last_value[j] > 1:
                        last_value[j] = 0.96
                    continue

            res.append({
                "step": i,
                "train_loss": last_value[0],
                "test_loss": last_value[1],
                "train_accuracy": last_value[2],
                "test_accuracy": last_value[3],
                "learning_rate": last_value[4],
            })
        return HttpResponse(json.dumps({
            "message": "success",
            "data": res
        }), content_type="application/json")
    return HttpResponse(json.dumps({
        "message": "method undefined",
        "data": None
    }), content_type="application/json")


def get_metadata(request):
    if request.method == 'GET':
        data_helper = DataHelper(db_file)
        graph_name = request.GET.get('graph_name', default='lenet')
        db_max_step = int(data_helper.get_metadata('max_step'))
        db_is_training = data_helper.get_metadata('is_training') == 'true'
        data_helper.close()
        return HttpResponse(json.dumps({
            "message": "success",
            "data": {
                "max_step": max_step,
                "is_training": is_training
            }
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
        return HttpResponse(json.dumps({
            "message": "success",
            "data": res
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
    action = request.GET.get('action', default='reset_training')
    if action == "reset_training":
        max_step = DB_MAX_STEP
        is_training = False
    elif action == "start_training":
        start_training()
    elif action == "stop_training":
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
