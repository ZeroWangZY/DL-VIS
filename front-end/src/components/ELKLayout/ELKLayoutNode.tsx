import React, { useEffect, useRef, useState } from "react";
import { TransitionMotion } from "react-motion";
import { useVisGraph } from "../../store/visGraph";
import { useStyledGraph } from "../../store/styledGraph";
import { useLayoutGraph, setLayoutGraph } from "../../store/layoutGraph";
import {
  LayerNodeContainer
} from "../LayerNodeGraph/LayerNodeGraph";
import {
  NodeType,
  LayerType,
} from "../../common/graph-processing/stage2/processed-graph";
import * as d3 from "d3";
import styles from "../../CSSVariables/CSSVariables.less";
import {
  useProcessedGraph,
  modifyProcessedGraph,
  ProcessedGraphModificationType,
} from "../../store/processedGraph";
import { fetchAndGetLayerInfo } from "../../common/model-level/snaphot";
import {
  useGlobalConfigurations,
  modifyGlobalConfigurations,
} from "../../store/global-configuration";
import { GlobalConfigurationsModificationType } from "../../store/global-configuration.type";
import {
  useGlobalStates,
  modifyGlobalStates,
} from "../../store/global-states";
import { GlobalStatesModificationType } from "../../store/global-states.type";
// import { LineGroup } from "../LineCharts/index";
import LineGroup from "./LineGroup"
import { produceLayoutGraph, LAYERNODESIZEINDIAGNOSISMODE } from "../../common/graph-processing/stage4/produce-layout-graph";

interface Props {
  handleRightClick: { (e: any): void };
  currentNotShowLineChartID: string[];
  iteration: number;
  layoutModificationMode: boolean;
  isPathFindingMode: boolean;
  startNodeId: string;
  endNodeId: string;
}

const antiShakeDistance = 2;
const svg = d3.select("#output-svg");
const maxLabelLength = 10;

