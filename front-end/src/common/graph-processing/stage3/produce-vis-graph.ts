import {
  ProcessedGraph,
  NodeId,
  NodeMap,
  NodeDef,
  ROOT_SCOPE,
  ModuleEdge,
} from "../stage2/processed-graph";
import {
  VisGraph,
  VisEdge,
  VisGraphImp,
  VisModuleEdge,
  ModuleConnection,
} from "./vis-graph.type";
import {
  getModuleConnection,
  findOldestUnexpandParentNodeId,
  getHiddenEdgeMap,
} from "./functions";

export interface ProduceVisGraphOptions {
  isDiggingEdgeBundlingMode: boolean;
}

export function produceVisGraph(
  processedGraph: ProcessedGraph,
  options: ProduceVisGraphOptions
): VisGraph {
  const { nodeMap, rootNode, moduleEdges, modules } = processedGraph;
  const { isDiggingEdgeBundlingMode } = options;

  const visNodes = getVisNodes(processedGraph);
  const visEdges = getVisEdges(
    processedGraph,
    visNodes,
    isDiggingEdgeBundlingMode
  );
  const visModuleEdges = getVisModuleEdges(visNodes, moduleEdges);
  const visModuleConnectionMap = getVisModuleConnectionMap(visNodes, nodeMap);
  const hiddenEdgeMap = getHiddenEdgeMap(
    visNodes,
    nodeMap,
    visModuleConnectionMap
  );
  return new VisGraphImp(
    Object.assign({}, nodeMap),
    rootNode,
    visEdges,
    visNodes,
    visModuleEdges,
    modules,
    visModuleConnectionMap,
    hiddenEdgeMap
  );
}

function getVisModuleConnectionMap(
  visNodes: NodeId[],
  nodeMap: NodeMap
): Map<NodeId, ModuleConnection> {
  const retMap = new Map<NodeId, ModuleConnection>();
  for (const nodeId of visNodes) {
    const connection = getModuleConnection(nodeId, nodeMap);
    retMap.set(nodeId, connection);
  }
  return retMap;
}

function getVisModuleEdges(
  visNodes: NodeId[],
  moduleEdges: ModuleEdge[]
): VisModuleEdge[] {
  const visModuleEdges: VisModuleEdge[] = [];
  const visNodesSet = new Set(visNodes);
  for (const moduleEdge of moduleEdges) {
    if (
      visNodesSet.has(moduleEdge.source) &&
      visNodesSet.has(moduleEdge.target)
    ) {
      visModuleEdges.push({
        source: moduleEdge.source,
        target: moduleEdge.target,
        count: moduleEdge.width,
      });
    }
  }
  return visModuleEdges;
}

function getVisNodes(processedGraph: ProcessedGraph): NodeId[] {
  const displayedNodes: NodeId[] = [];
  const { rootNode, nodeMap } = processedGraph;
  rootNode.children.forEach((nodeId) => {
    traverseChildren(nodeMap, nodeMap[nodeId], displayedNodes);
  });
  return displayedNodes;
}

function traverseChildren(
  nodeMap: NodeMap,
  node: NodeDef,
  targetNodes: Array<string>
) {
  if (!node.visibility) {
    return;
  } else if (!("children" in node) || !node.expanded) {
    targetNodes.push(node.id);
  } else {
    //展开了
    targetNodes.push(node.id); // 如果组展开了 这个父组的节点也要展示
    node.children.forEach((nodeId) => {
      traverseChildren(nodeMap, nodeMap[nodeId], targetNodes);
    });
  }
}

function getVisEdges(
  processedGraph: ProcessedGraph,
  visNodes: NodeId[],
  isDiggingEdgeBundlingMode: boolean
): VisEdge[] {
  const visEdges: VisEdge[] = [];
  const { rawEdges, nodeMap } = processedGraph;

  for (const edge of rawEdges) {
    if (
      isDiggingEdgeBundlingMode &&
      isInterModule(edge.source, edge.target, nodeMap)
    ) {
      continue;
    }
    let newSource = findOldestUnexpandParentNodeId(nodeMap, edge.source);
    let newTarget = findOldestUnexpandParentNodeId(nodeMap, edge.target);
    if (visNodes.includes(newSource) && visNodes.includes(newTarget)) {
      if (newSource === newTarget) continue;

      let visEdge = visEdges.find((item) => {
        return item.source === newSource && item.target === newTarget;
      });

      if (visEdge) {
        visEdge.count++;
      } else {
        const newVisEdge: VisEdge = {
          source: newSource,
          target: newTarget,
          count: 1,
        };
        visEdges.push(newVisEdge);
      }
    }
  }
  return visEdges;
}

function isInterModule(
  nodeId1: NodeId,
  nodeId2: NodeId,
  nodeMap: NodeMap
): boolean {
  const node1 = nodeMap[nodeId1]
  return node1.outModuleConnection.has(nodeId2)
}
