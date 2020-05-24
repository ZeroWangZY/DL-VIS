export enum NodeType { OPERTATION, LAYER, GROUP, DATA }
export enum LayerType {
  CONV = "CONV",
  RNN = "RNN",
  FC = "FC",
  OTHER = "OTHER",
}
export enum DataType { INPUT, OUTPUT, VARIABLE, CONST, PARAMETER }
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
  belongModule: NodeId | null;
  outModuleConnection: Set<NodeId>;
  inModuleConnection: Set<NodeId>;
}

export interface OperationNode extends BaseNode {
  operationType: string;
  auxiliary?: Set<NodeId>;
}

export interface GroupNode extends BaseNode {
  children: Set<NodeId>;
  expanded: boolean;  // group是否被展开 
  isModule: boolean;
  parentModule: NodeId; // 如果是位于module中的嵌套module
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

export interface ModuleEdge extends RawEdge {
  width: number; // 表示两个模块间的连线个数
}

export interface ProcessedGraph {
  nodeMap: { [nodeId: string]: NodeDef };
  rootNode: GroupNode;
  rawEdges: RawEdge[];  // 原始的所有边
  moduleEdges: ModuleEdge[];
  modules: Set<NodeId>;
  getDisplayedEdges(displayedNodes?: NodeId[], interModule?: boolean): RawEdge[]; // 根据group的展开情况，当前显示的边
  getDisplayedNodes(): NodeId[]; // 根据group的展开情况，当前显示的节点
  getInHiddenEdges(nodeId: NodeId): ModuleEdge[]; // 挖孔设计中被隐藏的线
  getOutHiddenEdges(nodeId: NodeId): ModuleEdge[]; // 挖孔设计中被隐藏的线
  getInModuleConnection(nodeId: NodeId): Set<NodeId>;
  getOutModuleConnection(nodeId: NodeId): Set<NodeId>;
  getModuleConnection(nodeId: NodeId): object; // 根据当前展开情况修剪某个节点跟其他模块的连接，只保留模块层级
}

export class OperationNodeImp implements OperationNode {
  id: NodeId;
  displayedName: string;
  type: NodeType;
  parent: NodeId;
  operationType: string;
  visibility: boolean = true;
  belongModule: string = null;
  outModuleConnection: Set<NodeId>;
  inModuleConnection: Set<NodeId>;
  auxiliary?: Set<NodeId>;

  constructor({ id, auxiliary, op, opts = {} }: { id: string; auxiliary?: Set<NodeId>; op: string; opts?: OptionsDef }) {
    this.id = id;
    this.displayedName = opts.displayedName || id;
    this.type = NodeType.OPERTATION;
    this.parent = "";
    this.operationType = op;
    this.outModuleConnection = new Set()
    this.inModuleConnection = new Set()
    this.auxiliary = auxiliary || new Set();
  }
}

export class GroupNodeImp implements GroupNode {
  id: NodeId;
  displayedName: string;
  type: NodeType;
  parent: NodeId;
  children: Set<NodeId>;
  expanded: boolean;  // group是否被展开
  visibility: boolean = true;
  isModule: boolean;
  parentModule: NodeId;
  belongModule: string = null;
  outModuleConnection: Set<NodeId>;
  inModuleConnection: Set<NodeId>;

  constructor({ id, children, parent, opts = {}, isModule = false, parentModule = null }:
    { id: string; children?: Set<NodeId>; parent?: string; opts?: OptionsDef; isModule?: boolean; parentModule?: NodeId }) {
    this.id = id;
    this.displayedName = opts.displayedName || id;
    this.type = NodeType.GROUP;
    this.parent = parent || "";
    this.children = children || new Set();
    this.expanded = false;
    this.isModule = isModule;
    this.parentModule = parentModule;
    this.outModuleConnection = new Set()
    this.inModuleConnection = new Set()
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
  visibility: boolean = true;
  isModule: boolean;
  parentModule: NodeId;
  belongModule: string = null;
  outModuleConnection: Set<NodeId>;
  inModuleConnection: Set<NodeId>;

  constructor({ id, layerType, children, parent, opts = {}, isModule = false, parentModule = null }:
    { id: string; children?: Set<NodeId>; parent?: string; layerType: LayerType; opts?: OptionsDef; isModule?: boolean; parentModule?: NodeId }) {
    this.id = id;
    this.displayedName = opts.displayedName || id;
    this.type = NodeType.LAYER;
    this.parent = parent || "";
    this.children = children || new Set();
    this.expanded = false;
    this.layerType = layerType;
    this.isModule = isModule;
    this.parentModule = parentModule;
    this.outModuleConnection = new Set()
    this.inModuleConnection = new Set()
  }
}

export class DataNodeImp implements DataNode {
  id: NodeId;
  displayedName: string;
  type: NodeType;
  parent: NodeId;
  dataType: DataType;
  visibility: boolean = true;
  belongModule: string = null;
  outModuleConnection: Set<NodeId>;
  inModuleConnection: Set<NodeId>;

