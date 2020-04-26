import React, { useState, useEffect, useRef } from "react";
import { GraphInfoType,TransformType } from '../../types/mini-map'
import { useGraphInfo, useTransform, setTransform } from '../../store/graphInfo';
import * as d3 from 'd3';
import './MiniMap.css'

const MiniMap: React.FC = () => {
    const mapRef = useRef();
    const canvas: HTMLCanvasElement = mapRef.current;
    const graphInfo = useGraphInfo();
    const transform = useTransform();
    const rectRef = useRef();
    let minimapSize = { width: 300, height: 180 }
    let scale = 4; // minimap大小为原来svg图大小的四分之一
    const viewpointCoord = { x: -transform.x / transform.k / scale, y: -transform.y / transform.k / scale };    // 矩形的初始坐标
    useEffect(() => {
        if (graphInfo === null) return

        // 获取此时svg元素真实的长宽
        const svgWidth = document.getElementById("dagre-svg").getBoundingClientRect().width;
        const svgHeight = document.getElementById("dagre-svg").getBoundingClientRect().height;
        minimapSize.width = svgWidth / scale;
        minimapSize.height = svgHeight / scale;
        d3.select(rectRef.current)  // 更改canvas和rect大小以适应不同的显示比例
            .attr('width', minimapSize.width)
            .attr("height", minimapSize.height)
        d3.select(mapRef.current)
            .attr('width', minimapSize.width)
            .attr("height", minimapSize.height)

        let stylesText = '';
        for (let k = 0; k < document.styleSheets.length; k++) {
            try {
                let cssRules = (document.styleSheets[k] as any).cssRules ||
                    (document.styleSheets[k] as any).rules;
                if (cssRules == null) {
                    continue;
                }
                for (let i = 0; i < cssRules.length; i++) {
                    stylesText += cssRules[i].cssText + '\n';
                }
            } catch (e) {
                if (e.name !== 'SecurityError') {   // 安全
                    throw e;
                }
            }
        }
        let svgStyle = d3.select(graphInfo).append('style');
        svgStyle.text(stylesText);
        d3.select(graphInfo).attr("width", `${svgWidth}`) // 原来样式中的长宽为百分比，现在为它附上真实的长宽
        d3.select(graphInfo).attr("height", `${svgHeight}`)

        // 改变要画的图的transform
        d3.select(graphInfo).select("g.output").attr("transform", `translate(0,0) scale(1)`)
        let svgXml = (new XMLSerializer()).serializeToString(graphInfo)
        svgStyle.remove();

        let context = canvas.getContext('2d');
        let image = new Image();

        let DOMURL: any = self.URL || self;
        let svg = new Blob([svgXml], { type: "image/svg+xml;charset=utf-8" });
        let url = DOMURL.createObjectURL(svg);
        image.onload = function () {
            context.drawImage(image, 0, 0, 300, 180);
        }
        image.src = url
    }, [graphInfo]);

    const dragmove = (d) => {
        viewpointCoord.x = d3.event.x;  //d3.event.x y表示小矩形左上角的位置
        viewpointCoord.y = d3.event.y;
        updateRect()    // 同时改变矩形位置

        // 更新svg图的位置
        d3.select("g.output").attr("transform", `translate(${-viewpointCoord.x * transform.k * scale},${-viewpointCoord.y * transform.k * scale}) scale(${transform.k})`)   // 设置大小范围
    };
    const updateRect = () => {
        d3.select(rectRef.current).attr("transform", `translate(${viewpointCoord.x},${viewpointCoord.y}) scale(${1 / transform.k})`) // 设置小矩形大小
    }

    const dragend = (d) => { // 拖拽结束，设置transform
        setTransform(TransformType.MAP_TRANSFORM, { x: -viewpointCoord.x * scale, y: -viewpointCoord.y * scale, k: transform.k })
    }
    useEffect(() => {
        let drag = d3.drag().subject(Object).on('drag', dragmove)//.on("end", dragend);
        d3.select(rectRef.current).datum(viewpointCoord as any).call(drag);
    });
    return (
        <div className={'mini-map'}>
            <svg>

                <defs>
                    <filter id="minimapDropShadow" x="-20%" y="-20%" width="150%" height="150%">
                        <feOffset result="offOut" in="SourceGraphic" dx="1" dy="1"></feOffset>
                        <feColorMatrix result="matrixOut" in="offOut" type="matrix" values="0.1 0 0 0 0 0 0.1 0 0 0 0 0 0.1 0 0 0 0 0 0.5 0"></feColorMatrix>
                        <feGaussianBlur result="blurOut" in="matrixOut" stdDeviation="2"></feGaussianBlur>
                        <feBlend in="SourceGraphic" in2="blurOut" mode="normal"></feBlend>
                    </filter>
                </defs>
                <g>
                    <rect
                        ref={rectRef}
                        transform={`translate(${viewpointCoord.x},${viewpointCoord.y}) scale(${1 / transform.k})`}
                        width={minimapSize.width}
                        height={minimapSize.height}
                    />
                </g>
            </svg>
            <canvas ref={mapRef} width={minimapSize.width} height={minimapSize.height} />
        </div>
    );
}

export default MiniMap;