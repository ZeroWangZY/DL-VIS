import ELK, { ElkNode } from "elkjs/lib/elk.bundled.js";

import _ from 'lodash';

import {
  BaseNode,
  NodeType,
  LayerNodeImp,
  DataNodeImp,
  OperationNodeImp,
  DataType,
  GroupNodeImp,
} from "../stage2/processed-graph";
import { VisGraph, StackedOpNodeImp } from "../stage3/vis-graph.type";
import {
  ElkNodeMap,
  LayoutNode,
  PortType,
  LayoutOptions,
  LayoutGraph,
  LayoutGraphImp,
} from "./layout-graph.type";
import styles from "../../../CSSVariables/CSSVariables.less";

let oldEleMap = {};
let newEleMap = {};
let groups = { root: new Set() };
let layoutNodeIdMap = { root: "" };
let nodeLinkMap = {};
let arrowStrokeColor = styles.arrow_stroke_color;
let arrowFillColor = styles.arrow_fill_color;
let visNodeMap = {};
let hiddenEdgeMap = new Map();
let visModuleConnectionMap = new Map();
let modules = new Set();

export const LAYERNODESIZEINDIAGNOSISMODE = { height: 120, width: 120 };

export async function produceLayoutGraph(
  visGraph: VisGraph,
  layoutOptions: LayoutOptions = { networkSimplex: true }
): Promise<LayoutGraph> {
  const { visNodes, visEdges, visModuleEdges } = visGraph;
  ({ visNodeMap, hiddenEdgeMap, visModuleConnectionMap, modules } = visGraph);
  //groups存储每个节点的儿子
  groups = { root: new Set() };
  layoutNodeIdMap = { root: "" };
  visNodes.forEach((nodeId, i) => {
    layoutNodeIdMap[nodeId] = idConverter(i); //初始化
    const node = visNodeMap[nodeId];
    if (node.parent !== "___root___") {
      if (!groups.hasOwnProperty(node.parent)) {
        groups[node.parent] = new Set([nodeId]);
      } else {
        groups[node.parent].add(nodeId);
      }
    } else {
      groups["root"].add(nodeId);
    }
  });

  generateLayoutNodeIdFromGroups(layoutNodeIdMap);

  for (let i = 0; i < visEdges.length; i++) {
    const edge = visEdges[i];
    if (edge.source in nodeLinkMap) {
      nodeLinkMap[edge.source]["target"].push(edge.target);
    } else {
      nodeLinkMap[edge.source] = { source: [], target: [edge.target] };
    }
    if (edge.target in nodeLinkMap) {
      nodeLinkMap[edge.target]["source"].push(edge.source);
    } else {
      nodeLinkMap[edge.target] = { source: [edge.source], target: [] };
    }
  }
  let newLinks = [],
    linkMap = {}, //{sourceID:[{target0, originalSource, originalTarget0},{target1, originalSource, originalTarget1],...},...}
    innerLeftLinkMap = {}, //links that are in the inner left side
    innerRightLinkMap = {}; //links that are in the inner right side

  for (let i = 0; i < visEdges.length; i++) {
    const edge = visEdges[i];
    const originalSource = visNodeMap[edge.source]["id"],
      originalTarget = visNodeMap[edge.target]["id"];

    let source = originalSource;
    let target = originalTarget;

    //以下解决跨层边的id匹配问题，id升级至公共父节点
    let sourceLevel = layoutNodeIdMap[source].split("-").length,
      targetLevel = layoutNodeIdMap[target].split("-").length;
    let _source = source,
      _target = target;

    //port模式，分割跨层级的边
    if (sourceLevel > targetLevel) {
      for (let i = 0; i < sourceLevel - targetLevel; i++) {
        addLinkMap(
          innerRightLinkMap,
          visNodeMap[_source].parent,
          _source,
          originalSource,
          originalTarget
        );
        _source = visNodeMap[_source].parent;
      }
    } else if (sourceLevel < targetLevel) {
      for (let i = 0; i < targetLevel - sourceLevel; i++) {
        addLinkMap(
          innerLeftLinkMap,
          visNodeMap[_target].parent,
          _target,
          originalSource,
          originalTarget
        );
        _target = visNodeMap[_target].parent;
      }
    }

    //保证边的直接父节点相同
    while (visNodeMap[_source].parent !== visNodeMap[_target].parent) {
      addLinkMap(
        innerRightLinkMap,
        visNodeMap[_source].parent,
        _source,
        originalSource,
        originalTarget
      );
      addLinkMap(
        innerLeftLinkMap,
        visNodeMap[_target].parent,
        _target,
        originalSource,
        originalTarget
      );
      _source = visNodeMap[_source].parent;
      _target = visNodeMap[_target].parent;
    }

    //group内部边则跳过
    if (visNodeMap[_source].parent !== "___root___") {
      addLinkMap(linkMap, _source, _target, originalSource, originalTarget);
      continue;
    }

    //reset成初始值
    source = originalSource;
    target = originalTarget;

    //将边升级至顶层
    while (visNodeMap[source].parent !== "___root___") {
      source = visNodeMap[source].parent;
    }
    while (visNodeMap[target].parent !== "___root___") {
      target = visNodeMap[target].parent;
    }

    const [inPort, outPort] = isPort(visNodeMap[target], visNodeMap[source]);
    let newLink = {
      id: `${edge.source}-${edge.target}`,
      id4Style: `${layoutNodeIdMap[edge.source]}->${
        layoutNodeIdMap[edge.target]
        }`,
      isModuleEdge: inPort === PortType.Module && outPort === PortType.Module,
      originalSource: layoutNodeIdMap[originalSource],
      originalTarget: layoutNodeIdMap[originalTarget],
      sources: [source + "-out-port"],
      targets: [target + "-in-port"],
      arrowheadStyle: "fill: #333; stroke: #333;",
      arrowhead: "vee",
    };
    restoreFromOldEleMap(newLink);
    newLinks.push(newLink);
  }

  for (let i = 0; i < visModuleEdges.length; i++) {
    const edge = visModuleEdges[i];
    let source = visNodeMap[edge.source]["id"];
    let target = visNodeMap[edge.target]["id"];
    const [inPort, outPort] = isPort(visNodeMap[target], visNodeMap[source]);
    let newLink = {
      id: `${edge.source}-${edge.target}`,
      id4Style: `${layoutNodeIdMap[edge.source]}->${
        layoutNodeIdMap[edge.target]
        }`,
      isModuleEdge: inPort === PortType.Module && outPort === PortType.Module,
      originalSource: layoutNodeIdMap[source],
      originalTarget: layoutNodeIdMap[target],
      sources: [source + "-out-port"],
      targets: [target + "-in-port"],
      arrowheadStyle:
        "fill: `${arrowFillColor}`; stroke: `${arrowStrokeColor}`",
      arrowhead: "vee",
      weight: edge.count, //用于styledGraph中编码边绑定的粗细
    };
    restoreFromOldEleMap(newLink);
    newLinks.push(newLink);
  }

  let newNodes = [];
  newNodes = processNodes(
    linkMap,
    innerLeftLinkMap,
    innerRightLinkMap,
    visNodes,
    newNodes,
    layoutOptions.fixedNodeHeight
  );

  //将node数组建立索引，加速drag的查询
  let newElkNodeMap: ElkNodeMap = {};
  generateElkNodeMap(newNodes, newElkNodeMap);

  oldEleMap = newEleMap;
  newEleMap = {};
  return generateLayout(newNodes, newLinks, newElkNodeMap, layoutOptions, visNodes.length);
}