  constructor({ id, dataType, opts = {} }: { id: string; dataType: DataType; opts?: OptionsDef }) {
    this.id = id;
    this.displayedName = opts.displayedName || id;
    this.type = NodeType.DATA;
    this.parent = "";
    this.dataType = dataType;
    this.outModuleConnection = new Set()
    this.inModuleConnection = new Set()
  }
}

export class ProcessedGraphImp implements ProcessedGraph {
  nodeMap: { [nodeId: string]: NodeDef };
  rootNode: GroupNode;
  rawEdges: RawEdge[];  // 原始的所有边
  moduleEdges;
  modules;

  constructor() {
    this.nodeMap = Object.create(null);
    this.rootNode = new GroupNodeImp({
      id: ROOT_SCOPE
    });
    this.rawEdges = [];
    this.moduleEdges = [];
    this.modules = new Set();
  }
  getInModuleConnection(nodeId: string): Set<NodeId> {
    let node = this.nodeMap[nodeId]
    if (node.type === NodeType.OPERTATION || node.type === NodeType.DATA) {
      return node.inModuleConnection
    }
    if (node.belongModule === null) {
      return new Set()
    }
    node = node as GroupNode
    if (node.isModule && !node.parentModule) {
      return new Set()
    }
    if (node.inModuleConnection.size > 0) {
      return node.inModuleConnection
    }
    let retSet: Set<NodeId> = new Set()
    let queue = [node.id]
    while (queue.length > 0) {
      const id = queue.shift()
      const tempNode = this.nodeMap[id]
      if (tempNode.type === NodeType.DATA || tempNode.type === NodeType.OPERTATION) {
        retSet = new Set([...retSet, ...tempNode.inModuleConnection])
      }
      if (tempNode.type === NodeType.GROUP || tempNode.type === NodeType.LAYER) {
        queue = queue.concat(Array.from((tempNode as GroupNode).children))
      }
    }
    node.inModuleConnection = retSet
    return retSet
  }

  getOutModuleConnection(nodeId: string): Set<string> {
    let node = this.nodeMap[nodeId]
    if (node.type === NodeType.OPERTATION || node.type === NodeType.DATA) {
      return node.outModuleConnection
    }
    if (node.belongModule === null) {
      return new Set()
    }
    node = node as GroupNode
    if (node.isModule && !node.parentModule) {
      return new Set()
    }
    if (node.outModuleConnection.size > 0) {
      return node.outModuleConnection
    }
    let retSet: Set<NodeId> = new Set()
    let queue = [node.id]
    while (queue.length > 0) {
      const id = queue.shift()
      const tempNode = this.nodeMap[id]
      if (tempNode.type === NodeType.DATA || tempNode.type === NodeType.OPERTATION) {
        retSet = new Set([...retSet, ...tempNode.outModuleConnection])
      }
      if (tempNode.type === NodeType.GROUP || tempNode.type === NodeType.LAYER) {
        queue = queue.concat(Array.from((tempNode as GroupNode).children))
      }
    }
    node.outModuleConnection = retSet
    return retSet
  }

