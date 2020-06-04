import React, { useState, useEffect } from "react";
import { useGlobalConfigurations } from "../../store/global-configuration";
import { buildMsGraph } from "../../common/graph-processing/stage2/build-graph.ms";
import { useMsRawGraph } from "../../store/rawGraph.ms";
import { setProcessedGraph } from "../../store/processedGraph";
import ProcessedGraphOptimizer from "../../common/graph-processing/stage2/processed-graph-optimizer";
import { useTfRawGraph } from "../../store/rawGraph.tf";
import { buildGraph } from "../../common/graph-processing/stage2/build-graph.tf";

export default function useGraphPipeline() {

  const { preprocessingPlugins, currentLayout, shouldOptimizeProcessedGraph } = useGlobalConfigurations();
  const msRawGraph = useMsRawGraph()
  const tfRawGraph = useTfRawGraph()

  // MsRawGraph --> ProcessedGraph
  useEffect(() => {
    if (!msRawGraph) return

    console.log("start: MsRawGraph --> ProcessedGraph")
    const hGraph = buildMsGraph(msRawGraph);
    if (shouldOptimizeProcessedGraph) {
      const processedGraphOptimizer = new ProcessedGraphOptimizer();
      processedGraphOptimizer.optimize(hGraph);
    }
    setProcessedGraph(hGraph);
    console.log("end: MsRawGraph --> ProcessedGraph")

  }, [msRawGraph, shouldOptimizeProcessedGraph]);

  // TfRawGraph --> ProcessedGraph
  useEffect(() => {
    if (!tfRawGraph) return

    buildGraph(tfRawGraph).then(pGraph => {
      if (shouldOptimizeProcessedGraph) {
        const processedGraphOptimizer = new ProcessedGraphOptimizer();
        processedGraphOptimizer.optimize(pGraph);
      }
      setProcessedGraph(pGraph);
    })
    
  }, [tfRawGraph, shouldOptimizeProcessedGraph]);

  // TODO: ProcessedGraph --> VisGraph

  // TODO: VisGraph --> LayoutGraph

  // TODO: LayoutGraph --> StyledGraph


}
