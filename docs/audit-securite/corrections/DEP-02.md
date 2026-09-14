# DEP-02 - Avis restants sur des dépendances d'outillage

**Gravité** : Faible · **Statut** : Corrigé, 1 avis accepté (deepmerge-ts) · **Date** : 2026-09-14

## Constat

Après DEP-01, `pnpm audit --prod` ne remontait plus aucun avis sur next ni next-auth, mais il restait **57 avis** (14 hauts, 37 moyens, 6 faibles). Tous portaient sur des dépendances **indirectes**, venues de trois paquets :

| Paquet direct | Dépendances concernées | Rôle |
|---|---|---|
| `@prisma/client` (qui tire la CLI `prisma`) | hono, @hono/node-server, fast-uri, valibot, deepmerge-ts, mysql2 | Outils de la CLI Prisma (serveur de développement, migrations) |
| `@sentry/nextjs` | brace-expansion, @babel/core, browserslist, baseline-browser-mapping | Plugin de build (envoi des cartes de sources) |
| `monaco-editor` | dompurify | Éditeur de code, dans le navigateur de l'apprenant |

Aucune de ces dépendances n'est exécutée pour répondre aux requêtes du site. Mais un avis connu reste un avis connu : il faut soit le corriger, soit expliquer pourquoi il est accepté.

## Démonstration

La preuve est la sortie de l'outil, relevée le 2026-09-14 avant toute mise à jour : [annexes/DEP-02-pnpm-audit-avant.md](annexes/DEP-02-pnpm-audit-avant.md).

## Correctif

**1. Mise à jour des paquets directs**, sans changer de version majeure :

| Paquet | Avant | Après |
|---|---|---|
| `prisma`, `@prisma/client`, `@prisma/adapter-pg` | 7.8.0 | 7.10.0 |
| `@sentry/nextjs` | 10.58.0 | 10.74.0 |
| `monaco-editor` | 0.55.1 | 0.56.0 |

Résultat intermédiaire : **57 avis ramenés à 21**. Les avis de hono, @hono/node-server et valibot disparaissent. La CLI Prisma propose une 8.0.0-rc, écartée parce que c'est une préversion : 7.10.0 est la dernière version stable de la branche 7.

**2. Surcharges pnpm** (`pnpm.overrides` dans `package.json`) pour les dépendances indirectes que les paquets parents n'embarquent pas encore en version corrigée. Uniquement des montées dans la même version majeure, pour ne pas sortir de ce que les parents acceptent :

| Dépendance | Installée | Imposée |
|---|---|---|
| fast-uri | 3.1.2 | ^3.1.4 |
| mysql2 | 3.15.3 | ^3.22.0 |
| brace-expansion | 5.0.5 | ^5.0.6 |
| browserslist | 4.28.2 | ^4.28.7 |
| baseline-browser-mapping | 2.10.21 | ^2.11.0 |
| @babel/core | 7.29.0 | ^7.29.6 |
| dompurify | 3.4.8 | ^3.4.12 |

## Vérification

| Contrôle | Avant | Après |
|---|---|---|
| `pnpm audit --prod` | 57 avis (0 critique, 14 hauts, 37 moyens, 6 faibles) | 1 avis (1 haut : deepmerge-ts, accepté) |
| Suite e2e complète (base locale, sans e-mail réel) | 42 réussis, 1 échec connu, 4 ignorés | 42 réussis, même échec connu, 4 ignorés |
| `vitest run` | 1482 / 1482 | 1482 / 1482 |
| `tsc --noEmit` | OK | OK |
| `eslint` | 0 erreur | 0 erreur |
| `next build` | OK | OK |
| CLI Prisma (`prisma generate`, `migrate deploy` sur la base locale) | OK | OK : client 7.10.0 généré, aucune migration en attente |

Détail des avis restants : [annexes/DEP-02-pnpm-audit-apres.md](annexes/DEP-02-pnpm-audit-apres.md).

## Risque résiduel

- **deepmerge-ts 7.1.5 : 1 avis haut, accepté.** L'avis porte sur un épuisement de pile lors de la fusion d'objets récursifs. `@prisma/config` fixe **exactement** la version 7.1.5, et la version corrigée est la 8 : l'imposer sortirait de ce que Prisma a testé. Or Prisma ne fusionne ici que notre propre fichier de configuration (`prisma.config.ts`), jamais une donnée venue d'un utilisateur. À revoir à chaque mise à jour de Prisma.
- **Les surcharges sont temporaires.** Il faudra les retirer quand les paquets parents embarqueront eux-mêmes les versions corrigées ; `pnpm audit` et `pnpm why` le diront. Sinon, une surcharge oubliée pourrait un jour bloquer une version plus récente.
