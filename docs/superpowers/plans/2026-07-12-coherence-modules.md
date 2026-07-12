# Cohérence narrative HTML/CSS/JS — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Généraliser à HTML et CSS le traitement narratif déjà en place sur JavaScript — identité « Cadet » unifiée, erreurs scénarisées par défaut, et Kira incarnée en tête de chaque chapitre.

**Architecture:** Trois tâches indépendantes : (1) find-replace d'identité dans le contenu des cours ; (2) un helper pur `resolveErrorTone` branché au centre dans `ChapterWorkspace` (défaut de tonalité par langage) ; (3) une réplique Kira en tête du 1er briefing de chaque chapitre HTML+CSS, verrouillée par un test d'intégrité.

**Tech Stack:** Next.js 16, TypeScript, Vitest (env **node**, tests purs). Contenu des cours = objets `ChapterData` dans `data/courses/**`.

## Global Constraints

- **Copie française, registre Nebula Command.** Adresse au joueur = **« Cadet »** (jamais « Ingénieur » ni « cadet » minuscule comme adresse).
- **Garder** les libellés de grades/badges contenant « Ingénieur » (ex. `completionBadgeLabel: "INGENIEUR ..."`) — grade gagné, pas une adresse. Ne PAS toucher les `completionBadgeLabel`.
- Pas de vocabulaire « forge/marteau ».
- **Voix de Kira** : pragmatique, endurcie, exigeante mais juste ; registre station/systèmes ; tutoie le Cadet ; 1 à 2 phrases.
- **Taxonomie de tonalité** (existante, `lib/narrative-feedback.ts`) : `structure` / `logic` / `syntax` / (undefined → générique « BRECHE DETECTEE »).
- **Le cursus CSS est servi en `language="html"`** dans `ChapterWorkspace` (document HTML avec `<style>`).
- Vitest = env **node** : les tests importent du contenu/des fonctions pures, pas de DOM.
- Vérif composant/contenu : `npx tsc --noEmit`, `npx eslint <fichiers>`, `npx next build` (exit 0).
- Spec : [docs/superpowers/specs/2026-07-12-coherence-modules-design.md](../specs/2026-07-12-coherence-modules-design.md).

---

## Task 1: Unifier l'identité « Cadet » (HTML + CSS)

**Files:**
- Modify: `data/courses/html/chapitre-1.ts`, `chapitre-3.ts`, `chapitre-5.ts`, `chapitre-6.ts`, `chapitre-7.ts`, `chapitre-8.ts`
- Modify: `data/courses/css/chapitre-1.ts`

**Interfaces:** aucune (contenu uniquement). Ne crée ni ne modifie de type/fonction.

Chaque édition remplace une **adresse au joueur**. Les `completionBadgeLabel` (« INGENIEUR … ») restent intacts.

- [ ] **Step 1 : HTML — remplacer les adresses « Ingénieur »**

Dans chaque fichier, remplacer la sous-chaîne exacte (à gauche) par celle de droite :

`data/courses/html/chapitre-1.ts` :
- `"Ingénieur, nous commençons par les fondations.` → `"Cadet, nous commençons par les fondations.`
- `bannerSub: "Le signal a atteint la Terre. Félicitations, Ingénieur !"` → `bannerSub: "Le signal a atteint la Terre. Félicitations, Cadet !"`

`data/courses/html/chapitre-3.ts` :
- `"Ingénieur de soute, branchons le premier capteur` → `"Cadet, branchons le premier capteur`

`data/courses/html/chapitre-5.ts` :
- `"Ingénieur de soute, nous devons cataloguer` → `"Cadet, nous devons cataloguer`

`data/courses/html/chapitre-6.ts` :
- `"Ingénieur de dock, nous devons poser` → `"Cadet, nous devons poser`

`data/courses/html/chapitre-7.ts` :
- `"Ingénieur des transmissions, configurons les paramètres` → `"Cadet, configurons les paramètres`

`data/courses/html/chapitre-8.ts` :
- `"Ingénieur des transmissions, connectons le retour` → `"Cadet, connectons le retour`

- [ ] **Step 2 : CSS — capitaliser « cadet » dans l'exemple de code**

