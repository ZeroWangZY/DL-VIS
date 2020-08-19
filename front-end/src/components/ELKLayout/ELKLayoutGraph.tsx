import React, { useEffect, useRef, useState, useImperativeHandle } from "react";
import "./ELKLayoutGraph.less";
import styles from "../../CSSVariables/CSSVariables.less";
import * as d3 from "d3";
import { Popover, Button, Tooltip } from 'antd';
import {
  useProcessedGraph,
  modifyProcessedGraph,
  ProcessedGraphModificationType,
} from "../../store/processedGraph";
import {
  NodeType,
  LayerType,
  GroupNode,
  LayerNode,
} from "../../common/graph-processing/stage2/processed-graph";
import {
  useGlobalConfigurations,
  modifyGlobalConfigurations,
} from "../../store/global-configuration";
import { GlobalConfigurationsModificationType } from "../../store/global-configuration.type";
import {
  useGlobalStates,
  modifyGlobalStates,
} from "../../store/global-states";
import { GlobalStatesModificationType } from "../../store/global-states.type";
import { useHistory } from "react-router-dom";
import NodeInfoCard from "../NodeInfoCard/NodeInfoCard";
import MiniMap from "../MiniMap/MiniMap";
import PopoverBox from "../PopoverBox/PopoverBox";
import InteractiveIcon from "../InteractiveIcon/InteractiveIcon";
import ELK from "elkjs/lib/elk.bundled.js";
import ELKLayoutEdge from "./ELKLayoutEdge";
import ELKLayoutNode from "./ELKLayoutNode";
import ELKLayoutPort from "./ELKLayoutPort";
window["d3"] = d3;
window["ELK"] = ELK;

let isFirstAddEventListener = true;
let popoverFlag = true;
const arrowStrokeColor = styles.arrow_stroke_color;
const arrowFillColor = styles.arrow_fill_color;
const hoverEdgePathStrokeColor = styles.hover_edge_path_stroke_color;
const highlight_edge_path_stroke_color = styles.highlight_edge_path_stroke_color;
interface Props {
  iteration: number;
}

