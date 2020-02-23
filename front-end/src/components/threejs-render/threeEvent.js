import * as THREE from "three";

export class Event{
    mouse = new THREE.Vector2()
    raycaster = new THREE.Raycaster();
    selectObject = null
    constructor(props) {
        this.camera = props.camera
        this.scene = props.scene
        this.renderer = props.renderer
        this.width = props.width
        this.height = props.height
        this.mouseClickHandle = this.mouseClickHandle.bind(this);
        this.mouseOverHandle = this.mouseOverHandle.bind(this);
        this.getIntersects = this.getIntersects.bind(this);
    }
    mouseClickHandle(event){
        let intersect = this.getIntersects(event)
        if(intersect){
            return intersect
        }else{
            return null
        }
    }
    getIntersects(event){
        event.preventDefault()
        this.mouse.x = (event.offsetX / this.width) * 2 -1
        this.mouse.y = - (event.offsetY / this.height) * 2 + 1
        this.raycaster.setFromCamera(this.mouse, this.camera)
        let intersects = this.raycaster.intersectObjects(this.scene.children, true)
        let select = null
        for(let i=0;i<intersects.length;i++){
            if(intersects[i].object.name.indexOf('rect')!=-1){
                if(select !== null&&intersects[i].object.geometry.parameters.width<select.geometry.parameters.width&&intersects[i].object.geometry.parameters.height<select.geometry.parameters.height){
                    select= intersects[i].object
                }else{
                    select = intersects[i].object
                }
            }
        }
        return select
    }
    mouseOverHandle(event){
        let intersect = this.getIntersects(event)
        if(intersect){
            if(this.selectObject){
                this.selectObject.material.color.set(0xffffff)
            }
            this.selectObject = intersect
            this.selectObject.material.color.set(0xefd8a9)
        }else{
            if(this.selectObject){
                this.selectObject.material.color.set(0xffffff)
            }
            this.selectObject = null
        }
        this.renderer.render( this.scene, this.camera );  
    }
}