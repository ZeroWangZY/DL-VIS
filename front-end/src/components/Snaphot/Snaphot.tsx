import React, {useEffect, useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import * as d3 from 'd3';
import './Snaphot.css'
import { fetchAndComputeSnaphot } from '../../common/model-level/snaphot'
import { computeXYScales }from '../LineCharts/src/computed'
interface Point {
    x: number,
    y: number
}
const Snaphot: React.FC = () => {
    const svgRef = useRef();
    // const svgNode = d3.select('.lineChart-container').node() as HTMLElement;
    const svgWidth = 1800
    const svgHeight = 300
    // const [svgHeight, setSvgHeight] = useState(0);
    // const [svgWidth, setSvgWidth] = useState(0);
    const margin = {top: 20, right: 20, bottom: 110, left: 40}
    const margin2 = {top: 230, right: 20, bottom: 30, left: 40}
    const width = svgWidth - margin.left - margin.right
    const height = svgHeight - margin.top - margin.bottom
    const height2 = svgHeight - margin2.top - margin2.bottom
    let contextData
    let focusData
    const lineGenerator = d3.line<Point>()
    .x(d => focusData.xScale(d.x))
    .y(d => focusData.yScale(d.y))
    .curve(d3.curveMonotoneX)
    const lineGenerator2 = d3.line<Point>()
    .x(d => contextData.xScale(d.x))
    .y(d => contextData.yScale(d.y))
    .curve(d3.curveMonotoneX)

    const brushed = ()=> {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
            var s = d3.event.selection || contextData.xScale.range();
            focusData.xScale.domain(s.map(contextData.xScale.invert, contextData.xScale));
            let focus =  d3.select(svgRef.current).select("g.focus")
            focus.select(".area").attr("d", lineGenerator);
            focus.select(".axis--x").call(d3.axisBottom(focusData.xScale));
            d3.select(svgRef.current).select(".zoom").call(zoom.transform, d3.zoomIdentity
                .scale(width / (s[1] - s[0]))
                .translate(-s[0], 0));
    }

    const zoomed = ()=> {
        // console.log('zoom')
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
        var t = d3.event.transform;
        focusData.xScale.domain(t.rescaleX(contextData.xScale).domain());
        let focus =  d3.select(svgRef.current).select("g.focus")
        let context =  d3.select(svgRef.current).select("g.context")
        focus.select(".area").attr("d", lineGenerator);
        focus.select(".axis--x").call(d3.axisBottom(focusData.xScale));
        context.select(".brush").call(brush.move, focusData.xScale.range().map(t.invertX, t));
    }

    const brush = d3.brushX()
    .extent([[0, 0], [width, height2]])
    .on("brush end", brushed);

    const zoom = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([[0, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .on("zoom", zoomed);

    useEffect(() => {
        // const svgNode = d3.select('.lineChart-container').node() as HTMLElement;
        // console.log(svgNode.clientWidth)
        // setSvgHeight(svgNode.clientHeight)
        // setSvgWidth(svgNode.clientWidth)
        // svgHeight = svgNode.clientHeight;
        compute()
    }, [])
    const compute = async()=> {
        const data = await fetchAndComputeSnaphot()
        contextData = computeXYScales([data], width, height2)
        focusData  = computeXYScales([data], width, height)

        let focus = d3.select(svgRef.current).select("g.focus");
        focus.append("path")
            .datum(data.data)
            .attr("class", "area")
            .attr("d", lineGenerator)
            .attr('fill','none')
            .attr('stroke',data.color)
        focus.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(focusData.xScale));
      
        focus.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(focusData.yScale));

        let context = d3.select(svgRef.current).select("g.context");
        context.append("g")
                .attr("class", "brush")
                .call(brush)
                .call(brush.move, contextData.xScale.range());
        context.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + height2 + ")")
                .call(d3.axisBottom(contextData.xScale));

        context.append("path")
                .datum(data.data)
                .attr("class", "area")
                .attr("d", lineGenerator2)
                .attr('fill','none')
                .attr('stroke',data.color)

        d3.select(svgRef.current).select("rect.zoom").call(zoom)
    }

    return (
        <div className="lineChart-container">
        <svg style={{ height: '100%', width: '100%' }} ref={svgRef}>
            <defs><clipPath id={'clip'}><rect width={width} height={height}/></clipPath></defs>
            <g className="focus" transform={`translate(${margin.left},${margin.top})`}>
            </g>
            <g className="context" transform={`translate(${margin2.left},${margin2.top})`}>
            </g>
            <rect className="zoom" width={width} height={height} transform={`translate(${margin.left},${margin.top})`}/>
        </svg>
        </div>
    );
}

export default Snaphot;