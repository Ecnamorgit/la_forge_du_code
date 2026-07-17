/**
 * Logique pure de la cinématique d'intro (aucune dépendance DOM au niveau
 * module, pour rester testable en environnement node). Les helpers storage
 * sont gardés par `typeof window` et ne s'exécutent qu'au runtime navigateur.
 */

export const INTRO_STORAGE_KEY = "nc_intro_seen";

/** Durée d'affichage d'une scène avant auto-défilement (ms). */
export const INTRO_SCENE_DURATION_MS = 4500;

export interface IntroScene {
  /** Index stable ; sert aussi de numéro de frame quand l'art pixel arrive. */
  id: number;
  /** Narration affichée en texte réel (lisible par lecteur d'écran). */
  narration: string;
  /** Variante visuelle du placeholder (composé d'assets existants). */
  visual: "logo" | "cadet" | "orbit" | "planet" | "invite";
}

export const INTRO_SCENES: IntroScene[] = [
  { id: 0, narration: "Alerte système : Liaison établie avec la station orbitale Nebula Command.", visual: "logo" },
  { id: 1, narration: "Enfile ta combinaison de Cadet et prépare-toi à restaurer les protocoles de la flotte.", visual: "cadet" },
  { id: 2, narration: "Maîtrise le HTML, le CSS et le JavaScript pour reconstruire les systèmes informatiques de bord.", visual: "orbit" },
  {
    id: 3,
    narration: "Écris ton code dans l'éditeur, valide tes lignes en direct et stabilise les anomalies de la galaxie.",
    visual: "planet",
  },
  { id: 4, narration: "Gagne de l'XP, débloque des grades, remporte des badges et commence ton cursus d'apprentissage !", visual: "invite" },
];

/**
 * N'auto-joue la cinématique qu'à une première visite ET si l'utilisateur n'a
 * pas demandé à réduire les animations. Pur : le composant résout les booléens.
 */
export function shouldAutoPlayIntro(seen: boolean, reducedMotion: boolean): boolean {
  return !seen && !reducedMotion;
}

/** Lit le drapeau « déjà vue » ; `false` si le storage est indisponible. */
export function hasSeenIntro(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(INTRO_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

/** Persiste que l'intro a été vue ; no-op si le storage est indisponible. */
export function markIntroSeen(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(INTRO_STORAGE_KEY, "true");
  } catch {
    /* ignore */
  }
}
