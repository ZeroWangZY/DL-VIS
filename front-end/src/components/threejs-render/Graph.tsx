import React, { Component } from "react";
import * as THREE from "three";
import { Event }from './threeEvent.js'
import {LayoutGraph, DisplayedEdge, DisplayedNode, Coordinate} from '../../types/layoutGraphForRender'
import  { addArrow, addLine, addText, addRect }  from './draw'
import { clearThree, coordinateTransform } from './ulit'
interface  GraphProps {
    renderData: LayoutGraph;
    clickEvent: (object: any) => void;
}
// interface  GraphState {
// }
export class Graph extends Component<GraphProps> {
    private el: React.RefObject<HTMLDivElement>
    private scene: any
    private renderer: any
    private camera: any
    private event: any
    renderGraphData: any;
    // displayedNodes: DisplayedNode[]
    // dispalyedEdges: DisplayedEdge[]
    constructor(props) {
        super(props);
        this.el = React.createRef();
        this.sceneSetup = this.sceneSetup.bind(this);
        this.addSceneLines = this.addSceneLines.bind(this);
        this.addSceneRect = this.addSceneRect.bind(this);
        this.addSceneLabel = this.addSceneLabel.bind(this);
    }
    componentDidMount(){
        this.renderGraphData = coordinateTransform(this.props.renderData, this.el.current.clientHeight)
        this.sceneSetup();
        this.addSceneLines();
        this.addSceneRect();
         this.addSceneLabel()
        this.event = new Event({
            camera: this.camera, 
            scene: this.scene, 
            renderer: this.renderer,
            width: this.el.current.clientWidth, 
            height: this.el.current.clientHeight
        })
        this.el.current.addEventListener( 'click', (event)=>{
            let clickObject = this.event.mouseClickHandle(event)
            clickObject&&this.props.clickEvent(clickObject)
        }, true );
        this.el.current.addEventListener( 'mousemove', this.event.mouseOverHandle, true );
        this.renderer.render( this.scene, this.camera );
    }
    componentDidUpdate(){ 
        clearThree(this.scene)
        this.renderGraphData = coordinateTransform(this.props.renderData, this.el.current.clientHeight)
        this.addSceneLines();
        this.addSceneRect();
         this.addSceneLabel()
        this.renderer.render( this.scene, this.camera );
    }
    componentWillUnmount() {
        document.removeEventListener('click', this.event.mouseClickHandle);
        document.removeEventListener('mousemove', this.event.mouseOverHandle);
    }
    sceneSetup(){
        const width = this.el.current.clientWidth
        const height = this.el.current.clientHeight;
        const margin = 10
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-margin, width-margin, height+margin , margin, 1, 1000)
        this.camera.position.z = 5

        this.renderer = new THREE.WebGLRenderer({
            //  alpha: true,
             antialias: true,
            // clearColor: 0xffffff
         });
        this.renderer.setSize(width, height );
        this.renderer.setClearColor('rgb(255,255,255)',1.0)
        this.el.current.appendChild( this.renderer.domElement );
    }
    addSceneLines(){
         this.renderGraphData.dispalyedEdges.forEach((link) => {
            let line = addLine(link.points)
            line.renderOrder = 2
            this.scene.add( line );
            //add arrow
            let from = new THREE.Vector3( link.points[link.points.length - 2].x, link.points[link.points.length - 2].y, 0 )
            let to = new THREE.Vector3( link.points[link.points.length - 1].x, link.points[link.points.length - 1].y, 0 )
            let arrow = addArrow(from, to)
            this.scene.add( arrow );
        })
    }
    addSceneRect(){
        this.renderGraphData.displayedNodes.forEach((node) => {
            let rect = addRect(node.size.width, node.size.height, node.point.x, node.point.y,node.nodeId)
            this.scene.add(rect)
        })
    }
    addSceneLabel(){
        let texts = this.renderGraphData.displayedNodes.map(node => {
            return {
                label: this.props.renderData.nodeMap[node.nodeId].displayedName,
                point:node.point
            }
        });
        let label = addText(texts,75,this.el.current.clientWidth,this.el.current.clientHeight)
        this.scene.add( label ); 
    } 
    render() {
        return <div className='render-graph' ref={this.el} />;
      }
}