`data/courses/css/chapitre-1.ts` : cette chaîne apparaît **4 fois** (dans le `startCode` des 4 étapes). Remplacer toutes les occurrences :
- `<p>Bienvenue, cadet.</p>` → `<p>Bienvenue, Cadet.</p>`

(Édition « remplacer toutes les occurrences » sur ce fichier.)

- [ ] **Step 3 : Vérifier qu'aucune adresse fautive ne subsiste**

Run: `npx rg -n "Ingénieur[^\"]*," data/courses/html && echo "--- reste des adresses ci-dessus (doit être vide) ---"; npx rg -n "Bienvenue, cadet" data/courses/css`
Expected: aucune ligne de narrateur « Ingénieur … , » ; aucune occurrence « Bienvenue, cadet ». (Les `completionBadgeLabel: "INGENIEUR …"` ne matchent pas ce motif.)

- [ ] **Step 4 : Typecheck**

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 5 : Commit**

```bash
git add data/courses/html/chapitre-1.ts data/courses/html/chapitre-3.ts data/courses/html/chapitre-5.ts data/courses/html/chapitre-6.ts data/courses/html/chapitre-7.ts data/courses/html/chapitre-8.ts data/courses/css/chapitre-1.ts
git commit -m "feat(narrative): unifie l'adresse au joueur sur « Cadet » (HTML+CSS)"
```

---

## Task 2: Défaut de tonalité d'erreur par langage

**Files:**
- Modify: `lib/narrative-feedback.ts`
- Modify: `lib/narrative-feedback.test.ts`
- Modify: `components/lesson/ChapterWorkspace.tsx`

**Interfaces:**
- Consumes : `ErrorTone`, `inferToneFromError` (déjà dans `lib/narrative-feedback.ts`).
- Produces : `resolveErrorTone(validatorTone: ErrorTone | undefined, jsError: string | null, language: "html" | "javascript" | "sql"): ErrorTone | undefined`.

- [ ] **Step 1 : Écrire le test qui échoue** — ajouter dans `lib/narrative-feedback.test.ts`

Ajouter l'import de `resolveErrorTone` à la ligne d'import existante :
```ts
import {
  getErrorHeader,
  getSuccessHeader,
  getSpectreTaunt,
  inferToneFromError,
  resolveErrorTone,
  SPECTRE_TAUNT_THRESHOLD,
} from "./narrative-feedback";
```
Puis ajouter ce bloc à la fin du fichier :
```ts
describe("resolveErrorTone", () => {
  it("priorise la tonalité fournie par le validateur", () => {
    expect(resolveErrorTone("syntax", null, "html")).toBe("syntax");
    expect(resolveErrorTone("syntax", "SyntaxError: x", "javascript")).toBe("syntax");
  });

  it("utilise l'inférence depuis l'erreur JS quand le validateur n'a rien fixé", () => {
    expect(
      resolveErrorTone(undefined, "Execution interrompue apres 3s (boucle infinie).", "javascript")
    ).toBe("logic");
  });

  it("retombe sur le défaut du langage : HTML (et CSS servi en html) → structure", () => {
    expect(resolveErrorTone(undefined, null, "html")).toBe("structure");
  });

  it("laisse JS/SQL en générique (undefined) sans tonalité ni inférence", () => {
    expect(resolveErrorTone(undefined, null, "javascript")).toBeUndefined();
    expect(resolveErrorTone(undefined, null, "sql")).toBeUndefined();
  });
});
```

- [ ] **Step 2 : Lancer le test, vérifier l'échec**

Run: `npx vitest run lib/narrative-feedback.test.ts`
Expected: FAIL — `resolveErrorTone is not exported` / not a function.

- [ ] **Step 3 : Implémenter** — ajouter à `lib/narrative-feedback.ts` (après `inferToneFromError`)

