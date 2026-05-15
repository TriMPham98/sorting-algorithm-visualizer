import { createScene } from './scene.js';
import { createBars } from './bars.js';
import { createAudio } from './audio.js';
import { createAnimator } from './animator.js';
import { setupUI } from './ui.js';
import { getAlgorithm } from './algorithms/index.js';

const canvas = document.getElementById('canvas');
const { scene, onTick, fitView } = createScene(canvas);
const bars = createBars(scene, {
  onBoundsChange: (w, h) => fitView(w, h),
});
const audio = createAudio();

let ui; // forward ref
let currentAlgo = null;
let runStartMs = 0;

const animator = createAnimator({
  bars,
  audio,
  onStateChange(state) {
    if (!ui) return;
    if (state === 'playing') {
      ui.setPlayLabel('Pause');
      if (runStartMs === 0) runStartMs = performance.now();
    }
    else if (state === 'paused') ui.setPlayLabel('Play');
    else if (state === 'stopped') ui.setPlayLabel('Play');
    else if (state === 'finished') {
      ui.setPlayLabel('Play');
      const elapsed = runStartMs > 0 ? performance.now() - runStartMs : 0;
      const c = animator.getCounters();
      if (currentAlgo) {
        ui.showSummary({
          algoName: currentAlgo.name,
          n: bars.length,
          comparisons: c.comparisons,
          writes: c.writes,
          elapsedMs: elapsed,
          worstCompares: currentAlgo.info.worstCompares(bars.length),
          worstLabel: currentAlgo.info.worstLabel,
        });
      }
    }
  },
  onCountersChange(c) {
    ui?.updateCounters(c);
  },
  onCursorChange(line, kind) {
    ui?.setCursorLine(line, kind);
  },
});

onTick(() => animator.tick());

function range1ToN(n) {
  const a = new Array(n);
  for (let i = 0; i < n; i++) a[i] = i + 1;
  return a;
}

function shuffleInPlace(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function nearlySorted(n, swapRatio = 0.05) {
  const a = range1ToN(n);
  const swaps = Math.max(1, Math.round(n * swapRatio));
  for (let s = 0; s < swaps; s++) {
    const i = Math.floor(Math.random() * (n - 1));
    const t = a[i]; a[i] = a[i + 1]; a[i + 1] = t;
  }
  return a;
}

function fewUnique(n, buckets = 5) {
  const a = new Array(n);
  const max = n;
  for (let i = 0; i < n; i++) {
    const b = Math.floor(Math.random() * buckets);
    a[i] = Math.round(((b + 1) / buckets) * max);
  }
  return a;
}

function makeArray(n, preset) {
  switch (preset) {
    case 'sorted':     return range1ToN(n);
    case 'reversed':   return range1ToN(n).reverse();
    case 'nearly':     return nearlySorted(n, 0.05);
    case 'few-unique': return fewUnique(n, 5);
    default:           return shuffleInPlace(range1ToN(n));
  }
}

function shuffle() {
  animator.stop();
  ui?.hideSummary();
  runStartMs = 0;
  const n = ui ? ui.getSize() : 64;
  const preset = ui ? ui.getPreset() : 'random';
  bars.setValues(makeArray(n, preset));
}

function loadAlgorithm(id, { keepArray = false } = {}) {
  const algo = getAlgorithm(id);
  currentAlgo = algo;
  ui?.setPseudocode(algo.pseudocode);
  ui?.setAlgorithmInfo(algo.info);
  if (!keepArray) {
    animator.stop();
    return;
  }
  // load generator over current bar values
  const working = bars.getValues();
  // reset sorted markers — fresh run
  bars.setValues(working);
  ui?.hideSummary();
  runStartMs = 0;
  animator.load(algo.fn(working));
}

ui = setupUI({
  bars,
  animator,
  audio,
  onShuffle: shuffle,
  onAlgorithmChange: loadAlgorithm,
  onSizeChange() { shuffle(); },
});

// initial state
const initialAlgo = getAlgorithm('insertion');
currentAlgo = initialAlgo;
ui.updateCounters({ comparisons: 0, writes: 0 });
ui.setPseudocode(initialAlgo.pseudocode);
ui.setAlgorithmInfo(initialAlgo.info);
shuffle();
