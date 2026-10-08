# Roadmap « Production-Ready » — La Forge du Code / Nebula Command

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

## État au 2026-08-11

M1, M2, CF-17, CF-18 et CF-19 sont livrés. Il reste **CF-15**, bloqué par un
prérequis, et la confirmation opérationnelle de CF-6.

**Mise à jour du 2026-09-14** : CF-15 est résolu par le constat EXE-03 de l'audit
de sécurité ([fiche EXE-03](audit-securite/corrections/EXE-03.md)). Le bac à
sable est servi depuis une origine dédiée et l'application émet une CSP à nonce,
sans `'unsafe-inline'` ni `'unsafe-eval'`.

Les cases cochées ci-dessous l'ont été sur preuve dans le code. Celles qui
restent vides sous un ticket par ailleurs livré désignent un fait que le dépôt
ne peut pas établir — un déploiement réellement effectué, une restauration
réellement testée, un parcours jamais couvert par un test. Elles ne sont pas
des oublis : les laisser vides est l'information.

| Reste à faire | Pourquoi |
|---|---|
| ~~CF-15~~ | Résolu le 2026-09-14 par EXE-03. |
| CF-6 | Runbook écrit ; le déploiement à blanc reste à confirmer. |

---

## M1 — Blockers de mise en production

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

## M2 — Fiabilité & observabilité

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

## M3 — Polish, conformité & perf

### CF-14 · Conformité RGPD opérationnelle
**P1 · L · Conformité**
`docs/RGPD.md` existe ; vérifier l'implémentation.
- Suppression de compte (effacement), export des données, consentement.

**Acceptation**
- [x] Suppression de compte — `DELETE` sur `app/api/me/route.ts`
- [x] Export des données perso disponible — `app/api/me/export`

### CF-15 · Durcir la CSP (retirer `unsafe-inline`/`unsafe-eval`)
**P2 · L · Sécurité** — résolu le 2026-09-14 par le constat EXE-03 de l'audit
de sécurité : voir la [fiche EXE-03](audit-securite/corrections/EXE-03.md).

> Les mesures ci-dessous datent d'avant la correction ; elles sont conservées
> comme historique du diagnostic.

**Mesuré le 2026-08-06**, contre un vrai build de production, en retirant les
tokens un à un et en observant la console. Ces trois faits remplacent ce que
`next.config.ts` documentait — dont une affirmation fausse.

| Token | Qui en a réellement besoin | Vérification |
|---|---|---|
| `'self'` | l'iframe charge `/react-runtime/runtime.js` par URL absolue | acquis |
| `'unsafe-inline'` | **les scripts inline de Next** (bootstrap, hydratation) | sans lui : 7 scripts bloqués, Monaco ne charge plus, page morte |
| `'unsafe-eval'` | **les `srcdoc` seuls** — sandbox JS et aperçu React | sans lui : `new Function` lève `EvalError` dans l'iframe |

**Monaco n'a pas besoin d'`unsafe-eval`.** Le commentaire de `next.config.ts`
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
`'unsafe-inline'` **et** `'unsafe-eval'`.

#### Ce qu'une sonde du 2026-08-11 a établi — et ce qu'elle n'a pas établi

**Le gel d'onglet est réel et actuel.** Reproduit deux fois avec le vrai
`buildPreviewSrcdoc`, le vrai runtime React, et une boucle que `loop-guard.ts`
ne détecte pas (`let x = true; while (x) {}`) : le parent devient **totalement
injoignable**. L'observation du 2026-07-30 tient, et `loop-guard.ts` protège
bien quelque chose de réel.

**Que l'origine dédiée le corrige n'est pas démontré.** La mesure a échoué avant
de pouvoir conclure : servi comme page autonome, le document d'aperçu n'envoie
jamais sa poignée de main `preview:ready`.

**C'est le premier vrai pas du chantier :** le document d'aperçu est écrit *pour*
`srcdoc`. Le déplacer ne suffira pas, il faudra l'adapter — comprendre pourquoi
la poignée de main échoue hors `srcdoc` est le point de départ, pas un détail
d'intendance.

> **Piège pour qui reprendra la sonde.** Une boucle synthétique bornée
> (`while (Date.now() - t < 3000) {}`) dans une iframe nue **ne reproduit pas**
> le gel — ni en headless, ni en navigateur visible. Il faut le runtime React et
> une boucle véritablement infinie. Trois autres méthodes de mesure ont donné
> des faux négatifs avant qu'une tienne : `waitForFunction` s'exécute dans la
> page et expire sans distinguer « gelé » de « message perdu » ; la latence d'un
> `page.evaluate` passe par Playwright et signale un gel sur des pages fluides ;
> et compter des battements sur une fenêtre débordant la fin de la boucle ne
> distingue rien, le parent rattrapant son retard. **Ce qui marche** : faire
> échantillonner le parent par lui-même, pendant la boucle, en notant le retard
> de son propre minuteur.

Deux garde-fous arrêteront quiconque tente le durcissement avant ce
prérequis : `lib/security/csp.test.ts` et la suite e2e en production.

#### Le cursus JavaScript est concerné, et peut-être plus exposé

