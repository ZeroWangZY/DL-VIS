import React, { useEffect, useRef } from "react";
import "./GraphScene.css";
import { RenderGraphInfo } from "../../common/tensorboard/render";
import { layoutScene } from "../../common/tensorboard/layout";
import * as scene from '../../common/tensorboard/scene'
import * as d3 from "d3";
import * as graph from '../../common/tensorboard/graph'
interface GraphSceneProps {
  renderHierarchy: RenderGraphInfo;
}

let _nodeGroupIndex = {}
let _annotationGroupIndex = {}
let zoomStartCoords = null
let zoomTransform = null
let zoom = null


const GraphScene: React.FC<GraphSceneProps> = (props: GraphSceneProps) => {
  const svgRef = useRef(null);
  const rootRef = useRef(null)
  let { renderHierarchy } = props

  const _build = () => {
    layoutScene(renderHierarchy.root)
    scene.buildGroup(d3.select(rootRef.current), renderHierarchy.root, {
      _edgeGroupIndex: {},
      renderHierarchy: renderHierarchy,
      addNodeGroup: function (n, selection) {
        _nodeGroupIndex[n] = selection;
      },
      getNodeGroup: function (n) {
        return _nodeGroupIndex[n];
      },
      removeNodeGroup: function (n) {
        delete _nodeGroupIndex[n];
      },
      isNodeHighlighted: function (n) {
        return false
        // return n === this.highlightedNode;
      },
      isNodeSelected: function (n) {
        return false
      },
      colorBy: 'STRUCTURE',
      addAnnotationGroup: function (a, d, selection) {
        let an = a.node.name;
        _annotationGroupIndex[an] = _annotationGroupIndex[an] || {};
        _annotationGroupIndex[an][d.node.name] = selection;
      },
      getAnnotationGroupsIndex: function (a) {
        return _annotationGroupIndex[a];
      },
      removeAnnotationGroup: function (a, d) {
        delete _annotationGroupIndex[a.node.name][d.node.name];
      },
      templateIndex: renderHierarchy.hierarchy.getTemplateIndex(),
      isNodeExpanded: function (node) {
        return node.expanded;
      },
      fire: (eventName: string, detail) => {
        if (eventName === 'node-toggle-expand') {
          // Compute the sub-hierarchy scene.
          let nodeName = detail.name;
          let renderNode = renderHierarchy.getRenderNodeByName(nodeName);
          // Op nodes are not expandable.
          if (renderNode.node.type === graph.NodeType.OP) {
            return;
          }
          renderHierarchy.buildSubhierarchy(nodeName);
          renderNode.expanded = !renderNode.expanded;

          setNodeExpanded(renderNode);
        }
      }
    });
  }

  const setNodeExpanded = function (renderNode) {
    _build();
  }

  useEffect(() => {
    zoom = d3.zoom()
      .on('end', function () {
        if (zoomStartCoords) {
          let dragDistance = Math.sqrt(
            Math.pow(zoomStartCoords.x - zoomTransform.x, 2) +
            Math.pow(zoomStartCoords.y - zoomTransform.y, 2));
        }
        zoomStartCoords = null
      })
      .on('zoom', function () {
        zoomTransform = d3.event.transform
        if (zoomStartCoords) {
          zoomStartCoords = zoomTransform
          // this.fire('disable-click');
        }
        // this._zoomed = true;
        d3.select(rootRef.current).attr('transform', d3.event.transform);
        // Notify the minimap.
        // this.minimap.zoom(d3.event.transform);
      });

    d3.select(svgRef.current).call(zoom)
      .on('dblclick.zoom', null);
    // d3.select(window).on('resize', function () {
    //   // Notify the minimap that the user's window was resized.
    //   // The minimap will figure out the new dimensions of the main svg
    //   // and will use the existing translate and scale params.
    //   this.minimap.zoom();
    // }.bind(this));
  }, [])
  useEffect(() => {
    if (renderHierarchy !== null) {
      _build()
    }
  }, [renderHierarchy]);
  return (
    <div style={{ height: "100%" }}>
      <svg id="svg" ref={svgRef}>
        <defs>
          {/* <!-- Arrow heads for reference edge paths of different predefined sizes per color. --> */}
          <path
            id="reference-arrowhead-path"
            d="M 0,0 L 10,5 L 0,10 C 3,7 3,3 0,0"
          />
          <marker
            className="reference-arrowhead"
            id="reference-arrowhead-small"
            viewBox="0 0 10 10"
            markerWidth="5"
            markerHeight="5"
            refX="2"
            refY="5"
            orient="auto-start-reverse"
            markerUnits="userSpaceOnUse"
          >
            <use xlinkHref="#reference-arrowhead-path" />
          </marker>
          <marker
            className="reference-arrowhead"
            id="reference-arrowhead-medium"
            viewBox="0 0 10 10"
            markerWidth="13"
            markerHeight="13"
            refX="2"
            refY="5"
            orient="auto-start-reverse"
            markerUnits="userSpaceOnUse"
          >
            <use xlinkHref="#reference-arrowhead-path" />
          </marker>
          <marker
            className="reference-arrowhead"
            id="reference-arrowhead-large"
            viewBox="0 0 10 10"
            markerWidth="16"
            markerHeight="16"
            refX="2"
            refY="5"
            orient="auto-start-reverse"
            markerUnits="userSpaceOnUse"
          >
            <use xlinkHref="#reference-arrowhead-path" />
          </marker>
          <marker
            className="reference-arrowhead"
            id="reference-arrowhead-xlarge"
            viewBox="0 0 10 10"
            markerWidth="20"
            markerHeight="20"
            refX="2"
            refY="5"
            orient="auto-start-reverse"
            markerUnits="userSpaceOnUse"
          >
            <use xlinkHref="#reference-arrowhead-path" />
          </marker>

          {/* <!-- Arrow heads for dataflow edge paths of different predefined sizes per color. --> */}
          <path
            id="dataflow-arrowhead-path"
            d="M 0,0 L 10,5 L 0,10 C 3,7 3,3 0,0"
          />
          <marker
            className="dataflow-arrowhead"
            id="dataflow-arrowhead-small"
            viewBox="0 0 10 10"
            markerWidth="5"
            markerHeight="5"
            refX="2"
            refY="5"
            orient="auto-start-reverse"
            markerUnits="userSpaceOnUse"
          >
            <use xlinkHref="#dataflow-arrowhead-path" />
          </marker>
          <marker
            className="dataflow-arrowhead"
            id="dataflow-arrowhead-medium"
            viewBox="0 0 10 10"
            markerWidth="13"
            markerHeight="13"
            refX="2"
            refY="5"
            orient="auto-start-reverse"
            markerUnits="userSpaceOnUse"
          >
            <use xlinkHref="#dataflow-arrowhead-path" />
          </marker>
          <marker
            className="dataflow-arrowhead"
            id="dataflow-arrowhead-large"
            viewBox="0 0 10 10"
            markerWidth="16"
            markerHeight="16"
            refX="2"
            refY="5"
            orient="auto-start-reverse"
            markerUnits="userSpaceOnUse"
          >
            <use xlinkHref="#dataflow-arrowhead-path" />
          </marker>
          <marker
            className="dataflow-arrowhead"
            id="dataflow-arrowhead-xlarge"
            viewBox="0 0 10 10"
            markerWidth="20"
            markerHeight="20"
            refX="2"
            refY="5"
            orient="auto-start-reverse"
            markerUnits="userSpaceOnUse"
          >
            <use xlinkHref="#dataflow-arrowhead-path" />
          </marker>

          {/* <!-- Arrow head for annotation edge paths. --> */}
          <marker
            id="annotation-arrowhead"
            markerWidth="5"
            markerHeight="5"
            refX="5"
            refY="2.5"
            orient="auto"
          >
            <path d="M 0,0 L 5,2.5 L 0,5 L 0,0" />
          </marker>
          <marker
            id="annotation-arrowhead-faded"
            markerWidth="5"
            markerHeight="5"
            refX="5"
            refY="2.5"
            orient="auto"
          >
            <path d="M 0,0 L 5,2.5 L 0,5 L 0,0" />
          </marker>
          <marker
            id="ref-annotation-arrowhead"
            markerWidth="5"
            markerHeight="5"
            refX="0"
            refY="2.5"
            orient="auto"
          >
            <path d="M 5,0 L 0,2.5 L 5,5 L 5,0" />
          </marker>
          <marker
            id="ref-annotation-arrowhead-faded"
            markerWidth="5"
            markerHeight="5"
            refX="0"
            refY="2.5"
            orient="auto"
          >
            <path d="M 5,0 L 0,2.5 L 5,5 L 5,0" />
          </marker>
          {/* <!-- Template for an Op node ellipse. --> */}
          <ellipse
            id="op-node-stamp"
            rx="7.5"
            ry="3"
            stroke="inherit"
            fill="inherit"
          />
          {/* <!-- Template for an Op node annotation ellipse (smaller). --> */}
          <ellipse
            id="op-node-annotation-stamp"
            rx="5"
            ry="2"
            stroke="inherit"
            fill="inherit"
          />
          {/* <!-- Vertically stacked series of Op nodes when unexpanded. --> */}
          <g id="op-series-vertical-stamp">
            <use xlinkHref="#op-node-stamp" x="8" y="9" />
            <use xlinkHref="#op-node-stamp" x="8" y="6" />
            <use xlinkHref="#op-node-stamp" x="8" y="3" />
          </g>
          {/* <!-- Horizontally stacked series of Op nodes when unexpanded. --> */}
          <g id="op-series-horizontal-stamp">
            <use xlinkHref="#op-node-stamp" x="16" y="4" />
            <use xlinkHref="#op-node-stamp" x="12" y="4" />
            <use xlinkHref="#op-node-stamp" x="8" y="4" />
          </g>
          {/* <!-- Horizontally stacked series of Op nodes for annotation. --> */}
          <g id="op-series-annotation-stamp">
            <use xlinkHref="#op-node-annotation-stamp" x="9" y="2" />
            <use xlinkHref="#op-node-annotation-stamp" x="7" y="2" />
            <use xlinkHref="#op-node-annotation-stamp" x="5" y="2" />
          </g>
          <svg
            id="summary-icon"
            fill="#848484"
            height="12"
            viewBox="0 0 24 24"
            width="12"
          >
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
          </svg>
          {/* <!--
                Where the linearGradient for each node is stored. Used when coloring
                by proportions of devices.
                --> */}
          <g id="linearGradients"></g>

          {/* <!-- Hatch patterns for faded out nodes. --> */}
          <pattern
            id="rectHatch"
            patternTransform="rotate(45 0 0)"
            width="5"
            height="5"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="0" x2="0" y2="5" style={{ strokeWidth: 1 }} />
          </pattern>
          <pattern
            id="ellipseHatch"
            patternTransform="rotate(45 0 0)"
            width="2"
            height="2"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="0" x2="0" y2="2" style={{ strokeWidth: 1 }} />
          </pattern>

          {/* <!-- A shadow for health pills. --> */}
          <filter
            id="health-pill-shadow"
            x="-40%"
            y="-40%"
            width="180%"
            height="180%"
          >
            <feGaussianBlur in="SourceAlpha" stdDeviation="0.8" />
            <feOffset dx="0" dy="0" result="offsetblur" />
            <feFlood floodColor="#000000" />
            <feComposite in2="offsetblur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* <!-- Make a large rectangle that fills the svg space so that
            zoom events get captured on safari --> */}
        <rect fill="white" width="10000" height="10000"></rect>
        <g id="root" ref={rootRef}></g>
      </svg>
      {/* <tf-graph-minimap id="minimap"></tf-graph-minimap> */}
    </div>
  );
};

export default GraphScene;
