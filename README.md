# La Forge du Code

Plateforme web d'apprentissage du code, sur un thème spatial rétro (pixel-art).
L'apprenant progresse dans des cursus, écrit du code dans un éditeur intégré, le
fait **valider en direct**, et gagne de l'XP et des badges au fil des missions.

> Projet fil rouge — application Next.js full-stack.

---

## ✨ Fonctionnalités

- **Authentification complète** : inscription, vérification d'email, connexion, mot de passe oublié / réinitialisation.
- **4 cursus complets** (HTML, CSS, JavaScript, React) + **10 cursus en aperçu** — chapitre pilote (TypeScript, Git, SQL, Node.js, Tests, DevOps, MongoDB, Sécurité, Python, Algo), signalés « Aperçu » dans le catalogue.
- **Éditeur de code intégré** (Monaco) avec **validation des exercices en direct**.
- **Exécution sécurisée du code étudiant** dans un sandbox isolé (iframe à origine opaque).
- **Gamification** : XP, niveaux, séries (streak), badges, classement.
- **Avatar personnalisable** (espèce, rôle, couleur).

## 🧱 Stack technique

| Domaine | Technologies |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Authentification | Auth.js v5 (Credentials + bcrypt), sessions JWT |
| Base de données | PostgreSQL via Prisma (`@prisma/adapter-pg`) |
| Email | Resend (emails transactionnels) |
| UI | Tailwind CSS v4, Monaco Editor, Three.js |
| Qualité | Vitest, ESLint, GitHub Actions (CI) |

## 🚀 Démarrage rapide

**Prérequis :** Node.js 22+, pnpm, une base PostgreSQL.

```bash
# 1. Variables d'environnement
cp .env.example .env      # puis renseigne DATABASE_URL, AUTH_SECRET, RESEND_API_KEY, ...

# 2. Dépendances
pnpm install

# 3. Base de données (applique les migrations Prisma)
pnpm prisma migrate deploy   # ou `pnpm prisma migrate dev` en développement

# 4. Lancer le serveur de développement
pnpm dev
```

Ouvre ensuite [http://localhost:3000](http://localhost:3000).

## 📜 Scripts

| Script | Action |
|---|---|
| `pnpm dev` | serveur de développement |
| `pnpm build` | build de production |
| `pnpm start` | lance le build de production |
| `pnpm lint` | analyse ESLint |
| `pnpm test` | tests unitaires (Vitest, mode watch) |
| `pnpm test:run` | tests unitaires (exécution unique, utilisée par la CI) |

## 🧪 Tests

Tests unitaires avec **Vitest** sur les fonctions pures (validateurs, XP, helpers).
Détails et périmètre dans [`docs/TESTING.md`](docs/TESTING.md).

```bash
pnpm test:run
```

## 🗂️ Structure du projet

```
app/                Pages (App Router), routes API, layouts
components/         Composants UI, éditeur, leçon, onboarding
data/courses/       Contenu pédagogique : cursus → chapitres → étapes
lib/                Logique serveur : auth, validators, tokens, email, db, xp
lib/validators/     Validateurs d'exercices (un par étape)
lib/sandbox/        Exécution isolée du code étudiant
prisma/             Schéma et migrations
docs/               Documentation technique et de soutenance
auth.ts / auth.config.ts / proxy.ts   Auth.js + middleware
```

## 📚 Documentation

| Document | Sujet |
|---|---|
| [`docs/AUTH_REPORT.md`](docs/AUTH_REPORT.md) | Authentification (technologie, choix, sécurité) |
| [`docs/SANDBOX_REPORT.md`](docs/SANDBOX_REPORT.md) | Exécution sécurisée du code étudiant |
| [`docs/PEDAGOGY_ENGINE.md`](docs/PEDAGOGY_ENGINE.md) | Moteur pédagogique / validateurs |
| [`docs/ARCHITECTURE.svg`](docs/ARCHITECTURE.svg) | Schéma d'architecture |
| [`docs/AUTH_SEQUENCE.svg`](docs/AUTH_SEQUENCE.svg) | Diagramme de séquence (auth) |
| [`docs/USE_CASE.svg`](docs/USE_CASE.svg) | Diagramme de cas d'usage |
| [`docs/MCD.svg`](docs/MCD.svg) · [`docs/MLD.svg`](docs/MLD.svg) | Modèles de données |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Mise en production |
| [`docs/TESTING.md`](docs/TESTING.md) | Tests & CI |
| [`docs/RGPD.md`](docs/RGPD.md) | Conformité données personnelles |
| [`docs/SOUTENANCE_CHECKLIST.md`](docs/SOUTENANCE_CHECKLIST.md) | Checklist des livrables |

## ☁️ Déploiement

Guide complet dans [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) (variables d'environnement,
domaine d'envoi Resend, migrations, build).

## 📄 Licence

Voir le fichier [`LICENSE`](LICENSE).
