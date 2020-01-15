import React from "react";
import { getDemoGraphAPI } from "../api/graph";
import "./Graph.css";
import GraphScene from "./GraphScene";

const Graph: React.FC = () => {
  getDemoGraphAPI();
  const title = "main graph";
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
