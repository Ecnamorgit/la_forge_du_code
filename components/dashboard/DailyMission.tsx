"use client";

import { useMemo, useState } from "react";
import { useUser } from "@/lib/use-user";
import { canClaimDailyMission, DAILY_MISSION_XP } from "@/lib/daily-mission";

/**
 * Dashboard "Mission du jour" — a once-per-day claimable bonus that gives the
 * cadet a reason to come back. Reads the claim state from the user store and
 * posts to /api/me/daily; the server enforces the once-per-day rule.
 */
export default function DailyMission() {
  const { state, hydrated, claimDailyMission } = useUser();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const claimable = hydrated && canClaimDailyMission(state.lastDailyMission, today);

  const onClaim = async () => {
    if (pending) return;
    setError(null);
    setPending(true);
    try {
      await claimDailyMission();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="mb-6 rounded-md border border-nebula-orange/40 bg-nebula-bg-panel/85 px-5 py-4 backdrop-blur-md shadow-[0_0_24px_rgba(255,107,44,0.08)]">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-tech text-xs uppercase tracking-widest text-nebula-orange">
          ⚡ Mission du jour
        </span>
        <span className="font-tech text-[11px] tracking-wider text-nebula-text-dim">
          +{DAILY_MISSION_XP} XP
        </span>
      </div>

      {!hydrated ? (
        <p className="font-body text-sm text-nebula-text-dim">Chargement…</p>
      ) : claimable ? (
        <>
          <p className="mb-3 font-body text-sm text-nebula-text-secondary">
            Connecte-toi au réseau de la Coalition pour ton briefing quotidien.
          </p>
          <button
            onClick={onClaim}
            disabled={pending}
            className="w-full rounded-sm bg-nebula-orange px-4 py-2 font-tech text-xs font-bold uppercase tracking-widest text-nebula-bg-darkest transition-all hover:translate-y-px disabled:opacity-60"
          >
            {pending ? "Synchronisation…" : "Récupérer le bonus"}
          </button>
          {error && (
            <p className="mt-2 font-body text-xs text-nebula-red">{error}</p>
          )}
        </>
      ) : (
        <p className="font-body text-sm text-nebula-green/90">
          ✓ Bonus du jour récupéré. Reviens demain, Cadet.
        </p>
      )}
    </div>
  );
}
