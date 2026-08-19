"use client";

import { useEffect, useState } from "react";
import type { LiaisonPublic } from "@/lib/user-store";

/** Temps restant avant minuit UTC, format « 4 h 12 ». */
function tempsRestant(): string {
  const maintenant = new Date();
  const finJour = Date.UTC(
    maintenant.getUTCFullYear(),
    maintenant.getUTCMonth(),
    maintenant.getUTCDate() + 1
  );
  const reste = finJour - maintenant.getTime();
  const h = Math.floor(reste / 3_600_000);
  const m = Math.floor((reste % 3_600_000) / 60_000);
  return `${h} h ${String(m).padStart(2, "0")}`;
}

export default function LiaisonBanner({ liaison }: { liaison: LiaisonPublic }) {
  const [reste, setReste] = useState<string | null>(null);

  // Calculé après montage : l'heure diffère entre serveur et client, la rendre
  // au premier rendu provoquerait une erreur d'hydratation.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture ponctuelle au montage
    setReste(tempsRestant());
    const id = setInterval(() => setReste(tempsRestant()), 60_000);
    return () => clearInterval(id);
  }, []);

  // La série ne rompt jamais silencieusement : si valider une étape maintenant
  // ne la sauverait plus (relais épuisés), on le dit — le chiffre affiché
  // n'est déjà plus qu'un souvenir. Sinon, tant que rien n'est validé
  // aujourd'hui, le chiffre est celui d'hier : on le signale sans alarmer.
  const perilStatut: "rompue" | "en-attente" | "acquise" = liaison.wouldBreakToday
    ? "rompue"
    : liaison.activeToday
      ? "acquise"
      : "en-attente";

  return (
    <div
      className={`mb-6 rounded-md border bg-nebula-bg-panel/85 px-5 py-4 backdrop-blur-md ${
        perilStatut === "rompue" ? "border-nebula-red/50" : "border-nebula-cyan/40"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`font-tech text-2xl ${
              perilStatut === "rompue" ? "text-nebula-red/80 line-through decoration-2" : "text-nebula-cyan"
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
        {reste && (
          <span className="font-tech text-[11px] uppercase tracking-widest text-nebula-text-dim">
            signal perdu dans {reste}
          </span>
        )}
      </div>

      {perilStatut === "rompue" && (
        <p className="mt-2 font-tech text-[11px] uppercase tracking-widest text-nebula-red">
          ⚠ Liaison en péril : une étape aujourd&apos;hui ne la sauvera pas, elle repartira à 1.
        </p>
      )}
      {perilStatut === "en-attente" && (
        <p className="mt-2 font-tech text-[11px] uppercase tracking-widest text-nebula-text-dim">
          Pas encore confirmée aujourd&apos;hui — valide une étape pour la maintenir.
        </p>
      )}

      <div className="mt-3 flex items-center gap-1.5">
        {liaison.week.map((actif, i) => (
          <span
            key={i}
            className={`h-2.5 w-2.5 rounded-full ${
              actif ? "bg-nebula-cyan shadow-[0_0_8px_rgba(0,240,255,0.5)]" : "bg-nebula-border"
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
