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
  setClusterStep: { (number): void }
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
  const { start_step, end_step, nodeTensors, setClusterStep } = props;

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
  const [dataArrToShow, setDataArrToShow] = useState(null);
  const [minValueOfDataToShow, setMinValueOfDataToShow] = useState(-100);
  const [maxValueOfDataToShow, setMaxValueOfDataToShow] = useState(100)

  useEffect(() => {
    if (!nodeTensors || nodeTensors.length === 0 || start_step < 0) return;

    const [min, max, originalLineData] = ToLineData(nodeTensors);

    let rate = 0.05;
    const dataArr = BlueNoiseSmapling(rate, originalLineData);
    const dataArr1 = RandomSampling(rate, originalLineData);
    const dataArr2 = KDE(rate, originalLineData);

    setDataArrToShow(dataArr);
    setMinValueOfDataToShow(min);
    setMaxValueOfDataToShow(max);
  }, [nodeTensors])

  useEffect(() => {
    if (!dataArrToShow || dataArrToShow.length === 0) return;

    DrawLineChart(minValueOfDataToShow, maxValueOfDataToShow, dataArrToShow);

  }, [dataArrToShow, minValueOfDataToShow, maxValueOfDataToShow, svgWidth])

  const DrawLineChart = (minValue, maxValue, dataArrToShow) => {
    const totalSteps = nodeTensors.length;
    const ticksBetweenTwoSteps = nodeTensors[0].length;

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
      .domain([0, ticksBetweenTwoSteps * totalSteps - 1]);

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
  // 将nodeTensors转换为如下形式的数据：
  // [{ id: `Detail_Info`, data: detailInfo, color: "#388aac" }]
  // detailInfo的形式是 ： [{x: , y: }]
  const ToLineData = (nodeTensors: Array<Array<Array<number>>>): [number, number, Array<LineChartData>] => { // Array<Array<Array<number>>>
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

  const BlueNoiseSmapling = (rate: number, originalData: Array<LineChartData>): Array<LineChartData> => {
    // 蓝噪声采样

    return originalData;

    function DistanceOfTwoLine(l1: LineChartData, l2: LineChartData) {
      let data1 = l1.data, data2 = l2.data;
      let distance = 0, len = data1.length;
      for (let i = 0; i < len - 1; i++) {
        distance += Math.abs((data2[i + 1].y - data2[i].y) / 2 - (data1[i + 1].y - data1[i].y) / 2);
      }
      return distance / len;
    }
  }

  const RandomSampling = (rate: number, originalData: Array<LineChartData>): Array<LineChartData> => {
    // 随机采样
    let res = [];
    let randomNums = new Set(), len = originalData.length;
    for (let i = 0; i < Math.round(rate * len); i++) {
      let randomNum = Math.floor(Math.random() * len);
      if (!randomNums.has(randomNum))
        randomNums.add(randomNum);
    }
    randomNums.forEach((randomNum: number) => {
      res.push(originalData[randomNum]);
    })

    return res;
  }

  const KDE = (rate: number, originalData: Array<LineChartData>): Array<LineChartData> => {
    // KDE采样


    return originalData;
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