```ts
/**
 * Tonalité par défaut selon le langage de l'étape, quand ni le validateur ni
 * l'inférence runtime n'ont fixé de tonalité. HTML (et CSS, servi en "html")
 * → structure ; JS/SQL restent génériques (undefined → « BRECHE DETECTEE »).
 */
const DEFAULT_TONE_BY_LANGUAGE: Record<
  "html" | "javascript" | "sql",
  ErrorTone | undefined
> = {
  html: "structure",
  javascript: undefined,
  sql: undefined,
};

/**
 * Résout la tonalité d'un échec : priorité au tone du validateur, puis à
 * l'inférence depuis l'erreur JS runtime, puis au défaut du langage.
 */
export function resolveErrorTone(
  validatorTone: ErrorTone | undefined,
  jsError: string | null,
  language: "html" | "javascript" | "sql",
): ErrorTone | undefined {
  return validatorTone ?? inferToneFromError(jsError) ?? DEFAULT_TONE_BY_LANGUAGE[language];
}
```

- [ ] **Step 4 : Lancer le test, vérifier le succès**

Run: `npx vitest run lib/narrative-feedback.test.ts`
Expected: PASS (tous les blocs, dont `resolveErrorTone`).

- [ ] **Step 5 : Brancher dans le workspace** — `components/lesson/ChapterWorkspace.tsx`

Dans l'import depuis `@/lib/narrative-feedback`, **remplacer** `inferToneFromError` par `resolveErrorTone` (après le branchement, `inferToneFromError` n'est plus appelé directement dans ce fichier — il vit désormais à l'intérieur de `resolveErrorTone` — donc le laisser importé provoquerait une erreur `no-unused-vars`) :
```ts
import {
  getErrorHeader,
  getSpectreTaunt,
  resolveErrorTone,
  type ErrorTone,
} from "@/lib/narrative-feedback";
```
Dans `runCode`, la branche d'échec définit `feedback`. Remplacer la ligne :
```ts
      tone: result.tone ?? inferToneFromError(jsError),
```
par :
```ts
      tone: resolveErrorTone(result.tone, jsError, language),
```
(`language` est le prop du composant, valeur `"html" | "javascript" | "sql"`.)

- [ ] **Step 6 : Vérifier types, lint, build**

Run: `npx tsc --noEmit && npx eslint lib/narrative-feedback.ts components/lesson/ChapterWorkspace.tsx && npx next build`
Expected: 0 erreur ; build exit 0.

- [ ] **Step 7 : Commit**

```bash
git add lib/narrative-feedback.ts lib/narrative-feedback.test.ts components/lesson/ChapterWorkspace.tsx
git commit -m "feat(narrative): defaut de tonalite d'erreur par langage (HTML/CSS -> structure)"
```

---

## Task 3: Kira incarnée sur HTML + CSS + test d'intégrité

**Files:**
- Create: `lib/kira-intro.test.ts`
- Modify: `data/courses/html/chapitre-{1..8}.ts`
- Modify: `data/courses/css/chapitre-{1..10}.ts`

**Interfaces:**
- Consumes : `getChapterData(course: string, chapter: string): ChapterData | null` depuis `@/lib/courses-registry`.

Règle d'insertion (identique à JS) : dans le **premier `step`** de chaque chapitre, au tout début de `briefing.content` (juste après `content: \`` et le saut de ligne, avant le premier `###`), insérer :
```md
*« <réplique> »* — **Kira**

```
(une ligne italique + guillemets, puis une ligne vide, puis le contenu existant inchangé).

- [ ] **Step 1 : Écrire le test d'intégrité (échoue)** — `lib/kira-intro.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { getChapterData } from "@/lib/courses-registry";

// Nombre de chapitres par cursus complet concerné.
const COURSES: Record<string, number> = { html: 8, css: 10 };

describe("Kira incarnée en tête du 1er briefing (HTML + CSS)", () => {
  for (const [course, count] of Object.entries(COURSES)) {
    for (let n = 1; n <= count; n++) {
      const slug = `chapitre-${n}`;
      it(`${course}/${slug} — le premier briefing cite Kira`, () => {
        const data = getChapterData(course, slug);
        expect(data, `${course}/${slug} introuvable`).not.toBeNull();
        const content = data!.steps[0].briefing?.content ?? "";
        expect(content).toContain("Kira");
      });
    }
  }
});
```

- [ ] **Step 2 : Lancer le test, vérifier l'échec**

Run: `npx vitest run lib/kira-intro.test.ts`
Expected: FAIL — 18 cas rouges (aucun premier briefing HTML/CSS ne contient « Kira »).

- [ ] **Step 3 : Insérer les répliques Kira — HTML (8 chapitres)**

Pour chaque fichier, l'ancre est `title: "<TITRE>",` suivi de `content: \`` puis du premier `###`. Insérer la réplique entre le backtick d'ouverture et le premier `###`.

