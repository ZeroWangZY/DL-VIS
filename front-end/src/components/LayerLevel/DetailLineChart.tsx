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
import { configConsumerProps } from "antd/lib/config-provider";
import { useProcessedGraph } from "../../store/processedGraph";


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

  const { layerLevel_checkBoxState, currentStep, max_step, selectedNodeId } = useGlobalStates();
  const { layerLevelcolorMap } = useGlobalConfigurations();

  const processedGraph = useProcessedGraph();
  const { nodeMap } = processedGraph;

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
    if (start_step < 0 || end_step < 0 || !start_step || !end_step) return;
    if (!dataArrToShow || dataArrToShow.length === 0) return;
    console.log(start_step, end_step);

    DrawLineChart(minValueOfDataToShow, maxValueOfDataToShow, dataArrToShow);

  }, [dataArrToShow, minValueOfDataToShow, maxValueOfDataToShow, svgWidth])

  const DrawLineChart = (minValue, maxValue, dataArrToShow) => {
    const totalSteps = end_step - start_step + 1;
    const ticksBetweenTwoSteps = dataArrToShow[0].data.length / totalSteps;

    const svg = d3.select(svgRef.current);
    let focus = svg.select("g.layerLevel-detailInfo-focus");
    focus.selectAll(".axis--y").remove(); // 清除原来的坐标
    focus.selectAll(".axis--x").remove(); // 清除原来的坐标
    focus.selectAll(".layerLevel-detailInfo-area").remove(); // 清除原折线图
    focus.selectAll(".detailLineChart-grid").remove();
    svg.selectAll(".layerLevel-detailInfo-text").remove();
    svg.selectAll(".layerLevel-detailInfo-yAxisLine").remove();

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

    svg.select(".layerLevel-detailInfo-zoom")
      .on("click", function () {
        let mouseX = d3.mouse((this as any) as SVGSVGElement)[0];
        let x = xScale.invert(mouseX);

        let _index = bisect(dataExample.data, x, 1);
        setClusterStep(Math.floor(_index / ticksBetweenTwoSteps) + start_step);
      })

    for (let i = 0, len = dataArrToShow.length; i < len; i++) {
      let data = dataArrToShow[i];
      focus
        .append("path")
        .datum(data.data)
        .attr("class", "layerLevel-detailInfo-area")
        .attr("d", focusAreaLineGenerator)
        .attr("stroke", data.color)
        .attr("stroke-width", 1)
        .on("mouseover", function (d) {
          d3.select(this)
            .attr("stroke-width", 2)
            .attr("stroke", "red");

          const mouseX = d3.mouse((this as any) as SVGSVGElement)[0];
          const mouseY = d3.mouse((this as any) as SVGSVGElement)[1];
          let x = xScale.invert(mouseX);

          let _index = bisect(dataExample.data, x, 1);
          getLineInfoLabel(xScale(_index), mouseY, i, _index);
        })
        .on("mouseout", function (d) {
          d3.select(this)
            .attr("stroke", data.color)
            .attr("stroke-width", 1);

          focus.selectAll(".layerLevel-detailInfo-area-text").remove();
        })
    }

    function getLineInfoLabel(xPos, yPos, i, index) { // 在(x,y)位置画一个信息框，里面是index
      focus.selectAll(".layerLevel-detailInfo-area-text").remove();

      focus.append('text')
        .attr("class", "layerLevel-detailInfo-area-text")
        .attr("x", xPos)
        .attr("y", yPos)
        .text(`(${index})`)
        .style('font-size', 14)
        .style('visibility', 'visible');
    }

    // 需要竖线数量：刷选得到的数据范围是：[start_step, Math.min(end_step, max_step-1)]
    // 坐标刻度为 ： start_step , .... Math.min(end_step, max_step-1)
    // Math.min(end_step, max_step-1) === start_step时，不画线，直接标上值

    svg.append("text")
      .attr("class", "layerLevel-detailInfo-text")
      .text(`${start_step}`)
      .attr("x", margin.left)
      .attr("y", margin.top - 2)
      .attr("text-anchor", "middle");

    if (Math.min(end_step, max_step - 1) !== start_step) {
      let numberOfLineToDraw = Math.min(end_step, max_step - 1) - start_step; // 比如[345,346],还需要画1根线
      let widthBetweenToLines = chartWidth / (numberOfLineToDraw + 1);

      for (let i = 1; i <= numberOfLineToDraw; i++) {
        let xPos = margin.left + widthBetweenToLines * i;
        // 长度为 chartHeight
        svg.append("text")
          .attr("class", "layerLevel-detailInfo-text")
          .text(`${start_step + i}`)
          .attr("x", xPos)
          .attr("y", margin.top - 2)
          .attr("text-anchor", "middle");

        svg.append("line")
          .attr("class", "layerLevel-detailInfo-yAxisLine")
          .attr("x1", xPos)
          .attr("y1", margin.top)
          .attr("x2", xPos)
          .attr("y2", margin.top + chartHeight);
      }
    }
    focus
      .append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(yScale));

    let yGrid = focus.append("g").attr("class", "detailLineChart-grid");
    yGrid.selectAll("path.domain").remove();  // 删除横线。

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
        <span>
          {"数据实例指标变化图 (层: " + `${nodeMap[selectedNodeId].displayedName}` + " 迭代: " + `${start_step}` + "-" + `${end_step}` + ")"}
        </span>
      </div>

      <svg
        style={{ height: chartAreaHeight + "px", width: "100%" }}
        ref={svgRef}>
        <g >
          <rect
            className="layerLevel-detailInfo-zoom"
            width={chartWidth}
            height={chartHeight}
            transform={`translate(${margin.left},${margin.top})`}
          />
        </g>
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