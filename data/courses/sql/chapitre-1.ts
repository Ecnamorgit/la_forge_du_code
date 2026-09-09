import type { ChapterData } from "@/data/courses/html/types";

export const chapitre1: ChapterData = {
  slug: "chapitre-1",
  tag: "MISSION : ENTREPOT GALACTIQUE",
  title: "SQL &\nBASES DE DONNÉES",
  subtitle: "Stocke et interroge la donnée de manière persistante",
  totalXp: 280,
  completionBadge: "🗃",
  completionBadgeLabel: "GARDIEN DES DONNÉES",
  steps: [
    {
      startCode:
        "-- Cree la table 'pilotes' avec trois colonnes :\n--   id     : nombre entier, cle primaire\n--   nom    : texte (max 50 caracteres), obligatoire\n--   niveau : nombre entier, defaut 1\n-- Puis insere un pilote nomme 'Lia' au niveau 5.\n",
      placeholder: "-- CREATE TABLE ... / INSERT INTO ...",
      narrator:
        "Une application sans persistance perd toutes ses données au redémarrage. Le SQL te permet de stocker la donnée de manière durable dans une base relationnelle. Première étape : créer une table et l'alimenter.",
      hint: "CREATE TABLE pilotes (\n  id INTEGER PRIMARY KEY,\n  nom VARCHAR(50) NOT NULL,\n  niveau INTEGER DEFAULT 1\n);\n\nINSERT INTO pilotes (id, nom, niveau) VALUES (1, 'Lia', 5);",
      briefing: {
        title: "CREATE TABLE et INSERT",
        content: `
### Qu'est-ce qu'une table ?
Une table SQL ressemble a une feuille Excel : des **colonnes** typees et des **lignes** (enregistrements). Chaque ligne represente une entité (un pilote, un vaisseau, une mission).

### CREATE TABLE
Définit la structure :
\`CREATE TABLE pilotes (\`
\`  id INTEGER PRIMARY KEY,\`
\`  nom VARCHAR(50) NOT NULL,\`
\`  niveau INTEGER DEFAULT 1\`
\`);\`

### Les types courants
- \`INTEGER\` -> nombre entier
- \`VARCHAR(n)\` -> texte de longueur max n
- \`TEXT\` -> texte long sans limite
- \`BOOLEAN\` -> true / false
- \`DATE\` / \`TIMESTAMP\` -> dates

### Les contraintes
- \`PRIMARY KEY\` -> identifiant unique de la ligne
- \`NOT NULL\` -> la valeur ne peut pas être vide
- \`UNIQUE\` -> aucune autre ligne ne peut avoir la même valeur
- \`DEFAULT x\` -> valeur par défaut si non fournie

### INSERT INTO
Ajoute une ligne :
\`INSERT INTO pilotes (nom, niveau) VALUES ('Lia', 5);\`

**À retenir :** Les colonnes sont typees, contraintes, et stables. La table = le contrat de la donnée.
        `,
      },
      objectives: [
        { id: "o1a", label: "Créer la table avec les bonnes colonnes et contraintes" },
        { id: "o1b", label: "Insérer une ligne avec INSERT INTO" },
      ],
      missionIcon: "🗃",
      missionTag: "PROTOCOLE 01",
      missionTtl: "CRÉATION TABLE",
      bannerIcon: "🗃",
      bannerTtl: "ENTREPOT BATI",
      bannerSub: "Ta première table est créée et contient des données.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        "-- Recupere tous les pilotes dont le niveau est superieur ou egal a 5.\n-- Trie le resultat par niveau, du plus grand au plus petit.\n-- Limite a 10 resultats.\n",
      placeholder: "-- SELECT ... FROM ... WHERE ... ORDER BY ... LIMIT ...",
      narrator:
        "La donnée est stockée, il faut maintenant savoir la retrouver. SELECT est la requête la plus utilisée en SQL. Apprends à filtrer, trier et limiter les resultats.",
      hint: "SELECT nom, niveau FROM pilotes\nWHERE niveau >= 5\nORDER BY niveau DESC\nLIMIT 10;",
      briefing: {
        title: "SELECT, WHERE, ORDER BY",
        content: `
### La structure d'une requête SELECT
L'ordre des mots-clés est strict :

\`SELECT colonne1, colonne2\`
\`FROM table\`
\`WHERE condition\`
\`ORDER BY colonne [ASC|DESC]\`
\`LIMIT nombre;\`

### SELECT : choisir les colonnes
- \`SELECT *\` -> toutes les colonnes (évite en production)
- \`SELECT nom, niveau\` -> uniquement celles-ci

### WHERE : filtrer
Les opérateurs essentiels :
- \`=\`, \`!=\` ou \`<>\`, \`<\`, \`>\`, \`<=\`, \`>=\`
- \`AND\`, \`OR\`, \`NOT\` pour combiner
- \`LIKE 'L%'\` -> commence par L
- \`IN (1, 2, 3)\` -> dans la liste
- \`BETWEEN 1 AND 10\` -> dans l'intervalle
- \`IS NULL\` / \`IS NOT NULL\` -> attention, on n'utilise JAMAIS \`= NULL\`

### ORDER BY : trier
- \`ASC\` -> ascendant (défaut)
- \`DESC\` -> descendant

### LIMIT : restreindre
Très important pour les grosses tables. Ne JAMAIS faire \`SELECT *\` sans \`LIMIT\` sur une table de plusieurs millions de lignes.

**À retenir :** SELECT filtre, ORDER BY ordonne, LIMIT economise.
        `,
      },
      objectives: [
        { id: "o2a", label: "Utiliser WHERE pour filtrer par niveau" },
        { id: "o2b", label: "Trier avec ORDER BY DESC et limiter avec LIMIT" },
      ],
      missionIcon: "🔍",
      missionTag: "PROTOCOLE 02",
      missionTtl: "REQUÊTE SELECT",
      bannerIcon: "🔍",
      bannerTtl: "DONNÉES EXTRAITES",
      bannerSub: "Tu sais interroger la base pour en sortir ce qui compte.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "-- 1. Mets a jour le pilote d'id=1 : son niveau passe a 10.\n-- 2. Supprime tous les pilotes dont le niveau est inferieur a 3.\n-- ATTENTION : sans WHERE, UPDATE et DELETE affectent toute la table !\n",
      placeholder: "-- UPDATE ... SET ... WHERE ... / DELETE FROM ... WHERE ...",
      narrator:
        "Stocker et lire ne suffit pas, il faut aussi modifier et supprimer. UPDATE et DELETE sont les opérations les plus DANGEREUSES de SQL : une faute de frappe peut effacer une table entiere.",
      hint: "UPDATE pilotes\nSET niveau = 10\nWHERE id = 1;\n\nDELETE FROM pilotes\nWHERE niveau < 3;",
      briefing: {
        title: "UPDATE et DELETE : les opérations dangereuses",
        content: `
### UPDATE
Modifie des lignes existantes :
\`UPDATE pilotes\`
\`SET niveau = 10\`
\`WHERE id = 1;\`

Tu peux modifier plusieurs colonnes :
\`SET nom = 'Lia II', niveau = 12\`

### DELETE
Supprime des lignes :
\`DELETE FROM pilotes WHERE niveau < 3;\`

### LE PIÈGE MORTEL : oublier WHERE
\`UPDATE pilotes SET niveau = 1;\` -> met TOUS les pilotes au niveau 1.
\`DELETE FROM pilotes;\` -> EFFACE LA TABLE ENTIERE.

Pas de "Ctrl+Z" en SQL en production. Reflechir avant de taper. Toujours.

### Bonne pratique : SELECT d'abord
Avant tout UPDATE ou DELETE sur une table réelle, joue la version SELECT pour vérifier QUELLES lignes seront touchees :

\`-- Verifier ce qu'on va supprimer\`
\`SELECT * FROM pilotes WHERE niveau < 3;\`
\`-- Si OK, supprimer\`
\`DELETE FROM pilotes WHERE niveau < 3;\`

### Les transactions
Pour les opérations critiques, encadre-les dans une transaction :
\`BEGIN; UPDATE ...; COMMIT;\` (ou \`ROLLBACK;\` pour annuler).

**À retenir :** UPDATE et DELETE sans WHERE = catastrophe. Vérifie toujours avec SELECT d'abord.
        `,
      },
      objectives: [
        { id: "o3a", label: "UPDATE avec SET et un WHERE cible" },
        { id: "o3b", label: "DELETE avec un WHERE explicite" },
      ],
      missionIcon: "⚠",
      missionTag: "PROTOCOLE 03",
      missionTtl: "MODIFICATION & SUPPRESSION",
      bannerIcon: "⚠",
      bannerTtl: "DONNÉES ACTUALISEES",
      bannerSub: "Tu manies UPDATE et DELETE avec la prudence requise.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "-- Deux tables : pilotes (id, nom) et vaisseaux (id, modele, pilote_id).\n-- Recupere le nom du pilote et le modele de son vaisseau,\n-- pour tous les pilotes qui en possedent un.\n",
      placeholder: "-- SELECT ... FROM pilotes JOIN vaisseaux ON ...",
      narrator:
        "La puissance du SQL relationnel : croiser plusieurs tables pour obtenir des données liees. C'est ce qu'on appelle un JOIN. Indispensable des qu'une application dépasse une seule table.",
      hint: "SELECT pilotes.nom, vaisseaux.modele\nFROM pilotes\nINNER JOIN vaisseaux ON vaisseaux.pilote_id = pilotes.id;",
      briefing: {
        title: "Les relations : JOIN",
        content: `
### Pourquoi séparer en plusieurs tables ?
Imagine stocker pilote et vaisseau dans UNE seule table : un pilote qui possede 3 vaisseaux occuperait 3 lignes dupliquees. C'est la **normalisation** : chaque concept à sa table, lies par des **clés etrangeres**.

### La clé etrangere
\`vaisseaux.pilote_id\` est une **foreign key** qui pointe vers \`pilotes.id\`. C'est le lien entre les deux tables.

### INNER JOIN : l'intersection
Recupere les lignes qui ont une correspondance dans les deux tables :

\`SELECT p.nom, v.modele\`
\`FROM pilotes p\`
\`INNER JOIN vaisseaux v ON v.pilote_id = p.id;\`

Les pilotes sans vaisseau n'apparaissent pas.

### LEFT JOIN : tout l'un + matches de l'autre
\`LEFT JOIN\` garde TOUS les pilotes, même ceux sans vaisseau (colonnes vaisseau a NULL).

### Les alias
Pour éviter de retaper \`pilotes\` partout, on raccourcit :
\`FROM pilotes p INNER JOIN vaisseaux v ON v.pilote_id = p.id\`

### Au-dela : GROUP BY et agregats
Compter les vaisseaux par pilote :
\`SELECT p.nom, COUNT(v.id) FROM pilotes p\`
\`LEFT JOIN vaisseaux v ON v.pilote_id = p.id\`
\`GROUP BY p.nom;\`

Tu retrouveras ca dans la prochaine mission.

**À retenir :** JOIN relie des tables via une clé commune. INNER = intersection, LEFT = tout l'un + matches.
        `,
      },
      objectives: [
        { id: "o4a", label: "Joindre les deux tables avec INNER JOIN ON" },
        { id: "o4b", label: "Sélectionner les colonnes des deux tables" },
      ],
      missionIcon: "🔗",
      missionTag: "PROTOCOLE 04",
      missionTtl: "JOINTURE",
      bannerIcon: "🗃",
      bannerTtl: "DONNÉES CROISEES",
      bannerSub: "Tu sais relier des tables pour exploiter le modèle relationnel.",
      bannerXp: "⚡ +75 XP",
    },
  ],
};
