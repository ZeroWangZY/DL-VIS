import React, { useEffect, useRef } from "react";
import { TransitionMotion } from "react-motion";
import { useStyledGraph } from "../../store/styledGraph";
import ELK from "elkjs/lib/elk.bundled.js";
import * as d3 from "d3";

const ELKLayoutEdge: React.FC = () => {
    const styledGraph = useStyledGraph();
    const getX = (d): number => {
        return d.x;
      };
      const getY = (d): number => {
        return d.y;
      };
      // 根据points计算path的data
      const line = d3
        .line()
        .x((d) => getX(d))
        .y((d) => getY(d));
    return (
    <TransitionMotion
        styles={styledGraph === null ? [] : styledGraph.linkStyles}
      >
        {(interpolatedStyles) => (
          <g className="edgePaths">
            {interpolatedStyles.map((d) => (
              <g
                className={
                  "edgePath " +
                  d.key
                    .split("-")
                    .map((name) => "id_" + name.split("/").join("-"))
                    .join(" ")
                }
                key={d.key}
              >
                <path
                  d={line([
                    { x: d.style.startPointX, y: d.style.startPointY },
                    ...d.data.lineData,
                    { x: d.style.endPointX, y: d.style.endPointY },
                  ])}
                  markerEnd="url(#arrowhead)"
                ></path>
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
    )
}

export default ELKLayoutEdge;