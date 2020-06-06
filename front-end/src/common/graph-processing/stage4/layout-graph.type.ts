import { NodeDef, GroupNode, NodeId, NodeMap } from "../stage2/processed-graph";

import { VisGraph, VisEdge, VisGraphImp } from "../stage3/vis-graph.type";

export interface LayoutOptions {
  networkSimplex: boolean;
}

export interface LayoutEdge {
  source: NodeId;
  target: NodeId;
  count: number; // 聚合间的一条边可能又多条RawGraph组成
}

export interface LayoutGraph {
  nodeMap: NodeMap;
  rootNode: GroupNode;
  layoutEdges: LayoutEdge[];
  layoutNodes: NodeId[];
}

export class LayoutGraphImp implements LayoutGraph {
  nodeMap: NodeMap;
  rootNode: GroupNode;
  layoutEdges: LayoutEdge[];
  layoutNodes: NodeId[];

  constructor(
    nodeMap: NodeMap,
    rootNode: GroupNode,
    layoutEdges: LayoutEdge[],
    layoutNodes: NodeId[]
  ) {
    this.nodeMap = nodeMap;
    this.rootNode = rootNode;
    this.layoutEdges = layoutEdges;
    this.layoutNodes = layoutNodes;
  }
}