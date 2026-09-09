"use client";

import { useCallback, useState } from "react";
import { useUser } from "@/lib/use-user";
import { sanitizeShareName } from "@/lib/share";

/**
 * Shares a success card (growth loop). Builds the public /share/[badge] URL
 * (which carries the OG image meta) and uses the Web Share API when available,
 * falling back to a LinkedIn share intent. Only the pseudo is ever sent.
 */

interface ShareButtonProps {
  badgeId: string;
  badgeLabel: string;
  xp?: number;
}

export default function ShareButton({ badgeId, badgeLabel, xp = 0 }: ShareButtonProps) {
  const { state } = useUser();
  const [copied, setCopied] = useState(false);

  const buildUrl = useCallback(() => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const pseudo = sanitizeShareName(state?.username);
    const params = new URLSearchParams({ u: pseudo, xp: String(xp) });
    return `${origin}/share/${badgeId}?${params.toString()}`;
  }, [badgeId, state?.username, xp]);

  const onShare = useCallback(async () => {
    const url = buildUrl();
    const text = `J'ai débloqué le grade « ${badgeLabel} » sur La Forge du Code ! 🚀`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "La Forge du Code", text, url });
        return;
      } catch {
        // User cancelled or share failed → fall through to LinkedIn.
      }
    }
    const intent = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    if (typeof window !== "undefined") {
      window.open(intent, "_blank", "noopener,noreferrer");
      try {
        await navigator.clipboard?.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Clipboard is best-effort.
      }
    }
  }, [buildUrl, badgeLabel]);

  return (
    <button
      onClick={onShare}
      className="inline-flex items-center gap-2 rounded-sm border border-nebula-cyan/60 bg-nebula-cyan-faint px-5 py-2 font-tech text-xs uppercase tracking-widest text-nebula-cyan transition-all hover:bg-nebula-cyan/10"
    >
      {copied ? "Lien copie ✓" : "Partager 🚀"}
    </button>
  );
}
