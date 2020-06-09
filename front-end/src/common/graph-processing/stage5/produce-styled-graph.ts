import { LayoutGraph, LayoutGraphImp } from "../stage4/layout-graph.type";
import {
  Style,
  Offset,
  StyledGraph,
  StyledGraphImp,
} from "../stage5/styled-graph.type";
import { spring } from "react-motion";

export function produceStyledGraph(layoutGraph: LayoutGraph): StyledGraph {
  let newNodeStyles = [];
  let newLinkStyles = [];
  // layoutGraph可能为void
  const lGraph = layoutGraph as any
  if (lGraph && 'children' in lGraph) {
    generateEdgeStyles(lGraph.edges, newLinkStyles);
    generateNodeStyles(lGraph.children, newNodeStyles, newLinkStyles);
  }
  return new StyledGraphImp(newNodeStyles, newLinkStyles);
}

//直接线性遍历给定的边数组，将对应的每条边的样式添加到已有样式数组
//Todo:后续根据边的连接情况增加样式可能需要传入新的参数
export const generateEdgeStyles = (
  links: Array<any>,
  styles: Array<Style>,
  ofs: Offset = { x: 0, y: 0 }
) => {
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
  nodes: Array<any>,
  nodeStyles: Array<Style>,
  linkStyles: Array<Style>,
  ofs: Offset = { x: 0, y: 0 }
) => {
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
