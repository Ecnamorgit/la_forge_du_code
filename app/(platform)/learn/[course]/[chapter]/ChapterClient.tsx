"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ChapterData } from "@/data/courses/html/types";
import { getValidators } from "@/lib/validators";
import XPBar from "@/components/ui/XPBar";
import ChapterWorkspace from "@/components/lesson/ChapterWorkspace";
import QuestBanner from "@/components/ui/QuestBanner";
import XPPopup from "@/components/ui/XPPopup";
import CompletionScreen from "@/components/ui/CompletionScreen";
import HintBox from "@/components/ui/HintBox";
import SuccessFlash from "@/components/ui/SuccessFlash";
import BrandLogo from "@/components/ui/BrandLogo";
import ParticleLayer, { spawnParticles, spawnLevelUpBurst } from "@/components/ui/ParticleLayer";
import VFXBurst from "@/components/ui/VFXBurst";
import LevelUpOverlay from "@/components/ui/LevelUpOverlay";
import { unlockAudio, playFanfare } from "@/lib/audio";
import { useUserContext } from "@/lib/user-context";
import { getCompletedSteps, isChapterComplete } from "@/lib/user-store";
import { levelFromXp } from "@/lib/grades";
import TrialBanner from "@/components/lesson/TrialBanner";
import TrialConversion from "@/components/lesson/TrialConversion";
import { xpForStep } from "@/lib/xp";
import { getChapterBackground, SPRITE_SHEETS_READY } from "@/lib/sprite-config";
import { CHARACTERS } from "@/lib/characters";
import { getSqlStepConfig } from "@/lib/sandbox/sql-seeds";
import { getBadgeForChapter } from "@/lib/courses-meta";
import { combatThemeForCourse } from "@/lib/combat-theme";
import { badgeFrameById } from "@/lib/badges-catalog";
import { renderLessonMarkdown } from "@/lib/markdown";
import { getDocEntry } from "@/data/docs";
import { UNLOCKS } from "@/lib/unlocks";
import { getConductBadge } from "@/lib/conduct-badges";
import DocPanel from "@/components/docs/DocPanel";
import CinematicPlayer from "@/components/cinematics/CinematicPlayer";
import { getCinematic } from "@/lib/cinematics/resolver";
import { cinematicId, type CinematicMoment } from "@/lib/cinematics/types";
import { useCinematicSeen } from "@/lib/cinematics/use-cinematic-seen";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { TRIAL_COURSE, TRIAL_CHAPTERS, TRIAL_LAST_CHAPTER } from "@/lib/public-routes";

interface ChapterClientProps {
  course: string;
  chapter: ChapterData;
  /** Last chapter of the course: it ends with the finale. */
  isLastChapter: boolean;
}

