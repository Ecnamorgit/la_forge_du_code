# Runtime React — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Faire vivre le code React de l'apprenant devant lui — son composant se monte, s'affiche, réagit à ses clics, et les erreurs de React lui parviennent telles quelles.

**Architecture:** Le parent transforme le JSX avec Sucrase (chargé à la demande) et envoie le JS à une iframe persistante à origine opaque, qui contient React chargé une fois et remonte le composant à chaque déploiement. La validation statique existante ne change pas.

**Tech Stack:** Next.js 16, React 19, TypeScript, Sucrase (transformation JSX), esbuild (bundle du runtime), Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-07-30-react-runtime-design.md`
**Branche:** `feat/react-runtime`

## Global Constraints

- **Le code de l'apprenant ne quitte jamais le navigateur.** Aucune route serveur ne reçoit du JSX. La promesse de `docs/SANDBOX_REPORT.md` reste intacte.
- **L'iframe garde `sandbox="allow-scripts"` sans `allow-same-origin`.** Origine opaque, pas d'accès au `window` de l'app, aux cookies ni au storage.
- **L'aperçu ne bloque jamais la leçon.** Toute défaillance (CSP, runtime introuvable, `ready` absent) affiche « Aperçu indisponible » et laisse la validation fonctionner.
- **Les validateurs restent statiques.** Aucun validateur n'est modifié par ce chantier.
- **Les globales injectées dans l'iframe sont dérivées de `Object.keys(React)`**, jamais énumérées à la main.
- **Aucune URL relative dans le `srcdoc`** : le document a pour base `about:srcdoc`, l'origine absolue doit être injectée.
- Texte d'interface et commentaires de code en **français**. Les données de cours (`data/courses/**`) restent **sans accents** ; le reste garde les siens.
- Tests unitaires à côté de leur source, `vitest.config.ts` reste en `environment: "node"`.
- Ne pas modifier : `lib/validators/**`, `lib/lore.ts`, `lib/public-routes.ts`, `proxy.ts`, `lib/sandbox/run-js.ts`, `lib/sandbox/run-sql.ts`.

## Structure des fichiers

| Fichier | Responsabilité |
|---|---|
| `e2e/csp-srcdoc-script.spec.ts` | **Créé (Task 1).** Garde-fou permanent : une iframe `srcdoc` peut-elle charger un script de l'origine du parent sous CSP de production ? |
| `public/react-runtime/probe.js` | **Créé (Task 1).** Sonde minimale utilisée par ce test. Non versionné. |
| `scripts/react-runtime-entry.mjs` | **Créé (Task 2).** Point d'entrée bundlé : accroche React et ReactDOM à `window`. |
| `scripts/build-react-runtime.mjs` | **Créé (Task 2).** Prebuild esbuild → `public/react-runtime/runtime.js`. |
| `lib/sandbox/jsx-transform.ts` | **Créé (Task 3).** Enveloppe Sucrase, pure, import dynamique. |
| `lib/sandbox/react-preview.ts` | **Créé (Task 4).** `buildPreviewSrcdoc` + `parsePreviewMessage`, purs. |
| `lib/sandbox/preview-exemptions.ts` | **Créé (Task 5).** Chapitres sans aperçu, avec la raison. |
| `data/courses/html/types.ts` | **Modifié (Task 5).** Ajoute `previewMount?: string` à `Step`. |
| `data/courses/react/chapitre-{1,2,3,5,6,7,8}.ts` | **Modifiés (Task 5).** 28 champs `previewMount`. |
| `lib/sandbox/preview-mounts.test.ts` | **Créé (Task 5).** Test d'intégrité des 28 champs + exemptions. |
| `components/lesson/ReactPreview.tsx` | **Créé (Task 6).** Possède l'iframe et le panneau. |
| `components/lesson/ChapterWorkspace.tsx` | **Modifié (Task 6).** Monte `<ReactPreview>` quand `isReact`. |
| `e2e/react-preview.spec.ts` | **Créé (Task 7).** Parcours réel : saisir, déployer, voir le rendu. |
| `.gitignore` | **Modifié (Task 2).** Ignore `/public/react-runtime/`. |

---

## Task 1: Lever le risque CSP avant tout le reste

**Files:**
- Create: `public/react-runtime/probe.js`
- Create: `e2e/csp-srcdoc-script.spec.ts`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: rien
- Produits: une réponse écrite à la question « une iframe `srcdoc` peut-elle charger un script de l'origine du parent sous CSP de production ? », et un test qui la garde

La spec désigne ceci comme le risque numéro un. `next.config.ts` n'applique la CSP qu'en production (`isProd`), donc un développement vert ne prouve rien. Si la réponse est non, `buildPreviewSrcdoc` change de forme — autant le savoir maintenant.

- [ ] **Step 1: Ignorer le dossier du runtime**

Dans `.gitignore`, sous la ligne `/public/monaco/` :

```
/public/react-runtime/
```

- [ ] **Step 2: Écrire la sonde**

Créer `public/react-runtime/probe.js` :

```js
// Sonde CSP : si ce script s'execute dans une iframe srcdoc a origine opaque,
// c'est que `script-src 'self'` autorise bien un chargement depuis l'origine du
// parent. Utilisee par e2e/csp-srcdoc-script.spec.ts.
parent.postMessage({ type: "probe:ok" }, "*");
```

- [ ] **Step 3: Écrire le test**

Créer `e2e/csp-srcdoc-script.spec.ts` :

```ts
import { expect, test } from "@playwright/test";

/**
 * Une iframe `srcdoc` a origine opaque peut-elle charger un script servi par
 * l'origine du parent, sous la CSP de production ?
 *
 * `next.config.ts` n'applique la CSP que si NODE_ENV=production, donc ce test
 * n'a de valeur que lance contre `pnpm build && pnpm start`. Contre le serveur
 * de developpement il passe toujours et ne prouve rien.
 *
 * C'est aussi un garde-fou permanent : si quelqu'un resserre `script-src` plus
 * tard, l'apercu React casse et ce test le dit.
 */
