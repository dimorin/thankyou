import * as THREE from "three";
import { MapControls } from "three/addons/controls/MapControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {set_page} from './c_app.js';
//import {set_page, gui, stats} from './c_app.js';

let $canvas, scene, camera, renderer, mapControls;
let load_models = [];           
let mixer, model, animations = [], activeAction, actions = {};
let clickedObject3D;
let intersect_targets = [];     // raycast 대상(외부 생산 에너지원)
let isIntersectedDC = false; // 현재 교차된 mesh가 DC에 속해 있는지 여부
let intersects;
let aspectRatio;
const frustumSize = 41;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();  
const clock = new THREE.Clock();
const wrapCanvasElement = document.querySelector('.wrap_canvas');

/* 에너지 흐름 가이드 */
let energyGuideGeometry;
const energyGuideMaterial = new THREE.LineBasicMaterial({ color: 'pink'});
let energyGuide;

let energy_info = {
    ai:{isAnimating:false, leds:[], lightPosition:0, numSpheres:0, total_segmentLength:0},
    pv:{isAnimating:false, leds:[], lightPosition:0, numSpheres:0, total_segmentLength:0},
    wind:{isAnimating:false, leds:[], lightPosition:0, numSpheres:0, total_segmentLength:0},
    ess:{isAnimating:false, leds:[], lightPosition:0, numSpheres:0, total_segmentLength:0},
    sofc:{isAnimating:false, leds:[], lightPosition:0, numSpheres:0, total_segmentLength:0},
    smr:{isAnimating:false, leds:[], lightPosition:0, numSpheres:0, total_segmentLength:0},
    grid:{isAnimating:false, leds:[], lightPosition:0, numSpheres:0, total_segmentLength:0},
    lng:{isAnimating:false, leds:[], lightPosition:0, numSpheres:0, total_segmentLength:0},
    lng_2:{isAnimating:false, leds:[], lightPosition:0, numSpheres:0, total_segmentLength:0},
};

const energy_coordinate = { // 외부 생산 에너지원 circuit 간격 4.55
    ai:[
        new THREE.Vector3(4.3, 0.1, 4.25),
        new THREE.Vector3(-10, 0.1, 4.25) 
    ],
    pv:[
        new THREE.Vector3(-4.8, 0.1, -10.95),
        new THREE.Vector3(-4.8, 0.1, -6.4),
        new THREE.Vector3(4.3, 0.1, -6.4),
        new THREE.Vector3(4.3, 0.1, 4.25),
        new THREE.Vector3(-10, 0.1, 4.25)  
    ],
    wind:[
        new THREE.Vector3(-0.25, 0.1, -10.95),
        new THREE.Vector3(-0.25, 0.1, -6.4),
        new THREE.Vector3(4.3, 0.1, -6.4),
        new THREE.Vector3(4.3, 0.1, 4.25),
        new THREE.Vector3(-10, 0.1, 4.25)  
    ],
    ess:[                
        new THREE.Vector3(4.3, 0.1, -10.95),
        new THREE.Vector3(4.3, 0.1, 4.25),
        new THREE.Vector3(-10, 0.1, 4.25)  
    ],
    sofc:[
        new THREE.Vector3(8.85, 0.1, -10.95),
        new THREE.Vector3(8.85, 0.1, -6.4),
        new THREE.Vector3(4.3, 0.1, -6.4),
        new THREE.Vector3(4.3, 0.1, 4.25),
        new THREE.Vector3(-10, 0.1, 4.25)  
    ],
    smr:[
        new THREE.Vector3(13.4, 0.1, -10.95),
        new THREE.Vector3(13.4, 0.1, -6.4),
        new THREE.Vector3(4.3, 0.1, -6.4),
        new THREE.Vector3(4.3, 0.1, 4.25),
        new THREE.Vector3(-10, 0.1, 4.25)  
    ],
    grid:[
        new THREE.Vector3(13.0, 0.1, 4.25),
        new THREE.Vector3(4.3, 0.1, 4.25) 
        //new THREE.Vector3(-10, 0.1, 4.25) 
    ],
    lng:[         
        new THREE.Vector3(4.3, 0.1, 13.3),
        new THREE.Vector3(4.3, 0.1, 4.25),
        new THREE.Vector3(-10, 0.1, 4.25)         
        
    ],    
    lng_2:[
        new THREE.Vector3(2.0, 0.1, 15.25),
        new THREE.Vector3(-15.4, 0.1, 15.25),
        new THREE.Vector3(-15.4, 0.1, 11.7)
    ]
};

/* LED 모양 에너지 */
const sphereSpacing = 0.4; // 간격
const energy_geometry = new THREE.PlaneGeometry(0.4, 0.4, 2, 2);
const energy_geometry_s = new THREE.PlaneGeometry(0.2, 0.2, 1, 1);
const energy_light = {
    ai:new THREE.Points(energy_geometry, new THREE.PointsMaterial({size:2, color:0x444455 })),
    pv:new THREE.Points(energy_geometry, new THREE.PointsMaterial({size:2, color:0x444455 })),
    wind:new THREE.Points(energy_geometry, new THREE.PointsMaterial({size:2, color:0x444455 })),
    ess:new THREE.Points(energy_geometry, new THREE.PointsMaterial({size:2, color:0x444455 })),
    sofc:new THREE.Points(energy_geometry, new THREE.PointsMaterial({size:2, color:0x444455 })),
    smr:new THREE.Points(energy_geometry, new THREE.PointsMaterial({size:2, color:0x444455 })),
    grid:new THREE.Points(energy_geometry, new THREE.PointsMaterial({size:2, color:0x444455 })),
    lng:new THREE.Points(energy_geometry, new THREE.PointsMaterial({size:2, color:0x444455 })),
    lng_2:new THREE.Points(energy_geometry_s, new THREE.PointsMaterial({size:2, color:0x444455 })),
};
energy_light.ai.rotation.x = -Math.PI / 2;
energy_light.pv.rotation.x = -Math.PI / 2;
energy_light.wind.rotation.x = -Math.PI / 2;
energy_light.ess.rotation.x = -Math.PI / 2;
energy_light.sofc.rotation.x = -Math.PI / 2;
energy_light.smr.rotation.x = -Math.PI / 2;
energy_light.grid.rotation.x = -Math.PI / 2;
energy_light.lng.rotation.x = -Math.PI / 2;
energy_light.lng_2.rotation.x = -Math.PI / 2;

