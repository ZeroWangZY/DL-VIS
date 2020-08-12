import React, { useEffect, useRef, useState } from "react";
import TSNE from 'tsne-js';
import { fetchActivations, fetchNodeScalars } from '../../api/layerlevel'
import { scaleLinear } from 'd3-scale';

interface ClusterGraphProps {
    activations: any
}
const TsneClusterGraph: React.FC<ClusterGraphProps> = (props: ClusterGraphProps) => {
    let { activations } = props
    const canvasRef = useRef();
    const graphWidth = 160
    const graphHight = 160
    const margin = { left: 20, right: 20, top: 0, bottom: 0 }
    useEffect(() => {
        if (JSON.stringify(activations) === '{}') return
        let model = new TSNE({
            dim: 2,
            perplexity: 30.0,
            earlyExaggeration: 4.0,
            learningRate: 100.0,
            nIter: 1000,
            metric: 'euclidean'
        });
        model.init({
            data: activations.data.activations,
            type: 'dense'
        });
        let [error, iter] = model.run();
        let outputScaled = model.getOutputScaled();//scaled to a range of [-1, 1]


        let xscale = scaleLinear()
            .rangeRound([0, graphWidth - margin.left - margin.right])
            .domain([-1, 1]);
        let yscale = scaleLinear()
            .rangeRound([0, graphHight - margin.top - margin.bottom])
            .domain([-1, 1]);
        const canvas: HTMLCanvasElement = canvasRef.current;
        let ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, graphWidth, graphHight);
        // ctx.clearRect(0, 0, 500, 500);
        let radius = 7;
        // ctx.beginPath();
        for (var i = 0; i < outputScaled.length; i++) {
            ctx.beginPath();
            ctx.arc(xscale(outputScaled[i][0]) + margin.left, yscale(outputScaled[i][1]) + margin.top, radius, 0, Math.PI * 2, true);
            ctx.fillStyle = 'rgb(99,149,249)';
            ctx.fill();
        }
        // ctx.lineWidth = 5;
        // ctx.strokeStyle = '#003300';
        // ctx.stroke();
    }, [activations])
    return (
        <div className='tsne-cluster'
            style={{
                width: graphWidth,
                height: graphHight
            }}>
            <canvas ref={canvasRef} width={graphWidth} height={graphHight} />
        </div>
    );
}

export default TsneClusterGraph;