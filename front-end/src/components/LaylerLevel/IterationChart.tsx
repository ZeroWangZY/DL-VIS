import React, {useEffect, useState } from "react";
import { LineGroup } from '../LineCharts/index';
import { LineChartType } from '../../types/layerLevel';
import * as d3 from 'd3';

interface IterationProps {
    linedata: LineChartType[];
}
const IterationChart: React.FC<IterationProps> = (props: IterationProps) => {
    const lineChartWidth = 600
    const lineChartHight = 300
    const margin = { left: 30, right: 10, top: 10, bottom: 20 }
    let { linedata } = props
    let ctrlKey,
        brushMode,
        brushObject,
        brush

    const keydown = () => {
        ctrlKey = d3.event.ctrlKey;
        if (brushObject) {
            return;
        } else {
            brushMode = true;
            // brushObject = gBrushHolder.append('g');
            brushObject.call(brush);
        }
    }
    
    const keyup = () => {
        ctrlKey = false;
        brushMode = false;
        if (!brushObject)
            return;
        brushObject.remove();
        brushObject = null;
    }
    useEffect(() => {
        d3.select('body').on('keydown', keydown);
        d3.select('body').on('keyup', keyup);
        brush = d3.brush()
        .extent([[0, 0], [lineChartWidth, lineChartHight]])
        // .on("start", brushstart)
        // .on("brush", brushed)
        // .on("end", brushend);
    })
    return (
        <div>
            <svg width={lineChartWidth} height={lineChartHight}>
                <LineGroup
                transform={`translate(${margin.left},${margin.top})`}
                width={lineChartWidth - margin.left - margin.right}
                height={lineChartHight- margin.top - margin.bottom}
                data={linedata} 
                isInteractive={true}
                showAxis={true}
                showLegend={true}/>
            </svg>
        </div>
    );
}

export default IterationChart;