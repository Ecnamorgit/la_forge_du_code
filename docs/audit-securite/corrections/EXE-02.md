# EXE-02 - Une boucle sans fin fige l'onglet entier

**Gravité** : Faible · **Statut** : Corrigé · **Date** : 2026-09-14

## Constat

Le code de l'apprenant s'exécute dans son navigateur, et une boucle qui ne se termine jamais figeait l'onglet entier. Le délai prévu pour l'interrompre ne se déclenchait jamais : l'apprenant perdait la main, sans message, et devait recharger la page en perdant son code.

- **JavaScript** : le code tourne dans une iframe `srcdoc` sandboxée qui, dans Chromium, partage le fil d'exécution de la page. Le projet l'avait vérifié le 2026-07-30 (voir `lib/sandbox/loop-guard.ts`). Le délai de 3 s posé par la page ne s'exécute donc jamais, puisque ce fil est occupé par la boucle.
- **SQL** : sql.js tournait directement sur ce fil. Une requête récursive sans condition d'arrêt (`WITH RECURSIVE`) le bloquait de la même façon.
- **Aperçus React et HTML** : même mécanisme. L'aperçu React refusait déjà les formes littérales (`while (true)`, `for (;;)`), mais ce filtre se contourne trivialement (`let x = true; while (x) {}`).

L'impact se limite au poste de l'apprenant, puisque le code n'est jamais partagé. Mais c'est un blocage sans issue, sur le cœur du produit.

## Démonstration

Test [e2e/securite-boucles.spec.ts](../../../e2e/securite-boucles.spec.ts), commité seul, avant le correctif (commit `a410813`). Il déploie une boucle sans fin, attend 6 s, puis vérifie que l'onglet exécute encore du code et qu'un message d'interruption s'affiche. Un témoin vérifie qu'un programme normal fonctionne toujours.

Cette démonstration n'a été possible qu'après le correctif d'EXE-07 : avant lui, le moteur SQL ne se chargeait pas du tout.

Deux ajustements de la spec sont faits dans le commit du correctif, sans changer ce qu'elle démontre :

- **Le témoin repart de l'étape 1.** Il efface d'abord, en base de test, la progression du compte e2e sur ce chapitre. Le compte est partagé entre les specs, et l'interface ouvre la première étape non faite : selon l'ordre d'exécution, le témoin tombait sur l'étape 2 et échouait sans rapport avec le correctif.
- **Le message d'interruption est visé à sa première occurrence.** Il apparaît à la fois dans le retour et dans la console.

| Contrôle | Avant correctif | Après correctif |
|---|---|---|
| Témoin JavaScript : un programme normal est validé | oui | oui |
| SQL : `WITH RECURSIVE` sans fin | **onglet figé**, aucun message | onglet utilisable, « Exécution interrompue » |
| JavaScript : `let encore = true; while (encore) {}` | **onglet figé**, aucun message | onglet utilisable, message d'interruption affiché |

Sorties : [avant correctif](annexes/EXE-02-demonstration-avant.txt), [après correctif](annexes/EXE-02-verification-apres.txt).

## Correctif

Deux mécanismes, selon ce que le moteur permet.

**SQL : un Web Worker.** sql.js tourne désormais dans un Worker ([lib/sandbox/sql.worker.ts](../../../lib/sandbox/sql.worker.ts)), compilé par [scripts/build-sql-worker.mjs](../../../scripts/build-sql-worker.mjs) avant `dev` et `build`. Une requête qui dépasse le délai ne bloque que ce Worker : la page le termine (`terminate()`), affiche « Exécution interrompue », et en crée un neuf au déploiement suivant. L'exécution elle-même ([lib/sandbox/sql-engine.ts](../../../lib/sandbox/sql-engine.ts)) est commune au Worker et aux tests sous Node.

**JavaScript, React, HTML : l'instrumentation des boucles.** Un Worker est impossible ici, car plusieurs chapitres manipulent le DOM. [lib/sandbox/loop-protect.ts](../../../lib/sandbox/loop-protect.ts) analyse le code avec `acorn` avant de l'exécuter et place au début de chaque corps de boucle (`while`, `do…while`, `for`, `for…in`, `for…of`) un appel à une garde. C'est la technique de CodePen et JSBin.

- **Ce que mesure la garde** : la durée du traitement synchrone en cours. Au-delà de 3 s, elle lève une erreur « Boucle interrompue » et la boucle s'arrête.
- **Pourquoi un rendu tardif n'est pas interrompu à tort** : la durée est remise à zéro par une microtâche, qui ne passe qu'une fois le traitement terminé. Un rendu React déclenché plus tard repart donc de zéro.
- **Un code qui ne se lit pas** (erreur de syntaxe) est exécuté tel quel : l'erreur sera signalée, et il n'y a pas de boucle à protéger.
- **Le délai de la page passe de 3 à 4 s** (`lib/sandbox/run-js.ts`). Il ne sert plus qu'au code asynchrone qui ne rend jamais sa réponse. À 3 s, il arrivait avant le message de la garde, plus précis (« Boucle interrompue après 3 s : elle ne s'arrête jamais »).

## Vérification

| Contrôle | Avant | Après |
|---|---|---|
| Démonstration e2e | témoin réussi, 2 démonstrations sur 2 en échec (onglet figé) | 3 sur 3 réussis |
| Suite e2e complète (base locale, sans e-mail réel) | 39 réussis, 1 échec connu, 4 ignorés | 42 réussis (dont les 3 tests EXE-02), même échec connu, 4 ignorés |
| `vitest run` | 1458 / 1458 | 1475 / 1475 (17 nouveaux tests) |
| `tsc --noEmit` | OK | OK |
| `eslint` | 0 erreur | 0 erreur |
| `next build` | OK | OK, `prebuild` compile le Worker SQL |

## Risque résiduel

- **Récursion sans fin** : elle n'est pas concernée, car elle s'arrête d'elle-même par dépassement de pile (`RangeError`), sans figer l'onglet.
- **Boucle bloquante hors boucle** : un code qui ne contient aucune boucle mais bloque autrement (attente active dans une API du navigateur, par exemple) n'est pas couvert. Aucun exercice n'en demande.
- **Filtre de l'aperçu React** : `loop-guard.ts` est conservé comme avertissement immédiat. Il refuse avant exécution les formes littérales les plus courantes, avec un message pédagogique.
