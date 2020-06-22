import { VisGraph, VisEdge, StackedOpNodeImp, VisNodeMap, StackedOpNode } from './vis-graph.type'
import { NodeDef, NodeId, NodeMap, OperationNode, NodeType } from '../stage2/processed-graph'

const BIG_PRIMITIVE = 10000019

interface Subgraph {
  edges: Set<{ source: NodeId, target: NodeId }>;
  nodes: Set<NodeId>;
}

type EdgeMap = Map<NodeId, { inEdges: Set<NodeId>; outEdges: Set<NodeId> }>

function genHash(str: string): number {
  var hash = 5381;
  str = str || '';

  for (var i = 0, len = str.length; i < len; ++i) {
    hash += (hash << 5) + str.charCodeAt(i);
  }
  const ret = hash & 0x7fffffff
  return ret;
}


const EDGE_COUNT_THRESHOLD_TO_TRIGER_STACK = 10
const MAX_SUBGRAPH_DETECTING_STEP = 5


function _buildEdgeMap(visNodes: NodeId[], visEdges: VisEdge[]): EdgeMap {
  const edgeMap = new Map<NodeId, { inEdges: Set<NodeId>; outEdges: Set<NodeId> }>()
  for (const nodeId of visNodes) {
    edgeMap.set(nodeId, { inEdges: new Set<NodeId>(), outEdges: new Set<NodeId>() })
  }
  for (const edge of visEdges) {
    const { source, target } = edge
    edgeMap.get(source).outEdges.add(target)
    edgeMap.get(target).inEdges.add(source)
  }
  return edgeMap
}

function _getStartHubNodes(edgeMap: EdgeMap): Set<NodeId> {
  const retSet = new Set<NodeId>()
  for (const [nodeId, edges] of edgeMap) {
    const { inEdges, outEdges } = edges
    if (outEdges.size >= EDGE_COUNT_THRESHOLD_TO_TRIGER_STACK) {
      retSet.add(nodeId)
    }
  }
  return retSet
}

function _getEndHubNodes(edgeMap: EdgeMap): Set<NodeId> {
  const retSet = new Set<NodeId>()
  for (const [nodeId, edges] of edgeMap) {
    const { inEdges, outEdges } = edges
    if (inEdges.size >= EDGE_COUNT_THRESHOLD_TO_TRIGER_STACK) {
      retSet.add(nodeId)
    }
  }
  return retSet
}

// 给定一个hubNode，找到从这个hubNode开始，一定距离内的另一个hubNode
function _findEndHubNode(startHubNode: NodeId, edgeMap: EdgeMap, isReverse: boolean): Set<NodeId> {
  const retSet = new Set<NodeId>()

  const appearenceCountMap = new Map<NodeId, number>()
  const direction = isReverse ? "inEdges" : "outEdges"
  const initialNodes = edgeMap.get(startHubNode)[direction]

  for (const node of initialNodes) {
    const traverseQueue = [node]
    let step = 0
    while (traverseQueue.length > 0 && step < MAX_SUBGRAPH_DETECTING_STEP) {
      const nodeId = traverseQueue.shift()
      const oldCount = appearenceCountMap.get(nodeId)
      oldCount ? appearenceCountMap.set(nodeId, oldCount + 1) : appearenceCountMap.set(nodeId, 1)

      const nextNodes = edgeMap.get(nodeId)[direction]
      nextNodes.forEach(n => traverseQueue.push(n))
      step++
    }
    for (const [id, count] of appearenceCountMap) {
      if (count > EDGE_COUNT_THRESHOLD_TO_TRIGER_STACK) {
        retSet.add(id)
      }
    }
  }
  return retSet
}

