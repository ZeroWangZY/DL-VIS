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
import math

from service.service import get_node_line_service, get_cluster_data_service, get_model_scalars_service

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
        data_helper = DataHelper(db_file)
        graph_name = request.GET.get('graph_name', default='lenet')
        start_step = int(request.GET.get('start_step', default='1'))
        end_step = int(request.GET.get('end_step', default='10'))

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

def get_node_tensors(request):
    if request.method == 'GET':
        graph_name = request.GET.get('graph_name', default='lenet')
        node_id = request.GET.get('node_id')
        start_step = int(request.GET.get('start_step', default='1'))
        end_step = int(request.GET.get('end_step', default='10'))
        type = request.GET.get('type', default='activation')
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
        end_step = int(request.GET.get('end_step', default='10')) # 开区间
        type = request.GET.get('type', default='activation')
        result = get_node_line_service(graph_name, node_id, start_step, end_step, type)

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
