import { createScene } from './scene.js';
import { createBars } from './bars.js';
import { createAudio } from './audio.js';
import { createAnimator } from './animator.js';
import { createLabels } from './labels.js';
import { setupUI } from './ui.js';
import { getAlgorithm, algorithms } from './algorithms/index.js';
import { mulberry32, randomSeed } from './prng.js';
import { readState, writeState } from './urlState.js';

const sharedAudio = createAudio();

// ---------- Per-instance factory ---------------------------------------------
// Each "instance" owns a canvas / scene / bars / animator. In Free mode only
// instance A is visible; in Race mode both are visible, stacked top/bottom,
// driven from the same controls.

function createInstance({ canvas, overlay, currentOpEl, audio, hudUpdate, cursorUpdate, onFinished }) {
  const { scene, camera, onTick, fitView } = createScene(canvas);
  const bars = createBars(scene, {
    onBoundsChange: (w, h) => fitView(w, h),
  });
  const labels = createLabels({ overlay, camera, canvas, bars });
  onTick(() => labels.tick());
  const animator = createAnimator({
    bars,
    audio,
    onStateChange(state) {
      if (state === 'finished' || state === 'stopped') {
        labels.clear();
        if (currentOpEl) currentOpEl.textContent = '—';
        if (state === 'finished') onFinished?.({ counters: animator.getCounters() });
      }
    },
    onCountersChange(c) { hudUpdate?.(c); },
    onCursorChange(line, kind) { cursorUpdate?.(line, kind); },
    onStep(step) { applyStepDisplay(step, bars, labels, currentOpEl); },
  });
  onTick(() => animator.tick());
  return { scene, bars, animator, labels };
}

function applyStepDisplay(step, bars, labels, opEl) {
  switch (step.type) {
    case 'compare': {
      const vi = bars.getValue(step.i);
      const vj = bars.getValue(step.j);
      const op = vi < vj ? '<' : vi > vj ? '>' : '=';
      labels.setActive([step.i, step.j]);
      if (opEl) opEl.textContent = `a[${step.i}]=${vi}  ${op}  a[${step.j}]=${vj}`;
      break;
    }
    case 'swap': {
      const vi = bars.getValue(step.i);
      const vj = bars.getValue(step.j);
      labels.setActive([step.i, step.j]);
      if (opEl) opEl.textContent = `swap a[${step.i}]↔a[${step.j}] (${vi}↔${vj})`;
      break;
    }
    case 'overwrite': {
      labels.setActive([step.i]);
      if (opEl) opEl.textContent = `a[${step.i}] ← ${step.value}`;
      break;
    }
    // mark-sorted / range / pivot / heap-end: keep the previous op visible.
  }
}

const canvasA = document.getElementById('canvas');
const canvasB = document.getElementById('canvasB');
const overlayA = document.getElementById('labelOverlayA');
const overlayB = document.getElementById('labelOverlayB');
const currentOpA = document.getElementById('currentOp');
const currentOpB = document.getElementById('currentOpB');

const instA = createInstance({
  canvas: canvasA,
  overlay: overlayA,
  currentOpEl: currentOpA,
  audio: sharedAudio.panned(-0.6),  // panned slightly left
  hudUpdate: (c) => ui?.updateCounters(c),
  cursorUpdate: (line, kind) => ui?.setCursorLine(line, kind),
  onFinished: ({ counters }) => onInstanceFinished('A', counters),
});

const instB = createInstance({
  canvas: canvasB,
  overlay: overlayB,
  currentOpEl: currentOpB,
  audio: sharedAudio.panned(+0.6),
  hudUpdate: (c) => ui?.updateCountersB(c),
  cursorUpdate: () => {},          // no pseudocode for B
  onFinished: ({ counters }) => onInstanceFinished('B', counters),
});

let ui;
let currentAlgoA = null;
let currentAlgoB = null;
let seed = randomSeed();
let finishedA = false;
let finishedB = false;
let finishCountersA = null;
let finishCountersB = null;

function isRace() { return ui?.getMode() === 'race'; }

// ---------- Array generation -------------------------------------------------

function range1ToN(n) {
  const a = new Array(n);
  for (let i = 0; i < n; i++) a[i] = i + 1;
  return a;
}

function shuffleInPlace(a, rand) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function nearlySorted(n, rand, swapRatio = 0.05) {
  const a = range1ToN(n);
  const swaps = Math.max(1, Math.round(n * swapRatio));
  for (let s = 0; s < swaps; s++) {
    const i = Math.floor(rand() * (n - 1));
    const t = a[i]; a[i] = a[i + 1]; a[i + 1] = t;
  }
  return a;
}

function fewUnique(n, rand, buckets = 5) {
  const a = new Array(n);
  for (let i = 0; i < n; i++) {
    const b = Math.floor(rand() * buckets);
    a[i] = Math.round(((b + 1) / buckets) * n);
  }
  return a;
}

function makeArray(n, preset, seedVal) {
  const rand = mulberry32(seedVal);
  switch (preset) {
    case 'sorted':     return range1ToN(n);
    case 'reversed':   return range1ToN(n).reverse();
    case 'nearly':     return nearlySorted(n, rand, 0.05);
    case 'few-unique': return fewUnique(n, rand, 5);
    default:           return shuffleInPlace(range1ToN(n), rand);
  }
}

