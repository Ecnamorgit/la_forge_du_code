import type { Validator } from "@/data/courses/html/types";
import { extractStyleContent, ruleBody } from "./_utils";

export const validators: Validator[] = [
  // Étape 1 : transition sur .btn, avec une durée en secondes
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) return { ok: false, msg: "La balise <style> est manquante." };
    const body = ruleBody(css, ".btn");
    if (!body || !/\btransition\s*:/i.test(body)) {
      return { ok: false, msg: "Ajoute la propriété transition sur .btn." };
    }
    if (!/transition\s*:[^;]*\b\d*\.?\d+\s*s\b/i.test(body)) {
      return { ok: false, msg: "Specifie une duree en secondes (ex: 0.3s)." };
    }
    return { ok: true, msg: "Transition fluide.", objList: ["o1a", "o1b"] };
  },
  // Étape 2 : .card:hover avec un transform
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
  // Étape 3 : une @keyframes, appliquée à .pulse via animation
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) return { ok: false, msg: "La balise <style> est manquante." };
    const kfMatch = css.match(/@keyframes\s+([a-zA-Z][\w-]*)\s*\{([\s\S]*?)\}\s*\}/);
    if (!kfMatch) {
      return { ok: false, msg: "Définis une animation avec @keyframes nom { ... }." };
    }
    const pulseBody = ruleBody(css, ".pulse");
    if (!pulseBody || !/\banimation\s*:/i.test(pulseBody)) {
      return { ok: false, msg: "Applique l'animation a .pulse avec animation: nom duree ...;" };
    }
    return { ok: true, msg: "Pulsation active.", objList: ["o3a", "o3b"] };
  },
  // Étape 4 : @keyframes avec rotate, et animation infinie sur .icon
  (code) => {
    const css = extractStyleContent(code);
    if (css === null) return { ok: false, msg: "La balise <style> est manquante." };
    if (!/@keyframes\s+[\w-]+\s*\{[\s\S]*?transform\s*:\s*rotate/i.test(css)) {
      return {
        ok: false,
        msg: "Définis une @keyframes qui utilise transform: rotate(...).",
      };
    }
    const iconBody = ruleBody(css, ".icon");
    if (!iconBody || !/\banimation\s*:/i.test(iconBody)) {
      return { ok: false, msg: "Applique l'animation a .icon." };
    }
    if (!/\binfinite\b/i.test(iconBody) && !/animation-iteration-count\s*:\s*infinite/i.test(iconBody)) {
      return { ok: false, msg: "L'animation doit être infinie (mot-clé infinite)." };
    }
    return { ok: true, msg: "Mouvement permanent.", objList: ["o4a", "o4b"], final: true };
  },
];
