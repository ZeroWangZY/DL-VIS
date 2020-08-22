import React, { useEffect, useState, Children } from "react";
import './layerLevel.css';
import { useLineData } from '../../store/layerLevel';
import { useHistory } from "react-router-dom";
import DetailLineChart from './DetailLineChart';
import ActivationOrGradientChart from './ActivationOrGradientChart';
import TsneClusterGraph from './TsneClusterGraph';
import ClusterGraph from './ClusterGraph';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { fetchNodeLineDataBlueNoiceSampling, fetchNodeScalars, fetchNodeTensors } from '../../api/layerlevel';
import { activationsData } from '../../mock/mockDataForLayerLevel';
import { ShowActivationOrGradient } from "../../store/global-states.type"
import {
	useGlobalStates,
	modifyGlobalStates,
} from "../../store/global-states";
import { GlobalStatesModificationType } from "../../store/global-states.type";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import { useProcessedGraph } from "../../store/processedGraph";
import { useVisGraph } from "../../store/visGraph";
import {
	NodeType,
	GroupNode,
	LayerNode,
	DataType,
	OperationNode,
	GroupNodeImp,
	OperationNodeImp,
	DataNodeImp,
	LayerNodeImp,
} from "../../common/graph-processing/stage2/processed-graph";
import { StackedOpNodeImp } from "../../common/graph-processing/stage3/vis-graph.type";
import { dsvFormat, brushSelection } from "d3";
import { FindChildNodeUnderLayerNode } from "./FindChildNodeUnderLayerNode"

interface layerNodeScalar {
	"step": number,
	"activation_min": number,
	"activation_max": number,
	"activation_mean": number,
	"gradient_min": number,
	"gradient_max": number,
	"gradient_mean": number
}
export interface Point {
	x: number;
	y: number;
}
export interface DataToShow {
	id: string,
	data: Point[],
	color: string,
}

