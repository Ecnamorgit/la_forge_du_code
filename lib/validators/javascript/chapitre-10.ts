import type { Validator } from "@/data/courses/html/types";
import { logsInclude, stripComments } from "./_utils";

function runtimeError(error: string | null): string | null {
  return error ? `Erreur d'exécution : ${error}` : null;
}

export const validators: Validator[] = [
  // Étape 1 : setItem puis getItem, affiche 'dark'
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Exécution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (!/localStorage\s*\.\s*setItem\s*\(/.test(stripped)) {
      return { ok: false, msg: "Utilise localStorage.setItem(clé, valeur)." };
    }
    if (!/localStorage\s*\.\s*getItem\s*\(/.test(stripped)) {
      return { ok: false, msg: "Lis avec localStorage.getItem(clé)." };
    }
    if (!logsInclude(ctx.logs, "dark")) {
      return { ok: false, msg: "La console doit afficher exactement 'dark'." };
    }
    return { ok: true, msg: "Mémoire opérationnelle.", objList: ["o1a", "o1b"] };
  },
  // Étape 2 : JSON.stringify et JSON.parse, affiche "Luna" et "8"
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Exécution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (!/JSON\s*\.\s*stringify\s*\(/.test(stripped)) {
      return { ok: false, msg: "Utilise JSON.stringify avant setItem." };
    }
    if (!/JSON\s*\.\s*parse\s*\(/.test(stripped)) {
      return { ok: false, msg: "Utilise JSON.parse après getItem." };
    }
    if (!logsInclude(ctx.logs, "Luna")) {
      return { ok: false, msg: "La console doit afficher 'Luna' (le nom)." };
    }
    if (!logsInclude(ctx.logs, "8")) {
      return { ok: false, msg: "La console doit aussi afficher le niveau (8)." };
    }
    return { ok: true, msg: "Objet persiste.", objList: ["o2a", "o2b"] };
  },
  // Étape 3 : removeItem, puis getItem renvoie null (affiche 'null')
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Exécution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (!/localStorage\s*\.\s*removeItem\s*\(/.test(stripped)) {
      return { ok: false, msg: "Utilise localStorage.removeItem(clé)." };
    }
    if (!logsInclude(ctx.logs, "null")) {
      return {
        ok: false,
        msg: "Après removeItem, getItem doit retourner null (et tu dois le logger).",
      };
    }
    return { ok: true, msg: "Clé effacée.", objList: ["o3a", "o3b"] };
  },
  // Étape 4 : fonction loadOrInit, affiche 80
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Exécution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (
      !/\bfunction\s+loadOrInit\s*\(/.test(stripped) &&
      !/\b(const|let|var)\s+loadOrInit\s*=/.test(stripped)
    ) {
      return { ok: false, msg: "Définis une fonction loadOrInit." };
    }
    if (!/localStorage\s*\.\s*getItem/.test(stripped)) {
      return { ok: false, msg: "Dans loadOrInit, lis localStorage avec getItem." };
    }
    if (!logsInclude(ctx.logs, "80")) {
      return { ok: false, msg: "La console doit afficher 80 (volume par défaut)." };
    }
    return { ok: true, msg: "Mémoire maîtrisée.", objList: ["o4a", "o4b"], final: true };
  },
];
