export enum NodeType { OPERTATION, LAYER, GROUP, DATA } 
export enum LayerType { 
  CONV = "CONV", 
  RNN = "RNN", 
  FC = "FC", 
  OTHER = "OTHER",
}
export enum DataType { INPUT, OUTPUT, VARIABLE }
export type NodeId = string

interface OptionsDef {
  [key: string]: any;
}

export const SCOPE_DELIM = "/";

export const ROOT_SCOPE = "___root___";

export const END_PATTERNS = {
  INPUT: /___input___/,
  OUTPUT: /___output___/,
};

export const VARIABLE_PATTERNS = /^Variable$/;

export const LAYER_PATTERNS = {
  [LayerType.CONV]: /___conv___/,
  [LayerType.RNN]: /___rnn___/,
  [LayerType.FC]: /___fc___/,
  [LayerType.OTHER]: /___fc___/
};

export interface BaseNode {
  id: NodeId;
  displayedName: string;
  type: NodeType;
  parent: NodeId;
}

export interface OperationNode extends BaseNode {
  operationType: string;
}

export interface GroupNode extends BaseNode {
  children: Set<NodeId>;
  expanded: boolean;  // group是否被展开 
}

export interface LayerNode extends GroupNode {
  layerType: LayerType;
}

export interface DataNode extends BaseNode{
  dataType: DataType;
}

export type NodeDef = OperationNode | GroupNode | LayerNode | DataNode

export type AbstractNode = GroupNode | LayerNode;

export interface RawEdge {
  // DataNode | OperationNode
  source: NodeId;
  // DataNode | OperationNode
  target: NodeId;
}

export interface DisplayedEdge {
  // NodeDef
  source: NodeId;
  // NodeDef
  target: NodeId;
}

export interface ProcessedGraph {
  nodeMap: { [nodeId: string]: NodeDef };
  rootNode: GroupNode;
  rawEdges: RawEdge[];  // 原始的所有边
  getDisplayedEdges(): DisplayedEdge[]; // 根据group的展开情况，当前显示的边
}

export class OperationNodeImp implements OperationNode {
  id: NodeId;
  displayedName: string;
  type: NodeType;
  parent: NodeId;
  operationType: string;

  constructor({id, op, opts = {}}: {id: string; op: string; opts?: OptionsDef}) {
    this.id = id;
    this.displayedName = opts.displayedName || id;
    this.type = NodeType.OPERTATION;
    this.parent = "";
    this.operationType = op;
  }
}

export class GroupNodeImp implements GroupNode {
  id: NodeId;
  displayedName: string;
  type: NodeType;
  parent: NodeId;
  children: Set<NodeId>;
  expanded: boolean;  // group是否被展开

  constructor({id, children, opts = {}}: {id: string; children?: Set<NodeId>; opts?: OptionsDef}) {
    this.id = id;
    this.displayedName = opts.displayedName || id;
    this.type = NodeType.GROUP;
    this.parent = "";
    this.children = children || new Set();
    this.expanded = false;
  }
}

export class LayerNodeImp implements LayerNode {
  id: NodeId;
  displayedName: string;
  type: NodeType;
  parent: NodeId;
  children: Set<NodeId>;
  expanded: boolean;  // group是否被展开
  layerType: LayerType;

  constructor({id, layerType, children, opts = {}}: {id: string; children?: Set<NodeId>; layerType: LayerType; opts?: OptionsDef}) {
    this.id = id;
    this.displayedName = opts.displayedName || id;
    this.type = NodeType.LAYER;
    this.parent = "";
    this.children = children || new Set();
    this.expanded = false;
    this.layerType = layerType;
  }
}

export class DataNodeImp implements DataNode {
  id: NodeId;
  displayedName: string;
  type: NodeType;
  parent: NodeId;
  dataType: DataType;

  constructor({id, dataType, opts = {}}: {id: string; dataType: DataType; opts?: OptionsDef}) {
    this.id = id;
    this.displayedName = opts.displayedName || id;
    this.type = NodeType.DATA;
    this.parent = "";
    this.dataType = dataType;
  }
}

export class ProcessedGraphImp implements ProcessedGraph {
  nodeMap: { [nodeId: string]: NodeDef };
  rootNode: GroupNode;
  rawEdges: RawEdge[];  // 原始的所有边

  constructor() {
    this.nodeMap = Object.create(null);
    this.rootNode = new GroupNodeImp({
      id: ROOT_SCOPE
    });
    this.rawEdges = [];
  }

  getDisplayedEdges(): DisplayedEdge[] {
    return this.rawEdges;
  }
}