/* DOM label */
let inner_source, outer_source, dc_source, tag_source;
const tempV_inner_source = new THREE.Vector3();
const tempV_outer_source = new THREE.Vector3();
const tempV_dc_source = new THREE.Vector3();
const tempV_tag_source = new THREE.Vector3();
const $elem_inner_source = document.querySelector('.tag_internal');
const $elem_outer_source = document.querySelector('.tag_external');
const $elem_dc_source = document.querySelector('.tag_data_center');
const $elem_lng_source = document.querySelector('.tag_lng');
let x_inner_source, y_inner_source;
let x_outer_source, y_outer_source;
let x_dc_source, y_dc_source;
let x_lng_source, y_lng_source;

/* render */
let ani_delta = 0;
let energy_currentTime = 0;
let energy_previousTime = 0;
let energy_loop_num = 0;

export function dashboard(){ //app.js에서 호출됨, 이 파일의 시작점
    init();    // 기본 환경 세팅     
    setFloorLabel();
    loadModel();    
    setDomLabel();
    eventListener();             
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
    mapControls = null;
    mixer = null;
    model = null;
    activeAction = null;
    clickedObject3D = null;
    intersects = null;
    aspectRatio = null;
    isIntersectedDC = false;
    energyGuideGeometry = null;
    energyGuide = null;
    inner_source = null;
    outer_source = null;
    dc_source = null;
    tag_source = null;
    x_inner_source = null;
    y_inner_source = null;
    x_outer_source = null;
    y_outer_source = null;
    x_dc_source = null;
    y_dc_source = null;
    x_lng_source = null;
    y_lng_source = null;
    ani_delta = 0;
    load_models = [];
    animations = [];
    actions = {};
    intersect_targets = [];    
    energy_info = {
        ai:{isAnimating:false, leds:[], lightPosition:0, numSpheres:0, total_segmentLength:0},
        pv:{isAnimating:false, leds:[], lightPosition:0, numSpheres:0, total_segmentLength:0},
        wind:{isAnimating:false, leds:[], lightPosition:0, numSpheres:0, total_segmentLength:0},
        ess:{isAnimating:false, leds:[], lightPosition:0, numSpheres:0, total_segmentLength:0},
        sofc:{isAnimating:false, leds:[], lightPosition:0, numSpheres:0, total_segmentLength:0},
        smr:{isAnimating:false, leds:[], lightPosition:0, numSpheres:0, total_segmentLength:0},
        grid:{isAnimating:false, leds:[], lightPosition:0, numSpheres:0, total_segmentLength:0},
        lng:{isAnimating:false, leds:[], lightPosition:0, numSpheres:0, total_segmentLength:0},
        lng_2:{isAnimating:false, leds:[], lightPosition:0, numSpheres:0, total_segmentLength:0},
    };
    energy_currentTime = 0;
    energy_previousTime = 0;
    energy_loop_num = 0;
    stopEnergy('ai');
    stopEnergy('pv');
    stopEnergy('wind');
    stopEnergy('ess');
    stopEnergy('sofc');
    stopEnergy('smr');
    stopEnergy('grid');
    stopEnergy('lng');
    stopEnergy('lng_2');
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

function init() {
    reset();
    
    $canvas = document.querySelector('#canvas');    

    // SCENE
    scene = new THREE.Scene();        
    
    // 화면 비율 설정
    aspectRatio = window.innerWidth / window.innerHeight;
    // CAMERA 생성 (OrthographicCamera)    
    camera = new THREE.OrthographicCamera(
        frustumSize * aspectRatio / -2, 
        frustumSize * aspectRatio / 2, 
        frustumSize / 2, 
        frustumSize / -2, 
        0.1, 
        1000
    );
    camera.position.set(-30, 30, 30);
    camera.lookAt(0, 0, 0); // 카메라가 바라보는 방향    

    // RENDERER
    renderer = new THREE.WebGLRenderer({
        canvas: $canvas,
        antialias: true,
        alpha:true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.toneMappingExposure = 1.2;

    // CAMERA CONTROLS
    mapControls = new MapControls(camera, $canvas);
    mapControls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        RIGHT: THREE.MOUSE.PAN
    };    
    //mapControls.enabled = true;
    mapControls.enableDamping = true;
    //mapControls.enablePan = false;
    //mapControls.enableRotate = false;
    //mapControls.enableZoom = false;
    mapControls.minZoom = 0.8;
    mapControls.maxZoom = 1.4;
    mapControls.maxPolarAngle = Math.PI / 2;   
    mapControls.target.set(1.5, 0, 0);
    //mapControls.update();  
    mapControls.saveState();    
    mapControls.addEventListener('change', function(){
        resetLabelPosition();
    });
    
    const alight = new THREE.AmbientLight( 0xffffff, 10); 
    scene.add( alight );
    const dlight1 = new THREE.DirectionalLight(0x636363, 50);
    dlight1.position.set(0, 0, 0);       
    scene.add(dlight1);
    const dlight2 = new THREE.DirectionalLight(0x636363, 50);
    dlight2.position.set(0.1, 0.1, 0.1);
    scene.add(dlight2);
    
    const dlight4 = new THREE.DirectionalLight(0x757575, 21);
    dlight4.position.set(0, 0, 0);    
    dlight4.target.position.set(16,0,3);
    scene.add(dlight4);

    const dlight5 = new THREE.DirectionalLight(0x7d7d7d, 50);
    dlight5.position.set(0, 1.2, 2);
    scene.add(dlight5);    
    
    // light helper
    //const dlightHelper1 = new THREE.DirectionalLightHelper(dlight1);
    //scene.add(dlightHelper1);
    //const dlightHelper2 = new THREE.DirectionalLightHelper(dlight2);
    //scene.add(dlightHelper2);
    
    const dlightHelper4 = new THREE.DirectionalLightHelper(dlight4);
    //scene.add(dlightHelper4);

    //const dlightHelper5 = new THREE.DirectionalLightHelper(dlight5);
    //scene.add(dlightHelper5);    
    
    /* const folder_dashboard_camera = gui.addFolder('dashboard camera');
    folder_dashboard_camera.add(camera.position, 'x', -100, 100);
    folder_dashboard_camera.add(camera.position, 'y', -100, 100);
    folder_dashboard_camera.add(camera.position, 'z', -100, 100); */
    
    /* const folder_dashboard_light0 = gui.addFolder('alight');   
    folder_dashboard_light0.addColor({ color: alight.color.getHex() }, 'color').onChange((value) => {
        alight.color.setHex(value);
    });
    folder_dashboard_light0.add(alight, 'intensity', 0, 50, 0.1); 
    folder_dashboard_light0.close(); */
    /* const folder_dashboard_light1 = gui.addFolder('dlight1');
    folder_dashboard_light1.add(dlight1.position, 'x', -500, 500);
    folder_dashboard_light1.add(dlight1.position, 'y', -500, 500);
    folder_dashboard_light1.add(dlight1.position, 'z', -500, 500);
    folder_dashboard_light1.onChange(function (value) {
        //console.log(value.property, value.value);
        //dlight1.target.position.set(0,0,0); 
    });
    folder_dashboard_light1.addColor({ color: dlight1.color.getHex() }, 'color').onChange((value) => {
        dlight1.color.setHex(value);
    });
    folder_dashboard_light1.add(dlight1, 'intensity', 0, 50, 0.1); 
    folder_dashboard_light1.close();
    const folder_dashboard_light2 = gui.addFolder('dlight2');
    folder_dashboard_light2.add(dlight2.position, 'x', -500, 500);
    folder_dashboard_light2.add(dlight2.position, 'y', -500, 500);
    folder_dashboard_light2.add(dlight2.position, 'z', -500, 500);
    folder_dashboard_light2.addColor({ color: dlight2.color.getHex() }, 'color').onChange((value) => {
        dlight2.color.setHex(value);
    });
    folder_dashboard_light2.add(dlight2, 'intensity', 0, 50, 0.1);
    folder_dashboard_light2.close();
    
    const folder_dashboard_light4 = gui.addFolder('dlight4');
    folder_dashboard_light4.add(dlight4.position, 'x', -500, 500);
    folder_dashboard_light4.add(dlight4.position, 'y', -500, 500);
    folder_dashboard_light4.add(dlight4.position, 'z', -500, 500);
    folder_dashboard_light4.addColor({ color: dlight4.color.getHex() }, 'color').onChange((value) => {
        dlight4.color.setHex(value);
    });
    folder_dashboard_light4.add(dlight4, 'intensity', 0, 50, 0.1);
    folder_dashboard_light4.close();
    
    const folder_dashboard_light5 = gui.addFolder('dlight5');
    folder_dashboard_light5.add(dlight5.position, 'x', -500, 500);
    folder_dashboard_light5.add(dlight5.position, 'y', -500, 500);
    folder_dashboard_light5.add(dlight5.position, 'z', -500, 500);
    folder_dashboard_light5.addColor({ color: dlight5.color.getHex() }, 'color').onChange((value) => {
        dlight5.color.setHex(value);
    });
    folder_dashboard_light5.add(dlight5, 'intensity', 0, 50, 0.1);
    folder_dashboard_light5.close(); */
     
    //scene.add(energy);        
}

function setDomLabel(){        
    $elem_inner_source.style.display = 'block';
    $elem_outer_source.style.display = 'block';
    $elem_dc_source.style.display = 'block';
    $elem_lng_source.style.display = 'block';

    inner_source = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1), new THREE.MeshBasicMaterial({ color:'white'}));
    outer_source = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1), new THREE.MeshBasicMaterial({ color:'white'}));
    dc_source = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1), new THREE.MeshBasicMaterial({ color:'white'}));
    tag_source = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1), new THREE.MeshBasicMaterial({ color:'white'}));

    inner_source.position.set(24,0,-1.0);
    outer_source.position.set(10,0,-17.0);
    dc_source.position.set(-20,1,9.0);
    tag_source.position.set(0.5,0,13);

    gsap.fromTo('.tag_external, .tag_internal, .tag_data_center, .tag_power', 
        {autoAlpha:0},
        {autoAlpha: 1, duration: 5}
    );
}

