import { RawNode, RawGraph } from './raw-graph.tf.type';
import { wrapTaskWithTimeLogger } from "../utils";
import { SCOPE_DELIM } from '../stage2/processed-graph';


enum PatternType {
  NAME = "name",
  OP = "op",
  INPUT = "input",
};

// type AttrType = { key: string; value: Record<string, any> }[]
interface NodeMiddleware {
  (node: RawNode): ({
    shouldDelete: boolean;
    node: RawNode;
  });
};

interface GraphMiddleware {
  (graph: RawGraph): void;
}

// 这里规则的正则设计有待优化，很多情况。。。
const namePatterns: RegExp[] = [
  /gradients\//,
  /GradientDescent\//,
  /Adam/,
];

const opPatterns: RegExp[] = [
  /NoOp/,
];

const inputPatterns: RegExp[] = [];

const VariableSuffix = [
  "initial_value",
  "Assign",
  "read",
];

const cleanName = function(name: string): string {
  name = name.replace(/^\^/, "");
  let ret = name;
  let match = name.match(/(.*):(\w+:\d+)$/);
  // 这个变量暂时没用
  let outputTensorKey = '0';
  if (match) {
    // The output string consists of several characters and a number separated
    // by a colon.
    ret = match[1];
    outputTensorKey = match[2];
  } else {
    match = name.match(/(.*):(\d+)$/);
    if (match) {
      // The output string consists of a single number.
      ret = match[1];
      outputTensorKey = match[2];
    }
  }

  return ret;
}

const pruneByName = (node: RawNode, pattern: RegExp): boolean => {
  const value = node[PatternType.NAME];
  return pattern.test(value);
}

const pruneByOp = (node: RawNode, pattern: RegExp) => {
  const value = node[PatternType.OP];
  return pattern.test(value);
}

// input只要匹配中一个就返回true
const pruneByInput = (node: RawNode, pattern: RegExp) => {
  const inputs = node[PatternType.INPUT];
  let shouldDelete = false;
  for (let input of inputs) {
    shouldDelete = shouldDelete || pattern.test(input);
  }
  return shouldDelete;
}

const pruneByAttr = (node: RawNode, pattern: RegExp) => {
  // attr属性太复杂，目前先不考虑过滤
  return false;
}

const cleanNodeName: NodeMiddleware = (node: RawNode) => {
  node.name = cleanName(node.name);

  return {
    shouldDelete: false,
    node,
  };
}

const cleanNodeInput: NodeMiddleware = (node: RawNode) => {
  if (node.input && node.input.length) {
    node.input = node.input.map(n => cleanName(n));
  }

  return {
    shouldDelete: false,
    node,
  };
}

const renameVariable: NodeMiddleware = (node: RawNode) => {
  const srcPattern = /^VariableV2$/;
  const tgt = "Variable";
  node[PatternType.OP] = node[PatternType.OP].replace(srcPattern, tgt);

  return {
    shouldDelete: false,
    node,
  };
}

const pruneByDefaultPatterns: NodeMiddleware = (node: RawNode) => {
  for (let pattern of namePatterns) {
    if (pruneByName(node, pattern)) {
      return {
        shouldDelete: true,
        node,
      }
    }
  }

  for (let pattern of opPatterns) {
    if (pruneByOp(node, pattern)) {
      return {
        shouldDelete: true,
        node,
      }
    }
  }

  for (let pattern of inputPatterns) {
    if (pruneByInput(node, pattern)) {
      return {
        shouldDelete: true,
        node,
      }
    }
  }

  // TODO: 加对attr的过滤

  return {
    shouldDelete: false,
    node,
  }
}

function locateByAttr(graph: RawGraph, pattern: RegExp, attr: PatternType): number[] {
  const matchIndices: number[] = [];
  const nodes = graph.node;

  for (let i = 0, len = nodes.length; i < len; i += 1) {
    const value = nodes[i][attr];
    let isValid: boolean = false;
    if (typeof value === "string") {
      isValid = pattern.test(value);
    } else if (Array.isArray(value)) {
      isValid = (value as Array<string>).findIndex(v => pattern.test(v)) >= 0;
    }
    isValid && matchIndices.push(i);
  }

  return matchIndices;
}

function addInputs(node: RawNode, inputs: string | string[]) {
  node.input = node.input || [];
  inputs = inputs || [];
  const originalInputs = new Set(node.input);
  if (!Array.isArray(inputs)) {
    inputs = [inputs];
  }
  for (let input of inputs) {
    originalInputs.add(input);
  }
  node.input = Array.from(originalInputs);
}

function deleteInputs(node: RawNode, inputs: string | string[]) {
  node.input = node.input || [];
  inputs = inputs || [];
  if (!Array.isArray(inputs)) {
    inputs = [inputs];
  }
  node.input = node.input.filter(input => !inputs.includes(input));
}

function deleteNodes(graph: RawGraph, indices: number[]) {
  // 节点关联的input也要删掉
  for (let index of indices) {
    const node = graph.node[index];
    const name = node.name;
    graph.node.forEach(n => deleteInputs(n, name));
  }
  graph.node = graph.node.filter((_, idx) => !indices.includes(idx));
}