const LayerLevel: React.FC = () => {
	const linedata = useLineData();
	const history = useHistory();
	const goback = () => {
		history.push("/")
	}

	const visGraph = useVisGraph();
	const processedGraph = useProcessedGraph();
	const { nodeMap } = processedGraph;

	const { selectedNodeId, showActivationOrGradient, currentMSGraphName, is_training, max_step, currentStep } = useGlobalStates();

	const [nodeTensors, setNodeTensors] = useState(null);
	const [brushedStep, setBrushedStep] = useState(null);
	const [brushedOrNot, setBrushedOrNot] = useState(false);
	const [childNodeId, setChildNodeId] = useState(null);
	const [clusterStep, setClusterStep] = useState(null);
	const [activations, setActivations] = useState([]);
	const [tsneGraph, setTsneGraph] = useState({});
	const [activationOrGradientData, setActivationOrGradientData] = useState([] as DataToShow[]);

	let initialBrushedStep = []; // 如果brushedOrNot===false时的初始刷选位置
	if (currentStep) {
		let end = Math.min(max_step - 1, currentStep);
		initialBrushedStep = [end - 1, end];
	} else {
		initialBrushedStep = [1, 2];
	}

	const [detailLineChartData, setDetailLineChartData] = useState(null);
	const [minValueOfDetailLineChartData, setMinValueOfDetailLineChartData] = useState(-100);
	const [maxValueOfDetailLineChartData, setMaxValueOfDetailLineChartData] = useState(100)

	const fetchDataType = (
		showActivationOrGradient === ShowActivationOrGradient.ACTIVATION ?
			"activation" :
			"gradient"
	)

	useEffect(() => {
		if (!(nodeMap[selectedNodeId] instanceof LayerNodeImp))
			return; // 不是layerNode 

		let _childNodeId = FindChildNodeUnderLayerNode(nodeMap, selectedNodeId); // findChildNodeId(selectedNodeId);
		if (_childNodeId.length === 0) return;
		_childNodeId = _childNodeId.slice(0, 1);	// 目前截取找出的第一个元素
		setChildNodeId(_childNodeId);
	}, [selectedNodeId])

	useEffect(() => {
		if (!childNodeId) return;
		getNodeScalars(currentMSGraphName, childNodeId, 1, max_step, fetchDataType);
	}, [childNodeId, currentMSGraphName, is_training, max_step, showActivationOrGradient])

	useEffect(() => {
		console.log("brushedStep", brushedStep);
		let brushedStartStep = 1, brushedEndStep = 1;
		if (brushedOrNot === false) {
			[brushedStartStep, brushedEndStep] = initialBrushedStep;
		} else {
			[brushedStartStep, brushedEndStep] = brushedStep;
		}

		const maxGap = 10;
		if (brushedEndStep - brushedStartStep <= maxGap) {
			getNodeTensors(currentMSGraphName, childNodeId, brushedStartStep, brushedEndStep, fetchDataType);

			getNodeLineDataBlueNoiceSampling(currentMSGraphName, childNodeId, brushedStartStep, brushedEndStep, fetchDataType);
		}

	}, [brushedStep, brushedOrNot, currentStep])

	const getNodeScalars = async (graphName, nodeIds, startStep, endStep, type) => {
		let data = await fetchNodeScalars({ graph_name: graphName, node_id: nodeIds, start_step: startStep, end_step: endStep, type: type });
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
		let dataTransform = [];
		dataTransform.push({ id: "max", data: max, color: "#C71585" })
		dataTransform.push({ id: "min", data: min, color: "#DC143C" })
		dataTransform.push({ id: "mean", data: mean, color: "#4B0082" })

		setActivationOrGradientData(dataTransform);
	}

	const getNodeTensors = async (graphName, nodeId, startStep, endStep, type) => {
		let data = await fetchNodeTensors({ graph_name: graphName, node_id: nodeId, start_step: startStep, end_step: endStep, type: type });
		let tensors = data.data.data;

		// flat处理
		let steps = tensors.length; // 长度表示刷选了多少step
		for (let step = 0; step < steps; step++) {
			let vectors = tensors[step]; // 某一step的tensor
			for (let i = 0, len = vectors.length; i < len; i++) { // 将每个vector flat为一维
				let vector = vectors[i];
				let newVector = flattenDeep(vector);
				vectors[i] = newVector;
			}
		}
		setNodeTensors(tensors);
	}

	const getNodeLineDataBlueNoiceSampling = async (graphName, nodeId, startStep, endStep, type) => {
		let data = await fetchNodeLineDataBlueNoiceSampling({ graph_name: graphName, node_id: nodeId, start_step: startStep, end_step: endStep + 1, type: type });
		let originalLineData = data.data.data;
		console.log(originalLineData);

		let lineNumber = originalLineData.length;

		let dataArrToShow = [];
		for (let i = 0; i < lineNumber; i++) {
			dataArrToShow.push(
				{ id: "Detail_Info" + i, data: [], color: "#388aac" }
			)
		}
		let maxValue = -Infinity, minValue = Infinity;
		for (let lineIndex = 0; lineIndex < lineNumber; lineIndex++) {
			let line = originalLineData[lineIndex];
			for (let i = 0, len = line.length; i < len; i++) {
				let xValue = i, yValue = line[i];
				if (yValue > maxValue) maxValue = yValue;
				if (yValue < minValue) minValue = yValue;

				dataArrToShow[lineIndex].data.push({ x: xValue, y: yValue });
			}
		}

		setDetailLineChartData(dataArrToShow);
		setMinValueOfDetailLineChartData(minValue);
		setMaxValueOfDetailLineChartData(maxValue);
	}

	//to enable deep level flatten use recursion with reduce and concat
	function flattenDeep(arr1) {
		return arr1.reduce((acc, val) => Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val), []);
	}

	return (
		<div>
			{nodeMap[selectedNodeId] instanceof LayerNodeImp && (
				<div className="layer-container">
					<div className="layer-container-box detail-box">
						<DetailLineChart
							start_step={brushedOrNot === true ? brushedStep[0] : initialBrushedStep[0]}
							end_step={brushedOrNot === true ? brushedStep[1] : initialBrushedStep[1]}
							dataArrToShow={detailLineChartData}
							setClusterStep={setClusterStep}
							minValueOfDataToShow={minValueOfDetailLineChartData}
							maxValueOfDataToShow={maxValueOfDetailLineChartData} />
					</div>

					<div className="layer-container-box cluster-box">
						{/* <TsneClusterGraph activations={tsneGraph} /> */}
						<ClusterGraph
							nodeTensors={nodeTensors}
							clusterStep={clusterStep} />
					</div>

					<div className="layer-container-box line-box">
						{activationOrGradientData.length !== 0 &&
							<ActivationOrGradientChart
								activationOrGradientData={activationOrGradientData}
								is_training={is_training}
								max_step={max_step}
								setBrushedStep={setBrushedStep}
								setBrushedOrNot={setBrushedOrNot} />}
					</div>
				</div>
			)}

		</div>
	);
}

export default LayerLevel;