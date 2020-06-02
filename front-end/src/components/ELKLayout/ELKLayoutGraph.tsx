import React, { useEffect, useRef, useState } from "react";
import "./ELKLayoutGraph.css";
import {
  NodeType,
  ProcessedGraph,
  RawEdge,
  NodeId,
  GroupNode,
} from "../../types/processed-graph";
import * as d3 from "d3";
import { TransitionMotion, spring } from "react-motion";
import {
  useProcessedGraph,
  broadcastGraphChange,
} from "../../store/useProcessedGraph";
import ELK from "elkjs/lib/elk.bundled.js";
import { on } from "cluster";
import {
  LayoutOptions,
  generateNode,
  generateNodeStyles,
  generateEdgeStyles,
} from "../../common/style/elkGraph";

window["d3"] = d3;
window["ELK"] = ELK;
let oldEleMap = {};
let newEleMap = {};

const portMode = false;
const maxPort = 10;
function restoreFromOldEleMap(newEle) {
  let oldEle = oldEleMap[newEle.id];
  if (oldEle) {
    let { x, y, $H, sections } = oldEle;
    newEle = Object.assign(newEle, { x, y, $H });
  }
  newEleMap[newEle.id] = newEle;
}

const ELKLayoutGraph: React.FC = () => {
  const graphForLayout = useProcessedGraph();
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [nodeStyles, setNodeStyles] = useState([]);
  const [linkStyles, setLinkStyles] = useState([]);
  const [elkNodeMap, setElkNodeMap] = useState({});
  const svgRef = useRef();
  const outputRef = useRef();

  const getX = (d) => {
    return d.x;
  };
  const getY = (d) => {
    return d.y;
  };
  // 根据points计算path的data
  const line = d3
    .line()
    .x((d) => getX(d))
    .y((d) => getY(d));

  const toggleExpanded = (id) => {
    let node = graphForLayout.nodeMap[id];
    if (node.type !== NodeType.GROUP && node.type !== NodeType.LAYER) {
      return;
    }
    node = node as GroupNode;
    node.expanded = !node.expanded;
    broadcastGraphChange();
  };

  const draw = (layoutOptions: LayoutOptions = { networkSimplex: true }) => {
    console.clear();
    const { networkSimplex } = layoutOptions;
    // setNodeStyles([]);
    setLinkStyles([]);
    const { nodeMap } = graphForLayout;
    let displayedNodes: Array<string> = graphForLayout.getDisplayedNodes();
    displayedNodes = [...new Set(displayedNodes)];
    const displayedEdges: Array<RawEdge> = graphForLayout.getDisplayedEdges(
      displayedNodes
    );

    let nodeLinkMap = {}
    displayedEdges.forEach(edge=>{
      if(edge.source in nodeLinkMap){
        nodeLinkMap[edge.source]["target"].push(edge.target);
      } else {
        nodeLinkMap[edge.source] = { source: [], target: [edge.target] };
      }
      if (edge.target in nodeLinkMap) {
        nodeLinkMap[edge.target]["source"].push(edge.source);
      } else {
        nodeLinkMap[edge.target] = { source: [edge.source], target: [] };
      }
    })

    let groups = {};
    let groupsNum = 0;
    displayedNodes.forEach((nodeId, i) => {
      const node = nodeMap[nodeId];
      if (node.parent !== "___root___") {
        if (!groups.hasOwnProperty(node.parent)) {
          groups[node.parent] = {};
          groups[node.parent]["nodes"] = [nodeId];
          groups[node.parent]["index"] = groupsNum++;
        } else {
          groups[node.parent]["nodes"].push(nodeId);
        }
      }
    });
    let newLinks = [];
    let linkMap = {}; //{sourceID:[target0,target1,...],...}
    let innerLeftLinkMap = {}; //links that are in the inner left side
    let innerRightLinkMap = {}; //links that are in the inner right side
    for (let i = 0; i < displayedEdges.length; i++) {
      const edge = displayedEdges[i];
      let source = nodeMap[edge.source]["id"];
      let target = nodeMap[edge.target]["id"];
      if (portMode) {
        //以下解决跨层边的id匹配问题，id升级至公共父节点
        let _source = source.split("/");
        let _target = target.split("/");
        let __source = source,
          __target = target;
        //子节点判断
        if (_source.length > _target.length) {
          __source = _source.slice(0, _target.length).join("/");
          while (nodeMap[source].parent !== nodeMap[target].parent) {
            addLinkMap(innerRightLinkMap, nodeMap[source].parent, source);
            source = nodeMap[source].parent;
          }
        } else if (_source.length < _target.length) {
          __target = _target.slice(0, _source.length).join("/");
          while (nodeMap[target].parent !== nodeMap[source].parent) {
            addLinkMap(innerLeftLinkMap, nodeMap[target].parent, target);
            target = nodeMap[target].parent;
          }
        } else {
          if (nodeMap[source].parent !== nodeMap[target].parent) {
            addLinkMap(innerRightLinkMap, nodeMap[source].parent, source);
          }
          if (nodeMap[target].parent !== nodeMap[source].parent) {
            addLinkMap(innerLeftLinkMap, nodeMap[target].parent, target);
          }
        }
        //保证边的直接父节点相同
        while (nodeMap[__source].parent !== nodeMap[__target].parent) {
          __source = nodeMap[__source].parent;
          __target = nodeMap[__target].parent;
        }
        addLinkMap(linkMap, __source, __target);
      }
      //reset成初始值，防止以上操作将其改变
      source = nodeMap[edge.source]["id"];
      target = nodeMap[edge.target]["id"];
      //group内部边，过滤
      if (
        nodeMap[edge.source].parent !== "___root___" &&
        nodeMap[edge.target].parent !== "___root___"
      ) {
        if (!portMode) {
          addLinkMap(linkMap, source, target);
        }
        continue;
      }
      if (portMode) {
        //将边升级至顶层
        while (nodeMap[source].parent !== "___root___") {
          source = nodeMap[source].parent;
        }
        while (nodeMap[target].parent !== "___root___") {
          target = nodeMap[target].parent;
        }
      }
      const inPort = nodeLinkMap[target].source.length > maxPort;
      const outPort = nodeLinkMap[source].target.length > maxPort;
      let newLink = {
        id: `${edge.source}-${edge.target}`,
        sources: [outPort ? source + "-out-port" : source],
        targets: [inPort ? target + "-in-port" : target],
        arrowheadStyle: "fill: #333; stroke: #333;",
        arrowhead: "vee",
      };
      restoreFromOldEleMap(newLink);
      newLinks.push(newLink);
    }
    let newNodes = [];
    newNodes = processNodes(
      nodeMap,
      linkMap,
      nodeLinkMap,
      innerLeftLinkMap,
      innerRightLinkMap,
      groups,
      displayedNodes,
      newNodes
    );
    let newElkNodeMap = {};
    generateElkNodeMap(newNodes, newElkNodeMap);
    setElkNodeMap(newElkNodeMap);
    let graph = {
      id: "root",
      children: newNodes,
      edges: newLinks,
    };
    oldEleMap = newEleMap;
    newEleMap = {};
    // console.log(JSON.stringify(graph));
    let layout;
    const elk = new ELK({ workerUrl: "./elk-worker.min.js" });
    // elk.knownLayoutOptions().then((ret) => {
    //   console.log("knownLayoutOptions: ", ret);
    // });
    // elk.knownLayoutCategories().then((ret) => {
    //   console.log("knownLayoutCategories: ", ret);
    // });
    // elk.knownLayoutAlgorithms().then((ret) => {
    //   console.log("knownLayoutAlgorithms: ", ret);
    // });

    elk
      .layout(graph, {
        // logging: true,
        // measureExecutionTime: true,
        layoutOptions: {
          algorithm: "layered",
          "org.eclipse.elk.layered.nodePlacement.strategy": networkSimplex
            ? "NETWORK_SIMPLEX"
            : "INTERACTIVE",
          "org.eclipse.elk.layered.nodePlacement.favorStraightEdges": "true",
          // "org.eclipse.elk.layered.layering.strategy": "INTERACTIVE",
          // "org.eclipse.elk.layered.mergeEdges": 'true',
          "org.eclipse.elk.layered.crossingMinimization.strategy":
            "LAYER_SWEEP",
          // "org.eclipse.elk.layered.cycleBreaking.strategy": "INTERACTIVE",
          "org.eclipse.elk.interactive": "true",
          "org.eclipse.elk.hierarchyHandling": "INCLUDE_CHILDREN", // 可INHERIT INCLUDE_CHILDREN SEPARATE_CHILDREN，布局时，跨聚合的边被不被考虑进来，默认SEPARATE_CHILDREN。

          // "org.eclipse.elk.edgeRouting": "SPLINES"
        },
      })
      .then((layout) => {
        console.log(layout);
        setNodes(layout.children);
        setLinks(layout.edges);
        let newNodeStyles = [];
        let newLinkStyles = [];
        //{x:0, y:0}: offset初始值
        generateEdgeStyles(layout.edges, { x: 0, y: 0 }, newLinkStyles);
        generateNodeStyles(
          layout.children,
          { x: 0, y: 0 },
          newNodeStyles,
          newLinkStyles
        );
        setNodeStyles(newNodeStyles);
        setLinkStyles(newLinkStyles);
      })
      .catch(console.error);
  };
  const addLinkMap = (linkMap, source, target) => {
    if (!linkMap.hasOwnProperty(source)) {
      linkMap[source] = [target];
    } else {
      linkMap[source].push(target);
    }
  };
  const processNodes = (
    nodeMap,
    linkMap,
    nodeLinkMap,
    innerLeftLinkMap,
    innerRightLinkMap,
    groups,
    displayedNodes,
    newNodes
  ) => {
    const processChildren = (nodeId, newNode, newNodes) => {
      if (groups.hasOwnProperty(nodeId)) {
        //为group节点注入子节点及边
        let children = [];
        let edges = [];
        const parentId = nodeId;
        let subNodes = groups[parentId]["nodes"];
        subNodes.forEach((id) => {
          const node = nodeMap[id];
          let inPort = false,
            outPort = false;
          if (id in nodeLinkMap) {
            inPort = nodeLinkMap[id].source.length > 10;
            outPort = nodeLinkMap[id].target.length > 10;
          } 
          let child = generateNode(node, inPort, outPort);
          processChildren(id, child, children);
          const source = id;
          if (linkMap.hasOwnProperty(source)) {
            linkMap[source].forEach((target) => {
              const inPort = nodeLinkMap[target].source.length > maxPort;
              const outPort = nodeLinkMap[source].target.length > maxPort;
              let edge = {
                id: `${source}-${target}`,
                sources: [outPort ? source + "-out-port" : source],
                targets: [inPort ? target + "-in-port" : target],
                arrowheadStyle: "fill: #333; stroke: #333;",
                arrowhead: "vee",
              };
              restoreFromOldEleMap(edge);
              edges.push(edge);
            });
          }
        });
        if (portMode) {
          if (innerLeftLinkMap.hasOwnProperty(parentId)) {
            innerLeftLinkMap[parentId].forEach((target, i) => {
              let edge = {
                id: `__${i}__${parentId}-${target}`,
                sources: [parentId + "-in-port"],
                targets: [target + "-in-port"],
                arrowheadStyle: "fill: #333; stroke: #333;",
                arrowhead: "vee",
              };
              restoreFromOldEleMap(edge);
              edges.push(edge);
            });
          }
          if (innerRightLinkMap.hasOwnProperty(parentId)) {
            innerRightLinkMap[parentId].forEach((source, i) => {
              let edge = {
                id: `__${i}__${source}-${parentId}`,
                sources: [source + "-out-port"],
                targets: [parentId + "-out-port"],
                arrowheadStyle: "fill: #333; stroke: #333;",
                arrowhead: "vee",
              };
              restoreFromOldEleMap(edge);
              edges.push(edge);
            });
          }
        }
        newNode["expand"] = true;
        newNode["children"] = children;
        newNode["edges"] = edges;
      }
      restoreFromOldEleMap(newNode);
      newNodes.push(newNode);
    };
    for (let i = 0; i < displayedNodes.length; i++) {
      const nodeId = displayedNodes[i];
      const node = nodeMap[nodeId];
      //父节点不是根节点，说明是展开的内部节点，这里过滤
      if (node.parent !== "___root___") {
        continue;
      }
      let inPort = false, outPort = false
      if(nodeId in nodeLinkMap){
        inPort = nodeLinkMap[nodeId].source.length > 10;
        outPort = nodeLinkMap[nodeId].target.length > 10;
      } 
      let newNode = generateNode(node, inPort, outPort);
      processChildren(nodeId, newNode, newNodes);
    }
    return newNodes;
  };

  const generateElkNodeMap = (elkNodeList, elkNodeMap) => {
    elkNodeList.forEach((node) => {
      if (node.hasOwnProperty("children")) {
        let subMap = {};
        generateElkNodeMap(node["children"], subMap);
        elkNodeMap[node.id] = subMap;
      } else {
        elkNodeMap[node.id] = node;
      }
    });
  };
  const textSize = (text, fontSize = "10px", fontFamily = "Arial") => {
    //过河拆桥法计算字符串的显示长度
    let span = document.createElement("span");
    span.style.visibility = "hidden";
    // span.style.fontSize = fontSize;
    // span.style.fontFamily = fontFamily;
    span.style.display = "inline-block";
    document.body.appendChild(span);
    if (typeof span.textContent != "undefined") {
      span.textContent = text;
    } else {
      span.innerText = text;
    }
    let width = parseFloat(window.getComputedStyle(span).width);
    document.body.removeChild(span);
    return width;
  };

  useEffect(() => {
    //目前仅支持拖拽叶节点
    d3.selectAll(".node").on(".drag", null);
    let selectionNodes = d3.selectAll(".child-node");
    if (selectionNodes.size() === 0) return;
    selectionNodes.call(d3.drag().on("start", dragStarted));

    function dragStarted() {
      let node = d3.select(this).classed("dragging", true);
      d3.event.on("drag", dragged).on("end", ended);
      const { x, y } = d3.event;
      function dragged(d) {
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
            if (toEditNode.hasOwnProperty("children")) {
              toEditNode = toEditNode["children"];
            }
          });
        }
        toEditNode = toEditNode[nodeID];
        toEditNode["x"] = d3.event.x;
        toEditNode["y"] = d3.event.y;
        draw({ networkSimplex: false });
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

  useEffect(() => {
    if (
      graphForLayout === undefined ||
      Object.keys(graphForLayout.nodeMap).length === 0
    )
      return;
    draw();
  }, [graphForLayout]);

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
              fill="#333"
              stroke="#333"
            ></path>
          </marker>
        </defs>
        <g className="output" id="output-g" ref={outputRef}>
          <TransitionMotion styles={nodeStyles}>
            {(interpolatedStyles) => (
              <g className="nodes">
                {interpolatedStyles.map((d) => {
                  if (d.data.class === "dummy") {
                    return;
                  }
                  const textWidth =
                    textSize(
                      d.data.label +
                        (!d.data.expand &&
                        (d.data.type === NodeType.GROUP ||
                          d.data.type === NodeType.LAYER)
                          ? "+"
                          : "")
                    ) + 2;
                  return (
                    <g
                      className={`node ${d.data.class} ${
                        d.data.expand ? "expanded-node" : "child-node"
                      }`}
                      id={d.data.parent + "-" + d.data.id}
                      key={d.key}
                      transform={`translate(${d.style.gNodeTransX}, ${d.style.gNodeTransY})`}
                      onClick={() => toggleExpanded(d.data.id)}
                    >
                      {d.data.class === "nodeitem-0" ? (
                        <ellipse
                          className="elk-label-container"
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
                            width={textWidth}
                            height={10}
                            transform={`translate(-${textWidth / 2}, -${
                              d.style.rectHeight / 2 + 5
                            })`}
                            fill="red"
                            stroke="none"
                          ></rect>
                        ) : null}
                        <text
                          dominantBaseline={
                            d.data.expand ? "baseline" : "middle"
                          }
                          y={
                            d.data.expand
                              ? `${-d.style.rectHeight / 2 + 5}`
                              : null
                          }
                        >
                          {d.data.label}
                          {!d.data.expand &&
                          (d.data.type === NodeType.GROUP ||
                            d.data.type === NodeType.LAYER)
                            ? "+"
                            : null}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </g>
            )}
          </TransitionMotion>
          <TransitionMotion styles={linkStyles}>
            {(interpolatedStyles) => (
              <g className="edgePaths">
                {interpolatedStyles.map((d) => (
                  <g className="edgePath" key={d.key}>
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
