# Checklist des livrables — Projet fil rouge (CodeForge / Nebula Command)

Liste complète des documents et éléments à produire pour le projet et sa soutenance.

**Légende :** ✅ fait · 🟡 partiel / à finaliser · ⬜ à faire

---

## 1. Gestion de projet

- ⬜ **Cahier des charges** — contexte, problème résolu, objectifs, périmètre (in/out of scope).
- ⬜ **Expression du besoin / personas** — qui sont les apprenants visés, leurs besoins.
- ⬜ **Planning / méthodologie** — découpage en phases, méthode (agile ?), diagramme de Gantt ou jalons.
- 🟡 **Workflow Git** — branches structurées déjà en place (`feat/*`, `fix/*`, `docs/*`) ; à documenter (convention de commits, stratégie de merge).
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
- 🟡 **Tests unitaires** — notamment sur les validateurs et les tokens (cibles idéales).
- ⬜ **Test e2e du parcours** — signup → chapitre → sauvegarde de progression (déjà identifié comme manquant dans l'audit prod).
- ✅ **CI/CD** — pipeline (GitHub Actions) : lint + build + tests à chaque push. Aucun `.github/workflows` actuellement.
- 🟡 **Stratégie de tests** — document expliquant la pyramide de tests visée (cohérent avec ton cursus « Tests »).

## 7. Conformité & juridique

- 🟡 **RGPD** — `RGPD.md` (note de cadrage) ; finalité des données (email, mot de passe haché), durée de conservation, droit à l'effacement (le `ON DELETE CASCADE` aide).
- ⬜ **Mentions légales / politique de confidentialité** — page ou document.
- ✅ **LICENSE** — licence propriétaire (tous droits réservés) à la racine.

## 8. Documentation produit

- ✅ **README** — `README.md` personnalisé (présentation, stack, démarrage, index des docs).
- ⬜ **Guide d'installation / setup dev** — prérequis, `.env`, `pnpm install`, migrations Prisma, lancement.
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

**Les 5 manques les plus importants à combler :**

1. **Rapport sandbox / sécurité d'exécution** — sujet à plus fort impact, le compléter en priorité.
2. **Doc du moteur pédagogique (validateurs)** — le cœur métier, actuellement non documenté.
3. **Tests automatisés + CI** — seul vrai point faible technique, à au moins amorcer.
4. **Diagrammes UML (cas d'usage, séquence, architecture)** — attendus en soutenance.
5. **README personnalisé + RGPD/LICENSE** — finitions de présentation et de conformité.
