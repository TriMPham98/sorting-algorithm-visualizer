export function createAnimator({ bars, audio, onStateChange, onCountersChange }) {
  let gen = null;
  let playing = false;
  let stepsPerFrame = 4;
  // Accumulates every index highlighted in this tick. Each new tick clears
  // them all (so a fast tick that touched many bars doesn't leave a trail).
  let touched = new Set();
  let counters = { comparisons: 0, writes: 0 };

  function resetCounters() {
    counters = { comparisons: 0, writes: 0 };
    onCountersChange?.(counters);
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

  function setSpeed(s) {
    stepsPerFrame = Math.max(1, Math.floor(s));
  }

  function tick() {
    if (!playing || !gen) return;
    clearLast();
    const before = counters.comparisons + counters.writes;
    let done = false;
    for (let s = 0; s < stepsPerFrame; s++) {
      const next = gen.next();
      if (next.done) { done = true; break; }
      applyStep(next.value);
    }
    if (counters.comparisons + counters.writes !== before) {
      onCountersChange?.(counters);
    }
    if (done) {
      bars.markAllSorted();
      playing = false;
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
    }
  }

  return {
    load, play, pause, toggle, stop, setSpeed, tick,
    getCounters() { return { ...counters }; },
    get isPlaying() { return playing; },
    get isLoaded() { return gen !== null; },
  };
}
