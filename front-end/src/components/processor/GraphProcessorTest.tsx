// 此文件仅用于测试

import { fetchAndParseGraphData, RawGraph } from "../../common/graph-processing/parser";
import { pruneByOutput } from "../../common/graph-processing/prune";

export const graphProcessorTester = async () => {
  const graphUrl = {
    bert: '/data/bert-graph.pbtxt',
    graph1: '/data/test-graph-1.pbtxt',
    graph2: '/data/test-graph-2.pbtxt',
    conv: '/data/test-conv.pbtxt'
  }
  const url = process.env.PUBLIC_URL + graphUrl['conv']
  let graph: RawGraph = await fetchAndParseGraphData(url, null)
  graph = await pruneByOutput(graph)
  return graph
};