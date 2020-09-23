import React, { useEffect, useState, Children, useRef, useCallback } from "react";
import "./layerLevel.css";
import * as d3 from "d3";
import { useLineData } from "../../store/layerLevel";
import { useHistory } from "react-router-dom";
import DetailLineChart from "./DetailLineChart";
import ActivationOrGradientChart from "./ActivationOrGradientChart";
import ClusterGraph from "./ClusterGraph";
import {
  fetchLayerScalars
} from "../../api/layerlevel";
import { ShowActivationOrGradient } from "../../store/global-states.type";
import { useGlobalStates } from "../../store/global-states";
import { useProcessedGraph } from "../../store/processedGraph";
import { LayerNodeImp } from "../../common/graph-processing/stage2/processed-graph";
import { FindChildNodeUnderLayerNode } from "./FindChildNodeUnderLayerNode";
import * as _ from 'lodash';

interface layerNodeScalar {
  step: number;
  activation_min: number;
  activation_max: number;
  activation_mean: number;
  gradient_min: number;
  gradient_max: number;
  gradient_mean: number;
}
export interface Point {
  x: number;
  y: number;
}

export interface LayerScalar {
  step: number;
  batch: number;
  batchSize: number;
  maximum: number;
  upperBoundary: number;
  Q3: number;
  median: number;
  mean: number;
  Q1: number;
  lowerBoundary: number;
  minimumn: number;
}


export interface DataToShow {
  id: string;
  data: Point[];
  color: string;
}

const drawChartArea = (svgPart: any, scalarsData: LayerScalar[], xScale: any, yScale: any, batchSize: number): void => {
  svgPart.selectAll(".area").remove(); // 清除原折线图
  // Q1 - Q3部分
  const focusAreaQ1Q3LineGenerator = d3
    .area<LayerScalar>()
    .curve(d3.curveMonotoneX)
    .x((d) => xScale((d.step - 1) * batchSize + d.batch))
    .y0((d) => yScale(d.Q1))
    .y1((d) => yScale(d.Q3));

  svgPart
    .append("path")
    .datum(scalarsData)
    .attr("class", "area")
    .attr("fill", "#69b3a2")
    .attr("fill-opacity", .5)
    .attr("stroke", "none")
    .attr("d", focusAreaQ1Q3LineGenerator);

  // lowerBoundary - upperBoundary区域
  const focusAreaBoundaryLineGenerator = d3
    .area<LayerScalar>()
    .curve(d3.curveMonotoneX)
    .x((d) => xScale((d.step - 1) * batchSize + d.batch))
    .y0((d) => yScale(d.lowerBoundary))
    .y1((d) => yScale(d.upperBoundary));

  svgPart
    .append("path")
    .datum(scalarsData)
    .attr("class", "area")
    .attr("fill", "#69b3a2")
    .attr("fill-opacity", .5)
    .attr("stroke", "none")
    .attr("d", focusAreaBoundaryLineGenerator);

  // median 折线
  const focusAreaMedianLineGenerator = d3
    .line<LayerScalar>()
    .curve(d3.curveMonotoneX)
    .x((d) => xScale((d.step - 1) * batchSize + d.batch))
    .y((d) => yScale(d.median))

  svgPart
    .append("path")
    .datum(scalarsData)
    .attr("class", "area")
    .attr("d", focusAreaMedianLineGenerator)
    .attr("fill", "none")
    .attr("stroke", "blue");
}

const drawFocusAreaYAxisAndGrid = (focusPart: any, focusAreaYScale: any, width: number): void => { // 绘制focus部分的坐标轴 和 平行的网格
  focusPart.select('.focus-axis').select(".axis--y").selectAll("line").remove(); // 删除原来的网格线
  focusPart.select('.focus-axis').selectAll(".axis--y").remove(); // 清除原来的坐标

  focusPart
    .select('.focus-axis')
    .append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(focusAreaYScale));

  focusPart.select('g.grid')
    .call(d3.axisLeft(focusAreaYScale).tickSize(-width))
    .selectAll("text")
    .style("opacity", "0");
}

