import React, { useState } from "react";
import "./DagreLayout.css";
import DagreLayoutGraph from "./DagreLayoutGraph"
import { LineChart } from '../LineCharts/index'
import MiniMap from '../MiniMap/MiniMap';
import { mockDataForModelLevel } from '../../mock/mockDataForModelLevel'

const DagreLayout: React.FC = () => {
    // const margin = {left: 10,right: 10, top: 10, bottom: 10}
    let lineData = mockDataForModelLevel.displayedLineChart.data.map(d => {
        return {
            x: d.iteration,
            y: d.loss
        }
    })
    const [iteration, setIteration] = useState(0)
    let handleSubmitIteration = function (iteration: number) {
        setIteration(iteration);
    }

    let lineChartData = [{ id: 'snapshot', data: lineData, color: '#9ecae1' }]
    return (
        <div className="container">
            <div className="dagre-container">
                <DagreLayoutGraph iteration={iteration} />
            </div>
            <div className="lineChart-container">
                <LineChart
                    onSubmit={handleSubmitIteration.bind(this)}
                    height={120}
                    width={1100}
                    showLegend={true}
                    showAxis={true}
                    isInteractive={true}
                    data={lineChartData}>
                </LineChart>
            </div>
            <div className="map-container">
                <MiniMap/>
            </div>
        </div>
    );
}

export default DagreLayout;