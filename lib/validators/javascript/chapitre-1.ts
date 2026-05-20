import type { Validator } from "@/data/courses/html/types";
import {
  hasConsoleLog,
  hasKeyword,
  logsInclude,
  stripComments,
} from "./_utils";

function runtimeError(error: string | null): string | null {
  if (!error) return null;
  return `Erreur d'execution : ${error}`;
}

export const validators: Validator[] = [
  // Step 1: console.log("Bonjour, station Nebula")
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Execution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    if (!hasConsoleLog(code)) {
      return { ok: false, msg: "Utilise console.log(...) pour afficher un message." };
    }
    if (!logsInclude(ctx.logs, "Bonjour, station Nebula")) {
      return {
        ok: false,
        msg: 'La console doit afficher exactement : Bonjour, station Nebula',
      };
    }
    return {
      ok: true,
      msg: "Signal recu.",
      objList: ["o1a", "o1b"],
    };
  },
  // Step 2: let variable + console.log of it
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Execution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    if (!hasKeyword(code, "let")) {
      return { ok: false, msg: "Utilise let pour declarer une variable." };
    }
    if (!hasConsoleLog(code)) {
      return { ok: false, msg: "Logue ensuite la variable avec console.log." };
    }
    if (ctx.logs.length === 0) {
      return {
        ok: false,
        msg: "La console ne recoit rien — verifie ton console.log.",
      };
    }
    // Ensure the logged value isn't literally the word of a variable name (i.e. quoted)
    const stripped = stripComments(code);
    const letMatch = stripped.match(/\blet\s+([a-zA-Z_$][\w$]*)\s*=/);
    if (!letMatch) {
      return { ok: false, msg: "Forme attendue : let nom = valeur;" };
    }
    const varName = letMatch[1];
    const logsVariable = new RegExp(
      String.raw`\bconsole\s*\.\s*(?:log|info|warn|error|debug)\s*\(\s*${varName}\s*\)`
    ).test(stripped);
    if (!logsVariable) {
      return {
        ok: false,
        msg: `Affiche la variable ${varName} avec console.log(${varName}).`,
      };
    }
    return {
      ok: true,
      msg: "Variable affichee.",
      objList: ["o2a", "o2b"],
    };
  },
  // Step 3: const + 3 types primitifs
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Execution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    if (!hasKeyword(code, "const")) {
      return { ok: false, msg: "Utilise au moins une fois const." };
    }
    if (ctx.logs.length < 3) {
      return {
        ok: false,
        msg: `Affiche au moins 3 valeurs (actuellement ${ctx.logs.length}).`,
      };
    }
    const joined = ctx.logs.join("\n");
    const hasBoolean = /\b(?:true|false)\b/.test(joined);
    const hasNumber = ctx.logs.some((l) => /^-?\d+(?:\.\d+)?$/.test(l.trim()));
    const hasNonNumericString = ctx.logs.some(
      (l) => l.trim() !== "" && !/^-?\d+(?:\.\d+)?$/.test(l.trim()) && !/^(?:true|false)$/.test(l.trim())
    );
    if (!hasBoolean) {
      return { ok: false, msg: "Une des sorties doit etre un booleen (true / false)." };
    }
    if (!hasNumber) {
      return { ok: false, msg: "Une des sorties doit etre un nombre." };
    }
    if (!hasNonNumericString) {
      return { ok: false, msg: "Une des sorties doit etre une chaine de texte." };
    }
    return {
      ok: true,
      msg: "Trois types confirmes.",
      objList: ["o3a", "o3b"],
    };
  },
  // Step 4: template literal interpolating >= 2 variables
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Execution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    // Template literal with at least 2 interpolations
    const tlMatch = stripped.match(/`[^`]*`/);
    if (!tlMatch) {
      return {
        ok: false,
        msg: "Utilise un template literal entoure de backticks (`...`).",
      };
    }
    const interpolations = (tlMatch[0].match(/\$\{[^}]+\}/g) ?? []).length;
    if (interpolations < 2) {
      return {
        ok: false,
        msg: `Interpole au moins 2 variables avec \${...} (actuellement ${interpolations}).`,
      };
    }
    if (ctx.logs.length === 0) {
      return {
        ok: false,
        msg: "Affiche le message compose avec console.log.",
      };
    }
    const hasExpectedContent = ctx.logs.some(
      (l) => /cadet/i.test(l) && /sel[ée]n[ée]/i.test(l)
    );
    if (!hasExpectedContent) {
      return {
        ok: false,
        msg: "Le message logue doit mentionner Cadet et SELENE.",
      };
    }
    return {
      ok: true,
      msg: "Message compose envoye.",
      objList: ["o4a", "o4b"],
      final: true,
    };
  },
];
