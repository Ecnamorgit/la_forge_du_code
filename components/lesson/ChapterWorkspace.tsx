"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { Step, ValidationResult, Validator } from "@/data/courses/html/types";
import MonacoEditor from "@/components/editor/MonacoEditor";
import CombatVisualizer from "@/components/lesson/CombatVisualizer";
import ReactPreview from "@/components/lesson/ReactPreview";
import {
  playBreach,
  playDeployBip,
  playSystemOnline,
} from "@/lib/audio";
import { runJs } from "@/lib/sandbox/run-js";
import { runSql, type SqlRunOptions } from "@/lib/sandbox/run-sql";
import type { SqlQueryResult } from "@/data/courses/html/types";
import {
  getErrorHeader,
  getSpectreTaunt,
  getSuccessHeader,
  resolveErrorTone,
  type ErrorTone,
} from "@/lib/narrative-feedback";
import { CHARACTERS } from "@/lib/characters";
import type { CombatTheme } from "@/lib/combat-theme";

type Language = "html" | "javascript" | "sql" | "react";

interface ChapterWorkspaceProps {
  step: Step;
  validate: Validator;
  language?: Language;
  /** Cursus combat theme, passed through to the CombatVisualizer. */
  combatTheme?: CombatTheme;
  /** Per-step seed/verify SQL, required for the SQL cursus. */
  sqlConfig?: SqlRunOptions;
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
  combatTheme = "turret",
  sqlConfig,
  mobilePanel,
  onStepSuccess,
  onDeploy,
  onTeleportFlash,
}: ChapterWorkspaceProps) {
  const isJs = language === "javascript";
  const isSql = language === "sql";
  // React : le composant se monte réellement dans l'iframe dédiée de
  // ReactPreview (transformation Sucrase + protocole de messages). La
  // validation reste par ailleurs purement statique, comme pour les autres
  // cursus — l'aperçu affiche, il ne juge pas.
  const isReact = language === "react";
  const [code, setCode] = useState(step.startCode);
  const [sqlView, setSqlView] = useState<SqlQueryResult | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "idle" | "ok" | "err";
    msg: string;
    tone?: ErrorTone;
  }>({ type: "idle", msg: "" });
  const [enemyState, setEnemyState] = useState<{
    type: "fly" | "explode" | "none";
    trigger: number;
  }>({ type: "none", trigger: 0 });
  const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([]);
  // Increments on each failure to (re)play the console "took a hit" shake.
  const [shakeTrigger, setShakeTrigger] = useState(0);
  // Consecutive failures on the current step; drives the Spectre's intrusion.
  const [failCount, setFailCount] = useState(0);
  // Incremente a chaque DEPLOYER : c'est le seul signal que ReactPreview
  // consomme. ChapterWorkspace ignore Sucrase comme le protocole de messages.
  const [deployNonce, setDeployNonce] = useState(0);

  const detectedTagsRef = useRef<Set<string>>(detectClosedTags(step.startCode));
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const detectTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const latestCodeRef = useRef<string>(step.startCode);

  useEffect(() => {
    return () => clearTimeout(detectTimerRef.current);
  }, []);

  // Étape-piège : à l'ouverture, Le Spectre fond sur la console (beat + son).
  // Montage uniquement — le composant est remonté par étape (clé).
  useEffect(() => {
    if (step.spectreTrap) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- flourish volontaire au montage
      setEnemyState({ type: "fly", trigger: 1 });
      playBreach();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isJs && !isReact && iframeRef.current) {
      iframeRef.current.srcdoc = step.startCode;
    }
  }, [isJs, isReact, step.startCode]);

  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCode(newCode);
      latestCodeRef.current = newCode;
      if (isJs || isSql) return;
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
    [onTeleportFlash, isJs, isSql]
  );

  const runCode = useCallback(async () => {
    onDeploy?.();
    if (isReact) setDeployNonce((n) => n + 1);
    let result: ValidationResult;
    let jsError: string | null = null;

    if (isJs) {
      const exec = await runJs(code);
      jsError = exec.error;
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
    } else if (isSql) {
      const run = await runSql(code, sqlConfig ?? {});
      // Show the student's result set, falling back to the read-back state
      // (so an INSERT/UPDATE step still displays the resulting table).
      setSqlView(run.result ?? run.verify ?? null);
      result = validate(code, {
        logs: [],
        error: run.error,
        lastValue: undefined,
        sql: { result: run.result, verify: run.verify, error: run.error },
      });
    } else {
      if (iframeRef.current) {
        iframeRef.current.srcdoc = code;
      }
      result = validate(code);
    }

    if (result.ok) {
      setFeedback({ type: "ok", msg: result.msg });
      setFailCount(0);
      playSystemOnline();
      setEnemyState((prev) => ({ type: "explode", trigger: prev.trigger + 1 }));
      onStepSuccess(result);
      return;
    }

    setFeedback({
      type: "err",
      msg: result.msg,
      tone: resolveErrorTone(result.tone, jsError, language),
    });
    setFailCount((f) => f + 1);
    playBreach();
    setEnemyState((prev) => ({ type: "fly", trigger: prev.trigger + 1 }));
    setShakeTrigger((p) => p + 1);
  }, [code, isJs, isSql, isReact, sqlConfig, language, onDeploy, onStepSuccess, validate]);

  const spectreTaunt =
    feedback.type === "err" ? getSpectreTaunt(failCount) : null;

  const editorTabLabel = isJs
    ? "script.js"
    : isSql
      ? "query.sql"
      : isReact
        ? "App.jsx"
        : "index.html";
  // Monaco n'a pas de mode "jsx" distinct : javascript colore correctement le JSX.
  const editorLanguage = isJs || isReact ? "javascript" : isSql ? "sql" : "html";

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
          language={editorLanguage}
        />
      </div>

      {/* Feedback status bar — doubles as the combat strip. */}
      <div
        key={shakeTrigger}
        className={`shrink-0 border-y border-nebula-border/60 bg-nebula-bg-panel/50 px-5 py-3.5 backdrop-blur-sm ${
          shakeTrigger > 0 && feedback.type === "err" ? "animate-screen-shake" : ""
        }`}
      >
        <div className="relative flex items-center gap-3">
          <CombatVisualizer
            outcome={enemyState.type}
            trigger={enemyState.trigger}
            theme={combatTheme}
          />
          {feedback.type === "idle" && (
            <>
              <div className="h-2.5 w-2.5 rounded-full bg-nebula-green shadow-[0_0_8px_rgba(0,255,136,0.6)]" />
              <span className="font-tech text-xs uppercase tracking-widest text-nebula-text-secondary">
                {"> "}
                {isJs
                  ? "Console"
                  : isSql
                    ? "Résultat"
                    : isReact
                      ? "Aperçu"
                      : "Aperçu en direct"}
              </span>
              <span className="font-body text-sm italic text-nebula-text-dim">
                — En attente du prochain déploiement<span className="terminal-cursor">_</span>
              </span>
            </>
          )}
          {feedback.type === "ok" && (
            <div className="animate-fb-in flex items-baseline gap-3">
              <strong className="font-tech text-sm tracking-widest text-nebula-green">
                {"> "}
                {getSuccessHeader()}
              </strong>
              <span className="font-body text-base text-nebula-green/90">
                {feedback.msg}
              </span>
            </div>
          )}
          {feedback.type === "err" && (
            <div className="animate-fb-in flex flex-col gap-1.5">
              <div className="flex items-baseline gap-3">
                <strong className="font-tech text-sm tracking-widest text-nebula-red">
                  {"> "}{getErrorHeader(feedback.tone)}
                </strong>
                <span className="font-body text-base text-nebula-text-secondary">
                  {feedback.msg}
                </span>
              </div>
              {spectreTaunt && (
                <div className="flex items-baseline gap-2 pl-1">
                  <span
                    className="font-tech text-xs tracking-widest text-nebula-spectre"
                    aria-hidden="true"
                  >
                    {CHARACTERS.spectre.glyph} {CHARACTERS.spectre.name.toUpperCase()}
                  </span>
                  <span className="font-body text-sm italic text-nebula-spectre/80">
                    {spectreTaunt}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom panel: HTML/CSS → iframe live preview ; JS → console ; SQL → table */}
      {isSql ? (
        <div
          className={`flex-1 min-h-0 overflow-auto bg-nebula-bg-darkest/80 px-5 py-4 ${
            mobilePanel === "editor" ? "hidden lg:block" : "block"
          }`}
        >
          <div className="mb-2 font-tech text-[10px] uppercase tracking-[0.3em] text-nebula-text-dim">
            {"> "}Résultat de la requête
          </div>
          {!sqlView ? (
            <p className="font-tech text-xs italic text-nebula-text-dim">
              Aucun résultat pour l&apos;instant. Appuie sur DÉPLOYER pour exécuter ta requête.
            </p>
          ) : sqlView.rows.length === 0 ? (
            <p className="font-tech text-xs italic text-nebula-text-dim">
              Requête exécutée — 0 ligne.
            </p>
          ) : (
            <table className="w-full border-collapse font-code text-sm text-nebula-text">
              <thead>
                <tr>
                  {sqlView.columns.map((col) => (
                    <th
                      key={col}
                      className="border border-nebula-border/50 bg-nebula-bg-panel/60 px-3 py-1.5 text-left font-tech text-[11px] uppercase tracking-wider text-nebula-cyan"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sqlView.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className="border border-nebula-border/40 px-3 py-1.5"
                      >
                        {cell === null ? (
                          <span className="italic text-nebula-text-dim">NULL</span>
                        ) : (
                          String(cell)
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : isJs ? (
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
      ) : isReact ? (
        <ReactPreview
          code={code}
          mount={step.previewMount}
          deployNonce={deployNonce}
          className={mobilePanel === "editor" ? "hidden lg:flex" : "flex"}
        />
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
