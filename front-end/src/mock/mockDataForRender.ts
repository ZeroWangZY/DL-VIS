import { DataNode, NodeType, OperationNode, DataType, LayerNode, LayerType, GroupNode, ProcessedGraph } from "../types/processed-graph"
import { LayoutGraph, DisplayedEdge, DisplayedNode } from "../types/layoutGraphForRender"

const input: DataNode = {
  id: 'x___input___',
  displayedName: 'x',
  type: NodeType.DATA,
  dataType: DataType.INPUT,
  parent: '___root___',
  visibility: true

}

const conv2d: OperationNode = {
  id: 'conv_layer/conv2d',
  displayedName: 'conv2d',
  type: NodeType.OPERTATION,
  operationType: 'conv2d',
  parent: 'conv_layer',
  visibility: true
}

const add1: OperationNode = {
  id: 'conv_layer/add',
  displayedName: 'add',
  type: NodeType.OPERTATION,
  operationType: 'add',
  parent: 'conv_layer',
  visibility: true
}

const relu1: OperationNode = {
  id: 'conv_layer/relu',
  displayedName: 'relu',
  type: NodeType.OPERTATION,
  operationType: 'relu',
  parent: 'conv_layer',
  visibility: true
}

const weights1: DataNode = {
  id: 'conv_layer/weights',
  displayedName: 'weights',
  type: NodeType.DATA,
  dataType: DataType.VARIABLE,
  parent: 'conv_layer',
  visibility: true
}

const bias1: DataNode = {
  id: 'conv_layer/bias',
  displayedName: 'bias',
  type: NodeType.DATA,
  dataType: DataType.VARIABLE,
  parent: 'conv_layer',
  visibility: true
}

const matMul: OperationNode = {
  id: 'fc_layer/mat_mul',
  displayedName: 'mat_mul',
  type: NodeType.OPERTATION,
  operationType: 'mat_mul',
  parent: 'fc_layer',
  visibility: true
}

const add2: OperationNode = {
  id: 'fc_layer/add',
  displayedName: 'add',
  type: NodeType.OPERTATION,
  operationType: 'add',
  parent: 'fc_layer',
  visibility: true
}

const relu2: OperationNode = {
  id: 'fc_layer/relu',
  displayedName: 'relu',
  type: NodeType.OPERTATION,
  operationType: 'relu',
  parent: 'fc_layer',
  visibility: true
}

const weights2: DataNode = {
  id: 'fc_layer/weights',
  displayedName: 'weights',
  type: NodeType.DATA,
  dataType: DataType.VARIABLE,
  parent: 'fc_layer',
  visibility: true
}

const bias2: DataNode = {
  id: 'fc_layer/bias',
  displayedName: 'bias',
  type: NodeType.DATA,
  dataType: DataType.VARIABLE,
  parent: 'fc_layer',
  visibility: true
}

const softmax: OperationNode = {
  id: 'softmax',
  displayedName: 'softmax',
  type: NodeType.OPERTATION,
  operationType: 'softmax',
  parent: '___root___',
  visibility: true
}

const output: DataNode = {
  id: 'y',
  displayedName: 'y',
  type: NodeType.DATA,
  dataType: DataType.OUTPUT,
  parent: '___root___',
  visibility: true
}

const convLayer: LayerNode = {
  id: 'conv_layer',
  displayedName: 'conv_layer',
  type: NodeType.LAYER,
  children: new Set(['conv_layer/conv2d', 'conv_layer/add', 'conv_layer/relu', 'conv_layer/weights', 'conv_layer/bias']),
  expanded: true,
  layerType: LayerType.CONV,
  parent: '___root___',
  visibility: true
}

const fcLayer: LayerNode = {
  id: 'fc_layer',
  displayedName: 'fc_layer',
  type: NodeType.LAYER,
  children: new Set(['fc_layer/mat_mul', 'fc_layer/add', 'fc_layer/relu', 'fc_layer/weights', 'fc_layer/bias']),
  expanded: false,
  layerType: LayerType.FC,
  parent: '___root___',
  visibility: true
}

const root: GroupNode = {
  id: '___root___',
  displayedName: '',
  type: NodeType.GROUP,
  children: new Set(['fc_layer', 'conv_layer', 'softmax', 'x___input___', 'y']),
  expanded: true,
  parent: '',
  visibility: true
}

