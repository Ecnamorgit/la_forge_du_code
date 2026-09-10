# La Forge du Code — Mise en production

Guide pour déployer La Forge du Code en production. À suivre dans l'ordre.

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
| `RESEND_FROM_EMAIL` | ✅ | Expéditeur sur **domaine vérifié** (ex. `La Forge du Code <noreply@laforgeducode.fr>`). `onboarding@resend.dev` n'envoie qu'au compte propriétaire. |
| `APP_URL` | ✅ | URL HTTPS publique **sans slash final** (ex. `https://www.laforgeducode.fr`). Sert à construire les liens d'email — un mauvais réglage casse la vérification et le reset. |
| `UPSTASH_REDIS_REST_URL` | ⚠️ multi-instance | Rate-limiter partagé (CF-7). Requis sur déploiement **serverless/multi-instance** (Vercel) pour que la limite soit respectée entre instances. Absent → fallback mémoire (OK en mono-instance). |
| `UPSTASH_REDIS_REST_TOKEN` | ⚠️ multi-instance | Token REST Upstash, va de pair avec l'URL ci-dessus. |
| `SENTRY_DSN` | ⬜ optionnel | Monitoring d'erreurs serveur (CF-10). Absent → inerte (erreurs loggées via `lib/logger.ts`). Présent → init Sentry + remontée via `onRequestError`. |
| `SENTRY_TRACES_SAMPLE_RATE` | ⬜ optionnel | Taux d'échantillonnage des traces (défaut `0.1`). |

> **AUTH_SECRET** : générer une valeur dédiée à la prod et la garder secrète. Si elle fuite, toutes les sessions deviennent forgeables → régénérer immédiatement (invalide les sessions existantes).

---

## 2. Vérifier le domaine d'envoi (Resend)

1. Resend → _Domains_ → ajouter `laforgeducode.fr` (ou ton domaine).
2. Ajouter dans la zone DNS les enregistrements fournis par Resend :
   - DKIM : `TXT resend._domainkey` ;
   - SPF : `CNAME rsend` et `CNAME send` (sous-domaines dédiés, donc **aucun conflit** avec un SPF existant sur la racine) ;
   - DMARC : `TXT _dmarc` → `v=DMARC1; p=quarantine; rua=mailto:<ton-adresse>; adkim=s; aspf=r`.
3. Cliquer _Verify DNS Records_, attendre le statut « Verified », puis pointer `RESEND_FROM_EMAIL` dessus et redéployer.

Sans ça, les emails de vérification ne partiront pas aux vrais utilisateurs.

> Fait le 2026-09-08 pour `laforgeducode.fr` (zone OVH). Un domaine neuf atterrit d'abord en
> courrier indésirable (observé sur Hotmail) : la réputation se construit sur quelques semaines ;
> garder des titres en casse normale et une version texte complète dans les emails (`lib/email.ts`).

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
- Sur Vercel, la commande de build est versionnée dans `vercel.json` :
  `pnpm prisma generate && pnpm prisma migrate deploy && pnpm build`. Rien à
  régler dans le dashboard, chaque déploiement applique les migrations.
- **Rollback** : Prisma n'a pas de `down` automatique. En cas de problème, restaurer depuis un backup (cf. ticket CF-19) ou écrire une migration corrective.

> ✅ Le client Prisma (`lib/generated/prisma`) est régénéré à chaque build. La **CI** (`.github/workflows/ci.yml`) lance `prisma generate` + `typecheck` + `build` à chaque push, ce qui valide que le client et le bundle de prod se construisent (cf. CF-5).

---

## 4. Build & déploiement

```bash
npm run build   # next build (Turbopack) — doit finir sans erreur
npm run start   # test local du bundle de prod avant de pousser
```

Sur Vercel : connecter le repo GitHub → chaque push sur `main` déclenche un déploiement. Renseigner les variables d'env (étape 1) **avant** le premier build.

> ℹ️ **Bascule de compte (2026-09-07)** : le projet est hébergé sur le compte
> Vercel `pluriface` (plan Hobby), projet `la-forge-du-code`. En cas de nouveau
> changement de compte : importer le repo, saisir les 7 variables (Vercel
> détecte leurs noms depuis `.env.example`, pas leurs valeurs), puis pousser sur
> `main`. `vercel.json` fait le reste.

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
- [x] **RGPD** : export des données (`GET /api/me/export`) et suppression définitive du compte (`DELETE /api/me`, cascade) exposés depuis la page profil (CF-14).
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

---

## 7. Sauvegardes & restauration (CF-19)

La base est la seule donnée non reconstructible : elle **doit** être sauvegardée.

**Activer les sauvegardes automatiques** (hébergeur managé) :

- **Neon** : sauvegardes continues + *Point-in-Time Restore* (PITR). Vérifier la fenêtre de rétention dans _Project → Backups_.
- **Supabase** : _Database → Backups_. Daily backups sur les plans payants ; activer PITR si disponible.

