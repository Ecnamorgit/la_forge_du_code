import type { Validator } from "@/data/courses/html/types";

function findImg(code: string): RegExpMatchArray | null {
  return code.match(/<img\b[^>]*>/i);
}

export const validators: Validator[] = [
  // Étape 1 : <img> avec src et alt
  (code) => {
    const img = findImg(code);
    if (!img) {
      return { ok: false, msg: "Ajoute une balise <img> dans le body." };
    }
    if (!/\bsrc\s*=\s*["'][^"']+["']/i.test(img[0])) {
      return { ok: false, msg: "L'attribut src est manquant ou vide." };
    }
    if (!/\balt\s*=\s*["'][^"']+["']/i.test(img[0])) {
      return {
        ok: false,
        msg: "L'attribut alt est obligatoire pour décrire l'image.",
      };
    }
    return {
      ok: true,
      msg: "Capteur activé.",
      objList: ["o1a", "o1b"],
    };
  },
  // Étape 2 : width et height
  (code) => {
    const img = findImg(code);
    if (!img) {
      return { ok: false, msg: "La balise <img> a disparu — replace-la." };
    }
    if (!/\bwidth\s*=\s*["']?\d+["']?/i.test(img[0])) {
      return { ok: false, msg: "Ajoute un attribut width sur l'image." };
    }
    if (!/\bheight\s*=\s*["']?\d+["']?/i.test(img[0])) {
      return { ok: false, msg: "Ajoute un attribut height sur l'image." };
    }
    return {
      ok: true,
      msg: "Dimensions calibrées.",
      objList: ["o2a", "o2b"],
    };
  },
  // Étape 3 : <img> à l'intérieur d'un <a>
  (code) => {
    const wrapped = code.match(
      /<a\b[^>]*href\s*=\s*["'][^"']+["'][^>]*>[\s\S]*?<img\b[^>]*>[\s\S]*?<\/a>/i
    );
    if (!wrapped) {
      return {
        ok: false,
        msg: "L'image doit être placée à l'intérieur d'une balise <a> avec href.",
      };
    }
    return {
      ok: true,
      msg: "Image cliquable.",
      objList: ["o3a", "o3b"],
    };
  },
  // Étape 4 : <figure> et <figcaption>
  (code) => {
    const figureMatch = code.match(/<figure\b[^>]*>([\s\S]*?)<\/figure>/i);
    if (!figureMatch) {
      return { ok: false, msg: "Encadre l'image dans une balise <figure>." };
    }
    const inner = figureMatch[1];
    if (!/<img\b[^>]*>/i.test(inner)) {
      return {
        ok: false,
        msg: "L'image doit rester à l'intérieur de la <figure>.",
      };
    }
    const caption = inner.match(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/i);
    if (!caption || !caption[1].trim()) {
      return {
        ok: false,
        msg: "Ajoute une légende non vide dans <figcaption>.",
      };
    }
    return {
      ok: true,
      msg: "Cliché archivé.",
      objList: ["o4a", "o4b"],
      final: true,
    };
  },
];
