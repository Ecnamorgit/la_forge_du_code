# Couverture des validateurs — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Exercer les validateurs des étapes 2 à 4, aujourd'hui jamais testés, et poser un balayage structurel qui couvre les 191 étapes du parcours.

**Architecture :** Deux volets. Un test dirigé par les données parcourt les deux registres (`courses-registry`, `validators/index`) et vérifie deux invariants sans aucun cas écrit à la main. Puis des fichiers de test par chapitre, à la convention existante, apportent un cas passant et un cas d'échec ciblé pour chaque étape du périmètre retenu.

**Tech Stack :** TypeScript, Vitest 4.

**Spec :** `docs/superpowers/specs/2026-08-06-couverture-validateurs-design.md`

## Global Constraints

- **Un cas d'échec ne doit jamais être une chaîne vide.** Il doit rater pour la raison précise qu'annonce le message du validateur. Une chaîne vide échoue de toute façon et ne discrimine rien.
- **Ne jamais neutraliser un invariant pour faire passer la suite.** Si l'invariant b échoue, on examine les cas ; on ne le désactive pas.
- **Bug technique net** (regex fausse, condition inversée, message décrivant une autre exigence que celle testée) → corrigé, avec le test qui le prouve. **Choix pédagogique** (« faut-il accepter cette variante ? ») → consigné, **non tranché**.
- **Aucune liste de chapitres codée en dur** dans le balayage : elle se périmerait au premier chapitre ajouté, et un chapitre neuf non testé est exactement ce qu'on veut attraper.
- Commentaires et messages de test en français, comme le reste du dépôt.
- `pnpm lint`, `pnpm typecheck`, `pnpm test:run` verts à chaque commit.

## Chiffres de référence

14 cursus · 48 chapitres · 191 étapes. Répartition : `javascript` 12, `css` 10, `html` 8, `react` 8, et 1 chacun pour `algo`, `devops`, `git`, `mongodb`, `nodejs`, `python`, `security`, `sql`, `tests`, `typescript`. Chaque chapitre a 4 validateurs, sauf `html/chapitre-1` qui en a 3.

## Types utiles

```ts
type Validator = (code: string, context?: ValidatorContext) => ValidationResult;
interface ValidationResult { ok: boolean; msg: string; obj?: string; objList?: string[]; final?: boolean; tone?: ErrorTone }
interface ChapterData { slug: string; tag: string; title: string; subtitle: string; totalXp: number; steps: Step[]; completionBadge: string; completionBadgeLabel: string }
// Step porte notamment : startCode, placeholder, narrator, hint, objectives, spectreTrap?
```

---

## File Structure

| Fichier | Responsabilité |
|---|---|
| `lib/courses-registry.ts` | **Modifié.** Expose `listCourseSlugs()` et `listChapterSlugs(course)`. `getChapterData` inchangé. |
| `lib/validators/index.ts` | **Modifié.** Expose `listValidatorCourses()`, pour confronter les deux registres. |
| `lib/validators/parcours-integrite.test.ts` | **Nouveau.** Le balayage structurel : cohérence des registres, invariants a et b. |
| `lib/validators/css/chapitre-N.test.ts` (N = 1…10) | **Nouveaux.** Cas passants et cas d'échec ciblés, 4 étapes par chapitre. |
| `lib/validators/<cursus>/chapitre-1.test.ts` | **Nouveaux** pour `algo`, `devops`, `git`, `mongodb`, `nodejs`, `python`, `security`, `tests`, `typescript` — étapes 2 à 4. |
| `docs/RAPPORT_VALIDATEURS.md` | **Nouveau.** Les questions pédagogiques rencontrées, non tranchées. |
| `docs/ROADMAP.md` | **Modifié.** CF-18 reformulé, date d'en-tête corrigée. |

---

## Task 1 : Le balayage structurel

