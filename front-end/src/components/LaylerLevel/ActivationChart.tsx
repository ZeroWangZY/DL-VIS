import React, {useEffect,useRef, useState } from "react";
import { LineGroup } from '../LineCharts/index';
import * as d3 from 'd3';

interface ActivationProps {
    activations: any
}
const ActivationChart: React.FC<ActivationProps> = (props:ActivationProps) => {
    let { activations } = props
    const lineChartWidth = 600
    const lineChartHight = 200
    const margin = { left: 50, right: 30, top: 30, bottom: 50 }
    const lineGroupWidth = lineChartWidth - margin.left - margin.right
    const lineGroupHight = lineChartHight- margin.top - margin.bottom

    const compute = (data,name) => {
        let lineData = []
        for(let i = 0;i < data[0].length;i ++){
            let line = {
                id: `${name}-${i}`,
                data: [],
                color: '#a1d99b'
            }
            for(let x = 0;x < data.length;x ++){
                line.data.push({
                    x,
                    y:data[x][i]
                })
            }
            lineData.push(line)
        }
        return lineData
    }

    useEffect(() => {
    })

    const linePart = () => {
        let lineChartData = []
        activations.map((d,name) =>lineChartData=lineChartData.concat(compute(d.data.activations,name)))     
        return (lineChartData.length>0?<LineGroup
            transform={`translate(${margin.left},${margin.top})`}
            width={lineGroupWidth}
            height={lineGroupHight}
            data={lineChartData} 
            // isInteractive={true}
            showAxis={true}/>:'')
    }
    return (
        <div className='layer-container activation'
        style={{
            width: lineChartWidth,
            height: lineChartHight,
            position: 'relative',
            margin: '0 25px'
        }}>
            <svg width={lineChartWidth} height={lineChartHight}>
                {linePart()}
            </svg>
        </div>
    );
}
export default ActivationChart;