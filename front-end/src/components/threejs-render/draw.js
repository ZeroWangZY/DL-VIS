import * as THREE from "three";
import {
  line
} from "d3";


let addArrow = function (from, to) {
  let direction = to.clone().sub(from);
  let length = direction.length();
  let arrowHelper = new THREE.ArrowHelper(direction.normalize(), to, 1, 0x333333, 10, 10);
  arrowHelper.renderOrder = 100
  return arrowHelper
}

let addText = function (texts, canvasWidth, canvasHeight) {
  let canvas = document.createElement("canvas");
  let context = canvas.getContext("2d");
  canvas.width = canvasWidth * 5;
  canvas.height = canvasHeight * 5;

  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "black";
  texts.forEach(text => {
    context.font = `normal ${text.size}px Arial`;
    context.fillText(text.label, text.point.x * 5, canvas.height - text.point.y * 5);
  });

  let texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;

  let material = new THREE.MeshBasicMaterial({
    map: texture,
    // color: 0xff8c1a,
    transparent: true
  });

  let mesh = new THREE.Mesh(new THREE.PlaneGeometry(canvasWidth, canvasHeight), material);
  // mesh.overdraw = true;
  mesh.position.x = canvasWidth / 2;
  mesh.position.y = canvasHeight / 2;
  mesh.name = `texture`
  return mesh;
}

let addRoundLine = function (data) {
  const borderRadius = 5;
  const getCurve = (p0, p1, p2) => { //生成正交边转折处的圆弧
    let clockWise;
    let start = 0,
      end = 0;
    let rx = 0,
      ry = 0;
    let d11 = {
        x: p1.x,
        y: p1.y
      },
      d12 = {
        x: p1.x,
        y: p1.y
      };
    if (p1.y === p0.y) {
      if (p1.x > p0.x) {
        d11.x -= borderRadius;
        end = 0;
        if (p2.y > p1.y) {
          d12.y += borderRadius;
          start = -0.5 * Math.PI;
          clockWise = false;
        } else {
          d12.y -= borderRadius;
          start = 0.5 * Math.PI;
          clockWise = true;
        }
      } else {
        d11.x += borderRadius;
        end = Math.PI;
        if (p2.y > p1.y) {
          d12.y += borderRadius;
          start = -0.5 * Math.PI;
          clockWise = true;
        } else {
          d12.y -= borderRadius;
          start = 0.5 * Math.PI;
          clockWise = false;
        }
      }
      rx = d11.x;
      ry = d12.y
    } else {
      if (p1.y > p0.y) {
        d11.y -= borderRadius;
        end = 0.5 * Math.PI;
        if (p2.x > p1.x) {
          d12.x += borderRadius;
          start = Math.PI;
          clockWise = true;
        } else {
          d12.x -= borderRadius;
          start = 0;
          clockWise = false;
        }
      } else {
        d11.y += borderRadius;
        end = -0.5 * Math.PI;
        if (p2.x > p1.x) {
          d12.x += borderRadius;
          start = Math.PI;
          clockWise = false;
        } else {
          d12.x -= borderRadius;
          start = 0;
          clockWise = true;
        }
      }
      ry = d11.y
      rx = d12.x;
    }
    return {
      start,
      end,
      clockWise,
      d11,
      d12,
      rx,
      ry
    }
  }
  let material = new THREE.LineBasicMaterial({
    color: 0x333333
  });
  let points = []; //用于存放所有的线段端点和圆弧的采样点
  points.push(new THREE.Vector2(data[0].x, data[0].y)); //线段起点
  for (let i = 2; i < data.length; i++) {
    let p0 = data[i - 2],
      p1 = data[i - 1],
      p2 = data[i];
    let curve = getCurve(p0, p1, p2);

    let arc = new THREE.ArcCurve(curve.rx, curve.ry, borderRadius, curve.start, curve.end, curve.clockWise);
    let arcPoints = arc.getPoints(10);
    //将转角处点p1分裂为d11和d12，中间用圆弧相连
    points.push(new THREE.Vector2(curve.d11.x, curve.d11.y)); //圆弧起点
    points.push(...arcPoints);
    points.push(new THREE.Vector2(curve.d12.x, curve.d12.y)); //圆弧终点
  }
  points.push(new THREE.Vector2(data[data.length - 1].x, data[data.length - 1].y)); //线段终点
  let geometry = new THREE.BufferGeometry().setFromPoints(points);
  let line = new THREE.Line(geometry, material);
  return line;
}

