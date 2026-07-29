import type { Validator } from "@/data/courses/html/types";
import { stripLineComments, fail, pass, findCallBody, isFollowedByCall, hasEmptyLengthCheck } from "../_static-utils";

const strip = (code: string) => stripLineComments(code, "//");

// Regex de detection JSX partagees par les etapes 1 et 3 : un callback qui
// retourne du JSX soit sous forme flechee directe (`v => <li>...`), soit
// sous forme bloc avec return (`v => { ... return <li>...; }`).
const arrowJsxRe = /=>\s*\(?\s*<[A-Za-z]/;
const blockReturnJsxRe = /=>\s*\{[\s\S]*?return\s*\(?\s*<[A-Za-z]/;

/**
 * Cherche, parmi TOUTES les occurrences de `.map(` du code, une dont le
 * callback retourne effectivement du JSX. Corrige le meme piege pour les
 * etapes 1 et 3 : un `.map()` ou un composant sans rapport avec le rendu
 * (une valeur derivee, un composant de debug ailleurs dans le fichier) ne
 * doit pas polluer la detection de la VRAIE transformation en JSX.
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
  // Step 1: flotte.map(...) whose callback returns JSX (arrow body or block + return)
  (code) => {
    const c = strip(code);
    if (!findCallBody(c, "map")) {
      return fail("Utilise .map() sur le tableau flotte pour generer la liste, au lieu de recopier chaque <li> a la main.");
    }
    // On isole le(s) callback(s) de .map() plutot que de chercher une fleche
    // JSX n'importe ou dans le fichier : un composant sans rapport qui
    // retourne du JSX ailleurs (ex: const Debug = () => <span/>) ne doit pas
    // faire passer un .map() qui, lui, ne retourne que du texte.
    if (!findMapCallbackReturningJsx(c)) {
      return fail("Le callback de .map() doit retourner un element JSX, par exemple v => <li>{v.nom}</li>.");
    }
    return pass("Flotte affichee dynamiquement.", ["o1a", "o1b"]);
  },
  // Step 2: key={...} present, and not the bare index/i as the key expression
  (code) => {
    const c = strip(code);
    const keyMatches = [...c.matchAll(/key=\{([^}]*)\}/g)];
    if (keyMatches.length === 0) {
      return fail("Ajoute une prop key={...} sur l'element racine retourne par map (ex: <li key={v.id}>).");
    }
    const usesIndexOnly = keyMatches.some((m) => /^\s*(index|i|idx)\s*$/.test(m[1]));
    if (usesIndexOnly) {
      return fail(
        "N'utilise pas l'index du tableau comme key (key={index} ou key={i}) : des que la flotte bouge, React perd le fil. Utilise un identifiant stable comme v.id."
      );
    }
    return pass("Chaque vaisseau garde une identite stable.", ["o2a", "o2b"]);
  },
  // Step 3: .filter(...) must be CHAINED into .map( — pas juste "quelque
  // part avant" dans le fichier : on verifie que .map( suit directement la
  // parenthese fermante d'un des appels a .filter(.
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
      return fail("Chaine .map() APRES .filter(), dans cet ordre : flotte.filter(v => ...).map(v => ...).");
    }
    return pass("Flotte filtree puis affichee.", ["o3a", "o3b"]);
  },
  // Step 4: a length test on the FILTERED collection (operationnels — voir
  // startCode/objectifs de l'etape 4 dans data/courses/react/chapitre-5.ts)
  // AND a distinct alternative JSX branch.
  (code) => {
    const c = strip(code);
    // "operationnels" est le nom impose par le startCode de cette etape
    // (const operationnels = flotte.filter(...)) et par ses objectifs
    // ("Tester operationnels.length === 0"). Tester .length sur N'IMPORTE
    // QUELLE variable (ex: flotte, jamais vide dans cet exercice) validerait
    // a tort un branchement qui ne peut jamais se declencher : precisement
    // le bug que cette etape doit empecher.
    const hasLengthTest = hasEmptyLengthCheck(c, "operationnels");
    if (!hasLengthTest) {
      return fail("Teste la longueur du tableau (ex: operationnels.length === 0) pour detecter une liste vide.");
    }
    // The empty-state branch must actually render a message, not just bail out
    // (return null). Heuristic: a short JSX element (p/div/span/hN) that wraps
    // some text, distinct from the <li> the .map() produces.
    const hasMessageJsx = /<(p|div|span|h[1-6])\b[^>]*>[^<]*[A-Za-z][^<]*<\/\1>/.test(c);
    if (!hasMessageJsx) {
      return fail(
        "Quand la liste est vide, affiche un message a la place (ex: <p>Aucun vaisseau operationnel.</p>), pas un return null silencieux."
      );
    }
    return pass("Flotte cartographiee, meme a zero unite.", ["o4a", "o4b"], true);
  },
];
