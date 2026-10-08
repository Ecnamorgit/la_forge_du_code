import type { Validator } from "@/data/courses/html/types";
import { extractStyleContent, hasPropertyWithValue, ruleBody } from "./_utils";

/**
 * Un décalage est-il posé ? `(?<![-\w])` plutôt que `\b` : sinon le `top` de
 * `padding-top` compterait comme un décalage de positionnement.
 */
function hasOffset(body: string): boolean {
  return /(?<![-\w])(top|right|bottom|left)\s*:\s*[^;\s][^;]*/i.test(body);
}

export const validators: Validator[] = [
  // Étape 1 : .badge { position: relative } avec un décalage
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) return { ok: false, msg: "La balise <style> est manquante." };
    if (!hasPropertyWithValue(css, ".badge", "position", /\brelative\b/i)) {
      return { ok: false, msg: "Définis position: relative sur .badge." };
    }
    const body = ruleBody(css, ".badge");
    if (!body || !hasOffset(body)) {
      return { ok: false, msg: "Ajoute top et/ou left avec une valeur non nulle sur .badge." };
    }
    return { ok: true, msg: "Positionnement fin.", objList: ["o1a", "o1b"] };
  },
  // Étape 2 : .card en position relative, .ribbon en absolute avec un décalage
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) return { ok: false, msg: "La balise <style> est manquante." };
    if (!hasPropertyWithValue(css, ".card", "position", /\brelative\b/i)) {
      return { ok: false, msg: "Donne position: relative a .card pour ancrer son enfant." };
    }
    if (!hasPropertyWithValue(css, ".ribbon", "position", /\babsolute\b/i)) {
      return { ok: false, msg: "Définis position: absolute sur .ribbon." };
    }
    const body = ruleBody(css, ".ribbon");
    if (!body || !hasOffset(body)) {
      return { ok: false, msg: "Ajoute top/right/bottom/left sur .ribbon pour l'ancrer dans un coin." };
    }
    return { ok: true, msg: "Enfant verrouille.", objList: ["o2a", "o2b"] };
  },
  // Étape 3 : .topbar { position: fixed; top: 0 }
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) return { ok: false, msg: "La balise <style> est manquante." };
    if (!hasPropertyWithValue(css, ".topbar", "position", /\bfixed\b/i)) {
      return { ok: false, msg: "Définis position: fixed sur .topbar." };
    }
    if (!hasPropertyWithValue(css, ".topbar", "top", /^\s*0(px)?\s*$/i)) {
      return { ok: false, msg: "Ancre la barre avec top: 0." };
    }
    return { ok: true, msg: "Barre verrouillee.", objList: ["o3a", "o3b"] };
  },
  // Étape 4 : .section-title { position: sticky } avec un top ou un bottom
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) return { ok: false, msg: "La balise <style> est manquante." };
    if (!hasPropertyWithValue(css, ".section-title", "position", /\bsticky\b/i)) {
      return { ok: false, msg: "Définis position: sticky sur .section-title." };
    }
    const body = ruleBody(css, ".section-title");
    if (!body || !/(?<![-\w])(?:top|bottom)\s*:\s*[^;]/i.test(body)) {
      return { ok: false, msg: "Sticky exige un top (ou bottom) défini. Ajoute top: 0 par exemple." };
    }
    return { ok: true, msg: "Positionnement maîtrise.", objList: ["o4a", "o4b"], final: true };
  },
];
