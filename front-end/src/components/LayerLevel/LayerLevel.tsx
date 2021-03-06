import React, { useEffect, useState, Children, useRef, useCallback } from "react";
import "./layerLevel.css";
import * as d3 from "d3";
import { useLineData } from "../../store/layerLevel";
import { useHistory } from "react-router-dom";
import TensorHeatmap, {
  TensorMetadata,
} from "./TensorHeatmap";
import RadarChart from "./RadarChart";
import {
  fetchNodeScalars
} from "../../api/layerlevel";
import { ShowActivationOrGradient } from "../../store/global-states.type";
import { useGlobalConfigurations } from "../../store/global-configuration"
import { useGlobalStates } from "../../store/global-states";
import { useProcessedGraph } from "../../store/processedGraph";
import { LayerNodeImp, LayerType } from "../../common/graph-processing/stage2/processed-graph";
import { FindChildNodeUnderLayerNode } from "./FindChildNodeUnderLayerNode";
import * as _ from 'lodash';
import { makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import { template } from "@babel/core";

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
  dataIndex: number;
  maximum: number;
  Q3: number;
  median: number;
  mean: number;
  Q1: number;
  minimum: number;
}

export interface DataToShow {
  id: string;
  data: Point[];
  color: string;
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

const swapArrayElement = (s: [], a: number, b: number): void => {
  let temp = s[a];
  s[a] = s[b];
  s[b] = temp;
}

const useStyles = makeStyles((theme) => ({
  paper: {
    backgroundColor: theme.palette.background.paper,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
}));

const LayerLevel: React.FC = () => {
  const linedata = useLineData();
  const classes = useStyles();
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
  const [svgHeight, setSvgHeight] = useState(280);
  const [svgWidth, setSvgWidth] = useState(1800);
  const [cursorLinePos, setCursorLinePos] = useState(null);
  const [mouseXPos, setMouseXPos] = useState(null);

  const [stepBrushed, setStepBrushed] = useState(null);
  const [newSelectedNodeId, setNewSelectedNodeId] = useState(null);
  const [layerScalarsData, setLayerScalarsData] = useState<LayerScalar[]>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [drawing, setDrawing] = useState(false);

  const [DetailInfoOfCurrentStep, setDetailInfoOfCurrentStep] = useState([]);
  const [isShowingTensorHeatmap, setIsShowingTensorHeatmap] = useState<boolean>(
    false
  );
  const [isShowingRadarChart, setIsShowingRadarChart] = useState<boolean>(false);
  const [selectedTensor, setSelectedTensor] = useState<TensorMetadata>({
    type: showActivationOrGradient,
    step: null,
    dataIndex: null,
    nodeId: null
  });
  const [fetchDataType, setFetchDataType] = useState<string>(null);
  const [anchorPosition, setAnchorPosition] = useState<{ top: number, left: number }>(null); // popover的位置
  const [batchSize, setBatchSize] = useState<number>(1);

  const { dataMode } = useGlobalConfigurations();

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

  useEffect(() => {
    if (!(nodeMap[selectedNodeId] instanceof LayerNodeImp)) return; // 不是layerNode

    if (selectedNodeId.indexOf("dense") !== -1 || selectedNodeId.indexOf("Dense") !== -1) {
      let _childNodeId = FindChildNodeUnderLayerNode(nodeMap, selectedNodeId); // findChildNodeId(selectedNodeId);
      if (_childNodeId.length === 0) return;
      _childNodeId = _childNodeId.slice(0, 1); // 目前截取找出的第一个元素
      setNewSelectedNodeId(_childNodeId);
    } else {
      let newNodeId = selectedNodeId.split("/").splice(3).join(".");
      let idx = newNodeId.indexOf("_copy");
      if (idx !== -1)
        newNodeId = newNodeId.slice(0, idx);
      setNewSelectedNodeId(newNodeId);
    }
    const _fetchDataType =
      showActivationOrGradient === ShowActivationOrGradient.ACTIVATION
        ? "activation"
        : "gradient";
    setFetchDataType(_fetchDataType);
  }, [selectedNodeId, showActivationOrGradient]);

  useEffect(() => {
    if (!newSelectedNodeId) return;
    setLoadingData(true);
    fetchNodeScalars({
      graph_name: currentMSGraphName,
      node_id: [newSelectedNodeId],
      start_step: 1,
      end_step: maxStep,
      type: fetchDataType,
      mode: dataMode,
    }).then((res) => {
      if (res.data.message === "success") {
        setLoadingData(false);
        let layerScalars = res.data.data[newSelectedNodeId];
        setLayerScalarsData(layerScalars);

        let _batchSize = 1;
        for (let i = 1; i < layerScalars.length; i++) {
          if (layerScalars[i].dataIndex < layerScalars[i - 1].dataIndex) {
            _batchSize = layerScalars[i - 1].dataIndex + 1;
            break;
          }
        }
        setBatchSize(_batchSize);
      } else {
        console.log("获取layer数据失败：" + res.data.message);
      }
    })

  }, [
    newSelectedNodeId,
    currentMSGraphName,
    isTraining,
    fetchDataType
  ]);

  useEffect(() => {
    if (!newSelectedNodeId || !layerScalarsData) return;
    setLoadingData(true);
    let _startStep = layerScalarsData[layerScalarsData.length - 1].step + 1;
    fetchNodeScalars({
      graph_name: currentMSGraphName,
      node_id: [newSelectedNodeId],
      start_step: _startStep,
      end_step: maxStep,
      type: fetchDataType,
      mode: dataMode,
    }).then((res) => {
      if (res.data.message === "success") {
        setLoadingData(false);
        let layerScalars = res.data.data[newSelectedNodeId];

        setLayerScalarsData(layerScalarsData.concat(layerScalars));
      } else {
        console.log("获取layer数据失败：" + res.data.message);
      }
    })

  }, [maxStep])

  useEffect(() => {
    if (!layerScalarsData || !(nodeMap[selectedNodeId] instanceof LayerNodeImp)) return;
    setDrawing(true);
    computeAndDraw();
    setDrawing(false);
  }, [layerScalarsData, svgWidth, batchSize])

  const computeAndDraw = () => {
    let focus = d3.select(svgRef.current).select("g.focus");

    let layerScalarsDataDomain = [1, layerScalarsData.length];

    // 
    let _stepBrushed = stepBrushed;
    if (stepBrushed !== null) {
      _stepBrushed = [Math.round(stepBrushed[0]), Math.round(stepBrushed[1])];
      layerScalarsDataDomain = [(_stepBrushed[0] - 1) * batchSize + 1, (_stepBrushed[1] - 1) * batchSize + 1];
    }

    let minY = Infinity, maxY = -Infinity; // 二维数组中的最大最小值
    for (let i = layerScalarsDataDomain[0]; i < Math.min(layerScalarsDataDomain[1], layerScalarsData.length); i++) {
      let tmp = layerScalarsData[i];
      minY = Math.min(minY, tmp.minimum);
      maxY = Math.max(maxY, tmp.maximum);
    }

    let x1Scale = d3.scaleLinear()
      .rangeRound([0, width])
      .domain(layerScalarsDataDomain);

    let x1OtherScale = d3.scaleLinear()
      .rangeRound([0, width])
      .domain(_stepBrushed === null ? [1, maxStep] : _stepBrushed);

    let x2Scale = d3.scaleLinear()
      .rangeRound([0, width])
      .domain([1, layerScalarsData.length]);

    let x2OtherScale = d3.scaleLinear()
      .rangeRound([0, width])
      .domain([1, maxStep]);

    const YDoamin = { minY: minY, maxY: minY };

    let focusAreaYScale = d3.scaleLinear()
      .rangeRound([height, 0])
      .domain([YDoamin.minY, YDoamin.maxY]);

    const xTicksValues = []; // 坐标
    console.log("重新绘制");
    if (_stepBrushed === null) {
      drawChartArea(focus.select(".focus-axis"), layerScalarsData, x1Scale, focusAreaYScale, batchSize, YDoamin, [1, maxStep], [1, layerScalarsData.length], true);
      produceXTicks(xTicksValues, 1, maxStep);
    }
    else {
      // const tempDomain = [(stepBrushed[0] - 1) * batchSize + 1, (stepBrushed[1] - 1) * batchSize + 1];
      drawChartArea(focus.select(".focus-axis"), layerScalarsData, x1Scale, focusAreaYScale, batchSize, YDoamin, _stepBrushed, layerScalarsDataDomain, true);
      produceXTicks(xTicksValues, _stepBrushed[0], _stepBrushed[1]);
    }

    const focusAxisX =
      d3.axisBottom(x1OtherScale)
        .ticks(xTicksValues.length)
        .tickValues(xTicksValues)
        .tickFormat(d3.format(".0f"));

    const xTicksValues1 = [];
    produceXTicks(xTicksValues1, 1, maxStep);
    const contextAxisX =
      d3.axisBottom(x2OtherScale)
        .ticks(xTicksValues1.length)
        .tickValues(xTicksValues1)
        .tickFormat(d3.format(".0f"));

    // 增加坐标和横线
    focus.select('.focus-axis').selectAll(".axis--x").remove(); // 清除原来的坐标
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
      let s = d3.event.selection || x2OtherScale.range(); // s是刷选的实际范围
      if (s[1] < s[0]) swapArrayElement(s, 0, 1);
      const domain = s.map(x2OtherScale.invert); // 准确的刷选的step(带小数)
      const tempDomain = [(domain[0] - 1) * batchSize + 1, (domain[1] - 1) * batchSize + 1]// domain.map(x1OtherScale).map(x1Scale.invert);

      x1OtherScale.domain(domain);
      x1Scale.domain(tempDomain);
      setStepBrushed(domain); // 设定brush选定显示区域的domain;
      drawChartArea(focus.select(".focus-axis"), layerScalarsData, x1Scale, focusAreaYScale, batchSize, YDoamin, domain, tempDomain, false);

      drawFocusAreaYAxisAndGrid(focus, focusAreaYScale, width);
      const xTicksValues = [];
      produceXTicks(xTicksValues, domain[0], domain[1]);

      focus
        .select('.focus-axis')
        .select('.axis--x')
        .call(focusAxisX.ticks(xTicksValues.length).tickValues(xTicksValues));
    };

    const brushEnd = () => {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
      if (!(d3.event.sourceEvent instanceof MouseEvent)) return
      let s = d3.event.selection || x2OtherScale.range();
      if (s[1] < s[0]) swapArrayElement(s, 0, 1);

      const domain = s.map(x2OtherScale.invert); // 准确的刷选的step(带小数)

      domain[0] = Math.round(domain[0]); // 四舍五入
      domain[1] = Math.round(domain[1]);

      if (domain[0] === domain[1]) {
        // 临界值处理，如果domain[0]此时为maxStep
        if (domain[0] === maxStep) {
          domain[0] -= 1;
        }
        else {
          domain[1] += 1;
        }
      }

      if (!(domain[0] === x1OtherScale.domain()[0] && domain[1] == x1OtherScale.domain()[1])) { // 移动brush
        const tempDomain = [(domain[0] - 1) * batchSize + 1, (domain[1] - 1) * batchSize + 1] // domain.map(x1OtherScale).map(x1Scale.invert).map(Math.round);
        x1OtherScale.domain(domain);
        x1Scale.domain(tempDomain);
        setStepBrushed(domain); // 设定brush选定显示区域的domain;
        const xTicksValues = [];
        produceXTicks(xTicksValues, domain[0], domain[1]);
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
          tmpMinY = Math.min(tmpMinY, scalar.minimum);
          tmpMaxY = Math.max(tmpMaxY, scalar.maximum);
        }

        let tmpFocusAreaYScale = d3.scaleLinear()
          .rangeRound([height, 0])
          .domain([tmpMinY, tmpMaxY]);

        drawChartArea(focus.select(".focus-axis"), layerScalarsData, x1Scale, tmpFocusAreaYScale, batchSize, YDoamin, domain, tempDomain, true);
        drawFocusAreaYAxisAndGrid(focus, tmpFocusAreaYScale, width);
      }
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

    let showRange = []; // 根据 x2Scale 和 stepBrushed，推算出 showRange;
    if (stepBrushed === null)
      showRange = x2Scale.range();
    else
      showRange = [x2Scale(stepBrushed[0] * batchSize), x2Scale(stepBrushed[1] * batchSize)];

    const brushSelection = context
      .append('g')
      .attr('class', 'brush')
      .call(brush)
      .call(brush.move, showRange);

    drawChartArea(context, layerScalarsData, x2Scale, contextAreaYScale, batchSize, YDoamin, [1, maxStep], [1, layerScalarsData.length], false);

    context.selectAll(".axis--x").remove();
    context
      .append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height2 + ")")
      .call(contextAxisX);

    brushSelection.raise();
  };

