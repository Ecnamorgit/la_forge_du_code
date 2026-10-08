"use client";

import { useCallback, useEffect, useState } from "react";

import { readLocalSeen, writeLocalSeen } from "./local-seen";

/** Source de vérité de l'état « cinématiques vues » pour `useCinematicSeen`. */
export type CinematicSeenMode = "server" | "local" | "off";

/**
 * État « cinématiques vues » d'un cursus, côté client.
 *
 * Tant que `loaded` est false (lecture en échec ou impossible), l'appelant ne
 * lance aucune cinématique automatiquement : mieux vaut en sauter une que
 * l'imposer. `mark` n'attend pas de réponse ; un échec d'écriture est
 * silencieux, la cinématique se rejouera au pire.
 *
 * `mode` : `"server"` (défaut) passe par l'API authentifiée
 * (`/api/me/cinematic`), `"local"` par localStorage (essai sans compte).
 * `"off"` sert quand l'appelant sait qu'il n'y a pas de session (l'API
 * répondrait 401) : aucune requête, `loaded` reste false et `mark` ne touche
 * que l'état en mémoire.
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
      // Une seule directive suffit : la règle ne signale que le premier
      // setState du bloc.
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
        /* loaded reste false : pas de lecture automatique */
      });
    return () => {
      cancelled = true;
    };
  }, [course, mode]);

  const mark = useCallback(
    (id: string) => {
      setSeen((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      // Hors de l'updater, qui doit rester pur (React peut le rejouer). On
      // relit `readLocalSeen()` plutôt que de capturer `seen`, qui pourrait
      // être périmé.
      if (mode === "local") {
        writeLocalSeen([...new Set([...readLocalSeen(), id])]);
        return;
      }
      if (mode !== "server") return;
      void fetch("/api/me/cinematic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cinematicId: id }),
      }).catch(() => {
        /* au pire, la cinématique se rejouera */
      });
    },
    [mode]
  );

  return { loaded, seen, mark };
}
