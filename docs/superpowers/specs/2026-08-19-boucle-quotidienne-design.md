# Spec — Boucle quotidienne : briefing, liaison et déblocables

**Date :** 2026-08-19
**Branche :** à créer (`feat/boucle-quotidienne`)
**Statut :** design validé, prêt pour plan d'implémentation
**Objectif retenu :** rétention — donner une raison d'ouvrir l'onglet demain

---

## Problème

La couche de jeu de Nebula Command existe mais ne boucle pas. Six constats,
tous vérifiés dans le dépôt :

1. **La « mission du jour » n'est pas une mission.** C'est un bouton qui verse
   50 XP (`components/dashboard/DailyMission.tsx`, `lib/daily-mission.ts`). Elle
   ne demande rien, ne varie jamais, et se réclame sans apprendre quoi que ce
   soit. Récompenser l'ouverture d'un onglet n'a jamais fait revenir personne.

2. **Le streak ne sert à rien.** Il est compté et persisté (`User.streak`,
   `User.lastVisit`) mais aucune conséquence n'y est attachée : ni bonus, ni
   risque, ni protection. Un streak sans enjeu est un compteur.

3. **Les badges doublonnent la barre de progression.** Les 48 badges de
   `lib/badges-catalog.ts` sont attribués un par chapitre via `BADGE_BY_CHAPTER`
   (`lib/courses-meta.ts`). Aucun n'est rare, aucun ne récompense un
   comportement, et surtout aucun ne *sert* à quoi que ce soit une fois obtenu.

4. **L'avatar est un choix figé, pas une progression.** Espèce, couleur
   d'uniforme et rôle sont tous disponibles à la première minute et ne bougent
   plus jamais (`lib/avatar.ts`). C'est le levier de personnalisation le plus
   inexploité du projet.

5. **Le niveau et le rang meurent tôt.** `levelFromXp` est linéaire
   (`xp/100 + 1`, `lib/user-store.ts`) : le cursus complet — mesuré à
   **9 312 XP** — mène au niveau 94, ce qui ne veut plus rien dire. `rankFromXp`
   plafonne à « Or » dès 1 000 XP, soit 11 % du parcours ; ensuite, plus rien.
   Et `components/ui/XPBar.tsx` affiche « LVL 1 » codé en dur.

6. **Le leaderboard est gelé.** Il classe sur `totalXp` cumulé
   (`app/api/leaderboard/route.ts`). Les premiers inscrits verrouillent le haut
   du tableau à vie ; un nouveau cadet ne peut structurellement jamais
   concourir.

## Ce qu'on construit

Une boucle quotidienne complète, en quatre pièces qui s'emboîtent :

- **Le briefing du jour** — trois ordres de mission tirés chaque jour, ciblés
  sur l'état réel du cadet, dérivés de `StepCompletion` sans nouvelle
  télémétrie.
- **La liaison** — le streak devient un objet de jeu : risque visible, relais de
  secours consommable, record permanent.
- **Les déblocables** — plus de 70 objets de personnalisation *sans une seule
  image neuve*, dont l'axe « emblème » qui convertit les 48 badges dormants en
  48 choix d'identité.
- **Le dashboard** — réorganisé autour d'« aujourd'hui », avec fusion du
  briefing et de la carte « Reprendre la mission ».

Effort visé : 2 à 3 jours.

## Décisions prises, avec leur raison

