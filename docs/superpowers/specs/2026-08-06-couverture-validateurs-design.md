# Spec — Couverture de tests des validateurs (CF-18)

**Date :** 2026-08-06
**Origine :** `docs/ROADMAP.md` — CF-18
**Statut :** design validé, prêt pour plan d'implémentation

---

## Problème

CF-18 demande « chaque cursus a ≥ 1 test de validateur (cas passant + échec) ».
**Ce critère est déjà rempli** : `lib/validators/all-chapter-1.test.ts` couvre
les 14 cursus, avec un cas passant et un cas d'échec.

Mais il ne teste que `validators[0]` du chapitre 1. Les étapes 2, 3 et 4 —
**les trois quarts du travail de l'apprenant** — ne sont exercées nulle part.

C'est le même défaut que CF-15 : un critère d'acceptation qu'on peut satisfaire
sans obtenir la protection visée. La différence est qu'ici personne ne s'en est
aperçu, parce que la case n'avait jamais été cochée.

Un validateur faux ne casse rien de visible. Il refuse une bonne réponse, ou en
accepte une mauvaise. Ni la CI ni le monitoring ne le voient — seul l'apprenant
en subit les conséquences, et il conclut que c'est lui qui se trompe.

## Contraintes vérifiées dans le dépôt

Constatées, pas supposées. Ne pas re-vérifier.

- **47 chapitres, ~188 étapes**, réparties ainsi : `css` 10, `javascript` 12,
  `html` 8, `react` 8, et 1 chacun pour `algo`, `devops`, `git`, `mongodb`,
  `nodejs`, `python`, `security`, `sql`, `tests`, `typescript`.
- **Chaque chapitre expose 4 validateurs** (un par étape), sauf
  `html/chapitre-1` qui en a 3.
- **Couverture dédiée existante** : `html/html-parcours`, `javascript/chapitre-1`,
  `react/chapitre-5` à `8`, `sql/chapitre-1`, `_static-utils`.
- **`Step` n'a pas de champ solution.** Il porte `startCode`, `placeholder`,
  `hint` (du texte) et `objectives` (`data/courses/html/types.ts:23`). Les
  solutions du test SQL ont été recopiées à la main depuis les hints — il n'y a
  pas de moyen d'extraire automatiquement une soumission correcte.
- **`lib/courses-registry.ts:55` tient un `REGISTRY` privé** de tous les
  chapitres. `getChapterData(course, chapter)` est le seul accès, et il exige
  de connaître les clés à l'avance : rien ne permet d'énumérer.
- **`lib/validators/index.ts:34`** expose `getValidators(course, chapterSlug)`,
  qui renvoie `[]` pour une clé inconnue — un cursus absent du registre est donc
  indistinguable d'un cursus sans validateur.
- Signature d'un validateur : `(code: string, ctx?: ValidatorContext) => { ok, msg, objList?, final? }`.

## Décisions prises

| Décision | Retenu | Pourquoi |
|---|---|---|
| Périmètre manuel | `css` + étapes 2-4 des mono-chapitres | Les deux trous les plus nets, ~67 validateurs |
| Balayage structurel | **Inclus** | Un fichier, et il couvre les 188 étapes là où l'écriture manuelle en couvrira 67 |
| Bugs trouvés | Corriger si évident, signaler sinon | Un choix pédagogique n'est pas à trancher par l'implémenteur |
| Découpage | `css` livrable seul, mono-chapitres ensuite | ~134 cas manuels : c'est plusieurs sessions, pas une |

## Partie 1 — Le balayage structurel

Un fichier, dirigé par les données, qui parcourt tous les cursus et tous les
chapitres via le registre. Aucun cas écrit à la main.

### Prérequis : rendre le registre énumérable

`lib/courses-registry.ts` doit exposer de quoi parcourir son `REGISTRY` :
les slugs de cursus, et pour chacun ses slugs de chapitre. Quelques lignes,
sans toucher à `getChapterData`.

**Pourquoi c'est nécessaire :** sans énumérateur, le test devrait redéclarer la
liste des 47 chapitres. Cette liste se périmerait au premier chapitre ajouté —
et un chapitre neuf non testé est exactement le cas qu'on veut attraper.

### Invariant a — autant de validateurs que d'étapes

Pour chaque chapitre : `getValidators(cursus, slug).length === chapitre.steps.length`.

Une étape sans validateur est **invalidable** : l'apprenant reste bloqué sans
recours. Un validateur sans étape est du code mort qui ne s'exécutera jamais.

### Invariant b — le `startCode` échoue à son propre validateur

Pour chaque étape : `validators[i](step.startCode).ok === false`.

Si le code de départ passe déjà, l'étape est vide — l'apprenant clique
« valider » et réussit sans rien écrire. Rien ne le signale aujourd'hui.

**Les validateurs runtime demandent un contexte.** `javascript` et `sql`
valident sur exécution réelle (logs, résultat SQL). Appelés sans `ctx`, ils
peuvent échouer pour la mauvaise raison — ce qui rendrait l'invariant vert sans
rien prouver. Ces cursus sont donc **exclus de l'invariant b**, avec la raison
écrite dans le test et la liste des exclusions maintenue explicitement.

