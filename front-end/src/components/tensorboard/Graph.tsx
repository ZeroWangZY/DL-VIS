import React, { useState, useEffect } from "react";
import "./Graph.css";
import GraphScene from "./GraphScene";
import { build as graphBuild, SlimGraph } from "../../common/tensorboard/graph";
import { build as hierarchyBuild } from '../../common/tensorboard/hierarchy'
import { build as renderBuild, RenderGraphInfo } from '../../common/tensorboard/render'
import { useTfRawGraph } from "../../store/tf-raw-graph";

const Graph: React.FC = () => {
  const tfRawGraph = useTfRawGraph()
  const [renderHierarchy, setRenderHierarchy] = useState<RenderGraphInfo>(null)
  useEffect(() => {
    if (tfRawGraph === null) return
    let graphPromise = new Promise<any>((resolve, reject) => {resolve(tfRawGraph)})
    graphPromise
      .then(graph => {
        return graphBuild(graph);
      })
      .then(graph => {
        return hierarchyBuild(graph as SlimGraph, {
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
  }, [tfRawGraph])

  return (
    <div className="container">
      <div className="vertical">
        <GraphScene renderHierarchy={renderHierarchy}></GraphScene>
      </div>
    </div>
  );
};

export default Graph;
