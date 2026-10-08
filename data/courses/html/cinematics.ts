/**
 * Arc narratif du cursus HTML : reconstruction de la base lunaire Selene
 * (docs/conception_storytelling.md). Nombre de scènes par cinématique (intro
 * 3-4, outro 2-3, finale 5-7) vérifié par lib/cinematics/html-arc.test.ts.
 */

import { cinematicId, type CourseCinematics } from "@/lib/cinematics/types";

const course = "html";

export const HTML_CINEMATICS: CourseCinematics = {
  courseIntro: {
    id: cinematicId(course, { kind: "intro" }),
    scenes: [
      {
        id: 0,
        speaker: "system",
        narration:
          "ALERTE INTRUSION — Base lunaire Selene. Le Spectre a effacé les plans de structure : balises corrompues, dock d'amarrage hors ligne.",
        visual: "spectre",
        fx: "alert",
      },
      {
        id: 1,
        speaker: "kira",
        narration:
          "« Cadet, écoute-moi bien. Sans structure HTML, Selene n'est qu'une coquille vide dans le noir. Tu vas la reconstruire, balise par balise. »",
        visual: "briefing",
      },
      {
        id: 2,
        speaker: "help",
        narration:
          "« Console d'ingénierie déverrouillée. Huit secteurs à restaurer, Cadet. À nous de jouer ! »",
        visual: "station",
      },
    ],
  },

  chapterOutros: {
    "chapitre-1": {
      id: cinematicId(course, { kind: "chapter", chapter: "chapitre-1" }),
      scenes: [
        {
          id: 0,
          speaker: "system",
          narration:
            "FONDATIONS EN LIGNE. Le squelette de Selene tient : doctype, tête, corps. La base respire de nouveau.",
          visual: "station",
          fx: "victory",
        },
        {
          id: 1,
          speaker: "kira",
          narration:
            "« Première pierre posée, Cadet. Une base sans navigation reste une prison : au secteur suivant. »",
          visual: "briefing",
        },
      ],
    },
    "chapitre-2": {
      id: cinematicId(course, { kind: "chapter", chapter: "chapitre-2" }),
      scenes: [
        {
          id: 0,
          speaker: "system",
          narration:
            "SYSTÈMES DE NAVIGATION RÉTABLIS. Les liens relient de nouveau les modules de Selene entre eux.",
          visual: "station",
          fx: "victory",
        },
        {
          id: 1,
          speaker: "help",
          narration:
            "« Les équipes peuvent circuler ! Prochaine étape : rallumer les écrans de la base de données visuelle. »",
          visual: "briefing",
        },
      ],
    },
    "chapitre-3": {
      id: cinematicId(course, { kind: "chapter", chapter: "chapitre-3" }),
      scenes: [
        {
          id: 0,
          speaker: "system",
          narration:
            "BANQUE VISUELLE RESTAURÉE. Images et archives s'affichent sur tous les écrans de Selene.",
          visual: "station",
          fx: "victory",
        },
        {
          id: 1,
          speaker: "kira",
          narration:
            "« On y voit clair, enfin. Mais les senseurs captent une activité du Spectre près de l'arsenal... Reste sur tes gardes. »",
          visual: "briefing",
        },
      ],
    },
    "chapitre-4": {
      id: cinematicId(course, { kind: "chapter", chapter: "chapitre-4" }),
      scenes: [
        {
          id: 0,
          speaker: "spectre",
          narration:
            "« Tu ranges tes listes, tu alignes tes tableaux... Tu crois structurer. Tu ne fais que retarder l'effacement. »",
          visual: "spectre",
          fx: "glitch",
        },
        {
          id: 1,
          speaker: "system",
          narration:
            "ARSENAL TACTIQUE SÉCURISÉ. L'intrusion du Spectre a été repoussée — l'inventaire est de nouveau lisible.",
          visual: "station",
          fx: "victory",
        },
        {
          id: 2,
          speaker: "kira",
          narration:
            "« Il est venu en personne. C'est qu'on le gêne, Cadet. Le centre de commandement est notre prochaine cible. »",
          visual: "briefing",
        },
      ],
    },
    "chapitre-5": {
      id: cinematicId(course, { kind: "chapter", chapter: "chapitre-5" }),
      scenes: [
        {
          id: 0,
          speaker: "system",
          narration:
            "CENTRE DE COMMANDEMENT OPÉRATIONNEL. Les formulaires relaient les ordres de la Flotte sans erreur.",
          visual: "station",
          fx: "victory",
        },
        {
          id: 1,
          speaker: "help",
          narration:
            "« Mi-parcours franchi, Cadet ! Selene répond aux commandes. Il reste à consolider sa charpente sémantique. »",
          visual: "briefing",
        },
      ],
    },
    "chapitre-6": {
      id: cinematicId(course, { kind: "chapter", chapter: "chapitre-6" }),
      scenes: [
        {
          id: 0,
          speaker: "system",
          narration:
            "STRUCTURE SÉMANTIQUE CONSOLIDÉE. Chaque section de Selene annonce désormais sa fonction — plus rien n'est ambigu pour les machines de la Flotte.",
          visual: "station",
          fx: "victory",
        },
        {
          id: 1,
          speaker: "kira",
          narration:
            "« Du travail d'ingénieur, pas de bricoleur. Le Spectre déteste l'ordre — continue de lui en donner. »",
          visual: "briefing",
        },
      ],
    },
    "chapitre-7": {
      id: cinematicId(course, { kind: "chapter", chapter: "chapitre-7" }),
      scenes: [
        {
          id: 0,
          speaker: "system",
          narration:
            "MÉTA-DONNÉES DIFFUSÉES. Selene est identifiable par toutes les balises de la Coalition — la base existe de nouveau sur les cartes.",
          visual: "station",
          fx: "victory",
        },
        {
          id: 1,
          speaker: "help",
          narration:
            "« Un dernier secteur, Cadet : les médias avancés. Après ça, le dock d'amarrage rouvre. Tiens bon ! »",
          visual: "briefing",
        },
      ],
    },
    "chapitre-8": {
      id: cinematicId(course, { kind: "chapter", chapter: "chapitre-8" }),
      scenes: [
        {
          id: 0,
          speaker: "system",
          narration:
            "MÉDIAS AVANCÉS EN LIGNE. Sons et vidéos circulent dans toute la base — Selene a retrouvé sa voix.",
          visual: "station",
          fx: "victory",
        },
        {
          id: 1,
          speaker: "kira",
          narration:
            "« Tous les secteurs répondent. Prépare-toi, Cadet : ouverture du dock d'amarrage imminente. »",
          visual: "briefing",
        },
      ],
    },
  },

  courseFinale: {
    id: cinematicId(course, { kind: "finale" }),
    scenes: [
      {
        id: 0,
        speaker: "system",
        narration:
          "PROTOCOLES HTML : 100 % RESTAURÉS. Base lunaire Selene entièrement opérationnelle.",
        visual: "victory",
        fx: "victory",
      },
      {
        id: 1,
        speaker: "system",
        narration:
          "Le dock d'amarrage s'ouvre. Les premiers vaisseaux de la Coalition Nebula se posent sur Selene depuis le début de l'invasion.",
        visual: "station",
      },
      {
        id: 2,
        speaker: "spectre",
        narration:
          "« Une base... reconstruite. Amusant. La structure sans style n'est qu'un squelette, Cadet. Je t'attends dans les consoles graphiques. »",
        visual: "spectre",
        fx: "glitch",
      },
      {
        id: 3,
        speaker: "kira",
        narration:
          "« Ne l'écoute pas. Ce que tu as fait ici, aucun protocole automatique n'aurait pu le faire. Selene te doit sa structure, Cadet. »",
        visual: "briefing",
      },
      {
        id: 4,
        speaker: "help",
        narration:
          "« Rapport transmis à la Flotte : mission HTML accomplie ! Le cursus CSS est déverrouillé au hangar — le Spectre nous y attend. À nous de jouer ! »",
        visual: "victory",
        fx: "victory",
      },
    ],
  },
};
