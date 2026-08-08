# 🗺️ Roadmap « Production-Ready » — CodeForge / Nebula Command

> Feuille de route pour amener le projet à un état déployable, fiable et conforme.
> Convention d'effort : **S** ≤ 2 h · **M** ½ j · **L** 1 j · **XL** 2 j+
> Priorités : **P0** = bloquant prod · **P1** = fiabilité · **P2** = polish

## Jalons

| Jalon | Objectif | Tickets | Effort |
|---|---|---|---|
| **M1 — Blockers prod** | Déployable sans faille critique | CF-1 → CF-6 | ~3-4 j |
| **M2 — Fiabilité** | Tient en charge, observable | CF-7 → CF-13 | ~4-5 j |
| **M3 — Polish & conformité** | Qualité finale, RGPD, perf | CF-14 → CF-19 | ~3-4 j |

**Chemin critique** : M1 (commencer par CF-3/4/5, rapides) → M2 → M3.
**Quick wins (≤ 1 j cumulé)** : CF-2, CF-4, CF-5, CF-12.

---

## État au 2026-08-06

M1 et M2 sont livrés. Il reste **CF-15 et CF-17**, la seconde moitié de
**CF-18**, plus deux vérifications opérationnelles (CF-6, CF-19).

Les cases cochées ci-dessous l'ont été sur preuve dans le code. Celles qui
restent vides sous un ticket par ailleurs livré désignent un fait que le dépôt
ne peut pas établir — un déploiement réellement effectué, une restauration
réellement testée, un parcours jamais couvert par un test. Elles ne sont pas
des oublis : les laisser vides est l'information.

| Reste à faire | Pourquoi |
|---|---|
| **CF-18** (reste) | `html`, `javascript` et `react` : étapes 2 à 4 non couvertes au-delà de leurs tests actuels. |
| **CF-15** | Bloqué : ses critères d'acceptation sont faux (voir le ticket). |
| **CF-17** | Aucune trace d'audit Lighthouse ni de `next/image`. |
| CF-6, CF-19 | Runbooks écrits ; l'exécution réelle reste à confirmer. |

---

## 🔴 M1 — Blockers de mise en production

### CF-1 · Hasher les tokens à usage unique en base
**P0 · M · Sécurité**
`OneTimeToken.token` est stocké en clair (`lib/tokens.ts`). Un accès DB exposerait des liens de reset actifs.
- Stocker `sha256(token)` ; n'envoyer le token brut que dans l'email.
- `consumeToken` recherche par hash du token reçu.
- Migration Prisma (purge ou rehash des tokens existants).

**Acceptation**
- [x] Aucun token brut en base — `lib/tokens.ts` passe par `hashToken()` à l'écriture comme à la lecture
- [ ] Vérif email + reset password OK de bout en bout — code câblé, mais aucun e2e ne couvre ce parcours
- [x] Test unitaire `createToken`/`consumeToken` — `lib/token-crypto.test.ts`

### CF-2 · Rate-limiter la route reset-password
**P0 · S · Sécurité**
`app/api/auth/reset-password/route.ts` n'a aucun throttle.
- Ajouter `rateLimit('reset:${ip}', { limit: 10, windowMs: 15min })`.

**Acceptation**
- [ ] 11ᵉ tentative en 15 min → `429` — implémenté, jamais exercé par un test
- [x] Cohérent avec les autres routes auth — même `rateLimit()` que signup, forgot, resend, check-verification

### CF-3 · Valider les variables d'environnement au démarrage
**P0 · M · Robustesse**
`DATABASE_URL`, `AUTH_SECRET`, `RESEND_API_KEY`, `APP_URL` lues à la volée ; absence = échec runtime tardif.
- `lib/env.ts` avec schéma Zod importé tôt ; échec explicite en prod.
- Refuser le secret par défaut du `.env.example`.

**Acceptation**
- [x] Démarrage prod sans `AUTH_SECRET` → erreur claire immédiate — `lib/env.ts` via `instrumentation.ts`
- [x] `APP_URL` validé https en prod — couvert par `lib/env.test.ts`

### CF-4 · Figer le lockfile en CI
**P0 · S · CI/Build**
`.github/workflows/ci.yml` utilise `--no-frozen-lockfile` (builds non reproductibles).
- Régénérer `pnpm-lock.yaml`, repasser en `--frozen-lockfile`.

**Acceptation**
- [x] CI verte avec `pnpm install --frozen-lockfile`

