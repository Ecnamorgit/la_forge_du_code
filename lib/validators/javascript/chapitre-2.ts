import type { Validator } from "@/data/courses/html/types";
import { logsInclude, stripComments } from "./_utils";

function runtimeError(error: string | null): string | null {
  return error ? `Erreur d'execution : ${error}` : null;
}

export const validators: Validator[] = [
  // Étape 1 : calcul arithmétique, affiche 56
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
  // Étape 2 : comparaison qui affiche false
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
      msg: "Booléen confirme.",
      objList: ["o2a", "o2b"],
    };
  },
  // Étape 3 : if/else qui affiche "ALERTE"
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
    // La condition doit vraiment comparer `niveauBouclier` : `if (true)` ne
    // suffit pas.
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
        msg: 'La console doit afficher "ALERTE" (le bouclier est a 25).',
      };
    }
    // "OK" en plus de "ALERTE" trahit une sortie codée en dur.
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
  // Étape 4 : else if qui affiche "OK"
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Exécution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (!/\belse\s+if\s*\(/.test(stripped)) {
      return { ok: false, msg: "Utilise au moins un else if (...)." };
    }
    // Un `else` qui n'est pas suivi de `if` : le `else` d'un `else if` ne
    // compte pas.
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
      msg: "Trois zones distinguees.",
      objList: ["o4a", "o4b"],
      final: true,
    };
  },
];
