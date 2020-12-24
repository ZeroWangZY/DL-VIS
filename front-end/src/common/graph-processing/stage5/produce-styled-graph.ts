import { ElkPort } from "elkjs/lib/elk.bundled.js";

import {
  LayoutNode,
  LayoutEdge,
  LayoutGraph,
  PortType,
} from "../stage4/layout-graph.type";
import {
  Style,
  Offset,
  StyledGraph,
  StyledGraphImp,
} from "../stage5/styled-graph.type";
import { spring } from "react-motion";
import { NodeType } from "../stage2/processed-graph";
import { link } from "fs";

let nodeKeyMap = {},
  linkKeyMap = {};

let portTypeMap: Map<string/*=id4Style*/, { type: { level_1: boolean, level_2: boolean }, index: number }> = new Map();

export function produceStyledGraph(layoutGraph: LayoutGraph): StyledGraph {
  let newNodeStyles = [];
  let newLinkStyles = [];
  let newPortStyles = [];
  nodeKeyMap = {};
  linkKeyMap = {};
  generateEdgeStyles(layoutGraph.edges, newLinkStyles);
  generateNodeStyles(
    layoutGraph.children,
    newNodeStyles,
    newLinkStyles,
    newPortStyles
  );
  return new StyledGraphImp(newNodeStyles, newLinkStyles, newPortStyles);
}

const goThroughPoint = (start, end, point): boolean => { // 判断以[start ,end] 是否经过point
  if (start.x <= point.x && point.x <= end.x) {
    if (start.y <= point.y && point.y <= end.y) { // 在线段中间
      let x1 = start.x, y1 = start.y, x2 = point.x, y2 = point.y, x3 = end.x, y3 = end.y;

      let minNum = Math.min(x1, y1, x2, y2, x3, y3);
      x1 -= minNum;
      y1 -= minNum;
      x2 -= minNum;
      y2 -= minNum;
      x3 -= minNum;
      y3 -= minNum; // 为了防止乘法的结果越界，这里相当于将所有的坐标平移一下
      return x1 * y2 + x2 * y3 + x3 * y1 - x1 * y3 - x2 * y1 - x3 * y2 == 0; // 面积法判断三点共线
    }
  }
  return false;
}

const inOneLine = (
  start1: { x: number, y: number },
  end1: { x: number, y: number },
  start2: { x: number, y: number },
  end2: { x: number, y: number }): number => { // 分别是两条直线的起终点
  if (start1.y == start2.y && end1.y == end2.y) // 水平共线
    return 1;
  else if (start1.x == start2.x && end1.x == end2.x)
    return 2; // 垂直共线
  return -1; // 不共线
}

export const adjustLinePoints = (
  links: Array<LayoutEdge>
): void => {
  // 统计线的粗细
  let junctionPointsArr = [];

  for (const link of links) {
    const { junctionPoints, id4Style } = link; // 连接点 id4Style
    if (junctionPoints) junctionPointsArr.push(...(junctionPoints)); // 统计所有的junction Points
  }

  for (const link of links) {
    const { startPoint, endPoint, bendPoints } = link.sections[0]; //连线的各个节点
    const { junctionPoints, id4Style } = link; // 连接点 id4Style

    if (!junctionPoints && !bendPoints)  // 没有junction Points也没有拐点 一条直线
      // 判断这条直线是否经过junctionPoints，如果经过的话，就要跑将这条折线断成两短，保证后面统计折线条数的时候不会出错
      for (let junctionPoint of junctionPointsArr)
        if (goThroughPoint(startPoint, endPoint, junctionPoint)) {
          // 断成两条线 即 sections[0] 中 添加 bendPoints 
          link.sections[0].bendPoints = [];
          link.sections[0].bendPoints.push(junctionPoint);
        }
  }
}

