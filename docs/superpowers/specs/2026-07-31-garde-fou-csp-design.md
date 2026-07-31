# Spec — Garde-fou CSP pour l'aperçu React

**Date :** 2026-07-31
**Branche :** `docs/brief-csp`
**Origine :** `docs/BRIEF_CSP_GARDE_FOU.md` (brief de cadrage)
**Statut :** design validé, prêt pour plan d'implémentation

---

## Problème

L'aperçu React dépend de trois tokens précis de `script-src`. Une tâche déjà
planifiée — **CF-15 · Durcir la CSP** (`docs/ROADMAP.md:149`) — prévoit d'en
retirer deux, et rien dans la CI ne s'en apercevrait.

Le critère d'acceptation de CF-15 a été écrit avant l'existence de l'aperçu
React : il nomme Monaco et l'hydratation, pas l'aperçu ni le sandbox JS. Celui
qui exécutera CF-15 validera donc les deux choses citées, verra une suite verte,
et livrera un aperçu cassé pour tous les apprenants.

Un test existe et semble couvrir ça — `e2e/csp-srcdoc-script.spec.ts` — mais il
tourne contre `pnpm dev`, où aucune CSP n'est émise (`next.config.ts`, garde
`isProd`). Il se saute honnêtement et ne protège rien.

## Ce qu'on construit

Deux garde-fous complémentaires, dans cet ordre :

- **B — un fil-piège unitaire** sur le texte de la politique. Quasi gratuit,
  tourne à chaque CI, attrape le geste exact redouté.
- **A — la suite e2e rejouée contre un build de production.** Preuve
  comportementale réelle ; dé-saute le test existant et exerce pour la première
  fois le script inline du `srcdoc` sous la vraie politique.

## Décisions prises, avec leur raison

| Décision | Retenu | Pourquoi |
|---|---|---|
| Niveau de preuve | B puis A | B seul ne prouve que le texte ; A seul ne dit rien avant la fin du pipeline. Ils couvrent des trous différents. |
| Forme du job A | **Remplacer** le job e2e existant | Évite de payer deux fois la suite, et évite la liste de specs « sensibles » dont le brief prévient qu'elle se périmera. |
| Sévérité de B | Tokens requis **+ absence de `nonce-`** | En CSP niveau 3, la présence d'un nonce fait ignorer `'unsafe-inline'`. Sans cette seconde assertion, le durcissement par nonces que CF-15 prévoit passerait au travers en laissant le test vert. |

## Contraintes vérifiées dans le dépôt

Ces points ont été constatés, pas supposés. Ils ne sont pas à re-vérifier.

- **`csp` n'est pas exporté** (`next.config.ts:18`) : c'est un `const` local. Un
  test unitaire ne peut pas l'importer tel quel. Passer par
  `nextConfig.headers()` ne marche pas non plus — sous vitest `NODE_ENV=test`,
  et la garde `isProd` retire justement l'en-tête.
- **`playwright.config.ts:29` code `webServer.command` en dur sur `pnpm dev`.**
  C'est le seul point à rendre conditionnel : `pnpm start` sert aussi sur
  `localhost:3000`, donc `webServer.url` et le `baseURL` (déjà paramétrable via
  `E2E_BASE_URL`, ligne 25) restent inchangés.
- **`pnpm start` exige quatre variables.** `instrumentation.ts:17` appelle
  `validateEnv()` avant la première requête. Sous `NODE_ENV=production`,
  `lib/env.ts:68` réclame en plus `RESEND_API_KEY`, et une `APP_URL` en
  `https://` ne contenant pas `localhost`. Le job CI actuel ne fournit ni l'une
  ni l'autre.
- **`global-setup.ts` ne dépend pas d'`APP_URL`.** Il crée l'utilisateur
  directement en base avec `emailVerified` posé (`e2e/global-setup.ts:48`).
  Aucune spec ne clique un lien d'email : une `APP_URL` factice suffit.
- **`vitest.config.ts:9`** inclut déjà `lib/**/*.test.ts` : le nouveau test ne
  demande aucune modification de configuration.
- Sous CSP de production, `script-src 'self'` autorise bien une iframe `srcdoc`
  à origine opaque à charger un script depuis l'origine du parent (vérifié le
  2026-07-30 contre un vrai `pnpm build && pnpm start`). Le repli par inlining
  du runtime n'est pas nécessaire.

## Partie 1 — B : le fil-piège

### `lib/security/csp.ts` (nouveau)

La politique déménage depuis `next.config.ts` et devient importable. Le module
expose :

- la chaîne CSP complète, telle qu'elle est émise aujourd'hui — **aucun
  changement de contenu** ;
- la liste des tokens de `script-src` dont l'aperçu et le sandbox dépendent,
  chacun commenté avec son dépendant réel :

