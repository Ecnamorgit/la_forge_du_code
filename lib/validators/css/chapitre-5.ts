import type { Validator } from "@/data/courses/html/types";
import { extractStyleContent, hasProperty, hasPropertyWithValue, ruleBody } from "./_utils";

/**
 * Splits on top-level whitespace: a parenthesized group (calc(...),
 * repeat(...), minmax(...), var(...)) stays a single token, even when nested.
 */
function topLevelTokens(value: string): string[] {
  const tokens: string[] = [];
  let depth = 0;
  let buf = "";
  for (const ch of value) {
    if (ch === "(") {
      depth++;
      buf += ch;
    } else if (ch === ")") {
      depth--;
      buf += ch;
    } else if (/\s/.test(ch) && depth === 0) {
      if (buf) {
        tokens.push(buf);
        buf = "";
      }
    } else {
      buf += ch;
    }
  }
  if (buf) tokens.push(buf);
  return tokens;
}

/**
 * Counts the tracks of a grid. `repeat(N, ...)` is worth N times the number of
 * tracks in its arguments; any other token (`1fr`, `auto`, `minmax(...)`...)
 * counts as one track.
 */
function countGridTracks(value: string): number {
  let count = 0;
  for (const token of topLevelTokens(value)) {
    const repeat = token.match(/^repeat\s*\(\s*(\d+)\s*,\s*([\s\S]+)\)$/i);
    if (repeat) {
      const n = parseInt(repeat[1], 10);
      const inner = countGridTracks(repeat[2].trim());
      count += n * Math.max(inner, 1);
    } else {
      count += 1;
    }
  }
  return count;
}

export const validators: Validator[] = [
  // Step 1: .grid { display: grid }
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) {
      return { ok: false, msg: "La balise <style> est manquante." };
    }
    if (!hasPropertyWithValue(css, ".grid", "display", /\bgrid\b/i)) {
      return {
        ok: false,
        msg: "Ajoute display: grid sur .grid.",
      };
    }
    return {
      ok: true,
      msg: "Grid active.",
      objList: ["o1a"],
    };
  },
  // Step 2: grid-template-columns with at least 3 tracks
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) {
      return { ok: false, msg: "La balise <style> est manquante." };
    }
    const body = ruleBody(css, ".grid");
    if (body === null) {
      return { ok: false, msg: "La règle .grid a disparu." };
    }
    const m = body.match(/grid-template-columns\s*:\s*([^;]+)/i);
    if (!m) {
      return {
        ok: false,
        msg: "Ajoute grid-template-columns sur .grid.",
      };
    }
    const value = m[1].trim();
    const trackCount = countGridTracks(value);
    if (trackCount < 3) {
      return {
        ok: false,
        msg: `Définis au moins 3 colonnes (actuellement ${trackCount}).`,
      };
    }
    return {
      ok: true,
      msg: "Colonnes tracées.",
      objList: ["o2a", "o2b"],
    };
  },
  // Step 3: gap (or row-gap / column-gap) on .grid
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) {
      return { ok: false, msg: "La balise <style> est manquante." };
    }
    if (
      !hasProperty(css, ".grid", "gap") &&
      !hasProperty(css, ".grid", "row-gap") &&
      !hasProperty(css, ".grid", "column-gap")
    ) {
      return {
        ok: false,
        msg: "Ajoute gap sur .grid.",
      };
    }
    return {
      ok: true,
      msg: "Grille aérée.",
      objList: ["o3a"],
    };
  },
  // Step 4: grid-template-rows on .grid
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) {
      return { ok: false, msg: "La balise <style> est manquante." };
    }
    if (!hasProperty(css, ".grid", "grid-template-rows")) {
      return {
        ok: false,
        msg: "Ajoute grid-template-rows sur .grid.",
      };
    }
    return {
      ok: true,
      msg: "Cartographie complète.",
      objList: ["o4a"],
      final: true,
    };
  },
];
