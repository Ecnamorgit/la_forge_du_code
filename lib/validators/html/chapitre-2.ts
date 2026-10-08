import type { Validator } from "@/data/courses/html/types";

function stripHtmlComments(code: string): string {
  return code.replace(/<!--[\s\S]*?-->/g, "");
}

function tagInner(code: string, tag: string): string | null {
  const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = code.match(re);
  return m ? m[1] : null;
}

export const validators: Validator[] = [
  // Étape 1 : un <a> externe avec href et target="_blank"
  (code) => {
    const clean = stripHtmlComments(code);
    const link = clean.match(
      /<a\b[^>]*href\s*=\s*["']https?:\/\/[^"']+["'][^>]*>[\s\S]*?<\/a>/i
    );
    if (!link) {
      return {
        ok: false,
        msg: "Ajoute une balise <a> avec un href qui commence par http(s)://.",
      };
    }
    if (!/\btarget\s*=\s*["']_blank["']/i.test(link[0])) {
      return { ok: false, msg: 'Configure target="_blank" pour ouvrir dans un nouvel onglet.' };
    }
    return { ok: true, msg: "Passerelle externe ouverte.", objList: ["o1a", "o1b"] };
  },
  // Étape 2 : deux <section id="..."> aux id distincts
  (code) => {
    const clean = stripHtmlComments(code);
    const sections = [
      ...clean.matchAll(/<section\b[^>]*\bid\s*=\s*["']([^"']+)["'][^>]*>/gi),
    ];
    if (sections.length < 2) {
      return {
        ok: false,
        msg: `Cree au moins 2 balises <section> avec id (actuellement ${sections.length}).`,
      };
    }
    const ids = sections.map((m) => m[1]);
    const unique = new Set(ids);
    if (unique.size < 2) {
      return { ok: false, msg: "Les deux <section> doivent avoir des id differents." };
    }
    return { ok: true, msg: "Reperes etablis.", objList: ["o2a", "o2b"] };
  },
  // Étape 3 : au moins 2 liens internes href="#..." vers des id existants
  (code) => {
    const clean = stripHtmlComments(code);
    const anchorLinks = [
      ...clean.matchAll(/<a\b[^>]*href\s*=\s*["']#([^"']+)["'][^>]*>/gi),
    ];
    if (anchorLinks.length < 2) {
      return {
        ok: false,
        msg: `Ajoute au moins 2 liens internes <a href="#id"> (actuellement ${anchorLinks.length}).`,
      };
    }
    const ids = [
      ...clean.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi),
    ].map((m) => m[1]);
    const idSet = new Set(ids);
    for (const link of anchorLinks) {
      if (!idSet.has(link[1])) {
        return {
          ok: false,
          msg: `Le lien #${link[1]} ne correspond a aucun id present sur la page.`,
        };
      }
    }
    return { ok: true, msg: "Saut verifie.", objList: ["o3a", "o3b"] };
  },
  // Étape 4 : une <nav> d'au moins 3 liens, dont l'externe et 2 ancres
  (code) => {
    const clean = stripHtmlComments(code);
    const navInner = tagInner(clean, "nav");
    if (navInner === null) {
      return { ok: false, msg: "Encapsule les liens dans une balise <nav>." };
    }
    const links = navInner.match(/<a\b[^>]*href\s*=\s*["'][^"']+["'][^>]*>/gi) ?? [];
    if (links.length < 3) {
      return {
        ok: false,
        msg: `La <nav> doit contenir au moins 3 liens (actuellement ${links.length}).`,
      };
    }
    const hasExternal = links.some((l) => /href\s*=\s*["']https?:\/\//i.test(l));
    const anchorCount = links.filter((l) => /href\s*=\s*["']#/i.test(l)).length;
    if (!hasExternal) {
      return { ok: false, msg: "Garde le lien externe (MDN) dans la <nav>." };
    }
    if (anchorCount < 2) {
      return { ok: false, msg: "Garde au moins 2 liens internes (#missions, #contact) dans la <nav>." };
    }
    return { ok: true, msg: "Navigation complete.", objList: ["o4a", "o4b"], final: true };
  },
];
