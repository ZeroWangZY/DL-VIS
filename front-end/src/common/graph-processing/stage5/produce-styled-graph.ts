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

export function produceStyledGraph(layoutGraph: LayoutGraph): StyledGraph {
  let newNodeStyles = [];
  let newLinkStyles = [];
  generateEdgeStyles(layoutGraph.edges, newLinkStyles);
  generateNodeStyles(layoutGraph.children, newNodeStyles, newLinkStyles);
  return new StyledGraphImp(newNodeStyles, newLinkStyles);
}

//直接线性遍历给定的边数组，将对应的每条边的样式添加到已有样式数组
//Todo:后续根据边的连接情况增加样式可能需要传入新的参数
export const generateEdgeStyles = (
  links: Array<LayoutEdge>,
  styles: Array<Style>,
  ofs: Offset = { x: 0, y: 0 }
): void => {
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

//递归遍历给定的elk子节点的树，生成包含的所有点的样式以及内部边的样式
export const generateNodeStyles = (
  nodes: Array<LayoutNode>,
  nodeStyles: Array<Style>,
  linkStyles: Array<Style>,
  ofs: Offset = { x: 0, y: 0 }
): void => {
  for (const node of nodes) {
    nodeStyles.push({
      key: node.id,
      data: node.hasOwnProperty("label")
        ? {
            class: node.class,
            type: node.type,
            id: node.id,
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
    if (node.hasOwnProperty("children")) {
      //有"children"属性<=>有"edge"属性
      generateEdgeStyles(node["edges"], linkStyles, {
        x: ofs.x + node.x,
        y: ofs.y + node.y,
      });
      generateNodeStyles(node["children"], nodeStyles, linkStyles, {
        x: ofs.x + node.x,
        y: ofs.y + node.y,
      });
    }
  }
};

const textSize = (text: string): number => {
  //过河拆桥法计算字符串的显示长度
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
