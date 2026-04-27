"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ChapterData } from "@/data/courses/html/chapitre-1";
import StationMap from "@/components/station/StationMap";
import HPBar from "@/components/ui/HPBar";
import XPBar from "@/components/ui/XPBar";
import ObjectiveList from "@/components/ui/ObjectiveList";
import StepSlider from "@/components/lesson/StepSlider";
import MonacoEditor from "@/components/editor/MonacoEditor";
import QuestBanner from "@/components/ui/QuestBanner";
import XPPopup from "@/components/ui/XPPopup";
import CompletionScreen from "@/components/ui/CompletionScreen";
import HintBox from "@/components/ui/HintBox";
import SuccessFlash from "@/components/ui/SuccessFlash";
import ParticleLayer, {
  spawnParticles,
  spawnTeleportParticles,
} from "@/components/ui/ParticleLayer";
import EnemySprite from "@/components/ui/EnemySprite";
import VFXBurst from "@/components/ui/VFXBurst";
import {
  unlockAudio,
  playSystemOnline,
  playBreach,
  playFanfare,
  playDeployBip,
} from "@/lib/audio";

// ── Helpers ──
function parseBriefing(content: string) {
  if (!content) return "";

  // 1. Échapper les caractères spéciaux HTML en premier
  let escaped = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped
    .split("\n")
    .map((line) => {
      let trimmed = line.trim();
      if (!trimmed) return "";

      // 2. Appliquer le formatage inline (code et gras) sur la ligne
      let formatted = line;
      // Code : `text` -> <code>text</code>
      formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-nebula-bg-editor px-1.5 py-0.5 rounded text-nebula-cyan font-code text-xs font-mono">$1</code>');
      // Gras : **text** -> <strong>text</strong>
      formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-nebula-orange font-bold">$1</strong>');

      // 3. Appliquer le formatage de bloc (titres, listes, paragraphes)
      let finalTrimmed = formatted.trim();

      if (finalTrimmed.startsWith("### ")) {
        return `<h4 class="text-nebula-cyan font-tech text-sm mt-6 mb-3 tracking-widest uppercase border-b border-nebula-cyan/20 pb-1">${finalTrimmed.slice(4)}</h4>`;
      }

      if (finalTrimmed.startsWith("- ")) {
        return `<li class="ml-4 mb-2 text-nebula-text/80 list-none flex gap-2"><span class="text-nebula-cyan shrink-0">◈</span><span>${finalTrimmed.slice(2)}</span></li>`;
      }

      return `<p class="mb-4 last:mb-0">${formatted}</p>`;
    })
    .join("");
}


// ── Real-time tag detection ──
const WATCHED_TAGS = ["html", "head", "body", "title", "h1", "p", "meta"];

function detectClosedTags(code: string): Set<string> {
  const found = new Set<string>();
  for (const tag of WATCHED_TAGS) {
    if (tag === "meta") {
      if (/<meta\s[^>]*>/i.test(code)) found.add(tag);
    } else {
      const re = new RegExp(`<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`, "i");
      if (re.test(code)) found.add(tag);
    }
  }
  if (/<!doctype\s+html>/i.test(code)) found.add("doctype");
  return found;
}

interface ChapterClientProps {
  chapter: ChapterData;
}

