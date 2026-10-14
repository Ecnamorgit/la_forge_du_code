import { createHash, randomBytes } from "crypto";

/**
 * Cryptography for single-use tokens, with no database and no `server-only`
 * so it can be tested in isolation. The database part lives in `tokens.ts`.
 */

/** 32 random bytes, i.e. a 43-character URL-safe token. */
export function generateRawToken(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * SHA-256 (hex) of the raw token. Only the hash is stored, so a database dump
 * exposes no usable link; the raw token only lives in the email.
 * SHA-256 is enough, no bcrypt needed: the input has 256 bits of entropy and
 * the lookup stays an indexed exact match.
 */
export function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}
