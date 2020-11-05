import React, { useState, useEffect, useRef } from "react";
import { useGlobalStates, modifyGlobalStates } from "../../store/global-states";
import { useVisGraph } from "../../store/visGraph";
import { useLayoutGraph, setLayoutGraph } from "../../store/layoutGraph";
import { useStyledGraph } from "../../store/styledGraph";
import {
  NodeType,
  LayerType,
} from "../../common/graph-processing/stage2/processed-graph";
import {
  modifyProcessedGraph,
  ProcessedGraphModificationType,
} from "../../store/processedGraph";
import { StyledGraphImp, StyledGraph } from "../../common/graph-processing/stage5/styled-graph.type"
import * as PIXI from "pixi.js";
import { Container } from "@material-ui/core";

const PixiDraw = () => {
  const styledGraph = useStyledGraph();
  const container = useRef();

  useEffect(() => {
    if (!styledGraph || styledGraph.nodeStyles.length === 0) return;

    addNodes(styledGraph);

  }, [styledGraph]);

  const addNodes = (styledGraph) => {
    const nodeStyles = styledGraph.nodeStyles;
  }

  return (
    <div className="pixi-container"
      ref={container}
      style={{ width: "100%", height: "100%" }}
    >

    </div>
  );
};

export default PixiDraw;