test("une iframe srcdoc charge un script de l'origine du parent", async ({ page }) => {
  await page.goto("/");

  const recu = await page.evaluate(() => {
    return new Promise<string>((resolve) => {
      const timeout = setTimeout(() => resolve("timeout"), 4000);

      window.addEventListener("message", function onMessage(event) {
        const data = event.data as { type?: string };
        if (data?.type !== "probe:ok") return;
        clearTimeout(timeout);
        window.removeEventListener("message", onMessage);
        resolve("ok");
      });

      const iframe = document.createElement("iframe");
      iframe.setAttribute("sandbox", "allow-scripts");
      iframe.style.display = "none";
      // URL ABSOLUE : dans un document srcdoc la base est `about:srcdoc`,
      // une URL relative ne resout rien.
      iframe.srcdoc =
        `<!doctype html><html><body><script src="${window.location.origin}/react-runtime/probe.js"></script></body></html>`;
      document.body.appendChild(iframe);
    });
  });

  expect(
    recu,
    "Le script n'a pas pu se charger. Si ce test echoue sous CSP de production, " +
      "appliquer le repli documente dans la spec : inliner le runtime dans le srcdoc."
  ).toBe("ok");
});
```

- [ ] **Step 4: Lancer le test contre un build de production**

La CSP n'existe qu'en production. Il faut donc un serveur de production sur le port 3000 ; `playwright.config.ts` le réutilisera (`reuseExistingServer: !process.env.CI`).

Dans un premier terminal :

```bash
pnpm build && pnpm start
```

Dans un second :

```bash
pnpm exec playwright test e2e/csp-srcdoc-script.spec.ts
```

Attendu : PASS. Arrêter le serveur de production ensuite.

- [ ] **Step 5: Consigner la réponse**

Si le test **passe** : ajouter une ligne à la section « Risque principal » de `docs/superpowers/specs/2026-07-30-react-runtime-design.md` :

```markdown
**Vérifié le 2026-07-30** sous CSP de production : `script-src 'self'` autorise
bien une iframe `srcdoc` à origine opaque à charger un script depuis l'origine
du parent. Le repli par inlining n'est pas nécessaire. Gardé par
`e2e/csp-srcdoc-script.spec.ts`.
```

Si le test **échoue** : s'arrêter et remonter le résultat. Le repli change la forme de `buildPreviewSrcdoc` (Task 4) et doit être arbitré avant d'écrire la suite. Ne pas improviser.

- [ ] **Step 6: Commit**

```bash
git add .gitignore public/react-runtime/probe.js e2e/csp-srcdoc-script.spec.ts docs/superpowers/specs/2026-07-30-react-runtime-design.md
git commit -m "test(csp): verifie qu'une iframe srcdoc peut charger un script de l'origine parente"
```

---

## Task 2: Le bundle du runtime React

**Files:**
- Create: `scripts/react-runtime-entry.mjs`
- Create: `scripts/build-react-runtime.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: la réponse de Task 1
- Produces: `public/react-runtime/runtime.js`, qui expose `window.React` et `window.ReactDOM` (le client, avec `createRoot`)

React 19 ne publie plus de builds UMD — `node_modules/react` et `react-dom` ne contiennent que du CJS. Aucun `<script src>` ne peut charger React tel quel : le bundling est structurellement nécessaire. `esbuild` devient le premier bundler du projet.

- [ ] **Step 1: Ajouter esbuild**

```bash
pnpm add -D esbuild
```

- [ ] **Step 2: Écrire le point d'entrée**

Créer `scripts/react-runtime-entry.mjs` :

```js
// Point d'entree bundle par build-react-runtime.mjs. Accroche React et le
// client ReactDOM a `window` pour qu'une iframe srcdoc puisse les consommer via
// un simple <script src>. React 19 n'ayant plus de build UMD, c'est le seul
// moyen d'obtenir un React chargeable par balise script.
import * as React from "react";
import * as ReactDOMClient from "react-dom/client";

window.React = React;
window.ReactDOM = ReactDOMClient;
```

- [ ] **Step 3: Écrire le script de build**

Créer `scripts/build-react-runtime.mjs` :

```js
// Bundle React + ReactDOM client en un fichier chargeable par <script src>
// depuis l'iframe d'apercu React. Execute via predev / prebuild, a cote de
// copy-monaco.mjs. La sortie n'est pas versionnee (cf. .gitignore).
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { build } from "esbuild";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const entry = path.join(root, "scripts", "react-runtime-entry.mjs");
const outdir = path.join(root, "public", "react-runtime");
const outfile = path.join(outdir, "runtime.js");

await mkdir(outdir, { recursive: true });

await build({
  entryPoints: [entry],
  outfile,
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["es2020"],
  minify: true,
  // React lit process.env.NODE_ENV a l'execution ; sans ce define, le bundle
  // embarque les avertissements de developpement et plante sur `process`.
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "warning",
});

console.log("[build-react-runtime] runtime React bundle -> public/react-runtime/runtime.js");
```

- [ ] **Step 4: Brancher sur predev et prebuild**

Dans `package.json`, remplacer les deux scripts :

```json
"predev": "node scripts/copy-monaco.mjs && node scripts/build-react-runtime.mjs",
"prebuild": "node scripts/copy-monaco.mjs && node scripts/build-react-runtime.mjs",
```

- [ ] **Step 5: Vérifier le bundle**

```bash
node scripts/build-react-runtime.mjs
```

Attendu : le message de fin, et `public/react-runtime/runtime.js` créé.

```bash
node -e "const s=require('fs').readFileSync('public/react-runtime/runtime.js','utf8'); console.log('taille', s.length); console.log('createRoot present:', s.includes('createRoot')); console.log('pas de process.env restant:', !/process\.env\.NODE_ENV/.test(s));"
```

Attendu : une taille de l'ordre de 200 000 à 400 000 caractères, `createRoot present: true`, `pas de process.env restant: true`.

- [ ] **Step 6: Vérifier que le build complet passe toujours**

```bash
pnpm build
```

Attendu : build vert, avec le message `[build-react-runtime]` dans la sortie du prebuild.

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml scripts/react-runtime-entry.mjs scripts/build-react-runtime.mjs
git commit -m "build(react-runtime): bundle React + ReactDOM pour l'iframe d'apercu"
```

---

## Task 3: La transformation JSX

**Files:**
- Create: `lib/sandbox/jsx-transform.ts`
- Test: `lib/sandbox/jsx-transform.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: rien
- Produces: `transformJsx(code: string): Promise<JsxTransformResult>` où `JsxTransformResult = { ok: true; js: string } | { ok: false; error: string }`

Sucrase plutôt que Babel standalone : il ne fait que JSX, TypeScript et modules — exactement le besoin — pour ~250 Ko au lieu de ~2,5 Mo. Son transform JSX classique produit des appels `React.createElement`, ce qui convient puisque l'iframe fournit `React`.

