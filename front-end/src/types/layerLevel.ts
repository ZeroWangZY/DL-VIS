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


export interface ActivationsData {
  data:{
    "activations":number[][][],//一个多维张量，如[32*100],32代表这次迭代的32个数据，100代表这32个数据在该节点上产生的100维激活值
    "data_index": []
  }
}