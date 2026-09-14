# SRV-06 - Redirection ouverte sur /avatar

**Gravité** : Faible · **Statut** : Corrigé · **Date** : 2026-09-12

## Constat

La page de l'avatar lit sa destination de retour dans l'URL, sans la filtrer (`app/avatar/page.tsx:41`) :

```ts
const returnTo = searchParams.get("from") || "/dashboard";
// ...
router.push(returnTo);          // après l'enregistrement
<Link href={returnTo}>Annuler</Link>
```

Un lien piégé `/avatar?from=https://site-piege.example` envoie donc l'utilisateur sur un site tiers juste après une action de confiance. Le site piège peut alors imiter la page de connexion : c'est un vecteur d'hameçonnage. Les liens légitimes du site n'utilisent que des chemins internes (`/avatar?from=/dashboard`, `/avatar?from=/profil`).

## Découverte pendant le correctif

La page de connexion avait déjà un filtre : `startsWith("/") && !startsWith("//")`. Il laisse pourtant passer `/\site-piege.example`, parce que les navigateurs lisent `\` comme `/` : la valeur devient `//site-piege.example`, c'est-à-dire un autre domaine. La connexion n'est pas exploitable, car next-auth revérifie l'origine de l'URL de retour. En revanche, recopier ce filtre sur /avatar aurait laissé la faille ouverte. Le correctif traite donc les deux pages avec la même fonction.

## Démonstration

Test [e2e/securite-redirection.spec.ts](../../../e2e/securite-redirection.spec.ts), commité seul, avant le correctif (commit `dfdb1ac`). Il ouvre `/avatar?from=https://piege.invalid/`, enregistre l'avatar et vérifie que l'on reste sur le site. Le domaine `.invalid` ne résout jamais : `page.route` répond à sa place, et aucune requête ne part vers l'extérieur.

| Contrôle | Avant correctif | Après correctif |
|---|---|---|
| Origine de la page après l'enregistrement | **`https://piege.invalid`** | le site lui-même (`/dashboard`) |

Sorties : [avant correctif](annexes/SRV-06-demonstration-avant.txt), [après correctif](annexes/SRV-06-verification-apres.txt).

## Correctif

Une fonction commune, [lib/safe-redirect.ts](../../../lib/safe-redirect.ts) (`safeInternalPath`) :

1. Elle refuse ce qui ne commence pas par `/`.
2. Elle refuse l'antislash et les caractères de contrôle. Le navigateur lit l'un comme un slash et retire les autres, ce qui peut reformer un `//`.
3. Elle résout la valeur comme le ferait le navigateur, et n'accepte que ce qui reste sur la même origine.

Dans tous les autres cas, la destination devient `/dashboard`. La fonction est utilisée par `/avatar` (bouton d'enregistrement et lien « Annuler ») et par `/login`. Les tests unitaires couvrent 15 cas, dont `/\piege.example`, `//piege.example`, les tabulations et retours à la ligne qui reforment `//`, et le schéma `javascript:`.

## Vérification

| Contrôle | Avant | Après |
|---|---|---|
| Démonstration e2e | Échec : sortie vers le site piège | Réussie |
| Suite e2e complète (base locale) | 30 réussis, 1 échec connu, 4 ignorés | 31 réussis (dont la démonstration), même échec connu, 4 ignorés |
| `vitest run` | 1375 / 1375 | 1390 / 1390 (15 nouveaux tests) |
| `tsc --noEmit` | OK | OK |
| `eslint` | 0 erreur | 0 erreur |
| `next build` | OK | OK |

## Risque résiduel

Aucun connu sur ce point. Sur la connexion, next-auth conserve son propre contrôle d'origine, en seconde barrière.
