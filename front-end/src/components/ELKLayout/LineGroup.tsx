import React, { useEffect, useState, useRef, useCallback } from "react";
import * as d3 from 'd3';
import { useProcessedGraph } from "../../store/processedGraph";
import { FindChildNodeUnderLayerNode } from "../LayerLevel/FindChildNodeUnderLayerNode"
import {
  useGlobalStates,
  modifyGlobalStates,
} from "../../store/global-states";
import { useGlobalConfigurations } from "../../store/global-configuration"
import { GlobalStatesModificationType, NodeScalarType } from "../../store/global-states.type";
import { fetchActivations, fetchNodeScalars } from '../../api/layerlevel';
import { isWidthDown } from "@material-ui/core";
import { LineChart } from "../LineCharts";
import { LayerScalar } from "../LayerLevel/LayerLevel"

interface Props {
  svgWidth: number,
  svgHeight: number
  layerNodeId: string,
}

interface Point {
  x: number;
  y: number;
}

interface ProcessedPoint {
  minx: number;
  miny: number;
  medianx: number;
  mediany: number;
  maxx: number;
  maxy: number;
  Q1x: number;
  Q1y: number;
  Q3x: number;
  Q3y: number;
}

const LineGroup: React.FC<Props> = (props: Props) => {
  const { dataMode } = useGlobalConfigurations();
  const { svgWidth, svgHeight, layerNodeId } = props;
  const { currentStep, maxStep, currentMSGraphName, nodeScalarType } = useGlobalStates();
  const svgRef = useRef();
  const [cursorLinePos, setCursorLinePos] = useState(null);
  const [nodeScalar, setNodeScalar] = useState<LayerScalar[]>(null);
  const [stepDomain, setStepDomain] = useState<[number, number]>(null);
  const [batchSize, setBatchSize] = useState<number>(1);

  const processedGraph = useProcessedGraph();
  const { nodeMap } = processedGraph;

  const margin = { top: 10, right: 10, bottom: 20, left: 23 };
  const lineChartSize = {
    height: svgHeight - margin.top - margin.bottom,
    width: svgWidth - margin.left - margin.right
  };

  useEffect(() => {
    if (maxStep < 0 || currentStep < 0 || currentStep > maxStep) return;

    const stepNumberInLayernode = 21;
    let endStep = 0;
    let startStep = 0;
    let halfOfStepNumberInLayernode = Math.floor(stepNumberInLayernode / 2);
    if (!currentStep) { // 当没有选中某个step的时候，折线图跟随着maxStep变化
      endStep = maxStep;
      startStep = (maxStep - stepNumberInLayernode >= 1 ? maxStep - stepNumberInLayernode : 1);
    } else { // 如果选中某个step, 则显示他的前面halfOfStepNumberInLayernode个，后面halfOfStepNumberInLayernode个
      startStep = (currentStep - halfOfStepNumberInLayernode >= 1 ? currentStep - halfOfStepNumberInLayernode : 1);
      endStep = (currentStep + halfOfStepNumberInLayernode > maxStep ? maxStep : currentStep + halfOfStepNumberInLayernode);
    }

    setStepDomain([startStep, endStep]); // 起始step
  }, [maxStep, currentStep]);

  useEffect(() => {
    if (layerNodeId === "" || !layerNodeId || !stepDomain) return;
    let newNodeId = "";
    if (layerNodeId.indexOf("dense") !== -1 || layerNodeId.indexOf("Dense") !== -1) {
      let _childNodeId = FindChildNodeUnderLayerNode(nodeMap, layerNodeId); // findChildNodeId(selectedNodeId);
      if (_childNodeId.length === 0) return;
      // _childNodeId = _childNodeId.slice(0, 1); // 目前截取找出的第一个元素
      newNodeId = _childNodeId[0];
    } else {
      newNodeId = layerNodeId.split("/").splice(3).join(".");
      let idx = newNodeId.indexOf("_copy");
      if (idx !== -1)
        newNodeId = newNodeId.slice(0, idx);
    }
    getNodeScalars(currentMSGraphName, [newNodeId], stepDomain[0], stepDomain[1], nodeScalarType);
  }, [layerNodeId, stepDomain, nodeScalarType]);

  useEffect(() => {
    if (!nodeScalar) return;

    drawLineChart();

  }, [nodeScalar]);

  const getNodeScalars = async (graphName, nodeIds, startStep, endStep, fetchDataType) => {
    const typeArray = ['activation', 'gradient', 'weight'];
    let data = await fetchNodeScalars({
      graph_name: graphName,
      node_id: nodeIds,
      start_step: startStep,
      end_step: endStep,
      type: typeArray[fetchDataType],
      mode: dataMode,
    });

    if (data.data.message === "success") { // 获取数据成功
      let _nodeScalar = data.data.data[nodeIds[0]];

      let _batchSize = 1;
      for (let i = 1; i < _nodeScalar.length; i++) {
        if (_nodeScalar[i].dataIndex < _nodeScalar[i - 1].dataIndex) {
          _batchSize = _nodeScalar[i - 1].dataIndex + 1;
          break;
        }
      }
      setBatchSize(_batchSize);
      setNodeScalar(_nodeScalar);
    }
  }

  const drawLineChart = () => {
    let max: Point[] = [], min: Point[] = [], median: Point[] = [], Q1: Point[] = [], Q3: Point[] = []; // 每一维数据格式是 {x: step, y: value}

    if (nodeScalarType === NodeScalarType.ACTIVATION) {
      let _scalar = {} as LayerScalar;
      _scalar.maximum = 0;
      _scalar.minimum = 0;
      _scalar.median = 0;
      _scalar.Q1 = 0;
      _scalar.Q3 = 0;
      for (let scalar of nodeScalar) {
        _scalar.maximum += scalar.maximum;
        _scalar.minimum += scalar.minimum;
        _scalar.median += scalar.median;
        _scalar.Q1 += scalar.Q1;
        _scalar.Q3 += scalar.Q3;

        if (scalar.dataIndex === (batchSize - 1)) {
          max.push({ x: scalar.step, y: _scalar.maximum / batchSize });
          min.push({ x: scalar.step, y: _scalar.minimum / batchSize });
          median.push({ x: scalar.step, y: _scalar.median / batchSize });
          Q1.push({ x: scalar.step, y: _scalar.Q1 / batchSize });
          Q3.push({ x: scalar.step, y: _scalar.Q3 / batchSize });

          _scalar.maximum = 0;// 重置
          _scalar.minimum = 0;
          _scalar.median = 0;
          _scalar.Q1 = 0;
          _scalar.Q3 = 0;
        }
      }
    }
    else if (nodeScalarType === NodeScalarType.GRADIENT)
      for (let scalar of nodeScalar) {
        max.push({ x: scalar.step, y: scalar.maximum });
        min.push({ x: scalar.step, y: scalar.minimum });
        median.push({ x: scalar.step, y: scalar.median });
        Q1.push({ x: scalar.step, y: scalar.Q1 / batchSize });
        Q3.push({ x: scalar.step, y: scalar.Q3 / batchSize });
      }
    else if (nodeScalarType === NodeScalarType.WEIGHT)
      for (let scalar of nodeScalar) {
        max.push({ x: scalar.step, y: scalar.maximum });
        min.push({ x: scalar.step, y: scalar.minimum });
        median.push({ x: scalar.step, y: scalar.median });
        Q1.push({ x: scalar.step, y: scalar.Q1 / batchSize });
        Q3.push({ x: scalar.step, y: scalar.Q3 / batchSize });
      }

    let dataArrToShow = [];
    dataArrToShow.push({ id: "Max", data: max, color: "#C71585" })
    dataArrToShow.push({ id: "Min", data: min, color: "#DC143C" })
    dataArrToShow.push({ id: "median", data: median, color: "#4B0082" })
    dataArrToShow.push({ id: "Q1", data: Q1, color: "#C71585" })
    dataArrToShow.push({ id: "Q3", data: Q3, color: "#C71585" })

    if (dataArrToShow.length === 0) return;

    let minY = Infinity, maxY = -Infinity; // 二维数组中的最大最小值
    for (let i = 0; i < dataArrToShow.length; i++) {
      let LineData: Point[] = dataArrToShow[i].data;
      for (let j = 1; j < maxStep; j++) {
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
      .domain([stepDomain[0], stepDomain[1]]);

    if (currentStep !== null)
      setCursorLinePos(XScale(currentStep));

    let focusAreaYScale = d3.scaleLinear()
      .rangeRound([lineChartSize.height, 0])
      .domain([minY, maxY]);

    const focusAreaLineGenerator = d3
      .line<ProcessedPoint>()
      .curve(d3.curveMonotoneX)
      .x((d) => XScale(d.medianx))
      .y((d) => focusAreaYScale(d.mediany))

    const focusAreaGenerator = d3
      .area<ProcessedPoint>()
      .curve(d3.curveMonotoneX)
      .x((d) => XScale(d.minx))
      .y0((d) => focusAreaYScale(d.miny))
      .y1((d) => focusAreaYScale(d.maxy));

    const focusQ1Q3AreaGenerator = d3
      .area<ProcessedPoint>()
      .curve(d3.curveMonotoneX)
      .x((d) => XScale(d.Q1x))
      .y0((d) => focusAreaYScale(d.Q1y))
      .y1((d) => focusAreaYScale(d.Q3y));

    // 处理dataArrToshow数据，每三个元素为一组，其中第一个元素为max，第二个元素为min，
    // 第三个元素为median
    const processedDataArrToShow = [];
    for (let i = 0; i < dataArrToShow.length; i += 5) {
      const maxData = dataArrToShow[i];
      const minData = dataArrToShow[i + 1];
      const medianData = dataArrToShow[i + 2];
      const Q1Data = dataArrToShow[i + 3];
      const Q3Data = dataArrToShow[i + 4];
      const processedItem = {
        data: []
      };
      maxData.data.forEach((item, index) => {
        processedItem.data.push({
          minx: minData.data[index].x,
          miny: minData.data[index].y,
          medianx: medianData.data[index].x,
          mediany: medianData.data[index].y,
          maxx: maxData.data[index].x,
          maxy: maxData.data[index].y,
          Q1x: Q1Data.data[index].x,
          Q1y: Q1Data.data[index].y,
          Q3x: Q3Data.data[index].x,
          Q3y: Q3Data.data[index].y
        });
      });
      processedDataArrToShow.push(processedItem);
    }

    for (let i = 0; i < processedDataArrToShow.length; i++) {
      let data = processedDataArrToShow[i];
      focus
        .append("path")
        .datum(data.data)
        .attr("class", "area")
        .attr("transform", "translate(0,0)")
        .attr("d", focusQ1Q3AreaGenerator)
        .attr("fill", "#69b3a2")
        .attr("fill-opacity", .8)
        .attr("stroke", "none");
      focus
        .append("path")
        .datum(data.data)
        .attr("class", "area")
        .attr("transform", "translate(0,0)")
        .attr("d", focusAreaGenerator)
        .attr("fill", "#69b3a2")
        .attr("fill-opacity", .5)
        .attr("stroke", "none");
      focus
        .append('path')
        .datum(data.data)
        .attr("class", "area medianLine")
        .attr("d", focusAreaLineGenerator)
        .attr("fill", "none")
        .attr("stroke", "blue")
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
  }

  return (
    <div>
      <svg style={{ width: svgWidth, height: svgHeight }} ref={svgRef}>
        <g
          className="layerNodeInnerLineChart"
          transform={`translate(${margin.left},${margin.top})`}
        >
        </g>
      </svg>
    </div>
  );
}
export default LineGroup;