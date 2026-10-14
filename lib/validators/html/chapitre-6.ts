import type { Validator } from "@/data/courses/html/types";

function stripHtmlComments(code: string): string {
  return code.replace(/<!--[\s\S]*?-->/g, "");
}

function hasTag(code: string, tag: string): boolean {
  const re = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, "i");
  return re.test(code);
}

function tagInner(code: string, tag: string): string | null {
  const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = code.match(re);
  return m ? m[1] : null;
}

export const validators: Validator[] = [
  // Step 1: header, main and footer
  (code) => {
    const clean = stripHtmlComments(code);
    if (!hasTag(clean, "header")) return { ok: false, msg: "Encadre l'en-tête dans une balise <header>." };
    if (!hasTag(clean, "main")) return { ok: false, msg: "Encadre le contenu principal dans une balise <main>." };
    if (!hasTag(clean, "footer")) return { ok: false, msg: "Ajoute un <footer> en bas de la page." };
    return { ok: true, msg: "Plan de station posé.", objList: ["o1a", "o1b"] };
  },
  // Step 2: a <nav> with at least 3 <a> inside the <header>
  (code) => {
    const clean = stripHtmlComments(code);
    const header = tagInner(clean, "header");
    if (header === null) return { ok: false, msg: "Le <header> est manquant." };
    const nav = tagInner(header, "nav");
    if (nav === null) return { ok: false, msg: "Place une <nav> dans le <header>." };
    const links = nav.match(/<a\b[^>]*href\s*=\s*["'][^"']+["'][^>]*>/gi) ?? [];
    if (links.length < 3) {
      return { ok: false, msg: `La <nav> doit contenir au moins 3 liens (actuellement ${links.length}).` };
    }
    return { ok: true, msg: "Routes balisées.", objList: ["o2a", "o2b"] };
  },
  // Step 3: a <section> inside an <article>, itself inside <main>
  (code) => {
    const clean = stripHtmlComments(code);
    const main = tagInner(clean, "main");
    if (main === null) return { ok: false, msg: "Le <main> doit être conservé." };
    const article = tagInner(main, "article");
    if (article === null) return { ok: false, msg: "Place un <article> dans <main>." };
    if (!hasTag(article, "section")) {
      return { ok: false, msg: "Place une <section> à l'intérieur de l'<article>." };
    }
    return { ok: true, msg: "Blocs délimités.", objList: ["o3a", "o3b"] };
  },
  // Step 4: alt on the image and aria-current="page" on a link
  (code) => {
    const clean = stripHtmlComments(code);
    const imgWithAlt = /<img\b[^>]*\balt\s*=\s*["'][^"']+["'][^>]*>/i.test(clean);
    if (!imgWithAlt) {
      return { ok: false, msg: 'Ajoute un attribut alt="..." sur l\'image (texte descriptif).' };
    }
    const ariaCurrent = /<a\b[^>]*\baria-current\s*=\s*["']page["']/i.test(clean);
    if (!ariaCurrent) {
      return { ok: false, msg: 'Marque le lien de la page courante avec aria-current="page".' };
    }
    return { ok: true, msg: "Station universellement accessible.", objList: ["o4a", "o4b"], final: true };
  },
];
