"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import BrandLogo from "@/components/ui/BrandLogo";
import OnboardingOverlay from "@/components/onboarding/OnboardingOverlay";
import DashboardNav from "../DashboardNav";
import ExploreSection from "../ExploreSection";
import LiaisonBanner from "@/components/dashboard/LiaisonBanner";
import BriefingCard from "@/components/dashboard/BriefingCard";
import CadetCard from "@/components/dashboard/CadetCard";
import { useUser } from "@/lib/use-user";
import {
  getActiveCourseSlug,
  getCourseProgress,
  getNextStep,
  hasAvatar,
} from "@/lib/user-store";
import { getChaptersMeta, getCompletionStats } from "@/lib/courses-meta";
import { COURSES_CATALOG, getCourseInfo } from "@/lib/courses-catalog";
import { CHAPTER_SUMMARIES } from "@/lib/chapter-summaries";

import IntroCinematic from "@/components/intro/IntroCinematic";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { state, hydrated } = useUser();

  // Pick the user's current course from their progress.
  const activeCourseSlug = useMemo(() => {
    const candidateSlugs = COURSES_CATALOG.map((c) => c.slug);
    const totalStepsByCourse = Object.fromEntries(
      candidateSlugs.map((slug) => [
        slug,
        (CHAPTER_SUMMARIES[slug] ?? []).reduce((s, c) => s + c.totalSteps, 0),
      ])
    );
    return getActiveCourseSlug(state, candidateSlugs, totalStepsByCourse);
  }, [state]);

  const activeCourse = getCourseInfo(activeCourseSlug);
  const chaptersMeta = useMemo(
    () => getChaptersMeta(activeCourseSlug),
    [activeCourseSlug]
  );

  const completionStats = useMemo(
    () => getCompletionStats(state, COURSES_CATALOG.map((c) => c.slug)),
    [state]
  );

  // First-time gate: display intro cinematic until completed/closed, then transition to /avatar

  if (!hydrated || !hasAvatar(state)) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-nebula-bg text-nebula-cyan font-tech text-xs tracking-widest uppercase">
        {hydrated && !hasAvatar(state) ? (
          <IntroCinematic
            open={true}
            onClose={() => router.replace("/avatar?from=/dashboard")}
          />
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-nebula-cyan border-t-transparent" />
            <span>Liaison orbitale...</span>
          </div>
        )}
      </div>
    );
  }

  const username = session?.user?.username || state.username || "Cadet";
  const totalXp = state.totalXp;
  // Source unique du compteur de liaison côté client : `state.liaison`.
  const streak = state.liaison.streak || 1;

  const courseProgress = getCourseProgress(state, activeCourseSlug, chaptersMeta);
  const nextStep = getNextStep(state, activeCourseSlug, chaptersMeta);

  const courseTitle = activeCourse?.title ?? activeCourseSlug.toUpperCase();

  // La grande carte fusionne la reprise de cursus et l'ordre d'effort du
  // jour : un seul bouton, qui mène à la prochaine étape du cursus actif
  // (ou à sa carte si le cursus est déjà bouclé).
  const resumeHref = nextStep
    ? `/learn/${activeCourseSlug}/${nextStep.chapterSlug}`
    : `/learn/${activeCourseSlug}`;
  const resumeLabel = nextStep
    ? nextStep.isFirst && courseProgress === 0
      ? "Démarrer la mission"
      : "Continuer la mission"
    : "Voir la carte du cursus";

  // Construit le lien d'un ordre à partir du cursus qu'il vise. Un ordre
  // global (sans cursus ciblé) retombe sur la même étape que le bouton
  // principal.
  const hrefForQuest = (course: string | null, chapter: string | null): string => {
    if (course && chapter) return `/learn/${course}/${chapter}`;
    if (course) return `/learn/${course}`;
    return nextStep ? `/learn/${activeCourseSlug}/${nextStep.chapterSlug}` : "/learn";
  };

  return (
    <div className="relative h-full overflow-y-auto">
      <div className="fixed inset-0 z-0 pointer-events-none bg-nebula-bg" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-nebula-stars opacity-25" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-[rgba(3,6,13,0.5)]" />

      <OnboardingOverlay />

      <DashboardNav userName={username} />

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-6 lg:px-6 lg:py-10">
        <LiaisonBanner liaison={state.liaison} />

        {/* Welcome */}
        <section className="mb-8 flex flex-col items-start gap-4 animate-fade-down sm:flex-row sm:items-start sm:gap-6 lg:mb-10">
          <BrandLogo
            size={80}
            priority
            className="mt-1 shrink-0 drop-shadow-[0_0_24px_rgba(0,240,255,0.25)]"
          />
          <SpeechBubble>
            <span className="font-tech text-sm leading-relaxed text-nebula-text/95 lg:text-base">
              {"> Bienvenue à bord, "}
              <span className="text-nebula-cyan">@{username}</span>
              {courseProgress === 0
                ? " ! Démarre ta première mission"
                : courseProgress === 100
                  ? " ! Tu as tout terminé. Bientôt d'autres cursus"
                  : " ! Reprends ta mission"}
              <span className="terminal-cursor">_</span>
            </span>
          </SpeechBubble>
        </section>

        {/* 2-col */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* LEFT */}
          <div>
            <section className="animate-fade-up">
              <BriefingCard
                briefing={state.briefing}
                courseTitle={courseTitle}
                courseProgress={courseProgress}
                resumeHref={resumeHref}
                resumeLabel={resumeLabel}
                hrefForQuest={hrefForQuest}
              />
            </section>

            <ExploreSection activeCourseSlug={activeCourseSlug} />

            <div className="mt-8 text-center">
              <Link
                href="/learn"
                className="font-tech text-sm uppercase tracking-widest text-nebula-text-secondary transition-colors hover:text-nebula-cyan"
              >
                Voir tous les cursus →
              </Link>
            </div>
          </div>

          {/* RIGHT */}
          <div className="animate-fade-up">
            <CadetCard
              username={username}
              totalXp={totalXp}
              badges={state.badges}
              streak={streak}
              questsCompleted={state.questsCompleted}
              coursesComplete={completionStats.coursesComplete}
              chaptersComplete={completionStats.chaptersComplete}
              unlocks={state.unlocks}
              species={state.species}
              uniformColor={state.uniformColor}
              frame={state.frame}
              title={state.title}
              emblem={state.emblem}
              cardBg={state.cardBg}
            />
          </div>
        </div>
      </main>

    </div>
  );
}

function SpeechBubble({ children }: { children: ReactNode }) {
  return (
    <div className="relative w-full rounded-md border border-nebula-cyan/40 bg-nebula-bg-panel/85 px-5 py-4 backdrop-blur-md shadow-[0_0_24px_rgba(0,240,255,0.1)] sm:flex-1 sm:px-6 sm:py-5">
      <div className="absolute left-0 top-7 hidden -translate-x-full sm:block">
        <div className="h-0 w-0 border-y-[10px] border-r-[10px] border-y-transparent border-r-nebula-cyan/40" />
      </div>
      {children}
    </div>
  );
}
