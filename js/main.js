// Used for general scene stuff
let canvas, camera, controls, playerBaseScene, worldMapScene, activeScene, renderer, composer, aspect, frustumSize;

let effectFXAA, outlinePass;

// Used for Raycasting/selecting objects within the scene
let mouse = new THREE.Vector2(), raycaster = new THREE.Raycaster(), intersectedObject, selectedObjects = [];

// A resolution of 1 is the best.
let resolutionLevel = 1, antialiasing = true;

let D = 2;

function init() {
    canvas = document.createElement("div");
    document.body.appendChild(canvas);

    frustumSize = 500;
    aspect = window.innerWidth / window.innerHeight;

    //camera = new THREE.OrthographicCamera(frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 0.001, 5000);
    camera = new THREE.OrthographicCamera(-D * aspect, D * aspect, D, -D, 0.001, 5000);
    camera.position.set(0, 1000, 0);

    playerBaseScene = new THREE.Scene();
    playerBaseScene.fog = new THREE.FogExp2(0x868293, 0.0003);

    worldMapScene = new THREE.Scene();
    worldMapScene.fog = new THREE.FogExp2(0x868293, 0.0003);

    /*
     * TODO: Implement crossfade animation when switching scenes.
     */
    activeScene = worldMapScene;

    renderer = new THREE.WebGLRenderer({ antialias: antialiasing, alpha: true });
	renderer.setPixelRatio(window.devicePixelRatio / (resolutionLevel < 1 ? 1 : resolutionLevel));
    renderer.setSize(window.innerWidth, window.innerHeight);
    canvas.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.minDistance = 0;
    controls.maxDistance = 5000;


    composer = new THREE.EffectComposer(renderer);
    composer.setSize(window.innerWidth, window.innerHeight);

    let renderPass = new THREE.RenderPass(activeScene, camera);
    composer.addPass(renderPass);

    outlinePass = new THREE.OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), activeScene, camera);
    outlinePass.edgeStrength = 3.0;
    outlinePass.edgeGlow = 0;
    outlinePass.edgeThickness = 1;
    outlinePass.pulsePeriod = 0;
    outlinePass.visibleEdgeColor.set('#ffffff');
    outlinePass.visibleEdgeColor.set('#eeeeee');
    composer.addPass(outlinePass);

    effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
    effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
    composer.addPass(effectFXAA);

    loadScene();

    // Event listeners go here
    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousedown', onDocumentMouseDown);
    document.addEventListener('mousemove', onDocumentMouseMove);
}

function loadScene() {
    createDirectionalLight(0xe8bdb0, 0.75);

    let ambientLight = new THREE.AmbientLight(0x000000);
    playerBaseScene.add(ambientLight);
    worldMapScene.add(ambientLight);

    loadTerrain(0, 0, 0);
}

function createDirectionalLight(color, intensity) {
    let dirLight = new THREE.DirectionalLight(color, intensity);
    playerBaseScene.add(dirLight);
    worldMapScene.add(dirLight);
}

function addSelectedObject(object) {
    selectedObjects = [];
    selectedObjects.push(object);
}

function update() {
    if(completeTerrain != null) checkIntersection();
}

function checkIntersection() {
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(completeTerrain.children, true);

    //console.log(intersects);

    if (intersects.length > 0) {
        let selectedObject = intersects[0].object;
        if(selectedObject.name === "TestTree") {
            addSelectedObject(selectedObject);
            outlinePass.selectedObjects = selectedObjects;
        } else {
            selectedObjects = [];
        }
    }
}

function onDocumentMouseDown(event) {

}

function onDocumentMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    //checkIntersection();
}

function onWindowResize() {
    var aspect = window.innerWidth / window.innerHeight;
    camera.left = -D * aspect;
    camera.right = D * aspect;
    camera.top = D;
    camera.bottom = -D;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);

    effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
}

let clock = new THREE.Clock();
let delta = 0;
let interval = 1 / 30;
function animate() {
    requestAnimationFrame(animate);

    delta += clock.getDelta();

    if (delta  > interval) {
        update();
        render();
        delta = delta % interval;
    }

    //update();
    //render();
}

function render() {
    camera.updateMatrixWorld();

    controls.update();
    composer.render();
}

init();
animate();