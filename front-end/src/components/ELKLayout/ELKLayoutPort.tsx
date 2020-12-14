import React, { useEffect, useRef } from "react";
import { TransitionMotion } from "react-motion";
import { useStyledGraph } from "../../store/styledGraph";
import * as d3 from "d3";

const circle_level_1_big = (
  <g id="图层_1-2" data-name="图层 1">
    <circle style={{ fill: "#fff", stroke: "#333", strokeMiterlimit: 10 }} cx="7.5" cy="7.5" r="7" />
    <circle style={{ fill: "#333" }} cx="7.5" cy="7.5" r="1.4" />
  </g>
)

const circle_level_2_big = (
  <g id="图层_1-2" data-name="图层 1">
    <circle style={{ fill: "#fff", stroke: "#333", strokeMiterlimit: 10 }} cx="7.5" cy="7.5" r="7" />
    <circle style={{ fill: "#333" }} cx="5.4" cy="7.5" r="1.4" />
    <circle style={{ fill: "#333" }} cx="9.95" cy="7.5" r="1.4" />
  </g>
)

const circle_level_1_2_big = (
  <g id="图层_1-2" data-name="图层 1">
    <circle style={{ fill: "#fff", stroke: "#333", strokeMiterlimit: 10 }} cx="7.5" cy="7.5" r="7" />
    <circle style={{ fill: "#333" }} cx="7.5" cy="4.5" r="1.4" />
    <line style={{ stroke: "#333", strokeMiterlimit: 10, fill: "none" }} x1="0.5" y1="7.5" x2="14.5" y2="7.5" />
    <circle style={{ fill: "#333" }} cx="5.4" cy="10.5" r="1.4" />
    <circle style={{ fill: "#333" }} cx="9.95" cy="10.5" r="1.4" />
  </g>
)

const circle_level_1_small = (
  <g id="图层_1-2" data-name="图层 1">
    <circle style={{ fill: "#fff", stroke: "#333", strokeMiterlimit: 10 }} cx="5.5" cy="5.5" r="5" />
    <circle style={{ fill: "#333" }} cx="5.5" cy="5.5" r="1" />
  </g>
)

