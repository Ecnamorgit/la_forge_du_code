# SUP-01 - Aucun moyen de signaler une faille

**Gravité** : Faible · **Statut** : Corrigé côté site, adresse à créer chez OVH · **Date** : 2026-09-12

## Constat

Le site ne publiait pas de fichier `/.well-known/security.txt`. L'audit initial l'a relevé en 404 sur la production. Défini par la RFC 9116, ce fichier dit à un chercheur en sécurité à qui écrire. Sans lui, une faille découverte est soit gardée pour soi, soit publiée sans que l'équipe soit prévenue.

## Démonstration

Test [e2e/securite-security-txt.spec.ts](../../../e2e/securite-security-txt.spec.ts), commité seul, avant le correctif (commit `5d866fd`).

| Contrôle | Avant correctif | Après correctif |
|---|---|---|
| `GET /.well-known/security.txt` | **404** | 200 |
| Champ `Contact` | **absent** | `mailto:securite@laforgeducode.fr` |
| Champ `Expires` | **absent** | `2027-09-01T00:00:00.000Z` |

Sorties : [avant correctif](annexes/SUP-01-demonstration-avant.txt), [après correctif](annexes/SUP-01-verification-apres.txt).

## Correctif

Le fichier [public/.well-known/security.txt](../../../public/.well-known/security.txt) contient :

- `Contact: mailto:securite@laforgeducode.fr` : une adresse dédiée sur le domaine du site, pour ne pas publier d'adresse personnelle ;
- `Expires` : moins d'un an, comme le recommande la RFC ;
- `Preferred-Languages: fr, en` et `Canonical`.

Un test unitaire ([lib/security-txt.test.ts](../../../lib/security-txt.test.ts)) vérifie les champs obligatoires, et échoue quand la date d'expiration est dépassée ou fixée à plus d'un an. Il rappellera donc de renouveler le fichier.

## Action hors code

L'adresse `securite@laforgeducode.fr` doit exister. Il faut la créer chez OVH, ou y poser une redirection vers la boîte de l'équipe. Tant que ce n'est pas fait, un signalement rebondirait.

## Vérification

| Contrôle | Avant | Après |
|---|---|---|
| Démonstration e2e | Échec : 404 | Réussie |
| Suite e2e complète (base locale) | 34 réussis, 1 échec connu, 4 ignorés | 35 réussis (dont la démonstration), même échec connu, 4 ignorés |
| `vitest run` | 1447 / 1447 | 1450 / 1450 (3 nouveaux tests) |
| `tsc --noEmit` | OK | OK |
| `eslint` | 0 erreur | 0 erreur |
| `next build` | OK | OK |
