# Runtime React — Design

**Date** : 2026-07-30
**Statut** : validé (approche « parent transforme, iframe persistante » choisie par Joan)
**Branche** : `feat/react-runtime`

## Objectif

Faire vivre le code React de l'apprenant devant lui : son composant se monte,
s'affiche, réagit à ses clics, et les erreurs de React lui parviennent
telles quelles.

Aujourd'hui le cursus React est le seul dont le code n'est jamais exécuté. Un
correctif du 2026-07-30 (`b0748c0`) a supprimé la fausse promesse — le panneau
annonçait « Aperçu en direct » en affichant du JSX parsé comme du HTML — et le
remplace par « Analyse statique », honnête mais vide. Ce chantier remplit ce
vide.

## Décisions actées

| Sujet | Décision |
|---|---|
| Où tourne la transformation JSX | **Dans le navigateur.** Le code de l'apprenant ne quitte jamais sa machine ; la promesse de `docs/SANDBOX_REPORT.md` reste intacte mot pour mot. |
| Transformateur | **Sucrase** (~250 Ko) plutôt que Babel standalone (~2,5 Mo). Il ne fait que JSX / TS / modules, ce qui est exactement le besoin. |
| Architecture | **Le parent transforme, l'iframe persiste.** Le transformateur est chargé une fois par session, React une fois par chapitre. |
| Composant à monter | **Champ explicite `previewMount` par étape.** Aucune heuristique. |
| Validation | **Reste statique.** L'aperçu affiche, il ne juge pas. |
| Chapitre 4 (React Router) | **Exempté**, avec raison écrite et test qui l'exige. |

## Pourquoi la validation reste statique

La validation par le rendu semble supérieure — un validateur qui lit le DOM ne
peut pas se faire piéger par une accolade de destructuration, ce qui est le
défaut que les revues du cursus React ont trouvé quatre fois.

Mais elle déplace le problème au lieu de le supprimer : au lieu d'un validateur
qui accepte du mauvais code, on obtient un validateur qui **rejette du bon
code** parce que le rendu n'a pas fini, ou parce que l'apprenant a nommé son
bouton autrement. Et l'échec devient bien plus coûteux à diagnostiquer :
asynchrone, dans une iframe à origine opaque où l'on ne peut pas poser de point
d'arrêt.

Surtout, rien n'indique que la validation statique gêne réellement les
apprenants — il y en a quatre. Réécrire 28 validateurs pour un problème non
observé n'est pas justifié. L'aperçu, lui, corrige un manque constaté.

Conséquence assumée : les deux systèmes peuvent se contredire. « Aperçu qui
marche, validateur rouge » est le cas pénible. Le risque a baissé pendant la
stabilisation du cursus, où les revues ont forcé les validateurs à accepter
plusieurs formes correctes (`function useX` et `const useX =`, objet et tableau,
`switch` et `if`, rendu conditionnel par `&&`).

---

## Contraintes du terrain

Quatre faits établis par exploration, dont deux non évidents.

**`run-js.ts` n'est pas réutilisable.** Le sandbox JS existant est *headless et à
un coup* : il crée une iframe cachée, exécute, poste un résultat, puis détruit
l'iframe (`lib/sandbox/run-js.ts:56`). Un aperçu a besoin d'une iframe
persistante, visible et interactive. Le point de départ est l'iframe d'aperçu
HTML, pas celle-ci.

**La CSP est déjà prête.** `next.config.ts:12` documente que `'unsafe-eval'` est
requis « par Monaco ET par le lesson runner (`new Function` dans l'iframe
srcdoc) ». Aucune concession nouvelle.

**Les URL relatives ne résolvent rien dans un `srcdoc`.** Le document a pour
base `about:srcdoc`. L'origine absolue doit être injectée — patron déjà employé
par `run-js.ts:46` pour son `postMessage`.

**React 19 n'a plus de builds UMD.** `node_modules/react` et `react-dom` ne
contiennent que du CJS. Aucun `<script src>` ne peut charger React tel quel :
une étape de bundling est donc structurellement nécessaire. C'est le seul
élément du chantier qui ne soit pas négociable.

Repère de proportion : `public/monaco` pèse déjà **16 Mo** auto-hébergés. Le
poids du runtime React (~553 Ko) n'est pas un sujet.

