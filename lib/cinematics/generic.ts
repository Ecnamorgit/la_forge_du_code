/**
 * Cinématiques génériques de repli, utilisées tant qu'un cursus n'a pas son
 * arc écrit (data/courses/<slug>/cinematics.ts). Choix déterministe par index
 * de chapitre — même patron que SPECTRE_TAUNTS (narrative-feedback).
 */

import { COURSES_CATALOG } from "@/lib/courses-catalog";
import {
  cinematicId,
  type Cinematic,
  type CinematicScene,
} from "./types";

function courseTitle(course: string): string {
  return COURSES_CATALOG.find((c) => c.slug === course)?.title ?? course.toUpperCase();
}

export function genericIntro(course: string): Cinematic {
  const title = courseTitle(course);
  const scenes: CinematicScene[] = [
    {
      id: 0,
      speaker: "system",
      narration: `ALERTE : corruption détectée dans les protocoles ${title}. Le Spectre gagne du terrain sur ce secteur de la station.`,
      visual: "spectre",
      fx: "alert",
    },
    {
      id: 1,
      speaker: "kira",
      narration: `« Cadet, ta mission : restaurer les protocoles ${title}, module par module. Je te briefe à chaque étape. »`,
      visual: "briefing",
    },
    {
      id: 2,
      speaker: "help",
      narration: "« Systèmes d'assistance en ligne. À nous de jouer, Cadet ! »",
      visual: "station",
    },
  ];
  return { id: cinematicId(course, { kind: "intro" }), scenes };
}

/**
 * Paires de scènes d'outro génériques. La rotation est indexée sur le numéro
 * du chapitre pour rester déterministe et éviter la répétition immédiate.
 */
const GENERIC_OUTROS: ReadonlyArray<readonly [string, string]> = [
  [
    "SECTEUR RESTAURÉ. Les systèmes répondent de nouveau.",
    "« Beau travail, Cadet. On ne relâche pas : secteur suivant. »",
  ],
  [
    "MODULE STABILISÉ. La corruption recule.",
    "« Le Spectre n'a qu'à bien se tenir. En route, Cadet. »",
  ],
  [
    "PROTOCOLE VALIDÉ. Transmission relayée à la Flotte.",
    "« Kira sera fière de ce rapport. On continue ! »",
  ],
];

/** Rang du chapitre extrait de son slug ("chapitre-3" → 3), 0 si inconnu. */
function chapterRank(chapterSlug: string): number {
  const m = /(\d+)$/.exec(chapterSlug);
  return m ? Number(m[1]) : 0;
}

export function genericChapterOutro(course: string, chapterSlug: string): Cinematic {
  const [systemLine, helpLine] =
    GENERIC_OUTROS[chapterRank(chapterSlug) % GENERIC_OUTROS.length];
  const scenes: CinematicScene[] = [
    { id: 0, speaker: "system", narration: systemLine, visual: "station", fx: "victory" },
    { id: 1, speaker: "help", narration: `« ${helpLine} »`, visual: "briefing" },
  ];
  return { id: cinematicId(course, { kind: "chapter", chapter: chapterSlug }), scenes };
}

export function genericFinale(course: string): Cinematic {
  const title = courseTitle(course);
  const scenes: CinematicScene[] = [
    {
      id: 0,
      speaker: "system",
      narration: `PROTOCOLES ${title.toUpperCase()} : 100 % RESTAURÉS. Le secteur repasse sous contrôle de la Coalition Nebula.`,
      visual: "victory",
      fx: "victory",
    },
    {
      id: 1,
      speaker: "spectre",
      narration: "« Une anomalie corrigée. Il en reste tant d'autres, Cadet... »",
      visual: "spectre",
      fx: "glitch",
    },
    {
      id: 2,
      speaker: "system",
      narration: "Rapport de mission transmis à la Flotte. Secteur déclaré sûr — les équipes de la Coalition reprennent leurs postes.",
      visual: "station",
    },
    {
      id: 3,
      speaker: "kira",
      narration: `« Mission accomplie, Cadet. Tu viens de rendre les protocoles ${title} à la Flotte. Repos mérité — puis nouveau déploiement. »`,
      visual: "briefing",
    },
    {
      id: 4,
      speaker: "help",
      narration: "« Statistiques archivées. Un autre cursus t'attend au hangar. À nous de jouer, encore ! »",
      visual: "victory",
      fx: "victory",
    },
  ];
  return { id: cinematicId(course, { kind: "finale" }), scenes };
}
