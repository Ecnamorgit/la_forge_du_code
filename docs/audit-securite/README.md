# Audit de sécurité de La Forge du Code

Un site où l'on tape et exécute du code est une cible. Ce dossier montre la démarche suivie pour le sécuriser, en quatre temps :

1. **Chercher** : audit du site en production et relecture du code (2026-09-12).
2. **Démontrer** : pour chaque faille, un test qui échoue et prouve qu'elle existe.
3. **Corriger** : le correctif, qui fait passer ce même test.
4. **Re-mesurer** : contre-audit avec les mêmes outils, pour comparer l'avant et l'après.

Chaque étape correspond à des commits de la branche `audit/securite-2026-09` : l'historique git sert de preuve.

## Contenu

| Dossier | Rôle |
|---|---|
| [2026-09-12-audit-initial/](2026-09-12-audit-initial/) | État de départ, figé : dossier BLACKPROOF complet et annexes brutes des outils |
| [outils/](outils/) | Générateur du dossier et données de l'audit |

Dans chaque dossier d'audit :

- `note-synthese-*.md` : la page à lire en premier.
- `rapport-audit-*.md` : questionnaire, réponses, constats détaillés avec fichier et ligne.
- `registre-preuves-*.csv` : chaque preuve avec son empreinte SHA-256.
- `plan-remediation-*.csv` : corrections, gravité, échéance.
- `proofpack-*.json` : dossier au format BLACKPROOF v3.
- `proofpack-bundle-manifest.json` : inventaire et empreinte de tous les fichiers.
- `annexes/` : sorties brutes de ZAP, Lighthouse, Mozilla Observatory, SSL Labs et `pnpm audit`.

## Outils utilisés

| Outil | Ce qu'il contrôle |
|---|---|
| Mozilla Observatory | En-têtes de sécurité HTTP |
| Qualys SSL Labs | Configuration TLS et certificat |
| OWASP ZAP (baseline, passif) | Failles courantes détectables sans attaque |
| Lighthouse | Performance, accessibilité, bonnes pratiques, SEO |
| `pnpm audit --prod` | Vulnérabilités connues des dépendances |
| Relecture du code | Exécution du code des apprenants, authentification, contrôle d'accès, données |

## Vérifier le dossier

- **Intégrité du dossier** : déposer `proofpack-*.json` sur https://blackproof.fr/verify (vérification locale, sans compte ni envoi au serveur).
- **Une preuve de code** : son empreinte porte sur le fichier du commit audité, donc elle reste vérifiable après les corrections.

  ```bash
  git show 48b1627:lib/sandbox/run-js.ts | sha256sum
  ```

- **Régénérer le dossier** :

  ```bash
  node docs/audit-securite/outils/generer-dossier.mjs . docs/audit-securite/outils/donnees-audit-initial.mjs docs/audit-securite/2026-09-12-audit-initial
  ```

## Suivi des constats

Statuts : **Ouvert** (relevé par l'audit), **Démontré** (un test prouve la faille), **Corrigé** (le test passe), **Accepté** (risque assumé et documenté).

| ID | Gravité | Constat | Démonstration | Correctif | Statut |
|---|---|---|---|---|---|
| DEP-01 | Haute | Dépendances vulnérables : next 16.2.4, next-auth 5.0.0-beta.31 | | | Ouvert |
| EXE-01 | Moyenne | Réussite d'étape accordée sans preuve côté serveur | | | Ouvert |
| SRV-01 | Moyenne | Limitation de débit en mémoire si Upstash absent ou en panne | | | Ouvert |
| SRV-03 | Moyenne | Sessions JWT de 30 jours non révoquées | | | Ouvert |
| SRV-04 | Moyenne | Aucune RLS sur les tables Supabase | | | Ouvert |
| EXE-03 | Moyenne | CSP avec 'unsafe-inline' et 'unsafe-eval' | | | Ouvert |
| BCK-01 | Moyenne | Restauration des sauvegardes jamais testée | | | Ouvert |
| EXE-02 | Faible | Boucle infinie : onglet figé, délai inopérant | | | Ouvert |
| EXE-04 | Faible | Indices injectés via dangerouslySetInnerHTML | | | Ouvert |
| SRV-05 | Faible | Énumération des comptes | | | Ouvert |
| SRV-06 | Faible | Redirection ouverte sur /avatar?from= | | | Ouvert |
| SRV-07 | Faible | Pas de compteur d'échecs par compte | | | Ouvert |
| SRV-09 | Faible | Pas de contrôle Origin ; suppression de compte sans réauthentification | | | Ouvert |
| SRV-10 | Faible | Page chapitre protégée par le seul proxy | | | Ouvert |
| SUP-01 | Faible | Pas de security.txt | | | Ouvert |

Les points d'information (EXE-05, EXE-06, SRV-11) sont détaillés dans le rapport.

## Limites

Auto-évaluation outillée : ni une certification, ni un audit officiel, ni un test d'intrusion actif. ZAP a tourné en mode passif uniquement (exploration du site, sans attaque).
