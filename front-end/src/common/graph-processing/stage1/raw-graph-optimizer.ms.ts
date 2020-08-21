import { RawNode, RawGraph } from "./raw-graph.ms.type";

const BACKBONE_PATTERNS: Set<string[]> = new Set([
  ['Default', 'network', 'backbone'],
  ['Default', 'network', 'bert']
])

// 发现ms图中有大量tuple_getitem算子，且意义不大，此方法用于去除这些算子
function pruneTupleGetItem(rawGraph: RawGraph): void {
  const targetsMap: { [source: string]: RawNode[] } = _buildTargetsMap(
    rawGraph
  );
  const { node } = rawGraph;
  for (let i = 0; i < node.length; i++) {
    if (node[i].opType === "tuple_getitem") {
      for (const target of targetsMap[node[i].name]) {
        // 删除tuple_getitem算子的target节点关于tuple_getitem的input
        for (let j = 0; j < target.input.length; j++) {
          const inputOfTarget = target.input[j];
          if (inputOfTarget.name === node[i].name) {
            target.input.splice(j, 1);
            j--;
          }
        }
        // 在tuple_getitem算子的target节点中增加tuple_getitem算子input
        for (const input of node[i].input) {
          target.input.push(input);
        }
      }
      node.splice(i, 1);
      i--;
    }
  }
}

function _buildTargetsMap(rawGraph: RawGraph): { [id: string]: any } {
  const resDict: { [source: string]: RawNode[] } = {};
  const { node } = rawGraph;
  for (const n of node) {
    if (!n.input) continue;
    for (const source of n.input) {
      if (resDict[source.name]) {
        resDict[source.name].push(n);
      } else {
        resDict[source.name] = [n];
      }
    }
  }
  return resDict;
}

function keepOnlyBackbone(rawGarph: RawGraph) {
  const regexPattern = _genBackboneRegex()

  // 仅保留backbone里的节点
  const reservedNodes: RawNode[] = []
  for (const n of rawGarph.node) {
    if (n.scope.search(regexPattern) !== -1) {
      reservedNodes.push(n)
    }
  }
  rawGarph.node = reservedNodes

  // 清理const 和 parameter
  const existConstsAndParameters = new Set()
  const reservedConsts = []
  const reservedParameters = []
  for (const node of rawGarph.node) {
    for (const input of node.input) {
      existConstsAndParameters.add(input)
    }
  }
  for (const cst of rawGarph.constVals) {
    if (existConstsAndParameters.has(cst.key)) {
      reservedConsts.push(cst)
    }
  }
  for (const para of rawGarph.parameters) {
    if (existConstsAndParameters.has(para.name)) {
      reservedParameters.push(para)
    }
  }
  rawGarph.constVals = reservedConsts
  rawGarph.parameters = reservedParameters

  // 清理node里的input
  const reservedInput: Set<string> = new Set()
  rawGarph.node.forEach(node => reservedInput.add(node.name))
  rawGarph.constVals.forEach(cst => reservedInput.add(cst.key))
  rawGarph.parameters.forEach(para => reservedInput.add(para.name))
  for (const node of rawGarph.node) {
    const newInput = []
    for (const input of node.input) {
      if (reservedInput.has(input.name)) {
        newInput.push(input)
      }
    }
    node.input = newInput
  }
}

function _genBackboneRegex(): string {
  let regexPattern = ''
  for (const pattern of BACKBONE_PATTERNS) {
    regexPattern += '(^'
    for (const p of pattern) {
      regexPattern += p + ".*"
    }
    regexPattern += ')|'
  }
  return regexPattern.slice(0, -1)
}

export default class msRawGraphOptimizer {
  msRawGraphOptimizers = [];

  constructor() {
    this.msRawGraphOptimizers = [
      pruneTupleGetItem,
      keepOnlyBackbone,
    ];
  }

  optimize(rawGraph: RawGraph) {
    console.log(rawGraph)
    this.msRawGraphOptimizers.forEach((optimizer) => {
      optimizer(rawGraph);
    });
  }
}
