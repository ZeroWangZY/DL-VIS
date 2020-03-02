import React, { useEffect, useRef, useState } from 'react';
import './DagreLayoutGraph.css';
import { NodeType, ProcessedGraph, RawEdge, NodeId, GroupNode } from '../../types/processed-graph'
import * as dagre from 'dagre';
import * as d3 from 'd3';
import { TransitionMotion, spring } from 'react-motion';
import { useProcessedGraph } from '../../store/useProcessedGraph';

let transform = null

const DagreLayoutGraph: React.FC = () => {
  const graphForLayout = useProcessedGraph();
  const [graph, setGraph] = useState();
  const [edges, setEdges] = useState({});
  const [nodes, setNodes] = useState({});

  const svgRef = useRef();
  const outputRef = useRef();

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
    let node = graphForLayout.nodeMap[id]
    if (node.type !== NodeType.GROUP && node.type !== NodeType.LAYER) {
      return
    }
    node = node as GroupNode
    node.expanded = !node.expanded
    // 如果展开孩子
    if (node.expanded) {
      // 把孩子节点加入 指定parent
      node.children.forEach(childId => {
        let chileNode = graphForLayout.nodeMap[childId];
        graph.setNode(childId, {
          id: childId,
          label: chileNode.displayedName,
          shape: chileNode.type === NodeType.OPERTATION ? 'ellipse' : 'rect',
          class: `nodeitem-${chileNode.type}`,
          // clusterLabelPos: 'top',
          width: chileNode.displayedName.length * 10,
          height: 50
        });
        graph.setParent(childId, id);
      });

      // 删去连在父节点的边
      let inEdges = graph.inEdges(id), outEdges = graph.outEdges(id);
      inEdges.forEach(inEdge => {
        graph.removeEdge(inEdge)
      });
      outEdges.forEach(outEdge => {
        graph.removeEdge(outEdge)
      });
      
    } else {// 如果关上
      // 删除子节点  应该循环删除所有 todo
      node.children.forEach(childId => {
        graph.removeNode(childId);// 子节点的边也自动删除了
      });
      // graph.removeNode(id);
      // 重新获得父节点的大小
      graph.setNode(id, {
        id: id,
        label: node.displayedName,
        shape: node.type === NodeType.OPERTATION ? 'ellipse' : 'rect',
        class: `nodeitem-${node.type}`,
        // clusterLabelPos: 'top',
        width: node.displayedName.length * 10,
        height: 50
      });
    }
    // draw()
    const displayedEdges: Array<RawEdge> = graphForLayout.getDisplayedEdges(graph.nodes());
    for (const {source, target} of displayedEdges) {
      // 如果之前没存在这条边 加进去
      if(!graph.hasEdge(source, target)) {
        graph.setEdge(source, target);
      }
    }
    // 重新布局算位置
    dagre.layout(graph);
    let newNodes = {}, newEdges = {};
    graph.nodes().forEach(function(v) {
      newNodes[v] = graph.node(v);
    });
    graph.edges().forEach(function(edge) {
      newEdges[`${edge.v}-${edge.w}`] = graph.edge(edge);
    });
    newNodes[id].class = (node.expanded) ?  newNodes[id].class + " cluster" : newNodes[id].class.split("")[0];
    // 重新render
    setNodes(newNodes);
    setEdges(newEdges);
    setGraph(graph);
  }

  const draw = () => {
    const graph = new dagre.graphlib.Graph({ compound: true })
      .setGraph({})
      .setDefaultEdgeLabel(function () { return {}; });;

    const { nodeMap } = graphForLayout;

    const displayedNodes: Array<string> = graphForLayout.getDisplayedNodes();
    const displayedEdges: Array<RawEdge> = graphForLayout.getDisplayedEdges(displayedNodes);

    for (const nodeId of displayedNodes) {
      const node = nodeMap[nodeId];
      graph.setNode(node.id, {
        id: node.id,
        label: node.displayedName,
        shape: node.type === NodeType.OPERTATION ? 'ellipse' : 'rect',
        class: `nodeitem-${node.type}`,
        // clusterLabelPos: 'top',
        width: node.displayedName.length * 10,
        height: 50
      });
      if (node.parent !== '___root___') {
        graph.setParent(nodeId, node.parent);
      }
    }

    for (const edge of displayedEdges) {
      graph.setEdge(edge.source, edge.target, {
        // style: 'stroke: #333; fill: none;',
        arrowheadStyle: 'fill: #333; stroke: #333;',
        arrowhead: 'vee'
      });
    }

    graph.graph().nodesep = 30;

    dagre.layout(graph);

    let newNodes = {}, newEdges = {};

    graph.nodes().forEach(function(v) {
      newNodes[v] = graph.node(v);
    });
    graph.edges().forEach(function(edge) {
      newEdges[`${edge.v}-${edge.w}`] = graph.edge(edge);
    });
    setNodes(newNodes);
    setEdges(newEdges);
    setGraph(graph);

  }

  const generateNodeStyles = () => {
    let styles = [];
    for (const nodeId in nodes) {
      styles.push({
        key: nodeId,
        data: {
          class: nodes[nodeId].class,
          id: nodeId,
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
    return styles;
  }

  // todo
  const generateEdgeStyles = () => {
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
    return styles;
  }

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    const outputG = d3.select(outputRef.current)
    console.log(svg, outputG)
    let zoom = d3
      .zoom().on('zoom', function () {
        transform = d3.event.transform
        outputG.attr('transform', d3.event.transform);
      });
    svg.call(zoom).on('dblclick.zoom', null);
  },[])

  useEffect(() => {
    if (graphForLayout === null) return
    draw()

  }, [graphForLayout]);

  return (
    <div id='dagre-graph' style={{ height: '100%' }}>
      <svg id='dagre-svg' ref={svgRef} style={{ height: '100%' }}>
        <defs>
          <marker id="arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="strokeWidth" markerWidth="8" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 L 4 5 z" fill='#333' stroke='#333'></path>
          </marker>
        </defs>
        <g className='output' id="output-g" ref={outputRef} transform={transform}>
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
                    onClick={() => toggleExpanded(d.data.id)}>
                    {(d.data.class === 'nodeitem-0') ? 
                      <ellipse className='label-container'
                        x={d.style.ellipseX}
                        y={d.style.ellipseY}
                        rx={-d.style.ellipseX}
                        ry={-d.style.ellipseY}
                        ></ellipse> : <rect className='label-container'
                        width={d.style.rectWidth}
                        height={d.style.rectHeight}
                        transform={`translate(-${d.style.rectWidth / 2}, -${d.style.rectHeight / 2})`}
                    ></rect>}
                    <g className='my-label' transform={(d.data.class.indexOf('cluster') > -1)?`translate(0,-${d.style.rectHeight / 2})`:null}>
                      <text dominantBaseline={(d.data.class.indexOf('cluster') > -1)?"text-before-edge":"middle"}>
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
      </svg>
    </div>
  );
}

export default DagreLayoutGraph;