import { buildJsRunnerDocument } from "@/lib/sandbox/js-runner-document";
import { reponseBacASable } from "@/lib/sandbox/sandbox-response";

/**
 * Document d'exécution JavaScript (headless), servi depuis l'origine dédiée
 * (constat EXE-03). `run-js.ts` le charge dans une iframe cachée par `src` puis
 * lui poste le code de l'apprenant, au lieu de figer ce code dans un `srcdoc`
 * qui hériterait de la CSP de l'application.
 */
export function GET(): Response {
  return reponseBacASable(buildJsRunnerDocument());
}
