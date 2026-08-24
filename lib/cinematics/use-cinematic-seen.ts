"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * État « cinématiques vues » d'un cursus, côté client.
 *
 * Politique d'erreur (spec §6) : si la lecture échoue, `loaded` reste false et
 * l'appelant NE joue PAS de cinématique automatiquement — on n'impose jamais
 * une cinématique par excès, on préfère la sauter. `mark` est fire-and-forget :
 * un échec réseau est silencieux (au pire la cinématique se rejouera).
 */
export function useCinematicSeen(course: string): {
  loaded: boolean;
  seen: Set<string>;
  mark: (id: string) => void;
} {
  const [loaded, setLoaded] = useState(false);
  const [seen, setSeen] = useState<Set<string>>(new Set());

  useEffect(() => {
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
  }, [course]);

  const mark = useCallback((id: string) => {
    setSeen((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    void fetch("/api/me/cinematic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cinematicId: id }),
    }).catch(() => {
      /* silencieux, voir docstring */
    });
  }, []);

  return { loaded, seen, mark };
}
