# Garde-fou CSP — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Empêcher qu'un durcissement de la CSP (CF-15) casse silencieusement l'aperçu React et le sandbox JavaScript, en posant un fil-piège unitaire puis en rejouant la suite e2e contre un build de production en CI.

**Architecture :** La politique CSP quitte `next.config.ts` pour un module importable, qu'un test unitaire surveille (présence des trois tokens de `script-src`, absence de `nonce-`). En parallèle, `playwright.config.ts` gagne un interrupteur `E2E_PROD` qui remplace `pnpm dev` par `pnpm build && pnpm start` ; la CI l'active, ce qui dé-saute le garde-fou e2e existant et exerce enfin le `srcdoc` sous la vraie politique.

**Tech Stack :** Next.js 16, TypeScript, Vitest 4, Playwright 1.61, GitHub Actions.

**Spec :** `docs/superpowers/specs/2026-07-31-garde-fou-csp-design.md`
**Brief d'origine :** `docs/BRIEF_CSP_GARDE_FOU.md`

## Global Constraints

- **Ne jamais affaiblir la CSP** pour faire passer un test. Elle protège la production.
- **Ne jamais affaiblir `e2e/csp-srcdoc-script.spec.ts`.** Son `test.skip` est honnête et doit rester ; c'est la CI qui doit changer, pas le test.
- **Ne jamais éditer `.env`** — il pointe sur la base Supabase de production. Utiliser des overrides shell.
- **Ne pas lancer la suite e2e complète en local** pendant ce chantier : `e2e/global-setup.ts:45` fait un `DELETE` puis un `INSERT` sur la table `User` de la base désignée par `DATABASE_URL`, qui est la production. La vérification comportementale se fait en CI (base Postgres de service) ; en local on se limite à `curl` sur l'en-tête.
- **La CSP émise doit rester identique octet pour octet** à la fin de ce chantier. On déplace la politique, on ne la modifie pas.
- Commentaires et messages de test en français, comme le reste du dépôt.
- `pnpm lint`, `pnpm typecheck`, `pnpm test:run` doivent rester verts à chaque commit.

---

## File Structure

| Fichier | Responsabilité |
|---|---|
| `lib/security/csp.ts` | **Nouveau.** La politique CSP et la liste des tokens de `script-src` dont dépendent l'aperçu React et le sandbox JS. Constantes pures, aucun effet de bord, aucun import. |
| `lib/security/csp.test.ts` | **Nouveau.** Le fil-piège : vérifie que `script-src` garde ses trois tokens et ne reçoit pas de `nonce-`. |
| `next.config.ts` | **Modifié.** Importe la politique au lieu de la définir. La garde `isProd` et les autres en-têtes ne bougent pas. |
| `playwright.config.ts` | **Modifié.** `webServer.command` conditionnel à `E2E_PROD`. |
| `.github/workflows/ci.yml` | **Modifié.** Le job `e2e` active `E2E_PROD` et fournit les variables qu'exige un démarrage en production. |
| `e2e/csp-srcdoc-script.spec.ts` | **Modifié — commentaire seulement.** La mention « garde-fou permanent » nomme désormais le mécanisme qui la rend vraie. |

`lib/security/` est un nouveau dossier, cohérent avec `lib/sandbox/` et `lib/validators/` déjà présents.

---

## Task 1 : Extraire la CSP et poser le fil-piège

**Files:**
- Create: `lib/security/csp.ts`
- Create: `lib/security/csp.test.ts`
- Modify: `next.config.ts:1-33` (retirer le `const csp` local, importer le module)

**Interfaces:**
- Consumes: rien (première tâche).
- Produces:
  - `CSP_DIRECTIVES: readonly string[]` — les directives, une par entrée, dans l'ordre d'émission.
  - `csp: string` — les directives jointes par `"; "`. C'est la valeur de l'en-tête. Consommée par `next.config.ts`.
  - `SCRIPT_SRC_REQUIS: readonly string[]` — `["'self'", "'unsafe-inline'", "'unsafe-eval'"]`.
  - `tokensDeDirective(nom: string): string[]` — les tokens d'une directive donnée, sans son nom ; `[]` si la directive est absente.

