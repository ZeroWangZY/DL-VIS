import React, { useEffect, useRef, useState } from "react";
import { TransitionMotion } from "react-motion";
import { useVisGraph } from "../../store/visGraph";
import { useStyledGraph } from "../../store/styledGraph";
import { useLayoutGraph, setLayoutGraph } from "../../store/layoutGraph";
import { FCLayerNode, CONVLayerNode, RNNLayerNode, OTHERLayerNode } from '../LayerNodeGraph/LayerNodeGraph';
import { NodeType, LayerType } from "../../common/graph-processing/stage2/processed-graph";
import * as d3 from "d3";
import {
  modifyProcessedGraph,
  ProcessedGraphModificationType,
} from "../../store/processedGraph";
import { LineGroup } from '../LineCharts/index'
import { produceLayoutGraph } from "../../common/graph-processing/stage4/produce-layout-graph";
import { useGlobalConfigurations } from "../../store/global-configuration";

interface Props {
  setSelectedNodeId: { (nodeId: string): void };
  selectedNodeId: string | null;
  handleRightClick: { (e: any): void };
}

const antiShakeDistance = 2;

const ELKLayoutNode: React.FC<Props> = (props: Props) => {
  const { setSelectedNodeId, selectedNodeId, handleRightClick } = props;
  const { diagnosisMode, isHiddenInterModuleEdges } = useGlobalConfigurations();
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

  const getLabelContainer = (nodeId, expaneded, nodeClass, ellipseX, ellipseY, rectWidth, rectHeight) => {
    if (nodeClass === "nodeitem-0") // OPERATION
      return (<ellipse
        className={
          "elk-label-container" +
          (expaneded ? " expanded" : "") +
          (nodeId === selectedNodeId ? " focus" : "")
        }
        rx={ellipseX}
        ry={ellipseY}
      ></ellipse>)
    else if (nodeClass === "nodeitem-3" || nodeClass === "nodeitem-2") { // GROUP或者DATA
      return (
        <rect
          className={
            nodeId === selectedNodeId
              ? "elk-label-container focus"
              : "elk-label-container"
          }
          width={rectWidth}
          height={rectHeight}
          transform={`translate(-${rectWidth / 2}, -${
            rectHeight / 2
            })`}
          fillOpacity={expaneded ? 0 : 1}
          pointerEvents="visibleStroke"
        ></rect>
      )
    } else if (nodeClass.indexOf("layertype") > -1) { // LAYER
      if (nodeClass.indexOf(`layertype-${LayerType.FC}`) > -1) {
        return (<FCLayerNode width={rectWidth} height={rectHeight} />);
      } else if (nodeClass.indexOf(`layertype-${LayerType.CONV}`) > -1) {
        return (<CONVLayerNode width={rectWidth} height={rectHeight} />);
      } else if (nodeClass.indexOf(`layertype-${LayerType.RNN}`) > -1) {
        return (<RNNLayerNode width={rectWidth} height={rectHeight} />);
      } else if (nodeClass.indexOf(`layertype-${LayerType.OTHER}`) > -1) {
        return (<OTHERLayerNode width={rectWidth} height={rectHeight} />)
      }
    }
  }

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
        if (
          Math.abs(d3.event.x - x) < antiShakeDistance ||
          Math.abs(d3.event.y - y) < antiShakeDistance
        ) {
          return;
        }
        node
          .raise()
          .attr("transform", `translate(${d3.event.x}, ${d3.event.y})`);
      }

      function ended() {
        if (
          Math.abs(d3.event.x - x) < antiShakeDistance ||
          Math.abs(d3.event.y - y) < antiShakeDistance
        ) {
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

            const selectContent = `.${d.data.id4Style} .hover`;
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
                  d3.selectAll(".edgePath path")
                    .transition()
                    .style("stroke", "#3F3F3F")
                    .style("stroke-width", "1");
                  d3.selectAll(selectContent)
                    .transition()
                    .style("stroke", "#7F0723")
                    .style("stroke-width", "3");
                }}
                onMouseOut={() => {
                  d3.selectAll(selectContent)
                    .transition()
                    .style("stroke", "none")
                    .style("stroke-width", "1");
                }}
                onContextMenu={(e) => handleRightClick(e)}
              >
                {getLabelContainer(d.data.id, d.data.expaned, d.data.class, d.style.ellipseX, d.style.ellipseY, d.style.rectWidth, d.style.rectHeight)}
                <g className="my-label"
                  transform={
                    d.data.class.indexOf("cluster") > -1 ? `translate(0,-${d.style.rectHeight / 2})` : null
                  }
                >
                  {(d.data.type === NodeType.LAYER && d.data.expanded === false) && d.data.showLineChart && diagnosisMode ?
                    <g className="LineChartInNode" >
                      <LineGroup
                        transform={`translate(-${d.style.rectWidth / 2},-${d.style.rectHeight * 3 / 8})`}
                        width={d.style.rectWidth}
                        height={d.style.rectHeight * 3 / 4}
                        data={d.data.LineData} />
                      <text transform={`translate(0,-${d.style.rectHeight * 3 / 8})`} dominantBaseline={(d.data.class.indexOf('cluster') > -1) ? "text-before-edge" : "middle"}>
                        {d.data.label}
                      </text>
                    </g> : ""}

                  {d.data.expand ? (
                    <rect
                      className="behind-text"
                      width={d.data.textWidth}
                      height={10}
                      transform={`translate(-${d.data.textWidth / 2}, -${d.style.rectHeight / 2 + 5})`}
                      stroke="none"
                    ></rect>
                  ) : null}
                  {d.data.type === NodeType.OPERTATION ? (
                    <text dominantBaseline={"baseline"} y={`${-d.style.rectHeight / 4 - 3}`} style={{ fontSize: 10 }}>
                      {d.data.label}
                    </text>
                  ) : (
                    <foreignObject
                      x={-d.style.rectWidth / 2}
                      y={
                        d.data.expand
                          ? -d.style.rectHeight
                          : -d.style.rectHeight / 2
                      }
                      width={d.style.rectWidth}
                      height={d.style.rectHeight}
                    >
                      <div className="label">
                        {d.data.label}
                        {!d.data.expand &&
                          (d.data.type === NodeType.GROUP ||
                            d.data.type === NodeType.LAYER) &&
                          "+"}
                      </div>
                    </foreignObject>
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
