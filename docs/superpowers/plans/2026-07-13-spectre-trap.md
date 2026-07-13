# Le Spectre en étapes-pièges (tâche 6B) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Donner un rôle jouable au Spectre : une étape où il a corrompu le `startCode`, présentée à ses couleurs (violet) avec un beat de combat à l'ouverture, que le Cadet doit réparer.

**Architecture:** Un champ optionnel `spectreTrap?` sur `Step` marque une étape-piège ; `ChapterClient` rend la boîte d'intro en style Spectre quand il est présent ; `ChapterWorkspace` joue une fois le beat ennemi + `playBreach` au montage d'un piège. Trois étapes existantes (HTML/CSS/JS) sont converties : `startCode` corrompu d'une erreur unique, réparable, validateur inchangé.

**Tech Stack:** Next.js 16 (App Router, Client Components), Tailwind v4, Vitest (env **node**).

## Global Constraints

- `Step.spectreTrap?` **optionnel et rétrocompatible** : une étape sans ce champ est inchangée.
- Présentation Spectre : token `nebula-spectre` (violet) + casting `CHARACTERS.spectre` ([lib/characters.ts](../../../lib/characters.ts)), copie française Nebula Command.
- Flourish : `setEnemyState({ type:"fly", trigger:1 })` + `playBreach()` **au montage** d'un piège ; `playBreach` respecte déjà la préférence son, le `CombatVisualizer` gère `prefers-reduced-motion`.
- **Validateurs non réécrits** : chaque corruption est choisie pour échouer tant qu'elle n'est pas réparée, et le validateur existant passe une fois réparée.
- Vitest = env **node** : test d'intégrité pur ; composants vérifiés via `tsc`/`eslint`/`next build`.
- Spec : [docs/superpowers/specs/2026-07-13-spectre-trap-design.md](../specs/2026-07-13-spectre-trap-design.md).

---

## Task 1: Mécanique — champ `spectreTrap` + présentation Spectre + flourish

**Files:**
- Modify: `data/courses/html/types.ts`
- Modify: `app/learn/[course]/[chapter]/ChapterClient.tsx`
- Modify: `components/lesson/ChapterWorkspace.tsx`

**Interfaces:**
- Produces : `Step.spectreTrap?: string` (consommé par ChapterClient et ChapterWorkspace).

- [ ] **Step 1 : Ajouter le champ au type** — `data/courses/html/types.ts`

Dans l'interface `Step`, juste après la ligne `placeholder: string;`, ajouter :
```ts
  /**
   * Étape-piège : Le Spectre a corrompu le `startCode`, à réparer. La valeur est
   * sa raillerie, affichée à la place de la boîte narrateur. Absent = étape normale.
   */
  spectreTrap?: string;
```

- [ ] **Step 2 : Boîte d'intro Spectre conditionnelle** — `app/learn/[course]/[chapter]/ChapterClient.tsx`

Remplacer le bloc de la boîte narrateur (en-tête Kira + `step.narrator`) :
```tsx
          <div className="mb-8 border-l-2 border-nebula-cyan/40 bg-nebula-cyan-faint/40 px-5 py-4">
            <div className="mb-1.5 font-tech text-[10px] uppercase tracking-widest text-nebula-cyan">
              {CHARACTERS.kira.glyph} {CHARACTERS.kira.title} {CHARACTERS.kira.name}
            </div>
            <p className="font-body text-base italic leading-relaxed text-nebula-text-secondary">
              {step.narrator}
            </p>
          </div>
```
par une version conditionnelle :
```tsx
          {step.spectreTrap ? (
            <div className="mb-8 border-l-2 border-nebula-spectre/60 bg-nebula-spectre/10 px-5 py-4">
              <div className="mb-1.5 font-tech text-[10px] uppercase tracking-widest text-nebula-spectre">
                {CHARACTERS.spectre.glyph} {CHARACTERS.spectre.title} {CHARACTERS.spectre.name}
              </div>
              <p className="font-body text-base italic leading-relaxed text-nebula-text-secondary">
                {step.spectreTrap}
              </p>
            </div>
          ) : (
            <div className="mb-8 border-l-2 border-nebula-cyan/40 bg-nebula-cyan-faint/40 px-5 py-4">
              <div className="mb-1.5 font-tech text-[10px] uppercase tracking-widest text-nebula-cyan">
                {CHARACTERS.kira.glyph} {CHARACTERS.kira.title} {CHARACTERS.kira.name}
              </div>
              <p className="font-body text-base italic leading-relaxed text-nebula-text-secondary">
                {step.narrator}
              </p>
            </div>
          )}
```
(`CHARACTERS` est déjà importé dans ce fichier.)

