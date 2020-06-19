import React from 'react';
import './LayerNodeGraph.less'

interface LayerNodeProps {
  width: number;
  height: number;
}

export function FCLayerNode(props: LayerNodeProps) {
  const { width, height } = props;
  return (
    <g className="fc-layer-label-g"
      transform={`translate(-${width / 2}, -${height / 2})`}>
      <rect className='fc-layer-label-container' width={width} height={height}></rect>
    </g>
  )
}

export function CONVLayerNode(props: LayerNodeProps) {
  const { width, height } = props;
  return (
    <g className="conv-layer-label-g"
      transform={`translate(-${width / 2}, -${height / 2})`}>
      <rect width={width} height={height}></rect>
    </g>
  )
}

export function RNNLayerNode(props: LayerNodeProps) {
  const { width, height } = props;
  return (
    <g className="rnn-layer-label-g"
      transform={`translate(-${width / 2}, -${height / 2})`}>
      <rect className="rnn-layer-label-container" width={width} height={height}></rect>
    </g>
  )
}

export function OTHERLayerNode(props: LayerNodeProps) {
  const { width, height } = props;
  return (
    <g className="other-layer-label-g"
      transform={`translate(-${width / 2}, -${height / 2})`}>
      <rect className="other-layer-label-container" width={width} height={height} rx="5" ry="5"></rect>
    </g>
  )
}

