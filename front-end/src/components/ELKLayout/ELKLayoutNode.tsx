import React, { useEffect, useRef, useState } from "react";
import { TransitionMotion } from "react-motion";
import { useVisGraph } from "../../store/visGraph";
import { useStyledGraph } from "../../store/styledGraph";
import { useLayoutGraph, setLayoutGraph } from "../../store/layoutGraph";
import { FCLayerNode, CONVLayerNode, RNNLayerNode, OTHERLayerNode } from '../LayerNodeGraph/LayerNodeGraph';
import { NodeType, LayerType } from "../../common/graph-processing/stage2/processed-graph";
import * as d3 from "d3";
import styles from "../../CSSVariables/CSSVariables.less"
import elkStyles from "./ELKLayoutGraph.less";
import {
  useProcessedGraph,
  modifyProcessedGraph,
  ProcessedGraphModificationType,
} from "../../store/processedGraph";
import { fetchAndGetLayerInfo } from '../../common/model-level/snaphot'
import { LineGroup } from '../LineCharts/index'
import { produceLayoutGraph } from "../../common/graph-processing/stage4/produce-layout-graph";
import { useGlobalConfigurations } from "../../store/global-configuration";
import convURL from '../../icon/conv.png';

interface Props {
  setSelectedNodeId: { (nodeId: string | string[]): void };
  selectedNodeId: string | string[] | null;
  handleRightClick: { (e: any): void };
  currentNotShowLineChartID: string[];
  iteration: number;
  selectedAuxiliaryNodeId: string;
  setSelectedAuxiliaryNodeId: { (nodeId: string): void };
}

const antiShakeDistance = 2;