const ELKLayoutGraph: React.FC<Props> = (props: Props) => {
  const { iteration } = props;
  const iconHeight = 25,
    iconPadding = 5,
    firstIconBottom = 30; //左下角交互图标高度，图标上下间隔，最下面一个图标距离底边的距离

  const history = useHistory();
  const svgRef = useRef();
  const outputRef = useRef();
  const outputSVGRef = useRef();
  const {
    diagnosisMode,
    isHiddenInterModuleEdges,
  } = useGlobalConfigurations();
  const { selectedNodeId } = useGlobalStates();

  const [bgRectHeight, setBgRectHeight] = useState(0);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const handleChangeTransform = function (transform) {
    if (transform === null || transform === undefined) return;
    setTransform(transform);
  };

  const graphForLayout = useProcessedGraph();
  const [selectMode, setSelectMode] = useState(false); // 单选模式
  const [anchorEl, setAnchorEl] = useState(null); // popover的位置
  const [currentNodetype, setCurrentNodetype] = useState<number>(-1);
  const [currentLayertype, setCurrentLayertype] = useState<string>(null);
  const [currentShowLineChart, setCurrentShowLineChart] = useState<boolean>(
    true
  );
  const [currentNotShowLineChartID, setCurrentNotShowLineChartID] = useState(
    []
  );

  const [layoutModificationMode, setLayoutModificationMode] = useState<boolean>(
    false
  );
  //路径选取模式相关功能：
  const [isPathFindingMode, setIsPathFindingMode] = useState(false);
  const togglePathFindingMode = () => {
    setIsPathFindingMode(!isPathFindingMode);
  };
  const [startNodeId, setStartNodeId] = useState<string>(null);
  const [endNodeId, setEndNodeId] = useState<string>(null);
  const [editingNodeId, setEditingNodeId] = useState<string>(null);
  const [highlightPath, setHighlightPath] = useState<Set<string>>(new Set());
  const [shouldShowDisplaySwitchPopover, toggleShouldShowDisplaySwitchPopover] = useState<boolean>(
    false
  );
  enum classOfEdge {
    edgePath,
    startId,
    endId,
  }
  let passNodesIds = [];
  let pathFoundFlag = false;
  const classForPath: Set<string> = new Set();
  function generateClassForPath() {
    const copyOfPassNodesIds = passNodesIds.slice();
    copyOfPassNodesIds.unshift(startNodeId);
    copyOfPassNodesIds.push(endNodeId);
    for (let i = 0; i < copyOfPassNodesIds.length - 1; i++) {
      classForPath.add(`${copyOfPassNodesIds[i]} ${copyOfPassNodesIds[i + 1]}`);
    }
  }
  function findPath(startId, endId) {
    const relatedEdges = document.querySelectorAll(`.${startId}`);
    const forwardEdges = Array.from(relatedEdges).filter((edge) => {
      return edge.classList[classOfEdge["startId"]] == startId;
    });
    const forwardNodes = new Set();
    if (forwardEdges.length) {
      forwardEdges.forEach((edge) => {
        forwardNodes.add(edge.classList[classOfEdge["endId"]]);
      });
    } else {
      passNodesIds.pop();
      return;
    }
    forwardNodes.forEach((node) => {
      if (passNodesIds.includes(node)) {
        //是个环
        return;
      }
      if (node == endId) {
        pathFoundFlag = true;
        generateClassForPath();
        return;
      } else if (node == startId) {
        //是个环
        return;
      } else {
        passNodesIds.push(node);
        findPath(node, endId);
      }
    });
    passNodesIds.pop();
    return pathFoundFlag;
  }
  useEffect(() => {
    if (startNodeId && endNodeId) {
      pathFoundFlag = false;
      if (findPath(startNodeId, endNodeId)) {
        setHighlightPath(classForPath);
      } else {
        setHighlightPath(new Set());
        alert("Path not found!");
      }
    }
  }, [startNodeId, endNodeId]);
  const handleSetStart = () => {
    if (editingNodeId == endNodeId) {
      setEndNodeId(null);
      setHighlightPath(new Set());
    }
    setStartNodeId(editingNodeId);
    handleClosePopover();
  };
  const handleSetEnd = () => {
    if (editingNodeId == startNodeId) {
      setStartNodeId(null);
      setHighlightPath(new Set());
    }
    setEndNodeId(editingNodeId);
    handleClosePopover();
  };

  let ctrlKey, // 刷选用ctrl不用shift，因为在d3 brush中已经赋予了shift含义（按住shift表示会固定刷取的方向），导致二维刷子刷不出来
    shiftKey, // 单选用shift
    brushMode, // 框选模式
    gBrushHolder,
    gBrush, // 放置brush的group
    brush; // d3 brush

  let node = null; // 所有node group
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
        let nodeId = d3.select(this).attr("data-id");
        let node = graphForLayout.nodeMap[nodeId];
        selectedNodeId.push(nodeId);
        // 找到共同父节点 如果父节点不相同则不能聚合
        if (!parentId) {
          parentId = node.parent;
        } else if (aggregateFlag && parentId !== node.parent) {
          aggregateFlag = false;
        }
      });

      if (!aggregateFlag) {
        alert("Aggregation can only be applied at the same level!");
      } else {
        modifyProcessedGraph(ProcessedGraphModificationType.NEW_NODE, {
          newNodeIdInfo: {
            id: groupName,
            children: new Set(selectedNodeId),
            parent: parentId,
          },
        });
      }
    }
  };

  // ungroup一个group node or layer node
  const handleUngroup = () => {
    let selectedG = d3.select(svgRef.current).selectAll("g.selected");
    selectedG.each(function () {
      let nodeId = d3.select(this).attr("data-id");
      modifyProcessedGraph(ProcessedGraphModificationType.DELETE_NODE, {
        nodeId,
      });
    });
    handleClosePopover();
  };

  // 修改节点属性, 暂时只考虑了修改单个节点属性
  const handleModifyNodetype = () => {
    let selectedG = d3.select(svgRef.current).selectAll("g.selected");
    selectedG.each(function () {
      let nodeId = d3.select(this).attr("data-id");
      let oldNode = graphForLayout.nodeMap[nodeId] as GroupNode | LayerNode;
      // 判断是否修改
      let newNode;
      // 折线图默认全部显示，不显示的节点Id存在数组里
      if (
        diagnosisMode &&
        currentShowLineChart === false &&
        currentNotShowLineChartID.indexOf(nodeId) < 0
      ) {
        setCurrentNotShowLineChartID([...currentNotShowLineChartID, nodeId]);
      } else if (
        diagnosisMode &&
        currentShowLineChart === true &&
        currentNotShowLineChartID.indexOf(nodeId) >= 0
      ) {
        let pos = currentNotShowLineChartID.indexOf(nodeId);
        currentNotShowLineChartID.splice(pos, 1);
        setCurrentNotShowLineChartID(currentNotShowLineChartID);
      }
      if (oldNode.type !== currentNodetype) {
        // 修改了节点类型
        let opts = { displayedName: oldNode.displayedName };
        if (currentNodetype === NodeType.GROUP) {
          modifyProcessedGraph(
            ProcessedGraphModificationType.MODIFY_NODE_TYPE,
            {
              nodeId: oldNode.id,
              modifyOptions: {
                id: oldNode.id,
                visibility: oldNode.visibility,
                expanded: oldNode.expanded,
                leafOperationNodeCount: oldNode.leafOperationNodeCount,
                operationChildrenCount: oldNode.operationChildrenCount,
                outModuleConnection: oldNode.outModuleConnection,
                inModuleConnection: oldNode.inModuleConnection,
                type: oldNode.type,
                belongModule: oldNode.belongModule,
                children: oldNode.children,
                inputNode: oldNode.inputNode,
                outputNode: oldNode.outputNode,
                parent: oldNode.parent,
                opts,
                isModule: oldNode.isModule,
                parentModule: oldNode.parentModule,
              },
            }
          );
        } else if (currentNodetype === NodeType.LAYER) {
          modifyProcessedGraph(
            ProcessedGraphModificationType.MODIFY_NODE_TYPE,
            {
              nodeId: oldNode.id,
              modifyOptions: {
                id: oldNode.id,
                visibility: oldNode.visibility,
                expanded: oldNode.expanded,
                leafOperationNodeCount: oldNode.leafOperationNodeCount,
                operationChildrenCount: oldNode.operationChildrenCount,
                outModuleConnection: oldNode.outModuleConnection,
                inModuleConnection: oldNode.inModuleConnection,
                type: oldNode.type,
                belongModule: oldNode.belongModule,
                children: oldNode.children,
                inputNode: oldNode.inputNode,
                outputNode: oldNode.outputNode,
                parent: oldNode.parent,
                opts,
                isModule: oldNode.isModule,
                parentModule: oldNode.parentModule,
                layerType: LayerType[currentLayertype],
              },
            }
          );
        }
      } else if (
        oldNode.type === NodeType.LAYER &&
        (oldNode as LayerNode).layerType !== currentLayertype
      ) {
        modifyProcessedGraph(ProcessedGraphModificationType.MODIFY_NODE_ATTR, {
          nodeId: oldNode.id,
          modifyOptions: {
            layerType: LayerType[currentLayertype],
          },
        });
      }
    });
    handleClosePopover();
  };

  // 两种情况：
  // 1. 当前没有选中的节点，右击一个节点，如果为group node或者layer node，则可以修改节点类型或者进行ungroup
  // 2. 当前有选中的节点，右击，可以选择是否聚合
  const handleRightClick = (e) => {
    e.preventDefault();
    if (!isPathFindingMode) {
      //路径模式未开启，可以编辑节点类型
      let selectedG = d3.select(svgRef.current).selectAll("g.selected");
      // 如果当前没有选中任何节点，或者只选中了一个，则表示选中当前右击的节点进行修改
      if (selectedG.nodes().length <= 1 && e.target) {
        let clickNode;
        if (!selectedG.nodes().length) {
          let tempNode = e.target.parentNode;
          while (
            !tempNode.getAttribute("class") ||
            tempNode.getAttribute("class").indexOf("nodeitem") < 0
          ) {
            tempNode = tempNode.parentNode;
          }
          clickNode = tempNode;
        } else {
          clickNode = selectedG.node();
        }
        let nodeId = d3.select(clickNode).attr("data-id");
        let node = graphForLayout.nodeMap[nodeId];
        if (node.type !== NodeType.GROUP && node.type !== NodeType.LAYER) {
          alert(
            "Node type modification and ungroup operation can only be applied to group node or layer node!"
          );
        } else {
          d3.select(clickNode).classed("selected", true);
          setCurrentNodetype(node.type);
          if (node.type === NodeType.LAYER) {
            setCurrentLayertype((node as LayerNode).layerType);
          }
          setAnchorEl(e.target);
        }
      } else {
        // 已有选中节点，则选项为聚合
        setAnchorEl(e.target);
        setCurrentNodetype(-1);
        setCurrentLayertype(null);
      }
    } else {
      //路径模式开启，处理点选逻辑
      setCurrentNodetype(0); //设置一下currentNodeType，否则默认为-1表示选中了多个节点，会影响路径模式下的popover
      e.currentTarget.classList.add("selected");
      setEditingNodeId(e.currentTarget.getAttribute("id"));
      setAnchorEl(e.target);
    }
  };
  // 关闭popover
  const handleClosePopover = () => {
    node = d3.select(".nodes").selectAll(".node");
    node.classed("selected", false);
    node.classed("previouslySelected", false);
    setAnchorEl(null);
    //关闭时更新以下state会导致popover重新渲染出现内容重叠问题
    // setCurrentNodetype(-1);
    setCurrentLayertype(null);
  };
  const handleClosePopoverWithoutDeselect = () => {
    setAnchorEl(null);
    //关闭时更新以下state会导致popover重新渲染出现内容重叠问题
    // setCurrentNodetype(-1);
    setCurrentLayertype(null);
  };

  // 修改node type
  const handleNodetypeChange = (e) => {
    setCurrentNodetype(e.target.value);
    setCurrentLayertype(LayerType.CONV);
  };

  // 修改layer type
  const handleLayertypeChange = (e) => {
    setCurrentLayertype(e.target.value);
  };

  const handleLineChartToggle = (e) => {
    setCurrentShowLineChart(e.target.value === "true" ? true : false);
  };
  // 点击空白处取消所有选择
  const handleBgClick = () => {
    //  setSelectedNodeId ("");
    if (selectedNodeId !== "")
      modifyGlobalStates(
        GlobalStatesModificationType.SET_SELECTEDNODE,
        ""
      );
    cleanPathFinding();
  };
  function cleanPathFinding() {
    setStartNodeId(null);
    setEndNodeId(null);
    setHighlightPath(new Set());
  }

  // 按键事件
  // 按下ctrl开始刷选
  // 按下shift可以单击
  const keydown = () => {
    ctrlKey = d3.event.ctrlKey;
    shiftKey = d3.event.shiftKey;
    if (ctrlKey) {
      // 按下ctrl开始刷选
      if (gBrush) {
        return;
      } else {
        brushMode = true;
        gBrush = gBrushHolder.append("g");
        gBrush.call(brush);
      }
    }
    if (shiftKey) {
      // 按下shift可以单击
      setSelectMode(true);
    }
  };

  const keyup = () => {
    // 如果是按下ctrl
    if (brushMode) {
      ctrlKey = false;
      brushMode = false;
      if (!gBrush) return;
      gBrush.remove();
      gBrush = null;
    } else {
      // 按下shift
      shiftKey = false;
      setSelectMode(false);
    }
  };


  const brushstart = () => {
    node = d3.select(".nodes").selectAll(".node");
    node.each(function () {
      const previouslySelected =
        d3.select(this).attr("class").indexOf("selected") > -1 ? true : false;
      d3.select(this).classed(
        "previouslySelected",
        ctrlKey && previouslySelected
      );
    });
  };

  const brushed = () => {
    if (!d3.event.sourceEvent) return;
    if (!d3.event.selection) return;

    let extent = d3.event.selection;
    node.classed("selected", function () {
      if (d3.select(this).attr("class").indexOf("cluster") > -1) {
        // 展开的cluster节点不刷选
        return false;
      }
      const bounding = this.getBoundingClientRect();
      let xCenter = bounding.x - svgBoundingClientRect.x + bounding.width * 0.5;
      let yCenter =
        bounding.y - svgBoundingClientRect.y + bounding.height * 0.5;
      let inExtent =
        extent[0][0] <= xCenter &&
          xCenter < extent[1][0] &&
          extent[0][1] <= yCenter &&
          yCenter < extent[1][1]
          ? 1
          : 0;
      const previouslySelected =
        d3.select(this).attr("class").indexOf("previouslySelected") > -1
          ? 1
          : 0;
      return previouslySelected ^ inExtent;
    });
  };

  const brushend = () => {
    if (!d3.event.sourceEvent) return;
    if (!d3.event.selection) return;
    if (!gBrush) return;

    node.classed("previouslySelected", function () {
      const previouslySelected =
        d3.select(this).attr("class").indexOf("select") > -1 ? true : false;
      return previouslySelected;
    });

    gBrush.call(brush.move, null);

    if (!brushMode) {
      gBrush.remove();
      gBrush = null;
    }
  };

  const zoomofD3 = d3.zoom();
  const updateZoomofD3 = (transform) => {
    zoomofD3.transform(d3.select(svgRef.current), transform);
  };

  function canvasBackToRight() {
    setTransform({
      x: 0,
      y: 0,
      k: 1,
    });
    const outputG = d3.select(outputRef.current);
    outputG.attr("transform", "translate(0,0) scale(1)");
    updateZoomofD3(d3.zoomIdentity);
  }

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const outputG = d3.select(outputRef.current);

    let zoom = zoomofD3
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
    d3.select("body").on("keydown", keydown);
    d3.select("body").on("keyup", keyup);
    brushMode = false;
    gBrush = null;
    brush = d3
      .brush()
      .extent([
        [0, 0],
        [svgWidth, svgHeight],
      ])
      .on("start", brushstart)
      .on("brush", brushed)
      .on("end", brushend);

    setBgRectHeight(svgHeight);
  }, []);

  useEffect(()=>{
    setTimeout(()=>{
      if(isFirstAddEventListener && shouldShowDisplaySwitchPopover){
        isFirstAddEventListener = false;
        const dom = document.querySelector(".ant-popover-inner-content")
        if(dom){
          dom.addEventListener("mouseout", function(e){
            console.log((e.target as any).className)
            if(e.target && (e.target as any).className === "ant-popover-inner-content"){
              popoverFlag = !popoverFlag;
              if(popoverFlag){
                toggleShouldShowDisplaySwitchPopover(false);
              } 
            }
          },false)
        }
      }
    },50)
  }, [shouldShowDisplaySwitchPopover])

  const isPopoverOpen = Boolean(anchorEl);

  const handleLayoutModify = () => {
    setLayoutModificationMode(!layoutModificationMode);
  };

  const handleDisplaySwitchClick = () => {
    modifyGlobalConfigurations(
      GlobalConfigurationsModificationType.TOGGLE_DIAGNOSIS_MODE
    );
  };

  const nodeScalarTypes = (<div id="popoverParent">
    {
      ['activation','gradient','weight','none'].map((type,i)=>
        <p 
          id={`#item_${i}`}
          className={`dataTypeItem ${i===3?"selected":""}`}
          style={{ cursor: "pointer"}} 
          onClick={(e)=>{
            d3.select("#popoverParent").selectAll("p").classed("selected", false)
            e.currentTarget.className += " selected"
            if(i!==3){
              modifyGlobalConfigurations(
                GlobalConfigurationsModificationType.SET_DIAGNOSIS_MODE
              );
              modifyGlobalStates(GlobalStatesModificationType.SET_NODESCALARTYPE,i)
            } else {
              modifyGlobalConfigurations(
                GlobalConfigurationsModificationType.UNSET_DIAGNOSIS_MODE
              );
            }
          }}>
            {type}
        </p>
      )
    }
  </div>)

  return (
    <div id="elk-graph" style={{ height: "100%" }}>
      <svg id="elk-svg" ref={svgRef} style={{ height: "100%" }}>
        <defs>
          <marker
            id="arrowhead"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerUnits="userSpaceOnUse"
            markerWidth="8"
            markerHeight="6"
            orient="auto"
          >
            <path
              d="M 0 0 L 10 5 L 0 10 L 4 5 z"
              fill={arrowFillColor}
              stroke={arrowStrokeColor}
            ></path>
          </marker>
          <marker
            id="arrowheadHovered"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerUnits="userSpaceOnUse"
            markerWidth="8"
            markerHeight="6"
            orient="auto"
          >
            <path
              d="M 0 0 L 10 5 L 0 10 L 4 5 z"
              fill={hoverEdgePathStrokeColor}
              stroke={hoverEdgePathStrokeColor}
            ></path>
          </marker>
          <marker
            id="arrowheadHighlighted"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerUnits="userSpaceOnUse"
            markerWidth="8"
            markerHeight="6"
            orient="auto"
          >
            <path
              d="M 0 0 L 10 5 L 0 10 L 4 5 z"
              fill={highlight_edge_path_stroke_color}
              stroke={highlight_edge_path_stroke_color}
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
              handleRightClick={handleRightClick}
              currentNotShowLineChartID={currentNotShowLineChartID}
              iteration={iteration}
              layoutModificationMode={layoutModificationMode}
              isPathFindingMode={isPathFindingMode}
              startNodeId={startNodeId}
              endNodeId={endNodeId}
            />
            <ELKLayoutPort />
            <ELKLayoutEdge
              highlightPath={highlightPath}
              isPathFindingMode={isPathFindingMode}
            />
          </g>
        </svg>
        <g id="gBrushHolder"></g>
      </svg>

      <NodeInfoCard />

      <div className="minimap-container">
        <MiniMap
          graph={svgRef.current}
          outputSVG={outputSVGRef.current}
          outputG={outputRef.current}
          transform={transform}
          updateZoomofD3={updateZoomofD3}
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
        isPathFindingMode={isPathFindingMode}
        handleSetStart={handleSetStart}
        handleSetEnd={handleSetEnd}
      />
      <InteractiveIcon
        id="modify-switch"
        className={
          layoutModificationMode
            ? "interactive-on-button"
            : "interactive-button"
        }
        position={{ left: 10, bottom: firstIconBottom }}
        src={process.env.PUBLIC_URL + "/assets/layout-modify.svg"}
        handleClicked={handleLayoutModify}
        prompt={"Layout Modify"}
      />
      <InteractiveIcon
        id="search-switch"
        className={
          isPathFindingMode ? "interactive-on-button" : "interactive-button"
        }
        position={{
          left: 10,
          bottom: firstIconBottom + iconHeight + iconPadding,
        }}
        src={process.env.PUBLIC_URL + "/assets/path-search.svg"}
        handleClicked={togglePathFindingMode}
        prompt={"Path Search"}
      />
      <InteractiveIcon
        id="reset-switch"
        className="interactive-button"
        position={{
          left: 10,
          bottom: firstIconBottom + 2 * (iconHeight + iconPadding),
        }}
        src={process.env.PUBLIC_URL + "/assets/reset-layout.svg"}
        handleClicked={canvasBackToRight}
        prompt={"Reset Layout"}
      />
      <Popover 
        placement="right" 
        title={<span>Data Type</span>} 
        content={nodeScalarTypes}
        getPopupContainer={()=>document.querySelector("#elk-graph")} 
        trigger="hover"
        visible={shouldShowDisplaySwitchPopover}
        >
          <InteractiveIcon
            id="display-switch"
            className={
              diagnosisMode ? "interactive-on-button" : "interactive-button"
            }
            position={{
              left: 10,
              bottom: firstIconBottom + 3 * (iconHeight + iconPadding),
            }}
            src={process.env.PUBLIC_URL + "/assets/layer-display.svg"}
            handleHover={()=>{toggleShouldShowDisplaySwitchPopover(true)}}
            prompt={"Layer Display"}
          />
      </Popover>
    </div>
  );
};

export default ELKLayoutGraph;
