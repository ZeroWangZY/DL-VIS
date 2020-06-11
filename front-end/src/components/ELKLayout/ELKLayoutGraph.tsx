import React, { useEffect, useRef, useState } from "react";
import "./ELKLayoutGraph.css";
import * as d3 from "d3";
import { useProcessedGraph } from '../../store/processedGraph';
import { NodeType, Attribute, LayerType, DataType, RawEdge, GroupNode, LayerNode, GroupNodeImp, LayerNodeImp, DataNodeImp, OperationNode, OperationNodeImp, ModuleEdge } from '../../common/graph-processing/stage2/processed-graph'
import NodeInfoCard from "../NodeInfoCard/NodeInfoCard"
import MiniMap from '../MiniMap/MiniMap';

import ELK from "elkjs/lib/elk.bundled.js";
import ELKLayoutEdge from './ELKLayoutEdge'
import ELKLayoutNode from './ELKLayoutNode'
window["d3"] = d3;
window["ELK"] = ELK;

const ELKLayoutGraph: React.FC = () => {
  const svgRef = useRef();
  const outputRef = useRef();
  const outputSVGRef = useRef();

  const [bgRectHeight, setBgRectHeight] = useState(0);

  const [outputNodeName, setOutputNodeName] = useState([]);
  const [inputNodeName, setInputNodeName] = useState([]);
  const [selectedNodeName, setSelectedNodeName] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState("");
  const [leafAndChildrenNum, setLeafAndChildrenNum] = useState([]);
  const [nodeAttribute, setNodeAttribute] = useState([]);

  const handleChangeOutputNodeName = function (name: string[]): void {
    setOutputNodeName(name);
  }
  const handleChangeInputNodeName = function (name: string[]): void {
    setInputNodeName(name);
  }
  const handleChangeSelectedNodeName = function (name: string): void {
    setSelectedNodeName(name);
  }
  const handleChangeSelectedNodeId = function (name: string): void {
    setSelectedNodeId(name);
  }
  const handleChangeLeafAndChildrenNum = function (num: Number[]): void {
    setLeafAndChildrenNum(num);
  }
  const handleChangeNodeAttribute = function (attr: Attribute[]): void {
    setNodeAttribute(attr);
  }

  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const handleChangeTransform = function (transform) {
    if (transform === null || transform === undefined) return;
    setTransform(transform);
  }

  // 点击空白处取消所有选择
  const handleBgClick = () => {
    setSelectedNodeId("");
  }


  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const outputG = d3.select(outputRef.current);

    let zoom = d3.zoom()
      .on('zoom', function () {
        outputG.attr('transform', d3.event.transform);
      })
      .on("end", () => {
        setTransform(d3.event.transform);
      })
    svg.call(zoom).on('dblclick.zoom', null);

     // 获得背景rect的高度
     const svgNode = svg.node() as HTMLElement;
     const svgWidth = svgNode.clientWidth;
     const svgHeight = svgNode.clientHeight;
     
     setBgRectHeight(svgHeight);
  }, []);

  return (
    <div id="elk-graph" style={{ height: "100%" }}>
      <svg id="elk-svg" ref={svgRef} style={{ height: "100%" }}>
        <defs>
          <marker
            id="arrowhead"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerUnits="strokeWidth"
            markerWidth="8"
            markerHeight="6"
            orient="auto"
          >
            <path
              d="M 0 0 L 10 5 L 0 10 L 4 5 z"
              fill="#999999"
              stroke="#999999"
            ></path>
          </marker>
        </defs>
        <rect className="bg-rect" width="100%" height={bgRectHeight} onClick={() => handleBgClick()}></rect>

        <svg id="output-svg" ref={outputSVGRef}>
          <g className="output" id="output-g" ref={outputRef}>
            <ELKLayoutNode
              handleChangeOutputNodeName={handleChangeOutputNodeName}
              handleChangeInputNodeName={handleChangeInputNodeName}
              handleChangeSelectedNodeName={handleChangeSelectedNodeName}
              handleChangeSelectedNodeId={handleChangeSelectedNodeId}
              handleChangeLeafAndChildrenNum={handleChangeLeafAndChildrenNum}
              handleChangeNodeAttribute={handleChangeNodeAttribute}
              selectedNodeId={selectedNodeId}
            />
            <ELKLayoutEdge />
          </g>
        </svg>
      </svg>

      <NodeInfoCard
        selectedNodeName={selectedNodeName}
        leafAndChildrenNum={leafAndChildrenNum}
        inputNodeName={inputNodeName}
        outputNodeName={outputNodeName}
        nodeAttribute={nodeAttribute} />

      <div className="minimap-container">
        <MiniMap
          graph={svgRef.current}
          outputSVG={outputSVGRef.current}
          outputG={outputRef.current}
          transform={transform}
          handleChangeTransform={handleChangeTransform}
        />
      </div>

    </div>
  );
};

export default ELKLayoutGraph;
