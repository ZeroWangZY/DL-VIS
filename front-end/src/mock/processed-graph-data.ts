import { DataNode, NodeType, OperationNode, DataType, LayerNode, LayerType, GroupNode, ProcessedGraph } from "../types/processed-graph"

const input: DataNode = {
  id: 'x___input___',
  displayedName: 'x',
  type: NodeType.DATA,
  dataType: DataType.INPUT,
  parent: '___root___',
}

const conv2d: OperationNode = {
  id: 'conv_layer/conv2d',
  displayedName: 'conv2d',
  type: NodeType.OPERTATION,
  operationType: 'conv2d',
  parent: 'conv_layer',
}

const add1: OperationNode = {
  id: 'conv_layer/add',
  displayedName: 'add',
  type: NodeType.OPERTATION,
  operationType: 'add',
  parent: 'conv_layer',
}

const relu1: OperationNode = {
  id: 'conv_layer/relu',
  displayedName: 'relu',
  type: NodeType.OPERTATION,
  operationType: 'relu',
  parent: 'conv_layer',
}

const weights1: DataNode = {
  id: 'conv_layer/weights',
  displayedName: 'weights',
  type: NodeType.DATA,
  dataType: DataType.VARIABLE,
  parent: 'conv_layer',
}

const bias1: DataNode = {
  id: 'conv_layer/bias',
  displayedName: 'bias',
  type: NodeType.DATA,
  dataType: DataType.VARIABLE,
  parent: 'conv_layer',
}

const matMul: OperationNode = {
  id: 'fc_layer/mat_mul',
  displayedName: 'mat_mul',
  type: NodeType.OPERTATION,
  operationType: 'mat_mul',
  parent: 'fc_layer',
}

const add2: OperationNode = {
  id: 'fc_layer/add',
  displayedName: 'add',
  type: NodeType.OPERTATION,
  operationType: 'add',
  parent: 'fc_layer',
}

const relu2: OperationNode = {
  id: 'fc_layer/relu',
  displayedName: 'relu',
  type: NodeType.OPERTATION,
  operationType: 'relu',
  parent: 'fc_layer',
}

const weights2: DataNode = {
  id: 'fc_layer/weights',
  displayedName: 'weights',
  type: NodeType.DATA,
  dataType: DataType.VARIABLE,
  parent: 'fc_layer',
}

const bias2: DataNode = {
  id: 'fc_layer/bias',
  displayedName: 'bias',
  type: NodeType.DATA,
  dataType: DataType.VARIABLE,
  parent: 'fc_layer',
}

const softmax: OperationNode = {
  id: 'softmax',
  displayedName: 'softmax',
  type: NodeType.OPERTATION,
  operationType: 'softmax',
  parent: '___root___',
}

const output: DataNode = {
  id: 'y',
  displayedName: 'y',
  type: NodeType.DATA,
  dataType: DataType.OUTPUT,
  parent: '___root___',
}

const convLayer: LayerNode = {
  id: 'conv_layer',
  displayedName: 'conv_layer',
  type: NodeType.LAYER,
  children: new Set(['conv_layer/conv2d', 'conv_layer/add', 'conv_layer/relu', 'conv_layer/weights', 'conv_layer/bias']),
  expanded: false,
  layerType: LayerType.CONV,
  parent: '___root___',
}

const fcLayer: LayerNode = {
  id: 'fc_layer',
  displayedName: 'fc_layer',
  type: NodeType.LAYER,
  children: new Set(['fc_layer/mat_mul', 'fc_layer/add', 'fc_layer/relu', 'fc_layer/weights', 'fc_layer/bias']),
  expanded: false,
  layerType: LayerType.FC,
  parent: '___root___',
}

const root: GroupNode = {
  id: '___root___',
  displayedName: '',
  type: NodeType.GROUP,
  children: new Set(['fc_layer', 'conv_layer', 'softmax', 'x___input___', 'y']),
  expanded: true,
  parent: '',
}

const mockData: ProcessedGraph = {
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
  rootNode: root,
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
  getDisplayedEdges: () => { return [] }
}