- [ ] **Step 1: Ajouter Sucrase**

```bash
pnpm add sucrase
```

- [ ] **Step 2: Écrire le test qui échoue**

Créer `lib/sandbox/jsx-transform.test.ts` :

```ts
import { describe, expect, it } from "vitest";

import { transformJsx } from "./jsx-transform";

describe("transformJsx", () => {
  it("transforme du JSX en appels React.createElement", async () => {
    const r = await transformJsx("const a = <div>salut</div>;");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.js).toContain("React.createElement");
    expect(r.js).not.toContain("<div>");
  });

  it("transforme un composant complet avec hooks", async () => {
    const code = `function Reacteur() {
  const [n, setN] = useState(0);
  return <button onClick={() => setN(n + 1)}>Poussee : {n}</button>;
}`;
    const r = await transformJsx(code);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.js).toContain("React.createElement");
    expect(r.js).toContain("useState");
  });

  it("transforme un fragment court", async () => {
    const r = await transformJsx("const a = <><span/></>;");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.js).toContain("React.Fragment");
  });

  it("porte l'erreur au lieu de lever, sur du JSX casse", async () => {
    const r = await transformJsx("const a = <div>pas ferme;");
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.length).toBeGreaterThan(0);
  });

  it("porte l'erreur sur une syntaxe JS invalide", async () => {
    const r = await transformJsx("function ( {{{");
    expect(r.ok).toBe(false);
  });

  it("accepte du code vide sans lever", async () => {
    const r = await transformJsx("");
    expect(r.ok).toBe(true);
  });
});
```

- [ ] **Step 3: Lancer le test pour vérifier qu'il échoue**

```bash
pnpm vitest run lib/sandbox/jsx-transform.test.ts
```

Attendu : ÉCHEC — `Failed to resolve import "./jsx-transform"`.

- [ ] **Step 4: Écrire l'implémentation**

Créer `lib/sandbox/jsx-transform.ts` :

```ts
/**
 * Transformation JSX -> JS, cote navigateur.
 *
 * Sucrase plutot que Babel standalone : il ne couvre que JSX, TypeScript et les
 * modules — exactement le besoin de ce cursus — pour environ un dixieme du
 * poids. Import dynamique pour qu'il n'entre pas dans le bundle initial de
 * l'app : seul un chapitre React le charge, et seulement au premier deploiement.
 *
 * Le transform JSX classique produit des appels `React.createElement`, ce qui
 * convient puisque l'iframe d'apercu expose `React` en global.
 */

export type JsxTransformResult =
  | { ok: true; js: string }
  | { ok: false; error: string };

export async function transformJsx(code: string): Promise<JsxTransformResult> {
  try {
    const { transform } = await import("sucrase");
    const { code: js } = transform(code, {
      transforms: ["jsx"],
      jsxRuntime: "classic",
      production: true,
    });
    return { ok: true, js };
  } catch (err) {
    // Sucrase leve sur une syntaxe invalide. On porte le message plutot que de
    // laisser l'exception traverser : l'appelant l'affiche a l'apprenant, c'est
    // un retour pedagogique, pas un incident.
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
```

- [ ] **Step 5: Lancer le test pour vérifier qu'il passe**

```bash
pnpm vitest run lib/sandbox/jsx-transform.test.ts
```

Attendu : PASS, 6 tests.

- [ ] **Step 6: Vérifier la suite complète et le typage**

```bash
pnpm test:run && pnpm typecheck && pnpm lint
```

Attendu : 441 tests existants + 6, typecheck propre, lint 0 erreur (2 avertissements préexistants).

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml lib/sandbox/jsx-transform.ts lib/sandbox/jsx-transform.test.ts
git commit -m "feat(sandbox): transformation JSX via Sucrase, chargee a la demande"
```

---

## Task 4: Le srcdoc et le protocole de messages

**Files:**
- Create: `lib/sandbox/react-preview.ts`
- Test: `lib/sandbox/react-preview.test.ts`

**Interfaces:**
- Consumes: `public/react-runtime/runtime.js` (Task 2)
- Produces:
  - `buildPreviewSrcdoc(origin: string): string`
  - `parsePreviewMessage(event: MessageEvent, source: Window | null): PreviewMessage | null`
  - `type PreviewMessage = { type: "ready" } | { type: "error"; kind: "transform" | "mount" | "runtime"; message: string }`
  - `PREVIEW_MOUNT_NAME_RE: RegExp`

Les deux fonctions sont pures pour être testables en environnement node, sans DOM. Le `srcdoc` qu'elles produisent contient tout le code qui tourne dans l'iframe.

- [ ] **Step 1: Écrire le test qui échoue**

Créer `lib/sandbox/react-preview.test.ts` :

```ts
import { describe, expect, it } from "vitest";

import {
  PREVIEW_MOUNT_NAME_RE,
  buildPreviewSrcdoc,
  parsePreviewMessage,
} from "./react-preview";

const ORIGIN = "https://exemple.test";

