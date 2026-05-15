export function createAnimator({ bars, audio, onStateChange, onCountersChange, onCursorChange }) {
  let gen = null;
  let playing = false;
  let stepRate = 1;       // steps per frame; can be fractional
  let accumulator = 0;
  const MAX_PER_TICK = 200;
  // Accumulates every index highlighted in this tick. Each new tick clears
  // them all (so a fast tick that touched many bars doesn't leave a trail).
  let touched = new Set();
  let counters = { comparisons: 0, writes: 0 };
  let lastCursorLine = -1;
  let lastCursorKind = 'default';
  let peekBuffer = null;

  // Map a step type to the same color "kind" used by bars.highlight.
  function kindFor(type) {
    if (type === 'compare') return 'compare';
    if (type === 'swap' || type === 'overwrite') return 'swap';
    if (type === 'mark-sorted') return 'sorted';
    return 'default';
  }

  function resetCounters() {
    counters = { comparisons: 0, writes: 0 };
    onCountersChange?.(counters);
    lastCursorLine = -1;
    lastCursorKind = 'default';
    onCursorChange?.(-1, 'default');
  }

  function clearLast() {
    if (touched.size) {
      bars.clearHighlight([...touched]);
      touched.clear();
    }
  }

  function markTouched(...indices) {
    for (const i of indices) touched.add(i);
  }

  function load(generator) {
    stop();
    gen = generator;
    accumulator = 0;
    peekBuffer = null;
    resetCounters();
  }

  function stop() {
    playing = false;
    gen = null;
    clearLast();
    resetCounters();
    onStateChange?.('stopped');
  }

  function play() {
    if (!gen) return;
    if (!playing) {
      playing = true;
      audio.resume();
      onStateChange?.('playing');
    }
  }

  function pause() {
    if (playing) {
      playing = false;
      onStateChange?.('paused');
    }
  }

  function toggle() {
    if (playing) pause(); else play();
  }

  // Slider 1..50 → fractional stepRate:
  //  slider 1..10  → 0.1 .. 1.0 (6 → 60 steps/sec)
  //  slider 11..50 → 2 .. 41 steps/frame
  function setSpeed(s) {
    const v = Math.max(1, Math.min(50, Math.floor(s)));
    stepRate = v <= 10 ? v / 10 : v - 9;
  }

  function pumpOneStep() {
    let step;
    if (peekBuffer) {
      step = peekBuffer;
      peekBuffer = null;
    } else {
      const next = gen.next();
      if (next.done) return false;
      step = next.value;
    }
    applyStep(step);
    if (typeof step.line === 'number') {
      lastCursorLine = step.line;
      lastCursorKind = kindFor(step.type);
    }
    return true;
  }

  // Peek next step without applying it. Returns the step object,
  // or null if the generator is exhausted.
  function peekStep() {
    if (!gen) return null;
    if (!peekBuffer) {
      const next = gen.next();
      if (next.done) return null;
      peekBuffer = next.value;
    }
    return peekBuffer;
  }

  // Silently advance past structural steps (range/pivot/heap-end)
  // and return the next *operational* step (or null).
  function peekNextOperational() {
    while (true) {
      const p = peekStep();
      if (!p) return null;
      if (p.type === 'range' || p.type === 'pivot' || p.type === 'heap-end') {
        // Apply silently (no counters, no cursor flush)
        applyStep(peekBuffer);
        peekBuffer = null;
        continue;
      }
      return p;
    }
  }

  function applyPeeked() {
    if (!peekBuffer) return false;
    clearLast();
    const beforeOps = counters.comparisons + counters.writes;
    const beforeLine = lastCursorLine;
    const beforeKind = lastCursorKind;
    pumpOneStep();
    flushIfChanged(beforeOps, beforeLine, beforeKind);
    return true;
  }

  function flushIfChanged(beforeOps, beforeLine, beforeKind) {
    if (counters.comparisons + counters.writes !== beforeOps) {
      onCountersChange?.(counters);
    }
    if (lastCursorLine !== beforeLine || lastCursorKind !== beforeKind) {
      onCursorChange?.(lastCursorLine, lastCursorKind);
    }
  }

  function tick() {
    if (!playing || !gen) return;
    clearLast();
    accumulator += stepRate;
    const beforeOps = counters.comparisons + counters.writes;
    const beforeLine = lastCursorLine;
    const beforeKind = lastCursorKind;
    let steps = 0;
    let done = false;
    while (accumulator >= 1 && steps < MAX_PER_TICK) {
      accumulator -= 1;
      if (!pumpOneStep()) { done = true; break; }
      steps++;
    }
    flushIfChanged(beforeOps, beforeLine, beforeKind);
    if (done) {
      bars.markAllSorted();
      playing = false;
      gen = null;
      onStateChange?.('finished');
    }
  }

  function stepOnce() {
    if (!gen) return;
    clearLast();
    const beforeOps = counters.comparisons + counters.writes;
    const beforeLine = lastCursorLine;
    const beforeKind = lastCursorKind;
    const advanced = pumpOneStep();
    flushIfChanged(beforeOps, beforeLine, beforeKind);
    if (!advanced) {
      bars.markAllSorted();
      gen = null;
      onStateChange?.('finished');
    }
  }

  function applyStep(step) {
    if (!step) return;
    switch (step.type) {
      case 'compare': {
        bars.highlight([step.i, step.j], 'compare');
        markTouched(step.i, step.j);
        counters.comparisons++;
        const vals = bars.getValues();
        const max = Math.max(...vals, 1);
        audio.playTone(vals[step.i], max);
        break;
      }
      case 'swap': {
        bars.swap(step.i, step.j);
        bars.highlight([step.i, step.j], 'swap');
        markTouched(step.i, step.j);
        counters.writes += 2;
        const vals = bars.getValues();
        const max = Math.max(...vals, 1);
        audio.playTone(vals[step.i], max);
        break;
      }
      case 'overwrite': {
        bars.overwrite(step.i, step.value);
        bars.highlight([step.i], 'swap');
        markTouched(step.i);
        counters.writes++;
        audio.playTone(step.value, Math.max(...bars.getValues(), 1));
        break;
      }
      case 'mark-sorted': {
        bars.markSorted(step.i);
        touched.delete(step.i);
        break;
      }
      case 'range': {
        bars.setRange(step.lo ?? null, step.hi ?? null);
        break;
      }
      case 'pivot': {
        bars.setPivot(step.i ?? null);
        break;
      }
      case 'heap-end': {
        bars.setHeapEnd(step.end ?? null);
        break;
      }
    }
  }

  return {
    load, play, pause, toggle, stop, setSpeed, tick, stepOnce,
    peekStep, peekNextOperational, applyPeeked,
    getCounters() { return { ...counters }; },
    get isPlaying() { return playing; },
    get isLoaded() { return gen !== null; },
  };
}
