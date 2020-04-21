import React, { useEffect, useRef, useState } from "react";
import "./ColaLayoutGraph.css";
import {
  NodeType,
  ProcessedGraph,
  RawEdge,
  NodeId,
  GroupNode,
} from "../../types/processed-graph";
import * as dagre from "dagre";
import * as cola from "webcola";
import * as d3 from "d3";
import { TransitionMotion, spring } from "react-motion";
import {
  useProcessedGraph,
  broadcastGraphChange,
} from "../../store/useProcessedGraph";
import { group } from "d3";

const ColaLayoutGraph: React.FC = () => {
  const graphForLayout = useProcessedGraph();
  const [graph, setGraph] = useState();
  const [edges, setEdges] = useState([]);
  const [groupsObj, setGroupsObj] = useState({});
  const [groups, setGroups] = useState([]);
  const [nodes, setNodes] = useState([]);
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
    const { nodeMap } = graphForLayout;
    const displayedNodes: Array<string> = graphForLayout.getDisplayedNodes();
    const displayedEdges: Array<RawEdge> = graphForLayout.getDisplayedEdges(
      displayedNodes
    );

    let groupsObj = {},
      groups = [];
    displayedNodes.forEach((nodeId, i) => {
      const node = nodeMap[nodeId];
      if (node.parent !== "___root___") {
        if (!groupsObj.hasOwnProperty(node.parent)) {
          groupsObj[node.parent] = [nodeId];
        } else {
          groupsObj[node.parent].push(nodeId);
        }
      }
    });

    let newNodes = [];
    for (let i = 0, j = 0; i < displayedNodes.length; i++) {
      const nodeId = displayedNodes[i];
      const node = nodeMap[nodeId];
      if (groupsObj.hasOwnProperty(nodeId)) {
        continue;
      }
      node["no"] = j++;
      let newNode = {
        id: node["no"],
        name: node.id,
        label: node.displayedName,
        shape: node.type === NodeType.OPERTATION ? "ellipse" : "rect",
        class: `nodeitem-${node.type}`,
        width: Math.max(node.displayedName.length, 3) * 10,
        height: 50,
      };
      newNodes.push(newNode);
    }
    if (Object.keys(groupsObj).length > 0) {
      groups = Object.keys(groupsObj).map((parentId) => {
        return {
          leaves: groupsObj[parentId].map((id) => nodeMap[id]["no"]),
          padding: 2,
        };
      });
    }
    let newEdges = [];
    displayedEdges.forEach((edge, i) => {
      let newEdge = {
        id: `${edge.source}-${edge.target}`,
        source: nodeMap[edge.source]["no"],
        target: nodeMap[edge.target]["no"],
        arrowheadStyle: "fill: #333; stroke: #333;",
        arrowhead: "vee",
      };
      newEdges.push(newEdge);
    });

    const constraints = [
      // {
      //   type: "alignment",
      //   axis: "x",
      //   offsets: [
      //     { node: "1", offset: "0" },
      //     { node: "2", offset: "0" },
      //     { node: "3", offset: "0" },
      //   ],
      // },
      // {
      //   type: "alignment",
      //   axis: "y",
      //   offsets: [
      //     { node: "0", offset: "0" },
      //     { node: "1", offset: "0" },
      //     // { node: "4", offset: "0" },
      //   ],
      // },
    ];

    let graph = {
      nodes: newNodes,
      edges: newEdges,
      constraints: constraints,
      groups: groups,
    };

    let colaLayout = new cola.Layout()
      .size([700, 700])
      .linkDistance(150)
      .avoidOverlaps(true)
      .nodes(graph.nodes)
      .links(graph.edges)
      .groups(graph.groups)
      .constraints(graph.constraints)
      .handleDisconnected(false)
      .start(10, 30, 30);

    setNodes(newNodes);
    setEdges(newEdges);
    setGroups(groups);
    setGroupsObj(groupsObj);
    // setGraph(graph);
  };

  const generateNodeStyles = () => {
    let styles = [];
    for (const node of nodes) {
      styles.push({
        key: node.name,
        data: {
          class: node.class,
          id: node.name,
          label: node.label,
        },
        style: {
          gNodeTransX: spring(node.x),
          gNodeTransY: spring(node.y),
          rectHeight: spring(node.height),
          rectWidth: spring(node.width),
          ellipseX: spring(-node.width / 2),
          ellipseY: spring(-node.height / 2),
        },
      });
    }
    return styles;
  };

  const generateGroupStyles = () => {
    let styles = [];
    Object.keys(groupsObj).forEach((parentId, i) => {
      let group = groups[i];
      styles.push({
        key: group.index,
        data: {
          parent: parentId,
          // class: node.class,
          // id: node.name,
          // label: node.label,
        },
        style: {
          gNodeTransX: spring((1 / 2) * (group.bounds.X + group.bounds.x)),
          gNodeTransY: spring((1 / 2) * (group.bounds.Y + group.bounds.y)),
          rectHeight: spring(group.bounds.Y - group.bounds.y + 40),
          rectWidth: spring(group.bounds.X - group.bounds.x + 40),
        },
      });
    });
    return styles;
  };

  // todo
  const generateEdgeStyles = () => {
    let styles = [];
    for (const edge of edges) {
      let route = cola.makeEdgeBetween(
        edge.source.bounds,
        edge.target.bounds,
        5
      );
      const startPoint = route.sourceIntersection;
      const endPoint = route.arrowStart;
      styles.push({
        key: edge.id,
        data: {
          lineData: [],
        },
        style: {
          startPointX: spring(startPoint.x),
          startPointY: spring(startPoint.y),
          endPointX: spring(endPoint.x),
          endPointY: spring(endPoint.y),
        },
      });
    }
    return styles;
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
          <TransitionMotion styles={generateGroupStyles()}>
            {(interpolatedStyles) => (
              <g className="nodes">
                {interpolatedStyles.map((d) => {
                  return (
                    <g
                      className={`node ${d.data.class}`}
                      id={d.data.parent}
                      key={d.key}
                      transform={`translate(${d.style.gNodeTransX}, ${d.style.gNodeTransY})`}
                      onClick={() => toggleExpanded(d.data.parent)}
                    >
                      <rect
                        className="label-container"
                        width={d.style.rectWidth}
                        height={d.style.rectHeight}
                        transform={`translate(-${d.style.rectWidth / 2}, -${
                          d.style.rectHeight / 2
                        })`}
                      ></rect>
                      <g
                        className="my-label"
                        transform={`translate(0,-${d.style.rectHeight / 2})`}
                      >
                        <text dominantBaseline={"text-before-edge"}>
                          {d.data.parent}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </g>
            )}
          </TransitionMotion>
          <TransitionMotion styles={generateNodeStyles()}>
            {(interpolatedStyles) => (
              <g className="nodes">
                {interpolatedStyles.map((d) => {
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
                          className="label-container"
                          x={d.style.ellipseX}
                          y={d.style.ellipseY}
                          rx={-d.style.ellipseX}
                          ry={-d.style.ellipseY}
                        ></ellipse>
                      ) : (
                        <rect
                          className="label-container"
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
                        <text
                          dominantBaseline={
                            d.data.class.indexOf("cluster") > -1
                              ? "text-before-edge"
                              : "middle"
                          }
                        >
                          {d.data.label}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </g>
            )}
          </TransitionMotion>

          <TransitionMotion styles={generateEdgeStyles()}>
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

export default ColaLayoutGraph;