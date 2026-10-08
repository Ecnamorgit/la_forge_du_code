# Checklist des livrables — Projet fil rouge (La Forge du Code / Nebula Command)

Liste complète des documents et éléments à produire pour le projet et sa soutenance.

**Légende :** `[x]` fait · `[ ]` à faire · « (partiel) » : commencé, à finaliser

---

## 1. Gestion de projet

- [ ] **Cahier des charges** — contexte, problème résolu, objectifs, périmètre (in/out of scope).
- [ ] **Expression du besoin / personas** — qui sont les apprenants visés, leurs besoins.
- [ ] **Planning / méthodologie** — découpage en phases, méthode (agile ?), diagramme de Gantt ou jalons.
- [x] **Workflow Git** — branches structurées en place. Stratégie de branchement, conventions de commits et processus de revue documentés dans [GIT_WORKFLOW.md](GIT_WORKFLOW.md).
- [ ] **Journal des évolutions** — pas de `CHANGELOG.md` ; l'historique Git (commits conventionnels, cf. [GIT_WORKFLOW.md](GIT_WORKFLOW.md)) en tient lieu pour l'instant.

## 2. Conception fonctionnelle

- [ ] **Spécifications fonctionnelles** — user stories, règles de gestion.
- [x] **Diagramme de cas d'utilisation (UML)** — acteurs (visiteur, apprenant) × fonctionnalités (`USE_CASE.svg`).
- [ ] **Parcours utilisateur** (partiel) — `PAGES_FLOW.md` (carte du parcours + tests par page) fait ; manque éventuellement des maquettes/wireframes formalisés.
- [x] **Direction artistique / design** — `PIXEL_ART_GUIDE.md`, `pixel_art_requirements.md`, `palette/`.

## 3. Conception technique

- [x] **Modèle conceptuel de données (MCD)** — `MCD.svg`.
- [x] **Modèle logique de données (MLD)** — `MLD.svg`.
- [x] **Diagramme d'architecture** — schéma global (client Next.js, Server Components, API routes, middleware, Prisma, Postgres, Resend) : `ARCHITECTURE.svg`.
- [ ] **Diagramme de séquence** (partiel) — flux d'auth (inscription → vérif → login) fait dans `AUTH_SEQUENCE.svg` ; reste la validation d'un exercice.
- [ ] **Justification de la stack** (partiel) — présente dans `AUTH_REPORT.md` pour l'auth ; à généraliser (Next.js, Prisma, Tailwind, Three.js…).

## 4. Sécurité

- [x] **Authentification** — `AUTH_REPORT.md` (rapport technique complet).
- [x] **Sécurité de l'exécution du code étudiant (sandbox)** — `SANDBOX_REPORT.md` (iframe `sandbox`, origine dédiée, CSP, interruption des boucles, modèle de menaces).
- [x] **Durcissement production** — `PROD_HARDENING_AUDIT.md` (passage à PostgreSQL, revue des validateurs, isolation du sandbox, gestion des erreurs API).
- [x] **Analyse de risques / OWASP** — audit de sécurité du 2026-09-12 et corrections : [audit-securite/README.md](audit-securite/README.md) (XSS, CSP, brute-force, énumération, CSRF, RLS, dépendances).

## 5. Cœur métier

- [x] **Moteur pédagogique / validateurs** — `PEDAGOGY_ENGINE.md` (contrat Validator, exécuté vs statique, XP).
- [ ] **Système de gamification** — XP, niveaux, streak, badges, leaderboard (logique et persistance `StepCompletion`/`UserBadge`).
- [ ] **Contenu pédagogique** (partiel) — état des cursus : 4 cursus étoffés (JS, CSS, HTML, React), 10 cursus à 1 chapitre. À présenter comme chantier en cours.

## 6. Qualité & tests

- [x] **Tests manuels** — `SMOKE_TEST.md` (check-list exhaustive).
- [x] **Tests unitaires** — 1 525 tests unitaires (Vitest) couvrant les validateurs, le briefing du jour, le calcul d'XP, les tokens, le bac à sable, etc. (cf. [TESTING.md](TESTING.md)).
- [x] **Test e2e du parcours** — 50 tests de bout en bout (Playwright) validant le parcours d'apprentissage (dont le chapitre 1 HTML pas à pas) et les contrôles de sécurité, avec nettoyage/seed automatique de la base.
- [x] **CI/CD** — pipeline GitHub Actions (`.github/workflows/ci.yml`) : job qualité (lint, typecheck, tests unitaires, build) et job E2E (service PostgreSQL 16, tests Playwright contre un build de production), en parallèle.
- [x] **Stratégie de tests** — approche des tests unitaires et E2E décrite dans [TESTING.md](TESTING.md).

## 7. Conformité & juridique

- [ ] **RGPD** (partiel) — `RGPD.md` (note de cadrage) : finalité des données (email, mot de passe haché), droit à l'effacement (suppression du compte depuis le profil) et portabilité (export JSON) en place ; durée de conservation et politique de confidentialité à finaliser.
- [ ] **Mentions légales / politique de confidentialité** — page ou document.
- [x] **LICENSE** — licence propriétaire (tous droits réservés) à la racine.

## 8. Documentation produit

- [x] **README** — `README.md` personnalisé (présentation, stack, démarrage, index des docs).
- [x] **Guide d'installation / setup dev** — à la racine dans le [README.md](../README.md), section « Démarrage rapide ».
- [x] **Guide de déploiement** — `DEPLOYMENT.md`.
- [ ] **Manuel utilisateur** — prise en main côté apprenant (court).
- [x] **Fichiers `AGENTS.md` / `CLAUDE.md`** — générés par Next.js.

## 9. Livrables de soutenance

- [ ] **Support de présentation (slides)** — déroulé : contexte → démo → technique → sécurité → bilan.
- [ ] **Scénario de démonstration** — parcours scripté qui ne plante pas (compte de test, cursus complet à montrer).
- [ ] **Vidéo de démo (backup)** — au cas où la démo live échoue.
- [ ] **Bilan & perspectives** — ce qui est fait, les limites assumées, la roadmap (cursus à compléter, tests, OAuth, 2FA).
- [ ] **Veille / état de l'art** — alternatives existantes (Codecademy, freeCodeCamp…) et ton positionnement.

---

## Résumé des priorités

**Déjà en place :** auth, modèle de données (MCD/MLD), diagrammes UML (cas d'usage, architecture, séquence d'auth), déploiement, durcissement prod, audit de sécurité, tests unitaires et e2e, CI, design, parcours utilisateur, smoke tests.

**Chantiers restants avant la soutenance :**

1. **Diagramme de séquence de la validation d'un exercice.**
2. **Veille / état de l'art** — positionnement face à Codecademy, freeCodeCamp, etc.
3. **Supports de soutenance** — slides, scénario de démo scripté et vidéo de secours.
4. **Bilan & perspectives** — définition de la roadmap post-soutenance (cursus complémentaires, OAuth, 2FA).
