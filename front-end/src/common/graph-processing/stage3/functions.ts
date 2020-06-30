import { NodeType, NodeId, GroupNode, NodeMap, ROOT_SCOPE } from "../stage2/processed-graph"
import { ModuleConnection, VisEdge, HiddenEdge } from "./vis-graph.type"

function getInModuleConnection(nodeId: string, nodeMap: NodeMap): Set<NodeId> {
  let node = nodeMap[nodeId]
  if (node.type === NodeType.OPERATION || node.type === NodeType.DATA) {
    return node.inModuleConnection
  }
  if (node.belongModule === null) {
    return new Set()
  }
  node = node as GroupNode
  if (node.isModule && !node.parentModule) {
    return new Set()
  }
  if (node.inModuleConnection.size > 0) {
    return node.inModuleConnection
  }
  let retSet: Set<NodeId> = new Set()
  let queue = [node.id]
  while (queue.length > 0) {
    const id = queue.shift()
    const tempNode = nodeMap[id]
    if (tempNode.type === NodeType.DATA || tempNode.type === NodeType.OPERATION) {
      retSet = new Set([...retSet, ...tempNode.inModuleConnection])
    }
    if (tempNode.type === NodeType.GROUP || tempNode.type === NodeType.LAYER) {
      queue = queue.concat(Array.from((tempNode as GroupNode).children))
    }
  }
  node.inModuleConnection = retSet
  return retSet
}

function getOutModuleConnection(nodeId: string, nodeMap: NodeMap): Set<string> {
  let node = nodeMap[nodeId]
  if (node.type === NodeType.OPERATION || node.type === NodeType.DATA) {
    return node.outModuleConnection
  }
  if (node.belongModule === null) {
    return new Set()
  }
  node = node as GroupNode
  if (node.isModule && !node.parentModule) {
    return new Set()
  }
  if (node.outModuleConnection.size > 0) {
    return node.outModuleConnection
  }
  let retSet: Set<NodeId> = new Set()
  let queue = [node.id]
  while (queue.length > 0) {
    const id = queue.shift()
    const tempNode = nodeMap[id]
    if (tempNode.type === NodeType.DATA || tempNode.type === NodeType.OPERATION) {
      retSet = new Set([...retSet, ...tempNode.outModuleConnection])
    }
    if (tempNode.type === NodeType.GROUP || tempNode.type === NodeType.LAYER) {
      queue = queue.concat(Array.from((tempNode as GroupNode).children))
    }
  }
  node.outModuleConnection = retSet
  return retSet
}

export function getModuleConnection(nodeId: NodeId, nodeMap: NodeMap): ModuleConnection {
  let displayedInModuleConnection: Set<NodeId> = new Set();
  let displayedOutModuleConnection: Set<NodeId> = new Set();

  const node = nodeMap[nodeId];
  // 如果是group node或layer node 且 已展开 没有小短线
  if (!("children" in node) || !node.expanded && !node.isModule) {
    let inModuleConnection = getInModuleConnection(nodeId, nodeMap);
    let outModuleConnection = getOutModuleConnection(nodeId, nodeMap);
    inModuleConnection.forEach(d => {
      displayedInModuleConnection.add(d)
    })
    outModuleConnection.forEach(d => {
      displayedOutModuleConnection.add(d)
    })

  } else if (!node.expanded && node.parentModule) { // 如果是没有展开的 并且是嵌套的module节点,有小短线
    let inModuleConnection = getInModuleConnection(nodeId, nodeMap);
    let outModuleConnection = getOutModuleConnection(nodeId, nodeMap);
    const nodeBelongModule = node.belongModule;
    inModuleConnection.forEach(d => {
      displayedInModuleConnection.add(d);
    })
    outModuleConnection.forEach(d => {
      displayedOutModuleConnection.add(d)
    })
  }
  return {
    in: displayedInModuleConnection,
    out: displayedOutModuleConnection
  };
}

// 判断两个节点是否在同一个scope下
function isSameScope(nodeId1: NodeId, nodeId2: NodeId, nodeMap: NodeMap): boolean {
  return nodeMap[nodeId1].parent === nodeMap[nodeId2].parent
}

