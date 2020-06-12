import React, { useEffect, useRef, useState } from "react";
import "./ELKLayoutGraph.css";
import * as d3 from "d3";
import { useProcessedGraph, modifyProcessedGraph, ProcessedGraphModificationType } from '../../store/processedGraph';
import { NodeType, Attribute, LayerType, DataType, RawEdge, GroupNode, LayerNode, GroupNodeImp, LayerNodeImp, DataNodeImp, OperationNode, OperationNodeImp, ModuleEdge } from '../../common/graph-processing/stage2/processed-graph'
import { useGlobalConfigurations } from '../../store/global-configuration'
import { ModifyLineData } from '../../types/layerLevel'
import { useHistory, useLocation } from "react-router-dom";
import { modifyData } from '../../store/layerLevel';
import NodeInfoCard from "../NodeInfoCard/NodeInfoCard"
import MiniMap from '../MiniMap/MiniMap';
import PopoverBox from '../PopoverBox/PopoverBox';
import { fetchAndGetLayerInfo } from '../../common/model-level/snaphot'

import ELK from "elkjs/lib/elk.bundled.js";
import ELKLayoutEdge from "./ELKLayoutEdge";
import ELKLayoutNode from "./ELKLayoutNode";
window["d3"] = d3;
window["ELK"] = ELK;

