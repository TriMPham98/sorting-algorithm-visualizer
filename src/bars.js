import * as THREE from 'three';

const COLORS = {
  default: new THREE.Color(0x4a89dc),
  compare: new THREE.Color(0xf6c244),
  swap:    new THREE.Color(0xe45757),
  sorted:  new THREE.Color(0x4ad295),
  pivot:   new THREE.Color(0xc865ff),
};

// How much emissive glow each state gets (kept subtle on idle, bright on active).
const EMISSIVE = {
  default: 0.05,
  compare: 0.55,
  swap:    0.55,
  sorted:  0.18,
  pivot:   0.6,
};

const DIM_OPACITY = 0.28;

const TOTAL_WIDTH = 80;
const MAX_HEIGHT = 22;

export function createBars(scene, { onBoundsChange } = {}) {
  const group = new THREE.Group();
  scene.add(group);

  let meshes = [];
  let values = [];
  let sortedMask = [];
  let barWidth = 1;
  let rangeLo = null;
  let rangeHi = null;
  let pivotIdx = null;
  let heapEnd = null;
  let maxVal = 1;

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
    maxVal = 1;
    for (let i = 0; i < n; i++) if (values[i] > maxVal) maxVal = values[i];
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
        transparent: true,
        opacity: 1,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.scale.y = h;
      mesh.position.set(xFor(i, n), h / 2, 0);
      group.add(mesh);
      meshes.push(mesh);
    }
    rangeLo = rangeHi = null;
    pivotIdx = null;
    heapEnd = null;
    applyDimming();
    onBoundsChange?.(TOTAL_WIDTH, MAX_HEIGHT);
  }

  function isInRange(i) {
    return rangeLo == null || (i >= rangeLo && i <= rangeHi);
  }

  function applyDimming() {
    for (let i = 0; i < meshes.length; i++) {
      const dim = !isInRange(i) && i !== pivotIdx;
      meshes[i].material.opacity = dim ? DIM_OPACITY : 1;
    }
  }

  function setRange(lo, hi) {
    if (lo == null || hi == null) { rangeLo = rangeHi = null; }
    else { rangeLo = lo; rangeHi = hi; }
    applyDimming();
  }

  function setPivot(i) {
    const prev = pivotIdx;
    pivotIdx = (i == null) ? null : i;
    if (prev != null && prev !== pivotIdx) resetColor(prev);
    if (pivotIdx != null) setColor(pivotIdx, COLORS.pivot, EMISSIVE.pivot);
    applyDimming();
  }

  function setHeapEnd(end) {
    heapEnd = end == null ? null : end;
    if (heapEnd != null) {
      // bars at index >= heapEnd are out of the heap → sorted
      for (let i = heapEnd; i < values.length; i++) {
        if (!sortedMask[i]) markSorted(i);
      }
    }
  }

  function xFor(i, n) {
    const step = TOTAL_WIDTH / n;
    return -TOTAL_WIDTH / 2 + step * (i + 0.5);
  }

  function applyHeight(i) {
    const h = (values[i] / maxVal) * MAX_HEIGHT;
    meshes[i].scale.y = h;
    meshes[i].position.y = h / 2;
  }

  function setColor(i, color, emissiveScale) {
    meshes[i].material.color.copy(color);
    meshes[i].material.emissive.copy(color).multiplyScalar(emissiveScale);
  }

  function resetColor(i) {
    if (i === pivotIdx) { setColor(i, COLORS.pivot, EMISSIVE.pivot); return; }
    if (sortedMask[i]) setColor(i, COLORS.sorted, EMISSIVE.sorted);
    else setColor(i, COLORS.default, EMISSIVE.default);
  }

  function highlight(indices, kind) {
    const c = COLORS[kind] || COLORS.default;
    const e = EMISSIVE[kind] ?? EMISSIVE.default;
    for (const i of indices) {
      if (i === pivotIdx) continue; // pivot color stays fixed
      setColor(i, c, e);
    }
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
    setRange,
    setPivot,
    setHeapEnd,
    getValues,
    getValue(i) { return values[i]; },
    getMax() { return maxVal; },
    get length() { return values.length; },
  };
}
