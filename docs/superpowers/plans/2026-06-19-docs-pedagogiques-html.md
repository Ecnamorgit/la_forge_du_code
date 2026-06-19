# Docs pédagogiques contextuelles (pilote HTML) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettre à l'élève d'ouvrir, en un clic depuis une leçon HTML, une fiche de référence clean-room ciblée sur son cas précis, dans un panneau coulissant.

**Architecture:** Une bibliothèque de fiches (`data/docs/`) séparée des chapitres, référencée par id stable (`html/doctype`). Le parser markdown du briefing est extrait vers `lib/markdown.ts` et étendu d'un token `[[doc:ID|texte]]` qui produit un *chip* cliquable. `ChapterClient` capte le clic (délégation d'événement) et ouvre un `DocPanel` (slide-over desktop / drawer mobile) qui rend la fiche avec le même parser.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4 (thème « nebula »), Vitest (unit, env node), Playwright (e2e).

## Global Constraints

- Thème **nebula** sombre uniquement — classes `nebula-*` existantes (cyan/orange). PAS de thème menthe clair.
- Contenu des fiches = **clean-room** (original). Aucune doc officielle recopiée ; seul un lien externe `official` est permis.
- Lien externe = `target="_blank" rel="noopener noreferrer"`.
- **Rétro-compatibilité** : un briefing sans token `[[doc:...]]` et un `Step` sans `docRefs` doivent rendre exactement comme aujourd'hui.
- Tests unitaires : fichiers `*.test.ts` sous `lib/**` ou `app/**`, env node (`vitest.config.ts`). Lancer : `pnpm test:run`.
- E2E : sous `e2e/`, auth via `E2E_USER` de `e2e/global-setup.ts`. Lancer : `pnpm test:e2e`.
- Pas de nouvelle dépendance npm.
- Tout le texte UI en français.
- Commits préfixés `rtk` (convention du projet), branche courante (pas `main`).

---

### Task 1: Couche données des fiches (`data/docs`)

**Files:**
- Create: `data/docs/types.ts`
- Create: `data/docs/html/doctype.ts`
- Create: `data/docs/html/html-element.ts`
- Create: `data/docs/html/head.ts`
- Create: `data/docs/html/index.ts`
- Test: `data/docs/docs-registry.test.ts`

**Interfaces:**
- Consumes: rien (point de départ).
- Produces:
  - `interface DocEntry` (champs ci-dessous).
  - `getDocEntry(id: string): DocEntry | undefined` depuis `data/docs/html/index.ts`.
  - `htmlDocs: Record<string, DocEntry>` (export nommé) depuis le même fichier.

- [ ] **Step 1: Écrire le type `DocEntry`**

Create `data/docs/types.ts` :

```ts
export interface DocExample {
  code: string;
  caption?: string;
}

export interface DocEntry {
  /** Identifiant stable, ex. "html/doctype". */
  id: string;
  /** Domaine, ex. "html". */
  domain: string;
  /** Terme affiché par défaut dans un lien inline, ex. "<!DOCTYPE html>". */
  term: string;
  /** Titre de la fiche. */
  title: string;
  /** Résumé en une phrase (aperçu / cluster). */
  summary: string;
  /** Corps en markdown maison (même parser que le briefing). */
  body: string;
  /** Bloc syntaxe optionnel. */
  syntax?: string;
  /** Exemples optionnels. */
  examples?: DocExample[];
  /** Pièges courants. */
  pitfalls?: string[];
  /** Autres fiches liées (ids). */
  related?: string[];
  /** Lien externe optionnel vers la doc officielle. */
  official?: { label: string; url: string };
}
```

- [ ] **Step 2: Écrire trois fiches**

Create `data/docs/html/doctype.ts` :

```ts
import type { DocEntry } from "../types";

export const doctype: DocEntry = {
  id: "html/doctype",
  domain: "html",
  term: "<!DOCTYPE html>",
  title: "La déclaration <!DOCTYPE html>",
  summary:
    "La toute première ligne d'une page : elle indique au navigateur d'interpréter le document en HTML5.",
  body: `
