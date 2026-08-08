# Rapport — questions ouvertes sur les validateurs

**Chantier :** CF-18, couverture de tests des validateurs
**Spec :** `docs/superpowers/specs/2026-08-06-couverture-validateurs-design.md`

Ce document liste les **arbitrages pédagogiques** rencontrés en écrivant les
tests — les cas où un validateur refuse une réponse défendable, ou en accepte
une discutable. Ils ne sont **pas tranchés ici** : décider de ce qu'un apprenant
a le droit d'écrire n'est pas une décision d'implémentation.

Les bugs techniques nets (regex fausse, condition inversée, message décrivant
une autre exigence que celle testée) sont corrigés directement, avec le test
qui les prouve ; ils sont récapitulés ci-dessous pour mémoire.

---

## Bilan

**397 tests ajoutés** — la suite passe de 485 à 882. **Huit bugs trouvés**, tous
en production jusque-là.

Répartition : 189 pour le balayage structurel, 59 pour les chapitres CSS 1 à 5,
65 pour les chapitres CSS 6 à 10, 84 pour les neuf cursus mono-chapitre.

| Gravité | Défaut | Effet |
|---|---|---|
| 🔴 | `css/chapitre-9` : `/\bnfinite\b/` ne matchait jamais `infinite` | Étape finale du cursus CSS infranchissable |
| 🔴 | `css/chapitre-8` : `\bwidth` matchait dans `max-width` | La solution imprimée dans l'indice était refusée |
| 🟠 | `css/_utils` : `\bcolor` matchait dans `background-color` | Colorer le fond validait « colore le texte » |
| 🟠 | `python` : le motif d'appel était satisfait par la déclaration | Définir sans appeler validait l'étape |
| 🟠 | `git` : `\s+` traversait le saut de ligne (2 endroits) | Commande sans argument validée par la ligne suivante |
| 🟡 | `css/chapitre-6` : `\b(top\|right\|bottom\|left)` (2 endroits) | `padding-left` comptait comme un décalage |
| 🟡 | `css/chapitre-7` : `\bcontent` | `justify-content` satisfaisait l'exigence de `content` |

**Six des huit ont la même cause** : `\b` matche après un tiret, donc un motif
`\bsuffixe` se déclenche à l'intérieur d'une propriété ou d'un mot plus long.
C'est le piège structurel de la validation par expression régulière sur du CSS,
où presque toutes les propriétés sont composées.

**Cinq sur huit acceptaient une mauvaise réponse**, trois en refusaient une
bonne. Les premières sont les plus coûteuses pédagogiquement : l'apprenant
franchit l'étape en ayant appris l'inverse de ce qu'elle enseigne.

---

## Balayage structurel — 2026-08-06

`lib/validators/parcours-integrite.test.ts`, 189 tests sur les 48 chapitres.

**Aucune anomalie.** Les deux invariants passent du premier coup :

- chaque chapitre a exactement autant de validateurs que d'étapes ;
- aucun `startCode` ne valide sa propre étape — aucune étape n'est vide.

Le balayage n'a donc rien réparé. Sa valeur est en avant : il couvre les 191
étapes, y compris celles des chapitres qui n'existent pas encore, et il échoue
si quelqu'un ajoute un chapitre sans validateur ou assouplit un validateur au
point que le code de départ suffise.

Vérifié en le sabotant volontairement : un validateur rendu permissif fait
échouer le test avec le chapitre, l'étape et la conséquence nommés.

---

## Bugs techniques corrigés

Listés ici pour mémoire ; chacun est couvert par un test qui échouait avant.

### `hasProperty` acceptait `background-color` pour `color`

`lib/validators/css/_utils.ts` — trouvé le 2026-08-06 en écrivant les tests du
chapitre 2.

La vérification de propriété utilisait `\bcolor\s*:`. Dans `background-color`,
le tiret qui précède `color` est un caractère non-mot : `\b` y matche. Une étape
demandant `h1 { color: … }` acceptait donc `h1 { background-color: … }`.

**Effet sur l'apprenant :** il colorait le fond au lieu du texte, obtenait
« validé », et passait à la suite en croyant avoir compris la propriété.

Corrigé par un lookbehind `(?<![-\w])`, appliqué aussi à `hasPropertyWithValue`
qui portait le même défaut. Les deux touchaient toutes les étapes CSS reposant
sur `color`, `width`, `gap`, `border` — soit l'essentiel du cursus.

Aucun autre helper du dépôt ne présente ce motif (`javascript/_utils.ts` et
`_static-utils.ts` vérifiés).

### La dernière étape du cursus CSS était infranchissable

