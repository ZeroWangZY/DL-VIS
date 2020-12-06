import {
  modifyProcessedGraph,
  ProcessedGraphModificationType,
} from "../../store/processedGraph";
import * as PIXI from "pixi.js";
import { set } from "d3";
import { fetchNodeLineDataBlueNoiceSampling } from "../../api/layerlevel";

let reuseRoundRect = new PIXI.Graphics();
let reuseEllipse = new PIXI.Graphics();

export const drawElippseCurve = (id, x, y, width, height, clearControl) => {
  if (clearControl.toBeClear) {
    reuseEllipse.clear();
    clearControl.toBeClear = false;
  }
  let ellipse = new PIXI.Graphics(reuseEllipse.geometry);
  reuseEllipse = ellipse;

  ellipse.lineStyle(1, 0x000000, 1); // width color alpha
  ellipse.beginFill(0xFFFFFF, 1); // 填充白色，透明度为0
  ellipse.drawEllipse(x, y, width, height); // drawEllipse(x, y, width, height);
  ellipse.endFill(); // 填充白色

  ellipse.interactive = true;
  ellipse.buttonMode = true;
  ellipse.hitArea = new PIXI.Ellipse(x, y, width, height);

  return ellipse;
}

export const drawRoundRect = (id, x, y, color, alpha, width, height, cornerRadius, zIndex, container, addRoundRectClickEvent) => { // x y为左上角
  let roundBoxAgent = {};

  let roundBox = new PIXI.Graphics();
  // let roundBox = new PIXI.Graphics(reuseRoundRect.geometry);
  // reuseRoundRect = roundBox;

  roundBox.lineStyle(1, 0x000000, 1); // width color alpha
  roundBox.beginFill(color, alpha); // 
  roundBox.myRect = roundBox.drawRoundedRect(0, 0, width, height, cornerRadius)
  roundBox.x = x;
  roundBox.y = y;
  roundBox.endFill();

  roundBox.interactive = true;
  roundBox.buttonMode = true;
  roundBox.hitArea = new PIXI.Rectangle(0, 0, width, height, cornerRadius); // x, y均为左上角

  addRoundRectClickEvent(container, roundBox, id);

  let initialWidth = width;
  let initialHeight = height;
  let initialX = x;
  let initialY = y;
  let initialZIndex = zIndex;
  let initialFillColor = color;
  let initialFillOpacity = alpha;

  const pool = [];
  Object.defineProperty(roundBoxAgent, "myWidth", {
    get: function () {
      return initialWidth;
    },
    set: function (val) {
      initialWidth = val;

      pool.push(roundBoxAgent.value); // 待删除child
      roundBoxAgent.value.clear();
      container.removeChild(roundBoxAgent.value);

      let newRoundBox = new PIXI.Graphics(pool[0].geometry);
      pool.pop();

      newRoundBox.lineStyle(1, 0x000000, 1); // width color alpha
      newRoundBox.beginFill(initialFillColor, initialFillOpacity); // 填充白色

      newRoundBox.myRect = newRoundBox.drawRoundedRect(0, 0, val, initialHeight, cornerRadius);
      newRoundBox.x = initialX;
      newRoundBox.y = initialY;
      newRoundBox.endFill();

      newRoundBox.interactive = true;
      newRoundBox.buttonMode = true;
      newRoundBox.hitArea = new PIXI.Rectangle(0, 0, val, initialHeight, cornerRadius);
      addRoundRectClickEvent(container, newRoundBox, id);

      roundBoxAgent.value = newRoundBox;

      container.addChildAt(newRoundBox, Math.min(initialZIndex, container.children.length));
      // container.sortChildren();
    }
  });

  Object.defineProperty(roundBoxAgent, "myFillColor", {
    get: function () {
      return initialFillColor;
    },
    set: function (val) {
      initialFillColor = val;
    }
  });

  Object.defineProperty(roundBoxAgent, "myFillOpacity", {
    get: function () {
      return initialFillOpacity;
    },
    set: function (val) {
      initialFillOpacity = val;
    }
  });


  Object.defineProperty(roundBoxAgent, "myZIndex", {
    get: function () {
      return initialZIndex;
    },
    set: function (val) {
      initialZIndex = Math.round(val);
    }
  });

  Object.defineProperty(roundBoxAgent, "myHeight", {
    get: function () {
      return initialHeight;
    },
    set: function (val) {
      initialHeight = val;
    }
  });

  Object.defineProperty(roundBoxAgent, "x", {
    get: function () {
      return initialX;
    },
    set: function (val) {
      initialX = val;
    }
  });

  Object.defineProperty(roundBoxAgent, "y", {
    get: function () {
      return initialY;
    },
    set: function (val) {
      initialY = val;
    }
  });

  roundBoxAgent.value = roundBox;
  return roundBoxAgent;
}

export const drawCircleCurve = (x, y, r, fillColor, alpha) => {
  let circle = new PIXI.Graphics();
  circle.zIndex = 50000;
  circle.lineStyle(1, 0x000000, 1); // width color alpha
  circle.beginFill(fillColor, alpha); // 填充白色，透明度为0
  circle.drawCircle(x, y, r);
  circle.endFill();

  circle.interactive = true;
  circle.buttonMode = true;
  circle.hitArea = new PIXI.Circle(x, y, r);

  return circle;
}

export const drawArrow = (begin, end, color) => {
  let points = [];
  if (begin.y === end.y) { // 水平方向
    if (begin.x < end.x) { // 向右
      points = [ // 顺时针方向，第一个点为箭头的 尖
        end.x, end.y,
        end.x - 5, end.y + 5,
        end.x - 3.5, end.y,
        end.x - 5, end.y - 5,
      ];
    }
    else { // 向左
      points = [
        end.x, end.y,
        end.x + 5, end.y - 5,
        end.x + 3.5, end.y,
        end.x + 5, end.y + 5,
      ];
    }
  } else { // 竖直方向
    if (begin.y > end.y) { // 向上
      points = [
        end.x, end.y,
        end.x + 5, end.y + 5,
        end.x, end.y + 3.5,
        end.x - 5, end.y + 5,
      ];
    }
    else { // 向下
      points = [
        end.x, end.y,
        end.x - 5, end.y - 5,
        end.x, end.y - 3.5,
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