export default function ChapterClient({ course, chapter, isLastChapter }: ChapterClientProps) {
  const { state, completeStep, markCourseVisited, isTrial } = useUserContext();
  const router = useRouter();
  const validators = getValidators(course, chapter.slug);
  const chapterDone = isChapterComplete(state, course, chapter.slug, chapter.steps.length);
  // Chapter playable in trial mode: cinematics in localStorage, conversion at
  // the end of the last trial chapter.
  const isTrialChapter =
    isTrial && course === TRIAL_COURSE && TRIAL_CHAPTERS.includes(chapter.slug);
  const isLastTrialChapter = isTrialChapter && chapter.slug === TRIAL_LAST_CHAPTER;
  const nextTrialChapter = isTrialChapter
    ? TRIAL_CHAPTERS[TRIAL_CHAPTERS.indexOf(chapter.slug) + 1] ?? null
    : null;
  const showConversion = isTrial && chapterDone && isLastTrialChapter;

  // This course becomes the current course, picked up by the dashboard.
  useEffect(() => {
    void markCourseVisited(course);
  }, [course, markCourseVisited]);

  const completedStepIndexes = useMemo(
    () => getCompletedSteps(state, course, chapter.slug),
    [state, course, chapter.slug]
  );

  const [manualStepByChapter, setManualStepByChapter] = useState<
    Record<string, number>
  >({});
  const autoStep = useMemo(() => {
    if (completedStepIndexes.length > 0) {
      const firstNonDone = chapter.steps.findIndex(
        (_, i) => !completedStepIndexes.includes(i)
      );
      if (firstNonDone >= 0) return firstNonDone;
      return Math.max(chapter.steps.length - 1, 0);
    }
    return 0;
  }, [chapter.steps, completedStepIndexes]);
  const currentStep = manualStepByChapter[chapter.slug] ?? autoStep;
  const step = chapter.steps[currentStep];
  const validate =
    validators[currentStep] ??
    (() => ({ ok: false, msg: "Validateur manquant pour cette étape" }));
  const stepDone = useMemo(
    () => chapter.steps.map((_, i) => completedStepIndexes.includes(i)),
    [completedStepIndexes, chapter.steps]
  );
  // Computed with the formula that awards XP (lib/xp.ts), not with the
  // `totalXp` from the data files, which is unreliable.
  const chapterMaxXp = useMemo(
    () =>
      chapter.steps.reduce((sum, s) => sum + xpForStep(s.objectives.length), 0),
    [chapter.steps]
  );
  const xp = useMemo(
    () =>
      completedStepIndexes.reduce(
        (sum, idx) => sum + xpForStep(chapter.steps[idx].objectives.length),
        0
      ),
    [completedStepIndexes, chapter.steps]
  );
  const doneObjectives = useMemo(() => {
    const set = new Set<string>();
    if (stepDone[currentStep]) {
      chapter.steps[currentStep].objectives.forEach((obj) => set.add(obj.id));
    }
    return set;
  }, [stepDone, currentStep, chapter.steps]);

  const [showBanner, setShowBanner] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  // End-of-chapter cinematic (or course finale), played only once between the
  // last step banner and the rest of the chapter.
  const [showOutroCinematic, setShowOutroCinematic] = useState(false);
  // Without a session, the cinematics API responds 401: trial chapters
  // record to localStorage, the others record nothing.
  const { loaded: cineLoaded, seen: cineSeen, mark: markCine } = useCinematicSeen(
    course,
    isTrial ? (isTrialChapter ? "local" : "off") : "server"
  );
  const reducedMotion = usePrefersReducedMotion();
  const outroMoment: CinematicMoment = useMemo(
    () =>
      isLastChapter
        ? { kind: "finale" }
        : { kind: "chapter", chapter: chapter.slug },
    [isLastChapter, chapter.slug]
  );
  const outroId = useMemo(
    () => cinematicId(course, outroMoment),
    [course, outroMoment]
  );
  const [showHint, setShowHint] = useState(false);
  const [xpPopup, setXpPopup] = useState({ show: false, label: "" });
  // Daily loop rewards (order, conduct badge, liaison), in a second
  // XPPopup: the overlays are reserved for level-ups and
  // unlockables.
  const [rewardPopup, setRewardPopup] = useState({ show: false, label: "" });
  const [flashTrigger, setFlashTrigger] = useState(0);
  const [teleportFlash, setTeleportFlash] = useState(0);
  const [bannerVfxTrigger, setBannerVfxTrigger] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [levelUp, setLevelUp] = useState<{
    trigger: number;
    level: number;
    unlockLabel?: string;
  }>({ trigger: 0, level: 1 });
  const [openDocId, setOpenDocId] = useState<string | null>(null);
  // Rewards from the last validated step, shown by `CompletionScreen`.
  const [dailyLoopAnnounce, setDailyLoopAnnounce] = useState<{
    completedQuests: string[];
    notice: string | null;
    conductBadges: string[];
  }>({ completedQuests: [], notice: null, conductBadges: [] });
  const previousLevelRef = useRef<number>(levelFromXp(state.totalXp));
  // Lets the trial conversion card scroll into view at the end of the
  // chapter.
  const conversionRef = useRef<HTMLDivElement>(null);

  const hintTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const xpPopupTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const rewardPopupTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const handler = () => unlockAudio();
    document.body.addEventListener("click", handler, { once: true });
    return () => document.body.removeEventListener("click", handler);
  }, []);

  const setCurrentStep = useCallback(
    (next: number) => {
      const bounded = Math.min(Math.max(next, 0), chapter.steps.length - 1);
      setManualStepByChapter((prev) => ({ ...prev, [chapter.slug]: bounded }));
    },
    [chapter.slug, chapter.steps.length]
  );

  const handleStepSuccess = useCallback((code: string) => {
    const alreadyDone = stepDone[currentStep];
    setSaveError(null);

    // Pins the step: otherwise, auto-advance would show the next step
    // before the banner is clicked.
    setManualStepByChapter((prev) => ({ ...prev, [chapter.slug]: currentStep }));

    setFlashTrigger((p) => p + 1);
    spawnParticles();

    if (!alreadyDone) {
      const optimisticXp = xpForStep(chapter.steps[currentStep].objectives.length);
      setXpPopup({ show: true, label: `+${optimisticXp} XP` });
      clearTimeout(xpPopupTimerRef.current);
      xpPopupTimerRef.current = setTimeout(
        () => setXpPopup((p) => ({ ...p, show: false })),
        2400
      );

      void completeStep(course, chapter.slug, currentStep, code)
        .then((result) => {
          setDailyLoopAnnounce({
            completedQuests: result.completedQuests,
            notice: result.notice,
            conductBadges: result.newConductBadges,
          });

          // No announcement on the last step: CompletionScreen shows it.
          const isFinalStepOfChapter = currentStep === chapter.steps.length - 1;
          if (!isFinalStepOfChapter) {
            const rewardLines = [
              ...result.completedQuests.map((label) => `✓ ${label}`),
              ...result.newConductBadges
                .map((id) => getConductBadge(id))
                .filter((badge): badge is NonNullable<typeof badge> => Boolean(badge))
                .map((badge) => `${badge.icon} ${badge.label}`),
              ...(result.notice ? [result.notice] : []),
            ];
            if (rewardLines.length > 0) {
              setRewardPopup({ show: true, label: rewardLines.join(" · ") });
              clearTimeout(rewardPopupTimerRef.current);
              rewardPopupTimerRef.current = setTimeout(
                () => setRewardPopup((p) => ({ ...p, show: false })),
                3600
              );
            }
          }

          const newLevel = levelFromXp(result.state.totalXp);
          const leveledUp = newLevel > previousLevelRef.current;
          previousLevelRef.current = newLevel;

          // Only one ceremony per step: the level-up, rarer, takes precedence
          // over the unlockable, which stays visible in the armory.
          if (leveledUp) {
            spawnLevelUpBurst();
            setLevelUp((p) => ({ trigger: p.trigger + 1, level: newLevel, unlockLabel: undefined }));
          } else if (result.newUnlocks.length > 0) {
            const label = UNLOCKS.find((u) => u.id === result.newUnlocks[0])?.label;
            if (label) {
              spawnLevelUpBurst();
              setLevelUp((p) => ({ trigger: p.trigger + 1, level: newLevel, unlockLabel: label }));
            }
          }
        })
        .catch((err) => {
          const message =
            err instanceof Error
              ? err.message
              : "Sauvegarde impossible. Reessaie dans quelques secondes.";
          setSaveError(message);
          console.error("Step completion failed:", err);
        });
    }

    setTimeout(() => {
      setShowBanner(true);
      setBannerVfxTrigger((p) => p + 1);
    }, 500);
  }, [course, chapter, currentStep, stepDone, completeStep]);

  // Rest of the chapter, after the cinematic if any: completion screen if
  // signed in, otherwise the next trial chapter or the conversion card.
  const finishChapter = useCallback(() => {
    if (!isTrial) {
      setShowCompletion(true);
      return;
    }
    if (isLastTrialChapter) {
      // End of the trial: the conversion card is already shown.
      conversionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (nextTrialChapter) {
      router.push(`/learn/${TRIAL_COURSE}/${nextTrialChapter}`);
    }
  }, [isTrial, isLastTrialChapter, nextTrialChapter, router]);

  const goNextStep = useCallback(() => {
    setShowBanner(false);
    if (currentStep === chapter.steps.length - 1) {
      playFanfare();
      if (isTrial && !isTrialChapter) {
        // Outside the trial scope (defense in depth): no cinematic.
        conversionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      // Cinematic first, if it has never been seen.
      if (cineLoaded && !cineSeen.has(outroId)) {
        setShowOutroCinematic(true);
        return;
      }
      finishChapter();
      return;
    }
    setCurrentStep(currentStep + 1);
  }, [
    currentStep,
    chapter.steps.length,
    setCurrentStep,
    isTrial,
    isTrialChapter,
    cineLoaded,
    cineSeen,
    outroId,
    finishChapter,
  ]);

  // Stable reference: `CinematicPlayer` re-arms its scene timer when
  // `onClose` changes, which would break the sequence on every render.
  const closeOutroCinematic = useCallback(() => {
    markCine(outroId);
    setShowOutroCinematic(false);
    finishChapter();
  }, [markCine, outroId, finishChapter]);

  const toggleHint = useCallback(() => {
    setShowHint(true);
    clearTimeout(hintTimerRef.current);
    hintTimerRef.current = setTimeout(() => setShowHint(false), 6000);
  }, []);

  const isStepDone = stepDone[currentStep];
  const isLastStep = currentStep === chapter.steps.length - 1;
  const [mobileTab, setMobileTab] = useState<"lesson" | "editor" | "output">("lesson");

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      {isTrial && <TrialBanner />}
      {/* Background */}
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: `url('${getChapterBackground(course)}')` }}
      />
      <div className="fixed inset-0 pointer-events-none z-0 bg-[rgba(3,6,13,0.62)]" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-nebula-stars opacity-25" />

      {/* Effects */}
      <SuccessFlash trigger={flashTrigger} />
      <div
        key={teleportFlash}
        className={`fixed inset-0 pointer-events-none z-[199] ${teleportFlash > 0 ? "animate-teleport-flash" : "opacity-0"}`}
      />
      <ParticleLayer />
      <XPPopup show={xpPopup.show} label={xpPopup.label} />
      <XPPopup show={rewardPopup.show} label={rewardPopup.label} secondary />
      <VFXBurst trigger={bannerVfxTrigger} />
      <LevelUpOverlay
        trigger={levelUp.trigger}
        level={levelUp.level}
        unlockLabel={levelUp.unlockLabel}
      />
      <QuestBanner
        show={showBanner}
        title={step.bannerTtl}
        subtitle={step.bannerSub}
        xpLabel={`⚡ +${xpForStep(step.objectives.length)} XP`}
        buttonLabel={isLastStep ? "TERMINER LE PROTOCOLE ->" : "SYSTÈME SUIVANT ->"}
        bannerFrame={step.bannerFrame}
        progressNow={currentStep + 1}
        progressTotal={chapter.steps.length}
        onNext={goNextStep}
        onDimClick={() => setShowBanner(false)}
      />
      {(!isTrial || isTrialChapter) && (
        <CinematicPlayer
          cinematic={getCinematic(course, outroMoment)}
          open={showOutroCinematic}
          onClose={closeOutroCinematic}
          reducedMotion={reducedMotion}
          finalCtaLabel={
            isTrialChapter && !isLastTrialChapter ? "Chapitre suivant ->" : "Rapport de mission ->"
          }
        />
      )}
      <CompletionScreen
        // Without an account, the trial ends with the conversion card.
        show={showCompletion && !isTrial}
        totalXp={xp}
        badgeIcon={chapter.completionBadge}
        badgeLabel={chapter.completionBadgeLabel}
        badgeFrame={
          SPRITE_SHEETS_READY.badges
            ? badgeFrameById(getBadgeForChapter(course, chapter.slug) ?? "") ?? undefined
            : undefined
        }
        badgeId={getBadgeForChapter(course, chapter.slug) ?? undefined}
        completedQuests={dailyLoopAnnounce.completedQuests}
        notice={dailyLoopAnnounce.notice}
        newConductBadges={dailyLoopAnnounce.conductBadges}
        href={`/learn/${course}`}
      />
      <HintBox show={showHint} text={step.hint} />
      <DocPanel
        entryId={openDocId}
        onClose={() => setOpenDocId(null)}
        onOpen={(id) => setOpenDocId(id)}
      />

      {/* Top bar */}
      <header className="relative z-50 flex h-14 shrink-0 items-center justify-between border-b border-nebula-border/70 bg-nebula-bg-darkest/70 px-4 backdrop-blur-md lg:px-6">
        <div className="flex items-center gap-2 lg:gap-4">
          <Link
            // Without an account, only the trial course map is accessible.
            href={isTrial ? `/learn/${TRIAL_COURSE}` : `/learn/${course}`}
            className="font-tech text-sm uppercase tracking-widest text-nebula-text-secondary transition-colors hover:text-nebula-cyan"
          >
            ← Retour
          </Link>
          <div className="hidden h-5 w-px bg-nebula-border lg:block" />
          <BrandLogo size={32} className="hidden lg:block" />
          <div className="hidden font-tech text-sm tracking-widest lg:block">
            <span className="text-nebula-cyan">LA FORGE</span>
            <span className="ml-1.5 text-nebula-text-secondary">/ {course.toUpperCase()} / {chapter.slug.toUpperCase()}</span>
          </div>
        </div>
        <XPBar xp={xp} maxXp={chapterMaxXp} accountLevel={levelFromXp(state.totalXp)} />
      </header>

      {/* Mobile tabs, below lg */}
      <nav className="relative z-40 flex h-11 shrink-0 border-b border-nebula-border/70 bg-nebula-bg-darkest/60 backdrop-blur-md lg:hidden">
        {(["lesson", "editor", "output"] as const).map((tab) => {
          const label =
            tab === "lesson" ? "Leçon" : tab === "editor" ? "Code" : "Sortie";
          const active = mobileTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setMobileTab(tab)}
              className={`flex-1 font-tech text-xs uppercase tracking-widest transition-colors ${
                active
                  ? "border-b-2 border-nebula-cyan bg-nebula-cyan-faint/40 text-nebula-cyan"
                  : "text-nebula-text-secondary hover:text-nebula-cyan"
              }`}
            >
              {label}
            </button>
          );
        })}
      </nav>

      {/*
        Scrollable area shared by the grid and the conversion card: if the
        card grows, this area scrolls, and the footer keeps its
        height.
      */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="relative z-[1] grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          {/* Lesson */}
          <main
            key={currentStep}
            className={`animate-fade-in min-h-0 overflow-y-auto border-r border-nebula-border/60 bg-nebula-bg-darkest/55 px-5 py-6 backdrop-blur-md lg:px-10 lg:py-9 ${
              mobileTab === "lesson" ? "block" : "hidden lg:block"
            }`}
          >
            <div className="mb-4 flex items-center gap-2 font-tech text-xs uppercase tracking-[0.22em] text-nebula-blue">
              <span>◈ {chapter.tag}</span>
              <span className="text-nebula-text-dim">/</span>
              <span>Étape {currentStep + 1} sur {chapter.steps.length}</span>
            </div>

            <h1 className="mb-3 font-tech text-4xl leading-tight tracking-[0.1em] text-nebula-cyan [text-shadow:0_0_18px_rgba(0,240,255,0.25)]">
              {"> "}{step.missionTtl}<span className="terminal-cursor">_</span>
            </h1>

            <h2 className="mb-7 font-tech text-xl tracking-wide text-nebula-text/90">
              {step.briefing.title}
            </h2>

            {step.spectreTrap ? (
              <div className="mb-8 border-l-2 border-nebula-spectre/60 bg-nebula-spectre/10 px-5 py-4">
                <div className="mb-1.5 font-tech text-[10px] uppercase tracking-widest text-nebula-spectre">
                  {CHARACTERS.spectre.glyph} {CHARACTERS.spectre.title} {CHARACTERS.spectre.name}
                </div>
                <p className="font-body text-base italic leading-relaxed text-nebula-text-secondary">
                  {step.spectreTrap}
                </p>
              </div>
            ) : (
              <div className="mb-8 border-l-2 border-nebula-cyan/40 bg-nebula-cyan-faint/40 px-5 py-4">
                <div className="mb-1.5 font-tech text-[10px] uppercase tracking-widest text-nebula-cyan">
                  {CHARACTERS.kira.glyph} {CHARACTERS.kira.title} {CHARACTERS.kira.name}
                </div>
                <p className="font-body text-base italic leading-relaxed text-nebula-text-secondary">
                  {step.narrator}
                </p>
              </div>
            )}

            <div
              className="prose-nebula font-body text-base leading-relaxed text-nebula-text/90"
              onClick={(e) => {
                const el = (e.target as HTMLElement).closest("[data-doc-id]");
                const id = el?.getAttribute("data-doc-id");
                if (id) setOpenDocId(id);
              }}
              dangerouslySetInnerHTML={{
                __html: renderLessonMarkdown(step.briefing.content, {
                  resolveDocTerm: (id) => getDocEntry(id)?.term,
                }),
              }}
            />

            {step.docRefs && step.docRefs.length > 0 && (
              <div className="mt-8 rounded-sm border border-nebula-cyan/30 bg-nebula-cyan-faint/20 p-5">
                <div className="mb-3 font-tech text-sm uppercase tracking-widest text-nebula-cyan">
                  📖 Références de cette étape
                </div>
                <ul className="space-y-2">
                  {step.docRefs.map((id) => {
                    const ref = getDocEntry(id);
                    if (!ref) return null;
                    return (
                      <li key={id}>
                        <button
                          type="button"
                          data-doc-ref={id}
                          onClick={() => setOpenDocId(id)}
                          className="w-full rounded-sm border border-nebula-border/60 bg-[rgba(5,10,20,0.32)] px-4 py-2.5 text-left transition-colors hover:border-nebula-cyan"
                        >
                          <span className="font-code text-sm text-nebula-cyan">
                            {ref.term}
                          </span>
                          <span className="ml-2 font-body text-xs text-nebula-text-secondary">
                            {ref.summary}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Objectives */}
            <div className="mt-10 rounded-sm border border-nebula-border/70 bg-[rgba(5,10,20,0.32)] p-5">
              <div className="mb-4 font-tech text-sm uppercase tracking-widest text-nebula-text-secondary">
                {"> "}Objectifs
              </div>
              <ul className="space-y-3">
                {step.objectives.map((obj) => {
                  const done = doneObjectives.has(obj.id);
                  return (
                    <li
                      key={obj.id}
                      className={`flex items-start gap-3 font-body text-base transition-colors ${
                        done ? "text-nebula-green" : "text-nebula-text-secondary"
                      }`}
                    >
                      <span
                        className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border text-xs ${
                          done
                            ? "border-nebula-green bg-nebula-green/15 text-nebula-green"
                            : "border-nebula-border-glow"
                        }`}
                      >
                        {done ? "✓" : ""}
                      </span>
                      <span>{obj.label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Hint */}
            <div className="mt-6">
              <button
                onClick={toggleHint}
                className="rounded-sm border border-nebula-orange-dim bg-transparent px-5 py-2.5 font-tech text-sm uppercase tracking-wider text-nebula-orange transition-all hover:border-nebula-orange hover:bg-nebula-orange-faint"
              >
                💡 Indice
              </button>
            </div>
            {saveError && (
              <div className="mt-4 rounded-sm border border-nebula-red/70 bg-nebula-red/15 px-4 py-3 font-tech text-[11px] uppercase tracking-wider text-nebula-red">
                Sauvegarde echouee : {saveError}
              </div>
            )}
          </main>

          {/* Workspace */}
          <div
            className={`min-h-0 ${
              mobileTab === "lesson" ? "hidden lg:flex" : "flex"
            } flex-col`}
          >
            <ChapterWorkspace
              key={`${chapter.slug}-${currentStep}`}
              step={step}
              validate={validate}
              language={
                course === "javascript"
                  ? "javascript"
                  : course === "sql"
                    ? "sql"
                    : course === "react"
                      ? "react"
                      : "html"
              }
              sqlConfig={
                course === "sql" ? getSqlStepConfig(chapter.slug, currentStep) : undefined
              }
              mobilePanel={mobileTab === "output" ? "output" : "editor"}
              onStepSuccess={handleStepSuccess}
              onDeploy={() => setMobileTab("output")}
              onTeleportFlash={() => setTeleportFlash((prev) => prev + 1)}
              combatTheme={combatThemeForCourse(course)}
            />
          </div>
        </div>

        {showConversion && (
          <div ref={conversionRef}>
            <TrialConversion xp={state.totalXp} />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-50 flex h-14 shrink-0 items-center justify-between gap-2 border-t border-nebula-border/70 bg-nebula-bg-darkest/70 px-3 backdrop-blur-md lg:h-16 lg:px-6">
        <div className="flex min-w-0 items-center gap-2 lg:gap-3">
          <span className="font-tech text-xs uppercase tracking-widest text-nebula-text-secondary lg:text-sm">
            <span className="hidden sm:inline">Étape </span>
            {currentStep + 1} / {chapter.steps.length}
          </span>
          <div className="ml-1 hidden items-center gap-2 sm:flex">
            {chapter.steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-6 rounded-full transition-all duration-300 lg:w-8 ${
                  i === currentStep
                    ? "bg-nebula-cyan shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                    : stepDone[i]
                      ? "bg-nebula-green"
                      : "bg-nebula-border"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 lg:gap-3">
          <button
            onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
            disabled={currentStep === 0}
            className="rounded-sm border border-nebula-border bg-transparent px-3 py-2 font-tech text-xs uppercase tracking-widest text-nebula-text-secondary transition-all hover:border-nebula-cyan hover:text-nebula-cyan disabled:opacity-30 disabled:hover:border-nebula-border disabled:hover:text-nebula-text-secondary lg:px-5 lg:py-2.5 lg:text-sm"
          >
            <span aria-hidden>←</span>
            <span className="ml-1 hidden sm:inline">Précédent</span>
          </button>
          <button
            onClick={goNextStep}
            disabled={!isStepDone}
            className={`rounded-sm px-4 py-2 font-tech text-sm font-bold uppercase tracking-[0.18em] transition-all lg:px-7 lg:py-3 lg:text-base ${
              isStepDone
                ? "bg-nebula-cyan text-nebula-bg-darkest shadow-[0_4px_0_var(--cyan-dim)] hover:translate-y-px hover:shadow-[0_3px_0_var(--cyan-dim)] active:translate-y-[3px] active:shadow-none"
                : "cursor-not-allowed border border-nebula-border bg-transparent text-nebula-text-dim"
            }`}
          >
            {isLastStep ? (
              <>Terminer →</>
            ) : (
              <>Suivant<span className="terminal-cursor">_</span></>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}
