import React, { useEffect, useState } from "react";
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
	const { showActivationOrGradient, currentMSGraphName, is_training, max_step } = useGlobalStates();

	const [activations, setActivations] = useState([]);
	const [tsneGraph, setTsneGraph] = useState({});
	const [activationOrGradientData, setActivationOrGradientData] = useState([] as DataToShow[]);

	useEffect(() => {
		let nodeIds = ["2", "3"];
		getNodeScalars(currentMSGraphName, nodeIds, 1, max_step);
		getIteration(Math.floor(Math.random() * (max_step - 1 + 1) + 1));
	}, [currentMSGraphName, is_training, max_step])

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
			<div className='return-button'>
				<ArrowBackIosIcon onClick={goback} />
			</div>
			<div className="layer-container">
				{/* <IterationChart linedata={linedata} getStep={getActivations} onSubmit={getIteration} /> */}
				{/* <ActivationChart activations={activations} /> */}
				<div className="layer-container-box detail-box"></div>
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

				{/* <div
					style={{
						paddingLeft: "10px"
					}}
				></div> */}
			</div>
		</div>
	);
}

export default LayerLevel;