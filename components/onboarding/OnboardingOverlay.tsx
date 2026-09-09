"use client";

import { useState } from "react";
import Image from "next/image";

import { useUser } from "@/lib/use-user";
import { ROLES, ROLE_RECOMMENDED_COURSES, isRoleId, type RoleId } from "@/lib/avatar";
import { getCourseInfo } from "@/lib/courses-catalog";

interface Slide {
  icon: string;
  tag: string;
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    icon: "🛸",
    tag: "PROTOCOLE 01",
    title: "BRIEFING DE MISSION",
    body:
      "Bienvenue à bord, Cadet. La station Nebula te confie une mission : maîtriser les protocoles du code, du HTML au DevOps. Chaque chapitre est une mission, chaque étape un protocole à valider.",
  },
  {
    icon: "⚙️",
    tag: "PROTOCOLE 02",
    title: "DÉPLOIE TON CODE",
    body:
      "À gauche, le briefing et tes objectifs. À droite, l'éditeur de code. Tape ton code, puis clique DÉPLOYER pour exécuter. Si tu valides tous les objectifs, l'étape est marquée terminée.",
  },
  {
    icon: "⚡",
    tag: "PROTOCOLE 03",
    title: "SYSTÈME XP & BADGES",
    body:
      "Chaque étape complétée te rapporte de l'XP et fait monter ton niveau. Terminer un chapitre entier débloque un badge spécial — visible sur ton profil. Reviens chaque jour pour faire grimper ta liaison.",
  },
  {
    icon: "🚀",
    tag: "PROTOCOLE 04",
    title: "PRÊT À DÉCOLLER",
    body:
      "Quatorze cursus t'attendent : HTML, CSS et JavaScript pour les fondations, puis React, SQL, DevOps et bien plus. Réponds à quelques questions pour découvrir ton profil de cadet et tes cursus recommandés.",
  },
];

interface Question {
  id: number;
  text: string;
  options: {
    text: string;
    scores: {
      pilote?: number;
      ingenieur?: number;
      tacticien?: number;
      explorateur?: number;
    };
  }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Quel est ton niveau actuel en programmation ?",
    options: [
      { text: "Recrue (Débutant complet)", scores: { explorateur: 1, pilote: 1 } },
      { text: "Officier (Intermédiaire)", scores: { ingenieur: 1 } },
      { text: "Commandant (Expérimenté)", scores: { tacticien: 1 } },
    ],
  },
  {
    id: 2,
    text: "Quelle mission spatiale t'attire le plus ?",
    options: [
      { text: "Piloter un vaisseau agile à travers un champ d'astéroïdes", scores: { pilote: 2 } },
      { text: "Concevoir et réparer les réacteurs de la station", scores: { ingenieur: 2 } },
      { text: "Planifier la stratégie de défense et anticiper les menaces", scores: { tacticien: 2 } },
      { text: "Explorer de nouveaux systèmes stellaires et anomalies", scores: { explorateur: 2 } },
    ],
  },
  {
    id: 3,
    text: "Quelle technologie as-tu le plus hâte de maîtriser ?",
    options: [
      { text: "Créer des interfaces de cockpit interactives (HTML/CSS)", scores: { pilote: 2, explorateur: 1 } },
      { text: "Développer des architectures serveur robustes (Node/SQL)", scores: { ingenieur: 2 } },
      { text: "Sécuriser les transmissions et optimiser les algorithmes", scores: { tacticien: 2 } },
    ],
  },
  {
    id: 4,
    text: "Face à un bug critique dans le système, comment réagis-tu ?",
    options: [
      { text: "Je tente des modifications rapides pour voir le résultat", scores: { pilote: 2 } },
      { text: "Je démonte le code pour comprendre la mécanique interne", scores: { ingenieur: 2 } },
      { text: "J'analyse les logs système méthodiquement avant d'agir", scores: { tacticien: 2 } },
      { text: "Je cherche des indices dans la documentation et les archives", scores: { explorateur: 2 } },
    ],
  },
];

// Recommended courses per role come from lib/avatar.ts (shared with /learn);
// display titles come from the course catalog.