function _findSubgraphsFromStartHubNode(startHubNode: NodeId, endHubNodes: Set<NodeId>, edgeMap: EdgeMap, nodeMap: VisNodeMap): Set<Subgraph> {
  const retSet = new Set<Subgraph>()
  const consideredNodes = new Set<NodeId>()

  const startNodes = edgeMap.get(startHubNode).outEdges

  for (const startNode of startNodes) {
    const edges = new Set<{ source: NodeId, target: NodeId }>()
    const nodes = new Set<NodeId>()
    let step = 0
    const queue = [startNode]
    while (queue.length > 0 && step < MAX_SUBGRAPH_DETECTING_STEP) {
      const nodeId = queue.shift()
      nodes.add(nodeId)
      const nextNodes = edgeMap.get(nodeId).outEdges
      nextNodes.forEach(id => {
        if (!endHubNodes.has(id) && !consideredNodes.has(id)) {
          edges.add({ source: nodeId, target: id })
          queue.push(id)
        }
      })
      step++
    }
    let isValidSubGraph = true
    nodes.forEach(n => { if (nodeMap[n].type !== NodeType.OPERTATION) { isValidSubGraph = false } })
    if (!isValidSubGraph) continue
    if (nodes.size > 0) {
      retSet.add({ edges, nodes })
      nodes.forEach(id => consideredNodes.add(id))
    }
  }
  return retSet
}

function _findSubgraphsFromEndHubNode(endHubNode: NodeId, edgeMap: EdgeMap, nodeMap: VisNodeMap): Set<Subgraph> {
  const retSet = new Set<Subgraph>()
  const consideredNodes = new Set<NodeId>()

  console.log(endHubNode)
  const startNodes = edgeMap.get(endHubNode).inEdges

  for (const startNode of startNodes) {
    const edges = new Set<{ source: NodeId, target: NodeId }>()
    const nodes = new Set<NodeId>()
    let step = 0
    const queue = [startNode]
    while (queue.length > 0 && step < MAX_SUBGRAPH_DETECTING_STEP) {
      const nodeId = queue.shift()
      nodes.add(nodeId)
      const nextNodes = edgeMap.get(nodeId).inEdges
      nextNodes.forEach(id => {
        if (!consideredNodes.has(id)) {
          edges.add({ source: nodeId, target: id })
          queue.push(id)
        }
      })
      step++
    }
    let isValidSubGraph = true
    nodes.forEach(n => { if (nodeMap[n].type !== NodeType.OPERTATION) { isValidSubGraph = false } })
    if (!isValidSubGraph) continue
    if (nodes.size > 0) {
      retSet.add({ edges, nodes })
      nodes.forEach(id => consideredNodes.add(id))
    }
  }
  return retSet
}

function _getNodeHash(nodeId: NodeId, nodeMap: VisNodeMap): number {
  const node = nodeMap[nodeId] as OperationNode
  let retHash = 0
  retHash = (retHash + genHash(node.parent)) % BIG_PRIMITIVE
  retHash = (retHash + genHash(node.operationType)) % BIG_PRIMITIVE
  node.inputNode.forEach(input => {
    retHash = (retHash + genHash(nodeMap[input].type.toString())) % BIG_PRIMITIVE
    if (nodeMap[input].type === NodeType.OPERTATION) {
      retHash = (retHash + genHash("in" + (nodeMap[input] as OperationNode).operationType)) % BIG_PRIMITIVE
    }
  })
  node.outputNode.forEach(output => {
    retHash = (retHash + genHash(nodeMap[output].type.toString())) % BIG_PRIMITIVE
    if (nodeMap[output].type === NodeType.OPERTATION) {
      retHash = (retHash + genHash("out" + (nodeMap[output] as OperationNode).operationType)) % BIG_PRIMITIVE
    }
  })
  retHash = (retHash + genHash(node.inputNode.size.toString())) % BIG_PRIMITIVE
  retHash = (retHash + genHash(node.outputNode.size.toString())) % BIG_PRIMITIVE
  retHash = (retHash + genHash(node.auxiliary.size.toString())) % BIG_PRIMITIVE
  return retHash
}

