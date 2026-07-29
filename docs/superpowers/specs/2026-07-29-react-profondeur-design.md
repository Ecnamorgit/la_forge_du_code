# Profondeur du cursus React — Design

**Date** : 2026-07-29
**Statut** : validé (carte blanche accordée par Joan pour exécution autonome)

## Objectif

Porter le cursus React de **4 à 8 chapitres**, à parité avec HTML, pour qu'un
débutant puisse aller de zéro à « je sais construire une vraie interface
React » sans buter sur un cursus qui s'arrête au milieu.

C'est le chantier 2 identifié après « Le premier contact ». Le tunnel
d'acquisition est ouvert et mesuré ; il s'agit maintenant d'avoir de la
profondeur derrière la porte.

## Décisions actées

| Sujet | Décision |
|---|---|
| Moteur de validation | **Statique** (regex sur le source), comme les 4 chapitres existants |
| Ampleur | React 4 → **8 chapitres**. JavaScript reste à 12, inchangé |
| Contenu | Carte blanche, en calquant les conventions existantes |
| Fiches docRefs | **Aucune** sur les nouveaux chapitres (voir ci-dessous) |
| Étapes-pièges Spectre | **Une seule**, chapitre 6 |
| Runtime React | Hors périmètre, consigné comme chantier séparé |

## Ce que couvrent déjà les 4 chapitres

Vérifié dans `data/courses/react/` avant de planifier — une première liste de
sujets envisagée plaçait useEffect en nouveauté, alors qu'il est déjà le
chapitre 3.

| # | Titre | Étapes |
|---|---|---|
| 1 | REACT & COMPOSANTS | composant, props, rendu conditionnel, composition |
| 2 | REACT & useState | useState, mise à jour, immutabilité des objets, state lifting |
| 3 | REACT & useEffect | useEffect, dépendances, cleanup, fetch |
| 4 | REACT ROUTER & NAVIGATION | BrowserRouter, Link, routes dynamiques, useNavigate |

## Les 4 nouveaux chapitres

| # | Titre | Mission | Badge | Étapes |
|---|---|---|---|---|
| 5 | REACT & LISTES | FLOTTE DYNAMIQUE | `react-fleet` — Cartographe de Flotte | `.map()`, la prop `key`, filtrer avant de rendre, liste vide |
| 6 | REACT & FORMULAIRES | CONSOLE DE COMMANDE | `react-forms` — Opérateur de Console | input contrôlé **(piège Spectre)**, objet d'état multi-champs, `preventDefault`, validation |
| 7 | HOOKS PERSONNALISÉS | MODULES RÉUTILISABLES | `react-hooks` — Forgeron de Hooks | extraire en `useXxx`, hook avec état, hook avec effet, règles des hooks |
| 8 | CONTEXTE & useReducer | RÉSEAU DE COMMANDEMENT | `react-context` — Coordinateur de Flotte | `createContext` + Provider, `useContext`, `useReducer`, combiner les deux |

**La progression est délibérée** : les listes sont le prérequis de tout écran
réel ; les formulaires ajoutent l'interaction ; les hooks personnalisés
supposent d'avoir écrit assez de logique pour vouloir l'extraire ; le contexte
répond au prop drilling que le state lifting du chapitre 2 finit par créer.

**Contrainte de numérotation.** Les listes et clés relèvent pédagogiquement
d'avant React Router. Elles sont pourtant ajoutées en chapitre 5, car les clés
de progression en base sont `react/chapitre-N` (`StepCompletion`) : renuméroter
les chapitres existants corromprait la progression des comptes actuels. La
dette pédagogique est assumée et documentée plutôt que payée par une perte de
données.

## Conventions à respecter

Un nouveau chapitre doit être **indiscernable** des quatre existants.

- 4 étapes, `totalXp: 280`, réparti 65 / 70 / 70 / 75
- Chaque étape : `startCode`, `placeholder`, `narrator`, `hint`,
  `briefing { title, content }` en markdown, `objectives` (2 par étape, ids
  `oNa`/`oNb`), métadonnées `mission*` et `banner*`
- Ton du narrateur : univers Nebula Command, tutoiement du Cadet, vocabulaire
  spatial. Le cadre narratif React est « Station de Réplication
  Multiplicative » (`docs/scenario_espace.md:127`)
- Texte **sans accents** dans les chaînes de données de cours, comme
  l'existant (`Decouvre`, `reactivite`) — cohérence typographique du rendu
  pixel
