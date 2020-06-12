import {
  ElkNode,
  ElkPort,
  ElkEdge,
  ElkEdgeSection,
} from "elkjs/lib/elk.bundled.js";
import { NodeType } from "../stage2/processed-graph";

export interface ElkNodeMap {
  [propName: string]: ElkNodeMap;
}

export interface LayoutOptions {
  networkSimplex?: boolean;
  mergeEdge?: boolean;
}

export interface LayoutNode extends ElkNode {
  id4Style?: string; //仅供后续styleGraph使用，包含了层次信息
  parent?: string;
  label?: string;
  shape?: string;
  class?: string;
  type?: NodeType;
  expand?: boolean;
}

export interface LayoutEdge extends ElkEdge {
  id4Style?: string; //仅供后续styleGraph使用，包含了source和node的层次信息
  sources?: string[];
  targets?: string[];
  sections?: ElkEdgeSection[];
}

export interface LayoutGraph {
  id: string;
  children?: LayoutNode[];
  ports?: ElkPort[];
  edges?: LayoutEdge[];
  elkNodeMap?: ElkNodeMap;
}

export class LayoutGraphImp implements LayoutGraph {
  id: string;
  children?: LayoutNode[];
  ports?: ElkPort[];
  edges?: LayoutEdge[];
  elkNodeMap?: ElkNodeMap;

  constructor(
    id: string,
    children?: LayoutNode[],
    ports?: ElkPort[],
    edges?: LayoutEdge[],
    elkNodeMap?: ElkNodeMap
  ) {
    this.id = id;
    this.children = children;
    this.ports = ports;
    this.edges = edges;
    this.elkNodeMap = elkNodeMap;
  }
}
