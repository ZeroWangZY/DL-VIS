import React, {useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import './Snaphot.css'
import { fetchAndComputeSnaphot } from '../../common/model-level/snaphot'

const Snaphot: React.FC = () => {
    const [lineData, setLineData] = useState([]);
    useEffect(() => {
        fetchAndComputeSnaphot()
        .then(data => {
            setLineData(data)
        })
    })
    return (
        <div className="lineChart-container">
        </div>
    );
}

export default Snaphot;