import type { Validator } from "@/data/courses/html/types";
import { logsContain, logsInclude, stripComments } from "./_utils";

function runtimeError(error: string | null): string | null {
  return error ? `Erreur d'execution : ${error}` : null;
}

export const validators: Validator[] = [
  // Step 1: object with >= 3 properties, logged
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Execution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    // Target the actual pilote object literal.
    const objMatch = stripped.match(
      /\b(?:const|let|var)\s+pilote\s*=\s*\{([\s\S]*?)\}\s*;?/
    );
    if (!objMatch) {
      return { ok: false, msg: "Declare un objet pilote entre accolades { ... }." };
    }
    const props = objMatch[1].match(/[a-zA-Z_$][\w$]*\s*:/g) ?? [];
    if (props.length < 3) {
      return {
        ok: false,
        msg: `L'objet doit avoir au moins 3 proprietes (actuellement ${props.length}).`,
      };
    }
    const hasObjectLog = ctx.logs.some(
      (l) => /^\s*\{/.test(l) || /\[object Object\]/.test(l)
    );
    if (!hasObjectLog) {
      return {
        ok: false,
        msg: "Logue l'objet (console.log doit afficher un objet).",
      };
    }
    return {
      ok: true,
      msg: "Fiche pilote creee.",
      objList: ["o1a", "o1b"],
    };
  },
  // Step 2: read .name + modify .level
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Execution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (!/\bpilote\s*\.\s*name\b/.test(stripped)) {
      return { ok: false, msg: "Lis pilote.name avec la notation point." };
    }
    if (!/\bpilote\s*\.\s*level\s*=\s*8\b/.test(stripped)) {
      return { ok: false, msg: "Affecte pilote.level = 8." };
    }
    if (!logsInclude(ctx.logs, "Cadet")) {
      return { ok: false, msg: 'La console doit afficher "Cadet".' };
    }
    if (!ctx.logs.some((l) => l.includes("8"))) {
      return {
        ok: false,
        msg: "Logue l'objet apres modification pour verifier level: 8.",
      };
    }
    return {
      ok: true,
      msg: "Fiche mise a jour.",
      objList: ["o2a", "o2b"],
    };
  },
  // Step 3: .toUpperCase + .length
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Execution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (!/\.toUpperCase\s*\(/.test(stripped)) {
      return { ok: false, msg: "Utilise la methode .toUpperCase()." };
    }
    if (!/\.length\b/.test(stripped)) {
      return { ok: false, msg: "Utilise la propriete .length." };
    }
    if (!logsInclude(ctx.logs, "NEBULA-7")) {
      return {
        ok: false,
        msg: 'La console doit afficher "NEBULA-7".',
      };
    }
    if (!logsInclude(ctx.logs, "8")) {
      return {
        ok: false,
        msg: 'La console doit aussi afficher 8 (longueur de "nebula-7").',
      };
    }
    return {
      ok: true,
      msg: "Chaine maitrisee.",
      objList: ["o3a", "o3b"],
    };
  },
  // Step 4: method greet() returning "Salut <name>"
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Execution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    // Accept either `pilote.greet = function()...` or method shorthand `greet() { ... }`
    if (
      !/\bgreet\s*\(\s*\)\s*\{/.test(stripped) &&
      !/\bgreet\s*[:=]\s*function/.test(stripped) &&
      !/\bgreet\s*[:=]\s*\(\s*\)\s*=>/.test(stripped)
    ) {
      return {
        ok: false,
        msg: "Ajoute une methode greet a pilote.",
      };
    }
    if (!/\bthis\.name\b/.test(stripped)) {
      return {
        ok: false,
        msg: "Dans greet, utilise this.name pour acceder au nom.",
      };
    }
    if (!logsContain(ctx.logs, "Salut Cadet")) {
      return {
        ok: false,
        msg: 'La console doit afficher "Salut Cadet".',
      };
    }
    return {
      ok: true,
      msg: "Objet intelligent. Cursus JS termine !",
      objList: ["o4a", "o4b"],
      final: true,
    };
  },
];
