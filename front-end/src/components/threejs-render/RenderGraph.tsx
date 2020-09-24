import React from "react";
import Graph from "./Graph";
import "./RenderGraph.css";

const RenderGraph: React.FC = () => {
  return (
    <div className="contanier">
      <button className="button1" id="zoomout">
        双击画布放大 点此处缩小
      </button>
      <Graph />
    </div>
  );
};

export default RenderGraph;
