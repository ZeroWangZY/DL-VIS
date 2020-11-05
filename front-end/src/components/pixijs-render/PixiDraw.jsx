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

    const app = new PIXI.Application({
      width: 256,         // default: 800
      height: 256,        // default: 600
      antialias: true,    // default: false
      transparent: true, // default: false
      resolution: 1       // default: 1
    })
    container.current.appendChild(app.view);

    app.renderer.view.style.position = "absolute";
    app.renderer.view.style.display = "block";
    app.renderer.autoResize = true;
    app.renderer.resize(window.innerWidth, window.innerHeight);

    addNodes(app, styledGraph);

  }, [styledGraph]);

  const addNodes = (app, styledGraph) => {
    const nodeStyles = styledGraph.nodeStyles;

    styledGraph.nodeStyles.forEach((d) => {
      const node = d.data;
      if (node.type === NodeType.OPERATION) {
        // 

        if (node.parameters.length !== 0) {
          // let circle = 
        }

        if (node.constVals.length !== 0) {

        }
      } else if (node.type === NodeType.GROUP || node.type === NodeType.DATA) {
        let roundBox = new PIXI.Graphics();
        roundBox.lineStyle(1, 0x808080, 1); // width color alpha
        roundBox.drawRoundedRect(
          d.style._gNodeTransX - d.style._rectWidth / 2,
          d.style._gNodeTransY - d.style._rectHeight / 2,
          d.style._rectWidth,
          d.style._rectHeight,
          5);
        roundBox.endFill();

        app.stage.addChild(roundBox);

      } else if (node.type === NodeType.LAYER) {

      }
    })


  }

  return (
    <div className="pixi-container"
      ref={container}
      style={{ width: "100%", height: "100%", textAlign: "left", padding: 0, margin: 0 }}
    >

    </div>
  );
};

export default PixiDraw;
