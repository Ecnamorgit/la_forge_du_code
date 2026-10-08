import type { Validator } from "@/data/courses/html/types";
import { logsInclude, stripComments } from "./_utils";

function runtimeError(error: string | null): string | null {
  return error ? `Erreur d'exécution : ${error}` : null;
}

export const validators: Validator[] = [
  // Étape 1 : un tableau d'au moins 3 éléments, affiché
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Exécution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (!/\[\s*[^\]]*[^,\s][^\]]*\]/.test(stripped)) {
      return { ok: false, msg: "Déclare un tableau avec des éléments." };
    }
    if (ctx.logs.length === 0) {
      return { ok: false, msg: "Logue le tableau avec console.log." };
    }
    const arrayLog = ctx.logs.find((l) => /^\s*\[/.test(l));
    if (!arrayLog) {
      return {
        ok: false,
        msg: "La console doit afficher un tableau (entre [ et ]).",
      };
    }
    try {
      const parsed = JSON.parse(arrayLog);
      if (!Array.isArray(parsed) || parsed.length < 3) {
        return {
          ok: false,
          msg: "Le tableau doit contenir au moins 3 éléments.",
        };
      }
    } catch {
      return {
        ok: false,
        msg: "Le tableau affiché n'est pas lisible — vérifie sa syntaxe.",
      };
    }
    return {
      ok: true,
      msg: "Inventaire dressé.",
      objList: ["o1a", "o1b"],
    };
  },
  // Étape 2 : push, puis affiche la nouvelle longueur (4)
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Exécution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (!/\.push\s*\(/.test(stripped)) {
      return { ok: false, msg: "Utilise la méthode .push(...)." };
    }
    if (!logsInclude(ctx.logs, "4")) {
      return {
        ok: false,
        msg: "La console doit afficher 4 (nouvelle longueur).",
      };
    }
    return {
      ok: true,
      msg: "Vaisseau ajouté.",
      objList: ["o2a", "o2b"],
    };
  },
  // Étape 3 : boucle for, au moins 4 lignes affichées
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Exécution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (!/\bfor\s*\(/.test(stripped)) {
      return { ok: false, msg: "Utilise une boucle for (...)." };
    }
    if (ctx.logs.length < 4) {
      return {
        ok: false,
        msg: `La boucle doit produire 4 lignes (actuellement ${ctx.logs.length}).`,
      };
    }
    return {
      ok: true,
      msg: "Roll call effectué.",
      objList: ["o3a", "o3b"],
    };
  },
  // Étape 4 : boucle for dont la somme affichée vaut 860
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Exécution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (!/\bfor\s*\(/.test(stripped)) {
      return { ok: false, msg: "Utilise une boucle for (...)." };
    }
    if (!logsInclude(ctx.logs, "860")) {
      return {
        ok: false,
        msg: "La console doit afficher 860 (somme totale).",
      };
    }
    return {
      ok: true,
      msg: "Total vérifié.",
      objList: ["o4a", "o4b"],
      final: true,
    };
  },
];
