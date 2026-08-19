"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import AvatarBadge from "@/components/avatar/AvatarBadge";
import UnlockShelf, { EmblemShelf } from "@/components/avatar/UnlockShelf";
import {
  ROLES,
  SPECIES,
  BASE_UNIFORM_COLORS,
  type RoleId,
  type SpeciesId,
  type UniformColorId,
} from "@/lib/avatar";
import { clearTrialState, readTrialState, trialCompletedSteps } from "@/lib/trial-user";
import { useUser } from "@/lib/use-user";
import { getCompletionStats } from "@/lib/courses-meta";
import { COURSES_CATALOG } from "@/lib/courses-catalog";
import type { UnlockContext } from "@/lib/unlocks";

type Mode = "create" | "edit";

export default function AvatarPage() {
  return (
    <Suspense fallback={null}>
      <AvatarPageInner />
    </Suspense>
  );
}

function AvatarPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, hydrated, setAvatar, setCosmetics } = useUser();

  const mode: Mode = state.species ? "edit" : "create";
  const returnTo = searchParams.get("from") || "/dashboard";

  const [species, setSpecies] = useState<SpeciesId>(
    (state.species as SpeciesId) || "humain"
  );
  const [uniformColor, setUniformColor] = useState<UniformColorId>(
    (state.uniformColor as UniformColorId) || "cyan"
  );
  const [role, setRole] = useState<RoleId>((state.role as RoleId) || "pilote");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cosmeticError, setCosmeticError] = useState<string | null>(null);

  // Seed the local form state from the server snapshot once it hydrates (and
  // again if the server values change). Done during render — React's supported
  // pattern for adjusting state to a changing source — rather than in an effect.
  const seedKey = hydrated
    ? `${state.species ?? ""}|${state.uniformColor ?? ""}|${state.role ?? ""}`
    : null;
  const [seededFrom, setSeededFrom] = useState<string | null>(null);
  if (seedKey !== null && seedKey !== seededFrom) {
    setSeededFrom(seedKey);
    if (state.species) setSpecies(state.species as SpeciesId);
    if (state.uniformColor) setUniformColor(state.uniformColor as UniformColorId);
    if (state.role) setRole(state.role as RoleId);
  }

  // Importe la progression accumulée en mode essai puis la purge du storage
  // local. Best-effort : un échec ne doit jamais bloquer l'onboarding, la
  // perte maximale est la progression d'un seul chapitre d'essai.
  useEffect(() => {
    const trialState = readTrialState();
    if (trialState.completedSteps.length === 0) return;

    void (async () => {
      try {
        const res = await fetch("/api/me/trial-import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ steps: trialCompletedSteps(trialState) }),
        });
        if (res.ok) {
          clearTrialState();
        } else {
          // Message stable et greppable : signal le seul endroit où l'échec
          // de l'import d'essai est visible (le serveur ne log que le succès).
          console.warn("trial_import_failed", { status: res.status });
        }
      } catch (err) {
        // Idem en cas de coupure réseau : l'onboarding continue, mais l'échec
        // ne doit plus disparaître silencieusement.
        console.warn("trial_import_failed", { error: err });
      }
    })();
  }, []);

  // Statistiques de complétion, pour nourrir `evaluateUnlocks` — même motif
  // que app/profil/page.tsx et app/dashboard/page.tsx (getCompletionStats),
  // calculé une seule fois plutôt que dupliqué ici.
  const completionStats = useMemo(
    () => getCompletionStats(state, COURSES_CATALOG.map((c) => c.slug)),
    [state]
  );
  const unlockCtx: UnlockContext = {
    streak: state.liaison.streak,
    questsCompleted: state.questsCompleted,
    totalXp: state.totalXp,
    badges: state.badges,
    coursesComplete: completionStats.coursesComplete,
    chaptersComplete: completionStats.chaptersComplete,
    // La possession, sans laquelle l'armurerie reverrouillerait un objet
    // obtenu dès que la condition qui l'a produit redevient fausse (les
    // paliers de liaison retombent à la rupture).
    owned: state.unlocks,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      // `uniformColor` peut porter une couleur méritée (choisie depuis
      // l'Armurerie ci-dessous, jamais depuis ce sélecteur qui n'offre que les
      // couleurs de base) : `setAvatar` sait la reconnaître et vérifie que le
      // cadet la possède réellement — un seul appel, aucune valeur de
      // remplissage, aucune fenêtre où la couleur gagnée pourrait se perdre.
      await setAvatar({ species, uniformColor, role });
      router.push(returnTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sauvegarde impossible");
      setSaving(false);
    }
  };

  const handleCosmeticSelect = async (
    key: "frame" | "title" | "cardBg" | "uniform" | "emblem",
    id: string
  ) => {
    setCosmeticError(null);
    try {
      await setCosmetics({ [key]: id });
    } catch (err) {
      setCosmeticError(err instanceof Error ? err.message : "Sauvegarde impossible");
    }
  };

  return (
    <div className="relative min-h-dvh overflow-y-auto">
      <div className="fixed inset-0 z-0 pointer-events-none bg-nebula-bg" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-nebula-stars opacity-25" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-[rgba(3,6,13,0.5)]" />

      <main className="relative z-10 mx-auto max-w-5xl px-4 py-8 lg:px-6 lg:py-12">
        <header className="mb-8 animate-fade-down text-center">
          <div className="font-tech text-[11px] uppercase tracking-[0.4em] text-nebula-blue">
            ◈ {mode === "create" ? "ENREGISTREMENT D'IDENTITE" : "PERSONNALISATION"}
          </div>
          <h1 className="mt-2 font-tech text-3xl tracking-[0.15em] text-nebula-cyan [text-shadow:0_0_22px_rgba(0,240,255,0.35)] sm:text-4xl">
            {mode === "create" ? "CREE TON CADET" : "TON CADET"}
          </h1>
          <p className="mt-3 mx-auto max-w-xl font-body text-sm text-nebula-text-secondary">
            {mode === "create"
              ? "Avant de prendre les commandes, choisis ton identite. L'apparence est purement cosmetique ; ton role oriente les cursus recommandes. Tout reste modifiable depuis ton profil."
              : "Modifie ton apparence. Les changements seront visibles partout, immediatement."}
          </p>
        </header>

        {/* Preview */}
        <div className="mb-10 flex flex-col items-center gap-3 animate-fade-up">
          <AvatarBadge species={species} uniformColor={uniformColor} size={128} />
          <div className="text-center font-tech text-xs uppercase tracking-[0.2em] text-nebula-text-secondary">
            <span className="text-nebula-cyan">{state.username || "@cadet"}</span>
            <span className="mx-2 text-nebula-text-dim">·</span>
            <span>{ROLES.find((r) => r.id === role)?.label ?? role}</span>
            <span className="mx-2 text-nebula-text-dim">·</span>
            <span>{SPECIES.find((s) => s.id === species)?.label ?? species}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10 animate-fade-up">
          {/* Species */}
          <Section
            label="Origine"
            description="D'ou viens-tu ? Choisis ton espece d'origine."
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {SPECIES.map((sp) => (
                <Choice
                  key={sp.id}
                  selected={species === sp.id}
                  onClick={() => setSpecies(sp.id)}
                  emoji={sp.emoji}
                  image={sp.image}
                  label={sp.label}
                  description={sp.description}
                />
              ))}
            </div>
          </Section>

          {/* Uniform color */}
          <Section
            label="Couleur d'uniforme"
            description="Affichee comme accent autour de ton avatar."
          >
            <div className="flex flex-wrap gap-3">
              {BASE_UNIFORM_COLORS.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setUniformColor(c.id)}
                  className={`group flex items-center gap-3 rounded-sm border px-4 py-2.5 transition-all ${
                    uniformColor === c.id
                      ? "border-nebula-cyan bg-nebula-cyan-faint/30"
                      : "border-nebula-border bg-nebula-bg-panel/40 hover:border-nebula-cyan-dim"
                  }`}
                  aria-pressed={uniformColor === c.id}
                >
                  <span
                    className="inline-block h-5 w-5 rounded-full"
                    style={{
                      background: c.hex,
                      boxShadow: `0 0 12px ${c.glow}`,
                    }}
                  />
                  <span className="font-tech text-xs uppercase tracking-widest text-nebula-text">
                    {c.label}
                  </span>
                </button>
              ))}
            </div>
          </Section>

          {/* Role */}
          <Section
            label="Role prefere"
            description="Oriente les cursus recommandes pour ton profil sur la page Cursus."
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {ROLES.map((r) => (
                <Choice
                  key={r.id}
                  selected={role === r.id}
                  onClick={() => setRole(r.id)}
                  emoji={r.emoji}
                  image={r.image}
                  label={r.label}
                  description={r.description}
                />
              ))}
            </div>
          </Section>

          {/* Armurerie */}
          <Section
            label="Armurerie"
            description="Les objets gagnés en jouant. Les verrouillés restent visibles, avec leur condition — chaque sélection s'enregistre aussitôt."
          >
            <UnlockShelf
              axis="frame"
              ctx={unlockCtx}
              selected={state.frame}
              onSelect={(id) => handleCosmeticSelect("frame", id)}
            />
            <UnlockShelf
              axis="title"
              ctx={unlockCtx}
              selected={state.title}
              onSelect={(id) => handleCosmeticSelect("title", id)}
            />
            <UnlockShelf
              axis="uniform"
              ctx={unlockCtx}
              selected={state.uniformColor}
              onSelect={(id) => handleCosmeticSelect("uniform", id)}
            />
            <UnlockShelf
              axis="cardBg"
              ctx={unlockCtx}
              selected={state.cardBg}
              onSelect={(id) => handleCosmeticSelect("cardBg", id)}
            />
            <EmblemShelf
              badges={state.badges}
              selected={state.emblem}
              onSelect={(id) => handleCosmeticSelect("emblem", id)}
            />
            {cosmeticError && (
              <div className="rounded-sm border border-nebula-red/70 bg-nebula-red/15 px-4 py-3 font-tech text-xs uppercase tracking-wider text-nebula-red">
                {cosmeticError}
              </div>
            )}
          </Section>

          {error && (
            <div className="rounded-sm border border-nebula-red/70 bg-nebula-red/15 px-4 py-3 font-tech text-xs uppercase tracking-wider text-nebula-red">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-end">
            {mode === "edit" && (
              <Link
                href={returnTo}
                className="font-tech text-xs uppercase tracking-widest text-nebula-text-dim transition-colors hover:text-nebula-text-secondary"
              >
                Annuler
              </Link>
            )}
            <button
              type="submit"
              disabled={saving}
              className="rounded-sm bg-nebula-cyan px-7 py-3 font-tech text-sm font-bold uppercase tracking-[0.18em] text-nebula-bg-darkest shadow-[0_4px_0_var(--cyan-dim)] transition-all enabled:hover:translate-y-px enabled:hover:shadow-[0_3px_0_var(--cyan-dim)] enabled:active:translate-y-[3px] enabled:active:shadow-none disabled:opacity-50"
            >
              {saving
                ? "Enregistrement..."
                : mode === "create"
                  ? "> Confirmer et embarquer"
                  : "> Sauvegarder"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

function Section({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4">
        <div className="font-tech text-[11px] uppercase tracking-[0.3em] text-nebula-blue">
          ◈ {label}
        </div>
        <p className="mt-1 font-body text-xs text-nebula-text-dim">{description}</p>
      </div>
      {children}
    </section>
  );
}

function Choice({
  selected,
  onClick,
  emoji,
  image,
  label,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  emoji: string;
  image?: string;
  label: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex flex-col items-center rounded-sm border p-4 text-center transition-all ${
        selected
          ? "border-nebula-cyan bg-nebula-cyan-faint/30 shadow-[0_0_18px_rgba(0,240,255,0.18)]"
          : "border-nebula-border bg-nebula-bg-panel/40 hover:border-nebula-cyan-dim"
      }`}
    >
      {image ? (
        <div className="mb-2 h-12 w-12 shrink-0 overflow-hidden rounded-full">
          <Image
            src={image}
            alt={label}
            width={48}
            height={48}
            className="h-full w-full object-cover"
            style={{ imageRendering: "pixelated" }}
          />
        </div>
      ) : (
        <span className="mb-2 text-3xl sm:text-4xl">{emoji}</span>
      )}
      <span
        className={`mb-1 font-tech text-xs uppercase tracking-widest ${
          selected ? "text-nebula-cyan" : "text-nebula-text"
        }`}
      >
        {label}
      </span>
      <span className="font-body text-[11px] leading-snug text-nebula-text-dim">
        {description}
      </span>
    </button>
  );
}
