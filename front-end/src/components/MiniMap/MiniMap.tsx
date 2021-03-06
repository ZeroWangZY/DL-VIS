import React, { useState, useEffect, useRef, useContext } from "react";
import * as d3 from 'd3';
import './MiniMap.css'
import { useStyledGraph } from "../../store/styledGraph";
import {
  useGlobalStates
} from "../../store/global-states";
import { UpdateRectInCanvasContext } from '../../store/redrawCanvas';

let fitK = 1;
let timer = null;

interface Transform {
  x: number;
  y: number;
  k: number;
}
interface Props {
  graph: HTMLElement;
  outputSVG: HTMLElement;
  outputG: HTMLElement;
  updateZoomofD3: any;
}

// 由于output-G的大小可能大于mainsvg的大小。这个时候就需要将output-G按比例缩小，
// 使得它的大小不超过mainsvg，这样用canvas画图的时候就很方便了
// 比如mainsvg的大小是 [500,500]，outputSvg大小是：[200,1500]
// 此时，就要将outputsvg的大小缩小3倍, fitK = 1/3 之后outputSvg的大小为 [200/3,500];
// 再比如mainsvg的大小是[500,500],outputSvg大小是:[750,1500]
// 要保证outputSvg缩小后，mainSvg能装得下，fitK = 1/3 ,outputsvg之后的大小为[250,500]
// 而不应该 fitK = 500/750 = 2/3 ,之后outputSvg大小为[500,1000] 显然不正确。
function ScaleToFit(outputsvgWidth, outputsvgHeight, svgWidth, svgHeight) {
  let fitK
  if (outputsvgWidth > svgWidth && outputsvgHeight > svgHeight) {
    fitK = svgWidth / outputsvgWidth
    if (outputsvgHeight * fitK > svgHeight)
      fitK = svgHeight / outputsvgHeight
  }
  else if (outputsvgWidth > svgWidth) {
    fitK = svgWidth / outputsvgWidth
  }
  else if (outputsvgHeight > svgHeight) {
    fitK = svgHeight / outputsvgHeight
  }

  return fitK
}