### À quoi ça sert
**<!DOCTYPE html>** n'est pas une balise : c'est une *déclaration*. Elle se place tout en haut du fichier et annonce au navigateur : « lis ce document comme du HTML5 moderne ».

### Pourquoi c'est obligatoire
Sans elle, les navigateurs basculent en *mode quirks*, un mode de compatibilité ancien où la mise en page se comporte de façon imprévisible.
`,
  syntax: "<!DOCTYPE html>",
  examples: [
    {
      code: "<!DOCTYPE html>\n<html>\n</html>",
      caption: "La déclaration précède toujours la balise <html>.",
    },
  ],
  pitfalls: [
    "Elle doit être la première ligne, avant tout autre contenu (même un espace avant peut poser problème).",
    "Elle ne se ferme pas : il n'y a pas de </!DOCTYPE>.",
  ],
  related: ["html/html-element"],
  official: {
    label: "MDN — Doctype",
    url: "https://developer.mozilla.org/fr/docs/Glossary/Doctype",
  },
};
```

Create `data/docs/html/html-element.ts` :

```ts
import type { DocEntry } from "../types";

export const htmlElement: DocEntry = {
  id: "html/html-element",
  domain: "html",
  term: "<html>",
  title: "L'élément racine <html>",
  summary:
    "La balise qui englobe toute la page : tout le contenu HTML vit à l'intérieur.",
  body: `
### La racine de l'arbre
En HTML, tout fonctionne par **emboîtement**. **<html>** est la racine : c'est la boîte qui contient toutes les autres.

### Ouvrir et fermer
- On l'ouvre au début : \`<html>\`
- On la ferme à la fin : \`</html>\` (le slash **/** marque la fermeture).
`,
  syntax: "<html>\n  <!-- head + body -->\n</html>",
  examples: [
    {
      code: "<!DOCTYPE html>\n<html>\n  <head></head>\n  <body></body>\n</html>",
      caption: "<html> contient toujours <head> puis <body>.",
    },
  ],
  pitfalls: ["Oublier la balise fermante </html>."],
  related: ["html/doctype", "html/head"],
  official: {
    label: "MDN — <html>",
    url: "https://developer.mozilla.org/fr/docs/Web/HTML/Element/html",
  },
};
```

Create `data/docs/html/head.ts` :

```ts
import type { DocEntry } from "../types";

export const head: DocEntry = {
  id: "html/head",
  domain: "html",
  term: "<head>",
  title: "La section <head>",
  summary:
    "La zone invisible de la page : métadonnées, titre d'onglet, liens vers les styles.",
  body: `
### Le centre de contrôle invisible
Le **<head>** contient ce que l'utilisateur ne voit pas directement mais qui dirige la page : le titre de l'onglet, la langue, les liens vers les feuilles de style.
`,
  syntax: "<head>\n  <title>Mon titre</title>\n</head>",
  examples: [
    {
      code: "<head>\n  <title>Base lunaire</title>\n</head>",
      caption: "Le <title> s'affiche dans l'onglet du navigateur.",
    },
  ],
  pitfalls: ["Mettre du contenu visible dans <head> : il n'apparaîtra pas."],
  related: ["html/html-element"],
  official: {
    label: "MDN — <head>",
    url: "https://developer.mozilla.org/fr/docs/Web/HTML/Element/head",
  },
};
```

- [ ] **Step 3: Écrire le registre + l'accesseur**

Create `data/docs/html/index.ts` :

```ts
import type { DocEntry } from "../types";
import { doctype } from "./doctype";
import { htmlElement } from "./html-element";
import { head } from "./head";

/** Registre des fiches HTML, clé = DocEntry.id. */
export const htmlDocs: Record<string, DocEntry> = {
  [doctype.id]: doctype,
  [htmlElement.id]: htmlElement,
  [head.id]: head,
};

/** Retourne la fiche correspondant à l'id, ou undefined si inconnue. */
export function getDocEntry(id: string): DocEntry | undefined {
  return htmlDocs[id];
}
```

- [ ] **Step 4: Écrire le test du registre**

Create `data/docs/docs-registry.test.ts` :

```ts
import { describe, it, expect } from "vitest";
import { getDocEntry, htmlDocs } from "./html";

