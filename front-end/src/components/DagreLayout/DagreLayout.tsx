import React, { useEffect, useState } from "react";
import "./DagreLayout.css";
import { mockData } from "../../mock/processed-graph-data";
import DagreLayoutGraph from "./DagreLayoutGraph"
import { fetchAndParseGraphData } from "../../common/graph-processing/parser";
import { SimplifierImp } from "../../common/graph-processing/simplifier";
import { pruneByOutput } from "../../common/graph-processing/prune";
import { buildGraph } from "../../common/graph-processing/graph";
import { ProcessedGraph, GroupNode, NodeType } from "../../types/processed-graph";
import useTestProcessedGraph from "../../effect/useTestProcessedGraph";


const DagreLayout: React.FC = () => {
    const testGraph = useTestProcessedGraph()

    return (
        <div className="dagre-container">
            <DagreLayoutGraph graphForLayout={testGraph} />
        </div>
    );
}

export default DagreLayout;