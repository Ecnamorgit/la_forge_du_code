# Tests automatisés & intégration continue

## Stack

- **Vitest** pour les tests unitaires (rapide, compatible TypeScript/ESM, aligné avec le cursus « Tests » de la plateforme).
- **GitHub Actions** pour l'intégration continue (lint + tests à chaque push / PR).

## Lancer les tests en local

```bash
pnpm install        # récupère vitest (met aussi à jour pnpm-lock.yaml)
pnpm test           # mode watch
pnpm test:run       # exécution unique (utilisé par la CI)
```

## Périmètre couvert

Les premiers tests ciblent les **fonctions pures**, là où le rapport qualité/risque est le meilleur :

| Fichier de test | Cible | Ce qui est vérifié |
|---|---|---|
| `lib/xp.test.ts` | `lib/xp.ts` | formule d'XP (`25 + 8 × objectifs`), monotonie, plafond |
| `lib/validators/_static-utils.test.ts` | helpers de validation statique | `stripLineComments` (commentaires ligne vs URL préservée), `countMatches`, `pass`/`fail` |
| `lib/validators/javascript/chapitre-1.test.ts` | validateurs JS du chapitre 1 | succès/échec par étape, remontée d'erreur d'exécution, étape finale |

Total actuel : **22 tests**, tous au vert.

## Pourquoi ce choix de périmètre

Les validateurs sont des **fonctions pures** (`(code, context) => ValidationResult`) : entrée connue, sortie déterministe, aucune dépendance à la base ni au réseau. Ce sont les meilleures cibles pour démarrer une suite de tests fiable et rapide, et c'est le cœur métier de la plateforme.

## Intégration continue

Le workflow `.github/workflows/ci.yml` s'exécute sur `push` et `pull_request` vers `main` et `dev` :

1. installation des dépendances (pnpm) ;
2. `pnpm lint` ;
3. `pnpm test:run`.

> Note : le workflow utilise `pnpm install --no-frozen-lockfile` tant que `pnpm-lock.yaml` n'a pas été régénéré en local avec Vitest. Après un `pnpm install` local et un commit du lockfile mis à jour, repasser sur `--frozen-lockfile` (recommandé en CI).

## Pistes d'extension

- Étendre les tests unitaires aux autres validateurs (CSS, HTML, React…).
- Tests d'intégration sur `lib/tokens.ts` (création/consommation) avec une base de test.
- Test **e2e Playwright** du parcours complet : inscription → vérification → chapitre → sauvegarde de progression (manque identifié dans `PROD_HARDENING_AUDIT.md`).
- Ajouter un job `build` à la CI (nécessite `prisma generate` + une `DATABASE_URL` factice ou un secret).