describe("registre des fiches HTML", () => {
  it("retourne une fiche connue par son id", () => {
    const entry = getDocEntry("html/doctype");
    expect(entry?.term).toBe("<!DOCTYPE html>");
  });

  it("retourne undefined pour un id inconnu", () => {
    expect(getDocEntry("html/inexistant")).toBeUndefined();
  });

  it("garde la cohérence clé/id pour chaque fiche", () => {
    for (const [key, entry] of Object.entries(htmlDocs)) {
      expect(entry.id).toBe(key);
      expect(entry.domain).toBe("html");
    }
  });
});
```

Note : `vitest.config.ts` n'inclut que `lib/**` et `app/**`. Ajouter `data/**/*.test.ts` à `include`.

- [ ] **Step 5: Étendre le glob vitest**

Modify `vitest.config.ts` — ligne `include` :

```ts
    include: ["lib/**/*.test.ts", "app/**/*.test.ts", "data/**/*.test.ts"],
```

- [ ] **Step 6: Lancer le test**

Run: `pnpm test:run data/docs/docs-registry.test.ts`
Expected: 3 tests PASS.

- [ ] **Step 7: Commit**

```bash
rtk git add data/docs vitest.config.ts && rtk git commit -m "feat(docs): couche donnees des fiches de reference HTML"
```

---

### Task 2: Module markdown partagé + token `[[doc:...]]`

**Files:**
- Create: `lib/markdown.ts`
- Create: `lib/markdown.test.ts`
- Modify: `app/learn/[course]/[chapter]/ChapterClient.tsx` (retirer le `parseBriefing` local, importer le module)

**Interfaces:**
- Consumes: rien de Task 1 directement (découplé via resolver).
- Produces:
  - `renderLessonMarkdown(content: string, opts?: { resolveDocTerm?: (id: string) => string | undefined }): string`
  - `extractDocTokenIds(content: string): string[]`
  - `escapeHtml(s: string): string`

Le rendu doit être **identique** à l'actuel `parseBriefing` pour tout contenu sans token (rétro-compat). Le token, présent dans le contenu APRÈS échappement HTML, a la forme `[[doc:ID|texte]]` (texte optionnel). Comme l'échappement transforme `<` en `&lt;`, le `texte` inline est déjà échappé ; le terme résolu (issu de `DocEntry.term`, brut) doit être échappé par le module.

- [ ] **Step 1: Écrire les tests d'abord**

Create `lib/markdown.test.ts` :

```ts
import { describe, it, expect } from "vitest";
import { renderLessonMarkdown, extractDocTokenIds, escapeHtml } from "./markdown";

describe("renderLessonMarkdown — rétro-compat", () => {
  it("rend un titre ### en h4", () => {
    expect(renderLessonMarkdown("### Titre")).toContain("<h4");
  });

  it("rend **gras** et `code`", () => {
    const out = renderLessonMarkdown("**fort** et `x`");
    expect(out).toContain("<strong");
    expect(out).toContain("<code");
  });

  it("échappe le HTML brut", () => {
    expect(renderLessonMarkdown("<script>")).toContain("&lt;script&gt;");
  });
});

describe("renderLessonMarkdown — token doc", () => {
  it("transforme [[doc:ID|texte]] en chip cliquable", () => {
    const out = renderLessonMarkdown("voir [[doc:html/doctype|le doctype]]");
    expect(out).toContain('data-doc-id="html/doctype"');
    expect(out).toContain("le doctype");
    expect(out).not.toContain("[[doc:");
  });

  it("utilise le terme résolu (échappé) quand le texte est omis", () => {
    const out = renderLessonMarkdown("voir [[doc:html/doctype]]", {
      resolveDocTerm: (id) =>
        id === "html/doctype" ? "<!DOCTYPE html>" : undefined,
    });
    expect(out).toContain("&lt;!DOCTYPE html&gt;");
    expect(out).toContain('data-doc-id="html/doctype"');
  });

  it("retombe sur l'id quand aucun resolver ni texte", () => {
    const out = renderLessonMarkdown("voir [[doc:html/doctype]]");
    expect(out).toContain("html/doctype");
  });
});

