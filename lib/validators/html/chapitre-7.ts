import type { Validator } from "@/data/courses/html/types";

function stripHtmlComments(code: string): string {
  return code.replace(/<!--[\s\S]*?-->/g, "");
}

export const validators: Validator[] = [
  // Step 1: lang="fr" + charset UTF-8 + viewport
  (code) => {
    const clean = stripHtmlComments(code);
    if (!/<html\b[^>]*\blang\s*=\s*["']fr["']/i.test(clean)) {
      return { ok: false, msg: 'Ajoute lang="fr" sur la balise <html>.' };
    }
    if (!/<meta\b[^>]*charset\s*=\s*["']?utf-?8["']?[^>]*>/i.test(clean)) {
      return { ok: false, msg: 'Ajoute <meta charset="UTF-8"> dans le <head>.' };
    }
    if (!/<meta\b[^>]*name\s*=\s*["']viewport["'][^>]*content\s*=\s*["'][^"']*width\s*=\s*device-width/i.test(clean)) {
      return {
        ok: false,
        msg: 'Ajoute <meta name="viewport" content="width=device-width, initial-scale=1">.',
      };
    }
    return { ok: true, msg: "Encodage stabilise.", objList: ["o1a", "o1b"] };
  },
  // Step 2: <meta name="description"> with non-empty content >= 30 chars
  (code) => {
    const clean = stripHtmlComments(code);
    const m = clean.match(
      /<meta\b[^>]*name\s*=\s*["']description["'][^>]*content\s*=\s*["']([^"']*)["'][^>]*>/i
    );
    if (!m) {
      return { ok: false, msg: 'Ajoute une <meta name="description" content="..."> dans le <head>.' };
    }
    if (m[1].trim().length < 30) {
      return {
        ok: false,
        msg: `La description doit faire au moins 30 caracteres (actuellement ${m[1].trim().length}).`,
      };
    }
    return { ok: true, msg: "Resume emis.", objList: ["o2a", "o2b"] };
  },
  // Step 3: og:title + og:description + og:image
  (code) => {
    const clean = stripHtmlComments(code);
    const hasOg = (prop: string) =>
      new RegExp(
        `<meta\\b[^>]*property\\s*=\\s*["']og:${prop}["'][^>]*content\\s*=\\s*["'][^"']+["'][^>]*>`,
        "i"
      ).test(clean);
    if (!hasOg("title")) return { ok: false, msg: 'Ajoute <meta property="og:title" content="...">.' };
    if (!hasOg("description"))
      return { ok: false, msg: 'Ajoute <meta property="og:description" content="...">.' };
    if (!hasOg("image"))
      return { ok: false, msg: 'Ajoute <meta property="og:image" content="https://...">.' };
    return { ok: true, msg: "Preview deployee.", objList: ["o3a", "o3b"] };
  },
  // Step 4: favicon link
  (code) => {
    const clean = stripHtmlComments(code);
    const m = clean.match(
      /<link\b[^>]*rel\s*=\s*["'](?:shortcut\s+)?icon["'][^>]*href\s*=\s*["']([^"']+)["'][^>]*>/i
    );
    if (!m) {
      return { ok: false, msg: 'Ajoute <link rel="icon" href="..."> dans le <head>.' };
    }
    if (m[1].trim().length === 0) {
      return { ok: false, msg: "L'attribut href du favicon ne doit pas etre vide." };
    }
    return { ok: true, msg: "Transpondeur complet.", objList: ["o4a", "o4b"], final: true };
  },
];
