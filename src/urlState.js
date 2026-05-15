// Read/write app state in the URL hash:
//   #algo=quick&preset=random&size=64&seed=1234567890
// All fields optional; readState() returns {} when hash is empty.

export function readState() {
  const hash = window.location.hash.replace(/^#/, '');
  if (!hash) return {};
  const out = {};
  for (const part of hash.split('&')) {
    const [k, v] = part.split('=');
    if (!k) continue;
    out[decodeURIComponent(k)] = decodeURIComponent(v ?? '');
  }
  return out;
}

let writeTimer = 0;
export function writeState(state) {
  // Debounce so dragging the size slider doesn't write 30 entries / sec.
  if (writeTimer) clearTimeout(writeTimer);
  writeTimer = setTimeout(() => {
    const parts = [];
    for (const [k, v] of Object.entries(state)) {
      if (v === undefined || v === null || v === '') continue;
      parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    }
    const hash = parts.length ? '#' + parts.join('&') : '';
    if (hash !== window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search + hash);
    }
    writeTimer = 0;
  }, 300);
}