**Files:**
- Modify: `lib/courses-registry.ts` (ajouter deux fonctions après `getChapterData`, ligne 85)
- Modify: `lib/validators/index.ts` (ajouter une fonction après `getValidators`, ligne 36)
- Create: `lib/validators/parcours-integrite.test.ts`

**Interfaces:**
- Consumes: `getChapterData(course, chapter): ChapterData | null`, `getValidators(course, chapterSlug): Validator[]` — existants.
- Produces:
  - `listCourseSlugs(): string[]` — slugs de cursus du registre de contenu, dans l'ordre de déclaration.
  - `listChapterSlugs(course: string): string[]` — slugs de chapitre d'un cursus ; `[]` si le cursus est inconnu.
  - `listValidatorCourses(): string[]` — slugs de cursus du registre de validateurs.

- [ ] **Step 1: Écrire le test qui échoue**

Créer `lib/validators/parcours-integrite.test.ts` :

```ts
import { describe, it, expect } from "vitest";

import { getChapterData, listCourseSlugs, listChapterSlugs } from "@/lib/courses-registry";
import { getValidators, listValidatorCourses } from "./index";

/**
 * Balayage structurel du parcours entier.
 *
 * Les tests par chapitre vérifient qu'un validateur dit juste. Celui-ci vérifie
 * qu'il existe, qu'il est branché, et que l'étape qu'il garde n'est pas vide.
 * Aucun cas n'est écrit à la main : tout est dérivé des deux registres, donc un
 * chapitre ajouté demain est couvert sans qu'on touche à ce fichier.
 *
 * Cf. docs/superpowers/specs/2026-08-06-couverture-validateurs-design.md
 */

/**
 * Cursus dont les validateurs jugent une EXÉCUTION, pas un texte : ils lisent
 * `ctx.logs` (javascript) ou `ctx.sql` (sql). Appelés sans contexte, ils
 * échouent pour absence de contexte — pas parce que le startCode est
 * incomplet. L'invariant b serait vert sans rien prouver, on les en exclut.
 *
 * Leur couverture passe par des tests dédiés qui exécutent réellement le code :
 * `javascript/chapitre-1.test.ts`, `sql/chapitre-1.test.ts`.
 */
const CURSUS_RUNTIME = new Set(["javascript", "sql"]);

/** Un couple (cursus, chapitre) par chapitre déclaré au registre de contenu. */
const CHAPITRES = listCourseSlugs().flatMap((course) =>
  listChapterSlugs(course).map((chapter) => ({ course, chapter }))
);

describe("registres de contenu et de validateurs", () => {
  it("déclarent exactement les mêmes cursus", () => {
    expect([...listValidatorCourses()].sort()).toEqual([...listCourseSlugs()].sort());
  });

  it("exposent au moins un chapitre", () => {
    expect(CHAPITRES.length).toBeGreaterThan(0);
  });
});

describe("chaque chapitre est validable", () => {
  describe.each(CHAPITRES)("$course / $chapter", ({ course, chapter }) => {
    it("a autant de validateurs que d'étapes", () => {
      const data = getChapterData(course, chapter);
      expect(data, `${course}/${chapter} absent du registre de contenu`).not.toBeNull();

      const validators = getValidators(course, chapter);

      // Une étape sans validateur est invalidable : l'apprenant reste bloqué
      // sans recours. Un validateur sans étape ne s'exécutera jamais.
      expect(
        validators.length,
        `${course}/${chapter} : ${validators.length} validateur(s) pour ` +
          `${data!.steps.length} étape(s).`
      ).toBe(data!.steps.length);
    });
  });
});

describe("le code de départ ne valide jamais son étape", () => {
  const testables = CHAPITRES.filter(({ course }) => !CURSUS_RUNTIME.has(course));

  describe.each(testables)("$course / $chapter", ({ course, chapter }) => {
    const data = getChapterData(course, chapter)!;
    const validators = getValidators(course, chapter);

    data.steps.forEach((step, i) => {
      it(`étape ${i + 1}`, () => {
        const valider = validators[i];
        expect(valider, `pas de validateur pour l'étape ${i + 1}`).toBeTypeOf("function");

        // Si le startCode passe déjà, l'étape est vide : l'apprenant clique
        // « valider » et réussit sans rien écrire. Rien d'autre ne le signale.
        expect(
          valider(step.startCode).ok,
          `${course}/${chapter} étape ${i + 1} : le code de départ valide déjà. ` +
            `L'apprenant n'a rien à faire.`
        ).toBe(false);
      });
    });
  });
});
```

- [ ] **Step 2: Lancer le test pour vérifier qu'il échoue**

```bash
pnpm exec vitest run lib/validators/parcours-integrite.test.ts
```

Attendu : ÉCHEC au chargement — `listCourseSlugs`, `listChapterSlugs` et `listValidatorCourses` n'existent pas encore.

- [ ] **Step 3: Ajouter les énumérateurs au registre de contenu**

Dans `lib/courses-registry.ts`, après `getChapterData` (fin de fichier) :

```ts
/**
 * Slugs de tous les cursus, dans l'ordre de déclaration du registre.
 *
 * Permet aux tests de parcourir le contenu sans redéclarer une liste qui se
 * périmerait au premier chapitre ajouté.
 */