function createLabelTexture(textLines, fontSize, fontColor, lineInterval, length) {
    const canvas = document.createElement('canvas');    
    canvas.id = 'label';
    const context = canvas.getContext('2d');

    // Set canvas size and font style
    if(length === 'short'){
        canvas.width = 96;
        canvas.height = 48;  
    }else if(length === 'middle'){
        canvas.width = 240;
        canvas.height = 48; 
    }else if(length === 'dc'){
        canvas.width = 180;
        canvas.height = 60; 
    }else if(length === 'fat'){
        canvas.width = 192;
        canvas.height = 148;
    }else{
        canvas.width = 432;
        canvas.height = 48; 
    }
    
    
    //context.fillStyle = 'black';
    //context.fillRect(0,0,256,128);
    context.font = `bold ${fontSize}px Noto Sans KR`;
    context.fillStyle = fontColor;
    context.textAlign = 'center';
    context.textBaseline = 'top';

    // Draw each line of text with consistent line height
    textLines.forEach((text, index) => {
        context.fillText(text, canvas.width / 2, index * (fontSize + lineInterval));
    });

    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

function setFloorLabel(){
    const texture_pv = createLabelTexture(['PV'], 34, '#4F74C8B2', 5, 'short');   
    const mesh_pv = new THREE.Mesh(new THREE.PlaneGeometry(2, 1), new THREE.MeshBasicMaterial({ color:'white', map: texture_pv, transparent: true })); 
    mesh_pv.rotation.x = -Math.PI / 2; 
    mesh_pv.position.set(-4.7, 0.7, -11.0); 
    scene.add(mesh_pv);
    
    const texture_wind = createLabelTexture(['Wind'], 34, '#4F74C8B2', 5, 'middle');   
    const mesh_wind = new THREE.Mesh(new THREE.PlaneGeometry(5, 1), new THREE.MeshBasicMaterial({ color:'white', map: texture_wind, transparent: true })); 
    mesh_wind.rotation.x = -Math.PI / 2; 
    mesh_wind.position.set(-0.1, 0.7, -11.0); 
    scene.add(mesh_wind);

    const texture_ess = createLabelTexture(['ESS'], 34, '#4F74C8B2', 5, 'short');   
    const mesh_ess = new THREE.Mesh(new THREE.PlaneGeometry(2, 1), new THREE.MeshBasicMaterial({ color:'white', map: texture_ess, transparent: true })); 
    mesh_ess.rotation.x = -Math.PI / 2; 
    mesh_ess.position.set(4.3, 0.7, -11.0); 
    scene.add(mesh_ess);

    const texture_sofc = createLabelTexture(['SOFC'], 34, '#4F74C8B2', 5, 'short');   
    const mesh_sofc = new THREE.Mesh(new THREE.PlaneGeometry(2, 1), new THREE.MeshBasicMaterial({ color:'white', map: texture_sofc, transparent: true })); 
    mesh_sofc.rotation.x = -Math.PI / 2; 
    mesh_sofc.position.set(9.0, 0.7, -11.0); 
    scene.add(mesh_sofc);
    
    const texture_smr = createLabelTexture(['SMR'], 34, '#4F74C8B2', 5, 'short');   
    const mesh_smr = new THREE.Mesh(new THREE.PlaneGeometry(2, 1), new THREE.MeshBasicMaterial({ color:'white', map: texture_smr, transparent: true })); 
    mesh_smr.rotation.x = -Math.PI / 2; 
    mesh_smr.position.set(13.3, 0.7, -11.0); 
    scene.add(mesh_smr);

    const texture_grid = createLabelTexture(['GRID'], 40, '#4F74C8B2', 5);   
    const mesh_grid = new THREE.Mesh(new THREE.PlaneGeometry(9, 1), new THREE.MeshBasicMaterial({ color:'white', map: texture_grid, transparent: true })); 
    mesh_grid.rotation.x = -Math.PI / 2; 
    mesh_grid.position.set(16, 0, 8.0); 
    scene.add(mesh_grid);

    const texture_aipo = createLabelTexture(['AI Power','Operator'], 40, '#4F74C8B2', 5, 'fat');   
    const mesh_aipo = new THREE.Mesh(new THREE.PlaneGeometry(4, 3), new THREE.MeshBasicMaterial({ color:'white', map: texture_aipo, transparent: true })); 
    mesh_aipo.rotation.x = -Math.PI / 2; 
    mesh_aipo.position.set(1, 0, 9.1); 
    scene.add(mesh_aipo);

    const texture_lng = createLabelTexture(['LNG 냉열 / 발전'], 40, '#4F74C8B2', 5);   
    const mesh_lng = new THREE.Mesh(new THREE.PlaneGeometry(9, 1), new THREE.MeshBasicMaterial({ color:'white', map: texture_lng, transparent: true })); 
    mesh_lng.rotation.x = -Math.PI / 2; 
    mesh_lng.position.set(4.3, 0, 19.0); 
    scene.add(mesh_lng);

    const texture_datacenter = createLabelTexture(['Data Center'], 24, '#4F74C8B2', 5, 'dc');   
    const mesh_datacenter = new THREE.Mesh(new THREE.PlaneGeometry(9, 3), new THREE.MeshBasicMaterial({ color:'white', map: texture_datacenter, transparent: true })); 
    mesh_datacenter.rotation.x = -Math.PI / 2; 
    mesh_datacenter.position.set(-20, 0, 14.0); 
    scene.add(mesh_datacenter);    
}

// 그라데이션 텍스처 생성 함수
function createGradientTexture() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
  
    // 캔버스 크기 설정
    canvas.width = 256;
    canvas.height = 256;
  
    // 그라데이션 생성
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height); // 아래에서 위로    
    gradient.addColorStop(0, 'rgba(5, 20, 200, 0.5)');         
    gradient.addColorStop(0.8, 'rgba(5, 20, 100, 0.1)');     
    gradient.addColorStop(1, 'rgba(5, 50, 100, 0.0)');
  
    // 그라데이션을 캔버스에 적용
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    // 캔버스를 텍스처로 변환
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

