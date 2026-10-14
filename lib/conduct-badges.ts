/**
 * Badges de conduite : ils récompensent la façon de travailler, là où ceux de
 * lib/badges-catalog.ts récompensent les chapitres terminés.
 *
 * Catalogue séparé de BADGES, dont la position fixe l'index de frame dans
 * /sprites/badges.png (8×6 = 48) : y ajouter des entrées exigerait une
 * nouvelle planche. Icônes emoji en attendant une planche dédiée.
 */

import type { CompletionRecord } from "./quests";

export interface ConductBadgeDef {
  id: string;
  icon: string;
  label: string;
  description: string;
}

export const CONDUCT_BADGES: ConductBadgeDef[] = [
  { id: "liaison-7", icon: "📶", label: "Signal stable", description: "7 jours de liaison" },
  { id: "liaison-30", icon: "🎖", label: "Vétéran de la Coalition", description: "30 jours de liaison" },
  { id: "liaison-100", icon: "🏅", label: "Increvable", description: "100 jours de liaison" },
  { id: "quetes-10", icon: "📄", label: "Exécutant", description: "10 ordres validés" },
  { id: "quetes-50", icon: "📚", label: "Assidu", description: "50 ordres validés" },
  { id: "quetes-200", icon: "🏛", label: "Pilier de la station", description: "200 ordres validés" },
  { id: "briefing-5", icon: "✨", label: "Sans faute", description: "5 briefings complets d'affilée" },
  { id: "polyglotte", icon: "🗣", label: "Polyglotte", description: "Au moins une étape dans 5 cursus" },
  { id: "confins", icon: "🔭", label: "Explorateur des Confins", description: "Au moins une étape dans 10 cursus" },
  { id: "sprint", icon: "⚡", label: "Sprinteur", description: "10 étapes en une seule journée" },
  { id: "veilleur", icon: "🌙", label: "Veilleur", description: "Une étape validée avant 5 h" },
  { id: "retour", icon: "🔄", label: "Le Retour", description: "Revenu après une liaison rompue" },
];

const BY_ID = new Map(CONDUCT_BADGES.map((b) => [b.id, b]));

export function getConductBadge(id: string): ConductBadgeDef | undefined {
  return BY_ID.get(id);
}

export interface ConductContext {
  streak: number;
  questsCompleted: number;
  perfectBriefingRun: number;
  /** Toutes les complétions du cadet, horodatées. */
  completions: CompletionRecord[];
  /**
   * Vrai au moment où la liaison signale la rupture d'une série d'au moins
   * 7 jours (LiaisonTransition.earnedReturn).
   */
  justReturned: boolean;
}

/** Nombre maximal d'étapes validées dans une même journée UTC. */
function maxStepsInOneDay(completions: CompletionRecord[]): number {
  const perDay = new Map<string, number>();
  for (const c of completions) {
    const day = c.completedAt.slice(0, 10);
    perDay.set(day, (perDay.get(day) ?? 0) + 1);
  }
  let max = 0;
  for (const n of perDay.values()) if (n > max) max = n;
  return max;
}

/** Vrai si une étape a été validée entre 0 h et 5 h UTC. */
function hasNightStep(completions: CompletionRecord[]): boolean {
  return completions.some((c) => {
    const hour = Number(c.completedAt.slice(11, 13));
    return hour >= 0 && hour < 5;
  });
}

/**
 * Liste des badges de conduite mérités par l'état courant. Idempotente : le
 * serveur ne crée que ceux qui manquent en base.
 */
export function evaluateConductBadges(ctx: ConductContext): string[] {
  const earned: string[] = [];
  const courseCount = new Set(ctx.completions.map((c) => c.course)).size;

  if (ctx.streak >= 7) earned.push("liaison-7");
  if (ctx.streak >= 30) earned.push("liaison-30");
  if (ctx.streak >= 100) earned.push("liaison-100");

  if (ctx.questsCompleted >= 10) earned.push("quetes-10");
  if (ctx.questsCompleted >= 50) earned.push("quetes-50");
  if (ctx.questsCompleted >= 200) earned.push("quetes-200");

  if (ctx.perfectBriefingRun >= 5) earned.push("briefing-5");
  if (courseCount >= 5) earned.push("polyglotte");
  if (courseCount >= 10) earned.push("confins");
  if (maxStepsInOneDay(ctx.completions) >= 10) earned.push("sprint");
  if (hasNightStep(ctx.completions)) earned.push("veilleur");
  if (ctx.justReturned) earned.push("retour");

  return earned;
}
