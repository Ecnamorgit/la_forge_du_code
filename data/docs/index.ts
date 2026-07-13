import type { DocEntry } from "./types";
import { htmlDocs } from "./html";
import { cssDocs } from "./css";
import { jsDocs } from "./js";

/** Toutes les fiches, tous domaines confondus. Clé = DocEntry.id. */
export const ALL_DOCS: Record<string, DocEntry> = { ...htmlDocs, ...cssDocs, ...jsDocs };

/** Retourne la fiche correspondant à l'id complet (ex. "css/flexbox"), ou undefined. */
export function getDocEntry(id: string): DocEntry | undefined {
  return ALL_DOCS[id];
}
