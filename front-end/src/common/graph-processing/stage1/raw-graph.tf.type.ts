export interface RawNode {
    name: string;
    op: string;
    attr: Record<string, any>[];
    input: string[];
  }
  
  export interface RawGraph {
    node: RawNode[];
    versions: Record<string, any>;
  }
  