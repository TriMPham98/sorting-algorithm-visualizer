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

const animator = createAnimator({
  bars,
  audio,
  onStateChange(state) {
    if (!ui) return;
    if (state === 'playing') ui.setPlayLabel('Pause');
    else if (state === 'paused') ui.setPlayLabel('Play');
    else if (state === 'finished') ui.setPlayLabel('Play');
    else if (state === 'stopped') ui.setPlayLabel('Play');
  },
});

onTick(() => animator.tick());

function makeShuffledArray(n) {
  const arr = new Array(n);
  for (let i = 0; i < n; i++) arr[i] = i + 1;
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
}

function shuffle() {
  animator.stop();
  const n = ui ? ui.getSize() : 64;
  bars.setValues(makeShuffledArray(n));
}

function loadAlgorithm(id, { keepArray = false } = {}) {
  if (!keepArray) {
    animator.stop();
    return;
  }
  // load generator over current bar values
  const algo = getAlgorithm(id);
  const working = bars.getValues();
  // reset sorted markers — fresh run
  bars.setValues(working);
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
shuffle();