// Replace nodes with node. Edges incoming to nodes[0] are connected to
// the new node, and nodes outgoing from nodes[-1] become outgoing from
// the new node.
function replace(graph: RawGraph, srcNodeIndices: number[], nodeIndex: number): number[] {
  const len = srcNodeIndices.length;
  if (!len || (len === 1 && srcNodeIndices[0] === nodeIndex)) {
    return;
  }

  const nodes = graph.node;
  const firstNode = nodes[srcNodeIndices[0]];
  const lastNode = nodes[srcNodeIndices[len - 1]];
  const tgtNode = nodes[nodeIndex];

  // 改掉起点的输入
  addInputs(tgtNode, firstNode.input);

  // 改掉所有输入包含终点的节点的输入
  const outputIndices = locateByAttr(graph, new RegExp(`^${lastNode.name}$`), PatternType.INPUT);
  for (let outputIndex of outputIndices) {
    addInputs(nodes[outputIndex], tgtNode.name)
  }

  // 删掉被替换的所有节点及其关联信息
  srcNodeIndices = srcNodeIndices.filter(idx => idx !== nodeIndex);
  return srcNodeIndices;
}

const replaceVariable: GraphMiddleware = (graph: RawGraph) => {
  let indices = locateByAttr(graph, new RegExp(`^Variable$`), PatternType.OP);
  let nodeToDelete: number[] = [];

  for (let index of indices) {
    // 还是得根据这个前缀找其它的，包括initial_value, Assign, Identity
    const varName = graph.node[index].name;
    let siblings: number[] = [];

    VariableSuffix.forEach(suffix => {
      const pattern = new RegExp(`^${varName}${SCOPE_DELIM}${suffix}$`);
      const siblingIdx = locateByAttr(graph, pattern, PatternType.NAME);
      siblings = siblings.concat(siblingIdx);
    });

    const srcNodeIndices = [index, ...siblings];
    nodeToDelete = nodeToDelete.concat(replace(graph, srcNodeIndices, index));
  }

  deleteNodes(graph, nodeToDelete);
}

const pruneByOutput: GraphMiddleware = (rawGraph: RawGraph) => {
  let nodes: RawNode[] = rawGraph.node
  const nodeDict = buildDict(nodes)
  const outputNodes = nodes.filter(node => {
    return node.name.slice(-12, node.name.length) === '___output___'
  })

  if (outputNodes.length === 0) return rawGraph

  const stack = outputNodes.map(node => node.name)
  const resNodes = outputNodes
  while (stack.length !== 0) {
    const nodeName = stack.pop()
    if (nodeDict[nodeName] !== null) {
      const inputs = nodeDict[nodeName].input
      if (inputs === undefined) continue
      inputs.forEach(input => {
        if (nodeDict[input] === null) return
        resNodes.push(nodeDict[input])
        stack.push(input)
      })
      nodeDict[nodeName] = null
    }
  }
  rawGraph.node = resNodes
  return rawGraph
}

function buildDict(nodes: RawNode[]): Record<string, RawNode> {
  const dict: Record<string, RawNode> = {}
  nodes.forEach(node => {
    dict[node.name] = node
  })
  return dict
}


export class RawGraphOptimizer {
  // TODO
  nodeMiddlewares: NodeMiddleware[];
  graphMiddlewares: GraphMiddleware[];
  
  constructor(preprocessingPlugins) {
    // TODO
    if(preprocessingPlugins === null) {
      this.nodeMiddlewares = [
        pruneByDefaultPatterns,
        cleanNodeName,
        cleanNodeInput,
        renameVariable,
      ];
  
      this.graphMiddlewares = [
        pruneByOutput,
        replaceVariable,
      ]
    } else {
      this.nodeMiddlewares = [
        cleanNodeName,
        cleanNodeInput,
      ];
      this.graphMiddlewares = []

      if(preprocessingPlugins.pruneByOutput) {
        this.graphMiddlewares.push(pruneByOutput)
      }
      if(preprocessingPlugins.replaceVariable) {
        this.graphMiddlewares.push(replaceVariable)
      }
      if(preprocessingPlugins.pruneByDefaultPatterns) {
        this.nodeMiddlewares.push(pruneByDefaultPatterns)
      }
      if(preprocessingPlugins.renameVariable) {
        this.nodeMiddlewares.push(renameVariable)
      }
    }
    
  }

  useNodeMiddleware(middleware: NodeMiddleware) {
    this.nodeMiddlewares.push(middleware);
  }

  useGraphMiddleware(middleware: GraphMiddleware) {
    this.graphMiddlewares.push(middleware);
  }

  optimize(graph: RawGraph): RawGraph {
    const { node: nodes } = graph;
    const { nodeMiddlewares, graphMiddlewares } = this;
    let nodesToDelete: Set<number> = new Set();

    for (let i = 0, len1 = nodes.length; i < len1; i += 1) {
      let shouldDelete = false;
      let newNode = null;
      let node = nodes[i];

      for (let j = 0, len2 = nodeMiddlewares.length; j < len2; j += 1) {
        let result = nodeMiddlewares[j](node);
        shouldDelete = result.shouldDelete;
        newNode = result.node;
        if (shouldDelete) {
          nodesToDelete.add(i);
          break;
        }
      }
    }

    deleteNodes(graph, Array.from(nodesToDelete));

    graphMiddlewares.forEach(middleware => middleware(graph));

    return graph;
  }

  withTracker() {
    return (graph: RawGraph): Promise<RawGraph> => {
      return wrapTaskWithTimeLogger(this.optimize).call(this, graph);
    };
  }

};
