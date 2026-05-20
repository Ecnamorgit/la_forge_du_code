"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { Step, ValidationResult, Validator } from "@/data/courses/html/types";
import MonacoEditor from "@/components/editor/MonacoEditor";
import EnemySprite from "@/components/ui/EnemySprite";
import {
  playBreach,
  playDeployBip,
  playSystemOnline,
} from "@/lib/audio";
import { runJs } from "@/lib/sandbox/run-js";

type Language = "html" | "javascript";

interface ChapterWorkspaceProps {
  step: Step;
  validate: Validator;
  language?: Language;
  /** On screens below `lg`, only one internal panel is shown at a time. */
  mobilePanel?: "editor" | "output";
  onStepSuccess: (result: ValidationResult) => void;
  /** Notified each time the Deploy button is pressed (used for mobile tab routing). */
  onDeploy?: () => void;
  onTeleportFlash: () => void;
}

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

interface ConsoleEntry {
  type: "log" | "error";
  text: string;
}

export default function ChapterWorkspace({
  step,
  validate,
  language = "html",
  mobilePanel,
  onStepSuccess,
  onDeploy,
  onTeleportFlash,
}: ChapterWorkspaceProps) {
  const isJs = language === "javascript";
  const [code, setCode] = useState(step.startCode);
  const [feedback, setFeedback] = useState<{
    type: "idle" | "ok" | "err";
    msg: string;
  }>({ type: "idle", msg: "" });
  const [enemyState, setEnemyState] = useState<{
    type: "fly" | "explode" | "none";
    trigger: number;
  }>({ type: "none", trigger: 0 });
  const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([]);

  const detectedTagsRef = useRef<Set<string>>(detectClosedTags(step.startCode));
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const detectTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const latestCodeRef = useRef<string>(step.startCode);

  useEffect(() => {
    return () => clearTimeout(detectTimerRef.current);
  }, []);

  useEffect(() => {
    if (!isJs && iframeRef.current) {
      iframeRef.current.srcdoc = step.startCode;
    }
  }, [isJs, step.startCode]);

  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCode(newCode);
      latestCodeRef.current = newCode;
      if (isJs) return;
      clearTimeout(detectTimerRef.current);
      detectTimerRef.current = setTimeout(() => {
        const current = detectClosedTags(latestCodeRef.current);
        const prev = detectedTagsRef.current;
        let hasNew = false;

        current.forEach((tag) => {
          if (!prev.has(tag)) hasNew = true;
        });

        if (hasNew) {
          playDeployBip();
          onTeleportFlash();
        }

        detectedTagsRef.current = current;
      }, 150);
    },
    [onTeleportFlash, isJs]
  );

  const runCode = useCallback(() => {
    onDeploy?.();
    let result: ValidationResult;

    if (isJs) {
      const exec = runJs(code);
      const entries: ConsoleEntry[] = exec.logs.map((text) => ({
        type: "log",
        text,
      }));
      if (exec.error) {
        entries.push({ type: "error", text: exec.error });
      }
      setConsoleEntries(entries);
      result = validate(code, {
        logs: exec.logs,
        error: exec.error,
        lastValue: exec.lastValue,
      });
    } else {
      if (iframeRef.current) {
        iframeRef.current.srcdoc = code;
      }
      result = validate(code);
    }

    if (result.ok) {
      setFeedback({ type: "ok", msg: result.msg });
      playSystemOnline();
      setEnemyState((prev) => ({ type: "explode", trigger: prev.trigger + 1 }));
      onStepSuccess(result);
      return;
    }

    setFeedback({ type: "err", msg: result.msg });
    playBreach();
    setEnemyState((prev) => ({ type: "fly", trigger: prev.trigger + 1 }));
  }, [code, isJs, onDeploy, onStepSuccess, validate]);

  const editorTabLabel = isJs ? "script.js" : "index.html";

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-nebula-bg-dark/30 backdrop-blur-md">
      {/* Editor toolbar */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-nebula-border/60 bg-nebula-bg-panel/60 px-5">
        <div className="rounded-t-sm border border-b-0 border-nebula-cyan/70 bg-nebula-bg-editor/50 px-4 py-1.5 font-tech text-sm tracking-wider text-nebula-cyan">
          {editorTabLabel}
        </div>
        <button
          onClick={runCode}
          className="rounded-sm bg-nebula-cyan px-7 py-3 font-tech text-base font-bold uppercase tracking-[0.18em] text-nebula-bg-darkest shadow-[0_4px_0_var(--cyan-dim)] transition-all hover:translate-y-px hover:shadow-[0_3px_0_var(--cyan-dim)] active:translate-y-[3px] active:shadow-none"
        >
          {"> "}DEPLOYER<span className="terminal-cursor">_</span>
        </button>
      </div>

      {/* Editor — top 55% on desktop ; full on mobile editor tab */}
      <div
        className={`min-h-0 flex-col lg:flex lg:h-[55%] lg:flex-none ${
          mobilePanel === "output" ? "hidden" : "flex flex-1"
        }`}
      >
        <MonacoEditor
          value={code}
          onChange={handleCodeChange}
          placeholder={step.placeholder}
          language={isJs ? "javascript" : "html"}
        />
      </div>

      {/* Feedback status bar */}
      <div className="shrink-0 border-y border-nebula-border/60 bg-nebula-bg-panel/50 px-5 py-3.5 backdrop-blur-sm">
        <div className="relative flex items-center gap-3">
          <EnemySprite
            type={enemyState.type}
            trigger={enemyState.trigger}
          />
          {feedback.type === "idle" && (
            <>
              <div className="h-2.5 w-2.5 rounded-full bg-nebula-green shadow-[0_0_8px_rgba(0,255,136,0.6)]" />
              <span className="font-tech text-xs uppercase tracking-widest text-nebula-text-secondary">
                {"> "}{isJs ? "Console" : "Apercu en direct"}
              </span>
              <span className="font-body text-sm italic text-nebula-text-dim">
                — En attente du prochain deploiement<span className="terminal-cursor">_</span>
              </span>
            </>
          )}
          {feedback.type === "ok" && (
            <div className="animate-fb-in flex items-baseline gap-3">
              <strong className="font-tech text-sm tracking-widest text-nebula-green">
                {"> "}SYSTEME EN LIGNE
              </strong>
              <span className="font-body text-base text-nebula-green/90">
                {feedback.msg}
              </span>
            </div>
          )}
          {feedback.type === "err" && (
            <div className="animate-fb-in flex items-baseline gap-3">
              <strong className="font-tech text-sm tracking-widest text-nebula-red">
                {"> "}BRECHE DETECTEE
              </strong>
              <span className="font-body text-base text-nebula-text-secondary">
                {feedback.msg}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom panel: HTML/CSS → iframe live preview ; JS → console */}
      {isJs ? (
        <div
          className={`flex-1 min-h-0 overflow-y-auto bg-nebula-bg-darkest/80 px-5 py-4 font-code text-sm ${
            mobilePanel === "editor" ? "hidden lg:block" : "block"
          }`}
        >
          <div className="mb-2 font-tech text-[10px] uppercase tracking-[0.3em] text-nebula-text-dim">
            {"> "}Sortie console
          </div>
          {consoleEntries.length === 0 ? (
            <p className="font-tech text-xs italic text-nebula-text-dim">
              Aucune sortie pour l&apos;instant. Appuie sur DEPLOYER pour exécuter ton script.
            </p>
          ) : (
            <ul className="space-y-1">
              {consoleEntries.map((entry, i) => (
                <li
                  key={i}
                  className={`whitespace-pre-wrap break-words font-code ${
                    entry.type === "error"
                      ? "text-nebula-red"
                      : "text-nebula-green"
                  }`}
                >
                  <span className="mr-2 text-nebula-text-dim">{">"}</span>
                  {entry.text}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <iframe
          ref={iframeRef}
          className={`flex-1 min-h-0 border-none bg-white ${
            mobilePanel === "editor" ? "hidden lg:block" : "block"
          }`}
          sandbox="allow-scripts"
          title="Apercu"
        />
      )}
    </section>
  );
}
