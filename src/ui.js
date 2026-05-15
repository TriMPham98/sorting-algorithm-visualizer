import { algorithms, getAlgorithm } from './algorithms/index.js';

export function setupUI({ bars, animator, audio, onShuffle, onAlgorithmChange, onSizeChange, onModeChange, onMysteryAnswer }) {
  const algoSel = document.getElementById('algo');
  const sizeIn = document.getElementById('size');
  const sizeVal = document.getElementById('sizeVal');
  const speedIn = document.getElementById('speed');
  const speedVal = document.getElementById('speedVal');
  const shuffleBtn = document.getElementById('shuffle');
  const playBtn = document.getElementById('play');
  const stepBtn = document.getElementById('step');
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
  const sumWorst = document.getElementById('sumWorst');
  const sumRatio = document.getElementById('sumRatio');
  const descToggle = document.getElementById('descToggle');
  const descBody = document.getElementById('descBody');
  const shortcutsBtn = document.getElementById('shortcutsBtn');
  const shortcutsOverlay = document.getElementById('shortcutsOverlay');
  const modeSel = document.getElementById('mode');
  const algoRow = document.getElementById('algoRow');
  const codePanel = document.getElementById('code');
  const infoPanel = document.getElementById('info');
  const predictPanel = document.getElementById('predict');
  const predictFb = document.getElementById('predictFb');
  const predictScore = document.getElementById('predictScore');
  const mysteryAnswers = document.getElementById('mysteryAnswers');
  const mysteryGrid = document.getElementById('mysteryGrid');
  const mysteryResult = document.getElementById('mysteryResult');
  const algoBSel = document.getElementById('algoB');
  const algoBRow = document.getElementById('algoBRow');
  const hudB = document.getElementById('hudB');
  const compCountB = document.getElementById('compCountB');
  const writeCountB = document.getElementById('writeCountB');
  const hudBName = document.getElementById('hudBName');
  const hudAName = document.getElementById('hudAName');
  let predictRight = 0;
  let predictTotal = 0;

  for (const a of algorithms) {
    const opt = document.createElement('option');
    opt.value = a.id;
    opt.textContent = a.name;
    algoSel.appendChild(opt);
    const optB = opt.cloneNode(true);
    algoBSel.appendChild(optB);
  }
  // Default B to a different algo than A
  if (algorithms.length > 1) algoBSel.value = algorithms[1].id;

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

  muteIn.addEventListener('change', () => {
    audio.setMuted(muteIn.checked);
  });

  function setPlayLabel(text) {
    const btn = document.getElementById('play');
    if (btn) btn.textContent = text;
  }

  function updateCounters({ comparisons, writes }) {
    compCount.textContent = comparisons.toLocaleString();
    writeCount.textContent = writes.toLocaleString();
  }

  function updateCountersB({ comparisons, writes }) {
    compCountB.textContent = comparisons.toLocaleString();
    writeCountB.textContent = writes.toLocaleString();
  }

  function setRaceBName(name) {
    hudBName.textContent = `B · ${name}`;
  }

  function setRaceAName(name) {
    hudAName.textContent = `A · ${name}`;
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

  function setAlgorithmDescription(text) {
    descBody.textContent = text || '';
  }

  let descOpen = false;
  descToggle?.addEventListener('click', () => {
    descOpen = !descOpen;
    descBody.hidden = !descOpen;
    descToggle.textContent = descOpen ? '▴ Hide description' : '▾ What is this?';
  });

  shortcutsBtn?.addEventListener('click', () => toggleShortcutsOverlay());
  shortcutsOverlay?.addEventListener('click', () => toggleShortcutsOverlay(false));
  function toggleShortcutsOverlay(force) {
    const next = typeof force === 'boolean' ? force : shortcutsOverlay.hidden;
    shortcutsOverlay.hidden = !next;
  }

  function showSummary({ algoName, n, comparisons, writes, worstCompares, worstLabel }) {
    sumTitle.textContent = `${algoName} · n = ${n}`;
    sumComps.textContent = comparisons.toLocaleString();
    sumWrites.textContent = writes.toLocaleString();
    sumWorst.textContent = `≈ ${worstCompares.toLocaleString()} compares (${worstLabel})`;
    const ratio = worstCompares > 0 ? (comparisons / worstCompares) * 100 : 0;
    sumRatio.textContent = `${ratio.toFixed(0)}%`;
    summaryOverlay.hidden = false;
  }

  function hideSummary() {
    summaryOverlay.hidden = true;
  }

  summaryOverlay.addEventListener('click', (e) => {
    if (e.target === summaryOverlay) hideSummary();
  });

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

  modeSel.addEventListener('change', () => applyMode(modeSel.value));

  function applyMode(mode) {
    const isPredict = mode === 'predict';
    const isMystery = mode === 'mystery';
    const isRace = mode === 'race';
    document.body.classList.toggle('mode-single', !isRace);
    document.body.classList.toggle('mode-race', isRace);
    predictPanel.hidden = !isPredict;
    algoRow.hidden = isMystery;
    algoBRow.hidden = !isRace;
    hudB.hidden = !isRace;
    codePanel.style.visibility = isMystery ? 'hidden' : '';
    infoPanel.style.display = isMystery ? 'none' : '';
    if (isPredict) {
      predictRight = 0; predictTotal = 0;
      predictScore.textContent = '0 / 0';
      predictFb.textContent = '';
      predictFb.classList.remove('right', 'wrong');
    }
    mysteryAnswers.hidden = true;
    onModeChange?.(mode);
  }
  // Default mode is single-canvas.
  document.body.classList.add('mode-single');

  algoBSel.addEventListener('change', () => {
    onAlgorithmChange?.(algoBSel.value, { which: 'B' });
    setPlayLabel('Play');
  });

  predictPanel.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-pred]');
    if (!btn) return;
    audio.resume();
    if (!animator.isLoaded) {
      onAlgorithmChange(algoSel.value, { keepArray: true });
    }
    const guess = btn.dataset.pred;
    const next = animator.peekNextOperational();
    let actual;
    if (!next) actual = 'done';
    else actual = next.type;
    const correct = (guess === actual);
    predictTotal++;
    if (correct) predictRight++;
    predictScore.textContent = `${predictRight} / ${predictTotal}`;
    predictFb.textContent = correct
      ? `✓ correct — next is "${actual}"`
      : `✗ guessed "${guess}", actual "${actual}"`;
    predictFb.classList.remove('right', 'wrong');
    predictFb.classList.add(correct ? 'right' : 'wrong');
    // Now apply the peeked step
    animator.applyPeeked();
    if (!next) {
      // generator finished
      // Let main.js handle state via animator's onStateChange
    }
  });

  function buildMysteryAnswers(correctAlgoId, allAlgos) {
    mysteryGrid.replaceChildren();
    mysteryResult.textContent = '';
    mysteryResult.classList.remove('right', 'wrong');
    for (const a of allAlgos) {
      const btn = document.createElement('button');
      btn.textContent = a.name;
      btn.addEventListener('click', () => {
        const right = a.id === correctAlgoId;
        for (const b of mysteryGrid.querySelectorAll('button')) {
          b.disabled = true;
          if (b.textContent === a.name && !right) b.classList.add('wrong');
          if (b.dataset.algoId === correctAlgoId) b.classList.add('correct');
        }
        mysteryResult.textContent = right ? '✓ correct!' : `✗ it was ${algorithms.find(x => x.id === correctAlgoId).name}`;
        mysteryResult.classList.add(right ? 'right' : 'wrong');
        onMysteryAnswer?.(a.id, correctAlgoId);
      });
      btn.dataset.algoId = a.id;
      mysteryGrid.appendChild(btn);
    }
    mysteryAnswers.hidden = false;
  }

  function setAlgorithm(id) {
    if (algoSel.value === id) return;
    algoSel.value = id;
    onAlgorithmChange(id);
    setPlayLabel('Play');
  }
  function setPreset(p) {
    if (presetSel.value === p) return;
    presetSel.value = p;
    onShuffle();
    setPlayLabel('Play');
  }
  function setSize(n) {
    const clamped = Math.max(parseInt(sizeIn.min, 10) || 16, Math.min(parseInt(sizeIn.max, 10) || 200, n));
    if (parseInt(sizeIn.value, 10) === clamped) return;
    sizeIn.value = String(clamped);
    sizeVal.textContent = sizeIn.value;
    onSizeChange(clamped);
    setPlayLabel('Play');
  }
  function bumpSpeed(delta) {
    const next = Math.max(parseInt(speedIn.min, 10) || 1, Math.min(parseInt(speedIn.max, 10) || 50, parseInt(speedIn.value, 10) + delta));
    if (parseInt(speedIn.value, 10) === next) return;
    speedIn.value = String(next);
    syncSpeed();
  }
  function toggleMute() {
    muteIn.checked = !muteIn.checked;
    audio.setMuted(muteIn.checked);
  }
  function clickPlay() { playBtn.click(); }
  function clickStep() { stepBtn.click(); }
  function clickShuffle() { shuffleBtn.click(); }

  return {
    getSelectedAlgorithm: () => getAlgorithm(algoSel.value),
    getSize: () => parseInt(sizeIn.value, 10),
    getPreset: () => presetSel.value,
    setPlayLabel,
    updateCounters,
    setPseudocode,
    setCursorLine,
    setAlgorithmInfo,
    setAlgorithmDescription,
    showSummary,
    hideSummary,
    setAlgorithm,
    setPreset,
    setSize,
    bumpSpeed,
    toggleMute,
    clickPlay,
    clickStep,
    clickShuffle,
    toggleShortcutsOverlay,
    getMode: () => modeSel.value,
    getSelectedAlgorithmB: () => getAlgorithm(algoBSel.value),
    applyMode,
    buildMysteryAnswers,
    updateCountersB,
    setRaceBName,
    setRaceAName,
  };
}
