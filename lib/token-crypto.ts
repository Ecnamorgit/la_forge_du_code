import { createHash, randomBytes } from "crypto";

/**
 * Cryptographie des jetons à usage unique, sans base ni `server-only` pour
 * être testée isolément. La partie base de données vit dans `tokens.ts`.
 */

/** 32 octets aléatoires, soit un jeton URL-safe de 43 caractères. */
export function generateRawToken(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * SHA-256 (hex) du jeton brut. Seul le hash est stocké, pour qu'un dump de la
 * base n'expose aucun lien utilisable ; le jeton brut ne vit que dans l'e-mail.
 * SHA-256 suffit, sans bcrypt : l'entrée a 256 bits d'entropie et la recherche
 * reste une égalité exacte indexée.
 */
export function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}