function getInHiddenEdges(nodeId: string, nodeMap: NodeMap, visModuleConnectionMap: Map<NodeId, ModuleConnection>): Set<VisEdge> {
  const inModuleConnections = visModuleConnectionMap.get(nodeId).in
  const currentNode = nodeMap[nodeId]
  const res = new Set<VisEdge>()
  for (const inModuleConnection of inModuleConnections) {
    const inModuleNode = nodeMap[inModuleConnection]
    let oldestUnexpandParent = nodeMap[findOldestUnexpandParentNodeId(nodeMap, inModuleConnection)]
    if (oldestUnexpandParent.belongModule !== inModuleNode.belongModule) {
      continue
    }
    const curNodeParentModule = (nodeMap[currentNode.belongModule] as GroupNode).parentModule;
    if (!((oldestUnexpandParent.type === NodeType.GROUP || oldestUnexpandParent.type === NodeType.LAYER)
      && (oldestUnexpandParent as GroupNode).isModule)) {
      insertModuleEdge(res, oldestUnexpandParent.id, inModuleNode.belongModule)
    }
    insertModuleEdge(res, inModuleNode.belongModule, curNodeParentModule ? curNodeParentModule : currentNode.belongModule)
    if (nodeId !== currentNode.belongModule) {
      insertModuleEdge(res, currentNode.belongModule, nodeId)
    } else if (curNodeParentModule) {
      insertModuleEdge(res, curNodeParentModule, nodeId);
    }

  }
  return res
}

function getOutHiddenEdges(nodeId: string, nodeMap: NodeMap, visModuleConnectionMap: Map<NodeId, ModuleConnection>): Set<VisEdge> {
  const outModuleConnections = visModuleConnectionMap.get(nodeId).out
  const currentNode = nodeMap[nodeId]
  const res = new Set<VisEdge>()
  for (const outModuleConnection of outModuleConnections) {
    const outModuleNode = nodeMap[outModuleConnection]
    let oldestUnexpandParent = nodeMap[findOldestUnexpandParentNodeId(nodeMap, outModuleConnection)]
    if (oldestUnexpandParent.belongModule !== outModuleNode.belongModule) {
      continue
    }

    const curNodeParentModule = (nodeMap[currentNode.belongModule] as GroupNode).parentModule;
    if (nodeId !== currentNode.belongModule) {
      insertModuleEdge(res, nodeId, currentNode.belongModule)
    } else if (curNodeParentModule) {
      insertModuleEdge(res, nodeId, curNodeParentModule);
    }

    insertModuleEdge(res, curNodeParentModule ? curNodeParentModule : currentNode.belongModule, outModuleNode.belongModule)
    if (!((oldestUnexpandParent.type === NodeType.GROUP || oldestUnexpandParent.type === NodeType.LAYER)
      && (oldestUnexpandParent as GroupNode).isModule)) {
      insertModuleEdge(res, outModuleNode.belongModule, oldestUnexpandParent.id)
    }
  }
  return res
}

function insertModuleEdge(moduleEdges: Set<VisEdge>, source: NodeId, target: NodeId) {
  let tempModuleEdge = Array.from(moduleEdges).find(me => me.source === source && me.target === target)
  if (tempModuleEdge === undefined) {
    moduleEdges.add({ source, target, count: 1 })
  } else {
    tempModuleEdge.count += 1
  }
}

export function findOldestUnexpandParentNodeId(nodeMap: NodeMap, targetNodeId: string): string {
  let oldestUnexpandParent = targetNodeId
  let parent = nodeMap[oldestUnexpandParent].parent;

  while (parent && parent !== ROOT_SCOPE) {
    if (!nodeMap[parent]["expanded"]) {
      oldestUnexpandParent = parent;
    }
    parent = nodeMap[parent].parent;
  }
  return oldestUnexpandParent;
}

export function getHiddenEdgeMap(visNodes: NodeId[], nodeMap: NodeMap, visModuleConnectionMap: Map<NodeId, ModuleConnection>): Map<NodeId, HiddenEdge> {
  const retMap = new Map<NodeId, HiddenEdge>()
  for (const nodeId of visNodes) {
    const inHiddenEdges = getInHiddenEdges(nodeId, nodeMap, visModuleConnectionMap)
    const outHiddenEdges = getOutHiddenEdges(nodeId, nodeMap, visModuleConnectionMap)
    if (inHiddenEdges.size === 0 && outHiddenEdges.size === 0) continue
    retMap.set(nodeId, { in: inHiddenEdges, out: outHiddenEdges })
  }
  return retMap

}