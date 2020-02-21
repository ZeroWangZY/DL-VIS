import React, { Component } from "react";
import * as THREE from "three";
import {LayoutGraph} from '../../types/layoutGraphForRender'

interface  GraphProps {
    renderData: LayoutGraph;
}
// interface  GraphState {
   
// }
export class Graph extends Component<GraphProps> {
    private el: React.RefObject<HTMLDivElement>
    scene: any
    renderer: any
    camera: any
    constructor(props) {
        super(props);
        this.el = React.createRef();
        this.sceneSetup = this.sceneSetup.bind(this);
        this.addSceneLines = this.addSceneLines.bind(this);
        this.addSceneRect = this.addSceneRect.bind(this);
    }
    componentDidMount(){
        this.coordinateTransform()
        this.sceneSetup();
        this.addSceneLines();
         this.addSceneRect();
        this.renderer.render( this.scene, this.camera );
    }
    coordinateTransform(){
        this.props.renderData.dispalyedEdges.forEach((link) => {
            link.points.forEach(point => {
                point.y = this.el.current.clientHeight - point.y
            });
        })
        this.props.renderData.displayedNodes.forEach((node) => {
            node.point.y = this.el.current.clientHeight - node.point.y
        })
    }
    sceneSetup(){
        const width = this.el.current.clientWidth
        const height = this.el.current.clientHeight;
        console.log(width,height)
        const margin = 10
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-margin, width-margin, height+margin , margin, 1, 1000)
        this.camera.position.z = 5
       // this.camera.position.set( 0, 0, 100 );
      //  this.camera.lookAt( 0, 0, 0 );
        this.renderer = new THREE.WebGLRenderer({
             alpha: true,
             antialias: true,
            // clearColor: 0xffffff
         });
        this.renderer.setSize(width, height );
        this.renderer.setClearColor('rgb(255,255,255)',1.0)
        this.el.current.appendChild( this.renderer.domElement );
       // var controls=new THREE.OrbitControls(this.camera);//鼠标拖拽
    }
    addSceneLines(){
         this.props.renderData.dispalyedEdges.forEach((link) => {
            let data = link.points
            let material = new THREE.LineBasicMaterial( { color: 0x333333 } );
            let points = [];
            for(let i=0; i<data.length; i++){
                points.push( new THREE.Vector3( data[i].x, data[i].y, 0 ) );
            }
            let geometry = new THREE.BufferGeometry().setFromPoints( points );
            let line = new THREE.Line( geometry, material );
            line.renderOrder = 2
            this.scene.add( line );
            //add arrow
            let from = points[points.length-2]
            let to = points[points.length-1]
            let arrow = this.addArrow(from, to)
            this.scene.add( arrow );
        })
    }
    addSceneRect(){
        this.props.renderData.displayedNodes.forEach((node,i) => {
          //  node.point.x =  node.point.x*2
            let geometry = new THREE.PlaneGeometry(node.size.width, node.size.height)
            let material = new THREE.MeshBasicMaterial({ color: 0xF2F2F2})
            let circle = new THREE.Mesh(geometry, material)
            circle.position.set(node.point.x, node.point.y, 0)

            let edges = new THREE.EdgesGeometry( geometry );
            let line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0x333333 } ) );
            line.position.set(node.point.x, node.point.y, 0)
            line.renderOrder = 1
            circle.renderOrder = 0
            let label = this.createLabel(this.props.renderData.displayedNodes, this.props.renderData.nodeMap,75,this.el.current.clientWidth,this.el.current.clientHeight)
            this.scene.add( label ); 
            this.scene.add( line );          
            this.scene.add(circle)
        })
    }
    //可提出
    createLabel(nodes, nodemap,size, canvasWidth, canvasHeight){
        let canvas = document.createElement("canvas");
        let context = canvas.getContext("2d");
        canvas.width = canvasWidth*5;
        canvas.height = canvasHeight*5;
     //   context.fillStyle = 'rgba(255,255,255,0)';
        context.font =`normal ${size}px Arial`;

        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = "black";
        nodes.forEach(node => {
             context.fillText(nodemap[node.nodeId].displayedName, node.point.x*5, canvas.height - node.point.y*5);
        });

        let texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;

        let material = new THREE.MeshBasicMaterial({
            map : texture
        });

        let mesh = new THREE.Mesh(new THREE.PlaneGeometry(canvasWidth, canvasHeight), material);
       // mesh.overdraw = true;
        
        mesh.position.x = canvasWidth / 2 ;
        mesh.position.y =canvasHeight / 2 ;

        return mesh;
    }
    //可提出
    addArrow(from, to){
        let direction = to.clone().sub(from);
        let length = direction.length();
        let arrowHelper = new THREE.ArrowHelper(direction.normalize(), to, 1, 0x333333,10,10 );
        arrowHelper.renderOrder = 100
        return arrowHelper
    }
    render() {
        console.log(this.props.renderData)
        return <div className='render-graph' ref={this.el} />;
      }
}