//直接线性遍历给定的边数组，将对应的每条边的样式添加到已有样式数组
//Todo:后续根据边的连接情况增加样式可能需要传入新的参数
export const generateEdgeStyles = (
  links: Array<LayoutEdge>,
  styles: Array<Style>,
  ofs: Offset = { x: 0, y: 0 }
): void => {
  adjustLinePoints(links);
  let linksCountMap = ofsLinks(links);
  for (const link of links) {
    const { startPoint, endPoint, bendPoints } = link.sections[0]; //连线的各个点
    const { junctionPoints, id4Style } = link; // 
    if (id4Style in linkKeyMap) {
      linkKeyMap[id4Style] += 1;
    } else {
      linkKeyMap[id4Style] = 1;
    }
    let linkData = [
      { x: ofs.x + startPoint.x, y: ofs.y + startPoint.y },
      ...(bendPoints === undefined
        ? []
        : bendPoints.map((point) => ({
          x: ofs.x + point.x,
          y: ofs.y + point.y,
        }))),
      { x: ofs.x + endPoint.x, y: ofs.y + endPoint.y },
    ]; // linkData 就是 折线关键点的 位置 {x,y}
    const ofs_x = 3; //控制和port重叠的问题

    const [_drawData, _lineStrokeWidth] = drawArcPath(ofs_x, linkData, linksCountMap, ofs);

    styles.push({
      key: `${id4Style}_${linkKeyMap[id4Style]}`,
      data: {
        id4Style: link.id4Style,
        isModuleEdge: link.isModuleEdge,
        originalSource: link.originalSource,
        originalTarget: link.originalTarget,
        linkData,
        lineData: hoverPath(ofs_x, linkData),
        lineStrokeWidth: _lineStrokeWidth,
        drawData: _drawData,
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
        _startPointX: ofs.x + startPoint.x,
        _startPointY: ofs.y + startPoint.y,
        _endPointX: ofs.x + endPoint.x,
        _endPointY: ofs.y + endPoint.y,
      },
    });
  }
  //
};

