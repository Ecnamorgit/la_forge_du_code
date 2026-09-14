# INF-01 - Les préversions appliquent les migrations à la base de production

**Gravité** : Moyenne · **Statut** : Corrigé pour les migrations, base de préversion séparée recommandée · **Date** : 2026-09-14

**Découvert pendant l'audit.** Ce constat ne figurait pas dans l'audit initial : les réglages de Vercel n'étaient pas accessibles. Il est apparu le 2026-09-14, quand la capture des variables d'environnement du projet a été partagée pour vérifier SRV-01.

## Constat

- **Dans Vercel**, `DATABASE_URL` et `DIRECT_URL` sont réglées sur « Production and Preview » : chaque préversion (un déploiement par branche poussée) parle à la **base de production**.
- **La commande de build de `vercel.json`** lançait `pnpm prisma migrate deploy` à chaque déploiement, préversions comprises.

Conséquence : pousser une branche qui contient une migration l'appliquait **à la production**, avant toute relecture et toute fusion. Une migration erronée ou abandonnée (suppression de colonne, renommage) aurait touché les vraies données. Aucune branche de l'audit ne contenait de migration, donc rien n'a été appliqué. Mais les correctifs SRV-03 et SRV-04 en demandent une : ce constat les bloquait.

Deuxième conséquence, que ce correctif ne règle pas : ce qu'on fait sur une préversion (inscription, progression) s'écrit dans les vraies données.

## Démonstration

Test [lib/vercel-build.test.ts](../../../lib/vercel-build.test.ts), commité seul, avant le correctif (commit `96109fb`). Il lit la commande de build de `vercel.json` et exécute, en simulation, le script qui décide des migrations. Avant le correctif, le dernier contrôle passait par accident : le script n'existait pas encore, donc son lancement échouait de toute façon.

| Contrôle | Avant correctif | Après correctif |
|---|---|---|
| La commande de build lance directement `prisma migrate deploy` | **oui** | non, elle passe par le script |
| Une préversion (`VERCEL_ENV=preview`) applique les migrations | **oui** | non, « migrations ignorées » |
| La production (`VERCEL_ENV=production`) applique les migrations | oui | oui |
| Sur Vercel sans `VERCEL_ENV`, le build échoue au lieu de sauter les migrations | (script absent) | oui |

Sorties : [avant correctif](annexes/INF-01-demonstration-avant.txt), [après correctif](annexes/INF-01-verification-apres.txt).

## Correctif

La commande de build appelle [scripts/migrer-si-production.mjs](../../../scripts/migrer-si-production.mjs) au lieu de `prisma migrate deploy` :

- `VERCEL_ENV=production` : les migrations sont appliquées, comme avant ;
- préversion ou développement : elles sont ignorées, avec un message dans le journal de build ;
- **sur Vercel sans `VERCEL_ENV`** : le build échoue. Sauter les migrations en silence laisserait la production avec un schéma de base en retard sur le code, sans que personne ne s'en aperçoive.

Une option `--simulation` affiche la décision sans lancer Prisma : c'est elle qu'utilisent les tests.

## Action hors code recommandée

Donner aux préversions **leur propre base** : une seconde base Supabase gratuite, par exemple, dont l'URL serait réglée dans Vercel sur `DATABASE_URL` et `DIRECT_URL` pour l'environnement **Preview** uniquement. Les préversions cesseraient alors d'écrire dans les données réelles.

## Vérification

| Contrôle | Avant | Après |
|---|---|---|
| Démonstration (vitest) | 4 contrôles sur 5 en échec (le 5e passait par accident) | 5 sur 5 réussis |
| `vitest run` | 1482 / 1482 | 1487 / 1487 (5 nouveaux tests) |
| `tsc --noEmit` | OK | OK |
| `eslint` | 0 erreur | 0 erreur |

**Exécution réelle du script**, hors simulation, sur la base de test locale (`codeforge_test` sur `localhost:54329`, jamais la production) :

| Environnement simulé | Résultat |
|---|---|
| `VERCEL=1 VERCEL_ENV=preview` | « migrations ignorées », code de sortie 0 : le build continue |
| `VERCEL=1 VERCEL_ENV=production` | `prisma migrate deploy` s'exécute : 10 migrations trouvées, aucune en attente |
| `VERCEL=1`, `VERCEL_ENV` absent | message explicite, code de sortie 1 : le build s'arrête |

À vérifier au prochain déploiement : le journal de build d'une préversion doit afficher « migrations ignorées », celui de la production « migrations appliquées ».
