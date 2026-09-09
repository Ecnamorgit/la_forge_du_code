/**
 * Static lightweight summaries of all chapters across all courses.
 *
 * This file exists to avoid eager-loading every ChapterData (with its heavy
 * briefing template literals) just to display course maps / dashboards.
 *
 * Keep this file in sync manually when adding/renaming chapters.
 * Heavy ChapterData lives in lib/courses-registry.ts (data/courses/**).
 */

export interface ChapterSummary {
  slug: string;
  title: string;
  totalSteps: number;
}

export const CHAPTER_SUMMARIES: Record<string, ChapterSummary[]> = {
  html: [
    { slug: "chapitre-1", title: "ÉTABLISSEMENT DE LA BASE LUNAIRE", totalSteps: 3 },
    { slug: "chapitre-2", title: "SYSTÈMES DE NAVIGATION", totalSteps: 4 },
    { slug: "chapitre-3", title: "BASE DE DONNÉES VISUELLE", totalSteps: 4 },
    { slug: "chapitre-4", title: "ARSENAL TACTIQUE", totalSteps: 4 },
    { slug: "chapitre-5", title: "CENTRE DE COMMANDEMENT", totalSteps: 4 },
    { slug: "chapitre-6", title: "STRUCTURE SÉMANTIQUE", totalSteps: 4 },
    { slug: "chapitre-7", title: "META DONNÉES", totalSteps: 4 },
    { slug: "chapitre-8", title: "MÉDIAS AVANCES", totalSteps: 4 },
  ],
  css: [
    { slug: "chapitre-1", title: "INSTALLATION DU SYSTÈME GRAPHIQUE", totalSteps: 4 },
    { slug: "chapitre-2", title: "PALETTE TACTIQUE", totalSteps: 4 },
    { slug: "chapitre-3", title: "MODULES & DIMENSIONS", totalSteps: 4 },
    { slug: "chapitre-4", title: "ASSEMBLAGE EN FORMATION", totalSteps: 4 },
    { slug: "chapitre-5", title: "CARTOGRAPHIE GRID", totalSteps: 4 },
    { slug: "chapitre-6", title: "ANCRAGE ORBITAL", totalSteps: 4 },
    { slug: "chapitre-7", title: "PSEUDO CLASSES", totalSteps: 4 },
    { slug: "chapitre-8", title: "RESPONSIVE DESIGN", totalSteps: 4 },
    { slug: "chapitre-9", title: "TRANSITIONS & ANIMATIONS", totalSteps: 4 },
    { slug: "chapitre-10", title: "VARIABLES CSS", totalSteps: 4 },
  ],
  javascript: [
    { slug: "chapitre-1", title: "PREMIER SIGNAL", totalSteps: 4 },
    { slug: "chapitre-2", title: "OPÉRATIONS & DÉCISIONS", totalSteps: 4 },
    { slug: "chapitre-3", title: "FONCTIONS MODULAIRES", totalSteps: 4 },
    { slug: "chapitre-4", title: "TABLEAUX & BOUCLES", totalSteps: 4 },
    { slug: "chapitre-5", title: "OBJETS & MÉTHODES", totalSteps: 4 },
    { slug: "chapitre-6", title: "MÉTHODES MODERNES", totalSteps: 4 },
    { slug: "chapitre-7", title: "DOM MANIPULATION", totalSteps: 4 },
    { slug: "chapitre-8", title: "ÉVÉNEMENTS", totalSteps: 4 },
    { slug: "chapitre-9", title: "PROMISES & ASYNC", totalSteps: 4 },
    { slug: "chapitre-10", title: "STOCKAGE LOCAL", totalSteps: 4 },
    { slug: "chapitre-11", title: "RÉSEAU & FETCH", totalSteps: 4 },
    { slug: "chapitre-12", title: "API REST & MÉTHODES HTTP", totalSteps: 4 },
  ],
  react: [
    { slug: "chapitre-1", title: "REACT & COMPOSANTS", totalSteps: 4 },
    { slug: "chapitre-2", title: "REACT & useState", totalSteps: 4 },
    { slug: "chapitre-3", title: "REACT & useEffect", totalSteps: 4 },
    { slug: "chapitre-4", title: "REACT ROUTER & NAVIGATION", totalSteps: 4 },
    { slug: "chapitre-5", title: "REACT & LISTES", totalSteps: 4 },
    { slug: "chapitre-6", title: "REACT & FORMULAIRES", totalSteps: 4 },
    { slug: "chapitre-7", title: "HOOKS PERSONNALISES", totalSteps: 4 },
    { slug: "chapitre-8", title: "CONTEXTE & useReducer", totalSteps: 4 },
  ],
  typescript: [{ slug: "chapitre-1", title: "TYPESCRIPT & TYPAGE STATIQUE", totalSteps: 4 }],
  git: [{ slug: "chapitre-1", title: "GIT & VERSIONS", totalSteps: 4 }],
  sql: [{ slug: "chapitre-1", title: "SQL & BASES DE DONNÉES", totalSteps: 4 }],
  nodejs: [{ slug: "chapitre-1", title: "NODE.JS & EXPRESS", totalSteps: 4 }],
  tests: [{ slug: "chapitre-1", title: "TESTS & VITEST", totalSteps: 4 }],
  devops: [{ slug: "chapitre-1", title: "DÉPLOIEMENT & PRODUCTION", totalSteps: 4 }],
  mongodb: [{ slug: "chapitre-1", title: "MONGODB & NOSQL", totalSteps: 4 }],
  security: [{ slug: "chapitre-1", title: "SÉCURITÉ & OWASP", totalSteps: 4 }],
  python: [{ slug: "chapitre-1", title: "PYTHON & FONDAMENTAUX", totalSteps: 4 }],
  algo: [{ slug: "chapitre-1", title: "ALGORITHMIE & COMPLEXITÉ", totalSteps: 4 }],
};
