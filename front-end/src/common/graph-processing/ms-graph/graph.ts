// 这里开始从pb(即RawGraph)构建数据结构
import { RawGraph, RawNode } from "./parser";
import {
  NodeDef,
  AbstractNode,
  LayerType,
  OperationNode,
  GroupNode,
  LayerNode,
  DataNode,
  DataType,
  ProcessedGraph,
  OperationNodeImp,
  GroupNodeImp,
  DataNodeImp,
  LayerNodeImp,
  ProcessedGraphImp,
  SCOPE_DELIM,
  END_PATTERNS,
  VARIABLE_PATTERNS,
  LAYER_PATTERNS,
} from "../../../types/processed-graph";
// import { wrapTaskWithTimeLogger } from "../utils";

let emptyNodeName = []

function buildBasicNode(rNode: RawNode, rGraph: RawGraph): OperationNode | DataNode {
  const outputs = rGraph.outputs;
  // const splitedScope = rNode.scope.split(SCOPE_DELIM)
  // const displayedName = splitedScope[splitedScope.length - 1]
  const displayedName = rNode.opType + rNode.name

  for (let outputsNode of outputs) {  // output节点
    if (outputsNode.name === rNode.name) {
      // console.log(rNode.name)
      return new DataNodeImp({
        id: rNode.name,
        dataType: DataType.OUTPUT,
        opts: { displayedName },
      });
    }
  }

  //DONE: Operation节点
  return new OperationNodeImp({
    id: rNode.name,
    op: rNode.opType,
    auxiliary: new Set([]),
    opts: { displayedName },
  });
}

// interface InputNodeMap {
//   key: string;
//   value: Set<String>;
// }

function _buildGraph(rGraph: RawGraph): ProcessedGraph {
  const pGraph = new ProcessedGraphImp();
  const rNodes = rGraph.node;

  let parameterNodeName = [], constValNodeName = [];
  for (let parameter of rGraph.parameters)
    parameterNodeName.push(parameter.name)
  for (let constVal of rGraph.constVals)
    constValNodeName.push(constVal.key)

  for (let rNode of rNodes) { // 遍历每个node
    let pNode = buildBasicNode(rNode, rGraph);
    pGraph.nodeMap[pNode.id] = pNode;

    // 将scope中的-全部换成_, 防止在DagreLayout中冲突
    rNode.scope = rNode.scope.replace(/-/g, '_')

    // 构建边 同时构建parameters和constVals节点
    const inputs = rNode.input || [];
    for (let input of inputs) {
      if (input.name === "9220") continue;
      let newId = input.name;
      let parameterNode = parameterNodeName.indexOf(input.name) >= 0 ? true : false;
      let constValNode = constValNodeName.indexOf(input.name) >= 0 ? true : false;

      if (parameterNode || constValNode) {
        const displayedName = input.name
        newId = input.name + "_Input2_" + rNode.name; // 新的Id
        // if(pGraph.nodeMap[rNode.name] instanceof OperationNode)
        let auxiliary = (pGraph.nodeMap[rNode.name] as OperationNode).auxiliary
        if (constValNode)
          auxiliary.add(newId) // 附属节点
        let dataType = parameterNode ? DataType.PARAMETER : DataType.CONST;
        const pNode = new DataNodeImp({
          id: newId,
          dataType: dataType,
          opts: { displayedName },
        });
        pGraph.nodeMap[pNode.id] = pNode;
      }
      if (!constValNode)
        pGraph.rawEdges.push({
          source: newId,
          target: rNode.name
        })
    }
  }
  console.log(rGraph)

  // //input节点
  // for (let parameter of rGraph.parameters) {
  //   const displayedName = parameter.name
  //   const pNode = new DataNodeImp({
  //     id: parameter.name,
  //     dataType: DataType.INPUT,
  //     opts: { displayedName },
  //   });
  //   pGraph.nodeMap[pNode.id] = pNode;
  // }

  // //variable节点
  // for (let constVal of rGraph.constVals) {
  //   const displayedName = constVal.key
  //   const pNode = new DataNodeImp({
  //     id: constVal.key,
  //     dataType: DataType.VARIABLE,
  //     opts: { displayedName },
  //   })
  //   pGraph.nodeMap[pNode.id] = pNode;
  // }

  let inputNodeName = [...parameterNodeName, ...constValNodeName];
  buildHierarchy(rGraph, pGraph, inputNodeName) // 构建层次

  return pGraph;
}

