export interface transformData {
    x: number,
    y: number,
    k: number,
}
export class transformImp implements transformData {
    x: number
    y: number
    k: number
    constructor() {
      this.x = 0;
      this.y = 0;
      this.k = 1;
    }
}

export enum GraphInfoType {
  UPDATE_NODE
}

export enum TransformType {
  GRAPH_TRANSFORM,
  MAP_TRANSFORM
}