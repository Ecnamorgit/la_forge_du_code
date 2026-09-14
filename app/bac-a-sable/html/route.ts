import { buildHtmlPreviewDocument } from "@/lib/sandbox/html-preview-document";
import { reponseBacASable } from "@/lib/sandbox/sandbox-response";

/**
 * Coquille de l'aperçu HTML, servie depuis l'origine dédiée (constat EXE-03).
 * `ChapterWorkspace` la charge dans une iframe par `src` puis lui poste le HTML
 * de l'apprenant, qu'elle rend dans une iframe imbriquée — au lieu d'un `srcdoc`
 * qui hériterait de la CSP de l'application.
 */
export function GET(): Response {
  return reponseBacASable(buildHtmlPreviewDocument());
}
