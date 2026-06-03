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

> **AUTH_SECRET** : générer une valeur dédiée à la prod et la garder secrète. Si elle fuite, toutes les sessions deviennent forgeables → régénérer immédiatement (invalide les sessions existantes).

---

## 2. Vérifier le domaine d'envoi (Resend)

1. Resend → _Domains_ → ajouter `mail.codeforge.com` (ou ton domaine).
2. Ajouter les enregistrements DNS (SPF, DKIM) fournis.
3. Attendre la validation, puis pointer `RESEND_FROM_EMAIL` dessus.

Sans ça, les emails de vérification ne partiront pas aux vrais utilisateurs.

---

## 3. Appliquer les migrations de base de données

Les migrations Prisma en attente incluent l'avatar utilisateur et le `lastVisitedCourse`.

```bash
# En local, pointé vers la base de PROD (DIRECT_URL configuré) :
npx prisma migrate deploy
```

- `migrate deploy` applique uniquement les migrations existantes (aucune génération, aucun prompt) — c'est la commande adaptée à la CI/prod.
- Sur Vercel, l'idéal est de l'exécuter dans le `buildCommand` :
  `prisma migrate deploy && next build`.

Vérifie ensuite que le client est généré (`prisma generate` est lancé automatiquement au build via les `postinstall`/build de Next).

---

## 4. Build & déploiement

```bash
npm run build   # next build (Turbopack) — doit finir sans erreur
npm run start   # test local du bundle de prod avant de pousser
```

Sur Vercel : connecter le repo GitHub → chaque push sur `main` déclenche un déploiement. Renseigner les variables d'env (étape 1) **avant** le premier build.

---

## 5. Checklist sécurité (déjà en place dans le code)

- [x] Mots de passe hashés (bcrypt).
- [x] Tokens email/reset à usage unique, TTL, consommation atomique.
- [x] Anti-énumération (login & forgot-password neutres).
- [x] Toutes les routes `/api/me/*` exigent une session.
- [x] Exécution du code élève isolée en iframe `sandbox="allow-scripts"`.
- [x] **Rate limiting** sur login, signup, forgot-password, resend-verification, check-verification (`lib/rate-limit.ts`).
- [ ] **Headers de sécurité** (CSP, HSTS, X-Frame-Options) — à ajouter dans `next.config.ts` via `headers()` (recommandé, non bloquant).
- [ ] Politique de mot de passe renforcée + champ confirmation au signup (amélioration UX/sécu).

> ⚠️ **Rate limiting** : l'implémentation actuelle est en mémoire (per-instance). Sur un déploiement serverless multi-instances (Vercel), la limite effective est multipliée par le nombre d'instances. Pour une garantie stricte, brancher `lib/rate-limit.ts` sur un store partagé (Upstash Redis ou une table Postgres). Suffisant en l'état pour un déploiement mono-instance ou un trafic modéré.

---

## 6. Smoke test post-déploiement

Dérouler `docs/SMOKE_TEST.md` sur l'URL de prod, en priorité :

1. Signup → email de vérification reçu → lien fonctionne.
2. Login → dashboard.
3. Forgot-password → email → reset → login avec nouveau mot de passe.
4. Un chapitre complet par type de cours (HTML, JS, React, et un cours « commande » comme Git/SQL).
5. `/api/me/*` sans session → 401.
