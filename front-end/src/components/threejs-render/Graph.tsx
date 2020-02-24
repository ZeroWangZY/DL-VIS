import React, { Component } from "react";
import * as THREE from "three";
import { Event }from './threeEvent.js'
// import 'three-onevent'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import './onEvent'
import {LayoutGraph, DisplayedEdge, DisplayedNode, Coordinate} from '../../types/layoutGraphForRender'
import {RawEdge, NodeId, OperationNode, GroupNode, LayerNode, DataNode} from "../../types/processed-graph";
import  { addArrow, addLine, addText }  from './draw'
import { Function } from "@babel/types";
// import { Camera } from "three";
interface  GraphProps {
    renderData: LayoutGraph;
    clickEvent: (object: any) => void;
}
interface  GraphState {
    displayedNodes: DisplayedNode[]; //根据group的展开情况，当前显示的节点
    dispalyedEdges: DisplayedEdge[];
}
export class Graph extends Component<GraphProps, GraphState> {
    private el: React.RefObject<HTMLDivElement>
    private scene: any
    private renderer: any
    private camera: any
    private event: any
    displayedNodes: any
    dispalyedEdges: any
    constructor(props) {
        super(props);
        // this.state = {
        //     displayedNodes: [],
        //     dispalyedEdges: []
        // };
        // this.displayedNodes = [...this.props.renderData.displayedNodes]
        // this.dispalyedEdges = [...this.props.renderData.dispalyedEdges]
        this.el = React.createRef();
        this.sceneSetup = this.sceneSetup.bind(this);
        this.addSceneLines = this.addSceneLines.bind(this);
        this.addSceneRect = this.addSceneRect.bind(this);
        this.addSceneLabel = this.addSceneLabel.bind(this);
    }
    componentDidMount(){
        console.log('Didmount')
        this.coordinateTransform()
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
    componentDidUpdate(nextProps){ 
        console.log('UNSAFE_componentWillUpdate')
        this.clearThree(this.scene)
        // console.log(nextProps)
        // this.setState({
        //     displayedNodes: nextProps.renderData.displayedNodes,
        //     dispalyedEdges: nextProps.renderData.dispalyedEdges
        // })
        // console.log(this.scene)
        // this.renderer.renderLists.dispose();
        // console.log(this.scene)
        this.coordinateTransform()
        this.addSceneLines();
        this.addSceneRect();
         this.addSceneLabel()
        this.renderer.render( this.scene, this.camera );
    }
    componentWillUnmount() {
        document.removeEventListener('click', this.event.mouseClickHandle);
        document.removeEventListener('mousemove', this.event.mouseOverHandle);
    }
    coordinateTransform(){
        // console.log(this.props.renderData.displayedNodes[0])
        this.dispalyedEdges = this.props.renderData.dispalyedEdges.map((link) => {
            let points: Coordinate[] = []
            points = link.points.map(point => {
                return {
                    x: point.x,
                    y: this.el.current.clientHeight - point.y 
                }
            });
            return {
                points,
                label: link.label
            }
        })
        this.displayedNodes = this.props.renderData.displayedNodes.map((node) => 
        {
            return {
                nodeId: node.nodeId,
                point: { 
                    x: node.point.x,
                    y: this.el.current.clientHeight - node.point.y 
                },
                size: node.size
            }
        })
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
         this.dispalyedEdges.forEach((link) => {
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
        this.displayedNodes.forEach((node,i) => {
            let geometry = new THREE.PlaneGeometry(node.size.width, node.size.height)
            let material = new THREE.MeshBasicMaterial({ color: 0xffffff})
            let circle = new THREE.Mesh(geometry, material)
            circle.name = `${node.nodeId} rect`
            circle.position.set(node.point.x, node.point.y, 0)

            let edges = new THREE.EdgesGeometry( geometry );
            let line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0x333333 } ) );
            line.position.set(node.point.x, node.point.y, 0)
            line.name = `${node.nodeId} edge`
            line.renderOrder = 1
            circle.renderOrder = 0
            this.scene.add( line );          
            this.scene.add(circle)
        })
    }
    addSceneLabel(){
        let texts = this.displayedNodes.map(node => {
            return {
                label: this.props.renderData.nodeMap[node.nodeId].displayedName,
                point:node.point
            }
        });
        let label = addText(texts,75,this.el.current.clientWidth,this.el.current.clientHeight)
        label.name = `texture`
        // label.renderOrder = 0
        this.scene.add( label ); 
    }
    clearThree(obj){
        while(obj.children.length > 0){ 
          obj.remove(obj.children[0]);
        }
        if(obj.geometry) obj.geometry.dispose()
      
        if(obj.material){ 
          //in case of map, bumpMap, normalMap, envMap ...
          Object.keys(obj.material).forEach(prop => {
            if(!obj.material[prop])
              return         
            if(typeof obj.material[prop].dispose === 'function')                                  
              obj.material[prop].dispose()                                                        
          })
          obj.material.dispose()
        }
      }   
    render() {
        // console.log(this.props.renderData)
        return <div className='render-graph' ref={this.el} />;
      }
}