**Pourquoi `tokensDeDirective` et pas un simple `csp.includes(...)` :** `'unsafe-inline'` apparaît **aussi** dans `style-src` (`next.config.ts:25`). Un test qui chercherait ce token dans la chaîne entière passerait au vert même après son retrait de `script-src` — exactement le faux positif qu'on est en train de corriger. Le test doit isoler la directive.

- [ ] **Step 1: Écrire le test qui échoue**

Créer `lib/security/csp.test.ts` :

```ts
import { describe, it, expect } from "vitest";
import { SCRIPT_SRC_REQUIS, tokensDeDirective } from "./csp";

/**
 * Message affiché à qui casse ce test. Il sera très probablement en train de
 * faire CF-15 (durcir la CSP) avec des critères d'acceptation écrits avant que
 * l'aperçu React existe. Le message est le livrable : un test qui échoue sans
 * dire pourquoi se contourne.
 */
const POURQUOI =
  "L'aperçu React (lib/sandbox/react-preview.ts) et le sandbox JavaScript " +
  "(lib/sandbox/run-js.ts) en dépendent pour exister — les retirer casse deux " +
  "cursus entiers, pas seulement une option. Lis docs/BRIEF_CSP_GARDE_FOU.md " +
  "avant de toucher à script-src (tâche CF-15, docs/ROADMAP.md).";

describe("CSP — script-src", () => {
  it.each([...SCRIPT_SRC_REQUIS])("conserve %s", (token) => {
    expect(
      tokensDeDirective("script-src"),
      `script-src a perdu ${token}. ${POURQUOI}`
    ).toContain(token);
  });

  it("ne pose pas de nonce sur script-src", () => {
    const nonces = tokensDeDirective("script-src").filter((t) =>
      t.startsWith("'nonce-")
    );

    // Piège non évident : en CSP niveau 3, la présence d'un nonce fait IGNORER
    // 'unsafe-inline' par les navigateurs qui le supportent. Un durcissement
    // par nonces casserait donc le srcdoc même en laissant 'unsafe-inline'
    // littéralement écrit dans la politique — et les trois tests ci-dessus
    // resteraient verts.
    expect(
      nonces,
      `script-src reçoit un nonce (${nonces.join(", ")}), ce qui neutralise ` +
        `'unsafe-inline'. ${POURQUOI}`
    ).toEqual([]);
  });
});

describe("tokensDeDirective", () => {
  it("isole les tokens d'une directive sans son nom", () => {
    expect(tokensDeDirective("object-src")).toEqual(["'none'"]);
  });

  it("isole style-src de script-src, qui partagent 'unsafe-inline'", () => {
    // C'est le cœur du garde-fou : sans isolation, chercher 'unsafe-inline'
    // dans la chaîne entière passerait au vert grâce à style-src, même après
    // son retrait de script-src.
    expect(tokensDeDirective("style-src")).toEqual(["'self'", "'unsafe-inline'"]);
  });

  it("ne confond pas une directive avec une autre au préfixe commun", () => {
    // `script-src-elem` commence par `script-src` : demander l'une ne doit
    // jamais renvoyer les tokens de l'autre.
    expect(tokensDeDirective("script-src-elem")).toEqual([]);
  });
});
```

- [ ] **Step 2: Lancer le test pour vérifier qu'il échoue**

```bash
pnpm exec vitest run lib/security/csp.test.ts
```

Attendu : ÉCHEC au chargement, `Failed to resolve import "./csp"` — le module n'existe pas encore.

- [ ] **Step 3: Écrire le module**

Créer `lib/security/csp.ts`. Les directives sont copiées **à l'identique** depuis `next.config.ts:19-32` — aucune valeur ne change.

