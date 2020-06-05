import { NodeDef, GroupNode, NodeId, NodeMap } from "../stage2/processed-graph";

export interface VisEdge {
  source: NodeId;
  target: NodeId;
  count: number; // 聚合间的一条边可能又多条RawGraph组成
}

export interface VisGraph {
  nodeMap: NodeMap;
  rootNode: GroupNode;
  visEdges: VisEdge[];
  visNodes: NodeId[];
}

export class VisGraphImp implements VisGraph {
  nodeMap: NodeMap;
  rootNode: GroupNode;
  visEdges: VisEdge[];
  visNodes: NodeId[];

  constructor(nodeMap: NodeMap,
    rootNode: GroupNode, visEdges: VisEdge[], visNodes: NodeId[]) {
      this.nodeMap = nodeMap
      this.rootNode = rootNode
      this.visEdges = visEdges
      this.visNodes = visNodes
  }
}