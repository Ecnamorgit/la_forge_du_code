# Le premier contact — Design

**Date** : 2026-07-28
**Statut** : validé (approche « funnel d'abord » choisie par Joan)

## Objectif

Ouvrir le trajet complet **inconnu → premier exercice validé → inscription**.
Aujourd'hui le site est en ligne avec ~30 chapitres rédigés (HTML 8, CSS 10,
JS 12) que personne ne peut voir : `proxy.ts` protège l'intégralité de
`/learn`, et la cinématique narrative ne se joue qu'après inscription. Le
produit est donc invisible pour qui n'a pas déjà créé un compte.

Ce chantier ne produit aucun contenu pédagogique supplémentaire. Il rend
accessible celui qui existe.

## Contexte

- **Audience actuelle** : 3-4 testeurs. Aucune mesure en place.
- **Objectifs retenus** : utilisateurs réels + profondeur produit.
- La profondeur de contenu (React 4 → cursus complet) est le **chantier 2** ;
  elle n'est pas la contrainte bloquante — un débutant met des semaines à
  traverser HTML/CSS/JS.

## Décisions actées

| Sujet | Décision |
|---|---|
| Nom de la menace | **SPECTRE** (canon dans le code). Le crawl qui dit « Null / Le Glitch » est réécrit. |
| Répartition de l'intro | Crawl condensé ~15 s avant la landing · 5 scènes animées après inscription · lore complet dans `/codex` |
| Chapitre d'essai | **Un seul** : `html/chapitre-1` |
| Image OG | Générée dynamiquement par route (`next/og`) |
| Mesure | Compteur maison minimal, sans cookie ni tiers |

## Hors périmètre (explicite)

Parrainage · contenu React · durcissement CSP · audit Lighthouse · couverture
des validateurs. Ce sont les chantiers 2, 3 et 4, avec leurs propres specs.

---

## Architecture & routage

Trois routes publiques, une seule brèche dans le mur.

| Route | Statut | Rôle |
|---|---|---|
| `/` | publique (inchangé) | Landing + overlay crawl au premier passage |
| `/codex` | **nouvelle**, publique | Lore complet en texte réel, indexable |
| `/learn/html/chapitre-1` | **ouverte** | Chapitre d'essai, unique |
| reste de `/learn` | protégé (inchangé) | |

`proxy.ts` passe d'une liste de préfixes à préfixes **+ allowlist
d'exceptions** :

```
PROTECTED_PREFIXES   (inchangé)
PUBLIC_TRIAL_ROUTES = ["/learn/html/chapitre-1"]
```

**L'allowlist matche en égalité exacte, jamais en `startsWith`.** Un match par
préfixe ouvrirait `chapitre-10` le jour où HTML dépassera 9 chapitres (CSS en a
déjà 10, JS 12). Le bug serait silencieux et n'apparaîtrait qu'à l'ajout d'un
chapitre.

La décision est extraite dans une fonction pure `isPublicRoute(pathname)`,
testable sans middleware.

### La couture anonyme

`lib/use-user.ts` expose déjà une interface propre `UseUserReturn` (state + 7
actions). On introduit un `UserProvider` qui choisit l'implémentation :

```
UserProvider
  ├── session authentifiée  → useServerUser()   (l'actuel, inchangé)
  └── pas de session        → useTrialUser()    (nouveau, localStorage)
```

`UserProvider` enveloppe **uniquement le sous-arbre `/learn`** — c'est le seul
endroit où un visiteur anonyme manipule un `UserState`. Le dashboard, le
profil et l'avatar restent protégés par le middleware et continuent d'appeler
`useServerUser()` sans provider.

`ChapterWorkspace`, `NullProgressBar` et `CombatVisualizer` ne changent pas :
ils consomment l'interface. Les fonctions pures de `lib/user-store.ts`
(`getCompletedSteps`, `isChapterComplete`, `getNextStep`) opèrent déjà sur un
`UserState` quelle que soit sa provenance.

### Flux cible

```
Inconnu ──> Crawl Spectre (~15 s, skip immédiat, 1×/navigateur)
        ──> Landing ──> « Essayer sans compte »
        ──> /learn/html/chapitre-1  (progression en localStorage)
        ──> étape validée ──> écran de conversion ──> /signup
        ──> 5 scènes animées ──> création du perso ──> Dashboard
```

---

## Narration : source unique & Codex

Le lore est aujourd'hui écrit en dur dans le JSX, ce qui a produit deux
antagonistes concurrents (`StarWarsCrawl.tsx` dit « Null », `lib/intro.ts` et
`spectreTrap` disent « Spectre »). On le sort dans `lib/lore.ts` :

