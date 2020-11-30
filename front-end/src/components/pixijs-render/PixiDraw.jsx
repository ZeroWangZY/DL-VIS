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
import { TweenMax } from "gsap/all"
import { zip, zoom } from "d3";
import { Icon } from "@material-ui/core";

const toggleExpanded = (id) => {
  modifyProcessedGraph(ProcessedGraphModificationType.TOGGLE_EXPANDED, {
    nodeId: id,
  });
};

let zoomFactor = 1;
let zoomInTimes = 0;
let rectNodeInfo = new Map(); // id -> {x: ,y : ,width: ,height:}
let graphContainer = new PIXI.Container();// 放在全局，如果放在内部，则会因为每次setState重新调用导致每次更新
const selectedGraph = [];
let app = null;

function stopBubble(e) {
  //如果提供了事件对象，则这是一个非IE浏览器 
  if (e && e.stopPropagation)  //因此它支持W3C的stopPropagation()方法 
    e.stopPropagation();
  else  //否则，我们需要使用IE的方式来取消事件冒泡 
    window.event.cancelBubble = true;
}

function stopDefault(e) {
  //阻止默认浏览器动作(W3C) 
  if (e && e.preventDefault)
    e.preventDefault();
  //IE中阻止函数器默认动作的方式 
  else
    window.event.returnValue = false;
  return false;
}