async function generateLayout(
  children,
  edges,
  elkNodeMap,
  layoutOptions: LayoutOptions,
  length
): Promise<LayoutGraph> {
  const { networkSimplex } = layoutOptions;
  if (length <= 1000) {
    const elk = new ELK();
    let elkLayout: Promise<ElkNode> = elk.layout(
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
          "org.eclipse.elk.portAlignment.east": "CENTER",
          "org.eclipse.elk.portAlignment.west": "CENTER",
          "org.eclipse.elk.layered.nodePlacement.favorStraightEdges": "true",
          // "org.eclipse.elk.layered.layering.strategy": "INTERACTIVE",
          // "org.eclipse.elk.layered.mergeEdges": mergeEdge.toString(),
          "org.eclipse.elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
          // "org.eclipse.elk.layered.cycleBreaking.strategy": "INTERACTIVE",
          "org.eclipse.elk.interactive": "true",
          "org.eclipse.elk.hierarchyHandling": "INCLUDE_CHILDREN", // 可INHERIT INCLUDE_CHILDREN SEPARATE_CHILDREN，布局时，跨聚合的边被不被考虑进来，默认SEPARATE_CHILDREN。
          // "org.eclipse.elk.edgeRouting": "SPLINES"
          "spacing.nodeNodeBetweenLayers": "50.0",
        },
      }
    );
    let layoutGraph: Promise<LayoutGraph> = elkLayout.then((result) => {
      if (isElkNode(result)) {
        const { id, children, edges } = result;
        return new LayoutGraphImp(id, children, edges, elkNodeMap);
      }
    });
    return layoutGraph;
  }
  else {
    const body = {
      graph: {
        id: 'root',
        children,
        edges
      },
      options: {
        "org.eclipse.elk.algorithm": "layered",
        "org.eclipse.elk.layered.nodePlacement.strategy": networkSimplex
          ? "NETWORK_SIMPLEX"
          : "INTERACTIVE",
        "org.eclipse.elk.portAlignment.east": "CENTER",
        "org.eclipse.elk.portAlignment.west": "CENTER",
        "org.eclipse.elk.layered.nodePlacement.favorStraightEdges": "true",
        "org.eclipse.elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
        "org.eclipse.elk.interactive": "true",
        "org.eclipse.elk.hierarchyHandling": "INCLUDE_CHILDREN",
        "org.eclipse.elk.layered.spacing.nodeNodeBetweenLayers": "50.0"
      }
    }
    let elkLayout = fetch('/java/api/elk_layout', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(body)
    }).then((result) => {
      return result.json();
    })
    let layoutGraph: Promise<LayoutGraph> = elkLayout.then((result) => {
      let { id, children: tempChildren, edges: tempEdges } = result;
      children = _.merge(children, tempChildren);
      edges = _.merge(edges, tempEdges || []);
      return new LayoutGraphImp(id, children, edges, elkNodeMap);
    })
    return layoutGraph;
  }
}