- `LORE_SECTIONS` — 3 sections (Coalition Nebula / Spectre / Le Cadet), texte complet
- `CRAWL_LINES` — version condensée, ~120 mots

Le crawl lit `CRAWL_LINES`, le Codex rend `LORE_SECTIONS`. Le texte quitte le
JSX, donc les deux surfaces ne peuvent plus diverger sans que ce soit visible.

### Le crawl

`components/intro/StarWarsCrawl.tsx` est conservé. Trois changements :

- Le texte vient de `CRAWL_LINES`, réécrit sur **Spectre**
- La durée passe de `55s` en dur (`app/globals.css:852`) à une variable CSS
  `--crawl-duration` pilotée par le composant — **15 s** en teaser
- « Passer » visible dès la première seconde ; « Pause » supprimé (personne ne
  met en pause 15 secondes)

`prefers-reduced-motion` : pas de défilement, texte affiché d'un bloc avec un
bouton « Continuer » — même contrat que `IntroCinematic`.

**Overlay, jamais redirection.** La landing est rendue en HTML sous la
cinématique, qui se pose par-dessus côté client. Une route `/intro` qui
redirigerait ferait indexer un écran noir aux crawlers et tuerait les previews
de lien.

### Déclenchement

`IntroCinematicMount` reprend l'autoplay, gouverné par `nc_intro_seen` en
localStorage — le drapeau qui existe déjà dans `lib/intro.ts` mais n'est plus
lu depuis le commit d4649e2. Écrit à la fin de la lecture ou au skip.

Le dashboard garde les 5 scènes au premier login : **inchangé**.

### Le Codex

`/codex` : server component statique, aucun accès DB. Vrais `<h1>`/`<h2>`,
vrai texte, donc réellement indexable. Il porte les 450 mots de lore
actuellement enfermés dans l'animation du crawl. Atteignable depuis la nav de
la landing et depuis un lien en fin de crawl.

### Métadonnées

`app/layout.tsx:35` n'a ni `metadataBase`, ni `openGraph`, ni carte Twitter :
un lien partagé sur Discord, Reddit ou LinkedIn s'affiche en texte nu. On
ajoute les trois, plus une route `next/og` générant l'image par page (landing,
codex).

Contrainte connue : `next/og` (Satori) exige les polices en `ArrayBuffer` et ne
reproduit pas `image-rendering: pixelated`. Le rendu OG vise la lisibilité, pas
la fidélité pixel-art parfaite.

---

## L'essai sans compte

### Modèle de confiance (constat préalable)

`/api/me/step` **ne valide pas le code de l'étudiant** : il vérifie que le
triplet (course, chapitre, index) existe, puis enregistre et attribue l'XP. Les
validateurs ne sont importés que dans `ChapterClient.tsx` — la validation est
100 % côté client.

Le mode essai n'affaiblit donc rien : le modèle est déjà « le client affirme,
le serveur enregistre ». C'est un compromis existant de l'architecture, pas une
régression introduite ici.

### `useTrialUser()`

Même interface `UseUserReturn`. État dans `localStorage` sous `nc_trial_state` :

```
{ completedSteps: string[], xp: number }
```

`completeStep` en mode essai fait localement ce que `me-server.ts` fait en
base : vérifie que l'étape existe, l'ajoute, recalcule l'XP via **la même
fonction pure `lib/xp.ts`** — donc les mêmes chiffres qu'un compte réel. Il
retourne la même forme `CompleteStepResponse`.

Les actions exigeant un compte (`setAvatar`, `renameUser`, `claimDailyMission`,
`reset`) rejettent avec une erreur typée `AccountRequiredError`. L'UI l'attrape
et affiche l'invitation à s'inscrire — une porte, pas un message d'erreur.

### Récupération à l'inscription

`POST /api/me/trial-import` : le client envoie les étapes de l'essai, le
serveur **filtre sur `PUBLIC_TRIAL_ROUTES`** et rejette tout le reste, puis
rejoue `completeStep` de `me-server.ts` pour chacune. Idempotent —
`completeStep` gère déjà `alreadyDone`. Le localStorage est purgé après succès.

Le filtre sur l'allowlist est la garantie qui compte : sans lui, la route
deviendrait un « valide-moi tout le cursus » en un appel. Avec lui, elle
n'accorde que ce que le visiteur pouvait déjà atteindre.

