import type { DocEntry } from "../types";
import { cssStyle } from "./style";
import { selectors } from "./selecteurs";
import { boxModel } from "./box-model";
import { flexbox } from "./flexbox";
import { grid } from "./grid";
import { cssPosition } from "./position";
import { pseudoClasses } from "./pseudo-classes";
import { mediaQueries } from "./media-queries";
import { cssTransition } from "./transition";
import { cssVariables } from "./variables";

/** All CSS reference sheets, in course order. */
const ALL_CSS_DOCS: DocEntry[] = [
  cssStyle,
  selectors,
  boxModel,
  flexbox,
  grid,
  cssPosition,
  pseudoClasses,
  mediaQueries,
  cssTransition,
  cssVariables,
];

/** Registry of CSS reference sheets, key = DocEntry.id. */
export const cssDocs: Record<string, DocEntry> = Object.fromEntries(
  ALL_CSS_DOCS.map((entry) => [entry.id, entry])
);
