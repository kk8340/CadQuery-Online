import { state } from './state.js';

export function initViewer() {
    const container = document.getElementById('viewer-container');
    const canvas = document.getElementById('viewer-canvas');

    state.scene = new THREE.Scene();
    state.scene.background = new THREE.Color(0x0f172a);

    const aspect = container.clientWidth / container.clientHeight;
    state.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    state.camera.position.set(40, 40, 40);
    state.camera.lookAt(0, 0, 0);

    state.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    state.renderer.setSize(container.clientWidth, container.clientHeight);
    state.renderer.setPixelRatio(window.devicePixelRatio);

    state.controls = new THREE.OrbitControls(state.camera, state.renderer.domElement);
    state.controls.enableDamping = true;
    state.controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    state.scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(50, 50, 50);
    state.scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight2.position.set(-50, -50, -50);
    state.scene.add(directionalLight2);

    const gridHelper = new THREE.GridHelper(100, 20, 0x334155, 0x1e293b);
    state.scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(25);
    state.scene.add(axesHelper);

    function animate() {
        requestAnimationFrame(animate);
        state.controls.update();
        state.renderer.render(state.scene, state.camera);
    }
    animate();

    window.addEventListener('resize', () => {
        state.camera.aspect = container.clientWidth / container.clientHeight;
        state.camera.updateProjectionMatrix();
        state.renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

export function loadMesh(meshData) {
    if (state.currentMesh) {
        if (state.currentMesh.geometry) {
            state.currentMesh.geometry.dispose();
        }
        if (state.currentMesh.material) {
            if (Array.isArray(state.currentMesh.material)) {
                state.currentMesh.material.forEach(m => m.dispose());
            } else {
                state.currentMesh.material.dispose();
            }
        }
        state.scene.remove(state.currentMesh);
        state.currentMesh = null;
    }

    const stlData = atob(meshData);
    const arrayBuffer = new ArrayBuffer(stlData.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < stlData.length; i++) {
        uint8Array[i] = stlData.charCodeAt(i);
    }

    const loader = new THREE.STLLoader();
    const geometry = loader.parse(arrayBuffer);

    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        metalness: 0.3,
        roughness: 0.7
    });

    state.currentMesh = new THREE.Mesh(geometry, material);

    geometry.computeBoundingBox();
    const center = geometry.boundingBox.getCenter(new THREE.Vector3());
    state.currentMesh.position.sub(center);

    state.scene.add(state.currentMesh);

    document.getElementById('viewer-overlay').classList.add('hidden');

    resetView();
}

export function resetView() {
    state.camera.position.set(40, 40, 40);
    state.camera.lookAt(0, 0, 0);
    state.controls.target.set(0, 0, 0);
    state.controls.update();
}
