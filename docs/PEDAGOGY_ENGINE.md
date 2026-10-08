# Rapport technique — Moteur pédagogique (validateurs)

**Projet :** La Forge du Code / Nebula Command
**Périmètre :** validation des exercices, calcul de la progression et de l'XP
**Date :** 2026-06-17

> **Mise à jour (septembre 2026).** Ce rapport décrit l'état du 2026-06-17. Depuis :
>
> - chaque étape du parcours est couverte par des tests de validateurs (ticket CF-18, voir [RAPPORT_VALIDATEURS.md](RAPPORT_VALIDATEURS.md)) ;
> - le serveur rejoue le validateur avant d'accorder une étape, et vérifie l'ordre de progression ([EXE-01](audit-securite/corrections/EXE-01.md)) ;
> - le cursus SQL exécute les requêtes avec sql.js dans le navigateur ([EXE-07](audit-securite/corrections/EXE-07.md)) ;
> - les aperçus ne passent plus par `srcdoc` : ils sont servis depuis l'origine dédiée du bac à sable ([EXE-03](audit-securite/corrections/EXE-03.md)).

---

## 1. Rôle

Le moteur pédagogique est le **cœur métier** de la plateforme : c'est lui qui décide si l'exercice d'une étape est réussi, affiche un message d'aide ciblé en cas d'échec, et déclenche la progression (objectifs validés, XP, badge de fin de chapitre). Sans lui, l'app ne serait qu'un éditeur de code ; c'est la validation qui transforme la saisie en apprentissage mesuré.

---

## 2. Structure des données

L'unité de base est l'**étape** (`Step`). Un **chapitre** (`ChapterData`) est une suite d'étapes ; chaque étape porte un `startCode`, un énoncé (`briefing`), des `objectives` (objectifs à valider) et des métadonnées d'affichage.

À chaque étape correspond **un validateur**. L'organisation est strictement parallèle au contenu :

```
data/courses/<cours>/chapitre-N.ts     → contenu (steps, objectives…)
lib/validators/<cours>/chapitre-N.ts   → un Validator par step (même ordre)
```

### Le registre

```
lib/validators/<cours>/index.ts  → VALIDATORS_BY_CHAPTER : { "chapitre-1": Validator[], ... }
lib/validators/index.ts          → REGISTRY : { html, css, javascript, react, ... }
getValidators(course, chapterSlug) → Validator[]
```

`getValidators()` renvoie le tableau de validateurs d'un chapitre ; côté UI, `validators[currentStep]` sélectionne celui de l'étape courante. Un **repli défensif** est prévu : si un validateur manque, l'étape renvoie « Validateur manquant pour cette étape » plutôt que de planter.

---

## 3. Le contrat `Validator`

```ts
type Validator = (code: string, context?: ValidatorContext) => ValidationResult;

interface ValidatorContext {  // fourni uniquement pour les cursus exécutés (JS)
  logs: string[];             // sortie console capturée par le sandbox
  error: string | null;       // erreur d'exécution éventuelle
  lastValue: unknown;         // valeur de la dernière expression
}

interface ValidationResult {
  ok: boolean;
  msg: string;                // message affiché (succès ou aide en cas d'échec)
  objList?: string[];         // ids des objectifs validés par cette étape
  final?: boolean;            // true sur la dernière étape → fin de chapitre
}
```

