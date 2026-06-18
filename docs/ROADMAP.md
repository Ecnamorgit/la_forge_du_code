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

## 🔴 M1 — Blockers de mise en production

### CF-1 · Hasher les tokens à usage unique en base
**P0 · M · Sécurité**
`OneTimeToken.token` est stocké en clair (`lib/tokens.ts`). Un accès DB exposerait des liens de reset actifs.
- Stocker `sha256(token)` ; n'envoyer le token brut que dans l'email.
- `consumeToken` recherche par hash du token reçu.
- Migration Prisma (purge ou rehash des tokens existants).

**Acceptation**
- [ ] Aucun token brut en base
- [ ] Vérif email + reset password OK de bout en bout
- [ ] Test unitaire `createToken`/`consumeToken` (hash + single-use + expiry)

### CF-2 · Rate-limiter la route reset-password
**P0 · S · Sécurité**
`app/api/auth/reset-password/route.ts` n'a aucun throttle.
- Ajouter `rateLimit('reset:${ip}', { limit: 10, windowMs: 15min })`.

**Acceptation**
- [ ] 11ᵉ tentative en 15 min → `429`
- [ ] Cohérent avec les autres routes auth

### CF-3 · Valider les variables d'environnement au démarrage
**P0 · M · Robustesse**
`DATABASE_URL`, `AUTH_SECRET`, `RESEND_API_KEY`, `APP_URL` lues à la volée ; absence = échec runtime tardif.
- `lib/env.ts` avec schéma Zod importé tôt ; échec explicite en prod.
- Refuser le secret par défaut du `.env.example`.

**Acceptation**
- [ ] Démarrage prod sans `AUTH_SECRET` → erreur claire immédiate
- [ ] `APP_URL` validé https en prod

### CF-4 · Figer le lockfile en CI
**P0 · S · CI/Build**
`.github/workflows/ci.yml` utilise `--no-frozen-lockfile` (builds non reproductibles).
- Régénérer `pnpm-lock.yaml`, repasser en `--frozen-lockfile`.

**Acceptation**
- [ ] CI verte avec `pnpm install --frozen-lockfile`

### CF-5 · Ajouter typecheck + build à la CI
**P0 · S · CI/Build**
La CI ne vérifie ni `tsc --noEmit` ni `next build`.
- Étapes `pnpm exec tsc --noEmit` et `pnpm build` (+ `prisma generate`).

**Acceptation**
- [ ] CI échoue sur erreur TS ou build cassé

### CF-6 · Pipeline de migration prod documenté & testé
**P0 · M · Déploiement**
`DIRECT_URL` requis pour `migrate deploy` ; à valider sur la cible (Neon/Supabase).
- Procédure `prisma migrate deploy` + `prisma generate` dans `docs/DEPLOYMENT.md`.

**Acceptation**
- [ ] Déploiement à blanc sur DB managée réussit
- [ ] Runbook reproductible

---

## 🟠 M2 — Fiabilité & observabilité

### CF-7 · Rate-limiter partagé (Redis/Upstash) — conditionnel
**P1 · L · Sécurité/Scale**
`lib/rate-limit.ts` est en mémoire ; inefficace en multi-instance/serverless.
- Mono-instance (VPS) → documenter la contrainte (S).
- Serverless/multi → store partagé (L).

**Acceptation**
- [ ] Limite vérifiée cross-instance **ou** contrainte mono-instance assumée et documentée

### CF-8 · Test e2e du parcours critique
**P1 · L · Tests**
Aucun e2e aujourd'hui.
- Playwright : signup → verif (mock) → login → chapitre → validation step → XP persistée.

**Acceptation**
- [ ] Parcours vert en CI sur DB de test éphémère

### CF-9 · Logging structuré + corrélation
**P1 · M · Observabilité**
Pas de logging applicatif ; les `throw` remontent bruts.
- Logger léger (niveau, route, userId), sans PII/secret.

**Acceptation**
- [ ] Erreurs serveur loggées avec contexte exploitable

### CF-10 · Monitoring d'erreurs (Sentry ou équivalent)
**P1 · M · Observabilité**

**Acceptation**
- [ ] Exception non gérée remonte au dashboard avec stacktrace

### CF-11 · Pages d'erreur globales + error boundary
**P1 · S · UX/Robustesse**
Vérifier `app/error.tsx`, `app/not-found.tsx`, `global-error.tsx`.

**Acceptation**
- [ ] Crash runtime → écran propre, pas de stacktrace exposée

### CF-12 · Healthcheck + readiness
**P1 · S · Déploiement**
- `GET /api/health` (ping DB léger) pour load-balancer/uptime.

**Acceptation**
- [ ] `200` si DB joignable, `503` sinon

### CF-13 · Durcir le sandbox (revue + limites)
**P1 · M · Sécurité**
`lib/sandbox/run-js.ts` déjà bien isolé.
- `postMessage` ciblé (origine au lieu de `"*"`), borne taille logs/sortie, garde mémoire.

**Acceptation**
- [ ] Sortie volumineuse bornée
- [ ] Cible `postMessage` resserrée

---

## 🟡 M3 — Polish, conformité & perf

### CF-14 · Conformité RGPD opérationnelle
**P1 · L · Conformité**
`docs/RGPD.md` existe ; vérifier l'implémentation.
- Suppression de compte (effacement), export des données, consentement.

**Acceptation**
- [ ] Suppression de compte (cascade vérifiée)
- [ ] Export des données perso disponible

### CF-15 · Durcir la CSP (retirer `unsafe-inline`/`unsafe-eval`)
**P2 · L · Sécurité**
`next.config.ts` prévoit déjà le durcissement par nonces.

**Acceptation**
- [ ] CSP sans `unsafe-inline` côté script (nonces) sans casser Monaco/hydration

### CF-16 · Auto-héberger Monaco (retirer la dépendance CDN)
**P2 · M · Robustesse/Perf**
Monaco chargé depuis jsdelivr → dépendance externe + entrées CSP.

**Acceptation**
- [ ] Éditeur fonctionne sans le CDN ; entrées jsdelivr CSP supprimables

### CF-17 · Budget perf & Core Web Vitals
**P2 · M · Perf**
- Audit Lighthouse (Three.js, images), lazy-load, `next/image`.

**Acceptation**
- [ ] LCP/CLS/INP au vert sur dashboard et page de leçon

### CF-18 · Élargir la couverture de tests des validateurs
**P2 · L · Tests**
~70 validateurs, 3 fichiers de test.

**Acceptation**
- [ ] Chaque cursus a ≥ 1 test de validateur (cas passant + échec)

### CF-19 · Backups DB + plan de restauration
**P1 · S · Exploitation**

**Acceptation**
- [ ] Backups automatiques activés + restauration testée une fois
