import React from "react";
import "./Graph.css";
import GraphScene from "./GraphScene";
import { fetchAndParseGraphData } from "../common/graph/parser";
import { build as graphBuild } from "../common/graph/graph";
import { build as hierarchyBuild } from '../common/graph/hierarchy'
import { build as renderBuild } from '../common/graph/render'
import { checkOpsForCompatibility } from "../common/graph/op";

const Graph: React.FC = () => {
  const title = "main graph";
  let hierarchyParams = {
    verifyTemplate: true,
    seriesNodeMinSize: 5,
    seriesMap: {},
  };
  fetchAndParseGraphData(
    process.env.PUBLIC_URL + "/data/test-graph-1.pbtxt",
    null
  )
    .then(graph => {
      if (!graph.node) {
        throw "The graph is empty. Make sure that the graph is passed to the " +
        "tf.summary.FileWriter after the graph is defined.";
      }
      let refEdges: Record<string, boolean> = {};
      refEdges["Assign 0"] = true;
      refEdges["AssignAdd 0"] = true;
      refEdges["AssignSub 0"] = true;
      refEdges["assign 0"] = true;
      refEdges["assign_add 0"] = true;
      refEdges["assign_sub 0"] = true;
      refEdges["count_up_to 0"] = true;
      refEdges["ScatterAdd 0"] = true;
      refEdges["ScatterSub 0"] = true;
      refEdges["ScatterUpdate 0"] = true;
      refEdges["scatter_add 0"] = true;
      refEdges["scatter_sub 0"] = true;
      refEdges["scatter_update 0"] = true;
      let buildParams = {
        enableEmbedding: true,
        inEmbeddingTypes: ["Const"],
        outEmbeddingTypes: ["^[a-zA-Z]+Summary$"],
        refEdges: refEdges
      };
      return graphBuild(graph, buildParams);
    })
    .then(graph => {
      checkOpsForCompatibility(graph)
      return hierarchyBuild(graph, hierarchyParams)
    })
    .then(graphHierarchy => {
      return renderBuild(graphHierarchy)
    })
    .then(renderHierarchy => {
      console.log("renderHierarchy: ", renderHierarchy)
    });

  return (
    <div className="container">
      <div className="vertical">
        <h2>{title}</h2>
        {/* <graph-scene
          id="scene"
          className="auto"
          render-hierarchy="[[renderHierarchy]]"
          highlighted-node="[[_getVisible(highlightedNode)]]"
          selected-node="{{selectedNode}}"
          color-by="[[colorBy]]"
          progress="[[progress]]"
          node-names-to-health-pills="[[nodeNamesToHealthPills]]"
          health-pill-step-index="{{healthPillStepIndex}}"
        ></graph-scene> */}
        <GraphScene></GraphScene>
      </div>
    </div>
  );
};

export default Graph;