async function loadModel() {
    load_models = [];
    const gltfLoader = new GLTFLoader();
    const promises = [        
        gltfLoader.loadAsync("./resources/models_test/dashboard.glb")
    ];

    const [...load_model] = await Promise.all(promises);
 
    let Circuit01;
    let plane03;
    let SMR_1;
    let Grid_1;
    let Grid_2;
    let AIpower_1;
    let LNG;
    let DC_1;
    let PV_2;
    let Effect;
    let gradientTexture;
    // model이 모두 로드 된 후 할 일    
    load_model.forEach(function (gltf, index) {           
        model = gltf.scene;                
        model.position.set(4.4,0,4.4); 
        scene.add(model);
        
        load_models = [model];
        hide_active_circuit(model);        

        Circuit01 = model.getObjectByName('Circuit01');        
        Circuit01.material.color = new THREE.Color(0x1a1d2e);
        Circuit01.material.needsUpdate = true; 
        Circuit01.position.y = -0.2;
        //Circuit01.visible = false;
        
        plane03 = model.getObjectByName('Plane03');   // 받침대 모델은 같은 재질이다.
        plane03.material.color = new THREE.Color(0x1a1d2e);
        plane03.material.needsUpdate = true; 
        
        SMR_1 = model.getObjectByName('SMR_1');       // 5개 모델은 같은 재질이다.
        SMR_1.material.color = new THREE.Color(0x2e354d);
        SMR_1.material.needsUpdate = true; 
        
        Grid_1 = model.getObjectByName('Grid_1');
        Grid_1.material.color = new THREE.Color(0x343b50);
        Grid_1.material.needsUpdate = true; 
        Grid_1.rotation.y = Math.PI / 4;

        Grid_2 = model.getObjectByName('Grid_2');
        Grid_2.rotation.y = Math.PI / 4;
        
        AIpower_1 = model.getObjectByName('AIpower_1');
        AIpower_1.material.color = new THREE.Color(0x30374a);
        AIpower_1.material.needsUpdate = true; 
        
        LNG = model.getObjectByName('LNG');
        LNG.material.color = new THREE.Color(0x30374b);
        LNG.material.needsUpdate = true; 

        DC_1 = model.getObjectByName('DC_1');
        DC_1.material.color = new THREE.Color(0x2e354b);        
        DC_1.material.needsUpdate = true; 

        PV_2 = model.getObjectByName('PV_2');
        PV_2.material.color = new THREE.Color(0x131a25);
        PV_2.material.map = null;
        PV_2.material.needsUpdate = true; 

        Effect = model.getObjectByName('Effect');        
        gradientTexture = createGradientTexture();// 그라데이션 텍스처 생성
        Effect.material.transparent = true;
        Effect.material.map = gradientTexture;
        Effect.material.emissiveMap = null;
        Effect.material.needsUpdate = true;         

        /* const folder_plane = gui.addFolder('plane');   
        folder_plane.addColor({ color: plane03.material.color.getHex() }, 'color').onChange((value) => {            
            plane03.material.color.setHex(value)
        }); 

        const folder_circuit = gui.addFolder('circuit');   
        folder_circuit.addColor({ color: Circuit01.material.color.getHex() }, 'color').onChange((value) => {            
            Circuit01.material.color.setHex(value)
        }); 

        const folder_activecircuit = gui.addFolder('active circuit');   
        folder_activecircuit.addColor({ color: model.getObjectByName('Circuit01_Alpha').material.color.getHex() }, 'color').onChange((value) => {            
            model.getObjectByName('Circuit01_Alpha').material.color.setHex(value)
        }); 
        //SMR_1 Grid_1 UPS_2 LNG DC_1

        const folder_5model = gui.addFolder('5model');   
        folder_5model.addColor({ color: SMR_1.material.color.getHex() }, 'color').onChange((value) => {            
            SMR_1.material.color.setHex(value)
        }); 

        const folder_Grid = gui.addFolder('Grid');   
        folder_Grid.addColor({ color: Grid_1.material.color.getHex() }, 'color').onChange((value) => {            
            Grid_1.material.color.setHex(value)
        }); 
        
        const folder_UPS = gui.addFolder('UPS');   
        folder_UPS.addColor({ color: UPS_2.material.color.getHex() }, 'color').onChange((value) => {            
            UPS_2.material.color.setHex(value)
        }); 

        const folder_LNG = gui.addFolder('LNG');   
        folder_LNG.addColor({ color: LNG.material.color.getHex() }, 'color').onChange((value) => {            
            LNG.material.color.setHex(value)
        });

        const folder_DC = gui.addFolder('DC');   
        folder_DC.addColor({ color: DC_1.material.color.getHex() }, 'color').onChange((value) => {            
            DC_1.material.color.setHex(value)
        });

        const folder_PV = gui.addFolder('PV');   
        folder_PV.addColor({ color: PV_2.material.color.getHex() }, 'color').onChange((value) => {            
            PV_2.material.color.setHex(value)
        }); */
    });

    setEnergyLine(model);    /* 에너지 흐름 경로에 테두리 만들기 */
        
    // 애니메이션 존재 여부 확인
    animations = load_model[0].animations;
    if (animations && animations.length > 0) {        
        mixer = new THREE.AnimationMixer(model);
        let action;
        // 모든 애니메이션 액션 생성
        animations.forEach((clip) => {
            action = mixer.clipAction(clip);
            actions[clip.name] = action;
        });  
        
        playAnimation('Wind_Action'); 
        //playAnimation('ESS_Action'); 
        //playAnimation('SOFC_Action'); 
        //playAnimation('UPS_Action'); 
        playAnimation('DC_Action');                    
    }

    // raycast 대상 지정
    scene.traverse(function(object) {      
        if (object instanceof THREE.Mesh && object.visible) {            
            intersect_targets.push(object);
        }
    });    

    placeEnergy('ai');
    placeEnergy('pv');
    placeEnergy('wind');
    placeEnergy('ess');
    placeEnergy('sofc');
    placeEnergy('smr');
    placeEnergy('grid');
    placeEnergy('lng');
    placeEnergy('lng_2');

    renderer.setAnimationLoop(dashboardAnimation); // 모델 로드가 끝난 후 렌더링 (모델 애니메이션, 에너지 흐름 애니메이션)
    mapControls.update();
}

