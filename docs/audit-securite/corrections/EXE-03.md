# EXE-03 - CSP permissive imposée à tout le site par le bac à sable

**Gravité** : Moyenne (défense en profondeur) · **Statut** : Corrigé (sous-domaine `bac-a-sable` à créer pour la production) · **Date** : 2026-09-14

## Constat

Le code des apprenants s'exécute dans une iframe `srcdoc` (JavaScript, aperçu HTML, aperçu React). Un `srcdoc` **hérite de la CSP du document parent**. Pour que `new Function` et les scripts inline de l'iframe fonctionnent, la CSP de l'application porte donc `'unsafe-inline'` et `'unsafe-eval'` dans `script-src` (`lib/security/csp.ts`). Ces deux jetons désarment l'essentiel de la protection anti-XSS **pour tout le site**, pas seulement pour le bac à sable : si une faille XSS apparaissait ailleurs (voir EXE-04, corrigé), la CSP ne la bloquerait pas.

Le ticket CF-15 de `docs/ROADMAP.md` avait mesuré le prérequis : il faut d'abord **servir l'exécution depuis une autre origine**. Cette origine porte alors seule la CSP permissive, et l'application peut passer à une CSP à nonce, sans `'unsafe-inline'` ni `'unsafe-eval'`.

## Cause du blocage identifiée

CF-15 restait bloqué sur un point non résolu : « servi comme page autonome, le document d'aperçu n'envoie jamais sa poignée de main `preview:ready` ».

Cause trouvée le 2026-09-14 : `buildPreviewSrcdoc(origin)` **fige l'origine du parent à la construction** et poste tout vers elle. Dans un `srcdoc`, cette origine est celle du parent, donc `ready` l'atteint. Servi depuis sa propre origine, le document postait `ready` vers **sa propre** origine, et le navigateur jetait le message en silence.

## Fondation posée (ce commit)

Isolée et réversible : la route existe mais **rien dans l'application ne l'utilise encore**. L'exécution reste dans le `srcdoc`, la CSP du site est inchangée.

