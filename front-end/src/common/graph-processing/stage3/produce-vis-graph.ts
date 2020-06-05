import { ProcessedGraph, NodeId, NodeMap, NodeDef, ROOT_SCOPE } from "../stage2/processed-graph";
import { VisGraph, VisEdge, VisGraphImp } from "./vis-graph.type";

export function produceVisGraph(processedGraph: ProcessedGraph): VisGraph {
  const visNodes = getVisNodes(processedGraph)
  const visEdges = getVisEdges(processedGraph, visNodes)
  const { nodeMap, rootNode } = processedGraph
  return new VisGraphImp(nodeMap, rootNode, visEdges, visNodes)
}

function getVisNodes(processedGraph: ProcessedGraph): NodeId[] {
  const displayedNodes: NodeId[] = [];
  const { rootNode, nodeMap } = processedGraph
  rootNode.children.forEach(nodeId => {
    traverseChildren(nodeMap, nodeMap[nodeId], displayedNodes);
  })
  return displayedNodes
}

function traverseChildren(nodeMap: NodeMap, node: NodeDef, targetNodes: Array<string>) {
  if (!node.visibility) {
    return
  } else if (!("children" in node) || !node.expanded) {
    targetNodes.push(node.id);
  } else { //展开了
    targetNodes.push(node.id);// 如果组展开了 这个父组的节点也要展示
    node.children.forEach(nodeId => {
      traverseChildren(nodeMap, nodeMap[nodeId], targetNodes);
    })
  }
}

function getVisEdges(processedGraph: ProcessedGraph, visNodes: NodeId[]): VisEdge[] {
  const visEdges: VisEdge[] = []
  const { rawEdges, nodeMap } = processedGraph

  for (const edge of rawEdges) {
    let newSource = findOldestUnexpandParentNodeId(nodeMap, edge.source);
    let newTarget = findOldestUnexpandParentNodeId(nodeMap, edge.target);
    if (visNodes.includes(newSource) && visNodes.includes(newTarget)) {
      if (newSource === newTarget) continue

      let visEdge = visEdges.find(item => {
        return item.source === newSource && item.target === newTarget
      })

      if (visEdge) {
        visEdge.count++
      } else {
        const newVisEdge: VisEdge = { source: newSource, target: newTarget, count: 1 };
        visEdges.push(newVisEdge)
      }
    }
  }
  return visEdges;
}

function findOldestUnexpandParentNodeId(nodeMap: NodeMap, targetNodeId: string): string {
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