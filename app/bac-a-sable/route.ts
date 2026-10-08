import { buildPreviewDocument } from "@/lib/sandbox/preview-document";
import { reponseBacASable } from "@/lib/sandbox/sandbox-response";

/**
 * Document du bac à sable React, servi depuis l'origine dédiée (audit EXE-03).
 * `ReactPreview` le charge par `src` et non `srcdoc`, pour qu'il ne partage pas
 * la CSP de l'application. `reponseBacASable` pose sa CSP permissive et son
 * `frame-ancestors`, communs aux trois documents du bac à sable.
 */
export function GET(req: Request): Response {
  return reponseBacASable(buildPreviewDocument(), req);
}