describe("extractDocTokenIds", () => {
  it("liste les ids référencés", () => {
    const ids = extractDocTokenIds(
      "a [[doc:html/doctype]] b [[doc:html/head|tête]]"
    );
    expect(ids).toEqual(["html/doctype", "html/head"]);
  });

  it("retourne [] sans token", () => {
    expect(extractDocTokenIds("rien ici")).toEqual([]);
  });
});

describe("escapeHtml", () => {
  it("échappe & < >", () => {
    expect(escapeHtml("<a & b>")).toBe("&lt;a &amp; b&gt;");
  });
});
```

- [ ] **Step 2: Lancer pour vérifier l'échec**

Run: `pnpm test:run lib/markdown.test.ts`
Expected: FAIL — `Cannot find module './markdown'`.

- [ ] **Step 3: Écrire le module**

Create `lib/markdown.ts` (le corps de `parseBriefing` est repris à l'identique depuis `ChapterClient.tsx`, avec ajout du token) :

```ts
const DOC_TOKEN_RE = /\[\[doc:([a-z0-9/-]+)(?:\|([^\]]+))?\]\]/g;

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Liste les ids de fiches référencés par des tokens [[doc:ID]] dans le contenu. */
export function extractDocTokenIds(content: string): string[] {
  const ids: string[] = [];
  for (const m of content.matchAll(DOC_TOKEN_RE)) ids.push(m[1]);
  return ids;
}

interface RenderOpts {
  resolveDocTerm?: (id: string) => string | undefined;
}

/**
 * Rend le markdown maison des leçons et des fiches.
 * Identique à l'ancien parseBriefing, plus le token [[doc:ID|texte]].
 */
export function renderLessonMarkdown(
  content: string,
  opts: RenderOpts = {}
): string {
  if (!content) return "";

  const escaped = escapeHtml(content);

  return escaped
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "";

      let formatted = line;

      // Token doc -> chip cliquable (avant gras/code, qui ne le touchent pas).
      formatted = formatted.replace(DOC_TOKEN_RE, (_full, id, label) => {
        const text =
          label != null ? label : escapeHtml(opts.resolveDocTerm?.(id) ?? id);
        return `<button type="button" data-doc-id="${id}" class="doc-chip inline-flex items-center gap-1 rounded-sm border border-nebula-cyan/40 bg-nebula-cyan-faint/30 px-1.5 py-0.5 align-baseline font-code text-xs text-nebula-cyan transition-colors hover:border-nebula-cyan hover:bg-nebula-cyan-faint/60">📖 ${text}</button>`;
      });

      formatted = formatted.replace(
        /`([^`]+)`/g,
        '<code class="bg-nebula-bg-editor px-1.5 py-0.5 rounded text-nebula-cyan font-code text-xs font-mono">$1</code>'
      );
      formatted = formatted.replace(
        /\*\*([^*]+)\*\*/g,
        '<strong class="text-nebula-orange font-bold">$1</strong>'
      );

      const finalTrimmed = formatted.trim();

      if (finalTrimmed.startsWith("### ")) {
        return `<h4 class="text-nebula-cyan font-tech text-lg mt-8 mb-4 tracking-widest uppercase border-b border-nebula-cyan/20 pb-2">${finalTrimmed.slice(4)}</h4>`;
      }

      if (finalTrimmed.startsWith("- ")) {
        return `<li class="ml-4 mb-3 text-nebula-text/85 list-none flex gap-2.5 text-base leading-relaxed"><span class="text-nebula-cyan shrink-0 mt-0.5">◈</span><span>${finalTrimmed.slice(2)}</span></li>`;
      }

      return `<p class="mb-5 last:mb-0 text-base leading-relaxed">${formatted}</p>`;
    })
    .join("");
}
```

- [ ] **Step 4: Lancer le test**

Run: `pnpm test:run lib/markdown.test.ts`
Expected: tous PASS.

- [ ] **Step 5: Brancher ChapterClient sur le module**

Modify `app/learn/[course]/[chapter]/ChapterClient.tsx` :
1. Supprimer la fonction locale `parseBriefing` (lignes ~24-65).
2. Ajouter en haut, près des autres imports :