`data/courses/html/chapitre-1.ts` (titre `Les Fondations de l'Acier Numérique`, 1er `### Le Signal d'Amorce`) :
> *« Pas de base sans fondations. Le \`<!DOCTYPE>\` et la balise racine, c'est l'enceinte qui tient tout le reste — on ne pose rien tant qu'elle n'est pas scellée. »* — **Kira**

`data/courses/html/chapitre-2.ts` (titre `Le lien externe avec target="_blank"`, 1er `### La balise <a>`) :
> *« Une station isolée est une station morte. Un lien relie les docks ; s'il sort de la station, ouvre-le dans un nouveau sas pour ne pas perdre ta session. »* — **Kira**

`data/courses/html/chapitre-3.ts` (titre `Capter une image`, 1er `### La balise <img>`) :
> *« Un capteur sans légende ne sert à rien dans le noir. Renseigne toujours le \`alt\` : c'est ce que « voient » les officiers privés d'écran. »* — **Kira**

`data/courses/html/chapitre-4.ts` (titre `Les listes a puces`, 1er `### La balise <ul>`) :
> *« Un inventaire, ça se tient en ordre. Une puce par module, et rien d'autre qu'un \`<li>\` dans un \`<ul>\`. »* — **Kira**

`data/courses/html/chapitre-5.ts` (titre `Le formulaire et son premier champ`, 1er `### La balise <form>`) :
> *« Pas d'enregistrement sans étiquette. Lie chaque \`<label>\` à son champ par le \`for\`/\`id\` — un formulaire mal étiqueté, c'est une cargaison sans manifeste. »* — **Kira**

`data/courses/html/chapitre-6.ts` (titre `Les compartiments semantiques`, 1er `### Pourquoi semantique ?`) :
> *« Une console où tout se ressemble, personne ne s'y repère — surtout pas les lecteurs d'écran. Nomme tes zones : \`header\`, \`main\`, \`footer\`. La structure, c'est déjà de l'accessibilité. »* — **Kira**

`data/courses/html/chapitre-7.ts` (titre `Metadonnées globales`, 1er `### L'attribut lang`) :
> *« Avant d'émettre, on règle la fréquence. Langue, encodage, viewport : ces méta-réglages garantissent que ton signal est lu correctement sur tous les terminaux. »* — **Kira**

`data/courses/html/chapitre-8.ts` (titre `L'integration video : <video> et controls`, 1er `### La balise <video>`) :
> *« Un flux de surveillance sans commandes, c'est une image morte. Donne à ton \`<video>\` ses \`controls\` — l'opérateur doit garder la main. »* — **Kira**

- [ ] **Step 4 : Insérer les répliques Kira — CSS (10 chapitres)**

`data/courses/css/chapitre-1.ts` (titre `Brancher le CSS au HTML`, 1er `### Le CSS, c'est quoi ?`) :
> *« La structure tient, maintenant on l'habille. Le \`<style>\` dans le \`<head>\`, c'est ta console graphique — tout le décor de la station passe par là. »* — **Kira**

`data/courses/css/chapitre-2.ts` (titre `Le selecteur de classe`, 1er `### Selectionner par classe`) :
> *« Tirer sur tout ce qui bouge, c'est bon pour les amateurs. Une \`class\`, un point, et tu ne cibles que ce que tu veux — précision avant puissance. »* — **Kira**

