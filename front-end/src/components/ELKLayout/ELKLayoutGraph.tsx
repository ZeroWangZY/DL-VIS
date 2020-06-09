import React, { useEffect, useRef } from "react";
import "./ELKLayoutGraph.css";
import { NodeType } from "../../common/graph-processing/stage2/processed-graph";
import * as d3 from "d3";
import { TransitionMotion } from "react-motion";
import {
  modifyProcessedGraph,
  ProcessedGraphModificationType,
} from "../../store/processedGraph";
import { useLayoutGraph } from "../../store/layoutGraph";
import { useStyledGraph } from "../../store/styledGraph";
import ELK from "elkjs/lib/elk.bundled.js";

window["d3"] = d3;
window["ELK"] = ELK;

const ELKLayoutGraph: React.FC = () => {
  const layoutGraph = useLayoutGraph();
  const styledGraph = useStyledGraph();
  // console.log(styledGraph);
  const svgRef = useRef();
  const outputRef = useRef();
  let elkNodeMap = {};
  if (layoutGraph) {
    elkNodeMap = layoutGraph.elkNodeMap;
  }

  const getX = (d): number => {
    return d.x;
  };
  const getY = (d): number => {
    return d.y;
  };
  // 根据points计算path的data
  const line = d3
    .line()
    .x((d) => getX(d))
    .y((d) => getY(d));

  const toggleExpanded = (id): void => {
    modifyProcessedGraph(ProcessedGraphModificationType.TOGGLE_EXPANDED, {
      nodeId: id,
    });
  };

  useEffect(() => {
    //目前仅支持拖拽叶节点
    d3.selectAll(".node").on(".drag", null);
    let selectionNodes = d3.selectAll(".child-node");

    console.log(svgRef.current);
    console.log(selectionNodes.size());
    if (selectionNodes.size() === 0) return;
    selectionNodes.call(d3.drag().on("start", dragStarted));

    function dragStarted(): void {
      let node = d3.select(this).classed("dragging", true);
      d3.event.on("drag", dragged).on("end", ended);
      const { x, y } = d3.event;
      function dragged(): void {
        if (Math.abs(d3.event.x - x) < 5 || Math.abs(d3.event.y - y) < 5) {
          return;
        }
        node
          .raise()
          .attr("transform", `translate(${d3.event.x}, ${d3.event.y})`);
      }

      function ended() {
        if (Math.abs(d3.event.x - x) < 5 || Math.abs(d3.event.y - y) < 5) {
          return;
        }
        node.classed("dragging", false);

        //id: node.parent+"-"+node.id
        const [nodeParent, nodeID] = node.node().id.split("-");
        let toEditNode = elkNodeMap;
        if (nodeParent !== "___root___") {
          nodeParent.split("/").forEach((parent) => {
            toEditNode = toEditNode[parent];
            if (toEditNode === undefined) {
              // draw();
              return;
            } else if (toEditNode.hasOwnProperty("children")) {
              toEditNode = toEditNode["children"];
            }
          });
        }
        toEditNode = toEditNode[nodeID];
        toEditNode["x"] = d3.event.x;
        toEditNode["y"] = d3.event.y;
        // draw({ networkSimplex: false });

        //Todo: 把store里的networkSimplex设为false
      }
    }
  });

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
          <TransitionMotion
            styles={styledGraph === null ? [] : styledGraph.nodeStyles}
          >
            {(interpolatedStyles) => (
              <g className="nodes">
                {interpolatedStyles.map((d) => {
                  if (d.data.class === "dummy") {
                    return;
                  }

                  //考虑到d3.select的语法限制，需要将id中的'/'替换为'-'
                  const selectContent = `.edgePaths .id_${d.data.id
                    .split("/")
                    .join("-")} path`;
                  return (
                    <g
                      className={`node ${d.data.class} ${
                        d.data.expand ? "expanded-node" : "child-node"
                      }`}
                      id={d.data.parent + "-" + d.data.id}
                      key={d.key}
                      transform={`translate(${d.style.gNodeTransX}, ${d.style.gNodeTransY})`}
                      onClick={() => toggleExpanded(d.data.id)}
                      onMouseOver={() => {
                        d3.selectAll(selectContent)
                          .transition()
                          .style("stroke", "#7F0723")
                          .style("stroke-width", "3");
                      }}
                      onMouseOut={() => {
                        d3.selectAll(selectContent)
                          .transition()
                          .style("stroke", "#3F3F3F")
                          .style("stroke-width", "1");
                      }}
                    >
                      {d.data.class === "nodeitem-0" ? (
                        <ellipse
                          className={
                            d.data.expand
                              ? "elk-label-container expanded"
                              : "elk-label-container"
                          }
                          rx={d.style.ellipseX}
                          ry={d.style.ellipseY}
                        ></ellipse>
                      ) : (
                        <rect
                          className="elk-label-container"
                          width={d.style.rectWidth}
                          height={d.style.rectHeight}
                          transform={`translate(-${d.style.rectWidth / 2}, -${
                            d.style.rectHeight / 2
                          })`}
                          fillOpacity={d.data.expand ? 0 : 1}
                          pointerEvents="visibleStroke"
                        ></rect>
                      )}
                      <g
                        className="my-label"
                        transform={
                          d.data.class.indexOf("cluster") > -1
                            ? `translate(0,-${d.style.rectHeight / 2})`
                            : null
                        }
                      >
                        {d.data.expand ? (
                          <rect
                            className="behind-text"
                            width={d.data.textWidth}
                            height={10}
                            transform={`translate(-${d.data.textWidth / 2}, -${
                              d.style.rectHeight / 2 + 5
                            })`}
                            stroke="none"
                          ></rect>
                        ) : null}
                        {d.data.type === NodeType.OPERTATION ? (
                          <text
                            dominantBaseline={"baseline"}
                            y={`${-d.style.rectHeight / 4 - 3}`}
                            style={{ fontSize: 10 }}
                          >
                            {d.data.label}
                          </text>
                        ) : (
                          <text
                            dominantBaseline={"middle"}
                            y={
                              d.data.expand
                                ? `${-d.style.rectHeight / 2 + 2}`
                                : null
                            }
                          >
                            {d.data.label}
                            {!d.data.expand &&
                              (d.data.type === NodeType.GROUP ||
                                d.data.type === NodeType.LAYER) &&
                              "+"}
                          </text>
                        )}
                      </g>
                    </g>
                  );
                })}
              </g>
            )}
          </TransitionMotion>
          <TransitionMotion
            styles={styledGraph === null ? [] : styledGraph.linkStyles}
          >
            {(interpolatedStyles) => (
              <g className="edgePaths">
                {interpolatedStyles.map((d) => (
                  <g
                    className={
                      "edgePath " +
                      d.key
                        .split("-")
                        .map((name) => "id_" + name.split("/").join("-"))
                        .join(" ")
                    }
                    key={d.key}
                  >
                    <path
                      d={line([
                        { x: d.style.startPointX, y: d.style.startPointY },
                        ...d.data.lineData,
                        { x: d.style.endPointX, y: d.style.endPointY },
                      ])}
                      markerEnd="url(#arrowhead)"
                    ></path>
                    {d.data.junctionPoints.map((point, i) => (
                      <circle
                        key={d.key + "_junkPoint_" + i}
                        cx={point.x}
                        cy={point.y}
                        r={2}
                      />
                    ))}
                  </g>
                ))}
              </g>
            )}
          </TransitionMotion>
        </g>
      </svg>
    </div>
  );
};

export default ELKLayoutGraph;