`lib/validators/css/chapitre-9.ts:58` — trouvé le 2026-08-06.

Le test du mot-clé `infinite` s'écrivait `/\bnfinite\b/i` : le `i` initial
manquait. Comme `\b` exige une frontière de mot et que `nfinite` est précédé
d'un `i` dans `infinite`, le motif ne matchait **jamais**.

**Effet sur l'apprenant :** `animation: rotation 2s linear infinite;` — la forme
qu'enseigne le cours — était refusée. Seul `animation-iteration-count: infinite`
passait. L'étape finale du cursus CSS, et donc son badge de complétion, était
hors d'atteinte par la voie normale.

### La solution du cours refusée par sa propre étape

`lib/validators/css/chapitre-8.ts:13` — trouvé le 2026-08-06.

L'étape 1 demande de remplacer une largeur figée par `max-width`. Une garde
`/\bwidth\s*:\s*800px\b/` devait détecter un `width: 800px` résiduel — mais elle
matchait à l'intérieur de `max-width: 800px`.

**Effet sur l'apprenant :** l'indice du cours dit littéralement
`max-width: 800px; width: 100%;`. Le suivre menait au refus.

### Trois acceptations à tort, même cause

Toutes trouvées le 2026-08-06, toutes corrigées par le même lookbehind.

| Fichier | Motif fautif | Ce qui passait à tort |
|---|---|---|
| `css/chapitre-6.ts:5` | `\b(top\|right\|bottom\|left)` | `padding-left` comptait comme un décalage de positionnement |
| `css/chapitre-6.ts:58` | `\btop` | `margin-top` satisfaisait le `top` qu'exige `sticky` |
| `css/chapitre-7.ts:47` | `\bcontent` | `justify-content` satisfaisait l'exigence de `content`, et le pseudo-élément restait invisible |

**La cause est unique et systémique :** en CSS, la plupart des propriétés sont
composées d'un préfixe et d'un tiret. `\b` matche après un tiret, donc tout
motif `\bsuffixe` se déclenche à l'intérieur d'une propriété plus longue.
Cinq occurrences dans le dépôt, toutes dans le cursus CSS.

Balayage effectué sur `lib/validators/` : la seule occurrence restante est
`react/chapitre-8.ts:139` (`/\bdefault\s*:/`), sans danger — les identifiants
JavaScript ne contiennent pas de tiret.

### Python : « appelle la fonction » n'était pas vérifié

`lib/validators/python/chapitre-1.ts:28` — trouvé le 2026-08-06.

L'étape 2 annonce « Appelle `calculer_xp(5, 20)` et affiche le résultat ». Le
contrôle cherchait `/calculer_xp\s*\(/` dans le code entier — or la ligne
`def calculer_xp(niveau, bonus):` contient déjà ce motif. La condition était
donc satisfaite par la seule déclaration.

**Effet sur l'apprenant :** un code qui définit la fonction sans jamais
l'appeler était accepté, du moment qu'un `print` traînait quelque part.

Corrigé en retirant la ligne de déclaration avant de chercher l'appel.

### Git : un argument pouvait être fourni par la ligne suivante

`lib/validators/git/chapitre-1.ts:32,43` — trouvé le 2026-08-06.

`/git\s+remote\s+add\s+origin\s+\S+/` : `\s` traverse le saut de ligne, donc
`git remote add origin` **sans URL** était validé par le premier mot de la
commande suivante. Même défaut sur `git checkout -b` / `git switch -c`, où le
nom de branche pouvait manquer.

**Effet sur l'apprenant :** l'oubli le plus courant de l'étape — taper la
commande sans son argument — passait pour correct.

Corrigé en exigeant l'argument sur la même ligne (`[ \t]+`).

---

## Fragilité corrigée en passant

`lib/courses-catalog.test.ts:49` — le test d'intégrité du cursus React importe
dynamiquement `courses-registry`, ce qui charge le contenu des 48 chapitres et
frôlait les 5 s de délai par défaut de vitest. Les 397 tests ajoutés par ce
chantier ont suffi à le faire basculer par intermittence sous la charge
parallèle.

Ce n'était pas une régression fonctionnelle — le test passait isolément — mais
un test instable finit par être ignoré. Délai porté à 20 s, avec la raison
écrite sur place. Suite relancée trois fois de suite : 882 verts à chaque fois.

---

## Questions ouvertes

*Aucune.* Les dix chapitres CSS et les neuf cursus mono-chapitre n'ont soulevé
que des bugs techniques nets. Aucun arbitrage pédagogique n'a été rencontré :
chaque désaccord constaté entre un validateur et une réponse raisonnable venait
d'un motif de recherche trop large, jamais d'un choix de contenu.