const ELKLayoutNode: React.FC<Props> = (props: Props) => {
  const hoverEdgePathStrokeColor = styles.hover_edge_path_stroke_color;
  const hoverEdgePathStrokeWidth = styles.hover_edge_path_stroke_width;

  const { handleRightClick, currentNotShowLineChartID, iteration, layoutModificationMode, isPathFindingMode, startNodeId, endNodeId } = props;
  const graphForLayout = useProcessedGraph();
  const { diagnosisMode } = useGlobalConfigurations();
  const { selectedNodeId } = useGlobalStates();
  const visGraph = useVisGraph();
  const layoutGraph = useLayoutGraph();
  const styledGraph = useStyledGraph();

  const [lineChartData, setLineChartData] = useState(new Map());
  let _lineChartData = new Map();
  const getLayerInfo = async () => {
    if (styledGraph === null || styledGraph.nodeStyles === null) return;
    let nodes = styledGraph.nodeStyles;

    for (const node of nodes) {
      if (node.data.type === NodeType.LAYER) {
        // LAYER
        let data = await fetchAndGetLayerInfo(
          {
            STEP_FROM: iteration,
            STEP_TO: iteration + 20,
          },
          node.data.id,
          graphForLayout
        );
        _lineChartData.set(node.data.id, data);
      }
    }
  };

  useEffect(() => {
    getLayerInfo().then(() => {
      setLineChartData(_lineChartData);
    });
  }, [styledGraph]);

  const handleClick = (id) => {
    if (selectedNodeId !== id)
      modifyGlobalStates(
        GlobalStatesModificationType.SET_SELECTEDNODE,
        id
      );
  };

  let elkNodeMap = {};
  if (layoutGraph) {
    elkNodeMap = layoutGraph.elkNodeMap;
  }

  const showHighlightedLine = (linkedEdges): void => {
    d3.selectAll(linkedEdges)
      .transition()
      .style("stroke", hoverEdgePathStrokeColor)
      .style("stroke-width", hoverEdgePathStrokeWidth)
      .style("stroke-linecap", "round")
      .style("marker-end", "url(#arrowheadHovered)")
  }

  const offHighlightedLine = (linkedEdges): void => {
    d3.selectAll(linkedEdges) // 取消所有高亮的边
      .transition()
      .style("stroke", "none")
      .style("stroke-width", "1")
      .style("marker-end", "none");
  }

  const toggleExpanded = (id, linkedEdges): void => {
    offHighlightedLine(linkedEdges);
    modifyProcessedGraph(ProcessedGraphModificationType.TOGGLE_EXPANDED, {
      nodeId: id,
    });
  };

  const showLineChart = (node): boolean => {
    if (
      diagnosisMode &&
      node.type === NodeType.LAYER &&
      node.expand === false &&
      currentNotShowLineChartID.indexOf(node.id) < 0
    )
      return true;
    return false;
  };

  const editLayoutGraph = (): void => {
    const lGraph = produceLayoutGraph(visGraph, {
      networkSimplex: false,
    });
    lGraph.then((result) => {
      setLayoutGraph(result);
    });
  };

  const getLineChartAndText = (node, rectWidth, rectHeight) => {
    // 使用外部 LAYERNODESIZEINDIAGNOSISMODE 的长宽
    // 注意： 目前折线图处于中间3/4之类。所以上方和下方分别剩余1/8的空余
    return (
      <g className="LineChartInNode">
        <foreignObject
          x={-rectWidth / 2}
          y={-rectHeight / 2}
          width={rectWidth}
          height={rectHeight / 8}
        >
          <div>
            <text>
              {node.label.slice(0, maxLabelLength) + (node.label.length > maxLabelLength ? "..." : "")}
            </text>
          </div>
        </foreignObject>

        <foreignObject
          x={-rectWidth / 2}
          y={-(rectHeight * 3) / 8}
          width={rectWidth}
          height={(rectHeight * 7) / 8}
        >
          <LineGroup
            svgWidth={LAYERNODESIZEINDIAGNOSISMODE.width}
            svgHeight={(LAYERNODESIZEINDIAGNOSISMODE.height * 7) / 8}
            layerNodeId={node.id}
          />
        </foreignObject>

        {/* <LineGroup
          transform={`translate(-${rectWidth / 2},-${(rectHeight * 3) / 8})`}
          width={rectWidth}
          height={(rectHeight * 3) / 4}
          data={lineChartData.has(node.id) ? lineChartData.get(node.id) : []}
        /> */}
      </g>
    );
  };

  const getLabelContainer = (
    node,
    ellipseX,
    ellipseY,
    rectWidth,
    rectHeight
  ) => {
    let focused = (node.id === selectedNodeId);
    if (node.type === NodeType.OPERATION) {
      // OPERATION
      return (
        <g>
          {node.isStacked && (
            <>
              <ellipse
                className={
                  "elk-label-container" +
                  (node.expand ? " expanded" : "") +
                  (focused ? " focus" : "")
                }
                rx={ellipseX}
                ry={ellipseY}
                transform="translate(0, 6)"
              />
              <ellipse
                className={
                  "elk-label-container" +
                  (node.expand ? " expanded" : "") +
                  (focused ? " focus" : "")
                }
                rx={ellipseX}
                ry={ellipseY}
                transform="translate(0, 3)"
              />
            </>
          )}
          <ellipse
            className={
              "elk-label-container" +
              (node.expand ? " expanded" : "") +
              (focused ? " focus" : "")
            }
            rx={ellipseX}
            ry={ellipseY}
          />
          {node.parameters.length !== 0 && (
            <circle
              className={
                "parameter" + (focused ? " focus" : "")
              }
              cx={ellipseY}
              cy={ellipseY}
              r={ellipseY / 2}
              strokeDasharray={1}
            />
          )}
          {node.constVals.length !== 0 && (
            <circle
              className={"const" + (focused ? " focus" : "")}
              cx={-ellipseY}
              cy={ellipseY}
              r={ellipseY / 2}
            />
          )}
        </g>
      );
    } else if (node.type === NodeType.GROUP || node.type === NodeType.DATA) {
      // GROUP或者DATA
      return (
        <rect
          className={focused ? "elk-label-container focus" : "elk-label-container"}
          width={rectWidth}
          height={rectHeight}
          transform={`translate(-${rectWidth / 2}, -${rectHeight / 2})`}
          fillOpacity={node.expand ? 0 : 1}
          pointerEvents="visibleStroke"
        ></rect>
      );
    } else if (node.type === NodeType.LAYER) {
      // LAYER
      if (node.class.indexOf(`layertype-${LayerType.FC}`) > -1) {
        return <LayerNodeContainer width={rectWidth} height={rectHeight} layerType={LayerType.FC} focused={focused} />;
      } else if (node.class.indexOf(`layertype-${LayerType.CONV}`) > -1) {
        return <LayerNodeContainer width={rectWidth} height={rectHeight} layerType={LayerType.CONV} focused={focused} />;
      } else if (node.class.indexOf(`layertype-${LayerType.RNN}`) > -1) {
        return <LayerNodeContainer width={rectWidth} height={rectHeight} layerType={LayerType.RNN} focused={focused} />;
      } else if (node.class.indexOf(`layertype-${LayerType.OTHER}`) > -1) {
        return <LayerNodeContainer width={rectWidth} height={rectHeight} layerType={LayerType.OTHER} focused={focused} />;
      }
    }
  };

  useEffect(() => {
    //目前仅支持拖拽叶节点
    d3.selectAll("g .node").on(".drag", null);
    let selectionNodes = d3.selectAll("g .child-node");
    if (selectionNodes.size() === 0) return;

    if (layoutModificationMode) {
      selectionNodes.call(d3.drag().on("start", dragStarted));
    }
    else return;

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
        const [offsetX, offsetY] = [d3.event.x - x, d3.event.y - y];
        if (
          Math.abs(offsetX) < antiShakeDistance ||
          Math.abs(offsetY) < antiShakeDistance
        ) {
          return;
        }
        node.classed("dragging", false);
        let toEditNode = elkNodeMap;

        const nodeId = node.node().id;

        nodeId.split("-").forEach((id) => {
          toEditNode = toEditNode[id];
        });
        toEditNode["x"] = toEditNode["x"] + offsetX;
        toEditNode["y"] = toEditNode["y"] + offsetY;
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
            const linkedEdges = `.${d.data.id4Style} .hover`;
            return (
              <g
                className={`node ${d.data.class} ${d.data.expand ? "expanded-node" : "child-node"}` +
                  `${(d.data.id4Style == startNodeId && isPathFindingMode) ? " startNode" : ""}` +
                  `${(d.data.id4Style == endNodeId && isPathFindingMode) ? " endNode" : ""}`
                }
                id={d.data.id4Style}
                data-id={d.data.id}
                key={d.key}
                transform={`translate(${d.style.gNodeTransX}, ${d.style.gNodeTransY})`}
                onClick={() => handleClick(d.data.id)}
                onDoubleClick={() => toggleExpanded(d.data.id, linkedEdges)}
                onMouseEnter={() => {
                  showHighlightedLine(linkedEdges)
                }}
                onMouseLeave={() => {
                  offHighlightedLine(linkedEdges)
                }}
                onContextMenu={(e) => handleRightClick(e)}
              >
                {getLabelContainer(
                  d.data,
                  d.style.ellipseX,
                  d.style.ellipseY,
                  d.style.rectWidth,
                  d.style.rectHeight
                )}
                <g className="my-label">
                  {showLineChart(d.data) &&
                    getLineChartAndText(
                      d.data,
                      d.style.rectWidth,
                      d.style.rectHeight
                    )}

                  {d.data.type === NodeType.OPERATION && (
                    <text
                      dominantBaseline={"baseline"}
                      y={`${-d.style.rectHeight / 4 - 3}`}
                      style={{ fontSize: 10 }}
                    >
                      {/* {d.data.label} */}
                      {d.data.label.slice(0, maxLabelLength) + (d.data.label.length > maxLabelLength ? "..." : "")}
                    </text>
                  )}

                  {!showLineChart(d.data) &&
                    d.data.type !== NodeType.OPERATION && (
                      <foreignObject
                        x={-d.style.rectWidth / 2}
                        y={-d.style.rectHeight / 2}
                        width={d.style.rectWidth}
                        height={d.style.rectHeight}
                      >
                        <div className="label">
                          <text>
                            {/* 增加一层text是为了让伪类中的before生效；否则不展示layerNode折线图的时候，图标不会显示 */}
                            {d.data.label.slice(0, maxLabelLength) + (d.data.label.length > maxLabelLength ? "..." : "")}
                          </text>
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
