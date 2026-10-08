# Priorité 1 - Robustesse et mise en production

## Base de données production

- Migration cible validée vers PostgreSQL (`prisma/schema.prisma` -> `provider = "postgresql"`).
- Client Prisma serveur simplifié (`lib/db.ts`) sans adaptateur SQLite.
- Migration SQL de base rendue compatible PostgreSQL (timestamps).
- Verrou Prisma aligné sur PostgreSQL (`prisma/migrations/migration_lock.toml`).

## Audit des 15 chapitres et validateurs

Chapitre par chapitre revu dans `lib/validators/**` :

- HTML : `chapitre-1` à `chapitre-5`
- CSS : `chapitre-1` à `chapitre-5`
- JavaScript : `chapitre-1` à `chapitre-5`

Correctifs renforçant la robustesse :

- HTML
  - `html/chapitre-1` : accepte `<html ...>` avec attributs (moins strict, plus standard).
  - `html/chapitre-3` : `alt` non vide obligatoire sur `<img>`.
- CSS
  - `css/chapitre-1` : `font-size` vérifié sur le sélecteur `p` (objectif pédagogique explicite).
  - `css/chapitre-3` : vérification `padding/margin/border` resserrée sur `.module`.
  - `css/chapitre-4` : vérification `gap` resserrée sur `.container`.
  - `css/chapitre-5` : vérification `gap` resserrée sur `.grid`.
- JavaScript
  - `javascript/chapitre-1` : renforcement de la validation `let` (variable effectivement loguée) et du template literal (contenu attendu logué).
  - `javascript/chapitre-3` : ajout de vérifications de logique (appel explicite, addition, seuils).
  - `javascript/chapitre-5` : ciblage explicite de l'objet `pilote`.

## Sécurité sandbox JS

- Exécution du code étudiant déplacée vers une iframe isolée (`sandbox="allow-scripts"`).
- Isolation vis-à-vis de l'application principale (pas d'accès direct au contexte principal, au storage, à la session ni aux cookies de l'app).
- Timeout d'exécution ajouté pour limiter les scripts bloquants.

Depuis, l'exécution a été déplacée sur une origine dédiée et les boucles sans fin sont interrompues : voir [SANDBOX_REPORT.md](SANDBOX_REPORT.md) et les fiches [EXE-02](audit-securite/corrections/EXE-02.md) et [EXE-03](audit-securite/corrections/EXE-03.md).

## Gestion des erreurs API (feedback utilisateur)

- `useUser` :
  - messages explicites en cas de perte réseau / serveur indisponible.
- `ChapterClient` :
  - feedback visuel immédiat quand la sauvegarde de progression échoue.

## Points à finaliser avant prod

- [x] Définir une `DATABASE_URL` PostgreSQL managée (Supabase/Neon) dans les environnements (voir [DEPLOYMENT.md](DEPLOYMENT.md)).
- [x] Migrer la convention Next.js `middleware` vers `proxy` (`proxy.ts`).
- [x] Ajouter un test e2e du parcours complet (signup -> chapitre -> sauvegarde step) : dossier `e2e/`, voir [TESTING.md](TESTING.md). La connexion, le chapitre et la sauvegarde sont couverts dans le navigateur ; l'inscription l'est au niveau de l'API (`securite-inscription.spec.ts`), la vérification d'email ne l'est pas.
