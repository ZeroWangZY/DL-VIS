import { wrapTaskWithTimeLogger } from "../utils";

export interface RawNode {
  attribute: Record<string, any>[];
  input: Record<string, any>[];
  name: string;
  opType: string;
  outputType: OutputType
  scope: string;
}

interface OutputType{
  dataType: string;
  tensorType: {
    elemType: string;
    shape: {
      dim : {size: string}[];
    }
  }
}

export interface RawGraph {
  constVals: Record<string, any>[];
  name: string;
  node: RawNode[];
  outputs: Record<string, any>[];
  parameters: Record<string, any>[];
}