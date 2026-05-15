import * as THREE from 'three';

export function createScene(canvas) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07090f);
  scene.fog = new THREE.Fog(0x07090f, 60, 220);

  // Initial aspect from the canvas's actual displayed size; updated on resize.
  const initialAspect = (canvas.clientWidth || window.innerWidth) / Math.max(1, canvas.clientHeight || window.innerHeight);
  const camera = new THREE.PerspectiveCamera(45, initialAspect, 0.1, 1000);
  let bounds = { width: 80, height: 22 };
  // First-principles fit: derive camera position from explicit screen-space
  // constraints, not from "max(distH, distV)" heuristics.
  //
  // Place the camera at (0, Cy, Cz) looking at (0, Ly, 0) with downward tilt θ.
  // For a point P=(0, y, 0) in world, the vertical NDC is:
  //   v_ndc(y) = ((y - Cy) cosθ + Cz sinθ)
  //              / (((Cy - y) sinθ + Cz cosθ) · tan(α/2))
  // We constrain v_ndc(H) = TARGET_TOP_NDC (top of tallest bar near top of frame)
  // and pick Cz to fit width with margin. Cy follows analytically.
  function fitView(width, height) {
    if (width) bounds.width = width;
    if (height) bounds.height = height;
    const fovV = THREE.MathUtils.degToRad(camera.fov);
    const tanHalfV = Math.tan(fovV / 2);
    const aspect = camera.aspect;
    const tanHalfH = tanHalfV * aspect;

    const W = bounds.width;
    const H = bounds.height;
    const tilt = THREE.MathUtils.degToRad(15);
    const cosT = Math.cos(tilt);
    const sinT = Math.sin(tilt);

    // Width fit: at the lookAt depth d_look = Cz / cosT, horizontal half-extent
    // = d_look · tanHalfH. We want it ≥ (W·margin)/2.
    const widthMargin = 1.2;
    const halfW = (W * widthMargin) / 2;
    const Cz = (halfW / tanHalfH) * cosT;

    // Target: top of bars (y=H) projects to v_ndc = 0.55 (≈22% from top).
    // Solve for Cy from v_ndc(H) = TARGET.
    const TARGET_TOP_NDC = 0.55;
    const denom = cosT + TARGET_TOP_NDC * tanHalfV * sinT;
    const Cy = H + (Cz * (sinT - TARGET_TOP_NDC * tanHalfV * cosT)) / denom;

    // lookAt sits on the view ray at z=0
    const Ly = Cy - Cz * (sinT / cosT);

    camera.position.set(0, Cy, Cz);
    camera.lookAt(0, Ly, 0);
  }
  fitView();

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  // Sizing is driven by the canvas's actual display size (CSS-controlled),
  // not the window — so a 50%-height canvas in race mode renders correctly.
  // updateStyle=false keeps CSS in control of layout.
  function fitToCanvas() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w <= 0 || h <= 0) return;  // canvas hidden / not laid out yet
    if (camera.aspect !== w / h) {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    renderer.setSize(w, h, false);
    fitView();
  }
  fitToCanvas();

  const ambient = new THREE.AmbientLight(0x9fb8d8, 0.45);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xffffff, 0.9);
  key.position.set(20, 50, 30);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0x6fb3ff, 0.35);
  rim.position.set(-30, 20, -20);
  scene.add(rim);

  const floorGeo = new THREE.PlaneGeometry(400, 400);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x141a28, roughness: 0.9, metalness: 0.05 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.02;
  scene.add(floor);

  const grid = new THREE.GridHelper(400, 80, 0x2a3550, 0x1a2238);
  grid.position.y = -0.01;
  scene.add(grid);

  // ResizeObserver catches CSS-driven size changes (mode toggle) as well as
  // window resize. No window 'resize' listener needed.
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fitToCanvas) : null;
  ro?.observe(canvas);
  // Fallback for environments without ResizeObserver.
  function onWinResize() { fitToCanvas(); }
  window.addEventListener('resize', onWinResize);

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
      window.removeEventListener('resize', onWinResize);
      ro?.disconnect();
    },
  };
}
