# SRV-07 - Aucune limite de tentatives de connexion par compte

**Gravité** : Faible · **Statut** : Corrigé · **Date** : 2026-09-14

## Constat

La connexion était limitée à 10 essais par 5 minutes, mais **par adresse IP** (`auth.ts`). Un attaquant qui dispose de nombreuses IP (proxys, réseau de machines compromises) pouvait donc essayer des mots de passe sur un même compte sans jamais atteindre la limite. Le risque est réel pour les mots de passe courts ou réutilisés : la politique en impose au moins 8 caractères, dont une lettre et un chiffre.

Deux points aggravants :

- **Adresses inconnues** : une adresse sans compte obtenait une réponse immédiate, sans calcul bcrypt, donc plus rapide qu'un mauvais mot de passe. Cet écart de temps permettait d'énumérer les comptes.
- **Route `/api/auth/check-verification`** : elle confirme si un mot de passe est correct pour un compte non vérifié. Elle aurait permis de continuer les essais à côté de la connexion.

## Démonstration

Test [e2e/securite-connexion.spec.ts](../../../e2e/securite-connexion.spec.ts), commité seul, avant le correctif (commit `85690c9`), avec un compte dédié.

Les IP multiples sont simulées avec l'en-tête `X-Forwarded-For`. En local, sans proxy devant le serveur, c'est le client qui le fournit. En production, Vercel pose lui-même cet en-tête avec la vraie adresse. La simulation représente donc un attaquant aux IP multiples, pas une faille de l'en-tête.

| Contrôle | Avant correctif | Après correctif |
|---|---|---|
| Témoin : le bon mot de passe ouvre la session | oui | oui |
| 12 mauvais mots de passe depuis 12 IP, puis le bon depuis une 13e | **session ouverte** | compte verrouillé, pas de session |

Sorties : [avant correctif](annexes/SRV-07-demonstration-avant.txt), [après correctif](annexes/SRV-07-verification-apres.txt).

## Correctif

[lib/login-guard.ts](../../../lib/login-guard.ts) compte les **échecs** par compte. À 10 échecs en 15 minutes, le compte refuse toute connexion, même avec le bon mot de passe, jusqu'à la fin de la fenêtre.

- **Adresses inconnues comptées aussi** : le verrouillage ne révèle pas qui est inscrit.
- **Aucune adresse en clair** : la clé du limiteur est l'empreinte SHA-256 de l'adresse.
- **Seuls les échecs comptent** : le limiteur gagne `isRateLimited`, qui regarde le compteur sans l'incrémenter. On regarde avant l'essai, on compte après un échec.
- **Temps de réponse constant** : pour une adresse inconnue, `authorize` compare le mot de passe à un hash factice. Ce hash est calculé au premier besoin, pas au chargement du module : `auth.ts` est importé par toutes les routes, et chaque démarrage à froid aurait sinon payé un bcrypt de coût 12.
- **`check-verification` respecte le même verrou.** Elle ne compte un échec que dans le seul cas où sa réponse apprend quelque chose : un compte non vérifié avec un mauvais mot de passe. La page de connexion l'appelle en effet après chaque connexion ratée. Si elle comptait aussi, chaque faute de frappe compterait double, et 5 fautes suffiraient à verrouiller un compte légitime.

## Vérification

| Contrôle | Avant | Après |
|---|---|---|
| Démonstration e2e | 1 contrôle sur 2 en échec | 2 sur 2 réussis |
| Suite e2e complète (base locale, sans e-mail réel) | 36 réussis, 1 échec connu, 4 ignorés | 38 réussis (dont les 2 tests SRV-07), même échec connu, 4 ignorés |
| `vitest run` | 1454 / 1454 | 1458 / 1458 (4 nouveaux tests) |
| `tsc --noEmit` | OK | OK |
| `eslint` | 0 erreur | 0 erreur |
| `next build` | OK | OK |

## Risque résiduel

- **Verrouillage volontaire d'un compte** : un attaquant qui connaît une adresse peut la faire verrouiller 15 minutes en ratant 10 connexions. C'est le compromis habituel de ce type de protection. La fenêtre courte limite la gêne, et « mot de passe oublié » reste disponible.
- **Portée réelle en production** : sans Upstash Redis en production, les compteurs sont tenus par instance serverless (constat SRV-01). Le verrou n'est donc pleinement efficace qu'une fois Redis configuré.
