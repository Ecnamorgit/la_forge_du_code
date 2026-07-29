"use client";

import Link from "next/link";

export default function TrialConversion({ xp }: { xp: number }) {
  return (
    <section className="mx-auto my-8 max-w-xl rounded-sm border border-nebula-cyan/40 bg-nebula-bg-panel/90 p-6 text-center backdrop-blur-md sm:p-8">
      <p className="mb-2 font-tech text-xs uppercase tracking-[0.35em] text-nebula-cyan">
        Protocole restauré
      </p>
      <p className="mb-6 font-display text-3xl text-nebula-orange sm:text-4xl">
        +{xp} XP
      </p>
      <p className="mb-7 font-body text-base leading-relaxed text-nebula-text-secondary">
        Cette progression n&apos;existe que dans ce navigateur. Crée ton compte
        pour la conserver, débloquer les chapitres suivants et configurer ton
        Cadet.
      </p>
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/signup"
          className="rounded-sm bg-nebula-cyan px-8 py-3 font-tech text-sm font-bold uppercase tracking-[0.18em] text-nebula-bg-darkest shadow-[0_4px_0_var(--cyan-dim)]"
        >
          {"> "}Garder ma progression
        </Link>
        <Link
          href="/codex"
          className="rounded-sm border border-nebula-cyan-dim px-8 py-3 font-tech text-sm font-bold uppercase tracking-[0.18em] text-nebula-cyan"
        >
          Lire le Codex
        </Link>
      </div>
    </section>
  );
}
