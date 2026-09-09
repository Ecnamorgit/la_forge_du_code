"use client";

import Link from "next/link";
import { useUser } from "@/lib/use-user";
import { ROLES, ROLE_RECOMMENDED_COURSES, isRoleId } from "@/lib/avatar";

import BrandLogo from "@/components/ui/BrandLogo";
import CourseIcon from "@/components/ui/CourseIcon";
import CourseCardLink from "../CourseCardLink";
import CourseWireframe from "@/components/ui/CourseWireframe";
import {
  COURSES_CATALOG,
  getCourseChaptersCount,
  getCourseStatus,
  type CourseInfo,
  type CourseStatus,
} from "@/lib/courses-catalog";

interface CourseEntry extends CourseInfo {
  chapters: number;
  status: "available" | "locked";
  /** Editorial depth: a full learning path vs a piloted intro chapter. */
  depth: CourseStatus;
}

// Complete courses first, preview ("Aperçu") ones last, original order otherwise.
const DEPTH_ORDER: Record<CourseStatus, number> = { complete: 0, preview: 1 };

const COURSES: CourseEntry[] = COURSES_CATALOG.map((c) => ({
  ...c,
  chapters: getCourseChaptersCount(c.slug),
  status: "available" as const,
  depth: getCourseStatus(c.slug),
})).sort((a, b) => DEPTH_ORDER[a.depth] - DEPTH_ORDER[b.depth]);

export default function LearnPage() {
  const { state, hydrated } = useUser();
  const userRole = hydrated && state?.role && isRoleId(state.role) ? state.role : null;

  // Split courses if a role is defined (mapping shared with the onboarding —
  // see lib/avatar.ts).
  const roleCourses = userRole ? ROLE_RECOMMENDED_COURSES[userRole] : null;
  const recommendedCourses = roleCourses
    ? COURSES.filter((c) => roleCourses.includes(c.slug))
    : [];

  const otherCourses = roleCourses
    ? COURSES.filter((c) => !roleCourses.includes(c.slug))
    : COURSES;

  return (
    <div className="relative min-h-screen overflow-y-auto py-16">
      <div className="fixed inset-0 bg-nebula-bg z-0 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center px-4 max-w-6xl mx-auto">
        <Link
          href="/dashboard"
          className="absolute left-6 top-6 font-tech text-sm uppercase tracking-widest text-nebula-text-secondary transition-colors hover:text-nebula-cyan"
        >
          ← Retour au pont
        </Link>

        <div className="text-center mb-12 animate-fade-down">
          <div className="mb-6 flex justify-center">
            <BrandLogo
              size={112}
              priority
              className="drop-shadow-[0_0_26px_rgba(0,240,255,0.22)]"
            />
          </div>
          <h1
            className="font-tech text-5xl md:text-6xl tracking-[0.3em] text-nebula-cyan mb-2"
            style={{
              textShadow:
                "0 0 30px rgba(0, 240, 255, 0.4), 0 0 60px rgba(0, 240, 255, 0.15)",
            }}
          >
            CURSUS
          </h1>
          <div className="h-px w-48 mx-auto bg-gradient-to-r from-transparent via-nebula-cyan to-transparent mb-4" />
          <p className="font-body text-nebula-text-secondary text-lg tracking-widest uppercase">
            Choisis ta formation galactique
          </p>
        </div>

        {/* Recommended Section */}
        {recommendedCourses.length > 0 && (
          <div className="w-full mb-10 animate-fade-up">
            <div className="flex items-center gap-3 mb-6">
              <span className="font-tech text-xs tracking-widest text-nebula-cyan uppercase border border-nebula-cyan/30 px-3.5 py-1.5 rounded bg-nebula-cyan-faint">
                Recommandé pour ton profil : {ROLES.find((r) => r.id === userRole)?.label ?? userRole}
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-nebula-cyan/30 to-transparent" />
            </div>
            <div className="flex flex-wrap items-start gap-8 justify-center">
              {recommendedCourses.map((course) => (
                <CourseCard key={course.slug} course={course} />
              ))}
            </div>
          </div>
        )}

        {/* Other / Unified Section */}
        <div className="w-full animate-fade-up">
          {recommendedCourses.length > 0 && (
            <div className="flex items-center gap-3 mb-6 mt-4">
              <span className="font-tech text-xs tracking-widest text-nebula-text-dim uppercase border border-nebula-border/30 px-3.5 py-1.5 rounded bg-nebula-bg-panel/40">
                Autres Cursus
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-nebula-border/30 to-transparent" />
            </div>
          )}
          <div className="flex flex-wrap items-start gap-8 justify-center">
            {otherCourses.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        </div>

        <p className="mt-16 font-tech text-nebula-text-dim text-xs tracking-[0.4em] uppercase animate-fade-in-late">
          [ Sélectionne un cursus pour commencer ]
        </p>
      </div>
    </div>
  );
}

function CourseCard({ course }: { course: CourseEntry }) {
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

  // Fallback si pas de visual (pour la structure standard des cartes)
  const inner = (
    <div
      className={`
        relative w-72 rounded-lg border ${c.border} bg-nebula-bg-panel/80 backdrop-blur-sm
        p-6 transition-all duration-300 overflow-hidden
        ${
          isLocked
            ? "opacity-40 cursor-not-allowed"
            : `cursor-pointer ${c.glow} hover:border-opacity-60 hover:-translate-y-1`
        }
      `}
    >
      {/* Background wireframe logo */}
      <div className={`absolute inset-0 z-0 overflow-hidden rounded-lg pointer-events-none opacity-[0.18] flex items-center justify-center ${c.text}`}>
        <CourseWireframe slug={course.slug} />
      </div>

      <div className="absolute top-3 right-3 z-10">
        {isLocked ? (
          <span className="font-tech text-[10px] tracking-widest text-nebula-text-dim border border-nebula-text-dim/30 rounded px-2 py-0.5">
            VERROUILLE
          </span>
        ) : course.depth === "preview" ? (
          <span className="font-tech text-[10px] tracking-widest text-nebula-text-dim border border-nebula-text-dim/40 rounded px-2 py-0.5 bg-nebula-bg-panel/60">
            APERÇU
          </span>
        ) : (
          <span
            className={`font-tech text-[10px] tracking-widest ${c.text} border ${c.border} rounded px-2 py-0.5`}
          >
            DISPONIBLE
          </span>
        )}
      </div>

      <div className="relative z-10 mb-4 flex flex-col items-start">
        <div className="mb-3">
          <CourseIcon slug={course.slug} emoji={course.icon} size={40} className="text-4xl" />
        </div>

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

      <div className="relative z-10 flex items-center justify-between">
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
    <CourseCardLink href={`/learn/${course.slug}`}>{inner}</CourseCardLink>
  );
}
