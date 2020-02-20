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
        this.addCustomSceneObjects = this.addCustomSceneObjects.bind(this);
    }
    componentDidMount(){
        this.sceneSetup();
        this.addCustomSceneObjects();
    }
    sceneSetup(){
        const width = this.el.current.clientWidth
        const height = this.el.current.clientHeight;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
        75, 
        width / height, 
        0.1, 
        1000 
        );
        this.camera.position.set( 0, 0, 100 );
        this.camera.lookAt( 0, 0, 0 );
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(width, height );
        this.el.current.appendChild( this.renderer.domElement );
    }
    addCustomSceneObjects(){
    let material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
    let points = [];
    points.push( new THREE.Vector3( - 10, 0, 0 ) );
    points.push( new THREE.Vector3( 0, 10, 0 ) );
    points.push( new THREE.Vector3( 10, 0, 0 ) );
    
    let geometry = new THREE.BufferGeometry().setFromPoints( points );
    let line = new THREE.Line( geometry, material );
    this.scene.add( line );
    this.renderer.render( this.scene, this.camera );
    }
    render() {
        console.log(this.props.renderData)
        return <div style={{width:'100%',height:'100%'}} ref={this.el} />;
      }
}