**L'invariant peut échouer légitimement.** Une étape « observe puis valide »,
ou un `spectreTrap` dont le code corrompu passerait quand même, produirait un
échec qui n'est pas un bug. Ces cas relèvent de la Partie 3 : on les regarde un
par un avant de conclure.

## Partie 2 — Les cas passants, écrits à la main

Convention existante : `lib/validators/<cursus>/chapitre-N.test.ts`, important
`{ validators } from "./chapitre-N"`. Modèle de référence :
`lib/validators/react/chapitre-5.test.ts`.

Pour chaque étape du périmètre : **un cas passant et un cas d'échec ciblé**.
Le cas d'échec doit rater pour la raison qu'énonce le message du validateur —
pas une chaîne vide, qui échouerait de toute façon et ne prouverait rien.

Les soumissions se dérivent du `hint` et des `objectives` de l'étape.

### Lot A — `css`, 10 chapitres

40 validateurs, 80 cas. Livrable seul.

### Lot B — les 9 cursus mono-chapitre

`algo`, `devops`, `git`, `mongodb`, `nodejs`, `python`, `security`, `tests`,
`typescript` — étapes 2 à 4 uniquement, l'étape 1 étant déjà couverte par
`all-chapter-1.test.ts`. 27 validateurs, 54 cas.

`sql` est exclu : `sql/chapitre-1.test.ts` couvre déjà ses 4 étapes.

## Partie 3 — Ce qu'on fait des bugs trouvés

- **Bug technique net** — regex fausse, condition inversée, message qui décrit
  une autre exigence que celle testée : corrigé, avec le test qui le prouve.
- **Choix pédagogique** — « faut-il accepter cette variante de réponse ? » :
  consigné dans un rapport final, **non tranché**. Le test est écrit sur le
  comportement actuel, avec un commentaire nommant la question ouverte.

La frontière : si la correction demande de savoir ce qu'on veut enseigner, ce
n'est pas un bug technique.

## Correction à apporter à la roadmap

L'entrée CF-18 rédigée le 2026-08-05 affirme que 10 cursus n'ont « aucun test ».
C'est faux — `all-chapter-1.test.ts` les couvre tous. La formulation doit dire
le vrai trou : **les étapes 2 à 4**, et non les cursus.

Laisser l'erreur en place recréerait exactement le défaut dénoncé chez CF-15 :
un document qui décrit mal le travail restant. La date « 2026-08-05 » de
l'en-tête est également fausse et devient 2026-08-06.

## Risques

1. **L'invariant b échoue en masse.** Si beaucoup d'étapes passent avec leur
   `startCode`, c'est soit une découverte majeure, soit un invariant mal posé.
   *Réponse :* examiner les dix premiers cas avant de conclure. Ne pas
   neutraliser l'invariant pour faire passer la suite.
2. **Les cas passants inventés sont refusés à tort.** Une soumission
   raisonnable rejetée peut venir d'un validateur trop strict — ou d'une
   soumission qui rate vraiment l'objectif. *Réponse :* relire l'énoncé et les
   `objectives` avant d'accuser le validateur.
3. **Le volume décourage la relecture.** 134 cas, c'est beaucoup à relire d'un
   bloc. *Réponse :* le découpage en lots, `css` d'abord.

## Critères d'acceptation

- [ ] `lib/courses-registry.ts` expose un énumérateur ; `getChapterData` inchangé.
- [ ] Le balayage structurel couvre les 14 cursus et les 47 chapitres, sans
      liste codée en dur.
- [ ] Invariant a vert sur tous les chapitres.
- [ ] Invariant b vert sur tous les chapitres hors exclusions, la liste
      d'exclusions étant justifiée dans le fichier.
- [ ] `css` : les 10 chapitres ont un fichier de test, 4 étapes chacun, un cas
      passant et un cas d'échec ciblé par étape.
- [ ] Les 9 cursus mono-chapitre ont leurs étapes 2 à 4 couvertes.
- [ ] Tout bug technique trouvé est corrigé et couvert par un test.
- [ ] Les questions pédagogiques sont listées dans un rapport, non tranchées.
- [ ] CF-18 et la date d'en-tête corrigés dans `docs/ROADMAP.md`.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test:run` verts.

## Hors périmètre

- Les étapes 2 à 4 de `html` (8 ch.), `javascript` (12 ch.) et `react` (8 ch.)
  au-delà de ce que couvrent leurs tests actuels. Ces trois cursus ont déjà des
  fichiers dédiés ; ils méritent leur propre passe.
- Ajouter un champ `solution` à `Step`. Ça rendrait les cas passants dérivables
  automatiquement et supprimerait l'essentiel du travail manuel — mais c'est une
  modification du modèle de données de tout le contenu, pas un travail de test.
  **À considérer sérieusement avant d'attaquer `javascript` et ses 48 étapes.**
