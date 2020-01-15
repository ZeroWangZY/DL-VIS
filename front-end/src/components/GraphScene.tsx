import React from "react";
import "./GraphScene.css";

const GraphScene: React.FC = () => {
  return (
    <div>
      <div className="titleContainer">
        <div id="title" className="title">
          Main Graph
        </div>
        <div id="auxTitle" className="auxTitle">
          Auxiliary Nodes
        </div>
      </div>
      <svg id="svg">
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
        <g id="root"></g>
      </svg>
      {/* <tf-graph-minimap id="minimap"></tf-graph-minimap> */}
    </div>
  );
};

export default GraphScene;