function setEnergyLine(model){
    //5개 선
    const Circuit09_Alpha = model.getObjectByName('Circuit09_Alpha');        
    const Circuit09_Alpha_worldPosition = new THREE.Vector3();    
    Circuit09_Alpha.getWorldPosition(Circuit09_Alpha_worldPosition);    
    const Circuit09_Alpha_effect_line = new THREE.LineSegments( 
        new THREE.EdgesGeometry(Circuit09_Alpha.geometry, 20), 
        new THREE.LineBasicMaterial( { color: 0x748bd8, linewidth: 1 } ) 
    );
    Circuit09_Alpha_effect_line.position.set(Circuit09_Alpha_worldPosition.x, -0.1 , Circuit09_Alpha_worldPosition.z);    
    Circuit09_Alpha_effect_line.name = 'Circuit09_Alpha_effect_line';
    Circuit09_Alpha_effect_line.visible = false;
    scene.add( Circuit09_Alpha_effect_line );
    // ai -> dc
    const Circuit11_Alpha = model.getObjectByName('Circuit11_Alpha');        
    const Circuit11_Alpha_worldPosition = new THREE.Vector3();    
    Circuit11_Alpha.getWorldPosition(Circuit11_Alpha_worldPosition);    
    const Circuit11_Alpha_effect_line = new THREE.LineSegments( 
        new THREE.EdgesGeometry(Circuit11_Alpha.geometry, 20), 
        new THREE.LineBasicMaterial( { color: 0x748bd8, linewidth: 1 } ) 
    );
    Circuit11_Alpha_effect_line.position.set(Circuit11_Alpha_worldPosition.x, -0.1 , Circuit11_Alpha_worldPosition.z);
    Circuit11_Alpha_effect_line.name = 'Circuit11_Alpha_effect_line';
    Circuit11_Alpha_effect_line.visible = false;
    scene.add( Circuit11_Alpha_effect_line );
    // lng -> dc
    const Circuit08_Alpha = model.getObjectByName('Circuit08_Alpha');        
    const Circuit08_Alpha_worldPosition = new THREE.Vector3();    
    Circuit08_Alpha.getWorldPosition(Circuit08_Alpha_worldPosition);    
    const Circuit08_Alpha_effect_line = new THREE.LineSegments( 
        new THREE.EdgesGeometry(Circuit08_Alpha.geometry, 20), 
        new THREE.LineBasicMaterial( { color: 0x748bd8, linewidth: 1 } ) 
    );
    Circuit08_Alpha_effect_line.position.set(Circuit08_Alpha_worldPosition.x, -0.1 , Circuit08_Alpha_worldPosition.z);
    Circuit08_Alpha_effect_line.name = 'Circuit08_Alpha_effect_line';
    Circuit08_Alpha_effect_line.visible = false;
    scene.add( Circuit08_Alpha_effect_line );
    // 3개 선 + grid->ai
    const Circuit10_Alpha = model.getObjectByName('Circuit10_Alpha');        
    const Circuit10_Alpha_worldPosition = new THREE.Vector3();    
    Circuit10_Alpha.getWorldPosition(Circuit10_Alpha_worldPosition);    
    const Circuit10_Alpha_effect_line = new THREE.LineSegments( 
        new THREE.EdgesGeometry(Circuit10_Alpha.geometry, 20), 
        new THREE.LineBasicMaterial( { color: 0x748bd8, linewidth: 1 } ) 
    );
    Circuit10_Alpha_effect_line.position.set(Circuit10_Alpha_worldPosition.x, -0.1 , Circuit10_Alpha_worldPosition.z);
    Circuit10_Alpha_effect_line.name = 'Circuit10_Alpha_effect_line';
    Circuit10_Alpha_effect_line.visible = false;
    scene.add( Circuit10_Alpha_effect_line );
}

