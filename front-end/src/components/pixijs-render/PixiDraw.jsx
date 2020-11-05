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
      width: 300,
      height: 300,
      antialias: true,
      transparent: false,
      resolution: 1,
      backgroundColor: 0x1d9ce0
    })
    container.current.appendChild(app.view);

    const circle = new PIXI.Graphics();
    circle.beginFill(0xfb6a8f);
    circle.drawCircle(0, 0, 32);
    circle.endFill();
    circle.x = 130;
    circle.y = 130;

    circle.scale.set(1.5, 1);
    circle.interactive = true;
    circle.on("click", () => {
      circle.alpha = 0.5;
    })

    app.stage.addChild(circle);

    app.ticker.add(() => {
      // 每秒调用该方法60次(60帧动画)
      circle.rotation += 0.01;
    })
    // addNodes(styledGraph);

  }, [styledGraph]);

  const addNodes = (styledGraph) => {
    const nodeStyles = styledGraph.nodeStyles;
  }

  return (
    <div className="pixi-container"
      ref={container}
      style={{ width: "100%", height: "100%", textAlign: "left" }}
    >

    </div>
  );
};

export default PixiDraw;
