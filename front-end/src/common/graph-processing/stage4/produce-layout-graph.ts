import ELK, { ElkNode } from "elkjs/lib/elk.bundled.js";

import { BaseNode, NodeType } from "../stage2/processed-graph";
import { VisGraph } from "../stage3/vis-graph.type";
import { LayoutOptions } from "./layout-graph.type";

//Todo: move to store
const portMode = false;
const maxPort = 5;
let oldEleMap = {};
let newEleMap = {};

export async function produceLayoutGraph(
  visGraph: VisGraph,
  layoutOptions: LayoutOptions = { networkSimplex: true }
): Promise<void | ElkNode> {
  const { nodeMap, visNodes, visEdges } = visGraph;

  //group存储每个节点的子节点（可见）
  let groups = {};
  visNodes.forEach((nodeId) => {
    const node = nodeMap[nodeId];
    if (node.parent !== "___root___") {
      if (!groups.hasOwnProperty(node.parent)) {
        groups[node.parent] = {};
        groups[node.parent]["nodes"] = [nodeId];
      } else {
        groups[node.parent]["nodes"].push(nodeId);
      }
    }
  });

  let newLinks = [],
    linkMap = {}, //{sourceID:[target0,target1,...],...}
    innerLeftLinkMap = {}, //links that are in the inner left side
    innerRightLinkMap = {}; //links that are in the inner right side

  for (let i = 0; i < visEdges.length; i++) {
    const edge = visEdges[i];
    let source = nodeMap[edge.source]["id"];
    let target = nodeMap[edge.target]["id"];
    if (portMode) {
      //以下解决跨层边的id匹配问题，id升级至公共父节点
      let _source = source.split("/"),
        _target = target.split("/");
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
    const inPort = nodeMap[target].inputNode.size > maxPort;
    const outPort = nodeMap[source].outputNode.size > maxPort;
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
    innerLeftLinkMap,
    innerRightLinkMap,
    groups,
    visNodes,
    newNodes
  );

  //将node数组建立索引，加速drag的查询
  let newElkNodeMap = {};
  generateElkNodeMap(newNodes, newElkNodeMap);

  oldEleMap = newEleMap;
  newEleMap = {};
  // elk.knownLayoutOptions().then((ret) => {
  //   console.log("knownLayoutOptions: ", ret);
  // });
  // elk.knownLayoutCategories().then((ret) => {
  //   console.log("knownLayoutCategories: ", ret);
  // });
  // elk.knownLayoutAlgorithms().then((ret) => {
  //   console.log("knownLayoutAlgorithms: ", ret);
  // });

  return generateLayout(newNodes, newLinks, layoutOptions);
}

async function generateLayout(children, edges, layoutOptions: LayoutOptions) {
  const { networkSimplex } = layoutOptions;
  const elk = new ELK({ workerUrl: "./elk-worker.min.js" });
  return elk
    .layout(
      {
        id: "root",
        children: children,
        edges: edges,
      }, //input_graph
      {
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
      }
    )
    .catch(console.error);
}

function addLinkMap(linkMap, source, target) {
  if (!linkMap.hasOwnProperty(source)) {
    linkMap[source] = [target];
  } else {
    linkMap[source].push(target);
  }
}

function generateElkNodeMap(elkNodeList, elkNodeMap) {
  elkNodeList.forEach((node) => {
    if (node.hasOwnProperty("children")) {
      let subMap = {};
      generateElkNodeMap(node["children"], subMap);
      elkNodeMap[node.id] = subMap;
    } else {
      elkNodeMap[node.id] = node;
    }
  });
}

function restoreFromOldEleMap(newEle) {
  let oldEle = oldEleMap[newEle.id];
  if (oldEle) {
    let { x, y, $H, sections } = oldEle;
    newEle = Object.assign(newEle, { x, y, $H });
  }
  newEleMap[newEle.id] = newEle;
}

export const generateNode = (
  node: BaseNode,
  inPort: boolean,
  outPort: boolean
) => {
  let ports = [];
  if (inPort) {
    ports.push({
      id: node.id + "-in-port",
      properties: {
        "port.side": "WEST",
      },
    });
  }
  if (outPort) {
    ports.push({
      id: node.id + "-out-port",
      layoutOptions: {
        "port.side": "EAST",
      },
    });
  }
  return {
    id: node.id,
    parent: node.parent,
    label: node.displayedName,
    shape: node.type === NodeType.OPERTATION ? "ellipse" : "rect",
    class: `nodeitem-${node.type}`,
    type: node.type,
    layoutOptions: {
      algorithm: "layered",
      //   portConstraints: "FIXED_SIDE",
    },
    expand: false,
    width:
      node.type === NodeType.OPERTATION
        ? 30
        : Math.max(node.displayedName.length, 3) * 10 + 8,
    height: node.type === NodeType.OPERTATION ? 20 : 40,
    ports: ports,
  };
};

function processNodes(
  nodeMap,
  linkMap,
  innerLeftLinkMap,
  innerRightLinkMap,
  groups,
  displayedNodes,
  newNodes
) {
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
        inPort = nodeMap[id].inputNode.size > maxPort;
        outPort = nodeMap[id].outputNode.size > maxPort;
        let child = generateNode(node, inPort, outPort);
        processChildren(id, child, children);
        const source = id;
        if (linkMap.hasOwnProperty(source)) {
          linkMap[source].forEach((target) => {
            const inPort = nodeMap[target].inputNode.size > maxPort;
            const outPort = nodeMap[source].outputNode.size > maxPort;
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
    let inPort = false,
      outPort = false;
    inPort = nodeMap[nodeId].inputNode.size > maxPort;
    outPort = nodeMap[nodeId].outputNode.size > maxPort;
    let newNode = generateNode(node, inPort, outPort);
    processChildren(nodeId, newNode, newNodes);
  }
  return newNodes;
}
