import React, { useState, useEffect } from "react";
import "./DagreLayout.css";
import DagreLayoutGraph from "./DagreLayoutGraph"


const DagreLayout: React.FC = () => {
    const [iteration, setIteration] = useState(0)
    let handleSubmitIteration = function (iteration: number) {
        setIteration(iteration);
    }
    return (
        <div className="container">
            <div className="dagre-container">
                <DagreLayoutGraph iteration={iteration} />
            </div>
            {/* <div className="lineChart-container">
                <LineChart
                    onSubmit={handleSubmitIteration.bind(this)}
                    height={120}
                    width={1100}
                    showLegend={true}
                    showAxis={true}
                    isInteractive={true}
                    data={lineData}>
                </LineChart>
            </div> */}
        </div>
    );
}

export default DagreLayout;