---

## Architecture

| Fichier | Rôle |
|---|---|
| `scripts/build-react-runtime.mjs` | **Prebuild.** Bundle React + ReactDOM en `public/react-runtime/runtime.js`, qui les accroche à `window`. Branché sur `predev` et `prebuild`, à côté de `copy-monaco.mjs`. |
| `lib/sandbox/jsx-transform.ts` | Enveloppe Sucrase. `transformJsx(code): { ok: true; js: string } \| { ok: false; error: string }`. Import dynamique : Sucrase n'entre pas dans le bundle initial. Pur, testable en node. |
| `lib/sandbox/react-preview.ts` | `buildPreviewSrcdoc(origin): string` et `parsePreviewMessage(event): PreviewMessage \| null`. Purs tous les deux. |
| `lib/sandbox/preview-exemptions.ts` | `PREVIEW_EXEMPT: Record<string, string>` — chapitres sans aperçu, avec la raison. |
| `components/lesson/ReactPreview.tsx` | Possède l'iframe et le panneau : zone de rendu, zone d'erreur, état d'attente. |
| `data/courses/html/types.ts` | Ajoute `previewMount?: string` au type `Step`. |

`ChapterWorkspace` change peu : quand `isReact`, il monte `<ReactPreview>` au
lieu du panneau « Analyse statique ». La validation statique se déroule comme
aujourd'hui, **en plus** de l'aperçu et jamais à sa place.

**Qui appelle `transformJsx` : `ReactPreview`, pas `ChapterWorkspace`.** L'interface
est volontairement étroite :

```tsx
<ReactPreview code={code} mount={step.previewMount} deployNonce={deployCount} />
```

`ChapterWorkspace` incrémente `deployNonce` au clic sur DÉPLOYER et ne sait rien
d'autre. `ReactPreview` transforme, envoie, écoute les erreurs et les affiche —
transformation, rendu et affichage d'erreur vivent donc dans une seule unité, et
`ChapterWorkspace` reste ignorant de Sucrase comme du protocole de messages.

`esbuild` entre en devDependency. C'est le premier bundler du projet.
L'alternative — committer le bundle généré dans `public/` — évite la dépendance
mais laisse un artefact que personne ne saura régénérer dans six mois.

### Protocole

```
iframe → parent   preview:ready                    React chargé, prêt à recevoir
parent → iframe   preview:render { js, mount }     à chaque déploiement
iframe → parent   preview:error  { kind, message } kind = transform | mount | runtime
```

La poignée de main `ready` n'est pas décorative : un `postMessage` envoyé avant
que le script de l'iframe ait tourné est perdu sans erreur. Le parent met en
file le dernier code et l'envoie à réception de `ready`.

### Montage

Les exercices n'ont ni `import` ni `export` : ils supposent `useState`,
`useEffect`, `useContext`, `useReducer`, `createContext` disponibles comme
globales.

**Les globales sont dérivées de React, pas énumérées à la main.** L'iframe
construit la liste depuis `Object.keys(React)` :

```js
const noms = Object.keys(React).filter(
  (k) => /^use[A-Z]/.test(k) || k === "createContext" || k === "Fragment" || k === "memo"
);
const fn = new Function(
  "React", "ReactDOM", ...noms,
  '"use strict";' + js + "; return typeof " + mount + " !== 'undefined' ? " + mount + " : null;"
);
const Composant = fn(React, ReactDOM, ...noms.map((k) => React[k]));
```

Une liste écrite à la main serait un piège : le jour où un exercice utilise
`useRef` ou `useCallback`, l'apprenant récolterait un `useRef is not defined`
qu'il ne peut pas corriger — son code est juste, c'est l'aperçu qui est
incomplet. La dérivation supprime cette classe de bug entièrement.

Vérifié à la rédaction : les chapitres n'utilisent aujourd'hui que `useState`,
`useEffect`, `useContext`, `useReducer` et `createContext` dans du code
exécutable. `useMemo` n'apparaît que dans la prose d'un briefing du chapitre 3 ;
les hooks de routage (`useNavigate`, `useParams`, `useLocation`, `useMatch`,
`useSearchParams`) sont tous dans le chapitre 4, exempté.

