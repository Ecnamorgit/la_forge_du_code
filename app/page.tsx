"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { unlockAudio } from "@/lib/audio";

const COURSES = [
  {
    slug: "html",
    title: "HTML",
    subtitle: "Structure des pages web",
    icon: "📡",
    chapters: 1,
    color: "cyan",
    description:
      "Maîtrise les fondations du web : balises, structure, sémantique. Construis ta première station orbitale.",
    status: "available" as const,
  },
  {
    slug: "css",
    title: "CSS",
    subtitle: "Design & mise en forme",
    icon: "🎨",
    chapters: 0,
    color: "blue",
    description:
      "Habille ta station avec des styles, couleurs et animations. Bientôt disponible.",
    status: "locked" as const,
  },
  {
    slug: "javascript",
    title: "JavaScript",
    subtitle: "Logique & interactivité",
    icon: "⚡",
    chapters: 0,
    color: "orange",
    description:
      "Programme les systèmes de défense automatisés. Bientôt disponible.",
    status: "locked" as const,
  },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative h-full overflow-hidden">
      <div className="fixed inset-0 bg-nebula-bg z-0 pointer-events-none" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
        <div
          className="text-center mb-12"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(-20px)",
            transition: "all 0.8s ease",
          }}
        >
          <h1
            className="font-tech text-5xl md:text-6xl tracking-[0.3em] text-nebula-cyan mb-2"
            style={{
              textShadow:
                "0 0 30px rgba(0, 240, 255, 0.4), 0 0 60px rgba(0, 240, 255, 0.15)",
            }}
          >
            NEBULA COMMAND
          </h1>
          <div className="h-px w-48 mx-auto bg-gradient-to-r from-transparent via-nebula-cyan to-transparent mb-4" />
          <p className="font-body text-nebula-text-secondary text-lg tracking-widest uppercase">
            Centre de formation galactique
          </p>
        </div>

        <div
          className="flex flex-wrap items-start gap-10 justify-center max-w-4xl"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.8s ease 0.3s",
          }}
        >
          {COURSES.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>

        <p
          className="mt-16 font-tech text-nebula-text-dim text-xs tracking-[0.4em] uppercase"
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 1s ease 0.8s",
          }}
        >
          [ Sélectionne un cursus pour commencer ]
        </p>
      </div>
    </div>
  );
}

