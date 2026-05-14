import * as THREE from 'three';

export function createScene(canvas) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07090f);
  scene.fog = new THREE.Fog(0x07090f, 60, 220);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 500);
  let bounds = { width: 80, height: 20 };
  function fitView(width, height) {
    if (width) bounds.width = width;
    if (height) bounds.height = height;
    const fovV = THREE.MathUtils.degToRad(camera.fov);
    const aspect = camera.aspect;
    // Vertical margin is generous so the floor (y=0) and headroom above
    // the tallest bar are both visible after the tilt is applied.
    const widthMargin = 1.2;
    const heightMargin = 1.7;
    const halfW = (bounds.width * widthMargin) / 2;
    const halfH = (bounds.height * heightMargin) / 2;
    const distH = halfW / (Math.tan(fovV / 2) * aspect);
    const distV = halfH / Math.tan(fovV / 2);
    const dist = Math.max(distV, distH);
    const tilt = THREE.MathUtils.degToRad(16);
    const centerY = bounds.height / 2;
    camera.position.set(0, centerY + dist * Math.sin(tilt), dist * Math.cos(tilt));
    camera.lookAt(0, centerY, 0);
  }
  fitView();

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  const ambient = new THREE.AmbientLight(0x9fb8d8, 0.45);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xffffff, 0.9);
  key.position.set(20, 50, 30);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0x6fb3ff, 0.35);
  rim.position.set(-30, 20, -20);
  scene.add(rim);

  const floorGeo = new THREE.PlaneGeometry(400, 400);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x0c1220, roughness: 0.95, metalness: 0.05 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.01;
  scene.add(floor);

  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    fitView();
  }
  window.addEventListener('resize', onResize);

  let rafId = 0;
  const onTickFns = [];
  function tick() {
    rafId = requestAnimationFrame(tick);
    for (const fn of onTickFns) fn();
    renderer.render(scene, camera);
  }
  tick();

  return {
    scene,
    camera,
    renderer,
    fitView,
    onTick(fn) { onTickFns.push(fn); },
    dispose() {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
    },
  };
}