function isElkNode(object: void | ElkNode): object is ElkNode {
  return (object as ElkNode).children !== undefined;
}

function addLinkMap(
  linkMap,
  source: string,
  target: string,
  originalSource: string,
  originalTarget: string
): void {
  if (!linkMap.hasOwnProperty(source)) {
    linkMap[source] = [{ target, originalSource, originalTarget }];
  } else {
    linkMap[source].push({ target, originalSource, originalTarget });
  }
}

function idConverter(index: number): string {
  return "no" + index;
}

function _isPort(node: BaseNode, mode: string): PortType {
  return modules.has(node.id)
    ? PortType.Module
    : hiddenEdgeMap.has(node.id) &&
      hiddenEdgeMap.get(node.id)[mode].size > 0
      ? PortType.hasHiddenEdge
      : hiddenEdgeMap.has(node.id) &&
        hiddenEdgeMap.get(node.id)[mode].size === 0
        ? PortType.HiddenPort
        : node["expanded"]
          ? PortType.Expanded
          : PortType.None
}

function isPort(target: BaseNode, source: BaseNode): PortType[] {
  return [
    _isPort(target, "in"),
    _isPort(source, "out")
  ];
}

function restoreFromOldEleMap(newEle): void {
  let oldEle = oldEleMap[newEle.id];
  if (oldEle) {
    let { x, y, $H } = oldEle;
    newEle = Object.assign(newEle, { x, y, $H });
  }
  newEleMap[newEle.id] = newEle;
}

export function generateElkNodeMap(elkNodeList, elkNodeMap): void {
  elkNodeList.forEach((node, i) => {
    const tmp = layoutNodeIdMap[node.id].split("-");
    const id = tmp[tmp.length - 1];
    if (node.hasOwnProperty("children")) {
      let subMap = {};
      generateElkNodeMap(node["children"], subMap);
      elkNodeMap[id] = subMap;
    } else {
      elkNodeMap[id] = node;
    }
  });
}

function generateLayoutNodeIdFromGroups(layoutNodeIdMap: any): void {
  function addMap(id, parentId) {
    if (parentId.length > 0) {
      parentId += "-";
    }
    layoutNodeIdMap[id] = parentId + layoutNodeIdMap[id];
    if (groups.hasOwnProperty(id)) {
      for (let child of groups[id]) {
        addMap(child, layoutNodeIdMap[id]);
      }
    }
  }
  addMap("root", layoutNodeIdMap["root"]);
}