```ts
import { renderLessonMarkdown } from "@/lib/markdown";
import { getDocEntry } from "@/data/docs/html";
```

3. Remplacer l'appel `parseBriefing(step.briefing.content)` (vers la ligne 347) par :

```ts
              __html: renderLessonMarkdown(step.briefing.content, {
                resolveDocTerm: (id) => getDocEntry(id)?.term,
              }),
```

- [ ] **Step 6: Vérifier typecheck + non-régression**

Run: `pnpm typecheck && pnpm test:run`
Expected: typecheck OK, toute la suite PASS.

- [ ] **Step 7: Commit**

```bash
rtk git add lib/markdown.ts lib/markdown.test.ts app/learn && rtk git commit -m "feat(docs): module markdown partage + token [[doc:...]]"
```

---

### Task 3: Panneau coulissant + câblage du clic + cluster

**Files:**
- Create: `components/docs/DocPanel.tsx`
- Modify: `data/courses/html/types.ts` (ajouter `docRefs?` à `Step`)
- Modify: `app/learn/[course]/[chapter]/ChapterClient.tsx` (état d'ouverture, délégation de clic, montage du panneau, bloc cluster)

**Interfaces:**
- Consumes: `getDocEntry` (Task 1), `renderLessonMarkdown` (Task 2).
- Produces: `DocPanel` composant — props `{ entryId: string | null; onClose: () => void; onOpen: (id: string) => void }`. `onOpen` sert aux chips `related` internes à la fiche.

- [ ] **Step 1: Ajouter `docRefs?` au type `Step`**

Modify `data/courses/html/types.ts` — dans `interface Step`, après `objectives` :

```ts
  /** Ids de fiches de référence pertinentes pour cette étape (optionnel). */
  docRefs?: string[];
```

- [ ] **Step 2: Écrire le composant `DocPanel`**

Create `components/docs/DocPanel.tsx` :

```tsx
"use client";

import { useEffect } from "react";
import { getDocEntry } from "@/data/docs/html";
import { renderLessonMarkdown } from "@/lib/markdown";

interface DocPanelProps {
  entryId: string | null;
  onClose: () => void;
  onOpen: (id: string) => void;
}

export default function DocPanel({ entryId, onClose, onOpen }: DocPanelProps) {
  const entry = entryId ? getDocEntry(entryId) : undefined;
  const open = entry != null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      {/* Voile */}
      <div
        aria-hidden={!open}
        onClick={onClose}
        className={`fixed inset-0 z-[210] bg-black/50 transition-opacity duration-200 motion-reduce:transition-none ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      {/* Panneau : drawer bas sur mobile, latéral droit sur lg */}
      <aside
        data-testid="doc-panel"
        aria-hidden={!open}
        role="dialog"
        aria-label={entry?.title ?? "Fiche de référence"}
        className={`fixed z-[211] flex flex-col overflow-hidden border-nebula-border/70 bg-nebula-bg-darkest/95 backdrop-blur-md transition-transform duration-200 motion-reduce:transition-none
          inset-x-0 bottom-0 max-h-[85dvh] rounded-t-xl border-t
          lg:inset-y-0 lg:right-0 lg:left-auto lg:max-h-none lg:w-[410px] lg:rounded-none lg:border-l lg:border-t-0
          ${open ? "translate-y-0 lg:translate-x-0" : "translate-y-full lg:translate-y-0 lg:translate-x-full"}`}
      >
        {entry && (
          <>
            <header className="flex shrink-0 items-center justify-between border-b border-nebula-border/60 px-5 py-4">
              <span className="font-tech text-xs uppercase tracking-widest text-nebula-blue">
                📖 Référence
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                className="font-tech text-nebula-text-secondary transition-colors hover:text-nebula-cyan"
              >
                ✕
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              <h3 className="mb-2 font-tech text-xl tracking-wide text-nebula-cyan">
                {entry.title}
              </h3>
              <p className="mb-5 font-body text-sm italic leading-relaxed text-nebula-text-secondary">
                {entry.summary}
              </p>

              <div
                className="prose-nebula font-body text-base leading-relaxed text-nebula-text/90"
                onClick={(e) => {
                  const el = (e.target as HTMLElement).closest("[data-doc-id]");
                  const id = el?.getAttribute("data-doc-id");
                  if (id) onOpen(id);
                }}
                dangerouslySetInnerHTML={{
                  __html: renderLessonMarkdown(entry.body, {
                    resolveDocTerm: (id) => getDocEntry(id)?.term,
                  }),
                }}
              />

              {entry.syntax && (
                <pre className="mt-5 overflow-x-auto rounded-sm border border-nebula-border/70 bg-nebula-bg-editor px-4 py-3 font-code text-xs text-nebula-cyan">
                  {entry.syntax}
                </pre>
              )}

              {entry.examples?.map((ex, i) => (
                <div key={i} className="mt-5">
                  <pre className="overflow-x-auto rounded-sm border border-nebula-border/70 bg-nebula-bg-editor px-4 py-3 font-code text-xs text-nebula-text/90">
                    {ex.code}
                  </pre>
                  {ex.caption && (
                    <p className="mt-1.5 font-body text-xs text-nebula-text-secondary">
                      {ex.caption}
                    </p>
                  )}
                </div>
              ))}

              {entry.pitfalls && entry.pitfalls.length > 0 && (
                <div className="mt-6 rounded-sm border border-nebula-orange-dim/60 bg-nebula-orange-faint/20 p-4">
                  <div className="mb-2 font-tech text-xs uppercase tracking-widest text-nebula-orange">
                    ⚠ Pièges courants
                  </div>
                  <ul className="space-y-1.5">
                    {entry.pitfalls.map((p, i) => (
                      <li
                        key={i}
                        className="font-body text-sm text-nebula-text/85"
                      >
                        ◈ {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {entry.related && entry.related.length > 0 && (
                <div className="mt-6">
                  <div className="mb-2 font-tech text-xs uppercase tracking-widest text-nebula-text-secondary">
                    Voir aussi
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {entry.related.map((id) => {
                      const r = getDocEntry(id);
                      if (!r) return null;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => onOpen(id)}
                          className="rounded-sm border border-nebula-cyan/40 bg-nebula-cyan-faint/30 px-2 py-1 font-code text-xs text-nebula-cyan transition-colors hover:border-nebula-cyan"
                        >
                          📖 {r.term}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <footer className="shrink-0 border-t border-nebula-border/60 px-5 py-3">
              <p className="font-body text-[11px] leading-relaxed text-nebula-text-dim">
                Fiche de référence CodeForge — rédigée par l&apos;équipe.
                {entry.official && (
                  <>
                    {" "}
                    <a
                      href={entry.official.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-nebula-cyan underline hover:text-nebula-blue"
                    >
                      {entry.official.label} ↗
                    </a>
                  </>
                )}
              </p>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
```

- [ ] **Step 3: Câbler l'état + la délégation de clic + le cluster dans ChapterClient**

Modify `app/learn/[course]/[chapter]/ChapterClient.tsx` :

1. Importer le panneau près des autres imports de composants :

```ts
import DocPanel from "@/components/docs/DocPanel";
```

2. Ajouter l'état (près des autres `useState`, vers la ligne 139) :

```ts
  const [openDocId, setOpenDocId] = useState<string | null>(null);
```

3. Sur le `<div>` du briefing (celui avec `dangerouslySetInnerHTML`, vers la ligne 344), ajouter le handler de délégation :

```tsx
          <div
            className="prose-nebula font-body text-base leading-relaxed text-nebula-text/90"
            onClick={(e) => {
              const el = (e.target as HTMLElement).closest("[data-doc-id]");
              const id = el?.getAttribute("data-doc-id");
              if (id) setOpenDocId(id);
            }}
            dangerouslySetInnerHTML={{
              __html: renderLessonMarkdown(step.briefing.content, {
                resolveDocTerm: (id) => getDocEntry(id)?.term,
              }),
            }}
          />
```

4. Juste APRÈS ce `<div>` (avant le bloc « Objectifs »), insérer le cluster :

```tsx
          {step.docRefs && step.docRefs.length > 0 && (
            <div className="mt-8 rounded-sm border border-nebula-cyan/30 bg-nebula-cyan-faint/20 p-5">
              <div className="mb-3 font-tech text-sm uppercase tracking-widest text-nebula-cyan">
                📖 Références de cette étape
              </div>
              <ul className="space-y-2">
                {step.docRefs.map((id) => {
                  const ref = getDocEntry(id);
                  if (!ref) return null;
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        data-doc-ref={id}
                        onClick={() => setOpenDocId(id)}
                        className="w-full rounded-sm border border-nebula-border/60 bg-[rgba(5,10,20,0.32)] px-4 py-2.5 text-left transition-colors hover:border-nebula-cyan"
                      >
                        <span className="font-code text-sm text-nebula-cyan">
                          {ref.term}
                        </span>
                        <span className="ml-2 font-body text-xs text-nebula-text-secondary">
                          {ref.summary}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
```

5. Monter le panneau près des autres overlays (par ex. juste après `<HintBox ... />`, vers la ligne 273) :

```tsx
      <DocPanel
        entryId={openDocId}
        onClose={() => setOpenDocId(null)}
        onOpen={(id) => setOpenDocId(id)}
      />
```

- [ ] **Step 4: Vérifier typecheck**

Run: `pnpm typecheck`
Expected: aucune erreur.

- [ ] **Step 5: Commit**

```bash
rtk git add components/docs data/courses/html/types.ts app/learn && rtk git commit -m "feat(docs): panneau coulissant + cluster references par etape"
```

---

### Task 4: Annoter le chapitre 1 HTML (démonstration vivante)

**Files:**
- Modify: `data/courses/html/chapitre-1.ts`

**Interfaces:**
- Consumes: ids existants dans `data/docs/html` (`html/doctype`, `html/html-element`, `html/head`).
- Produces: au moins un token inline et un `docRefs` non vide sur l'étape 1.

- [ ] **Step 1: Annoter l'étape 1**

Modify `data/courses/html/chapitre-1.ts`, étape 1 (`steps[0]`).

1. Dans `briefing.content`, remplacer le titre de section et la mention du doctype pour insérer un token inline. Remplacer la ligne :

```
### Le Signal d'Amorce : <!DOCTYPE html>
```

par :

```
### Le Signal d'Amorce : [[doc:html/doctype|<!DOCTYPE html>]]
```

Et dans la même section, là où le texte mentionne `**<html>**`, ajouter un renvoi en remplaçant la ligne :

```
En HTML, tout fonctionne par **emboîtement**. La balise **<html>** est la "racine". Tout ce que vous écrirez par la suite devra se trouver à l'intérieur de cette balise.
```

par :

```
En HTML, tout fonctionne par **emboîtement**. La balise [[doc:html/html-element|<html>]] est la "racine". Tout ce que vous écrirez par la suite devra se trouver à l'intérieur de cette balise.
```

2. Ajouter `docRefs` à l'étape 1 (après le tableau `objectives`) :

```ts
      docRefs: ["html/doctype", "html/html-element"],
```

- [ ] **Step 2: Annoter l'étape 2 (le <head>)**

Modify `data/courses/html/chapitre-1.ts`, étape 2 (`steps[1]`) : ajouter après ses `objectives` :

```ts
      docRefs: ["html/head"],
```

- [ ] **Step 3: Vérifier typecheck + suite**

Run: `pnpm typecheck && pnpm test:run`
Expected: OK (les validateurs du chapitre 1 ne dépendent pas du texte du briefing).

- [ ] **Step 4: Commit**

```bash
rtk git add data/courses/html/chapitre-1.ts && rtk git commit -m "feat(docs): annote le chapitre 1 HTML avec des renvois de reference"
```

---

### Task 5: Garde-fou d'intégrité + test E2E

**Files:**
- Create: `data/docs/docs-integrity.test.ts`
- Create: `e2e/doc-panel.spec.ts`

**Interfaces:**
- Consumes: `htmlDocs`, `getDocEntry` (Task 1) ; `extractDocTokenIds` (Task 2) ; `chapitre1` (`data/courses/html/chapitre-1.ts`) ; `E2E_USER` (`e2e/global-setup.ts`).
- Produces: rien (tests terminaux).

- [ ] **Step 1: Écrire le test d'intégrité (échoue si un renvoi pointe dans le vide)**

Create `data/docs/docs-integrity.test.ts` :

```ts
import { describe, it, expect } from "vitest";
import { htmlDocs, getDocEntry } from "./html";
import { extractDocTokenIds } from "@/lib/markdown";
import { chapitre1 } from "@/data/courses/html/chapitre-1";

describe("intégrité des renvois de fiches", () => {
  it("chaque `related` de fiche pointe vers une fiche existante", () => {
    for (const entry of Object.values(htmlDocs)) {
      for (const id of entry.related ?? []) {
        expect(getDocEntry(id), `related cassé: ${id}`).toBeDefined();
      }
    }
  });

  it("chaque `docRefs` du chapitre 1 pointe vers une fiche existante", () => {
    for (const step of chapitre1.steps) {
      for (const id of step.docRefs ?? []) {
        expect(getDocEntry(id), `docRefs cassé: ${id}`).toBeDefined();
      }
    }
  });

  it("chaque token [[doc:ID]] du briefing pointe vers une fiche existante", () => {
    for (const step of chapitre1.steps) {
      for (const id of extractDocTokenIds(step.briefing.content)) {
        expect(getDocEntry(id), `token cassé: ${id}`).toBeDefined();
      }
    }
  });
});
```

- [ ] **Step 2: Lancer le test d'intégrité**

Run: `pnpm test:run data/docs/docs-integrity.test.ts`
Expected: 3 tests PASS (grâce aux annotations de Task 4).

- [ ] **Step 3: Écrire le test E2E**

Create `e2e/doc-panel.spec.ts` :

```ts
import { test, expect } from "@playwright/test";

import { E2E_USER } from "./global-setup";

test("le panneau de doc s'ouvre depuis un chip et se ferme avec Échap", async ({
  page,
}) => {
  // Connexion (route /learn protégée).
  await page.goto("/login");
  await page.locator("#email").fill(E2E_USER.email);
  await page.locator("#password").fill(E2E_USER.password);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

  await page.goto("/learn/html/chapitre-1");

  const panel = page.getByTestId("doc-panel");
  await expect(panel).toBeHidden();

  // Chip inline dans le briefing.
  await page.locator('button[data-doc-id="html/doctype"]').first().click();
  await expect(panel).toBeVisible();
  await expect(panel.getByText("La déclaration <!DOCTYPE html>")).toBeVisible();

  // Échap ferme.
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();

  // Cluster « Références de cette étape ».
  await page.locator('button[data-doc-ref="html/html-element"]').click();
  await expect(panel).toBeVisible();
  await expect(panel.getByText("L'élément racine <html>")).toBeVisible();
});
```

Note : `toBeHidden()` est satisfait par le panneau hors-écran (translate) seulement s'il n'occupe pas l'espace visible ; comme `DocPanel` reste monté, on s'appuie sur `aria-hidden` + position. Si `toBeHidden` est trop strict avec l'élément translaté, remplacer les deux assertions « caché » par `await expect(panel).toHaveAttribute("aria-hidden", "true")` et l'assertion « visible » par `toHaveAttribute("aria-hidden", "false")`.

- [ ] **Step 4: Lancer le test E2E**

Run: `pnpm test:e2e doc-panel.spec.ts`
Expected: PASS (le serveur démarre via `webServer`, base seedée en CI).

- [ ] **Step 5: Commit**

```bash
rtk git add data/docs/docs-integrity.test.ts e2e/doc-panel.spec.ts && rtk git commit -m "test(docs): integrite des renvois + e2e du panneau de reference"
```

---

## Notes d'exécution

- Si `pnpm test:e2e` échoue à cause du translate (élément techniquement « visible » pour Playwright), basculer sur les assertions `aria-hidden` décrites dans Task 5 Step 3.
- Le `prose-nebula` et toutes les classes `nebula-*` existent déjà dans `app/globals.css` ; ne pas les redéfinir.
- Aucune migration Prisma, aucune route API : la fonctionnalité est 100 % côté contenu + UI.
