# CodeForge — Mise en production

Guide pour déployer Nebula Command (CodeForge) en production. À suivre dans l'ordre.

---

## 1. Variables d'environnement (provider, PAS de `.env` commité)

Configure ces variables dans le dashboard de l'hébergeur (Vercel → _Project Settings → Environment Variables_, ou Render/Railway → _Environment_). **Ne jamais uploader le fichier `.env`.**

| Variable | Obligatoire | Valeur de prod |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | Connexion **poolée** (Supabase Transaction Pooler, port `6543`, `?pgbouncer=true`). Lue par l'app au runtime. |
| `DIRECT_URL` | ✅ | Connexion **directe** (port `5432`). Utilisée par `prisma migrate deploy`. |
| `AUTH_SECRET` | ✅ | **Nouveau** secret unique, jamais celui de dev. Génère-le avec `openssl rand -base64 32`. |
| `AUTH_TRUST_HOST` | ✅ | `true` (derrière le proxy Vercel). |
| `RESEND_API_KEY` | ✅ | Clé Resend de prod (`re_...`). |
| `RESEND_FROM_EMAIL` | ✅ | Expéditeur sur **domaine vérifié** (ex. `Nebula Command <noreply@mail.codeforge.com>`). `onboarding@resend.dev` n'envoie qu'au compte propriétaire. |
| `APP_URL` | ✅ | URL HTTPS publique **sans slash final** (ex. `https://codeforge.space`). Sert à construire les liens d'email — un mauvais réglage casse la vérification et le reset. |
| `UPSTASH_REDIS_REST_URL` | ⚠️ multi-instance | Rate-limiter partagé (CF-7). Requis sur déploiement **serverless/multi-instance** (Vercel) pour que la limite soit respectée entre instances. Absent → fallback mémoire (OK en mono-instance). |
| `UPSTASH_REDIS_REST_TOKEN` | ⚠️ multi-instance | Token REST Upstash, va de pair avec l'URL ci-dessus. |
| `SENTRY_DSN` | ⬜ optionnel | Monitoring d'erreurs serveur (CF-10). Absent → inerte (erreurs loggées via `lib/logger.ts`). Présent → init Sentry + remontée via `onRequestError`. |
| `SENTRY_TRACES_SAMPLE_RATE` | ⬜ optionnel | Taux d'échantillonnage des traces (défaut `0.1`). |

> **AUTH_SECRET** : générer une valeur dédiée à la prod et la garder secrète. Si elle fuite, toutes les sessions deviennent forgeables → régénérer immédiatement (invalide les sessions existantes).

---

## 2. Vérifier le domaine d'envoi (Resend)

1. Resend → _Domains_ → ajouter `mail.codeforge.com` (ou ton domaine).
2. Ajouter les enregistrements DNS (SPF, DKIM) fournis.
3. Attendre la validation, puis pointer `RESEND_FROM_EMAIL` dessus.

Sans ça, les emails de vérification ne partiront pas aux vrais utilisateurs.

---

## 3. Appliquer les migrations de base de données (runbook)

Prérequis : `DIRECT_URL` pointe sur la connexion **directe** (port `5432`), pas la connexion poolée. `migrate deploy` ouvre des connexions longues incompatibles avec le pooler transactionnel (`pgbouncer`).

```bash
# 1. Générer le client Prisma (idempotent) :
pnpm prisma generate

# 2. Inspecter l'état (quelles migrations sont en attente) :
pnpm prisma migrate status

# 3. Appliquer les migrations en attente sur la base de PROD :
pnpm prisma migrate deploy
```

- `migrate deploy` applique **uniquement** les migrations existantes (aucune génération, aucun prompt) — c'est la commande adaptée à la CI/prod. Il s'arrête en erreur si une migration échoue (transactionnel par fichier).
- Migrations actuellement versionnées : init, onboarded, one-time-token, **hash-one-time-tokens** (purge les tokens en clair, cf. CF-1), avatar, last-visited-course.
- Sur Vercel, exécuter dans le `buildCommand` :
  `prisma migrate deploy && next build`.