function persistState() {
  if (!ui) return;
  writeState({
    algo: ui.getSelectedAlgorithm().id,
    preset: ui.getPreset(),
    size: ui.getSize(),
    seed,
  });
}

// ---------- High-level actions ----------------------------------------------

function newArray({ regenerateSeed = true } = {}) {
  // animator.stop() fires onStateChange('stopped') which clears labels and
  // resets the current-op text for each instance.
  instA.animator.stop();
  instB.animator.stop();
  ui?.hideSummary();
  ui?.setPlayLabel('Play');
  finishedA = finishedB = false;
  finishCountersA = finishCountersB = null;
  if (regenerateSeed) seed = randomSeed();
  const n = ui ? ui.getSize() : 64;
  const preset = ui ? ui.getPreset() : 'random';
  const baseArr = makeArray(n, preset, seed);
  instA.bars.setValues(baseArr.slice());
  if (isRace()) instB.bars.setValues(baseArr.slice());

  persistState();
}

function loadAlgorithm(id, { keepArray = false, internal = false, which = 'A' } = {}) {
  const algo = getAlgorithm(id);

  if (which === 'A') {
    currentAlgoA = algo;
    ui?.setPseudocode(algo.pseudocode);
    ui?.setAlgorithmInfo(algo.info);
    ui?.setAlgorithmDescription(algo.description);
    ui?.setRaceAName(algo.name);
  } else {
    currentAlgoB = algo;
    ui?.setRaceBName(algo.name);
  }
  if (!internal) persistState();
  if (!keepArray) return;

  const inst = which === 'A' ? instA : instB;
  inst.animator.stop();
  const working = inst.bars.getValues();
  inst.bars.setValues(working);
  inst.animator.load(algo.fn(working));
}

function loadAllForPlay() {
  // Ensure both instances have generators loaded over the current array.
  const aLoaded = instA.animator.isLoaded;
  if (!aLoaded) {
    const id = currentAlgoA ? currentAlgoA.id : ui.getSelectedAlgorithm().id;
    loadAlgorithm(id, { keepArray: true, which: 'A', internal: true });
  }
  if (isRace()) {
    if (!instB.animator.isLoaded) {
      const id = currentAlgoB ? currentAlgoB.id : ui.getSelectedAlgorithmB().id;
      loadAlgorithm(id, { keepArray: true, which: 'B', internal: true });
    }
  }
}

function onInstanceFinished(which, counters) {
  if (which === 'A') { finishedA = true; finishCountersA = counters; }
  else                { finishedB = true; finishCountersB = counters; }
  // The animator that just finished has already markAllSorted'd its OWN bars.
  // We only need to wait for the other instance in race mode; in single modes,
  // show the summary immediately.
  if (isRace()) {
    if (finishedA && finishedB) showRaceSummary();
  } else {
    showSingleSummary();
  }
}

function showSingleSummary() {
  if (!currentAlgoA) return;
  const c = finishCountersA ?? instA.animator.getCounters();
  ui.showSummary({
    algoName: currentAlgoA.name,
    n: instA.bars.length,
    comparisons: c.comparisons,
    writes: c.writes,
    worstCompares: currentAlgoA.info.worstCompares(instA.bars.length),
    worstLabel: currentAlgoA.info.worstLabel,
  });
  ui.setPlayLabel('Play');
}

function showRaceSummary() {
  const ca = finishCountersA ?? instA.animator.getCounters();
  const cb = finishCountersB ?? instB.animator.getCounters();
  const aOps = ca.comparisons + ca.writes;
  const bOps = cb.comparisons + cb.writes;
  const winner = aOps < bOps ? currentAlgoA.name : (bOps < aOps ? currentAlgoB.name : 'Tie');
  ui.showSummary({
    algoName: `${currentAlgoA.name}  vs  ${currentAlgoB.name}`,
    n: instA.bars.length,
    comparisons: ca.comparisons,
    writes: ca.writes,
    comparisonsB: cb.comparisons,
    writesB: cb.writes,
    worstCompares: aOps + bOps,
    worstLabel: `Winner: ${winner}`,
  });
  ui.setPlayLabel('Play');
}

// Adapt the UI hooks. The animator factory used to drive ui.setPlayLabel,
// but now we have two animators; let the play button manage its own label.

function clickPlayBoth() {
  sharedAudio.resume();
  const playing = instA.animator.isPlaying || (isRace() && instB.animator.isPlaying);
  if (playing) {
    instA.animator.pause();
    if (isRace()) instB.animator.pause();
    ui.setPlayLabel('Play');
    return;
  }
  loadAllForPlay();
  instA.animator.play();
  if (isRace()) instB.animator.play();
  ui.setPlayLabel('Pause');
}

function stepBoth() {
  sharedAudio.resume();
  if (instA.animator.isPlaying) instA.animator.pause();
  if (isRace() && instB.animator.isPlaying) instB.animator.pause();
  loadAllForPlay();
  instA.animator.stepOnce();
  if (isRace()) instB.animator.stepOnce();
}

