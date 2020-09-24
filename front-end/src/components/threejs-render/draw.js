import * as THREE from "three";
import { line } from "d3";


let addArrow = function(from, to) {
    let direction = to.clone().sub(from);
    let length = direction.length();
    let arrowHelper = new THREE.ArrowHelper(direction.normalize(), to, 1, 0x333333, 10, 10);
    arrowHelper.renderOrder = 100
    return arrowHelper
}

let addLine = function(data) {
    let material = new THREE.LineBasicMaterial({ color: 0x333333 });
    let points = [];
    for (let i = 0; i < data.length; i++) {
        points.push(new THREE.Vector3(data[i].x, data[i].y, 0));
    }
    let geometry = new THREE.BufferGeometry().setFromPoints(points);
    let line = new THREE.Line(geometry, material);
    return line
}

let addText = function(texts, size, canvasWidth, canvasHeight) {
    let canvas = document.createElement("canvas");
    let context = canvas.getContext("2d");
    canvas.width = canvasWidth * 5;
    canvas.height = canvasHeight * 5;
    context.font = `normal ${size}px Arial`;

    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "black";
    texts.forEach(text => {
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

let addRect = function(width, height, x, y, id) {
    let shape = new THREE.Shape();
    shape.absarc(0.5 * width - 0.125 * height, 0.375 * height, 0.125 * height, 0 / 180 * Math.PI, 90 / 180 * Math.PI, false);
    shape.absarc(0.125 * height - 0.5 * width, 0.375 * height, 0.125 * height, 90 / 180 * Math.PI, 180 / 180 * Math.PI, false);
    shape.absarc(0.125 * height - 0.5 * width, (-0.375) * height, 0.125 * height, 180 / 180 * Math.PI, 270 / 180 * Math.PI, false);
    shape.absarc(0.5 * width - 0.125 * height, (-0.375) * height, 0.125 * height, 270 / 180 * Math.PI, 360 / 180 * Math.PI, false);
    //shape.lineTo(0,0); 
    let geometry = new THREE.ShapeGeometry(shape)
    let material = new THREE.MeshBasicMaterial({ color: 0xffffff })
    let rect = new THREE.Mesh(geometry, material)
    rect.name = `${id} rect`
    rect.position.set(x, y, 0)

    let edges = new THREE.EdgesGeometry(geometry);
    let line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x333333 }));
    line.position.set(x, y, 0)
    line.name = `${id} edge`
    line.renderOrder = 1
    rect.renderOrder = 0
    let group = new THREE.Group();
    group.add(line);
    group.add(rect);
    return group
}

let addRoundRect = function(width, height, x, y, id) {

    let geometry = new THREE.PlaneGeometry(width, height)
    let material = new THREE.MeshBasicMaterial({ color: 0xffffff })
    let circle = new THREE.Mesh(geometry, material)
    circle.name = `${id} rect`
    circle.position.set(x, y, 0)

    let edges = new THREE.EdgesGeometry(geometry);
    let line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x333333 }));
    line.position.set(x, y, 0)
    line.name = `${id} edge`
    line.renderOrder = 1
    circle.renderOrder = 0
    let group = new THREE.Group();
    group.add(line);
    group.add(circle);
    return group
}
let addElippseCurve = function(width, height, x, y) {
    var material = new THREE.LineBasicMaterial({ color: 0x000000, opacity: 1 });
    var ellipse = new THREE.EllipseCurve(0, 0, width, height, 0, 2.0 * Math.PI, false);
    var ellipsePath = new THREE.CurvePath();
    ellipsePath.add(ellipse);
    var ellipseGeometry = ellipsePath.createPointsGeometry(100);
    ellipseGeometry.computeTangents();
    var ellipsex = new THREE.Line(ellipseGeometry, material);
    ellipsex.position.set(x, y, 0);
    ellipsex.name = "aaa"
    return ellipsex
}


export { addArrow, addLine, addText, addRect, addRoundRect, addElippseCurve };