- Validateurs statiques via `lib/validators/_static-utils` : `stripLineComments`,
  `countMatches`, `fail`, `pass`
- Le nom canonique de la menace est **Spectre**, jamais « Null » ni « Glitch »

### Pourquoi pas de fiches docRefs

Les 4 chapitres React existants n'en ont aucune, et `data/docs/` ne couvre que
les domaines `css`, `html` et `js`. Créer un domaine React fut un chantier
dédié pour CSS (spec « tâche 7A », 10 fiches) et pour JS (« tâche 7B », 12
fiches). Ce serait une tâche 7C avec sa propre spec, son registre et son test
d'intégrité — pas un ajout silencieux dans un chantier de contenu.

Conséquence assumée : les nouveaux chapitres n'ouvrent pas le panneau de
référence, exactement comme les quatre premiers.

### Pourquoi une seule étape-piège

La mécanique `spectreTrap` est au stade pilote : exactement une étape par
cursus la porte aujourd'hui (`html/chapitre-2`, `css/chapitre-4`,
`javascript/chapitre-1`), toujours la première étape du chapitre. React n'en a
aucune. On en ajoute **une**, au chapitre 6 étape 1, pour respecter cette
densité.

Le sujet choisi est l'**input non contrôlé** : le `startCode` porte un
`value={...}` sans `onChange`, donc un champ qui refuse la saisie. C'est le bug
React le plus classique chez un débutant, et le symptôme est immédiatement
visible — ce qui en fait un bon piège.

`lib/spectre-trap.test.ts` liste les pièges en dur ; l'entrée
`["react", "chapitre-6", 0]` doit y être ajoutée.

## Câblage — 7 fichiers au-delà du chapitre

Chaque nouveau chapitre `N` touche :

| Fichier | Modification |
|---|---|
| `data/courses/react/chapitre-N.ts` | **créé** — export `chapitreN: ChapterData` |
| `lib/validators/react/chapitre-N.ts` | **créé** — export `validators: Validator[]`, un par étape |
| `lib/validators/react/index.ts` | entrée dans `VALIDATORS_BY_CHAPTER` |
| `lib/courses-registry.ts` | import + ajout au `toMap([...])` de `react` |
| `lib/courses-meta.ts` | entrée dans `CHAPTER_BADGES.react` |
| `lib/badges-catalog.ts` | définition du badge (id, icône, label, description) |
| `lib/chapter-summaries.ts` | entrée `{ slug, title, totalSteps: 4 }` |

Une fois les quatre chapitres en place, `lib/courses-catalog.ts` voit sa
description React mise à jour : elle annonce aujourd'hui « composants,
useState, useEffect et React Router » et doit mentionner les nouveaux sujets.

## Tests

- **Par chapitre** : un test de validateurs qui exerce, pour chaque étape, un
  cas passant et au moins un cas échouant. C'est la couverture qui manque le
  plus au dépôt (CF-18 de la roadmap : ~70 validateurs, 3 fichiers de test).
- **Intégrité** : `lib/spectre-trap.test.ts` étendu au piège du chapitre 6.
- **Existant** : `lib/courses-catalog.test.ts` et `scripts/verify-validators.ts`
  doivent rester verts — ils vérifient la cohérence catalogue / registre.

## Définition de « fini »

`pnpm lint` · `pnpm typecheck` · `pnpm test:run` · `pnpm build` verts, et
`pnpm exec playwright test --workers=2` vert.

Le cap à 2 workers est délibéré : au-delà, trois specs préexistantes
(`html-parcours`, `monaco`, `doc-panel`) expirent par saturation du serveur de
développement sur une machine à 24 cœurs. Constaté et reproduit sans les
fichiers de ce chantier.

## Hors périmètre

- **Le runtime React.** Le code React n'est jamais exécuté : la validation est
  du regex sur le source, et `lib/sandbox/` ne contient que `run-js.ts` et
  `run-sql.ts`, sans transformation JSX. L'apprenant écrit `useState` sans
  jamais voir son compteur s'incrémenter. C'est la limite la plus sérieuse du
  cursus React, et elle mérite son propre chantier (transformation JSX dans le
  sandbox, cible de rendu, implications CSP et taille de bundle) — pas une
  improvisation.
- Fiches de référence React (tâche 7C).
- Extension du cursus JavaScript.
- Aucune migration de schéma : rien ici n'en a besoin.
