import type { Validator } from "@/data/courses/html/types";
import { extractStyleContent, hasProperty, hasPropertyWithValue } from "./_utils";

export const validators: Validator[] = [
  // Étape 1 : .module { width; height }
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) {
      return { ok: false, msg: "La balise <style> est manquante." };
    }
    if (!hasProperty(css, ".module", "width")) {
      return {
        ok: false,
        msg: "Ajoute une propriété width sur .module.",
      };
    }
    if (!hasProperty(css, ".module", "height")) {
      return {
        ok: false,
        msg: "Ajoute aussi une propriété height sur .module.",
      };
    }
    return {
      ok: true,
      msg: "Module dimensionne.",
      objList: ["o1a", "o1b"],
    };
  },
  // Étape 2 : padding (ou une variante directionnelle) sur .module
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) {
      return { ok: false, msg: "La balise <style> est manquante." };
    }
    if (
      !hasProperty(css, ".module", "padding") &&
      !hasProperty(css, ".module", "padding-top") &&
      !hasProperty(css, ".module", "padding-right") &&
      !hasProperty(css, ".module", "padding-bottom") &&
      !hasProperty(css, ".module", "padding-left")
    ) {
      return {
        ok: false,
        msg: "Ajoute du padding sur .module.",
      };
    }
    return {
      ok: true,
      msg: "Padding applique.",
      objList: ["o2a"],
    };
  },
  // Étape 3 : margin (ou une variante directionnelle) sur .module
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) {
      return { ok: false, msg: "La balise <style> est manquante." };
    }
    if (
      !hasProperty(css, ".module", "margin") &&
      !hasProperty(css, ".module", "margin-top") &&
      !hasProperty(css, ".module", "margin-right") &&
      !hasProperty(css, ".module", "margin-bottom") &&
      !hasProperty(css, ".module", "margin-left")
    ) {
      return {
        ok: false,
        msg: "Ajoute du margin sur .module.",
      };
    }
    return {
      ok: true,
      msg: "Margin applique.",
      objList: ["o3a"],
    };
  },
  // Étape 4 : border sur .module
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) {
      return { ok: false, msg: "La balise <style> est manquante." };
    }
    if (!hasProperty(css, ".module", "border")) {
      return {
        ok: false,
        msg: "Ajoute une border sur .module.",
      };
    }
    // `border: none` ne compte pas.
    if (hasPropertyWithValue(css, ".module", "border", /^\s*none\s*$/i)) {
      return {
        ok: false,
        msg: "La border ne doit pas être 'none'.",
      };
    }
    return {
      ok: true,
      msg: "Module delimite.",
      objList: ["o4a", "o4b"],
      final: true,
    };
  },
];
