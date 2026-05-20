import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import BrandLogo from "@/components/ui/BrandLogo";
import LevelNodeComponent, { type LevelNode } from "./LevelNode";
import { getChaptersMeta } from "@/lib/courses-meta";

const HTML_LEVELS: LevelNode[] = [
  {
    id: "ch1",
    slug: "chapitre-1",
    title: "INITIALISATION DE LA STATION",
    subtitle: "Protocole 01 — Les bases HTML",
    icon: "📡",
    spriteRow: 0,
    spriteFrame: 0,
    size: 100,
    x: 15,
    y: 65,
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
    x: 35,
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
    x: 55,
    y: 58,
  },
  {
    id: "ch4",
    slug: "chapitre-4",
    title: "ARSENAL TACTIQUE",
    subtitle: "Protocole 04 — Listes & tableaux",
    icon: "📋",
    spriteRow: 0,
    spriteFrame: 2,
    size: 90,
    x: 75,
    y: 30,
  },
  {
    id: "ch5",
    slug: "chapitre-5",
    title: "CENTRE DE COMMANDEMENT",
    subtitle: "Protocole 05 — Formulaires",
    icon: "🎛️",
    spriteRow: 2,
    spriteFrame: 0,
    size: 130,
    x: 88,
    y: 60,
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
    size: 100,
    x: 12,
    y: 70,
  },
  {
    id: "ch2",
    slug: "chapitre-2",
    title: "PALETTE TACTIQUE",
    subtitle: "Protocole 02 — Sélecteurs & couleurs",
    icon: "🌈",
    spriteRow: 1,
    spriteFrame: 1,
    size: 90,
    x: 32,
    y: 35,
  },
  {
    id: "ch3",
    slug: "chapitre-3",
    title: "MODULES & DIMENSIONS",
    subtitle: "Protocole 03 — Box model",
    icon: "📦",
    spriteRow: 1,
    spriteFrame: 3,
    size: 80,
    x: 52,
    y: 65,
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
    x: 72,
    y: 30,
  },
  {
    id: "ch5",
    slug: "chapitre-5",
    title: "CARTOGRAPHIE GRID",
    subtitle: "Protocole 05 — CSS Grid",
    icon: "🗺",
    spriteRow: 2,
    spriteFrame: 0,
    size: 130,
    x: 88,
    y: 62,
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
    size: 100,
    x: 12,
    y: 70,
  },
  {
    id: "ch2",
    slug: "chapitre-2",
    title: "OPERATIONS & DECISIONS",
    subtitle: "Protocole 02 — Calculs & conditions",
    icon: "🧮",
    spriteRow: 1,
    spriteFrame: 1,
    size: 90,
    x: 32,
    y: 38,
  },
  {
    id: "ch3",
    slug: "chapitre-3",
    title: "FONCTIONS MODULAIRES",
    subtitle: "Protocole 03 — Fonctions & arrow",
    icon: "⚙",
    spriteRow: 1,
    spriteFrame: 3,
    size: 80,
    x: 52,
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
    size: 90,
    x: 72,
    y: 30,
  },
  {
    id: "ch5",
    slug: "chapitre-5",
    title: "OBJETS & METHODES",
    subtitle: "Protocole 05 — Objects & methods",
    icon: "🛠",
    spriteRow: 2,
    spriteFrame: 0,
    size: 130,
    x: 88,
    y: 62,
  },
];

const LEVELS_BY_COURSE: Record<string, LevelNode[]> = {
  html: HTML_LEVELS,
  css: CSS_LEVELS,
  javascript: JS_LEVELS,
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

  const playableSlugs = new Set(getChaptersMeta(course).map((c) => c.slug));

  return (
    <div className="relative h-full overflow-hidden">
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
          <BrandLogo size={34} />
          <h1
            className="font-tech text-nebula-cyan text-lg tracking-[0.25em]"
            style={{ textShadow: "0 0 20px rgba(0, 240, 255, 0.3)" }}
          >
            CURSUS {course.toUpperCase()}
          </h1>
        </div>
        <div className="w-24" />
      </div>

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
          />
        ))}
      </div>
    </div>
  );
}
