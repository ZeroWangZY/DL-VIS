export interface Offset {
  x: number;
  y: number;
}

export interface Style {
  key: string;
  data: any;
  style: any;
}

export interface nodeIO {
  source: Array<string>;
  target: Array<string>;
}

export interface NodeLinkMap {
  [propName: string]: nodeIO;
}

// interface NodeStyles {

// }

// interface LinkStyles {

// }

type NodeStyles = Array<Style>

type LinkStyles = Array<Style>
export interface StyledGraph {
  nodeStyles: NodeStyles;
  linkStyles: LinkStyles;
  map_id4Style_Id: Map<string, string>;
}

export class StyledGraphImp implements StyledGraph {
  nodeStyles: NodeStyles;
  linkStyles: LinkStyles;
  map_id4Style_Id: Map<string, string>;

  constructor(nodeStyles: NodeStyles, linkStyles: LinkStyles, map_id4Style_Id: Map<string, string>) {
    this.nodeStyles = nodeStyles;
    this.linkStyles = linkStyles;
    this.map_id4Style_Id = map_id4Style_Id;
  }
}
