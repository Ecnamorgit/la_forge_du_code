import "server-only";

import { prisma } from "@/lib/db";

/**
 * Révocation des sessions JWT après une réinitialisation de mot de passe
 * (audit SRV-03). Les JWT signés ne sont pas stockés : sans ce mécanisme, une
 * session volée resterait valable jusqu'à son expiration.
 *
 * Le compte porte une `sessionVersion`, que le jeton reprend à la connexion et
 * que la réinitialisation incrémente. À chaque `auth()`, une divergence fait
 * refuser la session.
 */

/** Incrémente la version de session : révoque tous les jetons déjà émis. */
export async function revoquerSessions(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { sessionVersion: { increment: 1 } },
  });
}

/**
 * Vrai si la version portée par le jeton est encore celle du compte. En cas
 * d'erreur de base, on répond `true` pour ne pas déconnecter tout le monde à
 * la moindre panne : la révocation est seulement différée.
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
