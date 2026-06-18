import "server-only";

import { prisma } from "@/lib/db";
import { generateRawToken, hashToken } from "@/lib/token-crypto";

export type TokenKind = "email_verify" | "password_reset";

const TTL_MS: Record<TokenKind, number> = {
  email_verify: 24 * 60 * 60 * 1000, // 24h
  password_reset: 60 * 60 * 1000, // 1h
};

/**
 * Create a fresh single-use token. Invalidates any older unused tokens of the
 * same kind for that user (so re-requesting a verification email kills the old
 * link, preventing replay).
 */
export async function createToken(args: {
  userId: string;
  kind: TokenKind;
}): Promise<string> {
  const token = generateRawToken();
  const expiresAt = new Date(Date.now() + TTL_MS[args.kind]);

  await prisma.$transaction([
    // Invalidate previous unused tokens of the same kind.
    prisma.oneTimeToken.updateMany({
      where: { userId: args.userId, kind: args.kind, usedAt: null },
      data: { usedAt: new Date() },
    }),
    prisma.oneTimeToken.create({
      data: {
        token: hashToken(token),
        userId: args.userId,
        kind: args.kind,
        expiresAt,
      },
    }),
  ]);

  return token;
}

export interface ConsumedToken {
  userId: string;
  kind: TokenKind;
}

export class TokenError extends Error {
  constructor(
    message: string,
    public readonly reason: "not_found" | "expired" | "used" | "wrong_kind"
  ) {
    super(message);
  }
}

/**
 * Consume a token: validates expiry + single-use, marks it used atomically.
 * Throws TokenError on any failure.
 */
export async function consumeToken(args: {
  token: string;
  kind: TokenKind;
}): Promise<ConsumedToken> {
  const record = await prisma.oneTimeToken.findUnique({
    where: { token: hashToken(args.token) },
    select: { id: true, userId: true, kind: true, expiresAt: true, usedAt: true },
  });

  if (!record) {
    throw new TokenError("Lien invalide.", "not_found");
  }
  if (record.kind !== args.kind) {
    throw new TokenError("Type de lien incorrect.", "wrong_kind");
  }
  if (record.usedAt) {
    throw new TokenError("Lien déjà utilisé.", "used");
  }
  if (record.expiresAt.getTime() < Date.now()) {
    throw new TokenError("Lien expiré, demande-en un nouveau.", "expired");
  }

  // Atomic single-use guard: update only if still unused. If another concurrent
  // request consumed it between our findUnique and update, the count is 0.
  const result = await prisma.oneTimeToken.updateMany({
    where: { id: record.id, usedAt: null },
    data: { usedAt: new Date() },
  });
  if (result.count === 0) {
    throw new TokenError("Lien déjà utilisé.", "used");
  }

  return { userId: record.userId, kind: record.kind as TokenKind };
}