describe("buildPreviewSrcdoc", () => {
  const html = buildPreviewSrcdoc(ORIGIN);

  it("charge le runtime par URL ABSOLUE", () => {
    expect(html).toContain(`${ORIGIN}/react-runtime/runtime.js`);
  });

  it("n'utilise aucune URL relative pour un script", () => {
    // Dans un document srcdoc la base est about:srcdoc : une src relative ne
    // resout rien. Ce test verrouille l'erreur la plus facile a commettre.
    const srcs = [...html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map((m) => m[1]!);
    expect(srcs.length).toBeGreaterThan(0);
    for (const src of srcs) {
      expect(src.startsWith("http"), `src relative trouvee : ${src}`).toBe(true);
    }
  });

  it("cible l'origine du parent pour ses postMessage", () => {
    expect(html).toContain(JSON.stringify(ORIGIN));
  });

  it("installe un conteneur de montage", () => {
    expect(html).toContain('id="racine"');
  });

  it("installe les filets d'erreur hors cycle de rendu", () => {
    expect(html).toContain("onerror");
    expect(html).toContain("unhandledrejection");
  });

  it("derive les globales de React au lieu de les enumerer", () => {
    expect(html).toContain("Object.keys(React)");
  });
});

describe("parsePreviewMessage", () => {
  const source = {} as Window;
  const evt = (data: unknown, from: Window | null = source) =>
    ({ data, source: from, origin: "null" }) as unknown as MessageEvent;

  it("accepte ready", () => {
    expect(parsePreviewMessage(evt({ type: "preview:ready" }), source)).toEqual({
      type: "ready",
    });
  });

  it("accepte une erreur portee", () => {
    const m = parsePreviewMessage(
      evt({ type: "preview:error", kind: "runtime", message: "boom" }),
      source
    );
    expect(m).toEqual({ type: "error", kind: "runtime", message: "boom" });
  });

  it("rejette un message d'une autre source", () => {
    expect(parsePreviewMessage(evt({ type: "preview:ready" }, {} as Window), source)).toBeNull();
  });

  it("rejette un type inconnu", () => {
    expect(parsePreviewMessage(evt({ type: "autre" }), source)).toBeNull();
  });

  it("rejette un kind d'erreur inconnu", () => {
    expect(
      parsePreviewMessage(evt({ type: "preview:error", kind: "bidon", message: "x" }), source)
    ).toBeNull();
  });

  it("rejette une charge malformee sans lever", () => {
    expect(parsePreviewMessage(evt(null), source)).toBeNull();
    expect(parsePreviewMessage(evt("texte"), source)).toBeNull();
    expect(parsePreviewMessage(evt({ type: "preview:error" }), source)).toBeNull();
  });
});

describe("PREVIEW_MOUNT_NAME_RE", () => {
  it("accepte un identifiant de composant", () => {
    expect(PREVIEW_MOUNT_NAME_RE.test("Reacteur")).toBe(true);
    expect(PREVIEW_MOUNT_NAME_RE.test("App")).toBe(true);
    expect(PREVIEW_MOUNT_NAME_RE.test("_Interne$1")).toBe(true);
  });

  it("rejette ce qui pourrait casser le corps de fonction", () => {
    expect(PREVIEW_MOUNT_NAME_RE.test("App; alert(1)")).toBe(false);
    expect(PREVIEW_MOUNT_NAME_RE.test("1App")).toBe(false);
    expect(PREVIEW_MOUNT_NAME_RE.test("")).toBe(false);
    expect(PREVIEW_MOUNT_NAME_RE.test("Mon Composant")).toBe(false);
  });
});
```

- [ ] **Step 2: Lancer le test pour vérifier qu'il échoue**

```bash
pnpm vitest run lib/sandbox/react-preview.test.ts
```

Attendu : ÉCHEC — `Failed to resolve import "./react-preview"`.

- [ ] **Step 3: Écrire l'implémentation**

Créer `lib/sandbox/react-preview.ts` :

```ts
/**
 * Apercu React : construction du srcdoc de l'iframe et protocole de messages.
 *
 * L'iframe est persistante et a origine opaque (`sandbox="allow-scripts"` sans
 * `allow-same-origin`) : elle charge React une seule fois, puis remonte le
 * composant a chaque message `preview:render`. Contrairement a run-js.ts, qui
 * est headless et a un coup, celle-ci reste visible et interactive.
 *
 * Les deux fonctions exportees sont pures pour rester testables en node.
 */

export type PreviewErrorKind = "transform" | "mount" | "runtime";

export type PreviewMessage =
  | { type: "ready" }
  | { type: "error"; kind: PreviewErrorKind; message: string };

/**
 * `previewMount` est interpole dans un corps de `new Function`. On le valide
 * non par crainte d'une injection — le sandbox execute deja du code arbitraire,
 * un nom malveillant n'ajoute rien — mais pour qu'une coquille dans les donnees
 * du cours produise un message clair au lieu d'une erreur de syntaxe opaque.
 */
export const PREVIEW_MOUNT_NAME_RE = /^[A-Za-z_$][\w$]*$/;

const ERROR_KINDS: readonly PreviewErrorKind[] = ["transform", "mount", "runtime"];

export function parsePreviewMessage(
  event: MessageEvent,
  source: Window | null
): PreviewMessage | null {
  if (source === null || event.source !== source) return null;

  const data = event.data as { type?: unknown; kind?: unknown; message?: unknown } | null;
  if (typeof data !== "object" || data === null) return null;

  if (data.type === "preview:ready") return { type: "ready" };

  if (data.type === "preview:error") {
    if (typeof data.message !== "string") return null;
    if (!ERROR_KINDS.includes(data.kind as PreviewErrorKind)) return null;
    return { type: "error", kind: data.kind as PreviewErrorKind, message: data.message };
  }

  return null;
}

/**
 * Le srcdoc de l'iframe. `origin` est l'origine du parent : elle sert d'URL
 * absolue pour le runtime (une URL relative ne resout rien depuis
 * `about:srcdoc`) et de cible aux postMessage vers le parent.
 */
export function buildPreviewSrcdoc(origin: string): string {
  const parentOrigin = JSON.stringify(origin);

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <style>
      html, body { margin: 0; padding: 0; }
      body { font-family: system-ui, sans-serif; font-size: 15px; padding: 12px; }
    </style>
  </head>
  <body>
    <div id="racine"></div>
    <script src="${origin}/react-runtime/runtime.js"></script>
    <script>
      (function () {
        "use strict";
        var envoyer = function (msg) { parent.postMessage(msg, ${parentOrigin}); };
        var erreur = function (kind, message) {
          envoyer({ type: "preview:error", kind: kind, message: String(message) });
        };

        // Filets pour ce qu'une frontiere d'erreur React ne voit pas : une
        // exception dans un setTimeout d'un useEffect, une promesse rejetee.
        window.onerror = function (message) { erreur("runtime", message); return true; };
        window.addEventListener("unhandledrejection", function (e) {
          erreur("runtime", (e.reason && e.reason.message) || e.reason || "Promesse rejetee");
        });

        if (!window.React || !window.ReactDOM) {
          erreur("runtime", "Runtime React introuvable.");
          return;
        }

        var React = window.React;
        var ReactDOM = window.ReactDOM;
        var conteneur = document.getElementById("racine");
        var root = null;

        // Frontiere d'erreur : capture ce que React leve PENDANT le rendu, dont
        // « Rendered fewer hooks than expected » — le message qui enseigne
        // vraiment les regles des hooks.
        var Frontiere = class extends React.Component {
          constructor(props) { super(props); this.state = { mort: false }; }
          static getDerivedStateFromError() { return { mort: true }; }
          componentDidCatch(err) { erreur("runtime", err && err.message ? err.message : err); }
          render() { return this.state.mort ? null : this.props.children; }
        };

        // Les globales sont DERIVEES de React, jamais enumerees a la main : une
        // liste ecrite en dur donnerait un « useRef is not defined » indebogable
        // le jour ou un exercice l'utiliserait.
        var noms = Object.keys(React).filter(function (k) {
          return /^use[A-Z]/.test(k) || k === "createContext" || k === "Fragment" || k === "memo";
        });

        var monter = function (js, mount) {
          try {
            if (root) { root.unmount(); root = null; }
            conteneur.innerHTML = "";

            var corps = '"use strict";' + js +
              "; return typeof " + mount + " !== 'undefined' ? " + mount + " : null;";
            // Function.apply SANS `new` : `new Function.apply(...)` se lirait
            // `new (Function.apply)(...)` et leverait. Appeler Function comme une
            // fonction construit la meme chose.
            var fabrique = Function.apply(
              null,
              ["React", "ReactDOM"].concat(noms, [corps])
            );
            var Composant = fabrique.apply(
              null,
              [React, ReactDOM].concat(noms.map(function (k) { return React[k]; }))
            );

            if (!Composant) {
              erreur("mount", "Le composant " + mount + " n'a pas ete trouve. Verifie son nom.");
              return;
            }

            root = ReactDOM.createRoot(conteneur);
            root.render(React.createElement(Frontiere, null, React.createElement(Composant)));
          } catch (err) {
            erreur("runtime", err && err.message ? err.message : err);
          }
        };

        window.addEventListener("message", function (event) {
          if (event.source !== parent) return;
          var data = event.data;
          if (!data || data.type !== "preview:render") return;
          if (typeof data.js !== "string" || typeof data.mount !== "string") return;
          monter(data.js, data.mount);
        });

        envoyer({ type: "preview:ready" });
      })();
    </script>
  </body>
</html>`;
}
```

- [ ] **Step 4: Lancer le test pour vérifier qu'il passe**

```bash
pnpm vitest run lib/sandbox/react-preview.test.ts
```

Attendu : PASS, 15 tests.

- [ ] **Step 5: Vérifier le typage et la suite**

```bash
pnpm typecheck && pnpm lint && pnpm test:run
```

Attendu : tout vert.

- [ ] **Step 6: Commit**

```bash
git add lib/sandbox/react-preview.ts lib/sandbox/react-preview.test.ts
git commit -m "feat(sandbox): srcdoc de l'apercu React et protocole de messages"
```

---

## Task 5: Le champ previewMount et ses 28 valeurs

**Files:**
- Modify: `data/courses/html/types.ts`
- Create: `lib/sandbox/preview-exemptions.ts`
- Modify: `data/courses/react/chapitre-1.ts`, `-2.ts`, `-3.ts`, `-5.ts`, `-6.ts`, `-7.ts`, `-8.ts`
- Test: `lib/sandbox/preview-mounts.test.ts`

**Interfaces:**
- Consumes: `PREVIEW_MOUNT_NAME_RE` (Task 4)
- Produces: `Step.previewMount?: string`, `PREVIEW_EXEMPT: Record<string, string>`

**Cette tâche est du jugement, pas une substitution mécanique.** Compter environ une heure. Certaines étapes déclarent plusieurs composants : le chapitre 8 étape 4 a `Console` **et** `App`, et c'est `App` qu'il faut monter puisqu'il porte le Provider.

- [ ] **Step 1: Ajouter le champ au type**

Dans `data/courses/html/types.ts`, dans l'interface `Step`, après `docRefs` :

```ts
  /**
   * Nom du composant a monter dans l'apercu React (cursus react uniquement).
   * Explicite par etape : il n'y a pas de regle deductible — selon l'etape
   * c'est le composant de l'exercice, ou le parent qui porte un Provider.
   * Absent sur les cursus sans apercu et sur les chapitres exemptes
   * (cf. lib/sandbox/preview-exemptions.ts).
   */
  previewMount?: string;
```

- [ ] **Step 2: Écrire la liste d'exemption**

Créer `lib/sandbox/preview-exemptions.ts` :

```ts
/**
 * Chapitres dont les etapes n'ont volontairement pas d'apercu, avec la raison.
 *
 * Cle : `<cursus>/<slug de chapitre>`. Le test d'integrite exige que toute
 * etape sans `previewMount` appartienne a un chapitre listee ici — c'est ce qui
 * distingue une exclusion assumee d'un oubli silencieux.
 */
export const PREVIEW_EXEMPT: Record<string, string> = {
  "react/chapitre-4":
    "Enseigne React Router : l'apercu exigerait react-router-dom dans le bundle " +
    "et un MemoryRouter autour du composant monte. Hors perimetre du runtime v1.",
};
```

- [ ] **Step 3: Écrire le test d'intégrité qui échoue**

Créer `lib/sandbox/preview-mounts.test.ts` :

```ts
import { describe, expect, it } from "vitest";

import { CHAPTER_SUMMARIES } from "@/lib/chapter-summaries";
import { getChapterData } from "@/lib/courses-registry";
import { PREVIEW_MOUNT_NAME_RE } from "./react-preview";
import { PREVIEW_EXEMPT } from "./preview-exemptions";

/**
 * Chaque etape React doit etre dans un des deux cas : elle a un `previewMount`
 * valide, ou son chapitre est exempte avec une raison ecrite. Une etape oubliee
 * echoue ici — c'est le seul garde-fou contre un apercu qui reste vide sans que
 * personne ne s'en apercoive.
 */
describe("previewMount du cursus React", () => {
  const slugs = CHAPTER_SUMMARIES.react.map((c) => c.slug);

  it("couvre chaque etape, ou l'exempte explicitement", () => {
    for (const slug of slugs) {
      const exempt = PREVIEW_EXEMPT[`react/${slug}`];
      const data = getChapterData("react", slug);
      expect(data, `${slug} absent du registre`).not.toBeNull();

      data!.steps.forEach((step, i) => {
        const ref = `react/${slug} etape ${i + 1}`;
        if (exempt) {
          expect(step.previewMount, `${ref} : chapitre exempte, previewMount inattendu`).toBeUndefined();
          return;
        }
        expect(step.previewMount, `${ref} : previewMount manquant`).toBeDefined();
        expect(
          PREVIEW_MOUNT_NAME_RE.test(step.previewMount!),
          `${ref} : « ${step.previewMount} » n'est pas un identifiant valide`
        ).toBe(true);
      });
    }
  });

  /**
   * Le vrai piege : un previewMount qui nomme un composant que l'etape ne
   * declare pas. Le `hint` etant la solution de reference, il doit contenir la
   * declaration de ce composant.
   */
  it("nomme un composant declare dans le hint de l'etape", () => {
    for (const slug of slugs) {
      if (PREVIEW_EXEMPT[`react/${slug}`]) continue;
      const data = getChapterData("react", slug)!;

      data.steps.forEach((step, i) => {
        const nom = step.previewMount!;
        const declare = new RegExp(
          `(?:function\\s+${nom}\\s*\\(|(?:const|let|var)\\s+${nom}\\s*=)`
        ).test(step.hint);
        expect(
          declare,
          `react/${slug} etape ${i + 1} : « ${nom} » n'est pas declare dans le hint`
        ).toBe(true);
      });
    }
  });

  it("chaque exemption porte une raison non vide", () => {
    for (const [cle, raison] of Object.entries(PREVIEW_EXEMPT)) {
      expect(raison.trim().length, `${cle} : raison vide`).toBeGreaterThan(20);
    }
  });
});
```

- [ ] **Step 4: Lancer le test pour voir la liste exacte de ce qui manque**

```bash
pnpm vitest run lib/sandbox/preview-mounts.test.ts
```

Attendu : ÉCHEC, avec un message nommant la première étape sans `previewMount`. Ce message est ta liste de travail pour l'étape suivante.

- [ ] **Step 5: Renseigner les 28 champs**

Pour chaque étape des chapitres 1, 2, 3, 5, 6, 7 et 8 : **lire le `hint`**, et choisir le composant qui rend l'exercice complet. La règle de jugement, dans cet ordre :

1. Si le hint déclare un composant qui en contient d'autres (un `App` avec un Provider, un parent qui rend un enfant), monter **celui-là**.
2. Sinon, monter le composant que l'énoncé nomme — celui dont le `startCode` porte le squelette.
3. Jamais un hook (`useCompteur`) : ce n'est pas un composant.

Ajouter le champ à côté de `placeholder` dans chaque étape, par exemple :

```ts
      placeholder: "// function useCompteur() { ... }",
      previewMount: "Reacteur",