export function listCourseSlugs(): string[] {
  return Object.keys(REGISTRY);
}

/** Slugs des chapitres d'un cursus, dans l'ordre. Vide si le cursus est inconnu. */
export function listChapterSlugs(course: string): string[] {
  return Object.keys(REGISTRY[course] ?? {});
}
```

- [ ] **Step 4: Ajouter l'énumérateur au registre de validateurs**

Dans `lib/validators/index.ts`, après `getValidators` (fin de fichier) :

```ts
/**
 * Slugs des cursus ayant des validateurs.
 *
 * `getValidators` renvoie `[]` aussi bien pour un cursus absent que pour un
 * chapitre inconnu : sans cette fonction, les deux cas sont indistinguables.
 */
export function listValidatorCourses(): string[] {
  return Object.keys(REGISTRY);
}
```

- [ ] **Step 5: Lancer le test**

```bash
pnpm exec vitest run lib/validators/parcours-integrite.test.ts
```

Attendu : le fichier se charge. Les tests de cohérence des registres et l'invariant a devraient passer.

**L'invariant b peut produire des échecs — c'est le but du balayage.** Ne rien corriger à l'aveugle : passer au Step 6.

- [ ] **Step 6: Trier les échecs de l'invariant b**

Pour chaque échec, ouvrir le `startCode` de l'étape (`data/courses/<cursus>/<chapitre>.ts`) et le comparer à ce que le validateur exige. Trois issues, et trois seulement :

1. **L'étape est réellement vide** — le code de départ satisfait déjà l'objectif. C'est un bug de contenu : le noter dans `docs/RAPPORT_VALIDATEURS.md`, ne pas modifier le contenu du cours (c'est un choix pédagogique).
2. **Le validateur est trop laxiste** — il accepte un code qui ne remplit pas l'objectif annoncé. Bug technique : corriger le validateur, et ajouter le cas dans le fichier de test du chapitre concerné.
3. **L'étape est légitimement passante** — étape « observe puis valide », ou `spectreTrap` dont le code corrompu satisfait quand même le validateur. Ajouter le couple à une liste d'exceptions **nommée et commentée une par une**, jamais un `skip` global.

Si une liste d'exceptions devient nécessaire, l'ajouter ainsi en tête de fichier :

```ts
/**
 * Étapes dont le code de départ valide légitimement.
 * Une ligne par cas, avec la raison — pas de skip en bloc.
 */