// 애니메이션을 선택하고 재생하는 함수
function playAnimation(name, motion) {
    activeAction = actions[name];    
    if (activeAction) {
        switch(motion){
            case 'stop':activeAction.stop();  break;
            default :activeAction.reset().play();
        }
    }    
}
function playEnergyGroup(type){    
    switch(type){
        case 'outer':                         
            stopEnergy('ai');
            stopEnergy('pv');
            stopEnergy('wind');
            stopEnergy('ess');
            stopEnergy('sofc');
            stopEnergy('smr');
            stopEnergy('grid');
            stopEnergy('lng');

            playEnergy('pv');
            playEnergy('wind');
            playEnergy('ess');
            playEnergy('sofc');
            playEnergy('smr');
            playEnergy('lng_2');
            show_active_circuit(['Circuit09_Alpha', 'Circuit11_Alpha', 'Circuit08_Alpha']);
            break;
        case 'inner':                         
            stopEnergy('ai');
            stopEnergy('pv');
            stopEnergy('wind');
            stopEnergy('ess');
            stopEnergy('sofc');
            stopEnergy('smr');
            stopEnergy('grid');
            stopEnergy('lng');
            
            playEnergy('ess');
            playEnergy('sofc');
            playEnergy('smr');
            playEnergy('grid');
            playEnergy('lng_2');
            show_active_circuit(['Circuit10_Alpha', 'Circuit11_Alpha', 'Circuit08_Alpha']);
            break;
        case 'ai'   :               
            stopEnergy('ai');
            stopEnergy('pv');
            stopEnergy('wind');
            stopEnergy('ess');
            stopEnergy('sofc');
            stopEnergy('smr');
            stopEnergy('grid');
            stopEnergy('lng');

            playEnergy('ai');
            break;
    }
}

function placeEnergy(target) {        
    let start;
    let end;
    let segmentLength;
    let s_numSpheres;
    let t;
    let position;
    let energy_light_clone;
    // 각 구간을 따라 일정 간격으로 배치
    for (let i = 0; i < energy_coordinate[target].length - 1; i++) {
        start = energy_coordinate[target][i];
        end = energy_coordinate[target][i + 1];

        // 구간의 길이 계산
        segmentLength = start.distanceTo(end);
        s_numSpheres = Math.floor(segmentLength / sphereSpacing); // 구간에 배치할 개수
        energy_info[target].numSpheres += s_numSpheres;
        energy_info[target].total_segmentLength += segmentLength;        
        // 구간을 따라 배치
        for (let j = 0; j < s_numSpheres; j++) {
            t = j / s_numSpheres;
            position = new THREE.Vector3().lerpVectors(start, end, t);
            energy_light_clone = energy_light[target].clone();
            energy_light_clone.material = new THREE.PointsMaterial({size:2, color:0xffffff, transparent:true, opacity:0.0 });
            energy_light_clone.position.copy(position);            
            scene.add(energy_light_clone);
            energy_info[target].leds.push(energy_light_clone);
        }
    }
    if(target === 'pv'){        
        energy_info[target].leds[11].position.set(-4.6, 0.1, -6.6); // 곡선 부위의 점 위치 재 배치
    }
    if(target === 'smr'){        
        energy_info[target].leds[11].position.set(13.2, 0.1, -6.6); // 곡선 부위의 점 위치 재 배치
    }
    if(target === 'lng_2'){        
        energy_info[target].leds[43].position.set(-15.2, 0.1, 15.05); // 곡선 부위의 점 위치 재 배치
    }
};

