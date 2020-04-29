import React, {useEffect, useState } from "react";
import './layerLevel.css'
import { useLineData} from '../../store/layerLevel';
import { useHistory } from "react-router-dom";
import IterationChart from './IterationChart'
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';

const LayerLevel: React.FC = () => {
    const linedata = useLineData();
    const history = useHistory();
    const goback = ()=> {
        history.push("/")
    }
    useEffect(() => {
   
    })
    return (
        <div>
            <div className='return-button'>
                <ArrowBackIosIcon onClick = {goback}/>
            </div>
            {linedata.length>0?<IterationChart linedata={linedata}/>:<div/>}
        </div>
    );
}

export default LayerLevel;