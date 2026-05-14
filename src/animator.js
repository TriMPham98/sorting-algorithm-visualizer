export function createAnimator({ bars, audio, onStateChange }) {
  let gen = null;
  let playing = false;
  let stepsPerFrame = 4;
  let lastHighlighted = [];

  function clearLast() {
    if (lastHighlighted.length) {
      bars.clearHighlight(lastHighlighted);
      lastHighlighted = [];
    }
  }

  function load(generator) {
    stop();
    gen = generator;
  }

  function stop() {
    playing = false;
    gen = null;
    clearLast();
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
    let done = false;
    for (let s = 0; s < stepsPerFrame; s++) {
      const next = gen.next();
      if (next.done) { done = true; break; }
      applyStep(next.value);
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
        lastHighlighted = [step.i, step.j];
        const vals = bars.getValues();
        const max = Math.max(...vals, 1);
        audio.playTone(vals[step.i], max);
        break;
      }
      case 'swap': {
        bars.swap(step.i, step.j);
        bars.highlight([step.i, step.j], 'swap');
        lastHighlighted = [step.i, step.j];
        const vals = bars.getValues();
        const max = Math.max(...vals, 1);
        audio.playTone(vals[step.i], max);
        break;
      }
      case 'overwrite': {
        bars.overwrite(step.i, step.value);
        bars.highlight([step.i], 'swap');
        lastHighlighted = [step.i];
        audio.playTone(step.value, Math.max(...bars.getValues(), 1));
        break;
      }
      case 'mark-sorted': {
        bars.markSorted(step.i);
        break;
      }
    }
  }

  return {
    load, play, pause, toggle, stop, setSpeed, tick,
    get isPlaying() { return playing; },
    get isLoaded() { return gen !== null; },
  };
}
