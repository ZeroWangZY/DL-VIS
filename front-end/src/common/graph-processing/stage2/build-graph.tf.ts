// 这里开始从pb(即RawGraph)构建数据结构
import { RawGraph, RawNode } from "../stage1/raw-graph.tf.type";
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
  NodeId,
  ROOT_SCOPE
} from "./processed-graph";
import { wrapTaskWithTimeLogger } from "../utils";

const MODULE_EDGE_NUMBER_THRESHOLD = 20; // 判断module的门槛
// 测试用例
const MODULE_PATTERN = new Set(['gradients', 'train_network', 'Momentum', 
'train_network/resblock0_0', 'train_network/resblock0_1'
]);

function testInputOutput(name: string): [number, string] {
  if (!name) {
    return [-1, name];
  }
  const scope = name.split(SCOPE_DELIM);
  const tgt = scope[scope.length - 1];
  const { INPUT, OUTPUT } = END_PATTERNS;
  if (INPUT.test(tgt)) {
    return [DataType.INPUT, tgt.replace(INPUT, "")];
  }
  if (OUTPUT.test(tgt)) {
    return [DataType.OUTPUT, tgt.replace(OUTPUT, "")];
  }
  return [-1, tgt];
}


function testVariable(op: string) {
  // 所有都重命名过了，只有Variable
  return VARIABLE_PATTERNS.test(op);
}


function buildBasicNode(rNode: RawNode): OperationNode | DataNode {
  const { name, op } = rNode;
  const [dataType, displayedName] = testInputOutput(name);
  const opts = { displayedName };
  if (dataType >= 0) {
    return new DataNodeImp({
      id: name,
      dataType,
      opts,
    });
  }
  if (testVariable(op)) {
    return new DataNodeImp({
      id: name,
      dataType: DataType.VARIABLE,
      opts,
    });
  }
  return new OperationNodeImp({
    id: name,
    op,
    opts,
  });
}

