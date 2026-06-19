import type { DocEntry } from "../types";
import { doctype } from "./doctype";
import { htmlElement } from "./html-element";
import { head } from "./head";
import { anchor } from "./anchor";
import { section } from "./section";
import { nav } from "./nav";
import { img } from "./img";
import { figure } from "./figure";
import { ul } from "./ul";
import { ol } from "./ol";
import { table } from "./table";
import { thead } from "./thead";
import { form } from "./form";
import { input } from "./input";
import { label } from "./label";
import { textarea } from "./textarea";
import { button } from "./button";
import { select } from "./select";
import { header } from "./header";
import { main } from "./main";
import { footer } from "./footer";
import { article } from "./article";
import { aria } from "./aria";
import { meta } from "./meta";
import { openGraph } from "./open-graph";
import { link } from "./link";
import { video } from "./video";
import { audio } from "./audio";
import { picture } from "./picture";

/** Toutes les fiches HTML, dans l'ordre du parcours. */
const ALL_HTML_DOCS: DocEntry[] = [
  doctype,
  htmlElement,
  head,
  anchor,
  section,
  nav,
  img,
  figure,
  ul,
  ol,
  table,
  thead,
  form,
  input,
  label,
  textarea,
  button,
  select,
  header,
  main,
  footer,
  article,
  aria,
  meta,
  openGraph,
  link,
  video,
  audio,
  picture,
];

/** Registre des fiches HTML, clé = DocEntry.id. */
export const htmlDocs: Record<string, DocEntry> = Object.fromEntries(
  ALL_HTML_DOCS.map((entry) => [entry.id, entry])
);

/** Retourne la fiche correspondant à l'id, ou undefined si inconnue. */
export function getDocEntry(id: string): DocEntry | undefined {
  return htmlDocs[id];
}
