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

    return mesh;
}

export { addArrow, addLine, addText };