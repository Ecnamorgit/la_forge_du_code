import { createHash, randomBytes } from "crypto";

/**
 * Crypto pure des tokens à usage unique — sans dépendance à la base ni à
 * `server-only`, donc testable en isolation. La logique DB vit dans `tokens.ts`.
 */

/** 32 octets aléatoires → token URL-safe de 43 caractères. */
export function generateRawToken(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * SHA-256 (hex) du token brut. Seul le hash est persisté, pour qu'un dump de la
 * base n'expose jamais de lien de vérification / reset utilisable. Le token brut
 * ne vit que dans le lien envoyé par email. SHA-256 (et non bcrypt) est l'outil
 * adapté : l'entrée est à haute entropie (256 bits), il n'y a donc rien à
 * brute-forcer, et la recherche reste un simple match exact indexé.
 */
export function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}
