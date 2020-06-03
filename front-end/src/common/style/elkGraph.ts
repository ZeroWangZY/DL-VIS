import { BaseNode, NodeType } from "../../types/processed-graph";
import { spring } from "react-motion";
import { AnyARecord } from "dns";

interface Offset {
  x: number;
  y: number;
}

interface Style {
  key: string;
  data: any;
  style: any;
}

export interface LayoutOptions {
  networkSimplex: boolean;
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
      // portConstraints: "FIXED_SIDE",
    },
    expand: false,
    width: node.type === NodeType.OPERTATION ? 30 : Math.max(node.displayedName.length, 3) * 10 + 8,
    height: node.type === NodeType.OPERTATION ? 20 : 40,
    ports: ports,
    
  };
};

export const generateNodeStyles = (
  nodes: Array<any>,
  ofs: Offset,
  nodeStyles: Array<Style>,
  linkStyles: Array<Style>
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

export const generateEdgeStyles = (
  links: Array<any>,
  ofs: Offset,
  styles: Array<Style>
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
