"use client";

import { useEffect, useRef } from "react";
import { getDocEntry } from "@/data/docs/html";
import { renderLessonMarkdown } from "@/lib/markdown";

interface DocPanelProps {
  entryId: string | null;
  onClose: () => void;
  onOpen: (id: string) => void;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function DocPanel({ entryId, onClose, onOpen }: DocPanelProps) {
  const entry = entryId ? getDocEntry(entryId) : undefined;
  const open = entry != null;

  const panelRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Déplace le focus dans le panneau à l'ouverture, et le restaure à la fermeture.
  useEffect(() => {
    if (!open) return;
    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    closeButtonRef.current?.focus();

    return () => {
      const previouslyFocused = previouslyFocusedRef.current;
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, [open, entryId]);

  // Piège le focus (Tab / Shift+Tab) à l'intérieur du panneau pendant qu'il est ouvert.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        if (active === first || !panel.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last || !panel.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      {/* Voile */}
      <div
        aria-hidden={!open}
        onClick={onClose}
        className={`fixed inset-0 z-[210] bg-black/50 transition-opacity duration-200 motion-reduce:transition-none ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      {/* Panneau : drawer bas sur mobile, latéral droit sur lg */}
      <aside
        ref={panelRef}
        data-testid="doc-panel"
        aria-hidden={!open}
        role="dialog"
        aria-modal="true"
        aria-label={entry?.title ?? "Fiche de référence"}
        className={`fixed z-[211] flex flex-col overflow-hidden border-nebula-border/70 bg-nebula-bg-darkest/95 backdrop-blur-md transition-transform duration-200 motion-reduce:transition-none
          inset-x-0 bottom-0 max-h-[85dvh] rounded-t-xl border-t
          lg:inset-y-0 lg:right-0 lg:left-auto lg:max-h-none lg:w-[410px] lg:rounded-none lg:border-l lg:border-t-0
          ${open ? "translate-y-0 lg:translate-x-0" : "translate-y-full lg:translate-y-0 lg:translate-x-full"}`}
      >
        {entry && (
          <>
            <header className="flex shrink-0 items-center justify-between border-b border-nebula-border/60 px-5 py-4">
              <span className="font-tech text-xs uppercase tracking-widest text-nebula-blue">
                📖 Référence
              </span>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                className="font-tech text-nebula-text-secondary transition-colors hover:text-nebula-cyan"
              >
                ✕
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              <h3 className="mb-2 font-tech text-xl tracking-wide text-nebula-cyan">
                {entry.title}
              </h3>
              <p className="mb-5 font-body text-sm italic leading-relaxed text-nebula-text-secondary">
                {entry.summary}
              </p>

              <div
                className="prose-nebula font-body text-base leading-relaxed text-nebula-text/90"
                onClick={(e) => {
                  const el = (e.target as HTMLElement).closest("[data-doc-id]");
                  const id = el?.getAttribute("data-doc-id");
                  if (id) onOpen(id);
                }}
                dangerouslySetInnerHTML={{
                  __html: renderLessonMarkdown(entry.body, {
                    resolveDocTerm: (id) => getDocEntry(id)?.term,
                  }),
                }}
              />

              {entry.syntax && (
                <pre className="mt-5 overflow-x-auto rounded-sm border border-nebula-border/70 bg-nebula-bg-editor px-4 py-3 font-code text-xs text-nebula-cyan">
                  {entry.syntax}
                </pre>
              )}

              {entry.examples?.map((ex, i) => (
                <div key={i} className="mt-5">
                  <pre className="overflow-x-auto rounded-sm border border-nebula-border/70 bg-nebula-bg-editor px-4 py-3 font-code text-xs text-nebula-text/90">
                    {ex.code}
                  </pre>
                  {ex.caption && (
                    <p className="mt-1.5 font-body text-xs text-nebula-text-secondary">
                      {ex.caption}
                    </p>
                  )}
                </div>
              ))}

              {entry.pitfalls && entry.pitfalls.length > 0 && (
                <div className="mt-6 rounded-sm border border-nebula-orange-dim/60 bg-nebula-orange-faint/20 p-4">
                  <div className="mb-2 font-tech text-xs uppercase tracking-widest text-nebula-orange">
                    ⚠ Pièges courants
                  </div>
                  <ul className="space-y-1.5">
                    {entry.pitfalls.map((p, i) => (
                      <li
                        key={i}
                        className="font-body text-sm text-nebula-text/85"
                      >
                        ◈ {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {entry.related && entry.related.length > 0 && (
                <div className="mt-6">
                  <div className="mb-2 font-tech text-xs uppercase tracking-widest text-nebula-text-secondary">
                    Voir aussi
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {entry.related.map((id) => {
                      const r = getDocEntry(id);
                      if (!r) return null;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => onOpen(id)}
                          className="rounded-sm border border-nebula-cyan/40 bg-nebula-cyan-faint/30 px-2 py-1 font-code text-xs text-nebula-cyan transition-colors hover:border-nebula-cyan"
                        >
                          📖 {r.term}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <footer className="shrink-0 border-t border-nebula-border/60 px-5 py-3">
              <p className="font-body text-[11px] leading-relaxed text-nebula-text-dim">
                Fiche de référence CodeForge — rédigée par l&apos;équipe.
                {entry.official && (
                  <>
                    {" "}
                    <a
                      href={entry.official.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-nebula-cyan underline hover:text-nebula-blue"
                    >
                      {entry.official.label} ↗
                    </a>
                  </>
                )}
              </p>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
