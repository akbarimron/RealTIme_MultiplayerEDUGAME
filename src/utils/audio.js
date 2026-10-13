// Web Audio API Synthesizer - 100% Offline, Zero Asset Latency

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(val) {
    this.muted = val;
  }

  // Peluit Lokomotif Uap Klasik
  playWhistle() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [587.33, 739.99].forEach((freq) => { // D5 & F#5 train horn intervals
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.linearRampToValueAtTime(freq + 15, t + 0.3);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.15);
      gain.gain.linearRampToValueAtTime(0.10, t + 0.7);
      gain.gain.linearRampToValueAtTime(0.001, t + 1.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 1.15);
    });
  }

  // Jawaban Benar (Chime Arpeggio Sukses)
  playCorrect() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.07);

      gain.gain.setValueAtTime(0.2, t + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.07 + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.07);
      osc.stop(t + idx * 0.07 + 0.3);
    });
  }

  // Jawaban Salah: "Turun Sekali" (Low buzzer + slide down)
  playWrong() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.4);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.45);
  }

  // Ledakan Bom Sabotase (Deep Bass + Noise Explosion)
  playBomb() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 1. Sub Bass Drop
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(160, t);
    sub.frequency.exponentialRampToValueAtTime(30, t + 0.5);

    subGain.gain.setValueAtTime(0.4, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    sub.connect(subGain);
    subGain.connect(this.ctx.destination);
    sub.start(t);
    sub.stop(t + 0.6);

    // 2. White Noise Blast
    const bufferSize = this.ctx.sampleRate * 0.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(100, t + 0.5);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    noise.start(t);
  }

  // Mantra Es Pembeku (High Crystal Shimmer)
  playFreeze() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [1200, 1600, 2400].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.05);

      gain.gain.setValueAtTime(0.12, t + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.6);
    });
  }

  // Perisai Aktif (Resonant Shield Hum)
  playShield() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.35);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.4);
  }

  // Nitro Turbo Boost
  playNitro() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(1100, t + 0.3);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.4);
  }

  // --- helper bunyi sintetis ---
  tone(freq, { type = 'sine', at = 0, dur = 0.2, gain = 0.18, to = null } = {}) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime + at;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  noise({ at = 0, dur = 0.25, gain = 0.2, from = 2000, to = 300, type = 'lowpass' } = {}) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime + at;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(from, t);
    f.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f);
    f.connect(g);
    g.connect(this.ctx.destination);
    src.start(t);
  }

  playThrow() { this.noise({ dur: 0.3, gain: 0.12, from: 600, to: 3000, type: 'bandpass' }); }
  playPop() { [660, 880, 1320].forEach((f, i) => this.tone(f, { type: 'triangle', at: i * 0.06, dur: 0.18, gain: 0.16 })); }
  playSplat() { this.noise({ dur: 0.22, gain: 0.3, from: 1200, to: 120 }); this.tone(180, { type: 'sine', dur: 0.15, gain: 0.2, to: 60 }); }
  playSqueak() { this.tone(1300, { type: 'square', dur: 0.09, gain: 0.07, to: 1800 }); this.tone(1500, { type: 'square', at: 0.1, dur: 0.08, gain: 0.06, to: 1100 }); }
  playGlitch() { [0, 0.05, 0.1, 0.16].forEach((at) => this.tone(200 + Math.random() * 1400, { type: 'square', at, dur: 0.05, gain: 0.07 })); }
  playSlip() { this.tone(900, { type: 'sine', dur: 0.35, gain: 0.16, to: 150 }); }
  playSwap() { this.tone(300, { type: 'triangle', dur: 0.25, gain: 0.16, to: 900 }); this.tone(900, { type: 'triangle', at: 0.18, dur: 0.25, gain: 0.14, to: 300 }); }
  playDark() { this.tone(220, { type: 'sawtooth', dur: 0.4, gain: 0.1, to: 55 }); }
  playFog() { this.noise({ dur: 0.7, gain: 0.12, from: 500, to: 200 }); }
  playSpring() { this.tone(220, { type: 'triangle', dur: 0.32, gain: 0.2, to: 880 }); }
  playMirror() { [1568, 2093, 1568].forEach((f, i) => this.tone(f, { type: 'sine', at: i * 0.05, dur: 0.22, gain: 0.1 })); }
  playBubbles() { [700, 900, 1200, 1000].forEach((f, i) => this.tone(f, { type: 'sine', at: i * 0.06, dur: 0.1, gain: 0.1, to: f * 1.5 })); }
  playTick() { this.tone(1000, { type: 'square', dur: 0.03, gain: 0.05 }); }

  // pemetaan skill -> bunyi. phase: 'throw' (dilempar) | 'hit' (kena)
  playSkill(id, phase = 'hit') {
    if (phase === 'throw') { this.playThrow(); return; }
    const map = {
      bomb: () => this.playBomb(),
      snip: () => this.playSlip(),
      magnet: () => this.playSwap(),
      swap: () => this.playSwap(),
      chaos: () => this.playSwap(),
      spring: () => this.playSpring(),
      ink: () => this.playSplat(),
      fog: () => this.playFog(),
      flip: () => this.playSwap(),
      blackout: () => this.playDark(),
      ducks: () => this.playSqueak(),
      freeze: () => this.playFreeze(),
      hack: () => this.playGlitch(),
      banana: () => this.playSlip(),
      steal: () => this.playPop(),
      shield: () => this.playShield(),
      mirror: () => this.playMirror(),
      cleanse: () => this.playBubbles()
    };
    (map[id] || (() => this.playPop()))();
  }

  // Fanfare Kemenangan (Pemenang Balapan!)
  playVictory() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const melody = [
      { f: 523.25, d: 0.15 }, // C5
      { f: 523.25, d: 0.15 }, // C5
      { f: 523.25, d: 0.15 }, // C5
      { f: 659.25, d: 0.4 },  // E5
      { f: 587.33, d: 0.2 },  // D5
      { f: 659.25, d: 0.2 },  // E5
      { f: 783.99, d: 0.6 }   // G5
    ];

    let current = t;
    melody.forEach((note) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, current);

      gain.gain.setValueAtTime(0.25, current);
      gain.gain.exponentialRampToValueAtTime(0.01, current + note.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(current);
      osc.stop(current + note.d + 0.05);

      current += note.d + 0.05;
    });
  }
}

export const sounds = new SoundEngine();
