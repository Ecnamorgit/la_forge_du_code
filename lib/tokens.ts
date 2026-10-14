import "server-only";

import { prisma } from "@/lib/db";
import { generateRawToken, hashToken } from "@/lib/token-crypto";

export type TokenKind = "email_verify" | "password_reset";

const TTL_MS: Record<TokenKind, number> = {
  email_verify: 24 * 60 * 60 * 1000, // 24 h
  password_reset: 60 * 60 * 1000, // 1 h
};

/**
 * Creates a single-use token and invalidates unused tokens of the same kind
 * for this user: requesting a new verification email cancels the old
 * link.
 */
export async function createToken(args: {
  userId: string;
  kind: TokenKind;
}): Promise<string> {
  const token = generateRawToken();
  const expiresAt = new Date(Date.now() + TTL_MS[args.kind]);

  await prisma.$transaction([
    // Invalidates unused tokens of the same kind.
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
 * Consumes a token: checks expiry and single use, then marks it as used
 * atomically. Throws TokenError on failure.
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

  // Atomic guard: the update only happens if the token is still unused.
  // If a concurrent request consumed it in the meantime, count is 0.
  const result = await prisma.oneTimeToken.updateMany({
    where: { id: record.id, usedAt: null },
    data: { usedAt: new Date() },
  });
  if (result.count === 0) {
    throw new TokenError("Lien déjà utilisé.", "used");
  }

  return { userId: record.userId, kind: record.kind as TokenKind };
}
