import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import CourseCinematicsMount from "@/components/cinematics/CourseCinematicsMount";
import BrandLogo from "@/components/ui/BrandLogo";
import LevelNodeComponent, { type LevelNode } from "./LevelNode";
import { getChaptersMeta } from "@/lib/courses-meta";
import { getCourseStatus } from "@/lib/courses-catalog";
import NullProgressBar from "@/components/lesson/NullProgressBar";

const HTML_LEVELS: LevelNode[] = [
  {
    id: "ch1",
    slug: "chapitre-1",
    title: "ÉTABLISSEMENT DE LA BASE LUNAIRE",
    subtitle: "Protocole 01 — Les bases HTML",
    icon: "📡",
    spriteRow: 0,
    spriteFrame: 0,
    size: 95,
    x: 9,
    y: 68,
  },
  {
    id: "ch2",
    slug: "chapitre-2",
    title: "SYSTÈMES DE NAVIGATION",
    subtitle: "Protocole 02 — Liens & navigation",
    icon: "🧭",
    spriteRow: 1,
    spriteFrame: 1,
    size: 80,
    x: 21,
    y: 40,
  },
  {
    id: "ch3",
    slug: "chapitre-3",
    title: "BASE DE DONNÉES VISUELLE",
    subtitle: "Protocole 03 — Images & médias",
    icon: "🖼️",
    spriteRow: 1,
    spriteFrame: 3,
    size: 70,
    x: 33,
    y: 64,
  },
  {
    id: "ch4",
    slug: "chapitre-4",
    title: "ARSENAL TACTIQUE",
    subtitle: "Protocole 04 — Listes & tableaux",
    icon: "📋",
    spriteRow: 0,
    spriteFrame: 2,
    size: 85,
    x: 45,
    y: 36,
  },
  {
    id: "ch5",
    slug: "chapitre-5",
    title: "CENTRE DE COMMANDEMENT",
    subtitle: "Protocole 05 — Formulaires",
    icon: "🎛️",
    spriteRow: 2,
    spriteFrame: 0,
    size: 95,
    x: 57,
    y: 62,
  },
  {
    id: "ch6",
    slug: "chapitre-6",
    title: "STRUCTURE SÉMANTIQUE",
    subtitle: "Protocole 06 — HTML5 sémantique & accessibilité",
    icon: "🏗",
    spriteRow: 2,
    spriteFrame: 1,
    size: 80,
    x: 69,
    y: 34,
  },
  {
    id: "ch7",
    slug: "chapitre-7",
    title: "MÉTA DONNÉES",
    subtitle: "Protocole 07 — Métadonnées & SEO",
    icon: "📡",
    spriteRow: 0,
    spriteFrame: 3,
    size: 75,
    x: 80,
    y: 62,
  },
  {
    id: "ch8",
    slug: "chapitre-8",
    title: "MÉDIAS AVANCÉS",
    subtitle: "Protocole 08 — Audio, vidéo & iframe",
    icon: "🎥",
    spriteRow: 2,
    spriteFrame: 2,
    size: 110,
    x: 90,
    y: 32,
  },
];

const CSS_LEVELS: LevelNode[] = [
  {
    id: "ch1",
    slug: "chapitre-1",
    title: "INSTALLATION DU SYSTÈME GRAPHIQUE",
    subtitle: "Protocole 01 — Couleurs & premier style",
    icon: "🎨",
    spriteRow: 0,
    spriteFrame: 0,
    size: 90,
    x: 8,
    y: 66,
  },
  {
    id: "ch2",
    slug: "chapitre-2",
    title: "PALETTE TACTIQUE",
    subtitle: "Protocole 02 — Sélecteurs & couleurs",
    icon: "🌈",
    spriteRow: 1,
    spriteFrame: 1,
    size: 80,
    x: 18,
    y: 34,
  },
  {
    id: "ch3",
    slug: "chapitre-3",
    title: "MODULES & DIMENSIONS",
    subtitle: "Protocole 03 — Box model",
    icon: "📦",
    spriteRow: 1,
    spriteFrame: 3,
    size: 75,
    x: 28,
    y: 62,
  },
  {
    id: "ch4",
    slug: "chapitre-4",
    title: "ASSEMBLAGE EN FORMATION",
    subtitle: "Protocole 04 — Flexbox",
    icon: "🛸",
    spriteRow: 0,
    spriteFrame: 2,
    size: 90,
    x: 38,
    y: 32,
  },
  {
    id: "ch5",
    slug: "chapitre-5",
    title: "CARTOGRAPHIE GRID",
    subtitle: "Protocole 05 — CSS Grid",
    icon: "🗺",
    spriteRow: 2,
    spriteFrame: 0,
    size: 95,
    x: 47,
    y: 60,
  },
  {
    id: "ch6",
    slug: "chapitre-6",
    title: "ANCRAGE ORBITAL",
    subtitle: "Protocole 06 — Position & z-index",
    icon: "🧲",
    spriteRow: 2,
    spriteFrame: 1,
    size: 80,
    x: 56,
    y: 32,
  },
  {
    id: "ch7",
    slug: "chapitre-7",
    title: "PSEUDO CLASSES",
    subtitle: "Protocole 07 — :hover, :focus & états",
    icon: "🪄",
    spriteRow: 0,
    spriteFrame: 3,
    size: 75,
    x: 65,
    y: 60,
  },
  {
    id: "ch8",
    slug: "chapitre-8",
    title: "RESPONSIVE DESIGN",
    subtitle: "Protocole 08 — Media queries",
    icon: "📱",
    spriteRow: 2,
    spriteFrame: 2,
    size: 85,
    x: 74,
    y: 32,
  },
  {
    id: "ch9",
    slug: "chapitre-9",
    title: "TRANSITIONS & ANIMATIONS",
    subtitle: "Protocole 09 — transition & @keyframes",
    icon: "💫",
    spriteRow: 1,
    spriteFrame: 0,
    size: 80,
    x: 83,
    y: 60,
  },
  {
    id: "ch10",
    slug: "chapitre-10",
    title: "VARIABLES CSS",
    subtitle: "Protocole 10 — Custom properties",
    icon: "🧩",
    spriteRow: 1,
    spriteFrame: 2,
    size: 110,
    x: 91,
    y: 32,
  },
];

