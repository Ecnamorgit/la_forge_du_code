"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * État « cinématiques vues » d'un cursus, côté client.
 *
 * Politique d'erreur (spec §6) : si la lecture échoue, `loaded` reste false et
 * l'appelant NE joue PAS de cinématique automatiquement — on n'impose jamais
 * une cinématique par excès, on préfère la sauter. `mark` est fire-and-forget :
 * un échec réseau est silencieux (au pire la cinématique se rejouera).
 *
 * `enabled` : passer `false` quand l'appelant sait qu'il n'y a pas de session
 * (mode essai) — l'API est authentifiée et répondrait 401. Aucune requête
 * n'est alors émise et `loaded` reste false ; par la même politique que
 * ci-dessus, l'appelant ne doit donc rien auto-jouer.
 */
export function useCinematicSeen(
  course: string,
  enabled: boolean = true
): {
  loaded: boolean;
  seen: Set<string>;
  mark: (id: string) => void;
} {
  const [loaded, setLoaded] = useState(false);
  const [seen, setSeen] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetch(`/api/me/cinematic?course=${encodeURIComponent(course)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("fetch"))))
      .then((data: { seen: string[] }) => {
        if (cancelled) return;
        setSeen(new Set(data.seen));
        setLoaded(true);
      })
      .catch(() => {
        /* loaded reste false : pas d'auto-play, voir docstring */
      });
    return () => {
      cancelled = true;
    };
  }, [course, enabled]);

  const mark = useCallback(
    (id: string) => {
      setSeen((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      if (!enabled) return;
      void fetch("/api/me/cinematic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cinematicId: id }),
      }).catch(() => {
        /* silencieux, voir docstring */
      });
    },
    [enabled]
  );

  return { loaded, seen, mark };
}
