import numpy as np
import math
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
import sys
sys.path.append("..")
from dao.node_mapping import alex_node_map
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')
from io import BytesIO
import base64
import time


def get_tensor_heatmap_service(step, node_id, data_index, type):
    res_tensors = get_node_data(step, step + 1, node_id, type)
    if alex_node_map[node_id].find("fc") >= 0:
        tensor = res_tensors[0][data_index]
        fclength = tensor.shape[0]
        h = math.ceil(fclength ** 0.5)
        w = math.ceil(fclength / h)
        if fclength % h != 0:
            maxScore = np.max(tensor)          # 最大值对应的颜色最浅
            for i in range(h - fclength % h):
                tensor.append(maxScore)
        tensor = tensor.reshape(h, w)
    else:
        tensor = res_tensors[0][data_index]
    fig = plt.figure()
    plt.imshow(tensor, cmap='hot', interpolation='nearest')
    sio = BytesIO()
    fig.savefig(sio, format='png', bbox_inches='tight', pad_inches=0.0)
    sio.seek(0)
    data = base64.b64encode(sio.read())
    src = 'data:image/png;base64,' + data.decode('utf-8')
    plt.close()

    return src

def get_node_data(start_step, end_step, node_id, type):
    # 最多15个step，否则报错
    # if (end_step - start_step > 15):
        # return ERROR
    tensorList = []
    for i in range(start_step, end_step):
        filename = 'data/output_tensors/'+ str(i) + "-" + alex_node_map[node_id] + "-" + type + ".npy"
        tensorList.append(np.load(filename))

    if alex_node_map[node_id].find("fc") >= 0:
        # print("FC层")
        res_tensors = np.array(
            [tensor for tensor in tensorList]
        )
        # print(res_tensors.shape)
    else:
        # print("conv层")
        res_tensors = np.array(
            [np.sum(tensor, axis=1).tolist() for tensor in tensorList]
        )
        # print(res_tensors.shape)

    return res_tensors


def get_node_line_service(graph_name, node_id, start_step, end_step, type):
    res_tensors = get_node_data(start_step, end_step, node_id, type)
    # flat处理
    flattenTensors = res_tensors.reshape(len(res_tensors), len(res_tensors[0]), -1)

    reshapeTensors = flattenTensors.transpose(2, 0, 1)
    line = reshapeTensors.reshape(reshapeTensors.shape[0], -1)

    rate = 0.05
    result = blue_noise_sampling(0.05, line)
    return result

def get_cluster_data_service(graph_name, node_id, current_step, type):
    res_tensors = get_node_data(current_step, current_step + 1, node_id, type)
    # flat处理
    flattenTensors = res_tensors.reshape(len(res_tensors), len(res_tensors[0]), -1)    # Tsne降维 并返回结果。
    currentStep = 0
    originalData = flattenTensors[currentStep]

    data_pca = PCA(n_components=min(50, len(originalData))).fit_transform(originalData)  ## 先进行pca
    data_pca_tsne = TSNE(n_components=2, perplexity=3).fit_transform(data_pca)
    maxV = np.max(data_pca_tsne)
    meanV = np.mean(data_pca_tsne)
    minV = np.min(data_pca_tsne)
    for i in range(len(data_pca_tsne)):
        for j in range(len(data_pca_tsne[0])):
            data_pca_tsne[i][j] = (data_pca_tsne[i][j] - meanV) / (maxV-minV)
    return data_pca_tsne

def get_model_scalars_service(graph_name, start_step, end_step):
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

# 蓝噪声采样
def blue_noise_sampling(rate, originalData):    
    lineNum = len(originalData) # 折线数量
    stepNum = len(originalData[0]) # 折线中包含多少个数据点
    
    samplingLineNum = round(rate * lineNum) # 要采样的折线图数量
    if samplingLineNum > 200:
        samplingLineNum = 200;
    elif samplingLineNum < 100:
        if lineNum > 100:
            samplingLineNum = 100;
        else:
            samplingLineNum = lineNum;

    # samplingLineNum = 100 # 50 if samplingLineNum > 50 else samplingLineNum
    segmentGroupNum = 5
    samplingSegmentNum = samplingLineNum * (stepNum - 1) # 采样的数据中一共包含多少个segment
    segmentNumberInEachGroup = math.floor(samplingSegmentNum / segmentGroupNum)
    
    gap = math.pi / segmentGroupNum # 将pi分为多少份
    section = []
    for i in range(0, segmentGroupNum+1):
        section.append(i * gap)

    segmentGroupInfo = []#每条折线图的每个segment属于哪个group
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
    samplingResult = []
    selectedLineIndex = set() # 被选中折线的index
    
    segmentCountOfEachGroup = [0 for n in range(segmentGroupNum)] # 统计选中的所有折线图中,每个group的总数
    
    for i in range(0, samplingLineNum):
        maxFillScore = -9999999
        index = -1
        newSegmentCountOfEachGroup = []
        for lineIndex in range(lineNum):
            if lineIndex in selectedLineIndex: 
                continue

            segmentGroupInfoOfThisLine = segmentGroupInfo[lineIndex]
            # 然后统计如果选中这条折线，每个group的fill rate
            # 根据这条线的segmment group信息，更新segmentCountOfEachGroup

            tmpSegmentCountOfEachGroup = segmentCountOfEachGroup[0:] # 拷贝一份
            for j in range(len(segmentGroupInfoOfThisLine)):
                group = segmentGroupInfoOfThisLine[j]
                tmpSegmentCountOfEachGroup[group] += 1
            # 根据tmpSegmentCountOfEachGroup计算fill rate
            score = 0
            for j in range(len(tmpSegmentCountOfEachGroup)):
                count = tmpSegmentCountOfEachGroup[j]
                score += count / segmentNumberInEachGroup

            if score > maxFillScore:
                newSegmentCountOfEachGroup = tmpSegmentCountOfEachGroup[0:]
                maxFillScore = score
                index = lineIndex
        segmentCountOfEachGroup = newSegmentCountOfEachGroup
        selectedLineIndex.add(index) # 暂时被选中
        samplingResult.append(originalData[index].tolist())
    return samplingResult