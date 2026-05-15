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
    master.gain.value = 0.2;
    // Compressor catches the loudness buildup that happens when many tones
    // fire within each other's attack/release window at high stepRates.
    // Heavy ratio + fast attack acts as a near-limiter.
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -22;  // dB — start compressing well below 0dBFS
    comp.knee.value = 6;
    comp.ratio.value = 12;
    comp.attack.value = 0.003;
    comp.release.value = 0.18;
    master.connect(comp);
    comp.connect(ctx.destination);
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

  // Returns an audio wrapper that applies a pan to every tone. `pan` may be
  // a number (fixed) or a function returning a number (sampled each call), so
  // callers can switch panning on/off at runtime, e.g., only in race mode.
  function panned(pan) {
    return {
      playTone(v, max, opts = {}) {
        const p = typeof pan === 'function' ? pan() : pan;
        playTone(v, max, { ...opts, pan: p });
      },
      resume,
      setMuted(m) { muted = !!m; },
    };
  }

  function setMuted(v) {
    muted = !!v;
  }

  return { playTone, resume, setMuted, panned };
}
