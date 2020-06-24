import React from 'react';
import './LayerNodeGraph.less'

interface LayerNodeProps {
  width: number;
  height: number;
  layerType: string;
  focused: boolean;
}

export function LayerNodeContainer(props: LayerNodeProps) {
  const { width, height, layerType, focused } = props;
  let gClassName = layerType + "-layer-label-g";
  let containerClassName = layerType + "-layer-label-container";
  if (focused) containerClassName += " focus";
  return (
    <g className={gClassName}
      transform={`translate(-${width / 2}, -${height / 2})`}>
      <rect className={containerClassName} width={width} height={height}></rect>
    </g>
  )
}

