import * as THREE from 'three';

const COLORS = {
  default: new THREE.Color(0x4a89dc),
  compare: new THREE.Color(0xf6c244),
  swap:    new THREE.Color(0xe45757),
  sorted:  new THREE.Color(0x4ad295),
};

// How much emissive glow each state gets (kept subtle on idle, bright on active).
const EMISSIVE = {
  default: 0.05,
  compare: 0.55,
  swap:    0.55,
  sorted:  0.18,
};

const TOTAL_WIDTH = 80;
const MAX_HEIGHT = 22;

export function createBars(scene, { onBoundsChange } = {}) {
  const group = new THREE.Group();
  scene.add(group);

  let meshes = [];
  let values = [];
  let sortedMask = [];
  let barWidth = 1;

  function clear() {
    for (const m of meshes) {
      group.remove(m);
      m.geometry.dispose();
      m.material.dispose();
    }
    meshes = [];
    values = [];
    sortedMask = [];
  }

  function setValues(newValues) {
    clear();
    values = newValues.slice();
    sortedMask = new Array(values.length).fill(false);
    const n = values.length;
    const maxVal = Math.max(...values, 1);
    const gap = 0.15;
    barWidth = Math.max(0.2, (TOTAL_WIDTH / n) - gap);
    for (let i = 0; i < n; i++) {
      const h = (values[i] / maxVal) * MAX_HEIGHT;
      const geo = new THREE.BoxGeometry(barWidth, 1, barWidth * 1.2);
      const mat = new THREE.MeshStandardMaterial({
        color: COLORS.default,
        roughness: 0.55,
        metalness: 0.15,
        emissive: COLORS.default.clone().multiplyScalar(EMISSIVE.default),
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.scale.y = h;
      mesh.position.set(xFor(i, n), h / 2, 0);
      group.add(mesh);
      meshes.push(mesh);
    }
    onBoundsChange?.(TOTAL_WIDTH, MAX_HEIGHT);
  }

  function xFor(i, n) {
    const step = TOTAL_WIDTH / n;
    return -TOTAL_WIDTH / 2 + step * (i + 0.5);
  }

  function maxValue() {
    let m = 1;
    for (const v of values) if (v > m) m = v;
    return m;
  }

  function applyHeight(i) {
    const h = (values[i] / maxValue()) * MAX_HEIGHT;
    meshes[i].scale.y = h;
    meshes[i].position.y = h / 2;
  }

  function setColor(i, color, emissiveScale) {
    meshes[i].material.color.copy(color);
    meshes[i].material.emissive.copy(color).multiplyScalar(emissiveScale);
  }

  function resetColor(i) {
    if (sortedMask[i]) setColor(i, COLORS.sorted, EMISSIVE.sorted);
    else setColor(i, COLORS.default, EMISSIVE.default);
  }

  function highlight(indices, kind) {
    const c = COLORS[kind] || COLORS.default;
    const e = EMISSIVE[kind] ?? EMISSIVE.default;
    for (const i of indices) setColor(i, c, e);
  }

  function clearHighlight(indices) {
    for (const i of indices) resetColor(i);
  }

  function swap(i, j) {
    const tmp = values[i]; values[i] = values[j]; values[j] = tmp;
    applyHeight(i);
    applyHeight(j);
  }

  function overwrite(i, value) {
    values[i] = value;
    applyHeight(i);
  }

  function markSorted(i) {
    sortedMask[i] = true;
    setColor(i, COLORS.sorted, EMISSIVE.sorted);
  }

  function markAllSorted() {
    for (let i = 0; i < values.length; i++) markSorted(i);
  }

  function getValues() {
    return values.slice();
  }

  return {
    setValues,
    swap,
    overwrite,
    markSorted,
    markAllSorted,
    highlight,
    clearHighlight,
    resetColor,
    getValues,
    get length() { return values.length; },
  };
}