Même idiome `new Function` que `run-js.ts:120` — cohérent avec le sandbox
existant plutôt qu'un mécanisme parallèle.

`previewMount` est interpolé dans un corps de fonction, donc validé contre
`/^[A-Za-z_$][\w$]*$/` avant usage. Pas pour la sécurité — le sandbox exécute
déjà du code arbitraire, un `previewMount` malveillant n'ajoute rien — mais pour
qu'une coquille dans les données produise un message clair au lieu d'une erreur
de syntaxe opaque.

**Remontage complet à chaque déploiement** : `root.unmount()`, conteneur vidé,
nouveau `createRoot`. L'apprenant qui redéploie attend un état neuf, pas un
compteur qui a gardé sa valeur.

---

## Sécurité

L'iframe garde `sandbox="allow-scripts"` **sans** `allow-same-origin` :
l'isolation documentée dans `docs/SANDBOX_REPORT.md` reste intacte — pas d'accès
au `window` de l'app, ni aux cookies, ni au storage.

**Asymétrie assumée** : le parent doit poster vers `"*"`. L'iframe étant à
origine opaque, `postMessage` n'accepte pas `"null"` comme origine cible ;
`"*"` est la seule valeur possible. C'est plus permissif que ce que fait
`run-js.ts:134` dans l'autre sens. Acceptable parce que la charge utile est le
code de l'apprenant lui-même, pas un secret — et l'iframe vérifie
`event.source === parent`. Mais c'est une asymétrie réelle, à ne pas enterrer.

---

## Gestion des erreurs

| Type | Origine | Traitement |
|---|---|---|
| `transform` | Sucrase refuse le JSX | Affiché par le parent, l'iframe n'est pas touchée |
| `mount` | le composant nommé n'existe pas après évaluation | « Le composant `X` n'a pas été trouvé. Vérifie son nom. » |
| `runtime` | React lève pendant le rendu | Frontière d'erreur dans l'iframe, message posté au parent |

La frontière d'erreur est ce qui rend le chapitre 7 étape 4 réellement
pédagogique : `Rendered fewer hooks than expected` est levé pendant le rendu,
donc une frontière le capture et on l'affiche tel quel. C'est un meilleur
professeur que le message du validateur, parce que c'est celui que l'apprenant
rencontrera toute sa carrière.

Une frontière ne voit pas tout : une erreur dans un `setTimeout` d'un
`useEffect` lui échappe. L'iframe installe donc aussi `window.onerror` et
`unhandledrejection` — sans quoi le chapitre 7 étape 3, celui qui enseigne
l'abonnement, pourrait planter en silence.

**L'aperçu ne bloque jamais la leçon.** Si `ready` n'arrive pas au bout de
5 secondes — `runtime.js` introuvable, CSP qui refuse — le panneau affiche
« Aperçu indisponible » et la validation continue de fonctionner. L'apprenant
termine son chapitre sans aperçu. Cette contrainte décide de toutes les autres :
l'aperçu est un bonus, pas un chemin critique.

**Rien avant le premier déploiement.** Le panneau affiche « Déploie pour voir
ton composant ». Rendre le `startCode` d'entrée serait tentant, mais les
`startCode` sont délibérément incomplets — celui du chapitre 8 étape 2 n'a même
pas de `App`. L'apprenant verrait des erreurs qu'il n'a pas causées avant
d'avoir écrit une ligne.

---

## Risque principal, et son repli

L'iframe doit charger `runtime.js` depuis l'origine du parent par URL absolue.
La CSP héritée dit `script-src 'self'`, et **il n'est pas établi que `'self'`
résolve vers l'origine du parent depuis un document à origine opaque.** La CSP
n'étant active qu'en production (`next.config.ts` : `isProd`), un
développement vert ne prouve rien.

**Repli** : inliner `runtime.js` dans le `srcdoc`. Marche à coup sûr, coûte
~553 Ko de script inline, et comme l'iframe n'est construite qu'une fois par
chapitre — pas à chaque déploiement — c'est supportable.

**À vérifier en premier, sur une preview de production.** Si le repli est
nécessaire, il change la forme de `buildPreviewSrcdoc` : autant le savoir avant
d'écrire le reste.

---

## Périmètre

### Dedans

