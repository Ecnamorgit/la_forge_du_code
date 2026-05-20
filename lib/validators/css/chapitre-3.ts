import type { Validator } from "@/data/courses/html/types";
import { extractStyleContent, hasProperty, hasPropertyWithValue } from "./_utils";

export const validators: Validator[] = [
  // Step 1: .module { width + height }
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) {
      return { ok: false, msg: "La balise <style> est manquante." };
    }
    if (!hasProperty(css, ".module", "width")) {
      return {
        ok: false,
        msg: "Ajoute une propriete width sur .module.",
      };
    }
    if (!hasProperty(css, ".module", "height")) {
      return {
        ok: false,
        msg: "Ajoute aussi une propriete height sur .module.",
      };
    }
    return {
      ok: true,
      msg: "Module dimensionne.",
      objList: ["o1a", "o1b"],
    };
  },
  // Step 2: padding on .module
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
  // Step 3: margin on .module
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
  // Step 4: border on .module
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
    // Verify the border value isn't 'none' or empty
    if (hasPropertyWithValue(css, ".module", "border", /^\s*none\s*$/i)) {
      return {
        ok: false,
        msg: "La border ne doit pas etre 'none'.",
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
