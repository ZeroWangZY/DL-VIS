import React, { Component } from "react";
import * as THREE from "three";
import {LayoutGraph} from '../../types/layoutGraphForRender'

interface  GraphProps {
    renderData: LayoutGraph;
}
// interface  GraphState {
//    
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
        this.sceneSetup();
        this.addSceneLines();
        this.addSceneRect();
        this.renderer.render( this.scene, this.camera );
    }
    sceneSetup(){
        const width = this.el.current.clientWidth
        const height = this.el.current.clientHeight;
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(0, width, height, 0, 1, 1000)
        this.camera.position.z = 5
       // this.camera.position.set( 0, 0, 100 );
      //  this.camera.lookAt( 0, 0, 0 );
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(width, height );
        this.renderer.setClearColor('rgb(255,255,255)',1.0)
        this.el.current.appendChild( this.renderer.domElement );
    }
    addSceneLines(){
         this.props.renderData.dispalyedEdges.forEach((link) => {
            let data = link.points
            let material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
            let points = [];
            for(let i=0; i<data.length; i++){
                points.push( new THREE.Vector3( data[i].x, data[i].y, 0 ) );
            }
            let geometry = new THREE.BufferGeometry().setFromPoints( points );
            let line = new THREE.Line( geometry, material );
            line.renderOrder = 2
            this.scene.add( line );
        })
    }
    addSceneRect(){
        this.props.renderData.displayedNodes.forEach((node) => {
            let geometry = new THREE.PlaneGeometry(node.size.width, node.size.height)
            let material = new THREE.MeshBasicMaterial({ color: 0xF2F2F2})
            let circle = new THREE.Mesh(geometry, material)
            circle.position.set(node.point.x, node.point.y, 0)

            let edges = new THREE.EdgesGeometry( geometry );
            let line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0x00000 } ) );
            line.position.set(node.point.x, node.point.y, 0)
            line.renderOrder = 1
            circle.renderOrder = 0
            this.scene.add( line );          
            this.scene.add(circle)
        })
    }
    render() {
        console.log(this.props.renderData)
        return <div style={{width:'100%',height:'100%'}} ref={this.el} />;
      }
}