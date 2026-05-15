export function createAudio() {
  let ctx = null;
  let master = null;
  let muted = false;

  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.15;
    master.connect(ctx.destination);
    return ctx;
  }

  function resume() {
    const c = ensure();
    if (c && c.state === 'suspended') c.resume();
  }

  function playTone(value, maxValue, opts = {}) {
    if (muted) return;
    const c = ensure();
    if (!c) return;
    const ratio = Math.min(1, Math.max(0, value / Math.max(1, maxValue)));
    const minF = 200, maxF = 900;
    const freq = minF + ratio * (maxF - minF);

    const now = c.currentTime;
    const osc = c.createOscillator();
    osc.type = opts.type || 'triangle';
    osc.frequency.value = freq;

    const g = c.createGain();
    const attack = 0.005;
    const release = 0.05;
    const peak = opts.peak ?? 0.8;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(peak, now + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, now + attack + release);

    let tail = g;
    if (typeof opts.pan === 'number' && c.createStereoPanner) {
      const panner = c.createStereoPanner();
      panner.pan.value = Math.max(-1, Math.min(1, opts.pan));
      g.connect(panner);
      tail = panner;
    }

    osc.connect(g);
    tail.connect(master);
    osc.start(now);
    osc.stop(now + attack + release + 0.02);
  }

  // Returns an audio wrapper with a fixed pan applied to every tone.
  function panned(pan) {
    return {
      playTone(v, max, opts = {}) { playTone(v, max, { ...opts, pan }); },
      resume,
      setMuted(m) { muted = !!m; },
    };
  }

  function setMuted(v) {
    muted = !!v;
  }

  return { playTone, resume, setMuted, panned };
}
