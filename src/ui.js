import { algorithms, getAlgorithm } from './algorithms/index.js';

export function setupUI({ bars, animator, audio, onShuffle, onAlgorithmChange, onSizeChange }) {
  const algoSel = document.getElementById('algo');
  const sizeIn = document.getElementById('size');
  const sizeVal = document.getElementById('sizeVal');
  const speedIn = document.getElementById('speed');
  const speedVal = document.getElementById('speedVal');
  const shuffleBtn = document.getElementById('shuffle');
  const playBtn = document.getElementById('play');
  const resetBtn = document.getElementById('reset');
  const muteIn = document.getElementById('mute');

  for (const a of algorithms) {
    const opt = document.createElement('option');
    opt.value = a.id;
    opt.textContent = a.name;
    algoSel.appendChild(opt);
  }

  function syncSpeed() {
    speedVal.textContent = speedIn.value;
    animator.setSpeed(parseInt(speedIn.value, 10));
  }
  speedIn.addEventListener('input', syncSpeed);
  syncSpeed();

  sizeIn.addEventListener('input', () => {
    sizeVal.textContent = sizeIn.value;
  });
  sizeIn.addEventListener('change', () => {
    onSizeChange(parseInt(sizeIn.value, 10));
    setPlayLabel('Play');
  });

  algoSel.addEventListener('change', () => {
    onAlgorithmChange(algoSel.value);
    setPlayLabel('Play');
  });

  shuffleBtn.addEventListener('click', () => {
    audio.resume();
    onShuffle();
    setPlayLabel('Play');
  });

  playBtn.addEventListener('click', () => {
    audio.resume();
    if (animator.isPlaying) {
      animator.pause();
    } else if (animator.isLoaded) {
      animator.play();
    } else {
      onAlgorithmChange(algoSel.value, { keepArray: true });
      animator.play();
    }
  });

  resetBtn.addEventListener('click', () => {
    onShuffle();
    setPlayLabel('Play');
  });

  muteIn.addEventListener('change', () => {
    audio.setMuted(muteIn.checked);
  });

  function setPlayLabel(text) {
    playBtn.textContent = text;
  }

  return {
    getSelectedAlgorithm: () => getAlgorithm(algoSel.value),
    getSize: () => parseInt(sizeIn.value, 10),
    setPlayLabel,
  };
}
