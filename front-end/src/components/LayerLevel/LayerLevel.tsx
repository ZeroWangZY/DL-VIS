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
  maxOutlier: number;
  max: number;
  Q3: number;
  median: number;
  mean: number;
  Q1: number;
  min: number;
  minOutlier: number;
}


export interface DataToShow {
  id: string;
  data: Point[];
  color: string;
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

  const [childNodeId, setChildNodeId] = useState(null);
  const [layerScalarsData, setLayerScalarsData] = useState<LayerScalar[]>(null);
  const [LoadingData, setLoadingData] = useState(false);

  const measuredRef = useCallback((node) => {
    if (node !== null) {
      setSvgHeight(node.getBoundingClientRect().height - 15);
      setSvgWidth(node.getBoundingClientRect().width - 60);
    }
  }, []);

  const margin = { top: 10, left: 30, bottom: 10, right: 30 };
  const gapHeight = 20; // 上下折线图之间的距离
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
    getLayerScalars(currentMSGraphName, childNodeId, 1, maxStep, fetchDataType);
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
    console.log(focus);
    // focus.select('.focus-axis').selectAll(".testCircle").remove(); // 清除原来的坐标
    // focus.select('.focus-axis').selectAll(".axis--x").remove(); // 清除原来的坐标
    // focus.select('.focus-axis').selectAll(".area").remove(); // 清除原折线图

    // let context = d3.select(svgRef.current).select("g.context");

    // let minY = Infinity, maxY = -Infinity; // 二维数组中的最大最小值
    // for (let i = 0; i < layerScalarsData.length; i++) {
    //   let tmp = layerScalarsData[i];
    //   minY = Math.min(minY, Math.min(tmp.min, tmp.minOutlier));
    //   maxY = Math.max(maxY, Math.max(tmp.max, tmp.maxOutlier));
    // }

    // let x1Scale = d3.scaleLinear()
    //   .rangeRound([0, svgWidth])
    //   .domain([1, layerScalarsData.length]);

    // let x2Scale = d3.scaleLinear()
    //   .rangeRound([0, svgWidth])
    //   .domain([1, layerScalarsData.length]);

    // let focusAreaYScale = d3.scaleLinear()
    //   .rangeRound([height, 0])
    //   .domain([minY, maxY]);

    // const focusAreaLineGenerator = d3
    //   .line<LayerScalar>()
    //   .curve(d3.curveMonotoneX)
    //   .x((d) => x1Scale(d.step * d.batch))
    //   .y((d) => focusAreaYScale(d.median))

    focus.append("circle")
      .attr("class", "testCircle")
      .attr("cx", 50)
      .attr("cy", 50)
      .attr("r", 50)
      .style("fill", "red");

    // median 折线
    // focus
    //   .select('.focus-axis')
    //   .append("path")
    //   .datum(layerScalarsData)
    //   .attr("class", "area")
    //   .attr("d", focusAreaLineGenerator)
    //   .attr("fill", "none")
    //   .attr("stroke", "blue");


  }

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
        let layerScalars = res.data.data;
        console.log(layerScalars[nodeIds[0]]);
        setLayerScalarsData(layerScalars[nodeIds[0]]);
      } else {
        console.log("获取layer数据失败：" + res.data.message);
      }
    })

  };

  return (
    <div className="layerLevel" ref={measuredRef}>
      {nodeMap[selectedNodeId] instanceof LayerNodeImp && (
        <div className="layer-container">
          <svg style={{ height: "95%", width: "100%" }} ref={svgRef}>
            <g
              className="focus"
              transform={`translate(${margin.left},${margin.top})`}
            >
              <g className="focus-axis"></g>
            </g>
            <g
              className="context"
              transform={`translate(${margin2.left},${margin2.top})`}
            ></g>
          </svg>
        </div>
      )}
    </div>
  );
};

export default LayerLevel;
