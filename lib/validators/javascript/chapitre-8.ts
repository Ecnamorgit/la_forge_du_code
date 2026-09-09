import type { Validator } from "@/data/courses/html/types";
import { logsContain, stripComments } from "./_utils";

function runtimeError(error: string | null): string | null {
  return error ? `Erreur d'execution : ${error}` : null;
}

export const validators: Validator[] = [
  // Step 1: addEventListener('click') + log 'PEW' >= 2 times
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Exécution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (!/addEventListener\s*\(\s*['"`]click['"`]/.test(stripped)) {
      return { ok: false, msg: "Utilise addEventListener('click', ...)." };
    }
    const pewCount = ctx.logs.filter((l) => l.includes("PEW")).length;
    if (pewCount < 2) {
      return { ok: false, msg: `'PEW' doit etre logge au moins 2 fois (actuellement ${pewCount}).` };
    }
    return { ok: true, msg: "Reaction installee.", objList: ["o1a", "o1b"] };
  },
  // Step 2: 3 buttons + listener logs id, click b2 -> log 'b2'
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Execution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (!/addEventListener\s*\(\s*['"`]click['"`]/.test(stripped)) {
      return { ok: false, msg: "Attache un listener 'click' aux boutons." };
    }
    if (!ctx.logs.some((l) => l.trim() === "b2")) {
      return { ok: false, msg: "Après un clic programmatique sur b2, la console doit afficher 'b2'." };
    }
    return { ok: true, msg: "Ennemi identifie.", objList: ["o2a", "o2b"] };
  },
  // Step 3: input listener + log 'Salut Luna'
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Exécution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (!/addEventListener\s*\(\s*['"`]input['"`]/.test(stripped)) {
      return { ok: false, msg: "Utilise addEventListener('input', ...)." };
    }
    if (!logsContain(ctx.logs, "Salut Luna")) {
      return { ok: false, msg: "La console doit afficher 'Salut Luna' (ou contenant 'Salut <valeur>')." };
    }
    return { ok: true, msg: "Frappe suivie.", objList: ["o3a", "o3b"] };
  },
  // Step 4: submit listener uses preventDefault, logs string containing "secret"
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Execution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (!/addEventListener\s*\(\s*['"`]submit['"`]/.test(stripped)) {
      return { ok: false, msg: "Attache un listener 'submit' au formulaire." };
    }
    if (!/\.preventDefault\s*\(/.test(stripped)) {
      return { ok: false, msg: "Utilise e.preventDefault() pour empecher le submit réel." };
    }
    if (!logsContain(ctx.logs, "secret")) {
      return { ok: false, msg: "La console doit logger une chaîne contenant 'secret'." };
    }
    return { ok: true, msg: "Submit maîtrise.", objList: ["o4a", "o4b"], final: true };
  },
];
