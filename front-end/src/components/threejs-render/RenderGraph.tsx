import React from "react";
import {Graph}  from './Graph'
import './RenderGraph.css'
import {mockDataForRender} from "../../mock/mockDataForRender";


const RenderGraph: React.FC = () => {
    return (
        <div className="contanier">
            <div className="float">
            </div>
            <div className="main">
                <Graph renderData={mockDataForRender}/>
            </div>
        </div>
    );
}

export default RenderGraph;