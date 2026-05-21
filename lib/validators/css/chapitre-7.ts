import type { Validator } from "@/data/courses/html/types";
import { extractStyleContent } from "./_utils";

/**
 * Check that a rule for `selector` has at least one declaration in its body.
 * `selector` is matched literally (escape special chars).
 */
function ruleHasDeclaration(css: string, selectorPattern: RegExp): string | null {
  // Find every rule body that matches the selector pattern.
  const ruleRe = /([^{}]+)\{([^}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = ruleRe.exec(css)) !== null) {
    if (selectorPattern.test(m[1].trim())) {
      const body = m[2].trim();
      if (body.length > 0) return body;
    }
  }
  return null;
}

export const validators: Validator[] = [
  // Step 1: .btn:hover { ... } with at least one decl
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) return { ok: false, msg: "La balise <style> est manquante." };
    const body = ruleHasDeclaration(css, /\.btn:hover\b/);
    if (!body) return { ok: false, msg: "Ajoute une regle .btn:hover { ... }." };
    return { ok: true, msg: "Feedback actif.", objList: ["o1a", "o1b"] };
  },
  // Step 2: .field:focus { ... } with at least one decl
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) return { ok: false, msg: "La balise <style> est manquante." };
    const body = ruleHasDeclaration(css, /\.field:focus\b/);
    if (!body) return { ok: false, msg: "Ajoute une regle .field:focus { ... }." };
    if (!/(border|box-shadow|outline|background)/i.test(body)) {
      return { ok: false, msg: "Donne un feedback visuel : border, box-shadow ou outline." };
    }
    return { ok: true, msg: "Focus accessible.", objList: ["o2a", "o2b"] };
  },
  // Step 3: .quote::before with content:
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) return { ok: false, msg: "La balise <style> est manquante." };
    const body = ruleHasDeclaration(css, /\.quote::before\b/);
    if (!body) return { ok: false, msg: "Ajoute une regle .quote::before { ... }." };
    if (!/\bcontent\s*:/i.test(body)) {
      return { ok: false, msg: "Un pseudo-element a besoin d'une propriete content: \"...\" pour s'afficher." };
    }
    return { ok: true, msg: "Element fantome cree.", objList: ["o3a", "o3b"] };
  },
  // Step 4: li:nth-child(...) with background
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) return { ok: false, msg: "La balise <style> est manquante." };
    const body = ruleHasDeclaration(css, /li:nth-child\([^)]+\)/);
    if (!body) {
      return { ok: false, msg: "Ajoute une regle li:nth-child(even) ou (odd) { ... }." };
    }
    if (!/\bbackground/i.test(body)) {
      return { ok: false, msg: "Definis un background pour faire l'effet zebrure." };
    }
    return { ok: true, msg: "Motif en zebrure.", objList: ["o4a", "o4b"], final: true };
  },
];