```ts
/**
 * Content-Security-Policy de l'application.
 *
 * Extraite de `next.config.ts` pour devenir importable : la politique est un
 * contrat dont l'aperçu React et le sandbox JavaScript dépendent pour exister,
 * et rien ne le gardait. `csp.test.ts` s'en charge désormais.
 *
 * Réglée pour les besoins d'exécution de cette app :
 * - Monaco est auto-hébergé depuis /public/monaco (CF-16), donc tout charge
 *   depuis 'self'. Son tokenizer tourne dans des workers blob:.
 * - Next injecte des scripts inline de bootstrap/hydratation et Tailwind des
 *   styles inline, d'où 'unsafe-inline'.
 *
 * Cf. docs/BRIEF_CSP_GARDE_FOU.md avant toute modification de script-src.
 */

/**
 * Tokens de `script-src` sans lesquels des fonctionnalités entières cessent de
 * marcher. Chaque entrée est vérifiée par `csp.test.ts`.
 *
 * - `'self'`         : l'iframe d'aperçu charge /react-runtime/runtime.js depuis
 *                      l'origine du parent, par URL absolue (dans un document
 *                      srcdoc la base est `about:srcdoc`, une URL relative ne
 *                      résout rien).
 * - `'unsafe-inline'`: le <script> inline du srcdoc, c'est-à-dire tout le
 *                      programme de l'iframe.
 * - `'unsafe-eval'`  : `new Function` dans le srcdoc ET dans
 *                      lib/sandbox/run-js.ts. Monaco en dépend aussi.
 */
export const SCRIPT_SRC_REQUIS = [
  "'self'",
  "'unsafe-inline'",
  "'unsafe-eval'",
] as const;

/** Les directives, dans l'ordre d'émission. */
export const CSP_DIRECTIVES = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "child-src 'self' blob:",
  "frame-src 'self' blob:",
  "form-action 'self'",
  "upgrade-insecure-requests",
] as const;

/** La valeur de l'en-tête `Content-Security-Policy`. */
export const csp = CSP_DIRECTIVES.join("; ");

/**
 * Les tokens d'une directive, sans son nom. Tableau vide si elle est absente.
 *
 * Nécessaire parce que plusieurs directives partagent des tokens :
 * `'unsafe-inline'` est dans `script-src` ET dans `style-src`. Chercher un
 * token dans la chaîne entière laisserait passer son retrait de `script-src`.
 */
export function tokensDeDirective(nom: string): string[] {
  const directive = CSP_DIRECTIVES.find(
    (d) => d === nom || d.startsWith(`${nom} `)
  );

  if (directive === undefined) return [];

  return directive.split(/\s+/).slice(1);
}
```

- [ ] **Step 4: Lancer le test pour vérifier qu'il passe**

```bash
pnpm exec vitest run lib/security/csp.test.ts
```

Attendu : PASS, 7 tests — 3 pour les tokens requis, 1 pour le nonce, 3 pour `tokensDeDirective`. 0 échec.

- [ ] **Step 5: Vérifier que le fil-piège mord vraiment**

Un test qui n'a jamais échoué ne prouve rien. Casser volontairement la politique et constater l'échec, puis annuler.

Dans `lib/security/csp.ts`, remplacer temporairement la ligne `script-src` par :

```ts
  "script-src 'self' 'nonce-abc123'",
```

Puis :

```bash
pnpm exec vitest run lib/security/csp.test.ts
```

Attendu : ÉCHEC sur au moins 3 tests — les deux tokens manquants **et** le nonce. Vérifier de visu que les messages citent `docs/BRIEF_CSP_GARDE_FOU.md` et nomment les deux cursus.

Puis restaurer la ligne d'origine :

```ts
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
```

et relancer pour confirmer le retour au vert :

```bash
pnpm exec vitest run lib/security/csp.test.ts
```

Attendu : PASS, 0 échec.

- [ ] **Step 6: Brancher `next.config.ts` sur le module**

Remplacer les lignes 1 à 33 de `next.config.ts` par :

