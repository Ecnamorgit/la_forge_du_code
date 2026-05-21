import type { Validator } from "@/data/courses/html/types";
import { extractStyleContent, ruleBody } from "./_utils";

export const validators: Validator[] = [
  // Step 1: .btn has transition with a duration
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) return { ok: false, msg: "La balise <style> est manquante." };
    const body = ruleBody(css, ".btn");
    if (!body || !/\btransition\s*:/i.test(body)) {
      return { ok: false, msg: "Ajoute la propriete transition sur .btn." };
    }
    if (!/transition\s*:[^;]*\b\d*\.?\d+\s*s\b/i.test(body)) {
      return { ok: false, msg: "Specifie une duree en secondes (ex: 0.3s)." };
    }
    return { ok: true, msg: "Transition fluide.", objList: ["o1a", "o1b"] };
  },
  // Step 2: .card:hover with transform: scale/rotate/translate
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) return { ok: false, msg: "La balise <style> est manquante." };
    const hoverRe = /\.card:hover\s*\{([^}]*)\}/i;
    const m = css.match(hoverRe);
    if (!m) return { ok: false, msg: "Cible .card:hover { ... }." };
    if (!/\btransform\s*:\s*[a-z]/i.test(m[1])) {
      return { ok: false, msg: "Utilise transform: scale/rotate/translate au survol." };
    }
    return { ok: true, msg: "Effet d'echelle.", objList: ["o2a", "o2b"] };
  },
  // Step 3: @keyframes defined + .pulse uses animation
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) return { ok: false, msg: "La balise <style> est manquante." };
    const kfMatch = css.match(/@keyframes\s+([a-zA-Z][\w-]*)\s*\{([\s\S]*?)\}\s*\}/);
    if (!kfMatch) {
      return { ok: false, msg: "Definis une animation avec @keyframes nom { ... }." };
    }
    const pulseBody = ruleBody(css, ".pulse");
    if (!pulseBody || !/\banimation\s*:/i.test(pulseBody)) {
      return { ok: false, msg: "Applique l'animation a .pulse avec animation: nom duree ...;" };
    }
    return { ok: true, msg: "Pulsation active.", objList: ["o3a", "o3b"] };
  },
  // Step 4: @keyframes with rotate transform + .icon animation linear infinite
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) return { ok: false, msg: "La balise <style> est manquante." };
    if (!/@keyframes\s+[\w-]+\s*\{[\s\S]*?transform\s*:\s*rotate/i.test(css)) {
      return {
        ok: false,
        msg: "Definis une @keyframes qui utilise transform: rotate(...).",
      };
    }
    const iconBody = ruleBody(css, ".icon");
    if (!iconBody || !/\banimation\s*:/i.test(iconBody)) {
      return { ok: false, msg: "Applique l'animation a .icon." };
    }
    if (!/\bnfinite\b/i.test(iconBody) && !/animation-iteration-count\s*:\s*infinite/i.test(iconBody)) {
      return { ok: false, msg: "L'animation doit etre infinie (mot-cle infinite)." };
    }
    return { ok: true, msg: "Mouvement permanent.", objList: ["o4a", "o4b"], final: true };
  },
];
