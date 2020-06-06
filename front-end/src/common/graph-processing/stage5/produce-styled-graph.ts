import { ProcessedGraph, NodeId, NodeMap, NodeDef, ROOT_SCOPE } from "../stage2/processed-graph";
import { VisGraph, VisEdge, VisGraphImp } from "./styled-graph.type";

export function produceStyledGraph(processedGraph: ProcessedGraph): VisGraph {
  const visNodes = getVisNodes(processedGraph)
  const visEdges = getVisEdges(processedGraph, visNodes)
  const { nodeMap, rootNode } = processedGraph
  return new VisGraphImp(nodeMap, rootNode, visEdges, visNodes)
}
