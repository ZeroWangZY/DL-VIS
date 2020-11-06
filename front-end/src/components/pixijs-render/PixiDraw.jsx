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
  const maxLabelLength = 10;

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
    addLabels(app, styledGraph);

  }, [styledGraph]);

  const addElippseCurve = (x, y, width, height, dash) => {
    let ellipse = new PIXI.Graphics();
    ellipse.lineStyle(1, 0x808080, 1); // width color alpha
    ellipse.beginFill(0xFFFFFF, 1); // 填充白色，透明度为0
    ellipse.drawEllipse(x, y, width, height); // drawEllipse(x, y, width, height);
    ellipse.endFill(); // 填充白色
    return ellipse;
  }
  const addRoundRect = (x, y, width, height, cornerRadius) => {
    let roundBox = new PIXI.Graphics();
    roundBox.lineStyle(1, 0x808080, 1); // width color alpha
    roundBox.beginFill(0xffffffff, 0); // 填充白色
    //drawRoundedRect(x, y, width, height, cornerRadius)
    roundBox.drawRoundedRect(x, y, width, height, cornerRadius);
    roundBox.endFill();
    return roundBox;
  }

  const addLabelText = (text, x, y) => {
    let style = new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize: 14,
      fill: "0x333",
      align: "center",
      textAnchor: "middle",
      cursor: "pointer"
    });

    let message = new PIXI.Text(text, style);

    message.position.set(x, y);

    return message;
  }

  const addCircleCurve = (x, y, r) => {
    let circle = new PIXI.Graphics();
    circle.lineStyle(1, 0x808080, 1); // width color alpha
    circle.beginFill(0xFFFFFF, 1); // 填充白色，透明度为0
    circle.drawCircle(x, y, r);
    circle.endFill();
    return circle;
  }

  const addNodes = (app, styledGraph) => {
    styledGraph.nodeStyles.forEach((d) => {
      const node = d.data;
      if (node.type === NodeType.OPERATION) {

        if (node.isStacked) { // 堆叠节点 
          let ellipse2 = addElippseCurve(
            d.style._gNodeTransX,
            d.style._gNodeTransY + 6,
            d.style._ellipseX,
            d.style._ellipseY); // drawEllipse(x, y, width, height);
          app.stage.addChild(ellipse2);

          let ellipse1 = addElippseCurve(
            d.style._gNodeTransX,
            d.style._gNodeTransY + 3,
            d.style._ellipseX,
            d.style._ellipseY); // drawEllipse(x, y, width, height);
          app.stage.addChild(ellipse1);
        }

        let ellipse = addElippseCurve(
          d.style._gNodeTransX,
          d.style._gNodeTransY,
          d.style._ellipseX,
          d.style._ellipseY); // drawEllipse(x, y, width, height);
        app.stage.addChild(ellipse);

        if (node.parameters.length !== 0) {
          // TODO : dash 圆形
          let circle = addCircleCurve(
            d.style._gNodeTransX + d.style._ellipseY,
            d.style._gNodeTransY + d.style._ellipseY,
            d.style._ellipseY / 2);
          app.stage.addChild(circle);
        }

        if (node.constVals.length !== 0) {
          let circle = addCircleCurve(
            d.style._gNodeTransX - d.style._ellipseY,
            d.style._gNodeTransY + d.style._ellipseY,
            d.style._ellipseY / 2);
          app.stage.addChild(circle);
        }
      } else if (node.type === NodeType.GROUP || node.type === NodeType.DATA) {
        let roundBox = addRoundRect(
          d.style._gNodeTransX - d.style._rectWidth / 2,
          d.style._gNodeTransY - d.style._rectHeight / 2,
          d.style._rectWidth,
          d.style._rectHeight,
          5);

        app.stage.addChild(roundBox);

      } else if (node.type === NodeType.LAYER) {
        let roundBox = addRoundRect(
          d.style._gNodeTransX - d.style._rectWidth / 2,
          d.style._gNodeTransY - d.style._rectHeight / 2,
          d.style._rectWidth,
          d.style._rectHeight,
          5);

        app.stage.addChild(roundBox);
      }
    })


  }

  const addLabels = (app, styledGraph) => {
    styledGraph.nodeStyles.forEach((d) => {
      const node = d.data;
      if (node.type === NodeType.OPERATION) {
        let style = new PIXI.TextStyle({
          fontFamily: "Arial",
          dominantBaseline: "baseline",
          fill: "0x333",
          fontSize: 14,
          align: "center",
          textAnchor: "middle",
          cursor: "pointer"
        })
        let text = d.data.label.slice(0, maxLabelLength) + (d.data.label.length > maxLabelLength ? "..." : "");
        let message = new PIXI.Text(text, style);

        message.position.set(d.style._gNodeTransX, d.style._gNodeTransY - d.style._rectHeight / 4 - 3);
        app.stage.addChild(message);
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
