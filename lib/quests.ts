/**
 * Le briefing du jour — trois ordres de mission tirés chaque jour.
 *
 * Deux invariants gouvernent ce module :
 *
 *  1. Le tirage est DÉTERMINISTE : graine = userId + date. Stable toute la
 *     journée sans être stocké, non rejouable en rechargeant la page.
 *
 *  2. La faisabilité est évaluée sur l'état d'AVANT aujourd'hui (`past`), jamais
 *     sur le travail du jour (`today`). Sinon un ordre peut cesser d'être
 *     éligible à cause du travail qu'il demandait : le cadet le réussirait et le
 *     verrait disparaître. `today` ne sert QU'À la progression.
 *
 * Tout est calculable depuis StepCompletion : aucune télémétrie nouvelle.
 */

import type { ChapterMeta } from "./user-store";

export type QuestSlot = "reprise" | "effort" | "curiosite";

/** Barème. Total journalier plafonné à 60 XP — voir la spec, section « XP du briefing ». */
export const QUEST_XP: Record<QuestSlot, number> = {
  reprise: 10,
  effort: 20,
  curiosite: 15,
};

/** Bonus versé quand tous les ordres émis sont accomplis. */
export const CLOSING_XP = 15;

/** Jours d'inactivité au-delà desquels un cursus est « dormant ». */
const DORMANT_DAYS = 7;

export interface CompletionRecord {
  course: string;
  chapter: string;
  stepIndex: number;
  /** ISO 8601 complet (avec l'heure). */
  completedAt: string;
}

export interface QuestContext {
  userId: string;
  todayIso: string;
  /** Complétions strictement antérieures à aujourd'hui 00:00 UTC. */
  past: CompletionRecord[];
  /** Complétions du jour courant. */
  today: CompletionRecord[];
  chaptersByCourse: Record<string, ChapterMeta[]>;
}

export interface Quest {
  id: string;
  slot: QuestSlot;
  label: string;
  progress: number;
  target: number;
  done: boolean;
  /** Cursus visé, pour le lien « aller y faire ». Null si l'ordre est global. */
  course: string | null;
  chapter: string | null;
  xp: number;
}

export interface Briefing {
  dateIso: string;
  quests: Quest[];
  /** Vrai quand tous les ordres émis sont accomplis (bonus de clôture dû). */
  complete: boolean;
}

/** Découpe une liste de complétions en « avant aujourd'hui » / « aujourd'hui ». */
export function splitCompletions(
  all: CompletionRecord[],
  todayIso: string
): { past: CompletionRecord[]; today: CompletionRecord[] } {
  const past: CompletionRecord[] = [];
  const today: CompletionRecord[] = [];
  for (const c of all) {
    if (c.completedAt.slice(0, 10) === todayIso) today.push(c);
    else past.push(c);
  }
  return { past, today };
}

// --- Utilitaires d'état, tous fondés sur `past` uniquement ----------------

interface Params {
  course: string | null;
  chapter: string | null;
  target: number;
  /** Fragment inséré dans le libellé. */
  name: string;
}

function stepsDone(records: CompletionRecord[], course: string, chapter: string): number {
  return records.filter((r) => r.course === course && r.chapter === chapter).length;
}

function coursesTouched(records: CompletionRecord[]): Set<string> {
  return new Set(records.map((r) => r.course));
}

function lastDayOfCourse(records: CompletionRecord[], course: string): string | null {
  let latest: string | null = null;
  for (const r of records) {
    if (r.course !== course) continue;
    const day = r.completedAt.slice(0, 10);
    if (!latest || day > latest) latest = day;
  }
  return latest;
}

function daysSince(dayIso: string, todayIso: string): number {
  const from = Date.parse(`${dayIso}T00:00:00Z`);
  const to = Date.parse(`${todayIso}T00:00:00Z`);
  return Math.round((to - from) / 86_400_000);
}

/** Chapitres entamés mais non terminés, triés pour un ordre stable. */
function chaptersInProgress(
  ctx: QuestContext
): { course: string; chapter: string; done: number; total: number }[] {
  const out: { course: string; chapter: string; done: number; total: number }[] = [];
  for (const [course, chapitres] of Object.entries(ctx.chaptersByCourse)) {
    for (const ch of chapitres) {
      const done = stepsDone(ctx.past, course, ch.slug);
      if (done > 0 && done < ch.totalSteps) {
        out.push({ course, chapter: ch.slug, done, total: ch.totalSteps });
      }
    }
  }
  out.sort((a, b) => `${a.course}/${a.chapter}`.localeCompare(`${b.course}/${b.chapter}`));
  return out;
}

// --- Archétypes -----------------------------------------------------------

interface Archetype {
  id: string;
  slot: QuestSlot;
  /** Retourne les paramètres si l'ordre est faisable aujourd'hui, sinon null. */
  feasible(ctx: QuestContext): Params | null;
  label(p: Params): string;
  progress(p: Params, today: CompletionRecord[]): number;
}