  getModuleConnection(nodeId: NodeId): object {
    let displayedInModuleConnection: Set<NodeId> = new Set();
    let displayedOutModuleConnection: Set<NodeId> = new Set();

    const node = this.nodeMap[nodeId];
    // 如果是group node或layer node 且 已展开 没有小短线
    if (!("children" in node) || !node.expanded && !node.isModule) {
      let inModuleConnection = this.getInModuleConnection(nodeId);
      let outModuleConnection = this.getOutModuleConnection(nodeId);
      inModuleConnection.forEach(d => {
        let targetNode = this.nodeMap[d];
        let targetModule = targetNode.belongModule;
        if (!targetModule) {
          targetNode = targetNode as GroupNode;
          if (targetNode.isModule) {
            targetModule = d;
          }
        }
        displayedInModuleConnection.add(targetModule)
      })
      outModuleConnection.forEach(d => {
        let targetNode = this.nodeMap[d];
        let targetModule = targetNode.belongModule;
        if (!targetModule) {
          targetNode = targetNode as GroupNode;
          if (targetNode.isModule) {
            targetModule = d;
          }
        }
        displayedOutModuleConnection.add(targetModule)
      })
    } else if (!node.expanded && node.parentModule) { // 如果是没有展开的 并且是嵌套的module节点,有小短线
      let inModuleConnection = this.getInModuleConnection(nodeId);
      let outModuleConnection = this.getOutModuleConnection(nodeId);
      const nodeBelongModule = node.belongModule;
      inModuleConnection.forEach(d => {
        let targetNode = this.nodeMap[d];
        let targetModule = targetNode.belongModule;
        if (!targetModule) {
          targetNode = targetNode as GroupNode;
          if (targetNode.isModule) {
            targetModule = d;
          }
        }
        if (!this.isSameScope(nodeBelongModule, targetModule)) {
          displayedInModuleConnection.add(targetModule);
        }
      })
      outModuleConnection.forEach(d => {
        let targetNode = this.nodeMap[d];
        let targetModule = targetNode.belongModule;
        if (!targetModule) {
          targetNode = targetNode as GroupNode;
          if (targetNode.isModule) {
            targetModule = d;
          }
        }
        if (!this.isSameScope(nodeBelongModule, targetModule)) {
          displayedOutModuleConnection.add(targetModule)
        }
      })
    }
    return {
      in: displayedInModuleConnection,
      out: displayedOutModuleConnection
    };
  }

  getInHiddenEdges(nodeId: string): ModuleEdge[] {
    const inModuleConnections = this.getInModuleConnection(nodeId)
    const currentNode = this.nodeMap[nodeId]
    const res: ModuleEdge[] = []
    for (const inModuleConnection of inModuleConnections) {
      const inModuleNode = this.nodeMap[inModuleConnection]
      let oldestUnexpandParent = this.nodeMap[this.findOldestUnexpandParentNodeId(inModuleConnection)]
      if (oldestUnexpandParent.belongModule !== inModuleNode.belongModule) {
        continue
      }
      const curNodeParentModule = (this.nodeMap[currentNode.belongModule] as GroupNode).parentModule;
      if (!((oldestUnexpandParent.type === NodeType.GROUP || oldestUnexpandParent.type === NodeType.LAYER)
        && (oldestUnexpandParent as GroupNode).isModule)) { 
        this.insertModuleEdge(res, oldestUnexpandParent.id, inModuleNode.belongModule)
      }
      this.insertModuleEdge(res, inModuleNode.belongModule, curNodeParentModule? curNodeParentModule : currentNode.belongModule)
      if (nodeId !== currentNode.belongModule) {
        this.insertModuleEdge(res, currentNode.belongModule, nodeId)
      } else if (curNodeParentModule) {
        this.insertModuleEdge(res, curNodeParentModule, nodeId);
      }
      
    }
    return res
  }
  getOutHiddenEdges(nodeId: string): ModuleEdge[] {
    const outModuleConnections = this.getOutModuleConnection(nodeId)
    const currentNode = this.nodeMap[nodeId]
    const res: ModuleEdge[] = []
    for (const outModuleConnection of outModuleConnections) {
      const outModuleNode = this.nodeMap[outModuleConnection]
      let oldestUnexpandParent = this.nodeMap[this.findOldestUnexpandParentNodeId(outModuleConnection)]
      if (oldestUnexpandParent.belongModule !== outModuleNode.belongModule) {
        continue
      }

      const curNodeParentModule = (this.nodeMap[currentNode.belongModule] as GroupNode).parentModule;
      if (nodeId !== currentNode.belongModule) {
        this.insertModuleEdge(res, nodeId, currentNode.belongModule)
      } else if (curNodeParentModule) {
        this.insertModuleEdge(res, nodeId, curNodeParentModule);
      }
      
      this.insertModuleEdge(res, curNodeParentModule ? curNodeParentModule : currentNode.belongModule, outModuleNode.belongModule)
      if (!((oldestUnexpandParent.type === NodeType.GROUP || oldestUnexpandParent.type === NodeType.LAYER)
        && (oldestUnexpandParent as GroupNode).isModule)) { 
        this.insertModuleEdge(res, outModuleNode.belongModule, oldestUnexpandParent.id)
      }
    }
    return res
  }

