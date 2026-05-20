"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import DashboardNav from "../DashboardNav";
import { useUser } from "@/lib/use-user";
import { levelFromXp, rankFromXp } from "@/lib/user-store";

import type { LeaderboardEntry, LeaderboardResponse } from "../api/leaderboard/route";

export default function LeaderboardPage() {
  const { state } = useUser();
  const username = state.username || "Cadet";

  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/leaderboard", { cache: "no-store" });
        if (!res.ok) {
          if (!cancelled) setError("Impossible de charger le classement.");
          return;
        }
        const body = (await res.json()) as LeaderboardResponse;
        if (!cancelled) setData(body);
      } catch {
        if (!cancelled) setError("Erreur réseau.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative h-full overflow-y-auto">
      <div className="fixed inset-0 z-0 pointer-events-none bg-nebula-bg" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-nebula-stars opacity-25" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-[rgba(3,6,13,0.5)]" />

      <DashboardNav userName={username} />

      <main className="relative z-10 mx-auto max-w-3xl px-4 py-6 lg:px-6 lg:py-10">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 font-tech text-xs uppercase tracking-widest text-nebula-text-secondary transition-colors hover:text-nebula-cyan"
        >
          ← Retour au pont
        </Link>

        <header className="mb-8 animate-fade-down">
          <h1 className="font-tech text-3xl tracking-[0.18em] text-nebula-cyan [text-shadow:0_0_18px_rgba(0,240,255,0.3)] sm:text-4xl">
            {"> "}CLASSEMENT
          </h1>
          <p className="mt-2 font-tech text-[11px] uppercase tracking-[0.3em] text-nebula-text-dim">
            Les meilleurs cadets de la flotte Nebula
          </p>
        </header>

        {error && (
          <div className="mb-6 rounded-sm border border-nebula-red/70 bg-nebula-red/15 px-4 py-3 font-tech text-xs uppercase tracking-wider text-nebula-red">
            {error}
          </div>
        )}

        {loading && !data && (
          <div className="rounded-sm border border-nebula-border/50 bg-nebula-bg-panel/30 px-4 py-12 text-center font-tech text-xs uppercase tracking-widest text-nebula-text-dim">
            Chargement du registre...<span className="terminal-cursor">_</span>
          </div>
        )}

        {data && (
          <>
            <ol className="space-y-2 animate-fade-up">
              {data.top.length === 0 && (
                <li className="rounded-sm border border-nebula-border/50 bg-nebula-bg-panel/30 px-4 py-6 text-center font-body text-sm text-nebula-text-dim">
                  Personne n&apos;est encore classé. Sois le premier à valider une étape !
                </li>
              )}
              {data.top.map((entry) => (
                <Row key={entry.rank} entry={entry} />
              ))}
            </ol>

            {data.me && !data.me.isMe === false ? null : data.me && (
              <div className="mt-8">
                <div className="mb-2 font-tech text-[10px] uppercase tracking-[0.3em] text-nebula-text-dim">
                  ◈ Ton rang
                </div>
                <Row entry={data.me} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function Row({ entry }: { entry: LeaderboardEntry }) {
  const level = levelFromXp(entry.totalXp);
  const rank = rankFromXp(entry.totalXp);
  const medal = entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : null;

  return (
    <li
      className={`flex items-center gap-3 rounded-sm border px-4 py-3 backdrop-blur-md transition-all sm:gap-4 sm:px-5 sm:py-4 ${
        entry.isMe
          ? "border-nebula-cyan bg-nebula-cyan-faint/30 shadow-[0_0_20px_rgba(0,240,255,0.15)]"
          : entry.rank <= 3
            ? "border-nebula-orange/40 bg-nebula-bg-panel/75"
            : "border-nebula-border/60 bg-nebula-bg-panel/50"
      }`}
    >
      <div className="flex w-10 shrink-0 items-center justify-center font-tech text-lg font-bold sm:w-12 sm:text-xl">
        {medal ? (
          <span>{medal}</span>
        ) : (
          <span
            className={`text-nebula-text-secondary ${entry.isMe ? "text-nebula-cyan" : ""}`}
          >
            #{entry.rank}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span
            className={`truncate font-tech text-sm uppercase tracking-wider sm:text-base ${
              entry.isMe ? "text-nebula-cyan" : "text-nebula-text"
            }`}
          >
            @{entry.username}
          </span>
          {entry.isMe && (
            <span className="font-tech text-[9px] uppercase tracking-widest text-nebula-cyan/80">
              ◆ toi
            </span>
          )}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-2 font-tech text-[10px] uppercase tracking-wider text-nebula-text-dim sm:text-[11px]">
          <span>LVL {level}</span>
          <span>·</span>
          <span className="text-nebula-orange/80">{rank}</span>
          <span>·</span>
          <span>{entry.badges} badges</span>
          {entry.streak > 1 && (
            <>
              <span>·</span>
              <span className="text-nebula-green">🔥 {entry.streak}j</span>
            </>
          )}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="font-tech text-base font-bold text-nebula-green sm:text-lg">
          {entry.totalXp}
        </div>
        <div className="font-tech text-[9px] uppercase tracking-widest text-nebula-text-dim">
          XP
        </div>
      </div>
    </li>
  );
}
