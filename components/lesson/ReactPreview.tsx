"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { transformJsx } from "@/lib/sandbox/jsx-transform";
import { detectInfiniteLoop, infiniteLoopMessage } from "@/lib/sandbox/loop-guard";
import { guardLoops } from "@/lib/sandbox/loop-protect";
import {
  PREVIEW_MOUNT_NAME_RE,
  parsePreviewMessage,
  type PreviewErrorKind,
} from "@/lib/sandbox/react-preview";
import { SANDBOX_PATH, sandboxOriginFor } from "@/lib/sandbox/sandbox-origin";

/** Delay after which the iframe is considered never going to respond. */
const READY_TIMEOUT_MS = 5000;

interface ReactPreviewProps {
  /** Current editor code, untransformed. */
  code: string;
  /** Name of the component to mount. Missing = chapter without a preview. */
  mount?: string;
  /** Incremented by the parent on every deploy; 0 until anything is deployed. */
  deployNonce: number;
  className?: string;
}

type PreviewState =
  | { phase: "attente" }
  | { phase: "indisponible" }
  | { phase: "rendu" }
  | { phase: "erreur"; kind: PreviewErrorKind; message: string };

/**
 * Live preview of the learner's component.
 *
 * No watchdog on the parent side: in Chromium, the iframe can share the
 * page's main thread, so a synchronous infinite loop freezes the whole
 * tab and no parent timer ever runs. Since no recovery is possible
 * once the code is sent, suspicious code is not sent (see
 * `lib/sandbox/loop-guard.ts`).
 */