export default function ChapterClient({ chapter }: ChapterClientProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = chapter.steps[currentStep];
  const [code, setCode] = useState(step.startCode);
  const [xp, setXp] = useState(0);
  const [doneObjectives, setDoneObjectives] = useState<Set<string>>(new Set());
  const [stepDone, setStepDone] = useState<boolean[]>(
    chapter.steps.map(() => false)
  );

  // UI states
  const [showBanner, setShowBanner] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isBriefingOpen, setIsBriefingOpen] = useState(true);
  const [xpPopup, setXpPopup] = useState({ show: false, label: "" });

  // Synchro au changement d'étape
  useEffect(() => {
    setIsBriefingOpen(true);
    setNarratorText(step.narrator);
    setNarratorVisible(true);
    setCode(step.startCode);
    setDoneObjectives(new Set());
    setFeedback({ type: "idle", msg: "" });
  }, [currentStep, step.narrator, step.startCode]);

  const toggleBriefing = () => setIsBriefingOpen(prev => !prev);
  const [flashTrigger, setFlashTrigger] = useState(0);
  const [teleportFlash, setTeleportFlash] = useState(0);
  const [bannerVfxTrigger, setBannerVfxTrigger] = useState(0);

  // Enemy sprite state
  const [enemyState, setEnemyState] = useState<{
    type: "fly" | "explode" | "none";
    trigger: number;
  }>({ type: "none", trigger: 0 });

  // Feedback
  const [feedback, setFeedback] = useState<{
    type: "idle" | "ok" | "err";
    msg: string;
  }>({ type: "idle", msg: "" });

  // Narrator
  const [narratorText, setNarratorText] = useState(chapter.steps[0].narrator);
  const [narratorVisible, setNarratorVisible] = useState(true);

  // Real-time tag tracking
  const detectedTagsRef = useRef<Set<string>>(new Set());

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const xpPopupTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Unlock audio on first click
  useEffect(() => {
    const handler = () => unlockAudio();
    document.body.addEventListener("click", handler, { once: true });
    return () => document.body.removeEventListener("click", handler);
  }, []);

  const gainXP = useCallback(
    (amount: number, label?: string) => {
      setXp((prev) => Math.min(prev + amount, chapter.totalXp));
      setXpPopup({ show: true, label: label ?? `+${amount} XP` });
      clearTimeout(xpPopupTimerRef.current);
      xpPopupTimerRef.current = setTimeout(
        () => setXpPopup((p) => ({ ...p, show: false })),
        2400
      );
    },
    [chapter.totalXp]
  );

  const markObjectives = useCallback(
    (ids: string | string[]) => {
      const idArr = Array.isArray(ids) ? ids : [ids];
      let gained = 0;
      setDoneObjectives((prev) => {
        const next = new Set(prev);
        idArr.forEach((id) => {
          if (id && !next.has(id)) {
            next.add(id);
            gained++;
          }
        });
        return next;
      });
      if (gained) gainXP(gained * 8);
    },
    [gainXP]
  );

  // ── Real-time tag detection ──
  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
    const current = detectClosedTags(newCode);
    const prev = detectedTagsRef.current;
    let hasNew = false;
    current.forEach((tag) => {
      if (!prev.has(tag)) hasNew = true;
    });
    if (hasNew) {
      playDeployBip();
      spawnTeleportParticles();
      setTeleportFlash((p) => p + 1);
    }
    detectedTagsRef.current = current;
  }, []);

  const runCode = useCallback(() => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = code;
    }
    const step = chapter.steps[currentStep];
    const result = step.validate(code);

    if (result.ok) {
      if (result.obj) markObjectives(result.obj);
      if (result.objList) markObjectives(result.objList);

      setFeedback({ type: "ok", msg: result.msg });
      playSystemOnline();
      setFlashTrigger((p) => p + 1);
      spawnParticles();

      // Enemy explode in feedback
      setEnemyState((p) => ({ type: "explode", trigger: p.trigger + 1 }));

      setStepDone((prev) => {
        const next = [...prev];
        next[currentStep] = true;
        return next;
      });

      setTimeout(() => {
        setShowBanner(true);
        setBannerVfxTrigger((p) => p + 1);
        gainXP(25);
      }, 500);
    } else {
      setFeedback({ type: "err", msg: result.msg });
      playBreach();
      // Enemy fly across feedback panel
      setEnemyState((p) => ({ type: "fly", trigger: p.trigger + 1 }));
    }
  }, [code, currentStep, chapter.steps, markObjectives, gainXP]);

  const goNextStep = useCallback(() => {
    setShowBanner(false);
    if (currentStep === chapter.steps.length - 1) {
      playFanfare();
      setShowCompletion(true);
      return;
    }
    const nextIdx = currentStep + 1;
    const nextStep = chapter.steps[nextIdx];
    setCurrentStep(nextIdx);
    setCode(nextStep.startCode);
    setFeedback({ type: "idle", msg: "" });
    setEnemyState({ type: "none", trigger: 0 });
    detectedTagsRef.current = detectClosedTags(nextStep.startCode);
    setNarratorVisible(false);
    setTimeout(() => {
      setNarratorText(nextStep.narrator);
      setNarratorVisible(true);
    }, 300);
    if (iframeRef.current) {
      iframeRef.current.srcdoc = nextStep.startCode;
    }
  }, [currentStep, chapter.steps]);

  const toggleHint = useCallback(() => {
    setShowHint(true);
    clearTimeout(hintTimerRef.current);
    hintTimerRef.current = setTimeout(() => setShowHint(false), 6000);
  }, []);

  const completedStepsCount = stepDone.filter(Boolean).length;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Chapter background */}
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: "url('/chapter-1-bg.png')" }}
      />
      <div className="fixed inset-0 pointer-events-none z-0 bg-[rgba(3,6,13,0.45)]" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-nebula-stars opacity-30" />

      {/* Overlays */}
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
        icon={step.bannerIcon}
        title={step.bannerTtl}
        subtitle={step.bannerSub}
        xpLabel={step.bannerXp}
        buttonLabel={
          currentStep === chapter.steps.length - 1
            ? "TERMINER LE PROTOCOLE →"
            : "SYSTÈME SUIVANT →"
        }
        onNext={goNextStep}
        onDimClick={() => setShowBanner(false)}
      />
      <CompletionScreen
        show={showCompletion}
        totalXp={xp}
        badgeIcon={chapter.completionBadge}
        badgeLabel={chapter.completionBadgeLabel}
        onClose={() => setShowCompletion(false)}
      />
      <HintBox show={showHint} html={step.hint} />

      {/* BRIEFING MODAL */}
      <AnimatePresence mode="wait">
        {isBriefingOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-nebula-bg-darkest/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-nebula-bg-panel border border-nebula-cyan/30 shadow-[0_0_40px_rgba(0,240,255,0.15)] max-w-2xl w-full max-h-[85vh] flex flex-col rounded-sm overflow-hidden"
            >
              <div className="bg-nebula-bg-dark/50 px-6 py-4 border-b border-nebula-border/60 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 flex items-center justify-center shrink-0">
                    {step.missionIcon.startsWith("/") ? (
                      <img src={step.missionIcon} alt="Icon" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-3xl">{step.missionIcon}</span>
                    )}
                  </div>
                  <div>
                    <div className="font-tech text-[10px] text-nebula-cyan tracking-[0.2em] uppercase opacity-70">
                      Briefing de mission
                    </div>
                    <div className="font-tech text-lg text-nebula-text tracking-wider uppercase">
                      {step.briefing.title}
                    </div>
                  </div>
                </div>
                <div className="font-tech text-xs text-nebula-cyan-dim px-2 py-1 border border-nebula-cyan/20 rounded-sm">
                  STATION SÉLÉNÉ
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 font-body text-nebula-text/90 leading-relaxed custom-scrollbar bg-nebula-bg-editor/20 selection:bg-nebula-cyan/30">
                <div 
                  className="prose-nebula space-y-4"
                  dangerouslySetInnerHTML={{ __html: parseBriefing(step.briefing.content) }} 
                />
              </div>

              <div className="p-6 bg-nebula-bg-dark/30 border-t border-nebula-border/60 flex justify-end shrink-0">
                <button
                  onClick={() => setIsBriefingOpen(false)}
                  className="group relative px-8 py-3 bg-nebula-cyan text-nebula-bg-darkest font-tech font-bold text-xs tracking-[0.2em] uppercase rounded-sm overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="relative z-10">Mission Comprise</span>
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOP NAV ── */}
      <nav className="relative z-50 h-[52px] bg-nebula-bg-darkest/55 backdrop-blur-md border-b border-nebula-border/70 flex items-center justify-between px-6 shrink-0">
        <div className="absolute bottom-[-1px] left-0 right-0 h-px bg-gradient-to-r from-transparent via-nebula-cyan to-transparent opacity-20" />
        <div className="font-tech text-base tracking-widest">
          <span className="text-nebula-cyan [text-shadow:0_0_20px_rgba(0,240,255,0.4)]">
            NEBULA
          </span>
          <span className="text-nebula-text-secondary ml-1">COMMAND</span>
        </div>
        <div className="flex items-center gap-1">
          {chapter.steps.map((_, i) => (
            <div key={i} className="flex items-center gap-1">
              {i > 0 && (
                <span className="text-nebula-text-dim text-xs mx-0.5">/</span>
              )}
              <div
                className={`font-tech text-[10px] px-2.5 py-1 border relative cursor-default transition-all duration-300 rounded-sm tracking-wider ${
                  i === currentStep
                    ? "border-nebula-cyan text-nebula-cyan bg-nebula-cyan-faint shadow-[0_0_8px_rgba(0,240,255,0.15)]"
                    : stepDone[i]
                      ? "border-nebula-green-dim text-nebula-green bg-nebula-green-faint"
                      : "border-nebula-border text-nebula-text-dim bg-nebula-bg-mid"
                }`}
              >
                SYS.{String(i + 1).padStart(2, "0")}
              </div>
            </div>
          ))}
        </div>
        <XPBar xp={xp} maxXp={chapter.totalXp} />
      </nav>

      {/* ── MAIN LAYOUT ── */}
      <div className="grid grid-cols-[260px_1fr_320px] flex-1 min-h-0 relative z-[1]">
        {/* ── LEFT SIDEBAR ── */}
        <aside className="bg-nebula-bg-panel/38 backdrop-blur-md border-r border-nebula-border/60 flex flex-col overflow-hidden">
          {/* Chapter header */}
          <div className="px-4 py-4 pb-3 border-b border-nebula-border/60 bg-gradient-to-b from-[rgba(0,240,255,0.08)] to-[rgba(3,6,13,0.08)] shrink-0">
            <div className="font-tech text-[10px] text-nebula-blue tracking-widest mb-2 flex items-center gap-1.5 uppercase">
              <span className="text-xs">◈</span>
              {chapter.tag}
            </div>
            <div className="font-tech text-sm text-nebula-cyan leading-relaxed tracking-wider mb-2 whitespace-pre-line [text-shadow:0_0_12px_rgba(0,240,255,0.3)]">
              {chapter.title}
            </div>
            <div className="font-body text-sm text-nebula-text-secondary leading-normal">
              {chapter.subtitle}
            </div>
          </div>

          {/* Station Map — sprites! */}
          <div className="px-4 py-3 border-b border-nebula-border/60 bg-nebula-bg-dark/35 backdrop-blur-sm flex justify-center shrink-0 relative overflow-hidden">
            <StationMap completedSteps={completedStepsCount} />
          </div>


          <HPBar currentStep={currentStep} />

          {/* ARIA narrator */}
          <div className="px-4 py-3.5 border-b border-nebula-border/60 bg-[rgba(3,6,13,0.14)] shrink-0">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-8 h-8 relative shrink-0">
                <svg viewBox="0 0 32 32" className="w-full h-full">
                  <circle cx="16" cy="16" r="13" fill="#080D18" stroke="#1A2744" strokeWidth="1" />
                  <circle
                    cx="16" cy="16" r="10" fill="none" stroke="#00F0FF"
                    strokeWidth="1.5" strokeDasharray="15 48"
                    className="animate-scan-ring" style={{ transformOrigin: "center" }}
                  />
                  <circle cx="16" cy="16" r="3" fill="#00F0FF" opacity="0.8" />
                  <circle cx="16" cy="16" r="5" fill="#00F0FF" opacity="0.15" />
                </svg>
              </div>
              <div className="font-tech text-[10px] text-nebula-cyan tracking-widest">
                ARIA — IA DE BORD
              </div>
            </div>
            <div
              className="font-body text-sm text-nebula-text leading-relaxed border-l-2 border-nebula-cyan-dim pl-3 transition-opacity duration-[400ms]"
              style={{ opacity: narratorVisible ? 1 : 0 }}
              dangerouslySetInnerHTML={{ __html: narratorText }}
            />
          </div>

          <ObjectiveList
            objectives={step.objectives}
            doneObjectives={doneObjectives}
          />
        </aside>

        {/* ── CENTER ── */}
        <main className="flex flex-col bg-nebula-bg-dark/24 backdrop-blur-[2px] min-h-0 overflow-hidden">
          <StepSlider steps={chapter.steps} currentStep={currentStep} />
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between px-4 h-[42px] bg-nebula-bg-panel/45 backdrop-blur-md border-b border-nebula-border/60 shrink-0">
              <div className="font-tech text-[10px] px-3 py-1 border border-nebula-cyan/70 border-b-0 text-nebula-cyan bg-nebula-bg-editor/50 rounded-t-sm tracking-wider">
                index.html
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={toggleBriefing}
                  className="font-tech text-[10px] px-3 py-1.5 bg-transparent text-nebula-cyan border border-nebula-cyan-dim cursor-pointer tracking-wider rounded-sm hover:border-nebula-cyan hover:bg-nebula-cyan-faint transition-all uppercase"
                >
                  📁 Briefing
                </button>
                <button
                  onClick={toggleHint}
                  className="font-tech text-[10px] px-3 py-1.5 bg-transparent text-nebula-orange border border-nebula-orange-dim cursor-pointer tracking-wider rounded-sm hover:border-nebula-orange hover:bg-nebula-orange-faint transition-all uppercase"
                >
                  📡 Indice
                </button>
                <button
                  onClick={runCode}
                  className="font-tech text-[10px] px-4 py-1.5 bg-nebula-cyan text-nebula-bg-darkest border-none cursor-pointer relative top-0 rounded-sm shadow-[0_3px_0_var(--cyan-dim)] hover:top-px hover:shadow-[0_2px_0_var(--cyan-dim)] active:top-[3px] active:shadow-none tracking-widest uppercase font-bold"
                >
                  DÉPLOYER ▶
                </button>
              </div>
            </div>
            <MonacoEditor
              value={code}
              onChange={handleCodeChange}
              placeholder={step.placeholder}
            />
          </div>
        </main>

        {/* ── RIGHT SIDEBAR ── */}
        <aside className="bg-nebula-bg-panel/38 backdrop-blur-md border-l border-nebula-border/60 flex flex-col overflow-hidden">
          <div className="px-3.5 py-2.5 bg-nebula-bg-dark/35 backdrop-blur-sm border-b border-nebula-border/60 flex items-center justify-between shrink-0">
            <div className="font-tech text-[10px] text-nebula-text-secondary tracking-widest flex items-center gap-2 uppercase">
              <div className="w-2 h-2 bg-nebula-green rounded-full animate-blink shadow-[0_0_6px_rgba(0,255,136,0.5)]" />
              Aperçu en direct
            </div>
          </div>
          <iframe
            ref={iframeRef}
            className="flex-1 bg-white border-none min-h-0"
            sandbox="allow-scripts"
            title="Aperçu"
          />

          {/* Feedback — RAPPORT DE MISSION with enemy sprites */}
          <div className="border-t border-nebula-border/60 shrink-0 bg-[rgba(3,6,13,0.22)]">
            <div className="px-3.5 py-2 bg-nebula-bg-dark/35 backdrop-blur-sm border-b border-nebula-border/60 font-tech text-[10px] text-nebula-text-secondary tracking-widest uppercase">
              ▸ Rapport de mission
            </div>
            <div className="px-3.5 py-3 min-h-[75px] max-h-[140px] overflow-y-auto relative overflow-x-hidden">
              {/* Enemy sprite layer */}
              <EnemySprite
                type={enemyState.type}
                trigger={enemyState.trigger}
              />

              {feedback.type === "idle" && (
                <div className="text-nebula-text-dim text-sm font-body italic">
                  En attente du déploiement...
                </div>
              )}
              {feedback.type === "ok" && (
                <div className="text-nebula-green text-sm leading-relaxed animate-fb-in font-body">
                  <strong className="font-tech text-xs block mb-1.5 tracking-wider">
                    ✓ SYSTÈME EN LIGNE
                  </strong>
                  <span>{feedback.msg}</span>
                </div>
              )}
              {feedback.type === "err" && (
                <div className="text-nebula-text-secondary text-sm leading-relaxed animate-fb-in font-body">
                  <strong className="font-tech text-xs text-nebula-red block mb-1.5 tracking-wider">
                    ✕ BRÈCHE DÉTECTÉE
                  </strong>
                  <span>{feedback.msg}</span>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
