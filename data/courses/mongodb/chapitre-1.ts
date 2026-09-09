import type { ChapterData } from "@/data/courses/html/types";

export const chapitre1: ChapterData = {
  slug: "chapitre-1",
  tag: "MISSION : DEPOT FLEXIBLE",
  title: "MONGODB &\nNOSQL",
  subtitle: "Stocke des documents libres sans schéma rigide",
  totalXp: 280,
  completionBadge: "🍃",
  completionBadgeLabel: "ARCHIVISTE NOSQL",
  steps: [
    {
      startCode:
        "// Insere un document pilote dans la collection 'pilotes'.\n// Champs : { nom: 'Lia', niveau: 5, vaisseau: { nom: 'Phoenix', classe: 'cargo' } }.\n// Utilise db.collection().insertOne() avec await.\n",
      placeholder: "// await db.collection('pilotes').insertOne({...})",
      narrator:
        "Contrairement au SQL relationnel, MongoDB stocke des documents JSON imbriques. Pas de schéma rigide : chaque document peut avoir sa propre structure. Insère ton premier pilote dans la base.",
      hint: "const doc = {\n  nom: 'Lia',\n  niveau: 5,\n  vaisseau: { nom: 'Phoenix', classe: 'cargo' }\n};\nconst result = await db.collection('pilotes').insertOne(doc);\nconsole.log(result.insertedId);",
      briefing: {
        title: "Documents BSON et insertOne",
        content: `
### NoSQL vs SQL
SQL stocke des **lignes** dans des **tables** avec un schéma strict. MongoDB stocke des **documents** dans des **collections**, format JSON-like (BSON).

### Forces du NoSQL
- Pas de schéma fige -> evolution rapide du modèle
- Documents imbriques -> pas de JOIN dans la majorité des cas
- Scaling horizontal natif (sharding)
- Naturel à manipuler depuis JavaScript

### Faiblesses
- Pas de transactions multi-document aussi solides qu'en SQL
- Pas de contraintes de schéma par défaut (peut être un piège)
- Plus difficile pour des requetes analytiques complexes

### insertOne
\`db.collection('pilotes').insertOne({ nom: 'Lia' });\`

MongoDB ajoute automatiquement un \`_id\` unique (ObjectId).

### insertMany pour batch
\`db.collection('pilotes').insertMany([doc1, doc2, doc3]);\`

**À retenir :** Document = objet JS. Collection = tableau de documents. insertOne pour créer.
        `,
      },
      objectives: [
        { id: "o1a", label: "Construire un document avec un objet imbrique" },
        { id: "o1b", label: "Utiliser insertOne avec await" },
      ],
      missionIcon: "🍃",
      missionTag: "PROTOCOLE 01",
      missionTtl: "PREMIER DOCUMENT",
      bannerIcon: "🍃",
      bannerTtl: "DOCUMENT STOCKE",
      bannerSub: "Ton premier document est inscrit dans la base NoSQL.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        "// Recupere tous les pilotes dont niveau >= 5.\n// Retourne uniquement leur nom et leur niveau (pas le _id).\n// Limite a 10 documents.\n",
      placeholder: "// db.collection('pilotes').find({...}, { projection: {...} }).limit(10)",
      narrator:
        "Interroger MongoDB se fait avec find() et un objet de filtre. Les opérateurs commencent par '$' (dollar). Plus expressif que SQL pour les structures complexes.",
      hint: "const pilotes = await db.collection('pilotes')\n  .find({ niveau: { $gte: 5 } })\n  .project({ _id: 0, nom: 1, niveau: 1 })\n  .limit(10)\n  .toArray();\nconsole.log(pilotes);",
      briefing: {
        title: "find, opérateurs et projection",
        content: `
### find() et filtres
\`db.collection('pilotes').find({ nom: 'Lia' });\`

L'objet en parametre est un filtre. Un champ vide \`{}\` -> tous les documents.

### Les opérateurs $
- \`$gt\`, \`$gte\`, \`$lt\`, \`$lte\` -> comparaisons
- \`$eq\`, \`$ne\` -> egalite / différent
- \`$in: [a, b]\` -> dans la liste
- \`$and\`, \`$or\`, \`$not\` -> logique
- \`$regex\` -> recherche par regex

\`{ niveau: { $gte: 5 }, actif: true }\`

### Projection
Limite les champs renvoyes :
\`.project({ _id: 0, nom: 1, niveau: 1 })\`

\`0\` exclut, \`1\` inclut. Le \`_id\` est inclus par défaut, il faut l'exclure explicitement.

### limit, skip, sort
\`.limit(10)\` -> 10 max
\`.skip(20)\` -> sauter les 20 premiers (pagination)
\`.sort({ niveau: -1 })\` -> tri descendant (-1) ou ascendant (1)

### Accéder aux champs imbriques
\`db.collection('pilotes').find({ 'vaisseau.classe': 'cargo' });\`

Notation dot pour traverser les objets.

**À retenir :** find filtre, project sélectionne, limit/skip paginent. Les opérateurs $ remplacent les WHERE complexes.
        `,
      },
      objectives: [
        { id: "o2a", label: "Utiliser $gte pour filtrer le niveau" },
        { id: "o2b", label: "Projeter uniquement nom et niveau, limiter a 10" },
      ],
      missionIcon: "🔍",
      missionTag: "PROTOCOLE 02",
      missionTtl: "REQUÊTE FIND",
      bannerIcon: "🔍",
      bannerTtl: "DOCUMENTS EXTRAITS",
      bannerSub: "Tu interroges efficacement ta base NoSQL.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Mets a jour Lia : son niveau passe a 10 et ajoute le champ 'badge: gold'.\n// N'ecrase pas tout le document, modifie juste ces deux champs.\n// Utilise updateOne et l'operateur $set.\n",
      placeholder: "// updateOne({ filtre }, { $set: { ... } })",
      narrator:
        "MongoDB distingue le remplacement complet et la mise à jour partielle. L'opérateur $set te permet de ne toucher QUE certains champs sans ecraser le reste.",
      hint: "await db.collection('pilotes').updateOne(\n  { nom: 'Lia' },\n  { $set: { niveau: 10, badge: 'gold' } }\n);",
      briefing: {
        title: "updateOne et les opérateurs d'update",
        content: `
### Sans $set, c'est un remplacement
\`db.collection('pilotes').updateOne({ nom: 'Lia' }, { niveau: 10 });\`
-> remplace TOUT le document par \`{ niveau: 10 }\`. Tu perds nom, vaisseau, etc.

C'est LE piège classique.

### Avec $set, c'est partiel
\`updateOne({ nom: 'Lia' }, { $set: { niveau: 10 } });\`
-> modifie uniquement niveau. Le reste survit.

### Autres opérateurs utiles
- \`$inc: { niveau: 1 }\` -> increment numérique
- \`$push: { badges: 'gold' }\` -> ajoute a un tableau
- \`$pull: { badges: 'gold' }\` -> retire d'un tableau
- \`$unset: { ancienChamp: '' }\` -> supprime le champ
- \`$rename: { vieuxNom: 'nouveauNom' }\` -> renomme

### updateMany
Comme updateOne, mais s'applique à TOUS les documents matchant le filtre.

### upsert
\`updateOne(filter, update, { upsert: true })\` -> cree le document s'il n'existe pas.

**À retenir :** Toujours utiliser $set/$inc pour modifier sans ecraser. updateOne pour un, updateMany pour plusieurs.
        `,
      },
      objectives: [
        { id: "o3a", label: "Utiliser updateOne avec un filtre" },
        { id: "o3b", label: "Modifier deux champs avec $set" },
      ],
      missionIcon: "✏",
      missionTag: "PROTOCOLE 03",
      missionTtl: "MISE À JOUR",
      bannerIcon: "✏",
      bannerTtl: "DOCUMENT ACTUALISE",
      bannerSub: "Tu modifies des champs précis sans casser le reste.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Compte le nombre de pilotes par classe de vaisseau.\n// Resultat attendu : [{ _id: 'cargo', total: 3 }, { _id: 'combat', total: 5 }].\n// Utilise aggregate() avec $group et $sum.\n",
      placeholder: "// aggregate([{ $group: { _id: '$champ', total: { $sum: 1 } } }])",
      narrator:
        "L'aggregation pipeline est la fonctionnalite la plus puissante de MongoDB : une suite d'étapes de transformation comme un pipeline Unix. C'est l'équivalent du GROUP BY de SQL, et bien plus.",
      hint: "const stats = await db.collection('pilotes').aggregate([\n  {\n    $group: {\n      _id: '$vaisseau.classe',\n      total: { $sum: 1 }\n    }\n  }\n]).toArray();\nconsole.log(stats);",
      briefing: {
        title: "Aggregation pipeline",
        content: `
### Le concept de pipeline
Un tableau d'étapes. Chaque étape transforme la sortie de la precedente :

\`aggregate([\`
\`  { $match: { actif: true } },     // filtre\`
\`  { $group: { _id: '$classe', total: { $sum: 1 } } },\`
\`  { $sort: { total: -1 } },\`
\`  { $limit: 5 }\`
\`]);\`

### Les opérateurs d'étape les plus utiles
- **$match** -> équivalent de find/WHERE
- **$group** -> regroupe par champ + agregats
- **$project** -> sélectionne / calcule des champs
- **$sort, $limit, $skip** -> comme find
- **$lookup** -> JOIN avec une autre collection
- **$unwind** -> aplatit un tableau en plusieurs documents

### Les agregateurs dans $group
- \`$sum: 1\` -> compte les documents
- \`$sum: '$prix'\` -> somme du champ prix
- \`$avg\`, \`$min\`, \`$max\` -> moyennes, extrema
- \`$push: '$nom'\` -> liste des noms du groupe

### Mongoose
En pratique, on utilise rarement le driver Mongo natif. **Mongoose** ajoute un ODM (Object Data Modeling) au-dessus, avec schemas, validation, hooks. Mais comprendre le pipeline reste essentiel.

### Indexes
Pour les requetes frequentes, cree des indexes :
\`db.collection('pilotes').createIndex({ nom: 1 });\`
Sans index, MongoDB fait un scan complet (lent sur grosses collections).

**À retenir :** Aggregation = pipeline déclaratif. $match filtre, $group agrege, $project transforme. C'est l'arme ultime de MongoDB.
        `,
      },
      objectives: [
        { id: "o4a", label: "Utiliser aggregate avec un pipeline" },
        { id: "o4b", label: "Grouper par classe et compter avec $sum: 1" },
      ],
      missionIcon: "🔄",
      missionTag: "PROTOCOLE 04",
      missionTtl: "AGGREGATION",
      bannerIcon: "🍃",
      bannerTtl: "PIPELINE MAÎTRISE",
      bannerSub: "Tu peux extraire des stats complexes en une requête.",
      bannerXp: "⚡ +75 XP",
    },
  ],
};
