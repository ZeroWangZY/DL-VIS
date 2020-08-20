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
import { max } from "d3";
import { fetchNodeLineDataBlueNoiceSampling } from '../../api/layerlevel';


interface Props {
  dataArrToShow: Array<Array<number>>;
  start_step: number;
  end_step: number;
  setClusterStep: { (number): void };
  minValueOfDataToShow: number;
  maxValueOfDataToShow: number;
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
  const {
    start_step,
    end_step,
    dataArrToShow,
    setClusterStep,
    maxValueOfDataToShow,
    minValueOfDataToShow
  } = props;

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

  const margin = { top: 15, left: 40, bottom: 5, right: 40 };// chart与外层之间的margin
  const chartHeight = chartAreaHeight - margin.top - margin.bottom; // chart的高度
  const chartWidth = svgWidth - margin.left - margin.right;

  useEffect(() => {
    if (!dataArrToShow || dataArrToShow.length === 0) return;

    DrawLineChart(minValueOfDataToShow, maxValueOfDataToShow, dataArrToShow);

  }, [dataArrToShow, minValueOfDataToShow, maxValueOfDataToShow, svgWidth])

  const DrawLineChart = (minValue, maxValue, dataArrToShow) => {
    const totalSteps = end_step - start_step + 1;
    const ticksBetweenTwoSteps = dataArrToShow[0].data.length / totalSteps;

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
      .domain([0, dataArrToShow[0].data.length]);

    let yScale = d3.scaleLinear()
      .range([chartHeight, 0])
      .domain([minValue as Number, maxValue as Number]);

    const focusAreaLineGenerator = d3
      .line<Point>()
      .curve(d3.curveMonotoneX)
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y))

    for (let i = 0, len = dataArrToShow.length; i < len; i++) {
      let data = dataArrToShow[i];
      focus
        .append("path")
        .datum(data.data)
        .attr("class", "layerLevel-detailInfo-area")
        .attr("d", focusAreaLineGenerator)
        .attr("fill", "none")
        .attr("stroke", data.color);
    }

    // add the X gridlines
    console.log(totalSteps, totalSteps * ticksBetweenTwoSteps);
    const yGridLine = d3.axisTop(xScale)
      .tickSize(-chartHeight)
      .ticks(totalSteps);

    focus
      .append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(yScale));

    let yGrid = focus.append("g").attr("class", "detailLineChart-grid");
    yGrid.call(yGridLine).selectAll("text").style("opacity", "0.8");
    yGrid.selectAll("path.domain").remove();  // 删除横线。

    d3.select(svgRef.current)
      .select("rect.layerLevel-detailInfo-zoom")
      .on("click", function () {
        let mouseX = d3.mouse((this as any) as SVGSVGElement)[0];
        let x = xScale.invert(mouseX);

        let _index = bisect(dataExample.data, x, 1);

        console.log(Math.floor(_index / ticksBetweenTwoSteps));
        setClusterStep(Math.floor(_index / ticksBetweenTwoSteps));
      })
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
        <rect
          className="layerLevel-detailInfo-zoom"
          width={chartWidth}
          height={chartHeight}
          transform={`translate(${margin.left},${margin.top})`}
        />
      </svg>
    </div>
  );
}
export default DetailLineChart;