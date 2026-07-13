# Spec — Le Spectre en étapes-pièges (tâche 6B)

> Rédigé le 2026-07-13. Sous-projet 6B de l'arc méta : donner enfin un rôle *jouable*
> au Spectre — il corrompt le code d'une étape, le Cadet doit le réparer. Mécanique
> légère et additive : un champ optionnel + une branche de présentation + du contenu
> pilote. Complète 6A (barre « recul du Null »).
> Source : [analyse_coherence_modules.md](../../analyse_coherence_modules.md) (tâche 6).
> Décisions validées avec l'utilisateur (§2).

## 1. Objectif

Transformer une étape « écris X » en « le Spectre a corrompu X — répare-le » : le
`startCode` contient une vraie erreur, l'étape se présente aux couleurs du Spectre, et
un bref beat de combat marque son irruption. Le Spectre passe du simple railleur
(sur échec) à un **antagoniste présent dans le parcours**.

## 2. Décisions validées

- **Insertion** : **convertir une étape existante** (pas d'ajout) — aucun changement de
  `totalSteps` ni de la carte des niveaux.
- **Portée** : **1 étape-piège par cursus complet** (HTML, CSS, JS) = 3 pièges pilotes.
- **Présentation** : boîte d'intro reskinée Spectre (violet) **+ flourish de combat** au
  chargement (le beat ennemi « fly »).

## 3. Architecture

### 3.1 Marqueur — `data/courses/html/types.ts`
Ajouter un champ optionnel à `Step` :
```ts
  /**
   * Étape-piège : Le Spectre a corrompu le `startCode`, à réparer. La valeur est
   * sa raillerie, affichée à la place de la boîte narrateur. Rétrocompatible
   * (absent = étape normale).
   */
  spectreTrap?: string;
```

### 3.2 Présentation Spectre — `app/learn/[course]/[chapter]/ChapterClient.tsx`
La boîte d'intro actuelle (bordure cyan + en-tête `CHARACTERS.kira` + `step.narrator`,
~lignes 314-321) devient conditionnelle : si `step.spectreTrap` est défini, rendre à la
place une boîte **Spectre** — bordure/texte `nebula-spectre`, en-tête
`CHARACTERS.spectre` (👾 « Le Spectre »), et `step.spectreTrap` comme texte. Sinon,
rendu inchangé (Kira + narrateur). Réutilise le casting existant ([lib/characters.ts](../../../lib/characters.ts))
et le token `--spectre` (déjà en place).

### 3.3 Flourish de combat — `components/lesson/ChapterWorkspace.tsx`
Le composant est remonté par étape (clé) et pilote déjà `enemyState` (fly/explode/none)
+ le `CombatVisualizer`. Au **montage**, si `step.spectreTrap` est défini : jouer une
fois le beat ennemi (`setEnemyState({ type: "fly", trigger: 1 })`) et `playBreach()`
(le Spectre fond sur la console). `playBreach` respecte déjà la préférence son ; le
`CombatVisualizer` gère déjà `prefers-reduced-motion`. Effet de montage uniquement
(pas rejoué à chaque rendu).

### 3.4 Contenu — 3 étapes converties (1 par cursus)
Pour chaque étape choisie : corrompre son `startCode` (une **erreur unique et nette** :
faute de frappe sur une balise / propriété / mot-clé), poser `spectreTrap` (raillerie),
et ajuster le `narrator`/`objectives` en registre « réparer ». **Critère de choix** : une
étape dont le **validateur existant passe une fois la corruption réparée** (réparer =
atteindre l'objectif) — à vérifier au plan pour chaque étape. Le validateur n'est pas
réécrit ; il valide déjà le résultat correct.

### 3.5 Verrou d'intégrité — `lib/spectre-trap.test.ts`
Test Vitest (node) : les 3 étapes désignées (course/chapter/stepIndex) portent bien un
`spectreTrap` non vide, via `getChapterData`. Empêche une régression silencieuse.

## 4. Fichiers touchés

| Fichier | Nature |
|---|---|
| `data/courses/html/types.ts` | modif — champ `spectreTrap?` sur `Step` |
| `app/learn/[course]/[chapter]/ChapterClient.tsx` | modif — boîte d'intro Spectre conditionnelle |
| `components/lesson/ChapterWorkspace.tsx` | modif — flourish « fly » + `playBreach` au montage d'un piège |
| `data/courses/{html,css,javascript}/chapitre-N.ts` (×3) | modif — étapes converties en pièges |
| `lib/spectre-trap.test.ts` | nouveau — test d'intégrité des 3 pièges |

## 5. Tests
- **Unitaire (Vitest, node)** : intégrité — les 3 étapes désignées ont `spectreTrap` non vide.
- **Composant** : pas de test de rendu (client) → vérif `tsc`/`eslint`/`next build`.
- **Visuel (navigateur)** : sur chaque étape-piège, la boîte d'intro est violette (Spectre),
  le beat « fly » se joue à l'ouverture, et **réparer la corruption fait passer l'étape**
  (le validateur valide). Vérifier reduced-motion.

## 6. Critères d'acceptation
- [ ] `Step.spectreTrap?` ajouté (rétrocompatible, étapes normales inchangées).
- [ ] Une étape-piège affiche la boîte Spectre (violet, 👾, raillerie) au lieu de Kira/narrateur.
- [ ] Le beat « fly » + `playBreach` se jouent au chargement d'une étape-piège (respecte reduced-motion & pref son).
- [ ] 3 étapes converties (HTML/CSS/JS) : `startCode` corrompu, réparable, validateur passant une fois réparé.
- [ ] Test d'intégrité vert ; `tsc`/`lint`/tests verts ; `next build` OK.

## 7. Hors périmètre
Généraliser au-delà des 3 pilotes ; nouveau type d'étape ou nouveau flux de validation ;
sprites/animations dédiés au Spectre ; injection de corruption *dynamique* (à l'exécution).
La barre « recul du Null » (6A) est déjà livrée. La tâche 7 (docRefs CSS/JS) reste distincte.
