import type { ChapterData } from "@/data/courses/html/types";

export const chapitre5: ChapterData = {
  slug: "chapitre-5",
  tag: "MISSION : FLOTTE DYNAMIQUE",
  title: "REACT &\nLISTES",
  subtitle: "Affiche une flotte de vaisseaux a partir d'un tableau de donnees",
  totalXp: 280,
  completionBadge: "🛰",
  completionBadgeLabel: "CARTOGRAPHE DE FLOTTE",
  steps: [
    {
      startCode:
        "// La Station de Replication Multiplicative vient de deployer trois sous-vaisseaux.\n// Le tableau flotte contient leurs donnees, mais le rendu ci-dessous est code en dur.\n// Remplace les trois <li> fixes par un rendu dynamique via flotte.map().\nconst flotte = [\n  { id: 1, nom: 'Aigle' },\n  { id: 2, nom: 'Faucon' },\n  { id: 3, nom: 'Phenix' },\n];\n\nfunction ListeFlotte() {\n  return (\n    <ul>\n      <li>Aigle</li>\n      <li>Faucon</li>\n      <li>Phenix</li>\n    </ul>\n  );\n}\n",
      placeholder: "// {flotte.map(v => <li>{v.nom}</li>)}",
      previewMount: "ListeFlotte",
      narrator:
        "Trois sous-vaisseaux viennent d'etre repliques, mais leur affichage est fige : si la flotte grandit, tu devras recopier des <li> a la main jusqu'a la fin des temps. La methode .map() transforme un tableau de donnees en tableau d'elements JSX, en une seule expression qui s'adapte automatiquement a la taille de la flotte.",
      hint: "const flotte = [\n  { id: 1, nom: 'Aigle' },\n  { id: 2, nom: 'Faucon' },\n  { id: 3, nom: 'Phenix' },\n];\n\nfunction ListeFlotte() {\n  return (\n    <ul>\n      {flotte.map(v => <li>{v.nom}</li>)}\n    </ul>\n  );\n}",
      briefing: {
        title: "Transformer un tableau en JSX : .map()",
        content: `
### Le probleme du code en dur
Trois vaisseaux, trois \`<li>\` ecrits a la main. Si un quatrieme rejoint la flotte, il faut modifier le JSX. Si un vaisseau est detruit, meme chose. Le code en dur ne suit pas les donnees.

### .map() transforme un tableau
\`flotte.map(v => <li>{v.nom}</li>)\`

Pour chaque element \`v\` du tableau \`flotte\`, le callback retourne un element JSX. Le resultat de \`.map()\` est un NOUVEAU tableau — un tableau de \`<li>\`, cette fois.

### A l'interieur des accolades
React accepte un tableau d'elements JSX directement a l'interieur des accolades \`{ }\` :
\`<ul>\`
\`  {flotte.map(v => <li>{v.nom}</li>)}\`
\`</ul>\`

### Pourquoi pas une boucle for ?
Une boucle \`for\` classique modifie des variables et ne retourne rien : elle ne peut pas etre placee directement dans du JSX. \`.map()\` est une EXPRESSION — elle produit une valeur (le nouveau tableau), exactement ce dont JSX a besoin entre accolades.

### Le callback doit retourner du JSX
\`v => v.nom\` retourne juste du texte brut : rien de visible dans la liste.
\`v => <li>{v.nom}</li>\` retourne un element JSX : c'est ce que React sait afficher.

**A retenir :** .map() transforme un tableau de donnees en tableau d'elements JSX. Le callback doit toujours retourner du JSX.
        `,
      },
      objectives: [
        { id: "o1a", label: "Utiliser flotte.map() pour generer les elements de la liste" },
        { id: "o1b", label: "Retourner un element JSX (ex: <li>) depuis le callback" },
      ],
      missionIcon: "🛰",
      missionTag: "PROTOCOLE 01",
      missionTtl: "FLOTTE EN LIGNE",
      bannerIcon: "🛰",
      bannerTtl: "FLOTTE AFFICHEE",
      bannerSub: "Chaque vaisseau du tableau apparait a l'ecran, sans <li> code en dur.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        "// La flotte n'est plus figee : des vaisseaux rejoignent et quittent la formation.\n// React affiche un avertissement dans la console : chaque element de liste a besoin d'une prop key.\nconst flotte = [\n  { id: 1, nom: 'Aigle' },\n  { id: 2, nom: 'Faucon' },\n  { id: 3, nom: 'Phenix' },\n];\n\nfunction ListeFlotte() {\n  return (\n    <ul>\n      {flotte.map(v => <li>{v.nom}</li>)}\n    </ul>\n  );\n}\n",
      placeholder: "// <li key={v.id}>{v.nom}</li>",
      previewMount: "ListeFlotte",
      narrator:
        "Regarde la console : React reclame une prop key sur chaque element de liste. Sans elle, quand la flotte bouge (un vaisseau rejoint, un autre est detruit), React ne sait plus reconnaitre quel <li> correspond a quel vaisseau. La clef doit etre stable et unique : l'identifiant du vaisseau, jamais sa position dans le tableau.",
      hint: "const flotte = [\n  { id: 1, nom: 'Aigle' },\n  { id: 2, nom: 'Faucon' },\n  { id: 3, nom: 'Phenix' },\n];\n\nfunction ListeFlotte() {\n  return (\n    <ul>\n      {flotte.map(v => <li key={v.id}>{v.nom}</li>)}\n    </ul>\n  );\n}",
      briefing: {
        title: "La prop key : une identite stable",
        content: `
### Pourquoi React a besoin d'une clef
Quand un tableau change (ajout, suppression, reordonnancement), React doit savoir QUEL element JSX correspond a QUELLE donnee, pour ne mettre a jour que ce qui a change. Sans identifiant, React compare les listes position par position — et se trompe des que l'ordre bouge.

### La syntaxe
\`{flotte.map(v => <li key={v.id}>{v.nom}</li>)}\`

\`key\` se pose sur l'element RACINE retourne par le callback — ici le \`<li>\`, jamais sur un enfant a l'interieur.

### Le piege classique : key={index}
\`{flotte.map((v, index) => <li key={index}>{v.nom}</li>)}\`

Ca fait taire l'avertissement, mais ca ne resout rien : l'index (0, 1, 2...) ne decrit pas le VAISSEAU, seulement sa POSITION du moment. Si "Aigle" est detruit et que la flotte passe de [Aigle, Faucon, Phenix] a [Faucon, Phenix], Faucon herite soudain de la key 0 qui appartenait a Aigle. React croit que c'est le MEME element qui a change de nom — l'etat interne (inputs, animations, selection) se melange avec le mauvais vaisseau.

### La bonne clef
Utilise une valeur qui identifie le vaisseau LUI-MEME, pas sa place dans le tableau : un \`id\` de base de donnees, un UUID, un nom unique. Si tes donnees n'ont vraiment aucun identifiant stable et que la liste ne sera jamais reordonnee ni filtree, l'index est un pis-aller — mais c'est l'exception, pas la regle.

**A retenir :** key identifie le VAISSEAU, pas sa position. N'utilise index/i que si la liste est garantie de ne jamais bouger.
        `,
      },
      objectives: [
        { id: "o2a", label: "Ajouter une prop key={...} sur l'element racine du map" },
        { id: "o2b", label: "Utiliser un identifiant stable (v.id), jamais l'index du tableau" },
      ],
      missionIcon: "🔑",
      missionTag: "PROTOCOLE 02",
      missionTtl: "IDENTITE STABLE",
      bannerIcon: "🔑",
      bannerTtl: "CLES ATTRIBUEES",
      bannerSub: "Chaque vaisseau garde son identite meme si la flotte bouge.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Certains vaisseaux de la flotte sont hors service apres l'escarmouche.\n// N'affiche que les vaisseaux dont le statut est 'operationnel'.\nconst flotte = [\n  { id: 1, nom: 'Aigle', statut: 'operationnel' },\n  { id: 2, nom: 'Faucon', statut: 'hors service' },\n  { id: 3, nom: 'Phenix', statut: 'operationnel' },\n];\n\nfunction ListeFlotte() {\n  return (\n    <ul>\n      {flotte.map(v => <li key={v.id}>{v.nom}</li>)}\n    </ul>\n  );\n}\n",
      placeholder: "// flotte.filter(v => v.statut === 'operationnel').map(v => <li key={v.id}>{v.nom}</li>)",
      previewMount: "ListeFlotte",
      narrator:
        "Le poste de commandement ne veut voir QUE les vaisseaux operationnels : afficher un vaisseau hors service dans la liste de patrouille serait une erreur tactique. .filter() garde uniquement les elements qui remplissent une condition, AVANT que .map() les transforme en JSX. Les deux methodes se chainent.",
      hint: "const flotte = [\n  { id: 1, nom: 'Aigle', statut: 'operationnel' },\n  { id: 2, nom: 'Faucon', statut: 'hors service' },\n  { id: 3, nom: 'Phenix', statut: 'operationnel' },\n];\n\nfunction ListeFlotte() {\n  return (\n    <ul>\n      {flotte.filter(v => v.statut === 'operationnel').map(v => <li key={v.id}>{v.nom}</li>)}\n    </ul>\n  );\n}",
      briefing: {
        title: "Chainer .filter() et .map()",
        content: `
### .filter() garde une partie du tableau
\`flotte.filter(v => v.statut === 'operationnel')\`

Le callback retourne un booleen (true/false). .filter() garde SEULEMENT les elements pour lesquels il renvoie true, et retourne un nouveau tableau — plus court, ou identique.

### Puis .map() transforme ce qui reste
\`flotte.filter(v => v.statut === 'operationnel').map(v => <li key={v.id}>{v.nom}</li>)\`

L'ordre compte : d'abord on reduit le tableau aux elements pertinents, ensuite seulement on genere le JSX. Inverser l'ordre n'a pas de sens — .map() aurait deja transforme les donnees en elements JSX, sur lesquels .filter() ne pourrait plus tester v.statut.

### Une variable intermediaire, pour la lisibilite
Quand la chaine s'allonge, extraire une variable clarifie le rendu :
\`const operationnels = flotte.filter(v => v.statut === 'operationnel');\`
\`return <ul>{operationnels.map(v => <li key={v.id}>{v.nom}</li>)}</ul>;\`

### Ne pas oublier key
Le filtrage ne change rien a la regle precedente : chaque <li> genere garde sa key stable (v.id), meme si la liste filtree est plus courte que la flotte complete.

**A retenir :** .filter() reduit le tableau selon une condition, .map() le transforme ensuite en JSX. Toujours dans cet ordre.
        `,
      },
      objectives: [
        { id: "o3a", label: "Filtrer flotte avec .filter() selon v.statut" },
        { id: "o3b", label: "Chainer .map() sur le resultat filtre, en conservant key" },
      ],
      missionIcon: "🔍",
      missionTag: "PROTOCOLE 03",
      missionTtl: "TRI OPERATIONNEL",
      bannerIcon: "🔍",
      bannerTtl: "FLOTTE FILTREE",
      bannerSub: "Seuls les vaisseaux operationnels s'affichent dans la liste.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Apres l'attaque, il se peut qu'aucun vaisseau ne soit operationnel.\n// Affiche un message clair a la place d'une liste vide et silencieuse.\nconst flotte = [\n  { id: 1, nom: 'Aigle', statut: 'hors service' },\n  { id: 2, nom: 'Faucon', statut: 'hors service' },\n];\n\nfunction ListeFlotte() {\n  const operationnels = flotte.filter(v => v.statut === 'operationnel');\n  return (\n    <ul>\n      {operationnels.map(v => <li key={v.id}>{v.nom}</li>)}\n    </ul>\n  );\n}\n",
      placeholder: "// if (operationnels.length === 0) return <p>Aucun vaisseau operationnel.</p>;",
      previewMount: "ListeFlotte",
      narrator:
        "Zero vaisseau operationnel, zero <li> : la liste rend un <ul> vide, et le Cadet au poste de commandement voit un blanc en se demandant si l'ecran a plante. Une collection vide EST une information — elle doit etre annoncee, pas cachee. Teste operationnels.length et affiche un message de repli si la flotte est a sec.",
      hint: "function ListeFlotte() {\n  const operationnels = flotte.filter(v => v.statut === 'operationnel');\n  if (operationnels.length === 0) {\n    return <p>Aucun vaisseau operationnel.</p>;\n  }\n  return (\n    <ul>\n      {operationnels.map(v => <li key={v.id}>{v.nom}</li>)}\n    </ul>\n  );\n}",
      briefing: {
        title: "Gerer la liste vide",
        content: `
### Le blanc silencieux
\`<ul>{operationnels.map(v => <li key={v.id}>{v.nom}</li>)}</ul>\`

Si \`operationnels\` est un tableau vide, .map() retourne aussi un tableau vide : React affiche un <ul> sans le moindre <li>. Rien ne s'affiche, et rien n'explique pourquoi.

### Tester la longueur avant de rendre
\`if (operationnels.length === 0) {\`
\`  return <p>Aucun vaisseau operationnel.</p>;\`
\`}\`

Un simple if, place avant le return principal, intercepte le cas vide et renvoie un message explicite.

### La variante ternaire
Pour un composant plus court, tout peut tenir dans le JSX :
\`{operationnels.length === 0\`
\`  ? <p>Aucun vaisseau operationnel.</p>\`
\`  : operationnels.map(v => <li key={v.id}>{v.nom}</li>)}\`

### Le piege classique
\`if (operationnels.length === 0) return null;\`

Ca evite le crash, mais l'utilisateur voit toujours... rien. Un ecran vide sans explication reste une mauvaise experience. Le but n'est pas d'eviter l'erreur, c'est d'INFORMER : une flotte a zero unite operationnelle est une donnee, pas un bug d'affichage.

**A retenir :** Une collection vide merite un message, jamais un blanc silencieux. Teste .length === 0 avant de rendre la liste.
        `,
      },
      objectives: [
        { id: "o4a", label: "Tester operationnels.length === 0 avant de rendre la liste" },
        { id: "o4b", label: "Retourner un message alternatif (JSX) quand la liste est vide" },
      ],
      missionIcon: "📭",
      missionTag: "PROTOCOLE 04",
      missionTtl: "SILENCE RADIO",
      bannerIcon: "🛰",
      bannerTtl: "FLOTTE CARTOGRAPHIEE",
      bannerSub: "Meme une flotte vide envoie desormais un message clair.",
      bannerXp: "⚡ +75 XP",
    },
  ],
};
