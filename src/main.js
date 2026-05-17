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
  const { scene, camera, onTick, fitView, markDirty } = createScene(canvas);
  const bars = createBars(scene, {
    onBoundsChange: (w, h) => fitView(w, h),
    markDirty,
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

// Pan A hard-left and B hard-right in race mode for clear stereo separation.
// Free mode plays A only — keep it centered so it doesn't sound lopsided.
const instA = createInstance({
  canvas: canvasA,
  overlay: overlayA,
  currentOpEl: currentOpA,
  audio: sharedAudio.panned(() => isRace() ? -1 : 0),
  hudUpdate: (c) => ui?.updateCounters(c),
  cursorUpdate: (line, kind) => ui?.setCursorLine(line, kind),
  onFinished: ({ counters }) => onInstanceFinished('A', counters),
});

const instB = createInstance({
  canvas: canvasB,
  overlay: overlayB,
  currentOpEl: currentOpB,
  audio: sharedAudio.panned(() => isRace() ? +1 : 0),
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

// Ascends to the centre then descends back down.
function pipeOrgan(n) {
  const a = new Array(n);
  const mid = (n - 1) / 2 || 1;
  for (let i = 0; i < n; i++) {
    const d = Math.min(i, n - 1 - i); // 0 at the ends, max at the centre
    a[i] = Math.round((d / mid) * (n - 1)) + 1;
  }
  return a;
}

// Repeating ascending ramps (default 4 teeth).
function sawtooth(n, teeth = 4) {
  const period = Math.max(2, Math.ceil(n / teeth));
  const a = new Array(n);
  for (let i = 0; i < n; i++) {
    a[i] = Math.round(((i % period) / (period - 1)) * (n - 1)) + 1;
  }
  return a;
}

// Sorted, with the final tailRatio fraction shuffled.
function sortedTailShuffled(n, rand, tailRatio = 0.1) {
  const a = range1ToN(n);
  const start = Math.floor(n * (1 - tailRatio));
  for (let i = n - 1; i > start; i--) {
    const j = start + Math.floor(rand() * (i - start + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

// Descending, with a handful of adjacent swaps so it isn't perfectly reversed.
function reversedNearly(n, rand, swapRatio = 0.05) {
  const a = range1ToN(n).reverse();
  const swaps = Math.max(1, Math.round(n * swapRatio));
  for (let s = 0; s < swaps; s++) {
    const i = Math.floor(rand() * (n - 1));
    const t = a[i]; a[i] = a[i + 1]; a[i + 1] = t;
  }
  return a;
}

// Every element identical (mid height so the bars stay visible).
function allEqual(n) {
  return new Array(n).fill(Math.ceil(n / 2));
}

// Only two distinct heights.
function twoValues(n, rand) {
  const lo = Math.max(1, Math.round(n * 0.25));
  const a = new Array(n);
  for (let i = 0; i < n; i++) a[i] = rand() < 0.5 ? lo : n;
  return a;
}

// Values clustered around the mean (Box-Muller normal, clamped to [1, n]).
function gaussian(n, rand) {
  const a = new Array(n);
  const mean = n / 2;
  const sd = n / 8;
  for (let i = 0; i < n; i++) {
    const u1 = Math.max(rand(), 1e-9);
    const u2 = rand();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    a[i] = Math.min(n, Math.max(1, Math.round(mean + z * sd)));
  }
  return a;
}

// Sorted, with a few elements replaced by random outliers.
function sortedOutliers(n, rand, ratio = 0.05) {
  const a = range1ToN(n);
  const k = Math.max(1, Math.round(n * ratio));
  for (let s = 0; s < k; s++) {
    const i = Math.floor(rand() * n);
    a[i] = Math.floor(rand() * n) + 1;
  }
  return a;
}

// Median-of-three killer. McIlroy's adversary ("A Killer Adversary for
// Quicksort", 1999): keys are kept "gas" (unassigned) and only solidified
// when a comparison forces it, always assigning the just-touched element a
// fresh largest key so the chosen pivot is pathologically extreme. We run it
// against pdq's exact median-of-(lo, mid, hi) + Lomuto recursion so the
// resulting permutation is verified-bad for this codebase's quicksort
// (empirically ~4-5x random comparisons at n=512, trending O(n^2)).
function med3Killer(n) {
  const idx = range1ToN(n).map((x) => x - 1);
  const key = new Array(n).fill(0); // 0 = gas (unassigned)
  let solid = 0;
  const cmp = (x, y) => {
    const gx = key[x] === 0;
    const gy = key[y] === 0;
    if (gx && gy) { key[x] = ++solid; return 1; }
    if (gx) return 1;
    if (gy) return -1;
    return key[x] - key[y];
  };
  const SMALL = 24; // matches pdq's insertion-sort cutoff
  const part = (a, lo, hi) => {
    const mid = (lo + hi) >> 1;
    if (cmp(a[lo], a[mid]) > 0) { const t = a[lo]; a[lo] = a[mid]; a[mid] = t; }
    if (cmp(a[lo], a[hi]) > 0) { const t = a[lo]; a[lo] = a[hi]; a[hi] = t; }
    if (cmp(a[mid], a[hi]) > 0) { const t = a[mid]; a[mid] = a[hi]; a[hi] = t; }
    { const t = a[mid]; a[mid] = a[hi]; a[hi] = t; }
    const piv = a[hi];
    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      if (cmp(a[j], piv) <= 0) { i++; const t = a[i]; a[i] = a[j]; a[j] = t; }
    }
    { const t = a[i + 1]; a[i + 1] = a[hi]; a[hi] = t; }
    return i + 1;
  };
  const rec = (a, lo, hi) => {
    while (hi - lo + 1 > SMALL) { const p = part(a, lo, hi); rec(a, lo, p - 1); lo = p + 1; }
  };
  rec(idx, 0, n - 1);
  for (let k = 0; k < n; k++) if (key[idx[k]] === 0) key[idx[k]] = ++solid;
  return key; // already 1..n, in original-position order
}

function makeArray(n, preset, seedVal) {
  const rand = mulberry32(seedVal);
  switch (preset) {
    case 'sorted':       return range1ToN(n);
    case 'reversed':     return range1ToN(n).reverse();
    case 'nearly':       return nearlySorted(n, rand, 0.05);
    case 'few-unique':   return fewUnique(n, rand, 5);
    case 'pipe-organ':   return pipeOrgan(n);
    case 'sawtooth':     return sawtooth(n, 4);
    case 'sorted-tail':  return sortedTailShuffled(n, rand, 0.1);
    case 'reversed-nearly': return reversedNearly(n, rand, 0.05);
    case 'all-equal':    return allEqual(n);
    case 'two-values':   return twoValues(n, rand);
    case 'gaussian':     return gaussian(n, rand);
    case 'sorted-outliers': return sortedOutliers(n, rand, 0.05);
    case 'med3-killer':  return med3Killer(n);
    default:             return shuffleInPlace(range1ToN(n), rand);
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
  // (Re)load each side, but skip a side that's already finished — its
  // animator's gen is null only because it ran to completion, not because it
  // needs a fresh start. Without this, pause-then-resume during a race
  // re-sorts the faster algorithm on top of its already-sorted output.
  if (!instA.animator.isLoaded && !finishedA) {
    const id = currentAlgoA ? currentAlgoA.id : ui.getSelectedAlgorithm().id;
    loadAlgorithm(id, { keepArray: true, which: 'A', internal: true });
  }
  if (isRace() && !instB.animator.isLoaded && !finishedB) {
    const id = currentAlgoB ? currentAlgoB.id : ui.getSelectedAlgorithmB().id;
    loadAlgorithm(id, { keepArray: true, which: 'B', internal: true });
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
  let winner;
  if (aOps < bOps) {
    winner = `${currentAlgoA.name} (saves ${(bOps - aOps).toLocaleString()} ops)`;
  } else if (bOps < aOps) {
    winner = `${currentAlgoB.name} (saves ${(aOps - bOps).toLocaleString()} ops)`;
  } else {
    winner = 'Tie';
  }
  ui.showSummary({
    algoName: `${currentAlgoA.name}  vs  ${currentAlgoB.name}`,
    algoNameA: currentAlgoA.name,
    algoNameB: currentAlgoB.name,
    n: instA.bars.length,
    comparisons: ca.comparisons,
    writes: ca.writes,
    comparisonsB: cb.comparisons,
    writesB: cb.writes,
    winner,
  });
  ui.setPlayLabel('Play');
}

// Adapt the UI hooks. The animator factory used to drive ui.setPlayLabel,
// but now we have two animators; let the play button manage its own label.

function clickPlayBoth() {
  sharedAudio.resume();
  // If every side is already done, treat play as "go again": fresh array +
  // start. Covers both space-while-summary-up and click-dismiss-then-play.
  const allDone = finishedA && (!isRace() || finishedB);
  if (allDone) {
    newArray({ regenerateSeed: true });
  }
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

// Single source of truth for speed: feed both animators the same slider value
// in the same call so race mode stays symmetric (ui.js only updates the
// display number — it does not touch animator speed).
const speedIn = document.getElementById('speed');
function applySpeed() {
  const v = parseInt(speedIn.value, 10);
  instA.animator.setSpeed(v);
  instB.animator.setSpeed(v);
  const rate = v <= 10 ? v / 10 : v - 9;
  // Above ~4 steps/frame the per-step displays flicker too much to read.
  const showStepDisplays = rate <= 4;
  instA.labels.setEnabled(showStepDisplays);
  instB.labels.setEnabled(showStepDisplays);
  document.body.classList.toggle('no-current-op', !showStepDisplays);
}
speedIn.addEventListener('input', applySpeed);
applySpeed();
// Mute toggle should mute the shared audio (which both instances use)
const muteIn = document.getElementById('mute');
muteIn.addEventListener('change', () => sharedAudio.setMuted(muteIn.checked));
