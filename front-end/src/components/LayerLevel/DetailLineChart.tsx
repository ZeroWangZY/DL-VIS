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
    console.time("test");
    const dataArr = BlueNoiseSmapling(rate, originalLineData);
    console.timeEnd("test");
    // const dataArr1 = RandomSampling(rate, originalLineData);
    // const dataArr2 = KDE(rate, originalLineData);
    // particleMerge(min, max, originalLineData); // 按照一定的粒度合并图

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
    let lineNum = originalData.length; // 折线数量
    let stepNum = originalData[0].data.length; // 折线中包含多少个数据点

    let samplingLineNum = Math.round(rate * lineNum); // 要采样的折线图数量
    const segmentGroupNum = 5;
    const samplingSegmentNum = samplingLineNum * (stepNum - 1); // 采样的数据中一共包含多少个segment
    const segmentNumberInEachGroup = Math.floor(samplingSegmentNum / segmentGroupNum);

    let gap = Math.PI / segmentGroupNum; // 将pi分为多少份
    let section = [];
    for (let i = 0; i <= segmentGroupNum; i++) {
      section[i] = i * gap;
    } // segmentGroupNum+1个

    let segmentGroupInfo = []; // 每条折线图的每个segment属于哪个group
    // 比如segmentGroupInfo[i][j]表示第i条折线图的第j个segment属于哪个group

    // 时间复杂度 O(折线图数量 * 10个step * nodeTensors第一维数值 * segmentGroupNum)；
    // 大约是 O(千 * 10 * 百 * 10) = O(千万)
    for (let lineChartData of originalData) {
      let lineData = lineChartData.data;
      let segmentAngleGroup = [];
      for (let i = 0; i < stepNum - 1; i++) {
        let angle = Math.atan(lineData[i + 1].y - lineData[i].y)//角度， (lineData[i + 1].x - lineData[i].x) 总是等于1的
        if (angle < 0) angle += Math.PI;
        // 接下来判断angle在哪个section里面，它的group就是section的下标
        for (let i = 0; i < segmentGroupNum; i++) {
          if (section[i] <= angle && angle <= section[i + 1])
            segmentAngleGroup.push(i);
        }
      }
      segmentGroupInfo.push(segmentAngleGroup);
    }
    console.log(segmentGroupInfo);

    let samplingResult = [];
    let selectedLineIndex = new Set(); // 被选中折线的index
    let randomIndex = Math.floor(Math.random() * lineNum);
    let line0 = originalData[randomIndex];
    samplingResult.push(line0); // 随机选取第一条折线
    selectedLineIndex.add(randomIndex);
    let segmentGroupInfoOfThisLine = segmentGroupInfo[randomIndex];

    let segmentCountOfEachGroup = new Array(segmentGroupNum).fill(0); // 统计选中的所有折线图中,每个group的总数
    for (let group of segmentGroupInfoOfThisLine) {
      segmentCountOfEachGroup[group]++;
    }

    for (let i = 1; i < samplingLineNum; i++) { // 继续选取samplingLineNum-1条折线
      let maxFillScore = -Infinity;
      let index = -1;
      let newSegmentCountOfEachGroup = [];

      for (let lineIndex = 0; lineIndex < lineNum; lineIndex++) {
        if (selectedLineIndex.has(lineIndex)) continue;
        
        let segmentGroupInfoOfThisLine = segmentGroupInfo[lineIndex];
        // 然后统计如果选中这条折线，每个group的fill rate
        // 根据这条线的segmment group信息，更新segmentCountOfEachGroup

        let tmpSegmentCountOfEachGroup = [...segmentCountOfEachGroup];
        for (let group of segmentGroupInfoOfThisLine) {
          tmpSegmentCountOfEachGroup[group]++;
        }
        // 根据tmpSegmentCountOfEachGroup计算fill rate
        let score = 0;
        for (let count of tmpSegmentCountOfEachGroup) {
          score += count / segmentNumberInEachGroup
        }

        if (score > maxFillScore) {
          newSegmentCountOfEachGroup = [...tmpSegmentCountOfEachGroup];
          maxFillScore = score;
          index = lineIndex;
        }
      }

      segmentCountOfEachGroup = newSegmentCountOfEachGroup
      selectedLineIndex.add(index); // 暂时被选中
      samplingResult.push(originalData[index]);
    }
    // console.log(selectedLineIndex);
    // console.log(samplingResult);

    return samplingResult;

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

  const particleMerge = (min: number, max: number, originalData: Array<LineChartData>) => {
    // KDE采样
    let particlesNum = 3;
    let gap = (max - min) / particlesNum;
    let particles = [];
    for (let i = 0; i <= particlesNum; i++) {
      particles[i] = min + i * gap;
    } // 共有particlesNum+1个


    for (let lineChartData of originalData) {
      let lineData = lineChartData.data;
      for (let point of lineData) {
        for (let i = 0; i < particlesNum; i++) {
          if (particles[i] <= point.y && point.y <= particles[i + 1]) {
            point.y = (Math.abs(point.y - particles[i]) > Math.abs(point.y - particles[i + 1]) ?
              particles[i + 1] :
              particles[i]);
          }
        }
      }
    }
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