const ARCHETYPES: Archetype[] = [
  {
    id: "deux-etapes",
    slot: "reprise",
    feasible: () => ({ course: null, chapter: null, target: 2, name: "" }),
    label: () => "Valide 2 étapes",
    progress: (_p, today) => today.length,
  },
  {
    id: "une-etape",
    slot: "reprise",
    feasible: () => ({ course: null, chapter: null, target: 1, name: "" }),
    label: () => "Valide une étape",
    progress: (_p, today) => today.length,
  },
  {
    id: "boucler-chapitre",
    slot: "effort",
    feasible: (ctx) => {
      const cible = chaptersInProgress(ctx).find((c) => c.done / c.total >= 0.5);
      if (!cible) return null;
      return {
        course: cible.course,
        chapter: cible.chapter,
        target: cible.total - cible.done,
        name: cible.chapter.replace("chapitre-", "chapitre "),
      };
    },
    label: (p) => `Boucle le ${p.name} de ${p.course?.toUpperCase()}`,
    progress: (p, today) =>
      today.filter((r) => r.course === p.course && r.chapter === p.chapter).length,
  },
  {
    id: "cinq-etapes",
    slot: "effort",
    feasible: () => ({ course: null, chapter: null, target: 5, name: "" }),
    label: () => "Valide 5 étapes",
    progress: (_p, today) => today.length,
  },
  {
    id: "serie-chapitre",
    slot: "effort",
    feasible: (ctx) => {
      const cible = chaptersInProgress(ctx).find((c) => c.total - c.done >= 3);
      if (!cible) return null;
      return {
        course: cible.course,
        chapter: cible.chapter,
        target: 3,
        name: cible.chapter.replace("chapitre-", "chapitre "),
      };
    },
    label: (p) => `3 étapes dans le ${p.name} de ${p.course?.toUpperCase()}`,
    progress: (p, today) =>
      today.filter((r) => r.course === p.course && r.chapter === p.chapter).length,
  },
  {
    id: "second-front",
    slot: "curiosite",
    feasible: (ctx) =>
      coursesTouched(ctx.past).size >= 2
        ? { course: null, chapter: null, target: 2, name: "" }
        : null,
    label: () => "Progresse dans 2 cursus différents",
    progress: (_p, today) => coursesTouched(today).size,
  },
  {
    id: "cursus-dormant",
    slot: "curiosite",
    feasible: (ctx) => {
      const dormants = [...coursesTouched(ctx.past)]
        .map((course) => ({ course, last: lastDayOfCourse(ctx.past, course) }))
        .filter((c) => c.last !== null && daysSince(c.last, ctx.todayIso) >= DORMANT_DAYS)
        .sort((a, b) => a.course.localeCompare(b.course));
      const cible = dormants[0];
      if (!cible) return null;
      return { course: cible.course, chapter: null, target: 1, name: cible.course.toUpperCase() };
    },
    label: (p) => `Reprends ${p.name}, délaissé depuis une semaine`,
    progress: (p, today) => today.filter((r) => r.course === p.course).length,
  },
  {
    id: "premiere-fois",
    slot: "curiosite",
    feasible: (ctx) => {
      const touches = coursesTouched(ctx.past);
      const vierge = Object.keys(ctx.chaptersByCourse)
        .filter((c) => !touches.has(c))
        .sort()[0];
      if (!vierge) return null;
      return { course: vierge, chapter: null, target: 1, name: vierge.toUpperCase() };
    },
    label: (p) => `Ouvre le cursus ${p.name}`,
    progress: (p, today) => today.filter((r) => r.course === p.course).length,
  },
];

// --- Tirage déterministe --------------------------------------------------

/** FNV-1a 32 bits. Suffisant pour choisir un index, sans dépendance. */
function hash(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

const SLOTS: QuestSlot[] = ["reprise", "effort", "curiosite"];

/**
 * Construit le briefing du jour. Peut rendre moins de trois ordres si un
 * emplacement n'a aucun archétype faisable — c'est correct, et documenté.
 */
export function buildBriefing(ctx: QuestContext): Briefing {
  const quests: Quest[] = [];

  for (const slot of SLOTS) {
    const candidats = ARCHETYPES.filter((a) => a.slot === slot)
      .map((a) => ({ a, p: a.feasible(ctx) }))
      .filter((c): c is { a: Archetype; p: Params } => c.p !== null);

    if (candidats.length === 0) continue;

    const index = hash(`${ctx.userId}:${ctx.todayIso}:${slot}`) % candidats.length;
    const { a, p } = candidats[index];
    const progress = Math.min(a.progress(p, ctx.today), p.target);

    quests.push({
      id: a.id,
      slot,
      label: a.label(p),
      progress,
      target: p.target,
      done: progress >= p.target,
      course: p.course,
      chapter: p.chapter,
      xp: QUEST_XP[slot],
    });
  }

  return {
    dateIso: ctx.todayIso,
    quests,
    complete: quests.length > 0 && quests.every((q) => q.done),
  };
}
