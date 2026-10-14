import { buildPreviewDocument } from "@/lib/sandbox/preview-document";
import { sandboxResponse } from "@/lib/sandbox/sandbox-response";

/**
 * React sandbox document, served from the dedicated origin (audit EXE-03).
 * `ReactPreview` loads it via `src` rather than `srcdoc`, so it does not share
 * the application's CSP. `sandboxResponse` sets its permissive CSP and its
 * `frame-ancestors`, shared by the three sandbox documents.
 */
export function GET(req: Request): Response {
  return sandboxResponse(buildPreviewDocument(), req);
}
