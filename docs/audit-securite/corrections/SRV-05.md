# SRV-05 - Énumération des comptes à l'inscription

**Gravité** : Faible · **Statut** : Corrigé · **Date** : 2026-09-12

## Constat

`POST /api/signup` répondait `409 « Cet email est déjà utilisé »` quand l'adresse avait déjà un compte. N'importe qui pouvait donc tester une liste d'adresses et savoir lesquelles sont inscrites sur La Forge du Code, puis cibler ces personnes : hameçonnage crédible (« ton compte La Forge du Code… »), essais de mots de passe réutilisés ailleurs.

Les autres routes, elles, étaient déjà neutres : « mot de passe oublié » et « renvoyer l'e-mail de vérification » répondent de la même façon que l'adresse existe ou non.

## Démonstration

Test [e2e/securite-inscription.spec.ts](../../../e2e/securite-inscription.spec.ts), commité seul, avant le correctif (commit `11de9f9`). Il compare la réponse pour une adresse déjà inscrite (le compte de test) à celle pour une adresse libre. La suite tourne avec `RESEND_API_KEY=""` dans le shell : aucun e-mail réel ne part pendant les tests.

| Contrôle | Avant correctif | Après correctif |
|---|---|---|
| Statut, adresse inscrite / adresse libre | **409 / 200** | 200 / 200 |
| Forme de la réponse | **différente** (`error`, `field` / `ok`, `emailSent`, `emailError`) | identique (`ok`, `emailSent`, `emailError`) |
| Texte « déjà utilisé » dans la réponse | **présent** | absent |

Sorties : [avant correctif](annexes/SRV-05-demonstration-avant.txt), [après correctif](annexes/SRV-05-verification-apres.txt).

## Correctif

Dans [app/api/signup/route.ts](../../../app/api/signup/route.ts), une adresse déjà inscrite reçoit exactement la réponse d'une inscription réussie :

- **Pour le titulaire** : il reçoit un e-mail « Tu as déjà un compte » (`sendAccountExistsEmail`, [lib/email.ts](../../../lib/email.ts)), avec un lien de connexion et un lien « mot de passe oublié ». Aucun compte n'est créé et rien ne change sur le sien.
- **Pour le temps de réponse** : le hachage bcrypt du mot de passe est calculé comme pour une vraie inscription, pour que la réponse ne soit pas nettement plus rapide.
- **Contre l'inondation de boîtes** : l'avis part au plus 3 fois par adresse et par jour, pour que l'inscription ne serve pas à bombarder la boîte d'un tiers. La clé du limiteur est l'empreinte SHA-256 de l'adresse, jamais l'adresse elle-même.
- **Sur la page d'inscription** : « Compte créé, lien de confirmation » devient « Vérifie ta boîte mail », puisque l'e-mail reçu dit la suite dans les deux cas.

« Ce pseudo est déjà pris » reste affiché. Les pseudos sont publics (classement), donc le dire ne révèle rien, et l'utilisateur doit pouvoir en choisir un autre.

## Vérification

| Contrôle | Avant | Après |
|---|---|---|
| Démonstration e2e | 3 contrôles sur 3 en échec | 3 sur 3 réussis |
| Suite e2e complète (base locale, sans e-mail réel) | 35 réussis, 1 échec connu, 4 ignorés | 36 réussis (dont la démonstration), même échec connu, 4 ignorés |
| `vitest run` | 1450 / 1450 | 1450 / 1450 |
| `tsc --noEmit` | OK | OK |
| `eslint` | 0 erreur | 0 erreur |
| `next build` | OK | OK |

## Risque résiduel

- Une nouvelle inscription écrit en base (compte, jeton), ce qui prend quelques millisecondes de plus qu'un avis de compte existant. Cet écart est noyé dans le coût du hachage bcrypt et de l'envoi d'e-mail, sans le supprimer mathématiquement.
- La connexion elle-même répond plus vite quand l'adresse n'existe pas, faute de comparaison bcrypt factice. Ce point est suivi avec SRV-07.
