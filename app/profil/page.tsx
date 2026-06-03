"use client";

import Link from "next/link";
import { useState } from "react";

import DashboardNav from "../DashboardNav";
import { useUser } from "@/lib/use-user";
import { useSoundPreference } from "@/lib/use-sound";
import AvatarBadge from "@/components/avatar/AvatarBadge";
import { getRole, getSpecies, getUniformColor } from "@/lib/avatar";
import {
  getCompletedSteps,
  isChapterComplete,
  levelFromXp,
  rankFromXp,
} from "@/lib/user-store";
import { CSS_CHAPTERS_META, HTML_CHAPTERS_META, JS_CHAPTERS_META } from "@/lib/courses-meta";
import Sprite from "@/components/ui/Sprite";
import { BADGE_ICONS } from "@/lib/sprite-config";

interface BadgeDef {
  id: string;
  icon: string;
  label: string;
  description: string;
  /** Optional frame in /sprites/badges.png. Falls back to icon emoji. */
  badgeFrame?: number;
}

const ALL_BADGES: BadgeDef[] = [
  {
    id: "selene",
    icon: "🌕",
    label: "Ingénieur Séléné",
    description: "Premier protocole HTML complété",
  },
  {
    id: "relay",
    icon: "🛰",
    label: "Opérateur de Relais",
    description: "Maîtrise les liens HTML",
  },
  {
    id: "archivist",
    icon: "📸",
    label: "Archiviste Visuel",
    description: "Images et médias HTML",
  },
  {
    id: "logistician",
    icon: "📋",
    label: "Logisticien",
    description: "Listes et tableaux HTML",
  },
  {
    id: "operator",
    icon: "🎛",
    label: "Opérateur de Console",
    description: "Formulaires HTML",
  },
  {
    id: "css-initiate",
    icon: "🎨",
    label: "Initiateur Graphique",
    description: "Premier protocole CSS complété",
  },
  {
    id: "css-palette",
    icon: "🌈",
    label: "Opérateur Palette",
    description: "Sélecteurs & formats de couleur",
  },
  {
    id: "css-modular",
    icon: "📦",
    label: "Ingénieur Modulaire",
    description: "Maîtrise du box model",
  },
  {
    id: "css-pilot",
    icon: "🛸",
    label: "Pilote de Formation",
    description: "Maîtrise de Flexbox",
  },
  {
    id: "css-cartographer",
    icon: "🗺",
    label: "Cartographe",
    description: "Maîtrise de CSS Grid",
  },
  {
    id: "js-radio",
    icon: "📟",
    label: "Opérateur Radio",
    description: "Premier signal JavaScript",
  },
  {
    id: "js-analyst",
    icon: "🧮",
    label: "Analyste Tactique",
    description: "Conditions et opérations",
  },
  {
    id: "js-engineer",
    icon: "⚙",
    label: "Ingénieur Fonctionnel",
    description: "Maîtrise des fonctions",
  },
  {
    id: "js-quartermaster",
    icon: "📚",
    label: "Gestionnaire d'Inventaire",
    description: "Tableaux et boucles",
  },
  {
    id: "js-architect",
    icon: "🛠",
    label: "Architecte Logiciel",
    description: "Objets et méthodes",
  },
  // --- HTML 6-8 ---
  {
    id: "html-architect",
    icon: "🏗",
    label: "Architecte Sémantique",
    description: "Sémantique HTML5 et accessibilité",
  },
  {
    id: "html-signals",
    icon: "📡",
    label: "Ingénieur de Signaux",
    description: "Métadonnées et SEO",
  },
  {
    id: "html-media",
    icon: "🎥",
    label: "Opérateur Multimédia",
    description: "Vidéo, audio et images optimisées",
  },
  // --- CSS 6-10 ---
  {
    id: "css-anchor",
    icon: "🧲",
    label: "Verrouilleur Orbital",
    description: "Positionnement relative/absolute/fixed/sticky",
  },
  {
    id: "css-invoker",
    icon: "🪄",
    label: "Invocateur de Styles",
    description: "Pseudo-classes et pseudo-éléments",
  },
  {
    id: "css-adaptive",
    icon: "📱",
    label: "Ingénieur Adaptatif",
    description: "Responsive design et media queries",
  },
  {
    id: "css-animator",
    icon: "💫",
    label: "Animateur de Pixels",
    description: "Transitions et animations",
  },
  {
    id: "css-system",
    icon: "🧩",
    label: "Architecte de Design",
    description: "Variables CSS et theming",
  },
  // --- JS 6-10 ---
  {
    id: "js-data",
    icon: "🧮",
    label: "Analyste de Données",
    description: "Map, filter, reduce, find",
  },
  {
    id: "js-dom",
    icon: "🧰",
    label: "Ingénieur d'Interface",
    description: "DOM manipulation",
  },
  {
    id: "js-events",
    icon: "⚡",
    label: "Opérateur Réactif",
    description: "Événements et listeners",
  },
  {
    id: "js-async",
    icon: "🌐",
    label: "Opérateur Asynchrone",
    description: "Promises et async/await",
  },
  {
    id: "js-storage",
    icon: "💾",
    label: "Gardien des Données",
    description: "localStorage et persistance",
  },
];

