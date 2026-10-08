import type { Validator } from "@/data/courses/html/types";
import {
  stripLineComments,
  fail,
  pass,
  findBareCallBody,
  findNamedFunctionBody,
  matchClosing,
  statementEnd,
} from "../_static-utils";

const strip = (code: string) => stripLineComments(code, "//");

/** Noms des hooks personnalisés déclarés (`function useX`, `const useX =`...). */
function findCustomHookNames(code: string): string[] {
  const names: string[] = [];
  const re = /(?:function|const|let|var)\s+(use[A-Z]\w*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) names.push(m[1]!);
  return names;
}

/**
 * Le hook `name` est-il appelé, en plus d'être déclaré ? On retire d'abord
 * `function <name>`, sinon la déclaration `function useCompteur()` compterait
 * comme un appel (la forme `const useCompteur = () =>` n'a pas ce problème).
 */
function isHookCalled(code: string, name: string): boolean {
  const withoutDecl = code.replace(new RegExp(`function\\s+${name}`, "g"), "");
  return new RegExp(`\\b${name}\\s*\\(`).test(withoutDecl);
}

/**
 * Premier hook personnalisé dont le corps satisfait `predicate`. Chaque hook
 * est évalué séparément : un hook correct ne valide pas un hook incomplet.
 */
function findHookBodyMatching(
  code: string,
  predicate: (body: string) => boolean
): { name: string; body: string } | null {
  for (const name of findCustomHookNames(code)) {
    const body = findNamedFunctionBody(code, name);
    if (body !== null && predicate(body)) return { name, body };
  }
  return null;
}

/**
 * Un appel de hook (`useXxx(`) est-il dans un bloc `if (...) { ... }` ?
 *
 * Seuls les `if` suivis d'accolades sont vus : un `if` sans accolades, un
 * `else`, un ternaire, une boucle ou un `switch` ne sont pas détectés. Cela
 * suffit pour cet exercice, dont le `startCode` place l'appel dans un `if { }`.
 */
