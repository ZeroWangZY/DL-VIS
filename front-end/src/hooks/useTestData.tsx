/* eslint-disable react/react-in-jsx-scope */
import React, { useEffect, useState, createContext, useContext } from "react";
import { fetchAndParseGraphData } from "../common/graph-processing/parser";
import { SimplifierImp } from "../common/graph-processing/simplifier";
import { pruneByOutput } from "../common/graph-processing/prune";
import { buildGraph } from "../common/graph-processing/graph";
import { ProcessedGraph, ProcessedGraphImp } from "../types/processed-graph";

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

const TestProcessedGraphContext = createContext(null);

interface ProcessedGraphAndChangeFlag {
    processedGraph: ProcessedGraph;
    graphChangeFlag: number;
    graphChanged: () => void;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
// eslint-disable-next-line react/prop-types
export const TestProcessedGraphProvider = ({ children }) => {
    const [processedGraph, setProcessedGraph] =
        useState<ProcessedGraph>(new ProcessedGraphImp());
    const [graphChangeFlag, setGraphChangeFlag] = useState(0)

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

    return (
        <TestProcessedGraphContext.Provider value={{
            processedGraph: processedGraph,
            graphChangeFlag: graphChangeFlag,
            graphChanged: function () { setGraphChangeFlag(graphChangeFlag + 1) }
        }}>
            {children}
        </TestProcessedGraphContext.Provider>
    )
};


export const useTestProcessedGraph: () => ProcessedGraphAndChangeFlag = () => {
    const contextValue = useContext(TestProcessedGraphContext);
    return contextValue;
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