`lib/sandbox/run-js.ts` exécute le code des leçons JavaScript dans un `srcdoc`
à origine opaque — **le même mécanisme que l'aperçu React**. Le chantier porte
donc sur deux sandboxes, pas un.

Mais il y a plus préoccupant. `run-js.ts:74` monte un **chien de garde côté
parent** :

```ts
const timeout = setTimeout(() => {
  finish({ ok: false, error: "Execution interrompue apres 3s. Verifie une boucle infinie…" });
}, 3000);
```

C'est exactement le mécanisme dont `ReactPreview.tsx` et `loop-guard.ts`
documentent qu'il **ne peut pas fonctionner** : le `srcdoc` partageant le thread
du parent, le `setTimeout` ne s'exécute jamais. Et `run-js.ts` n'utilise aucun
détecteur de boucle — sa seule protection est ce minuteur.

Si le raisonnement tient, une boucle infinie dans une leçon JavaScript gèle
l'onglet, et le message promettant une interruption après 3 secondes ne
s'affiche jamais.

> **Ce n'est pas mesuré.** C'est une déduction par analogie de structure, pas une
> observation. La vérification est bon marché : même méthode que la sonde
> ci-dessus, avec un code de leçon qui boucle. **À faire avant toute conception**,
> car un `run-js` réellement non protégé serait plus urgent que CF-15 lui-même.
>
> Vérifié depuis : `run-js` n'était pas protégé (constat EXE-02 de l'audit,
> corrigé, voir la [fiche EXE-02](audit-securite/corrections/EXE-02.md)).

#### Ce que le chantier apporterait en plus

- **Un `postMessage` ciblé.** Aujourd'hui le parent poste vers `"*"` faute
  d'origine réelle (`ReactPreview.tsx:97`, et le commentaire de `run-js.ts:45`
  le regrette explicitement). Une origine dédiée permet de viser précisément, et
  à l'iframe de valider `event.origin` au lieu du seul `event.source`.
- **Un `loop-guard.ts` relâchable.** Il refuse aujourd'hui `while (true) { … break }`,
  une forme parfaitement légitime, faute de savoir lire un `break` — et son
  message est au conditionnel pour cette raison. Si l'isolation rend le gel
  impossible, ce filet peut être assoupli, voire retiré.

#### Ce que le chantier casserait, et qu'il faut prévoir

- **`e2e/csp-srcdoc-script.spec.ts` deviendrait sans objet.** Il vérifie qu'une
  iframe `srcdoc` peut charger un script de l'origine du parent — propriété dont
  on cesserait de dépendre. À réécrire, pas à supprimer : le garde-fou doit
  suivre le nouveau mécanisme, sinon on retombe dans un test qui ne garde rien.
- **Le runtime doit être servi par la nouvelle origine.**
  `scripts/build-react-runtime.mjs` produit `public/react-runtime/runtime.js`
  pendant le `prebuild`. Il faudra décider s'il est dupliqué sur l'origine
  sandbox ou servi depuis là uniquement.
- **La nouvelle origine a besoin de sa propre CSP**, permissive côté `script-src`
  puisque c'est elle qui exécutera `new Function` — et c'est tout l'intérêt :
  ce relâchement ne concerne plus l'application.

**Acceptation**
- [x] Vérifier si `run-js.ts` est réellement protégé — il ne l'était pas : EXE-02, corrigé
- [x] Comprendre pourquoi le document d'aperçu n'envoie pas `preview:ready` hors `srcdoc` — origine du parent figée à la construction, voir EXE-03
- [ ] Mesurer si une origine dédiée supprime le gel d'onglet — non démontré ; les boucles sans fin sont traitées par EXE-02
- [x] L'aperçu React, l'aperçu HTML et le sandbox JS sont servis depuis une origine dédiée (`/bac-a-sable`) — EXE-03
- [x] La CSP de l'application passe aux nonces et perd `'unsafe-inline'` — EXE-03
- [x] La CSP de l'application perd `'unsafe-eval'` (en production) — EXE-03
- [x] L'aperçu React et le cursus JavaScript fonctionnent toujours, prouvé en e2e contre un build de production — `csp-stricte`, `react-preview`, `securite-boucles`

### CF-16 · Auto-héberger Monaco (retirer la dépendance CDN)
**P2 · M · Robustesse/Perf**
Monaco chargé depuis jsdelivr → dépendance externe + entrées CSP.

**Acceptation**
- [x] Éditeur fonctionne sans le CDN — Monaco servi depuis `/public/monaco`, plus aucune entrée jsdelivr dans la CSP

### CF-17 · Budget perf & Core Web Vitals
**P2 · M · Perf** — mesuré et au vert le 2026-08-11

**Vérifié le 2026-08-06 :**

- **`next/image` partout, zéro `<img>` brute.** 10 fichiers l'utilisent ; la
  recherche de `<img ` dans les `.tsx` ne renvoie rien.
- **Three.js est déjà chargé à la demande** — `await import("three")` dans
  `components/intro/IntroSceneCanvas.tsx:118`, jamais en import statique. Il ne
  pèse donc pas sur le bundle initial.
