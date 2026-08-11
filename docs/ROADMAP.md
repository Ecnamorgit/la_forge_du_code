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

M1, M2 et CF-18 sont livrés. Il reste **CF-15 et CF-17**, plus deux
vérifications opérationnelles (CF-6, CF-19).

Les cases cochées ci-dessous l'ont été sur preuve dans le code. Celles qui
restent vides sous un ticket par ailleurs livré désignent un fait que le dépôt
ne peut pas établir — un déploiement réellement effectué, une restauration
réellement testée, un parcours jamais couvert par un test. Elles ne sont pas
des oublis : les laisser vides est l'information.

| Reste à faire | Pourquoi |
|---|---|
| **CF-15** | Bloqué par un prérequis : sortir l'aperçu du `srcdoc`. Mesuré, pas supposé — voir le ticket. |
| **CF-17** | `next/image` et Three.js déjà en place ; LCP et INP demandent un vrai navigateur. |
| CF-6, CF-19 | Outillés et documentés ; il reste des actions sur la console de l'hébergeur. |

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
**P2 · L · Sécurité** — ⛔ **bloqué par un prérequis, pas par la difficulté**

> **Lis `docs/BRIEF_CSP_GARDE_FOU.md` avant de toucher à `script-src`.**

**Mesuré le 2026-08-06**, contre un vrai build de production, en retirant les
tokens un à un et en observant la console. Ces trois faits remplacent ce que
`next.config.ts` documentait — dont une affirmation fausse.

| Token | Qui en a réellement besoin | Vérification |
|---|---|---|
| `'self'` | l'iframe charge `/react-runtime/runtime.js` par URL absolue | acquis |
| `'unsafe-inline'` | **les scripts inline de Next** (bootstrap, hydratation) | sans lui : 7 scripts bloqués, Monaco ne charge plus, page morte |
| `'unsafe-eval'` | **les `srcdoc` seuls** — sandbox JS et aperçu React | sans lui : `new Function` lève `EvalError` dans l'iframe |

**Monaco n'a PAS besoin d'`unsafe-eval`.** Le commentaire de `next.config.ts`
l'affirmait ; c'est faux depuis l'auto-hébergement (CF-16). Vérifié : sous
`script-src 'self' 'unsafe-inline'`, Monaco charge, tokenise et rend sans une
seule violation.

**Le `srcdoc` hérite de la CSP du parent** — vérifié par une sonde : durcir la
politique de l'application durcit celle de l'iframe, qu'on le veuille ou non.

**Pourquoi les nonces ne débloquent pas la situation.** Ils règlent bien
`'unsafe-inline'` côté Next — le navigateur propose lui-même hash ou nonce. Mais
en CSP niveau 3, poser un nonce fait **ignorer** `'unsafe-inline'`, ce qui tue le
`<script>` inline du `srcdoc`. Et le nonce ne touche pas à `'unsafe-eval'`, dont
le sandbox a besoin. Le durcissement casse donc l'aperçu deux fois.

**Prérequis réel : servir l'aperçu depuis une autre origine.** Une fois le
sandbox sorti du `srcdoc` et posé sur une origine dédiée avec sa propre
politique permissive, l'application peut passer aux nonces et abandonner
`'unsafe-inline'` **et** `'unsafe-eval'`. C'est aussi le seul vrai correctif au
gel d'onglet par boucle infinie (`docs/SANDBOX_REPORT.md`) : un même chantier
règle les deux.

Deux garde-fous arrêteront quiconque tente le durcissement avant ce
prérequis : `lib/security/csp.test.ts` et la suite e2e en production.

**Acceptation**
- [ ] L'aperçu et le sandbox JS sont servis depuis une origine dédiée — **prérequis, ticket à créer**
- [ ] La CSP de l'application passe aux nonces et perd `'unsafe-inline'`
- [ ] La CSP de l'application perd `'unsafe-eval'`
- [ ] L'aperçu React et le cursus JavaScript fonctionnent toujours, prouvé en e2e contre un build de production

### CF-16 · Auto-héberger Monaco (retirer la dépendance CDN)
**P2 · M · Robustesse/Perf**
Monaco chargé depuis jsdelivr → dépendance externe + entrées CSP.

**Acceptation**
- [x] Éditeur fonctionne sans le CDN — Monaco servi depuis `/public/monaco`, plus aucune entrée jsdelivr dans la CSP

### CF-17 · Budget perf & Core Web Vitals
**P2 · M · Perf** — les deux pistes du libellé sont déjà faites

**Vérifié le 2026-08-06 :**

- **`next/image` partout, zéro `<img>` brute.** 10 fichiers l'utilisent ; la
  recherche de `<img ` dans les `.tsx` ne renvoie rien.
- **Three.js est déjà chargé à la demande** — `await import("three")` dans
  `components/intro/IntroSceneCanvas.tsx:118`, jamais en import statique. Il ne
  pèse donc pas sur le bundle initial.
- **CLS = 0** sur `/learn/html/chapitre-1`, mesuré contre un build de production.
- TTFB 88 ms, `load` 412 ms en local sur ce même build (indicatif : machine de
  développement, pas un réseau réel).

