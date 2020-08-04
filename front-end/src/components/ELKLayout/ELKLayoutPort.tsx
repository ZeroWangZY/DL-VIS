import React, { useEffect, useRef } from "react";
import { TransitionMotion } from "react-motion";
import { useStyledGraph } from "../../store/styledGraph";
import * as d3 from "d3";

const circle_level_1_big = (<g id="图层_1-2" data-name="图层 1"><circle style={{fill:"#fff",stroke:"#333",strokeMiterlimit:10}} cx="7.5" cy="7.5" r="7"/><circle style={{fill:"#333"}} cx="7.5" cy="7.5" r="1.4"/></g>)

const circle_level_1_2_big = (<g id="图层_1-2" data-name="图层 1"><circle style={{fill:"#fff",stroke:"#333",strokeMiterlimit:10}} cx="7.5" cy="7.5" r="7"/><circle style={{fill:"#333"}} cx="7.5" cy="4.5" r="1.4"/><line style={{stroke:"#333",strokeMiterlimit:10, fill:"none"}} x1="0.5" y1="7.5" x2="14.5" y2="7.5"/><circle style={{fill:"#333"}} cx="5.4" cy="10.5" r="1.4"/><circle style={{fill:"#333"}} cx="9.95" cy="10.5" r="1.4"/></g>)

const ELKLayoutPort: React.FC = () => {
  const styledGraph = useStyledGraph();
  const hoverEdges = d3.select("#output-svg").select(".hoverEdges");
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
                    if (!hoverEdges.selectAll(`.${edgeName}`).empty()) {
                      hoverEdges
                        .selectAll(`.${edgeName}`)
                        .select("path")
                        .attr("fill", "none")
                        .style("stroke", "#00679f")
                        .style("stroke-width", "2")
                        .style("stroke-linecap", "round");
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
                    let sign = 1; //1:右连接，2：左连接
                    if (source.length < target.length) {
                      sign = -1;
                    }
                    const ofs_x = 1;
                    let x1 = sourceBox.x + sign * (sourceBox.width / 2) + ofs_x,
                      y1 = sourceBox.y,
                      x2 = targetBox.x + sign * (targetBox.width / 2) - ofs_x,
                      y2 = targetBox.y;

                    hoverEdges
                      .append("g")
                      .attr("class", `edgePath hoverEdge ${edgeName}`)
                      .append("path")
                      .attr(
                        "d",
                        lineFunction([
                          [x1, y1],
                          // [(x1 + x2) / 2, y1],
                          // [(x1 + x2) / 2, y2],
                          [x2, y2],
                        ])
                      )
                      .attr("fill", "none")
                      .style("stroke", "#00679f")
                      .style("stroke-width", "2")
                      .style("stroke-linecap", "round");
                  }
                }}
                onMouseLeave={() => {
                  d3.selectAll(".hoverEdge").remove();
                  for (let i = 0; i < d.data.hiddenEdges.length; i++) {
                    const { source, target } = d.data.hiddenEdges[i];
                    const edgeName = `${source}to${target}`;
                    if (!hoverEdges.selectAll(`.${edgeName}`).empty()) {
                      hoverEdges
                        .selectAll(`.${edgeName}`)
                        .select("path")
                        .attr("fill", "none")
                        .style("stroke", "#ff931e")
                        .style("stroke-width", "3")
                        .style("stroke-linecap", "round");
                      continue;
                    }
                  }
                }}
              >
                {d.data.type === "in" ? (
                  // <rect
                  //   width={d.style.rectWidth / 2}
                  //   height={d.style.rectHeight}
                  //   transform={`translate(${d.style.rectWidth / 2}, 0)`}
                  //   fill={fill}
                  //   stroke={stroke}
                  //   strokeWidth={strokeWidth}
                  // />
                  <g transform={`translate(${d.style.rectWidth / 2 - 5}, -3)`}>
                    {circle_level_1_big}
                  </g>
                ) : (
                  // <rect
                  //   width={d.style.rectWidth / 2}
                  //   height={d.style.rectHeight}
                  //   fill={fill}
                  //   stroke={stroke}
                  //   strokeWidth={strokeWidth}
                  // />
                  <g transform={`translate(${-7.5}, -3)`}>
                    {circle_level_1_big}
                  </g>
                  )}
                {/* <rect
                  width={d.style.rectWidth}
                  height={d.style.rectHeight}
                  rx="2.5"
                  ry="2.5"
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                ></rect> */}
              </g>
            );
          })}
        </g>
      )}
    </TransitionMotion>
  );
};

export default ELKLayoutPort;
