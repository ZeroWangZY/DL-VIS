import { RawGraph, RawNode } from "./parser";
import { wrapTaskWithTimeLogger } from "./utils";

async function _pruneByOutput(rawGraph: RawGraph): Promise<RawGraph> {
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

export const pruneByOutput: (rawGraph: RawGraph) => Promise<RawGraph>
  = wrapTaskWithTimeLogger(_pruneByOutput)

function buildDict(nodes: RawNode[]): Record<string, RawNode> {
  const dict: Record<string, RawNode> = {}
  nodes.forEach(node => {
    dict[node.name] = node
  })
  return dict
}