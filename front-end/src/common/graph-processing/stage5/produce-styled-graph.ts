import {
  LayoutNode,
  LayoutEdge,
  LayoutGraph,
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
export function produceStyledGraph(layoutGraph: LayoutGraph): StyledGraph {
  let newNodeStyles = [];
  let newLinkStyles = [];
  let map_id4Style_Id = new Map();
  generateEdgeStyles(layoutGraph.edges, newLinkStyles);
  generateNodeStyles(
    map_id4Style_Id,
    layoutGraph.children,
    newNodeStyles,
    newLinkStyles
  );
  return new StyledGraphImp(newNodeStyles, newLinkStyles, map_id4Style_Id);
}

//直接线性遍历给定的边数组，将对应的每条边的样式添加到已有样式数组
//Todo:后续根据边的连接情况增加样式可能需要传入新的参数
export const generateEdgeStyles = (
  links: Array<LayoutEdge>,
  styles: Array<Style>,
  ofs: Offset = { x: 0, y: 0 }
): void => {
  let linksCountMap = ofsLinks(links)
  for (const link of links) {
    const { startPoint, endPoint, bendPoints } = link.sections[0];
    const { junctionPoints, id4Style } = link;
    let linkData = [
      { x: ofs.x + startPoint.x, y: ofs.y + startPoint.y },
      ...bendPoints === undefined
        ? []
        : bendPoints.map((point) => ({
          x: ofs.x + point.x,
          y: ofs.y + point.y,
        })),
      { x: ofs.x + endPoint.x, y: ofs.y + endPoint.y },
    ]
    styles.push({
      key: `${id4Style}_${linkKeyMap[id4Style]}`,
      data: {
        id4Style: link.id4Style,
        lineData: hoverPath(linkData),
        drawData: drawArcPath(linkData, linksCountMap),
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
  // 
};
function ofsLinks(edges: Array<LayoutEdge>) {
  let xyMap = {}
  for (const edge of edges) {
    const { startPoint, endPoint, bendPoints } = edge.sections[0];
    let edgeData = [
      { x: startPoint.x, y: startPoint.y },
      ...bendPoints === undefined ? [] : bendPoints,
      { x: endPoint.x, y: endPoint.y },
    ]
    //统计线段
    for (let i = 0; i < edgeData.length - 1; i++) {
      let point1 = edgeData[i]
      let point2 = edgeData[i + 1]
      if (xyMap.hasOwnProperty(`${point1.x}-${point1.y}-${point2.x}-${point2.y}`)) {
        xyMap[`${point1.x}-${point1.y}-${point2.x}-${point2.y}`] += 1
      } else {
        xyMap[`${point1.x}-${point1.y}-${point2.x}-${point2.y}`] = 1
      }
    }
  }
  return xyMap
}

const drawArcPath = (lineData, linksCountMap) => {
  let preStrokeWidth = linksCountMap[`${lineData[0].x}-${lineData[0].y}-${lineData[1].x}-${lineData[1].y}`]
  if (lineData.length < 3)
    return [{
      d: `M${lineData[0].x} ${lineData[0].y} L${lineData[1].x} ${lineData[1].y}`,
      strokeWidth: preStrokeWidth
    }]
  let prePoint
  let nowPoint
  let firstPoint
  let path = []
  let nextStrokeWidth
  let pathBuff = [`M${lineData[0].x} ${lineData[0].y}`]
  for (let i = 2; i < lineData.length; i++) {
    firstPoint = lineData[i - 2]
    prePoint = lineData[i - 1]
    nowPoint = lineData[i]
    preStrokeWidth = linksCountMap[`${firstPoint.x}-${firstPoint.y}-${prePoint.x}-${prePoint.y}`]
    nextStrokeWidth = linksCountMap[`${prePoint.x}-${prePoint.y}-${nowPoint.x}-${nowPoint.y}`]
    pathBuff = [...pathBuff, ...pointToPath(firstPoint, prePoint, nowPoint)]
    if (nextStrokeWidth !== preStrokeWidth || preStrokeWidth < 1) {
      path.push({
        d: pathBuff.join(' '),
        strokeWidth: preStrokeWidth,
        arrowhead: false
      })
      pathBuff = [`M${prePoint.x} ${prePoint.y}`]
      linksCountMap[`${firstPoint.x}-${firstPoint.y}-${prePoint.x}-${prePoint.y}`] = 0
    }
  }
  //最后一段path
  pathBuff.push(`L ${nowPoint.x} ${nowPoint.y}`)
  path.push({
    d: pathBuff.join(' '),
    strokeWidth: nextStrokeWidth,
    arrowhead: true
  })
  return path
}
const hoverPath = (lineData) => {
  if (lineData.length < 3)
    return `M${lineData[0].x} ${lineData[0].y} L${lineData[1].x} ${lineData[1].y}`;
  let prePoint;
  let nowPoint;
  let firstPoint;
  let path = [`M${lineData[0].x} ${lineData[0].y}`];
  for (let i = 2; i < lineData.length; i++) {
    firstPoint = lineData[i - 2];
    prePoint = lineData[i - 1];
    nowPoint = lineData[i];
    //根据点位置判断弧度方向
    path = [...path, ...pointToPath(firstPoint, prePoint, nowPoint)]
  }
  path.push(`L ${nowPoint.x} ${nowPoint.y}`);
  return path.join(" ");
};
function pointToPath(firstPoint, prePoint, nowPoint) {
  let rx = 4;
  let ry = 4;
  let path = []
  if (prePoint.x > firstPoint.x) {
    path.push(`L ${prePoint.x - rx} ${prePoint.y}`);
    nowPoint.y > prePoint.y
      ? path.push(`a ${rx} ${ry} 0 0 1 ${rx} ${ry}`)
      : path.push(`a ${rx} ${ry} 0 0 0 ${rx} ${-ry}`);
  } else if (prePoint.x < firstPoint.x) {
    path.push(`L ${prePoint.x + rx} ${prePoint.y}`);
    nowPoint.y > prePoint.y
      ? path.push(`a ${rx} ${ry} 0 0 0 ${-rx} ${ry}`)
      : path.push(`a ${rx} ${ry} 0 0 1 ${-rx} ${-ry}`);
  } else if (prePoint.y > firstPoint.y) {
    path.push(`L ${prePoint.x} ${prePoint.y - ry}`);
    nowPoint.x > prePoint.x
      ? path.push(`a ${rx} ${ry} 0 0 0 ${rx} ${ry}`)
      : path.push(`a ${rx} ${ry} 0 0 1 ${-rx} ${ry}`);
  } else {
    path.push(`L ${prePoint.x} ${prePoint.y + ry}`);
    nowPoint.x > prePoint.x
      ? path.push(`a ${rx} ${ry} 0 0 1 ${rx} ${-ry}`)
      : path.push(`a ${rx} ${ry} 0 0 0 ${-rx} ${-ry}`);
  }
  return path
}
//递归遍历给定的elk子节点的树，生成包含的所有点的样式以及内部边的样式
export const generateNodeStyles = (
  map_id4Style_Id: Map<string, string>,
  nodes: Array<LayoutNode>,
  nodeStyles: Array<Style>,
  linkStyles: Array<Style>,
  ofs: Offset = { x: 0, y: 0 }
): void => {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const { id4Style } = node;
    if (id4Style in nodeKeyMap) {
      linkKeyMap[id4Style] += 1;
    } else {
      linkKeyMap[id4Style] = 1;
    }
    nodeStyles.push({
      key: `${id4Style}_${nodeKeyMap[id4Style]}`,
      data: node.hasOwnProperty("label")
        ? {
          class: node.class,
          type: node.type,
          id: node.id,
          id4Style: node.id4Style,
          parent: node.parent,
          label: node.label,
          expand: node.expand,
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
          id4Style: node.id4Style,
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
      },
    });
    map_id4Style_Id.set(node.id4Style, node.id);
    if (node.hasOwnProperty("children")) {
      //node有"children"属性<=>有"edge"属性
      generateEdgeStyles(node["edges"], linkStyles, {
        x: ofs.x + node.x,
        y: ofs.y + node.y,
      });
      generateNodeStyles(
        map_id4Style_Id,
        node["children"],
        nodeStyles,
        linkStyles,
        {
          x: ofs.x + node.x,
          y: ofs.y + node.y,
        }
      );
    }
  }
};

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
