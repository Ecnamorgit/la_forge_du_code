"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
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
import ParticleLayer, { spawnParticles } from "@/components/ui/ParticleLayer";
import VFXBurst from "@/components/ui/VFXBurst";
import { unlockAudio, playFanfare } from "@/lib/audio";
import { useUser } from "@/lib/use-user";
import { getCompletedSteps } from "@/lib/user-store";
import { xpForStep } from "@/lib/xp";
import { getChapterBackground } from "@/lib/sprite-config";

function parseBriefing(content: string) {
  if (!content) return "";

  const escaped = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "";

      let formatted = line;
      formatted = formatted.replace(
        /`([^`]+)`/g,
        '<code class="bg-nebula-bg-editor px-1.5 py-0.5 rounded text-nebula-cyan font-code text-xs font-mono">$1</code>'
      );
      formatted = formatted.replace(
        /\*\*([^*]+)\*\*/g,
        '<strong class="text-nebula-orange font-bold">$1</strong>'
      );

      const finalTrimmed = formatted.trim();

      if (finalTrimmed.startsWith("### ")) {
        return `<h4 class="text-nebula-cyan font-tech text-lg mt-8 mb-4 tracking-widest uppercase border-b border-nebula-cyan/20 pb-2">${finalTrimmed.slice(4)}</h4>`;
      }

      if (finalTrimmed.startsWith("- ")) {
        return `<li class="ml-4 mb-3 text-nebula-text/85 list-none flex gap-2.5 text-base leading-relaxed"><span class="text-nebula-cyan shrink-0 mt-0.5">◈</span><span>${finalTrimmed.slice(2)}</span></li>`;
      }

      return `<p class="mb-5 last:mb-0 text-base leading-relaxed">${formatted}</p>`;
    })
    .join("");
}

interface ChapterClientProps {
  course: string;
  chapter: ChapterData;
}

export default function ChapterClient({ course, chapter }: ChapterClientProps) {
  const { state, completeStep } = useUser();
  const validators = getValidators(course, chapter.slug);

  // Derived from store
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
    (() => ({ ok: false, msg: "Validateur manquant pour cette etape" }));
  const stepDone = useMemo(
    () => chapter.steps.map((_, i) => completedStepIndexes.includes(i)),
    [completedStepIndexes, chapter.steps]
  );
  const xp = useMemo(
    () =>
      Math.min(
        completedStepIndexes.reduce(
          (sum, idx) => sum + xpForStep(chapter.steps[idx].objectives.length),
          0
        ),
        chapter.totalXp
      ),
    [completedStepIndexes, chapter.steps, chapter.totalXp]
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
  const [showHint, setShowHint] = useState(false);
  const [xpPopup, setXpPopup] = useState({ show: false, label: "" });
  const [flashTrigger, setFlashTrigger] = useState(0);
  const [teleportFlash, setTeleportFlash] = useState(0);
  const [bannerVfxTrigger, setBannerVfxTrigger] = useState(0);

  const hintTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const xpPopupTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

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

  const handleStepSuccess = useCallback(() => {
    const alreadyDone = stepDone[currentStep];

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

      void completeStep(course, chapter.slug, currentStep).catch((err) => {
        console.error("Step completion failed:", err);
      });
    }

    setTimeout(() => {
      setShowBanner(true);
      setBannerVfxTrigger((p) => p + 1);
    }, 500);
  }, [course, chapter, currentStep, stepDone, completeStep]);

  const goNextStep = useCallback(() => {
    setShowBanner(false);
    if (currentStep === chapter.steps.length - 1) {
      playFanfare();
      setShowCompletion(true);
      return;
    }
    setCurrentStep(currentStep + 1);
  }, [currentStep, chapter.steps.length, setCurrentStep]);

  const toggleHint = useCallback(() => {
    setShowHint(true);
    clearTimeout(hintTimerRef.current);
    hintTimerRef.current = setTimeout(() => setShowHint(false), 6000);
  }, []);

  const isStepDone = stepDone[currentStep];
  const isLastStep = currentStep === chapter.steps.length - 1;
  const [mobileTab, setMobileTab] = useState<"lesson" | "editor" | "output">("lesson");

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Background */}
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: `url('${getChapterBackground(course)}')` }}
      />
      <div className="fixed inset-0 pointer-events-none z-0 bg-[rgba(3,6,13,0.62)]" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-nebula-stars opacity-25" />

      {/* Effects layers */}
      <SuccessFlash trigger={flashTrigger} />
      <div
        key={teleportFlash}
        className={`fixed inset-0 pointer-events-none z-[199] ${teleportFlash > 0 ? "animate-teleport-flash" : "opacity-0"}`}
      />
      <ParticleLayer />
      <XPPopup show={xpPopup.show} label={xpPopup.label} />
      <VFXBurst trigger={bannerVfxTrigger} />
      <QuestBanner
        show={showBanner}
        title={step.bannerTtl}
        subtitle={step.bannerSub}
        xpLabel={step.bannerXp}
        buttonLabel={isLastStep ? "TERMINER LE PROTOCOLE ->" : "SYSTEME SUIVANT ->"}
        bannerFrame={step.bannerFrame}
        onNext={goNextStep}
        onDimClick={() => setShowBanner(false)}
      />
      <CompletionScreen
        show={showCompletion}
        totalXp={xp}
        badgeIcon={chapter.completionBadge}
        badgeLabel={chapter.completionBadgeLabel}
        href={`/learn/${course}`}
      />
      <HintBox show={showHint} html={step.hint} />

      {/* Top bar */}
      <header className="relative z-50 flex h-14 shrink-0 items-center justify-between border-b border-nebula-border/70 bg-nebula-bg-darkest/70 px-4 backdrop-blur-md lg:px-6">
        <div className="flex items-center gap-2 lg:gap-4">
          <Link
            href={`/learn/${course}`}
            className="font-tech text-sm uppercase tracking-widest text-nebula-text-secondary transition-colors hover:text-nebula-cyan"
          >
            ← Retour
          </Link>
          <div className="hidden h-5 w-px bg-nebula-border lg:block" />
          <BrandLogo size={28} className="hidden lg:block" />
          <div className="hidden font-tech text-sm tracking-widest lg:block">
            <span className="text-nebula-cyan">NEBULA</span>
            <span className="ml-1.5 text-nebula-text-secondary">/ {course.toUpperCase()} / {chapter.slug.toUpperCase()}</span>
          </div>
        </div>
        <XPBar xp={xp} maxXp={chapter.totalXp} />
      </header>

      {/* Mobile tabs — visible only below lg */}
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

      {/* 2-col main on desktop, single-column with tabs on mobile */}
      <div className="relative z-[1] grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* LEFT — lesson */}
        <main
          key={currentStep}
          className={`animate-fade-in min-h-0 overflow-y-auto border-r border-nebula-border/60 bg-nebula-bg-darkest/55 px-5 py-6 backdrop-blur-md lg:px-10 lg:py-9 ${
            mobileTab === "lesson" ? "block" : "hidden lg:block"
          }`}
        >
          <div className="mb-4 flex items-center gap-2 font-tech text-xs uppercase tracking-[0.22em] text-nebula-blue">
            <span>◈ {chapter.tag}</span>
            <span className="text-nebula-text-dim">/</span>
            <span>Etape {currentStep + 1} sur {chapter.steps.length}</span>
          </div>

          <h1 className="mb-3 font-tech text-4xl leading-tight tracking-[0.1em] text-nebula-cyan [text-shadow:0_0_18px_rgba(0,240,255,0.25)]">
            {"> "}{step.missionTtl}<span className="terminal-cursor">_</span>
          </h1>

          <h2 className="mb-7 font-tech text-xl tracking-wide text-nebula-text/90">
            {step.briefing.title}
          </h2>

          <p className="mb-8 border-l-2 border-nebula-cyan/40 bg-nebula-cyan-faint/40 px-5 py-4 font-body text-base italic leading-relaxed text-nebula-text-secondary">
            {step.narrator}
          </p>

          <div
            className="prose-nebula font-body text-base leading-relaxed text-nebula-text/90"
            dangerouslySetInnerHTML={{
              __html: parseBriefing(step.briefing.content),
            }}
          />

          {/* Objectifs */}
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

          {/* Hint button */}
          <div className="mt-6">
            <button
              onClick={toggleHint}
              className="rounded-sm border border-nebula-orange-dim bg-transparent px-5 py-2.5 font-tech text-sm uppercase tracking-wider text-nebula-orange transition-all hover:border-nebula-orange hover:bg-nebula-orange-faint"
            >
              💡 Indice
            </button>
          </div>
        </main>

        {/* RIGHT — workspace */}
        <div
          className={`min-h-0 ${
            mobileTab === "lesson" ? "hidden lg:flex" : "flex"
          } flex-col`}
        >
          <ChapterWorkspace
            key={`${chapter.slug}-${currentStep}`}
            step={step}
            validate={validate}
            language={course === "javascript" ? "javascript" : "html"}
            mobilePanel={mobileTab === "output" ? "output" : "editor"}
            onStepSuccess={handleStepSuccess}
            onDeploy={() => setMobileTab("output")}
            onTeleportFlash={() => setTeleportFlash((prev) => prev + 1)}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-50 flex h-16 shrink-0 items-center justify-between border-t border-nebula-border/70 bg-nebula-bg-darkest/70 px-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="font-tech text-sm uppercase tracking-widest text-nebula-text-secondary">
            Etape {currentStep + 1} / {chapter.steps.length}
          </span>
          <div className="ml-3 flex items-center gap-2">
            {chapter.steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-8 rounded-full transition-all duration-300 ${
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

        <div className="flex items-center gap-3">
          <button
            onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
            disabled={currentStep === 0}
            className="rounded-sm border border-nebula-border bg-transparent px-5 py-2.5 font-tech text-sm uppercase tracking-widest text-nebula-text-secondary transition-all hover:border-nebula-cyan hover:text-nebula-cyan disabled:opacity-30 disabled:hover:border-nebula-border disabled:hover:text-nebula-text-secondary"
          >
            ← Précédent
          </button>
          <button
            onClick={goNextStep}
            disabled={!isStepDone}
            className={`rounded-sm px-7 py-3 font-tech text-base font-bold uppercase tracking-[0.18em] transition-all ${
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
