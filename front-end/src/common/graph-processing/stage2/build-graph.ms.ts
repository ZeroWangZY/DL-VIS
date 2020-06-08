// 这里开始从pb(即RawGraph)构建数据结构
import { RawGraph, RawNode } from "../stage1/raw-graph.ms.type";
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
  NodeType,
} from "./processed-graph";
// import { wrapTaskWithTimeLogger } from "../utils";

const MODULE_PATTERN = new Set(['gradients', 'train_network', 'Momentum', 'Default', 'Gradients'])
// import { wrapTaskWithTimeLogger } from "../utils";

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

function _buildGraph(rGraph: RawGraph, inputInfo: Set<string>): ProcessedGraph {
  const pGraph = new ProcessedGraphImp();
  const rNodes = rGraph.node;

  let parameterNodeName: Set<string> = new Set();
  let constValNodeName: Set<string> = new Set();
  for (let parameter of rGraph.parameters)
    parameterNodeName.add(parameter.name)
  for (let constVal of rGraph.constVals)
    constValNodeName.add(constVal.key)

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
      let parameterNode = parameterNodeName.has(input.name) ? true : false;
      let constValNode = constValNodeName.has(input.name) ? true : false;

      if (!parameterNode && !constValNode)
        inputInfo.add(input.name + "_Input2_" + rNode.name)

      if (!parameterNode && !constValNode)
        inputInfo.add(input.name + "_Input2_" + rNode.name)

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

  let inputNodeName = [...Array.from(parameterNodeName) as string[], ...Array.from(constValNodeName) as string[]];
  buildHierarchy(rGraph, pGraph, inputNodeName) // 构建层次
  buildModule(pGraph)

  // console.log(rGraph);
  // console.log(pGraph);
  processGroupNode(pGraph, inputInfo);  // 建立层次结束后，重新处理GroupNode，增加属性
  processOperationNode(rGraph, pGraph);  // 建立层次结束后，重新处理OperationNode，增加属性
  processDataNode(rGraph, pGraph, parameterNodeName, constValNodeName);

  return pGraph;
}

// 对所有的DataNode中的 dataType为PARAMETER和CONST的节点，进行处理
function processDataNode(rGraph: RawGraph, pGraph: ProcessedGraph, parameterNodeName: Set<string>, constValNodeName: Set<string>) {
  const nodeMap = pGraph.nodeMap;
  const parameters = rGraph.parameters;//数组每一维的结构： {name: "xxx", type: {dataType: "DT_TENSOR", tensorType: "xxxxxx"}};
  const parametersMap = new Map();
  for (let parameter of parameters) {
    let attribute = { name: "", value: "" }; // attribute的结构{name: string;value: string;}
    if (parameter.type) {
      attribute.name = parameter.type.dataType;
      attribute.value = JSON.stringify(parameter.type.tensorType);
    }
    parametersMap.set(parameter.name, attribute);
  }

  const newNodeNames = Object.keys(nodeMap);
  for (let newNodeName of newNodeNames) {
    let splitName = newNodeName.split("_Input2_");
    if (splitName.length !== 2) continue;

    if (parameterNodeName.has(splitName[0])) { // 处理nodeMap[newNodeName]
      // 比如：data_Input2_1; 
      (nodeMap[newNodeName] as DataNodeImp).outputNode.add(nodeMap[splitName[1]].displayedName); // 输出

      (nodeMap[newNodeName] as DataNodeImp).typeAttibute = parametersMap.get(splitName[0]); // parameter的type属性
    }
    else if (constValNodeName.has(splitName[0])) {
      // 比如：cst1_Input2_1; 
      (nodeMap[newNodeName] as DataNodeImp).outputNode.add(nodeMap[splitName[1]].displayedName); // 输出
    }
  }
}

function processOperationNode(rGraph: RawGraph, pGraph: ProcessedGraph) {
  const nodeMap = pGraph.nodeMap;

  for (let node of rGraph.node) { // 对于所有的operationNode
    let nodeName = node.name;
    if (node.input === undefined) continue;

    for (let input of node.input) {
      let inputNodeName = input.name;
      if (nodeMap[inputNodeName + "_Input2_" + nodeName] instanceof DataNodeImp
        && (nodeMap[inputNodeName + "_Input2_" + nodeName] as DataNodeImp).dataType === DataType.CONST) {
        // 附属节点，不加入pGraph的inputNode
        continue;
      }
      // 不是附属节点，则将inputNodeName加入pGraph的inputNode中
      if (nodeMap[nodeName] instanceof OperationNodeImp) {
        let displayedName = inputNodeName;
        if (nodeMap[inputNodeName] instanceof OperationNodeImp)
          displayedName = (nodeMap[inputNodeName] as OperationNodeImp).displayedName;
        (nodeMap[nodeName] as OperationNodeImp).inputNode.add(displayedName);
      }

      // 同时处理一下output
      if (nodeMap[inputNodeName] instanceof OperationNodeImp) {
        let displayedName = nodeMap[nodeName].displayedName;
        (nodeMap[inputNodeName] as OperationNodeImp).outputNode.add(displayedName);
      }
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
        (node as GroupNode).outputNode.add(nodeMap[target].displayedName);
      }
      if (childOperationNode.has(target) && !childOperationNode.has(source)) { // 则为外部输出节点
        (node as GroupNode).inputNode.add(nodeMap[source].displayedName);
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

  let inputInfo: Set<string> = new Set(); // 包含所有的input信息
  let pGraph = _buildGraph(rGraph, inputInfo);

  return pGraph
  // return wrapTaskWithTimeLogger(_buildMsGraph)(rGraph);
}