const ELKLayoutNode: React.FC<Props> = (props: Props) => {
  const edgePathStrokeColor = styles.edge_path_stroke_color;
  const edgePathStrokeWidth = styles.edge_path_stroke_width;
  const hoverEdgePathStrokeColor = styles.hover_edge_path_stroke_color;
  const hoverEdgePathStrokeWidth = styles.hover_edge_path_stroke_width;

  const { setSelectedNodeId,
    selectedNodeId,
    handleRightClick,
    currentNotShowLineChartID,
    iteration,
    selectedAuxiliaryNodeId,
    setSelectedAuxiliaryNodeId } = props;
  const { diagnosisMode, isHiddenInterModuleEdges } = useGlobalConfigurations();
  const graphForLayout = useProcessedGraph();
  const visGraph = useVisGraph();
  const layoutGraph = useLayoutGraph();
  const styledGraph = useStyledGraph();
  const { shouldMergeEdge } = useGlobalConfigurations();

  const [lineChartData, setLineChartData] = useState(new Map());
  let _lineChartData = new Map();
  const getLayerInfo = async () => {
    if (styledGraph === null || styledGraph.nodeStyles === null) return;
    let nodes = styledGraph.nodeStyles;

    for (const node of nodes) {
      if (node.data.type === NodeType.LAYER) { // LAYER
        let data = await fetchAndGetLayerInfo({
          "STEP_FROM": iteration,
          "STEP_TO": iteration + 20
        }, node.data.id, graphForLayout);
        _lineChartData.set(node.data.id, data);
      }
    }
  }

  useEffect(() => {
    getLayerInfo().then(() => {
      setLineChartData(_lineChartData);
    });
  }, [styledGraph])

  let clickAuxiliaryNode = false;
  const handleClick = (id) => {
    if (clickAuxiliaryNode === true) {
      clickAuxiliaryNode = false;
      return;
    }
    let nodeId = id // .replace(/-/g, "/");
    setSelectedAuxiliaryNodeId("");
    setSelectedNodeId(nodeId);
  };

  const handleClickAuxiliaryNode = (paramOrConstId: string, auxiliaryNodes: any[]) => {
    clickAuxiliaryNode = true;
    let nodeIds = [];
    setSelectedAuxiliaryNodeId(paramOrConstId);
    for (let node of auxiliaryNodes)
      nodeIds.push(node.id);
    setSelectedNodeId(nodeIds);
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

  const showLineChart = (node): boolean => {
    if (diagnosisMode
      && (node.type === NodeType.LAYER && node.expand === false)
      && currentNotShowLineChartID.indexOf(node.id) < 0)
      return true;
    return false;
  }

  const editLayoutGraph = (): void => {
    const lGraph = produceLayoutGraph(visGraph, {
      networkSimplex: false,
      mergeEdge: shouldMergeEdge,
    });
    lGraph.then((result) => {
      setLayoutGraph(result);
    });
  };

  const getLineChartAndText = (node, rectWidth, rectHeight) => {
    const iconSize = parseInt(elkStyles.iconSize);
    console.log(typeof iconSize)
    // 注意： 目前折线图处于中间3/4之类。所以上方和下方分别剩余1/8的空余
    return (
      <g className="LineChartInNode" >
        <LineGroup
          transform={`translate(-${rectWidth / 2},-${rectHeight * 3 / 8})`}
          width={rectWidth}
          height={rectHeight * 3 / 4}
          data={lineChartData.has(node.id) ? lineChartData.get(node.id) : []} />
        {console.log(lineChartData.get(node.id))}
        <foreignObject
          x={-rectWidth / 2}
          y={-rectHeight * 3 / 8 - iconSize}
          width={rectWidth}
          height={iconSize}>
          <div>
            <text >
              {node.label.length <= 10 ? node.label : (node.label.slice(0, 10) + "...")}
            </text>
          </div>
        </foreignObject>
      </g >)

  }

  const getLabelContainer = (node, ellipseX, ellipseY, rectWidth, rectHeight) => {
    if (node.type === NodeType.OPERTATION) { // OPERATION
      let parameterId = node.id + "_parameter";
      let constId = node.id + "_const";
      return (
        <g>
          {node.isStacked && (
            <>
              <ellipse
                className={
                  "elk-label-container" +
                  (node.expand ? " expanded" : "") +
                  (node.id === selectedNodeId ? " focus" : "")
                }
                rx={ellipseX}
                ry={ellipseY}
                transform="translate(0, 6)"
              />
              <ellipse
                className={
                  "elk-label-container" +
                  (node.expand ? " expanded" : "") +
                  (node.id === selectedNodeId ? " focus" : "")
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
              (node.id === selectedNodeId ? " focus" : "")
            }
            rx={ellipseX}
            ry={ellipseY}
          />
          {node.parameters.length !== 0 &&
            <circle
              className={"parameter" + (selectedAuxiliaryNodeId === parameterId ? " focus" : "")}
              cx={ellipseY}
              cy={ellipseY}
              r={ellipseY / 2}
              strokeDasharray={1}
              onClick={() => handleClickAuxiliaryNode(parameterId, node.parameters)} />
          }
          {node.constVals.length !== 0 &&
            <circle
              className={"const" + (selectedAuxiliaryNodeId === constId ? " focus" : "")}
              cx={-ellipseY}
              cy={ellipseY}
              r={ellipseY / 2}
              onClick={() => handleClickAuxiliaryNode(constId, node.constVals)} />
          }
        </g>)

    }
    else if (node.type === NodeType.GROUP || node.type === NodeType.DATA) { // GROUP或者DATA
      return (
        <rect
          className={
            node.id === selectedNodeId
              ? "elk-label-container focus"
              : "elk-label-container"
          }
          width={rectWidth}
          height={rectHeight}
          transform={`translate(-${rectWidth / 2}, -${
            rectHeight / 2
            })`}
          fillOpacity={node.expand ? 0 : 1}
          pointerEvents="visibleStroke"
        ></rect>
      )
    } else if (node.type === NodeType.LAYER) { // LAYER
      if (node.class.indexOf(`layertype-${LayerType.FC}`) > -1) {
        return (<FCLayerNode width={rectWidth} height={rectHeight} />);
      } else if (node.class.indexOf(`layertype-${LayerType.CONV}`) > -1) {
        return (<CONVLayerNode width={rectWidth} height={rectHeight} />);
      } else if (node.class.indexOf(`layertype-${LayerType.RNN}`) > -1) {
        return (<RNNLayerNode width={rectWidth} height={rectHeight} />);
      } else if (node.class.indexOf(`layertype-${LayerType.OTHER}`) > -1) {
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
                data-id={d.data.id}
                key={d.key}
                transform={`translate(${d.style.gNodeTransX}, ${d.style.gNodeTransY})`}
                onClick={() => handleClick(d.data.id)}
                onDoubleClick={() => toggleExpanded(d.data.id)}
                onMouseOver={() => {
                  d3.selectAll(selectContent)
                    .transition()
                    .style("stroke", hoverEdgePathStrokeColor)
                    .style("stroke-width", hoverEdgePathStrokeWidth);
                }}
                onMouseOut={() => {
                  d3.selectAll(selectContent)
                    .transition()
                    .style("stroke", "none")
                    .style("stroke-width", "1");
                }}
                onContextMenu={(e) => handleRightClick(e)}
              >
                {getLabelContainer(d.data, d.style.ellipseX, d.style.ellipseY, d.style.rectWidth, d.style.rectHeight)}
                <g className="my-label"
                  // transform={
                  //   d.data.class.indexOf("cluster") > -1 ? `translate(0,-${d.style.rectHeight / 2})` : null
                  // }
                >
                  {showLineChart(d.data) && getLineChartAndText(d.data, d.style.rectWidth, d.style.rectHeight)}

                  {d.data.type === NodeType.OPERTATION && (
                    <text dominantBaseline={"baseline"} y={`${-d.style.rectHeight / 4 - 3}`} style={{ fontSize: 10 }}>
                      {d.data.label}
                    </text>
                  )}

                  {!showLineChart(d.data) && d.data.type !== NodeType.OPERTATION && (
                    <foreignObject
                      x={-d.style.rectWidth / 2}
                      y={-d.style.rectHeight / 2}
                      // transform={`translate(-${d.style.rectWidth / 2}, -${d.style.rectHeight / 2})`}
                      width={d.style.rectWidth}
                      height={d.style.rectHeight}
                    >
                      <div className="label">
                        <text>
                          {d.data.label.length <= 10 ? d.data.label : (d.data.label.slice(0, 10) + "...")}
                          {!d.data.expand &&
                            (d.data.type === NodeType.GROUP ||
                              d.data.type === NodeType.LAYER) &&
                            "+"}
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
