import os
import sys
sys.path.append("../..")
from graph.data_access.common.enums import PluginNameEnum
from graph.data_access.loaders.data_loader import DataLoader

SUMMARY_DIR = "/home/vaglab/wzy/project/resnet50"
graph_name = "resnet-202011091230"

data_loader = DataLoader(SUMMARY_DIR + os.sep + graph_name)
data_loader.load()

events_data = data_loader.get_events_data()
graph_tag = events_data.list_tags_by_plugin(PluginNameEnum.GRAPH)[0]
graph_data = events_data.tensors(graph_tag)[0].value

f = open("mobilenetv2.pbtxt", "w", encoding="utf-8")

# 先建一个map
nodeMap = {}
nodes = graph_data["node"]
for i in range(len(nodes)):   # 后面取node方便一点
    nodeMap[nodes[i]["name"]] = nodes[i]

for item in nodes:
    nodeName = item["scope"] + "/" + item["opType"] + "_" + item["name"]
    opType = item["opType"]
    inputs = []
    for inputItem in item["input"]:
        try:
            inputNode = nodeMap[inputItem["name"]]
            inputNodeName = inputNode["scope"] + "/" + inputNode["opType"] + "_" + inputNode["name"]
            inputs.append(inputNodeName)
        except Exception:
            # 生成一个node
            inputNodeName = item["scope"] + "/" + inputItem["name"]
            f.write("node {\n")
            f.write("  name: \"" + inputNodeName + "\"\n")
            f.write("  op: \"" + "Const" + "\"\n")
            f.write("}\n")
            inputs.append(inputNodeName)

    f.write("node {\n")
    f.write("  name: \"" + nodeName + "\"\n")
    f.write("  op: \"" + opType + "\"\n")
    for inputItem in inputs:
        f.write("  input: \"" + inputItem + "\"\n")
    f.write("}\n")
