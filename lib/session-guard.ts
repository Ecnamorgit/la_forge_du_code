import "server-only";

import { prisma } from "@/lib/db";

/**
 * Révocation des sessions JWT après une réinitialisation de mot de passe
 * (constat SRV-03 de l'audit de sécurité du 2026-09-12).
 *
 * Les sessions sont des JWT signés, non stockés : rien ne les invalidait. Une
 * session volée restait valable jusqu'à son expiration, même après que la
 * victime avait réinitialisé son mot de passe.
 *
 * Le compte porte une `sessionVersion`. Le jeton emmène la version qui avait
 * cours à la connexion ; la réinitialisation du mot de passe l'incrémente. À
 * chaque vérification côté serveur (`auth()`), on compare : une divergence
 * signifie que le mot de passe a changé depuis, et la session est refusée.
 */

/** Incrémente la version de session : révoque tous les jetons déjà émis. */
export async function revoquerSessions(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { sessionVersion: { increment: 1 } },
  });
}

/**
 * La version portée par le jeton est-elle encore celle du compte ?
 *
 * En cas d'erreur de base (indisponibilité passagère), on répond `true` :
 * déconnecter tout le monde à la moindre panne serait pire que le risque
 * couvert. La révocation est alors seulement différée, le temps de la panne.
 */
export async function sessionEstValide(userId: string, versionJeton: unknown): Promise<boolean> {
  if (typeof versionJeton !== "number") return false;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { sessionVersion: true },
    });
    if (!user) return false;
    return user.sessionVersion === versionJeton;
  } catch {
    return true;
  }
}
