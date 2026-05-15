import { algorithms, getAlgorithm } from './algorithms/index.js';

export function setupUI({ bars, animator, audio, onShuffle, onAlgorithmChange, onSizeChange }) {
  const algoSel = document.getElementById('algo');
  const sizeIn = document.getElementById('size');
  const sizeVal = document.getElementById('sizeVal');
  const speedIn = document.getElementById('speed');
  const speedVal = document.getElementById('speedVal');
  const shuffleBtn = document.getElementById('shuffle');
  const playBtn = document.getElementById('play');
  const stepBtn = document.getElementById('step');
  const resetBtn = document.getElementById('reset');
  const muteIn = document.getElementById('mute');
  const presetSel = document.getElementById('preset');
  const compCount = document.getElementById('compCount');
  const writeCount = document.getElementById('writeCount');
  const codeList = document.getElementById('codeList');
  let codeLineEls = [];
  let activeLine = -1;
  const infoBest = document.getElementById('infoBest');
  const infoAvg = document.getElementById('infoAvg');
  const infoWorst = document.getElementById('infoWorst');
  const infoSpace = document.getElementById('infoSpace');
  const infoStable = document.getElementById('infoStable');
  const infoInPlace = document.getElementById('infoInPlace');
  const summaryOverlay = document.getElementById('summaryOverlay');
  const sumTitle = document.getElementById('sumTitle');
  const sumComps = document.getElementById('sumComps');
  const sumWrites = document.getElementById('sumWrites');
  const sumTime = document.getElementById('sumTime');
  const sumWorst = document.getElementById('sumWorst');
  const sumRatio = document.getElementById('sumRatio');

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

  stepBtn.addEventListener('click', () => {
    audio.resume();
    if (animator.isPlaying) animator.pause();
    if (!animator.isLoaded) {
      onAlgorithmChange(algoSel.value, { keepArray: true });
    }
    animator.stepOnce();
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

  function updateCounters({ comparisons, writes }) {
    compCount.textContent = comparisons.toLocaleString();
    writeCount.textContent = writes.toLocaleString();
  }

  function setAlgorithmInfo(info) {
    if (!info) return;
    infoBest.textContent = info.best;
    infoAvg.textContent = info.average;
    infoWorst.textContent = info.worst;
    infoSpace.textContent = info.space;
    infoStable.textContent = info.stable ? 'yes' : 'no';
    infoInPlace.textContent = info.inPlace ? 'yes' : 'no';
  }

  function showSummary({ algoName, n, comparisons, writes, elapsedMs, worstCompares, worstLabel }) {
    sumTitle.textContent = `${algoName} · n = ${n}`;
    sumComps.textContent = comparisons.toLocaleString();
    sumWrites.textContent = writes.toLocaleString();
    sumTime.textContent = `${(elapsedMs / 1000).toFixed(2)}s`;
    sumWorst.textContent = `≈ ${worstCompares.toLocaleString()} compares (${worstLabel})`;
    const ratio = worstCompares > 0 ? (comparisons / worstCompares) * 100 : 0;
    sumRatio.textContent = `${ratio.toFixed(0)}%`;
    summaryOverlay.hidden = false;
  }

  function hideSummary() {
    summaryOverlay.hidden = true;
  }

  summaryOverlay.addEventListener('click', hideSummary);

  function setPseudocode(lines) {
    codeList.replaceChildren();
    codeLineEls = lines.map((text) => {
      const li = document.createElement('li');
      li.textContent = text;
      codeList.appendChild(li);
      return li;
    });
    activeLine = -1;
  }

  let activeKind = 'default';
  function setCursorLine(line, kind = 'default') {
    if (line === activeLine && kind === activeKind) return;
    if (activeLine >= 0 && codeLineEls[activeLine]) {
      const el = codeLineEls[activeLine];
      el.classList.remove('active', `active-${activeKind}`);
    }
    if (line >= 0 && codeLineEls[line]) {
      const el = codeLineEls[line];
      el.classList.add('active', `active-${kind}`);
    }
    activeLine = line;
    activeKind = kind;
  }

  presetSel.addEventListener('change', () => {
    onShuffle();
    setPlayLabel('Play');
  });

  return {
    getSelectedAlgorithm: () => getAlgorithm(algoSel.value),
    getSize: () => parseInt(sizeIn.value, 10),
    getPreset: () => presetSel.value,
    setPlayLabel,
    updateCounters,
    setPseudocode,
    setCursorLine,
    setAlgorithmInfo,
    showSummary,
    hideSummary,
  };
}
