"use client";

import Link from "next/link";

export default function TrialBanner() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 border-b border-nebula-orange/40 bg-nebula-orange/10 px-4 py-2 text-center">
      <span className="font-tech text-[11px] uppercase tracking-widest text-nebula-orange sm:text-xs">
        Mode essai — ta progression est locale
      </span>
      <Link
        href="/signup"
        className="font-tech text-[11px] uppercase tracking-widest text-nebula-cyan underline underline-offset-4 hover:brightness-125 sm:text-xs"
      >
        Créer mon compte
      </Link>
    </div>
  );
}