| Token | Qui en dépend | Si retiré |
|---|---|---|
| `'self'` | l'iframe charge `/react-runtime/runtime.js` depuis l'origine du parent, par URL absolue | l'aperçu n'obtient plus React |
| `'unsafe-inline'` | le `<script>` inline du `srcdoc` (tout le programme de l'iframe) | le `srcdoc` devient inerte |
| `'unsafe-eval'` | `new Function` dans le `srcdoc` **et** dans `lib/sandbox/run-js.ts` | l'aperçu React **et** tout le cursus JavaScript cessent de fonctionner |

`next.config.ts` importe ce module. La garde `isProd` et les autres en-têtes de
sécurité ne bougent pas.

### `lib/security/csp.test.ts` (nouveau)

Deux assertions sur `script-src` :

1. les trois tokens requis sont encore présents ;
2. aucun `nonce-` n'y apparaît.

**Le message d'échec est le vrai livrable.** Il doit expliquer à quelqu'un en
plein CF-15 pourquoi le test l'arrête, nommer les deux cursus concernés, et
pointer sur `docs/BRIEF_CSP_GARDE_FOU.md`. Un test qui échoue sans dire pourquoi
sera contourné.

Le test laisse libre l'ajout de directives non liées : il n'est pas un snapshot.

## Partie 2 — A : la CI e2e contre un build de production

### `playwright.config.ts`

`webServer.command` devient conditionnel à une variable `E2E_PROD` :

- absente → `pnpm dev`, comme aujourd'hui. Le flux local ne change pas et garde
  son confort (pas d'`APP_URL` à surcharger).
- présente → `pnpm build && pnpm start`, avec un `timeout` relevé pour absorber
  le build.

### `.github/workflows/ci.yml`

Le job `e2e` existant reçoit :

- `E2E_PROD: "1"` ;
- `APP_URL` : une URL `https://` factice, ni localhost ;
- `RESEND_API_KEY` : une valeur factice — aucune spec n'envoie d'email.

Pas de second job, pas de sous-ensemble de specs à maintenir.

### Effet attendu

- `e2e/csp-srcdoc-script.spec.ts` cesse de se sauter et prouve enfin sa
  propriété en CI.
- `e2e/react-preview.spec.ts` s'exécute pour la première fois sous la vraie
  politique — c'est le trou que le brief signale comme plus large que le seul
  test CSP.

## Partie 3 — le point mineur

`e2e/csp-srcdoc-script.spec.ts:11` décrit le test comme « un garde-fou
permanent ». C'est faux tant que la CI ne lance rien en production ; ça devient
vrai une fois la partie 2 en place. Reformuler pour nommer le mécanisme (le job
CI en production) plutôt que de l'affirmer.

## Ce qu'il ne faut pas faire

- **Affaiblir la CSP** pour faire passer un test. Elle protège la production.
- **Affaiblir le test CSP existant.** Son `skip` est honnête ; le transformer en
  succès inconditionnel recréerait le faux positif qu'on corrige ici.
- **Éditer `.env`** pour contourner la friction `APP_URL` locale — il pointe sur
  la base Supabase de production. Utiliser un override shell.

## Risques, et ce qu'on fait s'ils se réalisent

1. **`next.config.ts` important un module TypeScript local.** Next transpile le
   fichier de config, mais rien ne prouve encore que l'import résout dans ce
   projet. À vérifier par un vrai `pnpm build`.
   *Repli :* garder la politique dans `next.config.ts` et n'extraire que la
   liste des tokens requis, que le test importe et cherche dans la chaîne.
2. **La suite entière n'a jamais tourné en production.** Une spec s'appuyant sur
   un comportement dev-only (texte d'erreur React non minifié, overlay) peut
   échouer. Inconnu tant que le job n'a pas tourné — et c'est précisément
   l'information qui manque aujourd'hui.
   *Repli :* corriger la spec concernée pour qu'elle n'assert plus sur du
   dev-only. Ne pas revenir à `pnpm dev` pour masquer l'échec.
3. **Le temps de CI augmente** du build de production. Accepté : c'est le coût
   annoncé de la piste A.

## Critères d'acceptation

- [ ] `lib/security/csp.ts` existe, `next.config.ts` l'importe, `pnpm build`
      réussit et la CSP émise est **inchangée**.
- [ ] `lib/security/csp.test.ts` passe, et échoue si l'on retire l'un des trois
      tokens ou si l'on ajoute un `nonce-` (vérifié en cassant volontairement).
- [ ] Le message d'échec nomme les deux cursus et pointe sur le brief.
- [ ] Avec `E2E_PROD=1`, la suite tourne contre `pnpm build && pnpm start` et
      `e2e/csp-srcdoc-script.spec.ts` **passe** au lieu de se sauter.
- [ ] Sans `E2E_PROD`, `pnpm test:e2e` se comporte exactement comme avant.
- [ ] Le job CI e2e fournit `E2E_PROD`, `APP_URL` et `RESEND_API_KEY`.
- [ ] Le commentaire `e2e/csp-srcdoc-script.spec.ts:11` nomme le mécanisme.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test:run` verts.

## Hors périmètre, assumé

**La réécriture des critères d'acceptation de CF-15** (`docs/ROADMAP.md:149`).
Le fil-piège la rend moins urgente sans la rendre inutile : le mauvais critère
subsiste, mais il ne peut plus être suivi en silence. Les questions 3 et 4 du
brief — `'unsafe-eval'` est-il négociable, et un aperçu servi depuis une autre
origine rebattrait-il les cartes — restent ouvertes et méritent leur propre
cadrage.

## Fichiers touchés

| Fichier | Nature |
|---|---|
| `lib/security/csp.ts` | nouveau — la politique, importable |
| `lib/security/csp.test.ts` | nouveau — le fil-piège |
| `next.config.ts` | importe la politique au lieu de la définir |
| `playwright.config.ts` | `webServer` conditionnel à `E2E_PROD` |
| `.github/workflows/ci.yml` | le job e2e passe en production |
| `e2e/csp-srcdoc-script.spec.ts` | commentaire reformulé |
