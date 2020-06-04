import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import './DagreLayoutGraph.css';
import { transformImp, elModifyType, TransformType } from '../../types/mini-map'
import { NodeType, LayerType, DataType, RawEdge, GroupNode, LayerNode, GroupNodeImp, LayerNodeImp, DataNodeImp, OperationNode, OperationNodeImp, ModuleEdge } from '../../common/graph-processing/stage2/processed-graph'
import { FCLayerNode, CONVLayerNode, RNNLayerNode, OTHERLayerNode } from './LayerNodeGraph';
import * as dagre from 'dagre';
import * as d3 from 'd3';
import Popover from '@material-ui/core/Popover';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import { TransitionMotion, spring } from 'react-motion';
import { useHistory, useLocation } from "react-router-dom";
import { useProcessedGraph, modifyProcessedGraph, ProcessedGraphModificationType } from '../../store/processedGraph';
import { useGlobalConfigurations } from '../../store/global-configuration'
import { modifyData } from '../../store/layerLevel';
import { ModifyLineData } from '../../types/layerLevel'
import { LineGroup } from '../LineCharts/index'
import MiniMap from '../MiniMap/MiniMap';
import { fetchAndGetLayerInfo } from '../../common/model-level/snaphot'
import { generateNodeStyles, generateEdgeStyles, getColor, generateAcrossModuleEdgeStyles } from '../../common/style/graph';
import NodeInfoCard from "../NodeInfoCard/NodeInfoCard"



