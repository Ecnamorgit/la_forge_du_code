import type { Validator } from "@/data/courses/html/types";
import { logsContain, stripComments } from "./_utils";

function runtimeError(error: string | null): string | null {
  return error ? `Erreur d'execution : ${error}` : null;
}

export const validators: Validator[] = [
  // Step 1: createElement + appendChild + log of innerHTML containing "Centre de commande"
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Execution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (!/document\.createElement\s*\(/.test(stripped)) {
      return { ok: false, msg: "Utilise document.createElement(...) pour creer le <div>." };
    }
    if (!/appendChild\s*\(/.test(stripped)) {
      return { ok: false, msg: "Insere l'element avec appendChild." };
    }
    if (!logsContain(ctx.logs, "Centre de commande")) {
      return {
        ok: false,
        msg: "La console doit contenir 'Centre de commande' (par exemple via console.log(document.body.innerHTML)).",
      };
    }
    return { ok: true, msg: "Element injecte.", objList: ["o1a", "o1b"] };
  },
  // Step 2: <ul> with 3 <li>, log "3"
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Execution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (!/createElement\s*\(\s*['"`]ul['"`]/.test(stripped)) {
      return { ok: false, msg: "Cree un <ul> via document.createElement('ul')." };
    }
    if (!/createElement\s*\(\s*['"`]li['"`]/.test(stripped)) {
      return { ok: false, msg: "Cree les <li> via document.createElement('li')." };
    }
    if (!ctx.logs.some((l) => l.trim() === "3")) {
      return { ok: false, msg: "Affiche le nombre exact de <li> (3) via querySelectorAll('li').length." };
    }
    return { ok: true, msg: "Missions listees.", objList: ["o2a", "o2b"] };
  },
  // Step 3: className change + log "ALERTE"
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Execution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (!/\.className\s*=/.test(stripped) && !/\.classList\.(add|remove|toggle)/.test(stripped)) {
      return { ok: false, msg: "Modifie className ou classList apres creation." };
    }
    if (!logsContain(ctx.logs, "ALERTE")) {
      return { ok: false, msg: "La console doit afficher 'ALERTE' apres la mise a jour du textContent." };
    }
    return { ok: true, msg: "Statut mis a jour.", objList: ["o3a", "o3b"] };
  },
  // Step 4: querySelectorAll + log A, B, C
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Execution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (!/querySelectorAll\s*\(/.test(stripped)) {
      return { ok: false, msg: "Utilise document.querySelectorAll('span')." };
    }
    const hasA = ctx.logs.some((l) => l.trim() === "A");
    const hasB = ctx.logs.some((l) => l.trim() === "B");
    const hasC = ctx.logs.some((l) => l.trim() === "C");
    if (!hasA || !hasB || !hasC) {
      return { ok: false, msg: "La console doit logger 'A', 'B' et 'C' (une ligne par span)." };
    }
    return { ok: true, msg: "DOM scanne.", objList: ["o4a", "o4b"], final: true };
  },
];
