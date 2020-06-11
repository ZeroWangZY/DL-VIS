import React, { useEffect, useRef, useState } from "react";
import { TransitionMotion } from "react-motion";
import { useStyledGraph } from "../../store/styledGraph";
import { useLayoutGraph } from "../../store/layoutGraph";
import { NodeType, Attribute, LayerType, DataType, RawEdge, GroupNode, LayerNode, GroupNodeImp, LayerNodeImp, DataNodeImp, OperationNode, OperationNodeImp, ModuleEdge } from '../../common/graph-processing/stage2/processed-graph'
import * as d3 from "d3";
import {
  modifyProcessedGraph,
  ProcessedGraphModificationType,
  useProcessedGraph
} from "../../store/processedGraph";

interface Props {
  handleChangeOutputNodeName: { (name: string[]): void }
  handleChangeInputNodeName: { (name: string[]): void }
  handleChangeSelectedNodeName: { (name: string): void }
  handleChangeLeafAndChildrenNum: { (num: Number[]): void }
  handleChangeNodeAttribute: { (attr: Attribute[]): void }
}

const ELKLayoutNode: React.FC<Props> = (props: Props) => {
  const {
    handleChangeOutputNodeName,
    handleChangeInputNodeName,
    handleChangeSelectedNodeName,
    handleChangeLeafAndChildrenNum,
    handleChangeNodeAttribute } = props;
  const styledGraph = useStyledGraph();
  const layoutGraph = useLayoutGraph();
  const graphForLayout = useProcessedGraph();
  const [selectedNodeId, setSelectedNodeId] = useState("");

  const showInfoCard = id => {
    let GraphId = id;
    id = id.replace(/-/g, '/'); //还原为nodemap中存的id格式
    let nodeMap = graphForLayout.nodeMap
    let node = nodeMap[id];

    // TODO: 目前只考虑ms图
    if (node.type === NodeType.LAYER) {
      return;
    }

    if (node.type === NodeType.GROUP) {
      let splitName = GraphId.split("/")

      handleChangeSelectedNodeName(splitName[splitName.length - 1]);
      setSelectedNodeId(GraphId)

      handleChangeLeafAndChildrenNum([(node as GroupNode).leafOperationNodeCount, (node as GroupNode).operationChildrenCount])
      handleChangeOutputNodeName(Array.from((node as GroupNode).outputNode));
      handleChangeInputNodeName(Array.from((node as GroupNode).inputNode));
      handleChangeNodeAttribute([]);
    }
    if (node.type === NodeType.OPERTATION) {
      handleChangeSelectedNodeName(nodeMap[GraphId].displayedName);
      setSelectedNodeId(GraphId);

      handleChangeLeafAndChildrenNum([0, 0]);
      handleChangeNodeAttribute((node as OperationNodeImp).attributes);
      handleChangeOutputNodeName(Array.from((node as OperationNodeImp).outputNode));
      handleChangeInputNodeName(Array.from((node as OperationNodeImp).inputNode));
    }

    if (node.type === NodeType.DATA) {
      //GraphId是 data_Input2_1 或者 cst1_Input2_1 格式
      let splitName = GraphId.split("_Input2_")
      handleChangeSelectedNodeName(splitName[0]);
      setSelectedNodeId(GraphId);

      handleChangeLeafAndChildrenNum([0, 0]);
      if ((node as DataNodeImp).dataType === DataType.PARAMETER)
        handleChangeNodeAttribute([(node as DataNodeImp).typeAttibute]);
      else handleChangeNodeAttribute([]);
      handleChangeOutputNodeName(Array.from((node as DataNodeImp).outputNode));
      handleChangeInputNodeName(Array.from((node as DataNodeImp).inputNode));
    }
  }


  let elkNodeMap = {};
  if (layoutGraph) {
    elkNodeMap = layoutGraph.elkNodeMap;
  }
  const toggleExpanded = (id): void => {
    modifyProcessedGraph(ProcessedGraphModificationType.TOGGLE_EXPANDED, {
      nodeId: id,
    });
  };
  useEffect(() => {
    //目前仅支持拖拽叶节点
    d3.selectAll(".node").on(".drag", null);
    let selectionNodes = d3.selectAll(".child-node");
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
                onClick={() => showInfoCard(d.data.id)}
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
                      className={(d.data.id === selectedNodeId) ? "elk-label-container focus" : "elk-label-container"}
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
  )
}

export default ELKLayoutNode;