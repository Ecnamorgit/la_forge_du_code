import type { Validator } from "@/data/courses/html/types";

export const validators: Validator[] = [
  (code) => {
    const linkMatch = code.match(
      /<a\b[^>]*href\s*=\s*["'][^"']+["'][^>]*>[\s\S]*?<\/a>/i
    );
    if (!linkMatch) {
      return {
        ok: false,
        msg: "Ajoute un lien <a> avec un href et un texte cliquable.",
      };
    }
    if (!/href\s*=\s*["'][^"']+["']/i.test(code)) {
      return {
        ok: false,
        msg: "Le lien a besoin d'une destination dans href.",
      };
    }
    return {
      ok: true,
      msg: "Passerelle externe confirmee.",
      objList: ["o1a", "o1b"],
    };
  },
  (code) => {
    if (!/href\s*=\s*["']index\.html["']/i.test(code)) {
      return {
        ok: false,
        msg: 'Un lien doit mener vers "index.html".',
      };
    }
    if (!/href\s*=\s*["']missions\.html["']/i.test(code)) {
      return {
        ok: false,
        msg: 'Ajoute aussi un lien vers "missions.html".',
      };
    }
    const links =
      code.match(
        /<a\b[^>]*href\s*=\s*["'][^"']+["'][^>]*>[\s\S]*?<\/a>/gi
      ) ?? [];
    if (links.length < 2) {
      return {
        ok: false,
        msg: "Deux liens distincts sont attendus pour cette etape.",
      };
    }
    return {
      ok: true,
      msg: "Navigation interne activee.",
      objList: ["o2a", "o2b"],
    };
  },
  (code) => {
    const externalBlank =
      code.match(
        /<a\b[^>]*href\s*=\s*["']https?:\/\/[^"']+["'][^>]*target\s*=\s*["']_blank["'][^>]*>[\s\S]*?<\/a>/i
      ) ||
      code.match(
        /<a\b[^>]*target\s*=\s*["']_blank["'][^>]*href\s*=\s*["']https?:\/\/[^"']+["'][^>]*>[\s\S]*?<\/a>/i
      );
    if (!externalBlank) {
      return {
        ok: false,
        msg: 'Ajoute un lien externe avec target="_blank".',
      };
    }
    return {
      ok: true,
      msg: "Canal externe valide.",
      objList: ["o3a", "o3b"],
    };
  },
  (code) => {
    const navMatch = code.match(/<nav\b[^>]*>([\s\S]*?)<\/nav>/i);
    if (!navMatch) {
      return {
        ok: false,
        msg: "Une zone <nav> est attendue pour regrouper les liens.",
      };
    }

    const navContent = navMatch[1];
    const requiredHrefs = ["index.html", "missions.html", "contact.html"];
    for (const href of requiredHrefs) {
      const hrefRegex = new RegExp(
        `href\\s*=\\s*["']${href.replace(".", "\\.")}["']`,
        "i"
      );
      if (!hrefRegex.test(navContent)) {
        return {
          ok: false,
          msg: `Le lien vers "${href}" doit se trouver dans la navigation.`,
        };
      }
    }

    const navLinks =
      navContent.match(
        /<a\b[^>]*href\s*=\s*["'][^"']+["'][^>]*>[\s\S]*?<\/a>/gi
      ) ?? [];
    if (navLinks.length < 3) {
      return {
        ok: false,
        msg: "La navigation finale doit contenir trois liens.",
      };
    }

    return {
      ok: true,
      msg: "Navigation principale operationnelle.",
      objList: ["o4a", "o4b"],
      final: true,
    };
  },
];