function updateEnergy(target) { 
    let t;
    let distanceToLight;
    let light;
    if (energy_info[target].lightPosition >= energy_info[target].total_segmentLength*2) {// 빛은 경로의 길이의 두 배를 이동해서 꼬리까지 다 없어지게 한다.
        stopEnergy(target);
    } else {
        energy_info[target].leds.forEach((sphere, index, arr) => {      // 구체들의 밝기를 빛의 위치에 따라 변화
            t = index * sphereSpacing;                            // 각 점의 위치 : 0 ~ 경로 길이
            if (t <= energy_info[target].lightPosition) {               // 각 점이 빛의 뒤에 있을 때만 거리에 따라 빛 밝기 조절
                distanceToLight = Math.abs(t - energy_info[target].lightPosition);                  // 각 점과 빛과의 거리                    
                light = distanceToLight*(0.0 - 1) / (arr.length * sphereSpacing / 4) + 1;    // 거리 기반 밝기, 거리가 0~길이 사이일때 밝기는 1~0.0 사이이다.
                sphere.material.opacity = light;                    
            } else {
                sphere.material.opacity = 0.0;                    
            }
        });
        energy_info[target].lightPosition += 0.4;
    }
};

function modelAnimation(){
    ani_delta = clock.getDelta();
    if (mixer) mixer.update(ani_delta);   
}

function energyAnimation(){
    energy_currentTime = clock.getElapsedTime();
    if(energy_currentTime - energy_previousTime >= 3 || energy_previousTime === 0){     // energy_previousTime === 0 : 최초에도 애니메이션 재생
        if(energy_loop_num % 4 > 2){   // 3일 땐 내부생산에너지원
            playEnergyGroup('inner');
        }else{                  // 0, 1, 2일땐 외부생산에너지원
            playEnergyGroup('outer');
        }        
        energy_previousTime = energy_currentTime;
        energy_loop_num++;
    }

    if (energy_info['ai'].isAnimating) {
        updateEnergy('ai');
    }
    if (energy_info['pv'].isAnimating) {
        updateEnergy('pv');
    }
    if (energy_info['wind'].isAnimating) {
        updateEnergy('wind');
    }
    if (energy_info['ess'].isAnimating) {
        updateEnergy('ess');
    }
    if (energy_info['sofc'].isAnimating) {
        updateEnergy('sofc');
    }
    if (energy_info['smr'].isAnimating) {
        updateEnergy('smr');
    }
    if (energy_info['grid'].isAnimating) {
        updateEnergy('grid');
    }
    if (energy_info['lng'].isAnimating) {
        updateEnergy('lng');
    }
    if (energy_info['lng_2'].isAnimating) {
        updateEnergy('lng_2');
    }
}

function resetLabelPosition(){
    // DOM 라벨   
    if(inner_source){   // 내부 생산 에너지원 라벨 위치
        inner_source.updateWorldMatrix( true, false );
        inner_source.getWorldPosition( tempV_inner_source );
        tempV_inner_source.project( camera );
        x_inner_source = ( tempV_inner_source.x * .5 + .5 ) * $canvas.clientWidth;
        y_inner_source = ( tempV_inner_source.y * - .5 + .5 ) * $canvas.clientHeight;
        $elem_inner_source.style.left = `${x_inner_source - 209}px`;
        $elem_inner_source.style.top = `${y_inner_source - 91}px`;
    }
    if(outer_source){   // 외부 생산 에너지원 라벨 위치
        outer_source.updateWorldMatrix( true, false );
        outer_source.getWorldPosition( tempV_outer_source );
        tempV_outer_source.project( camera );
        x_outer_source = ( tempV_outer_source.x * .5 + .5 ) * $canvas.clientWidth;
        y_outer_source = ( tempV_outer_source.y * - .5 + .5 ) * $canvas.clientHeight;
        $elem_outer_source.style.left = `${x_outer_source - 206}px`;
        $elem_outer_source.style.top = `${y_outer_source - 91}px`;
    }
    if(dc_source){   // 데이터센터 라벨 위치
        dc_source.updateWorldMatrix( true, false );
        dc_source.getWorldPosition( tempV_dc_source );
        tempV_dc_source.project( camera );
        x_dc_source = ( tempV_dc_source.x * .5 + .5 ) * $canvas.clientWidth;
        y_dc_source = ( tempV_dc_source.y * - .5 + .5 ) * $canvas.clientHeight;
        $elem_dc_source.style.left = `${x_dc_source - 226}px`;
        $elem_dc_source.style.top = `${y_dc_source - 27}px`;
    }
    if(tag_source){   // 에너지 라벨 위치
        tag_source.updateWorldMatrix( true, false );
        tag_source.getWorldPosition( tempV_tag_source );
        tempV_tag_source.project( camera );
        x_lng_source = ( tempV_tag_source.x * .5 + .5 ) * $canvas.clientWidth;
        y_lng_source = ( tempV_tag_source.y * - .5 + .5 ) * $canvas.clientHeight;
        $elem_lng_source.style.left = `${x_lng_source - 130}px`;
        $elem_lng_source.style.top = `${y_lng_source + 50}px`;
    }
}

function dashboardAnimation() {
    //renderer.setAnimationLoop(dashboardAnimation); 
    
    modelAnimation();
    energyAnimation();            

    //mapControls.update();
    renderer.render(scene, camera);  
}

function onWindowResize() {
    aspectRatio = window.innerWidth / window.innerHeight;
      
    // 카메라 좌표 갱신
    camera.left = frustumSize * aspectRatio / -2;
    camera.right = frustumSize * aspectRatio / 2;
    camera.top = frustumSize / 2;
    camera.bottom = frustumSize / -2;
    camera.updateProjectionMatrix();
    
    // 렌더러 크기 갱신
    renderer.setSize(window.innerWidth, window.innerHeight);

    resetLabelPosition();
    //mapControls.update();
    renderer.render(scene, camera); 
}

