import type { Validator } from "@/data/courses/html/types";
import { extractStyleContent, hasProperty } from "./_utils";

export const validators: Validator[] = [
  // Step 1: <style> in <head>
  (code) => {
    const headMatch = code.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i);
    if (!headMatch) {
      return { ok: false, msg: "Le <head> est manquant — replace-le." };
    }
    if (!/<style\b[^>]*>[\s\S]*?<\/style>/i.test(headMatch[1])) {
      return {
        ok: false,
        msg: "Ajoute une balise <style></style> a l'interieur du <head>.",
      };
    }
    return {
      ok: true,
      msg: "Console graphique branchee.",
      objList: ["o1a", "o1b"],
    };
  },
  // Step 2: h1 { color: ... }
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) {
      return { ok: false, msg: "La balise <style> a disparu — replace-la." };
    }
    if (!hasProperty(css, "h1", "color")) {
      return {
        ok: false,
        msg: "Ajoute une regle h1 { color: ... } dans le <style>.",
      };
    }
    return {
      ok: true,
      msg: "Titre illumine.",
      objList: ["o2a", "o2b"],
    };
  },
  // Step 3: body { background-color: ... }
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) {
      return { ok: false, msg: "La balise <style> est manquante." };
    }
    if (!hasProperty(css, "body", "background-color")) {
      return {
        ok: false,
        msg: "Ajoute body { background-color: ... } dans le <style>.",
      };
    }
    return {
      ok: true,
      msg: "Fond spatial active.",
      objList: ["o3a", "o3b"],
    };
  },
  // Step 4: font-size on some element
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) {
      return { ok: false, msg: "La balise <style> est manquante." };
    }
    if (!hasProperty(css, "p", "font-size")) {
      return {
        ok: false,
        msg: "Ajoute une regle p { font-size: ... } dans le <style>.",
      };
    }
    return {
      ok: true,
      msg: "Texte amplifie.",
      objList: ["o4a", "o4b"],
      final: true,
    };
  },
];
