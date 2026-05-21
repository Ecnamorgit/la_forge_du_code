import type { Validator } from "@/data/courses/html/types";
import { logsInclude, stripComments } from "./_utils";

function runtimeError(error: string | null): string | null {
  return error ? `Erreur d'execution : ${error}` : null;
}

export const validators: Validator[] = [
  // Step 1: setItem + getItem, log 'dark'
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Execution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (!/localStorage\s*\.\s*setItem\s*\(/.test(stripped)) {
      return { ok: false, msg: "Utilise localStorage.setItem(cle, valeur)." };
    }
    if (!/localStorage\s*\.\s*getItem\s*\(/.test(stripped)) {
      return { ok: false, msg: "Lis avec localStorage.getItem(cle)." };
    }
    if (!logsInclude(ctx.logs, "dark")) {
      return { ok: false, msg: "La console doit afficher exactement 'dark'." };
    }
    return { ok: true, msg: "Memoire operationnelle.", objList: ["o1a", "o1b"] };
  },
  // Step 2: JSON.stringify + JSON.parse, log "Luna" and "8"
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Execution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (!/JSON\s*\.\s*stringify\s*\(/.test(stripped)) {
      return { ok: false, msg: "Utilise JSON.stringify avant setItem." };
    }
    if (!/JSON\s*\.\s*parse\s*\(/.test(stripped)) {
      return { ok: false, msg: "Utilise JSON.parse apres getItem." };
    }
    if (!logsInclude(ctx.logs, "Luna")) {
      return { ok: false, msg: "La console doit afficher 'Luna' (le nom)." };
    }
    if (!logsInclude(ctx.logs, "8")) {
      return { ok: false, msg: "La console doit aussi afficher le niveau (8)." };
    }
    return { ok: true, msg: "Objet persiste.", objList: ["o2a", "o2b"] };
  },
  // Step 3: removeItem + getItem returns null, log 'null'
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Execution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (!/localStorage\s*\.\s*removeItem\s*\(/.test(stripped)) {
      return { ok: false, msg: "Utilise localStorage.removeItem(cle)." };
    }
    if (!logsInclude(ctx.logs, "null")) {
      return {
        ok: false,
        msg: "Apres removeItem, getItem doit retourner null (et tu dois le logger).",
      };
    }
    return { ok: true, msg: "Cle effacee.", objList: ["o3a", "o3b"] };
  },
  // Step 4: define loadOrInit fn, log 80
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Execution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (
      !/\bfunction\s+loadOrInit\s*\(/.test(stripped) &&
      !/\b(const|let|var)\s+loadOrInit\s*=/.test(stripped)
    ) {
      return { ok: false, msg: "Definis une fonction loadOrInit." };
    }
    if (!/localStorage\s*\.\s*getItem/.test(stripped)) {
      return { ok: false, msg: "Dans loadOrInit, lis localStorage avec getItem." };
    }
    if (!logsInclude(ctx.logs, "80")) {
      return { ok: false, msg: "La console doit afficher 80 (volume par defaut)." };
    }
    return { ok: true, msg: "Memoire maitrisee.", objList: ["o4a", "o4b"], final: true };
  },
];
