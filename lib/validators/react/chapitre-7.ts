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

/** Names of the declared custom hooks (`function useX`, `const useX =`...). */
function findCustomHookNames(code: string): string[] {
  const names: string[] = [];
  const re = /(?:function|const|let|var)\s+(use[A-Z]\w*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) names.push(m[1]!);
  return names;
}

/**
 * Is the hook `name` called, in addition to being declared? We first remove
 * `function <name>`, otherwise the declaration `function useCompteur()` would
 * count as a call (the `const useCompteur = () =>` form does not have this issue).
 */
function isHookCalled(code: string, name: string): boolean {
  const withoutDecl = code.replace(new RegExp(`function\\s+${name}`, "g"), "");
  return new RegExp(`\\b${name}\\s*\\(`).test(withoutDecl);
}

/**
 * First custom hook whose body satisfies `predicate`. Each hook is evaluated
 * separately: a correct hook does not validate an incomplete one.
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
 * Is a hook call (`useXxx(`) inside an `if (...) { ... }` block?
 *
 * Only `if` statements followed by braces are seen: an `if` without braces, an
 * `else`, a ternary, a loop or a `switch` are not detected. This is enough
 * for this exercise, whose `startCode` puts the call inside an `if { }`.
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
 * Contents of a `return { ... }` or `return [ ... ]`, with balanced delimiters:
 * `return { etat: { charge }, recharger };` contains a nested brace that
 * a `[^}]*` would cut off. Returns null when there is no such `return`.
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
 * Body of the cleanup returned by the effect, or null if the `return` does not
 * return a function.
 *
 * The expression after `return` (see `statementEnd`) is accepted if it is
 * an arrow, a `function` expression, or an identifier whose definition is
 * resolved in the effect, then in the hook. `return window.removeEventListener(...)`
 * unsubscribes right on mount instead of returning a function: rejected.
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
  // Step 1: extract the logic into a custom hook, and call it.
  (code) => {
    const c = strip(code);

    const hook = findHookBodyMatching(c, (body) => /\buseState\s*\(/.test(body));
    if (!hook) {
      const names = findCustomHookNames(c);
      if (names.length === 0) {
        return fail(
          "Déclare une fonction préfixée par use, par exemple function useCompteur() { ... }.",
          "structure"
        );
      }
      return fail(
        `Déplace l'appel useState à l'intérieur de ${names[0]} : c'est le hook qui doit porter l'état, pas le composant.`,
        "structure"
      );
    }

    if (!isHookCalled(c, hook.name)) {
      return fail(
        `${hook.name} est déclaré mais jamais appelé. Récupère-le dans ton composant avec ${hook.name}().`
      );
    }

    return pass("Logique extraite.", ["o1a", "o1b"]);
  },

  // Step 2: the hook returns a value and an action, the component destructures them.
  (code) => {
    const c = strip(code);

    const hook = findHookBodyMatching(c, (body) => /\buseState\s*\(/.test(body));
    if (!hook) {
      return fail(
        "Déclare un hook préfixé par use qui appelle useState.",
        "structure"
      );
    }

    // The hook must return at least two outputs (the value and the action).
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
        "Retourne DEUX sorties : la valeur à afficher et l'action qui la modifie.",
        "logic"
      );
    }

    // Caller side: destructuring of the hook's result.
    const destructured = new RegExp(
      `(?:const|let|var)\\s*(?:\\{[^}]*\\}|\\[[^\\]]*\\])\\s*=\\s*${hook.name}\\s*\\(`
    ).test(c);
    if (!destructured) {
      return fail(
        `Destructure le résultat dans le composant : const { valeur, action } = ${hook.name}();`
      );
    }

    return pass("Module branché.", ["o2a", "o2b"]);
  },

  // Step 3: hook with useEffect, subscribing and unsubscribing in the cleanup.
  (code) => {
    const c = strip(code);

    const hook = findHookBodyMatching(c, (body) => /\buseEffect\s*\(/.test(body));
    if (!hook) {
      return fail(
        "Déclare un hook préfixé par use qui appelle useEffect.",
        "structure"
      );
    }

    // The hook's useEffect, not just any one in the file.
    const effect = findBareCallBody(hook.body, "useEffect");
    if (!effect) {
      return fail("Appelle useEffect à l'intérieur de ton hook.", "structure");
    }

    if (!/addEventListener\s*\(/.test(effect.body)) {
      return fail(
        "Abonne-toi à l'événement dans l'effet : window.addEventListener('resize', handler)."
      );
    }

    const returnIdx = effect.body.search(/\breturn\b/);
    if (returnIdx === -1) {
      return fail(
        "Il manque la fonction de cleanup : termine l'effet par return () => ... pour te désabonner.",
        "logic"
      );
    }

    const cleanupBody = returnedCleanupBody(effect.body, hook.body);
    if (cleanupBody === null) {
      return fail(
        "Le cleanup doit RETOURNER une fonction, pas appeler removeEventListener directement : return () => window.removeEventListener('resize', handler) plutôt que return window.removeEventListener(...).",
        "logic"
      );
    }
    if (!/removeEventListener\s*\(/.test(cleanupBody)) {
      return fail(
        "Le désabonnement doit vivre DANS le cleanup : return () => window.removeEventListener('resize', handler).",
        "logic"
      );
    }

    if (!/\buseState\s*\(/.test(hook.body)) {
      return fail(
        "Stocke la largeur dans un état avec useState, sinon l'affichage ne se mettra jamais à jour.",
        "logic"
      );
    }

    return pass("Hublot calibré.", ["o3a", "o3b"]);
  },

  // Step 4: rules of hooks, no call inside a conditional block.
  (code) => {
    const c = strip(code);

    if (!/\buseState\s*\(/.test(c)) {
      return fail("Garde l'appel useState : c'est sa POSITION qui doit changer.");
    }

    if (hookCallInsideIfBlock(c)) {
      return fail(
        "Un appel de hook est encore enfermé dans un if. Remonte-le au niveau supérieur du composant, avant tout if et tout return.",
        "structure"
      );
    }

    // o4b: the conditional rendering must remain (if, ternary, or `&&`/`||` in
    // JSX such as `{visible && <Truc />}`), and useState must come before the first if.
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
        "L'appel useState doit précéder la condition, pas la suivre. Place-le en première ligne du composant.",
        "structure"
      );
    }

    return pass("Règles des hooks respectées.", ["o4a", "o4b"], true);
  },
];
