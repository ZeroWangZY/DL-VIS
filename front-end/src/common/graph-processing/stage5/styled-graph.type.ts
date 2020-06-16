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
}

export class StyledGraphImp implements StyledGraph {
  nodeStyles: NodeStyles;
  linkStyles: LinkStyles;

  constructor(nodeStyles: NodeStyles, linkStyles: LinkStyles) {
    this.nodeStyles = nodeStyles;
    this.linkStyles = linkStyles;
  }
}
