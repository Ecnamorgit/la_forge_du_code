"use client";

import { useCallback, useEffect, useState } from "react";

import { readLocalSeen, writeLocalSeen } from "./local-seen";

/** Source de vérité de l'état « cinématiques vues » pour `useCinematicSeen`. */
export type CinematicSeenMode = "server" | "local" | "off";

/**
 * État « cinématiques vues » d'un cursus, côté client.
 *
 * Politique d'erreur (spec §6) : si la lecture échoue, `loaded` reste false et
 * l'appelant NE joue PAS de cinématique automatiquement — on n'impose jamais
 * une cinématique par excès, on préfère la sauter. `mark` est fire-and-forget :
 * un échec réseau (ou d'écriture localStorage) est silencieux (au pire la
 * cinématique se rejouera).
 *
 * `mode` :
 * - `"server"` (défaut) : lecture/écriture via l'API authentifiée
 *   (`/api/me/cinematic`).
 * - `"off"` : à utiliser quand l'appelant sait qu'il n'y a pas de session
 *   (mode essai sans stockage local) — l'API authentifiée répondrait 401.
 *   Aucune requête n'est émise, `loaded` reste false (donc pas d'auto-play,
 *   même politique que ci-dessus) et `mark` reste purement local en mémoire.
 * - `"local"` : lecture/écriture via `localStorage` (mode essai avec
 *   persistance locale, sans compte). Si `window` est indisponible, `loaded`
 *   reste false (même politique).
 */
export function useCinematicSeen(
  course: string,
  mode: CinematicSeenMode = "server"
): {
  loaded: boolean;
  seen: Set<string>;
  mark: (id: string) => void;
} {
  const [loaded, setLoaded] = useState(false);
  const [seen, setSeen] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (mode === "off") return;

    if (mode === "local") {
      if (typeof window === "undefined") return;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture synchrone ponctuelle de localStorage au montage
      setSeen(new Set(readLocalSeen()));
      setLoaded(true);
      return;
    }

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
  }, [course, mode]);

  const mark = useCallback(
    (id: string) => {
      setSeen((prev) => {
        const next = new Set(prev);
        next.add(id);
        if (mode === "local") writeLocalSeen([...next]);
        return next;
      });
      if (mode !== "server") return;
      void fetch("/api/me/cinematic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cinematicId: id }),
      }).catch(() => {
        /* silencieux, voir docstring */
      });
    },
    [mode]
  );

  return { loaded, seen, mark };
}
