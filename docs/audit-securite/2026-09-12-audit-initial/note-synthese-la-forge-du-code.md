# Note de synthèse - Audit de sécurité La Forge du Code

## Décision

Le site est **défendable avec réserves**. Les fondations sont solides : code des apprenants isolé dans le navigateur, aucune IDOR, mots de passe et jetons gérés selon l'état de l'art, en-têtes et TLS au bon niveau. **Une action est urgente** : mettre à jour next et next-auth, qui portent des vulnérabilités publiques critiques et hautes.

## Résultats

- Questions analysées : 10
- Preuves référencées : 19 (empreinte SHA-256 de chaque fichier)
- Corrections à mener : 14 (1 haute, 6 moyennes, 7 faibles)
- Complétude des réponses : 100
- Couverture des preuves : 90
- Qualité des preuves : 74
- Réponses prêtes sans réserve : 40
- Indicateur de dette : 44 (100 moins 12 par dette haute, 5 par moyenne, 2 par faible)

## Points défendables

- Exécution du code des apprenants isolée (iframes sandbox sans allow-same-origin), rien n'est exécuté sur le serveur.
- 20 routes API relues : chaque route vérifie la session et n'agit que sur le compte connecté.
- bcrypt coût 12, jetons aléatoires stockés hachés et à usage unique, e-mail vérifié obligatoire.
- SSL Labs A+ / A, Observatory B+, ZAP sans échec, aucun secret dans l'historique git.

## Points à corriger en priorité

1. Mettre à jour next et next-auth (sous 7 jours).
2. Confirmer Upstash Redis en production et passer le limiteur en fail-closed.
3. Vérifier la RLS et l'API de données dans Supabase.
4. Empêcher la triche sur la progression (limite de débit, ordre des étapes).

## Vérification

Le fichier `proofpack-la-forge-du-code.json` embarque son empreinte (`bp_sha256_96a0444932b028acf57f2eb0309b40d365fc3bcfb8c576ad89026e380b2b963f`). Il se vérifie sur https://blackproof.fr/verify, sans compte ni envoi au serveur. Les scores ci-dessus sont calculés par le script de génération de ce dossier et peuvent différer de la méthode interne de BLACKPROOF.