const PixiDraw = () => {
  const styledGraph = useStyledGraph();
  const divContainer = useRef();
  const maxLabelLength = 10;
  const [graphContainerInitialPos, setGraphContainerInitialPos] = useState(null);
  const { selectedNodeId } = useGlobalStates();
  const [graphContainerAdded, setGraphContainerAdded] = useState(false);

  const handleClick = (id) => {
    if (selectedNodeId !== id)
      modifyGlobalStates(
        GlobalStatesModificationType.SET_SELECTEDNODE,
        id
      );
  };

  useEffect(() => { // 初始化
    if (!divContainer.current || !divContainer.current.clientWidth) return;
    divContainer.current.innerHTML = "";
    graphContainer = new PIXI.Container();
    graphContainer.sortableChildren = true;
    window.graphContainer = graphContainer;

    app = new PIXI.Application({
      width: 256,         // default: 800
      height: 256,        // default: 600
      antialias: true,    // default: false
      transparent: true, // default: false
      resolution: 1       // default: 1
    })
    app.stage.addChild(graphContainer);
    divContainer.current.appendChild(app.view);

    window.addEventListener('resize', resize);
    // Resize function window
    function resize() {
      const parent = divContainer.current;
      if (parent)
        app.renderer.resize(parent.clientWidth, parent.clientHeight);
    }
    resize();
  }, []); // 初始化

  useEffect(() => {
    if (!styledGraph || styledGraph.nodeStyles.length === 0) return;

    // if (graphContainerAdded) { // 如果不是第一次绘制，则将原来的图中，除了矩形之外的其他图形删除，矩形在变换后删除
    let indexToBeDeleted = [];
    for (let i = 0; i < graphContainer.children.length; i++) {
      let obj = graphContainer.children[i];
      if (!obj.hitArea || !(obj.hitArea instanceof PIXI.Rectangle)) {
        indexToBeDeleted.push(i);
      }
    }
    for (let i = indexToBeDeleted.length - 1; i >= 0; i--) {
      graphContainer.removeChildAt(indexToBeDeleted[i]);
    }
    // }

    addNodes(graphContainer, styledGraph);
    addLabels(graphContainer, styledGraph);
    addLines(graphContainer, styledGraph);
    addPorts(graphContainer, styledGraph);

    if (zoomFactor !== 1) {
      // 对graphContainer中的所有元素进行初始化的放大缩小，并且调整分辨率
      for (let obj of graphContainer.children) {
        if (obj instanceof PIXI.Text || obj instanceof PIXI.Sprite) {
          obj.resolution *= zoomFactor > 1 ? zoomFactor : 2;
        }
      }
    } else {
      for (let obj of graphContainer.children) {
        if (obj instanceof PIXI.Text || obj instanceof PIXI.Sprite) {
          obj.resolution *= 2;
        }
      }
    }

    addDragGraphEvent(divContainer, graphContainer);
    zoomInTimes = 0;
    addZoomEvent(divContainer, graphContainer);

    setGraphContainerAdded(true);
  }, [styledGraph]);


  const addDragGraphEvent = (divContainer, graphContainer) => {
    // 拖动
    let mousedown = false;
    let offsetX, offsetY;
    let mouseMoved = false;
    divContainer.current.addEventListener("mousedown", function (e) {
      stopBubble(e);
      stopDefault(e);
      mousedown = true;
      offsetX = e.offsetX - graphContainer.x;
      offsetY = e.offsetY - graphContainer.y;
    })
    divContainer.current.addEventListener("mousemove", function (e) {
      if (mousedown) {
        mouseMoved = true;
        stopBubble(e);
        stopDefault(e);
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
      stopBubble(e);
      stopDefault(e);
      mousedown = false;
      graphContainer.x = (e.offsetX - offsetX); // 偏移
      graphContainer.y = (e.offsetY - offsetY);
      setGraphContainerInitialPos({ x: graphContainer.x, y: graphContainer.y });

      if (mouseMoved === false) { // 如果鼠标没有拖动，相当于点击空白区域
        handleClick(""); // 取消单选
        if (selectedGraph.length === 1) { // 消除矩形框
          selectedGraph[0].tint = 0xFFFFFF;
          selectedGraph.pop();
        }
      }
      mouseMoved = false;

    })
  }

  const addZoomEvent = (divContainer, graphContainer) => {
    // 滚轮事件
    divContainer.current.addEventListener("mousewheel", function (event) {
      // event.wheelDelta > 0 放大， event.wheelDelta < 0 缩小
      if (event.wheelDelta > 0) {
        graphContainer.width *= 1.1;
        graphContainer.height *= 1.1;
        zoomFactor *= 1.1;

        // 以鼠标位置为中心放大
        graphContainer.x = 1.1 * (graphContainer.x - event.offsetX) + event.offsetX;
        graphContainer.y = 1.1 * (graphContainer.y - event.offsetY) + event.offsetY;

        for (let obj of graphContainer.children) { // 文字分辨率
          if (obj instanceof PIXI.Text || obj instanceof PIXI.Sprite) {
            obj.resolution *= 1.1;
          }
        }
      } else {
        graphContainer.width /= 1.1;
        graphContainer.height /= 1.1;
        zoomFactor /= 1.1;

        // 以鼠标位置为中心放大
        graphContainer.x = (graphContainer.x - event.offsetX) / 1.1 + event.offsetX;
        graphContainer.y = (graphContainer.y - event.offsetY) / 1.1 + event.offsetY;

        for (let obj of graphContainer.children) {
          if (obj instanceof PIXI.Text || obj instanceof PIXI.Sprite) {
            obj.resolution /= 1.1;
          }
        }
      }
    })
  }

  function addRoundRectClickEvent(graphContainer, roundBox, id) {
    // 双击展开
    let clickTimes = 0;
    let timer = null;
    let mousedown = false;
    let offsetX, offsetY;
    let mousemove = false;
    let mouseChoose = false;

    roundBox.mousedown = function (e) {
      // pixi中断事件冒泡
      stopBubble(e);
      stopDefault(e);
      mousedown = true;
      offsetX = e.data.global.x - graphContainer.x;
      offsetY = e.data.global.y - graphContainer.y;
      mouseChoose = true;
    }

    roundBox.mousemove = function (e) {
      if (mousedown) {
        mousemove = true;
        mouseChoose = false;
        stopBubble(e);
        stopDefault(e);
        graphContainer.x = (e.data.global.x - offsetX); // 偏移
        graphContainer.y = (e.data.global.y - offsetY);
        if (e.data.global.x <= 2 ||
          e.data.global.y <= 2 ||
          divContainer.current.clientWidth - e.data.global.x <= 2 ||
          divContainer.current.clientHeight - e.data.global.y <= 2) { // 设置一定的界限，
          mousedown = false;
        }
      }
    }

    roundBox.mouseup = function (e) {
      // pixi中断事件冒泡
      stopBubble(e);
      stopDefault(e);
      mousedown = false;
      clearTimeout(timer);

      timer = setTimeout(() => { // 单击事件
        clickTimes = 0;
        if (mouseChoose) {
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
          mouseChoose = false;
        }
      }, 200);

      clickTimes++;

      if (clickTimes === 2) { // 双击
        clearTimeout(timer);
        clickTimes = 0;
        toggleExpanded(id);
      }
    }
  }

  const addNodes = (container, styledGraph) => {
    const newRectNodeInfo = new Map();
    styledGraph.nodeStyles.forEach((d, idx) => {
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
          ellipse2.zIndex = idx;
          container.addChild(ellipse2);

          let ellipse1 = drawElippseCurve(
            node.id,
            d.style._gNodeTransX,
            d.style._gNodeTransY + 3,
            d.style._ellipseX,
            d.style._ellipseY,
          ); // drawEllipse(x, y, width, height);
          ellipse1.zIndex = idx;
          container.addChild(ellipse1);
        }

        let ellipse = drawElippseCurve(
          node.id,
          d.style._gNodeTransX,
          d.style._gNodeTransY,
          d.style._ellipseX,
          d.style._ellipseY,
        ); // drawEllipse(x, y, width, height);
        ellipse.zIndex = idx;

        let mousedown = false;
        let mouseChoose = false;
        let offsetX, offsetY;

        ellipse.mousedown = function (e) {
          stopBubble(e);
          stopDefault(e);
          mousedown = true;
          mouseChoose = true;
          offsetX = e.data.global.x - container.x;
          offsetY = e.data.global.y - container.y;
        }

        ellipse.mousemove = function (e) {
          if (mousedown) {
            mouseChoose = false;

            stopBubble(e);
            stopDefault(e);
            container.x = (e.data.global.x - offsetX); // 偏移
            container.y = (e.data.global.y - offsetY);
            if (e.data.global.x <= 2 ||
              e.data.global.y <= 2 ||
              divContainer.current.clientWidth - e.data.global.x <= 2 ||
              divContainer.current.clientHeight - e.data.global.y <= 2) { // 设置一定的界限，
              mousedown = false;
            }

          }
        }

        ellipse.mouseup = function (e) {
          stopBubble(e);
          stopDefault(e);
          mousedown = false;
          if (mouseChoose) {
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
        }

        container.addChild(ellipse);

        const loader = new PIXI.Loader();
        if (node.parameters.length !== 0) {
          loader
            .add('dashCircle', process.env.PUBLIC_URL + "/assets/dashCircle.png")
            .load(() => {
              const dashCircle = new PIXI.Sprite(
                loader.resources["dashCircle"].texture
              );
              dashCircle.zIndex = 500001;
              dashCircle.width = d.style._ellipseY;
              dashCircle.height = d.style._ellipseY;
              dashCircle.x = d.style._gNodeTransX + d.style._ellipseY;
              dashCircle.y = d.style._gNodeTransY + d.style._ellipseY - dashCircle.height / 2;

              container.addChild(dashCircle);
            })
        }

        if (node.constVals.length !== 0) {
          loader
            .add('solidCircle', process.env.PUBLIC_URL + "/assets/solidCircle.png")
            .load(() => {
              const solidCircle = new PIXI.Sprite(
                loader.resources["solidCircle"].texture
              );
              solidCircle.zIndex = 500002;
              solidCircle.width = d.style._ellipseY;
              solidCircle.height = d.style._ellipseY;
              solidCircle.x = d.style._gNodeTransX - d.style._ellipseY;
              solidCircle.y = d.style._gNodeTransY + d.style._ellipseY - solidCircle.height / 2;

              container.addChild(solidCircle);
            })
        }
      } else if (node.type === NodeType.GROUP || node.type === NodeType.DATA) {
        const xPos = d.style._gNodeTransX - d.style._rectWidth / 2,
          yPos = d.style._gNodeTransY - d.style._rectHeight / 2,
          width = d.style._rectWidth,
          height = d.style._rectHeight;
        let color = 0xffffff, alpha = 1;
        if (node.expand) {
          color = 0xfff6ef;
          alpha = 1;
        }

        if (graphContainerAdded === false || !rectNodeInfo.has(node.id)) { // 第一次进行绘制 或者这个矩形之前没有画过
          let roundBox = drawRoundRect(node.id, xPos, yPos, color, alpha, width, height, 5, idx, container, addRoundRectClickEvent);
          container.addChild(roundBox.value);
          newRectNodeInfo.set(node.id, { x: xPos, y: yPos, width: width, height: height, pixiGraph: roundBox, zIndex: idx });
        } else { // 这一矩形之前画过 
          let _nodeInfo = rectNodeInfo.get(node.id);
          let oldRoundBox = _nodeInfo.pixiGraph; // 原来的矩形
          TweenMax.fromTo(
            oldRoundBox,
            0.5,
            { x: _nodeInfo.x, y: _nodeInfo.y, myWidth: _nodeInfo.width, myHeight: _nodeInfo.height, myZIndex: _nodeInfo.zIndex, myFillColor: color, myFillOpacity: alpha },
            { x: xPos, y: yPos, myWidth: width + 0.000001, myHeight: height, myZIndex: idx, myFillColor: color, myFillOpacity: alpha }
          )
          newRectNodeInfo.set(node.id, { x: xPos, y: yPos, width: width, height: height, pixiGraph: oldRoundBox, zIndex: idx });

        }
      } else if (node.type === NodeType.LAYER) {
        const xPos = d.style._gNodeTransX - d.style._rectWidth / 2,
          yPos = d.style._gNodeTransY - d.style._rectHeight / 2,
          width = d.style._rectWidth,
          height = d.style._rectHeight;

        let color = 0xffffff, alpha = 1;
        console.log(node.label);
        if (node.label.startsWith("fc")) {
          color = 0xffcb9e;
        } else if (node.label.startsWith("conv")) {
          color = 0xaad9aa;
        } else if (node.label.startsWith("rnn")) {
          color = 0xffffff;
        }

        if (graphContainerAdded === false || !rectNodeInfo.has(node.id)) { // 第一次进行绘制 或者这个矩形之前没有画过
          let roundBox = drawRoundRect(node.id, xPos, yPos, color, alpha, width, height, 5, idx, container, addRoundRectClickEvent);
          container.addChild(roundBox.value);
          newRectNodeInfo.set(node.id, { x: xPos, y: yPos, width: width, height: height, pixiGraph: roundBox, zIndex: idx });
        } else { // 这一矩形之前画过 
          let _nodeInfo = rectNodeInfo.get(node.id);
          let oldRoundBox = _nodeInfo.pixiGraph; // 原来的矩形
          TweenMax.fromTo(
            oldRoundBox,
            0.5,
            { x: _nodeInfo.x, y: _nodeInfo.y, myWidth: _nodeInfo.width, myHeight: _nodeInfo.height, myZIndex: _nodeInfo.zIndex, myFillColor: color, myFillOpacity: alpha },
            { x: xPos, y: yPos, myWidth: width + 0.000001, myHeight: height, myZIndex: _nodeInfo.zIndex, myFillColor: color, myFillOpacity: alpha }
          )
          newRectNodeInfo.set(node.id, { x: xPos, y: yPos, width: width, height: height, pixiGraph: oldRoundBox, zIndex: idx });
        }
      }
    })

    // 将图中没有的多余矩形删除：
    for (let [key, value] of rectNodeInfo) {
      if (!newRectNodeInfo.has(key)) {
        let rect = value.pixiGraph;
        container.removeChild(rect.value);
      }
    }
    rectNodeInfo = newRectNodeInfo;
  }

  const addLabels = (container, styledGraph) => {
    styledGraph.nodeStyles.forEach((d, i) => {
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
        message.zIndex = 500000;
        message.resolution = 1;
        message.anchor.x = 0;

        let textCanvasWidth = message.width;
        message.position.set(d.style._gNodeTransX - textCanvasWidth / 2, d.style._gNodeTransY - d.style._rectHeight / 2 - fontSize);
        container.addChild(message);
      } else { // layer层 文字前面需要加上图标
        const fontSize = 16;
        let style = new PIXI.TextStyle({
          fontFamily: "Arial",
          fill: "0x333",
          fontSize: fontSize,
        })
        let text = d.data.label.slice(0, maxLabelLength) + (d.data.label.length > maxLabelLength ? "..." : "");
        let message = new PIXI.Text(text, style);
        message.zIndex = 500000;
        message.resolution = 1;

        let textCanvasWidth = message.width;
        if (node.type === NodeType.LAYER) {
          let iconSize = 13;
          message.position.set(d.style._gNodeTransX - textCanvasWidth / 2 + iconSize, d.style._gNodeTransY - d.style._rectHeight / 2);

          const loader = new PIXI.Loader();
          let path = process.env.PUBLIC_URL + "/assets/";
          if (d.data.label.startsWith("conv"))
            path += "cnn.png";
          else if (d.data.label.startsWith("fc"))
            path += "fc.png";
          else if (d.data.label.startsWith("rnn"))
            path += "rnn.png";

          loader
            .add('icon', path)
            .load(() => {
              const icon = new PIXI.Sprite(loader.resources["icon"].texture);
              icon.width = iconSize;
              icon.height = iconSize;
              icon.resolution = 1;
              icon.zIndex = 500000;
              icon.x = d.style._gNodeTransX - textCanvasWidth / 2 - 3;
              icon.y = d.style._gNodeTransY - d.style._rectHeight / 2 + iconSize / 4;

              container.addChild(message);
              container.addChild(icon);
            })

        } else {
          message.position.set(d.style._gNodeTransX - textCanvasWidth / 2, d.style._gNodeTransY - d.style._rectHeight / 2);
          container.addChild(message);
        }
      }
    })
  }

  const drawRoundCorner = (beginPos, endPos, r, direction, width, color, alpha) => { // direction分为 rd ul .....
    // 首先将pos.x较小的作为起点
    let begin, end;
    if (beginPos.x < endPos.x) {
      begin = beginPos;
      end = endPos;
    } else {
      begin = endPos;
      end = beginPos;
    }

    const bezier = new PIXI.Graphics();
    bezier.lineStyle(width, color, alpha);

    if (direction === "rd" || direction === "ul") { // 左上 -> 右下
      bezier.moveTo(0 - 1, 0); // 为了避免圆角与折线之间的间隙，所以，圆角向前和向后多占用一个像素的位置
      bezier.quadraticCurveTo(r, 0, r, r + 1);
      bezier.position.x = begin.x; // 第一象限圆弧，中点在起始点
      bezier.position.y = begin.y;
    } else if (direction === "dl" || direction === "ru") {
      bezier.moveTo(0 - 1, r);
      bezier.quadraticCurveTo(r, r, r, 0 - 1);
      bezier.position.x = begin.x; // 第二象限圆弧
      bezier.position.y = begin.y - r;
    } else if (direction === "lu" || direction === "dr") {
      bezier.moveTo(0, 0 - 1);
      bezier.quadraticCurveTo(0, r, r + 1, r);
      bezier.position.x = begin.x;
      bezier.position.y = begin.y;
    } else if (direction === "ur" || direction === "ld") {
      bezier.moveTo(0, r + 1);
      bezier.quadraticCurveTo(0, 0, r + 1, 0);
      bezier.position.x = begin.x;
      bezier.position.y = begin.y - r;
    }

    return bezier;
  }

  const judgeDirection = (beginPos, endPos) => {  // 返回 l r u d 分别表示左右上下
    if (beginPos.x === endPos.x) { // 上下
      if (beginPos.y > endPos.y)
        return "u";
      else
        return "d";
    } else if (beginPos.x < endPos.x)
      return "r";
    else return "l";
  }

  const adjustLinepos = (begin, end, d1, r, i, arrayLength) => {
    if (d1 === "r") {
      if (i !== 1)  // 不能直接操作begin， 因为begin是数组中的地址，直接修改begin则修改了数组中的值
        begin = Object.assign({}, { x: begin.x + r, y: begin.y });
      if (i !== arrayLength - 1) // 线的最后一段end的不变
        end = Object.assign({}, { x: end.x - r, y: end.y });
    } else if (d1 === "l") {
      if (i !== 1) begin = Object.assign({}, { x: begin.x - r, y: begin.y });
      if (i !== arrayLength - 1) end = Object.assign({}, { x: end.x + r, y: end.y });
    } else if (d1 === 'd') {
      if (i !== 1) begin = Object.assign({}, { x: begin.x, y: begin.y + r }); // begin.y += 3;
      if (i !== arrayLength - 1) end = Object.assign({}, { x: end.x, y: end.y - r }); //end.y -= 3;
    } else if (d1 === "u") {
      if (i !== 1) begin = Object.assign({}, { x: begin.x, y: begin.y - r }); // begin.y -= 3;
      if (i !== arrayLength - 1) end = Object.assign({}, { x: end.x, y: end.y + r }); // end.y += 3;
    }
    return [begin, end];
  }

  const addLines = (container, styledGraph) => {
    const roundR = 5; // 圆角半径
    styledGraph.linkStyles.forEach((d, i) => {
      const linkData = d.data.linkData;
      const lineStrokeWidth = d.data.lineStrokeWidth;

      // 圆角折线
      for (let i = 1; i < linkData.length; i++) {
        let line = new PIXI.Graphics();
        line.zIndex = 500000;
        let lineColor;
        if (d.data.isModuleEdge)
          lineColor = 0xff931e;
        else
          lineColor = 0x000000;

        const lineWidth = lineStrokeWidth[i - 1];
        line.lineStyle(lineWidth, lineColor, 1)

        let begin = linkData[i - 1], end = linkData[i];
        if (i === linkData.length - 1) { // 最后一根直线
          let lineData = d.data.lineData;
          let temp = lineData.split(" ").slice(-2); // 有可能是L开头。
          if (temp[0][0] === "L") temp[0] = temp[0].slice(1);
          end = { x: parseFloat(temp[0]), y: parseFloat(temp[1]) };

          let d1 = judgeDirection(begin, end);
          [begin, end] = adjustLinepos(begin, end, d1, roundR, i, linkData.length); // 根据线的起点和中点，调整
        }

        if (i !== linkData.length - 1) { // 最后一根折线末尾不需要加圆角
          let nextEnd = linkData[i + 1]; // 下一个起始点
          let nextBegin = linkData[i];
          // 前一条线: begin -> end
          // 后一条线：end - > nextEnd
          let d1 = judgeDirection(begin, end);
          let d2 = judgeDirection(nextBegin, nextEnd);

          [begin, end] = adjustLinepos(begin, end, d1, roundR, i, linkData.length); // 根据线的起点和中点，调整

          [nextBegin, nextEnd] = adjustLinepos(nextBegin, nextEnd, d2, roundR, i + 1, linkData.length);

          let corner = drawRoundCorner(end, nextBegin, roundR, d1 + d2, lineWidth, lineColor, 1);
          corner.zIndex = 500000;
          container.addChild(corner);
        }

        line.moveTo(begin.x, begin.y);
        line.lineTo(end.x, end.y);

        container.addChild(line);

        if (i === linkData.length - 1) {
          // 增加一个箭头
          end = linkData[i];
          const arrow = drawArrow(begin, end, 0x000000); //0x999999
          arrow.zIndex = 500000;
          container.addChild(arrow);
        }
      }
    })
  }

  // TODO : 到底是什么样的逻辑？？
  const addPortHoverEvent = (container, port, d, portPosition) => {
    const portIdSplited = d.data.id4Style.split("_");
    const portId = portIdSplited.length >= 2 ?     // portId以 inPort_ 或者 outport_开头
      portIdSplited[0] + "_" + portIdSplited[1] :
      d.data.id4Style;

    portPosition.set(portId, { x: port.hitArea.x, y: port.hitArea.y });

    let hoverEdgeAdded = null;
    port.mouseover = function (e) {
      // console.log("portPosition", portPosition);
      // console.log("portId", portId);
      for (let i = 0; i < d.data.hiddenEdges.length; i++) {
        const { source, target } = d.data.hiddenEdges[i]; // 因为source 不以in out开头
        // console.log("source, target", [source, target]);

        if (source !== portId.split("_")[1] && target !== portId.split("_")[1]) continue;

        let sourcePos, targetPos;
        if (portId.startsWith("in")) {
          sourcePos = portPosition.get("outPort_" + source);
          targetPos = portPosition.get(portId);
        } else if (portId.startsWith("out")) {
          sourcePos = portPosition.get(portId);
          targetPos = portPosition.get("inPort_" + target);
        }
        // if (source === portId.split("_")[1]) {
        //   sourcePos = portPosition.get(portId);
        //   targetPos = portPosition.get("inPort_" + target);
        // } else if (target === portId.split("_")[1]) {
        //   sourcePos = portPosition.get("outPort_" + source);
        //   targetPos = portPosition.get(portId);
        // }

        const hoverEdge = new PIXI.Graphics();
        hoverEdge.lineStyle(2, 0x00679f, 1);
        hoverEdge.moveTo(sourcePos.x, sourcePos.y);
        hoverEdge.lineTo(targetPos.x, targetPos.y);
        container.addChild(hoverEdge);
        hoverEdgeAdded = hoverEdge;
      }
    }
    port.mouseout = function (e) {
      if (hoverEdgeAdded !== null) {
        container.removeChild(hoverEdgeAdded);
        hoverEdgeAdded = null;
      }
    }

  }

  const addPorts = (container, styledGraph) => {
    const portPosition = new Map(); //  id -> {x, y}
    styledGraph.portStyles.forEach((d) => {
      const ofs_x = -7.5;
      const ofs_y = -7.4;
      const xt = 9, yt = -1 / 2 * d.style.nodeRectHeight.val + 10;
      let ofs = [xt, ofs_y]
      if (!d.data.isRealLink) {
        ofs = [0, ofs_y + yt];
      }

      if (d.data.isOperation) {
        // circle_level_1_small
        let circle = drawCircleCurve(
          d.style.gNodeTransX.val + (d.data.direction === "in" ? ofs_x + ofs[0] : ofs_x - ofs[0]) + 5.5,
          d.style.gNodeTransY.val + ofs[1] + 5.5,
          5,
          0xFFFFFF,
          1);

        let circle1 = drawCircleCurve(
          d.style.gNodeTransX.val + (d.data.direction === "in" ? ofs_x + ofs[0] : ofs_x - ofs[0]) + 5.5,
          d.style.gNodeTransY.val + ofs[1] + 5.5,
          1,
          0x333333,
          1);
        container.addChild(circle);
        container.addChild(circle1);
      } else {
        if (d.data.type["level_1"] && d.data.type["level_2"]) {
          // circle_level_1_2_big
          let circle = drawCircleCurve(
            d.style.gNodeTransX.val + (d.data.direction === "in" ? ofs_x + ofs[0] : ofs_x - ofs[0]) + 7.5,
            d.style.gNodeTransY.val + ofs[1] + 7.5,
            7,
            0xFFFFFF,
            1);

          let circle1 = drawCircleCurve(
            d.style.gNodeTransX.val + (d.data.direction === "in" ? ofs_x + ofs[0] : ofs_x - ofs[0]) + 7.5,
            d.style.gNodeTransY.val + ofs[1] + 4.5,
            1.4,
            0x333333,
            1);

          let circle2 = drawCircleCurve(
            d.style.gNodeTransX.val + (d.data.direction === "in" ? ofs_x + ofs[0] : ofs_x - ofs[0]) + 5.4,
            d.style.gNodeTransY.val + ofs[1] + 10.5,
            1.4,
            0x333333,
            1);

          let circle3 = drawCircleCurve(
            d.style.gNodeTransX.val + (d.data.direction === "in" ? ofs_x + ofs[0] : ofs_x - ofs[0]) + 9.95,
            d.style.gNodeTransY.val + ofs[1] + 10.5,
            1.4,
            0x333333,
            1);

          let line = new PIXI.Graphics();

          line.lineStyle(3, 0x333333, 1)
          line.moveTo(0.5, 7.5);
          line.lineTo(14.5, 7.5);

          container.addChild(circle);
          container.addChild(circle1);
          container.addChild(circle2);
          container.addChild(circle3);
          container.addChild(line);
        } else {
          if (d.data.type["level_1"]) {
            // circle_level_1_big
            let circle = drawCircleCurve(
              d.style.gNodeTransX.val + (d.data.direction === "in" ? ofs_x + ofs[0] : ofs_x - ofs[0]) + 7.5,
              d.style.gNodeTransY.val + ofs[1] + 7.5,
              7,
              0xFFFFFF,
              1);

            let circle1 = drawCircleCurve(
              d.style.gNodeTransX.val + (d.data.direction === "in" ? ofs_x + ofs[0] : ofs_x - ofs[0]) + 7.5,
              d.style.gNodeTransY.val + ofs[1] + 7.5,
              1.4,
              0x333333,
              1);
            window.circle = circle;

            addPortHoverEvent(container, circle, d, portPosition); // 给circle添加hover事件

            container.addChild(circle);
            container.addChild(circle1);
          } else {
            // circle_level_2_big
            let circle = drawCircleCurve(
              d.style.gNodeTransX.val + (d.data.direction === "in" ? ofs_x + ofs[0] : ofs_x - ofs[0]) + 7.5,
              d.style.gNodeTransY.val + ofs[1] + 7.5,
              7,
              0xFFFFFF,
              1);

            let circle1 = drawCircleCurve(
              d.style.gNodeTransX.val + (d.data.direction === "in" ? ofs_x + ofs[0] : ofs_x - ofs[0]) + 5.4,
              d.style.gNodeTransY.val + ofs[1] + 7.5,
              1.4,
              0x333333,
              1);
            let circle2 = drawCircleCurve(
              d.style.gNodeTransX.val + (d.data.direction === "in" ? ofs_x + ofs[0] : ofs_x - ofs[0]) + 9.55,
              d.style.gNodeTransY.val + ofs[1] + 7.5,
              1.4,
              0x333333,
              1);
            container.addChild(circle);
            container.addChild(circle1);
            container.addChild(circle2);
          }
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
