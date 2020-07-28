import React, { useEffect, useState, useRef, useCallback } from "react";
import * as d3 from 'd3';
import {
  useGlobalStates,
  modifyGlobalStates,
} from "../../store/global-states";
import { GlobalStatesModificationType, ShowActivationOrGradient } from "../../store/global-states.type";
import { fetchActivations, fetchNodeScalars } from '../../api/layerlevel';
import { isWidthDown } from "@material-ui/core";
import { LineChart } from "../LineCharts";

interface Props {
  svgWidth: number,
  svgHeight: number
  layerNodeId: string,
}

interface Point {
  x: number;
  y: number;
}

interface layerNodeScalar {
  "step": number,
  "activation_min": number,
  "activation_max": number,
  "activation_mean": number,
  "gradient_min": number,
  "gradient_max": number,
  "gradient_mean": number
}

const LineGroup: React.FC<Props> = (props: Props) => {
  const { svgWidth, svgHeight, layerNodeId } = props;
  const { currentStep, max_step, currentMSGraphName, showActivationOrGradient } = useGlobalStates();
  const svgRef = useRef();
  const [cursorLinePos, setCursorLinePos] = useState(null);

  const margin = { top: 10, right: 10, bottom: 20, left: 23 };
  const lineChartSize = {
    height: svgHeight - margin.top - margin.bottom,
    width: svgWidth - margin.left - margin.right
  };

  const stepNumberInLayernode = 21;
  const getStartStepAndEndStep = () => {
    let endStep = 0;
    let startStep = 0;
    let halfOfStepNumberInLayernode = Math.floor(stepNumberInLayernode / 2);
    if (!currentStep) { // 当没有选中某个step的时候，折线图跟随着max_step变化
      endStep = max_step;
      startStep = (max_step - stepNumberInLayernode >= 1 ? max_step - stepNumberInLayernode : 1);
    } else { // 如果选中某个step, 则显示他的前面halfOfStepNumberInLayernode个，后面halfOfStepNumberInLayernode个
      startStep = (currentStep - halfOfStepNumberInLayernode >= 1 ? currentStep - halfOfStepNumberInLayernode : 1);
      endStep = (currentStep + halfOfStepNumberInLayernode > max_step ? max_step : currentStep + halfOfStepNumberInLayernode);
    }

    return [startStep, endStep];
  }

  useEffect(() => {
    if (layerNodeId === "" || !layerNodeId) return;
    const [startStep, endStep] = getStartStepAndEndStep();
    getNodeScalars(currentMSGraphName, [layerNodeId], startStep, endStep);
  }, [layerNodeId, currentStep, max_step])

  const getNodeScalars = async (graphName, nodeIds, startStep, endStep) => {
    let data = await fetchNodeScalars({ graph_name: graphName, node_id: nodeIds, start_step: startStep, end_step: endStep });
    let nodeScalars = data.data.data;

    let max: Point[] = [], min: Point[] = [], mean: Point[] = []; // 每一维数据格式是 {x: step, y: value}
    let nodeScalar = nodeScalars[nodeIds[0]] as layerNodeScalar[];
    if (showActivationOrGradient === ShowActivationOrGradient.ACTIVATION)
      for (let scalar of nodeScalar) {
        max.push({ x: scalar.step, y: scalar.activation_max });
        min.push({ x: scalar.step, y: scalar.activation_min });
        mean.push({ x: scalar.step, y: scalar.activation_mean });
      }
    else if (showActivationOrGradient === ShowActivationOrGradient.GRADIENT)
      for (let scalar of nodeScalar) {
        max.push({ x: scalar.step, y: scalar.gradient_max });
        min.push({ x: scalar.step, y: scalar.gradient_min });
        mean.push({ x: scalar.step, y: scalar.gradient_mean });
      }
    let dataArrToShow = [];
    dataArrToShow.push({ id: "Max", data: max, color: "#C71585" })
    dataArrToShow.push({ id: "Min", data: min, color: "#DC143C" })
    dataArrToShow.push({ id: "Mean", data: mean, color: "#4B0082" })

    if (dataArrToShow.length === 0) return;
    let minY = Infinity, maxY = -Infinity; // 二维数组中的最大最小值
    for (let i = 0; i < dataArrToShow.length; i++) {
      let LineData: Point[] = dataArrToShow[i].data;
      for (let j = 1; j < max_step; j++) {
        let point: Point = LineData[j];
        if (!point) continue;
        minY = Math.min(minY, point.y);
        maxY = Math.max(maxY, point.y);
      }
    }

    // 以上是数据获取
    // 以下是画折线图部分
    const bisect = d3.bisector((d: any) => d.x).left;
    //拿第一组数据查询
    const dataExample = dataArrToShow[0];

    let focus = d3.select(svgRef.current).select("g.layerNodeInnerLineChart");
    let svg = d3.select(svgRef.current);
    svg.selectAll("rect.layerNodeInnerLineChart-zoom").remove();
    focus.selectAll(".area").remove(); // 清除原折线图
    focus.selectAll(".axis--y").remove(); // 清除原来的坐标
    focus.selectAll(".axis--x").remove(); // 清除原来的坐标

    let XScale = d3.scaleLinear()
      .rangeRound([0, lineChartSize.width])
      .domain([startStep, endStep]);

    setCursorLinePos(XScale(currentStep));

    let focusAreaYScale = d3.scaleLinear()
      .rangeRound([lineChartSize.height, 0])
      .domain([minY, maxY]);

    const focusAreaLineGenerator = d3
      .line<Point>()
      .curve(d3.curveMonotoneX)
      .x((d) => XScale(d.x))
      .y((d) => focusAreaYScale(d.y))

    for (let i = 0; i < dataArrToShow.length; i++) {
      let data = dataArrToShow[i];
      focus
        .append("path")
        .datum(data.data)
        .attr("class", "area")
        .attr("transform", "translate(0,0)")
        .attr("d", focusAreaLineGenerator)
        .attr("fill", "none")
        .attr("stroke", data.color);
    }

    focus
      .append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + lineChartSize.height + ")")
      .call(d3.axisBottom(XScale).ticks(5).tickSize(3).tickPadding(2))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("font-size", 7)
      .style("text-anchor", "end")

    focus
      .append("g")
      .attr("class", "axis axis--y")
      .attr("transform", "translate(0,0)")
      .call(d3.axisLeft(focusAreaYScale).tickFormat(d3.format(".2")).ticks(5).tickSize(3).tickPadding(10))
      .selectAll("text")
      .style("font-size", 7)

    // svg.append("rect")
    //   .attr("class", "layerNodeInnerLineChart-zoom")
    //   .attr("width", lineChartSize.width)
    //   .attr("height", lineChartSize.height)
    //   .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    //   .attr("opacity", 0);

    // d3.select(svgRef.current)
    //   .select("rect.layerNodeInnerLineChart-zoom")
    //   .on("mousemove", function () {
    //     let mouseX = d3.mouse((this as any) as SVGSVGElement)[0];
    //     let x = XScale.invert(mouseX);
    //     let _index = bisect(dataExample.data, x, 1);

    //     if (_index === stepNumberInLayernode - 1) _index = stepNumberInLayernode - 2;
    //     let index =
    //       Math.abs(x - dataExample.data[_index - 1].x) < Math.abs(dataExample.data[_index].x - x)
    //         ? _index - 1
    //         : _index;
    //     let clickNumber = dataExample.data[index].x;

    //     setCursorLinePos(XScale(clickNumber));
    //   })
    //   .on("mouseleave", function () {
    //     setCursorLinePos(null);
    //   })
    //   .on("click", function () {
    //     let mouseX = d3.mouse((this as any) as SVGSVGElement)[0];
    //     let x = XScale.invert(mouseX);
    //     let _index = bisect(dataExample.data, x, 1);

    //     if (_index === stepNumberInLayernode - 1) _index = stepNumberInLayernode - 2;
    //     let index =
    //       Math.abs(x - dataExample.data[_index - 1].x) < Math.abs(dataExample.data[_index].x - x)
    //         ? _index - 1
    //         : _index;
    //     let clickNumber = dataExample.data[index].x;

    //     modifyGlobalStates(
    //       GlobalStatesModificationType.SET_CURRENT_STEP,
    //       clickNumber
    //     );
    //     setCursorLinePos(XScale(clickNumber));
    //   });
  }

  return (
    <div>
      <svg style={{ width: svgWidth, height: svgHeight }} ref={svgRef}>
        <g
          className="layerNodeInnerLineChart"
          transform={`translate(${margin.left},${margin.top})`}
        >
          {cursorLinePos !== null && (
            <line
              x1={cursorLinePos}
              x2={cursorLinePos}
              y1={lineChartSize.height}
              y2={0}
              style={{
                stroke: "grey",
                strokeWidth: 1,
              }}
            />
          )}
        </g>
        {/* <rect
          className="layerNodeInnerLineChart-zoom"
          width={lineChartSize.width}
          height={lineChartSize.height}
          transform={`translate(${margin.left},${margin.top})`}
          style={{ opacity: 0 }}
        /> */}
      </svg>
    </div>
  );
}
export default LineGroup;