export const generateNode = (
  node: BaseNode,
  inPort: PortType,
  outPort: PortType,
  leafNum: number,
  fixedNodeHeight: boolean,
  needToSetMinWidth: boolean,
): LayoutNode => {
  let ports = [];
  // if (inPort !== PortType.None) {
  ports.push({
    id: node.id + "-in-port",
    properties: {
      "port.side": "WEST",
    },
  });
  // }
  // if (outPort !== PortType.None) {
  ports.push({
    id: node.id + "-out-port",
    layoutOptions: {
      "port.side": "EAST",
    },
  });
  // }
  let parameters: DataNodeImp[] = [],
    constVals: DataNodeImp[] = [];
  if (node instanceof OperationNodeImp) {
    let auxiliary = (node as OperationNodeImp).auxiliary;
    auxiliary.forEach((id) => {
      if ((visNodeMap[id] as DataNodeImp).dataType === DataType.CONST)
        constVals.push(visNodeMap[id]);
      else if (
        (visNodeMap[id] as DataNodeImp).dataType === DataType.PARAMETER
      ) {
        parameters.push(visNodeMap[id]);
      }
    });
  }
  let hiddenEdges = { in: [], out: [] };
  if (hiddenEdgeMap.has(node.id)) {
    const hiddenEdge = hiddenEdgeMap.get(node.id);
    for (let inEdge of hiddenEdge["in"]) {
      hiddenEdges["in"].push({
        source: layoutNodeIdMap[inEdge.source],
        target: layoutNodeIdMap[inEdge.target],
      });
    }
    for (let outEdge of hiddenEdge["out"]) {
      hiddenEdges["out"].push({
        source: layoutNodeIdMap[outEdge.source],
        target: layoutNodeIdMap[outEdge.target],
      });
    }
  }
  return {
    id: node.id,
    id4Style: layoutNodeIdMap[node.id],
    ports,
    hiddenEdges,
    portType: [inPort, outPort],
    parent: node.parent,
    label: node.displayedName,
    shape: node.type === NodeType.OPERATION ? "ellipse" : "rect",
    class:
      `nodeitem-${node.type}` +
      (node.type === NodeType.LAYER
        ? ` layertype-${(node as LayerNodeImp).layerType}`
        : ""),
    type: node.type,
    layoutOptions: {
      algorithm: "layered",
      portConstraints: "FIXED_SIDE",
    },
    parameters: node.type === NodeType.OPERATION ? parameters : null,
    constVals: node.type === NodeType.OPERATION ? constVals : null,
    expand: false,
    width: node.type === NodeType.OPERATION ? 30 : 120,
    height:
      node.type === NodeType.OPERATION
        ? 20
        : node.type === NodeType.LAYER && fixedNodeHeight
          ? LAYERNODESIZEINDIAGNOSISMODE.height
          : 40 + 4 * Math.floor(Math.sqrt(leafNum)), //简单子节点数量编码
    labels: genLabel(node.id + "_label", node, needToSetMinWidth),
    isStacked: node instanceof StackedOpNodeImp,
  };
};

