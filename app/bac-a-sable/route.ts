import { buildPreviewDocument } from "@/lib/sandbox/preview-document";
import { reponseBacASable } from "@/lib/sandbox/sandbox-response";

/**
 * Document du bac à sable React, servi depuis l'origine dédiée (constat
 * EXE-03). Il est chargé dans une iframe par `ReactPreview`, via `src` et non
 * `srcdoc`, pour que son exécution ne partage plus la CSP de l'application.
 *
 * Sa CSP permissive et son `frame-ancestors` sont posés par `reponseBacASable`,
 * commun aux trois documents du bac à sable.
 */
export function GET(req: Request): Response {
  return reponseBacASable(buildPreviewDocument(), req);
}