export default function ReactPreview({
  code,
  mount,
  deployNonce,
  className = "",
}: ReactPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [previewState, setPreviewState] = useState<PreviewState>({ phase: "attente" });

  // Iframe readiness lives in a ref, not state: as a dependency of the
  // deploy effect, it would mount the component twice when
  // a deploy comes before the handshake.
  const readyRef = useRef(false);

  // Last transformed code, kept queued until the iframe has sent
  // `ready`: a postMessage sent too early is silently lost.
  const pendingRef = useRef<{ js: string; mount: string } | null>(null);
  const fileRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopQueueWait = useCallback(() => {
    if (fileRef.current !== null) {
      clearTimeout(fileRef.current);
      fileRef.current = null;
    }
  }, []);

  /**
   * Watches a queued deploy: if the iframe's script never starts,
   * the learner would be left facing a blank frame (the initial safety net
   * only covers the starting state).
   */
  const startQueueWait = useCallback(() => {
    stopQueueWait();
    fileRef.current = setTimeout(() => {
      fileRef.current = null;
      if (readyRef.current) return;
      pendingRef.current = null;
      setPreviewState({ phase: "indisponible" });
    }, READY_TIMEOUT_MS);
  }, [stopQueueWait]);

  /** Posts to the iframe. Returns false if the frame is unreachable. */
  const sendPayload = useCallback((payload: { js: string; mount: string }) => {
    const targetWindow = iframeRef.current?.contentWindow;
    if (!targetWindow) return false;
    // Opaque-origin iframe: "*" is the only possible target. The payload
    // (the learner's code) is not a secret, and the iframe checks
    // `event.source === parent`.
    targetWindow.postMessage({ type: "preview:render", ...payload }, "*");
    return true;
  }, []);

  // If sending fails, the payload goes back into the queue instead of being lost.
  const sendOrQueue = useCallback(
    (payload: { js: string; mount: string }) => {
      if (sendPayload(payload)) return;
      pendingRef.current = payload;
      startQueueWait();
    },
    [sendPayload, startQueueWait]
  );

  // Listen for messages from the iframe.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const msg = parsePreviewMessage(event, iframeRef.current?.contentWindow ?? null);
      if (!msg) return;

      if (msg.type === "ready") {
        readyRef.current = true;
        stopQueueWait();
        const queued = pendingRef.current;
        if (queued) {
          pendingRef.current = null;
          sendOrQueue(queued);
        }
        return;
      }

      stopQueueWait();
      setPreviewState({ phase: "erreur", kind: msg.kind, message: msg.message });
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [sendOrQueue, stopQueueWait]);

  // Initial safety net: if `ready` never arrives while nothing has been
  // deployed yet, the preview declares itself unavailable and the lesson goes on.
  useEffect(() => {
    const t = setTimeout(() => {
      if (!readyRef.current) {
        setPreviewState((e) => (e.phase === "attente" ? { phase: "indisponible" } : e));
      }
    }, READY_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, []);

  // No timer may outlive the component's unmount.
  useEffect(() => stopQueueWait, [stopQueueWait]);

  // Current code read at deploy time, via a ref: putting `code` in the deploy
  // effect's deps would remount the preview on every keystroke.
  const codeRef = useRef(code);
  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  // Transform and send on every deploy.
  useEffect(() => {
    if (deployNonce === 0 || !mount) return;

    if (!PREVIEW_MOUNT_NAME_RE.test(mount)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reacting to invalid course data, not a deferred resync
      setPreviewState({
        phase: "erreur",
        kind: "mount",
        message: `Nom de composant invalide dans les données du cours : « ${mount} ».`,
      });
      return;
    }

    let cancelled = false;
    void (async () => {
      const source = codeRef.current;

      // Safeguard before any transformation: an infinite loop that has
      // already been sent can no longer be recovered from.
      const infiniteLoop = detectInfiniteLoop(source);
      if (infiniteLoop) {
        setPreviewState({ phase: "erreur", kind: "boucle", message: infiniteLoopMessage(infiniteLoop) });
        return;
      }

      const r = await transformJsx(source);
      if (cancelled) return;

      if (!r.ok) {
        setPreviewState({ phase: "erreur", kind: "transform", message: r.error });
        return;
      }

      setPreviewState({ phase: "rendu" });
      // Loops that the literal filter above lets through are
      // interrupted at runtime instead of freezing the tab (audit EXE-02).
      const payload = { js: guardLoops(r.js), mount };
      if (readyRef.current) {
        sendOrQueue(payload);
      } else {
        pendingRef.current = payload;
        startQueueWait();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [deployNonce, mount, sendOrQueue, startQueueWait]);

  // Sandbox document on its dedicated origin (audit EXE-03), loaded via
  // `src`: a `srcDoc` would inherit the site's CSP. Resolved after mount,
  // because `sandboxOriginFor` needs `window.location.origin`; computing it
  // during render would cause a hydration mismatch on `src`.
  const [sandboxSrc, setSandboxSrc] = useState<string | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off read of the origin on mount
    setSandboxSrc(sandboxOriginFor(window.location.origin) + SANDBOX_PATH);
  }, []);

  // Derived during render rather than set by an effect: an effect would flash
  // the « Déploie… » (deploy) prompt for one frame on a chapter that never has
  // a preview, and would stay stuck if `mount` became defined later.
  const noPreview = !mount;
  const noIframe = noPreview || previewState.phase === "indisponible";

  const errorTitle =
    previewState.phase === "erreur"
      ? previewState.kind === "transform"
        ? "Syntaxe refusée"
        : previewState.kind === "mount"
          ? "Composant introuvable"
          : previewState.kind === "boucle"
            ? "Boucle sans fin"
            : "Erreur à l'exécution"
      : "";

  return (
    <div className={`flex min-h-0 flex-1 flex-col ${className}`}>
      <div className="shrink-0 border-b border-nebula-border/40 px-5 py-2 font-tech text-[10px] uppercase tracking-[0.3em] text-nebula-text-dim">
        {"> "}Aperçu du composant
      </div>

      {previewState.phase === "erreur" && (
        <div className="shrink-0 border-b border-nebula-red/40 bg-nebula-red/10 px-5 py-3">
          <p className="mb-1 font-tech text-[10px] uppercase tracking-widest text-nebula-red">
            {errorTitle}
          </p>
          <p className="font-code text-xs leading-relaxed text-nebula-red/90">{previewState.message}</p>
        </div>
      )}

      {noPreview && (
        <p className="px-5 py-4 font-body text-sm leading-relaxed text-nebula-text-dim">
          Ce chapitre n&apos;a pas d&apos;aperçu : il enseigne la navigation, qui demande un
          routeur autour de tes composants. Ton code reste analysé et validable normalement.
        </p>
      )}

      {!noPreview && previewState.phase === "indisponible" && (
        // The iframe is unmounted here, but the state is not locked: a
        // later deploy remounts it, it sends a new handshake
        // and the preview starts again.
        <p className="px-5 py-4 font-body text-sm text-nebula-text-dim">
          Aperçu indisponible. Ton code est toujours analysé et validable.
        </p>
      )}

      {!noIframe && (
        <>
          {deployNonce === 0 && (
            <p className="px-5 py-4 font-body text-sm text-nebula-text-dim">
              Déploie pour voir ton composant s&apos;exécuter.
            </p>
          )}
          {sandboxSrc !== null && (
            <iframe
              ref={iframeRef}
              src={sandboxSrc}
              className={`min-h-0 flex-1 border-none bg-white ${
                deployNonce === 0 ? "hidden" : "block"
              }`}
              sandbox="allow-scripts"
              title="Aperçu du composant React"
            />
          )}
        </>
      )}
    </div>
  );
}
