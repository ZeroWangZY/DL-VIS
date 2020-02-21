// 这里开始从pb(即RawGraph)构建数据结构
import { RawGraph, RawNode } from "./parser";
import { 
  NodeDef,
  AbstractNode,
  LayerType,
  OperationNode,
  GroupNode,
  LayerNode, 
  DataNode, 
  DataType,
  ProcessedGraph,
  OperationNodeImp,
  GroupNodeImp,
  DataNodeImp,
  LayerNodeImp,
  ProcessedGraphImp,
  SCOPE_DELIM, 
  END_PATTERNS, 
  VARIABLE_PATTERNS, 
  LAYER_PATTERNS,
} from "../../types/processed-graph";
import { wrapTaskWithTimeLogger } from "./utils";


function testInputOutput(name: string): [number, string] {
  if (!name) {
    return [-1, name];
  }
  const scope = name.split(SCOPE_DELIM);
  const tgt = scope[scope.length - 1];
  const { INPUT, OUTPUT } = END_PATTERNS;
  if (INPUT.test(tgt)) {
    return [DataType.INPUT, tgt.replace(INPUT, "")];
  }
  if (OUTPUT.test(tgt)) {
    return [DataType.OUTPUT, tgt.replace(OUTPUT, "")];
  }
  return [-1, tgt];
}


function testVariable(op: string) {
  // 所有都重命名过了，只有Variable
  return VARIABLE_PATTERNS.test(op);
}


function buildBasicNode(rNode: RawNode): OperationNode | DataNode {
  const { name, op } = rNode;
  const [dataType, displayedName] = testInputOutput(name);
  const opts = {displayedName};
  if (dataType >= 0) {
    return new DataNodeImp({
      id: name,
      dataType,
      opts,
    });
  }
  if (testVariable(op)) {
    return new DataNodeImp({
      id: name,
      dataType: DataType.VARIABLE,
      opts,
    });
  }
  return new OperationNodeImp({
    id: name,
    op,
    opts,
  });
}

function genUniqueName(name: string): string {
  const splitedScope = name.split(SCOPE_DELIM);
  return `${name}${SCOPE_DELIM}(${splitedScope[splitedScope.length - 1]})`;
}


function genParentScope(name: string): string[] {
  const parentScope: string[] = [];
  if (!name) {
    return parentScope;
  }
  const splitedScope = name.split(SCOPE_DELIM);
  parentScope.push(splitedScope[0]);
  for (let i = 1, len = splitedScope.length; i < len; i += 1) {
    const prevScope = parentScope[i - 1];
    const curScope = splitedScope[i];
    parentScope.push(`${prevScope}${SCOPE_DELIM}${curScope}`);
  }
  return parentScope;
}


function genNameMap(oldNames: string[]): {[oldName: string]: string} {
  oldNames = (oldNames || []).sort();
  let nameMap: {[oldName: string]: string} = Object.create(null);

  for (let i = 0, len = oldNames.length; i < len - 1; i += 1) {
    const oldName = oldNames[i];
    for (let j = i + 1; j < len; j += 1) {
      const nxName = oldNames[j];
      if (!nxName.startsWith(oldName)) {
        break;
      }
      if (nxName.slice(0, oldName.length + 1) === `${oldName}${SCOPE_DELIM}`) {
        nameMap[oldName] = genUniqueName(oldName);
        break;
      }
    }
  }
  return nameMap;
}


// 重命名name，使得每个名字唯一
function uniquifyRawGraph(rGraph: RawGraph) {
  const rNodes = rGraph.node;
  const oldNames = rNodes.map(d => d.name);
  const nameMap = genNameMap(oldNames);

  for (let rNode of rNodes) {
    const inputs = rNode.input || [];
    rNode.name = nameMap[rNode.name] || rNode.name;
    if (inputs.length) {
      rNode.input = inputs.map(d => nameMap[d] || d);
    }
  }
}


function _buildGraph(rGraph: RawGraph): ProcessedGraph {
  // TODO: versions先不管了
  uniquifyRawGraph(rGraph);
  const pGraph = new ProcessedGraphImp();
  const rNodes = rGraph.node;
  for (let rNode of rNodes) {
    const pNode = buildBasicNode(rNode);
    pGraph.nodeMap[pNode.id] = pNode;

    const inputs = rNode.input || [];
    for (let input of inputs) {
      pGraph.rawEdges.push({
        source: input,
        target: pNode.id
      });
    }
  }
  // return pGraph;

  let hGraph = buildHierarchy(pGraph);
  logHierarchy(hGraph);

  return pGraph;
}

export function buildGraph(rGraph: RawGraph): Promise<ProcessedGraph> {
  return wrapTaskWithTimeLogger(_buildGraph)(rGraph);
}


export function buildHierarchy(pGraph: ProcessedGraph): ProcessedGraph {
  const nodeMap = pGraph.nodeMap;
  const names = Object.keys(nodeMap);

  for (let name of names) {
    let prevNode: AbstractNode = pGraph.rootNode;
    const parentScope = genParentScope(name);
    for (let i = 0, len = parentScope.length; i < len; i += 1) {
      const curNodeName = parentScope[i];
      const curNode = !nodeMap[curNodeName] ? buildAbstractNode(curNodeName) : nodeMap[curNodeName];
      nodeMap[curNodeName] = curNode;
      prevNode.children.add(curNodeName);
      curNode.parent = prevNode.id;
      prevNode = curNode as AbstractNode;
    }
  }
  return pGraph;
}


function testLayerType(name: string): [string, string] {
  for (let [key, pattern] of Object.entries(LAYER_PATTERNS)) {
    if (pattern.test(name)) {
      return [key, name.replace(pattern, "")];
    }
  }
  return ["", name];
}


function buildAbstractNode(name: string): AbstractNode {
  let splitedScope = name.split(SCOPE_DELIM);
  const tgtName = splitedScope[splitedScope.length - 1];
  const [layerType, displayedName] = testLayerType(tgtName);
  const opts = {displayedName};
  if (layerType) {
    return new LayerNodeImp({
      id: name,
      layerType: layerType as LayerType,
      opts,
    });
  }
  return new GroupNodeImp({
    id: name,
    opts,
  });
}

function logHierarchy(hGraph: ProcessedGraph) {
  function _buildLog(root: any): any {
    const log = {
      name: root.id,
      type: root.type,
      children: [],
    }
    if (Array.isArray(root.children)) {
      for (let child of root.children) {
        (log.children as any).push(_buildLog(hGraph.nodeMap[child]));
      }
    }
    return log;
  }

  function _Set2JSON(key: any, value: any) {
    if (typeof value === 'object' && value instanceof Set) {
      return Array.from(value);
    }
    return value;
  }

  let root = hGraph.rootNode;
  console.log(JSON.stringify(hGraph, _Set2JSON, 2));
}