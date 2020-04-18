import React, { useEffect, useRef, useState } from 'react';
import './DagreLayoutGraph.css';
import { NodeType, LayerType, DataType, RawEdge, GroupNode, LayerNode, GroupNodeImp, LayerNodeImp, DataNodeImp, OperationNodeImp } from '../../types/processed-graph'
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
import { useProcessedGraph, broadcastGraphChange, setProcessedGraph } from '../../store/useProcessedGraph';

const DagreLayoutGraph: React.FC = () => {
  const graphForLayout = useProcessedGraph();
  const [graph, setGraph] = useState();
  const [edges, setEdges] = useState({});
  const [nodes, setNodes] = useState({});
  const [transform, setTransform] = useState(null)
  const svgRef = useRef();
  const outputRef = useRef();

  const [bgRectHeight, setBgRectHeight] = useState(0);
  const [selectMode, setSelectMode] = useState(false);// 单选模式
  const [anchorEl, setAnchorEl] = useState(null);// popover的位置
  const [currentNodetype, setCurrentNodetype] = useState<number>(-1);
  const [currentLayertype, setCurrentLayertype] = useState<string>(null);

  let ctrlKey, // 刷选用ctrl不用shift，因为在d3 brush中已经赋予了shift含义（按住shift表示会固定刷取的方向），导致二维刷子刷不出来
    shiftKey, // 单选用shift
    brushMode,// 框选模式
    gBrushHolder,
    gBrush,// 放置brush的group
    brush;// d3 brush

  let node = null;// 所有node group
  let svgBoundingClientRect = null;

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
    .y(d => getY(d))

  const toggleExpanded = id => {
    id = id.replace(/-/g, '/'); //还原为nodemap中存的id格式
    let node = graphForLayout.nodeMap[id]
    if (node.type !== NodeType.GROUP && node.type !== NodeType.LAYER) {
      return
    }
    node = node as GroupNode
    node.expanded = !node.expanded
    broadcastGraphChange()

    /**
     测了一下，动态地添加节点和边不会节省计算时间，dagre依然是把所有的节点和边重新计算一遍。
     所以暂时把这一段注释掉了
    */
    // 如果展开孩子
    // if (node.expanded) {
    //   // 把孩子节点加入 指定parent
    //   node.children.forEach(childId => {
    //     let chileNode = graphForLayout.nodeMap[childId];
    //     graph.setNode(childId, {
    //       id: childId,
    //       label: chileNode.displayedName,
    //       shape: chileNode.type === NodeType.OPERTATION ? 'ellipse' : 'rect',
    //       class: `nodetype-${chileNode.type}`,
    //       // clusterLabelPos: 'top',
    //       width: chileNode.displayedName.length * 10,
    //       height: 50
    //     });
    //     graph.setParent(childId, id);
    //   });

    //   // 删去连在父节点的边
    //   let inEdges = graph.inEdges(id), outEdges = graph.outEdges(id);
    //   inEdges.forEach(inEdge => {
    //     graph.removeEdge(inEdge)
    //   });
    //   outEdges.forEach(outEdge => {
    //     graph.removeEdge(outEdge)
    //   });
      
    // } else {// 如果关上
    //   // 删除子节点  应该循环删除所有 todo
    //   node.children.forEach(childId => {
    //     graph.removeNode(childId);// 子节点的边也自动删除了
    //   });
    //   // graph.removeNode(id);
    //   // 重新获得父节点的大小
    //   graph.setNode(id, {
    //     id: id,
    //     label: node.displayedName,
    //     shape: node.type === NodeType.OPERTATION ? 'ellipse' : 'rect',
    //     class: `nodetype-${node.type}`,
    //     // clusterLabelPos: 'top',
    //     width: node.displayedName.length * 10,
    //     height: 50
    //   });
    // }
    // // draw()
    // const displayedEdges: Array<RawEdge> = graphForLayout.getDisplayedEdges(graph.nodes());
    // for (const {source, target} of displayedEdges) {
    //   // 如果之前没存在这条边 加进去
    //   if(!graph.hasEdge(source, target)) {
    //     graph.setEdge(source, target);
    //   }
    // }
    // // 重新布局算位置
    // dagre.layout(graph);
    // let newNodes = {}, newEdges = {};
    // graph.nodes().forEach(function(v) {
    //   newNodes[v] = graph.node(v);
    // });
    // graph.edges().forEach(function(edge) {
    //   newEdges[`${edge.v}-${edge.w}`] = graph.edge(edge);
    // });
    // newNodes[id].class = (node.expanded) ?  newNodes[id].class + " cluster" : newNodes[id].class.split("")[0];
    // // 重新render
    // setNodes(newNodes);
    // setEdges(newEdges);
    // setGraph(graph);
  }

  const draw = () => {
    const graph = new dagre.graphlib.Graph({ compound: true })
      .setGraph({})
      .setDefaultEdgeLabel(function () { return {}; });;

    const { nodeMap } = graphForLayout;
    let start = Date.now();
    const displayedNodes: Array<string> = graphForLayout.getDisplayedNodes();
    // console.log('getDisplayedNodes:', Date.now() - start, 'ms');
    start = Date.now()
    const displayedEdges: Array<RawEdge> = graphForLayout.getDisplayedEdges(displayedNodes);
    // console.log('getDisplayedEdges:', Date.now() - start, 'ms');

    start = Date.now()
    for (const nodeId of displayedNodes) {
      const node = nodeMap[nodeId];
      let width, height;
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
        if (node.dataType === DataType.INPUT || node.dataType === DataType.OUTPUT) {
          width = 10;
          height = 10;
        } else {
          width = 30;
          height = 10;
        }
      } else if (node instanceof OperationNodeImp) {
        width = 30;
        height = 10;
      }

      graph.setNode(node.id, {
        id: node.id,
        label: node.displayedName,
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
    // console.log('setNode and set Edge:', Date.now() - start, 'ms');

    start = Date.now()
    graph.graph().nodesep = 50;
    dagre.layout(graph);
    // console.log('dagre.layout:', Date.now() - start, 'ms');

    let newNodes = {}, newEdges = {};

    start = Date.now()
    graph.nodes().forEach(function(v) {
      newNodes[v] = graph.node(v);
    });
    graph.edges().forEach(function(edge) {
      newEdges[`${edge.v}-${edge.w}`] = graph.edge(edge);
    });
    // console.log('create newNodes and newEdges:', Date.now() - start, 'ms');

    setAnchorEl(null);
    setNodes(newNodes);
    setEdges(newEdges);
    setGraph(graph);
  }

  const generateNodeStyles = () => {
    let start = Date.now();
    let styles = [];
    for (const nodeId in nodes) {
      styles.push({
        key: nodeId,
        data: {
          class: nodes[nodeId].class,
          id: nodeId.replace(/\//g, '-'), //把"/"换成"-"，因为querySelector的Id不能带/
          label: nodes[nodeId].label,
        },
        style: {
          gNodeTransX: spring(nodes[nodeId].x),
          gNodeTransY: spring(nodes[nodeId].y),
          rectHeight: spring(nodes[nodeId].height),
          rectWidth: spring(nodes[nodeId].width),
          ellipseX: spring(-nodes[nodeId].width / 2),
          ellipseY: spring(-nodes[nodeId].height / 2)
        }
      })
    }
    // console.log('generateNodeStyles:', Date.now() - start, 'ms');
    return styles;
  }

  const generateEdgeStyles = () => {
    let start = Date.now();
    let styles = [];
    for (const edgeId in edges) {
      const pointNum = edges[edgeId].points.length;
      const startPoint = edges[edgeId].points[0];
      const endPoint = edges[edgeId].points[pointNum-1];
      let restPoints = edges[edgeId].points.slice(1,pointNum-1);
      styles.push({
        key: edgeId,
        data: {
          lineData: restPoints
        },
        style: {
          startPointX: spring(startPoint.x),
          startPointY: spring(startPoint.y),
          endPointX: spring(endPoint.x),
          endPointY: spring(endPoint.y),
        }
      });
    }
    // console.log('generateEdgeStyles:', Date.now() - start, 'ms');
    return styles;
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
        // 聚合得到的节点
        let newGroupNode =  new GroupNodeImp({
          id: groupName,
          children: new Set(selectedNodeId),
          parent: parentId
        });

        // 暂时不深拷贝 （发现SON.stringify对set结构不起作用
        // let newGraphForLayout = JSON.parse(JSON.stringify(graphForLayout));

        // 暂时直接改graphForLayout
        graphForLayout.nodeMap[groupName] = newGroupNode;
        
        // 更新父节点的孩子
        let parentNode = (parentId === "___root___") ? graphForLayout.rootNode : graphForLayout.nodeMap[parentId];
        parentNode  = parentNode as GroupNode | LayerNode;
        parentNode.children.add(groupName);
        for (let id of selectedNodeId) {
          parentNode.children.delete(id);
          graphForLayout.nodeMap[id].parent = groupName;// 更新所有选中节点的parent
        }

        broadcastGraphChange();

        // setProcessedGraph(newGraphForLayout);
      }
    }
  }

  // ungroup一个group node or layer node
  const handleUngroup = () => {
    let selectedG = d3.select(svgRef.current).selectAll("g.selected");
    selectedG.each(function() {
      let nodeId = d3.select(this).attr("id").replace(/-/g, '/'); //还原为nodemap中存的id格式
      let nodeToDelete = graphForLayout.nodeMap[nodeId] as GroupNode | LayerNode;// 要删除的节点

      let parentNodeId = nodeToDelete.parent;
      let parentNode = (parentNodeId === "___root___") ? graphForLayout.rootNode : graphForLayout.nodeMap[parentNodeId];

      // 更新该节点的parent的children
      (parentNode as GroupNode | LayerNode).children.delete(nodeId);
      // 更新该节点的children的parent
      let childrenIdSet = nodeToDelete.children;
      childrenIdSet.forEach(childId => {
        graphForLayout.nodeMap[childId].parent = parentNodeId;
        (parentNode as GroupNode | LayerNode).children.add(childId);
      })
      
      // 删除该节点
      delete graphForLayout.nodeMap[nodeId];
      broadcastGraphChange();
    })
  }

  // 修改节点属性, 暂时只考虑了修改单个节点属性
  const handleModifyNodetype = () => {
    let selectedG = d3.select(svgRef.current).selectAll("g.selected");
    selectedG.each(function() {
      let nodeId = d3.select(this).attr("id").replace(/-/g, '/'); //还原为nodemap中存的id格式
      let oldNode = graphForLayout.nodeMap[nodeId] as GroupNode | LayerNode;

      // 判断是否修改
      let newNode;
      if (oldNode.type !== currentNodetype) {// 修改了节点类型
        let opts = {displayedName: oldNode.displayedName};
        if(currentNodetype === NodeType.GROUP) {
          newNode =  new GroupNodeImp({
            id: oldNode.id,
            children: oldNode.children,
            parent: oldNode.parent,
            opts,
          });
        } else if (currentNodetype === NodeType.LAYER) {
          newNode =  new LayerNodeImp({
            id: oldNode.id,
            children: oldNode.children,
            parent: oldNode.parent,
            layerType: LayerType[currentLayertype],
            opts
          });
        }
        graphForLayout.nodeMap[nodeId] = newNode;
        broadcastGraphChange();
      } else if (oldNode.type === NodeType.LAYER && (oldNode as LayerNode).layerType !== currentLayertype){
        (oldNode as LayerNode).layerType = LayerType[currentLayertype];
        broadcastGraphChange();
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
        // clickNode = e.target.nodeName === "text" ? e.target.parentNode.parentNode : e.target.parentNode;
        clickNode = e.target.parentNode.parentNode;
      } else {
        clickNode = selectedG.node();
      }
      let nodeId = d3.select(clickNode).attr("id").replace(/-/g, '/'); //还原为nodemap中存的id格式
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
    setCurrentNodetype(-1);
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

  // 点击空白处取消所有选择
  const handleBgClick = () => {
    node = d3.select(".nodes").selectAll(".node");
    node.classed("selected", false);
    node.classed("previouslySelected", false);
  }

  // 按住shift后单击选择
  const handleNodeSelect = (id) => {
    const previouslySelected = d3.select(`#${id}`).attr("class").indexOf("selected") > -1 ? true : false;
    d3.select(`#${id}`).classed("selected", !previouslySelected);
    // d3.select(`#${id}`).classed("previouslySelected", !previouslySelected);
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

  const brushstart = () => {
    node = d3.select(".nodes").selectAll(".node");
    node.each(function() {
        const previouslySelected = d3.select(this).attr("class").indexOf("selected") > -1 ? true : false;
        d3.select(this).classed("previouslySelected", ctrlKey && previouslySelected);
    });
  }

  const brushed = () => {
    if (!d3.event.sourceEvent) return;
    if (!d3.event.selection) return;

    let extent = d3.event.selection;
    node.classed("selected", function() {
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

    node.classed("previouslySelected", function() {
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
      .zoom().on('zoom', function () {
        // setTransform(d3.event.transform)
        // transform = d3.event.transform
        // 没使用setTransform还是考虑到transform变化后generate style都会重新执行
        outputG.attr('transform', d3.event.transform);
      });
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
  },[])

  useEffect(() => {
    if (graphForLayout === null || !Object.keys(graphForLayout.nodeMap).length) return;
    draw();
  }, [graphForLayout]);

  const getLabelContainer = (nodeClass, width, height) => {
    if (nodeClass.indexOf(`layertype-${LayerType.FC}`) > -1) {
      return (<FCLayerNode width={width} height={height}/>);
    } else if (nodeClass.indexOf(`layertype-${LayerType.CONV}`) > -1) {
      return (<CONVLayerNode width={width} height={height}/>);
    } else if (nodeClass.indexOf(`layertype-${LayerType.RNN}`) > -1) {
      return (<RNNLayerNode width={width} height={height}/>);
    } else if (nodeClass.indexOf(`layertype-${LayerType.OTHER}`) > -1) {
      return (<OTHERLayerNode width={width} height={height}/>)
    } else {
      return (
        <g>
          <rect className='label-container'
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
      <svg id='dagre-svg' ref={svgRef} style={{ height: '100%' }} onContextMenu={(e) => {e.preventDefault()}}>
        <defs>
          <marker id="arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="strokeWidth" markerWidth="8" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 L 4 5 z" fill='#999999' stroke='#999999'></path>
          </marker>
          <marker id="rnn-arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="strokeWidth" markerWidth="6" markerHeight="5" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 L 8 5 z" fill='#fff' stroke='#fff'></path>
          </marker>
        </defs>
        <rect className="bg-rect" width="100%" height={bgRectHeight} onClick={() => handleBgClick()}></rect>
        <g
          className='output'
          id="output-g"
          ref={outputRef}
          transform={transform}
          onContextMenu={(e) => handleRightClick(e)}>
          {/* <g className='clusters'></g> */}
          <TransitionMotion styles={generateNodeStyles()}>
            {interpolatedStyles => (
              <g className='nodes'>
                {interpolatedStyles.map(d => {
                  return (
                  <g
                    className={`node ${d.data.class}`}
                    id={d.data.id}
                    key={d.key}
                    transform={`translate(${d.style.gNodeTransX}, ${d.style.gNodeTransY})`}
                    onClick={() => selectMode ? handleNodeSelect(d.data.id) : toggleExpanded(d.data.id) }>
                    {getLabelContainer(d.data.class, d.style.rectWidth, d.style.rectHeight)}
                    <g className={`node-label`} transform={(d.data.class.indexOf('cluster') > -1)?`translate(0,-${d.style.rectHeight / 2})`:null}>
                      <text
                        dominantBaseline={(d.data.class.indexOf('cluster') > -1)?"text-before-edge":"middle"}
                        y={(d.data.class.indexOf('nodetype-1') > -1 || d.data.class.indexOf('nodetype-2') > -1) ? 0 : -10}// label偏移
                      >
                        {d.data.label}
                      </text>
                    </g>
                  </g>
                  )}
                )}
              </g>
            )}
          </TransitionMotion>
          <TransitionMotion styles={generateEdgeStyles()}>
            {interpolatedStyles => (
              <g className='edgePaths'>
                {interpolatedStyles.map(d => (
                  <g className="edgePath" key={d.key}>
                    <path
                      d={line([
                        {x: d.style.startPointX, y: d.style.startPointY},
                        ...d.data.lineData,
                        {x: d.style.endPointX, y: d.style.endPointY}
                      ])}
                      markerEnd="url(#arrowhead)"></path>
                  </g>
                ))}
              </g>
            )}
          </TransitionMotion>
        </g>
        <g id="gBrushHolder"></g>
      </svg>
      <Popover
        open={isPopoverOpen}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
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
          <CardContent style={{width: 190}}>
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
                  <InputLabel id="nodetype-selector" style={{fontSize: 10}}>Node Type</InputLabel>
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
                    <InputLabel id="layertype-selector" style={{fontSize: 10}}>Layer Type</InputLabel>
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
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  style={{
                    width: '100%',
                    fontSize: 14
                  }}
                  onClick={handleModifyNodetype}
                >
                  Apply
                </Button>
              </div>
            }
          </CardContent>
        </Card>
      </Popover>
    </div>
  );
}

export default DagreLayoutGraph;