```

**Les 28 valeurs, extraites des hints à la rédaction de ce plan.** Chaque nom a été vérifié comme déclaré dans le hint de son étape.

| Chapitre | Étape 1 | Étape 2 | Étape 3 | Étape 4 |
|---|---|---|---|---|
| ch1 · composants | `Radar` | `Radar` | `Radar` | **`TableauDeBord`** |
| ch2 · useState | `Compteur` | `Compteur` | `Pilote` | **`TableauDeBord`** |
| ch3 · useEffect | `Console` | `Compteur` | `Chronometre` | `FicheVaisseau` |
| ch5 · listes | `ListeFlotte` | `ListeFlotte` | `ListeFlotte` | `ListeFlotte` |
| ch6 · formulaires | `ConsoleSaisie` | `FormulaireContact` | `FormulaireContact` | `FormulaireContact` |
| ch7 · hooks | `Reacteur` | `Bouclier` | `Hublot` | `Panneau` |
| ch8 · contexte | **`App`** | **`App`** | `Alerte` | **`App`** |

Les valeurs en gras sont les seules où le choix demande un jugement, parce que l'étape déclare plus d'un composant :

- **ch1 étape 4** déclare `TableauDeBord` et rend `<Radar />`. Monter `TableauDeBord` : c'est lui qui démontre la composition enseignée.
- **ch2 étape 4** déclare `TableauDeBord` et `Bouton`, et rend `<Bouton />`. Monter `TableauDeBord`, le parent.
- **ch8 étapes 1, 2 et 4** déclarent un consommateur (`Pont`, `Console`) et un `App` qui porte le Provider. Monter `App` : le consommateur seul lèverait, puisqu'il lit un contexte qu'aucun Provider ne fournit. À l'étape 4, `App` porte en plus le `useReducer`.
- **ch7 étape 1** déclare `useCompteur` et `Reacteur`. Monter `Reacteur` : un hook n'est pas un composant. Le test de l'étape 3 le rejetterait de toute façon, puisqu'il n'est pas rendu — mais la règle vaut d'être dite.

Toutes les autres étapes ne déclarent qu'un composant : aucune ambiguïté.

- [ ] **Step 6: Lancer le test jusqu'au vert**

```bash
pnpm vitest run lib/sandbox/preview-mounts.test.ts
```

Attendu : PASS, 3 tests. Itérer sur l'étape 5 tant que ça échoue — chaque message nomme précisément l'étape en cause.

- [ ] **Step 7: Vérifier la suite complète**

```bash
pnpm test:run && pnpm typecheck && pnpm lint
```

Attendu : tout vert.

- [ ] **Step 8: Commit**

```bash
git add data/courses/html/types.ts lib/sandbox/preview-exemptions.ts lib/sandbox/preview-mounts.test.ts data/courses/react/
git commit -m "feat(react): previewMount explicite sur 28 etapes + exemption du chapitre 4"
```

---

## Task 6: Le composant d'aperçu et son câblage

**Files:**
- Create: `components/lesson/ReactPreview.tsx`
- Modify: `components/lesson/ChapterWorkspace.tsx`

**Interfaces:**
- Consumes: `transformJsx` (Task 3) · `buildPreviewSrcdoc`, `parsePreviewMessage`, `PREVIEW_MOUNT_NAME_RE` (Task 4) · `step.previewMount` (Task 5)
- Produces: `<ReactPreview code mount deployNonce className />`

`ReactPreview` fait tout : transformer, envoyer, écouter, afficher. `ChapterWorkspace` incrémente un compteur au clic sur DÉPLOYER et ne connaît ni Sucrase ni le protocole.

- [ ] **Step 1: Écrire le composant**

Créer `components/lesson/ReactPreview.tsx` :

```tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { transformJsx } from "@/lib/sandbox/jsx-transform";
import {
  PREVIEW_MOUNT_NAME_RE,
  buildPreviewSrcdoc,
  parsePreviewMessage,
  type PreviewErrorKind,
} from "@/lib/sandbox/react-preview";

