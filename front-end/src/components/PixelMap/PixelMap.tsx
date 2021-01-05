import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { getTensorHeatmapSequential } from "../../api/layerlevel";

const PixelMap: React.FC = () => {
  const svgRef = useRef();
  const [data, setData] = useState(null);
  useEffect(() => {
    getTensorHeatmapSequential({
      start_step: 1500,
      end_step: 1510,
    }).then((data) => setData(data.data.data));
  }, []);

  useEffect(() => {
    if (data === null) return;
    console.log(d3.max(data.data));
    const color = d3.scaleSequential(d3.interpolateRgb("red", "blue"));
    const svgD3 = d3.select(svgRef.current);
    const x = d3
      .scaleLinear()
      .domain([0, data.data.length])
      .range([5, 1550]);
    const y = d3.scaleLinear().domain([0, 19]).range([5, 295]);
    const z = d3.scaleLinear().domain([-10, 10]).range([0, 1]);
    const yAxis = (g) =>
      g
        .attr("transform", `translate(5,0)`)
        .call(d3.axisLeft(y).tickSize(0))
        .call((g) => g.select(".domain").remove());
    svgD3.attr("font-family", "sans-serif").attr("font-size", 10);

    svgD3
      .append("g")
      .selectAll("g")
      .data(data.data)
      .enter()
      .append("g")
      .attr("transform", (d, i) => `translate(${x(i)},0)`)
      .selectAll("rect")
      .data((d: any) => d)
      .enter()
      .append("rect")
      .attr("y", (d, i) => y(i + 1))
      .attr("height", (d, i) => y(i + 1) - y(i))
      .attr("width", (d, i) => x(i + 1) - x(i))
      .attr("fill", (d: any) => color(z(d)));
  }, [data]);
  return (
    <div className="pixel-map-container">
      <svg style={{ height: 300, width: "100%" }} ref={svgRef}></svg>
    </div>
  );
};

export default PixelMap;
