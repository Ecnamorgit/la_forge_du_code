# MCD / MLD de La Forge du Code pour Looping

Ce dossier contient le modèle de données de La Forge du Code (Nebula Command) sous
forme de scripts SQL, à ouvrir dans **Looping** (looping.exe) pour obtenir le
**MLD** et le **MCD** éditables.

## Fichiers

| Fichier | Contenu |
|---|---|
| `mcd-fidele.sql` | Version **fidèle** à la base Prisma actuelle (dénormalisée). |
| `mcd-normalise.sql` | Version **normalisée / académique** (entités conceptuelles). |
| `schema-reel.sql` | Instantané du DDL généré depuis le schéma Prisma, tables Auth.js comprises (antérieur aux tables `UserUnlock`, `CinematicView` et `TrackEvent`). |

Les deux premiers couvrent le **domaine métier + une authentification simplifiée**
(la plomberie NextAuth est regroupée dans une seule entité `COMPTE`).

## Comment ouvrir dans Looping

Looping ne lit pas directement ces `.sql` ; il les **rétro-conçoit** (Looping
4.1 ou supérieur requis).

1. Ouvrir **Looping**.
2. Menu **Fichier → Rétro-conception** (création d'un MCD à partir
   d'instructions DDL).
3. Coller le contenu du fichier `.sql` souhaité (ou le charger).
4. Looping construit le **MLD**, puis génère le **MCD** éditable.
5. Réorganiser les entités si besoin, puis **Fichier → Enregistrer** au format
   `.loo`.

> Astuce : commence par `mcd-normalise.sql` pour un rendu pédagogique propre,
> ou `mcd-fidele.sql` si tu dois documenter la base telle qu'elle est codée.

## Différence clé entre les deux versions

| Aspect | Fidèle | Normalisée |
|---|---|---|
| Badge | `badge_id` en texte dans `BADGE_UTILISATEUR` (entité) | entité `BADGE` + association **DÉBLOQUE** (n,n) |
| Étapes | `cours`/`chapitre`/`index_etape` à plat (entité) | hiérarchie `COURS → CHAPITRE → ETAPE` + association **TERMINE** (n,n) |
| Dernier cours | colonne texte `dernier_cours_visite` | association **A_VISITÉ_EN_DERNIER** (0,1)–(0,n) |

## Pourquoi certaines tables deviennent des associations

Dans la version normalisée, les tables de jonction (`BADGE_UTILISATEUR`,
`ETAPE_TERMINEE`) ont une **clé primaire composée des deux clés étrangères**.
C'est ce qui pousse Looping à les transformer en **associations (n,n)** dans le
MCD plutôt qu'en entités. Une clé primaire de substitution (comme dans la
version fidèle) les ferait apparaître comme des entités à part entière.

## Limites de la rétro-conception

Looping ne reconstruit que la structure relationnelle. Ne sont **pas** repris :
triggers, contraintes applicatives, valeurs par défaut métier, procédures. Ces
règles restent dans le code applicatif et dans `prisma/schema.prisma`.

## Source de vérité

`prisma/schema.prisma` reste la référence du schéma réel. Ces modèles en sont
une représentation Merise pour la documentation et le rendu.
