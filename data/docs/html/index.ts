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

/** All HTML reference sheets, in course order. */
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

/** Registry of HTML reference sheets, key = DocEntry.id. */
export const htmlDocs: Record<string, DocEntry> = Object.fromEntries(
  ALL_HTML_DOCS.map((entry) => [entry.id, entry])
);

/** Returns the sheet matching the id, or undefined if unknown. */
export function getDocEntry(id: string): DocEntry | undefined {
  return htmlDocs[id];
}
