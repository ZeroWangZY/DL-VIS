import React, { useState, useEffect, useRef } from "react";
import "./DagreLayoutGraph.css";
import { NodeType, ProcessedGraph, RawEdge, NodeDef, NodeId, GroupNode } from "../../types/processed-graph"
import * as dagreD3 from "dagre-d3";
import * as d3 from "d3";

interface DagreLayoutGraphProps {
    graphForLayout: ProcessedGraph;
}

// 找到该边需要需要连接到的节点 id
function findExpandedParentNodeId(targetNodeId: string, nodeMap: { [nodeId: string]: NodeDef }): string {
    let expandedParentId = targetNodeId;
    if (!nodeMap[expandedParentId]) {
      debugger;
    }
    let parent = nodeMap[expandedParentId].parent;
    // 如果有parent 且不为根节点 且未展开 则把边连到parent上 如果展开了 则直接连到原节点上
    while (parent && parent !== "___root___" && !nodeMap[parent]["expanded"]) {
        expandedParentId = parent;
        parent = nodeMap[expandedParentId].parent;
    }
    return expandedParentId;
}

// 提取目前所有展开的节点
// 循环children 把要展开的节点加入展示节点数组
function traverseChildren(node: NodeDef,
    targetNodes: Array<string>,
    nodeMap: { [nodeId: string]: NodeDef }) {
    if (!("children" in node) || !node.expanded) {
        targetNodes.push(node.id);
    } else { //展开了
        targetNodes.push(node.id);// 如果组展开了 这个父组的节点也要展示
        node.children.forEach(nodeId => {
            traverseChildren(nodeMap[nodeId], targetNodes, nodeMap);
        })
    }
}

let transform = null

const DagreLayoutGraph: React.FC<DagreLayoutGraphProps> = (props: DagreLayoutGraphProps) => {
    const { graphForLayout } = props;
    const svgRef = useRef();
    
    const toggleExpanded = id => {
        let node = graphForLayout.nodeMap[id]
        if (node.type !== NodeType.GROUP && node.type !== NodeType.LAYER) {
            return
        }
        node = node as GroupNode
        node.expanded = !node.expanded
        draw()
    }

    const draw = () => {
        const graph = new dagreD3.graphlib.Graph({ compound: true })
            .setGraph({})
            .setDefaultEdgeLabel(function () { return {}; });;
        const render = new dagreD3.render();
        const displayedNodes: Array<string> = [];
        const svg = d3.select(svgRef.current)

        svg.selectAll('*').remove()


        const svgGroup = svg.append('g').attr("transform", transform)
        let zoom = d3
            .zoom().on("zoom", function () {
                transform = d3.event.transform
                svgGroup.attr("transform", d3.event.transform);
            });
        svg.call(zoom).on("dblclick.zoom", null);

        const { rootNode, nodeMap, rawEdges } = graphForLayout;

        rootNode.children.forEach(nodeId => {
            traverseChildren(nodeMap[nodeId], displayedNodes, nodeMap);
        })
        // 在rawedges里找要展示的边
        const displayedEdges: Array<RawEdge> = [];
        // 把edges在children里的边的source和target处理成displayedNodes中的节点
        for (let edge of rawEdges) {
            let newSource = findExpandedParentNodeId(edge.source, nodeMap);
            let newTarget = findExpandedParentNodeId(edge.target, nodeMap);
            if (displayedNodes.includes(newSource) && displayedNodes.includes(newTarget)) {
                let newEdge = { source: newSource, target: newTarget };
                let pushFlag = true;
                if (newSource === newTarget) {
                    pushFlag = false;
                } else {
                    displayedEdges.forEach(item => {
                        if ((item.source === newSource && item.target === newTarget)) {
                            pushFlag = false;
                        }
                    })
                }
                if (pushFlag) {
                    displayedEdges.push(newEdge)
                }
            }
        }

        for (let nodeId of displayedNodes) {
            let node = nodeMap[nodeId];
            graph.setNode(node.id, {
                id: node.id,
                label: node.displayedName,
                shape: node.type === NodeType.OPERTATION ? "ellipse" : "rect",
                class: `nodeitem-${node.type}`,
                clusterLabelPos: 'top'
            });
        }
        for (let nodeId of displayedNodes) {
            if (nodeMap[nodeId].parent !== "___root___") {
                graph.setParent(nodeId, nodeMap[nodeId].parent);
            }
        }
        for (let edge of displayedEdges) {
            graph.setEdge(edge.source, edge.target, {
                style: "stroke: #333; fill: none;",
                arrowheadStyle: "fill: #333; stroke: #333;",
                arrowhead: 'vee'
            });
        }

        graph.graph().nodesep = 30;

        render(svgGroup, graph); //渲染节点

        svgGroup.selectAll('.node')
            .on('dblclick', (id: NodeId) => toggleExpanded(id))
        svgGroup.selectAll('.cluster')
            .on('dblclick', (id: NodeId) => toggleExpanded(id))
    }

    useEffect(() => {
        if (graphForLayout === null) return
        draw()

    }, [graphForLayout]);

    return (
        <div id="dagre-graph" style={{ height: '100%' }}>
            <svg id="dagre-svg" ref={svgRef} style={{ height: '100%' }}></svg>
        </div>
    );
}

export default DagreLayoutGraph;