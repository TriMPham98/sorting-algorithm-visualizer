import * as THREE from 'three';

// Floating value labels above the currently-highlighted bars.
// One pair per scene instance.
export function createLabels({ overlay, camera, canvas, bars }) {
  const el = [makeLabel(), makeLabel()];
  for (const e of el) overlay.appendChild(e);

  let active = [];        // indices currently shown
  let enabled = true;
  const v = new THREE.Vector3();

  function makeLabel() {
    const d = document.createElement('div');
    d.className = 'bar-label';
    d.hidden = true;
    return d;
  }

  function setActive(indices) {
    active = indices.filter((i) => i != null && i >= 0 && i < bars.length);
    tick();
  }

  function clear() {
    active = [];
    el[0].hidden = true;
    el[1].hidden = true;
  }

  function setEnabled(b) {
    enabled = !!b;
    if (!enabled) {
      el[0].hidden = true;
      el[1].hidden = true;
    } else if (active.length) {
      tick();
    }
  }

  function tick() {
    if (!enabled) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    for (let k = 0; k < 2; k++) {
      const i = active[k];
      const lbl = el[k];
      if (i == null) { lbl.hidden = true; continue; }
      const top = bars.getBarTop(i);
      if (!top) { lbl.hidden = true; continue; }
      v.set(top.x, top.y, top.z).project(camera);
      // Behind the camera or off-screen: hide.
      if (v.z > 1) { lbl.hidden = true; continue; }
      const x = (v.x * 0.5 + 0.5) * rect.width;
      const y = (-v.y * 0.5 + 0.5) * rect.height;
      lbl.textContent = String(bars.getValue(i));
      lbl.style.left = `${x}px`;
      lbl.style.top = `${y}px`;
      lbl.hidden = false;
    }
  }

  return { setActive, clear, setEnabled, tick };
}