//递归遍历给定的elk子节点的树，生成包含的所有点的样式以及内部边的样式
export const generateNodeStyles = (
  nodes: Array<LayoutNode>,
  nodeStyles: Array<Style>,
  linkStyles: Array<Style>,
  portStyles: Array<Style>,
  ofs: Offset = { x: 0, y: 0 }
): void => {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const { id4Style } = node;
    if (id4Style in nodeKeyMap) {
      nodeKeyMap[id4Style] += 1;
    } else {
      nodeKeyMap[id4Style] = 1;
    }
    nodeStyles.push({
      //key: `${id4Style}_${nodeKeyMap[id4Style]}`,
      key: `${node.id}`,
      data: node.hasOwnProperty("label")
        ? {
          class: node.class,
          type: node.type,
          id: node.id,
          id4Style: id4Style,
          parent: node.parent,
          parameters:
            node.type === NodeType.OPERATION ? node.parameters : null,
          constVals: node.type === NodeType.OPERATION ? node.constVals : null,
          label: node.label,
          expand: node.expand,
          isStacked: node.isStacked,
          textWidth:
            textSize(
              node.label +
              (!node.expand &&
                (node.type === NodeType.GROUP || node.type === NodeType.LAYER)
                ? "+"
                : "")
            ) + 2,
        }
        : {
          class: "dummy",
          type: "dummy",
          id: node.id,
          id4Style: id4Style,
          parent: node.parent,
          label: node.id,
          expand: node.expand,
        },
      style: {
        gNodeTransX: spring(ofs.x + node.x + node.width / 2),
        gNodeTransY: spring(ofs.y + node.y + node.height / 2),
        rectWidth: spring(node.width),
        rectHeight: spring(node.height),
        ellipseX: spring(node.width / 2),
        ellipseY: spring(node.height / 4),
        _gNodeTransX: ofs.x + node.x + node.width / 2,
        _gNodeTransY: ofs.y + node.y + node.height / 2,
        _rectWidth: node.width,
        _rectHeight: node.height,
        _ellipseX: node.width / 2,
        _ellipseY: node.height / 4,
      },
    });
    const [inPort, outPort] = node.ports;
    const [inPortType, outPortType] = node.portType;
    const inHiddenEdges = node.hiddenEdges["in"];
    const outHiddenEdges = node.hiddenEdges["out"];
    if (inPortType === PortType.Module) {
      const type = { "level_1": true, "level_2": false };
      portTypeMap.set("in>" + id4Style, { type: type, index: portStyles.length })
      portStyles.push({
        //key: `inPort_${id4Style}_${nodeKeyMap[id4Style]}`,
        key: `inPort_${node.id}`,
        data: {
          direction: "in",
          isRealLink: true,
          isOperation: node.type === NodeType.OPERATION,
          type: type,
          nodeId: id4Style,
          id4Style: `inPort_${id4Style}_${nodeKeyMap[id4Style]}`,
          hiddenEdges: inHiddenEdges,
        },
        style: {
          gNodeTransX: spring(ofs.x + node.x + inPort.x),
          gNodeTransY: spring(ofs.y + node.y + inPort.y),
          nodeRectWidth: spring(node.width),
          nodeRectHeight: spring(node.height),
        },
      });
    } else if (inPortType === PortType.hasHiddenEdge) {
      const type = { "level_1": false, "level_2": true };
      portTypeMap.set("in>" + id4Style, { type: type, index: portStyles.length })
      portStyles.push({
        //key: `inPort_${id4Style}_${nodeKeyMap[id4Style]}`,
        key: `inPort_${node.id}`,
        data: {
          direction: "in",
          isRealLink: false,
          isOperation: node.type === NodeType.OPERATION,
          type: type,
          nodeId: id4Style,
          id4Style: `inPort_${id4Style}_${nodeKeyMap[id4Style]}`,
          hiddenEdges: inHiddenEdges,
        },
        style: {
          gNodeTransX: spring(ofs.x + node.x + inPort.x),
          gNodeTransY: spring(ofs.y + node.y + inPort.y),
          nodeRectWidth: spring(node.width),
          nodeRectHeight: spring(node.height),
        },
      });
    }
    if (outPortType === PortType.Module) {
      const type = { "level_1": true, "level_2": false };
      portTypeMap.set("out>" + id4Style, { type: type, index: portStyles.length })
      portStyles.push({
        //key: `outPort_${id4Style}_${nodeKeyMap[id4Style]}`,
        key: `outPort_${node.id}`,
        data: {
          direction: "out",
          isRealLink: true,
          isOperation: node.type === NodeType.OPERATION,
          type: type,
          nodeId: id4Style,
          id4Style: `outPort_${id4Style}_${nodeKeyMap[id4Style]}`,
          hiddenEdges: outHiddenEdges,
        },
        style: {
          gNodeTransX: spring(ofs.x + node.x + outPort.x),
          gNodeTransY: spring(ofs.y + node.y + outPort.y),
          nodeRectWidth: spring(node.width),
          nodeRectHeight: spring(node.height)
        },
      });
    } else if (outPortType === PortType.hasHiddenEdge) {
      const type = { "level_1": false, "level_2": true };
      portTypeMap.set("out>" + id4Style, { type: type, index: portStyles.length })
      portStyles.push({
        //key: `outPort_${id4Style}_${nodeKeyMap[id4Style]}`,
        key: `outPort_${node.id}`,
        data: {
          direction: "out",
          isRealLink: false,
          isOperation: node.type === NodeType.OPERATION,
          type: type,
          nodeId: id4Style,
          id4Style: `outPort_${id4Style}_${nodeKeyMap[id4Style]}`,
          hiddenEdges: outHiddenEdges,
        },
        style: {
          gNodeTransX: spring(ofs.x + node.x + outPort.x),
          gNodeTransY: spring(ofs.y + node.y + outPort.y),
          nodeRectWidth: spring(node.width),
          nodeRectHeight: spring(node.height),
        },
      });
    }
    //先计算level_1
    for (let i = 0; i < portStyles.length; i++) {
      let style = portStyles[i];
      let { nodeId } = style.data;
      style.data.hiddenEdges.forEach(hiddenEdge => {
        const { source, target } = hiddenEdge;
        let _nodeId = ""
        if (style.data.direction === "in" && target === nodeId) {
          _nodeId = source;
          nodeId = "in>" + nodeId;
          _nodeId = "in>" + _nodeId;
        }
        if (style.data.direction === "out" && source === nodeId) {
          _nodeId = target;
          nodeId = "out>" + nodeId;
          _nodeId = "out>" + _nodeId;
        }
        if (_nodeId !== "") {
          if (portTypeMap.get(nodeId).type["level_1"]) {
            let info = portTypeMap.get(_nodeId);
            info["type"]["level_1"] = true;
            info["type"]["level_2"] = false;
            portTypeMap.set(_nodeId, info);
            portStyles[info["index"]]["data"]["type"] = info["type"]
          } else if (portTypeMap.get(_nodeId).type["level_1"]) {
            let info = portTypeMap.get(nodeId);
            info["type"]["level_1"] = true;
            info["type"]["level_2"] = false;
            portTypeMap.set(nodeId, info);
            portStyles[info["index"]]["data"]["type"] = info["type"]
          }
        }
      });
    }
    //level_1遍历完成之后再计算level_2
    for (let i = 0; i < portStyles.length; i++) {
      let style = portStyles[i];
      let { nodeId } = style.data;
      style.data.hiddenEdges.forEach(hiddenEdge => {
        const { source, target } = hiddenEdge;
        let _nodeId = ""
        if (style.data.direction === "in" && target === nodeId) {
          _nodeId = source;
          nodeId = "in>" + nodeId;
          _nodeId = "in>" + _nodeId;
        }
        if (style.data.direction === "out" && source === nodeId) {
          _nodeId = target;
          nodeId = "out>" + nodeId;
          _nodeId = "out>" + _nodeId;
        }
        if (_nodeId !== "") {
          if (portTypeMap.get(nodeId).type["level_2"]) {
            let info = portTypeMap.get(_nodeId);
            info["type"]["level_2"] = true;
            portTypeMap.set(_nodeId, info);
            portStyles[info["index"]]["data"]["type"] = info["type"]
          } else if (portTypeMap.get(_nodeId).type["level_2"]) {
            let info = portTypeMap.get(nodeId);
            info["type"]["level_2"] = true;
            portTypeMap.set(nodeId, info);
            portStyles[info["index"]]["data"]["type"] = info["type"]
          }
        }
      });
    }

    if (node.hasOwnProperty("children")) {
      //node有"children"属性<=>有"edge"属性
      generateEdgeStyles(node["edges"], linkStyles, {
        x: ofs.x + node.x,
        y: ofs.y + node.y,
      });
      generateNodeStyles(node["children"], nodeStyles, linkStyles, portStyles, {
        x: ofs.x + node.x,
        y: ofs.y + node.y,
      });
    }
  }
};