const JS_LEVELS: LevelNode[] = [
  {
    id: "ch1",
    slug: "chapitre-1",
    title: "PREMIER SIGNAL",
    subtitle: "Protocole 01 — Variables & console.log",
    icon: "📟",
    spriteRow: 0,
    spriteFrame: 0,
    size: 90,
    x: 7,
    y: 66,
  },
  {
    id: "ch2",
    slug: "chapitre-2",
    title: "OPERATIONS & DECISIONS",
    subtitle: "Protocole 02 — Calculs & conditions",
    icon: "🧮",
    spriteRow: 1,
    spriteFrame: 1,
    size: 80,
    x: 15,
    y: 36,
  },
  {
    id: "ch3",
    slug: "chapitre-3",
    title: "FONCTIONS MODULAIRES",
    subtitle: "Protocole 03 — Fonctions & arrow",
    icon: "⚙",
    spriteRow: 1,
    spriteFrame: 3,
    size: 75,
    x: 23,
    y: 62,
  },
  {
    id: "ch4",
    slug: "chapitre-4",
    title: "TABLEAUX & BOUCLES",
    subtitle: "Protocole 04 — Arrays & for",
    icon: "📚",
    spriteRow: 0,
    spriteFrame: 2,
    size: 85,
    x: 31,
    y: 34,
  },
  {
    id: "ch5",
    slug: "chapitre-5",
    title: "OBJETS & METHODES",
    subtitle: "Protocole 05 — Objects & methods",
    icon: "🛠",
    spriteRow: 2,
    spriteFrame: 0,
    size: 90,
    x: 39,
    y: 60,
  },
  {
    id: "ch6",
    slug: "chapitre-6",
    title: "MÉTHODES MODERNES",
    subtitle: "Protocole 06 — map, filter & reduce",
    icon: "🧮",
    spriteRow: 2,
    spriteFrame: 1,
    size: 75,
    x: 47,
    y: 32,
  },
  {
    id: "ch7",
    slug: "chapitre-7",
    title: "DOM MANIPULATION",
    subtitle: "Protocole 07 — querySelector & innerText",
    icon: "🧰",
    spriteRow: 0,
    spriteFrame: 3,
    size: 80,
    x: 55,
    y: 58,
  },
  {
    id: "ch8",
    slug: "chapitre-8",
    title: "ÉVÉNEMENTS",
    subtitle: "Protocole 08 — addEventListener",
    icon: "⚡",
    spriteRow: 2,
    spriteFrame: 2,
    size: 75,
    x: 63,
    y: 32,
  },
  {
    id: "ch9",
    slug: "chapitre-9",
    title: "PROMISES & ASYNC",
    subtitle: "Protocole 09 — async / await",
    icon: "🌐",
    spriteRow: 1,
    spriteFrame: 0,
    size: 80,
    x: 71,
    y: 58,
  },
  {
    id: "ch10",
    slug: "chapitre-10",
    title: "STOCKAGE LOCAL",
    subtitle: "Protocole 10 — localStorage & JSON",
    icon: "💾",
    spriteRow: 1,
    spriteFrame: 2,
    size: 75,
    x: 79,
    y: 32,
  },
  {
    id: "ch11",
    slug: "chapitre-11",
    title: "RÉSEAU & FETCH",
    subtitle: "Protocole 11 — fetch & API",
    icon: "📡",
    spriteRow: 2,
    spriteFrame: 3,
    size: 80,
    x: 86,
    y: 60,
  },
  {
    id: "ch12",
    slug: "chapitre-12",
    title: "API REST & MÉTHODES HTTP",
    subtitle: "Protocole 12 — GET, POST, PUT & DELETE",
    icon: "🛰",
    spriteRow: 0,
    spriteFrame: 1,
    size: 105,
    x: 92,
    y: 32,
  },
];

