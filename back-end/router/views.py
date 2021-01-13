import sys

from django.shortcuts import render
import json
from django.http import HttpResponse
import os
from graph.data_access.loaders.data_loader import DataLoader
from graph.data_access.common.enums import PluginNameEnum
# from mindspore.train import anf_ir_pb2
from graph.data_access.proto_files import anf_ir_pb2
from google.protobuf import json_format
from threading import Timer
from dao.data_helper import DataHelper

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