  private insertModuleEdge(moduleEdges: ModuleEdge[], source: NodeId, target: NodeId){
    let tempModuleEdge = moduleEdges.find(me => me.source === source && me.target === target)
    if (tempModuleEdge === undefined) {
      moduleEdges.push({ source, target, width: 1 })
    } else {
      tempModuleEdge.width += 1
    }
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

    while (parent && parent !== ROOT_SCOPE) {
      if (!this.nodeMap[parent]["expanded"]) {
        oldestUnexpandParent = parent;
      }
      parent = this.nodeMap[parent].parent;
    }
    return oldestUnexpandParent;
  }

  // 判断两个节点是否在同一个scope下
  private isSameScope(nodeId1: NodeId, nodeId2: NodeId): boolean{
    if (nodeId1 === nodeId2) return true;
    const node1ScopeArray = nodeId1.split('/'), node2ScopeArray = nodeId2.split('/');
    if (node1ScopeArray[0] === node2ScopeArray[0]) {
      return true;
    } else {
      return false;
    }
  }

  private isInterModule(nodeId1: NodeId, nodeId2: NodeId): boolean {
    const node1BelongModule = this.nodeMap[nodeId1].belongModule, node2BelongModule = this.nodeMap[nodeId2].belongModule;
    if (!node1BelongModule || !node2BelongModule) return false;
    const parent1 = this.nodeMap[node1BelongModule].parent, parent2 = this.nodeMap[node2BelongModule].parent;
    return (node1BelongModule !== node2BelongModule && parent1 === parent2) //同一scope下同一层的不同模块间的边
     || (node1BelongModule !== node2BelongModule && !this.isSameScope(nodeId1, nodeId2) && parent1 !== parent2) // 不同scope下的不同模块间的边
  }

  getDisplayedNodes(): NodeId[] {
    const displayedNodes: NodeId[] = [];
    this.rootNode.children.forEach(nodeId => {
      this.traverseChildren(this.nodeMap[nodeId], displayedNodes);
    })
    return displayedNodes
  }

  getDisplayedEdges(displayedNodes: NodeId[] = this.getDisplayedNodes(), interModule: boolean = true): RawEdge[] {
    const displayedEdges: RawEdge[] = []
    for (const edge of this.rawEdges) {
      if (!interModule && this.isInterModule(edge.source, edge.target)) {
        continue
      }
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

  private findInnerGraphNodeId(sourceNodeId,targetNodeId){
    let parent = this.nodeMap[targetNodeId].parent;
    if (sourceNodeId.includes(targetNodeId)) {
      return targetNodeId
    }
    while (parent && parent !== "___root___") {
      if (sourceNodeId.includes(parent)) {
        return parent
      }
      parent = this.nodeMap[parent].parent;
    }
    return null;
  }
  getInnerGraph(nodeId){
    let nodes = []
    let edges = [] 
    if(this.nodeMap[nodeId] instanceof OperationNodeImp){
        return nodeId
    }
    (this.nodeMap[nodeId] as GroupNode).children.forEach(nodeId => nodes.push(nodeId))
    for (const edge of this.rawEdges) {
      let source = this.findInnerGraphNodeId(nodes, edge.source);
      let target = this.findInnerGraphNodeId(nodes, edge.target);
      if(!source || !target ||source ===target){
        continue
      }
      edges.push({
        source,
        target
      })
    }
    return {
      nodes,
      edges
    }
  }
}