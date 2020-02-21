import React, { useState, useEffect } from "react";
import "./Graph.css";
import GraphScene from "./GraphScene";
import { fetchAndParseGraphData } from "../../common/tensorboard/parser";
import { build as graphBuild } from "../../common/tensorboard/graph";
import { build as hierarchyBuild } from '../../common/tensorboard/hierarchy'
import { build as renderBuild, RenderGraphInfo } from '../../common/tensorboard/render'
import { pruneByOutput } from "../../common/graph-processing/prune";
import { SimplifierImp } from "../../common/graph-processing/simplifier";
import { buildGraph } from "../../common/graph-processing/graph";

const Graph: React.FC = () => {
  const [renderHierarchy, setRenderHierarchy] = useState<RenderGraphInfo>(null)
  let hierarchyParams = {
    verifyTemplate: true,
    seriesNodeMinSize: 5,
    seriesMap: {},
  };
  useEffect(() => {
    const bert = '/data/bert-graph.pbtxt'
    const graph1 = '/data/test-graph-1.pbtxt'
    const graph2 = '/data/test-graph-2.pbtxt'
    const conv = '/data/test-conv.pbtxt'
    const variableTest2 = '/data/variable-test2.pbtxt'
    const variableTest3 = '/data/variable-test3.pbtxt'
    fetchAndParseGraphData(
      process.env.PUBLIC_URL + conv,
      null
    )
      .then(graph => {
        return pruneByOutput(graph);
      })
      .then(graph => {
        const simplifier = new SimplifierImp();
        return simplifier.withTracker()(graph);
      })
      .then(async graph => {
        const hGraph = await buildGraph(graph);
        return graphBuild(graph);
      })
      .then(graph => {
        return hierarchyBuild(graph, hierarchyParams)
      })
      .then(graphHierarchy => {
        return renderBuild(graphHierarchy)
      })
      .then(renderHierarchy => {
        setRenderHierarchy(renderHierarchy)
      });
  }, [])

  return (
    <div className="container">
      <div className="vertical">
        <GraphScene renderHierarchy={renderHierarchy}></GraphScene>
      </div>
    </div>
  );
};

export default Graph;
