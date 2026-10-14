"use client";

import { useCallback, useEffect, useState } from "react";

import { readLocalSeen, writeLocalSeen } from "./local-seen";

/** Source of truth for the "seen cinematics" state used by `useCinematicSeen`. */
export type CinematicSeenMode = "server" | "local" | "off";

/**
 * Client-side "seen cinematics" state for a course.
 *
 * While `loaded` is false (read failed or impossible), the caller does not
 * auto-play any cinematic: better to skip one than to force it.
 * `mark` does not wait for a response; a write failure is silent, and at
 * worst the cinematic will play again.
 *
 * `mode`: `"server"` (default) goes through the authenticated API
 * (`/api/me/cinematic`), `"local"` through localStorage (trial without account).
 * `"off"` is for when the caller knows there is no session (the API would
 * return 401): no request, `loaded` stays false and `mark` only touches
 * in-memory state.
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
      // A single directive is enough: the rule only flags the first
      // setState in the block.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off synchronous localStorage read on mount
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
        /* loaded stays false: no auto-play */
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
      // Outside the updater, which must stay pure (React may replay it). We
      // re-read `readLocalSeen()` rather than capture `seen`, which could
      // be stale.
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
        /* at worst, the cinematic will play again */
      });
    },
    [mode]
  );

  return { loaded, seen, mark };
}
