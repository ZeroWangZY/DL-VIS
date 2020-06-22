import { NodeDef, GroupNode, NodeId, NodeMap, OperationNode, NodeType } from "../stage2/processed-graph";

export interface VisEdge {
  source: NodeId;
  target: NodeId;
  count: number; // 聚合间的一条边可能又多条RawGraph组成
}

export interface StackedOpNode extends OperationNode {
  nodesContained: Set<NodeId>
}

export type VisNodeDef = NodeDef | StackedOpNode

export type VisNodeMap = { [nodeId: string]: VisNodeDef }

export interface VisGraph {
  visNodeMap: VisNodeMap;
  rootNode: GroupNode;
  visEdges: VisEdge[];
  visNodes: NodeId[];
}

export class VisGraphImp implements VisGraph {
  visNodeMap: VisNodeMap;
  rootNode: GroupNode;
  visEdges: VisEdge[];
  visNodes: NodeId[];

  constructor(visNodeMap: VisNodeMap,
    rootNode: GroupNode, visEdges: VisEdge[], visNodes: NodeId[]) {
    this.visNodeMap = visNodeMap
    this.rootNode = rootNode
    this.visEdges = visEdges
    this.visNodes = visNodes
  }
}

export class StackedOpNodeImp implements StackedOpNode {
  nodesContained: Set<NodeId>;
  operationType: string;
  attributes: import("../stage2/processed-graph").Attribute[];
  auxiliary: Set<string>;
  id: string;
  displayedName: string;
  type: NodeType;
  parent: string;
  visibility: boolean;
  belongModule: string;
  outModuleConnection: Set<string>;
  inModuleConnection: Set<string>;
  inputNode: Set<string>;
  outputNode: Set<string>;

  constructor(operationNode: OperationNode) {
    this.nodesContained = new Set<NodeId>()
    this.operationType = operationNode.operationType
    this.attributes = Array.from(operationNode.attributes)
    this.auxiliary = new Set(operationNode.auxiliary)
    this.id = operationNode.id + "-" + Math.random().toString(36).slice(-8)
    this.displayedName = operationNode.operationType
    this.type = operationNode.type
    this.parent = operationNode.parent
    this.visibility = operationNode.visibility
    this.belongModule = operationNode.belongModule
    this.outModuleConnection = new Set(operationNode.outModuleConnection)
    this.inModuleConnection = new Set(operationNode.inputNode)
    this.inputNode = new Set(operationNode.inputNode)
    this.outputNode = new Set(operationNode.outputNode)
  }
}