function ofsLinks(edges: Array<LayoutEdge>) {
  // 通过每条线段的起始位置坐标 和 终点位置 坐标来统计线的条数
  // TODO: 这里可能的问题是，重叠的一段线段，比如[10,20] -> [10, 40]; 以及 [10,0]->[10,50]
  // 或者 用线段的起始位置的不好的地方可能是上层处理的数据万一相差个一点点就不对了。
  let xyMap = {};
  for (const edge of edges) {
    const { startPoint, endPoint, bendPoints } = edge.sections[0];
    let edgeData = [
      { x: startPoint.x, y: startPoint.y },
      ...(bendPoints === undefined ? [] : bendPoints),
      { x: endPoint.x, y: endPoint.y },
    ]; // 起点到终点的所经过的所有点的坐标

    //统计每段线段出现多少次   ？？？？？ 不对吧！
    for (let i = 0; i < edgeData.length - 1; i++) {
      let point1 = edgeData[i]; // 线段的起点
      let point2 = edgeData[i + 1]; // 线段的终点

      if (
        xyMap.hasOwnProperty(`${point1.x}-${point1.y}-${point2.x}-${point2.y}`)
      ) {
        xyMap[`${point1.x}-${point1.y}-${point2.x}-${point2.y}`] += 1;
      } else {
        xyMap[`${point1.x}-${point1.y}-${point2.x}-${point2.y}`] = 1;
      }
    }
  }
  return xyMap;
}

const judgeDirection = (start, end): string => {
  // 根据折线的起始点确定方向，[left, right, up, down]
  if (start.x == end.x) { // 水平方向
    return start.y > end.y ? "up" : "down";
  } else {
    return start.x > end.x ? "left" : "right";
  }
}

const adjustLength = (prePoint, nowPoint): number[] => {
  let direction = judgeDirection(prePoint, nowPoint);
  let newX = nowPoint.x, newY = nowPoint.y;
  if (direction == "up") newY += 4;
  else if (direction == "down") newY -= 4;
  else if (direction == "left") newX += 4;
  else if (direction == "right") newX -= 4;
  return [newX, newY];
}

