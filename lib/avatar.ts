/**
 * Avatar options, stored on the User row (species, uniformColor, role).
 * Species and color are cosmetic; the role also steers course
 * recommendations (ROLE_RECOMMENDED_COURSES) but never locks
 * a chapter.
 */

export type SpeciesId =
  | "humain"
  | "cyborg"
  | "synthetique"
  | "hybride"
  | "inconnue";

export type UniformColorId =
  | "cyan"
  | "orange"
  | "green"
  | "purple"
  | "gold"
  // Colors that must be earned (catalog in lib/unlocks.ts, "uniform" axis).
  | "rouge-spectre"
  | "blanc-glacier"
  | "rose-neon"
  | "nebuleuse";

export type RoleId =
  | "pilote"
  | "ingenieur"
  | "tacticien"
  | "explorateur";

export interface SpeciesDef {
  id: SpeciesId;
  emoji: string;
  label: string;
  description: string;
  image?: string;
}

export interface UniformColorDef {
  id: UniformColorId;
  label: string;
  /** Border and halo around the avatar. */
  hex: string;
  /** Less opaque variant, for backgrounds. */
  glow: string;
  /**
   * True for an earned color (catalog in lib/unlocks.ts, "uniform" axis),
   * which is not offered when the avatar is created.
   */
  unlockable?: boolean;
}

export interface RoleDef {
  id: RoleId;
  emoji: string;
  label: string;
  description: string;
  image?: string;
}

export const SPECIES: SpeciesDef[] = [
  {
    id: "humain",
    emoji: "🧑‍🚀",
    label: "Humain",
    description: "L'origine classique. Adaptable, curieux, perseverant.",
    image: "/species-humain-v2.png",
  },
  {
    id: "cyborg",
    emoji: "🤖",
    label: "Cyborg",
    description: "Moitie organique, moitie machine. Accès direct aux systèmes.",
    image: "/species-cyborg-v2.png",
  },
  {
    id: "synthetique",
    emoji: "👾",
    label: "Synthetique",
    description: "Conscience numérique pure. Pas de fatigue, pas de doute.",
    image: "/species-synthetique-v2.png",
  },
  {
    id: "hybride",
    emoji: "🧬",
    label: "Hybride",
    description: "Genetiquement modifie pour les longs voyages.",
    image: "/species-hybride-v2.png",
  },
  {
    id: "inconnue",
    emoji: "🛸",
    label: "Origine inconnue",
    description: "Decouvert à la dérive. Aucun dossier dans les archives.",
    image: "/species-inconnue-v2.png",
  },
];

export const UNIFORM_COLORS: UniformColorDef[] = [
  // Free: offered to everyone on the /avatar screen.
  { id: "cyan", label: "Cyan", hex: "#00f0ff", glow: "rgba(0,240,255,0.35)" },
  { id: "orange", label: "Orange", hex: "#ff6b2c", glow: "rgba(255,107,44,0.35)" },
  { id: "green", label: "Vert", hex: "#00ff88", glow: "rgba(0,255,136,0.35)" },
  { id: "purple", label: "Violet", hex: "#b067ff", glow: "rgba(176,103,255,0.35)" },
  { id: "gold", label: "Or", hex: "#ffc844", glow: "rgba(255,200,68,0.35)" },

  // Earned: hues readable on the dark background, with brightness close to
  // the five free ones.
  {
    id: "rouge-spectre",
    label: "Rouge Spectre",
    hex: "#ff3b5c",
    glow: "rgba(255,59,92,0.35)",
    unlockable: true,
  },
  {
    id: "blanc-glacier",
    label: "Blanc glacier",
    hex: "#dff4ff",
    glow: "rgba(223,244,255,0.35)",
    unlockable: true,
  },
  {
    id: "rose-neon",
    label: "Rose néon",
    hex: "#ff5ce1",
    glow: "rgba(255,92,225,0.35)",
    unlockable: true,
  },
  {
    id: "nebuleuse",
    label: "Dégradé nébuleuse",
    hex: "#9d6bff",
    glow: "rgba(157,107,255,0.35)",
    unlockable: true,
  },
];

/** Colors offered when creating the avatar, excluding earned colors. */
export const BASE_UNIFORM_COLORS: UniformColorDef[] = UNIFORM_COLORS.filter(
  (c) => !c.unlockable
);

export const ROLES: RoleDef[] = [
  {
    id: "pilote",
    emoji: "🛸",
    label: "Pilote",
    description: "Manoeuvre les vaisseaux. Réflexe d'abord, plan ensuite.",
    image: "/role-pilote-v2.png",
  },
  {
    id: "ingenieur",
    emoji: "🔧",
    label: "Ingénieur",
    description: "Construit, répare, ameliore. Aime les systèmes complexes.",
    image: "/role-ingenieur-v2.png",
  },
  {
    id: "tacticien",
    emoji: "🎯",
    label: "Tacticien",
    description: "Analyse, anticipe, decide. Voit trois coups en avance.",
    image: "/role-tacticien-v2.png",
  },
  {
    id: "explorateur",
    emoji: "🔭",
    label: "Explorateur",
    description: "Premier sur le terrain. Curiosite avant tout.",
    image: "/role-explorateur-v2.png",
  },
];

/**
 * Recommended courses per role, for the end-of-onboarding screen and the
 * /learn page. Display names come from lib/courses-catalog.ts (getCourseInfo).
 */
export const ROLE_RECOMMENDED_COURSES: Record<RoleId, string[]> = {
  pilote: ["html", "css", "javascript", "react"],
  ingenieur: ["sql", "nodejs", "mongodb", "devops"],
  tacticien: ["typescript", "tests", "security", "algo"],
  explorateur: ["git", "python", "html", "javascript"],
};

/** Lookup by id; undefined if the id is unknown. */
export function getSpecies(id: string | null | undefined): SpeciesDef | undefined {
  return id ? SPECIES.find((s) => s.id === id) : undefined;
}
export function getUniformColor(
  id: string | null | undefined
): UniformColorDef | undefined {
  return id ? UNIFORM_COLORS.find((c) => c.id === id) : undefined;
}
export function getRole(id: string | null | undefined): RoleDef | undefined {
  return id ? ROLES.find((r) => r.id === id) : undefined;
}

/** Type guards for runtime validation. */
export function isSpeciesId(v: unknown): v is SpeciesId {
  return typeof v === "string" && SPECIES.some((s) => s.id === v);
}
export function isUniformColorId(v: unknown): v is UniformColorId {
  return typeof v === "string" && UNIFORM_COLORS.some((c) => c.id === v);
}
/**
 * True for a free color. `setAvatar` uses it to require ownership of
 * earned colors, which `isUniformColorId` also accepts.
 */
export function isBaseUniformColorId(v: unknown): v is UniformColorId {
  return typeof v === "string" && BASE_UNIFORM_COLORS.some((c) => c.id === v);
}
export function isRoleId(v: unknown): v is RoleId {
  return typeof v === "string" && ROLES.some((r) => r.id === v);
}
