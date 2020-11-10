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

const PixiDraw = () => {
  const styledGraph = useStyledGraph();
  const divContainer = useRef();
  const maxLabelLength = 10;
  const [zoomScale, setZoomScale] = useState(1);

  const toggleExpanded = (id) => {
    modifyProcessedGraph(ProcessedGraphModificationType.TOGGLE_EXPANDED, {
      nodeId: id,
    });
  };

  useEffect(() => {
    if (!styledGraph || styledGraph.nodeStyles.length === 0) return;
    divContainer.current.innerHTML = "";

    const app = new PIXI.Application({
      width: 256,         // default: 800
      height: 256,        // default: 600
      antialias: true,    // default: false
      transparent: true, // default: false
      resolution: 1       // default: 1
    })
    const graphContainer = new PIXI.Container(); // 将所有的图形 线段 label 文字全部放入整个container中 方便拖拽
    app.stage.addChild(graphContainer);
    divContainer.current.appendChild(app.view);

    addNodes(graphContainer, styledGraph);
    addLabels(graphContainer, styledGraph);
    addLines(graphContainer, styledGraph);

    window.addEventListener('resize', resize);
    // Resize function window
    function resize() {
      const parent = divContainer.current;
      app.renderer.resize(parent.clientWidth, parent.clientHeight);
    }
    resize();

    // 拖动
    let mousedown = false;
    let offsetX, offsetY;
    divContainer.current.addEventListener("mousedown", function (e) {
      console.log("mousemove start");
      mousedown = true;
      offsetX = e.offsetX - graphContainer.x;
      offsetY = e.offsetY - graphContainer.y;
    })
    divContainer.current.addEventListener("mousemove", function (e) {
      if (mousedown) {
        graphContainer.x = (e.offsetX - offsetX); // 偏移
        graphContainer.y = (e.offsetY - offsetY);
      }
    })
    divContainer.current.addEventListener("mouseup", function () {
      mousedown = false;
      console.log("mousemove end");
    })

    // 滚轮事件
    divContainer.current.addEventListener("mousewheel", function (event) {
      // event.wheelDelta > 0 放大， event.wheelDelta < 0 缩小
      if (event.wheelDelta > 0) {
        app.stage.scale.x *= 1.1;
        app.stage.scale.y *= 1.1;
        setZoomScale(zoomScale * 1.1);
      } else {
        app.stage.scale.x /= 1.1;
        app.stage.scale.y /= 1.1;
        setZoomScale(zoomScale / 1.1);
      }
    })

  }, [styledGraph]);

  const drawElippseCurve = (x, y, width, height, dash) => {
    let ellipse = new PIXI.Graphics();
    ellipse.lineStyle(1, 0x808080, 1); // width color alpha
    ellipse.beginFill(0xFFFFFF, 1); // 填充白色，透明度为0
    ellipse.drawEllipse(x, y, width, height); // drawEllipse(x, y, width, height);
    ellipse.endFill(); // 填充白色

    ellipse.interactive = true;
    ellipse.buttonMode = true;
    ellipse.hitArea = new PIXI.Ellipse(x, y, width, height);

    return ellipse;
  }

  const drawRoundRect = (id, x, y, width, height, cornerRadius) => {
    let roundBox = new PIXI.Graphics();
    roundBox.lineStyle(1, 0x808080, 1); // width color alpha
    roundBox.beginFill(0xffffff, 0); // 填充白色
    //drawRoundedRect(x, y, width, height, cornerRadius)
    roundBox.drawRoundedRect(x, y, width, height, cornerRadius);
    roundBox.endFill();

    roundBox.interactive = true;
    roundBox.buttonMode = true;

    roundBox.hitArea = new PIXI.Rectangle(x, y, width, height, cornerRadius);
    // 双击展开
    let clickTimes = 0;
    let timer = null;
    roundBox.click = function (e) {
      clearTimeout(timer);
      timer = setTimeout(() => { // 单击事件
        console.log("single click");
        clickTimes = 0;
      }, 600);
      clickTimes++;

      if (clickTimes == 2) { // 双击
        clearTimeout(timer);
        clickTimes = 0;
        console.log("double click");
        toggleExpanded(id);
      }
    }


    return roundBox;
  }

  const drawCircleCurve = (x, y, r) => {
    let circle = new PIXI.Graphics();
    circle.lineStyle(1, 0x808080, 1); // width color alpha
    circle.beginFill(0xFFFFFF, 1); // 填充白色，透明度为0
    circle.drawCircle(x, y, r);
    circle.endFill();

    circle.interactive = true;
    circle.buttonMode = true;
    circle.hitArea = new PIXI.Circle(x, y, r);

    return circle;
  }

  const drawArrow = (begin, end, color) => {
    let points = [];
    if (begin.y === end.y) { // 水平方向
      if (begin.x < end.x) { // 向右
        points = [ // 顺时针方向，第一个点为箭头的 尖
          end.x, end.y,
          end.x - 5, end.y + 5,
          end.x - 2.5, end.y,
          end.x - 5, end.y - 5,
        ];
      }
      else { // 向左
        points = [
          end.x, end.y,
          end.x + 5, end.y - 5,
          end.x + 2.5, end.y,
          end.x + 5, end.y + 5,
        ];
      }
    } else { // 竖直方向
      if (begin.y > end.y) { // 向上
        points = [
          end.x, end.y,
          end.x + 5, end.y + 5,
          end.x, end.y + 2.5,
          end.x - 5, end.y + 5,
        ];
      }
      else { // 向下
        points = [
          end.x, end.y,
          end.x - 5, end.y - 5,
          end.x, end.y - 2.5,
          end.x + 5, end.y - 5
        ];
      }
    }

    let arrow = new PIXI.Graphics();
    arrow.beginFill(color);
    arrow.drawPolygon(points);
    arrow.endFill();
    return arrow;
  }

  const addNodes = (container, styledGraph) => {
    styledGraph.nodeStyles.forEach((d) => {
      const node = d.data;
      if (node.type === NodeType.OPERATION) {

        if (node.isStacked) { // 堆叠节点 
          let ellipse2 = drawElippseCurve(
            d.style._gNodeTransX,
            d.style._gNodeTransY + 6,
            d.style._ellipseX,
            d.style._ellipseY); // drawEllipse(x, y, width, height);
          container.addChild(ellipse2);

          let ellipse1 = drawElippseCurve(
            d.style._gNodeTransX,
            d.style._gNodeTransY + 3,
            d.style._ellipseX,
            d.style._ellipseY); // drawEllipse(x, y, width, height);
          container.addChild(ellipse1);
        }

        let ellipse = drawElippseCurve(
          d.style._gNodeTransX,
          d.style._gNodeTransY,
          d.style._ellipseX,
          d.style._ellipseY); // drawEllipse(x, y, width, height);
        container.addChild(ellipse);

        if (node.parameters.length !== 0) {
          // TODO : dash 圆形
          let circle = drawCircleCurve(
            d.style._gNodeTransX + d.style._ellipseY,
            d.style._gNodeTransY + d.style._ellipseY,
            d.style._ellipseY / 2);
          container.addChild(circle);
        }

        if (node.constVals.length !== 0) {
          let circle = drawCircleCurve(
            d.style._gNodeTransX - d.style._ellipseY,
            d.style._gNodeTransY + d.style._ellipseY,
            d.style._ellipseY / 2);
          container.addChild(circle);
        }
      } else if (node.type === NodeType.GROUP || node.type === NodeType.DATA) {
        let roundBox = drawRoundRect(
          node.id,
          d.style._gNodeTransX - d.style._rectWidth / 2,
          d.style._gNodeTransY - d.style._rectHeight / 2,
          d.style._rectWidth,
          d.style._rectHeight,
          5);

        container.addChild(roundBox);

      } else if (node.type === NodeType.LAYER) {
        let roundBox = drawRoundRect(
          node.id,
          d.style._gNodeTransX - d.style._rectWidth / 2,
          d.style._gNodeTransY - d.style._rectHeight / 2,
          d.style._rectWidth,
          d.style._rectHeight,
          5);

        container.addChild(roundBox);
      }
    })


  }

  const addLabels = (container, styledGraph) => {
    styledGraph.nodeStyles.forEach((d) => {
      const node = d.data;
      if (node.type === NodeType.OPERATION) {
        const fontSize = 8;
        let style = new PIXI.TextStyle({
          fontFamily: "Arial",
          fill: "0x333",
          fontSize: fontSize,
        })
        let text = d.data.label.slice(0, maxLabelLength) + (d.data.label.length > maxLabelLength ? "..." : "");
        let message = new PIXI.Text(text, style);

        message.position.set(d.style._gNodeTransX, d.style._gNodeTransY - d.style._rectHeight / 2 - fontSize);
        container.addChild(message);
      } else {
        const fontSize = 16;
        let style = new PIXI.TextStyle({
          fontFamily: "Arial",
          fill: "0x333",
          fontSize: fontSize,
        })
        let text = d.data.label.slice(0, maxLabelLength) + (d.data.label.length > maxLabelLength ? "..." : "");
        let message = new PIXI.Text(text, style);
        message.position.set(d.style._gNodeTransX, d.style._gNodeTransY - d.style._rectHeight / 2);
        container.addChild(message);
      }

    })
  }

  const addLines = (container, styledGraph) => {
    styledGraph.linkStyles.forEach((d) => {
      const linkData = d.data.linkData;
      let line = new PIXI.Graphics();

      line.lineStyle(3, 0xff931e, 1);
      for (let i = 1; i < linkData.length; i++) {
        const begin = linkData[i - 1], end = linkData[i];
        line.moveTo(begin.x, begin.y);
        line.lineTo(end.x, end.y);
        container.addChild(line);

        if (i === linkData.length - 1) {
          // 增加一个箭头
          const arrow = drawArrow(begin, end, "0x333333"); //0x999999
          container.addChild(arrow);
        }
      }
    })
  }

  return (
    <div className="pixi-container"
      ref={divContainer}
      style={{ width: "100%", height: "100%", textAlign: "left", padding: 0, margin: 0 }}
    >

    </div>
  );
};

export default PixiDraw;
