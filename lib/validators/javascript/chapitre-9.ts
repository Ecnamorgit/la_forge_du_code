import type { Validator } from "@/data/courses/html/types";
import { logsContain, logsInclude, stripComments } from "./_utils";

function runtimeError(error: string | null): string | null {
  return error ? `Erreur d'execution : ${error}` : null;
}

/**
 * Async chapter — the sandbox runs sync and returns when the IIFE returns.
 * Our chapters use small setTimeout delays (10-50ms), and the sandbox has a
 * 3s timeout, so this works in practice. We accept up to ~200ms of total
 * async work per step.
 */
export const validators: Validator[] = [
  // Step 1: new Promise + .then logs 'OK'
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Exécution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (!/new\s+Promise\s*\(/.test(stripped)) {
      return { ok: false, msg: "Utilise new Promise(...) pour créer une promesse." };
    }
    if (!/\.then\s*\(/.test(stripped)) {
      return { ok: false, msg: "Utilise .then() pour consommer la valeur." };
    }
    if (!logsInclude(ctx.logs, "OK")) {
      return {
        ok: false,
        msg: "La console doit afficher exactement 'OK' (résultat de la Promise).",
      };
    }
    return { ok: true, msg: "Promesse tenue.", objList: ["o1a", "o1b"] };
  },
  // Step 2: async function + await logs 'Mission lunaire'
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Exécution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (!/\basync\s+(function|\()/.test(stripped) && !/\basync\s*=>/.test(stripped) && !/\basync\s*\(/.test(stripped)) {
      return { ok: false, msg: "Déclare une fonction async." };
    }
    if (!/\bawait\b/.test(stripped)) {
      return { ok: false, msg: "Utilise await pour récupérer la valeur." };
    }
    if (!logsContain(ctx.logs, "Mission lunaire")) {
      return { ok: false, msg: "La console doit afficher 'Mission lunaire'." };
    }
    return { ok: true, msg: "Flux synchronise.", objList: ["o2a", "o2b"] };
  },
  // Step 3: try/catch with await, log contains 'timeout'
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Exécution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (!/\btry\s*\{/.test(stripped) || !/\bcatch\s*\(/.test(stripped)) {
      return { ok: false, msg: "Utilise try { ... } catch (err) { ... }." };
    }
    if (!/\bawait\b/.test(stripped)) {
      return { ok: false, msg: "Le try doit contenir un await." };
    }
    if (!logsContain(ctx.logs, "timeout")) {
      return { ok: false, msg: "La console doit logger une chaîne contenant 'timeout'." };
    }
    return { ok: true, msg: "Erreur interceptee.", objList: ["o3a", "o3b"] };
  },
  // Step 4: Promise.all returning [1,2,3]
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Exécution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (!/Promise\.all\s*\(/.test(stripped)) {
      return { ok: false, msg: "Utilise Promise.all([...])." };
    }
    // logs should include the array printed — should contain "1", "2", "3"
    const all = ctx.logs.join(" ");
    if (!/1/.test(all) || !/2/.test(all) || !/3/.test(all)) {
      return {
        ok: false,
        msg: "La console doit afficher un tableau contenant 1, 2, 3.",
      };
    }
    return { ok: true, msg: "Opérations groupees.", objList: ["o4a", "o4b"], final: true };
  },
];
