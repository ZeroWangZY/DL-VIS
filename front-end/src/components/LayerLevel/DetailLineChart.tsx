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
  nodeTensors: Array<Array<number>>;
  start_step: number;
  end_step: number;
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
  const margin = { top: 4, left: 40, bottom: 5, right: 40 };// chart与外层之间的margin
  const chartHeight = chartAreaHeight - margin.top - margin.bottom; // chart的高度
  const chartWidth = svgWidth - margin.left - margin.right;

  useEffect(() => {
    if (!nodeTensors || nodeTensors.length === 0 || start_step < 0) return;

    console.log(start_step, end_step, nodeTensors);

    let totalSteps = nodeTensors.length;


    for (let i = 0; i < totalSteps; i++) {
      let tensor = nodeTensors[i];
    }


    let svg = d3.select(svgRef.current);
    let xScale = d3.scaleLinear()
      .domain([start_step, end_step])
      .range([0, chartWidth]);

    // add the X gridlines
    // svg.append("g")
    //   .attr("class", "detailLineChart-grid")
    //   .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    //   .call(d3.axisBottom(xScale).tickSize(-chartHeight))
    //   .selectAll("text")
    //   .style("opacity", "1")

  }, [nodeTensors])

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

      </svg>
    </div>
  );
}
export default DetailLineChart;