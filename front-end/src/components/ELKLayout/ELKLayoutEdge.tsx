import React from "react";
import { TransitionMotion } from "react-motion";
import { useStyledGraph } from "../../store/styledGraph";
import styles from "../../CSSVariables/CSSVariables.less";

const ELKLayoutEdge: React.FC<{
  highlightPath: Set<string>;
  isPathFindingMode: boolean;
}> = (props) => {
  const { highlightPath, isPathFindingMode } = props;
  const styledGraph = useStyledGraph();

  return (
    <g className="edges" pointerEvents="none">
      <TransitionMotion
        styles={styledGraph === null ? [] : styledGraph.linkStyles}
      >
        {(interpolatedStyles) => (
          <g className="edgePaths">
            {interpolatedStyles.map((d) => (
              <g
                className={`edgePath ${
                  d.data.isModuleEdge ? "moduleEdge" : ""
                }`}
                key={d.key}
              >
                {d.data.drawData.map((link, i) => (
                  <path
                    d={link.d}
                    key={`${d.key}-${i}`}
                    markerEnd={
                      link.arrowhead === false ? "" : "url(#arrowhead)"
                    }
                    strokeWidth={link.strokeWidth}
                  ></path>
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
          <g className="edgePaths hoverEdges">
            {interpolatedStyles.map((d) => (
              <g
                className={
                  `edgePath ${d.data.originalSource} ${d.data.originalTarget} ${d.data.originalSource}to${d.data.originalTarget}` +
                  `${
                    highlightPath.has(
                      d.data.originalSource + " " + d.data.originalTarget
                    ) && isPathFindingMode
                      ? " highlightPath"
                      : ""
                  }`
                }
                key={d.key}
              >
                <path
                  className="hover"
                  d={d.data.lineData}
                  style={{ stroke: "none" }}
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
