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

export const mockData1: ProcessedGraph = {
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
  getDisplayedEdges: () => { return [] },
  getDisplayedNodes: () => { return [] }
}

export const mockData2: ProcessedGraph = {
  "nodeMap": {
    "convolutional___conv___/y___output___": {
      id: "convolutional___conv___/y___output___",
      displayedName: "convolutional___conv___/y___output___",
      type: NodeType.DATA,
      dataType: DataType.OUTPUT,
      parent: 'convolutional___conv___',
    },
    "convolutional___conv___/add_3": {
      id: "convolutional___conv___/add_3",
      displayedName: "convolutional___conv___/add_3",
      type: NodeType.OPERTATION,
      parent: "convolutional___conv___",
      operationType: "Add"
    },
    "convolutional___conv___/MatMul_1": {
      id: "convolutional___conv___/MatMul_1",
      displayedName: "convolutional___conv___/MatMul_1",
      type: NodeType.OPERTATION,
      parent: "convolutional___conv___",
      operationType: "MatMul"
    },
    "convolutional___conv___/Variable_7": {
      id: "convolutional___conv___/Variable_7",
      displayedName: "convolutional___conv___/Variable_7",
      type: NodeType.DATA,
      parent: "convolutional___conv___",
      dataType: DataType.VARIABLE
    },
    "convolutional___conv___/dropout/mul": {
      id: "convolutional___conv___/dropout/mul",
      displayedName: "convolutional___conv___/dropout/mul",
      type: NodeType.OPERTATION,
      parent: "convolutional___conv___/dropout",
      operationType: "Mul"
    },
    "convolutional___conv___/Variable_6": {
      id: "convolutional___conv___/Variable_6",
      displayedName: "convolutional___conv___/Variable_6",
      type: NodeType.DATA,
      parent: "convolutional___conv___",
      dataType: DataType.VARIABLE
    },
    "convolutional___conv___/dropout/truediv": {
      id: "convolutional___conv___/dropout/truediv",
      displayedName: "convolutional___conv___/dropout/truediv",
      type: NodeType.OPERTATION,
      parent: "convolutional___conv___/dropout",
      operationType: "RealDiv"
    },
    "convolutional___conv___/dropout/Floor": {
      id: "convolutional___conv___/dropout/Floor",
      displayedName: "convolutional___conv___/dropout/Floor",
      type: NodeType.OPERTATION,
      parent: "convolutional___conv___/dropout",
      operationType: "Floor"
    },
    "convolutional___conv___/dropout/add": {
      id: "convolutional___conv___/dropout/add",
      displayedName: "convolutional___conv___/dropout/add",
      type: NodeType.OPERTATION,
      parent: "convolutional___conv___/dropout",
      operationType: "Add"
    },
    "convolutional___conv___/dropout/sub/(sub)": {
      id: "convolutional___conv___/dropout/sub/(sub)",
      displayedName: "convolutional___conv___/dropout/sub/(sub)",
      type: NodeType.OPERTATION,
      parent: "convolutional___conv___/dropout/sub",
      operationType: "Sub"
    },
    "convolutional___conv___/dropout/random_uniform/(random_uniform)": {
      id: "convolutional___conv___/dropout/random_uniform/(random_uniform)",
      displayedName: "convolutional___conv___/dropout/random_uniform/(random_uniform)",
      type: NodeType.OPERTATION,
      parent: "convolutional___conv___/dropout/random_uniform",
      operationType: "Add"
    },
    "convolutional___conv___/dropout/random_uniform/mul": {
      id: "convolutional___conv___/dropout/random_uniform/mul",
      displayedName: "convolutional___conv___/dropout/random_uniform/mul",
      type: NodeType.OPERTATION,
      parent: "convolutional___conv___/dropout/random_uniform",
      operationType: "Mul"
    },
    "convolutional___conv___/dropout/random_uniform/min": {
      id: "convolutional___conv___/dropout/random_uniform/min",
      displayedName: "convolutional___conv___/dropout/random_uniform/min",
      type: NodeType.OPERTATION,
      parent: "convolutional___conv___/dropout/random_uniform",
      operationType: "Const"
    },
    "convolutional___conv___/dropout/random_uniform/RandomUniform": {
      id: "convolutional___conv___/dropout/random_uniform/RandomUniform",
      displayedName: "convolutional___conv___/dropout/random_uniform/RandomUniform",
      type: NodeType.OPERTATION,
      parent: "convolutional___conv___/dropout/random_uniform",
      operationType: "RandomUniform"
    },
    "convolutional___conv___/dropout/random_uniform/sub": {
      id: "convolutional___conv___/dropout/random_uniform/sub",
      displayedName: "convolutional___conv___/dropout/random_uniform/sub",
      type: NodeType.OPERTATION,
      parent: "convolutional___conv___/dropout/random_uniform",
      operationType: "Sub"
    },
    "convolutional___conv___/dropout/random_uniform/max": {
      id: "convolutional___conv___/dropout/random_uniform/max",
      displayedName: "convolutional___conv___/dropout/random_uniform/max",
      type: NodeType.OPERTATION,
      parent: "convolutional___conv___/dropout/random_uniform",
      operationType: "Const"
    },
    "convolutional___conv___/dropout/Shape": {
      id: "convolutional___conv___/dropout/Shape",
      displayedName: "convolutional___conv___/dropout/Shape",
      type: NodeType.OPERTATION,
      parent: "convolutional___conv___/dropout",
      operationType: "Shape"
    },
    "convolutional___conv___/Relu_2": {
      id: "convolutional___conv___/Relu_2",
      displayedName: "convolutional___conv___/Relu_2",
      type: NodeType.OPERTATION,
      parent: "convolutional___conv___",
      operationType: "Relu"
    },
    "convolutional___conv___/add_2": {
      id: "convolutional___conv___/add_2",
      displayedName: "convolutional___conv___/add_2",
      type: NodeType.OPERTATION,
      parent: "convolutional___conv___",
      operationType: "Add"
    },
    "convolutional___conv___/MatMul": {
      id: "convolutional___conv___/MatMul",
      displayedName: "convolutional___conv___/MatMul",
      type: NodeType.OPERTATION,
      parent: "convolutional___conv___",
      operationType: "MatMul"
    },
    "convolutional___conv___/Variable_5": {
      id: "convolutional___conv___/Variable_5",
      displayedName: "convolutional___conv___/Variable_5",
      type: NodeType.DATA,
      parent: "convolutional___conv___",
      dataType: DataType.VARIABLE
    },
    "convolutional___conv___/Reshape_1/(Reshape_1)": {
      id: "convolutional___conv___/Reshape_1/(Reshape_1)",
      displayedName: "convolutional___conv___/Reshape_1/(Reshape_1)",
      type: NodeType.OPERTATION,
      parent: "convolutional___conv___/Reshape_1",
      operationType: "Reshape"
    },
    "convolutional___conv___/Variable_4": {
      id: "convolutional___conv___/Variable_4",
      displayedName: "convolutional___conv___/Variable_4",
      type: NodeType.DATA,
      parent: "convolutional___conv___",
      dataType: DataType.VARIABLE
    },
    "convolutional___conv___/MaxPool_1": {
      id: "convolutional___conv___/MaxPool_1",
      displayedName: "convolutional___conv___/MaxPool_1",
      type: NodeType.OPERTATION,
      parent: "convolutional___conv___",
      operationType: "MaxPool"
    },
    "convolutional___conv___/Reshape_1/shape": {
      id: "convolutional___conv___/Reshape_1/shape",
      displayedName: "convolutional___conv___/Reshape_1/shape",
      type: NodeType.OPERTATION,
      parent: "convolutional___conv___/Reshape_1",
      operationType: "Const"
    },
    "convolutional___conv___/Relu_1": {
      id: "convolutional___conv___/Relu_1",
      displayedName: "convolutional___conv___/Relu_1",
      type: NodeType.OPERTATION,
      parent: "convolutional___conv___",
      operationType: "Relu"
    },
    "convolutional___conv___/add_1": {
      id: "convolutional___conv___/add_1",
      displayedName: "convolutional___conv___/add_1",
      type: NodeType.OPERTATION,
      parent: "convolutional___conv___",
      operationType: "Add"
    },
    "convolutional___conv___/Conv2D_1": {
      id: "convolutional___conv___/Conv2D_1",
      displayedName: "convolutional___conv___/Conv2D_1",
      type: NodeType.OPERTATION,
      parent: "convolutional___conv___",
      operationType: "Conv2D"
    },
    "convolutional___conv___/Variable_3": {
      id: "convolutional___conv___/Variable_3",
      displayedName: "convolutional___conv___/Variable_3",
      type: NodeType.DATA,
      parent: "convolutional___conv___",
      dataType: DataType.VARIABLE
    },
    "convolutional___conv___/MaxPool": {
      id: "convolutional___conv___/MaxPool",
      displayedName: "convolutional___conv___/MaxPool",
      type: NodeType.OPERTATION,
      parent: "convolutional___conv___",
      operationType: "MaxPool"
    },
    "convolutional___conv___/Variable_2": {
      id: "convolutional___conv___/Variable_2",
      displayedName: "convolutional___conv___/Variable_2",
      type: NodeType.DATA,
      parent: "convolutional___conv___",
      dataType: DataType.VARIABLE
    },
    "convolutional___conv___/Relu": {
      id: "convolutional___conv___/Relu",
      displayedName: "convolutional___conv___/Relu",
      type: NodeType.OPERTATION,
      parent: "convolutional___conv___",
      operationType: "Relu"
    },
    "convolutional___conv___/add": {
      id: "convolutional___conv___/add",
      displayedName: "convolutional___conv___/add",
      type: NodeType.OPERTATION,
      parent: "convolutional___conv___",
      operationType: "Add"
    },
    "convolutional___conv___/Conv2D": {
      id: "convolutional___conv___/Conv2D",
      displayedName: "convolutional___conv___/Conv2D",
      type: NodeType.OPERTATION,
      parent: "convolutional___conv___",
      operationType: "Conv2D"
    },
    "convolutional___conv___/Variable_1": {
      id: "convolutional___conv___/Variable_1",
      displayedName: "convolutional___conv___/Variable_1",
      type: NodeType.DATA,
      parent: "convolutional___conv___",
      dataType: DataType.VARIABLE
    },
    "convolutional___conv___/Reshape/(Reshape)": {
      id: "convolutional___conv___/Reshape/(Reshape)",
      displayedName: "convolutional___conv___/Reshape/(Reshape)",
      type: NodeType.OPERTATION,
      parent: "convolutional___conv___/Reshape",
      operationType: "Reshape"
    },
    "convolutional___conv___/Variable": {
      id: "convolutional___conv___/Variable",
      displayedName: "convolutional___conv___/Variable",
      type: NodeType.DATA,
      parent: "convolutional___conv___",
      dataType: DataType.VARIABLE
    },
    "convolutional___conv___/x___input___": {
      id: "convolutional___conv___/x___input___",
      displayedName: "convolutional___conv___/x___input___",
      type: NodeType.DATA,
      parent: "convolutional___conv___",
      dataType: DataType.INPUT
    },
    "convolutional___conv___/Reshape/shape": {
      id: "convolutional___conv___/Reshape/shape",
      displayedName: "convolutional___conv___/Reshape/shape",
      type: NodeType.OPERTATION,
      parent: "convolutional___conv___/Reshape",
      operationType: "Const"
    },
    "convolutional___conv___/dropout/sub/x": {
      id: "convolutional___conv___/dropout/sub/x",
      displayedName: "convolutional___conv___/dropout/sub/x",
      type: NodeType.OPERTATION,
      parent: "convolutional___conv___/dropout/sub",
      operationType: "Const"
    },
    "convolutional___conv___/sub/(sub)": {
      id: "convolutional___conv___/sub/(sub)",
      displayedName: "convolutional___conv___/sub/(sub)",
      type: NodeType.OPERTATION,
      parent: "convolutional___conv___/sub",
      operationType: "Sub"
    },
    "convolutional___conv___/sub/x": {
      id: "convolutional___conv___/sub/x",
      displayedName: "convolutional___conv___/sub/x",
      type: NodeType.OPERTATION,
      parent: "convolutional___conv___/sub",
      operationType: "Const"
    },
    "convolutional___conv___/Placeholder": {
      id: "convolutional___conv___/Placeholder",
      displayedName: "convolutional___conv___/Placeholder",
      type: NodeType.OPERTATION,
      parent: "convolutional___conv___",
      operationType: "Placeholder"
    },
    "convolutional___conv___": {
      id: "convolutional___conv___",
      displayedName: "convolutional___conv___",
      type: NodeType.LAYER,
      parent: "___root___",
      children: new Set([
        "convolutional___conv___/y___output___",
        "convolutional___conv___/add_3",
        "convolutional___conv___/MatMul_1",
        "convolutional___conv___/Variable_7",
        "convolutional___conv___/dropout",
        "convolutional___conv___/Variable_6",
        "convolutional___conv___/Relu_2",
        "convolutional___conv___/add_2",
        "convolutional___conv___/MatMul",
        "convolutional___conv___/Variable_5",
        "convolutional___conv___/Reshape_1",
        "convolutional___conv___/Variable_4",
        "convolutional___conv___/MaxPool_1",
        "convolutional___conv___/Relu_1",
        "convolutional___conv___/add_1",
        "convolutional___conv___/Conv2D_1",
        "convolutional___conv___/Variable_3",
        "convolutional___conv___/MaxPool",
        "convolutional___conv___/Variable_2",
        "convolutional___conv___/Relu",
        "convolutional___conv___/add",
        "convolutional___conv___/Conv2D",
        "convolutional___conv___/Variable_1",
        "convolutional___conv___/Reshape",
        "convolutional___conv___/Variable",
        "convolutional___conv___/x___input___",
        "convolutional___conv___/sub",
        "convolutional___conv___/Placeholder"
      ]),
      expanded: true,
      layerType: LayerType.CONV
    },
    "convolutional___conv___/dropout": {
      id: "convolutional___conv___/dropout",
      displayedName: "convolutional___conv___/dropout",
      type: NodeType.GROUP,
      parent: "convolutional___conv___",
      children: new Set([
        "convolutional___conv___/dropout/mul",
        "convolutional___conv___/dropout/truediv",
        "convolutional___conv___/dropout/Floor",
        "convolutional___conv___/dropout/add",
        "convolutional___conv___/dropout/sub",
        "convolutional___conv___/dropout/random_uniform",
        "convolutional___conv___/dropout/Shape"
      ]),
      expanded: true
    },
    "convolutional___conv___/dropout/sub": {
      id: "convolutional___conv___/dropout/sub",
      displayedName: "convolutional___conv___/dropout/sub",
      type: NodeType.GROUP,
      parent: "convolutional___conv___/dropout",
      children: new Set([
        "convolutional___conv___/dropout/sub/(sub)",
        "convolutional___conv___/dropout/sub/x"
      ]),
      expanded: true
    },
    "convolutional___conv___/dropout/random_uniform": {
      id: "convolutional___conv___/dropout/random_uniform",
      displayedName: "convolutional___conv___/dropout/random_uniform",
      type: NodeType.GROUP,
      parent: "convolutional___conv___/dropout",
      children: new Set([
        "convolutional___conv___/dropout/random_uniform/(random_uniform)",
        "convolutional___conv___/dropout/random_uniform/mul",
        "convolutional___conv___/dropout/random_uniform/min",
        "convolutional___conv___/dropout/random_uniform/RandomUniform",
        "convolutional___conv___/dropout/random_uniform/sub",
        "convolutional___conv___/dropout/random_uniform/max"
      ]),
      expanded: true
    },
    "convolutional___conv___/Reshape_1": {
      id: "convolutional___conv___/Reshape_1",
      displayedName: "convolutional___conv___/Reshape_1",
      type: NodeType.GROUP,
      parent: "convolutional___conv___",
      children: new Set([
        "convolutional___conv___/Reshape_1/(Reshape_1)",
        "convolutional___conv___/Reshape_1/shape"
      ]),
      expanded: true
    },
    "convolutional___conv___/Reshape": {
      id: "convolutional___conv___/Reshape",
      displayedName: "convolutional___conv___/Reshape",
      type: NodeType.GROUP,
      parent: "convolutional___conv___",
      children: new Set([
        "convolutional___conv___/Reshape/(Reshape)",
        "convolutional___conv___/Reshape/shape"
      ]),
      expanded: true
    },
    "convolutional___conv___/sub": {
      id: "convolutional___conv___/sub",
      displayedName: "convolutional___conv___/sub",
      type: NodeType.GROUP,
      parent: "convolutional___conv___",
      children: new Set([
        "convolutional___conv___/sub/(sub)",
        "convolutional___conv___/sub/x"
      ]),
      expanded: true
    }
  },
  "rootNode": {
    id: "___root___",
    displayedName: "___root___",
    type: NodeType.GROUP,
    parent: "",
    children: new Set([
      "convolutional___conv___"
    ]),
    expanded: true
  },
  "rawEdges": [
    {
      "source": "convolutional___conv___/add_3",
      "target": "convolutional___conv___/y___output___"
    },
    {
      "source": "convolutional___conv___/MatMul_1",
      "target": "convolutional___conv___/add_3"
    },
    {
      "source": "convolutional___conv___/Variable_7",
      "target": "convolutional___conv___/add_3"
    },
    {
      "source": "convolutional___conv___/dropout/mul",
      "target": "convolutional___conv___/MatMul_1"
    },
    {
      "source": "convolutional___conv___/Variable_6",
      "target": "convolutional___conv___/MatMul_1"
    },
    {
      "source": "convolutional___conv___/dropout/truediv",
      "target": "convolutional___conv___/dropout/mul"
    },
    {
      "source": "convolutional___conv___/dropout/Floor",
      "target": "convolutional___conv___/dropout/mul"
    },
    {
      "source": "convolutional___conv___/Relu_2",
      "target": "convolutional___conv___/dropout/truediv"
    },
    {
      "source": "convolutional___conv___/dropout/sub/(sub)",
      "target": "convolutional___conv___/dropout/truediv"
    },
    {
      "source": "convolutional___conv___/dropout/add",
      "target": "convolutional___conv___/dropout/Floor"
    },
    {
      "source": "convolutional___conv___/dropout/sub/(sub)",
      "target": "convolutional___conv___/dropout/add"
    },
    {
      "source": "convolutional___conv___/dropout/random_uniform/(random_uniform)",
      "target": "convolutional___conv___/dropout/add"
    },
    {
      "source": "convolutional___conv___/dropout/sub/x",
      "target": "convolutional___conv___/dropout/sub/(sub)"
    },
    {
      "source": "convolutional___conv___/sub/(sub)",
      "target": "convolutional___conv___/dropout/sub/(sub)"
    },
    {
      "source": "convolutional___conv___/dropout/random_uniform/mul",
      "target": "convolutional___conv___/dropout/random_uniform/(random_uniform)"
    },
    {
      "source": "convolutional___conv___/dropout/random_uniform/min",
      "target": "convolutional___conv___/dropout/random_uniform/(random_uniform)"
    },
    {
      "source": "convolutional___conv___/dropout/random_uniform/RandomUniform",
      "target": "convolutional___conv___/dropout/random_uniform/mul"
    },
    {
      "source": "convolutional___conv___/dropout/random_uniform/sub",
      "target": "convolutional___conv___/dropout/random_uniform/mul"
    },
    {
      "source": "convolutional___conv___/dropout/Shape",
      "target": "convolutional___conv___/dropout/random_uniform/RandomUniform"
    },
    {
      "source": "convolutional___conv___/dropout/random_uniform/max",
      "target": "convolutional___conv___/dropout/random_uniform/sub"
    },
    {
      "source": "convolutional___conv___/dropout/random_uniform/min",
      "target": "convolutional___conv___/dropout/random_uniform/sub"
    },
    {
      "source": "convolutional___conv___/Relu_2",
      "target": "convolutional___conv___/dropout/Shape"
    },
    {
      "source": "convolutional___conv___/add_2",
      "target": "convolutional___conv___/Relu_2"
    },
    {
      "source": "convolutional___conv___/MatMul",
      "target": "convolutional___conv___/add_2"
    },
    {
      "source": "convolutional___conv___/Variable_5",
      "target": "convolutional___conv___/add_2"
    },
    {
      "source": "convolutional___conv___/Reshape_1/(Reshape_1)",
      "target": "convolutional___conv___/MatMul"
    },
    {
      "source": "convolutional___conv___/Variable_4",
      "target": "convolutional___conv___/MatMul"
    },
    {
      "source": "convolutional___conv___/MaxPool_1",
      "target": "convolutional___conv___/Reshape_1/(Reshape_1)"
    },
    {
      "source": "convolutional___conv___/Reshape_1/shape",
      "target": "convolutional___conv___/Reshape_1/(Reshape_1)"
    },
    {
      "source": "convolutional___conv___/Relu_1",
      "target": "convolutional___conv___/MaxPool_1"
    },
    {
      "source": "convolutional___conv___/add_1",
      "target": "convolutional___conv___/Relu_1"
    },
    {
      "source": "convolutional___conv___/Conv2D_1",
      "target": "convolutional___conv___/add_1"
    },
    {
      "source": "convolutional___conv___/Variable_3",
      "target": "convolutional___conv___/add_1"
    },
    {
      "source": "convolutional___conv___/MaxPool",
      "target": "convolutional___conv___/Conv2D_1"
    },
    {
      "source": "convolutional___conv___/Variable_2",
      "target": "convolutional___conv___/Conv2D_1"
    },
    {
      "source": "convolutional___conv___/Relu",
      "target": "convolutional___conv___/MaxPool"
    },
    {
      "source": "convolutional___conv___/add",
      "target": "convolutional___conv___/Relu"
    },
    {
      "source": "convolutional___conv___/Conv2D",
      "target": "convolutional___conv___/add"
    },
    {
      "source": "convolutional___conv___/Variable_1",
      "target": "convolutional___conv___/add"
    },
    {
      "source": "convolutional___conv___/Reshape/(Reshape)",
      "target": "convolutional___conv___/Conv2D"
    },
    {
      "source": "convolutional___conv___/Variable",
      "target": "convolutional___conv___/Conv2D"
    },
    {
      "source": "convolutional___conv___/x___input___",
      "target": "convolutional___conv___/Reshape/(Reshape)"
    },
    {
      "source": "convolutional___conv___/Reshape/shape",
      "target": "convolutional___conv___/Reshape/(Reshape)"
    },
    {
      "source": "convolutional___conv___/sub/x",
      "target": "convolutional___conv___/sub/(sub)"
    },
    {
      "source": "convolutional___conv___/Placeholder",
      "target": "convolutional___conv___/sub/(sub)"
    }
  ],
  getDisplayedEdges: () => { return [] },
  getDisplayedNodes: () => { return [] }
}