const drawArcPath = (ofs_x, lineData, linksCountMap, ofs) => {
  let path = [];
  const lineStrokeWidth = [];

  let preStrokeWidth =
    linksCountMap[
    `${lineData[0].x - ofs.x}-${lineData[0].y - ofs.y}-${lineData[1].x - ofs.x}-${lineData[1].y - ofs.y}`
    ];

  if (lineData.length === 2) { // 一条线
    const _lineWidth = strokeWidthAdaption(preStrokeWidth);
    lineStrokeWidth.push(_lineWidth);
    path.push({
      d: `M${lineData[0].x} ${lineData[0].y} L${lineData[1].x - ofs_x} ${lineData[1].y}`,
      strokeWidth: _lineWidth,
    });
    return [path, lineStrokeWidth];
  }

  // 多段线 , 每一段线的 width不一样 ，并且两个不在同一直线上的直线，之间存在一个圆弧连接
  let prePoint;
  let nowPoint;
  let postPoint;
  let pathBuff = [`M${lineData[0].x} ${lineData[0].y}`];
  for (let i = 1; i < lineData.length - 1; i++) { // 多段折线 length >= 3
    prePoint = lineData[i - 1];
    nowPoint = lineData[i];
    postPoint = lineData[i + 1];

    preStrokeWidth = // 前一条折线的宽度
      linksCountMap[`${prePoint.x - ofs.x}-${prePoint.y - ofs.y}-${nowPoint.x - ofs.x
      }-${nowPoint.y - ofs.y}`];
    let postStrokeWidth = // 后一条折线的宽度
      linksCountMap[`${nowPoint.x - ofs.x}-${nowPoint.y - ofs.y}-${postPoint.x - ofs.x
      }-${postPoint.y - ofs.y}`];

    if (Math.abs(preStrokeWidth - postStrokeWidth) < 0.001) { // 前后两条折线的width相同
      if (goThroughPoint(prePoint, postPoint, nowPoint)) { // 共线
        pathBuff.push(`L${nowPoint.x} ${nowPoint.y}`);

        // TODO : 最后一个点 postPoint
        if (i == lineData.length - 2) { // 倒数第二个点
          // nowPoint是倒数第二个点， postPoint是最后一个点 
          pathBuff.push(`L${postPoint.x - ofs_x} ${postPoint.y}`);
          const _lineWidth = strokeWidthAdaption(preStrokeWidth);
          lineStrokeWidth.push(_lineWidth);
          path.push({ // 第一段线结束
            d: pathBuff.join(""),
            strokeWidth: _lineWidth,
            arrowhead: true,
          });
        }
      } else { // 不共线, 则存在圆弧
        // 如果下一个要增加圆角，则上一条线要根据方向缩短距离，给末尾的圆角一定 空间
        let [newX, newY] = adjustLength(prePoint, nowPoint);
        pathBuff.push(`L${newX} ${newY}`);

        pathBuff.push(...pointToPath(prePoint, nowPoint, postPoint));

        if (i == lineData.length - 2) { // 倒数第二个点
          // nowPoint是倒数第二个点， postPoint是最后一个点 
          pathBuff.push(`L${postPoint.x - ofs_x} ${postPoint.y}`);
          const _lineWidth = strokeWidthAdaption(preStrokeWidth);
          lineStrokeWidth.push(_lineWidth);
          path.push({ // 第一段线结束
            d: pathBuff.join(""),
            strokeWidth: _lineWidth,
            arrowhead: true,
          });
        }
      }
    } else { // 前后两条折线的width不同
      if (goThroughPoint(prePoint, postPoint, nowPoint)) {  // 前后宽度不同，且共线
        pathBuff.push(`L${nowPoint.x} ${nowPoint.y}`);
        const _lineWidth = strokeWidthAdaption(preStrokeWidth);
        lineStrokeWidth.push(_lineWidth);
        path.push({ // 第一段线结束
          d: pathBuff.join(""),
          strokeWidth: _lineWidth,
          arrowhead: false,
        });

        pathBuff = [`M${nowPoint.x} ${nowPoint.y}`];

        if (i == lineData.length - 2) { // 倒数第二个点
          // nowPoint是倒数第二个点， postPoint是最后一个点 
          pathBuff.push(`L${postPoint.x - ofs_x} ${postPoint.y}`);
          const _lineWidth = strokeWidthAdaption(postStrokeWidth);
          lineStrokeWidth.push(_lineWidth);
          path.push({ // 第一段线结束
            d: pathBuff.join(""),
            strokeWidth: _lineWidth,
            arrowhead: true,
          });
        }

      } else { // 前后宽度不相同，且不共线
        // pathBuff.push(`L${nowPoint.x} ${nowPoint.y}`);
        let [newX, newY] = adjustLength(prePoint, nowPoint);
        pathBuff.push(`L${newX} ${newY}`);
        pathBuff.push(...pointToPath(prePoint, nowPoint, postPoint));

        if (i == lineData.length - 2) { // 倒数第二个点
          // nowPoint是倒数第二个点， postPoint是最后一个点 
          pathBuff.push(`L${postPoint.x - ofs_x} ${postPoint.y}`);
          const _lineWidth = strokeWidthAdaption(preStrokeWidth);
          lineStrokeWidth.push(_lineWidth);
          path.push({ // 第一段线结束
            d: pathBuff.join(""),
            strokeWidth: _lineWidth,
            arrowhead: true,
          });
        }

      }
    }
  }

  return [path, lineStrokeWidth];
};

