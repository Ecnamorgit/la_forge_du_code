import type { Validator } from "@/data/courses/html/types";
import {
  stripLineComments,
  fail,
  pass,
  findJsxTagAttrs,
  extractAttrValue,
  findBareCallBody,
  findNamedFunctionBody,
} from "../_static-utils";

const strip = (code: string) => stripLineComments(code, "//");

// ---------------------------------------------------------------------------
// findJsxTagAttrs / extractAttrValue / findBareCallBody / findNamedFunctionBody
// vivent desormais dans _static-utils.ts (generiques, reutilisees par les
// chapitres suivants sur les hooks/le contexte). Voir leurs doc-comments
// la-bas pour le detail de leurs heuristiques et limites.
// ---------------------------------------------------------------------------

/**
 * Resout la valeur d'une prop handler JSX (onChange, onSubmit...) vers le
 * code a inspecter : si c'est un identifiant nu (`handleSubmit`) ou une
 * fleche qui delegue directement a un nom (`(e) => handleSubmit(e)`), suit
 * la definition de la fonction nommee correspondante via
 * `findNamedFunctionBody`. Sinon (fleche avec un corps propre), renvoie la
 * valeur telle quelle. Si le nom resolu n'est pas une fonction nommee
 * trouvable (ex: un setter comme `setNom`), retombe sur la valeur d'origine
 * plutot que d'echouer.
 */
