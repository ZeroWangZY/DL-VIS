export interface LineChartType {
    id: string;
    data: {
      x: number;
      y: number;
    }[];
    color?: string;
}
export class LineChartImp implements LineChartType {
  id: string
  data: {
    x: number;
    y: number;
  }[];
  color: string
  constructor() {
    this.id = '';
    this.data = [];
    this.color= '';
  }
}

export enum ModifyLineData {
  UPDATE_Line
}