import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {set_page} from './c_app.js';
//import {set_page, gui, stats} from './c_app.js';

let $canvas, scene, camera, renderer, orbitControls;
const wrapCanvasElement = document.querySelector('.wrap_canvas');

let alight;
let dlight1;
let dlight2;
let dlight3;
let dlight4;
let dlight5;  

export function detail() { //app.js에서 호출됨, 이 파일의 시작점
  init(); 
  loadModel();  
  eventListener();
  //render();
}

function disposeScene(scene) {  
  let remove_targets = [];
  // scene의 모든 하위 객체 순회
  scene.traverse((object) => {      
      if (object.geometry) {
          object.geometry.dispose();
      }      
      if (object.material) {
          if (Array.isArray(object.material)) {
              object.material.forEach((material) => {
                  disposeMaterial(material);
              });
          } else {
              disposeMaterial(object.material);
          }
      }

      if(object instanceof THREE.Object3D){            
          remove_targets.push(object);
      }        
  });       

  remove_targets.forEach(function(target){
      scene.remove(target);
  });
}

function disposeMaterial(material) {
  for (const key in material) {
      if (material[key] && material[key].isTexture) {
          material[key].dispose();  // 각 텍스처 해제
      }
  }
  material.dispose(); // Material 자체 해제
}

function reset(){  
  $canvas = null;
  //scene = null;
  camera = null;
  renderer = null;
  orbitControls = null;
  alight = null;
  dlight1 = null;
  dlight2 = null;
  dlight3 = null;
  dlight4 = null;
  dlight5 = null;  

  document.body.style.cursor = 'default';
  
  Array.from(wrapCanvasElement.children).forEach(child => {
  if (child.id !== 'canvas') {
      child.style.display = 'none';
      }
  });

  if(renderer){
    renderer.clear();
    renderer.dispose(); //WebGL 리소스 해제    
  }

  if(scene){        
    disposeScene(scene);    // texture, geometry, material dispose하여 메모리 해제           
  }
}

/* let camera_position_x; 
let camera_position_y;
let camera_position_z;
let camera_rotation_x;
let camera_rotation_y;
let camera_rotation_z;
let orbitControls_target_x;
let orbitControls_target_y;
let orbitControls_target_z; */