Un validateur est une **fonction pure** : à partir du code (et éventuellement de la sortie d'exécution), il renvoie un verdict et un message. Cette simplicité rend chaque validateur facile à lire, à tester unitairement et à faire évoluer.

---

## 4. Deux familles de validation

### 4.1 Validateurs *exécutés* (JavaScript)

Le code est d'abord lancé dans le **sandbox** (`runJs`, cf. rapport dédié), puis le validateur reçoit la sortie réelle via `context`. Il combine alors :

- une **vérification d'erreur d'exécution** (`context.error`) en premier ;
- une analyse du **source** (présence de `let`, `const`, d'un template literal…) ;
- une analyse de la **sortie** (`context.logs`) — par ex. « la console doit afficher exactement *Bonjour, station Nebula* ».

C'est une validation **comportementale** : on vérifie ce que le code *fait*, pas seulement ce qu'il contient. Helpers dans `lib/validators/javascript/_utils.ts` (`hasConsoleLog`, `hasKeyword`, `logsInclude`, `stripComments`).

### 4.2 Validateurs *statiques* (HTML/CSS, Git, SQL, Python, React, TS, Node…)

Aucune exécution : la validation **lit le code source** par motifs (regex). Helpers dans `lib/validators/_static-utils.ts` :

- `stripLineComments(code, marker)` — retire les commentaires **de ligne entière** (`//`, `#`, `--`) afin que les commentaires d'instruction en français livrés dans le `startCode` ne déclenchent pas de faux positifs (les commentaires en fin de ligne sont préservés pour ne pas casser une URL `https://…`) ;
- `countMatches(code, re)` — compte les occurrences d'un motif ;
- `pass()` / `fail()` — construisent un `ValidationResult` normalisé.

Pour HTML/CSS, le code alimente aussi une **iframe d'aperçu** isolée (rendu visuel), mais le verdict reste 100 % statique.

---

## 5. Validation incrémentale et messages ciblés

La force pédagogique tient à la **gradation des vérifications** : un validateur teste les conditions dans l'ordre et renvoie, au premier échec, le **message d'aide le plus précis possible**. Exemple, JavaScript chapitre 1 :

1. Étape 1 — `console.log` affichant exactement un texte donné.
2. Étape 2 — déclarer avec `let`, **puis** loguer cette variable précise (le validateur extrait le nom de variable déclaré et vérifie qu'il est bien passé à `console.log`).
3. Étape 3 — utiliser `const` et afficher **trois types primitifs** distincts (booléen, nombre, chaîne) détectés dans la sortie.
4. Étape 4 — un **template literal** interpolant au moins deux variables, avec un contenu attendu (`final: true`).

Chaque échec produit un message actionnable (« Affiche la variable `x` avec `console.log(x)` ») plutôt qu'un simple « faux ». C'est ce qui distingue un correcteur d'un véritable guide d'apprentissage.

---

## 6. De la validation à la progression

Le déroulé d'une soumission (`ChapterWorkspace.runCode`) :

1. **JS** : `runJs(code)` → on remplit la console affichée, puis `validate(code, { logs, error, lastValue })`.
   **HTML/CSS** : on met à jour l'aperçu (`iframe.srcdoc = code`), puis `validate(code)`.
2. Si `result.ok` :
   - feedback de succès + effets (son, animation) ;
   - les `objList` marquent les **objectifs** de l'étape comme atteints ;
   - l'étape est enregistrée comme complétée (persistance `StepCompletion`).
3. Sinon : feedback d'échec avec `result.msg`.

### Calcul de l'XP

L'XP est dérivée d'une **formule unique** (`lib/xp.ts`) :

```ts
xpForStep(objectivesCount) = 25 + objectivesCount * 8
```

L'XP d'un chapitre est la somme sur les étapes complétées ; l'XP **maximale** est recalculée par la même formule. Détail important : le champ `totalXp` codé en dur dans les fichiers de données a divergé de la réalité, donc **il n'est jamais affiché** — la formule est l'unique source de vérité. La dernière étape (`final: true`) marque la fin du chapitre et l'attribution du **badge** correspondant.

---

## 7. Forces et limites

**Forces**

- Architecture **parallèle et prévisible** (contenu ↔ validateur, même chemin, même ordre).
- Validateurs = **fonctions pures**, donc testables unitairement (toutes les étapes sont couvertes, voir [RAPPORT_VALIDATEURS.md](RAPPORT_VALIDATEURS.md)).
- Messages d'erreur **pédagogiques et progressifs**.
- Séparation nette **exécuté vs statique** qui minimise la surface d'exécution.

**Limites**

- La validation statique repose sur des **regex**, contournables par un apprenant déterminé (limite pédagogique, pas de sécurité).
- **Couverture inégale** : 4 cursus réellement étoffés (JS, CSS, HTML, React), 10 cursus à 1 chapitre — donc peu de validateurs pour ces derniers.

---

## 8. Fichiers de référence

| Fichier | Rôle |
|---|---|
| `lib/validators/index.ts` | Registre global `course → chapitres → Validator[]`, `getValidators()` |
| `lib/validators/<cours>/index.ts` | `VALIDATORS_BY_CHAPTER` d'un cursus |
| `lib/validators/<cours>/chapitre-N.ts` | Un validateur par étape |
| `lib/validators/_static-utils.ts` | Helpers de validation statique |
| `lib/validators/javascript/_utils.ts` | Helpers de validation exécutée (JS) |
| `data/courses/<cours>/types.ts` | Types `Step`, `ChapterData`, `Validator`, `ValidationResult` |
| `components/lesson/ChapterWorkspace.tsx` | Pipeline exécution → validation → feedback |
| `lib/xp.ts` | Formule d'XP (source de vérité) |
