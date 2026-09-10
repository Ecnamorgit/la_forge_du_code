# Tests automatisés & intégration continue

Ce document présente l'architecture, la configuration et le périmètre des tests de La Forge du Code, ainsi que la configuration du pipeline d'intégration continue (CI).

## Stack de Tests

- **Vitest** pour les tests unitaires (rapidité, support natif TypeScript/ESM, exécution isolée).
- **Playwright** pour les tests de bout en bout (E2E) sur navigateur réel.
- **GitHub Actions** pour orchestrer les vérifications de qualité et les tests E2E lors des intégrations.

---

## Lancer les tests en local

### Prérequis
1. Avoir les dépendances installées : `pnpm install`
2. Pour les tests E2E :
   - Avoir une base de données PostgreSQL de test accessible.
   - Appliquer les migrations : `pnpm prisma migrate deploy`
   - Installer le navigateur Playwright : `pnpm exec playwright install chromium`

### Commandes

```bash
# Tests unitaires (Vitest)
pnpm test           # Lance Vitest en mode interactif (watch mode)
pnpm test:run       # Exécute tous les tests unitaires une seule fois (CI)

# Tests de bout en bout (Playwright)
pnpm test:e2e       # Exécute tous les tests Playwright en arrière-plan
```

---

## 1. Tests unitaires (Vitest)

Nous disposons de **206 tests unitaires** couvrant les modules logiques purs et les validateurs métiers de la plateforme.

### Périmètre couvert

| Module / Catégorie | Cibles de test | Rôle & Éléments vérifiés |
| :--- | :--- | :--- |
| **Validateurs de code** | `lib/validators/*` | Validation statique et dynamique des exercices HTML, JS et SQL (succès/échec par étape, remontée des erreurs, conformité du code étudiant). |
| **Logique de mission** | `lib/daily-mission.ts` | Calcul et distribution de la mission quotidienne (cooldowns, sélection de mission, attribution). |
| **Calcul d'XP** | `lib/xp.ts` | Algorithme d'attribution de l'XP (`25 + 8 × objectifs`), validation de la monotonie et du plafond d'XP. |
| **Sécurité & Tokens** | `lib/token-crypto.ts` | Génération, signature cryptographique et validation des tokens de session et d'activation. |
| **Partage & Social** | `lib/share.ts` | Génération de liens de partage et règles de visibilité associées. |
| **Variables d'env** | `lib/env.ts` | Validation stricte et fail-fast au démarrage du serveur des variables d'environnement requises. |
| **Rendu Markdown** | `lib/markdown.ts` | Sécurisation du rendu HTML généré à partir de markdown (anti-XSS via sanitisation) et intégrité des liens. |
| **Intégrité de la Doc** | `data/docs/*` | Validation de l'intégrité et du registre des documents du panneau d'aide intégré. |

---

## 2. Tests de bout en bout (Playwright)

Nous disposons de **8 tests E2E** configurés dans le répertoire `e2e/`. Ils valident le comportement réel de l'application dans un navigateur web (Chromium).

### Scénarios testés

1. **Smoke Tests (`e2e/smoke.spec.ts`)** :
   - Chargement de la page d'accueil.
   - Redirection automatique d'une page protégée (`/dashboard`) vers la page de connexion (`/login`).
   - Visibilité et soumission du formulaire de connexion.
   - Connexion réussie d'un utilisateur de test avec redirection vers le tableau de bord.
2. **Monaco Editor Local (`e2e/monaco.spec.ts`)** :
   - Vérification que l'éditeur Monaco se charge bien à partir d'assets locaux et self-hébergés (`/monaco/vs`).
   - **Aucune** requête ne doit être envoyée vers le CDN externe `jsdelivr.net` pour éviter les fuites de données et dépendances tierces (CF-15 / CF-16).
3. **Panneau de documentation (`e2e/doc-panel.spec.ts`)** :
   - Ouverture automatique du panneau latéral d'aide lorsqu'un apprenant clique sur un chip de documentation dans le briefing.
   - Fermeture automatique du panneau avec la touche Échap.
   - Chargement des bonnes références de documentation associées à l'étape en cours.
4. **Parcours interactif HTML Chapitre 1 (`e2e/html-parcours.spec.ts`)** :
   - Simulation complète d'un étudiant jouant le chapitre 1 du cursus HTML (3 étapes) : saisie du code dans Monaco, clic sur **DEPLOYER**, vérification du bandeau de succès "SYSTEME EN LIGNE", passage à l'étape suivante, puis écran final de complétion ("TERMINER LE PROTOCOLE").
   - Test d'ouverture des documents de référence (docRefs) sur un chapitre ultérieur (ex: Chapitre 8 - `<video>`), garantissant l'activation globale du câblage de documentation.

### Nettoyage automatique de la base (`e2e/global-setup.ts`)

Pour garantir l'idempotence des tests E2E, un script global de configuration `e2e/global-setup.ts` est exécuté avant le début des tests. Ce script :
- Se connecte directement à la base PostgreSQL de test en utilisant `pg` (pour éviter le chargement de la couche Next.js/server-only).
- Supprime l'utilisateur de test existant (`e2e-test-user`).
- Crée un utilisateur de test propre (`e2e@codeforge.test`), pré-vérifié (`emailVerified` à `NOW()`) et ayant passé l'onboarding pour empêcher les modales d'onboarding de bloquer l'interaction avec l'éditeur de code lors de l'exécution automatique.

---

## 3. Intégration Continue (CI/CD)

Le workflow `.github/workflows/ci.yml` s'exécute automatiquement sur GitHub Actions à chaque `push` ou `pull_request` sur les branches `main` et `dev`. Il contient deux jobs majeurs exécutés en parallèle sur un environnement `ubuntu-latest` :

### Job 1 : Qualité (Lint & tests unitaires)
- **Objectif** : Valider l'intégrité du code statique et la logique pure.
- **Étapes** :
  1. Récupération du code source (`actions/checkout`).
  2. Installation de `pnpm` (v10) et configuration de Node.js (v22).
  3. Installation des dépendances avec verrouillage strict (`pnpm install --frozen-lockfile`).
  4. Génération du client Prisma (`pnpm prisma generate`) pour le typage TypeScript.
  5. Analyse statique du code (`pnpm lint`).
  6. Vérification des types TypeScript (`pnpm typecheck`).
  7. Exécution des **206 tests unitaires** (`pnpm test:run`).
  8. Compilation de l'application (`pnpm build`) avec des variables factices (`DATABASE_URL` et `AUTH_SECRET`).

### Job 2 : Tests E2E
- **Objectif** : Lancer l'application complète et valider les fonctionnalités utilisateurs sur navigateur.
- **Service Container** : Un conteneur **PostgreSQL 16** est automatiquement démarré en service GitHub Actions pour servir de base de données.
- **Étapes** :
  1. Récupération du code, installation de `pnpm` et de Node.js (v22).
  2. Installation des dépendances (`--frozen-lockfile`) et génération de Prisma.
  3. Déploiement des migrations de base de données (`pnpm prisma migrate deploy`) sur le conteneur PostgreSQL de service.
  4. Installation du navigateur Playwright (Chromium) et de ses dépendances système.
  5. Exécution des **8 tests de bout en bout** (`pnpm test:e2e`).

