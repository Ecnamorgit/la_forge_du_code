# EXE-03 - CSP permissive imposée à tout le site par le bac à sable

**Gravité** : Moyenne (défense en profondeur) · **Statut** : En cours — fondation posée, câblage et CSP à nonce à venir · **Date** : 2026-09-14

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

## Reste à faire (câblage et CSP — chantier à fort impact)

1. **Câbler les trois exécuteurs** sur l'origine dédiée : `ReactPreview` (iframe `src` au lieu de `srcDoc`), puis le JavaScript (`run-js.ts`) et l'aperçu HTML. `react-preview.spec.ts` devient alors la preuve cross-origin.
2. **Passer l'application à une CSP à nonce** posée par `proxy.ts` (`'strict-dynamic'`, sans `'unsafe-inline'` ni `'unsafe-eval'`). Conséquence : la page d'accueil, aujourd'hui pré-rendue, devient dynamique.
3. **Mettre à jour** `lib/security/csp.ts`, `csp.test.ts` et le garde-fou `csp-srcdoc-script.spec.ts`, puis relancer la suite contre un build de production (`E2E_PROD=1`), seul endroit où la CSP est réellement émise.

## Action hors code

Créer le sous-domaine `bac-a-sable.laforgeducode.fr` : domaine à ajouter dans Vercel, et enregistrement CNAME chez OVH vers `cname.vercel-dns.com.`

## Risque résiduel (tant que le chantier n'est pas terminé)

La CSP de l'application garde `'unsafe-inline'` et `'unsafe-eval'` jusqu'à l'étape 2. La fondation seule ne change donc pas encore la posture du site ; elle lève le prérequis qui bloquait CF-15.
