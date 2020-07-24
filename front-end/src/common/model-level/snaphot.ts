import { fetchSnaphot, fetchLayerInfo, fetchModelScalars } from '../../api/modelLevel'
import { GroupNodeImp, LayerNodeImp } from '../graph-processing/stage2/processed-graph'

export const fetchAndComputeSnaphot = async () => {
    let data = await fetchSnaphot()
    let line = data.data.slice(0, 1000).map(d => {
        return {
            x: d.STEP,
            y: d.TRAIN_LOSS
        }
    })
    return { id: 'snapshot', data: line, color: '#9ecae1' }
}

export const fetchAndComputeModelScalars = async (graph_name: string, start_step: number, end_step: number, colorMap) => {
    let data = await fetchModelScalars({ graph_name: graph_name, start_step: start_step, end_step: end_step });
    let trainLoss = [],
        testLoss = [],
        trainAccuracy = [],
        testAccuracy = [],
        learningRate = [];

    data.data.data.map(d => {
        trainLoss.push({
            x: d.step,
            y: d.train_loss
        })
        testLoss.push({
            x: d.step,
            y: d.test_loss
        })
        trainAccuracy.push({
            x: d.step,
            y: d.train_accuracy
        })
        testAccuracy.push({
            x: d.step,
            y: d.test_accuracy
        })
        learningRate.push({
            x: d.step,
            y: d.learning_rate
        })

    })

    return [
        { id: `train_loss`, data: trainLoss, color: colorMap.get("train_loss") },
        { id: `test_loss`, data: testLoss, color: colorMap.get("test_loss") },
        { id: `train_accuracy`, data: trainAccuracy, color: colorMap.get("train_accuracy") },
        { id: `test_accuracy`, data: testAccuracy, color: colorMap.get("test_accuracy") },
        { id: `learning_rate`, data: learningRate, color: colorMap.get("learning_rate") },
    ]
}

export const fetchAndGetLayerInfo = async (params, nodeId, graphData) => {
    //查找内部节点输出点
    let output = nodeId
    while (graphData.nodeMap[output] instanceof GroupNodeImp || graphData.nodeMap[output] instanceof LayerNodeImp) {
        let innerGraph = graphData.getInnerGraph(output)
        let g = new Graph(innerGraph);
        output = g.topSort()
    }
    params['NODE_ARRAY'] = [`${output}:0`]
    //请求
    let data = await fetchLayerInfo(params)
    let mean = [], max = [], min = []
    data.data.map(d => {
        mean.push({
            x: d.STEP,
            y: d.ACTIVATION_MEAN
        })
        max.push({
            x: d.STEP,
            y: d.ACTIVATION_MAX
        })
        min.push({
            x: d.STEP,
            y: d.ACTIVATION_MIN
        })
    })
    return [
        { id: `mean`, data: mean, color: "rgb(98,218,170)" },
        { id: `max`, data: max, color: "rgb(233,108,91" },
        { id: `min`, data: min, color: "rgb(246,192,34)" }
    ]
}

function Graph(graph) {
    this.vertices = graph.nodes; // 顶点
    this.edges = graph.edges; // 边数
    this.adj = {};
    for (let i = 0; i < this.vertices.length; i++) {
        this.adj[this.vertices[i]] = [];
    }
    for (let i = 0; i < this.edges.length; i++) {
        let source = this.edges[i].source
        let target = this.edges[i].target
        this.adj[source].push(target);
    }
    this.topSort = topSort;
    this.topSortHelper = topSortHelper
}
function topSort() {
    let stack = [];
    let visited = {};
    for (let i = 0; i < this.vertices.length; i++) {
        visited[this.vertices[i]] = false;
    }
    for (let i = 0; i < this.vertices.length; i++) {
        if (visited[this.vertices[i]] == false) {
            this.topSortHelper(this.vertices[i], visited, stack);
        }
    }
    return stack[0]
}
function topSortHelper(v, visited, stack) {
    visited[v] = true;

    this.adj[v].forEach((w) => {
        if (!visited[w]) {
            this.topSortHelper(w, visited, stack)
        }
    })
    stack.push(v)
}