import type { DocEntry } from "./types";
import { htmlDocs } from "./html";
import { cssDocs } from "./css";
import { jsDocs } from "./js";

/** All reference sheets, across every domain. Key = DocEntry.id. */
export const ALL_DOCS: Record<string, DocEntry> = { ...htmlDocs, ...cssDocs, ...jsDocs };

/** Returns the sheet matching the full id (e.g. "css/flexbox"), or undefined. */
export function getDocEntry(id: string): DocEntry | undefined {
  return ALL_DOCS[id];
}
