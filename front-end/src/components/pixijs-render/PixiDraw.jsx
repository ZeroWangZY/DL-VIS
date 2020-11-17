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
import { GlobalStatesModificationType } from "../../store/global-states.type";
import { StyledGraphImp, StyledGraph } from "../../common/graph-processing/stage5/styled-graph.type"
import { drawCircleCurve, drawRoundRect, drawElippseCurve, drawArrow } from "./draw"
import * as PIXI from "pixi.js";

const toggleExpanded = (id) => {
  modifyProcessedGraph(ProcessedGraphModificationType.TOGGLE_EXPANDED, {
    nodeId: id,
  });
};

const PixiDraw = () => {
  const styledGraph = useStyledGraph();
  const divContainer = useRef();
  const maxLabelLength = 10;
  const [graphContainerInitialPos, setGraphContainerInitialPos] = useState(null);
  const [textResolution, setTextResolution] = useState(null);
  const { selectedNodeId } = useGlobalStates();
  const selectedGraph = [];

  const handleClick = (id) => {
    if (selectedNodeId !== id)
      modifyGlobalStates(
        GlobalStatesModificationType.SET_SELECTEDNODE,
        id
      );
  };

  useEffect(() => {
    if (!styledGraph || styledGraph.nodeStyles.length === 0) return;
    if (!divContainer.current || !divContainer.current.clientWidth) return;

    divContainer.current.innerHTML = "";

    const app = new PIXI.Application({
      width: 256,         // default: 800
      height: 256,        // default: 600
      antialias: true,    // default: false
      transparent: true, // default: false
      resolution: 1       // default: 1
    })
    const graphContainer = new PIXI.Container(); // 将所有的图形 线段 label 文字全部放入整个container中 方便拖拽
    window.graphContainer = graphContainer

    app.stage.addChild(graphContainer);
    divContainer.current.appendChild(app.view);

    addNodes(graphContainer, styledGraph);
    addLabels(graphContainer, styledGraph);
    addLines(graphContainer, styledGraph);
    addPorts(graphContainer, styledGraph);

    if (graphContainerInitialPos) {
      graphContainer.x = graphContainerInitialPos.x;
      graphContainer.y = graphContainerInitialPos.y;
    }

    window.addEventListener('resize', resize);
    // Resize function window
    function resize() {
      const parent = divContainer.current;
      app.renderer.resize(parent.clientWidth, parent.clientHeight);
    }
    resize();

    addDragGraphEvent(divContainer);

  }, [styledGraph]);


  const addDragGraphEvent = (divContainer) => {
    // 拖动
    let mousedown = false;
    let offsetX, offsetY;
    divContainer.current.addEventListener("mousedown", function (e) {
      mousedown = true;
      offsetX = e.offsetX - graphContainer.x;
      offsetY = e.offsetY - graphContainer.y;
    })
    divContainer.current.addEventListener("mousemove", function (e) {
      if (mousedown) {
        graphContainer.x = (e.offsetX - offsetX); // 偏移
        graphContainer.y = (e.offsetY - offsetY);
        if (e.offsetX <= 2 ||
          e.offsetY <= 2 ||
          divContainer.current.clientWidth - e.offsetX <= 2 ||
          divContainer.current.clientHeight - e.offsetY <= 2) { // 设置一定的界限，
          mousedown = false;
          setGraphContainerInitialPos({ x: graphContainer.x, y: graphContainer.y });
        }
      }
    })
    divContainer.current.addEventListener("mouseup", function (e) {
      mousedown = false;
      graphContainer.x = (e.offsetX - offsetX); // 偏移
      graphContainer.y = (e.offsetY - offsetY);
      setGraphContainerInitialPos({ x: graphContainer.x, y: graphContainer.y });
    })

    // 滚轮事件
    divContainer.current.addEventListener("mousewheel", function (event) {
      // event.wheelDelta > 0 放大， event.wheelDelta < 0 缩小
      if (event.wheelDelta > 0) {
        graphContainer.width *= 1.1;
        graphContainer.height *= 1.1;

        // 以鼠标位置为中心放大
        graphContainer.x = 1.1 * (graphContainer.x - event.offsetX) + event.offsetX;
        graphContainer.y = 1.1 * (graphContainer.y - event.offsetY) + event.offsetY;

        for (let obj of graphContainer.children) { // 文字分辨率
          if (obj instanceof PIXI.Text) {
            obj.resolution *= 1.1;
            setTextResolution(obj.resolution);
          }
        }
      } else {
        graphContainer.width /= 1.1;
        graphContainer.height /= 1.1;

        // 以鼠标位置为中心放大
        graphContainer.x = (graphContainer.x - event.offsetX) / 1.1 + event.offsetX;
        graphContainer.y = (graphContainer.y - event.offsetY) / 1.1 + event.offsetY;

        for (let obj of graphContainer.children) {
          if (obj instanceof PIXI.Text) {
            obj.resolution /= 1.1;
            setTextResolution(obj.resolution);
          }
        }
      }
    })
  }

  function addRoundRectClickEvent(roundBox, id) {
    // 双击展开
    let clickTimes = 0;
    let timer = null;
    roundBox.click = function (e) {
      //pixi中断事件冒泡
      e.stopPropagation()

      console.log("click Rect");
      clearTimeout(timer);
      timer = setTimeout(() => { // 单击事件
        clickTimes = 0;
        // 单击事件 
        handleClick(id);

        // 先将之前选择的图形的tint还原
        if (selectedGraph.length === 1) {
          selectedGraph[0].tint = 0xFFFFFF;
          selectedGraph.pop();
        }
        roundBox.blendMode = PIXI.BLEND_MODES.COLOR;
        roundBox.tint = 0xc7000b;
        roundBox.geometry.invalidate();

        selectedGraph.push(roundBox); // 被选中
      }, 200);
      clickTimes++;

      if (clickTimes == 2) { // 双击
        clearTimeout(timer);
        clickTimes = 0;
        toggleExpanded(id);
      }
    }
  }

  const addNodes = (container, styledGraph) => {
    styledGraph.nodeStyles.forEach((d) => {
      const node = d.data;
      if (node.type === NodeType.OPERATION) {

        if (node.isStacked) { // 堆叠节点 
          let ellipse2 = drawElippseCurve(
            node.id,
            d.style._gNodeTransX,
            d.style._gNodeTransY + 6,
            d.style._ellipseX,
            d.style._ellipseY,
          ); // drawEllipse(x, y, width, height);
          container.addChild(ellipse2);

          let ellipse1 = drawElippseCurve(
            node.id,
            d.style._gNodeTransX,
            d.style._gNodeTransY + 3,
            d.style._ellipseX,
            d.style._ellipseY,
          ); // drawEllipse(x, y, width, height);
          container.addChild(ellipse1);
        }

        let ellipse = drawElippseCurve(
          node.id,
          d.style._gNodeTransX,
          d.style._gNodeTransY,
          d.style._ellipseX,
          d.style._ellipseY,
        ); // drawEllipse(x, y, width, height);

        ellipse.click = function (e) {
          //pixi中断事件冒泡
          e.stopPropagation()
          handleClick(node.id);
          // 先将之前选择的图形的tint还原
          if (selectedGraph.length === 1) {
            selectedGraph[0].tint = 0xFFFFFF;
            selectedGraph.pop();
          }

          ellipse.blendMode = PIXI.BLEND_MODES.COLOR_BURN;
          ellipse.tint = 0xc7000b;// 2, 0xc7000b, 1
          ellipse.geometry.invalidate();

          selectedGraph.push(ellipse); // 被选中
        }

        container.addChild(ellipse);

        if (node.parameters.length !== 0) {
          // TODO : dash 圆形
          let circle = drawCircleCurve(
            d.style._gNodeTransX + d.style._ellipseY,
            d.style._gNodeTransY + d.style._ellipseY,
            d.style._ellipseY / 2,
            0xFFFFFF,
            0);
          container.addChild(circle);
        }

        if (node.constVals.length !== 0) {
          let circle = drawCircleCurve(
            d.style._gNodeTransX - d.style._ellipseY,
            d.style._gNodeTransY + d.style._ellipseY,
            d.style._ellipseY / 2,
            0xFFFFFF,
            0);
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

        addRoundRectClickEvent(roundBox, node.id);


      } else if (node.type === NodeType.LAYER) {
        let roundBox = drawRoundRect(
          node.id,
          d.style._gNodeTransX - d.style._rectWidth / 2,
          d.style._gNodeTransY - d.style._rectHeight / 2,
          d.style._rectWidth,
          d.style._rectHeight,
          5);
        container.addChild(roundBox);

        addRoundRectClickEvent(roundBox, node.id);
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
        message.resolution = textResolution === null ? 1 : textResolution;
        message.anchor.x = 0;

        let textCanvasWidth = message.width;
        message.position.set(d.style._gNodeTransX - textCanvasWidth / 2, d.style._gNodeTransY - d.style._rectHeight / 2 - fontSize);
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
        message.resolution = textResolution === null ? 1 : textResolution;

        let textCanvasWidth = message.width;
        message.position.set(d.style._gNodeTransX - textCanvasWidth / 2, d.style._gNodeTransY - d.style._rectHeight / 2);
        container.addChild(message);
      }

    })
  }

  const addLines = (container, styledGraph) => {
    styledGraph.linkStyles.forEach((d) => {
      const linkData = d.data.linkData;
      let line = new PIXI.Graphics();

      if (d.data.isModuleEdge)
        line.lineStyle(3, 0xff931e, 1)
      else
        line.lineStyle(3, 0x999999, 1); // 0x999999

      for (let i = 1; i < linkData.length; i++) {
        let begin = linkData[i - 1], end = linkData[i];
        if (i === linkData.length - 1) { // 最后一根直线
          let lineData = d.data.lineData;
          let temp = lineData.split(" ").slice(-2); // 有可能是L开头。
          if (temp[0][0] === "L") temp[0] = temp[0].slice(1);
          end = { x: parseFloat(temp[0]), y: parseFloat(temp[1]) };
        }
        line.moveTo(begin.x, begin.y);
        line.lineTo(end.x, end.y);

        container.addChild(line);

        if (i === linkData.length - 1) {
          // 增加一个箭头
          end = linkData[i];
          const arrow = drawArrow(begin, end, "0x999999"); //0x999999
          container.addChild(arrow);
        }
      }
    })
  }

  const addPorts = (container, styledGraph) => {
    styledGraph.portStyles.forEach((d) => {
      const ofs_x = -7.5;
      const ofs_y = -7.4;
      const xt = 9, yt = -1 / 2 * d.style.nodeRectHeight + 10;
      let ofs = [xt, ofs_y]
      if (!d.data.isRealLink) {
        ofs = [0, ofs_y + yt];
      }

      let circle = drawCircleCurve(
        d.style.gNodeTransX.val + (d.data.direction === "in" ? ofs_x + ofs[0] : ofs_x - ofs[0]) + 7.5,
        d.style.gNodeTransY.val + ofs[1] + 7.5,
        7,
        0xFFFFFF,
        0);

      let smallCircle = drawCircleCurve(
        d.style.gNodeTransX.val + (d.data.direction === "in" ? ofs_x + ofs[0] : ofs_x - ofs[0]) + 7.5,
        d.style.gNodeTransY.val + ofs[1] + 7.5,
        1.4,
        0x333333,
        1);

      container.addChild(circle);
      container.addChild(smallCircle);

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