- [lib/sandbox/sandbox-origin.ts](../../../lib/sandbox/sandbox-origin.ts) : l'origine dédiée. En production `bac-a-sable.laforgeducode.fr` ; en local `127.0.0.1` (origine distincte de `localhost`, même serveur).
- [lib/sandbox/preview-document.ts](../../../lib/sandbox/preview-document.ts) : le document d'aperçu React autonome. Il **apprend** l'origine du parent — `ready` posté à `"*"` (une poignée de main ne porte aucun secret), puis capture de `event.origin` du premier message reçu de `parent`, filtré par `event.source === parent`. Le runtime React est chargé par URL relative (servi sur l'origine dédiée).
- [app/bac-a-sable/route.ts](../../../app/bac-a-sable/route.ts) : sert ce document avec sa **propre CSP permissive** (`'unsafe-inline'`, `'unsafe-eval'`, `'wasm-unsafe-eval'`) et `frame-ancestors` limité aux origines de l'application, sans `X-Frame-Options`.
- `next.config.ts` : la route est exclue des en-têtes stricts globaux, qu'elle remplace par les siens.

Vérifié : la route sert le document (HTTP 200) avec sa CSP dédiée ; le script inline du document est syntaxiquement valide ; tests unitaires de `sandboxOriginFor` (5) ; `vitest` 1492 / 1492 ; `tsc` et `eslint` sans erreur.

**Non vérifiable dans le navigateur intégré** : la poignée de main réelle. Le panneau navigateur de l'atelier bloque les iframes vers le serveur de dev (`ERR_BLOCKED_BY_CLIENT`), quelle que soit l'origine. La preuve cross-origin viendra de Playwright, une fois `ReactPreview` câblé sur l'origine dédiée (voir ci-dessous), test qui charge un vrai Chromium sans cette restriction.

## Câblage — étape 1 : `ReactPreview` (fait)

[components/lesson/ReactPreview.tsx](../../../components/lesson/ReactPreview.tsx) charge désormais l'iframe d'aperçu par **`src`** vers l'origine dédiée (`sandboxOriginFor(origin) + /bac-a-sable`), et non plus par `srcDoc`. Le document exécuté (`preview-document.ts`) porte donc sa propre CSP (posée par la route) au lieu d'hériter de celle du site.

- `buildPreviewSrcdoc` (l'ancien document `srcdoc`) est **supprimé** : plus aucun appelant. Ses garde-fous d'exécution sont désormais couverts sur le document vivant par [preview-document.test.ts](../../../lib/sandbox/preview-document.test.ts). `react-preview.ts` se réduit au protocole de messages partagé.
- **Preuve cross-origin** : [e2e/react-preview.spec.ts](../../../e2e/react-preview.spec.ts) tourne sous un vrai Chromium. Nouveau test « l'aperçu est chargé depuis une origine distincte de l'application » : l'app est sur `localhost:3000`, l'aperçu sur `127.0.0.1:3000/bac-a-sable`. Ce test aurait été impossible avec un `srcdoc` (pas d'origine propre). Sortie : [annexes/EXE-03-apercu-react-origine-dediee.txt](annexes/EXE-03-apercu-react-origine-dediee.txt).
- Vérifié : `tsc` OK, `eslint` sans erreur, tests unitaires sandbox 23/23, `react-preview.spec.ts` 6/6.

À ce stade la CSP du site est **encore inchangée** : tant que le JavaScript et l'aperçu HTML restent en `srcdoc`, elle doit garder `'unsafe-inline'` / `'unsafe-eval'`. C'est l'objet des étapes suivantes.

## Câblage — étape 1b : sandbox JavaScript (fait)

[lib/sandbox/run-js.ts](../../../lib/sandbox/run-js.ts) charge désormais une iframe cachée par **`src`** vers `/bac-a-sable/js` (origine dédiée), attend sa poignée de main puis lui **poste** le code de l'apprenant — au lieu de le figer dans un `srcdoc` inline qui héritait de la CSP du site.

- Nouveau document servi [lib/sandbox/js-runner-document.ts](../../../lib/sandbox/js-runner-document.ts) (console factice, polyfill `localStorage`, bornes anti-emballement, flush 300 ms), couvert par [js-runner-document.test.ts](../../../lib/sandbox/js-runner-document.test.ts). Route [app/bac-a-sable/js/route.ts](../../../app/bac-a-sable/js/route.ts).
- Les en-têtes des trois documents du bac à sable sont désormais posés par un builder commun [lib/sandbox/sandbox-response.ts](../../../lib/sandbox/sandbox-response.ts).
- **Preuve cross-origin** : [e2e/securite-boucles.spec.ts](../../../e2e/securite-boucles.spec.ts) 3/3 (témoin exécuté et validé ; boucle JS interrompue, onglet vivant ; boucle SQL interrompue). Sortie : [annexes/EXE-03-sandbox-js-origine-dediee.txt](annexes/EXE-03-sandbox-js-origine-dediee.txt).

## Câblage — étape 1c : aperçu HTML (fait)

[components/lesson/ChapterWorkspace.tsx](../../../components/lesson/ChapterWorkspace.tsx) charge désormais l'aperçu HTML par **`src`** vers `/bac-a-sable/html` (origine dédiée), attend sa poignée de main puis lui **poste** le HTML de l'apprenant — au lieu de le poser en `srcdoc` sur le site.

- Nouvelle coquille servie [lib/sandbox/html-preview-document.ts](../../../lib/sandbox/html-preview-document.ts) : elle rend le HTML dans une **iframe imbriquée**, qui hérite de la CSP permissive de la coquille (et non de celle du site, deux crans plus haut). Couverte par [html-preview-document.test.ts](../../../lib/sandbox/html-preview-document.test.ts). Route [app/bac-a-sable/html/route.ts](../../../app/bac-a-sable/html/route.ts).
- **Preuve cross-origin** : [e2e/html-parcours.spec.ts](../../../e2e/html-parcours.spec.ts) 3/3, dont un nouveau test « l'aperçu HTML est rendu depuis une origine distincte » (origine dédiée + rendu à travers les deux iframes) et le parcours HTML complet toujours jouable. Sortie : [annexes/EXE-03-apercu-html-origine-dediee.txt](annexes/EXE-03-apercu-html-origine-dediee.txt).

**Les trois exécuteurs sont désormais servis depuis l'origine dédiée.** Plus aucun `srcdoc` du site n'exécute de `new Function` ni de script en ligne d'apprenant. Le prérequis du durcissement CSP est levé.

## Étape 2 : CSP à nonce (fait)

L'application émet désormais une **CSP à nonce** posée par [proxy.ts](../../../proxy.ts) : `script-src 'self' 'nonce-<unique>' 'strict-dynamic' 'wasm-unsafe-eval'`, **sans** `'unsafe-inline'` ni `'unsafe-eval'` (en production ; en dev, `'unsafe-eval'` reste requis par React). Une faille XSS ailleurs sur le site est désormais bloquée par la CSP — le gain visé par le constat.

- [lib/security/csp.ts](../../../lib/security/csp.ts) : builder `buildCsp({ nonce, isDev })` ; `frame-src` autorise l'origine dédiée du bac à sable (`bac-a-sable.laforgeducode.fr` + `localhost`/`127.0.0.1` en local). [csp.test.ts](../../../lib/security/csp.test.ts) retourné : il affirme maintenant l'**absence** de `'unsafe-*'` dans `script-src`.
- `next.config.ts` : la CSP fixe y est retirée (la CSP est à nonce, donc par requête). Les autres en-têtes de sécurité restent.
- [app/layout.tsx](../../../app/layout.tsx) : `export const dynamic = "force-dynamic"` — le nonce, unique par requête, impose le rendu dynamique (une page pré-rendue n'en aurait pas). Coût assumé : plus d'optimisation statique.
- Garde-fou e2e : `csp-srcdoc-script.spec.ts` (qui prouvait l'ancienne approche `srcdoc`) est remplacé par [csp-stricte.spec.ts](../../../e2e/csp-stricte.spec.ts) : sous la CSP de prod, `script-src` est à nonce + `strict-dynamic` sans `unsafe-*`, et la page hydrate sans violation.
- `strict-dynamic` : Monaco (loader injecté par le bundle nonce) et les chunks de Next restent chargés ; `'wasm-unsafe-eval'` garde sql.js (WebAssembly dans un Worker de l'app).

### Vérification contre un build de PRODUCTION

La CSP n'est émise qu'en production. Vérifiée contre `pnpm build && pnpm start` (base locale, jamais la prod) : `next build` OK ; en-tête CSP réel confirmé strict sur l'app et permissif confiné au bac à sable ; **22 tests e2e passés sous la CSP stricte, 0 violation CSP** — `csp-stricte`, `monaco` (Monaco charge), `react-preview` 6/6, `html-parcours` 3/3, `securite-boucles` 3/3 (dont SQL/WASM), `smoke` 7/7. Sortie : [annexes/EXE-03-csp-nonce-build-prod.txt](annexes/EXE-03-csp-nonce-build-prod.txt).

`vitest` 1509/1509 ; `tsc` et `eslint` sans erreur.

## Action hors code (production)

Créer le sous-domaine `bac-a-sable.laforgeducode.fr` : domaine à ajouter dans Vercel, et enregistrement CNAME chez OVH vers `cname.vercel-dns.com.`. **Tant qu'il n'existe pas, les aperçus ne fonctionneront pas en production** (l'origine dédiée ne résoudrait pas) — mais le reste du site tourne normalement sous la CSP stricte. En local, tout est prouvé via `127.0.0.1`.

## Risque résiduel

- **`style-src` garde `'unsafe-inline'`.** Le constat visait `script-src` (exécution de code) ; le risque XSS par style est marginal et de nombreux composants posent des styles en ligne. Durcir `style-src` par nonce est un chantier distinct, non retenu ici.
- **La CSP du bac à sable reste permissive**, mais confinée à son origine dédiée et encadrée par la seule application (`frame-ancestors`). C'est le compromis assumé : l'exécution de code arbitraire a besoin de `'unsafe-eval'`, isolée là où elle ne met pas le site en danger.
- **En dev**, `'unsafe-eval'` reste dans `script-src` (React l'utilise pour le débogage) et la CSP n'est de toute façon pas émise (`proxy.ts`, garde `CSP_ACTIVE`) : la posture stricte ne vaut qu'en production, où elle est prouvée.