- **Rollback** : Prisma n'a pas de `down` automatique. En cas de problème, restaurer depuis un backup (cf. ticket CF-19) ou écrire une migration corrective.

> ✅ Le client Prisma (`lib/generated/prisma`) est régénéré à chaque build. La **CI** (`.github/workflows/ci.yml`) lance `prisma generate` + `typecheck` + `build` à chaque push, ce qui valide que le client et le bundle de prod se construisent (cf. CF-5).

---

## 4. Build & déploiement

```bash
npm run build   # next build (Turbopack) — doit finir sans erreur
npm run start   # test local du bundle de prod avant de pousser
```

Sur Vercel : connecter le repo GitHub → chaque push sur `main` déclenche un déploiement. Renseigner les variables d'env (étape 1) **avant** le premier build.

---

## 5. Checklist sécurité (déjà en place dans le code)

- [x] Mots de passe hashés (bcrypt, cost **12**).
- [x] Politique de mot de passe : ≥ 8 caractères, au moins une lettre + un chiffre (signup & reset) + champ de confirmation au signup.
- [x] Tokens email/reset à usage unique, TTL, consommation atomique, **stockés hachés SHA-256** (`lib/token-crypto.ts`) — un dump DB n'expose aucun lien utilisable (CF-1).
- [x] Anti-énumération (login & forgot-password neutres).
- [x] Toutes les routes `/api/me/*` exigent une session.
- [x] Exécution du code élève isolée en iframe `sandbox="allow-scripts"`.
- [x] **Rate limiting** sur login, signup, forgot-password, resend-verification, check-verification **et reset-password** (`lib/rate-limit.ts`) (CF-2).
- [x] **Validation fail-fast de l'environnement** au démarrage (`lib/env.ts` via `instrumentation.ts`) : le serveur refuse de booter si une variable critique manque/est mal réglée (CF-3).
- [x] **Headers de sécurité** dans `next.config.ts` : CSP (prod), HSTS, X-Frame-Options: DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy ; `X-Powered-By` désactivé.
- [ ] (Optionnel) CSP par nonces pour retirer `'unsafe-inline'` du `script-src` — non trivial avec Monaco (CDN + workers) et Next/Turbopack.

> ⚠️ **À vérifier en navigateur avant de déployer** : la CSP n'est active qu'en production. Lance `npm run build && npm start`, ouvre une mission (ex. `/learn/javascript/chapitre-1`) avec la console DevTools, et confirme que l'éditeur Monaco se charge, que « Déployer » exécute le code, et qu'il n'y a **aucune erreur `Content-Security-Policy`**. Si Monaco est bloqué, ajuste `script-src`/`worker-src`/`connect-src` (domaine `cdn.jsdelivr.net` + `blob:`).

> ℹ️ **Rate limiting** (CF-7) : `lib/rate-limit.ts` est enfichable. Par défaut il compte en mémoire (suffisant en **mono-instance**). Sur un déploiement **serverless/multi-instance** (Vercel), renseigne `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` : les compteurs sont alors partagés via Upstash Redis et la limite est respectée à travers les instances. Sans ces variables, le fallback mémoire reste actif ; en cas de panne Redis, on bascule en mémoire (fail-open).

> ✅ **Vérifié automatiquement** (serveur de prod local) : `/api/me` sans session → 401 ; signup mot de passe faible → 400 ; rate limit signup → 429 après 5 requêtes/IP ; tous les headers de sécurité présents dans la réponse HTTP.

---

## 6. Smoke test post-déploiement

Dérouler `docs/SMOKE_TEST.md` sur l'URL de prod, en priorité :

1. Signup → email de vérification reçu → lien fonctionne.
2. Login → dashboard.
3. Forgot-password → email → reset → login avec nouveau mot de passe.
4. Un chapitre complet par type de cours (HTML, JS, React, et un cours « commande » comme Git/SQL).
5. `/api/me/*` sans session → 401.
