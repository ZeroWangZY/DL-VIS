import React, { useEffect, useState, Children } from "react";
import "./layerLevel.css";
import { useLineData } from "../../store/layerLevel";
import { useHistory } from "react-router-dom";
import DetailLineChart from "./DetailLineChart";
import ActivationOrGradientChart from "./ActivationOrGradientChart";
import ClusterGraph from "./ClusterGraph";
import {
  fetchNodeLineDataBlueNoiceSampling,
  fetchNodeScalars,
  fetchClusterData,
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

  const [brushedStep, setBrushedStep] = useState(null);
  const [brushed, setBrushed] = useState(false);
  const [childNodeId, setChildNodeId] = useState(null);
  const [clusterStep, setClusterStep] = useState(null);
  const [clusterData, setClusterData] = useState(null);
  const [activationOrGradientData, setActivationOrGradientData] = useState<DataToShow[]>([]);
  const [loadingDetailLineChartData, setLoadingDetailLineChartData] = useState<boolean>(false);
  const [loadingClusterData, setLoadingClusterData] = useState<boolean>(false);
  const [detailLineChartData, setDetailLineChartData] = useState(null);

  // let initialBrushedStep = []; // 如果brushed===false时的初始刷选位置
  // if (currentStep) {
  //   let end = Math.min(maxStep - 1, currentStep);
  //   initialBrushedStep = [end - 1, end];
  // } else {
  //   initialBrushedStep = [1, 2];
  // }
  // 还没有刷选时，初始化detailInfoGraph的起止位置
  const initialBrushedStep =
    currentStep ?
      [Math.min(maxStep - 1, currentStep) - 1, Math.min(maxStep - 1, currentStep)] :
      [1, 2]

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
    getNodeScalars(currentMSGraphName, childNodeId, 1, maxStep, fetchDataType);
  }, [
    childNodeId,
    currentMSGraphName,
    isTraining,
    maxStep,
    showActivationOrGradient,
  ]);

  useEffect(() => {
    if (!childNodeId || brushed) return;
    // 用户还没有刷选，只是改变currentStep位置
    let brushedStartStep = 1, brushedEndStep = 1;

    [brushedStartStep, brushedEndStep] = initialBrushedStep;

    setClusterStep(brushedStartStep);

    getNodeLineDataBlueNoiceSampling(
      currentMSGraphName,
      childNodeId,
      brushedStartStep,
      brushedEndStep,
      fetchDataType
    );

  }, [currentStep, childNodeId])

  useEffect(() => {
    if (!childNodeId || !brushedStep || !brushedStep.length) return;

    const [brushedStartStep, brushedEndStep] = brushedStep;

    setClusterStep(brushedStartStep);
    const maxGap = 10;

    if (brushedEndStep - brushedStartStep <= maxGap) {
      getNodeLineDataBlueNoiceSampling(
        currentMSGraphName,
        childNodeId,
        brushedStartStep,
        brushedEndStep,
        fetchDataType
      );
    }
  }, [brushedStep, childNodeId]);

  useEffect(() => {
    if (!clusterStep) return;
    getClusterData(currentMSGraphName, childNodeId, clusterStep, fetchDataType);
  }, [clusterStep, childNodeId]);

  const getNodeScalars = async (
    graphName,
    nodeIds,
    startStep,
    endStep,
    type
  ) => {
    await fetchNodeScalars({
      graph_name: graphName,
      node_id: nodeIds,
      start_step: startStep,
      end_step: endStep,
      type: type,
    }).then((res) => {
      if (res.data.message === "success") {
        let nodeScalars = res.data.data;

        let max: Point[] = [],
          min: Point[] = [],
          mean: Point[] = []; // 每一维数据格式是 {x: step, y: value}
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
        let dataTransform = [];
        dataTransform.push({ id: "max", data: max, color: "#C71585" });
        dataTransform.push({ id: "min", data: min, color: "#DC143C" });
        dataTransform.push({ id: "mean", data: mean, color: "#4B0082" });

        setActivationOrGradientData(dataTransform);
      } else {
        console.log("获取最大值/最小值/均值数据失败：" + res.data.message);
      }
    })

  };

  const getClusterData = async (graphName, nodeId, currStep, type) => {
    setLoadingClusterData(true);
    fetchClusterData({
      graph_name: graphName,
      node_id: nodeId,
      current_step: currStep,
      type: type,
    }).then((res) => {
      if (res.data.message === "success") {
        let cluster = res.data.data;
        setClusterData(cluster);
        setLoadingClusterData(false);
      } else {
        console.warn("获取tsne降维数据失败: " + res.data.message)
      }
    })
  };

  const getNodeLineDataBlueNoiceSampling = async (
    graphName,
    nodeId,
    startStep,
    endStep,
    type
  ) => {
    setLoadingDetailLineChartData(true);
    fetchNodeLineDataBlueNoiceSampling({
      graph_name: graphName,
      node_id: nodeId,
      start_step: startStep,
      end_step: endStep + 1,
      type: type,
    }).then((res) => {
      if (res.data.message === "success") {
        let originalLineData = res.data.data;

        let lineNumber = originalLineData.length;

        let dataArrToShow = [];
        for (let i = 0; i < lineNumber; i++) {
          dataArrToShow.push({ id: "Detail_Info" + i, data: [], color: "#388aac" });
        }
        let maxValue = -Infinity,
          minValue = Infinity;
        for (let lineIndex = 0; lineIndex < lineNumber; lineIndex++) {
          let line = originalLineData[lineIndex];
          for (let i = 0, len = line.length; i < len; i++) {
            let xValue = i,
              yValue = line[i];
            if (yValue > maxValue) maxValue = yValue;
            if (yValue < minValue) minValue = yValue;

            dataArrToShow[lineIndex].data.push({ x: xValue, y: yValue });
          }
        }

        setLoadingDetailLineChartData(false);
        setDetailLineChartData(dataArrToShow);
      } else {
        console.log("获取采样后的折线图失败：", res.data.message);
      }
    })

  };

  return (
    <div>
      {nodeMap[selectedNodeId] instanceof LayerNodeImp && (
        <div className="layer-container">
          <div className="layer-container-box detail-box">
            <DetailLineChart
              start_step={
                brushed === true ? brushedStep[0] : initialBrushedStep[0]
              }
              end_step={
                brushed === true ? brushedStep[1] : initialBrushedStep[1]
              }
              dataArrToShow={detailLineChartData}
              setClusterStep={setClusterStep}
              clusterStep={clusterStep}
              childNodeId={childNodeId}
              showLoading={loadingDetailLineChartData}
            />
          </div>

          <div className="layer-container-box cluster-box">
            <ClusterGraph
              clusterData={clusterData}
              clusterStep={clusterStep}
              loadingDetailLineChartData={loadingDetailLineChartData}
              loadingClusterData={loadingClusterData}
              start_step={
                brushed === true ? brushedStep[0] : initialBrushedStep[0]
              }
              end_step={
                brushed === true ? brushedStep[1] : initialBrushedStep[1]
              }
              dataArrToShow={detailLineChartData}
              setClusterStep={setClusterStep}
              childNodeId={childNodeId}
              showLoading={loadingDetailLineChartData}
            />
          </div>

          <div className="layer-container-box line-box">
            {activationOrGradientData.length !== 0 && (
              <ActivationOrGradientChart
                activationOrGradientData={activationOrGradientData}
                isTraining={isTraining}
                maxStep={maxStep}
                brushedStep={brushedStep}
                setBrushedStep={setBrushedStep}
                setBrushed={setBrushed}
                loadingData={loadingDetailLineChartData || loadingClusterData}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LayerLevel;
