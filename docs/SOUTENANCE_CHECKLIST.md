# Checklist des livrables — Projet fil rouge (CodeForge / Nebula Command)

Liste complète des documents et éléments à produire pour le projet et sa soutenance.

**Légende :** ✅ fait · 🟡 partiel / à finaliser · ⬜ à faire

---

## 1. Gestion de projet

- ⬜ **Cahier des charges** — contexte, problème résolu, objectifs, périmètre (in/out of scope).
- ⬜ **Expression du besoin / personas** — qui sont les apprenants visés, leurs besoins.
- ⬜ **Planning / méthodologie** — découpage en phases, méthode (agile ?), diagramme de Gantt ou jalons.
- ✅ **Workflow Git** — branches structurées en place. Stratégie de branchement, conventions de commits et processus de revue documentés dans [GIT_WORKFLOW.md](file:///c:/Users/joan7/Desktop/projet%20fil%20rouge/codeforge/docs/GIT_WORKFLOW.md).
- ✅ **Journal des évolutions** — `CHANGELOG.md`.

## 2. Conception fonctionnelle

- ⬜ **Spécifications fonctionnelles** — user stories, règles de gestion.
- ✅ **Diagramme de cas d'utilisation (UML)** — acteurs (visiteur, apprenant) × fonctionnalités.
- 🟡 **Parcours utilisateur** — `PAGES_FLOW.md` (carte du parcours + tests par page) ✅ ; manque éventuellement des maquettes/wireframes formalisés.
- ✅ **Direction artistique / design** — `PIXEL_ART_GUIDE.md`, `pixel_art_requirements.md`, `palette/`, `walkthrough.md`, `implementation_plan.md`.

## 3. Conception technique

- ✅ **Modèle conceptuel de données (MCD)** — `MCD.svg`.
- ✅ **Modèle logique de données (MLD)** — `MLD.svg`.
- ✅ **Diagramme d'architecture** — schéma global (client Next.js, Server Components, API routes, middleware, Prisma, Postgres, Resend).
- ✅ **Diagramme de séquence** — au moins pour les flux d'auth (inscription → vérif → login) et la validation d'un exercice.
- 🟡 **Justification de la stack** — présente dans `AUTH_REPORT.md` pour l'auth ; à généraliser (Next.js, Prisma, Tailwind, Three.js…).

## 4. Sécurité

- ✅ **Authentification** — `AUTH_REPORT.md` (rapport technique complet).
- ✅ **Sécurité de l'exécution du code étudiant (sandbox)** — `SANDBOX_REPORT.md` (iframe `sandbox`, origine null, CSP, timeout, modèle de menaces).
- ✅ **Durcissement production** — `PROD_HARDENING_AUDIT.md` (headers HTTP, politique mot de passe, rate-limiting).
- ⬜ **Analyse de risques / OWASP** — revue rapide des risques (XSS, injection, brute-force, énumération) et des contre-mesures.

## 5. Cœur métier

- ✅ **Moteur pédagogique / validateurs** — `PEDAGOGY_ENGINE.md` (contrat Validator, exécuté vs statique, XP).
- ⬜ **Système de gamification** — XP, niveaux, streak, badges, leaderboard (logique et persistance `StepCompletion`/`UserBadge`).
- 🟡 **Contenu pédagogique** — état des cursus : 4 cursus étoffés (JS, CSS, HTML, React), 10 cursus à 1 chapitre. À mentionner honnêtement comme chantier en cours.

## 6. Qualité & tests

- 🟡 **Tests manuels** — `SMOKE_TEST.md` (check-list exhaustive) ✅ ; mais aucun test **automatisé**.
- ✅ **Tests unitaires** — 206 tests unitaires opérationnels (Vitest) couvrant les validateurs, la logique de mission, le calcul d'XP, les tokens, etc. (cf. [TESTING.md](file:///c:/Users/joan7/Desktop/projet%20fil%20rouge/codeforge/docs/TESTING.md)).
- ✅ **Test e2e du parcours** — 8 tests de bout en bout (Playwright) validant le parcours d'apprentissage complet (dont le chapitre 1 HTML pas à pas) avec nettoyage/seed automatique de la base.
- ✅ **CI/CD** — Pipeline GitHub Actions (`.github/workflows/ci.yml`) pleinement opérationnel avec des jobs parallèles de qualité (lint, typecheck, tests unitaires, build) et E2E (avec service PostgreSQL 16 et tests Playwright).
- ✅ **Stratégie de tests** — Document détaillé présentant l'approche de tests unitaires et E2E disponible dans [TESTING.md](file:///c:/Users/joan7/Desktop/projet%20fil%20rouge/codeforge/docs/TESTING.md).

## 7. Conformité & juridique

- 🟡 **RGPD** — `RGPD.md` (note de cadrage) ; finalité des données (email, mot de passe haché), durée de conservation, droit à l'effacement (le `ON DELETE CASCADE` aide).
- ⬜ **Mentions légales / politique de confidentialité** — page ou document.
- ✅ **LICENSE** — licence propriétaire (tous droits réservés) à la racine.

## 8. Documentation produit

- ✅ **README** — `README.md` personnalisé (présentation, stack, démarrage, index des docs).
- ✅ **Guide d'installation / setup dev** — Disponible à la racine dans le [README.md](file:///c:/Users/joan7/Desktop/projet%20fil%20rouge/codeforge/README.md) sous la section "Démarrage rapide".
- ✅ **Guide de déploiement** — `DEPLOYMENT.md`.
- ⬜ **Manuel utilisateur** — prise en main côté apprenant (court).
- ✅ **Consignes pour assistants IA** — `AGENTS.md` / `CLAUDE.md`.

## 9. Livrables de soutenance

- ⬜ **Support de présentation (slides)** — déroulé : contexte → démo → technique → sécurité → bilan.
- ⬜ **Scénario de démonstration** — parcours scripté qui ne plante pas (compte de test, cursus complet à montrer).
- ⬜ **Vidéo de démo (backup)** — au cas où la démo live échoue.
- ⬜ **Bilan & perspectives** — ce qui est fait, les limites assumées, la roadmap (cursus à compléter, tests, OAuth, 2FA).
- ⬜ **Veille / état de l'art** — alternatives existantes (Codecademy, freeCodeCamp…) et ton positionnement.

---

## Résumé des priorités

**Déjà solide :** auth, modèle de données (MCD/MLD), déploiement, durcissement prod, design, parcours utilisateur, smoke tests.

**Les chantiers restants à finaliser avant la soutenance :**

1. **Diagrammes UML (cas d'usage, séquence, architecture)** — attendus en soutenance.
2. **Veille / état de l'art** — positionnement face à Codecademy, freeCodeCamp, etc.
3. **Supports de soutenance** — slides, scénario de démo scripté et vidéo de secours.
4. **Bilan & perspectives** — définition de la roadmap post-soutenance (cursus complémentaires, OAuth, 2FA).
