# SRV-09 - Origine des requêtes non vérifiée, suppression de compte sans mot de passe

**Gravité** : Faible · **Statut** : Corrigé · **Date** : 2026-09-12

## Constat

1. **Origine des requêtes.** Les routes qui modifient des données (`POST`, `PATCH`, `DELETE`) ne vérifiaient pas d'où venait la requête. Seul le cookie de session en `SameSite=Lax` protégeait contre la falsification de requêtes (CSRF). Or SameSite raisonne par *site*, pas par origine : un sous-domaine de laforgeducode.fr compte comme le même site, et le navigateur y joint le cookie. Le jour où le bac à sable d'exécution passera sur un sous-domaine (correctif prévu pour EXE-03), le code des apprenants pourrait appeler les API avec la session de l'apprenant. Les routes lisaient de plus le corps en JSON quel que soit son type, donc une requête « simple » en `text/plain` passait.
2. **Suppression du compte.** `DELETE /api/me` effaçait définitivement le compte sur la seule foi de la session. Une session volée, ou un ordinateur resté connecté, suffisait.

## Démonstration

Test [e2e/securite-csrf-suppression.spec.ts](../../../e2e/securite-csrf-suppression.spec.ts), commité seul, avant le correctif (commit `c42b65c`), avec un compte dédié recréé à chaque exécution. La requête « d'une autre origine » est simulée avec l'en-tête `Origin` qu'enverrait un navigateur depuis ce sous-domaine, et la session du compte.

| Contrôle | Attendu | Avant correctif | Après correctif |
|---|---|---|---|
| `POST /api/me/visit` avec `Origin: https://piege.invalid` | 403 | **200** | 403 |
| `DELETE /api/me` sans mot de passe | 400 | **200 : compte effacé** | 400 |
| Le compte existe toujours | 200 | **401** | 200 |
| `DELETE /api/me` avec un mauvais mot de passe | 403 | **401** (compte déjà effacé) | 403 |
| `DELETE /api/me` avec le bon mot de passe | 200 | **401** (compte déjà effacé) | 200 |

Sorties : [avant correctif](annexes/SRV-09-demonstration-avant.txt), [après correctif](annexes/SRV-09-verification-apres.txt).

## Correctif

**Origine** : [lib/same-origin.ts](../../../lib/same-origin.ts) (`crossOriginRefusal`) renvoie 403 quand l'en-tête `Origin` ne correspond pas à l'hôte de la requête. La comparaison se fait sur `x-forwarded-host`, puis `host`, comme Next le fait pour ses server actions : derrière Vercel, `req.url` peut différer de l'adresse publique. Sans `Origin`, la fonction se rabat sur `Sec-Fetch-Site`. Sans l'un ni l'autre (un client hors navigateur, comme curl), aucune CSRF n'est possible et la requête passe. L'origine opaque `null` d'une iframe sandboxée est refusée.

La garde est placée en tête des 16 routes qui modifient des données, avant l'authentification et avant la limite de débit, pour qu'une requête refusée ne consomme rien :

- `/api/me` (DELETE), `/api/me/avatar`, `/cinematic`, `/cosmetics`, `/onboarded`, `/reset`, `/step`, `/trial-import`, `/username`, `/visit` ;
- `/api/signup`, `/api/track`, `/api/auth/check-verification`, `/forgot-password`, `/resend-verification`, `/reset-password`.

Les routes de next-auth (`/api/auth/[...nextauth]`) gardent leur propre jeton anti-CSRF.

**Suppression** :

- `DELETE /api/me` exige le mot de passe. Il est vérifié par `verifyPassword` (`lib/me-server.ts`), avec la même comparaison bcrypt que la connexion. Réponses : 400 si le mot de passe est absent, 403 s'il est faux. La route est limitée à 5 essais par quart d'heure et par compte, pour qu'elle ne serve pas à deviner un mot de passe.
- La page profil remplace la simple confirmation du navigateur par un champ mot de passe, avec les boutons « Confirmer la suppression » et « Annuler ». Un second test e2e parcourt cet écran : mauvais mot de passe refusé, puis suppression et retour à l'accueil.

## Vérification

| Contrôle | Avant | Après |
|---|---|---|
| Démonstration e2e | 5 contrôles sur 5 en échec | 5 sur 5 réussis |
| Parcours de suppression dans l'interface | (n'existait pas) | réussi : mauvais mot de passe refusé, puis suppression et retour à l'accueil |
| Suite e2e complète (base locale) | 32 réussis, 1 échec connu, 4 ignorés | 34 réussis (dont les 2 tests SRV-09), même échec connu, 4 ignorés |
| `vitest run` | 1438 / 1438 | 1447 / 1447 (9 nouveaux tests) |
| `tsc --noEmit` | OK | OK |
| `eslint` | 0 erreur | 0 erreur |
| `next build` | OK | OK |

La suite e2e fait appel à toutes les routes modifiées depuis le navigateur (connexion, inscription, avatar, étapes, cinématiques…) : l'en-tête `Origin` de la même origine y est accepté.

## Risque résiduel

- La réinitialisation de la progression (`POST /api/me/reset`) reste confirmée par une simple boîte de dialogue : elle est réversible en rejouant le parcours, contrairement à la suppression.
- Une session volée reste valable jusqu'à son expiration (constat SRV-03, qui demande une migration de base).