- [ ] **Step 3 : Flourish de combat au montage** — `components/lesson/ChapterWorkspace.tsx`

`playBreach` est déjà importé. Juste après l'effet de nettoyage :
```tsx
  useEffect(() => {
    return () => clearTimeout(detectTimerRef.current);
  }, []);
```
ajouter cet effet de montage :
```tsx
  // Étape-piège : à l'ouverture, Le Spectre fond sur la console (beat + son).
  // Montage uniquement — le composant est remonté par étape (clé).
  useEffect(() => {
    if (step.spectreTrap) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- flourish volontaire au montage
      setEnemyState({ type: "fly", trigger: 1 });
      playBreach();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
```

- [ ] **Step 4 : Vérifier types, lint, build**

Run: `npx tsc --noEmit && npx eslint data/courses/html/types.ts "app/learn/[course]/[chapter]/ChapterClient.tsx" components/lesson/ChapterWorkspace.tsx && npx next build`
Expected: 0 erreur ; `next build` exit 0. (Aucune étape n'a encore `spectreTrap` → comportement inchangé, mais le mécanisme est en place.)

- [ ] **Step 5 : Commit**

```bash
git add data/courses/html/types.ts "app/learn/[course]/[chapter]/ChapterClient.tsx" components/lesson/ChapterWorkspace.tsx
git commit -m "feat(spectre): mecanique d'etape-piege (champ spectreTrap + presentation + flourish)"
```

---

## Task 2: Convertir 3 étapes en pièges + test d'intégrité

**Files:**
- Create: `lib/spectre-trap.test.ts`
- Modify: `data/courses/html/chapitre-2.ts`
- Modify: `data/courses/css/chapitre-4.ts`
- Modify: `data/courses/javascript/chapitre-1.ts`

**Interfaces:**
- Consumes (Task 1) : `Step.spectreTrap`. Existant : `getChapterData(course, chapter)` ([lib/courses-registry.ts](../../../lib/courses-registry.ts)).

- [ ] **Step 1 : Écrire le test d'intégrité (échoue)** — `lib/spectre-trap.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { getChapterData } from "@/lib/courses-registry";

/** Étapes converties en pièges du Spectre (course, chapter, index d'étape). */
const TRAPS: Array<[string, string, number]> = [
  ["html", "chapitre-2", 0],
  ["css", "chapitre-4", 0],
  ["javascript", "chapitre-1", 0],
];

describe("Étapes-pièges du Spectre", () => {
  for (const [course, chapter, step] of TRAPS) {
    it(`${course}/${chapter} étape ${step + 1} porte un spectreTrap non vide`, () => {
      const data = getChapterData(course, chapter);
      expect(data, `${course}/${chapter} introuvable`).not.toBeNull();
      const trap = data!.steps[step]?.spectreTrap;
      expect(typeof trap).toBe("string");
      expect((trap ?? "").trim().length).toBeGreaterThan(0);
    });
  }
});
```

- [ ] **Step 2 : Lancer le test, vérifier l'échec**

Run: `npx vitest run lib/spectre-trap.test.ts`
Expected: FAIL — les 3 cas rouges (aucune étape ne porte encore `spectreTrap`).

- [ ] **Step 3 : Convertir JS ch1 étape 1** — `data/courses/javascript/chapitre-1.ts`

Remplacer :
```ts
      startCode: "// Affiche un message dans la console\n",
      placeholder: "// Ecris ton code ici",
```
par :
```ts
      startCode: 'consol.log("Bonjour, station Nebula");\n',
      spectreTrap:
        "J'ai brouillé ton émetteur, Cadet. Ce `consol.log` ne répond plus — retrouve le bon canal, si tu en es capable.",
      placeholder: "// Ecris ton code ici",
```
(La faute `consol` lève une ReferenceError → le validateur échoue ; corriger en `console` fait passer l'étape.)

- [ ] **Step 4 : Convertir CSS ch4 étape 1** — `data/courses/css/chapitre-4.ts`

Dans le `startCode` de la **première** étape, remplacer la règle `.container` :
```
.container { background-color: #0a1322; padding: 12px; }
```
par :
```
.container { background-color: #0a1322; padding: 12px; display: flexbox; }
```
Puis ajouter le champ `spectreTrap` juste après la ligne `placeholder:` de cette première étape :
```ts
      spectreTrap:
        "Regarde tes chasseurs s'entasser, Cadet. J'ai glissé un `display: flexbox` là où le protocole n'en connaît pas. Corrige, ou reste au sol.",
```
(`display: flexbox` n'est pas une valeur valide et ne matche pas le validateur `/\bflex\b/` → échoue ; corriger en `display: flex` fait passer l'étape.)

- [ ] **Step 5 : Convertir HTML ch2 étape 1** — `data/courses/html/chapitre-2.ts`

Dans le `startCode` de la **première** étape, remplacer :
```
    <h1>Relais Orbital</h1>
    
```
par (insertion d'un lien à l'attribut corrompu) :
```
    <h1>Relais Orbital</h1>
    <a herf="https://developer.mozilla.org" target="_blank">Documentation MDN</a>
```
Puis ajouter le champ `spectreTrap` juste après la ligne `placeholder:` de cette première étape :
```ts
      spectreTrap:
        "J'ai retourné les lettres de ton `href`, Cadet. Ce lien ne mène nulle part. Répare l'attribut si tu veux ouvrir la passerelle.",
```
(`herf` n'est pas `href` → le validateur ne trouve pas de lien valide et échoue ; corriger en `href` fait passer l'étape.)

> Note : ces `startCode` sont des littéraux **avec `\n`** dans le source (chaînes sur une seule ligne pour JS ch1, ou multi-lignes pour HTML/CSS selon le fichier). Respecter l'échappement exact du fichier ; ne modifier que la sous-chaîne indiquée, dans la **première** étape.

- [ ] **Step 6 : Lancer le test d'intégrité, vérifier le succès**

Run: `npx vitest run lib/spectre-trap.test.ts`
Expected: PASS — 3 cas verts.

- [ ] **Step 7 : Vérifier types, lint, build, suite complète**

Run: `npx tsc --noEmit && npx eslint data/courses/html/chapitre-2.ts data/courses/css/chapitre-4.ts data/courses/javascript/chapitre-1.ts && npx vitest run && npx next build`
Expected: 0 erreur ; toute la suite verte ; `next build` exit 0.

- [ ] **Step 8 : Commit**

```bash
git add lib/spectre-trap.test.ts data/courses/html/chapitre-2.ts data/courses/css/chapitre-4.ts data/courses/javascript/chapitre-1.ts
git commit -m "feat(spectre): 3 etapes-pieges pilotes (HTML/CSS/JS) + test d'integrite"
```

---

## Self-Review

**Spec coverage :** champ `spectreTrap?` rétrocompatible (Task 1 step 1) ✔ ; boîte Spectre conditionnelle (Task 1 step 2) ✔ ; flourish fly+playBreach au montage, reduced-motion/son gérés en amont (Task 1 step 3) ✔ ; 3 étapes converties avec corruption réparable et validateur passant (Task 2 steps 3-5, vérifié contre chaque validateur) ✔ ; test d'intégrité (Task 2 steps 1-2, 6) ✔ ; critères d'acceptation couverts par les vérifs ✔.

**Placeholders :** aucun ; le champ, les deux branches de présentation, l'effet de montage, les 3 corruptions exactes et le test sont fournis intégralement.

**Cohérence des types :** `Step.spectreTrap` (défini Task 1) lu identiquement dans ChapterClient et ChapterWorkspace (Task 1) et par le test via `getChapterData` (Task 2) ; `setEnemyState`/`playBreach` déjà présents dans ChapterWorkspace ; `CHARACTERS.spectre` déjà exporté.
