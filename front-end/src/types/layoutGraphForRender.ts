import {RawEdge, NodeId, OperationNode, GroupNode, LayerNode, DataNode} from "../common/graph-processing/stage2/processed-graph";
export interface Coordinate {
  x: number;
  y: number;
}
export interface Size {
  width: number;
  height: number;
}
export interface DisplayedEdge extends RawEdge {
    label: string;
    points: Coordinate[];
}

export interface DisplayedNode {
    nodeId: NodeId;
    point: Coordinate;
    size: Size;
}

export interface LayoutGraph {
  nodeMap: { [nodeId: string]: OperationNode | GroupNode | LayerNode | DataNode };// 原始的所有节点
  rawEdges: RawEdge[];  // 原始的所有边
  displayedNodes: DisplayedNode[]; //根据group的展开情况，当前显示的节点
  dispalyedEdges: DisplayedEdge[];// 根据group的展开情况，当前显示的边
}
