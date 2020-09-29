import * as THREE from "three";
import * as d3 from "d3";
import DragControls from 'three-dragcontrols';
import TransformControls from 'three-transformcontrols'
import TrackballControls from 'three-trackballcontrols'
import {
    useGlobalStates,
    modifyGlobalStates,
} from "../../store/global-states";
import {
    modifyProcessedGraph,
    ProcessedGraphModificationType,
} from "../../store/processedGraph";
export class Event {
    mouse = new THREE.Vector2()
    raycaster = new THREE.Raycaster();
    selectObject = null
    constructor(props) {
        this.camera = props.camera
        this.scene = props.scene
        this.renderer = props.renderer
        this.width = props.width
        this.height = props.height
        this.objects = props.objects
        this.mouseDoubleClickHandle = this.mouseDoubleClickHandle.bind(this);
        this.getIntersects = this.getIntersects.bind(this);
        this.mouseZoom = this.mouseZoom.bind(this);
    }

    mouseDoubleClickHandle(event) {
        let { object, id } = this.getIntersects(event)
        console.log("clicked")
        if (object) {
            modifyProcessedGraph(ProcessedGraphModificationType.TOGGLE_EXPANDED, {
                nodeId: id,
            });
            return object
        } else {
            return null
        }
    }

    getIntersects(event) {
        event.preventDefault()
        this.mouse.x = (event.offsetX / this.width) * 2 - 1;
        this.mouse.y = -(event.offsetY / this.height) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        let intersects = this.raycaster.intersectObjects(this.scene.children, true);
        let select = null;
        for (let i = 0; i < intersects.length; i++) {
            if (intersects[i].object.name.split(" ")[1] === "rect") {
                if ((select === null) || (intersects[i].object.geometry.parameters.width < select.geometry.parameters.width && intersects[i].object.geometry.parameters.height < select.geometry.parameters.height)) {
                    select = intersects[i].object;
                }
            }
        }
        return { object: select, id: select === null ? "" : select.name.split(" ")[0] };
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