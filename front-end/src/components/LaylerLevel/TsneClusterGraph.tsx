import React, {useEffect,useRef, useState } from "react";
import TSNE from 'tsne-js';
import { scaleLinear } from 'd3-scale';

interface ClusterGraphProps {
    activations: any
}
const TsneClusterGraph: React.FC<ClusterGraphProps> = (props:ClusterGraphProps) => {
    let { activations } = props
    const canvasRef = useRef();
    useEffect(() => {
        let model = new TSNE({
            dim: 2,
            perplexity: 30.0,
            earlyExaggeration: 4.0,
            learningRate: 100.0,
            nIter: 1000,
            metric: 'euclidean'
          });
        model.init({
            data: activations[0].data.activations,
            type: 'dense'
          });
        let [error, iter] = model.run();
        let outputScaled = model.getOutputScaled();//scaled to a range of [-1, 1]


        let xscale = scaleLinear()
                    .rangeRound([0, 500])
                    .domain([-1, 1]);
        let yscale = scaleLinear()
                    .rangeRound([0, 500])
                    .domain([-1, 1]);
        const canvas: HTMLCanvasElement = canvasRef.current;
        let ctx = canvas.getContext('2d');
        // ctx.clearRect(0, 0, 500, 500);
        let radius = 7;
        // ctx.beginPath();
        for(var i = 0; i < outputScaled.length; i++){
            ctx.beginPath();
            ctx.arc(xscale(outputScaled[i][0]), yscale(outputScaled[i][1]), radius, 0, Math.PI * 2, true);
            ctx.fillStyle = 'green';
            ctx.fill();
        }
        // ctx.lineWidth = 5;
        // ctx.strokeStyle = '#003300';
        // ctx.stroke();
    }, [activations])
    return (
        <div>
            <canvas ref={canvasRef} width="500" height="500"/>
        </div>
    );
}

export default TsneClusterGraph;