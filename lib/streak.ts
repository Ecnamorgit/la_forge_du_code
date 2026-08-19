/**
 * La liaison — le streak, devenu objet de jeu.
 *
 * Deux différences avec l'ancien compteur de lib/me-server.ts :
 *  - elle n'avance QUE sur travail réel (première ÉTAPE validée du jour),
 *    plus à la simple ouverture d'un onglet ;
 *  - un jour manqué ne la rompt pas si le cadet détient un relais de secours.
 *
 * Fonction pure : le jour courant est un paramètre, jamais l'horloge.
 */

/** Plafond de relais détenus. Au-delà, l'absence n'aurait plus aucun coût. */
export const MAX_SHIELDS = 2;

/** Série rompue à partir de laquelle le badge « Le Retour » est mérité. */
const RETURN_THRESHOLD = 7;

/** Jour de liaison auquel le premier relais est offert. */
const FIRST_SHIELD_AT = 3;

export interface LiaisonState {
  streak: number;
  bestStreak: number;
  shields: number;
  shieldEverGranted: boolean;
  /** ISO yyyy-mm-dd du dernier jour actif ; "" si jamais actif. */
  lastActiveDay: string;
}

export interface LiaisonTransition {
  next: LiaisonState;
  /** Faux quand la journée était déjà comptée (rien à écrire en base). */
  changed: boolean;
  shieldsConsumed: number;
  broken: boolean;
  /** Rupture d'une série d'au moins 7 jours → badge « Le Retour ». */
  earnedReturn: boolean;
  shieldEarned: boolean;
}

/** Nombre de jours calendaires entre deux dates ISO yyyy-mm-dd. */
export function daysBetweenIso(fromIso: string, toIso: string): number {
  const from = Date.parse(`${fromIso}T00:00:00Z`);
  const to = Date.parse(`${toIso}T00:00:00Z`);
  return Math.round((to - from) / 86_400_000);
}

/**
 * Fait avancer la liaison. À appeler au moment où le cadet valide sa première
 * ÉTAPE de la journée — jamais à la simple visite.
 *
 * Le déclencheur est l'étape et non l'ordre accompli : un ordre peut demander
 * plusieurs étapes, et un cadet qui n'en boucle qu'une un jour chargé a
 * travaillé quand même. Cette fonction n'en sait rien — sa machine à états est
 * inchangée, seul son appelant choisit le déclencheur.
 */
export function advanceLiaison(
  current: LiaisonState,
  todayIso: string
): LiaisonTransition {
  const inchange: LiaisonTransition = {
    next: current,
    changed: false,
    shieldsConsumed: 0,
    broken: false,
    earnedReturn: false,
    shieldEarned: false,
  };

  if (!todayIso) return inchange;
  if (current.lastActiveDay === todayIso) return inchange;

  let streak: number;
  let shields = current.shields;
  let shieldsConsumed = 0;
  let broken = false;
  let earnedReturn = false;

  if (!current.lastActiveDay) {
    streak = 1;
  } else {
    const gap = daysBetweenIso(current.lastActiveDay, todayIso);
    if (gap <= 0) return inchange; // horloge incohérente : ne rien casser
    if (gap === 1) {
      streak = current.streak + 1;
    } else {
      const manques = gap - 1;
      if (manques <= shields) {
        shields -= manques;
        shieldsConsumed = manques;
        streak = current.streak + 1;
      } else {
        broken = true;
        earnedReturn = current.streak >= RETURN_THRESHOLD;
        streak = 1;
      }
    }
  }

  // Relais offert au 3e jour, une seule fois dans la vie du compte.
  let shieldEverGranted = current.shieldEverGranted;
  let shieldEarned = false;
  if (streak === FIRST_SHIELD_AT && !shieldEverGranted) {
    shields = Math.min(shields + 1, MAX_SHIELDS);
    shieldEverGranted = true;
    shieldEarned = true;
  } else if (streak > 0 && streak % 7 === 0) {
    const avant = shields;
    shields = Math.min(shields + 1, MAX_SHIELDS);
    shieldEarned = shields > avant;
  }

  return {
    next: {
      streak,
      bestStreak: Math.max(current.bestStreak, streak),
      shields,
      shieldEverGranted,
      lastActiveDay: todayIso,
    },
    changed: true,
    shieldsConsumed,
    broken,
    earnedReturn,
    shieldEarned,
  };
}
