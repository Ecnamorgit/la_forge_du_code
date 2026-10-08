import type { Validator } from "@/data/courses/html/types";
import { logsContain, stripComments } from "./_utils";

function runtimeError(error: string | null): string | null {
  return error ? `Erreur d'exécution : ${error}` : null;
}

export const validators: Validator[] = [
  // Étape 1 : createElement et appendChild, innerHTML affiché avec "Centre de commande"
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Exécution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (!/document\.createElement\s*\(/.test(stripped)) {
      return { ok: false, msg: "Utilise document.createElement(...) pour créer le <div>." };
    }
    if (!/appendChild\s*\(/.test(stripped)) {
      return { ok: false, msg: "Insère l'élément avec appendChild." };
    }
    if (!logsContain(ctx.logs, "Centre de commande")) {
      return {
        ok: false,
        msg: "La console doit contenir 'Centre de commande' (par exemple via console.log(document.body.innerHTML)).",
      };
    }
    return { ok: true, msg: "Élément injecté.", objList: ["o1a", "o1b"] };
  },
  // Étape 2 : un <ul> de 3 <li>, affiche "3"
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Exécution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (!/createElement\s*\(\s*['"`]ul['"`]/.test(stripped)) {
      return { ok: false, msg: "Crée un <ul> via document.createElement('ul')." };
    }
    if (!/createElement\s*\(\s*['"`]li['"`]/.test(stripped)) {
      return { ok: false, msg: "Crée les <li> via document.createElement('li')." };
    }
    if (!ctx.logs.some((l) => l.trim() === "3")) {
      return { ok: false, msg: "Affiche le nombre exact de <li> (3) via querySelectorAll('li').length." };
    }
    return { ok: true, msg: "Missions listées.", objList: ["o2a", "o2b"] };
  },
  // Étape 3 : changement de classe, affiche "ALERTE"
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Exécution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (!/\.className\s*=/.test(stripped) && !/\.classList\.(add|remove|toggle)/.test(stripped)) {
      return { ok: false, msg: "Modifie className ou classList après création." };
    }
    if (!logsContain(ctx.logs, "ALERTE")) {
      return { ok: false, msg: "La console doit afficher 'ALERTE' après la mise à jour du textContent." };
    }
    return { ok: true, msg: "Statut mis à jour.", objList: ["o3a", "o3b"] };
  },
  // Étape 4 : querySelectorAll, affiche A, B et C
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Exécution requise." };
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
    return { ok: true, msg: "DOM scanné.", objList: ["o4a", "o4b"], final: true };
  },
];
