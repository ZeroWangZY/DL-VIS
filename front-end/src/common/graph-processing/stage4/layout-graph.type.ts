import { ElkNode, ElkPort, ElkEdge } from "elkjs/lib/elk.bundled.js";

export interface LayoutOptions {
  networkSimplex: boolean;
}
type LayoutGraph = void | ElkNode
export { LayoutGraph };

// export {Promise<void | ElkNode> as LayoutGraphImp}
export class LayoutGraphImp implements ElkNode {
  id: string;
  children?: ElkNode[];
  ports?: ElkPort[];
  edges?: ElkEdge[];

  constructor(
    id: string,
    children?: ElkNode[],
    ports?: ElkPort[],
    edges?: ElkEdge[]
  ) {
    this.id = id;
    this.children = children;
    this.ports = ports;
    this.edges = edges;
  }
}