const MiniMap: React.FC<Props> = (props: Props) => {
  if (props.graph === undefined || props.graph === null) return (<div />); // 没有输入
  const { graph, outputG, outputSVG, updateZoomofD3 } = props;
  const styledGraph = useStyledGraph();

  const { selectedNodeId } = useGlobalStates();
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, k: 1 });

  const rectRef = useRef();
  const canvasRef = useRef();
  const canvasContext = useContext(UpdateRectInCanvasContext);

  useEffect(() => {
    let zoom = d3.zoom()
      .on("zoom", function () {
        d3.select(outputG).attr("transform", d3.event.transform);
      })
      .on("end", () => {
        setTransform(d3.event.transform);
      });
    d3.select(graph).call(zoom).on("dblclick.zoom", null);
  }, [])

  const scale = 4; // minimap大小为原来svg图大小的四分之一

  const mainSvgSize = {
    width: d3.select(graph).node().getBoundingClientRect().width,
    height: d3.select(graph).node().getBoundingClientRect().height
  }; // mainSvg大小

  const minimapSize = { width: mainSvgSize.width / scale, height: mainSvgSize.height / scale }

  let viewpointCoord = { x: -transform.x * fitK / transform.k / scale, y: -transform.y * fitK / transform.k / scale };    // 矩形的初始坐标

  const updateRect = (x, y) => { // 更新矩形框的位置
    // 改变要画的图的transform
    d3.select(outputG as HTMLElement)
      .attr("transform", `translate(0,0) scale(1)`)
    setTransform({ x: 0, y: 0, k: 1 });
    d3.select(rectRef.current).attr("transform", `translate(${x},${y}) scale(${1 / transform.k})`)
  }

  canvasContext.setInvokeUpdateRect(updateRect);

  const drawInCanvas = function (outputSVG_Copy, fitK) {
    if (outputSVG_Copy === null) return;

    const canvas: HTMLCanvasElement = canvasRef.current;
    if(!canvas || !canvas.getContext('2d')) return; // 防止webGL与svg模式转换太快
    let context = canvas.getContext('2d');
    context.clearRect(0, 0, minimapSize.width, minimapSize.height); // 清空canvas画布

    let stylesText = ''; // copy所有的样式
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

    d3.select(outputSVG_Copy as HTMLElement).attr("width", `${mainSvgSize.width}`) // 原来样式中的长宽为百分比，现在为它附上真实的长宽
    d3.select(outputSVG_Copy as HTMLElement).attr("height", `${mainSvgSize.height}`);

    // 改变要画的图的transform
    d3.select(outputSVG_Copy as HTMLElement)
      .select("g.output")
      .attr("transform", `translate(0,0) scale(${fitK})`)

    d3.select(outputSVG_Copy as HTMLElement) // 隐藏所有的label
      .selectAll(".my-label")
      .selectAll("text")
      .style("opacity", "0")

    let svgStyle = d3.select(outputSVG_Copy as HTMLElement).append('style').text(stylesText);

    let svgXml = (new XMLSerializer()).serializeToString(outputSVG_Copy)
    svgStyle.remove();

    let image = new Image();

    let DOMURL: any = self.URL || self;
    let svg = new Blob([svgXml], { type: "image/svg+xml;charset=utf-8" });
    let url = DOMURL.createObjectURL(svg);
    image.onload = function () {
      context.drawImage(image, 0, 0, minimapSize.width, minimapSize.height);
    }
    image.src = url
  }

  useEffect(() => {
    if (outputSVG === null) return;

    if (timer !== null)
      clearTimeout(timer);

    timer = setTimeout(() => {
      const svgWidth = mainSvgSize.width;
      const svgHeight = mainSvgSize.height;
      const outputsvgWidth = d3.select(outputSVG).node().getBoundingClientRect().width / transform.k;
      const outputsvgHeight = d3.select(outputSVG).node().getBoundingClientRect().height / transform.k; //未缩放之前的大小

      if (outputsvgHeight > svgHeight || outputsvgWidth > svgWidth)
        fitK = ScaleToFit(outputsvgWidth, outputsvgHeight, svgWidth, svgHeight)
      else
        fitK = 1;

      if (fitK === 1)
        d3.select(rectRef.current)  // 更改canvas和rect大小以适应不同的显示比例
          .attr('width', minimapSize.width)
          .attr("height", minimapSize.height)
      else {
        d3.select(rectRef.current)  // 更改canvas和rect大小以适应不同的显示比例
          .attr('width', minimapSize.width * fitK)
          .attr("height", minimapSize.height * fitK)
      }
      let outputSVGToDrawInCanvas = outputSVG.cloneNode(true);
      drawInCanvas(outputSVGToDrawInCanvas, fitK);
    }, 500)

  }, [styledGraph, selectedNodeId, mainSvgSize.width, mainSvgSize.height])

  //-------------------------以下是拖动矩形框-->改变output图的位置------------------------------------
  useEffect(() => {
    const dragmove = () => {
      viewpointCoord.x = d3.event.x;  //d3.event.x y表示小矩形左上角的位置
      viewpointCoord.y = d3.event.y;
      updateRect(viewpointCoord.x, viewpointCoord.y)    // 同时改变矩形位置

      // 更新svg图的位置
      const outputSVGTransform = d3.zoomTransform(outputSVG)
        .translate(-d3.event.x * transform.k * scale / fitK, -d3.event.y * transform.k * scale / fitK)
        .scale(transform.k)
      updateZoomofD3(outputSVGTransform)
      d3.select(outputG).attr("transform",
        `translate(${-d3.event.x * transform.k * scale / fitK},${-d3.event.y * transform.k * scale / fitK}) scale(${transform.k})`
      )
    };
    const dragend = () => { // 拖拽结束，设置transform
      setTransform({ x: -viewpointCoord.x * transform.k * scale / fitK, y: -viewpointCoord.y * transform.k * scale / fitK, k: transform.k })
      // setViewpointCoord({ x: d3.event.x, y: d3.event.y })
    }

    let drag = d3.drag().subject(Object).on('drag', dragmove).on("end", dragend);

    d3.select(rectRef.current).datum(viewpointCoord as any).call(drag);
  }, [transform])

  return (
    <div className={'mini-map'} style={{ width: minimapSize.width, height: minimapSize.height }}>
      <svg>
        <defs>
          <filter id="minimapDropShadow" x="-20%" y="-20%" width="150%" height="150%">
            <feOffset result="offOut" in="SourceGraphic" dx="1" dy="1"></feOffset>
            <feColorMatrix result="matrixOut" in="offOut" type="matrix" values="0.1 0 0 0 0 0 0.1 0 0 0 0 0 0.1 0 0 0 0 0 0.5 0"></feColorMatrix>
            <feBlend in="SourceGraphic" in2="blurOut" mode="normal"></feBlend>
          </filter>
        </defs>
        <g>
          <rect
            ref={rectRef}
            transform={`translate(${viewpointCoord.x},${viewpointCoord.y}) scale(${1 / transform.k})`}
            width={minimapSize.width}
            height={minimapSize.height}
            style={{ 'fill': '#c0d3ff', 'fillOpacity': 0.3, 'strokeWidth': 0 }}
          />
        </g>
      </svg>
      <canvas ref={canvasRef} width={minimapSize.width} height={minimapSize.height} style={{ 'border': 'none' }} />
    </div>
  );
}

export default MiniMap;