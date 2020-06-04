import { ProcessedGraph } from "../graph-processing/stage2/processed-graph";
import {
  NodeType, LayerType, DataType, RawEdge, GroupNode,
  LayerNode, GroupNodeImp, LayerNodeImp, DataNodeImp, OperationNode,
  OperationNodeImp
} from '../graph-processing/stage2/processed-graph'
import { TransitionMotion, spring } from 'react-motion';
import * as d3 from 'd3';

// hidden edges连线颜色由source-target决定
const colorMap = d3.scaleOrdinal().range([
  "#20639b",
  "#3CAEA3",
  "#f6d55c",
  "#ed553b",
  "#173f5f",
  "#ff7400",
  "#86b32d"
]);
export const getColor = function (moduleId: string): string {
  let resColor = colorMap(moduleId) as string;
  return resColor;
}

export const generateNodeStyles = (graphForLayout: ProcessedGraph, nodes, moduleConnection, layerLineChartData, currentNotShowLineChartID) => {
  const modulesId = graphForLayout.modules;
  const { moduleEdges, nodeMap } = graphForLayout;
  let start = Date.now();
  let styles = new Map();
  for (const nodeId in nodes) {
    const moduleHoleFlag = modulesId.has(nodeId);
    let moduleHoleType = [];
    // 有可能既是in又是Out
    let inFlag = false, outFlag = false;
    if (moduleHoleFlag) {
      for (const edge of moduleEdges) {
        if (edge.source === nodeId) {
          outFlag = true;
        } else if (edge.target === nodeId) {
          inFlag = true;
        }
      }
    }
    if (inFlag) moduleHoleType.push("in");
    if (outFlag) moduleHoleType.push("out");

    const inModuleConnection = moduleConnection.hasOwnProperty(nodeId) ? Array.from(moduleConnection[nodeId]["in"]) : [];
    const outModuleConnection = moduleConnection.hasOwnProperty(nodeId) ? Array.from(moduleConnection[nodeId]["out"]) : [];
    // 小短线的位置配置
    const nodeHoleInEdgeEndXArray = inModuleConnection.map((d, i) => nodes[nodeId].width * 0.2 * (i + 1));
    const nodeHoleOutEdgeStartXArray = outModuleConnection.map((d, i) => nodes[nodeId].width * 0.2 * (i + 1));
    const nodeHoleInEdgeStartX = nodes[nodeId].width * 0.4;
    const nodeHoleInEdgeEndY = -nodes[nodeId].height * 0.5;
    const nodeHoleInEdgeStartY = -nodes[nodeId].height * 1.5;
    const nodeHoleOutEdgeStartY = nodes[nodeId].height * 0.5;
    const nodeHoleOutEdgeEndX = nodes[nodeId].width * 0.4;
    const nodeHoleOutEdgeEndY = nodes[nodeId].height * 1.5;

    const belongModule = nodeMap[nodeId] ? nodeMap[nodeId].belongModule : null;

    styles.set(nodeId, {
      key: nodeId,
      data: {
        class: nodes[nodeId].class,
        id: nodeId.replace(/\//g, '-'), //把"/"换成"-"，因为querySelector的Id不能带/
        label: nodes[nodeId].label,
        type: nodes[nodeId].nodetype,
        expanded: (nodes[nodeId].nodetype === NodeType.LAYER) ? nodes[nodeId]["expanded"] : null,
        showLineChart: (nodes[nodeId].nodetype === NodeType.LAYER && currentNotShowLineChartID.indexOf(nodeId) < 0) ? true : false,
        LineData: (layerLineChartData[nodeId]) ? layerLineChartData[nodeId] : [],// 根据Id和迭代次数 找到折线图数据
        belongModule,
        moduleHoleFlag,
        moduleHoleType,// 模块是作为输入还是输出，控制module hole所在的y值
        inModuleConnection,
        outModuleConnection,
        nodeHoleInEdgeEndXArray,
        nodeHoleOutEdgeStartXArray,
        // 中间插值的点
        inInterPoint: nodeHoleInEdgeEndXArray.map(d => { return { x: (d + nodeHoleInEdgeStartX) * 0.5 - 5, y: (nodeHoleInEdgeEndY + nodeHoleInEdgeStartY) * 0.5 } }),
        outInterPoint: nodeHoleOutEdgeStartXArray.map(d => { return { x: (d + nodeHoleOutEdgeEndX) * 0.5 - 5, y: (nodeHoleOutEdgeEndY + nodeHoleOutEdgeStartY) * 0.5 } })
      },
      style: {
        gNodeTransX: spring(nodes[nodeId].x),
        gNodeTransY: spring(nodes[nodeId].y),
        rectHeight: spring(nodes[nodeId].height),
        rectWidth: spring(nodes[nodeId].width),
        ellipseX: spring(-nodes[nodeId].width / 2),
        ellipseY: spring(-nodes[nodeId].height / 2),
        // 指向节点的小短线
        nodeHoleInEdgeStartX: spring(nodeHoleInEdgeStartX),
        nodeHoleInEdgeStartY: spring(nodeHoleInEdgeStartY),
        nodeHoleInEdgeEndY: spring(nodeHoleInEdgeEndY),
        // 节点指出的小短线
        nodeHoleOutEdgeStartY: spring(nodeHoleOutEdgeStartY),
        nodeHoleOutEdgeEndX: spring(nodeHoleOutEdgeEndX),
        nodeHoleOutEdgeEndY: spring(nodeHoleOutEdgeEndY),
      }
    });
  }

  return resortStyleArray(graphForLayout, styles); // 重新排序
}

const resortStyleArray = (graphForLayout: ProcessedGraph, styles: Map<string, any>) => {
  const { nodeMap } = graphForLayout;

  let newStyles = [];
  let childrenOfRoot = [];

  styles.forEach((val, key) => {
    if (nodeMap[key] && nodeMap[key].parent === "___root___")
      childrenOfRoot.push(key);
  })

  BFS(childrenOfRoot);
  return newStyles;

  function BFS(childrenOfRoot) {
    let queue = [...childrenOfRoot];

    while (queue.length !== 0) {
      let front = queue.shift();

      if (styles.has(front)) {
        newStyles.push(styles.get(front))
        styles.delete(front);
      }

      if (nodeMap[front] instanceof GroupNodeImp && (nodeMap[front] as GroupNodeImp).expanded === true) { // groupNode并且已经展开，将它的子节点全部放入队列
        let node = (nodeMap[front] as GroupNodeImp)
        node.children.forEach((id) => {
          queue.push(id);
        })
      }
    }
  }
}

export const generateEdgeStyles = (edges) => {
  let start = Date.now();
  let styles = [];
  for (const edgeId in edges) {
    const pointNum = edges[edgeId].points.length;
    const startPoint = edges[edgeId].points[0];
    const endPoint = edges[edgeId].points[pointNum - 1];
    let restPoints = edges[edgeId].points.slice(1, pointNum - 1);
    styles.push({
      key: edgeId,
      data: {
        lineData: restPoints
      },
      style: {
        startPointX: spring(startPoint.x),
        startPointY: spring(startPoint.y),
        endPointX: spring(endPoint.x),
        endPointY: spring(endPoint.y),
      }
    });
  }
  // console.log('generateEdgeStyles:', Date.now() - start, 'ms');
  return styles;
}

export const generateAcrossModuleEdgeStyles = (graphForLayout, nodes) => {
  const { moduleEdges } = graphForLayout;
  const colorMapDomain = [];
  let styles = [];
  for (const edge of moduleEdges) {
    const { source, target, width } = edge;
    const sourceNode = nodes[source];
    const targetNode = nodes[target];
    if (!sourceNode || !targetNode) continue;

    colorMapDomain.push(`${source}-${target}`)
    let sourceX: number = sourceNode.x + sourceNode.width * 0.5 - 10;
    let sourceY: number = sourceNode.y + ((sourceNode.class.indexOf('cluster') > -1) ? sourceNode.height * 0.5 - 10 : 0);
    let targetX: number = targetNode.x + targetNode.width * 0.5 - 10;
    let targetY: number = targetNode.y + ((targetNode.class.indexOf('cluster') > -1) ? -targetNode.height * 0.5 + 10 : 0);

    let interPoint1 = { x: (sourceX + targetX) * 0.5 + 20, y: (sourceY + targetY) * 0.5 + 10 };
    styles.push({
      key: `${source}-${target}`,
      data: {
        interPoints: [interPoint1],
        source,
        target
      },
      style: {
        startPointX: spring(sourceX),
        startPointY: spring(sourceY),
        endPointX: spring(targetX),
        endPointY: spring(targetY),
        width: spring(width)
      }
    });
  }

  colorMap.domain(colorMapDomain);
  return styles;
}