const DEPART_VALIDE_LEGITIMEMENT = new Set<string>([
  // "cursus/chapitre#étape", raison
]);
```

et l'appliquer par `if (DEPART_VALIDE_LEGITIMEMENT.has(`${course}/${chapter}#${i + 1}`)) return;` en tête du `it`.

**Si plus de dix étapes échouent**, s'arrêter et signaler : c'est probablement l'invariant qui est mal posé, pas le contenu qui est cassé à ce point. Ne pas passer les dix suivantes en exception.

- [ ] **Step 7: Vérifier la suite complète**

```bash
pnpm lint && pnpm typecheck && pnpm test:run
```

Attendu : les trois verts. Le nombre de tests augmente d'environ **189** : 48 pour l'invariant a, 139 pour l'invariant b, 2 de cohérence des registres.

Le détail des 139, si le compte tombe à côté : `html` 31 (le chapitre 1 n'a que 3 étapes), `css` 40, `react` 32, et 36 pour les neuf cursus mono-chapitre hors `sql`. `javascript` et `sql` sont exclus.

- [ ] **Step 8: Commit**

```bash
git add lib/courses-registry.ts lib/validators/index.ts lib/validators/parcours-integrite.test.ts docs/RAPPORT_VALIDATEURS.md
git commit -m "test(validateurs): un balayage structurel couvre les 191 etapes"
```

---

## Task 2 : `css`, chapitres 1 à 5

**Files:**
- Create: `lib/validators/css/chapitre-1.test.ts` … `chapitre-5.test.ts`

**Interfaces:**
- Consumes: `validators` exporté par chaque `lib/validators/css/chapitre-N.ts`.
- Produces: rien qu'une tâche ultérieure consomme.

**Méthode, à appliquer étape par étape.** Pour chaque étape N d'un chapitre :

1. Ouvrir `data/courses/css/chapitre-N.ts` et lire le `hint` de l'étape. Dans ce cursus les hints sont des solutions littérales — par exemple `"Dans le <style>, ajoute : .alert { color: red; }"`.
2. **Cas passant** : le `startCode` de l'étape, dans lequel on insère ce que le hint demande.
3. **Cas d'échec** : le même code, avec la seule exigence de l'étape retirée ou fautive. Il doit rater précisément là — jamais une chaîne vide.
4. Vérifier que le message d'échec du validateur décrit bien ce qui manque. S'il décrit autre chose, c'est un bug technique : corriger.

**Ce plan ne recopie pas les 40 cas.** Le chapitre 2 ci-dessous est intégralement écrit et sert de gabarit ; les neuf autres suivent la même méthode avec leur propre contenu. Les recopier ici n'ajouterait aucune information et rendrait le plan illisible.

- [ ] **Step 1: Écrire le gabarit — `css/chapitre-2.test.ts`**

Les quatre étapes du chapitre 2 sont : `.alert { color }`, `#status { color }`, `h1 { color: hex|rgb }`, puis `h1 { text-align }` **et** `.alert { font-weight }`.

```ts
import { describe, it, expect } from "vitest";
import { validators } from "./chapitre-2";

/** Enveloppe le CSS donné dans une page complète, comme le startCode du cours. */
function page(css: string): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <style>
      body { background-color: #03060d; color: white; }
      ${css}
    </style>
  </head>
  <body>
    <h1>Statut equipage</h1>
    <p class="alert">Alerte : pression instable</p>
  </body>
</html>`;
}

describe("CSS chapitre 2 — étape 1 (sélecteur de classe)", () => {
  const valider = validators[0];

  it("accepte une règle .alert { color }", () => {
    expect(valider(page(".alert { color: red; }")).ok).toBe(true);
  });

  it("refuse une règle qui cible la balise au lieu de la classe", () => {
    // Échec ciblé : il y a bien un color sur un <p>, mais pas sur .alert.
    expect(valider(page("p { color: red; }")).ok).toBe(false);
  });

  it("refuse un document sans balise <style>", () => {
    expect(valider("<html><body><h1>x</h1></body></html>").ok).toBe(false);
  });
});