```ts
import type { NextConfig } from "next";

import { csp } from "./lib/security/csp";

const isProd = process.env.NODE_ENV === "production";
```

Autrement dit : supprimer le bloc de commentaire `/** Content-Security-Policy ... */` et le `const csp = [...].join("; ")`, qui vivent désormais dans `lib/security/csp.ts`. Le reste du fichier (`securityHeaders`, `nextConfig`) est inchangé — `securityHeaders` continue de référencer `csp`, qui est maintenant l'import.

Conserver tel quel le commentaire de la ligne 47 :

```ts
  // CSP is prod-only to avoid breaking the dev server (HMR uses eval + ws:).
```

- [ ] **Step 7: Vérifier que l'import résout au build**

C'est le risque n°1 de la spec : rien ne prouve encore que `next.config.ts` puisse importer un module TypeScript local dans ce projet.

```bash
pnpm build
```

Attendu : build réussi, aucune erreur de résolution de module.

**Si l'import échoue :** appliquer le repli documenté dans la spec. Restaurer le `const csp = [...]` littéral dans `next.config.ts`, en laissant `lib/security/csp.ts` et son test en place. La liste de directives est alors dupliquée aux deux endroits — coût assumé, puisque le fil-piège reste opérant et que rien d'autre ne le permettait. Ajouter dans `next.config.ts`, juste au-dessus du `const csp`, un commentaire disant que toute modification doit être répercutée dans `lib/security/csp.ts`, sans quoi le test ne garde plus rien.

Ne jamais contourner en désactivant le test.

- [ ] **Step 8: Vérifier la non-régression globale**

```bash
pnpm lint && pnpm typecheck && pnpm test:run
```

Attendu : les trois verts, 0 échec.

- [ ] **Step 9: Commit**

```bash
git add lib/security/csp.ts lib/security/csp.test.ts next.config.ts
git commit -m "test(csp): un fil-piege arrete le durcissement qui casserait l'apercu"
```

---

## Task 2 : Rendre la passe e2e capable de tourner en production

**Files:**
- Modify: `playwright.config.ts:29-34` (`webServer`)

**Interfaces:**
- Consumes: `lib/security/csp.ts` (Task 1) — indirectement, via l'en-tête que `next.config.ts` émet.
- Produces: la variable d'environnement **`E2E_PROD`**. Positionnée à `"1"`, elle fait démarrer un build de production au lieu du serveur de développement. Consommée par `.github/workflows/ci.yml` en Task 3.

**Pourquoi un interrupteur plutôt qu'un basculement sec :** `pnpm start` exige une `APP_URL` en `https://` non-localhost et une `RESEND_API_KEY` (`lib/env.ts:68`, appelé par `instrumentation.ts:17`). En CI ces variables se posent en une ligne ; en local, `.env` fournit `APP_URL="http://localhost:3000"` et il faudrait un override shell à chaque exécution. Laisser `pnpm dev` par défaut garde le flux local inchangé.

- [ ] **Step 1: Rendre `webServer` conditionnel**

Dans `playwright.config.ts`, ajouter après les imports (après la ligne 2) :

```ts
/**
 * Contre `pnpm dev`, aucune CSP n'est émise (next.config.ts, garde `isProd`) :
 * `e2e/csp-srcdoc-script.spec.ts` se saute et ne prouve rien, et le script
 * inline du srcdoc de l'aperçu n'est jamais exercé sous la vraie politique.
 *
 * `E2E_PROD=1` lance donc un vrai build de production. C'est ce que fait la CI
 * (.github/workflows/ci.yml). En local, `pnpm start` exige en plus une APP_URL
 * https non-localhost et une RESEND_API_KEY (lib/env.ts) : d'où l'interrupteur
 * plutôt qu'un basculement sec.
 */
const enProduction = process.env.E2E_PROD === "1";
```

Puis remplacer le bloc `webServer` (lignes 29-34) par :

```ts
  webServer: {
    command: enProduction ? "pnpm build && pnpm start" : "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    // Le build de production s'ajoute au démarrage : 2 min ne suffisent pas.
    timeout: enProduction ? 300_000 : 120_000,
  },
```

