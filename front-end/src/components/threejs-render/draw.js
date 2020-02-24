import * as THREE from "three";


let addArrow = function(from, to){
    let direction = to.clone().sub(from);
    let length = direction.length();
    let arrowHelper = new THREE.ArrowHelper(direction.normalize(), to, 1, 0x333333,10,10 );
    arrowHelper.renderOrder = 100
    return arrowHelper
}

let addLine = function(data){
    let material = new THREE.LineBasicMaterial( { color: 0x333333 } );
    let points = [];
    for(let i=0; i<data.length; i++){
        points.push( new THREE.Vector3( data[i].x, data[i].y, 0 ) );
    }
    let geometry = new THREE.BufferGeometry().setFromPoints( points );
    let line = new THREE.Line( geometry, material );
    return line
}

let addText = function(texts,size,canvasWidth,canvasHeight){
    let canvas = document.createElement("canvas");
    let context = canvas.getContext("2d");
    canvas.width = canvasWidth*5;
    canvas.height = canvasHeight*5;
    context.font =`normal ${size}px Arial`;

    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "black";
    texts.forEach(text => {
         context.fillText(text.label, text.point.x*5, canvas.height - text.point.y*5);
    });

    let texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    let material = new THREE.MeshBasicMaterial({
        map : texture,
        // color: 0xff8c1a,
        transparent: true
    });

    let mesh = new THREE.Mesh(new THREE.PlaneGeometry(canvasWidth, canvasHeight), material);    
    // mesh.overdraw = true;
    mesh.position.x = canvasWidth / 2 ;
    mesh.position.y =canvasHeight / 2 ;
    mesh.name = `texture`
    return mesh;
}

let addRect  = function(width, height, x, y, id){
    let geometry = new THREE.PlaneGeometry(width, height)
    let material = new THREE.MeshBasicMaterial({ color: 0xffffff})
    let circle = new THREE.Mesh(geometry, material)
    circle.name = `${id} rect`
    circle.position.set(x, y, 0)

    let edges = new THREE.EdgesGeometry( geometry );
    let line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0x333333 } ) );
    line.position.set(x, y, 0)
    line.name = `${id} edge`
    line.renderOrder = 1
    circle.renderOrder = 0
    let group = new THREE.Group();
    group.add( line );
    group.add( circle );
    return group
}
export { addArrow, addLine, addText, addRect };