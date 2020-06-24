// 这里开始从pb(即RawGraph)构建数据结构
import { RawGraph, RawNode } from "../stage1/raw-graph.ms.type";
import {
  AbstractNode,
  OperationNode,
  GroupNode,
  DataNode,
  DataType,
  ProcessedGraph,
  OperationNodeImp,
  GroupNodeImp,
  DataNodeImp,
  ProcessedGraphImp,
  SCOPE_DELIM,
  NodeType,
} from "./processed-graph";

const MODULE_PATTERN = new Set(['gradients', 'train_network', 'Momentum', 'Default', 'Gradients'])

function buildBasicNode(rNode: RawNode, rGraph: RawGraph): OperationNode | DataNode {
  const displayedName = rNode.opType + rNode.name

  //DONE: Operation节点
  let attributes = [];
  if (rNode.attribute) { // 如果attribute存在
    for (let attr of rNode.attribute) { // 遍历数组
      let attribute = { name: "", value: "" };
      attribute.name = attr.name;
      attribute.value = JSON.stringify(attr.value);
      attributes.push(attribute)
    }
  }
  return new OperationNodeImp({
    attributes,
    id: rNode.name,
    op: rNode.opType,
    opts: { displayedName },
  });
}

function buildModule(hGraph: ProcessedGraph): void {
  const nodeMap = hGraph.nodeMap;
  for (const modulePattern of MODULE_PATTERN) {
    if (nodeMap[modulePattern]) {
      let module = nodeMap[modulePattern]
      hGraph.modules.add(module.id)
      module = module as GroupNode
      module.isModule = true
      let queue = [module.id]
      while (queue.length > 0) {
        const nodeId = queue.shift()
        const theNode = nodeMap[nodeId]
        theNode.belongModule = module.id
        if (theNode.type === NodeType.GROUP || theNode.type === NodeType.LAYER) {
          queue = queue.concat(Array.from((theNode as GroupNode).children))
        }
      }
    }
  }
  for (const edge of hGraph.rawEdges) {
    const sourceNode = nodeMap[edge.source]
    const targetNode = nodeMap[edge.target]
    if (sourceNode.belongModule !== null && targetNode.belongModule !== null && sourceNode.belongModule !== targetNode.belongModule) {
      sourceNode.outModuleConnection.add(targetNode.id)
      targetNode.inModuleConnection.add(sourceNode.id)
      let moduleEdge = hGraph.moduleEdges.find((moduleEdge => moduleEdge.source === sourceNode.belongModule && moduleEdge.target === targetNode.belongModule))
      if (moduleEdge === undefined) {
        hGraph.moduleEdges.push({
          source: sourceNode.belongModule,
          target: targetNode.belongModule,
          width: 1
        })
      } else {
        moduleEdge.width += 1
      }
    }
  }
}

function _buildGraph(rGraph: RawGraph): ProcessedGraph {
  const inputInfo: Set<string> = new Set(); // 包含所有的input信息
  const pGraph = new ProcessedGraphImp();
  const rNodes = rGraph.node;
  const { nodeMap } = pGraph

  let parameterNodeName: Set<string> = new Set();
  let constValNodeName: Set<string> = new Set();
  for (let parameter of rGraph.parameters)
    parameterNodeName.add(parameter.name)
  for (let constVal of rGraph.constVals)
    constValNodeName.add(constVal.key)

  for (let rNode of rNodes) { // 遍历每个node
    let pNode = buildBasicNode(rNode, rGraph);
    nodeMap[pNode.id] = pNode;

    // 将scope中的-全部换成_, 防止在DagreLayout中冲突
    rNode.scope = rNode.scope.replace(/-/g, '_')

    // 构建边 同时构建parameters和constVals节点
    const inputs = rNode.input || [];
    for (let input of inputs) {
      if (input.name === "9220") continue; // 有张图的9220节点没有，这里做了一个专门处理。
      let newId = input.name;
      let parameterNode = parameterNodeName.has(input.name)
      let constValNode = constValNodeName.has(input.name)

      if (parameterNode) {
        const displayedName = input.name
        let dataType = DataType.PARAMETER;
        const dataNode = new DataNodeImp({
          id: newId,
          dataType: dataType,
          opts: { displayedName },
        });
        const auxiliary = (nodeMap[rNode.name] as OperationNode).auxiliary
        auxiliary.add(dataNode.id) // 附属节点
        nodeMap[dataNode.id] = dataNode;
      }

      if (constValNode) {
        const displayedName = input.name;
        const dataNode = new DataNodeImp({
          id: input.name,
          dataType: DataType.CONST,
          opts: { displayedName },
        });
        const auxiliary = (nodeMap[rNode.name] as OperationNode).auxiliary
        auxiliary.add(dataNode.id) // 附属节点
        nodeMap[dataNode.id] = dataNode;
      }

      if (!parameterNode && !constValNode) {
        pNode.inputNode.add(newId);
        inputInfo.add(input.name + "_Input2_" + rNode.name)
        pGraph.rawEdges.push({
          source: newId,
          target: rNode.name
        })
      }
    }
  }


  buildHierarchy(rGraph, pGraph) // 构建层次
  buildModule(pGraph)

  processGroupNode(pGraph, inputInfo);  // 建立层次结束后，重新处理GroupNode，增加属性
  processOperationNode(rGraph, pGraph);  // 建立层次结束后，重新处理OperationNode，增加属性
  processDataNode(rGraph, pGraph); // 建立层次结束后，重新处理DataNode，增加属性

  processedOutputNode(pGraph);
  return pGraph;
}

