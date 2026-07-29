"use client";

import Link from "next/link";

export default function TrialCtaLink({ className }: { className?: string }) {
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
    <Link href="/learn/html/chapitre-1" onClick={ping} className={className}>
      {"> "}Essayer sans compte
    </Link>
  );
}
