import "server-only";

import crypto from "node:crypto";

import bcrypt from "bcryptjs";

import { isRateLimited, rateLimit } from "@/lib/rate-limit";

/**
 * Limite des échecs de connexion par compte (audit SRV-07). La limite par IP
 * (10 essais en 5 min) ne freine pas un attaquant qui répartit ses essais sur
 * de nombreuses adresses : à 10 échecs en 15 minutes, le compte refuse toute
 * connexion, même avec le bon mot de passe, jusqu'à la fin de la fenêtre.
 *
 * Les adresses sans compte sont comptées de la même façon pour ne pas révéler
 * qui est inscrit. La clé est une empreinte de l'adresse.
 */
const ECHECS = { limit: 10, windowMs: 15 * 60 * 1000 };

function cle(email: string): string {
  const empreinte = crypto.createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
  return `login-fail:${empreinte}`;
}

export function compteVerrouille(email: string): Promise<boolean> {
  return isRateLimited(cle(email), ECHECS);
}

export async function noterEchecConnexion(email: string): Promise<void> {
  await rateLimit(cle(email), ECHECS);
}

let hashFacticeEnCours: Promise<string> | null = null;

/**
 * Hash factice, comparé quand l'adresse n'a pas de compte : le temps de
 * réponse est celui d'un mauvais mot de passe et ne révèle pas l'existence du
 * compte. Calculé au premier besoin, car `auth.ts` est chargé par toutes les
 * routes et chaque démarrage à froid paierait sinon un bcrypt de coût 12.
 */
export function hashFactice(): Promise<string> {
  hashFacticeEnCours ??= bcrypt.hash("connexion-timing-guard", 12);
  return hashFacticeEnCours;
}
