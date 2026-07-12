import type { ChapterData } from "@/data/courses/html/types";

export const chapitre7: ChapterData = {
  slug: "chapitre-7",
  tag: "MISSION : INTERFACE DE COMMANDE",
  title: "DOM\nMANIPULATION",
  subtitle: "Cree et modifie des elements HTML avec JavaScript",
  totalXp: 270,
  completionBadge: "🧰",
  completionBadgeLabel: "INGENIEUR D'INTERFACE",
  steps: [
    {
      startCode:
        "// Cree un <div> avec le texte 'Centre de commande' et ajoute-le au body.\n// Puis affiche le innerHTML de document.body pour verifier.\n",
      placeholder: "// document.createElement + document.body.appendChild",
      narrator:
        "Premiere prise de contact avec le DOM. Cree un <div> qui contient le texte 'Centre de commande', ajoute-le au body, puis affiche document.body.innerHTML pour verifier.",
      hint: "const el = document.createElement('div');\nel.textContent = 'Centre de commande';\ndocument.body.appendChild(el);\nconsole.log(document.body.innerHTML);",
      briefing: {
        title: "Creer et inserer un element",
        content: `
*« Le DOM, c'est la console physique de la station : chaque balise est un levier que tu peux saisir et déplacer. Manipule-la avec méthode. »* — **Kira**

### Le DOM, c'est quoi ?
**DOM** (Document Object Model) est la representation **vivante et modifiable** de la page HTML, exposee a JavaScript. Chaque balise est un **objet** qu'on peut manipuler.

### Creer un element
\`const el = document.createElement('div');\`

Cela cree un noeud **detache** — il n'est pas encore visible.

### Le remplir
- **textContent** : le texte interne (le plus sur, pas d'injection HTML).
- **innerHTML** : interprete le HTML (puissant mais sensible aux failles XSS si tu y mets de l'input utilisateur).

\`el.textContent = 'Centre de commande';\`

### L'inserer
\`document.body.appendChild(el);\`
**appendChild** ajoute l'element a la fin du body. Maintenant il est visible.

### document.body.innerHTML
Retourne le contenu HTML actuel du body — utile pour debugger ce qu'on vient d'ajouter.

**A retenir :** 3 etapes pour ajouter du contenu : **create -> fill -> append**.
        `,
      },
      objectives: [
        { id: "o1a", label: "Utiliser document.createElement" },
        { id: "o1b", label: "Afficher 'Centre de commande' dans le innerHTML" },
      ],
      missionIcon: "➕",
      missionTag: "PROTOCOLE 01",
      missionTtl: "PREMIER ELEMENT",
      bannerIcon: "➕",
      bannerTtl: "ELEMENT INJECTE",
      bannerSub: "Le body contient maintenant ton nouveau <div>.",
      bannerXp: "⚡ +60 XP",
    },
    {
      startCode:
        "// Cree 3 elements <li> contenant 'Mission A', 'Mission B', 'Mission C'.\n// Ajoute-les a un <ul> que tu crees aussi. Insere le <ul> dans le body.\n// Affiche le nombre de <li> via document.querySelectorAll('li').length\n",
      placeholder: "// boucle + createElement + appendChild",
      narrator:
        "Cree une liste de 3 missions. Genere un <ul>, ajoute-y 3 <li> avec leurs textes, puis insere le <ul> dans le body. Verifie en affichant le nombre de <li>.",
      hint: "const ul = document.createElement('ul');\n['Mission A','Mission B','Mission C'].forEach(t => { const li = document.createElement('li'); li.textContent = t; ul.appendChild(li); });\ndocument.body.appendChild(ul);\nconsole.log(document.querySelectorAll('li').length);",
      briefing: {
        title: "Construire une liste",
        content: `
### Pattern courant
Quand on a un tableau de donnees et qu'on veut afficher chaque element dans le DOM.

\`const ul = document.createElement('ul');\`
\`donnees.forEach((d) => {\`
\`  const li = document.createElement('li');\`
\`  li.textContent = d;\`
\`  ul.appendChild(li);\`
\`});\`
\`document.body.appendChild(ul);\`

### Astuce : ajouter au parent avant l'enfant final
On peut aussi tout faire dans un **DocumentFragment** pour optimiser :
\`const frag = document.createDocumentFragment();\`
\`donnees.forEach((d) => {\`
\`  const li = document.createElement('li');\`
\`  li.textContent = d;\`
\`  frag.appendChild(li);\`
\`});\`
\`document.body.appendChild(frag);\`

### Les methodes de selection
- **getElementById('xxx')** : pour un element par son id unique.
- **querySelector('.classe')** : pour le premier element correspondant a un selecteur CSS.
- **querySelectorAll('.classe')** : pour tous les elements correspondants, retourne une NodeList.

### Les methodes de modification
- **textContent = '...'** : modifie le contenu textuel d'un element.
- **innerHTML = '<b>...</b>'** : insere du HTML dans un element (attention aux injections).

**A retenir :** utiliser **querySelector(All)** pour une flexibilite maximale et **DocumentFragment** pour optimiser l'ajout de plusieurs elements au DOM.
        `,
      },
      objectives: [
        { id: "o2a", label: "Creer un <ul> avec 3 <li>" },
        { id: "o2b", label: "Afficher le nombre total de <li>" },
      ],
      missionIcon: "➕",
      missionTag: "PROTOCOLE 02",
      missionTtl: "LISTE DE MISSIONS",
      bannerIcon: "➕",
      bannerTtl: "LISTE AJOUTEE",
      bannerSub: "3 missions ajoutees dans le DOM.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        "// Cree un <div> avec une classe 'status' et ajoute-le au body.\n// Modifie ensuite la classe pour changer l'apparence dynamiquement.\n",
      placeholder: "// document.createElement, classList.add, classList.remove",
      narrator:
        "Cree un <div> avec la classe 'status'. Ensuite, change cette classe pour modifier son apparence. Verifie que le changement est bien applique.",
      hint: "const statusDiv = document.createElement('div');\nstatusDiv.className = 'status';\ndocument.body.appendChild(statusDiv);\nsetTimeout(() => {\n  statusDiv.classList.remove('status');\n  statusDiv.classList.add('alert');\n}, 2000);",
      briefing: {
        title: "Modifier des attributs et du contenu",
        content: `
### Modifier classes
- **el.className** : la chaine complete des classes ('status alert'). Remplace tout.
- **el.classList** : API plus fine.
  - **classList.add('alert')** : ajoute une classe.
  - **classList.remove('alert')** : retire une classe.
  - **classList.toggle('alert')** : bascule la presence d'une classe.
  - **classList.contains('alert')** : teste si une classe est presente.

### Modifier le texte
- **el.textContent = '...'** : remplace le texte (echappe l'HTML).
- **el.innerHTML = '<b>...</b>'** : interprete du HTML dans un element (attention aux injections).

### Modifier les attributs
- **el.id = 'xxx'**, **el.title = 'tooltip'**, **el.href = '/'** pour les attributs standards.
- **el.setAttribute('data-foo', 'bar')** pour les attributs personnalises (data-*).
- **el.getAttribute('href')** pour lire un attribut.

### Modifier le style direct
- **el.style.color = 'red'** : style inline (CSS camelCase : backgroundColor, fontSize...).
- Prefere **classList** pour le maintenable et **style** pour le dynamique pur (positions calculees, etc.).

**A retenir :** une fois un element en memoire (variable JS), on peut modifier ses proprietes a tout moment — le DOM se met a jour en direct.
        `,
      },
      objectives: [
        { id: "o3a", label: "Modifier className apres creation" },
        { id: "o3b", label: "Afficher l'element avec une nouvelle classe" },
      ],
      missionIcon: "🛠",
      missionTag: "PROTOCOLE 03",
      missionTtl: "MUTATION D'ETAT",
      bannerIcon: "🛠",
      bannerTtl: "STATUT MIS A JOUR",
      bannerSub: "Classe et texte ont ete modifies dynamiquement.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        "// Cree 3 spans (A, B, C) dans le body, puis utilise querySelectorAll\n// pour boucler dessus et logger le textContent de chacun.\n",
      placeholder: "// querySelectorAll + forEach",
      narrator:
        "Cree d'abord 3 spans avec les textes 'A', 'B', 'C'. Puis lis-les avec querySelectorAll et affiche leur textContent un par un.",
      hint: "['A','B','C'].forEach(t => { const s = document.createElement('span'); s.textContent = t; document.body.appendChild(s); });\nconst all = document.querySelectorAll('span');\nall.forEach(el => console.log(el.textContent));",
      briefing: {
        title: "Selectionner et iterer",
        content: `
### Les 4 selecteurs essentiels
- **getElementById('xxx')** : un element par id. Le plus rapide.
- **querySelector('.classe')** : le premier element matchant un selecteur CSS. Polyvalent.
- **querySelectorAll('.classe')** : tous, en NodeList.
- **getElementsByClassName('xxx')** : HTMLCollection live (a eviter sauf cas precis).

### NodeList et forEach
Une NodeList accepte **forEach** directement :
\`document.querySelectorAll('span').forEach((el) => {\`
\`  console.log(el.textContent);\`
\`});\`

### NodeList n'est PAS un tableau
Pas de **map, filter, reduce** direct dessus. Pour les utiliser :
\`Array.from(nodeList).map(...)\`
ou
\`[...nodeList].filter(...)\`

### Selecteurs CSS dans querySelector
On peut utiliser **n'importe quel selecteur CSS** :
- \`'.nav-link.active'\` (intersection)
- \`'.nav-link, .menu-item'\` (union)
- \`'ul li:first-child'\` (descendant + pseudo)
- \`'[data-mission="active"]'\` (attribut)

**A retenir :** querySelector(All) couvre 95 % des besoins quotidiens.
        `,
      },
      objectives: [
        { id: "o4a", label: "Utiliser querySelectorAll" },
        { id: "o4b", label: "Logger chaque textContent (A, B, C)" },
      ],
      missionIcon: "🔍",
      missionTag: "PROTOCOLE 04",
      missionTtl: "LECTURE EN MASSE",
      bannerIcon: "🔍",
      bannerTtl: "DOM SCANNE",
      bannerSub: "Tu sais creer, lire, modifier et iterer sur le DOM.",
      bannerXp: "⚡ +75 XP",
    },
  ],
};