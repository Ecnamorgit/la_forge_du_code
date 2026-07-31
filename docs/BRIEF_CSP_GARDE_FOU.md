# Brief — Rien ne garde la CSP automatiquement

**Date :** 2026-07-31
**Statut :** brief de cadrage, à brainstormer. Ce n'est **pas** une spec.
**Origine :** revue de branche finale du chantier « Runtime React » (`e45820d`).

> À lire en premier dans une conversation neuve : ce document contient tout le
> contexte nécessaire, il n'y a rien à re-dériver.

---

## Le problème en une phrase

L'aperçu React dépend de directives CSP précises, **une tâche déjà planifiée
prévoit de les retirer**, et rien dans la CI ne s'en apercevrait.

## Pourquoi c'est urgent, et pas théorique

`docs/ROADMAP.md:149` — **CF-15 · Durcir la CSP (retirer `unsafe-inline` /
`unsafe-eval`)**, avec pour critère d'acceptation :

> « CSP sans `unsafe-inline` côté script (nonces) sans casser Monaco/hydration »

Ce critère a été écrit **avant** que l'aperçu React existe. Il nomme Monaco et
l'hydratation, pas l'aperçu. Celui qui exécutera CF-15 validera donc les deux
choses citées, verra une suite de tests entièrement verte, et livrera un aperçu
React cassé pour tous les apprenants.

C'est le scénario précis à empêcher. Il ne demande aucune malveillance ni
aucune erreur : juste quelqu'un qui fait consciencieusement une tâche du
backlog.

## Ce dont l'aperçu a besoin, exactement

`next.config.ts:26` :

```
script-src 'self' 'unsafe-inline' 'unsafe-eval'
```

Trois dépendances, toutes nécessaires :

