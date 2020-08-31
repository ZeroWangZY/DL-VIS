import React, { useEffect, useRef, useState, useCallback } from "react";
import TSNE from 'tsne-js';
import * as d3 from 'd3';
import { isFunction } from "util";
import {
  useGlobalStates,
  modifyGlobalStates,
} from "../../store/global-states";
import { useProcessedGraph } from "../../store/processedGraph";

interface Props {
  clusterData: Array<Array<number>>;
  clusterStep: number;
}

const ClusterGraph: React.FC<Props> = (props: Props) => {
  const { clusterData, clusterStep } = props;
  const svgRef = useRef();

  const titleAreaHeight = 16 // graphHeight * 0.1;
  // const chartAreaHeight = graphHeight - titleAreaHeight;

  // const margin = { left: 10, right: 10, top: 5, bottom: 5 }; // 整个cluster与外层之间的margin
  // const clusterWidth = graphWidth - margin.left - margin.right;
  // const clusterHeight = chartAreaHeight - margin.top - margin.bottom;
  const processedGraph = useProcessedGraph();
  const { nodeMap } = processedGraph;
  const { selectedNodeId } = useGlobalStates();

  // new 
  const containerHeight = 310;
  const [containerWidth, setContainerWidth] = useState(260);

  const margin = { left: 40, right: 40, top: 16, bottom: 20 }; // cluster graph画布 外层 的div 更外层div之间的便宜偏移
  const measuredRef = useCallback((node) => {
    if (node !== null) {
      setContainerWidth(node.getBoundingClientRect().width);
    }
  }, []);
  let clusterGraphContainerHeight = containerHeight - margin.top - margin.bottom - titleAreaHeight;
  let clusterGraphContainerWidth = containerWidth - margin.left - margin.right;

  const margin2 = { left: 4, top: 4 };
  let clusterGraphHeight = clusterGraphContainerHeight - margin2.top * 2;
  let clusterGraphWidth = clusterGraphContainerWidth - margin2.left * 2;

  useEffect(() => {
    if (!clusterData || clusterData.length === 0 || !clusterStep) return;

    const dataset = clusterData;
    // console.log("tsne降维后的数据: ", dataset);
    // console.log(dataset);
    // 以下是绘制散点图
    let svg = d3.select(svgRef.current);
    svg.selectAll("g").remove();

    let minVal_x = d3.min(dataset, (d) => { return d[0] }),
      maxVal_x = d3.max(dataset, (d) => { return d[0] }),
      minVal_y = d3.min(dataset, (d) => { return d[1] }),
      maxVal_y = d3.max(dataset, (d) => { return d[1] });

    let xScale = d3.scaleLinear()
      .domain([minVal_x, maxVal_x])
      .range([0, clusterGraphWidth]);

    let yScale = d3.scaleLinear()
      .domain([minVal_y, maxVal_y])
      .range([clusterGraphHeight, 0]);

    //绘制圆
    let circle = svg.selectAll("g")
      .data(dataset)
      .enter()
      .append("g")
      .attr('transform', (d) => {
        let left = margin2.left + xScale(d[0]);
        let top = yScale(d[1]) + margin2.top;
        if (left >= clusterGraphWidth - 2) {
          left = clusterGraphWidth - 2;
        }
        return `translate(${left}, ${top})`;
      })
      .append('circle')
      .attr("class", "cluster-circle")
      .attr("r", 2)
      .on("mouseover", function (d, i) {  //hover
        d3.select(this).attr("r", 5);
        const g = d3.select(this.parentNode);
        if (g.select('text').size() === 1) {
          g.select('text').transition().duration(500).style('visibility', 'visible');
        }
        else {
          const text: any = g.append('text')
            .text(`(${i})`)
            .style('font-size', 14)
            .style('visibility', 'visible');
          const { width, height } = text.node().getBoundingClientRect();

          let x = 10;
          let y = 0;
          // 判断text的位置是否超出svg的边界
          // x边界的处理
          if (margin2.left + xScale(d[0]) + Math.ceil(width) + 10 >= clusterGraphWidth) {
            x = -(Math.ceil(width) + 10);
          }
          // y边界的处理
          if (yScale(d[1]) + margin2.top <= Math.ceil(height)) {
            y = (Math.ceil(height) + 5 - yScale(d[1]) - margin2.top);
          }
          text.attr("x", x).attr("y", y);
        }
      })
      .on("mouseout", function (d, i) {
        d3.select(this).transition().duration(500).attr("r", 2);
        const g = d3.select(this.parentNode);
        g.select('text').transition().duration(500).style('visibility', 'hidden');
      })

  }, [clusterData, clusterStep, containerWidth])

  return (
    <div className="layerLevel-cluster-container" ref={measuredRef} style={{ height: containerHeight }}>

      <div
        className="layerLevel-detailInfo-title"
        style={{
          height: titleAreaHeight + "px",
          width: "100%",
          fontSize: "14px"
        }}>
        <span>
          {"投影图(" + `${nodeMap[selectedNodeId].displayedName}` + " 迭代: " + `${clusterStep}` + ")"}
        </span>

      </div>

      <div
        className="layerLevel-cluster-graph"
        style={{
          position: "relative",
          left: margin.left,
          top: margin.top,
          height: clusterGraphContainerHeight,
          width: clusterGraphContainerWidth,
        }}>
        <svg
          style={{ height: clusterGraphContainerHeight + "px", width: clusterGraphContainerWidth + "px" }}
          ref={svgRef}>
        </svg>
      </div>
    </div>
  );
}

export default ClusterGraph;