import React, { useState, useEffect } from "react";
import "./Graph.css";
import GraphScene from "./GraphScene";
import { build as graphBuild } from "../../common/tensorboard/graph";
import { build as hierarchyBuild } from '../../common/tensorboard/hierarchy'
import { build as renderBuild, RenderGraphInfo } from '../../common/tensorboard/render'
import { useTestRawGraph } from "../../hooks/useTestData";

const Graph: React.FC = () => {
  const testRawGraph = useTestRawGraph(false, false)
  const [renderHierarchy, setRenderHierarchy] = useState<RenderGraphInfo>(null)
  useEffect(() => {
    if (testRawGraph === null) return
    testRawGraph
      .then(graph => {
        return graphBuild(graph);
      })
      .then(graph => {
        return hierarchyBuild(graph, {
          verifyTemplate: true,
          seriesNodeMinSize: 5,
          seriesMap: {},
        })
      })
      .then(graphHierarchy => {
        return renderBuild(graphHierarchy)
      })
      .then(renderHierarchy => {
        setRenderHierarchy(renderHierarchy)
      });
  }, [testRawGraph])

  return (
    <div className="container">
      <div className="vertical">
        <GraphScene renderHierarchy={renderHierarchy}></GraphScene>
      </div>
    </div>
  );
};

export default Graph;
