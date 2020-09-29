import React from "react";
import Graph from "./Graph";
import "./RenderGraph.css";

const RenderGraph: React.FC = () => {
  return (
    <div className="contanier" style={{ height: "100%" }}>
      <Graph />
    </div>
  );
};

export default RenderGraph;
