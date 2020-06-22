import React, { useEffect, useRef, useState } from "react";
import { TransitionMotion } from "react-motion";
import { useVisGraph } from "../../store/visGraph";
import { useStyledGraph } from "../../store/styledGraph";
import { useLayoutGraph, setLayoutGraph } from "../../store/layoutGraph";
import { FCLayerNode, CONVLayerNode, RNNLayerNode, OTHERLayerNode } from '../LayerNodeGraph/LayerNodeGraph';
import { NodeType, LayerType } from "../../common/graph-processing/stage2/processed-graph";
import * as d3 from "d3";
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
}

const antiShakeDistance = 2;

const ELKLayoutNode: React.FC<Props> = (props: Props) => {
  const { setSelectedNodeId, selectedNodeId, handleRightClick, currentNotShowLineChartID, iteration } = props;
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
    let nodeId = id.replace(/-/g, "/");
    setSelectedNodeId(nodeId);
  };

  const handleClickAuxiliaryNode = (auxiliaryNodes: any[]) => {
    clickAuxiliaryNode = true;
    let nodeIds = [];
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
    // TODO: 最好的方式应该是在data里面添加一个nodetype
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
    return (
      <g className="LineChartInNode" >
        <LineGroup
          transform={`translate(-${rectWidth / 2},-${rectHeight * 3 / 8})`}
          width={rectWidth}
          height={rectHeight * 3 / 4}
          data={lineChartData.has(node.id) ? lineChartData.get(node.id) : []} />
        {console.log(lineChartData.get(node.id))}
        <text transform={`translate(0,-${rectHeight * 3 / 8})`}
          dominantBaseline={(node.class.indexOf('cluster') > -1) ? "text-before-edge" : "middle"}
        >
          {node.label}
        </text>
      </g >)

  }

  const getLabelContainer = (node, ellipseX, ellipseY, rectWidth, rectHeight) => {
    if (node.type === NodeType.OPERTATION) { // OPERATION
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
          {node.parameters.length !== 0
            && <circle cx={ellipseY} cy={ellipseY} r={ellipseY / 2} strokeDasharray={1} onClick={() => handleClickAuxiliaryNode(node.parameters)} />
          }
          {node.constVals.length !== 0
            && <circle cx={-ellipseY} cy={ellipseY} r={ellipseY / 2} onClick={() => handleClickAuxiliaryNode(node.constVals)} />
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
                  // d3.selectAll(".edgePath path")
                  //   .transition()
                  //   .style("stroke", "#3F3F3F")
                  //   .style("stroke-width", "1");
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
                {getLabelContainer(d.data, d.style.ellipseX, d.style.ellipseY, d.style.rectWidth, d.style.rectHeight)}
                <g className="my-label"
                  transform={
                    d.data.class.indexOf("cluster") > -1 ? `translate(0,-${d.style.rectHeight / 2})` : null
                  }
                >
                  {showLineChart(d.data) && getLineChartAndText(d.data, d.style.rectWidth, d.style.rectHeight)}

                  {d.data.expand ? (
                    <rect
                      className="behind-text"
                      width={d.data.textWidth}
                      height={10}
                      transform={`translate(-${d.data.textWidth / 2}, -${d.style.rectHeight / 2 + 5})`}
                      stroke="none"
                    ></rect>
                  ) : null}

                  {d.data.type === NodeType.OPERTATION && (
                    <text dominantBaseline={"baseline"} y={`${-d.style.rectHeight / 4 - 3}`} style={{ fontSize: 10 }}>
                      {d.data.label}
                    </text>
                  )}

                  {!showLineChart(d.data) && d.data.type !== NodeType.OPERTATION && (
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

                  {/* {!showLineChart(d.data) && d.data.type !== NodeType.OPERTATION && (
                    <text dominantBaseline={"middle"} y={d.data.expand ? `${-d.style.rectHeight / 2 + 2}` : null}>
                      {d.data.label}
                      {!d.data.expand && (d.data.type === NodeType.GROUP || d.data.type === NodeType.LAYER) && "+"}
                    </text>
                  )} */}
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
