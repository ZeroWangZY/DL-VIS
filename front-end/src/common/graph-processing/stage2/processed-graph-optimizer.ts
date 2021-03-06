import { ProcessedGraph, GroupNode, NodeType, OperationNode, LayerNodeImp, LayerType, DataNode, NodeMap, ROOT_SCOPE, GroupNodeImp, NodeId, NodeDef } from "./processed-graph";

const aggreOptimization = (hGraph: ProcessedGraph): void => {//更改无意义边跨越节点的命名空间以简化视图
  //寻找
  //1:过滤出所有没有children的节点
  const noChildNodes = [];
  for (let key in hGraph.nodeMap) {
    if (!(hGraph.nodeMap[key] as GroupNode).children) {
      noChildNodes.push(hGraph.nodeMap[key]);
    }
  }

  //2:通过边找到上述每个节点相关的节点
  noChildNodes.forEach((node) => {
    const relatedNodes = [];
    for (let edge of hGraph.rawEdges) {
      if (edge.source == node.id) {
        relatedNodes.push(edge.target);
      } else if (edge.target == node.id) {
        relatedNodes.push(edge.source)
      }
    }

    //3.找到目标命名空间
    const depth = [];
    const relatedNamespace = [];
    if (relatedNodes.length < 1) {//只处理连接至n个或者n个以上节点的节点(n对应左测数字)
      return;
    } else {
      for (let node of relatedNodes) {
        relatedNamespace.push(node.split("/"));
        depth.push(node.split("/").length);
      }

    }
    let targetNode = "";
    const minDepth = Math.min(...depth);
    if (node.id.split("/").length - 1 >= minDepth - 1) {//目标节点深度要大于自身
      return;
    } else {
      findTN: for (let i = 0; i < minDepth; i++) {
        let tempNamespace = "";
        for (let j = 0; j < relatedNodes.length; j++) {
          if (tempNamespace == "") {
            tempNamespace = relatedNamespace[j][i];
          } else {
            if (relatedNamespace[j][i] != tempNamespace) {
              break findTN;
            }
          }
        }
        targetNode = targetNode + tempNamespace + "/";
      }
    }
    if (targetNode == "") { return; };
    targetNode = targetNode.substring(0, targetNode.length - 1);//去掉最后的斜杠

    //修改
    //1:节点当前所在父节点的children中移除该节点
    if (node.parent == ROOT_SCOPE) {
      if (hGraph.rootNode.children) {
        hGraph.rootNode.children.delete(node.id);
      }
    } else {
      if ((hGraph.nodeMap[node.parent] as GroupNode).children) {
        (hGraph.nodeMap[node.parent] as GroupNode).children.delete(node.id);
      }
    }
    //2:目标节点的children中添加该节点
    if (relatedNodes.length == 1) {//处理只与一个节点连接的情况
      targetNode = targetNode.substring(0, targetNode.lastIndexOf("/"));
    }
    (hGraph.nodeMap[targetNode] as GroupNode).children.add(node.id);
    //3:修改节点parent为目标节点
    node.parent = targetNode;
  });
}

const layerRecognition = (hGraph: ProcessedGraph): void => {
  const { nodeMap } = hGraph
  for (let node of Object.values(nodeMap).filter(node => node.type === NodeType.GROUP)) {
    node = node as GroupNode
    if (node.leafOperationNodeCount <= 6) {
      for (let childNodeId of node.children) {
        const childNode = nodeMap[childNodeId]
        if (childNode.type === NodeType.OPERATION) {
          if ((childNode as OperationNode).operationType === "Conv2D") {
            const newNode = new LayerNodeImp({
              id: node.id, layerType: LayerType.CONV,
              children: node.children, parent: node.parent,
              opts: { displayedName: node.displayedName },
              isModule: node.isModule, parentModule: node.parentModule
            })
            nodeMap[node.id] = newNode
            break
          }
          else if ((childNode as OperationNode).operationType === "MatMul") {
            const newNode = new LayerNodeImp({
              id: node.id, layerType: LayerType.FC,
              children: node.children, parent: node.parent,
              opts: { displayedName: node.displayedName },
              isModule: node.isModule, parentModule: node.parentModule
            })
            nodeMap[node.id] = newNode
            break
          }
        }
      }
    }
  }

}