### CF-5 · Ajouter typecheck + build à la CI
**P0 · S · CI/Build**
La CI ne vérifie ni `tsc --noEmit` ni `next build`.
- Étapes `pnpm exec tsc --noEmit` et `pnpm build` (+ `prisma generate`).

**Acceptation**
- [x] CI échoue sur erreur TS ou build cassé — étapes `Typecheck` et `Build` du job `quality`

### CF-6 · Pipeline de migration prod documenté & testé
**P0 · M · Déploiement**
`DIRECT_URL` requis pour `migrate deploy` ; à valider sur la cible (Neon/Supabase).
- Procédure `prisma migrate deploy` + `prisma generate` dans `docs/DEPLOYMENT.md`.

**Acceptation**
- [ ] Déploiement à blanc sur DB managée réussit — **à confirmer** : le dépôt ne peut pas l'établir
- [x] Runbook reproductible — `docs/DEPLOYMENT.md`

---

## 🟠 M2 — Fiabilité & observabilité

### CF-7 · Rate-limiter partagé (Redis/Upstash) — conditionnel
**P1 · L · Sécurité/Scale**
`lib/rate-limit.ts` est en mémoire ; inefficace en multi-instance/serverless.
- Mono-instance (VPS) → documenter la contrainte (S).
- Serverless/multi → store partagé (L).

**Acceptation**
- [x] Limite vérifiée cross-instance — `lib/rate-limit.ts` s'appuie sur Upstash Redis

### CF-8 · Test e2e du parcours critique
**P1 · L · Tests**
Aucun e2e aujourd'hui.
- Playwright : signup → verif (mock) → login → chapitre → validation step → XP persistée.

**Acceptation**
- [x] Parcours vert en CI sur DB de test éphémère — 23 tests, et depuis le 2026-07-31 contre un build de production (cf. CF-15)

### CF-9 · Logging structuré + corrélation
**P1 · M · Observabilité**
Pas de logging applicatif ; les `throw` remontent bruts.
- Logger léger (niveau, route, userId), sans PII/secret.

**Acceptation**
- [x] Erreurs serveur loggées avec contexte exploitable — `lib/logger.ts` + `onRequestError` dans `instrumentation.ts`

### CF-10 · Monitoring d'erreurs (Sentry ou équivalent)
**P1 · M · Observabilité**

**Acceptation**
- [x] Exception non gérée remonte au dashboard avec stacktrace — Sentry câblé dans `instrumentation.ts`. Inerte tant que `SENTRY_DSN` n'est pas défini en production : vérifier la variable sur l'hébergeur.

### CF-11 · Pages d'erreur globales + error boundary
**P1 · S · UX/Robustesse**
Vérifier `app/error.tsx`, `app/not-found.tsx`, `global-error.tsx`.

**Acceptation**
- [x] Crash runtime → écran propre — `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx`

### CF-12 · Healthcheck + readiness
**P1 · S · Déploiement**
- `GET /api/health` (ping DB léger) pour load-balancer/uptime.

**Acceptation**
- [x] `200` si DB joignable, `503` sinon — `app/api/health/route.ts`

### CF-13 · Durcir le sandbox (revue + limites)
**P1 · M · Sécurité**
`lib/sandbox/run-js.ts` déjà bien isolé.
- `postMessage` ciblé (origine au lieu de `"*"`), borne taille logs/sortie, garde mémoire.

**Acceptation**
- [x] Sortie volumineuse bornée — `MAX_LOGS = 1000`, `MAX_LINE = 2000` dans `lib/sandbox/run-js.ts`
- [x] Cible `postMessage` resserrée — plus aucun `postMessage("*")` dans `lib/sandbox/`

---

## 🟡 M3 — Polish, conformité & perf

### CF-14 · Conformité RGPD opérationnelle
**P1 · L · Conformité**
`docs/RGPD.md` existe ; vérifier l'implémentation.
- Suppression de compte (effacement), export des données, consentement.

**Acceptation**
- [x] Suppression de compte — `DELETE` sur `app/api/me/route.ts`
- [x] Export des données perso disponible — `app/api/me/export`

### CF-15 · Durcir la CSP (retirer `unsafe-inline`/`unsafe-eval`)
**P2 · L · Sécurité** — ⛔ **critères d'acceptation à réécrire avant de commencer**

