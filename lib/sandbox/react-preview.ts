/**
 * Aperçu React : protocole de messages entre le parent et l'iframe, et
 * constantes partagées.
 *
 * Le document exécuté dans l'iframe ne vit plus ici : il est servi depuis une
 * origine dédiée (`lib/sandbox/preview-document.ts`, constat EXE-03), pour que
 * son exécution porte sa propre CSP permissive au lieu d'hériter de celle du
 * site. Ce module ne garde que ce qui est commun aux deux côtés : le contrôle
 * des messages entrants (`parsePreviewMessage`) et la validation du nom de
 * composant (`PREVIEW_MOUNT_NAME_RE`, injectée dans le document servi pour que
 * les deux expressions ne puissent pas diverger).
 *
 * Les fonctions exportées sont pures pour rester testables en node.
 */

export type PreviewErrorKind = "transform" | "mount" | "runtime" | "boucle";

export type PreviewMessage =
  | { type: "ready" }
  | { type: "error"; kind: PreviewErrorKind; message: string };

/**
 * `previewMount` est interpole dans un corps de `new Function`. On le valide
 * non par crainte d'une injection — le sandbox execute deja du code arbitraire,
 * un nom malveillant n'ajoute rien — mais pour qu'une coquille dans les donnees
 * du cours produise un message clair au lieu d'une erreur de syntaxe opaque.
 */
export const PREVIEW_MOUNT_NAME_RE = /^[A-Za-z_$][\w$]*$/;

/**
 * Genres d'erreur que l'iframe a le droit d'émettre.
 *
 * `"transform"` et `"boucle"` en sont volontairement absents : ils naissent
 * dans le parent, avant tout envoi. Les accepter ici élargirait la surface du
 * protocole entrant d'un genre que rien ne poste jamais.
 */
const INBOUND_ERROR_KINDS: readonly PreviewErrorKind[] = ["mount", "runtime"];

export function parsePreviewMessage(
  event: MessageEvent,
  source: Window | null
): PreviewMessage | null {
  if (source === null || event.source !== source) return null;

  const data = event.data as {
    type?: unknown;
    kind?: unknown;
    message?: unknown;
  } | null;
  if (typeof data !== "object" || data === null) return null;

  if (data.type === "preview:ready") return { type: "ready" };

  if (data.type === "preview:error") {
    if (typeof data.message !== "string") return null;
    if (!INBOUND_ERROR_KINDS.includes(data.kind as PreviewErrorKind)) return null;
    return { type: "error", kind: data.kind as PreviewErrorKind, message: data.message };
  }

  return null;
}