const LayerLevel: React.FC = () => {
  const linedata = useLineData();
  const history = useHistory();
  const goback = () => {
    history.push("/");
  };

  const processedGraph = useProcessedGraph();
  const { nodeMap } = processedGraph;

  const {
    selectedNodeId,
    showActivationOrGradient,
    currentMSGraphName,
    isTraining,
    maxStep,
    currentStep,
  } = useGlobalStates();

  const svgRef = useRef();
  const [svgHeight, setSvgHeight] = useState(270);
  const [svgWidth, setSvgWidth] = useState(1800);

  const [showDomain, setShowDomain] = useState(null);
  const [childNodeId, setChildNodeId] = useState(null);
  const [layerScalarsData, setLayerScalarsData] = useState<LayerScalar[]>(null);
  const [LoadingData, setLoadingData] = useState(false);

  const measuredRef = useCallback((node) => {
    if (node !== null) {
      setSvgHeight(node.getBoundingClientRect().height);
      setSvgWidth(node.getBoundingClientRect().width);
    }
  }, []);

  const margin = { top: 10, left: 30, bottom: 10, right: 30 };
  const gapHeight = 20; // 上下折线图之间的距离
  const width = svgWidth - margin.left - margin.right;
  const height = (svgHeight - margin.top - margin.bottom - gapHeight * 2) * 5 / 6;
  const margin2 = { top: height + margin.top + gapHeight, left: margin.left };
  const height2 = (svgHeight - margin.top - margin.bottom - gapHeight * 2) * 1 / 6; // 上下折线图比例是 5: 1

  const fetchDataType =
    showActivationOrGradient === ShowActivationOrGradient.ACTIVATION
      ? "activation"
      : "gradient";

  useEffect(() => {
    if (!(nodeMap[selectedNodeId] instanceof LayerNodeImp)) return; // 不是layerNode

    let _childNodeId = FindChildNodeUnderLayerNode(nodeMap, selectedNodeId); // findChildNodeId(selectedNodeId);
    if (_childNodeId.length === 0) return;
    _childNodeId = _childNodeId.slice(0, 1); // 目前截取找出的第一个元素
    setChildNodeId(_childNodeId);
  }, [selectedNodeId]);

  useEffect(() => {
    if (!childNodeId) return;
    getLayerScalars(currentMSGraphName, childNodeId, 1, 51, fetchDataType); // 取[1, 11) step
  }, [
    childNodeId,
    currentMSGraphName,
    isTraining,
    maxStep,
    showActivationOrGradient,
  ]);

  useEffect(() => {
    if (layerScalarsData === null || !(nodeMap[selectedNodeId] instanceof LayerNodeImp)) return;
    computeAndDraw();
  }, [layerScalarsData, svgWidth])

  const computeAndDraw = () => {
    let focus = d3.select(svgRef.current).select("g.focus");

    let batchSize = layerScalarsData[0].batchSize; // batch大小
    let minY = Infinity, maxY = -Infinity; // 二维数组中的最大最小值
    for (let i = 0; i < layerScalarsData.length; i++) {
      let tmp = layerScalarsData[i];
      minY = Math.min(minY, tmp.lowerBoundary);
      maxY = Math.max(maxY, tmp.upperBoundary);
    }

    let minStep = Infinity, maxStep = -Infinity;
    for (let item of layerScalarsData) {
      const { step } = item;
      minStep = Math.min(minStep, step);
      maxStep = Math.max(maxStep, step);
    }

    let x1Scale = d3.scaleLinear()
      .rangeRound([0, width])
      .domain([1, layerScalarsData.length]);

    let x1OtherScale = d3.scaleLinear()
      .rangeRound([0, width])
      .domain([minStep, maxStep]);

    let x2Scale = d3.scaleLinear()
      .rangeRound([0, width])
      .domain([1, layerScalarsData.length]);

    let x2OtherScale = d3.scaleLinear()
      .rangeRound([0, width])
      .domain([minStep, maxStep]);

    let focusAreaYScale = d3.scaleLinear()
      .rangeRound([height, 0])
      .domain([minY, maxY]);

    drawChartArea(focus.select(".focus-axis"), layerScalarsData, x1Scale, focusAreaYScale, batchSize);

    focus.select('.focus-axis').selectAll(".axis--x").remove(); // 清除原来的坐标

    const xTicksValues = [];
    for (let i = minStep; i <= maxStep; i++) {
      xTicksValues.push(i);
    }

<<<<<<< HEAD
    const focusAxisX = d3.axisBottom(x1OtherScale).ticks(xTicksValues.length).tickValues(xTicksValues).tickFormat(d3.format(".0f")).tickSizeOuter(0);
    const contextAxisX = d3.axisBottom(x2OtherScale).ticks(xTicksValues.length).tickValues(xTicksValues).tickFormat(d3.format(".0f"));
=======
    const focusAxisX =
      d3.axisBottom(x1OtherScale)
        .ticks(xTicksValues.length)
        .tickValues(xTicksValues)
        .tickFormat(d3.format(".0f"));

    const contextAxisX =
      d3.axisBottom(x2OtherScale)
        .ticks(xTicksValues.length)
        .tickValues(xTicksValues)
        .tickFormat(d3.format(".0f"));
>>>>>>> fix: 增加交互

    // 增加坐标和横线
    focus
      .select('.focus-axis')
      .append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(focusAxisX);

    drawFocusAreaYAxisAndGrid(focus, focusAreaYScale, width); // 绘制横线和Y坐标

    // --------------------context部分-----------------------------
    let context = d3.select(svgRef.current).select("g.context");
    context.selectAll(".brush").remove();

    let contextAreaYScale = d3.scaleLinear()
      .rangeRound([height2, 0])
      .domain([minY, maxY]);

    const brushHandler = () => {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
      if (!(d3.event.sourceEvent instanceof MouseEvent)) return
      let s = d3.event.selection || x2OtherScale.range();
      const domain = s.map(x2OtherScale.invert, x2OtherScale);
      const tempDomain = domain.map(x1OtherScale).map(x1Scale.invert);
      x1OtherScale.domain(domain);
      x1Scale.domain(tempDomain);
      setShowDomain(domain); // 设定brush选定显示区域的domain;
      // const domain = s.map(x2Scale.invert, x2Scale);
      drawChartArea(focus.select(".focus-axis"), layerScalarsData, x1Scale, focusAreaYScale, batchSize);
      drawFocusAreaYAxisAndGrid(focus, focusAreaYScale, width);
      const xTicksValues = [];
      for (let i = domain[0]; i <= domain[1]; i++) {
        xTicksValues.push(i);
      }

      focus
        .select('.focus-axis')
        .select('.axis--x')
        .call(focusAxisX.ticks(xTicksValues.length).tickValues(xTicksValues));
    };

    const brushEnd = () => {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
      if (!(d3.event.sourceEvent instanceof MouseEvent)) return
      let s = d3.event.selection || x2OtherScale.range();
      const domain = s.map(x2OtherScale.invert, x2OtherScale);
      domain[0] = _.round(domain[0]);
      domain[1] = _.round(domain[1]);
      if (domain[0] === domain[1]) {
        // 临界值处理，如果domain[0]此时为maxStep
        if (domain[0] === maxStep) {
          domain[0] -= 1;
        }
        else {
          domain[1] += 1;
        }
      }
      const tempDomain = domain.map(x1OtherScale).map(x1Scale.invert);
      x1OtherScale.domain(domain);
      x1Scale.domain(tempDomain);
      setShowDomain(domain); // 设定brush选定显示区域的domain;
      const xTicksValues = [];
      for (let i = domain[0]; i <= domain[1]; i++) {
        xTicksValues.push(i);
      }
      context.select('g.brush').call(brush.move, domain.map(x2OtherScale));

      focus
        .select('.focus-axis')
        .select('.axis--x')
        .call(focusAxisX.ticks(xTicksValues.length).tickValues(xTicksValues));

      // 以当前选择的step之间的最大最小值重新更改 focusAreaYScale
      // i.g. domain = [11, 23]， 显示的step包括 [11, 22]，
      // 对应layerScalarsData中的 [batchSize * (11-1), batchSize * (23-1) - 1]
      let tmpMinY = Infinity, tmpMaxY = -Infinity;
      for (let i = batchSize * (domain[0] - 1); i <= batchSize * (domain[1] - 1) - 1; i++) {
        let scalar = layerScalarsData[i];
        tmpMinY = Math.min(tmpMinY, scalar.lowerBoundary);
        tmpMaxY = Math.max(tmpMaxY, scalar.upperBoundary);
      }

      let tmpFocusAreaYScale = d3.scaleLinear()
        .rangeRound([height, 0])
        .domain([tmpMinY, tmpMaxY]);

      drawChartArea(focus.select(".focus-axis"), layerScalarsData, x1Scale, tmpFocusAreaYScale, batchSize);
      drawFocusAreaYAxisAndGrid(focus, tmpFocusAreaYScale, width);
    };

    const brushStart = () => {
    }

    const brush = d3.brushX()
      .extent([
        [0, 0],
        [width, height2],
      ])
      .on("start", brushStart)
      .on("brush", brushHandler)
      .on('end', brushEnd);

    let showRange = []; // 根据 x2Scale 和 showDomain，推算出 showRange;
    if (showDomain === null)
      showRange = x2Scale.range();
    else
      showRange = [x2Scale(showDomain[0]), x2Scale(showDomain[1])];

    const brushSelection = context
      .append('g')
      .attr('class', 'brush')
      .call(brush)
      .call(brush.move, showRange);

    drawChartArea(context, layerScalarsData, x2Scale, contextAreaYScale, batchSize);

    context.selectAll(".axis--x").remove();
    context
      .append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height2 + ")")
      .call(contextAxisX);

    brushSelection.raise();

    // 交互部分：
    const bisect = d3.bisector((d: any) => (d.step - 1) * batchSize + d.batch).left;

    let zoomPart = d3.select(svgRef.current).select("rect.zoom");
    zoomPart.on("mousemove", function () {
      let mouseX = d3.mouse((this as any) as SVGSVGElement)[0];
      let mouseY = d3.mouse((this as any) as SVGSVGElement)[1];

      let x = x1Scale.invert(mouseX);
      console.log(x);

      let _index = bisect(layerScalarsData, x, 1);
      console.log(_index);
      _index = _index === 0 ? 1 : _index;


    });
    zoomPart.on("mouseleave", function () {

    });
    zoomPart.on("click", function () {

    })
  };

  const getLayerScalars = async (
    graphName,
    nodeIds,
    startStep,
    endStep,
    type
  ) => {
    setLoadingData(true);
    await fetchLayerScalars({
      graph_name: graphName,
      node_id: nodeIds,
      start_step: startStep,
      end_step: endStep,
      type: type,
    }).then((res) => {
      if (res.data.message === "success") {
        setLoadingData(false);
        let layerScalars = res.data.data[nodeIds[0]];
        setLayerScalarsData(layerScalars);
      } else {
        console.log("获取layer数据失败：" + res.data.message);
      }
    })

  };

  return (
    <div className="layerLevel" ref={measuredRef}>
      {nodeMap[selectedNodeId] instanceof LayerNodeImp && (
        <div className="layer-container">
          <svg style={{ height: svgHeight, width: svgWidth }} ref={svgRef}>
            <defs>
              <clipPath id={"layerLevel-clip"}>
                <rect width={width} height={height} />
              </clipPath>
            </defs>
            <g
              className="focus"
              transform={`translate(${margin.left},${margin.top})`}
            >
              <g className="grid"></g>
              <g className="focus-axis"></g>
            </g>
            <g
              className="context"
              transform={`translate(${margin2.left},${margin2.top})`}
            ></g>
            <rect
              className="zoom"
              width={width}
              height={height}
              transform={`translate(${margin.left},${margin.top})`}
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default LayerLevel;
