import {RawEdge, NodeId, OperationNode, GroupNode, LayerNode, DataNode} from "./processed-graph";

export interface Points {
  iteration: number; // 横坐标
  loss: number; // 纵坐标
}
export interface DisplayedLineChart {
  data: Points[];
}

export interface Activation {
  iteration: number;
  data: {
    mean: Array<number>;
    max: Array<number>;
    min: Array<number>;
  };
}
export interface DisplayedLineChartForLayerNode{
  nodeId: NodeId;
  activation: Activation[];
}

export interface LineChartData {
  displayedLineChartForLayerNode: DisplayedLineChartForLayerNode[];
  displayedLineChart: DisplayedLineChart;
}