const COURSES_LIST = [
  { slug: "html", title: "HTML", available: true },
  { slug: "css", title: "CSS", available: true },
  { slug: "javascript", title: "JavaScript", available: true },
];

export default function ProfilPage() {
  const { state, hydrated, renameUser, reset } = useUser();
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const username = state.username || "Cadet";
  const totalXp = state.totalXp;
  const level = levelFromXp(totalXp);
  const rank = rankFromXp(totalXp);
  const streak = state.streak || 1;
  const joined = state.joinedAt || "—";

  const computeProgress = (
    course: string,
    chapters: typeof HTML_CHAPTERS_META
  ) => {
    const totalSteps = chapters.reduce((s, c) => s + c.totalSteps, 0);
    const done = chapters.reduce(
      (s, c) => s + getCompletedSteps(state, course, c.slug).length,
      0
    );
    return totalSteps === 0 ? 0 : Math.round((done / totalSteps) * 100);
  };

  const htmlProgress = computeProgress("html", HTML_CHAPTERS_META);
  const cssProgress = computeProgress("css", CSS_CHAPTERS_META);
  const jsProgress = computeProgress("javascript", JS_CHAPTERS_META);

  const startEditing = () => {
    setEditValue(username);
    setEditError(null);
    setEditing(true);
  };

  const saveEdit = async () => {
    const trimmed = editValue.trim();
    if (trimmed.length < 2 || trimmed.length > 16) {
      setEditError("2 à 16 caractères");
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setEditError("Lettres, chiffres, _ et - uniquement");
      return;
    }
    setSaving(true);
    try {
      await renameUser(trimmed);
      setEditing(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Réinitialiser le profil ? Toute la progression sera perdue.")) {
      return;
    }
    setResetting(true);
    setResetError(null);
    try {
      await reset();
    } catch (err) {
      setResetError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setResetting(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="relative h-full">
        <div className="fixed inset-0 z-0 pointer-events-none bg-nebula-bg" />
        <div className="fixed inset-0 z-0 pointer-events-none bg-[rgba(3,6,13,0.5)]" />
        <DashboardNav userName="Cadet" />
        <div className="relative z-10 mx-auto max-w-5xl px-6 py-20 text-center font-tech text-sm uppercase tracking-widest text-nebula-text-dim">
          {"> "}Connexion à la station<span className="terminal-cursor">_</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-y-auto">
      <div className="fixed inset-0 z-0 pointer-events-none bg-nebula-bg" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-nebula-stars opacity-25" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-[rgba(3,6,13,0.5)]" />

      <DashboardNav userName={username} />

      <main className="relative z-10 mx-auto max-w-5xl px-4 py-6 lg:px-6 lg:py-10">
        <Link
          href="/dashboard"
          className="mb-6 inline-block font-tech text-sm uppercase tracking-widest text-nebula-text-secondary transition-colors hover:text-nebula-cyan"
        >
          ← Retour au pont
        </Link>

        {/* Header card */}
        <section className="mb-10 rounded-sm border border-nebula-cyan/40 bg-nebula-bg-panel/85 p-8 backdrop-blur-md shadow-[0_0_40px_rgba(0,240,255,0.08)] animate-fade-down">
          <div className="flex flex-wrap items-center gap-8">
            <div className="relative shrink-0">
              {state.species ? (
                <AvatarBadge
                  species={state.species}
                  uniformColor={state.uniformColor}
                  size={112}
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-nebula-cyan bg-nebula-bg-darkest font-tech text-5xl font-bold text-nebula-cyan shadow-[0_0_30px_rgba(0,240,255,0.3)]">
                  {username.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 rounded-sm border border-nebula-orange bg-nebula-bg-darkest px-2.5 py-1 font-tech text-xs uppercase tracking-widest text-nebula-orange shadow-[0_0_10px_rgba(255,107,44,0.3)]">
                LV {level}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-1 font-tech text-xs uppercase tracking-[0.22em] text-nebula-text-dim">
                Identité
              </div>

              {editing ? (
                <div className="mb-3">
                  <div className="mb-2 flex items-center gap-2 rounded-sm border border-nebula-cyan/50 bg-nebula-bg-darkest/60 px-3 py-2 max-w-md focus-within:border-nebula-cyan">
                    <span className="font-tech text-base text-nebula-cyan">{">"}</span>
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => {
                        setEditValue(e.target.value);
                        if (editError) setEditError(null);
                      }}
                      autoFocus
                      maxLength={16}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit();
                        if (e.key === "Escape") setEditing(false);
                      }}
                      className="flex-1 bg-transparent font-tech text-2xl text-nebula-cyan outline-none"
                    />
                  </div>
                  {editError && (
                    <p className="mb-2 font-tech text-xs text-nebula-red">
                      {"> "}ERREUR : {editError}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={saveEdit}
                      disabled={saving}
                      className="rounded-sm bg-nebula-cyan px-4 py-1.5 font-tech text-xs font-bold uppercase tracking-widest text-nebula-bg-darkest shadow-[0_3px_0_var(--cyan-dim)] enabled:hover:translate-y-px enabled:hover:shadow-[0_2px_0_var(--cyan-dim)] enabled:active:translate-y-[3px] enabled:active:shadow-none disabled:opacity-50"
                    >
                      {saving ? "..." : "Enregistrer"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      disabled={saving}
                      className="rounded-sm border border-nebula-border bg-transparent px-4 py-1.5 font-tech text-xs uppercase tracking-widest text-nebula-text-secondary enabled:hover:border-nebula-cyan enabled:hover:text-nebula-cyan disabled:opacity-50"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <h1 className="mb-2 break-all font-tech text-2xl tracking-wider text-nebula-cyan [text-shadow:0_0_18px_rgba(0,240,255,0.3)] sm:text-3xl lg:text-4xl">
                  {"> @"}{username}<span className="terminal-cursor">_</span>
                </h1>
              )}

              <p className="font-body text-base text-nebula-text-secondary">
                Cadet de la flotte Nebula · Inscription {joined}
              </p>

              {!editing && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={startEditing}
                    className="rounded-sm border border-nebula-cyan-dim bg-transparent px-4 py-2 font-tech text-xs uppercase tracking-widest text-nebula-cyan transition-all hover:border-nebula-cyan hover:bg-nebula-cyan-faint"
                  >
                    Modifier le pseudo
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={resetting}
                    className="rounded-sm border border-nebula-red/40 bg-transparent px-4 py-2 font-tech text-xs uppercase tracking-widest text-nebula-red/80 transition-all enabled:hover:border-nebula-red enabled:hover:bg-nebula-red/10 disabled:opacity-50"
                  >
                    {resetting ? "..." : "Réinitialiser"}
                  </button>
                </div>
              )}
              {resetError && (
                <div className="mt-3 rounded-sm border border-nebula-red/70 bg-nebula-red/15 px-3 py-2 font-tech text-[11px] uppercase tracking-wider text-nebula-red">
                  Reinitialisation echouee : {resetError}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-10 animate-fade-up">
          <h2 className="mb-5 font-tech text-xl uppercase tracking-widest text-nebula-cyan">
            {"> "}Statistiques
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <BigStat label="Total XP" value={totalXp} accent="cyan" />
            <BigStat label="Rang" value={rank} accent="orange" />
            <BigStat
              label="Badges"
              value={`${state.badges.length}/${ALL_BADGES.length}`}
              accent="blue"
            />
            <BigStat label="Streak" value={`${streak}j`} accent="green" />
          </div>
        </section>

        {/* Courses progress */}
        <section className="mb-10 animate-fade-up">
          <h2 className="mb-5 font-tech text-xl uppercase tracking-widest text-nebula-cyan">
            {"> "}Progression des cursus
          </h2>
          <div className="space-y-3">
            {COURSES_LIST.map((course) => {
              const isLocked = !course.available;
              let progress = 0;
              let chapters: typeof HTML_CHAPTERS_META = [];
              if (course.slug === "html") {
                progress = htmlProgress;
                chapters = HTML_CHAPTERS_META;
              } else if (course.slug === "css") {
                progress = cssProgress;
                chapters = CSS_CHAPTERS_META;
              } else if (course.slug === "javascript") {
                progress = jsProgress;
                chapters = JS_CHAPTERS_META;
              }

              return (
                <div
                  key={course.slug}
                  className={`rounded-sm border p-5 backdrop-blur-md ${
                    isLocked
                      ? "border-nebula-border/60 bg-nebula-bg-panel/40"
                      : "border-nebula-cyan/30 bg-nebula-bg-panel/75"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h3
                      className={`font-tech text-xl tracking-wider ${
                        isLocked ? "text-nebula-text-dim" : "text-nebula-cyan"
                      }`}
                    >
                      {course.title}
                    </h3>
                    <span className="font-tech text-xs uppercase tracking-widest text-nebula-text-secondary">
                      {isLocked ? "Verrouillé" : `${progress}%`}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full border border-nebula-border bg-nebula-bg-editor/80">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isLocked
                          ? "bg-nebula-border-glow"
                          : "bg-gradient-to-r from-nebula-cyan to-nebula-green shadow-[0_0_8px_rgba(0,240,255,0.3)]"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  {!isLocked && chapters.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {chapters.map((ch, i) => {
                        const done = isChapterComplete(
                          state,
                          course.slug,
                          ch.slug,
                          ch.totalSteps
                        );
                        const inProgress =
                          getCompletedSteps(state, course.slug, ch.slug).length > 0;
                        return (
                          <span
                            key={ch.slug}
                            className={`rounded-sm border px-2 py-0.5 font-tech text-[10px] uppercase tracking-widest ${
                              done
                                ? "border-nebula-green-dim bg-nebula-green/10 text-nebula-green"
                                : inProgress
                                  ? "border-nebula-cyan-dim bg-nebula-cyan-faint text-nebula-cyan"
                                  : "border-nebula-border bg-nebula-bg-darkest/40 text-nebula-text-dim"
                            }`}
                          >
                            CH.{i + 1} {done ? "✓" : inProgress ? "…" : ""}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Badges */}
        <section className="mb-10 animate-fade-up">
          <h2 className="mb-5 font-tech text-xl uppercase tracking-widest text-nebula-cyan">
            {"> "}Badges
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {ALL_BADGES.map((badge) => {
              const unlocked = state.badges.includes(badge.id);
              return (
                <article
                  key={badge.id}
                  className={`rounded-sm border p-5 text-center backdrop-blur-md transition-all ${
                    unlocked
                      ? "border-nebula-orange/40 bg-nebula-bg-panel/75 shadow-[0_0_20px_rgba(255,107,44,0.08)]"
                      : "border-nebula-border/60 bg-nebula-bg-panel/30"
                  }`}
                >
                  <div
                    className={`mb-3 flex items-center justify-center text-5xl ${
                      unlocked ? "" : "opacity-25 grayscale"
                    }`}
                  >
                    {badge.badgeFrame !== undefined ? (
                      <Sprite
                        sheet={BADGE_ICONS}
                        frame={badge.badgeFrame}
                        displaySize={64}
                        title={badge.label}
                      />
                    ) : (
                      badge.icon
                    )}
                  </div>
                  <div
                    className={`mb-1.5 font-tech text-sm uppercase tracking-widest ${
                      unlocked ? "text-nebula-orange" : "text-nebula-text-dim"
                    }`}
                  >
                    {badge.label}
                  </div>
                  <p className="font-body text-xs text-nebula-text-secondary">
                    {unlocked ? badge.description : "🔒 Non débloqué"}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* Personnalisation */}
        <section className="mb-10 animate-fade-up">
          <h2 className="mb-5 font-tech text-xl uppercase tracking-widest text-nebula-cyan">
            {"> "}Personnalisation
          </h2>
          <div className="rounded-sm border border-nebula-border/60 bg-nebula-bg-panel/70 p-5 backdrop-blur-md">
            <div className="flex flex-wrap items-center gap-4">
              <AvatarBadge
                species={state.species}
                uniformColor={state.uniformColor}
                size={80}
              />
              <div className="min-w-0 flex-1">
                <div className="font-tech text-sm uppercase tracking-widest text-nebula-text">
                  Identite visuelle
                </div>
                <p className="mt-1 font-body text-xs text-nebula-text-dim">
                  {state.species ? (
                    <>
                      {getSpecies(state.species)?.label ?? state.species}
                      <span className="mx-2 text-nebula-text-dim/60">·</span>
                      Uniforme{" "}
                      {getUniformColor(state.uniformColor)?.label ?? state.uniformColor}
                      <span className="mx-2 text-nebula-text-dim/60">·</span>
                      {getRole(state.role)?.label ?? state.role}
                    </>
                  ) : (
                    <>Pas encore configure — clique pour personnaliser ton avatar.</>
                  )}
                </p>
              </div>
              <Link
                href="/avatar?from=/profil"
                className="rounded-sm border border-nebula-cyan-dim bg-transparent px-4 py-2 font-tech text-xs uppercase tracking-widest text-nebula-cyan transition-all hover:border-nebula-cyan hover:bg-nebula-cyan-faint"
              >
                Modifier
              </Link>
            </div>
          </div>
        </section>

        {/* Settings */}
        <section className="mb-10 animate-fade-up">
          <h2 className="mb-5 font-tech text-xl uppercase tracking-widest text-nebula-cyan">
            {"> "}Préférences
          </h2>
          <div className="rounded-sm border border-nebula-border/60 bg-nebula-bg-panel/70 p-5 backdrop-blur-md">
            <SoundToggleRow />
          </div>
        </section>
      </main>
    </div>
  );
}

function SoundToggleRow() {
  const { enabled, toggle } = useSoundPreference();
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="font-tech text-sm uppercase tracking-widest text-nebula-text">
          Effets sonores
        </div>
        <p className="mt-1 font-body text-xs text-nebula-text-dim">
          Bips de déploiement, jingle de validation, alarme d&apos;erreur, fanfare de fin de chapitre.
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={toggle}
        className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors ${
          enabled
            ? "border-nebula-cyan bg-nebula-cyan/30"
            : "border-nebula-border bg-nebula-bg-darkest/60"
        }`}
      >
        <span className="sr-only">{enabled ? "Couper le son" : "Activer le son"}</span>
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full transition-all ${
            enabled
              ? "left-[calc(100%-1.4rem)] bg-nebula-cyan shadow-[0_0_8px_rgba(0,240,255,0.6)]"
              : "left-0.5 bg-nebula-text-dim"
          }`}
        />
      </button>
    </div>
  );
}

const ACCENTS: Record<string, { border: string; text: string }> = {
  cyan: { border: "border-nebula-cyan/40", text: "text-nebula-cyan" },
  orange: { border: "border-nebula-orange/40", text: "text-nebula-orange" },
  blue: { border: "border-nebula-blue/40", text: "text-nebula-blue" },
  green: { border: "border-nebula-green-dim", text: "text-nebula-green" },
};

function BigStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent: keyof typeof ACCENTS;
}) {
  const a = ACCENTS[accent];
  return (
    <div
      className={`rounded-sm border ${a.border} bg-nebula-bg-panel/75 p-5 text-center backdrop-blur-md`}
    >
      <div className={`mb-1 font-tech text-3xl font-bold ${a.text}`}>
        {value}
      </div>
      <div className="font-tech text-xs uppercase tracking-widest text-nebula-text-dim">
        {label}
      </div>
    </div>
  );
}
