import React from 'react';
import './LayerNodeGraph.css'

interface LayerNodeProps {
  width: number;
  height: number;
}

export function FCLayerNode (props: LayerNodeProps) {
  const {width, height} = props;
  return (
    <g className="fc-layer-label-g"
      transform={`translate(-${width / 2}, -${height / 2})`}>
      <rect className='fc-layer-label-container'
        width={width}
        height={height}></rect>
      <line x1={0} y1={0} x2={width} y2={height / 2}></line>
      <line x1={0} y1={0} x2={width} y2={height}></line>
      <line x1={0} y1={height / 2} x2={width} y2={0}></line>
      <line x1={0} y1={height / 2} x2={width} y2={height / 2}></line>
      <line x1={0} y1={height / 2} x2={width} y2={height}></line>
      <line x1={0} y1={height} x2={width} y2={0}></line>
      <line x1={0} y1={height} x2={width} y2={height / 2}></line>
      <circle r='4'></circle>
      <circle r='4' cy={height / 2}></circle>
      <circle r='4' cy={height}></circle>
      <circle r='4' cx={width}></circle>
      <circle r='4' cx={width} cy={height / 2}></circle>
      <circle r='4' cx={width} cy={height}></circle>
    </g>
  )
}

export function CONVLayerNode (props: LayerNodeProps) {
  const {width, height} = props;
  return (
    <g className="conv-layer-label-g"
      transform={`translate(-${width / 2}, -${height / 2})`}>
      <rect width={width} height={height} x="-8" y="-8"></rect>
      <rect width={width} height={height} x="-4" y="-4"></rect>
      <rect width={width} height={height}></rect>
    </g>
  )
}

export function RNNLayerNode (props: LayerNodeProps) {
  const {width, height} = props;
  return (
    <g className="rnn-layer-label-g"
      transform={`translate(-${width / 2}, -${height / 2})`}>
      <rect className="rnn-layer-label-container" width={width} height={height}></rect>
      <path d={`M3 ${height * 0.5} L3 3 L${width-3} 3`} markerEnd="url(#rnn-arrowhead)"/>
      <path d={`M${width-3} ${height * 0.5} L${width-3} ${height - 3} L3 ${height - 3}`} markerEnd="url(#rnn-arrowhead)"/>
    </g>
  )
}

export function OTHERLayerNode (props: LayerNodeProps) {
  const {width, height} = props;
  return (
    <g className="other-layer-label-g"
      transform={`translate(-${width / 2}, -${height / 2})`}>
      <rect className="other-layer-label-container" width={width} height={height} rx="5" ry="5"></rect>
    </g>
  )
}

