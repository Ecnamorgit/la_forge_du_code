# EXE-01 - Progression accordée sans preuve de réussite

**Gravité** : Moyenne · **Statut** : Corrigé, avec un risque résiduel documenté · **Date** : 2026-09-12

## Constat

La validation des exercices se fait dans le navigateur. En cas de réussite, il appelle `POST /api/me/step` avec `{ course, chapter, stepIndex }`, et le serveur accordait l'étape en ne vérifiant que son existence (`lib/me-server.ts`, `completeStep`) :

- aucune preuve de réussite : le serveur ne recevait pas le code ;
- aucun ordre : l'étape 3 pouvait être validée sans les étapes 1 et 2, un chapitre verrouillé sur la carte aussi ;
- aucune limite de débit sur la route.

**Conséquence** : un compte pouvait, par une simple boucle d'appels, obtenir toute l'XP, tous les badges et les déblocables, et passer en tête du classement visible par les autres apprenants. L'impact porte sur l'intégrité du jeu et du classement, pas sur la confidentialité des données.

## Démonstration

Test [e2e/securite-progression.spec.ts](../../../e2e/securite-progression.spec.ts), commité seul, avant le correctif (commit `c710b61`). Un compte dédié appelle l'API directement, comme un script.

| Tentative | Attendu | Avant correctif | Après correctif |
|---|---|---|---|
| Une vraie solution, à son tour | 200 | 200 | 200 |
| Sauter une étape (étape 2 sans l'étape 1) | 409 | **200** | 409 |
| Déclarer une étape sans solution | 422 | **200** | 422 |
| Soumettre la solution d'une autre étape | 422 | **200** | 422 |
| Rafale de 25 appels | au moins un 429 | **25 × 200** | 429 dès le 21e appel de la minute |

Sorties complètes : [avant correctif](annexes/EXE-01-demonstration-avant.txt), [après correctif](annexes/EXE-01-verification-apres.txt) (suite e2e entière).

## Correctif

Trois protections indépendantes, appliquées par le serveur (commit « fix(securite): EXE-01 … », qui suit la démonstration) :

1. **Preuve de réussite** ([lib/step-proof.ts](../../../lib/step-proof.ts)). Le navigateur envoie le code qui vient de passer le validateur ; le serveur rejoue ce même validateur. Un code absent ou invalide est refusé en 422. Le code est borné à 20 000 caractères, pour limiter le coût des expressions régulières des validateurs.
2. **Ordre de progression** ([lib/step-order.ts](../../../lib/step-order.ts), appelé dans la transaction de `completeStep`). Ce sont exactement les règles de l'interface, ni plus ni moins : l'étape n exige l'étape n-1, et la première étape d'un chapitre exige le chapitre précédent terminé, comme la carte. Refus en 409.
3. **Limite de débit** : 20 appels par minute et par compte sur `/api/me/step`, comptés avant toute lecture du corps. Refus en 429.

Ajustements liés :

- `ChapterWorkspace` transmet le code réussi, `ChapterClient` puis `use-user` le relaient jusqu'à l'API.
- L'import de la progression d'essai trie ses étapes dans l'ordre du parcours (`filterTrialSteps`), pour satisfaire la règle d'ordre.
- La liste des chapitres jugés sur exécution devient une source unique ([lib/validators/runtime.ts](../../../lib/validators/runtime.ts)), partagée par le serveur et le test d'intégrité des validateurs.

Un invariant garantit que la règle d'ordre ne bloque jamais un apprenant honnête : pour les 15 cursus, la carte (`getChaptersMeta`) et le registre de contenu décrivent les mêmes chapitres, dans le même ordre, avec le même nombre d'étapes (`lib/step-order.test.ts`).

## Vérification

| Contrôle | Avant | Après |
|---|---|---|
| Démonstration e2e | 4 contrôles sur 5 en échec | 5 sur 5 réussis |
| Suite e2e complète (base locale) | 29 réussis, 1 échec connu, 4 ignorés | 30 réussis (dont la démonstration), même échec connu, 4 ignorés |
| `vitest run` | 1347 / 1347 | 1375 / 1375 (28 nouveaux tests) |
| `tsc --noEmit` | OK | OK |
| `eslint` | 0 erreur | 0 erreur |
| `next build` | OK | OK |

La suite e2e comprend `html-parcours.spec.ts`, qui joue le chapitre 1 HTML dans l'interface : le code transmis par le navigateur y est accepté par le serveur.

## Risque résiduel

- **Étapes jugées sur une exécution** : chapitres 1 à 10 de JavaScript et chapitre 1 de SQL. Leurs validateurs lisent la sortie de la console ou le résultat de la requête, produits dans le navigateur. Les rejouer demanderait d'exécuter le code de l'apprenant sur le serveur, ce que l'architecture exclut volontairement. Leur réussite reste déclarée, mais l'ordre et la limite de débit s'y appliquent.
- **Recopier une solution** reste possible, puisque les indices la montrent : c'est un choix pédagogique. Le correctif supprime le raccourci. Un script doit désormais soumettre une solution valide pour chaque étape, dans l'ordre et sous la limite de débit, ce qui revient à suivre le parcours.
- **Import de l'essai** : les chapitres d'essai (HTML 1 à 3, publics) sont importés sans code, dans l'ordre, dans la limite de l'essai et de 10 imports par quart d'heure.
- **Limite de débit** : elle repose sur Upstash Redis en production. Sans lui, elle est comptée par instance (constat SRV-01).
- **Onglet ouvert pendant le déploiement** : un onglet chargé avec l'ancienne version n'envoie pas le code. L'enregistrement de l'étape est refusé, avec un message à l'écran, jusqu'au rechargement de la page.
