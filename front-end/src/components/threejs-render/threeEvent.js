import * as THREE from "three";
import * as d3 from "d3";
import DragControls from 'three-dragcontrols';
import TransformControls from 'three-transformcontrols'
import TrackballControls from 'three-trackballcontrols'
import {
    useGlobalStates,
    modifyGlobalStates,
} from "../../store/global-states";
import { GlobalStatesModificationType } from "../../store/global-states.type";
import {
    modifyProcessedGraph,
    ProcessedGraphModificationType,
} from "../../store/processedGraph";

let dbClickTime = new Date().getTime();
let update = 0;
export class Event {
    mouse = new THREE.Vector2()
    raycaster = new THREE.Raycaster();
    selectObject = null
    constructor(props) {
        this.camera = props.camera;
        this.scene = props.scene;
        this.renderer = props.renderer;
        this.width = props.width;
        this.height = props.height;
        this.objects = props.objects;
        this.mouseDoubleClickHandle = this.mouseDoubleClickHandle.bind(this);
        this.getIntersects = this.getIntersects.bind(this);
        this.mouseZoom = this.mouseZoom.bind(this);
    }

    mouseDoubleClickHandle(event) {
        const func = () => {
            let { object, id } = this.getIntersects(event)
            if (object) {
                console.log("clicked: " + id)
                modifyGlobalStates(
                    GlobalStatesModificationType.SET_SELECTEDNODE,
                    id
                );
                modifyProcessedGraph(ProcessedGraphModificationType.TOGGLE_EXPANDED, {
                    nodeId: id,
                });
            }
        }
        const maxTime = 10;
        //防抖动
        const lastClickTime = dbClickTime;
        const currentClickTime = new Date().getTime();
        dbClickTime = currentClickTime;
        if (currentClickTime - lastClickTime < 2) { //时间间隔有效，则覆盖上一次点击
            clearTimeout(update);
            update = setTimeout(func, maxTime);
        } else { //第一次点击，通常无效，因为至少会抖动一次
            update = setTimeout(func, maxTime);
        }
    }

    getIntersects(event) {
        event.preventDefault()
        this.mouse.x = (event.offsetX / this.width) * 2 - 1;
        this.mouse.y = -(event.offsetY / this.height) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        let intersects = this.raycaster.intersectObjects(this.scene.children, true);
        let select = null;
        //intersects[0]是"texture"，所以跳过
        for (let i = 1; i < intersects.length; i++) {
            if (intersects[i].object.name.split(" ")[1] === "rect") {
                if ((select === null) || (Math.abs(intersects[i].object.geometry.parameters.shapes.currentPoint.width) < Math.abs(select.geometry.parameters.shapes.currentPoint.width) && Math.abs(intersects[i].object.geometry.parameters.shapes.currentPoint.height) < Math.abs(select.geometry.parameters.shapes.currentPoint.height))) {
                    select = intersects[i].object;
                }
            }
        }
        return { object: select, id: select === null ? "null" : select.name.split(" ")[0] };
    }

    mouseZoom(event) {
        if (event.deltaY < 0) {
            this.camera.zoom *= 1.2;
        } else {
            this.camera.zoom /= 1.2;
        }
        this.camera.updateProjectionMatrix();
        this.renderer.render(this.scene, this.camera);
    }

    d3Zoom = d3.zoom()
        .scaleExtent([10, 300])
        .on('zoom', () => {
            //仅处理panning事件
            const event = d3.event;
            let camera = this.camera;
            if (event.sourceEvent) {
                const { movementX, movementY } = event.sourceEvent;
                // Adjust mouse movement by current scale and set camera
                let current_scale = this.camera.zoom;
                camera.position.set(camera.position.x - movementX / current_scale, camera.position.y +
                    movementY / current_scale, camera.position.z);
                this.camera.updateProjectionMatrix();
                this.renderer.render(this.scene, this.camera);
            }
        });

}