# EXE-07 - Le moteur SQL ne se charge pas dans le navigateur

**Gravité** : Moyenne (disponibilité : un cursus entier inutilisable) · **Statut** : Corrigé · **Date** : 2026-09-14

**Découvert pendant l'audit.** Ce constat ne figurait pas dans l'audit initial. Il est apparu le 2026-09-14 en préparant la démonstration d'EXE-02 : pour montrer qu'une requête SQL sans fin fige l'onglet, il fallait d'abord qu'une requête normale s'exécute, et ce n'était pas le cas.

## Constat

Le cursus SQL exécute les requêtes avec sql.js (SQLite compilé en WebAssembly), dans le navigateur. Le fichier `.wasm` est hébergé dans `public/sql` et réclamé par `lib/sandbox/run-sql.ts`.

sql.js 1.14 déclare deux variantes dans ses `exports` :

| Condition | Fichier JavaScript | Fichier `.wasm` réclamé |
|---|---|---|
| `browser` | `sql-wasm-browser.js` | `sql-wasm-browser.wasm` |
| par défaut | `sql-wasm.js` | `sql-wasm.wasm` |

Le bundler du site choisit la variante `browser`. Or seul `sql-wasm.wasm` était hébergé. Le navigateur réclamait `/sql/sql-wasm-browser.wasm` et recevait une 404. Le moteur ne démarrait pas, et aucune requête ne s'exécutait : le bouton « Déployer » restait sans effet, sans message.

Relevé sur la production le 2026-09-14 :

| Fichier | Réponse |
|---|---|
| `https://www.laforgeducode.fr/sql/sql-wasm.wasm` | 200 |
| `https://www.laforgeducode.fr/sql/sql-wasm-browser.wasm` | **404** |

**Pourquoi personne ne l'a vu** : les tests unitaires du moteur tournent sous Node, qui prend la variante par défaut, et aucun test e2e n'exécutait de requête SQL.

## Démonstration

Test [e2e/sql-moteur.spec.ts](../../../e2e/sql-moteur.spec.ts), commité seul, avant le correctif (commit `c1d311a`). Il saisit la solution de la première étape (celle de l'indice) et la déploie.

| Contrôle | Avant correctif | Après correctif |
|---|---|---|
| L'étape est validée (« SYSTÈME EN LIGNE ») | **non**, rien ne s'exécute | oui |
| Erreurs de chargement WebAssembly dans la console | **oui** (404 sur `sql-wasm-browser.wasm`) | aucune |

Sorties : [avant correctif](annexes/EXE-07-demonstration-avant.txt), [après correctif](annexes/EXE-07-verification-apres.txt).

## Correctif

Le script [scripts/copy-sql-wasm.mjs](../../../scripts/copy-sql-wasm.mjs), lancé avant `dev` et avant `build` (comme `copy-monaco.mjs`), recopie depuis `node_modules` **les deux** fichiers `.wasm` de sql.js dans `public/sql`. Ils ne sont plus versionnés, mais générés : ils suivent toujours la version de sql.js installée, y compris sur Vercel, où `pnpm build` lance `prebuild`.

## Vérification

| Contrôle | Avant | Après |
|---|---|---|
| Démonstration e2e | 2 contrôles sur 2 en échec | 2 sur 2 réussis |
| Suite e2e complète (base locale, sans e-mail réel) | 38 réussis, 1 échec connu, 4 ignorés | 39 réussis (dont la démonstration), même échec connu, 4 ignorés |
| `vitest run` | 1458 / 1458 | 1458 / 1458 |
| `tsc --noEmit` | OK | OK |
| `eslint` | 0 erreur | 0 erreur |
| `next build` (fichiers présents dans `public/sql`) | OK | OK, `prebuild` copie les deux fichiers |

## À vérifier après déploiement

Une fois la branche fusionnée et déployée : `https://www.laforgeducode.fr/sql/sql-wasm-browser.wasm` doit répondre 200, et une requête du chapitre 1 SQL doit s'exécuter.