let addRoundRect = function (width, height, x, y, id) {
  let shape = new THREE.Shape();
  const borderRadius = 5;
  shape.absarc(0.5 * width - borderRadius, 0.5 * height - borderRadius, borderRadius, 0 / 180 * Math.PI, 90 / 180 * Math.PI, false);
  shape.absarc(-0.5 * width + borderRadius, 0.5 * height - borderRadius, borderRadius, 90 / 180 * Math.PI, 180 / 180 * Math.PI, false);
  shape.absarc(-0.5 * width + borderRadius, -0.5 * height + borderRadius, borderRadius, 180 / 180 * Math.PI, 270 / 180 * Math.PI, false);
  shape.absarc(0.5 * width - borderRadius, -0.5 * height + borderRadius, borderRadius, 270 / 180 * Math.PI, 360 / 180 * Math.PI, false);
  let geometry = new THREE.ShapeGeometry(shape)
  let material = new THREE.MeshBasicMaterial({
    color: 0xffffff
  })
  let rect = new THREE.Mesh(geometry, material)
  rect.name = `${id} rect`
  rect.position.set(x, y, 0)

  let edges = new THREE.EdgesGeometry(geometry);
  let line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({
    color: 0x333333
  }));
  line.position.set(x, y, 0)
  line.name = `${id} edge`
  line.renderOrder = 1
  rect.renderOrder = 0
  let group = new THREE.Group();
  group.add(line);
  group.add(rect);
  return group
}

let addElippseCurve = function (width, height, x, y, dash) {
  let ellipse = new THREE.EllipseCurve(0, 0, width, height, 0, 2.0 * Math.PI, false);
  let ellipsePath = new THREE.CurvePath();
  ellipsePath.add(ellipse);
  let ellipseGeometry = ellipsePath.createPointsGeometry(100);
  ellipseGeometry.computeTangents();

  if (dash == false) {
    let material = new THREE.LineBasicMaterial({
      color: 0x000000,
      opacity: 1
    });
    let ellipsex = new THREE.Line(ellipseGeometry, material);
    ellipsex.position.set(x, y, 0);
    ellipsex.name = "aaa";
    return ellipsex;
  } else {
    let dashedMaterial = new THREE.LineDashedMaterial({
      color: 0xffffff,
      // dashSize: 3,
      gapSize: 0.1
    });
    let ellipsex = new THREE.Line(ellipseGeometry, dashedMaterial);
    ellipsex.position.set(x, y, 0);
    ellipsex.name = "aaa";
    return ellipsex;
  }
}

let addStackElippseCurve = function (width, height, x, y, dash) {
  let ellipse = new THREE.EllipseCurve(0, 0, width, height, 0, 2.0 * Math.PI, false);
  let ellipsePath = new THREE.CurvePath();
  ellipsePath.add(ellipse);

  let ellipseGeometry = ellipsePath.createPointsGeometry(100);
  ellipseGeometry.computeTangents();

  let material = new THREE.LineBasicMaterial({
    color: 0x000000,
    opacity: 1
  });
  let ellipsex = new THREE.Line(ellipseGeometry, material);
  ellipsex.position.set(x, y, 0);
  ellipsex.name = "aaa";
  return ellipsex;

}


export {
  addArrow,
  addRoundLine,
  addText,
  addRoundRect,
  addElippseCurve,
  addStackElippseCurve
};