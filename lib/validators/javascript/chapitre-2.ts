import type { Validator } from "@/data/courses/html/types";
import { logsInclude, stripComments } from "./_utils";

function runtimeError(error: string | null): string | null {
  return error ? `Erreur d'exécution : ${error}` : null;
}

export const validators: Validator[] = [
  // Step 1: arithmetic calculation, prints 56
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Exécution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (!/[+\-*/%]/.test(stripped)) {
      return { ok: false, msg: "Utilise au moins un opérateur arithmétique (+ - * /)." };
    }
    if (!logsInclude(ctx.logs, "56")) {
      return {
        ok: false,
        msg: "La console doit afficher 56 (carburant - consommation * 2).",
      };
    }
    return {
      ok: true,
      msg: "Calcul valide.",
      objList: ["o1a", "o1b"],
    };
  },
  // Step 2: comparison that prints false
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Exécution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (!/[<>]=?|===|!==/.test(stripped)) {
      return { ok: false, msg: "Utilise un opérateur de comparaison (>, <, >=, etc.)." };
    }
    if (!logsInclude(ctx.logs, "false")) {
      return {
        ok: false,
        msg: 'La sortie attendue est exactement "false".',
      };
    }
    return {
      ok: true,
      msg: "Booléen confirmé.",
      objList: ["o2a", "o2b"],
    };
  },
  // Step 3: if/else that prints "ALERTE"
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Exécution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (!/\bif\s*\(/.test(stripped)) {
      return { ok: false, msg: "Utilise une instruction if (...)." };
    }
    if (!/\belse\b/.test(stripped)) {
      return { ok: false, msg: "Ajoute une branche else." };
    }
    // The condition must actually compare `niveauBouclier`: `if (true)` is
    // not enough.
    const conditionRe =
      /\bif\s*\(\s*[^)]*\bniveauBouclier\b[^)]*(?:<=?|>=?|===|!==)[^)]*\)|\bif\s*\(\s*[^)]*(?:<=?|>=?|===|!==)[^)]*\bniveauBouclier\b[^)]*\)/;
    if (!conditionRe.test(stripped)) {
      return {
        ok: false,
        msg: "La condition doit comparer niveauBouclier avec un nombre (ex: niveauBouclier < 30).",
      };
    }
    if (!logsInclude(ctx.logs, "ALERTE")) {
      return {
        ok: false,
        msg: 'La console doit afficher "ALERTE" (le bouclier est à 25).',
      };
    }
    // "OK" on top of "ALERTE" gives away hard-coded output.
    if (logsInclude(ctx.logs, "OK")) {
      return {
        ok: false,
        msg: 'La console ne doit afficher que "ALERTE" ici (bouclier = 25, donc la branche else ne doit pas s\'exécuter).',
      };
    }
    return {
      ok: true,
      msg: "Réaction correcte.",
      objList: ["o3a", "o3b"],
    };
  },
  // Step 4: else if that prints "OK"
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Exécution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (!/\belse\s+if\s*\(/.test(stripped)) {
      return { ok: false, msg: "Utilise au moins un else if (...)." };
    }
    // An `else` that is not followed by `if`: the `else` of an `else if` does
    // not count.
    if (!/\belse\b(?!\s*if\b)/.test(stripped)) {
      return { ok: false, msg: "Ajoute aussi une branche else finale." };
    }
    if (!logsInclude(ctx.logs, "OK")) {
      return {
        ok: false,
        msg: 'La console doit afficher exactement "OK" (température = 72).',
      };
    }
    return {
      ok: true,
      msg: "Trois zones distinguées.",
      objList: ["o4a", "o4b"],
      final: true,
    };
  },
];
