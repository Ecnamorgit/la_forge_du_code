/**
 * Aperçu React, côté parent : contrôle des messages de l'iframe et validation
 * du nom de composant. `PREVIEW_MOUNT_NAME_RE` est injectée telle quelle dans
 * le document servi (`preview-document.ts`) pour que les deux côtés ne
 * divergent pas.
 */

export type PreviewErrorKind = "transform" | "mount" | "runtime" | "boucle";

export type PreviewMessage =
  | { type: "ready" }
  | { type: "error"; kind: PreviewErrorKind; message: string };

/**
 * `previewMount` est interpolé dans un corps de `new Function`. Le bac à sable
 * exécutant déjà du code arbitraire, la validation sert surtout à signaler
 * clairement une coquille dans les données du cours.
 */
export const PREVIEW_MOUNT_NAME_RE = /^[A-Za-z_$][\w$]*$/;

/**
 * Genres d'erreur que l'iframe peut émettre. `"transform"` et `"boucle"` sont
 * produits par le parent avant l'envoi : rien ne justifie de les accepter.
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
