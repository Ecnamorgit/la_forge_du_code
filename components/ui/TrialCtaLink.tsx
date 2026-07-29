"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { TRIAL_CHAPTER, TRIAL_COURSE } from "@/lib/public-routes";

export default function TrialCtaLink({
  className,
  children,
}: {
  className?: string;
  /** Libellé du lien, propre à chaque appelant. */
  children: ReactNode;
}) {
  const ping = () => {
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "essai_lance" }),
      keepalive: true,
    }).catch(() => {
      /* le comptage ne doit jamais bloquer la navigation */
    });
  };

  return (
    <Link
      href={`/learn/${TRIAL_COURSE}/${TRIAL_CHAPTER}`}
      onClick={ping}
      className={className}
    >
      {children}
    </Link>
  );
}