// 对所有的DataNode中的 dataType为PARAMETER和CONST的节点，进行处理
function processDataNode(rGraph: RawGraph, pGraph: ProcessedGraph) {
  const nodeMap = pGraph.nodeMap;
  const { parameters, constVals } = rGraph;//数组每一维的结构： {name: "xxx", type: {dataType: "DT_TENSOR", tensorType: "xxxxxx"}};
  const attributesMap = new Map();

  for (const parameter of parameters) {
    if (parameter.type) {
      attributesMap.set(parameter.name, { name: parameter.type.dataType, value: JSON.stringify(parameter.type.tensorType) });
    }
  }

  for (const constVal of constVals) {
    if (constVal.value) {
      attributesMap.set(constVal.key, { name: "value", value: JSON.stringify(constVal.value) });
    }
  }

  for (const node of Object.values(nodeMap)) {
    if (node.type === NodeType.DATA) {
      (node as DataNode).typeAttibute = attributesMap.get(node.id) ? attributesMap.get(node.id) : null
    }
  }
}

function processOperationNode(rGraph: RawGraph, pGraph: ProcessedGraph) {
  const nodeMap = pGraph.nodeMap;

  for (let node of rGraph.node) { // 对于所有的operationNode
    let nodeName = node.name;
    if (node.input === undefined) continue;

    for (let input of node.input) {
      let inputId = input.name;
      if ((nodeMap[inputId] instanceof DataNodeImp) &&
        (nodeMap[inputId] as DataNodeImp).dataType === DataType.CONST)
        continue;
    }
  }
}

function processGroupNode(pGraph: ProcessedGraph, inputInfo: Set<string>) {
  const nodeMap = pGraph.nodeMap;
  let nodeIds = Object.keys(nodeMap);
  let leafOperationNodeCount = 0;
  let childOperationNode = new Set(); // 内部的
  for (let nodeId of nodeIds) {
    let node = nodeMap[nodeId];
    if (!(node instanceof GroupNodeImp)) continue;

    leafOperationNodeCount = 0;
    childOperationNode.clear()
    countNodeNumInSubGraph(nodeId);
    (node as GroupNode).leafOperationNodeCount = leafOperationNodeCount

    let operationChildrenCount = (node as GroupNode).children.size;; // children个数
    (node as GroupNode).children.forEach((id) => { // 统计children节点个数
      let subNode = nodeMap[id];
      if (subNode.type === NodeType.DATA && ((subNode as DataNode).dataType === DataType.CONST || (subNode as DataNode).dataType === DataType.OUTPUT)) { // 附属节点
        --operationChildrenCount; // 减去附属节点
        return;
      }
    });
    (node as GroupNode).operationChildrenCount = operationChildrenCount;

    // 处理group节点的输入输出
    (node as GroupNode).inputNode = new Set();
    (node as GroupNode).outputNode = new Set();
    inputInfo.forEach((info) => {
      let [source, target] = (info as string).split("_Input2_");
      if (childOperationNode.has(source) && !childOperationNode.has(target)) { // 则为外部输入节点
        (node as GroupNode).outputNode.add(nodeMap[target].id);
      }
      if (childOperationNode.has(target) && !childOperationNode.has(source)) { // 则为外部输出节点
        (node as GroupNode).inputNode.add(nodeMap[source].id);
      }
    })
  }

  function countNodeNumInSubGraph(id) { // 深度遍历nodeMap[id]的子节点。记录所有叶子节点OperationNode的个数
    let subNode = nodeMap[id];
    if (subNode.type === NodeType.OPERTATION ||
      (subNode.type === NodeType.DATA && (subNode as DataNode).dataType !== DataType.CONST && (subNode as DataNode).dataType !== DataType.OUTPUT)) {
      leafOperationNodeCount++;
      return;
    } else if (subNode.type === NodeType.GROUP) {
      (subNode as GroupNode).children.forEach((id1) => {
        if (nodeMap[id1] instanceof OperationNodeImp && nodeMap[id1].parent !== subNode.parent) { // 严格子节点
          childOperationNode.add(id1);
        }
        countNodeNumInSubGraph(id1)
      })
    }
    return;
  }
}

function processedOutputNode(pGraph: ProcessedGraph) {
  const { nodeMap } = pGraph
  for (const node of Object.values(nodeMap)) {
    if (node.type !== NodeType.OPERTATION) continue
    for (const input of node.inputNode) {
      const inputNode = nodeMap[input]
      inputNode.outputNode.add(node.id)
    }
  }
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

export function buildHierarchy(rGraph: RawGraph, pGraph: ProcessedGraph): ProcessedGraph {
  const nodeMap = pGraph.nodeMap;
  const nodes = rGraph.node;

  for (let node of nodes) { // 根据scope建立层次
    // if (outputNodeName.has(node.name)) continue; // output节点在循环外面单独处理

    let prevNode: AbstractNode = pGraph.rootNode;
    const parentScope = genParentScope(node.scope);
    const inputs = node.input;

    for (let i = 0, len = parentScope.length; i <= len; i += 1) {
      if (i === len) { // 处理node节点和输入节点
        let curNodeName = node.name;
        let curNode = nodeMap[curNodeName];
        prevNode.children.add(curNodeName);
        curNode.parent = prevNode.id;
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

  return pGraph
}

function preProcessing(rGraph: RawGraph) {
  // 1、去除node为空的节点
  let nodes = rGraph.node;

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
  preProcessing(rGraph);

  let pGraph = _buildGraph(rGraph);

  return pGraph
  // return wrapTaskWithTimeLogger(_buildMsGraph)(rGraph);
}

