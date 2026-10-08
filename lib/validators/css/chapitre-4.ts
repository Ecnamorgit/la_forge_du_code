import type { Validator } from "@/data/courses/html/types";
import { extractStyleContent, hasProperty, hasPropertyWithValue } from "./_utils";

export const validators: Validator[] = [
  // Étape 1 : .container { display: flex }
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) {
      return { ok: false, msg: "La balise <style> est manquante." };
    }
    if (!hasPropertyWithValue(css, ".container", "display", /\bflex\b/i)) {
      return {
        ok: false,
        msg: "Ajoute display: flex sur .container.",
      };
    }
    return {
      ok: true,
      msg: "Flexbox active.",
      objList: ["o1a"],
    };
  },
  // Étape 2 : justify-content sur .container
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) {
      return { ok: false, msg: "La balise <style> est manquante." };
    }
    if (!hasProperty(css, ".container", "justify-content")) {
      return {
        ok: false,
        msg: "Ajoute justify-content sur .container.",
      };
    }
    return {
      ok: true,
      msg: "Répartition reussie.",
      objList: ["o2a"],
    };
  },
  // Étape 3 : align-items sur .container
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) {
      return { ok: false, msg: "La balise <style> est manquante." };
    }
    if (!hasProperty(css, ".container", "align-items")) {
      return {
        ok: false,
        msg: "Ajoute align-items sur .container.",
      };
    }
    return {
      ok: true,
      msg: "Alignement vertical en place.",
      objList: ["o3a"],
    };
  },
  // Étape 4 : gap sur .container
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) {
      return { ok: false, msg: "La balise <style> est manquante." };
    }
    if (
      !hasProperty(css, ".container", "gap") &&
      !hasProperty(css, ".container", "row-gap") &&
      !hasProperty(css, ".container", "column-gap")
    ) {
      return {
        ok: false,
        msg: "Ajoute gap sur .container.",
      };
    }
    return {
      ok: true,
      msg: "Formation parfaite.",
      objList: ["o4a"],
      final: true,
    };
  },
];