| Directive | Qui en a besoin | Si elle disparaît |
|---|---|---|
| `'self'` | l'iframe charge `/react-runtime/runtime.js` depuis l'origine du parent, par URL absolue | l'aperçu ne charge plus React → « Aperçu indisponible » |
| `'unsafe-inline'` | le `<script>` inline du `srcdoc` (tout le programme de l'iframe) | idem, et le `srcdoc` devient inerte |
| `'unsafe-eval'` | `new Function` dans le `srcdoc` **et** dans `lib/sandbox/run-js.ts` | l'aperçu React **et** tout le cursus JavaScript cessent de fonctionner |

Le dernier point mérite d'être souligné : `'unsafe-eval'` n'est pas seulement
une dépendance de ce chantier. `next.config.ts:12` le documente déjà comme
requis « par Monaco ET par le lesson runner ». **CF-15 tel qu'il est écrit
demande de retirer quelque chose dont deux cursus dépendent pour exister.**

Un `nonce` posé sur `script-src` a un effet supplémentaire non évident : en
CSP niveau 3, la présence d'un nonce **fait ignorer `'unsafe-inline'`** par les
navigateurs qui le supportent. Le durcissement casserait donc l'aperçu même si
`'unsafe-inline'` restait littéralement écrit dans la politique.

## Pourquoi le garde-fou actuel ne garde rien

Il existe un test qui a l'air de couvrir ça — c'est ce qui rend le trou
dangereux plutôt que simplement absent.

`e2e/csp-srcdoc-script.spec.ts` vérifie qu'une iframe `srcdoc` à origine opaque
peut charger un script de l'origine du parent. Il a été écrit exprès pour ça, et
il **fonctionne** : lancé contre un build de production, il prouve la propriété.

Mais :

- `next.config.ts:48` — la CSP n'est émise que si `NODE_ENV=production`
  (garde `isProd`).
- `playwright.config.ts:30` — `webServer.command` vaut `pnpm dev`.
- `.github/workflows/ci.yml` — le job e2e lance `pnpm test:e2e` sans aucun
  build de production préalable.

Donc en CI, aucun en-tête CSP n'est émis. Le test le détecte et **se saute
explicitement** — il ne ment pas, mais il ne protège rien non plus.

Et le trou est plus large que ce seul test : **`e2e/react-preview.spec.ts` ne
tourne lui aussi que contre `pnpm dev`**. Rien, nulle part, n'exerce le script
inline du `srcdoc` sous une CSP réelle.

## Ce qui est déjà établi, à ne pas re-vérifier

- Sous CSP de production, `script-src 'self'` **autorise bien** une iframe
  `srcdoc` à origine opaque à charger un script depuis l'origine du parent.
  Vérifié le 2026-07-30 contre un vrai `pnpm build && pnpm start`, en-tête
  confirmé par `curl`. Le repli par inlining du runtime n'est pas nécessaire.
- La suite e2e complète est verte : 22 passent, 1 skippé (ce test CSP), 0 échec.
- **Friction locale connue** : `.env` a `APP_URL="http://localhost:3000"`, que
  `lib/env.ts` rejette sous `NODE_ENV=production`. Tout `pnpm start` local
  exige un override shell (`APP_URL="https://example.com"`). Ne pas éditer
  `.env` — il pointe sur la base Supabase de production.

## Pistes, avec leurs vrais arbitrages

Elles ne s'excluent pas ; A et B sont probablement complémentaires.

### A — Un job CI qui lance les e2e contre un build de production

*Pour :* c'est la seule option qui prouve le **comportement réel du navigateur**
sous la vraie politique. Elle couvre aussi le script inline du `srcdoc`, que
rien n'exerce aujourd'hui.

*Contre :* le temps de CI augmente — un build de production plus une seconde
passe e2e. Il faut aussi fournir un `APP_URL` valide en production et décider
si on rejoue toute la suite ou seulement les specs sensibles à la CSP.

*Question ouverte :* toute la suite, ou un sous-ensemble ? Un sous-ensemble est
plus rapide mais demande de savoir lesquelles sont « sensibles », et cette liste
se périmera.

### B — Un test unitaire sur la chaîne CSP elle-même

Importer la politique depuis `next.config.ts` et vérifier qu'elle contient
encore ce dont l'aperçu et le sandbox JS dépendent.

*Pour :* quasi gratuit, tourne à chaque exécution de la CI, aucun build. Attrape
exactement le geste redouté — quelqu'un édite `next.config.ts` pendant CF-15.

*Contre :* ne prouve que le **texte de la politique**, pas le comportement. Un
nonce ajouté ailleurs (par un middleware, par une évolution de Next) passerait
au travers. C'est un fil-piège, pas une preuve.

### C — Émettre la CSP aussi en développement

*Pour :* le garde-fou existant se mettrait à protéger pour de vrai, sans job
supplémentaire.

*Contre :* le développement a besoin d'`eval` et de `ws:` pour le HMR — c'est
explicitement la raison pour laquelle la CSP est prod-only aujourd'hui
(`next.config.ts:16`). On émettrait donc une politique **différente** de celle
de production, et on testerait quelque chose qui n'est pas ce qui sera livré.
Risque de fausse confiance.

### D — Une vérification post-déploiement

*Pour :* teste la vraie production, sans ambiguïté.

*Contre :* détecte après coup. Les apprenants voient la panne avant nous.

## Ce qu'il ne faut pas faire

- **Affaiblir la CSP** pour faire passer un test. Elle protège la production.
- **Affaiblir le test CSP existant.** Son `skip` est honnête ; le transformer en
  succès inconditionnel recréerait exactement le faux positif qu'on a corrigé.
- **Traiter CF-15 comme incompatible avec l'aperçu.** Ce n'est pas tranché : un
  durcissement par nonces *pourrait* rester compatible si le `srcdoc` recevait
  le nonce, ou si le runtime était servi autrement. C'est précisément ce que le
  brainstorm doit examiner.

## Questions à trancher

1. **Quel niveau de preuve pour quel coût ?** Un fil-piège gratuit (B), une
   preuve comportementale coûteuse (A), ou les deux ?
2. **CF-15 est-il encore réalisable tel qu'écrit ?** Son critère d'acceptation
   ignore l'aperçu React et le sandbox JS. Faut-il le réécrire maintenant, avant
   que quelqu'un s'y attelle avec de mauvais critères ?
3. **`'unsafe-eval'` est-il négociable du tout ?** Deux cursus en dépendent pour
   exister. Si la réponse est non, CF-15 doit être reformulé plutôt que reporté.
4. **Un aperçu servi depuis une autre origine changerait-il l'équation ?** C'est
   déjà consigné comme le seul vrai correctif au gel d'onglet par boucle infinie
   (cf. `docs/SANDBOX_REPORT.md`). Si ce chantier a lieu un jour, il rebat aussi
   les cartes côté CSP. Vaut-il la peine de traiter les deux ensemble ?

## Point mineur, à ne pas perdre

`e2e/csp-srcdoc-script.spec.ts:11` décrit encore le test comme « un garde-fou
permanent ». La phrase qui précède le nuance correctement, mais la formulation
reste plus forte que la réalité tant que la CI ne lance rien en production.

## Fichiers concernés

| Fichier | Rôle dans ce sujet |
|---|---|
| `next.config.ts:16,26,48` | la politique, et la garde `isProd` qui la désactive en dev |
| `playwright.config.ts:30` | `webServer` pointe sur `pnpm dev` |
| `.github/workflows/ci.yml` | le job e2e, sans build de production |
| `e2e/csp-srcdoc-script.spec.ts` | le garde-fou qui se saute en CI |
| `e2e/react-preview.spec.ts` | l'aperçu, jamais exercé sous CSP réelle |
| `lib/sandbox/react-preview.ts` | le `srcdoc` : script inline + `new Function` |
| `lib/sandbox/run-js.ts` | le sandbox JS, également dépendant d'`unsafe-eval` |
| `docs/ROADMAP.md:149` | CF-15, dont les critères d'acceptation sont à revoir |
