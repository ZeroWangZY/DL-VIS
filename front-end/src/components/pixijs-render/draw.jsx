import {
  modifyProcessedGraph,
  ProcessedGraphModificationType,
} from "../../store/processedGraph";
import * as PIXI from "pixi.js";

const toggleExpanded = (id) => {
  modifyProcessedGraph(ProcessedGraphModificationType.TOGGLE_EXPANDED, {
    nodeId: id,
  });
};

export const drawElippseCurve = (id, x, y, width, height, dash, handleClick) => {
  let ellipse = new PIXI.Graphics();
  ellipse.lineStyle(1, 0x808080, 1); // width color alpha
  ellipse.beginFill(0xFFFFFF, 1); // 填充白色，透明度为0
  ellipse.drawEllipse(x, y, width, height); // drawEllipse(x, y, width, height);
  ellipse.endFill(); // 填充白色

  ellipse.interactive = true;
  ellipse.buttonMode = true;
  ellipse.hitArea = new PIXI.Ellipse(x, y, width, height);

  ellipse.click = function (e) {
    console.log("adsfasdf")
    handleClick(id);
  }

  return ellipse;
}

export const drawRoundRect = (id, x, y, width, height, cornerRadius, handleClick) => {
  let roundBox = new PIXI.Graphics();
  window.roundBox = roundBox;
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
    if (e && e.preventDefault) {
      //非IE浏览器
      e.preventDefault();
    } else {
      //IE浏览器(IE11以下)
      window.event.returnValue = false;
    }

    clearTimeout(timer);
    timer = setTimeout(() => { // 单击事件
      clickTimes = 0;

      // 单击事件
      handleClick(id);

    }, 200);
    clickTimes++;

    if (clickTimes == 2) { // 双击
      clearTimeout(timer);
      clickTimes = 0;
      toggleExpanded(id);
    }
  }


  return roundBox;
}

export const drawCircleCurve = (x, y, r) => {
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