`url` ne change pas : `pnpm start` sert lui aussi sur le port 3000.

- [ ] **Step 2: Vérifier que le défaut n'a pas bougé**

```bash
pnpm typecheck
```

Attendu : PASS.

```bash
pnpm exec playwright test --list
```

Attendu : la liste des specs s'affiche sans erreur de configuration. Cette commande ne démarre pas de serveur et ne touche pas la base.

- [ ] **Step 3: Vérifier l'en-tête réellement émis en production**

⚠️ **Ne pas lancer `pnpm test:e2e` ici.** `e2e/global-setup.ts:45` écrit dans la base pointée par `DATABASE_URL`, qui est la Supabase de production. La preuve comportementale complète viendra de la CI, en Task 3, contre sa propre base Postgres.

En local on vérifie seulement que la politique sort intacte du build. Dans un terminal :

```bash
APP_URL="https://exemple.invalid" RESEND_API_KEY="local-non-utilise" pnpm start
```

(`pnpm build` a déjà tourné en Task 1 Step 7. Ces overrides shell ne modifient pas `.env` : `dotenv` n'écrase pas une variable déjà présente dans l'environnement.)

Dans un second terminal :

```bash
curl -sI http://localhost:3000/ | grep -i "^content-security-policy"
```

Attendu — exactement cette valeur, identique à ce qu'émettait `next.config.ts` avant l'extraction :

```
content-security-policy: default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; img-src 'self' data: blob:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self'; worker-src 'self' blob:; child-src 'self' blob:; frame-src 'self' blob:; form-action 'self'; upgrade-insecure-requests
```

Si la valeur diffère, l'extraction a altéré la politique : corriger `lib/security/csp.ts` pour qu'elle corresponde à l'original. Arrêter le serveur ensuite.

- [ ] **Step 4: Commit**

```bash
git add playwright.config.ts
git commit -m "test(e2e): E2E_PROD lance la suite contre un build de production"
```

---

## Task 3 : Activer la production en CI et corriger la promesse du test existant

**Files:**
- Modify: `.github/workflows/ci.yml:73-76` (bloc `env` du job `e2e`)
- Modify: `e2e/csp-srcdoc-script.spec.ts:11-12` (commentaire)

**Interfaces:**
- Consumes: `E2E_PROD` (Task 2).
- Produces: rien qu'une tâche ultérieure consomme. C'est le dernier maillon.

- [ ] **Step 1: Fournir au job e2e les variables qu'exige un démarrage en production**

Dans `.github/workflows/ci.yml`, remplacer le bloc `env` du job `e2e` (lignes 73-76) par :

```yaml
    env:
      DATABASE_URL: postgresql://ci:ci@localhost:5432/ci
      DIRECT_URL: postgresql://ci:ci@localhost:5432/ci
      AUTH_SECRET: ci-e2e-secret-not-used-1234567890
      # La suite tourne contre `pnpm build && pnpm start`, pas `pnpm dev` :
      # c'est la seule façon d'émettre la CSP (next.config.ts, garde `isProd`)
      # et donc d'exercer réellement l'aperçu React sous la vraie politique.
      # Cf. docs/BRIEF_CSP_GARDE_FOU.md
      E2E_PROD: "1"
      # `instrumentation.ts` valide l'environnement avant la première requête,
      # et `lib/env.ts` durcit ses règles sous NODE_ENV=production : APP_URL
      # https non-localhost, et RESEND_API_KEY présente. Valeurs factices —
      # aucune spec n'envoie d'email ni ne clique un lien de vérification
      # (e2e/global-setup.ts crée l'utilisateur déjà vérifié, en base).
      APP_URL: https://ci.codeforge.invalid
      RESEND_API_KEY: ci-e2e-key-not-used
```

`.invalid` est un TLD réservé (RFC 2606) : l'URL est syntaxiquement valide et ne résoudra jamais vers un vrai hôte.