function deAggre(processedGraph: ProcessedGraph): void {
  let currentNode;
  let currentChildrenSet = processedGraph.rootNode.children;
  let editedFlag = false;
  while (currentChildrenSet.size == 1) {
    editedFlag = true;
    currentChildrenSet.forEach((val) => {
      currentNode = processedGraph.nodeMap[val];
      currentChildrenSet = currentNode.children;
    });
  }
  if (editedFlag) {
    processedGraph.rootNode.children = currentChildrenSet;
    currentChildrenSet.forEach((val) => {
      processedGraph.nodeMap[val].parent = ROOT_SCOPE;
    })
  }
}

function disassembleFc(processedGraph: ProcessedGraph): void {
  const { nodeMap } = processedGraph
  for (const node of Object.values(nodeMap)) {
    if (node.type === NodeType.OPERATION && (node as OperationNode).operationType === 'MatMul') {
      if (node.inputNode.size === 1 && node.outputNode.size === 1) {
        const biasAddNode = nodeMap[Array.from(node.outputNode)[0]] as OperationNode
        if(biasAddNode.operationType !== "BiasAdd") continue
        const inputNode = nodeMap[Array.from(node.inputNode)[0]] as OperationNode
        const parent = nodeMap[node.parent] as GroupNode
        let parentOfInputNodeId = inputNode.parent
        let parentOfInputNode = nodeMap[parentOfInputNodeId] as GroupNode
        // if (parentOfInputNodeId !== ROOT_SCOPE) {
        //   parentOfInputNodeId = parentOfInputNode.parent
        //   parentOfInputNode = nodeMap[parentOfInputNodeId] as GroupNode
        // }

        const newScopeChildren = new Set<string>()
        newScopeChildren.add(node.id)
        newScopeChildren.add(biasAddNode.id)
        parent.children.delete(node.id)
        parent.children.delete(biasAddNode.id)
        const newScope = new GroupNodeImp({
          id: parent.id + "_copy_" + Math.random().toString(36).slice(-8),
          children: newScopeChildren,
          opts: { displayedName: parent.displayedName },
          isModule: false,
          parentModule: parentOfInputNode.parentModule
        })
        node.parent = newScope.id
        biasAddNode.parent = newScope.id
        nodeMap[newScope.id] = newScope
        parentOfInputNode.children.add(newScope.id)
        newScope.parent = parentOfInputNodeId
        if (parent.children.size === 0) {
          (nodeMap[parent.parent] as GroupNode).children.delete(parent.id)
        }
      }
    }
  }
}

const ACTIVATION_TYPE = new Set(['Gelu'])
function disassembleActivations(processedGraph: ProcessedGraph): void {
  const { nodeMap } = processedGraph
  for (const node of Object.values(nodeMap)) {
    if (node.type === NodeType.OPERATION && ACTIVATION_TYPE.has((node as OperationNode).operationType)) {
      if (node.inputNode.size === 1 && node.outputNode.size === 1) {
        const inputNode = nodeMap[Array.from(node.inputNode)[0]] as OperationNode
        const parent = nodeMap[node.parent] as GroupNode
        let parentOfInputNodeId = inputNode.parent
        let parentOfInputNode = nodeMap[parentOfInputNodeId] as GroupNode

        const newScopeChildren = new Set<string>()
        newScopeChildren.add(node.id)
        parent.children.delete(node.id)
        const newScope = new GroupNodeImp({
          id: parent.id + "_copy_" + Math.random().toString(36).slice(-8),
          children: newScopeChildren,
          opts: { displayedName: parent.displayedName },
          isModule: false,
          parentModule: parentOfInputNode.parentModule
        })
        node.parent = newScope.id
        nodeMap[newScope.id] = newScope
        parentOfInputNode.children.add(newScope.id)
        newScope.parent = parentOfInputNodeId
        if (parent.children.size === 0) {
          (nodeMap[parent.parent] as GroupNode).children.delete(parent.id)
        }
      }
    }
  }
}

