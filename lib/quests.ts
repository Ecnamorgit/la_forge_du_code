/**
 * Daily briefing: three mission orders drawn each day.
 *
 * The draw is deterministic (seed = userId + date): stable all day without
 * being stored, and it cannot be rerolled by reloading the page.
 *
 * Feasibility is evaluated on the state before today (`past`), never on
 * today's work (`today`), which only drives progress. Otherwise an order
 * could disappear because of the very work it asked for.
 *
 * Everything is computed from StepCompletion.
 */

import type { ChapterMeta } from "./user-store";

export type QuestSlot = "reprise" | "effort" | "curiosite";

/** Scoring table. With the completion bonus, the daily total caps at 60 XP. */
export const QUEST_XP: Record<QuestSlot, number> = {
  reprise: 10,
  effort: 20,
  curiosite: 15,
};

/** Bonus paid when every issued order is fulfilled. */
export const CLOSING_XP = 15;

/** Days of inactivity after which a course is "dormant". */
const DORMANT_DAYS = 7;

export interface CompletionRecord {
  course: string;
  chapter: string;
  stepIndex: number;
  /** Full ISO 8601 (with the time). */
  completedAt: string;
}

export interface QuestContext {
  userId: string;
  todayIso: string;
  /** Completions strictly before today 00:00 UTC. */
  past: CompletionRecord[];
  /** Completions from the current day. */
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
  /** Target course, for the "go do it" link. Null if the order is global. */
  course: string | null;
  chapter: string | null;
  xp: number;
}

export interface Briefing {
  dateIso: string;
  quests: Quest[];
  /** True when every issued order is fulfilled (completion bonus due). */
  complete: boolean;
}

/** Splits a list of completions into "before today" / "today". */
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

// State helpers

