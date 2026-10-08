import type { Validator } from "@/data/courses/html/types";
import { extractStyleContent, hasProperty, hasPropertyWithValue } from "./_utils";

export const validators: Validator[] = [
  // Étape 1 : .alert { color: ... }
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) {
      return { ok: false, msg: "La balise <style> est manquante." };
    }
    if (!hasProperty(css, ".alert", "color")) {
      return {
        ok: false,
        msg: "Ajoute une règle .alert { color: ... } pour cibler la classe.",
      };
    }
    return {
      ok: true,
      msg: "Classe ciblée.",
      objList: ["o1a", "o1b"],
    };
  },
  // Étape 2 : #status { color: ... }
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) {
      return { ok: false, msg: "La balise <style> est manquante." };
    }
    if (!hasProperty(css, "#status", "color")) {
      return {
        ok: false,
        msg: "Ajoute une règle #status { color: ... } pour cibler l'id.",
      };
    }
    return {
      ok: true,
      msg: "Identifiant unique ciblé.",
      objList: ["o2a", "o2b"],
    };
  },
  // Étape 3 : h1 { color } en hexadécimal ou en rgb()
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) {
      return { ok: false, msg: "La balise <style> est manquante." };
    }
    // Hex : #rgb, #rrggbb ou #rrggbbaa. RGB : canaux de 0 à 255.
    const hex = /#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})\b/i;
    const channel = "(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)";
    const rgb = new RegExp(
      `rgba?\\s*\\(\\s*${channel}\\s*,\\s*${channel}\\s*,\\s*${channel}(?:\\s*,\\s*[\\d.]+)?\\s*\\)`,
      "i"
    );
    if (
      !hasPropertyWithValue(css, "h1", "color", hex) &&
      !hasPropertyWithValue(css, "h1", "color", rgb)
    ) {
      return {
        ok: false,
        msg: "La couleur du <h1> doit être un hex (#xxxxxx) valide ou rgb(0-255, 0-255, 0-255).",
      };
    }
    return {
      ok: true,
      msg: "Teinte personnalisée.",
      objList: ["o3a", "o3b"],
    };
  },
  // Étape 4 : h1 { text-align } et .alert { font-weight }
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) {
      return { ok: false, msg: "La balise <style> est manquante." };
    }
    if (!hasProperty(css, "h1", "text-align")) {
      return {
        ok: false,
        msg: "Ajoute text-align sur le <h1>.",
      };
    }
    if (!hasProperty(css, ".alert", "font-weight")) {
      return {
        ok: false,
        msg: "Ajoute font-weight sur .alert.",
      };
    }
    return {
      ok: true,
      msg: "Typographie tactique en place.",
      objList: ["o4a", "o4b"],
      final: true,
    };
  },
];
