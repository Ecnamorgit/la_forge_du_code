"use client";

import { useEffect, useState } from "react";
import type { LiaisonPublic } from "@/lib/user-store";

/** Time left until UTC midnight, formatted as « 4 h 12 ». */
function timeRemaining(): string {
  const now = new Date();
  const endOfDay = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1
  );
  const remainingMs = endOfDay - now.getTime();
  const h = Math.floor(remainingMs / 3_600_000);
  const m = Math.floor((remainingMs % 3_600_000) / 60_000);
  return `${h} h ${String(m).padStart(2, "0")}`;
}

export default function LiaisonBanner({ liaison }: { liaison: LiaisonPublic }) {
  const [remaining, setRemaining] = useState<string | null>(null);

  // Computed after mount: the time differs between server and client, rendering
  // it on first render would cause a hydration error.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off read on mount
    setRemaining(timeRemaining());
    const id = setInterval(() => setRemaining(timeRemaining()), 60_000);
    return () => clearInterval(id);
  }, []);

  // A break is always announced: if completing a step now would no longer
  // save the streak (relays used up), the status is "rompue" (broken). As long
  // as nothing is completed today, the number shown is yesterday's.
  const perilStatus: "rompue" | "en-attente" | "acquise" = liaison.wouldBreakToday
    ? "rompue"
    : liaison.activeToday
      ? "acquise"
      : "en-attente";

  return (
    <div
      className={`mb-6 rounded-md border bg-nebula-bg-panel/85 px-5 py-4 backdrop-blur-md ${
        perilStatus === "rompue" ? "border-nebula-red/50" : "border-nebula-cyan/40"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`font-tech text-2xl ${
              perilStatus === "rompue" ? "text-nebula-red/80 line-through decoration-2" : "text-nebula-cyan"
            }`}
          >
            {liaison.streak}
            <span className="ml-1 text-xs uppercase tracking-widest">
              jour{liaison.streak > 1 ? "s" : ""} de liaison
            </span>
          </span>
          {liaison.shields > 0 && (
            <span
              className="font-tech text-[11px] uppercase tracking-widest text-nebula-orange"
              title="Relais de secours : couvrent un jour manqué"
            >
              🛡 ×{liaison.shields}
            </span>
          )}
        </div>
        {remaining && (
          <span className="font-tech text-[11px] uppercase tracking-widest text-nebula-text-dim">
            signal perdu dans {remaining}
          </span>
        )}
      </div>

      {perilStatus === "rompue" && (
        <p className="mt-2 font-tech text-[11px] uppercase tracking-widest text-nebula-red">
          ⚠ Liaison en péril : une étape aujourd&apos;hui ne la sauvera pas, elle repartira à 1.
        </p>
      )}
      {perilStatus === "en-attente" && (
        <p className="mt-2 font-tech text-[11px] uppercase tracking-widest text-nebula-text-dim">
          Pas encore confirmée aujourd&apos;hui — valide une étape pour la maintenir.
        </p>
      )}

      <div className="mt-3 flex items-center gap-1.5">
        {liaison.week.map((isActive, i) => (
          <span
            key={i}
            className={`h-2.5 w-2.5 rounded-full ${
              isActive ? "bg-nebula-cyan shadow-[0_0_8px_rgba(0,240,255,0.5)]" : "bg-nebula-border"
            }`}
          />
        ))}
        <span className="ml-2 font-tech text-[10px] uppercase tracking-widest text-nebula-text-dim">
          record {liaison.bestStreak} j
        </span>
      </div>
    </div>
  );
}
