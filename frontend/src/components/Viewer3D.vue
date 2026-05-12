<template>
  <div ref="viewerContainer" class="h-full w-full relative">
    <canvas ref="viewerCanvas"></canvas>
    <div v-if="showOverlay" class="absolute inset-0 flex items-center justify-center text-slate-500">
      <div class="text-center">
        <svg class="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path>
        </svg>
        <p>3D 预览区域</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'

const props = defineProps({
  meshData: { type: String, default: '' }
})

const viewerContainer = ref(null)
const viewerCanvas = ref(null)
const showOverlay = ref(true)

let scene, camera, renderer, controls, animationId
let currentMesh = null

onMounted(() => {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0f172a)

  camera = new THREE.PerspectiveCamera(60, viewerContainer.value.clientWidth / viewerContainer.value.clientHeight, 0.1, 10000)
  camera.position.set(40, 40, 40)

  renderer = new THREE.WebGLRenderer({ canvas: viewerCanvas.value, antialias: true })
  renderer.setSize(viewerContainer.value.clientWidth, viewerContainer.value.clientHeight)
  renderer.setPixelRatio(window.devicePixelRatio)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8)
  dirLight1.position.set(50, 50, 50)
  scene.add(dirLight1)

  const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.4)
  dirLight2.position.set(-50, 30, -50)
  scene.add(dirLight2)

  const grid = new THREE.GridHelper(100, 20, 0x334155, 0x1e293b)
  scene.add(grid)

  const axes = new THREE.AxesHelper(50)
  scene.add(axes)

  animate()
  window.addEventListener('resize', onResize)
})

function animate() {
  animationId = requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}

function onResize() {
  if (!viewerContainer.value) return
  camera.aspect = viewerContainer.value.clientWidth / viewerContainer.value.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(viewerContainer.value.clientWidth, viewerContainer.value.clientHeight)
}

watch(() => props.meshData, (newData) => {
  if (!newData) return

  if (currentMesh) {
    currentMesh.geometry.dispose()
    currentMesh.material.dispose()
    scene.remove(currentMesh)
    currentMesh = null
  }

  try {
    const binaryStr = atob(newData)
    const bytes = new Uint8Array(binaryStr.length)
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i)
    }

    const loader = new STLLoader()
    const geometry = loader.parse(bytes.buffer)
    geometry.computeVertexNormals()

    const material = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      metalness: 0.3,
      roughness: 0.7
    })

    currentMesh = new THREE.Mesh(geometry, material)

    geometry.computeBoundingBox()
    const box = geometry.boundingBox
    const center = new THREE.Vector3()
    box.getCenter(center)
    currentMesh.position.sub(center)

    scene.add(currentMesh)
    showOverlay.value = false
  } catch (e) {
    console.error('STL 加载失败:', e)
  }
})

function resetView() {
  camera.position.set(40, 40, 40)
  camera.lookAt(0, 0, 0)
  controls.reset()
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  if (animationId) cancelAnimationFrame(animationId)
  if (currentMesh) {
    currentMesh.geometry.dispose()
    currentMesh.material.dispose()
  }
  renderer.dispose()
  controls.dispose()
})

defineExpose({ resetView })
</script>