function processNodes(
  linkMap,
  innerLeftLinkMap,
  innerRightLinkMap,
  displayedNodes,
  newNodes,
  fixedNodeHeight
): Array<LayoutNode> {
  const processChildren = (nodeId, newNode, newNodes): void => {
    if (groups.hasOwnProperty(nodeId)) {
      //为group节点注入子节点及边
      let children = [];
      let edges = [];
      let parentId = nodeId;
      let subNodes = groups[parentId];

      // ----判断是否应该给groupNode的子节点设置一个最小宽度
      let needToSetMinWidth = true;
      for (let child of subNodes) {
        if (visNodeMap[child] instanceof LayerNodeImp ||
          visNodeMap[child] instanceof GroupNodeImp) { // 如果子节点含有groupNode或者LayerNode不用设置最小宽度
          needToSetMinWidth = false;
          break;
        } else { // 如果node的子节点是operationNode或者stackNode
          let outputNodes = visNodeMap[child].outputNode;
          // 如果某个子节点的outputNode是也在此groupNode或者LayerNode下面的话，也不要设置最小宽度
          for (let outputNode of outputNodes) {
            if (subNodes.has(outputNode)) {
              needToSetMinWidth = false;
              break;
            }
          }
          if (needToSetMinWidth === false) break;
        }
      }

      for (let id of subNodes) {
        const node = visNodeMap[id];
        const [inPort, outPort] = isPort(visNodeMap[id], visNodeMap[id]);
        let leafNum =
          node.type == NodeType.GROUP ? node.leafOperationNodeCount : 0;
        let child = generateNode(
          node,
          inPort,
          outPort,
          leafNum,
          fixedNodeHeight,
          needToSetMinWidth,
        );
        processChildren(id, child, children);
        let source = id;
        if (linkMap.hasOwnProperty(source)) {
          linkMap[source].forEach((item) => {
            const { target, originalSource, originalTarget } = item;
            const [inPort, outPort] = isPort(
              visNodeMap[target],
              visNodeMap[source]
            );
            let edge = {
              id: `${source}-${target}`,
              id4Style: `${layoutNodeIdMap[source]}->${layoutNodeIdMap[target]}`,
              isModuleEdge:
                inPort === PortType.Module && outPort === PortType.Module,
              originalSource: layoutNodeIdMap[originalSource],
              originalTarget: layoutNodeIdMap[originalTarget],
              sources: [
                source + "-out-port",
              ],
              targets: [
                target + "-in-port",
              ],
              arrowheadStyle:
                "fill: `${arrowFillColor}`; stroke: `${arrowStrokeColor}`",
              arrowhead: "vee",
            };
            restoreFromOldEleMap(edge);
            edges.push(edge);
          });
        }
      }
      if (innerLeftLinkMap.hasOwnProperty(parentId)) {
        innerLeftLinkMap[parentId].forEach((item, i) => {
          const { target, originalSource, originalTarget } = item;
          const [_, inPort] = isPort(visNodeMap[parentId], visNodeMap[target]);
          let edge = {
            id: `__${i}__${parentId}-${target}`,
            id4Style: `__${i}__${layoutNodeIdMap[parentId]}->${layoutNodeIdMap[target]}`,
            isModuleEdge: false,
            originalSource: layoutNodeIdMap[originalSource],
            originalTarget: layoutNodeIdMap[originalTarget],
            sources: [parentId + "-in-port"],
            targets: [target + "-in-port"],
            arrowheadStyle:
              "fill: `${arrowFillColor}`; stroke: `${arrowStrokeColor}`",
            arrowhead: "vee",
          };
          restoreFromOldEleMap(edge);
          edges.push(edge);
        });
      }
      if (innerRightLinkMap.hasOwnProperty(parentId)) {
        innerRightLinkMap[parentId].forEach((item, i) => {
          const { target, originalSource, originalTarget } = item;
          const source = target;
          const [outPort, _] = isPort(visNodeMap[source], visNodeMap[parentId]);
          let edge = {
            id: `__${i}__${source}-${parentId}`,
            id4Style: `__${i}__${layoutNodeIdMap[source]}-${layoutNodeIdMap[parentId]}`,
            isModuleEdge: false,
            originalSource: layoutNodeIdMap[originalSource],
            originalTarget: layoutNodeIdMap[originalTarget],
            sources: [
              source + "-out-port",
            ],
            targets: [parentId + "-out-port"],
            arrowheadStyle: "fill: #333; stroke: #333;",
            arrowhead: "vee",
          };
          restoreFromOldEleMap(edge);
          edges.push(edge);
        });
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
    const node = visNodeMap[nodeId];
    //父节点不是根节点，说明是展开的内部节点，这里过滤
    if (node.parent !== "___root___") {
      continue;
    }
    const [inPort, outPort] = isPort(visNodeMap[nodeId], visNodeMap[nodeId]);
    let leafNum =
      node.type == NodeType.GROUP || node.type == NodeType.LAYER
        ? node.leafOperationNodeCount
        : 0;
    let newNode = generateNode(node, inPort, outPort, leafNum, fixedNodeHeight, false);
    processChildren(nodeId, newNode, newNodes);
  }
  return newNodes;
}

// Label会被添加在展开后的groupNode中，ELK会考虑Label的大小，从而方便绘制时有放label的地方
function genLabel(id, node: BaseNode, needToSetMinWidth) {

  if (needToSetMinWidth) {
    return [
      {
        id,
        text: " ",
        layoutOptions: {
          "nodeLabels.placement": "[INSIDE, V_TOP, H_CENTER]",
        },
        width: 96.0,
        height: 15.0,
      },
    ];
  }
  else {
    return [
      {
        id,
        text: "",
        layoutOptions: {
          "nodeLabels.placement": "[H_CENTER, V_TOP, INSIDE]",
        },
        width: 10.0,
        height: 15.0,
      },
    ];
  }
}
