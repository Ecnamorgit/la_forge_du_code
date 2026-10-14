import { buildHtmlPreviewDocument } from "@/lib/sandbox/html-preview-document";
import { sandboxResponse } from "@/lib/sandbox/sandbox-response";

/**
 * HTML preview shell, served from the dedicated origin. `ChapterWorkspace`
 * loads it via `src` then posts it the learner's HTML, which it renders in
 * a nested iframe.
 */
export function GET(req: Request): Response {
  return sandboxResponse(buildHtmlPreviewDocument(), req);
}
