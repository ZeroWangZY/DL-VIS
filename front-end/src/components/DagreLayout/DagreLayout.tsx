import React from "react";
import "./DagreLayout.css";
import DagreLayoutGraph from "./DagreLayoutGraph"
import { useTestProcessedGraph } from "../../effect/useTestData";


const DagreLayout: React.FC = () => {
    const testGraph = useTestProcessedGraph()

    return (
        <div className="dagre-container">
            <DagreLayoutGraph graphForLayout={testGraph} />
        </div>
    );
}

export default DagreLayout;