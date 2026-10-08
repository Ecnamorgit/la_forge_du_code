import type { Validator } from "@/data/courses/html/types";
import { logsContain, logsInclude, stripComments } from "./_utils";

function runtimeError(error: string | null): string | null {
  return error ? `Erreur d'exécution : ${error}` : null;
}

export const validators: Validator[] = [
  // Étape 1 : greet(name) renvoie "Bonjour, <name>", appelée avec "Cadet"
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
  // Étape 2 : addXp(120, 50) renvoie 170
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
    // La fonction doit retourner la somme, l'appelant l'affiche. Chaque forme de
    // corps a son exigence : un corps entre accolades contient toujours un `+`
    // ici, il ne doit donc pas profiter de la tolérance de l'arrow concise, sinon
    // `{ console.log(a + b); }` passerait.
    const corpsAccolades =
      stripped.match(/\bfunction\s+addXp\s*\([^)]*\)\s*\{([\s\S]*?)\}/) ||
      stripped.match(/\baddXp\s*=\s*(?:function\s*\([^)]*\)|\([^)]*\)\s*=>)\s*\{([\s\S]*?)\}/);

    const manqueLeRetour = corpsAccolades
      ? // Corps entre accolades : le `return` doit être écrit.
        !/\breturn\b/.test(corpsAccolades[1])
      : // Arrow concise (`=> base + bonus`) : return implicite, l'addition doit
        // être la valeur de l'expression.
        !/\+/.test(
          stripped.match(/\baddXp\s*=\s*\([^)]*\)\s*=>\s*([^;\n]+)/)?.[1] ?? ""
        );

    if (manqueLeRetour) {
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
  // Étape 3 : arrow function, double(7) affiche 14
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
  // Étape 4 : status(7) renvoie "Pilote"
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
    // Seuils avec la variable à gauche (`level < 5`, `level < 10`, ou `<=`) ;
    // les formes inversées comme `5 < x` sont refusées.
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
    // Contre une sortie codée en dur (`return "Pilote"` sans condition) : les
    // trois rangs doivent figurer en littéraux, comme dans la solution du cours.
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