Déclenchement après établissement de la session, au montage de la page avatar.
En cas d'échec : on log, on ne bloque pas l'onboarding (perte maximale = un
chapitre d'essai).

### Parcours visible

- **Landing** : « Essayer sans compte » devient le CTA principal, « S'inscrire »
  passe en secondaire (l'inscription reste dans la nav).
- **Pendant l'essai** : bandeau discret et permanent « Mode essai — ta
  progression est locale ».
- **Fin du chapitre** : écran de conversion avec l'XP gagnée affichée. C'est là
  que l'inscription se demande.
- **Chapitre 2** : le bouton pointe vers `/signup` avec le contexte. Le redirect
  middleware reste un filet de sécurité, jamais le chemin nominal.

### Dégradations

| Situation | Comportement |
|---|---|
| localStorage indisponible (navigation privée) | L'essai tourne en mémoire pour la session, sans persistance, sans planter |
| JSON corrompu | Retour à l'état par défaut, silencieux |
| Quota dépassé | Ignoré silencieusement |
| `trial-import` échoue | Log serveur, onboarding poursuivi |

---

## Mesure du tunnel

Compteur maison minimal, sans cookie ni sous-traitant tiers — conforme à
`docs/RGPD.md` qui promet zéro traçage tiers.

Trois événements en table Postgres, agrégés. Aucune donnée personnelle, aucun
identifiant de visiteur persistant : on compte des occurrences horodatées, pas
des personnes.

| Événement | Émis depuis | Quand |
|---|---|---|
| `landing_vue` | client, `POST /api/track` en fire-and-forget | montage de `/` |
| `essai_lance` | client, même route | clic sur « Essayer sans compte » |
| `inscription` | **serveur**, dans le handler de signup existant | compte créé |

`landing_vue` est émis côté client volontairement : compté côté serveur il
inclurait les bots et les crawlers, ce qui rendrait le taux de conversion
illisible. `inscription` est émis côté serveur parce qu'il doit être exact.

`POST /api/track` n'accepte que ces noms d'événements (allowlist) et est
rate-limité comme les routes auth, sinon le compteur est trivialement
falsifiable.

Ces trois chiffres suffisent à dire où le tunnel fuit. `docs/RGPD.md` est mis à
jour pour mentionner ce comptage interne.

---

## Tests

### Unitaires (Vitest)

Les décisions sont extraites en fonctions pures, testables sans DOM, comme le
reste de `lib/`.

| Test | Ce qu'il verrouille |
|---|---|
| `lore.test.ts` | Aucune source narrative ne contient « Null » / « Glitch » comme nom de la menace ; `CRAWL_LINES` tient dans le budget de mots (le 15 s reste vrai) |
| `is-public-route.test.ts` | `chapitre-1` ouvert · `chapitre-2` fermé · **`chapitre-10` fermé** · `css/chapitre-1` fermé |
| `trial-user.test.ts` | Ajout d'étape · idempotence · XP identique à `lib/xp.ts` · JSON corrompu → défaut · étape inconnue rejetée |
| `filter-trial-steps.test.ts` | Le filtrage de `trial-import` rejette tout ce qui sort de l'allowlist |

Les deux derniers sont les tests critiques : l'un garantit que le mur ne fuit
pas, l'autre que la route d'import ne devient pas un raccourci.

### E2E (Playwright)

- **`trial.spec.ts` (nouveau)** : arrivée → crawl skippée → « Essayer sans
  compte » → chapitre atteint → étape validée → écran de conversion. Puis
  inscription → la progression d'essai est présente sur le dashboard.
- **`e2e/intro.spec.ts` (à corriger)** : il teste le comportement actuel
  (pas d'autoplay à l'arrivée). Le rétablissement de l'autoplay l'invalide ; il
  doit être mis à jour **dans le même lot**, sinon la CI rougit et on prendra
  l'habitude de l'ignorer.
- **Smoke** : `/codex` répond 200 avec un `<h1>`.

## Définition de « fini »

`pnpm lint` · `pnpm typecheck` · `pnpm test:run` · `pnpm test:e2e` ·
`pnpm build` — verts. La CI exécute déjà les cinq.

Plus une vérification manuelle du rendu OG sur un validateur de partage.

## Dette adjacente

Le dépôt porte du travail non commité au moment de la rédaction :
`components/intro/StarWarsCrawl.tsx` (non suivi), plus des modifications de
`IntroCinematic.tsx`, `lib/intro.ts` et `app/globals.css`. Ce chantier touche
exactement ces fichiers ; ils doivent être commités ou intégrés avant de
commencer, pas laissés en travers.