const REACT_LEVELS: LevelNode[] = [
  {
    id: "ch1",
    slug: "chapitre-1",
    title: "PREMIER COMPOSANT",
    subtitle: "Protocole 01 — Composants & props",
    icon: "⚛",
    spriteRow: 0,
    spriteFrame: 0,
    size: 100,
    x: 15,
    y: 65,
  },
  {
    id: "ch2",
    slug: "chapitre-2",
    title: "MEMOIRE REACTIVE",
    subtitle: "Protocole 02 — useState",
    icon: "🧠",
    spriteRow: 1,
    spriteFrame: 1,
    size: 90,
    x: 38,
    y: 38,
  },
  {
    id: "ch3",
    slug: "chapitre-3",
    title: "EFFETS DE BORD",
    subtitle: "Protocole 03 — useEffect",
    icon: "🔁",
    spriteRow: 1,
    spriteFrame: 3,
    size: 90,
    x: 62,
    y: 62,
  },
  {
    id: "ch4",
    slug: "chapitre-4",
    title: "NAVIGATION SPA",
    subtitle: "Protocole 04 — React Router",
    icon: "🗺",
    spriteRow: 2,
    spriteFrame: 0,
    size: 110,
    x: 88,
    y: 30,
  },
];

const TYPESCRIPT_LEVELS: LevelNode[] = [
  {
    id: "ch1",
    slug: "chapitre-1",
    title: "BLINDAGE DU CODE",
    subtitle: "Protocole 01 — Typage statique",
    icon: "🛡",
    spriteRow: 0,
    spriteFrame: 0,
    size: 110,
    x: 50,
    y: 50,
  },
];

const GIT_LEVELS: LevelNode[] = [
  {
    id: "ch1",
    slug: "chapitre-1",
    title: "JOURNAL DE BORD",
    subtitle: "Protocole 01 — Versions & collaboration",
    icon: "🗂",
    spriteRow: 0,
    spriteFrame: 0,
    size: 110,
    x: 50,
    y: 50,
  },
];

const SQL_LEVELS: LevelNode[] = [
  {
    id: "ch1",
    slug: "chapitre-1",
    title: "ENTREPOT GALACTIQUE",
    subtitle: "Protocole 01 — Bases de donnees relationnelles",
    icon: "🗃",
    spriteRow: 0,
    spriteFrame: 0,
    size: 110,
    x: 50,
    y: 50,
  },
];

const NODEJS_LEVELS: LevelNode[] = [
  {
    id: "ch1",
    slug: "chapitre-1",
    title: "CENTRE DE COMMANDEMENT",
    subtitle: "Protocole 01 — API Express",
    icon: "🛸",
    spriteRow: 0,
    spriteFrame: 0,
    size: 110,
    x: 50,
    y: 50,
  },
];

const TESTS_LEVELS: LevelNode[] = [
  {
    id: "ch1",
    slug: "chapitre-1",
    title: "ASSURANCE QUALITE",
    subtitle: "Protocole 01 — Vitest & Playwright",
    icon: "✅",
    spriteRow: 0,
    spriteFrame: 0,
    size: 110,
    x: 50,
    y: 50,
  },
];

const DEVOPS_LEVELS: LevelNode[] = [
  {
    id: "ch1",
    slug: "chapitre-1",
    title: "MISE EN ORBITE",
    subtitle: "Protocole 01 — Build, Vercel & Docker",
    icon: "🚀",
    spriteRow: 0,
    spriteFrame: 0,
    size: 110,
    x: 50,
    y: 50,
  },
];

const MONGODB_LEVELS: LevelNode[] = [
  {
    id: "ch1",
    slug: "chapitre-1",
    title: "DEPOT FLEXIBLE",
    subtitle: "Protocole 01 — MongoDB & NoSQL",
    icon: "🍃",
    spriteRow: 0,
    spriteFrame: 0,
    size: 110,
    x: 50,
    y: 50,
  },
];

const SECURITY_LEVELS: LevelNode[] = [
  {
    id: "ch1",
    slug: "chapitre-1",
    title: "BLINDAGE ANTI-INTRUSION",
    subtitle: "Protocole 01 — OWASP, XSS, SQLi, JWT",
    icon: "🛡",
    spriteRow: 0,
    spriteFrame: 0,
    size: 110,
    x: 50,
    y: 50,
  },
];

