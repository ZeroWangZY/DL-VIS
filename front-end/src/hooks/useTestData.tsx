/* eslint-disable react/react-in-jsx-scope */
import { useEffect, useState } from "react";
import { fetchAndParseGraphData } from "../common/graph-processing/parser";
import { SimplifierImp } from "../common/graph-processing/simplifier";
import { pruneByOutput } from "../common/graph-processing/prune";


export const useTestRawGraph = (needPruner: boolean = false, needSimplifier: boolean = false) => {
  const [RawGraph, setRawGraph] = useState(null)

  useEffect(() => {
    const graph = fetchAndParseGraphData(
      process.env.PUBLIC_URL + 'data/mnist-conv.pbtxt',
      null
    )
      .then(graph => {
        if (needPruner)
          return pruneByOutput(graph);
        else
          return graph
      })
      .then(graph => {
        if (needSimplifier) {
          const simplifier = new SimplifierImp();
          return simplifier.withTracker()(graph);
        } else {
          return graph
        }
      })
    setRawGraph(graph)
  }, [])

  return RawGraph;
}
