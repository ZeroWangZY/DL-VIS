import React, {useEffect, useState } from "react";
import './layerLevel.css'
import { useLineData} from '../../store/layerLevel';
import { useHistory } from "react-router-dom";
import IterationChart from './IterationChart'
import ActivationChart from './ActivationChart'
import TsneClusterGraph from './TsneClusterGraph'
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { fetchActivations } from '../../api/layerlevel'
import { activationsData } from '../../mock/mockDataForLayerLevel'

const LayerLevel: React.FC = () => {
    const linedata = useLineData();
    const history = useHistory();
    const goback = ()=> {
        history.push("/")
    }
    const [activations,setActivations] = useState([]);
    const [tsneGraph,setTsneGraph] = useState({});
    useEffect(() => {
   
    })
    const getActivations = async(extent)=> {
       // console.log(extent)
    //    setActivations([])
       let data = []
        for(let i = extent[0];i < extent[1];i ++){
            // let data = await fetchActivations({step: i})
            data.push(activationsData())
        }
        setActivations([...data])
    }
    const getIteration = async(iteration)=> {
        // console.log(iteration)
        // let data = await fetchActivations({step: iteration})
        let data = activationsData()
        setTsneGraph(data)
        setActivations([data])
    }
    return (
        <div>
            <div className='return-button'>
                <ArrowBackIosIcon onClick = {goback}/>
            </div>
            <IterationChart linedata={linedata} getStep={getActivations} onSubmit={getIteration}/>
            <div
             style={{
                padding: '40px 0px'
            }}>
                <ActivationChart activations={activations}/>
                <TsneClusterGraph activations={tsneGraph}/>
            </div>
        </div>
    );
}

export default LayerLevel;