export const mockDataForRender: LayoutGraph = {
  nodeMap: {
    '___root___': root,
    'fc_layer': fcLayer,
    'conv_layer': convLayer,
    'softmax': softmax,
    'fc_layer/bias': bias2,
    'fc_layer/weights': weights2,
    'fc_layer/relu': relu2,
    'fc_layer/add': add2,
    'fc_layer/mat_mul': matMul,
    'conv_layer/bias': bias1,
    'conv_layer/add': add1,
    'conv_layer/relu': relu1,
    'conv_layer/weights': weights1,
    'conv_layer/conv2d': conv2d,
    'x___input___': input,
    'y': output
  },
  rawEdges: [{
    source: input.id,
    target: conv2d.id,
  }, {
    source: weights1.id,
    target: conv2d.id,
  }, {
    source: conv2d.id,
    target: add1.id,
  }, {
    source: bias1.id,
    target: add1.id,
  }, {
    source: add1.id,
    target: relu1.id,
  }, {
    source: relu1.id,
    target: matMul.id,
  }, {
    source: weights2.id,
    target: matMul.id,
  }, {
    source: matMul.id,
    target: add2.id,
  }, {
    source: bias2.id,
    target: add2.id,
  }, {
    source: add2.id,
    target: relu2.id,
  }, {
    source: relu2.id,
    target: softmax.id,
  }, {
    source: softmax.id,
    target: output.id,
  }],
  displayedNodes: [
    {
      nodeId: 'fc_layer',
      point: { "x": 160.4609375, "y": 437.2421875 },
      size: { "width": 73.5781, "height": 41.6094 }
    },
    {
      nodeId: 'conv_layer',
      point: { "x": 154.16015625, "y": 183.21875 },
      size: { "width": 200.695, "height": 366.438 }
    },
    {
      nodeId: 'conv_layer/conv2d',
      point: { "x": 115.5234375, "y": 137.4140625 },
      size: { "width": 71.53, "height": 41.61 }
    },
    {
      nodeId: 'conv_layer/add',
      point: { "x": 160.4609375, "y": 229.0234375 },
      size: { "width": 46.98, "height": 41.61 }
    },
    {
      nodeId: 'conv_layer/relu',
      point: { "x": 160.4609375, "y": 320.6328125 },
      size: { "width": 46.86, "height": 41.61 }
    },
    {
      nodeId: 'conv_layer/weights',
      point: { "x": 153.6875, "y": 45.8046875 },
      size: { "width": 75.3125, "height": 41.61 }
    },
    {
      nodeId: 'conv_layer/bias',
      point: { "x": 205.3984375, "y": 137.4140625 },
      size: { "width": 48.2188, "height": 41.61 }
    },
    {
      nodeId: 'softmax',
      point: { "x": 160.4609375, "y": 528.8515625 },
      size: { "width": 76.52, "height": 41.61 }
    },
    {
      nodeId: 'x___input___',
      point: { "x": 14.40625, "y": 45.8046875 },
      size: { "width": 28.81, "height": 41.61 }
    },
    {
      nodeId: 'y',
      point: { "x": 160.4609375, "y": 620.4609375 },
      size: { "width": 28.81, "height": 41.61 }
    }
  ],
  dispalyedEdges: [
    {
      source: input.id,
      target: conv2d.id,
      label: "",
      points: [
        { "x": 28.8125, "y": 54.074916007784196 },
        { "x": 94.1953125, "y": 91.609375 },
        { "x": 105.83611072616408, "y": 116.609375 }
      ]
    }, {
      source: weights1.id,
      target: conv2d.id,
      label: "",
      points: [{ "x": 153.6875, "y": 66.609375 }, { "x": 153.6875, "y": 91.609375 }, { "x": 132.85772002387856, "y": 116.609375 }]
    }, {
      source: conv2d.id,
      target: add1.id,
      label: "",
      points: [{ "x": 115.5234375, "y": 158.21875 }, { "x": 115.5234375, "y": 183.21875 }, { "x": 140.05013031937574, "y": 208.21875 }]
    }, {
      source: bias1.id,
      target: add1.id,
      label: "",
      points: [{ "x": 205.3984375, "y": 158.21875 }, { "x": 205.3984375, "y": 183.21875 }, { "x": 180.87174468062426, "y": 208.21875 }]
    }, {
      source: add1.id,
      target: relu1.id,
      label: "",
      points: [{ "x": 160.4609375, "y": 249.828125 }, { "x": 160.4609375, "y": 274.828125 }, { "x": 160.4609375, "y": 299.828125 }]
    }, {
      source: relu1.id,
      target: fcLayer.id,
      label: "",
      points: [{ "x": 160.4609375, "y": 341.4375 }, { "x": 160.4609375, "y": 366.4375 }, { "x": 160.4609375, "y": 391.4375 }, { "x": 160.4609375, "y": 416.4375 }]
    }, {
      source: fcLayer.id,
      target: softmax.id,
      label: "",
      points: [{ "x": 160.4609375, "y": 458.046875 }, { "x": 160.4609375, "y": 483.046875 }, { "x": 160.4609375, "y": 508.046875 }]
    }, {
      source: softmax.id,
      target: output.id,
      label: "",
      points: [{ "x": 160.4609375, "y": 549.65625 }, { "x": 160.4609375, "y": 574.65625 }, { "x": 160.4609375, "y": 599.65625 }]
    }
  ]
}