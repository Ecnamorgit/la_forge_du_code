import type { Validator } from "@/data/courses/html/types";
import { logsContain, logsInclude, stripComments } from "./_utils";

function runtimeError(error: string | null): string | null {
  return error ? `Erreur d'exécution : ${error}` : null;
}

export const validators: Validator[] = [
  // Step 1: greet(name) returns "Bonjour, <name>", called with "Cadet"
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Exécution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (
      !/\bfunction\s+greet\s*\(/.test(stripped) &&
      !/\b(?:const|let|var)\s+greet\s*=\s*(?:function|\()/.test(stripped)
    ) {
      return { ok: false, msg: "Déclare une fonction nommée greet." };
    }
    if (!/\breturn\b/.test(stripped)) {
      return { ok: false, msg: "La fonction doit utiliser return." };
    }
    if (!logsContain(ctx.logs, "Cadet")) {
      return {
        ok: false,
        msg: 'La console doit contenir un message avec "Cadet".',
      };
    }
    return {
      ok: true,
      msg: "Première fonction validée.",
      objList: ["o1a", "o1b"],
    };
  },
  // Step 2: addXp(120, 50) returns 170
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Exécution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (
      !/\bfunction\s+addXp\s*\(\s*\w+\s*,\s*\w+/.test(stripped) &&
      !/\b(?:const|let|var)\s+addXp\s*=\s*(?:function\s*\(\s*\w+\s*,\s*\w+|\(\s*\w+\s*,\s*\w+)/.test(
        stripped
      )
    ) {
      return {
        ok: false,
        msg: "Déclare addXp avec deux paramètres.",
      };
    }
    if (!/\baddXp\s*\(\s*120\s*,\s*50\s*\)/.test(stripped)) {
      return { ok: false, msg: "Teste la fonction avec addXp(120, 50)." };
    }
    if (
      !/\bfunction\s+addXp[\s\S]*?\{[\s\S]*?\+[\s\S]*?\}/.test(stripped) &&
      !/\baddXp\s*=\s*(?:function|\()([\s\S]*?)=>[\s\S]*?\+/.test(stripped)
    ) {
      return { ok: false, msg: "La logique de addXp doit additionner les 2 valeurs." };
    }
    // The function must return the sum; the caller prints it. Each body form
    // has its own requirement: a braced body always contains a `+` here, so it
    // must not benefit from the concise arrow's leniency, otherwise
    // `{ console.log(a + b); }` would pass.
    const braceBody =
      stripped.match(/\bfunction\s+addXp\s*\([^)]*\)\s*\{([\s\S]*?)\}/) ||
      stripped.match(/\baddXp\s*=\s*(?:function\s*\([^)]*\)|\([^)]*\)\s*=>)\s*\{([\s\S]*?)\}/);

    const missingReturn = braceBody
      ? // Braced body: the `return` must be written out.
        !/\breturn\b/.test(braceBody[1])
      : // Concise arrow (`=> base + bonus`): implicit return, the addition must
        // be the value of the expression.
        !/\+/.test(
          stripped.match(/\baddXp\s*=\s*\([^)]*\)\s*=>\s*([^;\n]+)/)?.[1] ?? ""
        );

    if (missingReturn) {
      return {
        ok: false,
        msg: "addXp doit retourner la somme avec return (ne pas seulement faire console.log à l'intérieur).",
      };
    }
    if (!logsInclude(ctx.logs, "170")) {
      return {
        ok: false,
        msg: "La console doit afficher 170.",
      };
    }
    return {
      ok: true,
      msg: "Somme correcte.",
      objList: ["o2a", "o2b"],
    };
  },
  // Step 3: arrow function, double(7) prints 14
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Exécution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (!/=>/.test(stripped)) {
      return { ok: false, msg: "Utilise une arrow function (=>)." };
    }
    if (!/\bdouble\s*\(\s*7\s*\)/.test(stripped)) {
      return { ok: false, msg: "Appelle explicitement double(7)." };
    }
    if (!logsInclude(ctx.logs, "14")) {
      return {
        ok: false,
        msg: "La console doit afficher 14 (double(7)).",
      };
    }
    return {
      ok: true,
      msg: "Arrow function maîtrisée.",
      objList: ["o3a", "o3b"],
    };
  },
  // Step 4: status(7) returns "Pilote"
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Exécution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (
      !/\bfunction\s+status\s*\(/.test(stripped) &&
      !/\b(?:const|let|var)\s+status\s*=/.test(stripped)
    ) {
      return { ok: false, msg: "Déclare une fonction nommée status." };
    }
    if (!/\bif\s*\(/.test(stripped)) {
      return { ok: false, msg: "Utilise au moins un if à l'intérieur." };
    }
    // Thresholds with the variable on the left (`level < 5`, `level < 10`, or `<=`);
    // reversed forms such as `5 < x` are rejected.
    const lhs5 = /\bif\s*\(\s*\w+\s*<=?\s*5\b/.test(stripped);
    const lhs10 = /\bif\s*\(\s*\w+\s*<=?\s*10\b/.test(stripped);
    if (!lhs5 || !lhs10) {
      return {
        ok: false,
        msg: "Utilise des seuils progressifs avec le paramètre à gauche (ex: if (level < 5) ... if (level < 10) ...).",
      };
    }
    if (!logsInclude(ctx.logs, "Pilote")) {
      return {
        ok: false,
        msg: 'La console doit afficher exactement "Pilote".',
      };
    }
    // Guards against hard-coded output (`return "Pilote"` with no condition): the
    // three ranks must appear as literals, as in the course solution.
    if (!/['"`]Cadet['"`]/.test(stripped) || !/['"`]Capitaine['"`]/.test(stripped)) {
      return {
        ok: false,
        msg: 'Les trois rangs "Cadet", "Pilote" et "Capitaine" doivent apparaître dans la fonction.',
      };
    }
    return {
      ok: true,
      msg: "Rang dynamique attribué.",
      objList: ["o4a", "o4b"],
      final: true,
    };
  },
];