function init() {  
  reset();

  if(renderer){
    renderer.clear();
    renderer.dispose(); //WebGL 리소스 해제
  }
    
  $canvas = document.querySelector("#canvas");  
      
  // SCENE
  scene = new THREE.Scene();

  // CAMERA
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 3, 6);
  camera.zoom = 1;
  //camera.lookAt(0, 0, 0);  

  // RENDERER
  renderer = new THREE.WebGLRenderer({
      canvas: $canvas,
      antialias: true,
      alpha:true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
  renderer.toneMapping = THREE.LinearToneMapping;
  renderer.toneMappingExposure = 1.0;  

  // CAMERA CONTROLS
  orbitControls = new OrbitControls(camera, $canvas);
  orbitControls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      RIGHT: THREE.MOUSE.PAN
  };      
  orbitControls.enableDamping = true;
  orbitControls.minDistance = 3.5;  // 줌 인 제한 (카메라와의 최소 거리)
  orbitControls.maxDistance = 10; // 줌 아웃 제한 (카메라와의 최대 거리)
  orbitControls.maxPolarAngle = Math.PI / 2;   
  orbitControls.target.set(0,0,0);
  //orbitControls.update();  
  orbitControls.saveState();
  orbitControls.addEventListener('change', () => {    
    /* camera_position_x.updateDisplay(); 
    camera_position_y.updateDisplay();
    camera_position_z.updateDisplay();
    camera_rotation_x.updateDisplay();
    camera_rotation_y.updateDisplay();
    camera_rotation_z.updateDisplay();
    orbitControls_target_x.updateDisplay();
    orbitControls_target_y.updateDisplay();
    orbitControls_target_z.updateDisplay(); */
  });

  alight = new THREE.AmbientLight( 0xffffff, 1);
  scene.add( alight );
  
  dlight1 = new THREE.DirectionalLight(0xffffff, 4);
  dlight1.position.set(0, 5, 0);    
  
  dlight2 = new THREE.DirectionalLight(0xffffff, 1);
  dlight2.position.set(-1, -1, -1);    
  
  dlight3 = new THREE.DirectionalLight(0xffffff, 1);
  dlight3.position.set(1, -1, 1);
  
  dlight4 = new THREE.DirectionalLight(0xffffff, 1);
  dlight4.position.set(-1, -1, 1);    
  
  dlight5 = new THREE.DirectionalLight(0xffffff, 1);
  dlight5.position.set(1, -1, -1);  
  
  // light helper
  /* const dlightHelper1 = new THREE.DirectionalLightHelper(dlight1);
  scene.add(dlightHelper1);
  const dlightHelper2 = new THREE.DirectionalLightHelper(dlight2);
  scene.add(dlightHelper2);
  const dlightHelper3 = new THREE.DirectionalLightHelper(dlight3);
  scene.add(dlightHelper3);
  const dlightHelper4 = new THREE.DirectionalLightHelper(dlight4);
  scene.add(dlightHelper4);
  const dlightHelper5 = new THREE.DirectionalLightHelper(dlight5);
  scene.add(dlightHelper5); */

  /* const folder_camera_position = gui.addFolder("camera position");
  camera_position_x = folder_camera_position.add(camera.position, "x", -10, 10).onChange((value) => {     
    orbitControls.update();    
  });
  camera_position_y = folder_camera_position.add(camera.position, "y", 0.1, 7).onChange((value) => {    
    orbitControls.update();
  });
  camera_position_z = folder_camera_position.add(camera.position, "z", -10, 10).onChange((value) => {    
    orbitControls.update();
  });

  const folder_camera_rotation = gui.addFolder('camera rotation');
  camera_rotation_x = folder_camera_rotation.add(camera.rotation, 'x', -Math.PI, Math.PI, 0.01);
  camera_rotation_y = folder_camera_rotation.add(camera.rotation, 'y', -Math.PI, Math.PI, 0.01);
  camera_rotation_z = folder_camera_rotation.add(camera.rotation, 'z', -Math.PI, Math.PI, 0.01);

  const folder_panning = gui.addFolder('Panning');
  orbitControls_target_x = folder_panning.add(orbitControls.target, 'x', -20, 20).name('Pan X').onChange(() => orbitControls.update());
  orbitControls_target_y = folder_panning.add(orbitControls.target, 'y', -20, 20).name('Pan Y').onChange(() => orbitControls.update());
  orbitControls_target_z = folder_panning.add(orbitControls.target, 'z', -20, 20).name('Pan Z').onChange(() => orbitControls.update());

  const folder_dashboard_light1 = gui.addFolder('dlight1');
  folder_dashboard_light1.add(dlight1.position, 'x', -100, 100);
  folder_dashboard_light1.add(dlight1.position, 'y', -100, 100);
  folder_dashboard_light1.add(dlight1.position, 'z', -100, 100);
  folder_dashboard_light1.addColor({ color: dlight1.color.getHex() }, 'color').onChange((value) => {
    dlight1.color.setHex(value);
  });
  folder_dashboard_light1.add(dlight1, 'intensity', 0, 50, 0.1);
  folder_dashboard_light1.close();

  const folder_dashboard_light2 = gui.addFolder('dlight2');
  folder_dashboard_light2.add(dlight2.position, 'x', -100, 100);
  folder_dashboard_light2.add(dlight2.position, 'y', -100, 100);
  folder_dashboard_light2.add(dlight2.position, 'z', -100, 100);
  folder_dashboard_light2.addColor({ color: dlight2.color.getHex() }, 'color').onChange((value) => {
    dlight2.color.setHex(value);
  });
  folder_dashboard_light2.add(dlight2, 'intensity', 0, 50, 0.1);
  folder_dashboard_light2.close();

  const folder_dashboard_light3 = gui.addFolder('dlight3');
  folder_dashboard_light3.add(dlight3.position, 'x', -100, 100);
  folder_dashboard_light3.add(dlight3.position, 'y', -100, 100);
  folder_dashboard_light3.add(dlight3.position, 'z', -100, 100); 
  folder_dashboard_light3.addColor({ color: dlight3.color.getHex() }, 'color').onChange((value) => {
    dlight3.color.setHex(value);
  });
  folder_dashboard_light3.add(dlight3, 'intensity', 0, 50, 0.1);
  folder_dashboard_light3.close();

  const folder_dashboard_light4 = gui.addFolder('dlight4');
  folder_dashboard_light4.add(dlight4.position, 'x', -100, 100);
  folder_dashboard_light4.add(dlight4.position, 'y', -100, 100);
  folder_dashboard_light4.add(dlight4.position, 'z', -100, 100);
  folder_dashboard_light4.addColor({ color: dlight4.color.getHex() }, 'color').onChange((value) => {
    dlight4.color.setHex(value);
  });
  folder_dashboard_light4.add(dlight4, 'intensity', 0, 50, 0.1);
  folder_dashboard_light4.close();

  const folder_dashboard_light5 = gui.addFolder('dlight5');
  folder_dashboard_light5.add(dlight5.position, 'x', -100, 100);
  folder_dashboard_light5.add(dlight5.position, 'y', -100, 100);
  folder_dashboard_light5.add(dlight5.position, 'z', -100, 100); 
  folder_dashboard_light5.addColor({ color: dlight5.color.getHex() }, 'color').onChange((value) => {
    dlight5.color.setHex(value);
  });
  folder_dashboard_light5.add(dlight5, 'intensity', 0, 50, 0.1);
  folder_dashboard_light5.close(); */
}

