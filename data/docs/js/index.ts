import type { DocEntry } from "../types";
import { jsConsole } from "./console";
import { conditions } from "./conditions";
import { fonctions } from "./fonctions";
import { tableaux } from "./tableaux";
import { objets } from "./objets";
import { arrayMethods } from "./array-methods";
import { dom } from "./dom";
import { events } from "./events";
import { jsAsync } from "./async";
import { localStorageDoc } from "./localstorage";
import { fetchDoc } from "./fetch";
import { rest } from "./rest";

/** Toutes les fiches JS, dans l'ordre du parcours. */
const ALL_JS_DOCS: DocEntry[] = [
  jsConsole,
  conditions,
  fonctions,
  tableaux,
  objets,
  arrayMethods,
  dom,
  events,
  jsAsync,
  localStorageDoc,
  fetchDoc,
  rest,
];

/** Registre des fiches JS, clé = DocEntry.id. */
export const jsDocs: Record<string, DocEntry> = Object.fromEntries(
  ALL_JS_DOCS.map((entry) => [entry.id, entry])
);