> **Lis `docs/BRIEF_CSP_GARDE_FOU.md` avant de toucher à `script-src`.**
>
> Le critère ci-dessous a été écrit **avant** que l'aperçu React existe. Il ne
> nomme que Monaco et l'hydratation. Le suivre à la lettre donne une suite verte
> et un aperçu cassé pour tous les apprenants.
>
> `script-src` porte trois dépendances, toutes vivantes :
> - `'self'` — l'iframe charge `/react-runtime/runtime.js` par URL absolue ;
> - `'unsafe-inline'` — le `<script>` inline du `srcdoc`, tout le programme de l'iframe ;
> - `'unsafe-eval'` — `new Function` dans le `srcdoc` **et** dans `lib/sandbox/run-js.ts`.
>
> **Un nonce ne suffit pas à contourner le problème** : en CSP niveau 3, sa
> présence fait *ignorer* `'unsafe-inline'`. Le durcissement casserait l'aperçu
> même en laissant le mot écrit dans la politique.
>
> Deux garde-fous posés le 2026-07-31 t'arrêteront si tu essaies quand même :
> `lib/security/csp.test.ts` (fil-piège unitaire) et la suite e2e, qui tourne
> désormais contre un build de production (`E2E_PROD=1` en CI).
>
> Questions non tranchées : `'unsafe-eval'` est-il négociable, puisque deux
> cursus en dépendent pour exister ? Un aperçu servi depuis une autre origine
> rebattrait-il les cartes (cf. `docs/SANDBOX_REPORT.md`) ?

**Acceptation — à redéfinir**
- [ ] Réécrire les critères en tenant compte de l'aperçu React et du sandbox JS
- [ ] ~~CSP sans `unsafe-inline` côté script (nonces) sans casser Monaco/hydration~~ — critère obsolète, ignore l'aperçu et le sandbox

### CF-16 · Auto-héberger Monaco (retirer la dépendance CDN)
**P2 · M · Robustesse/Perf**
Monaco chargé depuis jsdelivr → dépendance externe + entrées CSP.

**Acceptation**
- [x] Éditeur fonctionne sans le CDN — Monaco servi depuis `/public/monaco`, plus aucune entrée jsdelivr dans la CSP

### CF-17 · Budget perf & Core Web Vitals
**P2 · M · Perf**
- Audit Lighthouse (Three.js, images), lazy-load, `next/image`.

**Acceptation**
- [ ] LCP/CLS/INP au vert sur dashboard et page de leçon

### CF-18 · Élargir la couverture de tests des validateurs
**P2 · L · Tests** — largement livré le 2026-08-06

Le critère d'origine (« ≥ 1 test par cursus ») était **déjà rempli** avant même
qu'on y touche, par `all-chapter-1.test.ts`. Mais il ne testait que
`validators[0]` du chapitre 1 : **les étapes 2 à 4, soit les trois quarts du
travail de l'apprenant, n'étaient exercées nulle part.** Un critère qu'on peut
satisfaire sans obtenir la protection visée — même défaut que CF-15.

Un validateur faux ne casse rien de visible : il refuse une bonne réponse, ou
en accepte une mauvaise. Ni la CI ni le monitoring ne le voient. Seul
l'apprenant en subit les conséquences, et il conclut que c'est lui qui se
trompe.

**Huit bugs trouvés**, tous en production jusque-là. Les deux plus graves :
l'étape finale du cursus CSS était infranchissable (`/\bnfinite\b/` ne matchait
jamais `infinite`), et l'étape 1 du chapitre CSS 8 refusait la solution
imprimée dans son propre indice. Détail dans `docs/RAPPORT_VALIDATEURS.md`.

**Acceptation**
- [x] Chaque cursus a ≥ 1 test de validateur (cas passant + échec) — `all-chapter-1.test.ts`
- [x] Chaque étape a un validateur, et son code de départ ne la valide pas — `parcours-integrite.test.ts`, 189 tests sur les 48 chapitres
- [x] `css` : les 10 chapitres, 4 étapes chacun
- [x] Les 9 cursus mono-chapitre : étapes 2 à 4
- [ ] `html`, `javascript`, `react` : étapes 2 à 4 au-delà des tests existants — **passe suivante**

**Avant d'attaquer la passe suivante :** `Step` n'a pas de champ `solution`, si
bien que chaque cas passant s'écrit à la main depuis le `hint`. En ajouter un
rendrait ces cas dérivables automatiquement. C'est une modification du modèle
de données de tout le contenu — mais l'arbitrer *après* avoir écrit à la main
les 48 étapes de `javascript` serait dommage.

### CF-19 · Backups DB + plan de restauration
**P1 · S · Exploitation**

**Acceptation**
- [ ] Backups automatiques activés + restauration testée une fois — procédure écrite (`docs/DEPLOYMENT.md §7`), **exécution à confirmer**
