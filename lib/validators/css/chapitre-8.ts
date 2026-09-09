import type { Validator } from "@/data/courses/html/types";
import { extractStyleContent, hasProperty, ruleBody } from "./_utils";

export const validators: Validator[] = [
  // Step 1: .container uses max-width and NOT raw width: 800px
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) return { ok: false, msg: "La balise <style> est manquante." };
    if (!hasProperty(css, ".container", "max-width")) {
      return { ok: false, msg: "Utilise max-width sur .container." };
    }
    const body = ruleBody(css, ".container");
    // `(?<![-\w])` et non `\b` : dans `max-width`, le tiret est un non-mot, donc
    // `\bwidth` matcherait a l'interieur — et la solution du cours
    // (`max-width: 800px; width: 100%`) serait refusee par sa propre etape.
    if (body && /(?<![-\w])width\s*:\s*800px\b/i.test(body)) {
      return { ok: false, msg: "Retire width: 800px en dur (max-width suffit, ou utilise width: 100%)." };
    }
    return { ok: true, msg: "Fluidite active.", objList: ["o1a", "o1b"] };
  },
  // Step 2: @media query exists redefining h1 font-size
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) return { ok: false, msg: "La balise <style> est manquante." };
    if (!/@media\b/i.test(css)) {
      return { ok: false, msg: "Ajoute une règle @media (...) { ... }." };
    }
    // Check that there's an @media block containing h1 with font-size
    if (!/@media\b[^{]+\{[\s\S]*?h1\s*\{[\s\S]*?font-size[\s\S]*?\}/i.test(css)) {
      return {
        ok: false,
        msg: "Dans ta media query, redefinis font-size sur h1.",
      };
    }
    return { ok: true, msg: "Typographie adaptative.", objList: ["o2a", "o2b"] };
  },
  // Step 3: @media reducing .grid grid-template-columns to 1fr (or fewer cols)
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) return { ok: false, msg: "La balise <style> est manquante." };
    if (!/@media\b[^{]*max-width|@media\b[^{]*min-width/i.test(css)) {
      return { ok: false, msg: "Ajoute une @media query avec max-width ou min-width." };
    }
    // Check that inside an @media block, .grid is redefined with grid-template-columns of 1fr.
    const mediaBlocks = css.matchAll(/@media\b[^{]*\{([\s\S]*?)\}\s*\}/g);
    let ok = false;
    for (const blk of mediaBlocks) {
      const inner = blk[1];
      if (/\.grid\s*\{[\s\S]*?grid-template-columns\s*:\s*1fr\s*[;}]/i.test(inner)) {
        ok = true;
        break;
      }
    }
    if (!ok) {
      return { ok: false, msg: "Dans ta media query, ajoute .grid { grid-template-columns: 1fr; }." };
    }
    return { ok: true, msg: "Disposition reconfigurée.", objList: ["o3a", "o3b"] };
  },
  // Step 4: h1 uses clamp() with a vw unit
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) return { ok: false, msg: "La balise <style> est manquante." };
    const h1Body = ruleBody(css, "h1");
    if (!h1Body) return { ok: false, msg: "Garde une règle pour h1." };
    if (!/font-size\s*:\s*clamp\s*\(/i.test(h1Body)) {
      return { ok: false, msg: "Utilise clamp(...) pour font-size de h1." };
    }
    if (!/\d+\s*v(w|min|max)\b/i.test(h1Body)) {
      return { ok: false, msg: "Le clamp doit inclure une unité vw (ex: 4vw)." };
    }
    return { ok: true, msg: "Typographie fluide.", objList: ["o4a", "o4b"], final: true };
  },
];