const hoverPath = (ofs_x, lineData) => {
  if (lineData.length < 3)
    return `M${lineData[0].x} ${lineData[0].y} L${lineData[1].x - ofs_x} ${lineData[1].y}`;
  let prePoint;
  let nowPoint;
  let firstPoint;
  let path = [`M${lineData[0].x} ${lineData[0].y}`];
  let Lpushed = false;
  for (let i = 2; i < lineData.length; i++) {
    firstPoint = lineData[i - 2];
    prePoint = lineData[i - 1];
    nowPoint = lineData[i];
    //根据点位置判断弧度方向

    // 如果三点共线，或者夹角太小，则直接连接
    if (goThroughPoint(firstPoint, nowPoint, prePoint)) { // 共线
      path.push("L" + (nowPoint.x - ofs_x) + " " + nowPoint.y);
      Lpushed = true;
    } else {
      path = [...path, ...pointToPath(firstPoint, prePoint, nowPoint)];
      Lpushed = false;
    }
  }
  if (Lpushed === false)
    path.push(`L ${nowPoint.x - ofs_x} ${nowPoint.y}`);
  return path.join(" ");
};

function pointToPath(prePoint, nowPoint, postPoint) { // (prePoint, nowPoint, postPoint)
  let rx = 4;
  let ry = 4;
  let path = [];
  if (nowPoint.x > prePoint.x) {
    path.push(`L ${nowPoint.x - rx} ${nowPoint.y}`);
    postPoint.y > nowPoint.y
      ? path.push(`a ${rx} ${ry} 0 0 1 ${rx} ${ry}`)
      : path.push(`a ${rx} ${ry} 0 0 0 ${rx} ${-ry}`);
  } else if (nowPoint.x < prePoint.x) {
    path.push(`L ${nowPoint.x + rx} ${nowPoint.y}`);
    postPoint.y > nowPoint.y
      ? path.push(`a ${rx} ${ry} 0 0 0 ${-rx} ${ry}`)
      : path.push(`a ${rx} ${ry} 0 0 1 ${-rx} ${-ry}`);
  } else if (nowPoint.y > prePoint.y) {
    path.push(`L ${nowPoint.x} ${nowPoint.y - ry}`);
    postPoint.x > nowPoint.x
      ? path.push(`a ${rx} ${ry} 0 0 0 ${rx} ${ry}`)
      : path.push(`a ${rx} ${ry} 0 0 1 ${-rx} ${ry}`);
  } else {
    path.push(`L ${nowPoint.x} ${nowPoint.y + ry}`);
    postPoint.x > nowPoint.x
      ? path.push(`a ${rx} ${ry} 0 0 1 ${rx} ${-ry}`)
      : path.push(`a ${rx} ${ry} 0 0 0 ${-rx} ${-ry}`);
  }
  return path;
}

const textSize = (text: string): number => {
  //计算字符的显示长度
  let span = document.createElement("span");
  span.style.visibility = "hidden";
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

function strokeWidthAdaption(width) {
  return Math.sqrt(width) * 2;
}