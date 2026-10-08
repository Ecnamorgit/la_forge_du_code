import { buildJsRunnerDocument } from "@/lib/sandbox/js-runner-document";
import { reponseBacASable } from "@/lib/sandbox/sandbox-response";

/**
 * Document d'exécution JavaScript, servi depuis l'origine dédiée. `run-js.ts`
 * le charge dans une iframe cachée puis lui poste le code de l'apprenant.
 */
export function GET(req: Request): Response {
  return reponseBacASable(buildJsRunnerDocument(), req);
}