export default function OnboardingOverlay() {
  const { state, hydrated, markOnboarded, setAvatar } = useUser();
  const [step, setStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [dismissing, setDismissing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);

  if (!hydrated || hidden || state.onboardedAt) return null;

  const totalBriefingSlides = SLIDES.length;
  const totalQuestions = QUESTIONS.length;
  const totalSteps = totalBriefingSlides + totalQuestions + 1; // Briefing + Qs + Result

  const isBriefing = step < totalBriefingSlides;
  const isQuestionnaire = step >= totalBriefingSlides && step < totalBriefingSlides + totalQuestions;
  const isResult = step === totalSteps - 1;

  const currentQuestionIdx = step - totalBriefingSlides;
  const currentQuestion = isQuestionnaire ? QUESTIONS[currentQuestionIdx] : null;

  // Calculate the recommended role based on current selected answers
  const getCalculatedRole = (): RoleId => {
    const scores: Record<RoleId, number> = { pilote: 0, ingenieur: 0, tacticien: 0, explorateur: 0 };
    QUESTIONS.forEach((q, qIdx) => {
      const selectedOptIdx = selectedAnswers[qIdx];
      if (selectedOptIdx !== undefined) {
        const option = q.options[selectedOptIdx];
        if (option && option.scores) {
          Object.entries(option.scores).forEach(([role, score]) => {
            scores[role as RoleId] += score || 0;
          });
        }
      }
    });

    let maxScore = -1;
    let recommended: RoleId = "explorateur";
    (Object.keys(scores) as RoleId[]).forEach((role) => {
      if (scores[role] > maxScore) {
        maxScore = scores[role];
        recommended = role;
      }
    });
    return recommended;
  };

  const handleSelectOption = (optIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestionIdx]: optIdx }));
    // Auto advance after selection
    setTimeout(() => {
      setStep((s) => s + 1);
    }, 250);
  };

  const handleCompleteOnboarding = async (finalRole: RoleId) => {
    setLocalError(null);
    setDismissing(true);
    try {
      // Save Avatar choice (preserve existing species/color or use defaults)
      await setAvatar({
        species: state.species || "humain",
        uniformColor: state.uniformColor || "cyan",
        role: finalRole,
      });
      // Mark as Onboarded
      await markOnboarded();
      setHidden(true);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Erreur d'enregistrement");
    } finally {
      setDismissing(false);
    }
  };

  const handleDismiss = async () => {
    // Skip flow: NEVER overwrite a role the user already picked on /avatar.
    // Only fall back to the quiz's best guess when no role exists yet.
    const activeRole = isRoleId(state.role)
      ? state.role
      : getCalculatedRole();
    await handleCompleteOnboarding(activeRole);
  };

  const calculatedRole = isResult ? getCalculatedRole() : "explorateur";
  const roleDef = ROLES.find((r) => r.id === calculatedRole);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-[600] flex items-center justify-center bg-[rgba(3,6,13,0.92)] px-4 py-6 backdrop-blur-sm animate-overlay-in"
    >
      <div className="w-full max-w-lg rounded-sm border border-nebula-cyan/60 bg-nebula-bg-panel p-6 shadow-[0_0_60px_rgba(0,240,255,0.18),0_0_140px_rgba(0,240,255,0.06)] animate-modal-pop-in sm:p-8">
        
        {/* Top Info */}
        <div className="mb-4 flex items-center justify-between font-tech text-[10px] uppercase tracking-[0.3em] text-nebula-text-dim">
          {isBriefing && (
            <>
              <span className="text-nebula-blue">◈ {SLIDES[step].tag}</span>
              <span>{step + 1} / {totalSteps}</span>
            </>
          )}
          {isQuestionnaire && (
            <>
              <span className="text-nebula-orange">◈ ORIENTATION CADET</span>
              <span>{step + 1} / {totalSteps}</span>
            </>
          )}
          {isResult && (
            <>
              <span className="text-nebula-green">◈ ANALYSE COMPLETE</span>
              <span>{totalSteps} / {totalSteps}</span>
            </>
          )}
        </div>

        {/* Content Area */}
        {isBriefing && (
          <>
            <div className="mb-5 text-center">
              <div className="mb-3 text-5xl sm:text-6xl">{SLIDES[step].icon}</div>
              <h2
                id="onboarding-title"
                className="font-tech text-2xl tracking-[0.15em] text-nebula-cyan [text-shadow:0_0_22px_rgba(0,240,255,0.35)] sm:text-3xl"
              >
                {SLIDES[step].title}
              </h2>
            </div>
            <p className="mb-6 min-h-[6rem] font-body text-base leading-relaxed text-nebula-text-secondary text-center">
              {SLIDES[step].body}
            </p>
          </>
        )}

        {isQuestionnaire && currentQuestion && (
          <>
            <div className="mb-5 text-center">
              <span className="font-tech text-xs tracking-widest text-nebula-cyan uppercase border border-nebula-cyan/30 px-3 py-1 rounded-full bg-nebula-cyan-faint">
                Question {currentQuestionIdx + 1} de {totalQuestions}
              </span>
              <h2
                id="onboarding-title"
                className="mt-4 font-tech text-xl tracking-[0.12em] text-nebula-text-secondary leading-snug min-h-[3rem]"
              >
                {currentQuestion.text}
              </h2>
            </div>

            {/* Options list */}
            <div className="mb-6 flex flex-col gap-3">
              {currentQuestion.options.map((opt, optIdx) => {
                const isSelected = selectedAnswers[currentQuestionIdx] === optIdx;
                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full text-left p-4 rounded-sm border font-body text-sm transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "border-nebula-cyan bg-nebula-cyan-faint text-nebula-cyan shadow-[0_0_12px_rgba(0,240,255,0.15)]"
                        : "border-nebula-border bg-nebula-bg-panel/40 text-nebula-text-secondary hover:border-nebula-text-dim hover:bg-nebula-bg-panel"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{opt.text}</span>
                      {isSelected && <span className="text-xs font-tech text-nebula-cyan">✓ SÉLECTIONNÉ</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {isResult && roleDef && (
          <>
            <div className="mb-5 text-center flex flex-col items-center">
              <span className="font-tech text-xs tracking-widest text-nebula-green uppercase border border-nebula-green/30 px-3 py-1 rounded-full bg-nebula-green/10 mb-4 animate-pulse">
                Profil Déterminé
              </span>
              {roleDef.image && (
                <div className="relative w-16 h-16 mb-3 flex items-center justify-center bg-nebula-bg-panel border border-nebula-border rounded shadow-[0_0_20px_rgba(176,103,255,0.1)]">
                  <Image
                    src={roleDef.image}
                    alt={roleDef.label}
                    width={48}
                    height={48}
                    className="pixelated object-contain"
                    priority
                  />
                </div>
              )}
              <h2
                id="onboarding-title"
                className="font-tech text-3xl tracking-[0.2em] text-nebula-cyan [text-shadow:0_0_25px_rgba(0,240,255,0.4)] mb-2"
              >
                {roleDef.label.toUpperCase()}
              </h2>
              <p className="font-body text-sm text-nebula-text-secondary max-w-sm mb-4 leading-relaxed">
                {roleDef.description}
              </p>
              
              {/* Recommendations list */}
              <div className="w-full text-left p-4 bg-nebula-bg-darkest/60 border border-nebula-border/50 rounded-sm mb-6">
                <span className="font-tech text-[10px] tracking-widest text-nebula-text-dim block mb-2 uppercase">
                  📡 Priorités de Cursus Recommandées
                </span>
                <div className="flex flex-wrap gap-2">
                  {ROLE_RECOMMENDED_COURSES[calculatedRole].map((slug) => (
                    <span
                      key={slug}
                      className="font-tech text-xs px-2.5 py-1 rounded bg-nebula-cyan-faint border border-nebula-cyan/25 text-nebula-cyan"
                    >
                      {getCourseInfo(slug)?.title ?? slug}
                    </span>
                  ))}
                </div>
                <p className="font-body text-[11px] text-nebula-text-dim mt-3">
                  💡 Note : Toutes les formations restent déverrouillées et accessibles à tout moment.
                </p>
              </div>
            </div>
          </>
        )}

        {/* Progress dots */}
        <div className="mb-5 flex items-center justify-center gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => {
            const isActive = i === step;
            const isPassed = i < step;
            return (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  isActive
                    ? "w-8 bg-nebula-cyan shadow-[0_0_8px_rgba(0,240,255,0.5)]"
                    : isPassed
                      ? "w-4 bg-nebula-green"
                      : "w-4 bg-nebula-border"
                }`}
              />
            );
          })}
        </div>

        {localError && (
          <p className="mb-3 text-center font-tech text-[11px] uppercase tracking-wider text-nebula-red">
            {localError}
          </p>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between gap-3">
          {!isResult ? (
            <button
              type="button"
              onClick={handleDismiss}
              disabled={dismissing}
              className="font-tech text-xs uppercase tracking-widest text-nebula-text-dim transition-colors hover:text-nebula-text-secondary disabled:opacity-40"
            >
              Passer
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || dismissing}
              className="rounded-sm border border-nebula-border bg-transparent px-3 py-2 font-tech text-xs uppercase tracking-widest text-nebula-text-secondary transition-all enabled:hover:border-nebula-cyan enabled:hover:text-nebula-cyan disabled:opacity-30 sm:px-4"
            >
              ← Préc.
            </button>

            {isResult ? (
              <button
                type="button"
                onClick={() => handleCompleteOnboarding(calculatedRole)}
                disabled={dismissing}
                className="rounded-sm bg-nebula-green px-5 py-2 font-tech text-xs font-bold uppercase tracking-[0.18em] text-nebula-bg-darkest shadow-[0_4px_0_#00aa5a] transition-all enabled:hover:translate-y-px enabled:hover:shadow-[0_3px_0_#00aa5a] enabled:active:translate-y-[3px] enabled:active:shadow-none disabled:opacity-50 sm:px-6 sm:text-sm"
              >
                {dismissing ? "..." : "> Commencer la mission"}
              </button>
            ) : isBriefing ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={dismissing}
                className="rounded-sm bg-nebula-cyan px-4 py-2 font-tech text-xs font-bold uppercase tracking-[0.18em] text-nebula-bg-darkest shadow-[0_4px_0_var(--cyan-dim)] transition-all hover:translate-y-px hover:shadow-[0_3px_0_var(--cyan-dim)] active:translate-y-[3px] active:shadow-none sm:px-6 sm:text-sm"
              >
                Suivant →
              </button>
            ) : (
              // Questionnaire questions have auto-advance but display next button if option already selected
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={selectedAnswers[currentQuestionIdx] === undefined || dismissing}
                className="rounded-sm bg-nebula-cyan px-4 py-2 font-tech text-xs font-bold uppercase tracking-[0.18em] text-nebula-bg-darkest shadow-[0_4px_0_var(--cyan-dim)] transition-all enabled:hover:translate-y-px enabled:hover:shadow-[0_3px_0_var(--cyan-dim)] enabled:active:translate-y-[3px] enabled:active:shadow-none disabled:opacity-50 sm:px-6 sm:text-sm"
              >
                Suivant →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