function CourseCard({ course }: { course: (typeof COURSES)[number] }) {
  const isLocked = course.status === "locked";

  const colorMap: Record<
    string,
    { border: string; glow: string; text: string; bg: string }
  > = {
    cyan: {
      border: "border-nebula-cyan/30",
      glow: "hover:shadow-[0_0_30px_rgba(0,240,255,0.15)]",
      text: "text-nebula-cyan",
      bg: "bg-nebula-cyan-faint",
    },
    blue: {
      border: "border-nebula-blue/20",
      glow: "hover:shadow-[0_0_30px_rgba(61,126,255,0.15)]",
      text: "text-nebula-blue",
      bg: "bg-nebula-blue-dim/10",
    },
    orange: {
      border: "border-nebula-orange/20",
      glow: "hover:shadow-[0_0_30px_rgba(255,107,44,0.15)]",
      text: "text-nebula-orange",
      bg: "bg-nebula-orange-faint",
    },
  };

  const c = colorMap[course.color] ?? colorMap.cyan;

  const featuredVisuals: Partial<
    Record<(typeof COURSES)[number]["slug"], { src: string; size: number }>
  > = {
    html: { src: "/3306622555 (2).gif", size: 80 },
    css: { src: "/galaxi.gif", size: 88 },
    javascript: { src: "/black_hole.gif", size: 88 },
  };

  const featuredVisual = featuredVisuals[course.slug];

  if (featuredVisual) {
    const featuredCard = (
      <div className="group relative h-24 w-24">
        <div className="flex h-24 w-24 items-center justify-center">
          <Image
            src={featuredVisual.src}
            alt={`Visuel ${course.title}`}
            width={featuredVisual.size}
            height={featuredVisual.size}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <div
          className={`
            pointer-events-none absolute left-1/2 top-full z-20 mt-4 w-72 -translate-x-1/2
            rounded-lg border ${c.border} bg-nebula-bg-panel/95 p-6 opacity-0 shadow-[0_0_30px_rgba(0,240,255,0.12)]
            backdrop-blur-sm transition-all duration-300 group-hover:pointer-events-auto
            group-hover:translate-y-1 group-hover:opacity-100
          `}
        >
          <div className="absolute top-3 right-3">
            {isLocked ? (
              <span className="font-tech text-[10px] tracking-widest text-nebula-text-dim border border-nebula-text-dim/30 rounded px-2 py-0.5">
                VERROUILLE
              </span>
            ) : (
              <span
                className={`font-tech text-[10px] tracking-widest ${c.text} border ${c.border} rounded px-2 py-0.5`}
              >
                DISPONIBLE
              </span>
            )}
          </div>

          <h2 className={`font-tech text-2xl tracking-wider ${c.text} mb-1`}>
            {course.title}
          </h2>
          <p className="font-body text-nebula-text-secondary text-sm mb-3">
            {course.subtitle}
          </p>

          <div className={`h-px w-full ${c.bg} mb-3`} />

          <p className="font-body text-nebula-text-dim text-xs leading-relaxed mb-4">
            {course.description}
          </p>

          <div className="flex items-center justify-between">
            <span className="font-tech text-[11px] text-nebula-text-dim tracking-wider">
              {course.chapters > 0
                ? `${course.chapters} CHAPITRE${course.chapters > 1 ? "S" : ""}`
                : "BIENTOT"}
            </span>
            {!isLocked && (
              <span className={`font-tech text-xs ${c.text} tracking-wider`}>
                ENTRER {"->"}
              </span>
            )}
          </div>
        </div>
      </div>
    );

    if (isLocked) return featuredCard;

    return (
      <Link href={`/learn/${course.slug}`} onClick={() => unlockAudio()}>
        {featuredCard}
      </Link>
    );
  }

  const inner = (
    <div
      className={`
        relative w-72 rounded-lg border ${c.border} bg-nebula-bg-panel/80 backdrop-blur-sm
        p-6 transition-all duration-300
        ${
          isLocked
            ? "opacity-40 cursor-not-allowed"
            : `cursor-pointer ${c.glow} hover:border-opacity-60 hover:-translate-y-1`
        }
      `}
    >
      <div className="absolute top-3 right-3">
        {isLocked ? (
          <span className="font-tech text-[10px] tracking-widest text-nebula-text-dim border border-nebula-text-dim/30 rounded px-2 py-0.5">
            VERROUILLE
          </span>
        ) : (
          <span
            className={`font-tech text-[10px] tracking-widest ${c.text} border ${c.border} rounded px-2 py-0.5`}
          >
            DISPONIBLE
          </span>
        )}
      </div>

      <div className="mb-4 flex flex-col items-start">
        <div className="mb-3 text-4xl">{course.icon}</div>

        <h2 className={`font-tech text-2xl tracking-wider ${c.text} mb-1`}>
          {course.title}
        </h2>

        <div className="overflow-hidden transition-all duration-300 max-h-32 opacity-100">
          <p className="font-body text-nebula-text-secondary text-sm mb-3">
            {course.subtitle}
          </p>

          <div className={`h-px w-full ${c.bg} mb-3`} />

          <p className="font-body text-nebula-text-dim text-xs leading-relaxed mb-4">
            {course.description}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="font-tech text-[11px] text-nebula-text-dim tracking-wider">
          {course.chapters > 0
            ? `${course.chapters} CHAPITRE${course.chapters > 1 ? "S" : ""}`
            : "BIENTOT"}
        </span>
        {!isLocked && (
          <span className={`font-tech text-xs ${c.text} tracking-wider`}>
            ENTRER {"->"}
          </span>
        )}
      </div>
    </div>
  );

  if (isLocked) return inner;

  return (
    <Link href={`/learn/${course.slug}`} onClick={() => unlockAudio()}>
      {inner}
    </Link>
  );
}
