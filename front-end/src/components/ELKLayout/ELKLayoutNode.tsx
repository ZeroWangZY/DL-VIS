import React, { useEffect, useRef, useState } from "react";
import { TransitionMotion } from "react-motion";
import { useVisGraph } from "../../store/visGraph";
import { useStyledGraph } from "../../store/styledGraph";
import { useLayoutGraph, setLayoutGraph } from "../../store/layoutGraph";
import { NodeType } from "../../common/graph-processing/stage2/processed-graph";
import * as d3 from "d3";
import {
  modifyProcessedGraph,
  ProcessedGraphModificationType,
} from "../../store/processedGraph";

import { produceLayoutGraph } from "../../common/graph-processing/stage4/produce-layout-graph";
import { useGlobalConfigurations } from "../../store/global-configuration";

interface Props {
  setSelectedNodeId: { (nodeId: string): void };
  selectedNodeId: string | null;
}

const antiShakeDistance = 2;

const ELKLayoutNode: React.FC<Props> = (props: Props) => {
  const { setSelectedNodeId, selectedNodeId } = props;
  const visGraph = useVisGraph();
  const layoutGraph = useLayoutGraph();
  const styledGraph = useStyledGraph();
  const { shouldMergeEdge } = useGlobalConfigurations();

  const handleClick = (id) => {
    let nodeId = id.replace(/-/g, "/");
    setSelectedNodeId(nodeId);
  };

  let elkNodeMap = {};
  if (layoutGraph) {
    elkNodeMap = layoutGraph.elkNodeMap;
  }
  const toggleExpanded = (id): void => {
    modifyProcessedGraph(ProcessedGraphModificationType.TOGGLE_EXPANDED, {
      nodeId: id,
    });
  };

  const editLayoutGraph = (): void => {
    const lGraph = produceLayoutGraph(visGraph, {
      networkSimplex: false,
      mergeEdge: shouldMergeEdge,
    });
    lGraph.then((result) => {
      setLayoutGraph(result);
    });
  };

  useEffect(() => {
    //目前仅支持拖拽叶节点
    d3.selectAll("g .node").on(".drag", null);
    let selectionNodes = d3.selectAll("g .child-node");
    if (selectionNodes.size() === 0) return;
    selectionNodes.call(d3.drag().on("start", dragStarted));

    function dragStarted(): void {
      let node = d3.select(this).classed("dragging", true);
      d3.event.on("drag", dragged).on("end", ended);
      const { x, y } = d3.event;
      function dragged(): void {
        if (Math.abs(d3.event.x - x) < antiShakeDistance || Math.abs(d3.event.y - y) < antiShakeDistance) {
          return;
        }
        node
          .raise()
          .attr("transform", `translate(${d3.event.x}, ${d3.event.y})`);
      }

      function ended() {
        if (Math.abs(d3.event.x - x) < antiShakeDistance || Math.abs(d3.event.y - y) < antiShakeDistance) {
          return;
        }
        node.classed("dragging", false);
        let toEditNode = elkNodeMap;

        const nodeId = node.node().id;

        nodeId.split("-").forEach((id) => {
          toEditNode = toEditNode[id];
        });
        toEditNode["x"] = d3.event.x;
        toEditNode["y"] = d3.event.y;
        editLayoutGraph();
      }
    }
  });
  return (
    <TransitionMotion
      styles={styledGraph === null ? [] : styledGraph.nodeStyles}
    >
      {(interpolatedStyles) => (
        <g className="nodes">
          {interpolatedStyles.map((d) => {
            if (d.data.class === "dummy") {
              return;
            }

            const selectContent = `.${d.data.id4Style} path`;
            return (
              <g
                className={`node ${d.data.class} ${
                  d.data.expand ? "expanded-node" : "child-node"
                }`}
                id={d.data.id4Style}
                key={d.key}
                transform={`translate(${d.style.gNodeTransX}, ${d.style.gNodeTransY})`}
                onClick={() => handleClick(d.data.id)}
                onDoubleClick={() => toggleExpanded(d.data.id)}
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
                      "elk-label-container" +
                      (d.data.expand ? " expanded" : "") +
                      (d.data.id === selectedNodeId ? " focus" : "")
                    }
                    rx={d.style.ellipseX}
                    ry={d.style.ellipseY}
                  ></ellipse>
                ) : (
                  <rect
                    className={
                      d.data.id === selectedNodeId
                        ? "elk-label-container focus"
                        : "elk-label-container"
                    }
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
                        d.data.expand ? `${-d.style.rectHeight / 2 + 2}` : null
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
  );
};

export default ELKLayoutNode;