describe("CSS chapitre 2 — étape 2 (sélecteur d'id)", () => {
  const valider = validators[1];

  it("accepte une règle #status { color }", () => {
    expect(valider(page("#status { color: cyan; }")).ok).toBe(true);
  });

  it("refuse une classe .status à la place de l'id", () => {
    expect(valider(page(".status { color: cyan; }")).ok).toBe(false);
  });
});

describe("CSS chapitre 2 — étape 3 (couleur hex ou rgb)", () => {
  const valider = validators[2];

  it("accepte un hexadécimal à six chiffres", () => {
    expect(valider(page("h1 { color: #ff6b2c; }")).ok).toBe(true);
  });

  it("accepte la notation rgb()", () => {
    expect(valider(page("h1 { color: rgb(255, 107, 44); }")).ok).toBe(true);
  });

  it("refuse un nom de couleur, qui n'est ni hex ni rgb", () => {
    expect(valider(page("h1 { color: orange; }")).ok).toBe(false);
  });

  it("refuse un canal rgb hors bornes", () => {
    expect(valider(page("h1 { color: rgb(300, 0, 0); }")).ok).toBe(false);
  });
});

describe("CSS chapitre 2 — étape 4 (typographie sur deux sélecteurs)", () => {
  const valider = validators[3];

  it("accepte text-align sur h1 et font-weight sur .alert", () => {
    expect(
      valider(page("h1 { text-align: center; } .alert { font-weight: bold; }")).ok
    ).toBe(true);
  });

  it("refuse quand seul text-align est posé", () => {
    expect(valider(page("h1 { text-align: center; }")).ok).toBe(false);
  });

  it("refuse quand seul font-weight est posé", () => {
    expect(valider(page(".alert { font-weight: bold; }")).ok).toBe(false);
  });
});
```

- [ ] **Step 2: Lancer le gabarit**

```bash
pnpm exec vitest run lib/validators/css/chapitre-2.test.ts
```

Attendu : PASS. Tout échec ici se trie selon la Partie 3 (bug technique → corriger ; choix pédagogique → consigner dans `docs/RAPPORT_VALIDATEURS.md`).

- [ ] **Step 3: Écrire les chapitres 1, 3, 4 et 5 sur le même modèle**

Un fichier par chapitre, la méthode ci-dessus appliquée à leur contenu propre. Lire `data/courses/css/chapitre-N.ts` pour les hints et `lib/validators/css/chapitre-N.ts` pour ce qui est réellement exigé.

- [ ] **Step 4: Lancer le lot**

```bash
pnpm exec vitest run lib/validators/css/
```

Attendu : PASS sur les cinq fichiers.

- [ ] **Step 5: Vérifier la suite complète**

```bash
pnpm lint && pnpm typecheck && pnpm test:run
```

Attendu : les trois verts.

- [ ] **Step 6: Commit**

```bash
git add lib/validators/css/ docs/RAPPORT_VALIDATEURS.md
git commit -m "test(css): les etapes des chapitres 1 a 5 sont exercees"
```

---

## Task 3 : `css`, chapitres 6 à 10

**Files:**
- Create: `lib/validators/css/chapitre-6.test.ts` … `chapitre-10.test.ts`

**Interfaces:**
- Consumes: `validators` exporté par chaque `lib/validators/css/chapitre-N.ts`. Gabarit : `lib/validators/css/chapitre-2.test.ts` (Task 2).
- Produces: rien.

- [ ] **Step 1: Écrire les cinq fichiers**

Même méthode qu'en Task 2 : pour chaque étape, lire le `hint` dans `data/courses/css/chapitre-N.ts`, en tirer le cas passant, puis construire un cas d'échec qui rate sur la seule exigence de l'étape.

Rappel de la contrainte : **le cas d'échec n'est jamais une chaîne vide.**

- [ ] **Step 2: Lancer le lot**

```bash
pnpm exec vitest run lib/validators/css/
```

Attendu : PASS sur les dix fichiers du cursus.

- [ ] **Step 3: Vérifier la suite complète**

```bash
pnpm lint && pnpm typecheck && pnpm test:run
```

Attendu : les trois verts.

- [ ] **Step 4: Commit**

```bash
git add lib/validators/css/ docs/RAPPORT_VALIDATEURS.md
git commit -m "test(css): le cursus est couvert de bout en bout"
```

---

## Task 4 : Les neuf cursus mono-chapitre, étapes 2 à 4

**Files:**
- Create: `lib/validators/algo/chapitre-1.test.ts`
- Create: `lib/validators/devops/chapitre-1.test.ts`
- Create: `lib/validators/git/chapitre-1.test.ts`
- Create: `lib/validators/mongodb/chapitre-1.test.ts`
- Create: `lib/validators/nodejs/chapitre-1.test.ts`
- Create: `lib/validators/python/chapitre-1.test.ts`
- Create: `lib/validators/security/chapitre-1.test.ts`
- Create: `lib/validators/tests/chapitre-1.test.ts`
- Create: `lib/validators/typescript/chapitre-1.test.ts`

**Interfaces:**
- Consumes: `validators` exporté par chaque `lib/validators/<cursus>/chapitre-1.ts`. Gabarit : `lib/validators/css/chapitre-2.test.ts` (Task 2).
- Produces: rien.

**Portée exacte :** les étapes **2, 3 et 4** seulement. L'étape 1 de ces neuf cursus est déjà couverte par `lib/validators/all-chapter-1.test.ts` (cas passant + cas vide). `sql` est hors périmètre : `sql/chapitre-1.test.ts` couvre déjà ses quatre étapes.

- [ ] **Step 1: Écrire les neuf fichiers**

Un fichier par cursus, trois `describe` chacun (étapes 2, 3, 4), un cas passant et au moins un cas d'échec ciblé par étape.

Attention aux cursus dont les validateurs jugent du texte et non une exécution — c'est le cas des neuf : ils analysent la chaîne soumise. Le cas passant est donc du code écrit, pas un contexte d'exécution.

- [ ] **Step 2: Lancer le lot**

```bash
pnpm exec vitest run lib/validators/
```

Attendu : PASS sur l'ensemble du dossier.

- [ ] **Step 3: Vérifier la suite complète**

```bash
pnpm lint && pnpm typecheck && pnpm test:run
```

Attendu : les trois verts.

- [ ] **Step 4: Commit**

```bash
git add lib/validators/ docs/RAPPORT_VALIDATEURS.md
git commit -m "test(validateurs): les etapes 2 a 4 des cursus mono-chapitre"
```

---

## Task 5 : Corriger CF-18 et publier le rapport

**Files:**
- Modify: `docs/ROADMAP.md` — l'en-tête « État au 2026-08-05 » et le ticket CF-18
- Modify: `docs/RAPPORT_VALIDATEURS.md` — mise au propre

**Interfaces:**
- Consumes: les constats accumulés en Tasks 1 à 4.
- Produces: rien.

- [ ] **Step 1: Corriger la date de l'en-tête**

Dans `docs/ROADMAP.md`, remplacer `## État au 2026-08-05` par `## État au 2026-08-06`.