function genParentScope(name: string): string[] {
  const parentScope: string[] = [];
  if (!name) {
    return parentScope;
  }
  const splitedScope = name.split(SCOPE_DELIM);
  parentScope.push(splitedScope[0]);
  for (let i = 1, len = splitedScope.length; i < len; i += 1) {
    const prevScope = parentScope[i - 1];
    const curScope = splitedScope[i];
    parentScope.push(`${prevScope}${SCOPE_DELIM}${curScope}`);
  }
  return parentScope;
}

function buildAbstractNode(name: string): AbstractNode {
  let splitedScope = name.split(SCOPE_DELIM);
  const tgtName = splitedScope[splitedScope.length - 1];

  //TODO: 分出哪些是LayerNode哪些是GroupNode
  // const [layerType, displayedName] = testLayerType(tgtName);
  const opts = { displayedName: tgtName };
  return new GroupNodeImp({
    id: name,
    opts,
  });
}

export function buildHierarchy(rGraph: RawGraph, pGraph: ProcessedGraph, inputNodeName: string[]): ProcessedGraph {
  const nodeMap = pGraph.nodeMap;
  const nodes = rGraph.node;

  for (let node of nodes) { // 根据scope建立层次
    let prevNode: AbstractNode = pGraph.rootNode;
    const parentScope = genParentScope(node.scope);
    const inputs = node.input;

    for (let i = 0, len = parentScope.length; i <= len; i += 1) {
      if (i === len) { // 处理node节点和输入节点
        let curNodeName = node.name;
        let curNode = nodeMap[curNodeName];
        prevNode.children.add(curNodeName);
        curNode.parent = prevNode.id;

        if (inputs !== undefined)
          for (let input of inputs) { // 只会在i===len时调用循环，所以复杂度不是O(n^3) 对于它的输入建立层次
            if (input.name === "9220") {
              console.log(node)
              continue;
            }
            if (inputNodeName.indexOf(input.name) >= 0)
              curNodeName = input.name + "_Input2_" + node.name
            curNode = nodeMap[curNodeName];
            prevNode.children.add(curNode.id);
            curNode.parent = prevNode.id;
          }

        break;
      }

      let curNodeName = parentScope[i]; // 构建虚拟节点层次
      const curNode = !nodeMap[curNodeName] ? buildAbstractNode(curNodeName) : nodeMap[curNodeName];
      nodeMap[curNodeName] = curNode;
      prevNode.children.add(curNodeName);
      curNode.parent = prevNode.id;
      prevNode = curNode as AbstractNode;
    }
  }

  const outputs = rGraph.outputs; // 单独处理输出节点
  for (let outputsNode of outputs) {  // output节点
    let name = outputsNode.name
    if (nodeMap[name] instanceof DataNodeImp) {
      let prevNode: AbstractNode = pGraph.rootNode;
      const curNode = nodeMap[name]
      nodeMap[name] = curNode;
      prevNode.children.add(name);
      curNode.parent = prevNode.id;
      prevNode = curNode as AbstractNode;
    }
  }

  return pGraph
}

function preProcessing(rGraph: RawGraph) {
  // 1、去除node为空的节点
  let nodes = rGraph.node;
  let nodeNumber = nodes.length;
  let numberToBeDeletedFromTail = 0

  let indexToBeDeleted = [];
  for (let i = 0, len = nodes.length; i < len; i++) {
    if (Object.keys(nodes[i]).length === 0) {
      indexToBeDeleted.push(i);
      continue;
    }
  }

  for (let idx of indexToBeDeleted) {
    nodes.splice(idx, 1)
  }
}

export function buildMsGraph(rGraph: RawGraph): ProcessedGraph {
  preProcessing(rGraph)
  let pGraph = _buildGraph(rGraph)

  return pGraph
  // return wrapTaskWithTimeLogger(_buildMsGraph)(rGraph);
}

