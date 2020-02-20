import React, { useEffect, useState } from "react";
import { fetchAndParseGraphData } from "../common/graph-processing/parser";
import { SimplifierImp } from "../common/graph-processing/simplifier";
import { pruneByOutput } from "../common/graph-processing/prune";
import { buildGraph } from "../common/graph-processing/graph";
import { ProcessedGraph } from "../types/processed-graph";


const useTestProcessedGraph: () => ProcessedGraph = () => {
    const [processedGraph, setProcessedGraph] = useState<ProcessedGraph>(null)

    useEffect(() => {
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
        fetchAndParseGraphData(
            process.env.PUBLIC_URL + conv,
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

export default useTestProcessedGraph;