function _getEdgeHash(edge: { source: NodeId, target: NodeId }, nodeMap: VisNodeMap): number {
  const sourceNode = nodeMap[edge.source] as OperationNode
  const targetNode = nodeMap[edge.target] as OperationNode
  let retHash = genHash(sourceNode.operationType + targetNode.operationType) % BIG_PRIMITIVE

  return retHash
}

function _getSubgraphHash(subgraph: Subgraph, nodeMap): number {
  let retHash = 0
  const { edges, nodes } = subgraph
  edges.forEach(e => retHash = (retHash + _getEdgeHash(e, nodeMap)) % BIG_PRIMITIVE)
  nodes.forEach(n => retHash = (retHash + _getNodeHash(n, nodeMap)) % BIG_PRIMITIVE)
  return retHash
}

function _detectSimilarSubgraph(subgraphs: Set<Subgraph>, nodeMap: VisNodeMap): Map<number, Set<Subgraph>> {
  const subgraphMap = new Map<number, Set<Subgraph>>()
  for (const subgraph of subgraphs) {
    const subGraphHash = _getSubgraphHash(subgraph, nodeMap)
    let subgraphSet = subgraphMap.get(subGraphHash)
    if (subgraphSet) {
      subgraphSet.add(subgraph)
    } else {
      subgraphSet = new Set<Subgraph>()
      subgraphSet.add(subgraph)
      subgraphMap.set(subGraphHash, subgraphSet)
    }
  }
  return subgraphMap
}

function _stackSimilarSubgraphs(similarSubgraphs: Set<Subgraph>, visNodes: NodeId[],
  visEdges: VisEdge[], nodeMap: VisNodeMap) {
  if (similarSubgraphs.size === 0) return
  const similarSubgraphsArray = Array.from(similarSubgraphs)
  const sampleSubgraph = similarSubgraphsArray[0]

  const nodesToDeleteSet = new Set<NodeId>()

  const hashToNodeMap = new Map<number, NodeId>()
  for (const nodeId of sampleSubgraph.nodes) {
    const stackedNode = new StackedOpNodeImp(nodeMap[nodeId] as OperationNode)
    nodeMap[stackedNode.id] = stackedNode
    hashToNodeMap.set(_getNodeHash(nodeId, nodeMap), stackedNode.id)
    visNodes.push(stackedNode.id)
  }

  for (let i = 0; i < similarSubgraphsArray.length; i++) {
    const subgraphToDelete = similarSubgraphsArray[i]
    subgraphToDelete.nodes.forEach(n => {
      nodesToDeleteSet.add(n);
      const node = nodeMap[n]
      if (node instanceof StackedOpNodeImp) {
        (node as StackedOpNode).nodesContained.forEach(subnode =>
          (nodeMap[hashToNodeMap.get(_getNodeHash(n, nodeMap))] as StackedOpNode).nodesContained.add(subnode))
      } else {
        (nodeMap[hashToNodeMap.get(_getNodeHash(n, nodeMap))] as StackedOpNode).nodesContained.add(n)
      }
    })
  }

  for (let i = 0; i < visNodes.length; i++) {
    if (nodesToDeleteSet.has(visNodes[i])) {
      visNodes.splice(i, 1)
      i--
    }
  }

  for (let i = 0; i < visEdges.length; i++) {
    if (nodesToDeleteSet.has(visEdges[i].source) && nodesToDeleteSet.has(visEdges[i].target)) {
      const newSource = hashToNodeMap.get(_getNodeHash(visEdges[i].source, nodeMap))
      const newTarget = hashToNodeMap.get(_getNodeHash(visEdges[i].target, nodeMap))
      const oldEdge = visEdges.find(e => e.source === newSource && e.target === newTarget)
      if (!oldEdge) {
        visEdges[i].source = newSource
        visEdges[i].target = newTarget
      } else {
        oldEdge.count++
        visEdges.splice(i, 1)
        i--
      }
    } else if (nodesToDeleteSet.has(visEdges[i].source)) {
      const newSource = hashToNodeMap.get(_getNodeHash(visEdges[i].source, nodeMap))
      const oldEdge = visEdges.find(e => e.source === newSource && e.target === visEdges[i].target)
      if (!oldEdge) {
        visEdges[i].source = newSource
      } else {
        oldEdge.count++
        visEdges.splice(i, 1)
        i--
      }
    } else if (nodesToDeleteSet.has(visEdges[i].target)) {
      const newTarget = hashToNodeMap.get(_getNodeHash(visEdges[i].target, nodeMap))
      const oldEdge = visEdges.find(e => e.source === visEdges[i].source && e.target === newTarget)
      if (!oldEdge) {
        visEdges[i].target = newTarget
      } else {
        oldEdge.count++
        visEdges.splice(i, 1)
        i--
      }
    }
  }
}

