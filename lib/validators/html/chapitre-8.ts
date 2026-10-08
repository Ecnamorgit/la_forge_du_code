import type { Validator } from "@/data/courses/html/types";

function stripHtmlComments(code: string): string {
  return code.replace(/<!--[\s\S]*?-->/g, "");
}

export const validators: Validator[] = [
  // Étape 1 : <video> avec l'attribut controls
  (code) => {
    const clean = stripHtmlComments(code);
    const m = clean.match(/<video\b[^>]*>[\s\S]*?<\/video>/i);
    if (!m) return { ok: false, msg: "Ajoute une balise <video>...</video>." };
    if (!/\bcontrols\b/i.test(m[0])) {
      return { ok: false, msg: "Ajoute l'attribut controls à la balise <video>." };
    }
    return { ok: true, msg: "Flux vidéo actif.", objList: ["o1a", "o1b"] };
  },
  // Étape 2 : <audio> avec l'attribut controls
  (code) => {
    const clean = stripHtmlComments(code);
    const m = clean.match(/<audio\b[^>]*>[\s\S]*?<\/audio>/i);
    if (!m) return { ok: false, msg: "Ajoute une balise <audio>...</audio>." };
    if (!/\bcontrols\b/i.test(m[0])) {
      return { ok: false, msg: "Ajoute l'attribut controls à la balise <audio>." };
    }
    return { ok: true, msg: "Transmission radio ouverte.", objList: ["o2a", "o2b"] };
  },
  // Étape 3 : <img> avec srcset et sizes
  (code) => {
    const clean = stripHtmlComments(code);
    const m = clean.match(/<img\b[^>]*>/i);
    if (!m) return { ok: false, msg: "Une balise <img> est attendue." };
    if (!/\bsrcset\s*=\s*["'][^"']+["']/i.test(m[0])) {
      return { ok: false, msg: 'Ajoute l\'attribut srcset="..." sur l\'image.' };
    }
    if (!/\bsizes\s*=\s*["'][^"']+["']/i.test(m[0])) {
      return { ok: false, msg: 'Ajoute aussi l\'attribut sizes="..." pour guider le navigateur.' };
    }
    return { ok: true, msg: "Bande passante optimisée.", objList: ["o3a", "o3b"] };
  },
  // Étape 4 : <picture> avec au moins 2 <source> et un <img> de repli
  (code) => {
    const clean = stripHtmlComments(code);
    const m = clean.match(/<picture\b[^>]*>([\s\S]*?)<\/picture>/i);
    if (!m) return { ok: false, msg: "Encapsule avec une balise <picture>...</picture>." };
    const inner = m[1];
    const sources = inner.match(/<source\b[^>]*>/gi) ?? [];
    if (sources.length < 2) {
      return { ok: false, msg: `Place au moins 2 <source> dans <picture> (actuellement ${sources.length}).` };
    }
    if (!/<img\b[^>]*>/i.test(inner)) {
      return { ok: false, msg: "Garde une balise <img> de fallback à l'intérieur de <picture>." };
    }
    return { ok: true, msg: "Diffusion optimale.", objList: ["o4a", "o4b"], final: true };
  },
];
