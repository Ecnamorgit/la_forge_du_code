# SRV-10 - Page chapitre protégée par le seul proxy

**Gravité** : Faible · **Statut** : Corrigé · **Date** : 2026-09-14

## Constat

`proxy.ts` renvoie vers la connexion tout visiteur sans session qui demande une page de `/learn`, sauf les chapitres d'essai. Mais la page d'un chapitre (`app/learn/[course]/[chapter]/page.tsx`) ne vérifiait pas la session elle-même : elle comptait sur le seul proxy.

Or next 16.2.4 portait plusieurs contournements publics du proxy (voir DEP-01). Le jour où un nouveau contournement apparaît, une page qui ne se garde pas elle-même sert son contenu à n'importe qui. La carte du cursus (`app/learn/[course]/page.tsx`) se protégeait déjà ainsi, par défense en profondeur. La page chapitre, non.

Les autres pages protégées (tableau de bord, profil, classement, avatar, liste des cursus) sont des composants client : leurs données viennent des API, qui vérifient toutes la session elles-mêmes (voir la carte des routes de l'audit initial).

## Démonstration

Depuis DEP-01, les contournements connus du proxy sont fermés : on ne peut plus en montrer un en conditions réelles. Le test [page.test.ts](../../../app/learn/[course]/[chapter]/page.test.ts) simule donc le contournement : il appelle la page directement, sans session, exactement comme si le proxy n'avait pas filtré la requête. Il a été commité seul, avant le correctif (commit `74ec0e9`).

| Contrôle | Avant correctif | Après correctif |
|---|---|---|
| Chapitre 5 HTML, sans session | **servi en entier** (briefing, étapes, indices) | renvoi vers `/login` |
| Chapitre 1 CSS, sans session | **servi** | renvoi vers `/login` |
| Chapitre 1 HTML (essai), sans session | servi | servi |
| Chapitre 5 HTML, avec session | servi | servi |

Sorties : [avant correctif](annexes/SRV-10-demonstration-avant.txt), [après correctif](annexes/SRV-10-verification-apres.txt).

## Correctif

La page applique la même règle que le proxy, avec la même source de vérité (`isPublicRoute`, `lib/public-routes.ts`). Sans session, seuls les chapitres d'essai sont servis. Sinon, elle renvoie vers `/login?from=…`, comme le proxy. La session n'est lue que pour les chapitres protégés.

## Vérification

| Contrôle | Avant | Après |
|---|---|---|
| Démonstration (vitest) | 2 contrôles sur 4 en échec | 4 sur 4 réussis |
| Suite e2e complète (base locale, sans e-mail réel) | 36 réussis, 1 échec connu, 4 ignorés | 36 réussis, même échec connu, 4 ignorés |
| `vitest run` | 1450 / 1450 | 1454 / 1454 (4 nouveaux tests) |
| `tsc --noEmit` | OK | OK |
| `eslint` | 0 erreur | 0 erreur |
| `next build` | OK | OK |

Un premier passage de `vitest run`, lancé pendant que la suite e2e compilait en parallèle, a vu `lib/sandbox/jsx-transform.test.ts` dépasser son délai de 5 s (13,9 s pour le premier appel à Sucrase). Relancé seul (6 / 6 en 0,8 s), puis toute la suite sur une machine au repos (1454 / 1454) : l'échec venait de la charge, pas du correctif.

La suite e2e comprend `trial-etendu.spec.ts` (« un chapitre protégé redirige vers la connexion ») et les parcours des chapitres d'essai et des chapitres connectés : la garde ne bloque aucun accès légitime.

## Risque résiduel

Aucun connu sur ce point.
