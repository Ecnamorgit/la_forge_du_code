# SRV-03 - Sessions JWT jamais révoquées

**Gravité** : Moyenne · **Statut** : Corrigé · **Date** : 2026-09-14

## Constat

Les sessions sont des JWT signés, non stockés côté serveur (`auth.config.ts`, `strategy: "jwt"`), et duraient 30 jours (le défaut de next-auth). Rien ne les invalidait :

- une session volée restait valable jusqu'à son expiration, même après que la victime avait **réinitialisé son mot de passe** ;
- il n'existait aucun moyen de « déconnecter partout ».

`app/api/auth/reset-password/route.ts` changeait bien le hash du mot de passe, mais le JWT déjà émis continuait d'authentifier.

## Démonstration

Test [e2e/securite-session.spec.ts](../../../e2e/securite-session.spec.ts), commité avec la migration mais **avant** la logique de révocation (commit `b17f3df`). Un compte se connecte, obtient une session (`GET /api/me` → 200), puis on incrémente `sessionVersion` en base — ce que fera une réinitialisation.

| Contrôle | Avant correctif | Après correctif |
|---|---|---|
| Témoin : la session vaut avant révocation | 200 | 200 |
| Après révocation, `GET /api/me` | **200** (session survit) | 401 |

Sorties : [avant correctif](annexes/SRV-03-demonstration-avant.txt), [après correctif](annexes/SRV-03-verification-apres.txt).

## Correctif

Une **version de session** par compte, portée par le jeton.

- **Colonne** `User.sessionVersion` (migration `20260914101121_add_user_session_version`, additive, `DEFAULT 0`, sans perte de données).
- **À la connexion** (`auth.ts`, `authorize` puis `jwt`) : le jeton emmène la `sessionVersion` du moment.
- **À chaque vérification côté serveur** (`auth.ts`, callback `jwt` du côté Node) : [lib/session-guard.ts](../../../lib/session-guard.ts) compare la version du jeton à celle de la base. Une divergence renvoie `null` — la session est détruite, `auth()` ne rend plus d'utilisateur, les routes répondent 401.
- **À la réinitialisation du mot de passe** (`reset-password/route.ts`) : `sessionVersion` est incrémentée dans la même transaction que le nouveau hash. Toutes les sessions émises avant cessent aussitôt de fonctionner.
- **Durée réduite** : `session.maxAge` passe de 30 à **7 jours** (`auth.config.ts`).

Le contrôle de révocation vit dans `auth.ts` (Node), pas dans `auth.config.ts` : ce dernier est partagé avec le middleware **edge**, qui ne peut pas lire la base. Le middleware ne fait que rediriger la navigation ; tout accès à des données sensibles passe par `auth()` en Node (routes `/api/*`, pages qui appellent `auth()`), où la révocation s'applique.

## Vérification

| Contrôle | Avant | Après |
|---|---|---|
| Démonstration e2e | 1 contrôle sur 2 en échec | 2 sur 2 réussis |
| Suite e2e complète (base locale, sans e-mail réel, `--retries=1` comme en CI) | — | 42 réussis, 1 flake rejoué et réussi (budget de connexion partagé, cf. ci-dessous), seul échec dur `trial-etendu` (antérieur à l'audit) |
| `vitest run` | 1492 / 1492 | 1492 / 1492 |
| `tsc --noEmit` | OK | OK |
| `eslint` | 0 erreur | 0 erreur |
| Migration | additive, `migrate deploy` sur la base locale : OK | |

La suite e2e comprend `securite-connexion.spec.ts` et `global-setup` (connexions) : la version de session n'empêche aucune connexion légitime.

Note sur `securite-session.spec.ts` : il s'authentifie par l'API avec une adresse IP dédiée (`x-forwarded-for`), et non par le formulaire. Le formulaire partage un budget de débit par IP (`login:unknown` en local) avec toutes les autres specs ; une connexion de plus l'aurait fait déborder et aurait fait échouer une spec de connexion plus tardive. Ce budget partagé est une fragilité connue du banc de test — la CI la neutralise avec `retries: 1`.

## Risque résiduel

- **Le middleware ne révoque pas.** Il ne lit pas la base (edge). Une session révoquée franchit encore le middleware, mais est refusée dès qu'une route ou une page appelle `auth()` — c'est-à-dire à tout accès réel à des données. Aucun contenu sensible n'est servi sur le seul passage du middleware (voir SRV-10).
- **Coût** : chaque vérification de session fait une lecture indexée par clé primaire. En cas de panne de base, `sessionEstValide` répond `true` (fail-open) : la révocation est différée le temps de la panne, plutôt que de déconnecter tout le monde.
- **La suppression de compte** (`DELETE /api/me`) supprime la ligne `User` : la session suivante trouve un compte absent et reçoit 401.
