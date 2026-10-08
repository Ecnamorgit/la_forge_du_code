"use client";

import { useCallback, useState } from "react";
import { useUser } from "@/lib/use-user";
import { sanitizeShareName } from "@/lib/share";

/**
 * Partage d'une carte de réussite. Construit l'URL publique /share/[badge]
 * (qui porte les métadonnées de l'image OG) et passe par l'API Web Share si
 * elle existe, sinon par LinkedIn. Seul le pseudo est transmis.
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
        // Partage annulé ou en échec : repli sur LinkedIn.
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
        // La copie dans le presse-papiers est facultative.
      }
    }
  }, [buildUrl, badgeLabel]);

  return (
    <button
      onClick={onShare}
      className="inline-flex items-center gap-2 rounded-sm border border-nebula-cyan/60 bg-nebula-cyan-faint px-5 py-2 font-tech text-xs uppercase tracking-widest text-nebula-cyan transition-all hover:bg-nebula-cyan/10"
    >
      {copied ? "Lien copié ✓" : "Partager 🚀"}
    </button>
  );
}
