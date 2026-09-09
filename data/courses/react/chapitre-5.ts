import type { ChapterData } from "@/data/courses/html/types";

export const chapitre5: ChapterData = {
  slug: "chapitre-5",
  tag: "MISSION : FLOTTE DYNAMIQUE",
  title: "REACT &\nLISTES",
  subtitle: "Affiche une flotte de vaisseaux à partir d'un tableau de données",
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
        "Trois sous-vaisseaux viennent d'être repliques, mais leur affichage est fige : si la flotte grandit, tu devras recopier des <li> à la main jusqu'a la fin des temps. La méthode .map() transforme un tableau de données en tableau d'éléments JSX, en une seule expression qui s'adapte automatiquement à la taille de la flotte.",
      hint: "const flotte = [\n  { id: 1, nom: 'Aigle' },\n  { id: 2, nom: 'Faucon' },\n  { id: 3, nom: 'Phenix' },\n];\n\nfunction ListeFlotte() {\n  return (\n    <ul>\n      {flotte.map(v => <li>{v.nom}</li>)}\n    </ul>\n  );\n}",
      briefing: {
        title: "Transformer un tableau en JSX : .map()",
        content: `
### Le problème du code en dur
Trois vaisseaux, trois \`<li>\` ecrits à la main. Si un quatrieme rejoint la flotte, il faut modifier le JSX. Si un vaisseau est detruit, même chose. Le code en dur ne suit pas les données.

### .map() transforme un tableau
\`flotte.map(v => <li>{v.nom}</li>)\`

Pour chaque élément \`v\` du tableau \`flotte\`, le callback retourne un élément JSX. Le résultat de \`.map()\` est un NOUVEAU tableau — un tableau de \`<li>\`, cette fois.

### À l'intérieur des accolades
React accepte un tableau d'éléments JSX directement à l'intérieur des accolades \`{ }\` :
\`<ul>\`
\`  {flotte.map(v => <li>{v.nom}</li>)}\`
\`</ul>\`

### Pourquoi pas une boucle for ?
Une boucle \`for\` classique modifie des variables et ne retourne rien : elle ne peut pas être placée directement dans du JSX. \`.map()\` est une EXPRESSION — elle produit une valeur (le nouveau tableau), exactement ce dont JSX a besoin entre accolades.

### Le callback doit retourner du JSX
\`v => v.nom\` retourne juste du texte brut : rien de visible dans la liste.
\`v => <li>{v.nom}</li>\` retourne un élément JSX : c'est ce que React sait afficher.

**À retenir :** .map() transforme un tableau de données en tableau d'éléments JSX. Le callback doit toujours retourner du JSX.
        `,
      },
      objectives: [
        { id: "o1a", label: "Utiliser flotte.map() pour generer les éléments de la liste" },
        { id: "o1b", label: "Retourner un élément JSX (ex: <li>) depuis le callback" },
      ],
      missionIcon: "🛰",
      missionTag: "PROTOCOLE 01",
      missionTtl: "FLOTTE EN LIGNE",
      bannerIcon: "🛰",
      bannerTtl: "FLOTTE AFFICHÉE",
      bannerSub: "Chaque vaisseau du tableau apparaît à l'écran, sans <li> code en dur.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        "// La flotte n'est plus figee : des vaisseaux rejoignent et quittent la formation.\n// React affiche un avertissement dans la console : chaque element de liste a besoin d'une prop key.\nconst flotte = [\n  { id: 1, nom: 'Aigle' },\n  { id: 2, nom: 'Faucon' },\n  { id: 3, nom: 'Phenix' },\n];\n\nfunction ListeFlotte() {\n  return (\n    <ul>\n      {flotte.map(v => <li>{v.nom}</li>)}\n    </ul>\n  );\n}\n",
      placeholder: "// <li key={v.id}>{v.nom}</li>",
      previewMount: "ListeFlotte",
      narrator:
        "Regarde la console : React reclame une prop key sur chaque élément de liste. Sans elle, quand la flotte bouge (un vaisseau rejoint, un autre est detruit), React ne sait plus reconnaitre quel <li> correspond a quel vaisseau. La clef doit être stable et unique : l'identifiant du vaisseau, jamais sa position dans le tableau.",
      hint: "const flotte = [\n  { id: 1, nom: 'Aigle' },\n  { id: 2, nom: 'Faucon' },\n  { id: 3, nom: 'Phenix' },\n];\n\nfunction ListeFlotte() {\n  return (\n    <ul>\n      {flotte.map(v => <li key={v.id}>{v.nom}</li>)}\n    </ul>\n  );\n}",
      briefing: {
        title: "La prop key : une identité stable",
        content: `
### Pourquoi React a besoin d'une clef
Quand un tableau change (ajout, suppression, reordonnancement), React doit savoir QUEL élément JSX correspond a QUELLE donnée, pour ne mettre à jour que ce qui a change. Sans identifiant, React compare les listes position par position — et se trompe des que l'ordre bouge.

### La syntaxe
\`{flotte.map(v => <li key={v.id}>{v.nom}</li>)}\`

\`key\` se pose sur l'élément RACINE retourne par le callback — ici le \`<li>\`, jamais sur un enfant à l'intérieur.

### Le piège classique : key={index}
\`{flotte.map((v, index) => <li key={index}>{v.nom}</li>)}\`

Ca fait taire l'avertissement, mais ca ne resout rien : l'index (0, 1, 2...) ne décrit pas le VAISSEAU, seulement sa POSITION du moment. Si "Aigle" est detruit et que la flotte passe de [Aigle, Faucon, Phenix] a [Faucon, Phenix], Faucon herite soudain de la key 0 qui appartenait a Aigle. React croit que c'est le MÊME élément qui a change de nom — l'état interne (inputs, animations, sélection) se melange avec le mauvais vaisseau.

### La bonne clef
Utilise une valeur qui identifie le vaisseau LUI-MÊME, pas sa place dans le tableau : un \`id\` de base de données, un UUID, un nom unique. Si tes données n'ont vraiment aucun identifiant stable et que la liste ne sera jamais reordonnee ni filtree, l'index est un pis-aller — mais c'est l'exception, pas la règle.

**À retenir :** key identifie le VAISSEAU, pas sa position. N'utilise index/i que si la liste est garantie de ne jamais bouger.
        `,
      },
      objectives: [
        { id: "o2a", label: "Ajouter une prop key={...} sur l'élément racine du map" },
        { id: "o2b", label: "Utiliser un identifiant stable (v.id), jamais l'index du tableau" },
      ],
      missionIcon: "🔑",
      missionTag: "PROTOCOLE 02",
      missionTtl: "IDENTITÉ STABLE",
      bannerIcon: "🔑",
      bannerTtl: "CLÉS ATTRIBUEES",
      bannerSub: "Chaque vaisseau garde son identité même si la flotte bouge.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Certains vaisseaux de la flotte sont hors service apres l'escarmouche.\n// N'affiche que les vaisseaux dont le statut est 'operationnel'.\nconst flotte = [\n  { id: 1, nom: 'Aigle', statut: 'operationnel' },\n  { id: 2, nom: 'Faucon', statut: 'hors service' },\n  { id: 3, nom: 'Phenix', statut: 'operationnel' },\n];\n\nfunction ListeFlotte() {\n  return (\n    <ul>\n      {flotte.map(v => <li key={v.id}>{v.nom}</li>)}\n    </ul>\n  );\n}\n",
      placeholder: "// flotte.filter(v => v.statut === 'operationnel').map(v => <li key={v.id}>{v.nom}</li>)",
      previewMount: "ListeFlotte",
      narrator:
        "Le poste de commandement ne veut voir QUE les vaisseaux operationnels : afficher un vaisseau hors service dans la liste de patrouille serait une erreur tactique. .filter() garde uniquement les éléments qui remplissent une condition, AVANT que .map() les transforme en JSX. Les deux méthodes se chainent.",
      hint: "const flotte = [\n  { id: 1, nom: 'Aigle', statut: 'opérationnel' },\n  { id: 2, nom: 'Faucon', statut: 'hors service' },\n  { id: 3, nom: 'Phenix', statut: 'opérationnel' },\n];\n\nfunction ListeFlotte() {\n  return (\n    <ul>\n      {flotte.filter(v => v.statut === 'opérationnel').map(v => <li key={v.id}>{v.nom}</li>)}\n    </ul>\n  );\n}",
      briefing: {
        title: "Chainer .filter() et .map()",
        content: `
### .filter() garde une partie du tableau
\`flotte.filter(v => v.statut === 'operationnel')\`

Le callback retourne un booléen (true/false). .filter() garde SEULEMENT les éléments pour lesquels il renvoie true, et retourne un nouveau tableau — plus court, ou identique.

### Puis .map() transforme ce qui reste
\`flotte.filter(v => v.statut === 'operationnel').map(v => <li key={v.id}>{v.nom}</li>)\`

L'ordre compte : d'abord on réduit le tableau aux éléments pertinents, ensuite seulement on genere le JSX. Inverser l'ordre n'a pas de sens — .map() aurait déjà transforme les données en éléments JSX, sur lesquels .filter() ne pourrait plus tester v.statut.

### Une variable intermédiaire, pour la lisibilite
Quand la chaîne s'allonge, extraire une variable clarifie le rendu :
\`const operationnels = flotte.filter(v => v.statut === 'operationnel');\`
\`return <ul>{operationnels.map(v => <li key={v.id}>{v.nom}</li>)}</ul>;\`

### Ne pas oublier key
Le filtrage ne change rien à la règle precedente : chaque <li> genere garde sa key stable (v.id), même si la liste filtree est plus courte que la flotte complete.

**À retenir :** .filter() réduit le tableau selon une condition, .map() le transforme ensuite en JSX. Toujours dans cet ordre.
        `,
      },
      objectives: [
        { id: "o3a", label: "Filtrer flotte avec .filter() selon v.statut" },
        { id: "o3b", label: "Chainer .map() sur le résultat filtre, en conservant key" },
      ],
      missionIcon: "🔍",
      missionTag: "PROTOCOLE 03",
      missionTtl: "TRI OPÉRATIONNEL",
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
        "Zéro vaisseau opérationnel, zéro <li> : la liste rend un <ul> vide, et le Cadet au poste de commandement voit un blanc en se demandant si l'écran a plante. Une collection vide EST une information — elle doit être annoncee, pas cachee. Teste operationnels.length et affiche un message de repli si la flotte est a sec.",
      hint: "function ListeFlotte() {\n  const operationnels = flotte.filter(v => v.statut === 'opérationnel');\n  if (operationnels.length === 0) {\n    return <p>Aucun vaisseau opérationnel.</p>;\n  }\n  return (\n    <ul>\n      {operationnels.map(v => <li key={v.id}>{v.nom}</li>)}\n    </ul>\n  );\n}",
      briefing: {
        title: "Gérer la liste vide",
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

### Le piège classique
\`if (operationnels.length === 0) return null;\`

Ca évite le crash, mais l'utilisateur voit toujours... rien. Un écran vide sans explication reste une mauvaise expérience. Le but n'est pas d'éviter l'erreur, c'est d'INFORMER : une flotte a zéro unité opérationnelle est une donnée, pas un bug d'affichage.

**À retenir :** Une collection vide merite un message, jamais un blanc silencieux. Teste .length === 0 avant de rendre la liste.
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
      bannerSub: "Même une flotte vide envoie désormais un message clair.",
      bannerXp: "⚡ +75 XP",
    },
  ],
};