  const drawChartArea = (svgPart: any, scalarData: LayerScalar[], xScale: any, yScale: any, batchSize: number, YDoamin: { minY: number, maxY: number }, stepDomain: number[], dataIndexDomain: number[], brushEnded: boolean): void => {
    let filteredScalarsData = scalarData;
    let sampling = false;
    if ((stepDomain[1] - stepDomain[0]) * batchSize > 640) {
      sampling = true;
      filteredScalarsData = getAverageSamplingScalarData(layerScalarsData, Math.floor(640 * scalarData.length / batchSize / (stepDomain[1] - stepDomain[0])));
    }

    // 遍历data, 找出step在 stepDomain中的最大最小值
    if (brushEnded) {
      let _minY = Infinity, _maxY = -Infinity;
      for (let d of filteredScalarsData) {
        if (stepDomain[0] <= d.step && d.step <= stepDomain[1]) {
          _minY = Math.min(_minY, d.minimum);
          _maxY = Math.max(_maxY, d.maximum);
        }
      }
      [YDoamin.minY, YDoamin.maxY] = [_minY, _maxY];
      yScale.domain([YDoamin.minY, YDoamin.maxY]);
    }
    const minY = YDoamin.minY, maxY = YDoamin.maxY;

    svgPart.selectAll(".area").remove(); // 清除原折线图
    // Q1 - Q3部分
    const focusAreaQ1Q3LineGenerator = d3
      .area<LayerScalar>()
      .curve(d3.curveMonotoneX)
      .x((d) => xScale((d.step - 1) * batchSize + ((d.dataIndex == undefined || d.dataIndex === null) ? 0 : d.dataIndex)))
      .y0((d) => yScale(d.Q1))
      .y1((d) => yScale(d.Q3));

    svgPart
      .append("path")
      .datum(filteredScalarsData)
      .attr("class", "area Q1Q3Part")
      .attr("fill", "#69b3a2")
      .attr("fill-opacity", .8)
      .attr("stroke", "none")
      .attr("d", focusAreaQ1Q3LineGenerator)
      .on("click", ClickHandler)
      .on("mousemove", MouseMoveHandler)
      .on("mouseleave", MouseLeaveHandler);

    // minimum - maximum区域
    // 分成两部分画
    const focusAreaBoundaryLineGenerator1 = d3
      .area<LayerScalar>()
      .curve(d3.curveMonotoneX)
      .x((d) => xScale((d.step - 1) * batchSize + ((d.dataIndex == undefined || d.dataIndex === null) ? 0 : d.dataIndex)))
      .y0((d) => yScale(d.minimum))
      .y1((d) => yScale(d.Q1));

    const focusAreaBoundaryLineGenerator2 = d3
      .area<LayerScalar>()
      .curve(d3.curveMonotoneX)
      .x((d) => xScale((d.step - 1) * batchSize + ((d.dataIndex == undefined || d.dataIndex === null) ? 0 : d.dataIndex)))
      .y0((d) => yScale(d.Q3))
      .y1((d) => yScale(d.maximum));

    svgPart
      .append("path")
      .datum(filteredScalarsData)
      .attr("class", "area LowerMaximumPart")
      .attr("fill", "#69b3a2")
      .attr("fill-opacity", .5)
      .attr("stroke", "none")
      .attr("d", focusAreaBoundaryLineGenerator1)
      .on("click", ClickHandler)
      .on("mousemove", MouseMoveHandler)
      .on("mouseleave", MouseLeaveHandler);

    svgPart
      .append("path")
      .datum(filteredScalarsData)
      .attr("class", "area LowerMaximumPart")
      .attr("fill", "#69b3a2")
      .attr("fill-opacity", .5)
      .attr("stroke", "none")
      .attr("d", focusAreaBoundaryLineGenerator2)
      .on("click", ClickHandler)
      .on("mousemove", MouseMoveHandler)
      .on("mouseleave", MouseLeaveHandler);

    // median 折线
    const focusAreaMedianLineGenerator = d3
      .line<LayerScalar>()
      .curve(d3.curveMonotoneX)
      .x((d) => xScale((d.step - 1) * batchSize + ((d.dataIndex == undefined || d.dataIndex === null) ? 0 : d.dataIndex)))
      .y((d) => yScale(d.median))

    svgPart
      .append("path")
      .datum(filteredScalarsData)
      .attr("class", "area medianLine")
      .attr("d", focusAreaMedianLineGenerator)
      .attr("fill", "none")
      .attr("stroke", "blue")
      .on("click", ClickHandler)
      .on("mousemove", MouseMoveHandler)
      .on("mouseleave", MouseLeaveHandler);

    // console.log(domain);
    // 外面的空白部分: outside
    const focusAreaOutsideLineGenerator1 = d3
      .area<LayerScalar>()
      .curve(d3.curveMonotoneX)
      .x((d) => xScale((d.step - 1) * batchSize + ((d.dataIndex == undefined || d.dataIndex === null) ? 0 : d.dataIndex)))
      .y0((d) => yScale(minY))
      .y1((d) => yScale(d.minimum));

    const focusAreaOutsideLineGenerator2 = d3
      .area<LayerScalar>()
      .curve(d3.curveMonotoneX)
      .x((d) => xScale((d.step - 1) * batchSize + ((d.dataIndex == undefined || d.dataIndex === null) ? 0 : d.dataIndex)))
      .y0((d) => yScale(d.maximum))
      .y1((d) => yScale(maxY));

    if (brushEnded && !sampling) {
      // xScale range是[0, width] domain是选中的dataIndex范围
      let s1 = [...stepDomain];
      let s2 = [...dataIndexDomain];

      let start = s2[0], end = Math.min(filteredScalarsData.length, s2[1]);
      for (let i = Math.max(0, start - 1) + 1; i < end; i += batchSize) {
        // 上半部分
        svgPart
          .append("path")
          .datum(filteredScalarsData.slice(i, i + batchSize))
          .attr("class", "area outsidePart upperPart" + i)
          .attr("d", focusAreaOutsideLineGenerator1)
          .on("mouseover", function () {
            d3.select(this).classed("hovered", true);
            svgPart.select(".area.outsidePart.bottomPart" + i).classed("hovered", true);
          })
          .on("mouseout", function () {
            setMouseXPos(null);
            d3.select(this).classed("hovered", false);
            svgPart.select(".area.outsidePart.bottomPart" + i).classed("hovered", false);
          })
          .on("click", ClickHandler1)
          .on("mousemove", OutsidePartPartMouseMoveHandler)

        // 下半部分
        svgPart
          .append("path")
          .datum(filteredScalarsData.slice(i, i + batchSize))
          .attr("class", "area outsidePart bottomPart" + i)
          .attr("d", focusAreaOutsideLineGenerator2)
          .on("mouseover", function () {
            d3.select(this).classed("hovered", true);
            svgPart.select(".area.outsidePart.upperPart" + i).classed("hovered", true);
          })
          .on("mouseout", function () {
            setMouseXPos(null);
            d3.select(this).classed("hovered", false);
            svgPart.select(".area.outsidePart.upperPart" + i).classed("hovered", false);
          })
          .on("click", ClickHandler1)
          .on("mousemove", OutsidePartPartMouseMoveHandler)
      }
    }

    function ClickHandler1() {
      let mouseX = d3.mouse((this as any) as SVGSVGElement)[0];

      let x = xScale.invert(mouseX); // x 范围是x1的domain
      x = Math.floor(x);

      setSelectedTensor({
        type: showActivationOrGradient,
        step: Math.floor((x - 1) / batchSize) + 1,
        dataIndex: -1, // index从0开始
        nodeId: newSelectedNodeId
      });

      setAnchorPosition({ top: d3.event.clientY, left: d3.event.clientX });

      if ((nodeMap[selectedNodeId] as LayerNodeImp).layerType === LayerType.FC ||
        (nodeMap[selectedNodeId] as LayerNodeImp).layerType === LayerType.CONV)
        setIsShowingRadarChart(true);
      else
        setIsShowingTensorHeatmap(true);
    }

    function OutsidePartPartMouseMoveHandler() {
      let mouseX = d3.mouse((this as any) as SVGSVGElement)[0];
      let x = xScale.invert(mouseX); // x 范围是x1的domain
      x = Math.floor(x);
      setMouseXPos(mouseX);

      let newDetailInfoOfCurrentStep = [];

      newDetailInfoOfCurrentStep.push({
        "step": Math.floor((x - 1) / batchSize) + 1,
        "dataIndex": -1,
      })
      setDetailInfoOfCurrentStep(newDetailInfoOfCurrentStep);
    }

    function ClickHandler() {
      let mouseX = d3.mouse((this as any) as SVGSVGElement)[0];

      let x = xScale.invert(mouseX); // x 范围是x1的domain
      x = Math.floor(x);

      setSelectedTensor({
        type: showActivationOrGradient,
        step: Math.floor((x - 1) / batchSize) + 1,
        dataIndex: (x - 1) % batchSize, // index从0开始
        nodeId: newSelectedNodeId
      });

      setAnchorPosition({ top: d3.event.clientY, left: d3.event.clientX });

      if ((nodeMap[selectedNodeId] as LayerNodeImp).layerType === LayerType.FC ||
        (nodeMap[selectedNodeId] as LayerNodeImp).layerType === LayerType.CONV)
        setIsShowingRadarChart(true);
      else
        setIsShowingTensorHeatmap(true);
    }

    function MouseMoveHandler() {
      let mouseX = d3.mouse((this as any) as SVGSVGElement)[0];

      let x = xScale.invert(mouseX); // x 范围是x1的domain
      x = Math.floor(x);

      let xPos = xScale(x);
      setCursorLinePos(xPos);

      let newDetailInfoOfCurrentStep = [];

      newDetailInfoOfCurrentStep.push({
        "step": Math.floor((x - 1) / batchSize) + 1,
        "dataIndex": (x - 1) % batchSize + 1,
      })
      setDetailInfoOfCurrentStep(newDetailInfoOfCurrentStep);
    }

    function MouseLeaveHandler() {
      setCursorLinePos(null);
    }
  }