const ELKLayoutPort: React.FC = () => {
  const styledGraph = useStyledGraph();
  const hoverEdges = d3.select("#output-svg").select(".hoverEdges");
  const fill = "#6791A7",
    stroke = "#666666",
    strokeWidth = "1";

  const lineFunction = (points: [number[], number[]]): string => {
    let start = points[0], end = points[1]; // 首位端点
    if (points[0][0] > points[1][0]) [start, end] = [end, start]; // 使得曲线总是从左向右画

    // 如果过于水平 或者过于垂直，则直接连接两个点
    // if (Math.abs(start[0] - end[0]) <= 15 || Math.abs(start[1] - end[1]) <= 15) {
    //   return "M" + start[0] + " " + start[1] + "L" + end[0] + " " + end[1];
    // }

    let control1, control2;
    control1 = [start[0] + (end[0] - start[0]) / 3, start[1]];
    control2 = [end[0] - (end[0] - start[0]) / 3, end[1]];

    let dStr = "M" + start[0] + " " + start[1] +
      "C" + control1[0] + " " + control1[1] + "," +
      control2[0] + " " + control2[1] + "," +
      end[0] + " " + end[1];

    return dStr;
  }

  return (
    <TransitionMotion
      styles={styledGraph === null ? [] : styledGraph.portStyles}
    >
      {(interpolatedStyles) => (
        <g className="ports">
          {interpolatedStyles.map((d, n) => {
            const ofs_x = -7.5;
            const ofs_y = -7.4;
            const xt = 9, yt = -1 / 2 * d.style.nodeRectHeight + 10;
            let ofs = [xt, ofs_y]
            if (!d.data.isRealLink) {
              ofs = [0, ofs_y + yt];
            }
            return (
              <g
                key={d.key}
                id={d.data.id4Style}
                className={`${d.data.direction}-${d.data.nodeId}`}
                transform={`translate(${d.style.gNodeTransX}, ${d.style.gNodeTransY})`}
                onMouseEnter={() => {
                  const nodeIdSet = new Set();
                  let changedAllEdgeOpacity = false;
                  for (let i = 0; i < d.data.hiddenEdges.length; i++) {
                    if (!changedAllEdgeOpacity) { // 如果hover到port上，将所有的edges的透明度设为0.3
                      d3.select("#output-svg").select(".edges").selectAll("g.edgePath").select("path").attr("opacity", 0.3);
                      changedAllEdgeOpacity = true;
                    }

                    const { source, target } = d.data.hiddenEdges[i];
                    const edgeName = `${source}to${target}`;
                    nodeIdSet.add(source);
                    nodeIdSet.add(target);
                    if (!hoverEdges.selectAll(`.${edgeName}`).empty()) {
                      hoverEdges
                        .selectAll(`.${edgeName}`)
                        .select("path")
                        .attr("fill", "none")
                        .style("stroke", "#eb9c58")
                        .style("stroke-width", "2")
                        .style("stroke-linecap", "round")
                        .attr("opacity", 1);
                      continue;
                    }
                    let x = 0,
                      y = 0,
                      xc = 0,
                      yc = 0,
                      pos = "out";
                    if (source.length < target.length) {
                      pos = "in";
                    }
                    const sourcePortParent = d3.select(`.${pos}-${source}`).node() as any;
                    const sourcePort = d3.select(`.${pos}-${source}`).select("g").node() as any;
                    const sourceCircleR = parseInt(d3.select(`.${pos}-${source}`).select("circle").attr("r"));
                    [x, y] = sourcePortParent
                      .getAttribute("transform")
                      .slice(10, -1)
                      .split(",")
                      .map((v) => parseInt(v));
                    [xc, yc] = sourcePort
                      .getAttribute("transform")
                      .slice(10, -1)
                      .split(",")
                      .map((v) => parseInt(v));
                    const sourceBox = { x: x + xc, y: y + yc };

                    const targetPortParent = d3.select(`.${pos}-${target}`).node() as any;
                    const targetPort = d3.select(`.${pos}-${target}`).select("g").node() as any;
                    const targetCircleR = parseInt(d3.select(`.${pos}-${target}`).select("circle").attr("r"));

                    [x, y] = targetPortParent
                      .getAttribute("transform")
                      .slice(10, -1)
                      .split(",")
                      .map((v) => parseInt(v));
                    [xc, yc] = targetPort
                      .getAttribute("transform")
                      .slice(10, -1)
                      .split(",")
                      .map((v) => parseInt(v));
                    const targetBox = { x: x + xc, y: y + yc };

                    let x1 = sourceBox.x + sourceCircleR,
                      y1 = sourceBox.y + sourceCircleR,
                      x2 = targetBox.x + targetCircleR,
                      y2 = targetBox.y + targetCircleR;

                    hoverEdges
                      .append("g")
                      .attr("class", `edgePath hoverEdge ${edgeName}`)
                      .append("path")
                      .attr(
                        "d",
                        lineFunction([
                          [x1, y1],
                          [x2, y2],
                        ])
                      )
                      .attr("fill", "none")
                      .style("stroke", "#eb9c58")
                      .style("stroke-width", "2")
                      .style("stroke-linecap", "round")
                      .attr("opacity", 1);
                  }
                  if (nodeIdSet.size !== 0)
                    d3.select(".nodes").selectAll(".node").attr("opacity", 0.3);
                  for (let nodeId of nodeIdSet) {
                    d3.select(".nodes").select(".node#" + nodeId).attr("opacity", 1);
                  }
                }}
                onMouseLeave={() => {
                  d3.selectAll(".hoverEdge").remove();
                  d3.select(".nodes").selectAll(".node").attr("opacity", 1);
                  d3.select("#output-svg").select(".edges").selectAll("g.edgePath").select("path").attr("opacity", 1); // 还原
                  for (let i = 0; i < d.data.hiddenEdges.length; i++) {
                    const { source, target } = d.data.hiddenEdges[i];
                    const edgeName = `${source}to${target}`;
                    if (!hoverEdges.selectAll(`.${edgeName}`).empty()) {
                      hoverEdges
                        .selectAll(`.${edgeName}`)
                        .select("path")
                        .attr("fill", "none")
                        .style("stroke", "#ff931e")
                        .style("stroke-width", "2")
                        .style("stroke-linecap", "round");
                      continue;
                    }
                  }
                }}
              >
                <g
                  transform={`translate(${d.data.direction === "in" ? ofs_x + ofs[0] : ofs_x - ofs[0]}, ${ofs[1]})`}
                >
                  {d.data.isOperation
                    ? circle_level_1_small
                    : (d.data.type["level_1"] && d.data.type["level_2"])
                      ? circle_level_1_2_big
                      : d.data.type["level_1"]
                        ? circle_level_1_big
                        : circle_level_2_big}
                </g>
              </g>
            );
          })}
        </g>
      )}
    </TransitionMotion>
  );
};

export default ELKLayoutPort;