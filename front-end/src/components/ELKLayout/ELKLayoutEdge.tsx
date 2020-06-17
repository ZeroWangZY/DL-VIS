import React, { useEffect, useRef } from "react";
import { TransitionMotion } from "react-motion";
import { useStyledGraph } from "../../store/styledGraph";
import ELK from "elkjs/lib/elk.bundled.js";
import * as d3 from "d3";

const ELKLayoutEdge: React.FC = () => {
  const styledGraph = useStyledGraph();
  return (
    <g>
      <TransitionMotion
        styles={styledGraph === null ? [] : styledGraph.linkStyles}
      >
        {(interpolatedStyles) => (
          <g className="edgePaths">
            {interpolatedStyles.map((d) => (
              <g
              // className={"edgePath " + d.data.id4Style.split("->").join(" ")}
                className={"edgePath"}
                key={d.key}
              >
                {d.data.drawData.map((link, i) => (
                  <path
                    d={link.d}
                    key={`${d.key}-${i}`}
                    markerEnd={link.arrowhead === false ? "" : "url(#arrowhead)"}
                    strokeWidth={link.strokeWidth}
                  ></path>
                ))}
                {d.data.junctionPoints.map((point, i) => (
                  <circle
                    key={d.key + "_junkPoint_" + i}
                    cx={point.x}
                    cy={point.y}
                    r={2}
                  />
                ))}
              </g>
            ))}
          </g>
        )}
      </TransitionMotion>
      <TransitionMotion
        styles={styledGraph === null ? [] : styledGraph.linkStyles}
      >
        {(interpolatedStyles) => (
          <g className="edgePaths">
            {interpolatedStyles.map((d) => (
              <g
              className={"edgePath " + d.data.id4Style.split("->").join(" ")}
               key={d.key}
              >
                <path
                  className="hover"
                  d={d.data.lineData}
                  style={{stroke: "none"}} 
                ></path>
              </g>
            ))}
          </g>
        )}
      </TransitionMotion>
    </g>
  );
};

export default ELKLayoutEdge;
