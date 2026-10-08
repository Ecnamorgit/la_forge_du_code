import type { Validator } from "@/data/courses/html/types";

function stripHtmlComments(code: string): string {
  return code.replace(/<!--[\s\S]*?-->/g, "");
}

function hasInputOfType(code: string, type: string): boolean {
  const re = new RegExp(`<input\\b[^>]*type\\s*=\\s*["']${type}["'][^>]*>`, "i");
  return re.test(code);
}

function findFormInner(code: string): string | null {
  const cleaned = stripHtmlComments(code);
  const match = cleaned.match(/<form\b[^>]*>([\s\S]*?)<\/form>/i);
  return match ? match[1] : null;
}

export const validators: Validator[] = [
  // Étape 1 : <form>, <input type="text"> et <label for=...>
  (code) => {
    const inner = findFormInner(code);
    if (inner === null) {
      return { ok: false, msg: "Encadre les champs dans une balise <form>." };
    }
    // Un <input> sans attribut type est un champ texte.
    const hasTextInput =
      hasInputOfType(inner, "text") ||
      /<input\b(?![^>]*\btype\s*=)[^>]*>/i.test(inner);
    if (!hasTextInput) {
      return {
        ok: false,
        msg: 'Ajoute un <input type="text"> dans le formulaire.',
      };
    }
    const labelMatch = inner.match(
      /<label\b[^>]*\bfor\s*=\s*["']([^"']+)["'][^>]*>[\s\S]*?<\/label>/i
    );
    if (!labelMatch) {
      return {
        ok: false,
        msg: 'Le champ a besoin d\'un <label for="..."> associé.',
      };
    }
    const targetId = labelMatch[1];
    const idRe = new RegExp(
      `<input\\b[^>]*\\bid\\s*=\\s*["']${targetId}["'][^>]*>`,
      "i"
    );
    if (!idRe.test(inner)) {
      return {
        ok: false,
        msg: `Le label pointe vers id="${targetId}" mais aucun input ne porte cet id.`,
      };
    }
    return {
      ok: true,
      msg: "Premier champ étiqueté.",
      objList: ["o1a", "o1b"],
    };
  },
  // Étape 2 : <input type="email"> et <input type="password">
  (code) => {
    const inner = findFormInner(code);
    if (inner === null) {
      return { ok: false, msg: "Le <form> est manquant." };
    }
    if (!hasInputOfType(inner, "email")) {
      return {
        ok: false,
        msg: 'Ajoute un <input type="email">.',
      };
    }
    if (!hasInputOfType(inner, "password")) {
      return {
        ok: false,
        msg: 'Ajoute un <input type="password">.',
      };
    }
    return {
      ok: true,
      msg: "Types spécialisés ajoutés.",
      objList: ["o2a", "o2b"],
    };
  },
  // Étape 3 : <textarea> et <button type="submit">
  (code) => {
    const inner = findFormInner(code);
    if (inner === null) {
      return { ok: false, msg: "Le <form> est manquant." };
    }
    if (!/<textarea\b[^>]*>[\s\S]*?<\/textarea>/i.test(inner)) {
      return {
        ok: false,
        msg: "Ajoute une balise <textarea> dans le formulaire.",
      };
    }
    // Un <button> sans attribut type soumet le formulaire (type par défaut) ;
    // seuls type="button" et type="reset" ne l'envoient pas.
    const boutons = inner.match(/<button\b[^>]*>[\s\S]*?<\/button>/gi) ?? [];
    const envoie = boutons.some((b) => {
      const type = b.match(/^<button\b[^>]*(?<![-\w])type\s*=\s*["']?([a-z]+)/i);
      return !type || type[1].toLowerCase() === "submit";
    });
    if (!envoie) {
      return {
        ok: false,
        msg: boutons.length
          ? 'Ce bouton n\'envoie pas le formulaire : utilise type="submit".'
          : 'Ajoute un <button type="submit"> pour envoyer le formulaire.',
      };
    }
    return {
      ok: true,
      msg: "Rapport prêt à être transmis.",
      objList: ["o3a", "o3b"],
    };
  },
  // Étape 4 : <select> avec au moins 2 <option>
  (code) => {
    const inner = findFormInner(code);
    if (inner === null) {
      return { ok: false, msg: "Le <form> est manquant." };
    }
    const selectMatch = inner.match(/<select\b[^>]*>([\s\S]*?)<\/select>/i);
    if (!selectMatch) {
      return { ok: false, msg: "Ajoute une balise <select>." };
    }
    const options =
      selectMatch[1].match(/<option\b[^>]*>[\s\S]*?<\/option>/gi) ?? [];
    if (options.length < 2) {
      return {
        ok: false,
        msg: `Le menu doit proposer au moins deux <option> (actuellement ${options.length}).`,
      };
    }
    return {
      ok: true,
      msg: "Console opérationnelle.",
      objList: ["o4a", "o4b"],
      final: true,
    };
  },
];
