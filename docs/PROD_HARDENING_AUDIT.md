# Priorite 1 - Robustesse et Mise en Production

## Base de donnees production

- Migration cible validee vers PostgreSQL (`prisma/schema.prisma` -> `provider = "postgresql"`).
- Client Prisma server simplifie (`lib/db.ts`) sans adaptateur SQLite.
- Migration SQL de base rendue compatible PostgreSQL (timestamps).
- Verrou Prisma aligne sur PostgreSQL (`prisma/migrations/migration_lock.toml`).

## Audit des 15 chapitres et validateurs

Chapitre par chapitre revu dans `lib/validators/**`:

- HTML: `chapitre-1` a `chapitre-5`
- CSS: `chapitre-1` a `chapitre-5`
- JavaScript: `chapitre-1` a `chapitre-5`

Correctifs renforcant la robustesse:

- HTML
  - `html/chapitre-1`: accepte `<html ...>` avec attributs (moins strict, plus standard).
  - `html/chapitre-3`: `alt` non vide obligatoire sur `<img>`.
- CSS
  - `css/chapitre-1`: `font-size` verifie sur le selecteur `p` (objectif pedagogique explicite).
  - `css/chapitre-3`: verification `padding/margin/border` resserree sur `.module`.
  - `css/chapitre-4`: verification `gap` resserree sur `.container`.
  - `css/chapitre-5`: verification `gap` resserree sur `.grid`.
- JavaScript
  - `javascript/chapitre-1`: renforcement de la validation `let` (variable effectivement loguee) et du template literal (contenu attendu logue).
  - `javascript/chapitre-3`: ajout de verifications de logique (appel explicite, addition, seuils).
  - `javascript/chapitre-5`: ciblage explicite de l'objet `pilote`.

## Securite sandbox JS

- Execution de code etudiant deplacee vers un iframe isole (`sandbox="allow-scripts"`).
- Isolation vis-a-vis de l'application principale (pas d'acces direct au contexte principal, storage/session/cookies de l'app).
- Timeout d'execution ajoute pour limiter les scripts bloquants.

## Gestion des erreurs API (feedback utilisateur)

- `useUser`:
  - messages explicites en cas de perte reseau / serveur indisponible.
- `ChapterClient`:
  - feedback visuel immediat quand la sauvegarde de progression echoue.

## Points a finaliser avant prod

- Definir une `DATABASE_URL` PostgreSQL managée (Supabase/Neon) dans les environnements.
- Migrer la convention Next.js `middleware` vers `proxy` (warning non bloquant actuel).
- Ajouter un test e2e du parcours complet (signup -> chapitre -> sauvegarde step).
