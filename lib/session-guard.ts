import "server-only";

import { prisma } from "@/lib/db";

/**
 * Revocation of JWT sessions after a password reset (audit SRV-03).
 * Signed JWTs are not stored: without this mechanism, a stolen session would
 * stay valid until it expires.
 *
 * The account carries a `sessionVersion`, which the token copies at login and
 * which the reset increments. On every `auth()`, a mismatch causes the session
 * to be rejected.
 */

/** Increments the session version: revokes every token already issued. */
export async function revokeSessions(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { sessionVersion: { increment: 1 } },
  });
}

/**
 * True if the version carried by the token still matches the account's. On a
 * database error, we return `true` so we do not sign everyone out at the
 * slightest outage: revocation is only delayed.
 */
export async function isSessionValid(userId: string, tokenVersion: unknown): Promise<boolean> {
  if (typeof tokenVersion !== "number") return false;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { sessionVersion: true },
    });
    if (!user) return false;
    return user.sessionVersion === tokenVersion;
  } catch {
    return true;
  }
}
