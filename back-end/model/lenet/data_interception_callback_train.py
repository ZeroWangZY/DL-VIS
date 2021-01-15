import csv
import tables
import numpy as np
from mindspore.ops.primitive import Primitive
from mindspore.train.callback import Callback
from scipy.cluster.hierarchy import dendrogram, linkage, fcluster, leaves_list
from scipy.cluster._hierarchy import nn_chain
import scipy.spatial.distance as distance

cluster_ids_last = None
all_data = []

vmin = None
vmax = None
y = None

step = -1


weight_dict = {           # 后端计数器与前端的映射
    "conv1_Conv2d": "conv1.weight",
    "conv2_Conv2d": "conv2.weight",
    "9": "fc1.weight",
    "12": "fc2.weight",
    "15": "fc3.weight"
}

back_target_dict = {
    1: "conv1_Conv2d",
    4: "conv2_Conv2d",
    10: "9",
    13: "12",
    16: "15"
}

class DataInterceptionCallbackTrain(Callback):
    def __init__(self, node_name, data_type):
        super(DataInterceptionCallbackTrain, self).__init__()
        self.result = []
        self.labels = []
        self.origin_call_method = None
        self.node_name = node_name
        self.data_type = data_type

    def begin(self, run_context):
        global count
        global countList
        count = 0

    def step_begin(self, run_context):
        global count
        global step, y, cluster_ids_last, all_data
        step = step + 1
        print("step begin")
        count = 0
        self.result.append(0)
        self.labels.append(run_context.original_args()['train_dataset_element'][1].asnumpy())
        self.origin_call_method = getattr(Primitive, '__call__')

        def new_call_method(self_, *args):
            global count
            global countList
            global step, y, cluster_ids_last, all_data
            output = self.origin_call_method(self_, *args)

            count = count + 1
            # print("算子：", self_.name)
            # print("算子ID：", count)
            should_save = False

            if count in [1, 4, 10, 13, 16]:
                should_save = True
            if should_save and back_target_dict[count] == self.node_name:
                # output.asnumpy为32 * 120的激活值数据，在这里进行降维，写入h5文件。
                print(output.asnumpy().shape)

                slice = output.asnumpy()
                labelslice = self.labels[0]
                result_data = slice.T

                cluster_nums = 20

                if y is None:
                    y = distance.pdist(result_data, "cosine")
                else:
                    y = (0.9 * y + distance.pdist(result_data, "cosine")) / 1.9
                # Z = linkage(result_data, method='weighted', metric='cosine')
                Z = nn_chain(y, 120, 6)  # 6->weighted 120->neurons
                cluster_ids = fcluster(Z, cluster_nums, criterion="maxclust")
                if cluster_ids_last is not None:
                    # ----------     hierarchical clustering       ---------- #
                    # ----------   两次的分类结果对齐   ---------- #
                    raw_list = []
                    for j in range(cluster_nums):
                        t = [i for i, x in enumerate(cluster_ids_last) if x == (j + 1)]
                        raw_list.append(t)

                    now_list = []
                    for j in range(cluster_nums):
                        t = [i for i, x in enumerate(cluster_ids) if x == (j + 1)]
                        now_list.append(t)

                    indices = -np.ones(cluster_nums, dtype=np.int)
                    to_be_solved = list(range(cluster_nums))
                    # 计算similarity
                    sim = np.zeros((cluster_nums, cluster_nums))
                    for i in range(cluster_nums):
                        for j in range(cluster_nums):
                            intersection = list(set(now_list[i]).intersection(set(raw_list[j])))
                            union = list(set(now_list[i]).union(set(raw_list[j])))
                            sim[i][j] = len(intersection) / len(union)
                            if sim[i][j] == 1:
                                indices[j] = i
                                to_be_solved.remove(i)

                    for index in to_be_solved:
                        indices_list = np.argsort(-sim[index])
                        for item in indices_list:
                            if indices[item] == -1:
                                indices[item] = index
                                break

                    cluster_ids = np.ones(120, dtype=int)
                    now_list = np.array(now_list)[indices].tolist()
                    for i in range(cluster_nums):
                        for item in now_list[i]:
                            cluster_ids[item] = i + 1

                    # ----------   两次的分类结果对齐   ---------- #
                result_data_aggre = []
                for i in range(cluster_nums):  # 10个cluster
                    cur = result_data[cluster_ids == (i + 1)]
                    result_data_aggre.append(np.mean(cur, axis=0))
                result_data = np.vstack(result_data_aggre)
                # hierarchy重排
                Z = linkage(result_data.T, method="weighted", metric="cosine")
                result_data = result_data.T[leaves_list(Z)].T
                labelslice = labelslice[leaves_list(Z)]
                # 每个step都需要存数据，追加方式存入
                filename = "datanpy/lenet_data.h5"
                filenamelabels = "datanpy/lenet_labels.h5"
                if step == 0:
                    f = tables.open_file(filename, mode="w")
                    atom = tables.Float64Atom()
                    array_c = f.create_earray(f.root, 'data', atom, (0, 20))
                    array_c.append(result_data.T)
                    f.close()
                    f1 = tables.open_file(filenamelabels, mode="w")
                    array_c = f1.create_earray(f1.root, 'data', atom, (0, 32))
                    array_c.append(labelslice.reshape(1, 32))
                    f1.close()
                else:
                    f = tables.open_file(filename, mode='a')
                    f.root.data.append(result_data.T)
                    f.close()
                    f1 = tables.open_file(filenamelabels, mode='a')
                    f1.root.data.append(labelslice.reshape(1, 32))
                    f1.close()

                # 将结果保存在result中
                if self.result[-1] == 0:
                    self.result[-1] = output.asnumpy()
                else:
                    self.result[-1] = np.vstack((self.result[-1], output.asnumpy()))
            return output

        setattr(Primitive, '__call__', new_call_method)

    def step_end(self, run_context):
        global count
        setattr(Primitive, '__call__', self.origin_call_method)
        count = 0


    def end(self, run_context):
        pass