interface Params {
  course: string | null;
  chapter: string | null;
  target: number;
  /** Fragment inserted into the label. */
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

/** Chapters started but not finished, sorted for a stable order. */
function chaptersInProgress(
  ctx: QuestContext
): { course: string; chapter: string; done: number; total: number }[] {
  const out: { course: string; chapter: string; done: number; total: number }[] = [];
  for (const [course, courseChapters] of Object.entries(ctx.chaptersByCourse)) {
    for (const ch of courseChapters) {
      const done = stepsDone(ctx.past, course, ch.slug);
      if (done > 0 && done < ch.totalSteps) {
        out.push({ course, chapter: ch.slug, done, total: ch.totalSteps });
      }
    }
  }
  out.sort((a, b) => `${a.course}/${a.chapter}`.localeCompare(`${b.course}/${b.chapter}`));
  return out;
}

// Order archetypes

interface Archetype {
  id: string;
  slot: QuestSlot;
  /** Returns the parameters if the order is feasible today, otherwise null. */
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
      const target = chaptersInProgress(ctx).find((c) => c.done / c.total >= 0.5);
      if (!target) return null;
      return {
        course: target.course,
        chapter: target.chapter,
        target: target.total - target.done,
        name: target.chapter.replace("chapitre-", "chapitre "),
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
      const target = chaptersInProgress(ctx).find((c) => c.total - c.done >= 3);
      if (!target) return null;
      return {
        course: target.course,
        chapter: target.chapter,
        target: 3,
        name: target.chapter.replace("chapitre-", "chapitre "),
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
      const target = dormants[0];
      if (!target) return null;
      return { course: target.course, chapter: null, target: 1, name: target.course.toUpperCase() };
    },
    label: (p) => `Reprends ${p.name}, délaissé depuis une semaine`,
    progress: (p, today) => today.filter((r) => r.course === p.course).length,
  },
  {
    id: "premiere-fois",
    slot: "curiosite",
    feasible: (ctx) => {
      const touched = coursesTouched(ctx.past);
      const untouched = Object.keys(ctx.chaptersByCourse)
        .filter((c) => !touched.has(c))
        .sort()[0];
      if (!untouched) return null;
      return { course: untouched, chapter: null, target: 1, name: untouched.toUpperCase() };
    },
    label: (p) => `Ouvre le cursus ${p.name}`,
    progress: (p, today) => today.filter((r) => r.course === p.course).length,
  },
];

// Deterministic draw

/** 32-bit FNV-1a, enough to pick an index. */
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
 * Builds the daily briefing. May return fewer than three orders if a slot
 * has no feasible archetype.
 */
export function buildBriefing(ctx: QuestContext): Briefing {
  const quests: Quest[] = [];

  for (const slot of SLOTS) {
    const candidates = ARCHETYPES.filter((a) => a.slot === slot)
      .map((a) => ({ a, p: a.feasible(ctx) }))
      .filter((c): c is { a: Archetype; p: Params } => c.p !== null);

    if (candidates.length === 0) continue;

    const index = hash(`${ctx.userId}:${ctx.todayIso}:${slot}`) % candidates.length;
    const { a, p } = candidates[index];
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

// Briefing payout

/**
 * Bit of the `User.dailyClaimed` mask reserved for each slot. It is tied to
 * the slot, not to the position in the array: `buildBriefing` may return
 * fewer than three orders, and a curiosite order that lands first must not
 * reuse the reprise bit.
 */
const SLOT_BIT: Record<QuestSlot, number> = {
  reprise: 0,
  effort: 1,
  curiosite: 2,
};

/** Bit for the completion bonus, never used by an order. */
export const CLOSING_BIT = 3;

export interface BriefingPayoutState {
  /** Mask of the orders already paid out, as stored in the database. */
  claimedMask: number;
  /** Day this mask refers to (`User.lastDailyMission`), "" if never. */
  claimedDay: string;
  /** Complete briefings in a row. */
  perfectRun: number;
  /** Day of the last complete briefing, "" if never. */
  lastPerfectDay: string;
}

export interface BriefingPayout {
  /** XP to add to the total. Zero if everything was already paid out. */
  bonusXp: number;
  /** Mask to write to the database, paired with `todayIso`. */
  nextMask: number;
  /** Orders paid out right now, completion bonus excluded. */
  questsPaid: number;
  /** Labels of the orders paid out right now, to announce. */
  paidLabels: string[];
  perfectRun: number;
  lastPerfectDay: string;
}

/**
 * Computes what the briefing is worth right now: XP due, mask to write,
 * orders to announce, perfect briefing streak.
 *
 * Idempotent: each mask bit pays out only once. A mask from another day is
 * ignored, otherwise a cadet returning after three days would keep the full
 * mask from their last session and would not get paid.
 *
 * The 60 XP daily cap follows from the scoring table (10 + 20 + 15 + 15) and
 * from bit uniqueness; the account cap (`MAX_XP`) is up to the caller.
 * Pure function: the current day is a parameter.
 */
export function applyBriefingPayout(
  briefing: Briefing,
  state: BriefingPayoutState,
  todayIso: string
): BriefingPayout {
  // A mask that does not refer to today is worth nothing.
  let nextMask = state.claimedDay === todayIso ? state.claimedMask : 0;

  let bonusXp = 0;
  let questsPaid = 0;
  const paidLabels: string[] = [];

  for (const q of briefing.quests) {
    const bit = 1 << SLOT_BIT[q.slot];
    if (!q.done || (nextMask & bit) !== 0) continue;
    bonusXp += q.xp;
    nextMask |= bit;
    questsPaid += 1;
    paidLabels.push(q.label);
  }

  let perfectRun = state.perfectRun;
  let lastPerfectDay = state.lastPerfectDay;
  const closingBit = 1 << CLOSING_BIT;

  if (briefing.complete && (nextMask & closingBit) === 0) {
    bonusXp += CLOSING_XP;
    nextMask |= closingBit;
    // The streak continues if the last complete briefing was yesterday,
    // otherwise it restarts at 1.
    perfectRun =
      lastPerfectDay && daysSince(lastPerfectDay, todayIso) === 1 ? perfectRun + 1 : 1;
    lastPerfectDay = todayIso;
  }

  return { bonusXp, nextMask, questsPaid, paidLabels, perfectRun, lastPerfectDay };
}