Les `steps` du job ne changent pas : `pnpm test:e2e` déclenche désormais le build via `webServer`.

- [ ] **Step 2: Reformuler la promesse du garde-fou existant**

Dans `e2e/csp-srcdoc-script.spec.ts`, remplacer les lignes 11-12 :

```ts
 * C'est aussi un garde-fou permanent : si quelqu'un resserre `script-src` plus
 * tard, l'apercu React casse et ce test le dit.
```

par :

```ts
 * La CI le lance contre un build de production (E2E_PROD=1, cf.
 * .github/workflows/ci.yml), donc il ne se saute plus la-bas : si quelqu'un
 * resserre `script-src`, l'apercu React casse et ce test le dit. En local
 * contre `pnpm dev` il se saute toujours — c'est attendu.
```

La formulation d'origine promettait un garde-fou permanent alors que la CI ne lançait rien en production. Elle devient vraie ici ; le commentaire nomme désormais le mécanisme qui la rend vraie plutôt que de l'affirmer.

Ne pas toucher au `test.skip` : il reste honnête pour les exécutions locales.

- [ ] **Step 3: Vérifier la non-régression locale**

```bash
pnpm lint && pnpm typecheck && pnpm test:run
```

Attendu : les trois verts.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/ci.yml e2e/csp-srcdoc-script.spec.ts
git commit -m "ci(e2e): la suite tourne en production, le garde-fou CSP ne se saute plus"
```

- [ ] **Step 5: Pousser et lire le résultat de la CI**

C'est ici que la preuve comportementale arrive — elle ne peut pas venir d'ailleurs.

```bash
git push -u origin docs/brief-csp
```

Puis suivre le job `Tests e2e` :

```bash
gh run watch
```

Attendu :
- le job `Tests e2e` passe au vert ;
- dans ses logs, `csp-srcdoc-script.spec.ts` est **passé**, plus **skippé** — c'est le critère d'acceptation central de tout ce chantier ;
- `react-preview.spec.ts` passe, pour la première fois sous une CSP réelle.

**Si une spec échoue en production alors qu'elle passait en dev :** c'est le risque n°2 de la spec, et c'est précisément l'information qui manquait. Corriger la spec concernée pour qu'elle n'assert plus sur un comportement dev-only (texte d'erreur React non minifié, overlay de développement). **Ne pas revenir à `pnpm dev` pour masquer l'échec** — ce serait recréer le faux positif qu'on vient de supprimer.

---

## Critères d'acceptation

- [ ] `lib/security/csp.ts` existe, `next.config.ts` l'importe, `pnpm build` réussit.
- [ ] La CSP émise est identique à l'originale, confirmée par `curl` (Task 2 Step 3).
- [ ] `lib/security/csp.test.ts` passe, et échoue si l'on retire l'un des trois tokens ou si l'on ajoute un `nonce-` — vérifié en cassant volontairement (Task 1 Step 5).
- [ ] Les messages d'échec nomment les deux cursus et pointent sur `docs/BRIEF_CSP_GARDE_FOU.md`.
- [ ] Sans `E2E_PROD`, `pnpm test:e2e` se comporte exactement comme avant.
- [ ] Le job CI e2e fournit `E2E_PROD`, `APP_URL` et `RESEND_API_KEY`.
- [ ] En CI, `csp-srcdoc-script.spec.ts` **passe** au lieu de se sauter.
- [ ] Le commentaire de `e2e/csp-srcdoc-script.spec.ts` nomme le mécanisme.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test:run` verts.

## Hors périmètre

La réécriture des critères d'acceptation de **CF-15** (`docs/ROADMAP.md:149`), dont le libellé ignore l'aperçu React et le sandbox JS. Le fil-piège rend ce mauvais critère impossible à suivre en silence, mais ne le corrige pas. Les questions 3 et 4 du brief — `'unsafe-eval'` est-il négociable, un aperçu servi depuis une autre origine rebattrait-il les cartes — restent ouvertes.
