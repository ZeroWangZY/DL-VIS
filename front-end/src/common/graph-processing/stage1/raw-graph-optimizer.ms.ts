import { RawNode, RawGraph } from "./raw-graph.ms.type";
import { RawGraphOptimizer } from "./raw-graph-optimizer.tf";

const conceptualGraphOptimization = (newRawGraph: RawGraph): void => {
  // mobilenetv2 只保留输出为 RawNode.name === "211"节点 的子图
  // alexnets 只保留输出为RawNode.name === "23"节点 的子图
  console.log("我要看的位置：")
  console.log(newRawGraph.node)
  let nodes = newRawGraph.node
  let newNodes: RawNode[] = [];

  // 查询scope中有backbone的位置
  for (let idx = 0, len = nodes.length; idx < len; idx++) {
    if (nodes[idx].scope.indexOf("backbone") !== -1
    && nodes[idx].scope.indexOf("network") !== -1
    && nodes[idx].scope.indexOf("Default") !== -1) {
      newNodes.push(nodes[idx]);
    }
  }

  newRawGraph.node = newNodes;
  console.log("修改后的整个图")
  console.log(newRawGraph)

  // if (newRawGraph.name === "455_454_403_352_construct") {
  //   // alexnets
  //   pruneByOutput(newRawGraph, "23");
  // }
  // else if (newRawGraph.name === "7217_7215_7213_5169_2585_1_construct")
  //   // mobilenetv2
  //   pruneByOutput(newRawGraph, "211");

};

const pruneByOutput = (newRawGraph: RawGraph, outputNodeName: string) => {
  let NameIndexMap: Map<string, number> = new Map(); // key:节点name  value: 在RawGraph.node数组中的下标
  let nodes = newRawGraph.node;
  for (let i = 0, len = nodes.length; i < len; i++) {
    NameIndexMap.set(nodes[i].name, i);
  }

  let indexOfNodesToBeKept = [];
  findIndexOfNodesToBeKept(
    nodes,
    indexOfNodesToBeKept,
    NameIndexMap,
    outputNodeName
  );

  let newNodes: RawNode[] = [];
  for (let idx of indexOfNodesToBeKept) {
    newNodes.push(nodes[idx]);
  }
  newRawGraph.node = newNodes;
};

const findIndexOfNodesToBeKept = (
  nodes: RawNode[],
  indexOfNodesToBeKept: number[],
  NameIndexMap: Map<string, number>,
  outputNodeName: string
) => {
  // nodes[NameIndexMap]
  let nodeIndex = NameIndexMap.get(outputNodeName);
  indexOfNodesToBeKept.push(nodeIndex);

  let node = nodes[nodeIndex];
  let inputs = node.input;
  if (inputs === undefined || inputs === null) return;

  for (let input of inputs) {
    let inputNodeName = input.name;
    if (NameIndexMap.has(inputNodeName)) {
      findIndexOfNodesToBeKept(
        nodes,
        indexOfNodesToBeKept,
        NameIndexMap,
        inputNodeName
      );
      NameIndexMap.delete(inputNodeName); // 防止重复
    }
  }
};

// 发现ms图中有大量tuple_getitem算子，且意义不大，此方法用于去除这些算子
function pruneTupleGetItem(rawGraph: RawGraph): void {
  const targetsMap: { [source: string]: RawNode[] } = _buildTargetsMap(
    rawGraph
  );
  const { node } = rawGraph;
  for (let i = 0; i < node.length; i++) {
    if (node[i].opType === "tuple_getitem") {
      for (const target of targetsMap[node[i].name]) {
        // 删除tuple_getitem算子的target节点关于tuple_getitem的input
        for (let j = 0; j < target.input.length; j++) {
          const inputOfTarget = target.input[j];
          if (inputOfTarget.name === node[i].name) {
            target.input.splice(j, 1);
            j--;
          }
        }
        // 在tuple_getitem算子的target节点中增加tuple_getitem算子input
        for (const input of node[i].input) {
          target.input.push(input);
        }
      }
      node.splice(i, 1);
      i--;
    }
  }
}

function _buildTargetsMap(rawGraph: RawGraph): { [id: string]: any } {
  const resDict: { [source: string]: RawNode[] } = {};
  const { node } = rawGraph;
  for (const n of node) {
    if (!n.input) continue;
    for (const source of n.input) {
      if (resDict[source.name]) {
        resDict[source.name].push(n);
      } else {
        resDict[source.name] = [n];
      }
    }
  }
  return resDict;
}

export default class msRawGraphOptimizer {
  msRawGraphOptimizers = [];

  constructor() {
    this.msRawGraphOptimizers = [
      conceptualGraphOptimization,
      // pruneTupleGetItem,
    ];
  }

  optimize(rawGraph: RawGraph) {
    console.log(rawGraph)
    this.msRawGraphOptimizers.forEach((optimizer) => {
      optimizer(rawGraph);
    });
  }
}