- `esbuild` en devDependency, `scripts/build-react-runtime.mjs`, branché sur `predev` et `prebuild`
- `lib/sandbox/jsx-transform.ts`, `react-preview.ts`, `preview-exemptions.ts`
- `components/lesson/ReactPreview.tsx`
- `previewMount` sur le type `Step`, renseigné sur **28 étapes** (7 chapitres × 4)
- Le câblage `isReact` dans `ChapterWorkspace`
- Trois tests unitaires, un test d'intégrité, un test e2e
- La vérification CSP sur preview de production, **en premier**

### Dehors, explicitement

- **La validation par le rendu.** Les validateurs restent statiques.
- **L'aperçu du chapitre 4** — exempté, voir ci-dessous.
- **Les autres cursus.** HTML et CSS gardent leur iframe, JS sa console, SQL sa table.
- **Le bug préexistant de l'aperçu HTML** : `srcdoc` vide jusqu'au clic sur
  DÉPLOYER, établi par A/B le 2026-07-30 (reproduit après mise de côté du
  correctif du jour). Réel, mais indépendant.
- **Les fiches de référence React** (tâche 7C du backlog).

### Chapitre 4 : exemption écrite

Le chapitre 4 enseigne React Router et utilise `Link`, `Route`, `Router`,
`useNavigate`. `react-router-dom` n'est même pas une dépendance du projet. Un
aperçu exigerait cette dépendance dans le bundle **et** un `MemoryRouter` autour
du composant monté, sinon `useNavigate` lève immédiatement.

```ts
export const PREVIEW_EXEMPT: Record<string, string> = {
  "react/chapitre-4":
    "Enseigne React Router : l'apercu exigerait react-router-dom dans le bundle " +
    "et un MemoryRouter autour du composant monte. Hors perimetre du runtime v1.",
};
```

Le test d'intégrité exige que **chaque** étape React soit dans un des deux cas :
elle a un `previewMount` valide, ou son chapitre est exempté avec une raison
écrite. Une étape oubliée échoue. C'est ce qui distingue une exclusion assumée
d'un trou.

---

## Tests

| Test | Ce qu'il verrouille |
|---|---|
| `lib/sandbox/jsx-transform.test.ts` | JSX valide → JS ; JSX cassé → erreur portée, jamais d'exception qui traverse |
| `lib/sandbox/react-preview.test.ts` | `buildPreviewSrcdoc(origin)` contient l'origine absolue et **aucune** URL relative ; `parsePreviewMessage` rejette une mauvaise source, un mauvais type, une charge malformée |
| `lib/sandbox/preview-mounts.test.ts` | Les 28 `previewMount` présents et bien formés ; chacun apparaît comme déclaration dans le `hint` de son étape ; toute étape sans `previewMount` appartient à un chapitre exempté |
| `e2e/react-preview.spec.ts` | Chapitre 7 étape 1 : saisir le hint, déployer, l'iframe affiche `Poussee : 0` |

Le troisième est le seul qui attrape la vraie erreur de données : un
`previewMount: "App"` sur une étape dont la solution déclare `Reacteur`. Le hint
étant la solution de référence, c'est une source fiable.

Sur l'e2e : Playwright accède au contenu d'une iframe à origine opaque via
`frameLocator`, en opérant au niveau du protocole et non via la règle de même
origine. **À confirmer tôt** : si ça ne passe pas, l'aperçu devient
invérifiable automatiquement et on retombe sur du contrôle manuel.

## Définition de « fini »

`pnpm lint` · `pnpm typecheck` · `pnpm test:run` · `pnpm build` ·
`pnpm exec playwright test --workers=2` — les cinq verts.

Plus la vérification manuelle que l'aperçu charge sous CSP de production : la
seule chose que le développement ne peut pas prouver.

## Note de charge

Sur les 28 étapes, certaines déclarent plusieurs composants — le chapitre 8
étape 4 a `Console` **et** `App`, et c'est `App` qu'il faut monter puisqu'il
porte le Provider. Ailleurs, chapitre 7 étape 1, c'est `Reacteur`. Il n'y a pas
de règle : c'est du jugement étape par étape.

C'est précisément pourquoi le champ explicite a été choisi, et ça se paie au
remplissage : environ une heure de travail attentif, pas une substitution
mécanique. Le plan doit le budgéter honnêtement.