function stackFrequentSubgraph(visGraph: VisGraph) {
  const { visEdges, visNodes, visNodeMap } = visGraph
  let edgeMap = _buildEdgeMap(visNodes, visEdges)
  console.log("before: ", visNodes.length)

  for (let i = 0; i < 3; i++) { // 进行3遍扫描
    // step 1: 找到边数量大于阈值的节点,这些点称作hubNode
    const startHubNodes = _getStartHubNodes(edgeMap)

    for (const startHubNode of startHubNodes) {
      if (!edgeMap.get(startHubNode)) continue // startHubNode有可能在上次合并中删去了
      if (edgeMap.get(startHubNode).outEdges.size > EDGE_COUNT_THRESHOLD_TO_TRIGER_STACK) {
        // step 2: 沿着step 1中的节点，找到这些发散出去的边的收合位置，也就是这些边的以step 1中的节点开始，找到这些边的共同结束位置
        const endHubNodes = _findEndHubNode(startHubNode, edgeMap, false)

        // step 3: 找到所有从startHubNode到endHubNode之间的子图
        const subgraphs = _findSubgraphsFromStartHubNode(startHubNode, endHubNodes, edgeMap, visNodeMap)

        // step 4: 将子图进行分类，相似的子图分为一类
        const similarSubgraphMap = _detectSimilarSubgraph(subgraphs, visNodeMap)

        // step 5: 合并相似子图
        for (const [hash, similarSubgraphs] of similarSubgraphMap) {
          _stackSimilarSubgraphs(similarSubgraphs, visNodes, visEdges, visNodeMap)
          edgeMap = _buildEdgeMap(visNodes, visEdges)
        }
      }
    }
  }

  for (let i = 0; i < 3; i++) {
    // 上面只合并了从statHubNode到endHubNode之间的频繁子图，接下来合并输出到某个节点，但没有输入的子图（这些子图不会和startHubNode相连）
    const endHubNodes = _getEndHubNodes(edgeMap)
    for (const endHubNode of endHubNodes) {
      if (!edgeMap.get(endHubNode)) continue // startHubNode有可能在上次合并中删去了
      const subgraphs = _findSubgraphsFromEndHubNode(endHubNode, edgeMap, visNodeMap)
      if (subgraphs.size < 2) continue

      const similarSubgraphMap = _detectSimilarSubgraph(subgraphs, visNodeMap)
      for (const [hash, similarSubgraphs] of similarSubgraphMap) {
        _stackSimilarSubgraphs(similarSubgraphs, visNodes, visEdges, visNodeMap)
        edgeMap = _buildEdgeMap(visNodes, visEdges)
      }
    }
  }


  console.log("after: ", visNodes.length)
}


export default class VisGraphOptimizer {
  visGraphOptimizers = [];
  constructor() {
    this.visGraphOptimizers = [stackFrequentSubgraph]
  }
  optimize(vGraph: VisGraph) {
    this.visGraphOptimizers.forEach((optimizer) => {
      optimizer(vGraph)
    })
    return vGraph
  }
}

