import React, { useEffect, useRef } from "react";
import { TransitionMotion } from "react-motion";
import { useStyledGraph } from "../../store/styledGraph";
import ELK from "elkjs/lib/elk.bundled.js";
import * as d3 from "d3";

const ELKLayoutPort: React.FC = () => {
  const styledGraph = useStyledGraph();
  const svg = d3.select("#output-svg");
  const fill = "#6791A7",
    stroke = "#666666",
    strokeWidth = "1";
  const lineFunction = d3
    .line()
    .x((d) => d[0])
    .y((d) => d[1]);
  return (
    <TransitionMotion
      styles={styledGraph === null ? [] : styledGraph.portStyles}
    >
      {(interpolatedStyles) => (
        <g className="ports">
          {interpolatedStyles.map((d) => {
            return (
              <g
                key={d.key}
                id={d.data.id4Style}
                transform={`translate(${d.style.gNodeTransX}, ${d.style.gNodeTransY})`}
                onMouseEnter={() => {
                  for (let i = 0; i < d.data.hiddenEdges.length; i++) {
                    const { source, target } = d.data.hiddenEdges[i];
                    const edgeName = `${source}to${target}`;
                    if (!svg.selectAll(`.${edgeName}`).empty()) {
                      continue;
                    }
                    let x = 0,
                      y = 0,
                      width = 0,
                      height = 0;
                    const sourceElement = d3.select(`#${source}`).node() as any;
                    ({ width, height } = sourceElement.getBBox());
                    [x, y] = sourceElement
                      .getAttribute("transform")
                      .slice(10, -1)
                      .split(", ")
                      .map((v) => parseInt(v));
                    const sourceBox = { x, y, width, height };
                    const targetElement = d3.select(`#${target}`).node() as any;
                    ({ width, height } = targetElement.getBBox());
                    [x, y] = targetElement
                      .getAttribute("transform")
                      .slice(10, -1)
                      .split(", ")
                      .map((v) => parseInt(v));
                    const targetBox = { x, y, width, height };
                    let x1 = d.style.gNodeTransX + d.style.rectWidth / 2,
                      y1 = d.style.gNodeTransY + d.style.rectHeight / 2,
                      x2 = targetBox.x + targetBox.width / 2,
                      y2 = targetBox.y;
                    if (d.data.type === "in") {
                      x2 -= targetBox.width;
                    }
                    svg
                      .select(".hoverEdges")
                      .append("g")
                      .attr("class", `edgePath hoverEdge ${edgeName}`)
                      .append("path")
                      .attr(
                        "d",
                        lineFunction([
                          [x1, y1],
                          [(x1 + x2) / 2, y1],
                          [(x1 + x2) / 2, y2],
                          [x2, y2],
                        ])
                      )
                      .attr("fill", "none")
                      .style("stroke", "#000066")
                      .style("stroke-width", "2");
                  }
                }}
                onMouseLeave={() => {
                  d3.selectAll(".hoverEdge").transition().remove();
                }}
              >
                {d.data.type === "in" ? (
                  <rect
                    width={d.style.rectWidth / 2}
                    height={d.style.rectHeight}
                    transform={`translate(${d.style.rectWidth / 2}, 0)`}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                  ></rect>
                ) : (
                  <rect
                    width={d.style.rectWidth / 2}
                    height={d.style.rectHeight}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                  ></rect>
                )}
                <rect
                  width={d.style.rectWidth}
                  height={d.style.rectHeight}
                  rx="2.5"
                  ry="2.5"
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                ></rect>
              </g>
            );
          })}
        </g>
      )}
    </TransitionMotion>
  );
};

export default ELKLayoutPort;
