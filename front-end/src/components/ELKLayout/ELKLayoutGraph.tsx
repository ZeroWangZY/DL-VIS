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
window["ELK"] = ELK;
const ELKLayoutGraph: React.FC = () => {
  const graphForLayout = useProcessedGraph();
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [nodeStyles, setNodeStyles] = useState([]);
  const [linkStyles, setLinkStyles] = useState([]);
  const [transform, setTransform] = useState(null);
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

  const draw = () => {
    // setNodeStyles([])
    setLinkStyles([]);
    const { nodeMap } = graphForLayout;
    const displayedNodes: Array<string> = graphForLayout.getDisplayedNodes();
    const displayedEdges: Array<RawEdge> = graphForLayout.getDisplayedEdges(
      displayedNodes
    );

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
      //以下解决跨层边的id匹配问题，id升级至公共父节点
      let _source = source.split("/");
      let _target = target.split("/");
      let __source = source,
        __target = target;
      //子节点判断
      if (_source.length > _target.length) {
        __source = _source.slice(0, _target.length).join("/");
        while (nodeMap[source].parent !== nodeMap[target].parent) {
          // console.log(source + "-->" + target);
          addLinkMap(innerRightLinkMap, nodeMap[source].parent, source);
          source = nodeMap[source].parent;
        }
      } else if (_source.length < _target.length) {
        __target = _target.slice(0, _source.length).join("/");
        while (nodeMap[target].parent !== nodeMap[source].parent) {
          // console.log(source + "-->" + target);
          addLinkMap(innerLeftLinkMap, nodeMap[target].parent, target);
          target = nodeMap[target].parent;
        }
      } else {
        if (nodeMap[source].parent !== nodeMap[target].parent) {
          // console.log(source + "-->" + target);
          addLinkMap(innerRightLinkMap, nodeMap[source].parent, source);
        }
        if (nodeMap[target].parent !== nodeMap[source].parent) {
          // console.log(source + "-->" + target);
          addLinkMap(innerLeftLinkMap, nodeMap[target].parent, target);
        }
      }
      //保证边的直接父节点相同
      while (nodeMap[__source].parent !== nodeMap[__target].parent) {
        __source = nodeMap[__source].parent;
        __target = nodeMap[__target].parent;
      }

      addLinkMap(linkMap, __source, __target);

      //reset成初始值，防止以上操作将其改变
      source = nodeMap[edge.source]["id"];
      target = nodeMap[edge.target]["id"];
      //group内部边，过滤
      if (
        nodeMap[edge.source].parent !== "___root___" &&
        nodeMap[edge.target].parent !== "___root___"
      ) {
        continue;
      }
      //将边升级至顶层
      while (nodeMap[source].parent !== "___root___") {
        source = nodeMap[source].parent;
      }
      while (nodeMap[target].parent !== "___root___") {
        target = nodeMap[target].parent;
      }
      let newLink = {
        id: `__top__${edge.source}-${edge.target}`,
        sources: [source + "-out-port"],
        targets: [target + "-in-port"],
        arrowheadStyle: "fill: #333; stroke: #333;",
        arrowhead: "vee",
      };
      newLinks.push(newLink);
    }
    let newNodes = [];
    newNodes = processNodes(
      nodeMap,
      linkMap,
      innerLeftLinkMap,
      innerRightLinkMap,
      groups,
      displayedNodes,
      newNodes
    );
    let graph = {
      id: "root",
      layoutOptions: { algorithm: "layered" },
      children: newNodes,
      edges: newLinks,
    };
    let layout;
    const elk = new ELK();
    elk.knownLayoutOptions().then((ret) => {
      console.log("knownLayoutOptions: ", ret);
    });
    elk.knownLayoutCategories().then((ret) => {
      console.log("knownLayoutCategories: ", ret);
    });
    elk.knownLayoutAlgorithms().then((ret) => {
      console.log("knownLayoutAlgorithms: ", ret);
    });

    elk
      .layout(graph, {
        logging: true,
        measureExecutionTime: true,
      })
      .then((result) => {
        console.log(result);
        layout = result;
        setNodes(layout.children);
        setLinks(layout.edges);
        let newNodeStyles = [];
        let newLinkStyles = [];
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
  const generateNode = (node) => ({
    id: node.id,
    label: node.displayedName,
    shape: node.type === NodeType.OPERTATION ? "ellipse" : "rect",
    class: `nodeitem-${node.type}`,
    type: node.type,
    layoutOptions: {
      algorithm: "layered",
      portConstraints: "FIXED_SIDE",
    },
    expand: false,
    width: Math.max(node.displayedName.length, 3) * 10,
    height: 50,
    ports: [
      {
        id: node.id + "-in-port",
        properties: {
          "port.side": "WEST",
        },
      },
      {
        id: node.id + "-out-port",
        layoutOptions: {
          "port.side": "EAST",
        },
      },
    ],
  });
  const processNodes = (
    nodeMap,
    linkMap,
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
        const nodeSet = new Set(subNodes);
        subNodes.forEach((id) => {
          const node = nodeMap[id];
          let child = generateNode(node);
          processChildren(id, child, children);
          const source = id;
          if (linkMap.hasOwnProperty(source)) {
            linkMap[source].forEach((target) => {
              if (nodeSet.has(target)) {
                //保证边在group内部
                let edge = {
                  id: `${source}-${target}`,
                  sources: [source + "-out-port"],
                  targets: [target + "-in-port"],
                  arrowheadStyle: "fill: #333; stroke: #333;",
                  arrowhead: "vee",
                };
                edges.push(edge);
              }
            });
          }
        });
        if (innerLeftLinkMap.hasOwnProperty(parentId)) {
          innerLeftLinkMap[parentId].forEach((target,i)=>{
            // console.log(parentId + "->" + target);
            let edge = {
              id: `__${i}__${parentId}-${target}`,
              sources: [parentId + "-in-port"],
              targets: [target + "-in-port"],
              arrowheadStyle: "fill: #333; stroke: #333;",
              arrowhead: "vee",
            };
            edges.push(edge);
          });
        }
        if (innerRightLinkMap.hasOwnProperty(parentId)) {
          innerRightLinkMap[parentId].forEach((source, i) => {
            // console.log(source + "->" + parentId);
            let edge = {
              id: `__${i}__${source}-${parentId}`,
              sources: [source + "-out-port"],
              targets: [parentId + "-out-port"],
              arrowheadStyle: "fill: #333; stroke: #333;",
              arrowhead: "vee",
            };
            edges.push(edge);
          });
        }
        newNode["expand"] = true;
        newNode["children"] = children;
        newNode["edges"] = edges;
      }
      newNodes.push(newNode);
    };
    for (let i = 0; i < displayedNodes.length; i++) {
      const nodeId = displayedNodes[i];
      const node = nodeMap[nodeId];
      //父节点不是根节点，说明是展开的内部节点，这里过滤
      if (node.parent !== "___root___") {
        continue;
      }
      let newNode = generateNode(node);
      processChildren(nodeId, newNode, newNodes);
    }
    return newNodes;
  };

  const generateNodeStyles = (nodes, ofs, nodeStyles, linkStyles) => {
    for (const node of nodes) {
      nodeStyles.push({
        key: node.id,
        data: node.hasOwnProperty("label")
          ? {
              class: node.class,
              type: node.type,
              id: node.id,
              label: node.label,
              expand: node.expand,
            }
          : {
              class: "dummy",
              type: "dummy",
              id: node.id,
              label: node.id,
              expand: node.expand,
            },
        style: {
          gNodeTransX: spring(ofs.x + node.x + node.width / 2),
          gNodeTransY: spring(ofs.y + node.y + node.height / 2),
          rectWidth: spring(node.width),
          rectHeight: spring(node.height),
          ellipseX: spring(node.width / 2),
          ellipseY: spring(node.height / 2),
        },
      });
      if (node.hasOwnProperty("children")) {
        generateEdgeStyles(
          node["edges"],
          { x: ofs.x + node.x, y: ofs.y + node.y },
          linkStyles
        );
        generateNodeStyles(
          node["children"],
          { x: ofs.x + node.x, y: ofs.y + node.y },
          nodeStyles,
          linkStyles
        );
      }
    }
  };

  const generateEdgeStyles = (links, ofs, styles) => {
    for (const link of links) {
      const { startPoint, endPoint, bendPoints } = link.sections[0];
      const { junctionPoints } = link;
      styles.push({
        key: link.id,
        data: {
          lineData:
            bendPoints === undefined
              ? []
              : bendPoints.map((point) => ({
                  x: ofs.x + point.x,
                  y: ofs.y + point.y,
                })),
          junctionPoints:
            junctionPoints === undefined
              ? []
              : junctionPoints.map((point) => ({
                  x: ofs.x + point.x,
                  y: ofs.y + point.y,
                })),
        },
        style: {
          startPointX: spring(ofs.x + startPoint.x),
          startPointY: spring(ofs.y + startPoint.y),
          endPointX: spring(ofs.x + endPoint.x),
          endPointY: spring(ofs.y + endPoint.y),
        },
      });
    }
  };

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
    <div id="cola-graph" style={{ height: "100%" }}>
      <svg id="cola-svg" ref={svgRef} style={{ height: "100%" }}>
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
        <g
          className="output"
          id="output-g"
          ref={outputRef}
          transform={transform}
        >
          <TransitionMotion styles={nodeStyles}>
            {(interpolatedStyles) => (
              <g className="nodes" key="nodes">
                {interpolatedStyles.map((d) => {
                  if (d.data.class === "dummy") {
                    return;
                  }
                  return (
                    <g
                      className={`node ${d.data.class}`}
                      id={d.data.id}
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
                            width={Math.max(d.data.label.length, 3) * 10}
                            height={10}
                            transform={`translate(-${
                              (Math.max(d.data.label.length, 3) * 10) / 2
                            }, -${d.style.rectHeight / 2 + 5})`}
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
              <g className="edgePaths" key="links">
                {interpolatedStyles.map((d) => (
                  <g className="edgePath" key={d.key}>
                    <path
                      d={line([
                        { x: d.style.startPointX, y: d.style.startPointY },
                        ...d.data.lineData,
                        { x: d.style.endPointX, y: d.style.endPointY },
                      ])}
                      markerEnd="url(#arrowhead)"
                      stroke="red"
                    ></path>
                    {d.data.junctionPoints.map((point,i) => (
                      <circle
                        key={d.key+"_junkPoint_"+i}
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