function intersect(mouse) {  
  //3D 공간 상의 교차점 계산
  raycaster.setFromCamera(mouse, camera);
  return raycaster.intersectObjects(intersect_targets);
}

function stopEnergy(target){
    energy_info[target].isAnimating = false; // 애니메이션이 실행 중인지 여부 
    energy_info[target].lightPosition = 0;        
    energy_info[target].leds.forEach((sphere, index, arr) => {
        sphere.material.opacity = 0.0;                                
    });    
}

function playEnergy(target){    
    energy_info[target].isAnimating = true;
}

function guideEnergy(target){
    energyGuideGeometry = new THREE.BufferGeometry().setFromPoints(energy_coordinate[target]);
    energyGuide = new THREE.Line(energyGuideGeometry, energyGuideMaterial);   
    scene.add(energyGuide);
}

function canvasClickHandler(event){  
    // 마우스 좌표 정규화
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    intersects = intersect(mouse);
  
    if (intersects.length > 0) {
        clickedObject3D = intersects[0].object;                   
        if(clickedObject3D.name.includes('DC') || clickedObject3D.name === 'Plane03' || clickedObject3D.name === 'Effect'){
            navTrigger("lamda");
        }else if(clickedObject3D.name.includes('PV')){        
            navTrigger('powerOperator');                  
            // guideEnergy('pv');                    
        }else if(clickedObject3D.name.includes('WindTurbine')){
            navTrigger('powerOperator');  
            // guideEnergy('wind');
        }else if(clickedObject3D.name.includes('ESS')){
            navTrigger('powerOperator');  
            // guideEnergy('ess');
        }else if(clickedObject3D.name.includes('SOFC')){
            navTrigger('powerOperator');  
            // guideEnergy('sofc');
        }else if(clickedObject3D.name.includes('SMR')){
            navTrigger('powerOperator');  
            // guideEnergy('smr');
        }else if(clickedObject3D.name.includes('LNG')){
            // guideEnergy('lng');
        }else if(clickedObject3D.name.includes('Grid')){
            // guideEnergy('grid');
        }else if(clickedObject3D.name.includes('UPS')){ //추후 ai로 수정하기
            // guideEnergy('ai');
        }
    }
}

function hide_active_circuit(model){    
    model.getObjectByName('Circuit01_Alpha').visible = false;   //  pv -> dc
    model.getObjectByName('Circuit02_Alpha').visible = false;   //  wind -> dc
    model.getObjectByName('Circuit03_Alpha').visible = false;   //  ess -> dc
    model.getObjectByName('Circuit04_Alpha').visible = false;   //  sofc -> dc
    model.getObjectByName('Circuit05_Alpha').visible = false;   //  smr -> dc
    model.getObjectByName('Circuit06_Alpha').visible = false;   //  lng -> ai -> dc
    model.getObjectByName('Circuit07_Alpha').visible = false;   //  grid -> dc
    model.getObjectByName('Circuit08_Alpha').visible = false;   //  lng -> dc
    model.getObjectByName('Circuit09_Alpha').visible = false;   //  외부생산에너지원 5 -> ai
    model.getObjectByName('Circuit10_Alpha').visible = false;   //  외부생산에너지 3 + grid -> ai
    model.getObjectByName('Circuit11_Alpha').visible = false;   //  ai -> dc

    if(scene.getObjectByName('Circuit08_Alpha_effect_line')) scene.getObjectByName('Circuit08_Alpha_effect_line').visible = false;
    if(scene.getObjectByName('Circuit09_Alpha_effect_line')) scene.getObjectByName('Circuit09_Alpha_effect_line').visible = false;
    if(scene.getObjectByName('Circuit10_Alpha_effect_line')) scene.getObjectByName('Circuit10_Alpha_effect_line').visible = false;
    if(scene.getObjectByName('Circuit11_Alpha_effect_line')) scene.getObjectByName('Circuit11_Alpha_effect_line').visible = false;
}

function show_active_circuit(circuits){    
    const model = load_models[0];     
    hide_active_circuit(model);    
    
    let active_circuit_model;    
    let effect_line_model;
    circuits.forEach(function(circuit){        
        active_circuit_model = model.getObjectByName(circuit);    
        active_circuit_model.visible = true;        
        active_circuit_model.material.color = new THREE.Color( 0x24397f );
        active_circuit_model.position.y = -0.1;
        
        effect_line_model = scene.getObjectByName(`${circuit}_effect_line`);
        effect_line_model.visible = true;
    });    
}

function canvasMoveHandler(event){
    // 마우스 좌표 정규화
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
    intersects = intersect(mouse);
    
    if (intersects.length > 0) {        
        clickedObject3D = intersects[0].object;        
        if(!isIntersectedDC && (clickedObject3D.name === 'DC_1' || clickedObject3D.name === 'DC_2' || clickedObject3D.name === 'Plane03'|| clickedObject3D.name === 'Effect'|| clickedObject3D.name === 'DC_Alpha')){        
            playAnimation('Effect_Action');
            isIntersectedDC = true;
            document.body.style.cursor = 'pointer';
        }
        if((clickedObject3D.name.includes('PV') || clickedObject3D.name.includes('WindTurbine') || clickedObject3D.name.includes('ESS') || clickedObject3D.name.includes('SOFC') || clickedObject3D.name.includes('SMR'))){
            document.body.style.cursor = 'pointer';
        }
    }else{
        isIntersectedDC = false; 
        playAnimation('Effect_Action', 'stop');
        document.body.style.cursor = 'default';
    }
}

export function stopAnimation_dashboard() {  
    /* let num = 0;
    scene.traverse(function(object) {      
        console.log(num++);
    }); */       
    //console.log(scene);
    
    if(renderer){
        renderer.setAnimationLoop(null); // 애니메이션 중지
    }     
}

function eventListener() {
    window.addEventListener('resize', onWindowResize, false);
    $canvas.addEventListener('click', canvasClickHandler);    
    $canvas.addEventListener('mousemove', canvasMoveHandler);    
}