- [ ] **Step 2: Reformuler CF-18**

Le texte actuel affirme que dix cursus n'ont « aucun test ». C'est faux : `all-chapter-1.test.ts` couvre les quatorze. Remplacer le corps du ticket par :

```markdown
### CF-18 · Élargir la couverture de tests des validateurs
**P2 · L · Tests**

`all-chapter-1.test.ts` couvre les 14 cursus — mais uniquement `validators[0]`
du chapitre 1. **Les étapes 2 à 4, soit les trois quarts du travail de
l'apprenant, n'étaient exercées nulle part.**

Un validateur faux ne casse rien de visible : il refuse une bonne réponse, ou
en accepte une mauvaise. Ni la CI ni le monitoring ne le voient — seul
l'apprenant en subit les conséquences, et il conclut que c'est lui qui se trompe.

Couvert depuis le 2026-08-06 : le balayage structurel
(`lib/validators/parcours-integrite.test.ts`, 191 étapes), le cursus `css`
en entier, et les étapes 2 à 4 des neuf cursus mono-chapitre.

**Acceptation**
- [x] Chaque cursus a ≥ 1 test de validateur (cas passant + échec) — `all-chapter-1.test.ts`
- [x] Chaque étape a un validateur, et son code de départ ne la valide pas — balayage structurel
- [x] `css` : les 10 chapitres, 4 étapes chacun
- [x] Les 9 cursus mono-chapitre : étapes 2 à 4
- [ ] `html`, `javascript`, `react` : étapes 2 à 4 au-delà des tests existants — **passe suivante**
```

