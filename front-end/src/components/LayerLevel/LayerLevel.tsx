import React, { useEffect, useState, Children } from "react";
import './layerLevel.css';
import { useLineData } from '../../store/layerLevel';
import { useHistory } from "react-router-dom";
import IterationChart from './IterationChart';
import ActivationChart from './ActivationChart';
import ActivationOrGradientChart from './ActivationOrGradientChart';
import TsneClusterGraph from './TsneClusterGraph';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { fetchActivations, fetchNodeScalars } from '../../api/layerlevel';
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
import { dsvFormat } from "d3";
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
	const { visNodeMap } = visGraph;

	const { selectedNodeId, showActivationOrGradient, currentMSGraphName, is_training, max_step } = useGlobalStates();

	const [activations, setActivations] = useState([]);
	const [tsneGraph, setTsneGraph] = useState({});
	const [activationOrGradientData, setActivationOrGradientData] = useState([] as DataToShow[]);

	useEffect(() => {
		if (!(nodeMap[selectedNodeId] instanceof LayerNodeImp))
			return; // 不是layerNode 

		let childNodeId = FindChildNodeUnderLayerNode(nodeMap, selectedNodeId); // findChildNodeId(selectedNodeId);
		if (childNodeId.length === 0) return;

		childNodeId = childNodeId.slice(0, 1);	// 目前截取找出的第一个元素

		let fetchDataType = (
			showActivationOrGradient === ShowActivationOrGradient.ACTIVATION ?
				"activation" :
				"gradient"
		)

		getNodeScalars(currentMSGraphName, childNodeId, 1, max_step, fetchDataType);
		getIteration(Math.floor(Math.random() * (max_step - 1 + 1) + 1));
	}, [selectedNodeId, currentMSGraphName, is_training, max_step, showActivationOrGradient])

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
		dataTransform.push({ id: "Max", data: max, color: "#C71585" })
		dataTransform.push({ id: "Min", data: min, color: "#DC143C" })
		dataTransform.push({ id: "Mean", data: mean, color: "#4B0082" })

		setActivationOrGradientData(dataTransform);
	}

	const getActivations = async (extent) => {
		// console.log(extent)
		//    setActivations([])
		let data = []
		for (let i = extent[0]; i < extent[1]; i++) {
			// let data = await fetchActivations({step: i})
			data.push(activationsData())
		}
		setActivations([...data])
	}
	const getIteration = async (iteration) => {
		// let data = await fetchActivations({ step: iteration })
		let data = activationsData()
		setTsneGraph(data)
		setActivations([data])
	}

	// TODO : 网格布局
	return (
		<div>
			{/* <div className='return-button'>
				<ArrowBackIosIcon onClick={goback} />
			</div> */}
			{nodeMap[selectedNodeId] instanceof LayerNodeImp && (
				<div className="layer-container">
					{/* <IterationChart linedata={linedata} getStep={getActivations} onSubmit={getIteration} /> */}
					{/* <ActivationChart activations={activations} /> */}
					<div className="layer-container-box detail-box">

					</div>

					<div className="layer-container-box cluster-box">
						<TsneClusterGraph activations={tsneGraph} />
					</div>

					<div className="layer-container-box line-box">
						{activationOrGradientData.length !== 0 &&
							<ActivationOrGradientChart
								activationOrGradientData={activationOrGradientData}
								is_training={is_training}
								max_step={max_step} />}
					</div>
				</div>
			)}

		</div>
	);
}

export default LayerLevel;