function removeEmptyGroupNode(processedGraph: ProcessedGraph): void {
  const { nodeMap } = processedGraph
  for (const node of Object.values(nodeMap)) {
    if (node.type === NodeType.GROUP && (node as GroupNode).children.size === 0) {
      (nodeMap[(node as GroupNode).parent] as GroupNode).children.delete(node.id)
      // TODO: 完善去除无意义的GroupNode，还应包含内部无op node的GroupNode
    }
  }
}

function deloop(processedGraph: ProcessedGraph): void {
  const traverseStack = _findFirstInputNodes(processedGraph)
  const { nodeMap } = processedGraph
  const visitedNodes = new Set<string>()
  const visitedScopes = new Set<string>()
  let lastScope = null
  while (traverseStack.length > 0) {
    const currentNode = traverseStack.pop()
    let currentScope = currentNode.parent
    if (currentScope !== lastScope && visitedScopes.has(currentScope) && !inheritanceScope(currentScope, lastScope, nodeMap)) {
      currentScope = splitScope(currentScope, visitedNodes, nodeMap)
    }
    visitedScopes.add(currentScope)
    visitedNodes.add(currentNode.id)
    lastScope = currentScope
    for (const nextNodeId of currentNode.outputNode) {
      if (visitedNodes.has(nextNodeId)) continue
      const nextNode = nodeMap[nextNodeId] as OperationNode
      traverseStack.push(nextNode)
    }
  }
}


// 将1个scope分裂成2个，一部分children包含在visitedNode里的，一部分包含不在visitedNode里的。返回新GroupNode的id
function splitScope(scope: string, visitedNodes: Set<string>, nodeMap: NodeMap): NodeId {
  const scopeNode = nodeMap[scope] as GroupNode
  const newScopeChildren = new Set<string>()
  const newScope = new GroupNodeImp({
    id: scope + "_copy_" + Math.random().toString(36).slice(-8),
    children: newScopeChildren,
    opts: { displayedName: scopeNode.displayedName },
    isModule: scopeNode.isModule,
    parentModule: scopeNode.parentModule
  })
  newScope.parent = scopeNode.parent;
  (nodeMap[scopeNode.parent] as GroupNode).children.add(newScope.id)
  nodeMap[newScope.id] = newScope
  for (const child of scopeNode.children) {
    if (visitedNodes.has(child)) continue
    scopeNode.children.delete(child)
    newScopeChildren.add(child)
    const childNode = nodeMap[child]
    childNode.parent = newScope.id
  }
  return newScope.id
}

// 判断两个scope之间是否有包含关系，如default/conv1和default之间是有包含关系的
function inheritanceScope(scope1, scope2, nodeMap: NodeMap): boolean {
  if (scope1 === ROOT_SCOPE || scope2 === ROOT_SCOPE) return true
  let tempScope = scope1

  while (tempScope !== ROOT_SCOPE) {
    if (tempScope === scope2) return true
    tempScope = nodeMap[tempScope].parent
  }

  tempScope = scope2
  while (tempScope !== ROOT_SCOPE) {
    if (tempScope === scope1) return true
    tempScope = nodeMap[tempScope].parent
  }

  return false
}

function _findFirstInputNodes(processedGraph: ProcessedGraph): OperationNode[] {
  const { nodeMap } = processedGraph

  // 对于节点过多的复杂图，不去环
  if (Object.keys(nodeMap).length > 200) return []

  const results: OperationNode[] = []
  for (const node of Object.values(nodeMap)) {
    if (node.type === NodeType.OPERATION) {
      let isFirstInputOperationNode = true
      for (const input of node.inputNode) {
        if (nodeMap[input].type !== NodeType.DATA) {
          isFirstInputOperationNode = false
          break
        }
      }
      if (isFirstInputOperationNode) results.push(node as OperationNode)
    }
  }
  return results
}

export default class ProcessedGraphOptimizer {
  processedGraphOptimizers = [];

  constructor() {
    this.processedGraphOptimizers = [
      aggreOptimization,
      deAggre,
      disassembleFc,
      disassembleActivations,
      disassembleFc,
      removeEmptyGroupNode,
      deloop,
      layerRecognition,
    ];
  }

  optimize(hGraph: ProcessedGraph) {
    this.processedGraphOptimizers.forEach((optimizer) => {
      optimizer(hGraph);
    });
  }
}