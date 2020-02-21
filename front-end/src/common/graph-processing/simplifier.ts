import { RawNode, RawGraph } from './parser';
import { wrapTaskWithTimeLogger } from "./utils";
import { SCOPE_DELIM } from '../../types/processed-graph';


enum PatternType {
  NAME = "name",
  OP = "op",
  INPUT = "input",
};

// type AttrType = { key: string; value: Record<string, any> }[]

interface PatternDef {
  test: PatternType;
  rules: RegExp[];
};

const namePatternsDict: PatternDef = {
  test: PatternType.NAME,
  rules: [
    /gradients/,
    /^GradientDescent/,
    /Adam/,
  ]
};

const opPatternsDict: PatternDef = {
  test: PatternType.OP,
  rules: [
    /NoOp/,
  ]
};

const VariableSuffix = [
  "initial_value",
  "Assign",
  "read",
];

export class SimplifierImp {
  // TODO
  defaultPatterns: PatternDef[];
  indicesToDelete: Set<number>;
  
  constructor() {
    // TODO
    this.defaultPatterns = [
      namePatternsDict,
      opPatternsDict,
    ];

    this.indicesToDelete = new Set();
  }

  deepcopy(graph: RawGraph): RawGraph {
    return JSON.parse(JSON.stringify(graph)) as RawGraph;
  }

  simplify(graph: RawGraph, patterns?: PatternDef[]): RawGraph {
    let ret = this.deepcopy(graph);

    this.cleanInputs(ret);

    const $patterns = patterns ? patterns : this.defaultPatterns;
    for (let {test, rules} of $patterns) {
      rules.forEach(rule => this.pruneByAttr(ret, rule, test));
    }

    this.replaceVariable(ret);

    const indicesToDelete = Array.from(this.indicesToDelete);
    this.deleteNodes(ret, indicesToDelete);

    return ret;
  }

  withTracker() {
    return (graph: RawGraph): Promise<RawGraph> => {
      return wrapTaskWithTimeLogger(this.simplify).call(this, graph);
    };
  }

  cleanInputs(graph: RawGraph) {
    graph.node.forEach(node => {
      if (!node.input) {
        return;
      }
      node.input = node.input.map(n => {
        let inputName = n.replace(/^\^/, "");
        let name = inputName;
        // 复制过来的，outputTensorKey暂时没用
        let match = inputName.match(/(.*):(\w+:\d+)$/);
        let outputTensorKey = '0';
        if (match) {
          // The output string consists of several characters and a number separated
          // by a colon.
          name = match[1];
          outputTensorKey = match[2];
        } else {
          match = inputName.match(/(.*):(\d+)$/);
          if (match) {
            // The output string consists of a single number.
            name = match[1];
            outputTensorKey = match[2];
          }
        }
        return name;
      });
    });
  }

  addDeletion(index: number | number[]) {
    if (typeof index === "number") {
      index = [index]
    }
    for (let i of index) {
      this.indicesToDelete.add(i);
    }
  }

  deleteNodes(graph: RawGraph, indices: number[]) {
    graph.node = graph.node.filter((_, idx) => !indices.includes(idx));
  }

  pruneByAttr(graph: RawGraph, pattern: RegExp, attr: PatternType) {
    graph.node.forEach((node, index) => {
      const value = node[attr];
      let shouldDelete = false;
      if (typeof value === "string") {
        shouldDelete = pattern.test(value);
      } else if (Array.isArray(value)) {
        shouldDelete = value.findIndex(v => pattern.test(v)) >= 0;
      }
      shouldDelete && this.addDeletion(index);
    });
  }

  // 例如他VariableV2改成Variable
  renameByAttr(graph: RawGraph, srcPattern: RegExp, tgt: string, attr: PatternType) {
    graph.node.forEach(node => {
      const value = node[attr];
      if (typeof value === "string") {
        if (srcPattern.test(value)) {
          (node[attr] as string) = value.replace(srcPattern, tgt);
        }
      } else if (Array.isArray(value)) {
        for (let i = 0, len = value.length; i < len; i += 1) {
          if (srcPattern.test(value[i])) {
            value[i] = value[i].replace(srcPattern, tgt);
          }
        }
      }
    });
  }

  locateByAttr(graph: RawGraph, pattern: RegExp, attr: PatternType): number[] {
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

  // Replace nodes with node. Edges incoming to nodes[0] are connected to
  // the new node, and nodes outgoing from nodes[-1] become outgoing from
  // the new node.
  replace(graph: RawGraph, srcNodeIndices: number[], nodeIndex: number) {
    const len = srcNodeIndices.length;
    if (!len || (len === 1 && srcNodeIndices[0] === nodeIndex)) {
      return;
    }

    const nodes = graph.node;
    const firstNode = nodes[srcNodeIndices[0]];
    const lastNode = nodes[srcNodeIndices[len - 1]];
    const tgtNode = nodes[nodeIndex];

    // 改掉起点的输入
    this.addInputs(tgtNode, firstNode.input);

    // 改掉所有输入包含终点的节点的输入
    const outputIndices = this.locateByAttr(graph, new RegExp(`^${lastNode.name}$`), PatternType.INPUT);
    for (let outputIndex of outputIndices) {
      this.addInputs(nodes[outputIndex], tgtNode.name)
    }

    // 删掉被替换的所有节点及其关联信息
    srcNodeIndices = srcNodeIndices.filter(idx => idx !== nodeIndex);
    this.addDeletion(srcNodeIndices);
    for (let srcNodeIndex of srcNodeIndices) {
      const srcNode = nodes[srcNodeIndex];
      const srcNodesOutputs = this.locateByAttr(graph, new RegExp(`^${srcNode.name}$`), PatternType.INPUT);
      for (let srcNodesOutput of srcNodesOutputs) {
        this.deleteInputs(nodes[srcNodesOutput], srcNode.name);
      }
    }
  }

  deleteInputs(node: RawNode, inputs: string | string[]) {
    node.input = node.input || [];
    inputs = inputs || [];
    if (!Array.isArray(inputs)) {
      inputs = [inputs];
    }
    node.input = node.input.filter(input => !inputs.includes(input));
  }

  addInputs(node: RawNode, inputs: string | string[]) {
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

  // 用于删Variable的场景
  replaceVariable(graph: RawGraph) {
    const srcPattern = /^VariableV2$/;
    const tgt = "Variable";
    const test = PatternType.OP;
    this.renameByAttr(graph, srcPattern, tgt, test);

    let indices = this.locateByAttr(graph, new RegExp(`^${tgt}$`), test);
    for (let index of indices) {
      // 还是得根据这个前缀找其它的，包括initial_value, Assign, Identity
      const varName = graph.node[index].name;
      let siblings: number[] = [];
      VariableSuffix.forEach(suffix => {
        const pattern = new RegExp(`^${varName}${SCOPE_DELIM}${suffix}$`);
        const siblingIdx = this.locateByAttr(graph, pattern, PatternType.NAME);
        siblings = siblings.concat(siblingIdx);
      });
      const srcNodeIndices = [index, ...siblings];
      this.replace(graph, srcNodeIndices, index);
    }
  }
};