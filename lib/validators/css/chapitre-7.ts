import type { Validator } from "@/data/courses/html/types";
import { extractStyleContent } from "./_utils";

/**
 * Renvoie le corps non vide de la première règle dont le sélecteur satisfait
 * `selectorPattern`, ou null.
 */
function ruleHasDeclaration(css: string, selectorPattern: RegExp): string | null {
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
  // Étape 1 : .btn:hover avec au moins une déclaration
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) return { ok: false, msg: "La balise <style> est manquante." };
    const body = ruleHasDeclaration(css, /\.btn:hover\b/);
    if (!body) return { ok: false, msg: "Ajoute une règle .btn:hover { ... }." };
    return { ok: true, msg: "Feedback actif.", objList: ["o1a", "o1b"] };
  },
  // Étape 2 : .field:focus avec border, box-shadow, outline ou background
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) return { ok: false, msg: "La balise <style> est manquante." };
    const body = ruleHasDeclaration(css, /\.field:focus\b/);
    if (!body) return { ok: false, msg: "Ajoute une règle .field:focus { ... }." };
    if (!/(border|box-shadow|outline|background)/i.test(body)) {
      return { ok: false, msg: "Donne un feedback visuel : border, box-shadow ou outline." };
    }
    return { ok: true, msg: "Focus accessible.", objList: ["o2a", "o2b"] };
  },
  // Étape 3 : .quote::before avec une propriété content
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) return { ok: false, msg: "La balise <style> est manquante." };
    const body = ruleHasDeclaration(css, /\.quote::before\b/);
    if (!body) return { ok: false, msg: "Ajoute une règle .quote::before { ... }." };
    // `(?<![-\w])` plutôt que `\b`, sinon `justify-content` ou `align-content`
    // compteraient comme `content`.
    if (!/(?<![-\w])content\s*:/i.test(body)) {
      return { ok: false, msg: "Un pseudo-élément a besoin d'une propriété content: \"...\" pour s'afficher." };
    }
    return { ok: true, msg: "Élément fantôme créé.", objList: ["o3a", "o3b"] };
  },
  // Étape 4 : li:nth-child(...) avec un background
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) return { ok: false, msg: "La balise <style> est manquante." };
    const body = ruleHasDeclaration(css, /li:nth-child\([^)]+\)/);
    if (!body) {
      return { ok: false, msg: "Ajoute une règle li:nth-child(even) ou (odd) { ... }." };
    }
    if (!/\bbackground/i.test(body)) {
      return { ok: false, msg: "Définis un background pour faire l'effet zébrure." };
    }
    return { ok: true, msg: "Motif en zébrure.", objList: ["o4a", "o4b"], final: true };
  },
];
