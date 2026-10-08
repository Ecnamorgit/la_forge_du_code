import type { Validator } from "@/data/courses/html/types";
import { logsContain, logsInclude, stripComments } from "./_utils";

function runtimeError(error: string | null): string | null {
  return error ? `Erreur d'execution : ${error}` : null;
}

export const validators: Validator[] = [
  // Étape 1 : xp.map() qui double les valeurs, résultat affiché
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Exécution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (!/\bxp\s*\.\s*map\s*\(/.test(stripped)) {
      return { ok: false, msg: "Utilise xp.map(...) pour transformer le tableau." };
    }
    if (!logsContain(ctx.logs, "100") || !logsContain(ctx.logs, "240")) {
      return {
        ok: false,
        msg: "La console doit afficher le tableau double (contient 100, 240, 160, 400, 60).",
      };
    }
    return { ok: true, msg: "Données transformées.", objList: ["o1a", "o1b"] };
  },
  // Étape 2 : equipage.filter() qui garde niveau >= 5, résultat affiché
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Exécution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (!/\bequipage\s*\.\s*filter\s*\(/.test(stripped)) {
      return { ok: false, msg: "Utilise equipage.filter(...)." };
    }
    if (!/niveau\s*>=?\s*5/.test(stripped)) {
      return { ok: false, msg: "La condition doit filtrer niveau >= 5." };
    }
    if (!logsContain(ctx.logs, "Luna") || !logsContain(ctx.logs, "Mars")) {
      return { ok: false, msg: "La console doit afficher les élites (Luna, Mars, Phobos)." };
    }
    if (logsContain(ctx.logs, "Io")) {
      return { ok: false, msg: 'Io ne doit pas être dans les élites (niveau 3 < 5).' };
    }
    return { ok: true, msg: "Élites identifiées.", objList: ["o2a", "o2b"] };
  },
  // Étape 3 : cargo.reduce() dont la somme des masses vaut 400
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Exécution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (!/\bcargo\s*\.\s*reduce\s*\(/.test(stripped)) {
      return { ok: false, msg: "Utilise cargo.reduce(...)." };
    }
    if (!logsInclude(ctx.logs, "400")) {
      return { ok: false, msg: "La console doit afficher 400 (somme des masses)." };
    }
    return { ok: true, msg: "Total calcule.", objList: ["o3a", "o3b"] };
  },
  // Étape 4 : ships.find() renvoie le vaisseau en maintenance, affiche "NEB-02"
  (code, ctx) => {
    if (!ctx) return { ok: false, msg: "Exécution requise." };
    const err = runtimeError(ctx.error);
    if (err) return { ok: false, msg: err };
    const stripped = stripComments(code);
    if (!/\bships\s*\.\s*find\s*\(/.test(stripped)) {
      return { ok: false, msg: "Utilise ships.find(...)." };
    }
    if (!logsInclude(ctx.logs, "NEB-02")) {
      return { ok: false, msg: "La console doit afficher exactement 'NEB-02'." };
    }
    return { ok: true, msg: "Vaisseau localise.", objList: ["o4a", "o4b"], final: true };
  },
];
