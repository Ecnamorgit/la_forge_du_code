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
  {
    id: 0,
    narration: "ALERTE CORRUPTION : Le virus inconnu SPECTRE s'est infiltré dans les serveurs de la galaxie. Les systèmes orbitaux s'effondrent.",
    visual: "logo",
  },
  {
    id: 1,
    narration: "La flotte Nebula Command est paralysée. Tu es le dernier Cadet-Ingénieur encore opérationnel en secteur 7.",
    visual: "cadet",
  },
  {
    id: 2,
    narration: "« Initialisation... Bonjour Cadet. Je suis KIRA, ton I.A. de bord. Je vais guider chacun de tes pas. »",
    visual: "orbit",
  },
  {
    id: 3,
    narration: "Pour repousser Spectre, tu vas devoir réécrire les protocoles informatiques. Chaque ligne de code valide restaure la station.",
    visual: "planet",
  },
  {
    id: 4,
    narration: "Configure ton profil de Cadet et prépare-toi à lancer ta première mission. La galaxie compte sur toi !",
    visual: "invite",
  },
];

/**
 * Persiste que l'intro a été vue ; no-op si le storage est indisponible.
 * NB : la lecture automatique ne dépend plus de ce drapeau — elle n'a lieu
 * qu'au premier login (dashboard, compte sans avatar). Le drapeau reste
 * écrit à titre d'historique.
 */
export function markIntroSeen(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(INTRO_STORAGE_KEY, "true");
  } catch {
    /* ignore */
  }
}