function resolveHandlerSource(code: string, attrValue: string): string {
  const identMatch = /^\s*([A-Za-z_$][\w$]*)\s*$/.exec(attrValue);
  const delegateMatch = identMatch
    ? null
    : /^\s*\([^)]*\)\s*=>\s*([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*;?\s*$/.exec(attrValue);
  const name = identMatch ? identMatch[1] : delegateMatch ? delegateMatch[1] : null;
  if (!name) return attrValue;
  const fnBody = findNamedFunctionBody(code, name);
  return fnBody !== null ? fnBody : attrValue;
}

export const validators: Validator[] = [
  // Step 1 (piege Spectre): <input value={...} onChange={...}> avec un
  // setter appele DANS le handler onChange (pas juste "value= et onChange=
  // presents quelque part dans le fichier").
  (code) => {
    const c = strip(code);
    const tag = findJsxTagAttrs(c, "input");
    if (!tag || !/\bvalue\s*=\s*\{/.test(tag.body)) {
      return fail(
        "Garde l'input controle par React : value={nom} doit rester branche sur l'etat."
      );
    }
    const onChangeValue = extractAttrValue(tag.body, "onChange");
    if (onChangeValue === null) {
      return fail(
        "Le Spectre a coupe l'ecoute du clavier : ajoute onChange={(e) => setNom(e.target.value)} sur l'input."
      );
    }
    // onChange peut etre une fleche inline OU un identifiant qui delegue a un
    // handler nomme (ex: onChange={handleChange}) — c'est justement le motif
    // enseigne par l'etape 2 suivante. On suit cette indirection avant de
    // chercher l'appel au setter, sinon la forme la plus idiomatique du
    // controlled input est rejetee a tort.
    const handlerSource = resolveHandlerSource(c, onChangeValue);
    if (!/\bset[A-Z]\w*\s*\(/.test(handlerSource)) {
      return fail(
        "Ton onChange existe mais ne met a jour aucun etat : appelle le setter (ex: setNom(e.target.value)) a l'interieur."
      );
    }
    return pass("Console de saisie restauree.", ["o1a", "o1b"]);
  },

  // Step 2: useState({ ... }) + mise a jour par spread, avec soit une cle
  // calculee ([name]: value), soit les deux champs geres separement (mais
  // toujours via spread, jamais en ecrasant l'objet).
  //
  // Chaque appel a setFormulaire(...) est evalue INDEPENDAMMENT (finding 1
  // de la revue) : l'ancienne version faisait un OU global sur hasSpread a
  // travers TOUS les appels, si bien qu'un seul appel correct (avec spread)
  // "blanchissait" un autre appel du meme fichier qui ecrasait l'etat sans
  // spread — exactement le bug que cette etape est censee faire echouer.
  // On garde volontairement le framing "au moins UN bon appel, AUCUN mauvais
  // appel" plutot que "un unique appel qui reunit toutes les conditions" :
  // le cas legitime "nom et email geres par deux handlers separes" (test
  // ci-dessous) n'a JAMAIS un seul appel qui contient a la fois nom ET
  // email — la couverture des deux champs se lit forcement a travers
  // plusieurs appels. Seule la regle d'immutabilite (spread) doit valoir
  // pour CHAQUE appel individuellement, car un seul appel sans spread suffit
  // a perdre des donnees a chaque frappe, meme si un autre appel est correct.
  (code) => {
    const c = strip(code);
    if (!/useState\s*\(\s*\{/.test(c)) {
      return fail(
        "Regroupe nom et email dans un seul etat objet : useState({ nom: '', email: '' })."
      );
    }
    let match = findBareCallBody(c, "setFormulaire");
    if (!match) {
      return fail(
        "Mets a jour l'etat via le setter de l'objet (setFormulaire({ ...formulaire, ... }))."
      );
    }
    let hasBadCall = false;
    let hasComputedKey = false;
    const literalKeys = new Set<string>();
    while (match) {
      const spread = /\.\.\.\s*[A-Za-z_$][\w$]*/.test(match.body);
      if (!spread) {
        // Cet appel precis ecrase l'etat : peu importe qu'un AUTRE appel
        // fasse le spread correctement, celui-ci perd des donnees.
        hasBadCall = true;
      } else {
        if (/\[\s*[\w.]+\s*\]\s*:/.test(match.body)) hasComputedKey = true;
        for (const m of match.body.matchAll(/\b(nom|email)\s*:/g)) {
          literalKeys.add(m[1]);
        }
      }
      match = findBareCallBody(c, "setFormulaire", match.end);
    }
    if (hasBadCall) {
      return fail(
        "Mets a jour l'etat par copie : setFormulaire({ ...formulaire, ... }), jamais en ecrasant l'objet entier. Verifie que TOUS tes appels a setFormulaire font le spread, pas seulement certains."
      );
    }
    if (!hasComputedKey && literalKeys.size < 2) {
      return fail(
        "Mets a jour le bon champ : une cle calculee ([e.target.name]: valeur), ou nom et email geres separement."
      );
    }
    return pass("Etat regroupe dans un seul objet.", ["o2a", "o2b"]);
  },

  // Step 3: onSubmit doit etre sur le <form> (pas onClick sur le bouton), et
  // le handler qu'il designe (inline ou par reference nommee) doit appeler
  // e.preventDefault().
  (code) => {
    const c = strip(code);
    const formTag = findJsxTagAttrs(c, "form");
    if (!formTag || !/\bonSubmit\s*=\s*\{/.test(formTag.body)) {
      return fail(
        "Attache le gestionnaire de soumission sur le <form> lui-meme (onSubmit={...}), pas sur le bouton."
      );
    }
    const onSubmitValue = extractAttrValue(formTag.body, "onSubmit") ?? "";
    // Suit aussi bien une reference nue (onSubmit={handleSubmit}) qu'un
    // wrapper qui delegue directement (onSubmit={(e) => handleSubmit(e)}) :
    // ce dernier est un style courant qui ne doit pas etre penalise juste
    // parce que le preventDefault vit dans la fonction nommee et pas dans
    // la fleche elle-meme.
    const handlerSource = resolveHandlerSource(c, onSubmitValue);
    if (!/\.preventDefault\s*\(\s*\)/.test(handlerSource)) {
      return fail(
        "Empeche le rechargement de la page : appelle e.preventDefault() dans le gestionnaire attache a onSubmit."
      );
    }
    return pass("Transmission maitrisee.", ["o3a", "o3b"]);
  },

  // Step 4: disabled doit etre une expression derivee de l'etat formulaire,
  // pas une valeur figee (true/false ou toute autre valeur arbitraire).
  (code) => {
    const c = strip(code);
    const buttonTag = findJsxTagAttrs(c, "button");
    if (!buttonTag || !/\bdisabled\s*=\s*\{/.test(buttonTag.body)) {
      return fail("Ajoute un attribut disabled={...} sur le bouton d'envoi.");
    }
    const value = (extractAttrValue(buttonTag.body, "disabled") ?? "").trim();
    if (/^(true|false)$/.test(value)) {
      return fail(
        "disabled={false} (ou {true}) est fige : calcule la condition a partir de l'etat, ex: disabled={!formulaire.nom || !formulaire.email}."
      );
    }
    if (!/\bformulaire\b/.test(value)) {
      return fail(
        "La condition de disabled doit deriver de l'etat du formulaire (formulaire.nom, formulaire.email...), pas d'une valeur arbitraire."
      );
    }
    return pass("Console verrouillee tant que le formulaire est incomplet.", ["o4a", "o4b"], true);
  },
];
