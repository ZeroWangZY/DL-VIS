import React, { useEffect, useState, useRef, useCallback } from "react";
import * as d3 from 'd3';
import {
  useGlobalStates,
  modifyGlobalStates,
} from "../../store/global-states";
import {
  useGlobalConfigurations
} from "../../store/global-configuration";
import { makeStyles } from "@material-ui/core/styles";
import { GlobalStatesModificationType, LayerLevelCheckBoxState } from "../../store/global-states.type";
import { Point, DataToShow } from "./LayerLevel"
import "./ActivationOrGradientChart.css"
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from "@material-ui/core/Typography";
import Checkbox from '@material-ui/core/Checkbox';
import { toExponential } from "../Snapshot/Snapshot"

interface Props {
  nodeTensors: Array<Array<Array<number>>>;
  start_step: number;
  end_step: number;
}

interface LineChartData {
  id: string;
  data: {
    x: number,
    y: number,
  }[];
  color: string;
}

const DetailLineChart: React.FC<Props> = (props: Props) => {
  const { start_step, end_step, nodeTensors } = props;

  const { layerLevel_checkBoxState, currentStep } = useGlobalStates();
  const { layerLevelcolorMap } = useGlobalConfigurations();

  const svgRef = useRef();
  const zoomRef = useRef();
  const [svgWidth, setSvgWidth] = useState(650);
  const [svgHeight, setSvgHeight] = useState(140);
  const measuredRef = useCallback((node) => {
    if (node !== null) {
      setSvgWidth(node.getBoundingClientRect().width);
      setSvgHeight(node.getBoundingClientRect().height);
    }
  }, []);

  const titleAreaHeight = svgHeight * 0.1;
  const chartAreaHeight = svgHeight - titleAreaHeight;

  const margin = { top: 10, left: 40, bottom: 10, right: 40 };// chart与外层之间的margin
  const chartHeight = chartAreaHeight - margin.top - margin.bottom; // chart的高度
  const chartWidth = svgWidth - margin.left - margin.right;

  useEffect(() => {
    if (!nodeTensors || nodeTensors.length === 0 || start_step < 0) return;

    let totalSteps = nodeTensors.length;
    const [minValue, maxValue, dataArrToShow] = ToLineData(nodeTensors);
    console.log(minValue, maxValue, dataArrToShow);

    DrawLineChart(minValue, maxValue, dataArrToShow);

  }, [nodeTensors, svgWidth])

  const DrawLineChart = (minValue, maxValue, dataArrToShow) => {
    let svg = d3.select(svgRef.current);
    let focus = d3.select(svgRef.current).select("g.layerLevel-detailInfo-focus");
    focus.selectAll(".axis--y").remove(); // 清除原来的坐标
    focus.selectAll(".axis--x").remove(); // 清除原来的坐标
    focus.selectAll(".layerLevel-detailInfo-area").remove(); // 清除原折线图
    focus.selectAll(".detailLineChart-grid").remove();

    const bisect = d3.bisector((d: any) => d.x).left;
    //拿第一组数据查询
    const dataExample = dataArrToShow[0];

    let xScale = d3.scaleLinear()
      .range([0, chartWidth])
      .domain([0, dataArrToShow[0].data.length - 1]);

    let yScale = d3.scaleLinear()
      .range([chartHeight, 0])
      .domain([minValue as Number, maxValue as Number]);

    const focusAreaLineGenerator = d3
      .line<Point>()
      .curve(d3.curveMonotoneX)
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y))

    for (let i = 0; i < dataArrToShow.length; i++) {
      let data = dataArrToShow[i];
      focus
        .append("path")
        .datum(data.data)
        .attr("class", "layerLevel-detailInfo-area")
        .attr("d", focusAreaLineGenerator)
        .attr("fill", "none")
        .attr("stroke", data.color);
    }

    // focus
    //   .append("g")
    //   .attr("class", "axis axis--x")
    //   .attr("transform", "translate(0," + chartHeight + ")")
    //   .call(d3.axisBottom(xScale));

    focus
      .append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(yScale));

    // add the X gridlines

    focus.append("g")
      .attr("class", "detailLineChart-grid")
      .attr("transform", "translate(0," + chartHeight + ")")
      .call(d3.axisBottom(xScale).tickSize(-chartHeight))
      .selectAll("text")
      .style("opacity", "1")
  }

  // 将nodeTensors转换为如下形式的数据：
  // [{ id: `Detail_Info`, data: detailInfo, color: "#388aac" }]
  // detailInfo的形式是 ： [{x: , y: }]
  const ToLineData = (nodeTensors: Array<Array<Array<number>>>): [Number, Number, Array<LineChartData>] => { // Array<Array<Array<number>>>
    let totalSteps = nodeTensors.length; // 共选中了多少steps
    let ticksBetweenSteps = nodeTensors[0].length; // 每两个step之间的ticks数量
    let lineNumber = nodeTensors[0][0].length; // 折线数量

    let dataArrToShow = [];
    for (let i = 0; i < lineNumber; i++) {
      dataArrToShow.push(
        { id: "Detail_Info" + i, data: [], color: "#388aac" }
      )
    }

    let minValue = Infinity, maxValue = -Infinity; // 找出最大最小值
    for (let step = 0; step < totalSteps; step++) {
      for (let tick = 0; tick < ticksBetweenSteps; tick++) {
        for (let line = 0; line < lineNumber; line++) {
          let value = nodeTensors[step][tick][line];
          if (value > maxValue) maxValue = value;
          if (value < minValue) minValue = value;
          dataArrToShow[line].data.push({ x: step * ticksBetweenSteps + tick, y: value });
        }
      }
    }

    return [minValue, maxValue, dataArrToShow];
  }

  return (
    <div className="layerLevel-detailInfo-container" ref={measuredRef} style={{ userSelect: 'none', height: "100%" }}>
      <div
        className="layerLevel-detailInfo-title"
        style={{
          height: titleAreaHeight + "px",
          position: 'relative',
          left: margin.left,
          fontSize: "14px"
        }}>
        数据实例指标变化图
      </div>

      <svg
        style={{ height: chartAreaHeight + "px", width: "100%" }}
        ref={svgRef}>
        <g
          className="layerLevel-detailInfo-focus"
          transform={`translate(${margin.left},${margin.top})`}
        >
        </g>

      </svg>
    </div>
  );
}
export default DetailLineChart;