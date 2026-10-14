/**
 * React preview, parent side: checks the iframe's messages and validates
 * the component name. `PREVIEW_MOUNT_NAME_RE` is injected as is into
 * the served document (`preview-document.ts`) so the two sides cannot
 * drift apart.
 */

export type PreviewErrorKind = "transform" | "mount" | "runtime" | "boucle";

export type PreviewMessage =
  | { type: "ready" }
  | { type: "error"; kind: PreviewErrorKind; message: string };

/**
 * `previewMount` is interpolated into a `new Function` body. Since the sandbox
 * already runs arbitrary code, the validation mainly serves to clearly
 * flag a typo in the course data.
 */
export const PREVIEW_MOUNT_NAME_RE = /^[A-Za-z_$][\w$]*$/;

/**
 * Error kinds the iframe may emit. `"transform"` and `"boucle"` are
 * produced by the parent before sending: there is no reason to accept them.
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
