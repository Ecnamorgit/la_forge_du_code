"use client";

import { CRAWL_LINES } from "@/lib/lore";

interface StarWarsCrawlProps {
  onComplete?: () => void;
  onSkip?: () => void;
  /** Durée du défilement en secondes. */
  durationSeconds?: number;
  /** Sans mouvement : le texte est affiché d'un bloc, sans défilement. */
  reducedMotion?: boolean;
}

export default function StarWarsCrawl({
  onComplete,
  onSkip,
  durationSeconds = 15,
  reducedMotion = false,
}: StarWarsCrawlProps) {
  const body = (
    <div className="text-center">
      <div className="mb-16 flex flex-col items-center gap-3">
        <span className="font-tech text-sm tracking-[0.45em] uppercase text-nebula-cyan sm:text-base">
          --- TRANSMISSION SPATIALE REÇUE ---
        </span>
        <h1 className="font-tech text-3xl font-bold uppercase tracking-[0.25em] text-yellow-400 drop-shadow-[0_0_20px_rgba(255,230,0,0.4)] sm:text-5xl lg:text-6xl">
          COALITION NEBULA
        </h1>
      </div>

      {CRAWL_LINES.map((line, i) =>
        line.kind === "title" ? (
          <h2
            key={i}
            className="mb-6 font-tech text-2xl font-bold uppercase tracking-widest text-nebula-orange sm:text-4xl"
          >
            {line.text}
          </h2>
        ) : (
          <p
            key={i}
            className="mb-14 font-body text-lg leading-relaxed text-yellow-300 sm:text-2xl lg:text-3xl"
          >
            {line.text}
          </p>
        )
      )}
    </div>
  );

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-nebula-bg-darkest font-tech text-yellow-400">
      <div className="pointer-events-none absolute inset-0 bg-nebula-stars opacity-85" />
      <div className="pointer-events-none absolute top-0 z-20 h-28 w-full bg-gradient-to-b from-nebula-bg-darkest via-nebula-bg-darkest/95 to-transparent" />
      <div className="pointer-events-none absolute bottom-0 z-20 h-28 w-full bg-gradient-to-t from-nebula-bg-darkest via-nebula-bg-darkest/90 to-transparent" />

      {reducedMotion ? (
        <div className="z-10 max-h-[78vh] w-[92vw] max-w-3xl overflow-y-auto px-4 sm:px-8">
          {body}
        </div>
      ) : (
        <div className="starwars-crawl-container z-10 flex h-[78vh] w-[92vw] max-w-5xl items-center justify-center px-4 sm:px-8">
          <div
            className="starwars-crawl-content"
            style={{ "--crawl-duration": `${durationSeconds}s` } as React.CSSProperties}
            onAnimationEnd={onComplete}
          >
            {body}
          </div>
        </div>
      )}

      {/* Toujours visible, dès la première seconde : un skip caché transforme
          la curiosité en agacement. */}
      <div className="z-30 mt-2 flex items-center gap-4">
        <button
          onClick={onSkip ?? onComplete}
          className="rounded-sm bg-nebula-cyan px-6 py-2.5 font-tech text-xs font-bold uppercase tracking-widest text-nebula-bg-darkest transition-all hover:brightness-110 sm:text-sm"
        >
          {reducedMotion ? "Continuer →" : "Passer →"}
        </button>
      </div>
    </div>
  );
}
