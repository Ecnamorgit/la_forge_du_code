import type { DocEntry } from "../types";
import { doctype } from "./doctype";
import { htmlElement } from "./html-element";
import { head } from "./head";

/** Registre des fiches HTML, clé = DocEntry.id. */
export const htmlDocs: Record<string, DocEntry> = {
  [doctype.id]: doctype,
  [htmlElement.id]: htmlElement,
  [head.id]: head,
};

/** Retourne la fiche correspondant à l'id, ou undefined si inconnue. */
export function getDocEntry(id: string): DocEntry | undefined {
  return htmlDocs[id];
}
