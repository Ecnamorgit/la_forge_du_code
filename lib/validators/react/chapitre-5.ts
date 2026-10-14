import type { Validator } from "@/data/courses/html/types";
import { stripLineComments, fail, pass, findCallBody, isFollowedByCall, hasEmptyLengthCheck } from "../_static-utils";

const strip = (code: string) => stripLineComments(code, "//");

// .map() callback that returns JSX, as a concise arrow (`v => <li>...`)
// or as a block with return (`v => { ... return <li>...; }`).
const arrowJsxRe = /=>\s*\(?\s*<[A-Za-z]/;
const blockReturnJsxRe = /=>\s*\{[\s\S]*?return\s*\(?\s*<[A-Za-z]/;

/**
 * True if at least one `.map(...)` call in the code has a callback that returns
 * JSX. Every call is examined: a `.map()` unrelated to rendering must not hide
 * the right one.
 */
function findMapCallbackReturningJsx(code: string): boolean {
  let match = findCallBody(code, "map");
  while (match) {
    if (arrowJsxRe.test(match.body) || blockReturnJsxRe.test(match.body)) {
      return true;
    }
    match = findCallBody(code, "map", match.end);
  }
  return false;
}

export const validators: Validator[] = [
  // Step 1: flotte.map(...) whose callback returns JSX
  (code) => {
    const c = strip(code);
    if (!findCallBody(c, "map")) {
      return fail("Utilise .map() sur le tableau flotte pour générer la liste, au lieu de recopier chaque <li> à la main.");
    }
    // Only .map() callbacks count: an unrelated component that returns JSX
    // (`const Debug = () => <span/>`) must not let through a .map() that
    // returns only text.
    if (!findMapCallbackReturningJsx(c)) {
      return fail("Le callback de .map() doit retourner un élément JSX, par exemple v => <li>{v.nom}</li>.");
    }
    return pass("Flotte affichée dynamiquement.", ["o1a", "o1b"]);
  },
  // Step 2: a key={...} prop that is not just the index
  (code) => {
    const c = strip(code);
    const keyMatches = [...c.matchAll(/key=\{([^}]*)\}/g)];
    if (keyMatches.length === 0) {
      return fail("Ajoute une prop key={...} sur l'élément racine retourné par map (ex: <li key={v.id}>).");
    }
    const usesIndexOnly = keyMatches.some((m) => /^\s*(index|i|idx)\s*$/.test(m[1]));
    if (usesIndexOnly) {
      return fail(
        "N'utilise pas l'index du tableau comme key (key={index} ou key={i}) : dès que la flotte bouge, React perd le fil. Utilise un identifiant stable comme v.id."
      );
    }
    return pass("Chaque vaisseau garde une identité stable.", ["o2a", "o2b"]);
  },
  // Step 3: .map() chained directly after a .filter(...), not merely
  // present further down in the file.
  (code) => {
    const c = strip(code);
    let filterMatch = findCallBody(c, "filter");
    if (!filterMatch) {
      return fail("Filtre le tableau avec .filter() avant de le transformer en JSX : flotte.filter(...).map(...).");
    }
    let isChained = false;
    while (filterMatch) {
      if (isFollowedByCall(c, filterMatch.end, "map")) {
        isChained = true;
        break;
      }
      filterMatch = findCallBody(c, "filter", filterMatch.end);
    }
    if (!isChained) {
      return fail("Chaîne .map() APRÈS .filter(), dans cet ordre : flotte.filter(v => ...).map(v => ...).");
    }
    return pass("Flotte filtrée puis affichée.", ["o3a", "o3b"]);
  },
  // Step 4: length check on the filtered collection (`operationnels`) and
  // an alternative JSX branch.
  (code) => {
    const c = strip(code);
    // `operationnels` is the name required by the startCode and the step's
    // objectives. Accepting a check on any variable (`flotte`, never empty
    // here) would pass a branch that never triggers.
    const hasLengthTest = hasEmptyLengthCheck(c, "operationnels");
    if (!hasLengthTest) {
      return fail("Teste la longueur du tableau (ex: operationnels.length === 0) pour détecter une liste vide.");
    }
    // The empty branch must display a message, not just `return null`:
    // look for a short element (p, div, span, hN) that contains text.
    const hasMessageJsx = /<(p|div|span|h[1-6])\b[^>]*>[^<]*[A-Za-z][^<]*<\/\1>/.test(c);
    if (!hasMessageJsx) {
      return fail(
        "Quand la liste est vide, affiche un message à la place (ex: <p>Aucun vaisseau operationnel.</p>), pas un return null silencieux."
      );
    }
    return pass("Flotte cartographiée, même à zéro unité.", ["o4a", "o4b"], true);
  },
];
