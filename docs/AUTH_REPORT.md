# Rapport technique — Authentification

**Projet :** CodeForge / Nebula Command
**Périmètre :** mécanisme d'authentification, d'autorisation et de gestion de compte
**Date :** 2026-06-17

---

## 1. Synthèse

L'application utilise **Auth.js (NextAuth v5)** avec un fournisseur **Credentials** (email + mot de passe), des mots de passe hachés en **bcrypt**, une **vérification d'email obligatoire** et un **reset de mot de passe** par lien à usage unique, le tout envoyé par **Resend**. Les sessions sont gérées en **JWT** (sans table de session active), et l'accès aux pages protégées est filtré par un **middleware** (`proxy.ts`).

La pile complète :

| Couche | Technologie | Rôle |
|---|---|---|
| Framework | Next.js 16 (App Router) | Pages, routes API, middleware |
| Auth | Auth.js / NextAuth `5.0.0-beta` | Orchestration login, sessions, callbacks |
| Fournisseur | Credentials provider | Email + mot de passe (pas d'OAuth) |
| Hachage | `bcryptjs` (coût 12) | Stockage sécurisé des mots de passe |
| Validation | `zod` | Validation stricte des entrées |
| Base de données | PostgreSQL via Prisma + `@prisma/adapter-pg` | Persistance utilisateurs / tokens |
| Adaptateur | `@auth/prisma-adapter` | Pont Auth.js ↔ Prisma |
| Email | Resend | Emails transactionnels (vérif, reset) |
| Sessions | JWT (stratégie `jwt`) | Pas de session serveur à interroger |

---

## 2. Choix de la technologie et justifications

### 2.1 Pourquoi Auth.js (NextAuth) plutôt qu'une solution maison ou un SaaS

Auth.js est la solution d'authentification de référence de l'écosystème Next.js. Elle a été retenue pour trois raisons :

- **Intégration native App Router / middleware.** Auth.js v5 expose un helper `auth()` utilisable aussi bien dans les Server Components que dans le middleware, ce qui évite de réimplémenter la lecture de session à plusieurs endroits.
- **Sécurité éprouvée par défaut.** Gestion des cookies `httpOnly`/`secure`, signature/chiffrement des JWT, protection CSRF intégrée : autant de pièges qu'une implémentation maison aurait dû gérer à la main.
- **Pas de dépendance à un tiers payant.** Contrairement à un Auth0/Clerk/Supabase Auth, les données d'authentification restent dans **notre** base PostgreSQL, ce qui est pertinent pour un projet pédagogique et pour la maîtrise des coûts.

### 2.2 Pourquoi le fournisseur Credentials (et pas OAuth)

Le projet cible un public d'apprenants qui crée un compte dédié. Le **Credentials provider** (email + mot de passe) est le choix logique :

- pas de dépendance à un compte Google/GitHub externe ;
- contrôle total sur la politique de mot de passe et le cycle de vie du compte ;
- cohérence pédagogique : le cursus contient un cours « Sécurité » qui enseigne précisément le hachage bcrypt — l'app pratique ce qu'elle enseigne.

Le schéma de base conserve néanmoins les tables `Account`/`Session` du standard Auth.js, ce qui permettrait d'**ajouter un provider OAuth plus tard sans migration lourde**.

### 2.3 Pourquoi des sessions JWT et non des sessions en base

La stratégie de session est `jwt` (définie dans `auth.config.ts`). Conséquences :

- la session vit dans un **cookie signé**, lu sans requête base de données → middleware rapide et compatible « edge » ;
- pas de table de sessions actives à interroger ni à nettoyer à chaque navigation.

Le compromis assumé : on ne peut pas révoquer une session individuelle côté serveur avant son expiration (limite documentée plus bas). Pour l'échelle du projet, le gain de simplicité et de performance l'emporte.

### 2.4 Pourquoi bcrypt (coût 12)

`bcryptjs` est utilisé avec un **facteur de coût 12**. C'est un point de durcissement explicite : le coût 12 est le réglage recommandé en 2026, plus lent que le coût 10 par défaut mais nettement plus coûteux à brute-forcer. Le hachage est appliqué à l'inscription **et** à chaque reset de mot de passe.

### 2.5 Pourquoi Resend pour l'email

Les emails de vérification et de reset sont transactionnels et critiques (un email non délivré casse l'inscription). Resend offre une API simple, un domaine d'envoi vérifiable (SPF/DKIM) et un mode dev (`onboarding@resend.dev`). Le client est instancié de manière paresseuse et mis en cache (`lib/email.ts`), et les emails utilisent des **styles inline** car la plupart des clients mail suppriment les `<style>`.

### 2.6 Pourquoi l'adaptateur `@prisma/adapter-pg`

`lib/db.ts` instancie Prisma au-dessus d'un **pool `pg`** via `PrismaPg`. Cela permet d'utiliser un pooler de connexions (Supabase Transaction Pooler, Neon) en production, tout en gardant un singleton Prisma en développement pour éviter d'épuiser les connexions au rechargement à chaud.

---

## 3. Architecture

### 3.1 La séparation en trois fichiers

Le découpage est volontaire et lié aux contraintes du runtime « edge » de Next.js (le middleware ne peut pas exécuter Prisma ni bcrypt) :

- **`auth.config.ts` — configuration « edge-safe ».** Ne contient **aucune** dépendance lourde (ni Prisma, ni bcrypt). Définit la stratégie de session (`jwt`), la page de connexion, et les callbacks `jwt`/`session` qui propagent `id` et `username` dans le token puis dans la session. C'est cette config légère qu'importe le middleware.
- **`auth.ts` — configuration serveur complète.** Étend `authConfig`, branche l'adaptateur Prisma et déclare le **Credentials provider** avec toute la logique sensible : rate-limiting, validation Zod, lecture utilisateur, comparaison bcrypt, blocage si email non vérifié. Exporte `handlers`, `auth`, `signIn`, `signOut`.
- **`proxy.ts` — le middleware.** (Nouvelle convention Next.js, remplace `middleware.ts`.) Protège les préfixes `/dashboard`, `/learn`, `/profil`, `/leaderboard`, `/avatar` : redirige vers `/login?from=…` si non connecté, et renvoie les pages `/login`/`/signup` vers `/dashboard` si déjà connecté. Le `matcher` exclut les routes API, les assets statiques et les sprites.

### 3.2 Modèle de données (Prisma / PostgreSQL)

- **`User`** — identité + champs applicatifs : `email` (unique), `username` (unique), `password` (haché, nullable pour un futur compte OAuth), `emailVerified` (null tant que non vérifié), plus la gamification (xp, streak…) et l'avatar.
- **`OneTimeToken`** — tokens à usage unique pour la **vérification d'email** et le **reset de mot de passe**. Champs : `token` (unique), `kind`, `expiresAt`, `usedAt`. C'est le cœur de la sécurité des liens email.
- **`Account` / `Session` / `VerificationToken`** — tables standard de l'adaptateur Auth.js. `Session` est inutilisée en pratique (stratégie JWT) mais conservée pour compatibilité et évolution OAuth. Toutes les relations utilisateur sont en `ON DELETE CASCADE`.

---

## 4. Flux fonctionnels

### 4.1 Inscription (`POST /api/signup`)

1. **Rate-limit** : 5 comptes / heure / IP.
2. **Validation Zod** : email (≤254 car.), username (2–16, `[a-zA-Z0-9_-]`), mot de passe (8–128 car., **au moins une lettre et un chiffre**).
3. **Unicité** : rejet si l'email ou le pseudo existe déjà (409 avec le champ fautif).
4. **Hachage** bcrypt coût 12, création de l'utilisateur (`emailVerified` reste null).
5. Création d'un **token `email_verify`** (TTL 24 h) et envoi de l'email de vérification.
6. Réponse indiquant si l'email est bien parti (l'UI affiche « Vérifie ton email »).

### 4.2 Vérification d'email (`/verify-email/[token]`)

Le token est **consommé atomiquement** (`consumeToken`) : on vérifie qu'il existe, qu'il est du bon type, **non utilisé** et **non expiré**, puis on le marque utilisé via un `updateMany … where usedAt: null` — ce qui garantit qu'une requête concurrente ne peut pas le rejouer. `emailVerified` passe alors à la date courante.

### 4.3 Connexion (`signIn` → `authorize` dans `auth.ts`)

1. **Rate-limit** : 10 tentatives / 5 min / IP, appliqué **avant** bcrypt pour limiter le brute-force.
2. Validation Zod des identifiants.
3. Lecture de l'utilisateur par email (en minuscules).
4. **`bcrypt.compare`** du mot de passe.
5. **Blocage si `emailVerified` est null** : on lève une erreur `CredentialsSignin("email_unverified")`. La page `/login` peut alors afficher un message spécifique et un bouton « renvoyer la vérification » (via l'endpoint `check-verification`).
6. En cas de succès, `id`/`username` sont injectés dans le JWT.

### 4.4 Mot de passe oublié (`POST /api/auth/forgot-password`)

Endpoint **anti-énumération** : il renvoie **toujours `200`**, qu'il existe un compte ou non, pour ne jamais révéler quels emails sont enregistrés. Rate-limit de 5 req / 15 min / IP. Un email de reset n'est réellement envoyé que si l'utilisateur existe **et** possède un mot de passe (compte credentials). Token `password_reset` à TTL **1 h**.

### 4.5 Réinitialisation (`POST /api/auth/reset-password`)

Consommation atomique du token `password_reset`, re-hachage bcrypt coût 12, mise à jour du mot de passe. Effet de bord utile : le reset **confirme aussi la propriété de l'email** (`emailVerified` est positionné), puisque seul le titulaire de la boîte mail a pu recevoir le lien.

### 4.6 Renvoi d'email de vérification

`createToken` **invalide les anciens tokens non utilisés** du même type avant d'en émettre un nouveau : redemander un email tue l'ancien lien, ce qui empêche le rejeu de liens périmés.

---

## 5. Sécurité

| Mesure | Détail | Emplacement |
|---|---|---|
| Hachage fort | bcrypt **coût 12**, jamais de mot de passe en clair | `app/api/signup`, `reset-password`, `auth.ts` |
| Politique de mot de passe | 8–128 car., ≥1 lettre + ≥1 chiffre | schémas Zod |
| Vérification email obligatoire | login bloqué tant que `emailVerified` est null | `auth.ts` |
| Tokens à usage unique | usage unique **atomique**, expiration, invalidation des anciens | `lib/tokens.ts` |
| Rate-limiting | login, signup, forgot, check-verification (par IP) | `lib/rate-limit.ts` |
| Anti-énumération | `forgot-password` répond toujours 200 | `app/api/auth/forgot-password` |
| Sessions | JWT signé en cookie `httpOnly` | `auth.config.ts` |
| En-têtes HTTP | CSP (prod), HSTS, X-Frame-Options DENY, nosniff, Permissions-Policy | `next.config.ts` |
| Isolation du code étudiant | exécution dans une iframe `sandbox` (hors périmètre auth mais protège la session) | runner de leçon |

**Throttle avant bcrypt.** Détail important : sur le login et `check-verification`, le rate-limit est évalué **avant** d'exécuter `bcrypt.compare` (coûteux), pour ne pas transformer le hachage lui-même en vecteur de déni de service.

---

## 6. Limites connues et pistes d'amélioration

- **Rate-limiter en mémoire.** `lib/rate-limit.ts` stocke les compteurs dans la mémoire du processus. Sur un déploiement **horizontalement scalé / serverless** (plusieurs instances Vercel), chaque instance a ses propres compteurs, donc la limite effective est multipliée par le nombre d'instances. Pour des garanties strictes : adosser à un store partagé (Upstash Redis ou une table Postgres) — l'API publique resterait identique.
- **Pas de révocation de session.** La stratégie JWT ne permet pas d'invalider une session précise avant expiration. Si besoin (ex. « déconnecter tous mes appareils »), passer à des sessions en base ou ajouter une liste de révocation.
- **Pas de 2FA / MFA.** Aucune double authentification. Une étape TOTP serait un ajout naturel pour un produit en production.
- **Force du mot de passe minimale.** La règle « lettre + chiffre » est volontairement simple. On pourrait y ajouter un score (zxcvbn) ou une vérification contre les fuites connues (HaveIBeenPwned k-anonymity).
- **Pas d'OAuth.** Les tables sont prêtes ; ajouter Google/GitHub améliorerait la conversion à l'inscription.

---

## 7. Fichiers de référence

| Fichier | Contenu |
|---|---|
| `auth.config.ts` | Config edge-safe (sessions, callbacks) |
| `auth.ts` | Provider Credentials, bcrypt, blocage email non vérifié |
| `proxy.ts` | Middleware de protection des routes |
| `lib/db.ts` | Client Prisma + pool pg |
| `lib/tokens.ts` | Création / consommation des tokens à usage unique |
| `lib/email.ts` | Envoi des emails transactionnels (Resend) |
| `lib/rate-limit.ts` | Limiteur de débit en mémoire |
| `app/api/signup/route.ts` | Inscription |
| `app/api/auth/forgot-password/route.ts` | Demande de reset (anti-énumération) |
| `app/api/auth/reset-password/route.ts` | Réinitialisation |
| `app/api/auth/check-verification/route.ts` | Détection « email non vérifié » au login |
| `prisma/schema.prisma` | Modèles User / OneTimeToken / Account / Session |
