let audioCtx: AudioContext | null = null;

function getAudio(): AudioContext {
  if (!audioCtx)
    audioCtx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();
  return audioCtx;
}

export function unlockAudio(): void {
  getAudio();
}

/** Micro bip SF de déploiement — joué à chaque balise fermée en temps réel */
export function playDeployBip(): void {
  try {
    const ctx = getAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch {
    /* ignore */
  }
}

/** System online — jingle de validation d'étape (montée SF) */
export function playSystemOnline(): void {
  try {
    const ctx = getAudio();
    // Rising sci-fi arpeggio: E5 → G#5 → B5 → E6
    const notes = [659.25, 830.61, 987.77, 1318.5];
    const times = [0, 0.1, 0.2, 0.32];
    const gains = [0.2, 0.18, 0.16, 0.25];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g);
      g.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = ctx.currentTime + times[i];
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(gains[i], t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc.start(t);
      osc.stop(t + 0.25);
    });
    // Shimmer pad at end
    [1318.5, 1567.98, 1975.53].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g);
      g.connect(ctx.destination);
      osc.type = "triangle";
      osc.frequency.value = freq;
      const t = ctx.currentTime + 0.45;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.08 - i * 0.015, t + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.start(t);
      osc.stop(t + 0.55);
    });
  } catch {
    /* ignore */
  }
}

/** Brèche détectée — alarm buzz descendant */
export function playBreach(): void {
  try {
    const ctx = getAudio();
    // Two-tone alarm
    [0, 0.08].forEach((delay) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sawtooth";
      const t = ctx.currentTime + delay;
      osc.frequency.setValueAtTime(280, t);
      osc.frequency.linearRampToValueAtTime(140, t + 0.12);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.start(t);
      osc.stop(t + 0.18);
    });
  } catch {
    /* ignore */
  }
}

/** Fanfare finale de chapitre — victoire SF épique */
export function playFanfare(): void {
  try {
    const ctx = getAudio();
    const melody = [659, 784, 988, 1319, 988, 1319, 1568, 1976];
    const timing = [0, 0.11, 0.22, 0.35, 0.48, 0.6, 0.73, 0.88];
    melody.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.type = "sine";
      o.frequency.value = f;
      const t = ctx.currentTime + timing[i];
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.18, t + 0.025);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
      o.start(t);
      o.stop(t + 0.26);
    });
    // Final chord shimmer
    [1319, 1568, 1976, 2637].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g);
      g.connect(ctx.destination);
      osc.type = "triangle";
      osc.frequency.value = freq;
      const t = ctx.currentTime + 1.02;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.06 - i * 0.01, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
      osc.start(t);
      osc.stop(t + 0.85);
    });
  } catch {
    /* ignore */
  }
}