function hookCallInsideIfBlock(code: string): boolean {
  const ifRe = /\bif\s*\(/g;
  let m: RegExpExecArray | null;
  while ((m = ifRe.exec(code)) !== null) {
    const openParen = m.index + m[0].length - 1;
    const closeParen = matchClosing(code, openParen);
    if (closeParen === -1) continue;

    const after = code.slice(closeParen + 1);
    const braceOffset = after.search(/\S/);
    if (braceOffset === -1 || after[braceOffset] !== "{") continue;

    const openBrace = closeParen + 1 + braceOffset;
    const closeBrace = matchClosing(code, openBrace);
    if (closeBrace === -1) continue;

    const block = code.slice(openBrace, closeBrace);
    if (/\buse[A-Z]\w*\s*\(/.test(block)) return true;
  }
  return false;
}

/**
 * Contenu d'un `return { ... }` ou `return [ ... ]`, délimiteurs équilibrés :
 * `return { etat: { charge }, recharger };` contient une accolade imbriquée
 * qu'un `[^}]*` couperait. Renvoie null sans un tel `return`.
 */
function extractReturnMembers(body: string): string | null {
  const m = /return\s*([{[])/.exec(body);
  if (!m) return null;
  const openIdx = m.index + m[0].length - 1;
  const closeIdx = matchClosing(body, openIdx);
  if (closeIdx === -1) return null;
  return body.slice(openIdx + 1, closeIdx);
}

/**
 * Corps du cleanup retourné par l'effet, ou null si le `return` ne renvoie pas
 * une fonction.
 *
 * L'expression qui suit `return` (voir `statementEnd`) est acceptée si c'est
 * une flèche, une expression `function`, ou un identifiant dont on résout la
 * définition dans l'effet puis dans le hook. `return window.removeEventListener(...)`
 * désabonne dès le montage au lieu de retourner une fonction : refusé.
 */
function returnedCleanupBody(effectBody: string, hookBody: string): string | null {
  const returnIdx = effectBody.search(/\breturn\b/);
  if (returnIdx === -1) return null;

  const exprStart = returnIdx + "return".length;
  const exprEnd = statementEnd(effectBody, exprStart);
  const expr = effectBody.slice(exprStart, exprEnd).trim();

  if (/^\([^)]*\)\s*=>/.test(expr) || /^function\b/.test(expr)) {
    return expr;
  }

  const nameMatch = /^([A-Za-z_$][\w$]*)$/.exec(expr);
  if (nameMatch) {
    const name = nameMatch[1]!;
    return findNamedFunctionBody(effectBody, name) ?? findNamedFunctionBody(hookBody, name);
  }

  return null;
}

export const validators: Validator[] = [
  // Étape 1 : extraire la logique dans un hook personnalisé, et l'appeler.
  (code) => {
    const c = strip(code);

    const hook = findHookBodyMatching(c, (body) => /\buseState\s*\(/.test(body));
    if (!hook) {
      const names = findCustomHookNames(c);
      if (names.length === 0) {
        return fail(
          "Declare une fonction prefixee par use, par exemple function useCompteur() { ... }.",
          "structure"
        );
      }
      return fail(
        `Deplace l'appel useState a l'interieur de ${names[0]} : c'est le hook qui doit porter l'etat, pas le composant.`,
        "structure"
      );
    }

    if (!isHookCalled(c, hook.name)) {
      return fail(
        `${hook.name} est declare mais jamais appele. Recupere-le dans ton composant avec ${hook.name}().`
      );
    }

    return pass("Logique extraite.", ["o1a", "o1b"]);
  },

  // Étape 2 : le hook retourne valeur et action, le composant les déstructure.
  (code) => {
    const c = strip(code);

    const hook = findHookBodyMatching(c, (body) => /\buseState\s*\(/.test(body));
    if (!hook) {
      return fail(
        "Declare un hook prefixe par use qui appelle useState.",
        "structure"
      );
    }

    // Le hook doit retourner au moins deux sorties (la valeur et l'action).
    const membersRaw = extractReturnMembers(hook.body);

    if (membersRaw === null) {
      return fail(
        `${hook.name} ne retourne rien : le composant recevra undefined. Termine-le par return { valeur, action }.`,
        "logic"
      );
    }

    const members = membersRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (members.length < 2) {
      return fail(
        "Retourne DEUX sorties : la valeur a afficher et l'action qui la modifie.",
        "logic"
      );
    }

    // Côté appelant : déstructuration du résultat du hook.
    const destructured = new RegExp(
      `(?:const|let|var)\\s*(?:\\{[^}]*\\}|\\[[^\\]]*\\])\\s*=\\s*${hook.name}\\s*\\(`
    ).test(c);
    if (!destructured) {
      return fail(
        `Destructure le resultat dans le composant : const { valeur, action } = ${hook.name}();`
      );
    }

    return pass("Module branche.", ["o2a", "o2b"]);
  },

  // Étape 3 : hook avec useEffect, abonnement et désabonnement dans le cleanup.
  (code) => {
    const c = strip(code);

    const hook = findHookBodyMatching(c, (body) => /\buseEffect\s*\(/.test(body));
    if (!hook) {
      return fail(
        "Declare un hook prefixe par use qui appelle useEffect.",
        "structure"
      );
    }

    // Le useEffect du hook, pas n'importe lequel du fichier.
    const effect = findBareCallBody(hook.body, "useEffect");
    if (!effect) {
      return fail("Appelle useEffect a l'interieur de ton hook.", "structure");
    }

    if (!/addEventListener\s*\(/.test(effect.body)) {
      return fail(
        "Abonne-toi a l'evenement dans l'effet : window.addEventListener('resize', handler)."
      );
    }

    const returnIdx = effect.body.search(/\breturn\b/);
    if (returnIdx === -1) {
      return fail(
        "Il manque la fonction de cleanup : termine l'effet par return () => ... pour te desabonner.",
        "logic"
      );
    }

    const cleanupBody = returnedCleanupBody(effect.body, hook.body);
    if (cleanupBody === null) {
      return fail(
        "Le cleanup doit RETOURNER une fonction, pas appeler removeEventListener directement : return () => window.removeEventListener('resize', handler) plutot que return window.removeEventListener(...).",
        "logic"
      );
    }
    if (!/removeEventListener\s*\(/.test(cleanupBody)) {
      return fail(
        "Le desabonnement doit vivre DANS le cleanup : return () => window.removeEventListener('resize', handler).",
        "logic"
      );
    }

    if (!/\buseState\s*\(/.test(hook.body)) {
      return fail(
        "Stocke la largeur dans un etat avec useState, sinon l'affichage ne se mettra jamais a jour.",
        "logic"
      );
    }

    return pass("Hublot calibre.", ["o3a", "o3b"]);
  },

  // Étape 4 : règles des hooks, aucun appel dans un bloc conditionnel.
  (code) => {
    const c = strip(code);

    if (!/\buseState\s*\(/.test(c)) {
      return fail("Garde l'appel useState : c'est sa POSITION qui doit changer.");
    }

    if (hookCallInsideIfBlock(c)) {
      return fail(
        "Un appel de hook est encore enferme dans un if. Remonte-le au niveau superieur du composant, avant tout if et tout return.",
        "structure"
      );
    }

    // o4b : le rendu conditionnel doit subsister (if, ternaire, ou `&&`/`||` en
    // JSX comme `{visible && <Truc />}`), et useState doit précéder le premier if.
    const firstIf = c.search(/\bif\s*\(/);
    const hasTernaryOrIf =
      firstIf !== -1 || /\?[^:]*:/.test(c) || /(?:&&|\|\|)\s*\(?\s*</.test(c);
    if (!hasTernaryOrIf) {
      return fail(
        "Ne supprime pas le comportement conditionnel : le panneau doit toujours pouvoir ne rien afficher.",
        "logic"
      );
    }

    const firstHook = c.search(/\buseState\s*\(/);
    if (firstIf !== -1 && firstHook > firstIf) {
      return fail(
        "L'appel useState doit preceder la condition, pas la suivre. Place-le en premiere ligne du composant.",
        "structure"
      );
    }

    return pass("Regles des hooks respectees.", ["o4a", "o4b"], true);
  },
];
