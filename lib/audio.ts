let audioCtx: AudioContext | null = null;

function getAudio(): AudioContext {
  if (!audioCtx)
    audioCtx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();
  return audioCtx;
}

const SOUND_PREF_KEY = "nebula-sound-enabled-v1";

/** Vrai si l'utilisateur n'a pas coupé le son (activé par défaut). */
export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(SOUND_PREF_KEY) !== "false";
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SOUND_PREF_KEY, enabled ? "true" : "false");
  // Prévient les composants de l'onglet abonnés au changement.
  window.dispatchEvent(new CustomEvent("nebula:sound-changed", { detail: enabled }));
}

export function unlockAudio(): void {
  if (!isSoundEnabled()) return;
  getAudio();
}

/** Bip court de déploiement (balise fermée, scène suivante). */
export function playDeployBip(): void {
  if (!isSoundEnabled()) return;
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

/** « Système en ligne » : jingle de validation d'étape. */
export function playSystemOnline(): void {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudio();
    // Arpège montant : E5, G#5, B5, E6.
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
    // Nappe scintillante finale.
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

/** « Brèche détectée » : alarme descendante. */
export function playBreach(): void {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudio();
    // Alarme à deux tons.
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

/** Fanfare de fin de chapitre. */
export function playFanfare(): void {
  if (!isSoundEnabled()) return;
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
    // Accord final scintillant.
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