> ⚠️ **État constaté le 2026-08-06** : le projet est sur le **plan gratuit**, qui
> n'inclut **aucune** sauvegarde (« Free Plan does not include project
> backups »). La couverture repose donc entièrement sur le workflow ci-dessous.

**Sauvegarde automatique (plan gratuit) — `.github/workflows/backup.yml`**

Un `pg_dump` quotidien à 03:00 UTC, chiffré en AES256 avant de quitter le
runner, déposé en artefact GitHub avec 90 jours de rétention. Le workflow échoue
si le dump fait moins de 10 Ko : une sauvegarde vide est le mode de panne
classique, et elle passerait sinon inaperçue.

Deux secrets à créer dans _Settings → Secrets and variables → Actions_ :

| Secret | Valeur |
|---|---|
| `BACKUP_DATABASE_URL` | la valeur de `DIRECT_URL` — le pooler en **port 5432** |
| `BACKUP_PASSPHRASE` | la phrase de chiffrement |

**Sur le choix de l'URL, ce qui compte est le port, pas le pooler :**

| Hôte / port | Mode | `pg_dump` |
|---|---|---|
| `…pooler.supabase.com:6543` | transaction | ❌ l'état de session n'est pas préservé |
| `…pooler.supabase.com:5432` | session | ✅ se comporte comme une connexion directe |
| `db.<ref>.supabase.co:5432` | vraiment directe | ✅ mais **IPv6 seul** sur les projets gratuits — inatteignable depuis un runner GitHub |

C'est donc le port 5432 du pooler qu'il faut, et non la connexion « directe » au
sens strict.

> 🔑 **Conserver la passphrase ailleurs que dans GitHub.** Si elle n'existe que
> là, perdre l'accès au compte revient à perdre les sauvegardes avec.

Déclenchement manuel possible : onglet _Actions → Sauvegarde de la base → Run
workflow_.

**Restaurer depuis un artefact chiffré** (procédure exercée le 2026-08-11, sans
rien installer d'autre que Docker) :

```bash
# 1. Télécharger l'artefact depuis l'onglet Actions, le dézipper, puis :
gpg --decrypt --output backup.dump codeforge-AAAA-MM-JJ-HHMM.dump.gpg

# 2. Monter une base jetable :
docker run --rm -d --name pgtest -e POSTGRES_PASSWORD=test -p 5433:5432 postgres:17

# 3. Restaurer avec le pg_restore du conteneur (⚠️ destructif sur la cible).
#    Sous Git Bash, MSYS_NO_PATHCONV=1 est indispensable : sans lui, /dump est
#    réécrit en chemin Windows et Docker ne trouve pas le fichier.
MSYS_NO_PATHCONV=1 docker run --rm -v "$(pwd -W):/dump" postgres:17 \
  pg_restore --clean --if-exists \
  -d "postgresql://postgres:test@host.docker.internal:5433/postgres" \
  /dump/backup.dump

# 4. Vérifier :
npx tsx scripts/verify-restore.ts "postgresql://postgres:test@localhost:5433/postgres"

# 5. Nettoyer — le conteneur ET la copie en clair :
docker rm -f pgtest
rm -f backup.dump
```

`pg_restore` affiche une centaine d'erreurs `role "supabase_*_admin" does not
exist` sur les schémas `auth`, `storage`, `realtime` et `vault` : **c'est
attendu**, un Postgres nu n'a pas la plomberie Supabase. Aucune ne touche au
schéma `public`. Le verdict est celui de l'étape 4, pas celui de l'étape 3.

> ⚠️ **Supprimer le `.dump` déchiffré après le test.** C'est une copie en clair
> des emails et des hashs de mots de passe. Chiffrer l'artefact ne sert à rien
> si la version lisible reste dans un dossier de téléchargements.

**Sauvegarde manuelle / hors-site (recommandé en complément)** :

```bash
# Dump compressé (utilise DIRECT_URL, connexion directe) :
pg_dump "$DIRECT_URL" -Fc -f backup-$(date +%F).dump
```

**Restauration** :

```bash
# Restaurer dans une base vide (⚠️ destructif sur la cible) :
pg_restore --clean --if-exists -d "$DIRECT_URL" backup-AAAA-MM-JJ.dump
```

**Vérifier une restauration** :

```bash
npx tsx scripts/verify-restore.ts "postgresql://user:pass@hote:5432/base_restauree"
```

Le script liste le volume de chaque table et échoue si l'une manque, ou si la
table `User` est vide — auquel cas ce n'est pas une restauration mais une
migration à blanc. L'URL est un argument obligatoire : le script ne lit jamais
`.env`, pour qu'un oubli ne le pointe pas sur la production.

Il prouve la structure et le volume, pas le vécu : démarrer l'application
contre la base restaurée et se connecter avec un compte réel reste la dernière
étape.

> ✅ **Critère de validation** : sauvegardes automatiques activées **et** une restauration testée au moins une fois sur une base jetable (vérifier que l'app démarre et que les comptes/progression sont présents). Une sauvegarde jamais restaurée n'est pas une sauvegarde.