const ELKLayoutGraph: React.FC<{ iteration: number }> = (props: { iteration }) => {
  let iteration = props.iteration;
  const history = useHistory();
  const svgRef = useRef();
  const outputRef = useRef();
  const outputSVGRef = useRef();
  const { diagnosisMode, isHiddenInterModuleEdges } = useGlobalConfigurations();

  const [bgRectHeight, setBgRectHeight] = useState(0);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const handleChangeTransform = function (transform) {
    if (transform === null || transform === undefined) return;
    setTransform(transform);
  };

  const graphForLayout = useProcessedGraph();
  const [selectMode, setSelectMode] = useState(false);// 单选模式
  const [anchorEl, setAnchorEl] = useState(null);// popover的位置
  const [currentNodetype, setCurrentNodetype] = useState<number>(-1);
  const [currentLayertype, setCurrentLayertype] = useState<string>(null);
  const [currentShowLineChart, setCurrentShowLineChart] = useState<boolean>(true);
  const [currentNotShowLineChartID, setCurrentNotShowLineChartID] = useState([])
  const [layerLineChartData, setLayerLineChartData] = useState({})

  let ctrlKey, // 刷选用ctrl不用shift，因为在d3 brush中已经赋予了shift含义（按住shift表示会固定刷取的方向），导致二维刷子刷不出来
    shiftKey, // 单选用shift
    brushMode,// 框选模式
    gBrushHolder,
    gBrush,// 放置brush的group
    brush;// d3 brush

  let node = null;// 所有node group
  let svgBoundingClientRect = null;


  const handleAggregate = () => {
    let inputNode = d3.select(`#group-name-input`).node() as HTMLInputElement;
    let groupName = inputNode.value;
    let selectedG = d3.select(svgRef.current).selectAll("g.selected");

    if (!selectedG.nodes().length) {
      alert("Please select nodes first!");
    } else if (!groupName) {
      alert("Please input group name!");
    } else if (groupName in graphForLayout.nodeMap) {
      alert("Duplicated group name!");
    } else {
      let selectedNodeId = []; // 选中的node id
      let parentId = null;
      let aggregateFlag = true;
      selectedG.each(function () {
        let nodeId = d3.select(this).attr("id").replace(/-/g, '/');// 还原Id
        let node = graphForLayout.nodeMap[nodeId];
        selectedNodeId.push(nodeId);
        // 找到共同父节点 如果父节点不相同则不能聚合
        if (!parentId) {
          parentId = node.parent;
        } else if (aggregateFlag && parentId !== node.parent) {
          aggregateFlag = false;
        }
      })

      if (!aggregateFlag) {
        alert("Aggregation can only be applied at the same level!");
      } else {
        modifyProcessedGraph(
          ProcessedGraphModificationType.NEW_NODE,
          {
            newNodeIdInfo: {
              id: groupName,
              children: new Set(selectedNodeId),
              parent: parentId
            }
          }
        )
      }
    }
  }

    // ungroup一个group node or layer node
    const handleUngroup = () => {
      let selectedG = d3.select(svgRef.current).selectAll("g.selected");
      selectedG.each(function () {
        let nodeId = d3.select(this).attr("id").replace(/-/g, '/'); //还原为nodemap中存的id格式
        modifyProcessedGraph(
          ProcessedGraphModificationType.DELETE_NODE,
          {
            nodeId
          }
        );
      })
    }

      // 修改节点属性, 暂时只考虑了修改单个节点属性
  const handleModifyNodetype = () => {
    let selectedG = d3.select(svgRef.current).selectAll("g.selected");
    selectedG.each(function () {
      let nodeId = d3.select(this).attr("id").replace(/-/g, '/'); //还原为nodemap中存的id格式
      let oldNode = graphForLayout.nodeMap[nodeId] as GroupNode | LayerNode;

      // 判断是否修改
      let newNode;
      // 折线图默认全部显示，不显示的节点Id存在数组里
      if (diagnosisMode && currentShowLineChart === false && currentNotShowLineChartID.indexOf(nodeId) < 0) {
        setCurrentNotShowLineChartID([...currentNotShowLineChartID, nodeId])
      } else if (diagnosisMode && currentShowLineChart === true && currentNotShowLineChartID.indexOf(nodeId) >= 0) {
        let pos = currentNotShowLineChartID.indexOf(nodeId)
        currentNotShowLineChartID.splice(pos, 1)
        setCurrentNotShowLineChartID(currentNotShowLineChartID)
      }
      if (oldNode.type !== currentNodetype) {// 修改了节点类型
        let opts = { displayedName: oldNode.displayedName };
        if (currentNodetype === NodeType.GROUP) {
          modifyProcessedGraph(
            ProcessedGraphModificationType.MODIFY_NODE_TYPE,
            {
              nodeId: oldNode.id,
              modifyOptions: {
                id: oldNode.id,
                children: oldNode.children,
                parent: oldNode.parent,
                opts,
              }
            }
          )
        } else if (currentNodetype === NodeType.LAYER) {
          modifyProcessedGraph(
            ProcessedGraphModificationType.MODIFY_NODE_TYPE,
            {
              nodeId: oldNode.id,
              modifyOptions: {
                id: oldNode.id,
                children: oldNode.children,
                parent: oldNode.parent,
                layerType: LayerType[currentLayertype],
                opts,
              }
            }
          )
        }
      } else if (oldNode.type === NodeType.LAYER && (oldNode as LayerNode).layerType !== currentLayertype) {
        modifyProcessedGraph(
          ProcessedGraphModificationType.MODIFY_NODE_ATTR,
          {
            nodeId: oldNode.id,
            modifyOptions: {
              layerType: LayerType[currentLayertype]
            }
          }
        );
      }
    })
  }

  // 两种情况：
  // 1. 当前没有选中的节点，右击一个节点，如果为group node或者layer node，则可以修改节点类型或者进行ungroup
  // 2. 当前有选中的节点，右击，可以选择是否聚合
  const handleRightClick = (e) => {
    console.log("handle right click")
    e.preventDefault();
    let selectedG = d3.select(svgRef.current).selectAll("g.selected");
    // 如果当前没有选中任何节点，或者只选中了一个，则表示选中当前右击的节点进行修改
    if (selectedG.nodes().length <= 1 && e.target) {
      let clickNode;
      if (!selectedG.nodes().length) {
        let tempNode = e.target.parentNode;
        while (!tempNode.getAttribute("class") || tempNode.getAttribute("class").indexOf("nodetype") < 0) {
          tempNode = tempNode.parentNode;
        }
        clickNode = tempNode;
      } else {
        clickNode = selectedG.node();
      }
      let nodeId = d3.select(clickNode).attr("id").replace(/-/g, '/'); //还原为nodemap中存的id格式
      // if(nodeId.startsWith("node_")) nodeId = nodeId.split("node_")[1];
      let node = graphForLayout.nodeMap[nodeId];
      if (node.type !== NodeType.GROUP && node.type !== NodeType.LAYER) {
        alert("Node type modification and ungroup operation can only be applied to group node or layer node!");
      } else {
        d3.select(clickNode).classed("selected", true);
        setCurrentNodetype(node.type);
        if (node.type === NodeType.LAYER) {
          setCurrentLayertype((node as LayerNode).layerType);
        }
        setAnchorEl(e.target);
      }
    } else {// 已有选中节点，则选项为聚合
      setAnchorEl(e.target);
      setCurrentNodetype(-1);
      setCurrentLayertype(null)
    }
  }
  // 关闭popover
  const handleClosePopover = () => {
    node = d3.select(".nodes").selectAll(".node");
    node.classed("selected", false);
    node.classed("previouslySelected", false);
    setAnchorEl(null);
    //关闭时更新以下state会导致popover重新渲染出现内容重叠问题
    // setCurrentNodetype(-1);
    setCurrentLayertype(null)
  }
  const handleClosePopoverWithoutDeselect = () => {
    setAnchorEl(null);
    //关闭时更新以下state会导致popover重新渲染出现内容重叠问题
    // setCurrentNodetype(-1);
    setCurrentLayertype(null)
  }

  // 修改node type
  const handleNodetypeChange = (e) => {
    setCurrentNodetype(e.target.value);
    setCurrentLayertype(LayerType.CONV);
  }

  // 修改layer type
  const handleLayertypeChange = (e) => {
    setCurrentLayertype(e.target.value)
  }

  const handleLineChartToggle = (e) => {
    setCurrentShowLineChart(e.target.value === "true" ? true : false)
  }
  // 点击空白处取消所有选择
  const handleBgClick = () => {
    setSelectedNodeId("");
  };

  // 按键事件
  // 按下ctrl开始刷选
  // 按下shift可以单击
  const keydown = () => {
    ctrlKey = d3.event.ctrlKey;
    shiftKey = d3.event.shiftKey;
    if (ctrlKey) { // 按下ctrl开始刷选
      if (gBrush) {
        return;
      } else {
        brushMode = true;
        gBrush = gBrushHolder.append('g');
        gBrush.call(brush);
      }
    }
    if (shiftKey) { // 按下shift可以单击
      setSelectMode(true);
    }
  }

  const keyup = () => {
    // 如果是按下ctrl
    if (brushMode) {
      ctrlKey = false;
      brushMode = false;
      if (!gBrush)
        return;
      gBrush.remove();
      gBrush = null;
    } else { // 按下shift
      shiftKey = false;
      setSelectMode(false);
    }
  }

  const handleEnterLayer = async () => {
    alert
    let selectedG = d3.select(svgRef.current).selectAll("g.selected");
    let node = selectedG.node();
    let nodeId = d3.select(node).attr("id");
    let lineData = await fetchAndGetLayerInfo({
      "STEP_FROM": iteration,
      "STEP_TO": iteration + 100
    }, nodeId, graphForLayout);
    modifyData(ModifyLineData.UPDATE_Line, lineData)
    history.push("layer")
  }

  const brushstart = () => {
    node = d3.select(".nodes").selectAll(".node");
    node.each(function () {
      const previouslySelected = d3.select(this).attr("class").indexOf("selected") > -1 ? true : false;
      d3.select(this).classed("previouslySelected", ctrlKey && previouslySelected);
    });
  }

  const brushed = () => {
    if (!d3.event.sourceEvent) return;
    if (!d3.event.selection) return;

    let extent = d3.event.selection;
    node.classed("selected", function () {
      if (d3.select(this).attr("class").indexOf("cluster") > -1) {// 展开的cluster节点不刷选
        return false;
      }
      const bounding = this.getBoundingClientRect();
      let xCenter = (bounding.x - svgBoundingClientRect.x) + bounding.width * 0.5;
      let yCenter = bounding.y - svgBoundingClientRect.y + bounding.height * 0.5;
      let inExtent = extent[0][0] <= xCenter && xCenter < extent[1][0]
        && extent[0][1] <= yCenter && yCenter < extent[1][1] ? 1 : 0;
      const previouslySelected = d3.select(this).attr("class").indexOf("previouslySelected") > -1 ? 1 : 0;
      return previouslySelected ^ inExtent;
    });
  }

  const brushend = () => {
    if (!d3.event.sourceEvent) return;
    if (!d3.event.selection) return;
    if (!gBrush) return;

    node.classed("previouslySelected", function () {
      const previouslySelected = d3.select(this).attr("class").indexOf("select") > -1 ? true : false;
      return previouslySelected;
    });

    gBrush.call(brush.move, null);

    if (!brushMode) {
      gBrush.remove();
      gBrush = null;
    }
  }


  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const outputG = d3.select(outputRef.current);

    let zoom = d3
      .zoom()
      .on("zoom", function () {
        outputG.attr("transform", d3.event.transform);
      })
      .on("end", () => {
        setTransform(d3.event.transform);
      });
    svg.call(zoom).on("dblclick.zoom", null);

    // 获得背景rect的高度
    const svgNode = svg.node() as HTMLElement;
    const svgWidth = svgNode.clientWidth;
    const svgHeight = svgNode.clientHeight;

    svgBoundingClientRect = svgNode.getBoundingClientRect();

    // 刷选
    gBrushHolder = d3.select("#gBrushHolder");
    d3.select('body').on('keydown', keydown);
    d3.select('body').on('keyup', keyup);
    brushMode = false;
    gBrush = null;
    brush = d3.brush()
      .extent([[0, 0], [svgWidth, svgHeight]])
      .on("start", brushstart)
      .on("brush", brushed)
      .on("end", brushend);

    setBgRectHeight(svgHeight);
  }, []);
  const isPopoverOpen = Boolean(anchorEl);

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
        <rect
          className="bg-rect"
          width="100%"
          height={bgRectHeight}
          onClick={() => handleBgClick()}
        ></rect>

        <svg id="output-svg" ref={outputSVGRef}>
          <g className="output" id="output-g" ref={outputRef}>
            <ELKLayoutNode
              selectedNodeId={selectedNodeId}
              setSelectedNodeId={setSelectedNodeId}
              handleRightClick={handleRightClick}
            />
            <ELKLayoutEdge />
          </g>
        </svg>
        <g id="gBrushHolder"></g>
      </svg>

      <NodeInfoCard selectedNodeId={selectedNodeId} />

      <div className="minimap-container">
        <MiniMap
          graph={svgRef.current}
          outputSVG={outputSVGRef.current}
          outputG={outputRef.current}
          transform={transform}
          handleChangeTransform={handleChangeTransform}
        />
      </div>
      <PopoverBox
        isPopoverOpen={isPopoverOpen}
        anchorEl={anchorEl}
        currentNodetype={currentNodetype}
        handleClosePopoverWithoutDeselect={handleClosePopoverWithoutDeselect}
        handleClosePopover={handleClosePopover}
        handleAggregate={handleAggregate}
        handleUngroup={handleUngroup}
        handleNodetypeChange={handleNodetypeChange}
        currentLayertype={currentLayertype}
        handleLayertypeChange={handleLayertypeChange}
        currentShowLineChart={currentShowLineChart}
        handleLineChartToggle={handleLineChartToggle}
        handleModifyNodetype={handleModifyNodetype}
        handleEnterLayer={handleEnterLayer}
      />
    </div>
  );
};

export default ELKLayoutGraph;
