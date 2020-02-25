import React, { useEffect, useRef } from "react";
import "./DagreLayoutGraph.css";
import { NodeType, ProcessedGraph, RawEdge, NodeId, GroupNode } from "../../types/processed-graph"
import * as dagreD3 from "dagre-d3";
import * as d3 from "d3";
import { useTestProcessedGraph } from "../../hooks/useTestData";

let transform = null

const DagreLayoutGraph = () => {
    const {processedGraph, graphChangeFlag, graphChanged} = useTestProcessedGraph()
    const graphForLayout = processedGraph;
    const svgRef = useRef();

    const toggleExpanded = id => {
        let node = graphForLayout.nodeMap[id]
        if (node.type !== NodeType.GROUP && node.type !== NodeType.LAYER) {
            return
        }
        node = node as GroupNode
        node.expanded = !node.expanded
        graphChanged()
    }

    const draw = () => {
        const graph = new dagreD3.graphlib.Graph({ compound: true })
            .setGraph({})
            .setDefaultEdgeLabel(function () { return {}; });;
        const render = new dagreD3.render();
        const svg = d3.select(svgRef.current)

        svg.selectAll('*').remove()

        const svgGroup = svg.append('g').attr("transform", transform)
        let zoom = d3
            .zoom().on("zoom", function () {
                transform = d3.event.transform
                svgGroup.attr("transform", d3.event.transform);
            });
        svg.call(zoom).on("dblclick.zoom", null);

        const { nodeMap } = graphForLayout;

        const displayedNodes: Array<string> = graphForLayout.getDisplayedNodes();
        const displayedEdges: Array<RawEdge> = graphForLayout.getDisplayedEdges(displayedNodes);

        for (const nodeId of displayedNodes) {
            const node = nodeMap[nodeId];
            graph.setNode(node.id, {
                id: node.id,
                label: node.displayedName,
                shape: node.type === NodeType.OPERTATION ? "ellipse" : "rect",
                class: `nodeitem-${node.type}`,
                clusterLabelPos: 'top'
            });
            if (node.parent !== "___root___") {
                graph.setParent(nodeId, node.parent);
            }
        }

        for (const edge of displayedEdges) {
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
        console.log('redraw')
        draw()

    }, [graphForLayout, graphChangeFlag]);

    return (
        <div id="dagre-graph" style={{ height: '100%' }}>
            <svg id="dagre-svg" ref={svgRef} style={{ height: '100%' }}></svg>
        </div>
    );
}

export default DagreLayoutGraph;