"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { TRIAL_CHAPTERS, TRIAL_COURSE } from "@/lib/public-routes";

export default function TrialCtaLink({
  className,
  children,
}: {
  className?: string;
  /** Link label, specific to each caller. */
  children: ReactNode;
}) {
  const ping = () => {
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "essai_lance" }),
      keepalive: true,
    }).catch(() => {
      /* tracking must never block navigation */
    });
  };

  return (
    <Link
      href={`/learn/${TRIAL_COURSE}/${TRIAL_CHAPTERS[0]}`}
      onClick={ping}
      className={className}
    >
      {children}
    </Link>
  );
}
