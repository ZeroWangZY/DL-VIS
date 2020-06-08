import { RawNode, RawGraph } from "./raw-graph.ms.type"

const conceptualGraphOptimization = (newRawGraph: RawGraph): void => {
  // mobilenetv2 只保留输出为 RawNode.name === "211"节点 的子图
  // alexnets 只保留输出为RawNode.name === "23"节点 的子图
  if (newRawGraph.name === "455_454_403_352_construct") // alexnets
    pruneByOutput(newRawGraph, "23");
  else if (newRawGraph.name === "7217_7215_7213_5169_2585_1_construct") //mobilenetv2
    pruneByOutput(newRawGraph, "211");
}

const pruneByOutput = (newRawGraph: RawGraph, outputNodeName: string) => {
  let NameIndexMap: Map<string, number> = new Map(); // key:节点name  value: 在RawGraph.node数组中的下标
  let nodes = newRawGraph.node;
  for (let i = 0, len = nodes.length; i < len; i++) {
    NameIndexMap.set(nodes[i].name, i);
  }

  let indexOfNodesToBeKept = [];
  findIndexOfNodesToBeKept(nodes, indexOfNodesToBeKept, NameIndexMap, outputNodeName);

  let newNodes: RawNode[] = [];
  for (let idx of indexOfNodesToBeKept) {
    newNodes.push(nodes[idx]);
  }
  newRawGraph.node = newNodes;
}

const findIndexOfNodesToBeKept = (nodes: RawNode[], indexOfNodesToBeKept: number[], NameIndexMap: Map<string, number>, outputNodeName: string) => {
  // nodes[NameIndexMap]
  let nodeIndex = NameIndexMap.get(outputNodeName);
  indexOfNodesToBeKept.push(nodeIndex);

  let node = nodes[nodeIndex];
  let inputs = node.input;
  if (inputs === undefined || inputs === null) return;

  for (let input of inputs) {
    let inputNodeName = input.name;
    if (NameIndexMap.has(inputNodeName)) {
      findIndexOfNodesToBeKept(nodes, indexOfNodesToBeKept, NameIndexMap, inputNodeName);
      NameIndexMap.delete(inputNodeName); // 防止重复
    }
  }
}

export default class msRawGraphOptimizer {
  msRawGraphOptimizers = [];

  constructor() {
    this.msRawGraphOptimizers = [
      conceptualGraphOptimization,
    ];
  }

  optimize(rawGraph: RawGraph) {
    this.msRawGraphOptimizers.forEach((optimizer) => {
      optimizer(rawGraph);
    });
  }
}