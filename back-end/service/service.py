import numpy as np
import math
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE

def get_node_data():
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
    res_tensors = np.array(
        [np.sum(tensor1, axis=1).tolist(), np.sum(tensor2, axis=1).tolist(), np.sum(tensor3, axis=1).tolist(),
         np.sum(tensor4, axis=1).tolist(), np.sum(tensor5, axis=1).tolist()])

    # flat处理
    flattenTensors=res_tensors.reshape(len(res_tensors), len(tensor1), -1)

    return flattenTensors

def get_node_line_service(graph_name, node_id, start_step, end_step, type):
    if end_step - start_step > 20:
        return HttpResponse(json.dumps({
            "message": "do not support such large steps",
            "data": None
        }), content_type="application/json")

    # res_tensors = get_node_data()
    flattenTensors = get_node_data()
    
    # ToLineData
    totalSteps = len(flattenTensors) # 共选中了多少steps
    ticksBetweenSteps = len(flattenTensors[0]) # 每两个step之间的ticks数量
    lineNumber = len(flattenTensors[0][0]) # 折线数量

    dataArrToShow=[]

    for line in range(0, lineNumber):
        dataArrToShow.append([])

    minValue=1000000.0
    maxValue=-1000000000
    for step in range(0, totalSteps):
        for tick in range(0, ticksBetweenSteps):
            for line in range(0, lineNumber):
                value = flattenTensors[step][tick][line]
                if value > maxValue:
                    maxValue = value
                if value < minValue:
                    minValue = value
                dataArrToShow[line].append(value) # 第一维四舍五入取整
    Line = np.array(dataArrToShow)

    rate = 0.05
    result = blue_noise_sampling(0.05, Line)
    return result

def get_cluster_data_service(graph_name, node_id, current_step, type):
    flattenTensors = get_node_data()
    # Tsne降维 并返回结果。
    currentStep = 0
    originalData = flattenTensors[currentStep]

    data_pca = PCA(n_components=min(50, len(originalData))).fit_transform(originalData)  ## 先进行pca
    data_pca_tsne = TSNE(n_components=2).fit_transform(data_pca)
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
    samplingLineNum = 20 if samplingLineNum > 20 else samplingLineNum
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