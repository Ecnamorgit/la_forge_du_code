"use client";

import { REPLAY_INTRO_EVENT } from "./IntroCinematicMount";

export default function ReplayIntroButton() {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event(REPLAY_INTRO_EVENT))}
      className="font-tech text-[10px] uppercase tracking-[0.3em] text-nebula-text-dim transition-colors hover:text-nebula-cyan"
    >
      ▶ Revoir l&apos;intro
    </button>
  );
}
