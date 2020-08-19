import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

class Threejs extends React.Component {
    componentDidMount() {
        this.init();
      }
    init = () => {
        // 创建一个场景，它将包含所有元素，如对象，相机和灯光。
        let scene = new THREE.Scene();
    
        // 创建一个相机，定义我们能看到的位置。
        let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    
        // 创建渲染并设置大小和阴影。
        let renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(new THREE.Color(0xFFFFFF));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
     
        /** 创建立方体 */
        let cubeGeometry = new THREE.BoxGeometry(4, 4, 4)
        let cubeMaterial = new THREE.MeshLambertMaterial({
          color: 0xFF0000
        });
        let cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.castShadow = true;
    
        /** 定义立方体的位置 */
        cube.position.x = -4;
        cube.position.y = 10;
        cube.position.z = 0;
    
        /** 定义球体 */
        let sphereGeometry = new THREE.SphereGeometry(4, 20, 20);
        let sphereMaterial = new THREE.MeshLambertMaterial({
          color: 0x7777ff
        })
        let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    
        /** 定义球体的位置 */
        sphere.position.x = 30;
        sphere.position.y = 4;
        sphere.position.z = -10;
        sphere.castShadow = true;
    
        /** 定义地平面 */
        let planeGeometry = new THREE.PlaneGeometry(60, 20);
        let planeMaterial = new THREE.MeshLambertMaterial({
          color: 0xAAAAAA
        });
        let plane = new THREE.Mesh(planeGeometry, planeMaterial);
        console.log(plane)
    
        /** 旋转定位地平面的位置 */
        plane.rotation.x = -0.5 * Math.PI;
        plane.position.set(15, 0, 0);
        plane.receiveShadow = true;



        var rectLength = 20, rectWidth = 4;

		var rectShape = new THREE.Shape();
		rectShape.moveTo( 0, 0 );
		rectShape.lineTo( 0, rectWidth );
		rectShape.lineTo( rectLength, rectWidth );
		rectShape.lineTo( rectLength, 0 );
		rectShape.lineTo( 0, 0 );
		var geometry2 = new THREE.ShapeGeometry( rectShape);
        var material2 = new THREE.MeshBasicMaterial( { color: 0xff0000, side: THREE.DoubleSide } );
        var mesh2 = new THREE.Mesh( geometry2, material2 ) ;
		


    
        /** 将物体添加到场景中 */
        scene.add(cube);
        scene.add(sphere);
        scene.add(plane);
        scene.add(mesh2);
        
    
        /** 摆放相机的位置 */
        camera.position.x = 0;
        camera.position.y = 0;
        camera.position.z = 30;
        camera.lookAt(scene.position);
    
        /** 为阴影添加聚光灯 */
        let spotLight = new THREE.SpotLight(0xFFFFFF);
        spotLight.position.set(-40, 40, -15);
        spotLight.castShadow = true;
        spotLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
        spotLight.shadow.camera.far = 130;
        spotLight.shadow.camera.near = 40;
    
       
    
        scene.add(spotLight);
    
        let ambienLight = new THREE.AmbientLight(0x353535);
        scene.add(ambienLight);
    
        // 将渲染器的输出添加到html元素
        document.getElementById("webgl-output").appendChild(renderer.domElement);
    
        // 调用渲染功能 
        renderer.render(scene, camera)
      }
    render() {
        return (
          <div id="webgl-output"></div>
        )
      }
}

export default Threejs