function genUniqueName(name: string): string {
  const splitedScope = name.split(SCOPE_DELIM);
  return `${name}${SCOPE_DELIM}(${splitedScope[splitedScope.length - 1]})`;
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


function genNameMap(oldNames: string[]): { [oldName: string]: string } {
  oldNames = (oldNames || []).sort();
  let nameMap: { [oldName: string]: string } = Object.create(null);

  for (let i = 0, len = oldNames.length; i < len - 1; i += 1) {
    const oldName = oldNames[i];
    for (let j = i + 1; j < len; j += 1) {
      const nxName = oldNames[j];
      if (!nxName.startsWith(oldName)) {
        break;
      }
      if (nxName.slice(0, oldName.length + 1) === `${oldName}${SCOPE_DELIM}`) {
        nameMap[oldName] = genUniqueName(oldName);
        break;
      }
    }
  }
  return nameMap;
}


// 重命名name，使得每个名字唯一
function uniquifyRawGraph(rGraph: RawGraph) {
  const rNodes = rGraph.node;
  const oldNames = rNodes.map(d => d.name);
  const nameMap = genNameMap(oldNames);

  for (let rNode of rNodes) {
    const inputs = rNode.input || [];
    rNode.name = nameMap[rNode.name] || rNode.name;
    if (inputs.length) {
      rNode.input = inputs.map(d => nameMap[d] || d);
    }
  }
}


function _buildGraph(rGraph: RawGraph): ProcessedGraph {
  // TODO: versions先不管了
  uniquifyRawGraph(rGraph);
  const pGraph = new ProcessedGraphImp();
  const rNodes = rGraph.node;
  for (let rNode of rNodes) {
    const pNode = buildBasicNode(rNode);
    pGraph.nodeMap[pNode.id] = pNode;

    const inputs = rNode.input || [];
    for (let input of inputs) {
      pGraph.rawEdges.push({
        source: input,
        target: pNode.id
      });
    }
  }
  // return pGraph;
  // console.log(pGraph)
  let hGraph = buildHierarchy(pGraph);
  // console.log(hGraph)
  // logHierarchy(hGraph);
  buildModule(hGraph)
  return hGraph;
}

export function buildGraph(rGraph: RawGraph): Promise<ProcessedGraph> {
  return wrapTaskWithTimeLogger(_buildGraph)(rGraph);
}

// 对于同一层的group node，两两的id作为键
function addKeysToEdgeMap(edgeMap: Map<string, number>, groupNodeQueue: Array<NodeId>) {
  if (groupNodeQueue.length === 1) return;
  for (let i = 0; i < groupNodeQueue.length - 1; i++) {
    for (let j = i + 1; j < groupNodeQueue.length; j++) {
      const key = `${groupNodeQueue[i]}-${groupNodeQueue[j]}`;
      edgeMap.set(key, 0);// 值初始化为0
    }
  }
}

// 计算每两个不嵌套的group node之间的连线数量,按照threshold获取module id
function getModulesId(hGraph: ProcessedGraph): Set<NodeId> {
  const { nodeMap, rawEdges, rootNode } = hGraph;
  let edgeMap = new Map();

  // 先初始化edgeMap的所有键,对于同一层的每一对group node,把其id用"-"相连作为键一起作为键,暂时不分source和target
  // 维护两个队列，parent和children是相对的
  let groupNodeQueueParent = [], groupNodeQueueChildren = [];
  let groupNodeQueueParentTmp = [];
  groupNodeQueueParent = groupNodeQueueParent.concat(Array.from(rootNode.children));
  let flag = true; // 是否继续层次遍历添加key，如果遍历到的层节点全为叶节点，则停止遍历
  while (flag) {
    groupNodeQueueChildren= [];// 上一层的children是这一层的parent
    groupNodeQueueParentTmp = [];// 存储要填到到map中的节点
    while (groupNodeQueueParent.length) {
      const parent = groupNodeQueueParent.shift();
      const node = nodeMap[parent];
      if (node instanceof GroupNodeImp || node instanceof LayerNodeImp) {
        groupNodeQueueChildren = groupNodeQueueChildren.concat(Array.from(node.children));
        groupNodeQueueParentTmp.push(parent);
      }
    }
    // 如果还有children，说明要添加这一层的parent
    if (groupNodeQueueChildren.length) {
      addKeysToEdgeMap(edgeMap, groupNodeQueueParentTmp);
      groupNodeQueueParent = [...groupNodeQueueChildren];
    } else { //如果遍历到的这层节点已经没有叶节点 则停止遍历
      flag = false;
    }
  }
  
  // 遍历rawEdges，更新edgeMap的值
  rawEdges.forEach(({source, target}) => {
    let sourceNode = nodeMap[source], targetNode = nodeMap[target];
    let sourceParentArray = [], targetParentArray = [];

    while (sourceNode.parent !== ROOT_SCOPE) {
      sourceParentArray.push(sourceNode.parent);
      sourceNode = nodeMap[sourceNode.parent];
    }
    while (targetNode.parent !== ROOT_SCOPE) {
      targetParentArray.push(targetNode.parent);
      targetNode = nodeMap[targetNode.parent];
    }

    // 更新edgeMap的值
    for (let i = 0; i < sourceParentArray.length; i++) {
      for (let j = 0; j < targetParentArray.length; j++) {
        const source = sourceParentArray[i], target = targetParentArray[j];
        const key1 = `${source}-${target}`, key2 = `${target}-${source}`;
        if(edgeMap.has(key1)) {
          edgeMap.set(key1, edgeMap.get(key1) + 1);
        } else if (edgeMap.has(key2)) {
          edgeMap.set(key2, edgeMap.get(key2) + 1);
        }
      }
    }
  })
  
  // edgeMap按值从大到小排个序
  let edgeMapSortedArray = Array.from(edgeMap);
  edgeMapSortedArray.sort((a, b) => (b[1] - a[1]));

  // console.log(edgeMapSortedArray)
  // 根据threshold决定module
  let modulesId = new Set<NodeId>();
  for (let sortedItem of edgeMapSortedArray) {
    // 如果比threshold低，结束遍历
    if (sortedItem[1] < MODULE_EDGE_NUMBER_THRESHOLD) {
      break;
    }
    const module1 = sortedItem[0].split("-")[0] as NodeId, module2 = sortedItem[0].split("-")[1] as NodeId;
    // 如果不在同一个scope下，不添加
    if (nodeMap[module1].parent === nodeMap[module2].parent) {
      modulesId.add(module1);
      modulesId.add(module2);
    }
  }
  // console.log(modulesId)
  return modulesId;
}

function buildModule(hGraph: ProcessedGraph): void {
  const { nodeMap } = hGraph;
  
  const modulesId = getModulesId(hGraph);
  // 初始化图的modules和节点的isModule、belongModule、isNested属性
  for (const modulePattern of modulesId) {
  // for (const modulePattern of MODULE_PATTERN) { // 测试用例
    if (nodeMap[modulePattern]) {
      let module = nodeMap[modulePattern]
      hGraph.modules.add(module.id)
      module = module as GroupNode
      module.isModule = true
    }
  }
  // modulesId是按边数由大到小排序的，所以父module一定在子module前面,因此嵌套的子module赋值belongModule时会覆盖之前的
  hGraph.modules.forEach(_moduleId => {
    if (hGraph.modules.has(nodeMap[_moduleId].parent)) {
      const moduleNode = nodeMap[_moduleId] as GroupNode;
      moduleNode.parentModule = nodeMap[_moduleId].parent;
    }
    let queue = [_moduleId]
    while(queue.length){
      const nodeId = queue.shift()
      const theNode = nodeMap[nodeId]
      theNode.belongModule = _moduleId
      if (theNode instanceof GroupNodeImp || theNode instanceof LayerNodeImp){
        queue = queue.concat(Array.from(theNode.children))
      }
    }
  })
  
  // 初始化moduleEdges
  for(const edge of hGraph.rawEdges) {
    const sourceNode = nodeMap[edge.source];
    const targetNode = nodeMap[edge.target];
    const sourceBelongModule = sourceNode.belongModule, targetBelongModule = targetNode.belongModule;
    if (sourceBelongModule !== null
      && targetBelongModule !== null
      && sourceBelongModule !== targetBelongModule
      ) {
      // 跨模块
      if ((sourceBelongModule.split('/')[0] !== targetBelongModule.split('/')[0])) {
        if (!(nodeMap[targetBelongModule] as GroupNode).parentModule) {
          sourceNode.outModuleConnection.add(targetNode.id);
        }
        if (!(nodeMap[sourceBelongModule] as GroupNode).parentModule) {
          targetNode.inModuleConnection.add(sourceNode.id);
        }
      } else if(nodeMap[sourceBelongModule].parent === nodeMap[targetBelongModule].parent) {// 在同一个模块下的跨模块
        sourceNode.outModuleConnection.add(targetNode.id);
        targetNode.inModuleConnection.add(sourceNode.id);
      }
      
      // module edge的source和target一定是同级同scope的
      let sourceRootModule = sourceBelongModule, targetRootModule = targetBelongModule;
      if ((nodeMap[sourceBelongModule] as GroupNode).parentModule) {
        sourceRootModule = (nodeMap[sourceBelongModule] as GroupNode).parentModule;
      }
      if ((nodeMap[targetBelongModule] as GroupNode).parentModule) {
        targetRootModule = (nodeMap[targetBelongModule] as GroupNode).parentModule;
      }
      if (sourceRootModule !== targetRootModule) {
        let moduleEdge = hGraph.moduleEdges.find((moduleEdge => moduleEdge.source === sourceRootModule && moduleEdge.target === targetRootModule))
        if (moduleEdge === undefined) {
          hGraph.moduleEdges.push({
            source: sourceRootModule,
            target: targetRootModule,
            width:1
          })
        } else {
          moduleEdge.width += 1
        }
      } else if (nodeMap[sourceBelongModule].parent === nodeMap[targetBelongModule].parent) {
        let moduleEdge = hGraph.moduleEdges.find((moduleEdge => moduleEdge.source === sourceBelongModule && moduleEdge.target === targetBelongModule))
        if (moduleEdge === undefined) {
          hGraph.moduleEdges.push({
            source: sourceBelongModule,
            target: targetBelongModule,
            width:1
          })
        } else {
          moduleEdge.width += 1
        }
      }
    }
  }
  console.log(hGraph.moduleEdges, hGraph.modules)
}


export function buildHierarchy(pGraph: ProcessedGraph): ProcessedGraph {
  const nodeMap = pGraph.nodeMap;
  const names = Object.keys(nodeMap);

  for (let name of names) {
    let prevNode: AbstractNode = pGraph.rootNode;
    const parentScope = genParentScope(name);
    for (let i = 0, len = parentScope.length; i < len; i += 1) {
      const curNodeName = parentScope[i];
      const curNode = !nodeMap[curNodeName] ? buildAbstractNode(curNodeName) : nodeMap[curNodeName];
      nodeMap[curNodeName] = curNode;
      prevNode.children.add(curNodeName);
      curNode.parent = prevNode.id;
      prevNode = curNode as AbstractNode;
    }
  }
  return pGraph;
}


function testLayerType(name: string): [string, string] {
  for (let [key, pattern] of Object.entries(LAYER_PATTERNS)) {
    if (pattern.test(name)) {
      return [key, name.replace(pattern, "")];
    }
  }
  return ["", name];
}


function buildAbstractNode(name: string): AbstractNode {
  let splitedScope = name.split(SCOPE_DELIM);
  const tgtName = splitedScope[splitedScope.length - 1];
  const [layerType, displayedName] = testLayerType(tgtName);
  const opts = { displayedName };
  if (layerType) {
    return new LayerNodeImp({
      id: name,
      layerType: layerType as LayerType,
      opts,
    });
  }
  return new GroupNodeImp({
    id: name,
    opts,
  });
}

function logHierarchy(hGraph: ProcessedGraph) {
  function _buildLog(root: any): any {
    const log = {
      name: root.id,
      type: root.type,
      children: [],
    }
    if (Array.isArray(root.children)) {
      for (let child of root.children) {
        (log.children as any).push(_buildLog(hGraph.nodeMap[child]));
      }
    }
    return log;
  }

  function _Set2JSON(key: any, value: any) {
    if (typeof value === 'object' && value instanceof Set) {
      return Array.from(value);
    }
    return value;
  }

  let root = hGraph.rootNode;
  console.log(JSON.stringify(hGraph, _Set2JSON, 2));
}