**LCP, FCP et INP n'ont pas pu être mesurés ici**, et ce n'est pas un défaut de
l'application : le navigateur intégré garde la page en `visibilityState:
"hidden"`, or ces métriques ne sont enregistrées que pour une page visible. Le
tampon `paint` reste vide quoi qu'on fasse — inutile de réessayer par ce chemin.

**Comment obtenir les chiffres manquants :** un Lighthouse dans un vrai
navigateur (`pnpm build && pnpm start`, puis l'onglet Lighthouse des DevTools),
ou un relevé de terrain via `web-vitals` remonté à Sentry, déjà câblé (CF-10).
La seconde voie a l'avantage de mesurer de vrais apprenants sur de vrais
réseaux, ce qu'un audit local ne fait jamais.

**Acceptation**
- [x] Images servies par `next/image`
- [x] Three.js hors du bundle initial
- [x] CLS au vert sur la page de leçon
- [ ] LCP et INP mesurés sur le tableau de bord et une page de leçon — **demande un vrai navigateur**

### CF-18 · Élargir la couverture de tests des validateurs
**P2 · L · Tests** — ✅ **livré le 2026-08-06**

Le critère d'origine (« ≥ 1 test par cursus ») était **déjà rempli** avant même
qu'on y touche, par `all-chapter-1.test.ts`. Mais il ne testait que
`validators[0]` du chapitre 1 : **les étapes 2 à 4, soit les trois quarts du
travail de l'apprenant, n'étaient exercées nulle part.** Un critère qu'on peut
satisfaire sans obtenir la protection visée — même défaut que CF-15.

Un validateur faux ne casse rien de visible : il refuse une bonne réponse, ou
en accepte une mauvaise. Ni la CI ni le monitoring ne le voient. Seul
l'apprenant en subit les conséquences, et il conclut que c'est lui qui se
trompe.

**Dix bugs trouvés**, tous en production jusque-là. Les deux plus graves :
l'étape finale du cursus CSS était infranchissable (`/\bnfinite\b/` ne matchait
jamais `infinite`), et l'étape 1 du chapitre CSS 8 refusait la solution
imprimée dans son propre indice. Détail dans `docs/RAPPORT_VALIDATEURS.md`.

**Acceptation**
- [x] Chaque cursus a ≥ 1 test de validateur (cas passant + échec) — `all-chapter-1.test.ts`
- [x] Chaque étape a un validateur, et son code de départ ne la valide pas — `parcours-integrite.test.ts`, 197 tests sur les 48 chapitres
- [x] `css` : les 10 chapitres, 4 étapes chacun
- [x] Les 9 cursus mono-chapitre : étapes 2 à 4
- [x] `react` : chapitres 1 à 4 (5 à 8 étaient déjà couverts)
- [x] `html` : les 8 chapitres — `html-parcours.test.ts` ne vérifiait qu'une structure, aucun comportement
- [x] `javascript` : chapitres 2 à 12

**Les 191 étapes du parcours sont couvertes.** 694 tests ajoutés au total.

**Pour une éventuelle suite :** `Step` n'a pas de champ `solution`, si bien que
chaque cas passant a été écrit à la main depuis le `hint`. En ajouter un rendrait
ces cas dérivables et allégerait fortement la maintenance quand du contenu
s'ajoutera. Ce n'est plus urgent maintenant que la couverture existe, mais ça
reste vrai pour les chapitres à venir.

### CF-19 · Backups DB + plan de restauration
**P1 · S · Exploitation** — outillé, reste deux actions humaines

La procédure est écrite (`docs/DEPLOYMENT.md §7`) et la vérification est
désormais une commande plutôt qu'une intention :

```bash
npx tsx scripts/verify-restore.ts "postgresql://…/base_restauree"
```

Il liste le volume de chaque table et échoue si l'une manque, ou si `User` est
vide — c'est alors une migration à blanc, pas une restauration. L'URL est un
argument obligatoire ; le script ne lit pas `.env`, pour qu'un oubli ne le
pointe pas sur la production.

**Le plan gratuit Supabase n'inclut aucune sauvegarde** (constaté le 2026-08-06 :
« Free Plan does not include project backups »). L'hébergeur ne couvre donc
rien, et la couverture repose sur `.github/workflows/backup.yml` : `pg_dump`
quotidien, chiffré AES256 avant de quitter le runner, artefact retenu 90 jours.
Le workflow échoue si le dump fait moins de 10 Ko — une sauvegarde vide est le
mode de panne classique et passerait sinon inaperçue.

**Acceptation**
- [x] Procédure de sauvegarde et de restauration documentée
- [x] Vérification d'une base restaurée outillée et reproductible — `scripts/verify-restore.ts`
- [x] Sauvegarde automatique en place — workflow planifié, l'hébergeur n'en fournit pas
- [x] Secrets créés et **premier run vert le 2026-08-06** — dump chiffré déposé en artefact
- [ ] Une restauration réellement effectuée et vérifiée — **dernière étape, action humaine**

> Il reste la moitié qui compte. Un dump qu'on n'a jamais su déchiffrer ni
> restaurer n'est pas une sauvegarde : c'est un fichier. Tant que cette case
> n'est pas cochée, on ne sait pas si la passphrase est la bonne, ni si le dump
> est exploitable.

**Ce qui a coûté trois runs**, noté pour la prochaine fois :

1. Le secret contenait la ligne entière du `.env`, préfixe `DIRECT_URL=` compris.
2. `/usr/bin/pg_dump` est le wrapper de `postgresql-common` : installer le
   client 17 ne suffit pas, il faut appeler `/usr/lib/postgresql/17/bin/pg_dump`.
3. *Re-run jobs* rejoue le commit d'origine, jamais le code corrigé. Après un
   correctif, il faut relancer via *Run workflow*.

Les deux premiers sont désormais détectés par le workflow lui-même, avec un
message qui nomme le problème.
