"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import BrandLogo from "@/components/ui/BrandLogo";
import OnboardingOverlay from "@/components/onboarding/OnboardingOverlay";
import DashboardNav from "../DashboardNav";
import StatsCard from "../StatsCard";
import ExploreSection from "../ExploreSection";
import { useUser } from "@/lib/use-user";
import DailyMission from "@/components/dashboard/DailyMission";
import {
  getActiveCourseSlug,
  getCourseProgress,
  getNextStep,
  hasAvatar,
} from "@/lib/user-store";
import { gradeFromXp, levelFromXp } from "@/lib/grades";
import { getChaptersMeta } from "@/lib/courses-meta";
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
  const level = levelFromXp(totalXp);
  const rank = gradeFromXp(totalXp).label;
  const streak = state.streak || 1;
  const badges = state.badges.length;

  const courseProgress = getCourseProgress(state, activeCourseSlug, chaptersMeta);
  const nextStep = getNextStep(state, activeCourseSlug, chaptersMeta);

  const nextChapterMeta = nextStep
    ? chaptersMeta.find((c) => c.slug === nextStep.chapterSlug)
    : null;

  const courseTitle = activeCourse?.title ?? activeCourseSlug.toUpperCase();

  return (
    <div className="relative h-full overflow-y-auto">
      <div className="fixed inset-0 z-0 pointer-events-none bg-nebula-bg" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-nebula-stars opacity-25" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-[rgba(3,6,13,0.5)]" />

      <OnboardingOverlay />

      <DashboardNav userName={username} />

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-6 lg:px-6 lg:py-10">
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
              <h2 className="mb-5 font-tech text-2xl uppercase tracking-widest text-nebula-cyan">
                {"> "}Reprendre la mission
              </h2>

              <article className="relative overflow-hidden rounded-sm border border-nebula-cyan/40 bg-nebula-bg-panel/85 p-5 backdrop-blur-md shadow-[0_0_40px_rgba(0,240,255,0.08)] lg:p-7">
                <div className="pointer-events-none absolute -right-12 -top-12 opacity-25">
                  <Image
                    src="/planet-green-v2.png"
                    alt=""
                    width={200}
                    height={200}
                    className="animate-planet-rotate"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>

                <div className="relative">
                  <div className="mb-5">
                    <div className="mb-1.5 flex items-center justify-between font-tech text-xs uppercase tracking-widest text-nebula-text-secondary">
                      <span>Progression du cursus</span>
                      <span className="text-nebula-cyan">{courseProgress}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full border border-nebula-border bg-nebula-bg-editor/80">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-nebula-cyan to-nebula-green shadow-[0_0_10px_rgba(0,240,255,0.4)] transition-all duration-700"
                        style={{ width: `${courseProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mb-2 font-tech text-xs uppercase tracking-[0.22em] text-nebula-text-dim">
                    CURSUS ACTIF
                  </div>
                  <h3 className="mb-3 font-tech text-4xl uppercase tracking-wider text-nebula-cyan [text-shadow:0_0_18px_rgba(0,240,255,0.3)]">
                    {courseTitle}
                  </h3>

                  {nextStep && nextChapterMeta ? (
                    <>
                      <p className="mb-7 font-body text-base leading-relaxed text-nebula-text-secondary">
                        Prochaine étape :{" "}
                        <span className="text-nebula-text">
                          {nextChapterMeta.label}
                        </span>{" "}
                        — {nextChapterMeta.title}
                        <br />
                        <span className="text-nebula-text-dim text-sm">
                          Étape {nextStep.stepIndex + 1} sur{" "}
                          {nextChapterMeta.totalSteps}
                        </span>
                      </p>

                      <Link
                        href={`/learn/${activeCourseSlug}/${nextStep.chapterSlug}`}
                        className="inline-block rounded-sm bg-nebula-cyan px-7 py-3 font-tech text-base font-bold uppercase tracking-[0.18em] text-nebula-bg-darkest shadow-[0_4px_0_var(--cyan-dim)] transition-all hover:translate-y-px hover:shadow-[0_3px_0_var(--cyan-dim)] active:translate-y-[3px] active:shadow-none"
                      >
                        {"> "}
                        {nextStep.isFirst && courseProgress === 0
                          ? "Démarrer la mission"
                          : "Continuer la mission"}
                        <span className="terminal-cursor">_</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <p className="mb-7 font-body text-base leading-relaxed text-nebula-green">
                        Tous les chapitres {courseTitle} sont validés. Bravo, Cadet.
                      </p>
                      <Link
                        href={`/learn/${activeCourseSlug}`}
                        className="inline-block rounded-sm border border-nebula-cyan-dim bg-transparent px-7 py-3 font-tech text-base font-bold uppercase tracking-[0.18em] text-nebula-cyan transition-all hover:border-nebula-cyan hover:bg-nebula-cyan-faint"
                      >
                        Voir la carte du cursus →
                      </Link>
                    </>
                  )}
                </div>
              </article>
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
            <DailyMission />
            <StatsCard
              username={username}
              level={level}
              totalXp={totalXp}
              rank={rank}
              badges={badges}
              streak={streak}
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