// ---------- UI wiring -------------------------------------------------------

ui = setupUI({
  // Pass instA as "the" bars/animator/audio for the legacy single-instance UI
  // wiring. Race-mode play/step are routed through clickPlayBoth/stepBoth below.
  bars: instA.bars,
  animator: instA.animator,
  audio: sharedAudio,
  onShuffle: () => newArray({ regenerateSeed: true }),
  onAlgorithmChange(id, { keepArray = false, which = 'A' } = {}) {
    loadAlgorithm(id, { keepArray, which });
  },
  onSizeChange() { newArray({ regenerateSeed: true }); },
  onModeChange(mode) {
    instA.animator.stop();
    instB.animator.stop();
    if (mode === 'race') {
      currentAlgoA = ui.getSelectedAlgorithm();
      currentAlgoB = ui.getSelectedAlgorithmB();
      ui.setRaceAName(currentAlgoA.name);
      ui.setRaceBName(currentAlgoB.name);
    } else {
      currentAlgoA = ui.getSelectedAlgorithm();
      ui.setPseudocode(currentAlgoA.pseudocode);
      ui.setAlgorithmInfo(currentAlgoA.info);
      ui.setAlgorithmDescription(currentAlgoA.description);
    }
    newArray({ regenerateSeed: false });
  },
});

// Override the default play/step click handlers (which were per-animator) with
// race-aware versions. The UI returns helpers so we can call them from
// keyboard shortcuts too.
const playBtn = document.getElementById('play');
const stepBtn = document.getElementById('step');
playBtn.replaceWith(playBtn.cloneNode(true));
stepBtn.replaceWith(stepBtn.cloneNode(true));
document.getElementById('play').addEventListener('click', clickPlayBoth);
document.getElementById('step').addEventListener('click', stepBoth);

// ---------- Initial state ---------------------------------------------------

const urlState = readState();
// setSize / setPreset both fire change handlers that call newArray with a
// freshly-randomized seed, so assign the URL seed AFTER those calls so that
// the final newArray below uses the seed from the URL (not a discarded one).
if (urlState.size) ui.setSize(parseInt(urlState.size, 10));
if (urlState.preset) ui.setPreset(urlState.preset);
if (urlState.seed) seed = parseInt(urlState.seed, 10) >>> 0;
const initialAlgoId = urlState.algo || 'insertion';
const initialAlgo = getAlgorithm(initialAlgoId);
ui.setAlgorithm(initialAlgo.id);
currentAlgoA = initialAlgo;
currentAlgoB = getAlgorithm(algorithms[1].id);
ui.updateCounters({ comparisons: 0, writes: 0 });
ui.updateCountersB({ comparisons: 0, writes: 0 });
ui.setPseudocode(initialAlgo.pseudocode);
ui.setAlgorithmInfo(initialAlgo.info);
ui.setAlgorithmDescription(initialAlgo.description);
ui.setRaceAName(initialAlgo.name);
ui.setRaceBName(currentAlgoB.name);
newArray({ regenerateSeed: false });

// ---------- Keyboard shortcuts ----------------------------------------------

window.addEventListener('keydown', (e) => {
  const tag = (e.target?.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'select' || tag === 'textarea') return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  switch (e.key) {
    case ' ':
    case 'Spacebar':
      e.preventDefault();
      clickPlayBoth();
      break;
    case 's': case 'S':
      stepBoth();
      break;
    case 'n': case 'N':
    case 'r': case 'R':
      newArray({ regenerateSeed: true });
      ui.setPlayLabel('Play');
      break;
    case 'm': case 'M':
      ui.toggleMute();
      break;
    case 'ArrowLeft':
      ui.bumpSpeed(-1);
      break;
    case 'ArrowRight':
      ui.bumpSpeed(+1);
      break;
    case '?':
      ui.toggleShortcutsOverlay();
      break;
    default:
      if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key, 10) - 1;
        if (idx < algorithms.length) ui.setAlgorithm(algorithms[idx].id);
      }
  }
});

// Speed slider should drive both animators. ui.setupUI already wires speed
// changes into instA via the passed-in animator; we just need to mirror to B
// so a race starts with both at the same stepRate.
const speedIn = document.getElementById('speed');
function applySpeedGate() {
  const v = parseInt(speedIn.value, 10);
  const rate = v <= 10 ? v / 10 : v - 9;
  // Above ~4 steps/frame the per-step displays flicker too much to read.
  const showStepDisplays = rate <= 4;
  instA.labels.setEnabled(showStepDisplays);
  instB.labels.setEnabled(showStepDisplays);
  document.body.classList.toggle('no-current-op', !showStepDisplays);
}
speedIn.addEventListener('input', () => {
  instB.animator.setSpeed(parseInt(speedIn.value, 10));
  applySpeedGate();
});
instB.animator.setSpeed(parseInt(speedIn.value, 10));
applySpeedGate();
// Mute toggle should mute the shared audio (which both instances use)
const muteIn = document.getElementById('mute');
muteIn.addEventListener('change', () => sharedAudio.setMuted(muteIn.checked));
