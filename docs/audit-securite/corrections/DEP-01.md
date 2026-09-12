# DEP-01 - Dépendances vulnérables : next et next-auth

**Gravité** : Haute · **Statut** : Corrigé · **Date** : 2026-09-12

## Constat

L'audit initial (`pnpm audit --prod`) remonte des vulnérabilités publiques critiques et hautes sur deux dépendances au cœur du site :

| Paquet | Version auditée | Avis principaux | Corrigé en |
|---|---|---|---|
| next | 16.2.4 | Contournements du proxy (GHSA-267c-6grr-h53f, GHSA-492v-c6pp-mqqv, GHSA-26hh-7cqf-hhc6, GHSA-6gpp-xcg3-4w24), SSRF (GHSA-p9j2-gv94-2wf4, GHSA-89xv-2m56-2m9x), déni de service (GHSA-8h8q-6873-q5fj, GHSA-m99w-x7hq-7vfj), exécution de code via l'optimisation d'images AVIF (GHSA-2xp9-vwfh-vxw4) | 16.3.3 |
| next-auth | 5.0.0-beta.31 | Contrôle d'authentification qui échoue en mode ouvert en cas d'erreur de configuration (GHSA-8fpg-xm3f-6cx3), contournement de la normalisation des e-mails (GHSA-7rqj-j65f-68wh), plantage sur un en-tête Bearer malformé (GHSA-xmf8-cvqr-rfgj) | 5.0.0-beta.32 |

## Pourquoi c'est important ici

- `proxy.ts` protège les pages `/dashboard`, `/learn`, `/profil`, `/leaderboard` et `/avatar`. Un contournement du proxy expose en particulier la page d'un chapitre, qui ne vérifie pas la session elle-même (constat SRV-10).
- `next.config.ts` active le format AVIF pour les images, précisément la configuration visée par l'avis d'exécution de code. Sur Vercel, l'optimisation d'images est assurée par la plateforme, ce qui réduit l'exposition sans la supprimer : la même application déployée ailleurs serait vulnérable.

## Démonstration

La preuve est la sortie de l'outil, figée dans l'audit initial : [annexes/pnpm-audit.md](../2026-09-12-audit-initial/annexes/pnpm-audit.md). Total : 97 avis, dont 5 critiques et 34 hauts.

## Correctif

| Paquet | Avant | Après |
|---|---|---|
| next | 16.2.4 | 16.3.5 |
| eslint-config-next | 16.2.4 | 16.3.5 |
| next-auth | 5.0.0-beta.31 | 5.0.0-beta.32 |
| @auth/prisma-adapter | 2.11.2 | 2.11.3 (entraîne @auth/core 0.41.3) |

Changement de comportement vérifié : avec next-auth beta.32, une session en erreur donne « pas de session » au lieu d'un objet d'erreur. Toutes les routes testent `session?.user?.id` : elles refusaient déjà l'accès dans ce cas, aucun code n'est à adapter.

## Vérification

| Contrôle | Avant | Après |
|---|---|---|
| `pnpm audit --prod` | 97 avis (5 critiques, 34 hauts, 50 moyens, 8 faibles) | 57 avis (0 critique, 14 hauts, 37 moyens, 6 faibles) |
| Avis sur next, next-auth et @auth/core | 31 (24 + 4 + 3) | 0 |
| `tsc --noEmit` | OK | OK |
| `vitest run` | 1347 / 1347 | 1347 / 1347 |
| `next build` | OK | OK |
| `eslint` | 0 erreur, 1 avertissement | 0 erreur, 2 avertissements (nouvelle règle de eslint-config-next 16.3 sur `window.location.href` dans `app/signup/page.tsx:67`, code existant) |
| Playwright (base locale) | 29 réussis, 1 échec connu, 4 ignorés | 29 réussis, même échec connu, 4 ignorés |

L'échec e2e connu (`trial-etendu.spec.ts`, « la carte HTML est publique ») est antérieur à l'audit et sans lien avec les dépendances.

Détail des avis restants : [annexes/DEP-01-pnpm-audit-apres.md](annexes/DEP-01-pnpm-audit-apres.md).

## Reste à traiter : DEP-02

Les 57 avis restants ne concernent aucune dépendance exécutée pour répondre aux requêtes du site :

- `@prisma/client > prisma` (hono, fast-uri, deepmerge-ts, mysql2, valibot) : outils de la CLI Prisma ;
- `@sentry/nextjs > @sentry/bundler-plugin-core` (brace-expansion, browserslist, @babel/core) : plugin de build ;
- `monaco-editor > dompurify` : avis moyens et faibles, dans le navigateur de l'apprenant, sur du contenu produit par l'éditeur.

Ils sont suivis sous DEP-02 (Faible) : mise à jour dès que Prisma, Sentry et Monaco publient des versions corrigées, plutôt que de forcer des versions transitives au risque de casser la CLI Prisma.
