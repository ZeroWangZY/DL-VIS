import React, { Component } from "react";
import {Graph}  from './Graph'
import './RenderGraph.css'
import {LayoutGraph} from '../../types/layoutGraphForRender'
import {mockDataForRender, mockDataForRender2} from "../../mock/mockDataForRender";
interface State {
    renderData: LayoutGraph;
}

// const RenderGraph: React.FC = () => {
export class RenderGraph extends Component<{},State> {
    constructor(props) {
        super(props);
        this.state = {
            renderData: mockDataForRender
        };
        this.updateData = this.updateData.bind(this);
    }
    updateData(object){
        if(object.name === 'conv_layer/add rect'){
            this.setState({
                renderData:  mockDataForRender2
            })
        }else{
            this.setState({
                renderData:  mockDataForRender
            })
        }
    }
    render() {
        return (
            <div className="contanier">
                <div className="float">
                </div>
                <div className="main">
                    <Graph renderData={this.state.renderData} clickEvent={this.updateData}/>
                </div>
            </div>
        );
    }
}

export default RenderGraph;