`data/courses/css/chapitre-3.ts` (titre `Largeur et hauteur`, 1er `### Les propriétés width et height`) :
> *« Chaque module occupe un volume précis dans la soute. \`width\` et \`height\` réservent sa place ; connais ta boîte avant de l'empiler. »* — **Kira**

`data/courses/css/chapitre-4.ts` (titre `Activer Flexbox`, 1er `### Flexbox, c'est quoi ?`) :
> *« Des vaisseaux empilés en pagaille ne décollent pas. \`display: flex\` sur le hangar, et l'escadrille s'aligne. Tu commandes le parent, il range les enfants. »* — **Kira**

`data/courses/css/chapitre-5.ts` (titre `Activer Grid`, 1er `### CSS Grid, c'est quoi ?`) :
> *« Pour une carte tactique, une seule dimension ne suffit pas. \`display: grid\` te donne lignes ET colonnes — quadrille l'espace comme une grille de défense. »* — **Kira**

`data/courses/css/chapitre-6.ts` (titre `position: relative`, 1er `### Quatre positionnements`) :
> *« Parfois il faut décaler un module sans bousculer ses voisins. \`position: relative\` le déplace en gardant sa place dans le flux — chirurgie, pas démolition. »* — **Kira**

`data/courses/css/chapitre-7.ts` (titre `Pseudo-classe :hover`, 1er `### Qu'est-ce qu'une pseudo-classe ?`) :
> *« Une console qui ne réagit pas au contact inquiète l'équipage. \`:hover\`, \`:focus\` : style tes éléments selon leur état, donne-leur un signe de vie. »* — **Kira**

`data/courses/css/chapitre-8.ts` (titre `max-width vs width`, 1er `### Le problème de width fixe`) :
> *« Un écran de passerelle et un terminal de poche n'ont pas la même taille. \`max-width\` + \`width: 100%\` : ton dock s'adapte au lieu de déborder. »* — **Kira**

`data/courses/css/chapitre-9.ts` (titre `transition`, 1er `### Le probleme`) :
> *« Un changement brutal fatigue l'œil en poste long. Une \`transition\`, et l'état passe en douceur — le confort aussi, c'est de l'ingénierie. »* — **Kira**

`data/courses/css/chapitre-10.ts` (titre `Définir une variable CSS`, 1er `### Variables CSS = Custom Properties`) :
> *« Une couleur recopiée dix fois, c'est dix pannes à venir. Centralise sur \`:root\` avec des variables : tu changes la teinte de toute la flotte en une ligne. »* — **Kira**

**Format exact d'insertion** (exemple HTML ch1) — le `briefing.content` passe de :
```
        content: `
### Le Signal d'Amorce : [[doc:html/doctype|<!DOCTYPE html>]]
```
à :
```
        content: `
*« Pas de base sans fondations. Le \`<!DOCTYPE>\` et la balise racine, c'est l'enceinte qui tient tout le reste — on ne pose rien tant qu'elle n'est pas scellée. »* — **Kira**

### Le Signal d'Amorce : [[doc:html/doctype|<!DOCTYPE html>]]
```
Les backticks inline (\`) à l'intérieur d'un template literal doivent rester **échappés** (`\``), comme dans l'exemple.

- [ ] **Step 5 : Lancer le test d'intégrité, vérifier le succès**

Run: `npx vitest run lib/kira-intro.test.ts`
Expected: PASS — 18 cas verts.

- [ ] **Step 6 : Vérifier types, lint, build, suite complète**

Run: `npx tsc --noEmit && npx eslint data/courses/html data/courses/css && npx vitest run && npx next build`
Expected: 0 erreur ; toute la suite verte ; build exit 0.

- [ ] **Step 7 : Commit**

```bash
git add lib/kira-intro.test.ts data/courses/html/chapitre-*.ts data/courses/css/chapitre-*.ts
git commit -m "feat(narrative): incarne Kira en tete de chaque chapitre HTML+CSS (+ test d'integrite)"
```

---

## Self-Review

**Spec coverage :** T1 identité (Task 1) ✔ ; T2 tone par langage + override + CSS-sur-html (Task 2) ✔ ; T3 Kira 1er briefing HTML(8)+CSS(10) + test obligatoire (Task 3) ✔ ; grades « Ingénieur » préservés (Global Constraints + Task 1 ne touche pas `completionBadgeLabel`) ✔ ; critères d'acceptation de la spec couverts par les vérifs de chaque tâche ✔.

**Placeholders :** aucun ; tout le code (helper, tests, 18 répliques, ancres) est fourni intégralement.

**Cohérence des types :** `resolveErrorTone(validatorTone, jsError, language)` — même signature en Task 2 (définition, test, appel dans ChapterWorkspace) ; `getChapterData(course, chapter)` utilisé conformément à `lib/courses-registry.ts` ; `ErrorTone` réutilisé, non redéfini.
