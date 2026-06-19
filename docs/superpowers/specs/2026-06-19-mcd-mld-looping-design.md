# Design — MCD / MLD CodeForge pour Looping

**Date :** 2026-06-19
**Auteur :** Joan (assisté)
**Statut :** Validé (design)

## Objectif

Produire un Modèle Conceptuel de Données (MCD) et son Modèle Logique de
Données (MLD) de la base CodeForge / Nebula Command, ouvrables et éditables
dans **Looping** (looping.exe).

## Contrainte de livraison

Le format natif `.loo` de Looping n'est pas documenté publiquement et ne peut
pas être testé depuis l'environnement de génération. On s'appuie donc sur la
fonctionnalité **Rétro-conception** de Looping 4.1+ : elle reconstruit le MLD
*et* dérive le MCD à partir d'un script **SQL DDL** (`CREATE TABLE` +
`ALTER TABLE` pour les clés étrangères, instructions terminées par `;`).

Workflow utilisateur : Looping → *Fichier → Rétro-conception* → coller/ouvrir le
script → Looping génère le MLD puis le MCD éditable → enregistrer en `.loo`.

## Périmètre

Domaine métier + authentification simplifiée. On regroupe la plomberie
technique NextAuth (Account/Session/VerificationToken) en une seule entité
`COMPTE`, pour montrer l'authentification sans le détail technique.

Source de vérité : `prisma/schema.prisma`.

## Deux versions livrées

### Version A — Fidèle à la base (`mcd-fidele.sql`)

Reflète Prisma tel quel. Entités, toutes rattachées à `UTILISATEUR` en
(1,n)–(1,1) :

- **UTILISATEUR** : id, email (U), username (U), nom, mot_de_passe (haché,
  nullable), email_verifie, image, date_inscription, total_xp, streak,
  derniere_visite, dernier_cours_visite, date_onboarding, espece,
  couleur_uniforme, role.
- **COMPTE** (auth simplifié) : fournisseur, type_compte, date_expiration.
- **JETON** (OneTimeToken) : valeur (U, hachée), type (email_verify |
  password_reset), date_expiration, date_utilisation, date_creation.
- **BADGE_UTILISATEUR** : clé primaire de substitution + `badge_id` en **texte**
  (comme en base), date_deblocage. → reste une entité.
- **ETAPE_TERMINEE** : clé primaire de substitution + `cours`, `chapitre`,
  `index_etape` en colonnes (dénormalisé, comme en base), date_completion.

Résultat : une « étoile » dénormalisée autour de `UTILISATEUR`, exacte.

### Version B — Normalisée / académique (`mcd-normalise.sql`)

Fait émerger les vraies entités conceptuelles.

- **UTILISATEUR** : idem A, mais `dernier_cours_visite` devient une association.
- **COMPTE**, **JETON** : idem A.
- **BADGE** (catalogue) : code (U), libelle, description.
  - Association **DÉBLOQUE** (0,n)–(0,n) UTILISATEUR ↔ BADGE, porte
    `date_deblocage`. MLD : table de jonction `BADGE_UTILISATEUR` à **clé
    primaire composite des deux FK**.
- Hiérarchie pédagogique :
  - **COURS** : slug (U), titre, description.
  - **CHAPITRE** (1,1)→(1,n) COURS : slug, titre, ordre.
  - **ETAPE** (1,1)→(1,n) CHAPITRE : index_etape, titre, type.
  - Association **TERMINE** (0,n)–(0,n) UTILISATEUR ↔ ETAPE, porte
    `date_completion`. MLD : jonction `ETAPE_TERMINEE` à **clé primaire
    composite des deux FK**.
- Association **A_VISITE_EN_DERNIER** (0,1)–(0,n) UTILISATEUR ↔ COURS :
  FK nullable `id_dernier_cours` sur `UTILISATEUR`.

## Règle de rétro-conception clé

Pour que Looping transforme une table de jonction en **association** (et non en
entité) : sa clé primaire doit être **composée uniquement des deux clés
étrangères** (plus les attributs portés). Une clé primaire de substitution la
fait apparaître comme entité. C'est exactement ce qui distingue les jonctions de
la version B (composite → association) des entités de la version A (substitution
→ entité).

## Livrables

```
docs/modelisation/
├── mcd-fidele.sql        # version A — DDL
├── mcd-normalise.sql     # version B — DDL
└── README.md             # mode d'emploi rétro-conception Looping + notes
```

## Hors périmètre

- Génération directe d'un fichier `.loo` (format non documenté, non testable).
- Tables NextAuth détaillées (Account complet, Session, VerificationToken).
- Triggers, contraintes applicatives, procédures (non gérés par la
  rétro-conception).
