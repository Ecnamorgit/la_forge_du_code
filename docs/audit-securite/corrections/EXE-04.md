# EXE-04 - Indices injectés dans la page comme du HTML

**Gravité** : Faible · **Statut** : Corrigé · **Date** : 2026-09-12

## Constat

Le composant `HintBox` affichait l'indice de l'étape avec `dangerouslySetInnerHTML` (`components/ui/HintBox.tsx:17-20`). Or **68 indices sur 192** contiennent du code HTML ou JSX à recopier, et aucun n'utilise de balise de mise en forme. Au lieu d'être montré, ce code était interprété par le navigateur :

- **pour l'apprenant**, le code à taper n'apparaissait jamais. L'indice du chapitre 2 HTML, « Ajoute `<a href="https://developer.mozilla.org" target="_blank">Documentation MDN</a>`. », s'affichait sous la forme « Ajoute Documentation MDN. », avec un vrai lien ;
- **pour l'interface**, les balises des indices (`<style>`, `<link>`, `<img>`, `<form>`, `<input>`, des `id` déjà utilisés dans la page…) étaient réellement insérées dans la page à l'ouverture de l'indice ;
- **pour la sécurité**, c'est un point d'injection HTML. Le contenu est rédigé par l'équipe et versionné, donc il n'est pas exploitable aujourd'hui. Mais si les cours passaient un jour en base de données ou dans un outil d'édition, ce serait une XSS stockée.

Les deux autres `dangerouslySetInnerHTML` du site (texte de la leçon dans `ChapterClient.tsx:560`, fiches de `DocPanel.tsx:138`) passent par `renderLessonMarkdown`, qui échappe le HTML avant toute mise en forme. Ils ne sont pas concernés.

## Démonstration

Test [e2e/securite-indices.spec.ts](../../../e2e/securite-indices.spec.ts), commité seul, avant le correctif (commit `14029ac`). Il ouvre le chapitre 2 HTML, clique sur « 💡 Indice » et regarde la page.

| Contrôle | Avant correctif | Après correctif |
|---|---|---|
| Lien « Documentation MDN » injecté dans la page | **présent** | absent |
| Texte affiché dans la boîte d'indice | **« Ajoute Documentation MDN. »** | le code complet, `<a href="https://developer.mozilla.org" target="_blank">Documentation MDN</a>` |

Sorties : [avant correctif](annexes/EXE-04-demonstration-avant.txt), [après correctif](annexes/EXE-04-verification-apres.txt).

## Correctif

- `HintBox` affiche l'indice comme du texte (`{text}` dans un bloc qui conserve les retours à la ligne). Plus aucun HTML n'est interprété, et la propriété est renommée de `html` en `text` pour que son nom dise ce qu'elle reçoit.
- Les 3 indices du chapitre 1 HTML étaient écrits avec des entités (`&lt;head&gt;`) pour contourner le problème. Ils sont réécrits en clair : avec un rendu en texte, les entités se seraient affichées telles quelles.
- Un test unitaire ([data/courses/indices.test.ts](../../../data/courses/indices.test.ts)) interdit désormais toute entité HTML dans les indices, pour les 15 cursus.

## Vérification

| Contrôle | Avant | Après |
|---|---|---|
| Démonstration e2e | 2 contrôles sur 2 en échec | 2 sur 2 réussis |
| Suite e2e complète (base locale) | 31 réussis, 1 échec connu, 4 ignorés | 32 réussis (dont la démonstration), même échec connu, 4 ignorés |
| `vitest run` | 1390 / 1390 | 1438 / 1438 (48 nouveaux tests, un par chapitre) |
| `tsc --noEmit` | OK | OK |
| `eslint` | 0 erreur | 0 erreur |
| `next build` | OK | OK |

## Risque résiduel

Aucun sur les indices. Le reste du contenu HTML des leçons passe par `renderLessonMarkdown`, qui échappe avant de mettre en forme. Les 3 injections du site sont désormais toutes échappées.
