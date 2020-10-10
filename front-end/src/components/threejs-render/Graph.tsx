import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import * as d3 from "d3";
import { Event } from "./threeEvent.js";
import {
  LayoutGraph,
  DisplayedEdge,
  DisplayedNode,
  Coordinate,
} from "../../types/layoutGraphForRender";
import { useGlobalStates, modifyGlobalStates } from "../../store/global-states";
import {
  addArrow,
  addRoundLine,
  addText,
  addRoundRect,
  addElippseCurve,
} from "./draw";
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
import { clearThree, coordinateTransform } from "./util";
import DragControls from "three-dragcontrols";
import TransformControls from "three-transformcontrols";
import TrackballControls from "three-trackballcontrols";

let iter = 0;
const iterMax = 15; //控制动画总的迭代次数
let styledGraphNodesMap = new Map();
let oldStyledGraphNodesMap = new Map();
const Graph: React.FC = () => {
  const styledGraph = useStyledGraph();
  const { selectedNodeId } = useGlobalStates();
  const container = useRef<HTMLDivElement>();
  const camera = useRef<THREE.OrthographicCamera>();
  const scene = useRef<THREE.Scene>();
  const objects = useRef<Array<any>>();
  const renderer = useRef<THREE.WebGLRenderer>();
  const event = useRef<Event>();

  const sceneSetup = () => {
    const width = container.current.clientWidth;
    const height = container.current.clientHeight;
    const margin = 10;
    camera.current = new THREE.OrthographicCamera(
      -margin,
      width - margin,
      height + margin,
      margin,
      1,
      1000
    );
    camera.current.position.z = 5;
  };

  const sceneUpdate = () => {
    scene.current = new THREE.Scene();
    objects.current = [];
  };

  const addSceneLines = () => {
    const width = container.current.clientWidth;
    const height = container.current.clientHeight;
    styledGraph.linkStyles.forEach((link) => {
      const linkData = link.data.linkData.map((link) => ({
        x: link.x,
        y: height - link.y,
      }));
      let line = addRoundLine(linkData);
      line.renderOrder = 2;
      scene.current.add(line);
      objects.current.push(line);
      //add arrow
      let from = new THREE.Vector3(
        linkData[linkData.length - 2].x,
        linkData[linkData.length - 2].y,
        0
      );
      let to = new THREE.Vector3(
        linkData[linkData.length - 1].x,
        linkData[linkData.length - 1].y,
        0
      );
      let arrow = addArrow(from, to);
      scene.current.add(arrow);
      objects.current.push(arrow);
    });
  };

  const addSceneLabel = (iter = iterMax) => {
    const height = container.current.clientHeight;
    const maxLabelLength = 10;
    let texts;
    if (iter !== iterMax) {
      texts = styledGraph.nodeStyles.map((node) => {
        const isRect =
          node.data.type === NodeType.GROUP || node.data.type === NodeType.DATA;
        let basic_x = node.style._gNodeTransX;
        let basic_y = height - node.style._gNodeTransY;
        if (oldStyledGraphNodesMap.has(node.key)) {
          const oldNodeStyle = oldStyledGraphNodesMap.get(node.key);
          basic_x =
            oldNodeStyle._gNodeTransX +
            ((node.style._gNodeTransX - oldNodeStyle._gNodeTransX) * iter) /
              iterMax;
          basic_y =
            height -
            oldNodeStyle._gNodeTransY +
            ((height -
              node.style._gNodeTransY -
              (height - oldNodeStyle._gNodeTransY)) *
              iter) /
              iterMax;
        }
        return {
          label:
            node.data.label.slice(0, maxLabelLength) +
            (node.data.label.length > maxLabelLength ? "..." : ""),
          point: {
            x: basic_x,
            y: isRect
              ? basic_y + node.style._rectHeight / 2 - 10
              : basic_y + node.style._rectHeight / 2 + 5,
          },
          size: isRect ? 75 : 50,
        };
      });
    } else {
      texts = styledGraph.nodeStyles.map((node) => {
        const isRect =
          node.data.type === NodeType.GROUP || node.data.type === NodeType.DATA;
        const basic_y = height - node.style._gNodeTransY;
        return {
          label:
            node.data.label.slice(0, maxLabelLength) +
            (node.data.label.length > maxLabelLength ? "..." : ""),
          point: {
            x: node.style._gNodeTransX,
            y: isRect
              ? basic_y + node.style._rectHeight / 2 - 10
              : basic_y + node.style._rectHeight / 2 + 5,
          },
          size: isRect ? 75 : 50,
        };
      });
    }
    let label = addText(
      texts,
      container.current.clientWidth,
      container.current.clientHeight
    );
    scene.current.add(label);
    objects.current.push(label);
  };

  const addSceneRect = (iter = iterMax) => {
    const height = container.current.clientHeight;
    if (iter !== iterMax) {
      //过渡动画
      styledGraph.nodeStyles.forEach((node) => {
        let rect = null;
        if (oldStyledGraphNodesMap.has(node.key)) {
          const oldNodeStyle = oldStyledGraphNodesMap.get(node.key);
          rect = addRoundRect(
            oldNodeStyle._rectWidth +
              ((node.style._rectWidth - oldNodeStyle._rectWidth) * iter) /
                iterMax,
            oldNodeStyle._rectHeight +
              ((node.style._rectHeight - oldNodeStyle._rectHeight) * iter) /
                iterMax,
            oldNodeStyle._gNodeTransX +
              ((node.style._gNodeTransX - oldNodeStyle._gNodeTransX) * iter) /
                iterMax,
            height -
              oldNodeStyle._gNodeTransY +
              ((height -
                node.style._gNodeTransY -
                (height - oldNodeStyle._gNodeTransY)) *
                iter) /
                iterMax,
            node.key
          );
        } else {
          rect = addRoundRect(
            node.style._rectWidth,
            node.style._rectHeight,
            node.style._gNodeTransX,
            height - node.style._gNodeTransY,
            node.key
          );
        }
        scene.current.add(rect);
        objects.current.push(rect);
      });
    } else {
      //直接绘制
      styledGraph.nodeStyles.forEach((node) => {
        let rect = addRoundRect(
          node.style._rectWidth,
          node.style._rectHeight,
          node.style._gNodeTransX,
          height - node.style._gNodeTransY,
          node.key
        );
        scene.current.add(rect);
        objects.current.push(rect);
      });
    }
  };

  const addSceneEvent = () => {
    if (event.current === undefined) {
      event.current = new Event({
        camera: camera.current,
        scene: scene.current,
        renderer: renderer.current,
        width: container.current.clientWidth,
        height: container.current.clientHeight,
        objects: objects.current,
      });
    } else {
      event.current.camera = camera.current;
      event.current.scene = scene.current;
      event.current.renderer = renderer.current;
      event.current.width = container.current.clientWidth;
      event.current.height = container.current.clientHeight;
      event.current.objects = objects.current;
    }
  };

  function easeInQuad(t, b, c, d) {
    var x = t / d; //x值
    var y = x * x; //y值
    return b + c * y; //套入最初的公式
  }

  function easeOutQuad(t, b, c, d) {
    var x = t / d; //x值
    var y = -x * x + 2 * x; //y值
    return b + c * y; //套入最初的公式
  }

  function easeInOutQuad(t, b, c, d) {
    if (t < d / 2) {
      //前半段时间
      return easeInQuad(t, b, c / 2, d / 2); //改变量和时间都除以2
    } else {
      var t1 = t - d / 2; //注意时间要减去前半段时间
      var b1 = b + c / 2; //初始量要加上前半段已经完成的
      return easeOutQuad(t1, b1, c / 2, d / 2); //改变量和时间都除以2
    }
  }

  const animate = () => {
    if (iter < iterMax) {
      iter += 1;
      let frame = easeInOutQuad(iter, 0, iterMax, iterMax);
      //这里加入插值函数
      sceneUpdate();
      addSceneLines();
      addSceneLabel(frame);
      addSceneRect(frame);
      renderer.current.render(scene.current, camera.current);
      requestAnimationFrame(animate);
    } else {
      oldStyledGraphNodesMap = new Map();
      styledGraph.nodeStyles.forEach((node) => {
        oldStyledGraphNodesMap.set(node.key, node.style);
      });
    }
  };

  useEffect(() => {
    //componentDidMount
    sceneSetup();
    sceneUpdate();
    const width = container.current.clientWidth;
    const height = container.current.clientHeight;
    renderer.current = new THREE.WebGLRenderer({
      antialias: true,
    });
    renderer.current.setSize(width, height);
    renderer.current.setClearColor("rgb(255,255,255)", 1.0);
    container.current.appendChild(renderer.current.domElement);
  }, []);

  useEffect(() => {
    //componentDidUpdate
    if (styledGraph !== null && styledGraph.nodeStyles.length > 0) {
      styledGraphNodesMap = new Map();
      styledGraph.nodeStyles.forEach((node) => {
        styledGraphNodesMap.set(node.key, node.style);
      });
      console.log(oldStyledGraphNodesMap.size);
      console.log(styledGraphNodesMap.size);
      if (oldStyledGraphNodesMap.size !== styledGraphNodesMap.size) {
        console.log("动画触发");
        //动画过渡
        iter = 0;
        animate();
      } else {
        sceneUpdate();
        addSceneLines();
        addSceneLabel();
        addSceneRect();
        renderer.current.render(scene.current, camera.current);
      }
      addSceneEvent();
      d3.select(renderer.current.domElement).call(event.current.d3Zoom); //画布平移
      container.current.addEventListener(
        "dblclick",
        event.current.mouseDoubleClickHandle,
        true
      ); //双击展开和收起节点

      container.current.addEventListener(
        "mousewheel", //Firefox需要用DomMouseScroll
        event.current.mouseZoom,
        true
      ); //滚轮缩放画布
    }
  }, [styledGraph]);

  useEffect(() => {
    //componentWillUnmount
    return () => {
      document.removeEventListener(
        "dblclick",
        event.current.mouseDoubleClickHandle
      );
      document.removeEventListener("mousewheel", event.current.mouseZoom);
    };
  }, []);

  return (
    <div
      className="render-graph"
      ref={container}
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export default Graph;
