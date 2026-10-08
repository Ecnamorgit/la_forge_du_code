import type { Validator } from "@/data/courses/html/types";
import {
  hasConsoleLog,
  hasKeyword,
  logsInclude,
  stripComments,
} from "./_utils";

function runtimeError(error: string | null): string | null {
  if (!error) return null;
  return `Erreur d'exécution : ${error}`;
}

export const validators: Validator[] = [
  // Étape 1 : console.log("Bonjour, station Nebula")
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Exécution requise." };
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
      msg: "Signal reçu.",
      objList: ["o1a", "o1b"],
    };
  },
  // Étape 2 : une variable let, affichée avec console.log
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Exécution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    if (!hasKeyword(code, "let")) {
      return { ok: false, msg: "Utilise let pour déclarer une variable." };
    }
    if (!hasConsoleLog(code)) {
      return { ok: false, msg: "Logue ensuite la variable avec console.log." };
    }
    if (ctx.logs.length === 0) {
      return {
        ok: false,
        msg: "La console ne reçoit rien — vérifie ton console.log.",
      };
    }
    // Le console.log doit recevoir la variable elle-même, pas une chaîne.
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
      msg: "Variable affichée.",
      objList: ["o2a", "o2b"],
    };
  },
  // Étape 3 : const et 3 types primitifs affichés
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Exécution requise." };
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
      return { ok: false, msg: "Une des sorties doit être un booléen (true / false)." };
    }
    if (!hasNumber) {
      return { ok: false, msg: "Une des sorties doit être un nombre." };
    }
    if (!hasNonNumericString) {
      return { ok: false, msg: "Une des sorties doit être une chaîne de texte." };
    }
    return {
      ok: true,
      msg: "Trois types confirmés.",
      objList: ["o3a", "o3b"],
    };
  },
  // Étape 4 : template literal interpolant au moins 2 variables
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Exécution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    const tlMatch = stripped.match(/`[^`]*`/);
    if (!tlMatch) {
      return {
        ok: false,
        msg: "Utilise un template literal entouré de backticks (`...`).",
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
        msg: "Affiche le message composé avec console.log.",
      };
    }
    const hasExpectedContent = ctx.logs.some(
      (l) => /cadet/i.test(l) && /sel[ée]n[ée]/i.test(l)
    );
    if (!hasExpectedContent) {
      return {
        ok: false,
        msg: "Le message logué doit mentionner Cadet et SELENE.",
      };
    }
    return {
      ok: true,
      msg: "Message composé envoyé.",
      objList: ["o4a", "o4b"],
      final: true,
    };
  },
];
