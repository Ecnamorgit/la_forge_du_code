import { buildHtmlPreviewDocument } from "@/lib/sandbox/html-preview-document";
import { reponseBacASable } from "@/lib/sandbox/sandbox-response";

/**
 * Coquille de l'aperçu HTML, servie depuis l'origine dédiée. `ChapterWorkspace`
 * la charge par `src` puis lui poste le HTML de l'apprenant, qu'elle rend dans
 * une iframe imbriquée.
 */
export function GET(req: Request): Response {
  return reponseBacASable(buildHtmlPreviewDocument(), req);
}
