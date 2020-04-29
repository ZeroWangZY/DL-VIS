export enum NodeType { OPERTATION, LAYER, GROUP, DATA }
export enum LayerType {
  CONV = "CONV",
  RNN = "RNN",
  FC = "FC",
  OTHER = "OTHER",
}
export enum DataType { INPUT, OUTPUT, VARIABLE }
export type NodeId = string

export interface OptionsDef {
  [key: string]: any;
}

export enum ModificationType {
  MODIFY_NODE_ATTR,
  MODIFY_NODE_TYPE,
  NEW_NODE,
  DELETE_NODE
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
  visibility: boolean; // 是否可见，如果为false，则节点和节点的children均不被显示出来
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

export interface DataNode extends BaseNode {
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

export interface ProcessedGraph {
  nodeMap: { [nodeId: string]: NodeDef };
  rootNode: GroupNode;
  rawEdges: RawEdge[];  // 原始的所有边
  getDisplayedEdges(displayedNodes?: NodeId[]): RawEdge[]; // 根据group的展开情况，当前显示的边
  getDisplayedNodes(): NodeId[]; // 根据group的展开情况，当前显示的节点
}

export class OperationNodeImp implements OperationNode {
  id: NodeId;
  displayedName: string;
  type: NodeType;
  parent: NodeId;
  operationType: string;
  visibility: boolean = true

  constructor({ id, op, opts = {} }: { id: string; op: string; opts?: OptionsDef }) {
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
  visibility: boolean = true

  constructor({ id, children, parent, opts = {} }: { id: string; children?: Set<NodeId>; parent?: string; opts?: OptionsDef }) {
    this.id = id;
    this.displayedName = opts.displayedName || id;
    this.type = NodeType.GROUP;
    this.parent = parent || "";
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
  visibility: boolean = true

  constructor({ id, layerType, children, parent, opts = {} }: { id: string; children?: Set<NodeId>; parent?: string; layerType: LayerType; opts?: OptionsDef }) {
    this.id = id;
    this.displayedName = opts.displayedName || id;
    this.type = NodeType.LAYER;
    this.parent = parent || "";
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
  visibility: boolean = true

  constructor({ id, dataType, opts = {} }: { id: string; dataType: DataType; opts?: OptionsDef }) {
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

  // 提取目前所有展开的节点
  // 循环children 把要展开的节点加入展示节点数组
  private traverseChildren(node: NodeDef, targetNodes: Array<string>) {
    if (!node.visibility) {
      return
    } else if (!("children" in node) || !node.expanded) {
      targetNodes.push(node.id);
    } else { //展开了
      targetNodes.push(node.id);// 如果组展开了 这个父组的节点也要展示
      node.children.forEach(nodeId => {
        this.traverseChildren(this.nodeMap[nodeId], targetNodes);
      })
    }
  }

  // 查找某节点最上层没有展开的节点
  private findOldestUnexpandParentNodeId(targetNodeId: string): string {
    let oldestUnexpandParent = targetNodeId
    let parent = this.nodeMap[oldestUnexpandParent].parent;

    while (parent && parent !== "___root___") {
      if(!this.nodeMap[parent]["expanded"]){
        oldestUnexpandParent = parent;
      }
      parent = this.nodeMap[parent].parent;
    }
    return oldestUnexpandParent;
  }

  getDisplayedNodes(): NodeId[] {
    const displayedNodes: NodeId[] = [];
    this.rootNode.children.forEach(nodeId => {
      this.traverseChildren(this.nodeMap[nodeId], displayedNodes);
    })
    return displayedNodes
  }

  getDisplayedEdges(displayedNodes: NodeId[] = this.getDisplayedNodes()): RawEdge[] {
    const displayedEdges: RawEdge[] = []
    for (const edge of this.rawEdges) {
      let newSource = this.findOldestUnexpandParentNodeId(edge.source);
      let newTarget = this.findOldestUnexpandParentNodeId(edge.target);
      if (displayedNodes.includes(newSource) && displayedNodes.includes(newTarget)) {
        let newEdge = { source: newSource, target: newTarget };
        let pushFlag = true;
        if (newSource === newTarget) {
          pushFlag = false;
        } else {
          displayedEdges.forEach(item => {
            if ((item.source === newSource && item.target === newTarget)) {
              pushFlag = false;
            }
          })
        }
        if (pushFlag) {
          displayedEdges.push(newEdge)
        }
      }
    }
    return displayedEdges;
  }
}