  const produceXTicks = (xTicksValues: number[], startStep: number, endStep: number) => {
    let numberOfStep = endStep - startStep + 1;

    if (numberOfStep <= 10)
      for (let i = startStep; i <= endStep; i++) {
        xTicksValues.push(i);
      }
    else {
      let len = numberOfStep / 10; // 将所有的maxStep分为十份
      for (let i = 0; i < 10; i++) {
        xTicksValues.push(Math.floor(len * i + startStep));
      }
      xTicksValues.push(endStep);
    }
  }

  const getDetailInfoRect = (xPos, height) => {
    let fontSize = 14;
    let contextHeight = (fontSize + 2) * (DetailInfoOfCurrentStep.length + 1);// 16 为字体大小
    let containerWidth = 160;
    xPos += margin.left;
    if (xPos + containerWidth > width) xPos = xPos - containerWidth - 10; // 靠近右边界，将这一部分放到竖线前面显示
    else xPos += 10;// gap

    return (
      <div
        className="DetailInfoContainer"
        style={{
          left: xPos,
          top: height / 2 - contextHeight / 2,
          width: containerWidth,
        }}>
        <div style={{ marginLeft: '8px', marginTop: '2px' }}>
          {"step: " + DetailInfoOfCurrentStep[0].step}
        </div>
        { DetailInfoOfCurrentStep[0].dataIndex >= 0 &&
          DetailInfoOfCurrentStep[0].dataIndex !== undefined &&
          DetailInfoOfCurrentStep[0].dataIndex !== null &&
          showActivationOrGradient === ShowActivationOrGradient.ACTIVATION &&
          (<div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ marginLeft: '8px', marginTop: '2px' }}>
              {"data index: " + DetailInfoOfCurrentStep[0].dataIndex}
            </div>
            <div style={{ clear: 'both' }}></div>
          </div>)}
      </div>
    )
  };

  const getReservoirSamplingScalarData = (stream: LayerScalar[], k: number): LayerScalar[] => { // 从 stream中等概率提取k个元素，时间复杂度为O(n)
    if (k > stream.length) return stream;
    let reservoir = new Array(k);

    for (let i = 0; i < k; i++)
      reservoir[i] = stream[i];

    for (let i = k; i < stream.length; i++) {
      let p = Math.floor(Math.random() * (i + 1 - 0) + 0); // [0, i+1)之间的随机数 
      if (p < k) reservoir[p] = stream[i];
    }

    reservoir.sort((a: LayerScalar, b: LayerScalar) => { // 排序
      if (a.step === b.step) return a.dataIndex - b.dataIndex;
      else return a.step - b.step;
    })

    return reservoir;
  }

  const getAverageSamplingScalarData = (stream: LayerScalar[], k: number): LayerScalar[] => { // 从 stream中等概率提取k个元素，时间复杂度为O(n)
    if (k > stream.length) return stream; // k至少为640
    let res = [];  // 长度为k

    let indices = []; // 带采样的坐标
    let gap = stream.length / k;
    for (let i = 0; i < k; i++) {
      let index = Math.round(gap * i);
      indices.push(index);
    }
    if (indices[indices.length - 1] != stream.length - 1) indices[indices.length - 1] = stream.length - 1;

    let minY = Infinity, maxY = -Infinity;
    // console.log(indices);

    res.push(stream[0]); // 第一个元素
    for (let i = 1; i < indices.length - 1; i++) { // 计算从index:[i, i+1) 之间所有数的中位数 上下界的平均值
      let begin = indices[i], end = indices[i + 1]; // [begin, end)
      let len = end - begin;
      if (len === 0 || len === 1) {
        res.push(stream[begin]);
        continue
      };

      let temp: LayerScalar = {} as LayerScalar;
      temp.step = stream[begin].step;
      temp.dataIndex = stream[begin].dataIndex;
      let sumMaximum = 0, sumQ3 = 0, sumMedian = 0, sumQ1 = 0, summinimum = 0;
      for (let j = begin; j < end; j++) {
        sumMaximum += stream[j].maximum;
        sumQ3 += stream[j].Q3;
        sumMedian += stream[j].median;
        sumQ1 += stream[j].Q1;
        summinimum += stream[j].minimum;
      }

      temp.maximum = sumMaximum / len;
      temp.Q3 = sumQ3 / len;
      temp.median = sumMedian / len;
      temp.Q1 = sumQ1 / len;
      temp.minimum = summinimum / len;

      res.push(temp);
    }
    res.push(stream[stream.length - 1]); // 最后一个元素
    return res;
  }

  return (
    <div className="layerLevel" ref={measuredRef}>
      {nodeMap[selectedNodeId] instanceof LayerNodeImp && (
        <div className="layer-container">
          {(loadingData || drawing) && (
            <div className={classes.paper}
              style={{
                height: svgHeight,
                width: width,
                marginLeft: margin.left,
                background: "rgba(0,0,0,0.1)",
              }}>
              <CircularProgress size={60} />
            </div>
          )}


          {!(loadingData || drawing) && (
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
                {cursorLinePos !== null && (
                  <line
                    x1={cursorLinePos}
                    x2={cursorLinePos}
                    y1={height}
                    y2={0}
                    style={{
                      stroke: "#e1e1e1",
                      strokeWidth: 1,
                    }}
                  />
                )}
              </g>
              <g
                className="context"
                transform={`translate(${margin2.left},${margin2.top})`}
              ></g>
            </svg>
          )}
          {cursorLinePos !== null && DetailInfoOfCurrentStep.length &&
            getDetailInfoRect(cursorLinePos, height)
          }
          {mouseXPos !== null && DetailInfoOfCurrentStep.length &&
            getDetailInfoRect(mouseXPos, height)
          }
          <TensorHeatmap
            tensorMetadata={selectedTensor}
            isShowing={isShowingTensorHeatmap}
            setIsShowing={setIsShowingTensorHeatmap}
            anchorPosition={anchorPosition}
          />
          <RadarChart
            tensorMetadata={selectedTensor}
            isShowing={isShowingRadarChart}
            setIsShowing={setIsShowingRadarChart}
            anchorPosition={anchorPosition}
          />
        </div>
      )}
    </div>
  );
};

export default LayerLevel;
