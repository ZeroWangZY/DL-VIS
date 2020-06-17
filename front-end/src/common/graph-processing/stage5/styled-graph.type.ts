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

type NodeStyles = Array<Style>;

type LinkStyles = Array<Style>;

type PortStyles = Array<Style>;
export interface StyledGraph {
  nodeStyles: NodeStyles;
  linkStyles: LinkStyles;
  portStyles: PortStyles;
}

export class StyledGraphImp implements StyledGraph {
  nodeStyles: NodeStyles;
  linkStyles: LinkStyles;
  portStyles: PortStyles;

  constructor(
    nodeStyles: NodeStyles,
    linkStyles: LinkStyles,
    portStyles: PortStyles
  ) {
    this.nodeStyles = nodeStyles;
    this.linkStyles = linkStyles;
    this.portStyles = portStyles;
  }
}
