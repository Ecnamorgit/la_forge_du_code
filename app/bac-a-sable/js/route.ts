import { buildJsRunnerDocument } from "@/lib/sandbox/js-runner-document";
import { sandboxResponse } from "@/lib/sandbox/sandbox-response";

/**
 * JavaScript execution document, served from the dedicated origin. `run-js.ts`
 * loads it in a hidden iframe then posts it the learner's code.
 */
export function GET(req: Request): Response {
  return sandboxResponse(buildJsRunnerDocument(), req);
}
