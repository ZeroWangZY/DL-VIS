import { useEffect, useState } from "react";
import { fetchAndParseGraphData } from "../common/graph-processing/parser";
import { SimplifierImp } from "../common/graph-processing/simplifier";
import { pruneByOutput } from "../common/graph-processing/prune";
import { buildGraph } from "../common/graph-processing/graph";
import { ProcessedGraph } from "../types/processed-graph";

const bert = '/data/bert.pbtxt'
const graph1 = '/data/test-graph-1.pbtxt'
const graph2 = '/data/test-graph-2.pbtxt'
const conv = '/data/test-conv.pbtxt'
const variableTest2 = '/data/variable-test2.pbtxt'
const variableTest3 = '/data/variable-test3.pbtxt'
const biLSTM = '/data/biLSTM.pbtxt'
const resnet = '/data/ResNet.pbtxt'
const shufflenet = '/data/Shuffle.pbtxt'
const vgg = '/data/VGG16.pbtxt'

export const useTestProcessedGraph: () => ProcessedGraph = () => {
    const [processedGraph, setProcessedGraph] = useState<ProcessedGraph>(null)

    useEffect(() => {
        fetchAndParseGraphData(
            process.env.PUBLIC_URL + biLSTM,
            null
        )
            .then(graph => {
                return pruneByOutput(graph);
            })
            .then(graph => {
                const simplifier = new SimplifierImp();
                return simplifier.withTracker()(graph);
            })
            .then(async graph => {
                const hGraph = await buildGraph(graph);
                setProcessedGraph(hGraph)
            })
    }, [])
    return processedGraph;
}


export const useTestRawGraph = (needPruner: boolean = false, needSimplifier: boolean = false) => {
    const [RawGraph, setRawGraph] = useState(null)

    useEffect(() => {
        const graph = fetchAndParseGraphData(
            process.env.PUBLIC_URL + biLSTM,
            null
        )
            .then(graph => {
                if (needPruner)
                    return pruneByOutput(graph);
                else
                    return graph
            })
            .then(graph => {
                if (needSimplifier) {
                    const simplifier = new SimplifierImp();
                    return simplifier.withTracker()(graph);
                } else {
                    return graph
                }
            })
        setRawGraph(graph)
    }, [])

    return RawGraph;
}
