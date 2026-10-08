import "server-only";

import { prisma } from "@/lib/db";
import { generateRawToken, hashToken } from "@/lib/token-crypto";

export type TokenKind = "email_verify" | "password_reset";

const TTL_MS: Record<TokenKind, number> = {
  email_verify: 24 * 60 * 60 * 1000, // 24 h
  password_reset: 60 * 60 * 1000, // 1 h
};

/**
 * Crée un jeton à usage unique et invalide les jetons inutilisés du même type
 * pour cet utilisateur : redemander un e-mail de vérification annule l'ancien
 * lien.
 */
export async function createToken(args: {
  userId: string;
  kind: TokenKind;
}): Promise<string> {
  const token = generateRawToken();
  const expiresAt = new Date(Date.now() + TTL_MS[args.kind]);

  await prisma.$transaction([
    // Invalide les jetons inutilisés du même type.
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
 * Consomme un jeton : vérifie l'expiration et l'usage unique, puis le marque
 * utilisé de façon atomique. Lève TokenError en cas d'échec.
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

  // Garde atomique : la mise à jour n'a lieu que si le jeton est encore
  // inutilisé. Si une requête concurrente l'a consommé entre-temps, count vaut 0.
  const result = await prisma.oneTimeToken.updateMany({
    where: { id: record.id, usedAt: null },
    data: { usedAt: new Date() },
  });
  if (result.count === 0) {
    throw new TokenError("Lien déjà utilisé.", "used");
  }

  return { userId: record.userId, kind: record.kind as TokenKind };
}
