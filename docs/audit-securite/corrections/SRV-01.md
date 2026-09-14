# SRV-01 - Limitation de débit en mémoire en production

**Gravité** : Moyenne · **Statut** : Corrigé côté code, Redis à relier au déploiement · **Date** : 2026-09-14

## Constat

`lib/rate-limit.ts` limite les tentatives de connexion, les inscriptions, les e-mails et les étapes. Il compte dans Upstash Redis si `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN` sont définies, et en mémoire sinon.

- **Relevé le 2026-09-14 dans le tableau de bord Vercel** : aucune variable Redis en production. Sur Vercel, chaque instance serverless a sa propre mémoire. Les limites se comptaient donc instance par instance, et un attaquant qui répartit ses requêtes les dépasse largement : force brute sur la connexion, envoi massif d'e-mails. Cela affaiblit aussi les correctifs EXE-01 et SRV-07, qui reposent sur ce limiteur.
- **Le Redis créé le 2026-09-14** avec l'intégration Upstash de Vercel fournit `KV_REST_API_URL` et `KV_REST_API_TOKEN`. Le limiteur ne lisait que les noms `UPSTASH_…` : il serait resté en mémoire, Redis configuré ou non.
- **Rien n'empêchait de déployer sans Redis** : la validation de configuration (`lib/env.ts`) ne l'exigeait pas.

## Démonstration

Deux tests unitaires, commités seuls, avant le correctif (commit `2faa3bb`) :

| Test | Contrôle | Avant correctif | Après correctif |
|---|---|---|---|
| [lib/rate-limit-redis.test.ts](../../../lib/rate-limit-redis.test.ts) | Avec `KV_REST_API_URL` et `KV_REST_API_TOKEN`, le limiteur crée un client Redis | **aucun client : mémoire** | client Redis créé |
| [lib/env-redis.test.ts](../../../lib/env-redis.test.ts) | Sur Vercel en production, la configuration refuse de démarrer sans Redis | **acceptée** | refusée |

Les autres cas (noms `UPSTASH_…`, absence de Redis hors Vercel) passent avant comme après.

Sorties : [avant correctif](annexes/SRV-01-demonstration-avant.txt), [après correctif](annexes/SRV-01-verification-apres.txt).

## Correctif

- **Les deux familles de noms** : le limiteur lit `UPSTASH_REDIS_REST_URL`/`TOKEN`, puis à défaut `KV_REST_API_URL`/`TOKEN`, qui sont les noms de l'intégration Vercel.
- **Redis obligatoire sur Vercel** : `lib/env.ts` refuse de démarrer quand `VERCEL=1` en production sans l'une des deux paires. L'exigence ne porte pas sur toute production : un `next start` sur une seule instance, comme en CI, compte juste en mémoire.
- **`.env.example` et `docs/DEPLOYMENT.md`** citent les deux familles de noms.

## Action hors code

Dans Vercel, la base Upstash doit être reliée au projet pour **Production et Preview**, et un déploiement doit être relancé. Sans ça, le prochain déploiement refusera de démarrer, ce qui est voulu : mieux vaut un démarrage refusé qu'une limitation de débit sans effet.

## Vérification

| Contrôle | Avant | Après |
|---|---|---|
| Démonstration (vitest) | 2 contrôles sur 7 en échec | 7 sur 7 réussis |
| Suite e2e complète (base locale, sans e-mail réel) | 42 réussis, 1 échec connu, 4 ignorés | 42 réussis, même échec connu, 4 ignorés (hors Vercel, l'exigence Redis ne s'applique pas) |
| `vitest run` | 1475 / 1475 (hors démonstration) | 1482 / 1482 (7 nouveaux tests) |
| `tsc --noEmit` | OK | OK |
| `eslint` | 0 erreur | 0 erreur |
| `next build` | OK | OK |

## Risque résiduel

**En cas de panne de Redis**, le limiteur bascule en mémoire, par instance (« fail-open »), et journalise l'incident. Refuser toutes les connexions pendant une panne d'Upstash (« fail-closed ») bloquerait tous les apprenants. Le repli en mémoire garde une limite, plus faible, et c'est un choix assumé.