const PYTHON_LEVELS: LevelNode[] = [
  {
    id: "ch1",
    slug: "chapitre-1",
    title: "LANGAGE SERPENT",
    subtitle: "Protocole 01 — Fondamentaux Python",
    icon: "🐍",
    spriteRow: 0,
    spriteFrame: 0,
    size: 110,
    x: 50,
    y: 50,
  },
];

const ALGO_LEVELS: LevelNode[] = [
  {
    id: "ch1",
    slug: "chapitre-1",
    title: "CALCUL OPTIMAL",
    subtitle: "Protocole 01 — Big-O, recursion, tris",
    icon: "🧮",
    spriteRow: 0,
    spriteFrame: 0,
    size: 110,
    x: 50,
    y: 50,
  },
];

const LEVELS_BY_COURSE: Record<string, LevelNode[]> = {
  html: HTML_LEVELS,
  css: CSS_LEVELS,
  javascript: JS_LEVELS,
  react: REACT_LEVELS,
  typescript: TYPESCRIPT_LEVELS,
  git: GIT_LEVELS,
  sql: SQL_LEVELS,
  nodejs: NODEJS_LEVELS,
  tests: TESTS_LEVELS,
  devops: DEVOPS_LEVELS,
  mongodb: MONGODB_LEVELS,
  security: SECURITY_LEVELS,
  python: PYTHON_LEVELS,
  algo: ALGO_LEVELS,
};

const COURSE_BACKGROUND = "/space-background-orange.webp";

export default async function CourseMapPage({
  params,
}: {
  params: Promise<{ course: string }>;
}) {
  const { course } = await params;
  const levels = LEVELS_BY_COURSE[course];
  if (!levels) {
    notFound();
  }

  const chaptersMeta = await getChaptersMeta(course);
  const playableSlugs = new Set(chaptersMeta.map((c) => c.slug));
  const isPreview = getCourseStatus(course) === "preview";

  return (
    <div className="relative h-full overflow-hidden">
      <CourseCinematicsMount course={course} />
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src={COURSE_BACKGROUND}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="fixed inset-0 bg-nebula-stars z-0 pointer-events-none opacity-30" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-[rgba(3,6,13,0.22)]" />

      <div className="relative z-20 flex items-center justify-between px-6 py-4">
        <Link
          href="/dashboard"
          className="font-tech text-nebula-text-secondary text-sm tracking-wider hover:text-nebula-cyan transition-colors"
        >
          ← RETOUR
        </Link>
        <div className="flex items-center gap-3">
          <BrandLogo size={40} />
          <h1
            className="font-tech text-nebula-cyan text-lg tracking-[0.25em]"
            style={{ textShadow: "0 0 20px rgba(0, 240, 255, 0.3)" }}
          >
            CURSUS {course.toUpperCase()}
          </h1>
        </div>
        <div className="w-24" />
      </div>

      <div className="relative z-20 mx-auto max-w-3xl px-4 pt-1">
        <NullProgressBar course={course} chapters={chaptersMeta} />
      </div>

      {isPreview && (
        <div className="relative z-20 mx-auto max-w-3xl px-4">
          <p className="rounded-sm border border-nebula-text-dim/30 bg-nebula-bg-panel/60 px-4 py-2 text-center font-tech text-[11px] uppercase tracking-widest text-nebula-text-secondary">
            ⚠ Chapitre pilote — la suite de ce cursus est en cours de déploiement
          </p>
        </div>
      )}

      <div
        className="relative z-10 mx-auto animate-fade-in-paint"
        style={{
          width: "100%",
          maxWidth: 1200,
          height: "calc(100vh - 80px)",
        }}
      >
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          viewBox="0 0 1200 700"
          preserveAspectRatio="xMidYMid meet"
        >
          {levels.slice(0, -1).map((node, i) => {
            const next = levels[i + 1];
            const x1 = (node.x / 100) * 1200;
            const y1 = (node.y / 100) * 700;
            const x2 = (next.x / 100) * 1200;
            const y2 = (next.y / 100) * 700;
            const isActive =
              playableSlugs.has(node.slug) && playableSlugs.has(next.slug);
            return (
              <line
                key={`line-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={
                  isActive ? "rgba(0, 240, 255, 0.25)" : "rgba(42, 58, 85, 0.4)"
                }
                strokeWidth={isActive ? 2 : 1}
                strokeDasharray={isActive ? "none" : "8 6"}
              />
            );
          })}
        </svg>

        {levels.map((node, i) => (
          <LevelNodeComponent
            key={node.id}
            node={node}
            course={course}
            index={i}
            chaptersMeta={chaptersMeta}
          />
        ))}
      </div>
    </div>
  );
}
