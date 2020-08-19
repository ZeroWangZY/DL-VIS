import * as THREE from "three";
import DragControls from 'three-dragcontrols';
import TransformControls from 'three-transformcontrols'
import TrackballControls from 'three-trackballcontrols'

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
        this.objects = props.objects
        this.mouseClickHandle = this.mouseClickHandle.bind(this);
        this.mouseOverHandle = this.mouseOverHandle.bind(this);
        this.getIntersects = this.getIntersects.bind(this);
        this.mouseDragHandle = this.mouseDragHandle.bind(this);
        this.mouseZoom = this.mouseZoom.bind(this);
        this.mouseZoomout = this.mouseZoomout.bind(this);
        
    }
    mouseDragHandle(event){

        //var controls = new TrackballControls(this.camera,this.renderer.domElement);
        // 初始化拖拽控件
        //controls.panSpeed = 0.8;
        //controls.noPan = false;

        var transformControls = new TransformControls(this.camera, this.renderer.domElement);
        this.scene.add(transformControls);
    
        // 过滤不是 Mesh 的物体,例如辅助网格对象
        var objects = [];
        for (let i = 0; i < this.scene.children.length; i++) {
            
                objects.push(this.scene.children[i]);
            
        }
        //alert(this.objects.length);
        var dragControls = new DragControls(this.objects, this.camera, this.renderer.domElement);
            // 鼠标略过事件
        dragControls.addEventListener('hoveron', function (event) {
            // 让变换控件对象和选中的对象绑定
            transformControls.attach(event.object);
        });
        // 开始拖拽
        dragControls.addEventListener('dragstart', function (event) {
            
            transformControls.enabled = false;
        });
        // 拖拽结束
        dragControls.addEventListener('dragend', function (event) {
            transformControls.enabled = true;
        });

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

    mouseZoom(event){
        this.camera.zoom *= 1.2;  //双击放大
        this.camera.updateProjectionMatrix();
        this.renderer.render( this.scene, this.camera ); 
    }
    mouseZoomout(event){
        if(this.camera.zoom>1){
            this.camera.zoom /= 1.2;  
        }
        this.camera.updateProjectionMatrix();
        this.renderer.render( this.scene, this.camera ); 
    }
}