| Décision | Retenu | Pourquoi |
|---|---|---|
| Nature des récompenses | Expressif + confort | Un buff mécanique (× d'XP, bonus de streak) récompense l'ancienneté plutôt que l'apprentissage et fait dériver le leaderboard. |
| Streak → XP | **Jamais** | Corollaire du point ci-dessus. Le streak paye en déblocables et en protection. |
| Monnaie / boutique | Écartée | Ajoute un écran, un problème d'équilibrage et zéro motivation supplémentaire à cette échelle. Les déblocables se gagnent sur condition directe et lisible. |
| Suivi des quêtes | **Dérivé**, pas stocké | `StepCompletion` est horodaté : la progression se recalcule. Rien à synchroniser, rien à falsifier côté client, aucune table de progression. |
| Tirage des quêtes | Déterministe, graine `userId + date` | Stable toute la journée sans être stocké, non rejouable en rechargeant. |
| Faisabilité des quêtes | Évaluée sur l'état **d'avant aujourd'hui** | Sinon une quête peut cesser d'être éligible en cours de journée à cause du travail du jour, et disparaître sous les doigts du cadet. Voir « Le piège de la faisabilité ». |
| Sémantique du streak | Jours de **travail**, plus jours de visite | Un streak qui s'incrémente à l'ouverture d'un onglet ne prouve rien. |
| Attribution des récompenses | **Automatique**, pas réclamée | Un bouton « récupérer » obligatoire punit celui qui a fait le travail puis fermé l'onglet. |
| Lieu de la célébration | `CompletionScreen`, là où le travail a lieu | Le dashboard peut n'être jamais rouvert dans la session. |
| XP du briefing | 60 XP/jour maximum | 90 XP/jour reviendrait à payer deux fois les mêmes étapes : un multiplicateur d'XP déguisé, contradictoire avec la décision ci-dessus. 60 est l'ordre de grandeur des 50 actuels. |
| Journée de référence | Minuit **UTC** | Convention déjà en vigueur partout (`lastVisit`, `lastDailyMission`). Changer serait un chantier de fuseau à part entière — mais l'échéance doit être **affichée**. |
| Badges de conduite | Catalogue **séparé**, icônes emoji | `BADGES` impose position = frame dans `badges.png` (8×6 = 48). Y ajouter 11 entrées casserait le mapping et exigerait une planche neuve. |

## Contraintes vérifiées dans le dépôt

Ces points ont été constatés, pas supposés. Ils ne sont pas à re-vérifier.

- **`StepCompletion` est la seule trace de comportement.** Le modèle porte
  `(userId, course, chapter, stepIndex, completedAt)` avec unicité sur les
  quatre premiers (`prisma/schema.prisma`). L'horodatage est à la seconde : les
  quêtes « N étapes aujourd'hui » et les badges d'heure (« Veilleur »,
  « Aube ») sont donc gratuits en télémétrie.
- **Les indices ne sont persistés nulle part.** Aucune quête de maîtrise
  (« sans indice », « du premier coup ») n'est réalisable sans nouveau suivi.
- **Aucun index ne couvre `(userId, completedAt)`.** L'unique index est la
  contrainte d'unicité, dont le préfixe est `(userId, course)`. Une requête
  « les étapes de ce cadet aujourd'hui » ne peut pas s'en servir efficacement.
- **`lib/daily-mission.ts` prend déjà `todayIso` en paramètre** plutôt que de
  lire l'horloge. C'est le motif à suivre pour toute la logique nouvelle : pur,
  testable, partageable serveur/client.
- **L'avatar est un médaillon rond non composé** (`components/avatar/AvatarBadge.tsx`) :
  une image par espèce plus un anneau CSS coloré. Une « tenue » déblocable
  demanderait de régénérer 5 images par tenue. Écarté au profit d'axes
  purement CSS.
- **Les planches de sprites `mission`, `banner` et `badges` sont livrées**
  (`SPRITE_SHEETS_READY`, `lib/sprite-config.ts`) ; `intro` ne l'est pas. Le
  motif du drapeau + repli emoji est établi et doit être réutilisé.
- **Les décors existent déjà** dans `public/` : `planet-green-v2.png`,
  `planet-red-v2.png`, `planet-gas-v2.png`, `planet-ring-v2.png`,
  `planet-dry-v2.png`, `space-background-orange.webp`.
- **`LevelUpOverlay.tsx` existe** et fournit la cérémonie de révélation sans
  écrire de composant neuf.
- **Le cursus complet vaut 9 312 XP** — 51 chapitres, 192 étapes, 564
  objectifs, moyenne de 2,94 objectifs par étape, formule
  `xpForStep = 25 + 8 × objectifs` (`lib/xp.ts`). Chiffre calculé sur
  `data/courses/`, pas estimé.
- **`.env` pointe sur la base de production.** `prisma migrate dev` est
  interdit ; la procédure est `migrate dev --create-only` puis
  `migrate deploy` (voir `docs/DEPLOYMENT.md`).

---

## Partie 1 — Le briefing du jour

### Forme

Trois ordres de mission, un par emplacement. Les emplacements ont des rôles
distincts, et c'est ce qui donne sa texture à une journée.

| Emplacement | Rôle | XP |
|---|---|---|
| **Reprise** | Toujours faisable en ~5 min. Le filet : personne ne rentre bredouille. | 10 |
| **Effort** | L'objectif réel de la séance. | 20 |
| **Curiosité** | Sort le cadet de son ornière. | 15 |
| **Clôture** | Bonus si les trois sont validés. | 15 |

Total maximum : **60 XP par jour**.

### Catalogue d'archétypes

Chaque archétype déclare son emplacement, sa condition de faisabilité et sa
cible. Tous sont calculables depuis `StepCompletion` seul.

| id | Emplacement | Énoncé | Faisable si | Validé si |
|---|---|---|---|---|
| `deux-etapes` | Reprise | Valide 2 étapes | toujours | 2 étapes aujourd'hui |
| `une-etape` | Reprise | Valide une étape | toujours (repli) | 1 étape aujourd'hui |
| `boucler-chapitre` | Effort | Boucle le chapitre *{X}* | un chapitre entamé à ≥ 50 % | ce chapitre est complet |
| `cinq-etapes` | Effort | Valide 5 étapes | toujours | 5 étapes aujourd'hui |
| `serie-chapitre` | Effort | 3 étapes dans *{X}* | un chapitre entamé avec ≥ 3 étapes restantes | 3 étapes dans ce chapitre aujourd'hui |
| `palier-cursus` | Effort | Franchis les *{N}* % sur *{cursus}* | cursus actif < 100 % | le palier de 10 % suivant est franchi |
| `second-front` | Curiosité | Progresse dans 2 cursus | ≥ 2 cursus entamés | étapes dans 2 cursus distincts aujourd'hui |
| `cursus-dormant` | Curiosité | Reprends *{cursus}* | un cursus entamé, intouché depuis ≥ 7 jours | 1 étape dans ce cursus aujourd'hui |
| `premiere-fois` | Curiosité | Ouvre *{cursus}* | ≥ 1 cursus jamais commencé | 1 étape dans ce cursus aujourd'hui |

Le ciblage — *ce* chapitre, *ce* cursus — est ce qui sépare un briefing d'un
générateur aléatoire. Une quête qui nomme le cursus délaissé depuis neuf jours
donne l'impression que la station regarde ce que fait le cadet.

### Le piège de la faisabilité

La faisabilité **ne doit jamais être évaluée sur les données du jour**. Sinon :
le cadet reçoit « Reprends TypeScript », il valide une étape de TypeScript,
TypeScript n'est plus dormant, la quête cesse d'être éligible et disparaît au
rechargement — au moment exact où il vient de la réussir.

Règle : le tirage est une fonction pure de
`(userId, dateIso, complétions strictement antérieures à aujourd'hui 00:00 UTC)`.
Ces données sont immuables pour le reste de la journée, donc le briefing l'est
aussi. Les complétions du jour ne servent **qu'à la validation**, jamais au
tirage.

### Dégradés et cas limites

- Si aucun archétype n'est faisable pour un emplacement, l'emplacement est
  vide : le briefing peut ne compter que deux ordres. Le bonus de clôture
  s'applique alors aux ordres réellement émis.
- Cadet ayant tout terminé (100 % partout) : seuls `une-etape` /
  `deux-etapes` restent faisables ; le briefing affiche l'état « cursus épuisé »
  et pointe vers le Codex. Aucun ordre n'est inventé.
- Nouveau cadet, zéro complétion : `deux-etapes`, `cinq-etapes` et
  `premiere-fois` sont faisables. Le briefing est complet dès le jour 1.

### Attribution

L'attribution a lieu **dans l'appel serveur qui enregistre la complétion
d'étape** — le même qui verse déjà l'XP de l'étape. C'est ce qui permet à
`CompletionScreen` d'annoncer l'ordre accompli dans la foulée, sans requête
supplémentaire ni retour au dashboard. Le chargement du dashboard rattrape le
cas résiduel (progression faite ailleurs, session interrompue) en recalculant et
en versant ce qui ne l'a pas été.

L'idempotence repose sur `User.lastDailyMission` (la date)
et un masque de bits `User.dailyClaimed` (bit 0-2 = les trois ordres, bit 3 = la
clôture), remis à zéro au changement de date. Aucune XP n'est calculée côté
client.

---

## Partie 2 — La liaison

Le streak, renommé « liaison » dans l'interface, en trois pièces.

### 1. Le risque est visible

Le dashboard affiche l'échéance autant que le compteur — « liaison à 11 jours ·
signal perdu dans 4 h 12 » — et une **semaine en sept points** sous le
compteur. La perte motive le retour bien plus que le gain : on revient pour ne
pas perdre 11 jours, pas pour en gagner un 12ᵉ.

### 2. Le relais de secours

Un jour manqué ne rompt pas la liaison si le cadet détient un relais : il est
**consommé automatiquement**, et l'application le lui dit franchement au retour
— « un relais de secours a couvert ton absence d'hier, il t'en reste 1 ».
Silencieux, ce serait pris pour un bug ; annoncé, c'est un cadeau dont on se
souvient.

- Un relais gagné tous les 7 jours de liaison.
- Le premier est **offert au 3ᵉ jour**, avant d'en avoir besoin : on n'apprend
  pas une mécanique de filet le jour où on tombe.
- Plafond de 2 relais détenus. Au-delà, l'absence n'aurait plus aucun coût.

### 3. Le record est permanent

À la rupture, le compteur retombe mais `bestStreak` reste acquis et affiché.
Sans cela, un cadet qui casse une série de 20 jours a peu de raisons de
revenir.

### Machine à états

Entrées : `lastActiveDay`, `streak`, `streakShields`, `bestStreak`, `todayIso`.
Déclenchée à la **première étape validée du jour** (jamais à la simple visite).

Le déclencheur est l'étape, et non l'ordre accompli : un ordre peut demander
plusieurs étapes (« Valide 2 étapes », « 3 étapes dans le chapitre 4 »), et un
cadet qui n'en boucle qu'une un jour chargé a travaillé quand même. Lui rompre
sa liaison pour un effort réel mais partiel serait exactement le geste qui fait
décrocher, sur une fonctionnalité dont l'objectif premier est la rétention. Une
étape validée est du travail réel ; une visite n'en est pas.

```
gap = jours entre lastActiveDay et todayIso

gap == 0  → rien (déjà compté aujourd'hui)
gap == 1  → streak += 1
gap >= 2  → manqués = gap - 1
            si manqués <= streakShields :
                streakShields -= manqués ; streak += 1 ; signaler « relais consommé »
            sinon :
                streak = 1 ; signaler « liaison rompue »
lastActiveDay = todayIso ; bestStreak = max(bestStreak, streak)
si streak == 3 et aucun relais jamais reçu → +1 relais (offert)
si streak % 7 == 0 → +1 relais, plafonné à 2
```

`lastActiveDay == ""` (jamais actif) équivaut à `streak = 1`.

### Limite assumée

Un streak quotidien récompense la régularité, pas la disponibilité : quelqu'un
qui code trois heures le samedi sera toujours perdant face à quelqu'un qui fait
cinq minutes par jour. Le relais amortit ; il ne corrige pas. La parade
existerait — compter la liaison en semaines — mais elle est moins lisible et
moins « jeu ». Choix assumé du quotidien.

---

## Partie 3 — Les déblocables

### Principe

Ne pas construire un système de récompenses **à côté** des 48 badges, mais leur
donner enfin un usage : ils deviennent la matière de l'identité du cadet.

### Deux familles de badges

- **Badges de cursus** — les 48 existants, un par chapitre. Inchangés, catalogue
  inchangé, mapping de frames inchangé. Ils prouvent *ce que le cadet sait*.
- **Badges de conduite** — nouveaux, gagnés par la boucle quotidienne. Ils
  prouvent *comment il travaille*. Catalogue **séparé** de `BADGES` pour ne pas
  casser la correspondance position ↔ frame de `badges.png` ; icônes emoji, avec
  un drapeau `SPRITE_SHEETS_READY.conduct` à `false` jusqu'à ce qu'une planche
  dédiée existe.

| id | Énoncé | Condition |
|---|---|---|
| `liaison-7` | Signal stable | 7 jours de liaison |
| `liaison-30` | Vétéran de la Coalition | 30 jours de liaison |
| `liaison-100` | Increvable | 100 jours de liaison |
| `quetes-10` | Exécutant | 10 ordres validés |
| `quetes-50` | Assidu | 50 ordres validés |
| `quetes-200` | Pilier de la station | 200 ordres validés |
| `briefing-5` | Sans faute | 5 briefings complets d'affilée |
| `polyglotte` | Polyglotte | ≥ 1 étape dans 5 cursus distincts |
| `confins` | Explorateur des Confins | ≥ 1 étape dans 10 cursus distincts |
| `sprint` | Sprinteur | 10 étapes en une journée |
| `veilleur` | Veilleur | une étape validée entre 00 h et 05 h UTC |
| `retour` | Le Retour | voir ci-dessous |

`retour` mérite une justification : récompenser le retour plutôt que le seul
enchaînement, c'est rattraper les gens au moment précis où ils décrochent. C'est
le badge le plus utile de la liste pour l'objectif de rétention.

**Condition exacte de `retour`** — pour qu'elle ne soit pas interprétable de deux
façons : il est attribué à l'instant où la machine à états prend la branche
« liaison rompue » **avec un `streak` antérieur ≥ 7**. Ce moment est aussi celui
où le cadet vient de valider une quête, donc il est bien présent pour le voir. Un
cadet qui ne revient jamais ne déclenche jamais la branche, et c'est correct.

**Compteurs persistés.** Trois valeurs ne sont pas dérivables de
`StepCompletion` et vivent donc sur `User` : `questsCompleted` (incrémenté à
chaque ordre payé), `perfectBriefingRun` et `lastPerfectDay`. La règle de la
série de briefings, pour lever toute ambiguïté : au moment où le bonus de
clôture est versé, si `lastPerfectDay` est la veille alors
`perfectBriefingRun += 1`, sinon `perfectBriefingRun = 1` ; dans les deux cas
`lastPerfectDay = aujourd'hui`. Aucune remise à zéro différée n'est nécessaire —
la comparaison de dates suffit, et elle reste juste même après une absence de
six mois.

### Cinq axes de personnalisation, tous purement code

| Axe | Ce que c'est | Volume | Coût d'art |
|---|---|---|---|
| **Emblème** | Un badge obtenu, affiché en médaillon sur profil, nav et leaderboard | 48 dès le jour 1 | zéro (`badges.png` livrée) |
| **Cadre** | Anneau du médaillon : standard, double, pulsé, orbital, hexagonal, corrompu, amiral | 7 | zéro (CSS) |
| **Titre** | Ligne sous le pseudo | 12 | zéro (texte) |
| **Uniforme** | Couleurs au-delà des 5 : rouge Spectre, blanc glacier, rose néon, dégradé nébuleuse | 4 | zéro (CSS) |
| **Fond de carte** | Décor de la carte de cadet | 5 | zéro (`planet-*.png`) |

Plus de 70 objets déblocables sans produire une seule image neuve.

**Table complète des conditions.** Chacune est évaluable par une fonction pure
prenant l'état du cadet — aucune ne demande de nouvelle donnée.

| Axe | id | Condition |
|---|---|---|
| Cadre | `standard` | par défaut |
| Cadre | `double` | 5 jours de liaison |
| Cadre | `pulse` | 10 ordres validés |
| Cadre | `orbital` | 7 jours de liaison |
| Cadre | `hex` | grade Lieutenant |
| Cadre | `corrompu` | badge `security-shield` obtenu |
| Cadre | `amiral` | grade Amiral |
| Titre | `cadet` | par défaut |
| Titre | `cadet-ingenieur` | premier chapitre bouclé |
| Titre | `veilleur` | badge `veilleur` |
| Titre | `sprinteur` | badge `sprint` |
| Titre | `polyglotte` | badge `polyglotte` |
| Titre | `confins` | badge `confins` |
| Titre | `assidu` | badge `quetes-50` |
| Titre | `pilier` | badge `quetes-200` |
| Titre | `veteran` | badge `liaison-30` |
| Titre | `increvable` | badge `liaison-100` |
| Titre | `revenant` | badge `retour` |
| Titre | `amiral` | grade Amiral |
| Uniforme | `rouge-spectre` | badge `security-shield` |
| Uniforme | `blanc-glacier` | 14 jours de liaison |
| Uniforme | `rose-neon` | 25 ordres validés |
| Uniforme | `nebuleuse` | grade Capitaine |
| Fond | `planet-green` | par défaut |
| Fond | `planet-red` | 1 cursus terminé à 100 % |
| Fond | `planet-gas` | 3 cursus terminés à 100 % |
| Fond | `planet-ring` | grade Commandant |
| Fond | `planet-dry` | 2 500 XP |
| Fond | `space-orange` | grade Amiral |

Les titres se calquent volontairement sur les badges de conduite : le badge est
la preuve, le titre est ce qu'on en porte. Un seul système de conditions à
tester, deux surfaces de récompense.

### Règle non négociable : le rayon verrouillé est visible

Chaque objet non obtenu s'affiche grisé **avec sa condition et la distance
restante** — « Cadre Orbital · encore 3 jours de liaison ». Un rayon qu'on voit
est une feuille de route ; un rayon caché n'existe pas. C'est le seul détail de
cette partie qui, seul, fait revenir quelqu'un demain.

### Où ça vit

`/avatar` est déjà l'écran de personnalisation : il devient l'armurerie,
obtenus et verrouillés côte à côte. `/profil` affiche le résultat. **Aucune page
neuve.**

---

## Partie 4 — Le dashboard

Le problème n'est pas qu'il manque des éléments, c'est qu'aucun ne dit
« aujourd'hui » : la mission du jour est une boîte en colonne de droite, et la
carte de stats une grille de quatre nombres morts.

### Fusion du briefing et de la reprise de mission

Aujourd'hui deux appels à l'action se concurrencent : « continue ton cursus » et
« récupère ton bonus ». Ils deviennent un seul objet — la grande carte porte
**l'ordre d'effort du jour**, et son bouton mène directement à l'étape suivante.
La quête *est* la reprise de mission. Les ordres de reprise et de curiosité se
rangent dessous en deux lignes compactes, chacune avec sa barre de progression
et son bouton vers l'endroit concerné.

### Le reste de la page

- **Bandeau de liaison en tête** : compteur, sept points de la semaine,
  échéance. Vu avant même la bulle de bienvenue.
- **`StatsCard` devient la carte de cadet** : avatar avec son cadre débloqué,
  titre porté, emblème choisi, grade — et une **barre vers le prochain
  déblocable**, en permanence. « Cadre Orbital · encore 3 jours ».
- **L'état de fin de journée existe** : les trois ordres validés, la carte le
  dit et bascule sur ce qui vient. Une journée doit avoir une fin visible.

### Deux réparations dans le champ

- `components/ui/XPBar.tsx` affiche « LVL 1 » codé en dur. Bug d'affichage pur.
- **Nouvelle échelle de progression.** Grades de la Coalition, calibrés sur les
  9 312 XP réels du cursus :

  | Grade | Seuil |
  |---|---|
  | Cadet | 0 |
  | Aspirant | 400 |
  | Enseigne | 1 200 |
  | Lieutenant | 2 500 |
  | Commandant | 4 500 |
  | Capitaine | 7 000 |
  | Amiral | 10 000 |

  **Amiral est volontairement placé au-dessus des 9 312 XP du cursus.** Ce n'est
  pas une erreur de calibrage : le dernier grade demande d'avoir tout terminé
  *et* d'avoir été régulier. C'est le seul objectif d'après-cursus de cette
  spec, et il coûte une ligne de table.

  Le niveau chiffré est conservé mais courbé : `level = floor(sqrt(xp / 16)) + 1`.
  Il monte vite au début, ralentit ensuite, et culmine à 25 au bout du cursus au
  lieu de 94. `rankFromXp` (Bronze/Argent/Or) est remplacé par le grade.

- La cérémonie de déblocage réutilise `LevelUpOverlay.tsx`.

---

## Partie 5 — Données et migration

### Schéma

Sur `User` :

| Champ | Type | Rôle |
|---|---|---|
| `bestStreak` | `Int @default(1)` | Record permanent de liaison |
| `streakShields` | `Int @default(0)` | Relais de secours détenus (plafond 2) |
| `shieldEverGranted` | `Boolean @default(false)` | Le relais offert du 3ᵉ jour n'est donné qu'une fois |
| `questsCompleted` | `Int @default(0)` | Compteur pour les badges de conduite |
| `perfectBriefingRun` | `Int @default(0)` | Briefings complets d'affilée |
| `lastPerfectDay` | `String @default("")` | Date ISO du dernier briefing complet |
| `dailyClaimed` | `Int @default(0)` | Masque de bits d'idempotence du jour |
| `frame` | `String?` | Cadre porté |
| `title` | `String?` | Titre porté |
| `emblem` | `String?` | Badge mis en avant |
| `cardBg` | `String?` | Fond de carte |

Les quatre colonnes cosmétiques suivent exactement le motif de `species` /
`uniformColor` / `role` : nullables, valeur par défaut implicite côté rendu.

Table nouvelle, calquée trait pour trait sur `UserBadge` :

```prisma
model UserUnlock {
  id         String   @id @default(cuid())
  userId     String
  itemId     String
  unlockedAt DateTime @default(now())
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([userId, itemId])
}
```

Index à ajouter : `@@index([userId, completedAt])` sur `StepCompletion`. Sans
lui, chaque chargement du dashboard scanne toutes les étapes du cadet pour
recalculer la journée — le projet tient un budget de performance mesuré
(`docs/PERFORMANCE.md`, CF-17) qu'il ne faut pas casser ici.

`User.lastVisit` change de sens : « dernier jour actif », plus « dernière
visite ». Le nom de colonne est conservé (le renommer coûterait une migration
de données pour un gain cosmétique) ; le commentaire du schéma doit être
corrigé, faute de quoi le champ mentira à la prochaine lecture.

### Migration

`.env` pointe sur la base de production. La procédure est donc, sans
exception :

```
pnpm prisma migrate dev --create-only
# relire le SQL généré
pnpm prisma migrate deploy
```

Le script de migration doit initialiser `bestStreak = streak` pour tous les
comptes existants, afin que personne ne perde son historique le jour du
déploiement.

### Tests

Toute la logique de décision est pure et prend le temps en paramètre, dans la
lignée de `lib/daily-mission.ts` :

- `lib/quests.ts` — filtre de faisabilité, tirage déterministe, calcul de
  progression. Test de déterminisme : même `(userId, date, historique)` → mêmes
  ordres. Test du piège : le travail du jour ne modifie pas le tirage du jour.
- `lib/streak.ts` — la machine à états complète : incrément, consommation de
  relais, rupture, record, plafond de relais, relais offert non redonné.
- `lib/unlocks.ts` — évaluation des conditions, distance restante affichée.
- `lib/grades.ts` — seuils de grade et courbe de niveau.

Un parcours Playwright de bout en bout : connexion → briefing affiché → une
étape validée → un ordre passe à l'état accompli → l'XP est persistée.

L'XP n'est jamais calculée côté client ; le serveur recompte depuis
`StepCompletion`, comme le fait déjà `lib/me-server.ts`.

---

## Hors périmètre

- **Quêtes de maîtrise** (« sans indice », « du premier coup ») : réclament une
  télémétrie d'apprentissage inexistante, qui pose par ailleurs une vraie
  question au regard de `docs/RGPD.md`. Meilleur candidat pour une v2.
- **Rappels par e-mail** : le levier de rétention le plus puissant qui manque,
  et le plus intrusif. Consentement, désinscription, fréquence — un chantier à
  part entière.
- **Leaderboard hebdomadaire** : documenté en annexe ci-dessous, non retenu dans
  le périmètre de base.
- Monnaie, boutique, saisons, quêtes multi-jours, multiplicateurs d'XP, images
  neuves.

### Annexe — le leaderboard hebdomadaire (optionnel, ~½ jour)

Le classement actuel est gelé par construction. Un classement sur les **étapes
validées dans les 7 derniers jours** ne demande qu'une requête d'agrégation sur
`StepCompletion`, sans nouvelle colonne, et l'index
`(userId, completedAt)` posé plus haut le sert directement.

Il règle aussi un effet de bord de cette spec : les 60 XP quotidiens
s'accumulent dans `totalXp`, donc dans le classement cumulé, au bénéfice de
l'ancienneté plutôt que de l'apprentissage. Un classement hebdomadaire sur les
étapes remet la mesure sur le travail réel. À arbitrer avant l'implémentation.

## Risques

1. **La migration touche la production.** `migrate dev` seul est interdit —
   `--create-only` puis `migrate deploy`.
2. **Le streak devient plus exigeant** : il ne compte plus les visites. Atténué
   par l'initialisation de `bestStreak` à la valeur courante.
3. **Le niveau affiché change pour tous les comptes** le jour du déploiement
   (94 → 25 en fin de cursus). Effet de bord assumé de la nouvelle courbe.
4. **Le harcèlement de badges.** Trois quêtes, une liaison, un rayon de
   déblocables, une cérémonie : le risque de machine à sous est réel. Garde-fou
   imposé — **un seul appel à l'action dominant par écran**, et une cérémonie
   qui ne bloque jamais le retour au code.

Aucune donnée personnelle nouvelle : déblocables et liaison sont de la donnée de
progression, déjà couverte par l'existant.

## Critères d'acceptation

- [ ] Le briefing affiche jusqu'à trois ordres ciblés sur l'état réel du cadet
- [ ] Le tirage est identique à toute heure de la même journée, et le travail du
      jour ne le modifie pas
- [ ] Un ordre accompli verse son XP exactement une fois, calculé serveur
- [ ] La célébration apparaît sur l'écran de fin d'étape, pas seulement au
      dashboard
- [ ] La liaison ne monte que sur travail réel, jamais sur simple visite
- [ ] Un jour manqué avec relais : la liaison tient et le cadet en est informé
- [ ] Un jour manqué sans relais : la liaison retombe, `bestStreak` est conservé
- [ ] L'échéance de la journée est affichée en clair
- [ ] Les objets verrouillés sont visibles avec leur condition et la distance
- [ ] Les 48 badges existants sont sélectionnables comme emblème
- [ ] `XPBar` affiche le niveau réel
- [ ] Le grade progresse au-delà de 1 000 XP jusqu'à la fin du cursus
- [ ] `pnpm exec tsc --noEmit`, `vitest` et la suite Playwright passent
