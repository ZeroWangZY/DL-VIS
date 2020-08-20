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

DB_FILES = {
    'normal': 'data/alex-normal-8000.db',
    'param_error': 'data/alexnet-parameter-outlier-sigma-1.db',
    'lr_error': 'data/alexnet-lr-0.00001.db'
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

# 蓝噪声采样
def blueNoiseSmapling(rate, originalData):    
    lineNum = len(originalData); # 折线数量
    stepNum = len(originalData[0]); # 折线中包含多少个数据点
    
    samplingLineNum = round(rate * lineNum); # 要采样的折线图数量
    samplingLineNum = 20 if samplingLineNum > 20 else samplingLineNum
    segmentGroupNum = 5;
    samplingSegmentNum = samplingLineNum * (stepNum - 1); # 采样的数据中一共包含多少个segment
    segmentNumberInEachGroup = math.floor(samplingSegmentNum / segmentGroupNum);
    
    gap = math.pi / segmentGroupNum # 将pi分为多少份
    section = [];
    for i in range(0, segmentGroupNum+1):
        section.append(i * gap)
    
    segmentGroupInfo = [];#每条折线图的每个segment属于哪个group
    # 比如segmentGroupInfo[i][j]表示第i条折线图的第j个segment属于哪个group
    for lineIndex in range(0,lineNum): # for lineIndex in range(0,lineNum):
        lineData = originalData[lineIndex]
        
        segmentAngleGroup = []
        for i in range(0,stepNum-1):
            angle = math.atan(lineData[i+1] - lineData[i])
            if angle<0 :
                angle = angle + math.pi
            for j in range(0,segmentGroupNum):
                if section[j] <= angle and angle <= section[j + 1]:
                    segmentAngleGroup.append(j)
        segmentGroupInfo.append(segmentAngleGroup)
    #print(segmentGroupInfo)
    
    # 以下是根据分类结果，计算fill rate并且采样
    samplingResult = [];
    selectedLineIndex = set(); # 被选中折线的index
    
    segmentCountOfEachGroup = [0 for n in range(segmentGroupNum)]; # 统计选中的所有折线图中,每个group的总数
    
    for i in range(1, samplingLineNum):
        maxFillScore = -9999999;
        index = -1;
        newSegmentCountOfEachGroup = [];
        for lineIndex in range(lineNum):
            if lineIndex in selectedLineIndex: 
                continue;

            segmentGroupInfoOfThisLine = segmentGroupInfo[lineIndex];
            # 然后统计如果选中这条折线，每个group的fill rate
            # 根据这条线的segmment group信息，更新segmentCountOfEachGroup

            tmpSegmentCountOfEachGroup = segmentCountOfEachGroup[0:]; # 拷贝一份
            for j in range(len(segmentGroupInfoOfThisLine)):
                group = segmentGroupInfoOfThisLine[j]
                tmpSegmentCountOfEachGroup[group] += 1
            # 根据tmpSegmentCountOfEachGroup计算fill rate
            score = 0;
            for j in range(len(tmpSegmentCountOfEachGroup)):
                count = tmpSegmentCountOfEachGroup[j]
                score += count / segmentNumberInEachGroup

            if score > maxFillScore:
                newSegmentCountOfEachGroup = tmpSegmentCountOfEachGroup[0:];
                maxFillScore = score;
                index = lineIndex;
        segmentCountOfEachGroup = newSegmentCountOfEachGroup
        selectedLineIndex.add(index); # 暂时被选中
        samplingResult.append(originalData[index].tolist());
    return samplingResult;

def get_node_lineData_blueNoiceSampling(request):
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
        
        filename1 = 'data/output_tensors/26-conv2-activation.npy'
        filename2 = 'data/output_tensors/27-conv2-activation.npy'
        filename3 = 'data/output_tensors/28-conv2-activation.npy'
        filename4 = 'data/output_tensors/29-conv2-activation.npy'
        filename5 = 'data/output_tensors/30-conv2-activation.npy'
        tensor1 = np.load(filename1)
        tensor2 = np.load(filename2)
        tensor3 = np.load(filename3)
        tensor4 = np.load(filename4)
        tensor5 = np.load(filename5)
        res_tensors = np.array([np.sum(tensor1, axis=1).tolist(), np.sum(tensor2, axis=1).tolist(),np.sum(tensor3, axis=1).tolist(),np.sum(tensor4, axis=1).tolist(),np.sum(tensor5, axis=1).tolist()])
        # flat处理
        faltenTensors = res_tensors.reshape(len(res_tensors),len(tensor1),-1)
        
        # ToLineData
        totalSteps = len(faltenTensors); # 共选中了多少steps
        ticksBetweenSteps = len(faltenTensors[0]); # 每两个step之间的ticks数量
        lineNumber = len(faltenTensors[0][0]); # 折线数量

        dataArrToShow=[]

        for line in range(0, lineNumber):
            dataArrToShow.append([])

        minValue=1000000.0
        maxValue=-1000000000
        for step in range(0, totalSteps):
            for tick in range(0, ticksBetweenSteps):
                for line in range(0, lineNumber):
                    value = faltenTensors[step][tick][line]
                    if value > maxValue:
                        maxValue = value
                    if value < minValue:
                        minValue = value
                    dataArrToShow[line].append(value); # 第一维四舍五入取整
        Line = np.array(dataArrToShow)

        rate = 0.05
        result = blueNoiseSmapling(0.05, Line)

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
    else:
        return HttpResponse(json.dumps({
            "message": "action undefined",
            "data": None
        }), content_type="application/json")
    return HttpResponse(json.dumps({
        "message": "success",
        "data": None
    }), content_type="application/json")
