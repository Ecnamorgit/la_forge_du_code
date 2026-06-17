/**
 * Avatar customization options, stored on the User row (species, uniformColor,
 * role). Species and uniform colour are purely cosmetic. The role also drives
 * the course recommendations (onboarding result + /learn page) via
 * ROLE_RECOMMENDED_COURSES below — no chapter is ever locked by it.
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
  | "gold";

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
  /** Used for border + glow accents around the avatar. */
  hex: string;
  /** Lower-opacity version for backgrounds. */
  glow: string;
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
    description: "Moitie organique, moitie machine. Acces direct aux systemes.",
    image: "/species-cyborg-v2.png",
  },
  {
    id: "synthetique",
    emoji: "👾",
    label: "Synthetique",
    description: "Conscience numerique pure. Pas de fatigue, pas de doute.",
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
    description: "Decouvert a la derive. Aucun dossier dans les archives.",
    image: "/species-inconnue-v2.png",
  },
];

export const UNIFORM_COLORS: UniformColorDef[] = [
  { id: "cyan", label: "Cyan", hex: "#00f0ff", glow: "rgba(0,240,255,0.35)" },
  { id: "orange", label: "Orange", hex: "#ff6b2c", glow: "rgba(255,107,44,0.35)" },
  { id: "green", label: "Vert", hex: "#00ff88", glow: "rgba(0,255,136,0.35)" },
  { id: "purple", label: "Violet", hex: "#b067ff", glow: "rgba(176,103,255,0.35)" },
  { id: "gold", label: "Or", hex: "#ffc844", glow: "rgba(255,200,68,0.35)" },
];

export const ROLES: RoleDef[] = [
  {
    id: "pilote",
    emoji: "🛸",
    label: "Pilote",
    description: "Manoeuvre les vaisseaux. Reflexe d'abord, plan ensuite.",
    image: "/role-pilote-v2.png",
  },
  {
    id: "ingenieur",
    emoji: "🔧",
    label: "Ingenieur",
    description: "Construit, repare, ameliore. Aime les systemes complexes.",
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
 * Course slugs recommended per role. Single source of truth used by the
 * onboarding result screen and the /learn page. Display names come from
 * lib/courses-catalog.ts (getCourseInfo).
 */
export const ROLE_RECOMMENDED_COURSES: Record<RoleId, string[]> = {
  pilote: ["html", "css", "javascript", "react"],
  ingenieur: ["sql", "nodejs", "mongodb", "devops"],
  tacticien: ["typescript", "tests", "security", "algo"],
  explorateur: ["git", "python", "html", "javascript"],
};

/** Lookup helpers. Return undefined for unknown ids. */
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

/** Type guards for runtime validation (used on the server side). */
export function isSpeciesId(v: unknown): v is SpeciesId {
  return typeof v === "string" && SPECIES.some((s) => s.id === v);
}
export function isUniformColorId(v: unknown): v is UniformColorId {
  return typeof v === "string" && UNIFORM_COLORS.some((c) => c.id === v);
}
export function isRoleId(v: unknown): v is RoleId {
  return typeof v === "string" && ROLES.some((r) => r.id === v);
}