- **CLS = 0** sur `/learn/html/chapitre-1`, mesuré contre un build de production.
- TTFB 88 ms, `load` 412 ms en local sur ce même build (indicatif : machine de
  développement, pas un réseau réel).

**Mesure des Core Web Vitals — `e2e/web-vitals.spec.ts`**

Relevé du 2026-08-11, contre un build de production et une base jetable :

| Page | FCP | LCP | CLS | Interaction la plus lente |
|---|---|---|---|---|
| `/` | 164 ms | 352 ms | 0 | 56 ms |
| `/learn/html/chapitre-1` | 408 ms | 408 ms | 0,0235 | 80 ms |
| `/dashboard` | 116 ms | 216 ms | 0,0139 | 40 ms |
| **Seuils** | — | 2500 ms | 0,1 | 200 ms |

Rejouer :

```bash
MESURE_VITALS=1 E2E_PROD=1 pnpm test:e2e --grep "Core Web Vitals"
```

**La mesure ne tourne pas en CI**, et c'est délibéré : ces chiffres dépendent de
la machine, et sur un runner partagé ils varieraient assez pour faire échouer le
job au hasard. Un test qui échoue au hasard finit ignoré.

**Deux pièges rencontrés en écrivant cette mesure**, tous deux producteurs de
faux verts — les commentaires du fichier les détaillent :

- Le navigateur **cesse d'enregistrer le LCP à la première interaction**.
  Cliquer juste après `load` le laissait à zéro sur la page de leçon, la plus
  lente à peindre. On laisse la page se poser avant de toucher à quoi que ce soit.
- Une interaction à **0 ms ne veut pas dire « instantané » mais « non mesuré »**.
  Asserter `0 <= 200` passerait pour la mauvaise raison ; le rapport dit
  désormais « NON MESUREE » et l'assertion est omise.

**Ce que ces chiffres ne disent pas :** ils viennent d'une machine de
développement, sans latence réseau. Un LCP de 352 ms en local n'est pas ce que
vit un apprenant en 4G. Pour ça il faut un relevé de terrain — `web-vitals`
remonté à Sentry, déjà câblé (CF-10).

**Acceptation**
- [x] Images servies par `next/image`
- [x] Three.js hors du bundle initial
- [x] LCP, CLS et INP au vert sur l'accueil, une page de leçon et le tableau de bord
- [x] Mesure reproductible plutôt qu'un relevé ponctuel
- [ ] Relevé de terrain sur de vrais réseaux — *optionnel, hors du critère d'origine*

### CF-18 · Élargir la couverture de tests des validateurs
**P2 · L · Tests** — livré le 2026-08-06

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
**P1 · S · Exploitation** — livré et prouvé le 2026-08-11

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
rien, et la couverture repose sur le workflow du dépôt privé
`la_forge_du_code-sauvegardes` : `pg_dump`
quotidien, chiffré AES256 avant de quitter le runner, artefact retenu 90 jours.
Le workflow échoue si le dump fait moins de 10 Ko — une sauvegarde vide est le
mode de panne classique et passerait sinon inaperçue.

**Acceptation**
- [x] Procédure de sauvegarde et de restauration documentée
- [x] Vérification d'une base restaurée outillée et reproductible — `scripts/verify-restore.ts`
- [x] Sauvegarde automatique en place — workflow planifié, l'hébergeur n'en fournit pas
- [x] Secrets créés et **premier run vert le 2026-08-11** — dump chiffré déposé en artefact
- [x] **Restauration effectuée et vérifiée le 2026-08-11** — artefact déchiffré, restauré sur un `postgres:17` jetable, volumes conformes à la production

**La chaîne complète a été exercée de bout en bout** : artefact téléchargé,
déchiffré avec la passphrase du secret, restauré, puis contrôlé par
`scripts/verify-restore.ts`. 8 tables, 24 comptes, volumes identiques à la
production à un événement près — enregistré entre le relevé et le dump.

`pg_restore` signale une centaine d'erreurs, **toutes attendues** : des
`ALTER TABLE … OWNER TO supabase_*_admin` sur les schémas `auth`, `storage`,
`realtime` et `vault`. Ces rôles n'existent pas sur un Postgres nu. Aucune ne
touche au schéma `public`, où vivent les données de l'application.

> **Après un test de restauration, supprimer le `.dump` déchiffré.** C'est
> une copie en clair des emails et des hashs de mots de passe, posée sur une
> machine de développement. Le chiffrement de l'artefact ne sert à rien si la
> version déchiffrée traîne dans un dossier de téléchargements.

**Ce qui a coûté trois runs**, noté pour la prochaine fois :

1. Le secret contenait la ligne entière du `.env`, préfixe `DIRECT_URL=` compris.
2. `/usr/bin/pg_dump` est le wrapper de `postgresql-common` : installer le
   client 17 ne suffit pas, il faut appeler `/usr/lib/postgresql/17/bin/pg_dump`.
3. *Re-run jobs* rejoue le commit d'origine, jamais le code corrigé. Après un
   correctif, il faut relancer via *Run workflow*.

Les deux premiers sont désormais détectés par le workflow lui-même, avec un
message qui nomme le problème.
