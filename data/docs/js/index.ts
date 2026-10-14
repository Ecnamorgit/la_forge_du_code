import type { DocEntry } from "../types";
import { jsConsole } from "./console";
import { conditions } from "./conditions";
import { functions } from "./fonctions";
import { arrays } from "./tableaux";
import { objects } from "./objets";
import { arrayMethods } from "./array-methods";
import { dom } from "./dom";
import { events } from "./events";
import { jsAsync } from "./async";
import { localStorageDoc } from "./localstorage";
import { fetchDoc } from "./fetch";
import { rest } from "./rest";

/** All JS reference sheets, in course order. */
const ALL_JS_DOCS: DocEntry[] = [
  jsConsole,
  conditions,
  functions,
  arrays,
  objects,
  arrayMethods,
  dom,
  events,
  jsAsync,
  localStorageDoc,
  fetchDoc,
  rest,
];

/** Registry of JS reference sheets, key = DocEntry.id. */
export const jsDocs: Record<string, DocEntry> = Object.fromEntries(
  ALL_JS_DOCS.map((entry) => [entry.id, entry])
);
