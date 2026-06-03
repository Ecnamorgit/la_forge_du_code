/**
 * Single source of truth for course meta-data (the thing displayed in lists,
 * cards, and navigations).
 *
 * Adding a new course = add an entry here + add chapter summaries in
 * lib/chapter-summaries.ts + wire it in lib/courses-registry.ts.
 *
 * Visual design (LevelNode positions / sprites) lives in
 * app/learn/[course]/page.tsx where it belongs as art direction.
 */

import { CHAPTER_SUMMARIES } from "./chapter-summaries";

export type CourseColor = "cyan" | "blue" | "orange";

export interface CourseInfo {
  slug: string;
  title: string;
  subtitle: string;
  icon: string;
  color: CourseColor;
  description: string;
}

export const COURSES_CATALOG: CourseInfo[] = [
  {
    slug: "html",
    title: "HTML",
    subtitle: "Structure des pages web",
    icon: "📡",
    color: "cyan",
    description:
      "Maîtrise les fondations du web : balises, structure, sémantique. Construis ta première station orbitale.",
  },
  {
    slug: "css",
    title: "CSS",
    subtitle: "Design & mise en forme",
    icon: "🎨",
    color: "blue",
    description:
      "Habille ta station : sélecteurs, box model, Flexbox et Grid. Donne vie à ton interface.",
  },
  {
    slug: "javascript",
    title: "JavaScript",
    subtitle: "Logique & interactivité",
    icon: "⚡",
    color: "orange",
    description:
      "Programme les systèmes de la flotte : variables, conditions, fonctions, tableaux et objets.",
  },
  {
    slug: "react",
    title: "React",
    subtitle: "Composants & hooks",
    icon: "⚛",
    color: "cyan",
    description:
      "Construis des interfaces modernes : composants, useState, useEffect et React Router.",
  },
  {
    slug: "typescript",
    title: "TypeScript",
    subtitle: "Typage statique pour JS",
    icon: "🛡",
    color: "blue",
    description:
      "Détecte les bugs avant l'exécution avec types primitifs, interfaces et unions.",
  },
  {
    slug: "git",
    title: "Git",
    subtitle: "Versioning & collaboration",
    icon: "🗂",
    color: "orange",
    description:
      "Trace, branche, fusionne. L'outil de versioning indispensable de toute équipe.",
  },
  {
    slug: "sql",
    title: "SQL",
    subtitle: "Bases de données relationnelles",
    icon: "🗃",
    color: "blue",
    description:
      "Stocke et interroge la donnée durablement avec SELECT, WHERE, JOIN et plus.",
  },
  {
    slug: "nodejs",
    title: "Node.js",
    subtitle: "Serveur back-end Express",
    icon: "🛸",
    color: "orange",
    description:
      "Crée ton API : routes, middlewares, body parsing et params dynamiques avec Express.",
  },
  {
    slug: "tests",
    title: "Tests",
    subtitle: "Vitest & Playwright",
    icon: "✅",
    color: "cyan",
    description:
      "Tests unitaires, intégration et E2E. La pyramide des tests pour un code fiable.",
  },
  {
    slug: "devops",
    title: "DevOps",
    subtitle: "Build, deploy & Docker",
    icon: "🚀",
    color: "orange",
    description:
      "Build, Vercel, variables d'env et Docker. Mets ton application en production.",
  },
  {
    slug: "mongodb",
    title: "MongoDB",
    subtitle: "NoSQL & documents",
    icon: "🍃",
    color: "blue",
    description:
      "L'alternative NoSQL : documents flexibles, aggregation pipeline, scaling horizontal.",
  },
  {
    slug: "security",
    title: "Security",
    subtitle: "OWASP & sécurité web",
    icon: "🛡",
    color: "orange",
    description:
      "XSS, SQL injection, bcrypt, JWT, CORS. Le minimum vital pour une app prod.",
  },
  {
    slug: "python",
    title: "Python",
    subtitle: "Langage polyvalent",
    icon: "🐍",
    color: "blue",
    description:
      "Le langage le plus polyvalent : data, AI, scripts et web (Django/FastAPI).",
  },
  {
    slug: "algo",
    title: "Algorithmie",
    subtitle: "Big-O & structures de données",
    icon: "🧮",
    color: "cyan",
    description:
      "Big-O, recherche binaire, tris et récursion. La base des entretiens techniques.",
  },
];

const BY_SLUG: Record<string, CourseInfo> = Object.fromEntries(
  COURSES_CATALOG.map((c) => [c.slug, c])
);

export function getCourseInfo(slug: string): CourseInfo | null {
  return BY_SLUG[slug] ?? null;
}

export function getCourseChaptersCount(slug: string): number {
  return CHAPTER_SUMMARIES[slug]?.length ?? 0;
}
