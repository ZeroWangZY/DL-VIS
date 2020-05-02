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
    useEffect(() => {
   
    })
    const getActivations = async(extent)=> {
       // console.log(extent)
       let data = []
        for(let i = extent[0];i < extent[1];i ++){
            // let data = await fetchActivations({step: i})
            data.push(activationsData())
        }
        setActivations([...activations,...data])
    }
    return (
        <div>
            <div className='return-button'>
                <ArrowBackIosIcon onClick = {goback}/>
            </div>
            {linedata.length>0?<IterationChart linedata={linedata} getStep={getActivations}/>:<div/>}
            <ActivationChart activations={activations}/>
            {activations.length === 1?<TsneClusterGraph activations={activations}/>:<div/>}
        </div>
    );
}

export default LayerLevel;