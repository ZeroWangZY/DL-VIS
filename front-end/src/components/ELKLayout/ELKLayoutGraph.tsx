import React, { useEffect, useRef } from "react";
import "./ELKLayoutGraph.css";
import * as d3 from "d3";
import ELK from "elkjs/lib/elk.bundled.js";
import ELKLayoutEdge from './ELKLayoutEdge'
import ELKLayoutNode from './ELKLayoutNode'
window["d3"] = d3;
window["ELK"] = ELK;

const ELKLayoutGraph: React.FC = () => {
  const svgRef = useRef();
  const outputRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const outputG = d3.select(outputRef.current);

    let zoom = d3.zoom().on("zoom", function () {
      outputG.attr("transform", d3.event.transform);
    });
    svg.call(zoom).on("dblclick.zoom", null);
  }, []);

  return (
    <div id="elk-graph" style={{ height: "100%" }}>
      <svg id="elk-svg" ref={svgRef} style={{ height: "100%" }}>
        <defs>
          <marker
            id="arrowhead"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerUnits="strokeWidth"
            markerWidth="8"
            markerHeight="6"
            orient="auto"
          >
            <path
              d="M 0 0 L 10 5 L 0 10 L 4 5 z"
              fill="#999999"
              stroke="#999999"
            ></path>
          </marker>
        </defs>
        <g className="output" id="output-g" ref={outputRef}>
          <ELKLayoutNode/>
          <ELKLayoutEdge/>
        </g>
      </svg>
    </div>
  );
};

export default ELKLayoutGraph;