const DagreLayoutGraph: React.FC<{ iteration: number }> = (props: { iteration }) => {
  let iteration = props.iteration
  const graphForLayout = useProcessedGraph();
  const modulesId = graphForLayout.modules;
  const { diagnosisMode, isHiddenInterModuleEdges } = useGlobalConfigurations();
  const [edges, setEdges] = useState({});
  const [nodes, setNodes] = useState({});
  const [moduleConnection, setModuleConnection] = useState({});
  const [hiddenEdges, setHiddenEdges] = useState([]);
  const [outputNodeName, setOutputNodeName] = useState([]);
  const [inputNodeName, setInputNodeName] = useState([]);
  const [selectedNodeName, setSelectedNodeName] = useState("");
  const [leafAndChildrenNum, setLeafAndChildrenNum] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState("");
  const [nodeAttribute, setNodeAttribute] = useState([]);

  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const handleChangeTransform = function (transform) {
    if (transform === null || transform === undefined) return;
    setTransform(transform);
  }
  const history = useHistory();
  const svgRef = useRef();
  const outputRef = useRef();
  const outputSVGRef = useRef();

  const [bgRectHeight, setBgRectHeight] = useState(0);
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

  const moduleHoleWidth = (isHiddenInterModuleEdges) ? 30 : 0;

  const getX = (d) => {
    return d.x;
  };
  const getY = (d) => {
    return d.y;
  }
  // 根据points计算path的data
  const line = d3
    .line()
    .x(d => getX(d))
    .y(d => getY(d));

  const showInfoCard = id => {
    let GraphId = id;
    id = id.replace(/-/g, '/'); //还原为nodemap中存的id格式
    let nodeMap = graphForLayout.nodeMap
    let node = nodeMap[id];

    // TODO: 目前只考虑ms图
    if (node.type === NodeType.LAYER || (node.type === NodeType.DATA && (node as DataNodeImp).dataType === DataType.OUTPUT)) {
      return;
    }

    if (node.type === NodeType.GROUP) {
      let splitName = GraphId.split("-")

      // selectedNodeName  与     selectedNodeId 分别是：
      // Default/hello/hi                  hi
      //   cst1_Input2_3                   3
      setSelectedNodeName(splitName[splitName.length - 1]);
      setSelectedNodeId(GraphId)

      setLeafAndChildrenNum([(node as GroupNode).leafOperationNodeCount, (node as GroupNode).operationChildrenCount])
      setOutputNodeName(Array.from((node as GroupNode).outputNode));
      setInputNodeName(Array.from((node as GroupNode).inputNode));
      setNodeAttribute([]);
    }
    if (node.type === NodeType.OPERTATION) {
      let splitName = GraphId.split("-")
      setSelectedNodeName(splitName[splitName.length - 1]);
      setSelectedNodeId(GraphId);

      setLeafAndChildrenNum([0, 0]);
      setNodeAttribute((node as OperationNodeImp).attributes);
      setOutputNodeName(Array.from((node as OperationNodeImp).outputNode));
      setInputNodeName(Array.from((node as OperationNodeImp).inputNode));
    }

    if (node.type === NodeType.DATA) {
      //GraphId是 data_Input2_1 或者 cst1_Input2_1 格式
      let splitName = GraphId.split("_Input2_")
      setSelectedNodeName(splitName[0]);
      setSelectedNodeId(GraphId);

      setLeafAndChildrenNum([0, 0]);
      if ((node as DataNodeImp).dataType === DataType.PARAMETER)
        setNodeAttribute([(node as DataNodeImp).typeAttibute]);
      else setNodeAttribute([]);
      setOutputNodeName(Array.from((node as DataNodeImp).outputNode));
      setInputNodeName(Array.from((node as DataNodeImp).inputNode));
    }
  }

  const toggleExpanded = id => {
    id = id.replace(/-/g, '/'); //还原为nodemap中存的id格式
    while (1) {
      let node = graphForLayout.nodeMap[id];
      if (node.type !== NodeType.GROUP && node.type !== NodeType.LAYER) {
        return
      }

      node = node as GroupNode;
      const currentExpanded = node.expanded;
      modifyProcessedGraph(
        ProcessedGraphModificationType.MODIFY_NODE_ATTR,
        {
          nodeId: id,
          modifyOptions: {
            expanded: !currentExpanded
          }
        }
      );
      var i = 0;
      let childnodeId = id;
      node.children.forEach(childId => {
        let childNode = graphForLayout.nodeMap[childId];
        if (childNode.type == NodeType.GROUP) {
          i++;
          childnodeId = childNode.id;
        }

      })
      if (i == 1) {
        // let childnodeId=Array.from(node.children)[0];
        id = childnodeId;

      }
      else break;
    }
  }

  const draw = async () => {
    const graph = new dagre.graphlib.Graph({ compound: true })
      .setGraph({})
      .setDefaultEdgeLabel(function () { return {}; });;

    const { nodeMap } = graphForLayout;
    let start = Date.now();
    const displayedNodes: Array<string> = graphForLayout.getDisplayedNodes();

    let newModuleConnection = {};
    displayedNodes.forEach(d => {
      let connection = graphForLayout.getModuleConnection(d);
      if (connection["in"].size || connection["out"].size)
        newModuleConnection[d] = connection;
    })

    // console.log('getDisplayedNodes:', Date.now() - start, 'ms');
    start = Date.now()
    const displayedEdges: Array<RawEdge> = graphForLayout.getDisplayedEdges(displayedNodes, !isHiddenInterModuleEdges);
    // console.log('getDisplayedEdges:', Date.now() - start, 'ms');

    start = Date.now()
    let parentScope = new Set();
    let auxiliaryNodesSize = { width: 20, height: 10 }
    let nodeWithauxiliary = new Set() //
    for (const nodeId of displayedNodes) {
      const node = nodeMap[nodeId];
      let width: number, height: number;
      let className = `nodetype-${node.type}`;
      if (node instanceof GroupNodeImp) {
        if (node.expanded) className += " cluster";
        width = node.displayedName.length * 10;
        height = 40;
      } else if (node instanceof LayerNodeImp) {
        if (node.expanded) className += " cluster";
        className += ` layertype-${node.layerType}` //.toLowerCase()
        switch (node.layerType) {
          case LayerType.FC: case LayerType.RNN:
            width = node.displayedName.length * 10 + 8;
            height = 40;
            break;
          default:
            width = node.displayedName.length * 10;
            height = 40;
        }
      } else if (node instanceof DataNodeImp) {
        className += ` datatype-${node.dataType}`;
        if (node.dataType === DataType.INPUT || node.dataType === DataType.OUTPUT || node.dataType === DataType.PARAMETER) {
          width = 10;
          height = 10;
        } else if (node.dataType === DataType.CONST) {
          className += " auxiliary";
          parentScope.add(node.parent)
          width = auxiliaryNodesSize.width;
          height = auxiliaryNodesSize.height;
        } else {
          width = 30;
          height = 10;
        }
      } else if (node instanceof OperationNodeImp) {
        if (node.auxiliary.size === 0) {
          width = 30;
          height = 10;
        } else {
          nodeWithauxiliary.add(node.id);
          className += " operationNodeWithAuxiliary"
          width = node.displayedName.length * 10;
          height = 30;
        }
      }

      if (modulesId.has(nodeId)) {
        width += moduleHoleWidth;
      }

      graph.setNode(node.id, {
        id: node.id,
        label: node.displayedName,
        nodetype: node.type,
        expanded: (node.type === NodeType.LAYER) ? (node as LayerNodeImp).expanded : false,
        class: className,
        shape: "rect",
        width,
        height
      });
      if (node.parent !== '___root___') {
        graph.setParent(nodeId, node.parent);
      }
    }

    for (const edge of displayedEdges) {
      graph.setEdge(edge.source, edge.target, {
        arrowheadStyle: 'fill: #333; stroke: #333;',
        arrowhead: 'vee'
      });
    }

    start = Date.now()
    graph.graph().nodesep = 50;
    graph.graph().ranksep = 100;
    dagre.layout(graph);

    nodeWithauxiliary.forEach((tmpNodeName: string) => {
      let auxi = (nodeMap[tmpNodeName] as OperationNode).auxiliary;
      let auxiArr = [];
      auxi.forEach((val) => { auxiArr.push(val) });

      // TODO: 目前只考虑了一个附属节点的情况
      let sourceNode = graph.node(auxiArr[0]);
      let destNode = graph.node(tmpNodeName);

      sourceNode.x = destNode.x - destNode.width / 2;
      sourceNode.y = destNode.y;
    })

    let newNodes = {}, newEdges = {};

    start = Date.now()
    graph.nodes().forEach(function (v) {
      newNodes[v] = graph.node(v);
    });
    graph.edges().forEach(function (edge) {
      newEdges[`${edge.v}-${edge.w}`] = graph.edge(edge);
    });
    // console.log('create newNodes and newEdges:', Date.now() - start, 'ms');

    setModuleConnection(newModuleConnection);
    setAnchorEl(null);
    await getLayerInfo(newNodes);
    setNodes(newNodes);
    setEdges(newEdges);
  }

  const getLayerInfo = async (nodes) => {
    let _lineChartData = {}
    for (const nodeId in nodes) {
      if (nodes[nodeId].nodetype === NodeType.LAYER) {
        let data = await fetchAndGetLayerInfo({
          "STEP_FROM": iteration,
          "STEP_TO": iteration + 20
        }, nodeId, graphForLayout)
        _lineChartData[nodeId] = data
      }
    }
    setLayerLineChartData(_lineChartData)
  }

  // 聚合多个节点
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
    node = d3.select(".nodes").selectAll(".node");
    node.classed("selected", false);
    node.classed("previouslySelected", false);
    setSelectedNodeName("");
    setSelectedNodeId("");
  }

  // 按住shift后单击选择
  const handleNodeSelect = (id) => {
    const previouslySelected = d3.select(`#${id}`).attr("class").indexOf("selected") > -1 ? true : false;
    d3.select(`#${id}`).classed("selected", !previouslySelected);
    // d3.select(`#${id}`).classed("previouslySelected", !previouslySelected);
  }

  //鼠标悬停节点
  const handleMouseOver = (e) => {
    let currentElementClassList = e.currentTarget.classList;
    if (currentElementClassList.value.indexOf("cluster") == -1) {
      currentElementClassList.add("highlighted");
    }
  }
  const handleMouseLeave = (e) => {
    e.currentTarget.classList.remove("highlighted");
  }

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


  // 根据hover的source和target判断是否显示这条隐藏的边
  const addEdgetoDisplay = (edgesToAdd: Array<ModuleEdge>, newHiddenEdges: Array<ModuleEdge>, source: string, target: string) => {
    const { nodeMap } = graphForLayout;
    for (const edge of edgesToAdd) {
      const edgeSourceNode = nodeMap[edge.source];
      const edgeTargetNode = nodeMap[edge.target];

      // 过滤掉模块间的边 以及与其他模块的边
      if ((edge.source === source || edge.target === target)
        || (edge.source.indexOf(source) < 0 && edge.target.indexOf(target) < 0)
        || (modulesId.has(edge.source) && modulesId.has(edge.target) && edgeSourceNode instanceof GroupNodeImp && !edgeSourceNode.parentModule && edgeTargetNode instanceof GroupNodeImp && !edgeTargetNode.parentModule)
        || (edge.source === target && edgeTargetNode instanceof GroupNodeImp && edgeTargetNode.expanded) // 如果是已经展开的节点和其所在模块的连线 跳过
        || (edge.target === source && edgeSourceNode instanceof GroupNodeImp && edgeSourceNode.expanded)) {
        continue;
      }
      // 去重
      let flag = true;
      for (const edgeToDisplay of newHiddenEdges) {
        if (edge.source === edgeToDisplay.source && edge.target === edgeToDisplay.target) {
          flag = false;
          break;
        }
      }
      if (flag) {
        newHiddenEdges.push(Object.assign({}, edge));
      }
    }
  }

  const getHiddenEdgesPos = (newHiddenEdges) => {
    for (const edge of newHiddenEdges) {
      const { source, target, width } = edge;
      const sourceNode = nodes[source];
      const targetNode = nodes[target];
      if (!sourceNode || !targetNode) break;

      if (sourceNode.class.indexOf('cluster') > -1) {
        edge["startPointX"] = sourceNode.x + sourceNode.width * 0.5 - 10;
        edge["startPointY"] = sourceNode.y - sourceNode.height * 0.5 + 10;
      } else {
        edge["startPointX"] = sourceNode.x + sourceNode.width * 0.4;
        edge["startPointY"] = sourceNode.y + sourceNode.height * 1.5;
      }

      if (targetNode.class.indexOf('cluster') > -1) {
        edge["endPointX"] = targetNode.x + targetNode.width * 0.5 - 10;
        edge["endPointY"] = targetNode.y + targetNode.height * 0.5 - 10;
      } else {
        edge["endPointX"] = targetNode.x + targetNode.width * 0.4;
        edge["endPointY"] = targetNode.y - targetNode.height * 1.5;
      }
      // 中间的插值点 目前设置的是三个点：中点、四分之一点偏移、四分之三点偏移
      let interPoints = [];
      const xDiff = edge["endPointX"] - edge["startPointX"], yDiff = edge["endPointY"] - edge["startPointY"];
      const [midX, midY] = [(edge["startPointX"] + edge["endPointX"]) * 0.5, (edge["startPointY"] + edge["endPointY"]) * 0.5];
      const [quarter1X, quarter1Y] = [
        edge["startPointX"] + xDiff * 0.25,
        edge["startPointY"] + yDiff * 0.25
      ];
      const [quarter2X, quarter2Y] = [
        edge["startPointX"] + xDiff * 0.75,
        edge["startPointY"] + yDiff * 0.75
      ];
      interPoints.push({ x: quarter1X + xDiff * 0.2, y: quarter1Y });
      interPoints.push({ x: midX, y: midY });
      interPoints.push({ x: quarter2X - xDiff * 0.2, y: quarter2Y });
      edge["interPoints"] = interPoints;
    }
  }

  // hover模块间的module edge
  const handleModuleEdgeMouseover = (e) => {
    const source = d3.select(e.target).attr("data-source");
    const target = d3.select(e.target).attr("data-target");
    const { nodeMap } = graphForLayout;
    let sourceNode = nodeMap[source] as GroupNode, targetNode = nodeMap[target] as GroupNode;

    d3.selectAll("g.node").classed("hover-transparent", true);
    d3.selectAll("g.edgePath").classed("hover-transparent", true);
    d3.selectAll("g.moduleEdgePath").classed("hover-transparent", true);
    // hover的连线不加透明度
    d3.select(e.target.parentNode).classed("hover-transparent", false);
    // 如果两个module都没有展开
    if (!sourceNode.expanded && !targetNode.expanded) {
      // 这两个module不加透明度
      d3.select(`#${source.replace(/\//g, '-')}`).classed("hover-transparent", false);
      d3.select(`#${target.replace(/\//g, '-')}`).classed("hover-transparent", false);
    } else { // 有module展开了
      const displayedNodes: Array<string> = graphForLayout.getDisplayedNodes();

      let newHiddenEdges = [];
      let connectedNodes = new Set();// 有相关连线的节点
      displayedNodes.forEach(d => {
        if (d in moduleConnection && (moduleConnection[d].in.has(source) || moduleConnection[d].out.has(target))) {
          const inHiddenEdges = graphForLayout.getInHiddenEdges(d), outHiddenEdges = graphForLayout.getOutHiddenEdges(d);
          // 根据hover的source和target过滤边
          addEdgetoDisplay(inHiddenEdges, newHiddenEdges, source, target);
          addEdgetoDisplay(outHiddenEdges, newHiddenEdges, source, target);
        }

      })
      // 获取相关节点
      newHiddenEdges.forEach(edge => {
        connectedNodes.add(edge.source);
        connectedNodes.add(edge.target);
      })
      if (sourceNode.expanded) {
        connectedNodes.delete(source);
      } else {
        connectedNodes.add(source)
      }
      if (targetNode.expanded) {
        connectedNodes.delete(target);
      } else {
        connectedNodes.add(target)
      }
      // 相关的节点和边全部b不加透明度
      connectedNodes.forEach((n: string) => {
        const id = n.replace(/\//g, '-').replace(/\(|\)/g, '');
        d3.select(`#${id}`).classed("hover-transparent", false);
      })
      // 获取线的坐标位置
      getHiddenEdgesPos(newHiddenEdges);
      setHiddenEdges(newHiddenEdges);
    }
  }

  const handleHiddenEdgeMouseout = () => {
    d3.selectAll("g.node").classed("hover-transparent", false);
    d3.selectAll("g.edgePath").classed("hover-transparent", false);
    d3.selectAll("g.moduleEdgePath").classed("hover-transparent", false);
    setHiddenEdges([]);
  }

  // hover附属于节点的小孔
  const handleNodeHoleMouseover = (e) => {
    const { nodeMap } = graphForLayout;
    const nodeId = d3.select(e.target).attr("data-id");
    const nodeEdgeType = d3.select(e.target).attr("data-type");// hover的是in circle 还是out circle,分别对应边的target和source

    let newHiddenEdges = [];

    d3.selectAll("g.node").classed("hover-transparent", true);
    d3.selectAll("g.edgePath").classed("hover-transparent", true);
    d3.selectAll("g.moduleEdgePath").classed("hover-transparent", true);
    // hover的节点
    d3.select(`#${nodeId.replace(/\//g, '-').replace(/\(|\)/g, '')}`).classed("hover-transparent", false);

    let allHiddenEdges = (nodeEdgeType === "source") ? graphForLayout.getOutHiddenEdges(nodeId) : graphForLayout.getInHiddenEdges(nodeId);
    let connectedNodes = new Set(), displayedModuleEdge = new Set();

    for (const edge of allHiddenEdges) {
      const sourceNode = nodeMap[edge.source], targetNode = nodeMap[edge.target];
      // 过滤掉模块间的边
      if (modulesId.has(edge.source) && modulesId.has(edge.target)
        && sourceNode instanceof GroupNodeImp && !sourceNode.parentModule
        && targetNode instanceof GroupNodeImp && !targetNode.parentModule) {
        displayedModuleEdge.add(edge); // 相关的模块间的边不加透明度
        continue;
      }
      newHiddenEdges.push(Object.assign({}, edge));
    }

    // 获取connectedNodes
    newHiddenEdges.forEach((edge) => {
      if (!modulesId.has(edge.source)) {
        connectedNodes.add(edge.source.replace(/\//g, '-').replace(/\(|\)/g, ''));
      }
      if (!modulesId.has(edge.target)) {
        connectedNodes.add(edge.target.replace(/\//g, '-').replace(/\(|\)/g, ''));
      }
    })

    // 相关的节点和边全部b不加透明度
    displayedModuleEdge.forEach((edge: RawEdge) => {
      const sourceNode = nodeMap[edge.source] as GroupNode;
      const targetNode = nodeMap[edge.target] as GroupNode;
      const source = edge.source.replace(/\//g, '-').replace(/\(|\)/g, ''), target = edge.target.replace(/\//g, '-').replace(/\(|\)/g, '');
      // 如果模块没有展开 则也不加透明度
      if (!sourceNode.expanded) {
        connectedNodes.add(source);
      }
      if (!targetNode.expanded) {
        connectedNodes.add(target);
      }
      d3.select(`#${source}-${target}`).classed("hover-transparent", false);

    })
    connectedNodes.forEach((n: string) => {
      d3.select(`#${n}`).classed("hover-transparent", false);
    })

    getHiddenEdgesPos(newHiddenEdges);
    setHiddenEdges(newHiddenEdges);
  }

  // hover附属于节点的小短线
  const handleNodeShortEdgeMouseover = (e) => {
    const { nodeMap } = graphForLayout;
    const nodeId = d3.select(e.target).attr("data-id");
    const nodeEdgeType = d3.select(e.target).attr("data-type");
    const connectedModule = d3.select(e.target).attr("data-connectedmodule");
    let hoveredNode = nodeMap[nodeId];
    let hoveredNodeRootModule = hoveredNode.belongModule;
    if (hoveredNode.type === NodeType.GROUP || hoveredNode.type !== NodeType.LAYER) {
      hoveredNode = hoveredNode as GroupNode;
      if (hoveredNode.parentModule) {
        hoveredNodeRootModule = hoveredNode.parentModule
      }
    }
    d3.selectAll("g.node").classed("hover-transparent", true);
    d3.selectAll("g.edgePath").classed("hover-transparent", true);
    d3.selectAll("g.moduleEdgePath").classed("hover-transparent", true);
    // hover的节点
    d3.select(`#${nodeId.replace(/\//g, '-').replace(/\(|\)/g, '')}`).classed("hover-transparent", false);

    let newHiddenEdges = [];
    let connectedNodes = new Set(), displayedModuleEdge = new Set();

    let allHiddenEdges = (nodeEdgeType === "source") ? graphForLayout.getOutHiddenEdges(nodeId) : graphForLayout.getInHiddenEdges(nodeId);
    let connectedModuleType = (nodeEdgeType === "source") ? "target" : "source";
    for (const edge of allHiddenEdges) {
      if ((modulesId.has(edge.source) && modulesId.has(edge.target))
        && (edge[connectedModuleType] === connectedModule)) {
        displayedModuleEdge.add(edge);
      }
      const sourceNode = nodeMap[edge.source], targetNode = nodeMap[edge.target];
      // 过滤掉模块间的边 提取当前hover小短线的连接
      if ((modulesId.has(edge.source) && modulesId.has(edge.target) && sourceNode instanceof GroupNodeImp && !sourceNode.parentModule
        && targetNode instanceof GroupNodeImp && !targetNode.parentModule)
        || ((edge[nodeEdgeType] !== connectedModule && edge[connectedModuleType] !== hoveredNodeRootModule))) {
        continue;
      }
      newHiddenEdges.push(Object.assign({}, edge));
    }

    // 获取connectedNodes
    newHiddenEdges.forEach((edge) => {
      if (!modulesId.has(edge.source)) {
        connectedNodes.add(edge.source.replace(/\//g, '-').replace(/\(|\)/g, ''));
      }
      if (!modulesId.has(edge.target)) {
        connectedNodes.add(edge.target.replace(/\//g, '-').replace(/\(|\)/g, ''));
      }
    })

    // 相关的节点和边全部b不加透明度
    displayedModuleEdge.forEach((edge: RawEdge) => {
      const sourceNode = nodeMap[edge.source] as GroupNode;
      const targetNode = nodeMap[edge.target] as GroupNode;
      const source = edge.source.replace(/\//g, '-').replace(/\(|\)/g, ''), target = edge.target.replace(/\//g, '-').replace(/\(|\)/g, '');
      // 如果模块没有展开 则也不加透明度
      if (!sourceNode.expanded) {
        connectedNodes.add(source);
      }
      if (!targetNode.expanded) {
        connectedNodes.add(target);
      }
      d3.select(`#${source}-${target}`).classed("hover-transparent", false);
    })
    connectedNodes.forEach((n: string) => {
      d3.select(`#${n}`).classed("hover-transparent", false);
    })
    getHiddenEdgesPos(newHiddenEdges);
    setHiddenEdges(newHiddenEdges);
  }

  useEffect(() => { // rect拖动后，改变outputSVG的起始位置。
    const svg = d3.select(svgRef.current);
    svg.call(d3.zoom().transform, d3.zoomIdentity.translate(transform.x, transform.y).scale(transform.k))
  }, [transform])

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const outputG = d3.select(outputRef.current);

    let zoom = d3.zoom()
      .on('zoom', function () {
        outputG.attr('transform', d3.event.transform);
      })
      .on("end", () => { // TODO: 拖拽结束后，重置transform的位置，没有实时拖动minimap中的矩形框
        setTransform(d3.event.transform);
      })
    svg.call(zoom).on('dblclick.zoom', null);

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
  }, [])

  useEffect(() => {
    if (graphForLayout === null || !Object.keys(graphForLayout.nodeMap).length) return;
    draw();
  }, [graphForLayout, isHiddenInterModuleEdges]);

  const getLabelContainer = (nodeId, nodeClass, width, height) => {
    let focus = selectedNodeName !== "" && nodeId === selectedNodeId; 
    if (nodeClass.indexOf(`layertype-${LayerType.FC}`) > -1) {
      return (<FCLayerNode width={width} height={height} />);
    } else if (nodeClass.indexOf(`layertype-${LayerType.CONV}`) > -1) {
      return (<CONVLayerNode width={width} height={height} />);
    } else if (nodeClass.indexOf(`layertype-${LayerType.RNN}`) > -1) {
      return (<RNNLayerNode width={width} height={height} />);
    } else if (nodeClass.indexOf(`layertype-${LayerType.OTHER}`) > -1) {
      return (<OTHERLayerNode width={width} height={height} />)
    } else {
      return (
        <g className="label">
          <rect className={focus ? 'label-container focus' : "label-container"}
            width={width}
            height={height}
            transform={`translate(-${width / 2}, -${height / 2})`}
          ></rect>
        </g>
      )
    }
  }

  const isPopoverOpen = Boolean(anchorEl);
  return (
    <div id='dagre-graph' style={{ height: '100%' }}>
      <svg id='dagre-svg' ref={svgRef} style={{ height: '100%' }} onContextMenu={(e) => { e.preventDefault() }}>
        <g>
          <defs>
            <marker id="arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="strokeWidth" markerWidth="8" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 L 4 5 z" fill='#999999' stroke='#999999'></path>
            </marker>
            <marker id="rnn-arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="strokeWidth" markerWidth="6" markerHeight="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 L 8 5 z" fill='#fff' stroke='#fff'></path>
            </marker>
          </defs>
          <rect className="bg-rect" width="100%" height={bgRectHeight} onClick={() => handleBgClick()}></rect>
          <svg id="output-svg" ref={outputSVGRef}>
            <g
              className='output'
              id="output-g"
              ref={outputRef}
              transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}
            >
              {/* <g className='clusters'></g> */}
              <TransitionMotion
                styles={generateNodeStyles(graphForLayout, nodes, moduleConnection, layerLineChartData, currentNotShowLineChartID)}>
                {interpolatedStyles => (
                  <g className='nodes' onContextMenu={(e) => handleRightClick(e)}>
                    {interpolatedStyles.map(d => {
                      return (
                        <g
                          className={`node ${d.data.class}`}
                          data-belong_module={d.data.belongModule}
                          id={d.data.id}
                          key={d.key}
                          transform={`translate(${d.style.gNodeTransX}, ${d.style.gNodeTransY})`}
                          onClick={() => selectMode ? handleNodeSelect(d.data.id) : showInfoCard(d.data.id)}
                          onDoubleClick={() => selectMode ? handleNodeSelect(d.data.id) : toggleExpanded(d.data.id)}>
                          {getLabelContainer(d.data.id, d.data.class, d.style.rectWidth, d.style.rectHeight)}
                          <g className={`node-label`} transform={(d.data.class.indexOf('cluster') > -1) ? `translate(0,-${d.style.rectHeight / 2})` : null}>
                            {(d.data.type === NodeType.LAYER && d.data.expanded === false) && d.data.showLineChart && diagnosisMode ?
                              <g className="LineChartInNode" >
                                <LineGroup
                                  transform={`translate(-${d.style.rectWidth / 2},-${d.style.rectHeight * 3 / 8})`}
                                  width={d.style.rectWidth}
                                  height={d.style.rectHeight * 3 / 4}
                                  data={d.data.LineData} />
                                <text transform={`translate(0,-${d.style.rectHeight * 3 / 8})`} dominantBaseline={(d.data.class.indexOf('cluster') > -1) ? "text-before-edge" : "middle"}>
                                  {d.data.label}
                                </text>
                              </g> : <text
                                dominantBaseline={(d.data.class.indexOf('cluster') > -1) ? "text-before-edge" : "middle"}
                                y={((d.data.class.indexOf('nodetype-1') > -1 || d.data.class.indexOf('nodetype-2') > -1) || d.data.class.indexOf("operationNodeWithAuxiliary") >= 0) ? 0 : -10}// label偏移
                              >
                                {d.data.label}
                              </text>
                            }
                          </g>
                          {(d.data.moduleHoleFlag && isHiddenInterModuleEdges) &&
                            <g>
                              {d.data.moduleHoleType.map((type, i) => (
                                <circle
                                  key={i}
                                  className="module-hole"
                                  r="6"
                                  cx={d.style.rectWidth * 0.5 - 10}
                                  cy={
                                    (d.data.class.indexOf('cluster') > -1) ?
                                      (type === "in" ? -d.style.rectHeight * 0.5 + 10 : d.style.rectHeight * 0.5 - 10) : 0
                                  }
                                />
                              ))}
                            </g>
                          }
                          {(d.key in moduleConnection && d.data.inModuleConnection.length && isHiddenInterModuleEdges) && <g className="in-module-node-hole">
                            <circle
                              r="4"
                              cx={d.style.nodeHoleInEdgeStartX}
                              cy={d.style.nodeHoleInEdgeStartY}
                              data-id={d.key}
                              data-type={"target"}
                              onMouseOver={(e) => handleNodeHoleMouseover(e)}
                              onMouseOut={handleHiddenEdgeMouseout}
                            />
                            {d.data.inModuleConnection.map((nodeHole, i) =>
                              <path
                                key={i}
                                d={line.curve(d3.curveBasis)([
                                  { x: d.style.nodeHoleInEdgeStartX, y: d.style.nodeHoleInEdgeStartY },
                                  d.data.inInterPoint[i],
                                  { x: d.data.nodeHoleInEdgeEndXArray[i], y: d.style.nodeHoleInEdgeEndY }
                                ])}
                                stroke={getColor(`${nodeHole}-${d.data.nestedModuleForColor}`)}
                                data-id={d.key}
                                data-type={"target"}
                                data-connectedmodule={nodeHole}
                                onMouseOver={(e) => handleNodeShortEdgeMouseover(e)}
                                onMouseOut={handleHiddenEdgeMouseout}
                              ></path>
                            )}
                          </g>}
                          {(d.key in moduleConnection && d.data.outModuleConnection.length && isHiddenInterModuleEdges) && <g className="out-module-node-hole">
                            <circle
                              r="4"
                              cx={d.style.nodeHoleOutEdgeEndX}
                              cy={d.style.nodeHoleOutEdgeEndY}
                              data-id={d.key}
                              data-type={"source"}
                              onMouseOver={(e) => handleNodeHoleMouseover(e)}
                              onMouseOut={handleHiddenEdgeMouseout}
                            />
                            {d.data.outModuleConnection.map((nodeHole, i) =>
                              <path
                                key={i}
                                d={line.curve(d3.curveBasis)([
                                  { x: d.data.nodeHoleOutEdgeStartXArray[i], y: d.style.nodeHoleOutEdgeStartY },
                                  d.data.outInterPoint[i],
                                  { x: d.style.nodeHoleOutEdgeEndX, y: d.style.nodeHoleOutEdgeEndY }
                                ])}
                                stroke={getColor(`${d.data.nestedModuleForColor}-${nodeHole}`)}
                                data-id={d.key}
                                data-type={"source"}
                                data-connectedmodule={nodeHole}
                                onMouseOver={(e) => handleNodeShortEdgeMouseover(e)}
                                onMouseOut={handleHiddenEdgeMouseout}
                              ></path>
                            )}
                          </g>}
                        </g>
                      )
                    }
                    )}
                  </g>
                )}
              </TransitionMotion>
              <TransitionMotion
                styles={generateEdgeStyles(edges)}>
                {interpolatedStyles => (
                  <g className='edgePaths'>
                    {interpolatedStyles.map(d => (
                      <g className="edgePath" key={d.key}>
                        <path
                          d={line([
                            { x: d.style.startPointX, y: d.style.startPointY },
                            ...d.data.lineData,
                            { x: d.style.endPointX, y: d.style.endPointY }
                          ])}
                          markerEnd="url(#arrowhead)"></path>
                      </g>
                    ))}
                  </g>
                )}
              </TransitionMotion>
              {isHiddenInterModuleEdges && <TransitionMotion styles={generateAcrossModuleEdgeStyles(graphForLayout, nodes)}>
                {interpolatedStyles => (
                  <g className="moduleEdgePaths">
                    {interpolatedStyles.map((d, i) => (
                      <g className="moduleEdgePath" key={d.key} id={`${d.data.source.replace(/\//g, '-').replace(/\(|\)/g, '')}-${d.data.target.replace(/\//g, '-').replace(/\(|\)/g, '')}`}>
                        <path
                          d={line.curve(d3.curveBasis)([
                            { x: d.style.startPointX, y: d.style.startPointY },
                            ...d.data.interPoints,
                            { x: d.style.endPointX, y: d.style.endPointY }
                          ])}
                          stroke={getColor(`${d.data.source}-${d.data.target}`)}
                          strokeWidth={Math.sqrt(d.style.width) / 2}
                          data-source={d.data.source}
                          data-target={d.data.target}
                          onMouseOver={(e) => handleModuleEdgeMouseover(e)}
                          onMouseOut={handleHiddenEdgeMouseout}
                        ></path>
                        <ellipse
                          cx={d.style.startPointX}
                          cy={d.style.startPointY}
                          rx={Math.sqrt(d.style.width) / 4 - 0.2}
                          ry={Math.sqrt(d.style.width) / 8}
                          strokeWidth="0.4"
                          stroke={getColor(`${d.data.source}-${d.data.target}`)}
                          fill="#fff"
                          transform={`rotate(${90 + d.style.ellipseRotateAngle}, ${d.style.startPointX}, ${d.style.startPointY})`}
                        />
                        <ellipse
                          cx={d.style.endPointX}
                          cy={d.style.endPointY}
                          rx={Math.sqrt(d.style.width) / 4 - 0.2}
                          ry={Math.sqrt(d.style.width) / 8}
                          strokeWidth="0.4"
                          stroke={getColor(`${d.data.source}-${d.data.target}`)}
                          fill="#fff"
                          transform={`rotate(${90 + d.style.ellipseRotateAngle}, ${d.style.endPointX}, ${d.style.endPointY})`}
                        />
                      </g>
                    ))}
                  </g>
                )}
              </TransitionMotion>}
              <g className="hiddenEdges">
                {hiddenEdges.map((d) => (
                  <path
                    key={`${d.source}-${d.target}`}
                    d={line.curve(d3.curveBasis)([
                      { x: d.startPointX, y: d.startPointY },
                      ...d.interPoints,
                      { x: d.endPointX, y: d.endPointY }
                    ])}
                  ></path>
                ))}
              </g>
            </g>
          </svg>
          <g id="gBrushHolder"></g>
        </g>
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
          outputG={outputRef.current}
          outputSVG={outputSVGRef.current}
          transform={transform}
          handleChangeTransform={handleChangeTransform}
        // outputSVG_Copy={(outputSVGRef.current) ? (outputSVGRef.current as any).cloneNode(true) : null}
        />
      </div>
      <Popover
        open={isPopoverOpen}
        anchorEl={anchorEl}
        onClose={currentNodetype < 0 ? handleClosePopoverWithoutDeselect : handleClosePopover}//多选时关闭不取消已勾选项
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Card>
          <CardContent style={{ width: 190 }}>
            <Typography
              // variant="h5"
              // component="h2"
              style={{
                fontSize: 16,
                fontWeight: "bold",
                marginBottom: 10,
                textAlign: 'center'
              }}
            >
              Modification Options
            </Typography>
            {currentNodetype < 0 ?
              <div id="group-aggre-container">
                <TextField
                  id="group-name-input"
                  label="Group Name"
                  variant="filled"
                  size="small"
                  style={{
                    width: '100%',
                    marginBottom: 10
                  }}
                />
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  style={{
                    width: '100%',
                    fontSize: 14,
                    marginBottom: 5
                  }}
                  onClick={handleAggregate}
                >
                  Aggregate
                </Button>
              </div> :
              <div id="type-modify-container">
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  style={{
                    width: '100%',
                    fontSize: 14,
                    marginBottom: 10
                  }}
                  onClick={handleUngroup}
                >
                  Ungroup
                </Button>
                <div id="nodetype-modify-container">
                  <InputLabel id="nodetype-selector" style={{ fontSize: 10 }}>Node Type</InputLabel>
                  <Select
                    value={currentNodetype}
                    onChange={handleNodetypeChange}
                    style={{
                      width: '100%',
                      marginBottom: 10,
                      fontSize: 14
                    }}
                  >
                    <MenuItem value={NodeType.LAYER}>layer Node</MenuItem>
                    <MenuItem value={NodeType.GROUP}>group Node</MenuItem>
                  </Select>
                </div>
                {currentNodetype === NodeType.LAYER &&
                  <div id="layertype-modify-container">
                    <InputLabel id="layertype-selector" style={{ fontSize: 10 }}>Layer Type</InputLabel>
                    <Select
                      value={currentLayertype}
                      onChange={handleLayertypeChange}
                      style={{
                        width: '100%',
                        marginBottom: 10,
                        fontSize: 14
                      }}
                    >
                      <MenuItem value={LayerType.CONV}>CONV</MenuItem>
                      <MenuItem value={LayerType.RNN}>RNN</MenuItem>
                      <MenuItem value={LayerType.FC}>FC</MenuItem>
                      <MenuItem value={LayerType.OTHER}>OTHER</MenuItem>
                    </Select>
                  </div>
                }
                {currentNodetype === NodeType.LAYER &&
                  <div id="showLineChart-modify-container">
                    <InputLabel id="showLineChart-selector" style={{ fontSize: 10 }}>Show LineChart</InputLabel>
                    <Select
                      value={currentShowLineChart}
                      onChange={handleLineChartToggle}
                      style={{
                        width: '100%',
                        marginBottom: 10,
                        fontSize: 14
                      }}
                    >
                      <MenuItem value={"true"}>true</MenuItem>
                      <MenuItem value={"false"}>false</MenuItem>
                    </Select>
                  </div>
                }
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  style={{
                    width: '100%',
                    fontSize: 14,
                    marginBottom: 5
                  }}
                  onClick={handleModifyNodetype}
                >
                  Apply
                </Button>
              </div>
            }
            <Button
              variant="outlined"
              color="primary"
              size="small"
              style={{
                width: '100%',
                fontSize: 14,
                marginBottom: 5
              }}
              onClick={handleEnterLayer}
            >
              Layer-level
                </Button>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              style={{
                width: '100%',
                fontSize: 14
              }}
              onClick={handleClosePopover}
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      </Popover>
    </div >
  );
}

export default DagreLayoutGraph;