Ajuster les cases cochées à ce qui a réellement été livré. Ne cocher que ce que le dépôt prouve.

- [ ] **Step 3: Mettre à jour le tableau « Reste à faire » de l'en-tête**

La ligne `**CF-18** | 4 cursus sur 14 ont un test de validateur. Le plus concret.` est fausse. La remplacer par l'état réel après ce chantier : ce qui reste est la couverture des étapes 2 à 4 de `html`, `javascript` et `react`.

- [ ] **Step 4: Mettre le rapport au propre**

`docs/RAPPORT_VALIDATEURS.md` doit lister, pour chaque question pédagogique rencontrée : le cursus, le chapitre, l'étape, ce que le validateur exige aujourd'hui, la variante qu'il refuse, et pourquoi c'est un arbitrage et non un bug. Aucune recommandation tranchée.

Si aucune question n'a été rencontrée, le dire explicitement plutôt que de laisser un fichier vide.

- [ ] **Step 5: Vérifier**

```bash
pnpm lint && pnpm typecheck && pnpm test:run
```

Attendu : les trois verts.

- [ ] **Step 6: Commit**

```bash
git add docs/ROADMAP.md docs/RAPPORT_VALIDATEURS.md
git commit -m "docs(roadmap): CF-18 dit enfin ou etait le trou"
```

---

## Critères d'acceptation

- [ ] `listCourseSlugs`, `listChapterSlugs` et `listValidatorCourses` existent ; `getChapterData` et `getValidators` sont inchangés.
- [ ] Le balayage ne contient aucune liste de chapitres codée en dur.
- [ ] Les deux registres déclarent les mêmes cursus.
- [ ] Invariant a vert sur les 48 chapitres.
- [ ] Invariant b vert hors `javascript` et `sql`, toute exception étant nommée et justifiée ligne par ligne.
- [ ] `css` : 10 fichiers de test, 4 étapes chacun, un cas passant et un cas d'échec ciblé par étape.
- [ ] Les 9 cursus mono-chapitre ont leurs étapes 2 à 4 couvertes.
- [ ] Aucun cas d'échec n'est une chaîne vide.
- [ ] Tout bug technique trouvé est corrigé et couvert par un test.
- [ ] Les questions pédagogiques sont dans `docs/RAPPORT_VALIDATEURS.md`, non tranchées.
- [ ] CF-18 et la date d'en-tête corrigés dans `docs/ROADMAP.md`.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test:run` verts.

## Hors périmètre

- Les étapes 2 à 4 de `html` (8 ch.), `javascript` (12 ch.) et `react` (8 ch.) au-delà de leurs tests actuels.
- **Ajouter un champ `solution` à `Step`.** Ça rendrait les cas passants dérivables automatiquement et supprimerait l'essentiel du travail manuel — mais c'est une modification du modèle de données de tout le contenu, pas un travail de test. À trancher avant d'attaquer `javascript` et ses 48 étapes, sinon on écrira à la main ce qu'on aurait pu générer.
