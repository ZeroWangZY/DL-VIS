import React, {useEffect,useRef, useState } from "react";
import { LineGroup } from '../LineCharts/index';
import { LineChartType } from '../../types/layerLevel';
import { computeXYScales }from '../LineCharts/src/computed'
import * as d3 from 'd3';

interface IterationProps {
    linedata: LineChartType[]
    getStep: Function
    onSubmit: (iteration: number) => void
}
const IterationChart: React.FC<IterationProps> = (props: IterationProps) => {
    const lineChartWidth = 700
    const lineChartHight = 350
    const margin = { left: 50, right: 30, top: 30, bottom: 50 }
    const lineGroupWidth = lineChartWidth - margin.left - margin.right
    const lineGroupHight = lineChartHight- margin.top - margin.bottom
    let { linedata, getStep, onSubmit } = props
    const svgRef = useRef();
    let brushObject,
        xscale,
        brush
    useEffect(() => {
        d3.select('body').on('keydown', keydown);
        d3.select('body').on('keyup', keyup);
        brush = d3.brushX()
        .extent([[0, 0], [lineChartWidth, lineChartHight]])
        .on("end", brushed)

        xscale = computeXYScales(linedata,lineGroupWidth,lineGroupHight).xScale
    })
    const keydown = () => {
        if(d3.event.ctrlKey) {
            if (brushObject) {
                return;
            } else {
                brushObject = d3.select(svgRef.current).append('g').attr('id','brush');
                brushObject.call(brush);
            }
        }
    }
    
    const keyup = () => {
        if (!brushObject)
            return;
        brushObject.remove();
        brushObject = null;
    }

    const brushed = () => {
        if (!d3.event.sourceEvent) return;
        if (!d3.event.selection) return;    
        let extent = [parseInt(xscale.invert(d3.event.selection[0])), parseInt(xscale.invert(d3.event.selection[1]))]
        getStep(extent)

        if (!brushObject) return;
        brushObject.remove();
        brushObject = null;
    }
    return (
        <div className='layer-container iteration'
        style={{
            width: lineChartWidth,
            height: lineChartHight
        }}>
            <svg width={lineChartWidth} height={lineChartHight} ref={svgRef}>
            {linedata.length>0?<LineGroup
                transform={`translate(${margin.left},${margin.top})`}
                width={lineChartWidth - margin.left - margin.right}
                height={lineChartHight- margin.top - margin.bottom}
                data={linedata} 
                onSubmit={onSubmit} 
                isInteractive={true}
                showAxis={true}
                showLegend={true}/>:''}
            </svg>
        </div>
    );
}

export default IterationChart;