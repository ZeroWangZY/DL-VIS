import { RawEdge, NodeDef, GroupNode, NodeId } from "../stage2/processed-graph";

export interface VisNodes {
  source: NodeId;
  target: NodeId;
  weight: number;
}

export interface VisGraph {
  nodeMap: { [nodeId: string]: NodeDef };
  rootNode: GroupNode;
  visEdges: RawEdge[];  // 原始的所有边
  visNodes: VisNodes[];
}