async function loadModel() {
  const hash = window.location.hash; // '#object?type=FanWallUnit'
  const queryString = hash.split('?')[1]; // 'type=FanWallUnit'
  const urlParams = new URLSearchParams(queryString);
  const typeValue = urlParams.get('type'); // 'FanWallUnit'    

  const gltfLoader = new GLTFLoader();
  const promises = [
    gltfLoader.loadAsync(`./resources/models_test/${typeValue}.glb`),
  ];
  
  const [...load_model] = await Promise.all(promises);

  // model이 모두 로드 된 후 할 일  
  const model = load_model[0].scene.children[0];
  scene.add(model); 
  
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box.getSize(size);

  orbitControls.target.set(0,size.y/2,0); // 일반 모델들은 배치 때문에 중심점이 아래에 있었다.
  //orbitControls.update(); 

  if(typeValue === '8Userver'){
    model.scale.set(4,4,4);
    camera.position.set(0, 2.36218, 4.64268);
    camera.rotation.set(-0.4392, 0, 0);
    orbitControls.target.set(0, 0.18052, 0);

    dlight1 = new THREE.DirectionalLight(0xffffff, 4);
    dlight1.position.set(0, 5, 0);        
    dlight2 = new THREE.DirectionalLight(0xffffff, 1);
    dlight2.position.set(-1, -1, -1); 
    dlight3 = new THREE.DirectionalLight(0xffffff, 1);
    dlight3.position.set(1, -1, 1);
    dlight4 = new THREE.DirectionalLight(0xffffff, 1);
    dlight4.position.set(-1, -1, 1);
    dlight5 = new THREE.DirectionalLight(0xffffff, 1);
    dlight5.position.set(1, -1, -1);
  }else if(typeValue === 'ImmersionCooling'){
    dlight1 = new THREE.DirectionalLight(0xcccccc, 2);
    dlight1.position.set(0, 1, 0);        
    dlight2 = new THREE.DirectionalLight(0xffffff, 0);
    dlight2.position.set(0, 0, 0); 
    dlight3 = new THREE.DirectionalLight(0xffffff, 0);
    dlight3.position.set(0, 0, 0);
    dlight4 = new THREE.DirectionalLight(0xffffff, 0);
    dlight4.position.set(0, 0, 0);
    dlight5 = new THREE.DirectionalLight(0xffffff, 0);
    dlight5.position.set(0, 0, 0);

    camera.position.set(1.9781, 2.3003, 2.6565);
    camera.rotation.set(-0.402, 0.6006, 0.2361);
    orbitControls.target.set(0, 1.1692, 0);
    //orbitControls.update(); 
  }else if(typeValue === 'FanWallUnit'){    
    dlight1 = new THREE.DirectionalLight('0xffffff', 4);
    dlight1.position.set(0, 5, 0);        
    dlight2 = new THREE.DirectionalLight(0x7aadff, 1);
    dlight2.position.set(-1, -1, -1); 
    dlight3 = new THREE.DirectionalLight(0xc7c9ff, 1);
    dlight3.position.set(1, -1, 1);
    dlight4 = new THREE.DirectionalLight(0x1b1c1d, 25.1);
    dlight4.position.set(-1, -1, 1);
    dlight5 = new THREE.DirectionalLight(0x3f3f46, 1);
    dlight5.position.set(1, -1, -1);    

    camera.position.set(3.7713, 3.9680, 2.9476);
    camera.rotation.set(-0.626, 0.7473, 0.4570);
    orbitControls.target.set(0.4, 1.8350, 0);
    //orbitControls.update(); 
  }
  scene.add(dlight1);
  scene.add(dlight2);
  scene.add(dlight3);
  scene.add(dlight4);
  scene.add(dlight5);

  renderer.setAnimationLoop(detailAnimation);   // 모델 로드가 끝난 후 렌더링  
  orbitControls.update();
}

function detailAnimation() {    
  //renderer.setAnimationLoop(detailAnimation);

  //orbitControls.update();
  renderer.render(scene, camera);  
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
    
  // 렌더러 크기 갱신
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);  
}

function eventListener() {
    window.addEventListener('resize', onWindowResize, false);    
}

export function stopAnimation_detail() {
  if(renderer){
    renderer.setAnimationLoop(null); // 애니메이션 중지
  }    
}
