import React, { useEffect, useRef, useState } from "react";
import TSNE from 'tsne-js';
import * as d3 from 'd3';
import { isFunction } from "util";

interface Props {
  nodeTensors: Array<Array<Array<number>>>;
  start_step: number;
  end_step: number;
  clusterStep: number;
}

const ClusterGraph: React.FC<Props> = (props: Props) => {
  const { start_step, end_step, nodeTensors, clusterStep } = props;
  const svgRef = useRef();
  const graphWidth = 160;
  const graphHeight = 160;

  const titleAreaHeight = graphHeight * 0.1;
  const chartAreaHeight = graphHeight - titleAreaHeight;

  const margin = { left: 10, right: 10, top: 5, bottom: 5 }; // 整个cluster与外层之间的margin
  const clusterWidth = graphWidth - margin.left - margin.right;
  const clusterHeight = chartAreaHeight - margin.top - margin.bottom;

  useEffect(() => {
    if (!nodeTensors || nodeTensors.length === 0 || start_step < 0 || !clusterStep) return;

    const data = nodeTensors[clusterStep];
    // data 的是二维的，layerLevel中进行了flat操作。

    let model = new TSNE({
      dim: 2,
      perplexity: 30.0,
      earlyExaggeration: 4.0,
      learningRate: 100.0,
      nIter: 1000,
      metric: 'euclidean'
    });

    model.init({
      data: data,
      type: 'dense'
    });
    // `outputScaled` is `output` scaled to a range of [-1, 1]
    let dataset = model.getOutputScaled();
    console.log("tsne降维后的数据: ", dataset);

    // 以下是绘制散点图
    let svg = d3.select(svgRef.current);
    svg.selectAll("g").remove();

    let minVal_x = d3.min(dataset, (d) => { return d[0] }),
      maxVal_x = d3.max(dataset, (d) => { return d[0] }),
      minVal_y = d3.min(dataset, (d) => { return d[1] }),
      maxVal_y = d3.max(dataset, (d) => { return d[1] });

    let xScale = d3.scaleLinear()
      .domain([parseFloat(minVal_x), parseFloat(maxVal_x)])
      .range([0, clusterWidth]);

    let yScale = d3.scaleLinear()
      .domain([parseFloat(minVal_y), parseFloat(maxVal_y)])
      .range([clusterHeight, 0]);

    //绘制圆
    let circle = svg.selectAll("g")
      .data(dataset)
      .enter()
      .append("g")
      .attr('transform', (d) => {
        let left = margin.left + xScale(d[0]);
        let top = yScale(d[1]) + margin.top;
        if(left >= chartAreaHeight -2) {
          left = chartAreaHeight -2;
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
          const {width, height} = text.node().getBoundingClientRect();

          let x = 10;
          let y = 0;
          // 判断text的位置是否超出svg的边界
          // x边界的处理
          if (margin.left + xScale(d[0]) + Math.ceil(width) + 10 >= chartAreaHeight) {
            x = -(Math.ceil(width) + 10);
          }
          // y边界的处理
          if(yScale(d[1]) + margin.top <= Math.ceil(height)) {
            y = (Math.ceil(height) + 5 - yScale(d[1]) - margin.top);
          }
          text.attr("x", x).attr("y", y);
        }
      })
      .on("mouseout", function (d, i) {
        d3.select(this).transition().duration(500).attr("r", 2);
        const g = d3.select(this.parentNode);
        g.select('text').transition().duration(500).style('visibility', 'hidden');
      })

  }, [nodeTensors, start_step, clusterStep])

  return (
    <div className="layerLevel-cluster-container" style={{ height: graphHeight }}>

      <div
        className="layerLevel-detailInfo-title"
        style={{
          height: titleAreaHeight + "px",
          width: "80%",
          position: 'relative',
          left: margin.left,
          fontSize: "14px"
        }}>
        数据实例指标投影图
      </div>

      <svg
        style={{ height: chartAreaHeight + "px", width: chartAreaHeight + "px" }}
        ref={svgRef}>
      </svg>
    </div>
  );
}

export default ClusterGraph;