/** Delai au-dela duquel on considere que l'iframe ne repondra pas. */
const READY_TIMEOUT_MS = 5000;

interface ReactPreviewProps {
  /** Code courant de l'editeur, non transforme. */
  code: string;
  /** Nom du composant a monter. Absent = chapitre sans apercu. */
  mount?: string;
  /** Incremente par le parent a chaque clic sur DEPLOYER. 0 = jamais deploye. */
  deployNonce: number;
  className?: string;
}

type Etat =
  | { phase: "attente" }
  | { phase: "indisponible" }
  | { phase: "rendu" }
  | { phase: "erreur"; kind: PreviewErrorKind; message: string };

export default function ReactPreview({
  code,
  mount,
  deployNonce,
  className = "",
}: ReactPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [pret, setPret] = useState(false);
  const [etat, setEtat] = useState<Etat>({ phase: "attente" });
  // Dernier code transforme, garde en file tant que l'iframe n'a pas dit `ready`.
  // Sans ca, un deploiement pendant le chargement de React serait perdu en
  // silence : un postMessage envoye trop tot n'est pas remis.
  const enAttenteRef = useRef<{ js: string; mount: string } | null>(null);

  const envoyer = useCallback((payload: { js: string; mount: string }) => {
    const fenetre = iframeRef.current?.contentWindow;
    if (!fenetre) return;
    // L'iframe est a origine opaque : "*" est la seule cible possible pour
    // postMessage. Acceptable, la charge utile est le code de l'apprenant
    // lui-meme et non un secret ; l'iframe verifie event.source === parent.
    fenetre.postMessage({ type: "preview:render", ...payload }, "*");
  }, []);

  // Ecoute des messages de l'iframe.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const msg = parsePreviewMessage(event, iframeRef.current?.contentWindow ?? null);
      if (!msg) return;

      if (msg.type === "ready") {
        setPret(true);
        const enFile = enAttenteRef.current;
        if (enFile) {
          enAttenteRef.current = null;
          envoyer(enFile);
        }
        return;
      }

      setEtat({ phase: "erreur", kind: msg.kind, message: msg.message });
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [envoyer]);

  // Filet : si `ready` n'arrive jamais, l'apercu se declare indisponible et la
  // lecon continue. L'apercu n'est jamais un chemin critique.
  useEffect(() => {
    const t = setTimeout(() => {
      if (!pret) setEtat((e) => (e.phase === "attente" ? { phase: "indisponible" } : e));
    }, READY_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [pret]);

  // Le code courant, lu au moment du deploiement. Un ref plutot qu'une
  // dependance d'effet : mettre `code` dans les deps remonterait l'apercu a
  // chaque frappe au clavier, et le desactiver avec exhaustive-deps masquerait
  // le probleme au lieu de le resoudre.
  const codeRef = useRef(code);
  codeRef.current = code;

  // Transformation + envoi a chaque deploiement.
  useEffect(() => {
    if (deployNonce === 0 || !mount) return;

    if (!PREVIEW_MOUNT_NAME_RE.test(mount)) {
      setEtat({
        phase: "erreur",
        kind: "mount",
        message: `Nom de composant invalide dans les donnees du cours : « ${mount} ».`,
      });
      return;
    }

    let annule = false;
    void (async () => {
      const r = await transformJsx(codeRef.current);
      if (annule) return;

      if (!r.ok) {
        setEtat({ phase: "erreur", kind: "transform", message: r.error });
        return;
      }

      setEtat({ phase: "rendu" });
      const payload = { js: r.js, mount };
      if (pret) envoyer(payload);
      else enAttenteRef.current = payload;
    })();

    return () => {
      annule = true;
    };
  }, [deployNonce, mount, pret, envoyer]);

  // Construit apres le montage, jamais au rendu : `buildPreviewSrcdoc` a besoin
  // de `window.location.origin`, et un repli "" cote serveur puis la vraie
  // valeur cote client provoquerait un ecart d'hydratation sur l'attribut.
  const [srcdoc, setSrcdoc] = useState<string | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture ponctuelle de l'origine au montage
    setSrcdoc(buildPreviewSrcdoc(window.location.origin));
  }, []);

  return (
    <div className={`flex min-h-0 flex-1 flex-col ${className}`}>
      <div className="shrink-0 border-b border-nebula-border/40 px-5 py-2 font-tech text-[10px] uppercase tracking-[0.3em] text-nebula-text-dim">
        {"> "}Apercu du composant
      </div>

      {etat.phase === "erreur" && (
        <div className="shrink-0 border-b border-nebula-red/40 bg-nebula-red/10 px-5 py-3">
          <p className="mb-1 font-tech text-[10px] uppercase tracking-widest text-nebula-red">
            {etat.kind === "transform"
              ? "Syntaxe refusee"
              : etat.kind === "mount"
                ? "Composant introuvable"
                : "Erreur a l'execution"}
          </p>
          <p className="font-code text-xs leading-relaxed text-nebula-red/90">{etat.message}</p>
        </div>
      )}

      {etat.phase === "indisponible" ? (
        <p className="px-5 py-4 font-body text-sm text-nebula-text-dim">
          Apercu indisponible. Ton code est toujours analyse et validable.
        </p>
      ) : (
        <>
          {deployNonce === 0 && (
            <p className="px-5 py-4 font-body text-sm text-nebula-text-dim">
              Deploie pour voir ton composant s&apos;executer.
            </p>
          )}
          {srcdoc !== null && (
            <iframe
              ref={iframeRef}
              srcDoc={srcdoc}
              className={`min-h-0 flex-1 border-none bg-white ${
                deployNonce === 0 ? "hidden" : "block"
              }`}
              sandbox="allow-scripts"
              title="Apercu du composant React"
            />
          )}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Vérifier le typage**

```bash
pnpm typecheck && pnpm lint
```

Attendu : aucune erreur.

- [ ] **Step 3: Câbler dans ChapterWorkspace**

Ajouter l'import :

```ts
import ReactPreview from "@/components/lesson/ReactPreview";
```

Ajouter le compteur de déploiements, à côté des autres `useState` (vers la ligne 92) :

```ts
  // Incremente a chaque DEPLOYER : c'est le seul signal que ReactPreview
  // consomme. ChapterWorkspace ignore Sucrase comme le protocole de messages.
  const [deployNonce, setDeployNonce] = useState(0);
```

Dans `runCode`, juste après `onDeploy?.();` :

```ts
    if (isReact) setDeployNonce((n) => n + 1);
```

Remplacer la branche `isReact` du panneau (vers la ligne 405) — celle qui affiche « Analyse statique » — par :

```tsx
      ) : isReact ? (
        <ReactPreview
          code={code}
          mount={step.previewMount}
          deployNonce={deployNonce}
          className={mobilePanel === "editor" ? "hidden lg:flex" : "flex"}
        />
      ) : (
```

Le libellé du panneau (vers la ligne 274) passe de `"Analyse statique"` à `"Apercu"` pour `isReact`.

- [ ] **Step 4: Vérifier**

```bash
pnpm typecheck && pnpm lint && pnpm test:run
```

Attendu : tout vert.

- [ ] **Step 5: Vérifier à la main dans le navigateur**

```bash
pnpm dev
```

Se connecter, ouvrir `/learn/react/chapitre-7`, coller le hint de l'étape 1, cliquer DÉPLOYER. Attendu : le bouton `Poussee : 0` apparaît dans l'aperçu, et cliquer dessus l'incrémente.

Puis, pour vérifier la remontée d'erreur : aller à l'étape 4, coller le `startCode` (qui met `useState` dans un `if`) et déployer. Attendu : un message d'erreur d'exécution venant de React, pas un plantage silencieux.

Arrêter le serveur avant de finir.

- [ ] **Step 6: Commit**

```bash
git add components/lesson/ReactPreview.tsx components/lesson/ChapterWorkspace.tsx
git commit -m "feat(react): apercu execute du composant dans le panneau de lecon"
```

---

## Task 7: Le parcours de bout en bout

**Files:**
- Create: `e2e/react-preview.spec.ts`

**Interfaces:**
- Consumes: tout ce qui précède
- Produces: rien

- [ ] **Step 1: Écrire le test**

Créer `e2e/react-preview.spec.ts` :

```ts
import { expect, test } from "@playwright/test";

import { E2E_USER } from "./global-setup";

/**
 * L'apercu React de bout en bout. L'iframe est a origine opaque : Playwright y
 * accede via `frameLocator`, qui opere au niveau du protocole et non via la
 * regle de meme origine.
 */
test.describe("apercu React", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.locator("#email").fill(E2E_USER.email);
    await page.locator("#password").fill(E2E_USER.password);
    await page.getByRole("button", { name: /se connecter/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  });

  test("monte le composant et reagit au clic", async ({ page }) => {
    await page.goto("/learn/react/chapitre-7");

    // Avant tout deploiement, l'apercu invite a deployer.
    await expect(page.getByText(/Deploie pour voir ton composant/i)).toBeVisible();

    const editeur = page.locator(".monaco-editor").first();
    await editeur.click();
    await page.keyboard.press("Control+A");
    await page.keyboard.type(
      "function useCompteur() {\n" +
        "const [n, setN] = useState(0);\n" +
        "return { n, augmenter: () => setN(n + 1) };\n" +
        "}\n" +
        "function Reacteur() {\n" +
        "const { n, augmenter } = useCompteur();\n" +
        "return <button onClick={augmenter}>Poussee : {n}</button>;\n" +
        "}"
    );

    await page.getByRole("button", { name: /deployer/i }).click();

    const apercu = page.frameLocator('iframe[title="Apercu du composant React"]');
    const bouton = apercu.getByRole("button", { name: /Poussee : 0/ });
    await expect(bouton).toBeVisible({ timeout: 15_000 });

    // Le point de tout le chantier : le composant est VIVANT.
    await bouton.click();
    await expect(apercu.getByRole("button", { name: /Poussee : 1/ })).toBeVisible();
  });

  test("remonte l'erreur de React quand un hook est dans un if", async ({ page }) => {
    await page.goto("/learn/react/chapitre-7");

    const editeur = page.locator(".monaco-editor").first();
    await editeur.click();
    await page.keyboard.press("Control+A");
    await page.keyboard.type(
      "function Panneau() {\n" +
        "if (true) {\n" +
        "const [mode, setMode] = useState('auto');\n" +
        "return <div>{mode}</div>;\n" +
        "}\n" +
        "return null;\n" +
        "}\n" +
        "function Reacteur() { return <Panneau />; }"
    );

    await page.getByRole("button", { name: /deployer/i }).click();
    await expect(page.getByText(/Erreur a l'execution|Syntaxe refusee/i)).toBeVisible({
      timeout: 15_000,
    });
  });

  test("le chapitre 4, exempte, n'affiche pas d'apercu", async ({ page }) => {
    await page.goto("/learn/react/chapitre-4");
    await expect(page.locator('iframe[title="Apercu du composant React"]')).toHaveCount(0);
  });
});
```

- [ ] **Step 2: Lancer le test**

```bash
pnpm exec playwright test e2e/react-preview.spec.ts --workers=2
```

Attendu : PASS, 3 tests.

Si `frameLocator` ne peut pas atteindre l'iframe, s'arrêter et le signaler : la spec identifie ce cas comme rendant l'aperçu invérifiable automatiquement, et c'est un arbitrage à remonter, pas à contourner.

- [ ] **Step 3: Le gate complet**

```bash
pnpm lint && pnpm typecheck && pnpm test:run && pnpm build && pnpm exec playwright test --workers=2
```

Attendu : les cinq verts. C'est exactement ce que la CI exécutera.

- [ ] **Step 4: Vérifier l'aperçu sous CSP de production**

Le seul point que le développement ne peut pas prouver. Terminal 1 :

```bash
pnpm build && pnpm start
```

Terminal 2 :

```bash
pnpm exec playwright test e2e/csp-srcdoc-script.spec.ts e2e/react-preview.spec.ts
```

Attendu : PASS. Arrêter le serveur ensuite.

- [ ] **Step 5: Commit**

```bash
git add e2e/react-preview.spec.ts
git commit -m "test(e2e): apercu React monte, reagit au clic et remonte les erreurs"
```

---

## Vérification manuelle finale

- [ ] **Un chapitre non-React n'a pas bougé** — ouvrir `/learn/html/chapitre-1` : onglet `index.html`, panneau « Apercu en direct », iframe HTML présente.
- [ ] **Le cursus JS non plus** — ouvrir un chapitre JavaScript : panneau « Console », sortie console fonctionnelle.
- [ ] **L'aperçu dégradé** — dans les outils de développement, bloquer `/react-runtime/runtime.js`, recharger un chapitre React, déployer. Attendu : « Aperçu indisponible », et **la validation fonctionne toujours**.
