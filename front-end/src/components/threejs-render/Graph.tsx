import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import * as d3 from "d3";
import {Event} from "./threeEvent.js";
import {
  LayoutGraph,
  DisplayedEdge,
  DisplayedNode,
  Coordinate,
} from "../../types/layoutGraphForRender";
import {
  addArrow,
  addRoundLine,
  addText,
  addRoundRect,
  addElippseCurve,
} from "./draw";
import { useStyledGraph } from "../../store/styledGraph";
import {
  NodeType,
  LayerType,
} from "../../common/graph-processing/stage2/processed-graph";

import { clearThree, coordinateTransform } from "./util";
import DragControls from "three-dragcontrols";
import TransformControls from "three-transformcontrols";
import TrackballControls from "three-trackballcontrols";

const Graph: React.FC = () => {
  const styledGraph = useStyledGraph();
  const container = useRef<HTMLDivElement>();
  const camera = useRef<THREE.OrthographicCamera>();
  const scene = useRef<THREE.Scene>();
  const objects = useRef<Array<any>>();
  const renderer = useRef<THREE.WebGLRenderer>();
  const event = useRef<Event>();

  const sceneSetup = () => {
    const width = container.current.clientWidth;
    const height = container.current.clientHeight;
    console.log(width, height)
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

  const addSceneLabel = () => {
    const height = container.current.clientHeight;
    let texts = styledGraph.nodeStyles.map((node) => {
      const maxLabelLength = 10;
      const isRect = node.data.type === NodeType.GROUP || node.data.type === NodeType.DATA;
      const basic_y = height - node.style._gNodeTransY;
      return {
        label: node.data.label.slice(0, maxLabelLength) + (node.data.label.length > maxLabelLength ? "..." : ""),
        point: { 
          x: node.style._gNodeTransX, 
          y: isRect 
          ? basic_y + node.style._rectHeight / 2 - 10
          : basic_y + node.style._rectHeight / 2 + 10 
        },
      };
    });
    let label = addText(
      texts,
      75,
      container.current.clientWidth,
      container.current.clientHeight
    );
    scene.current.add(label);
    objects.current.push(label);
  };

  const addSceneRect = () => {
    const height = container.current.clientHeight;

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
  };

  const addSceneEvent = () => {
    event.current = new Event({
      camera: camera.current,
      scene: scene.current,
      renderer: renderer.current,
      width: container.current.clientWidth,
      height: container.current.clientHeight,
      objects: objects.current,
    });
  };

  useEffect(() => {
    //componentDidMount
    sceneSetup();
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
    console.log(styledGraph);
    if (styledGraph !== null) {
      sceneSetup();
      addSceneLines();
      addSceneLabel();
      addSceneRect();
      addSceneEvent();

      container.current.addEventListener(
        "dblclick",
        event.current.mouseDoubleClickHandle,
        true
      );//双击展开和收起节点

      container.current.addEventListener(
        "mousewheel",//Firefox需要用DomMouseScroll
        event.current.mouseZoom,
        true
      ); //滚轮缩放画布

      d3.select(renderer.current.domElement).call(event.current.d3Zoom);//画布平移

      renderer.current.render(scene.current, camera.current);
    }
  });

  useEffect(() => {
    //componentWillUnmount
    return () => {
      document.removeEventListener("dblclick", event.current.mouseDoubleClickHandle);
      document.removeEventListener("mousewheel", event.current.mouseZoom);
    };
  }, []);

  return <div className="render-graph" ref={container} style={{ width: "100%", height: "100%" }}/>;
};

export default Graph;
