# SRV-04 - Aucune Row Level Security sur les tables Supabase

**Gravité** : Moyenne · **Statut** : Corrigé côté schéma, à vérifier dans la console Supabase · **Date** : 2026-09-14

## Constat

Aucune table n'avait la Row Level Security (RLS) activée : rien dans les migrations (`prisma/migrations`) ne contenait `ENABLE ROW LEVEL SECURITY`. La base est hébergée sur Supabase, qui expose par défaut une **API de données** (PostgREST) accessible avec une clé publique « anon ». Sans RLS, cette clé permet de lire toutes les tables — `User` avec les e-mails et les hashs de mots de passe, `OneTimeToken` avec les jetons de réinitialisation. Il suffit de connaître l'URL du projet Supabase, qui n'est pas un secret.

L'accès légitime de l'application passe uniquement par Prisma, côté serveur, avec le rôle propriétaire des tables — un chemin que la RLS ne gêne pas.

## Démonstration

Script [scripts/demontrer-rls.sql](../../../scripts/demontrer-rls.sql), exécuté sur la base PostgreSQL locale. Il crée un rôle non privilégié `anon_test` (l'équivalent du rôle « anon » de Supabase), lui donne le `SELECT` que Supabase accorde par défaut, puis compare selon que la RLS est active ou non.

| Rôle / état | Lignes visibles dans `User` |
|---|---|
| `anon_test`, **RLS désactivée** (l'état d'avant) | **15 — toute la table** |
| `anon_test`, RLS activée (le correctif) | 0 |
| propriétaire (rôle de Prisma), RLS activée | 15 |

Sortie complète : [annexes/SRV-04-demonstration-rls.txt](annexes/SRV-04-demonstration-rls.txt).

## Correctif

Migration [20260914102000_enable_row_level_security](../../../prisma/migrations/20260914102000_enable_row_level_security/migration.sql) : `ALTER TABLE … ENABLE ROW LEVEL SECURITY` sur les 10 tables applicatives (`User`, `Account`, `Session`, `VerificationToken`, `OneTimeToken`, `UserBadge`, `UserUnlock`, `StepCompletion`, `CinematicView`, `TrackEvent`).

- **Aucune politique** n'est ajoutée : `anon` et `authenticated` ne voient donc plus aucune ligne.
- **`ENABLE`, pas `FORCE`** : le propriétaire des tables (le rôle `postgres` qui exécute les migrations et par lequel Prisma se connecte) n'est pas soumis à la RLS. L'application, entièrement servie par Prisma côté serveur, fonctionne sans changement.
- **Aucune dérive Prisma** : la RLS n'est pas modélisée dans `schema.prisma` ; cette migration est du SQL brut sans changement de schéma.

## Vérification

| Contrôle | Résultat |
|---|---|
| Migration appliquée sur la base locale (`migrate deploy`) | OK, RLS active sur les 10 tables |
| Démonstration : `anon` bloqué, propriétaire non | 0 vs 15 lignes |
| Suite e2e complète (base locale, RLS active, sans e-mail réel, `--retries=1`) | 42 réussis, seul échec dur `trial-etendu` (antérieur à l'audit) |
| `vitest run` | 1492 / 1492 |
| `tsc --noEmit` | OK |

La suite e2e tourne **avec la RLS activée sur la base locale** : l'application (connectée en propriétaire) exécute tout le parcours — inscription, progression, import d'essai, aperçus — sans être gênée. C'est la preuve que la RLS ne casse pas l'accès légitime.

## Action hors code

À faire dans la console Supabase après le déploiement :

1. Ouvrir le **Security Advisor** et vérifier qu'il ne signale plus de table sans RLS.
2. Confirmer que le rôle par lequel l'application se connecte (chaîne `DATABASE_URL` / `DIRECT_URL`) est bien **propriétaire** des tables ; sinon la RLS bloquerait aussi l'application. Sur un projet Supabase créé par Prisma, c'est le cas.
3. Envisager de **désactiver l'API de données** (PostgREST) si elle n'est pas utilisée : c'est la protection la plus radicale, la RLS n'étant qu'une seconde barrière.

## Risque résiduel

La RLS bloque l'API de données. Elle ne remplace pas la maîtrise des clés : la clé `service_role` de Supabase, elle, contourne la RLS — elle ne doit jamais être exposée côté client (elle ne l'est pas : l'application n'utilise pas supabase-js, seulement Prisma côté serveur).
