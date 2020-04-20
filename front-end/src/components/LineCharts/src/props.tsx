// import { DisplayedLineChart } from '../../../types/layoutGraphForRender'

export interface LineChartProps {
  margin?: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
  width?: number;
  height?: number;
  transform?: string;
  data?: LineChartData[];
  color?: string;
  showAxis?: boolean;
  showLegend?: boolean;
  onSubmit?: { (iteration: number): void };
  isInteractive?: boolean;
  // showTooltip?: Function;
  // hideTooltip?: Function;
}

export interface LineChartData {
  id: string;
  data: {
    x: number;
    y: number;
  }[];
  color?: string;
}


export interface AxisProps {
  orient?: string;
  scale?: any;
  text?: string;
  height?: number;
  transform?: string;
  tickNumber?: number;
}


export interface ToolProps {
  data: Array<{
    id: string;
    data: {
      x: number;
      y: number;
    };
  }>;
  position: {
    x: number;
    y: number;
  }
}

export interface LineGroupState {
  renderData: any;
  tooltipData: any;
  lineX: number;
  toolPosition: {
    x: number;
    y: number;
  };
  legendData: any;
}

