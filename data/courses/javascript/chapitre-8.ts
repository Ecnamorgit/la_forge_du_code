import type { ChapterData } from "@/data/courses/html/types";

export const chapitre8: ChapterData = {
  slug: "chapitre-8",
  tag: "MISSION : REACTIVITE",
  title: "EVENEMENTS\n",
  subtitle: "Reagis aux clics, touches et formulaires",
  totalXp: 270,
  completionBadge: "⚡",
  completionBadgeLabel: "OPERATEUR REACTIF",
  steps: [
    {
      startCode:
        "// Cree un <button>Tirer</button>, ajoute-le au body.\n// Attache un listener click qui logge 'PEW' a chaque clic.\n// Declenche 2 clics programmatiquement (btn.click()).\n",
      placeholder: "// addEventListener('click', ...) puis .click()",
      narrator:
        "Premier evenement : un clic sur un bouton. Cree le bouton, attache un listener qui logge 'PEW', puis simule 2 clics pour verifier que le listener marche.",
      hint: "const btn = document.createElement('button');\nbtn.textContent = 'Tirer';\ndocument.body.appendChild(btn);\nbtn.addEventListener('click', () => console.log('PEW'));\nbtn.click();\nbtn.click();",
      briefing: {
        title: "addEventListener",
        content: `
### Schema general
\`element.addEventListener('type-event', callback);\`

Le callback est appele a chaque fois que l'evenement se produit sur l'element.

### Les evenements les plus courants
- **click** : clic souris (ou tap mobile)
- **submit** : formulaire soumis
- **input** : changement dans un <input>/<textarea>
- **change** : changement valide (perte de focus pour les <input>)
- **keydown / keyup** : touche du clavier pressee/relachee
- **mouseenter / mouseleave** : survol souris
- **focus / blur** : champ active/desactive

### Le callback recoit un objet event
\`btn.addEventListener('click', (event) => {\`
\`  console.log(event.target);   // l'element clique\`
\`  console.log(event.type);     // 'click'\`
\`});\`

### Declencher programmatiquement
\`btn.click();\`
Equivaut a un vrai clic, le listener est appele.

### removeEventListener
Pour detacher un listener, il faut la **MEME reference de fonction** que celle passee a add. Donc impossible avec une arrow inline anonyme — il faut nommer.

\`const onClick = () => console.log('!');\`
\`btn.addEventListener('click', onClick);\`
\`btn.removeEventListener('click', onClick);\`

**A retenir :** un evenement = un callback. Attache, le navigateur fait le reste.
        `,
      },
      objectives: [
        { id: "o1a", label: "Utiliser addEventListener('click', ...)" },
        { id: "o1b", label: "Logger 'PEW' au moins 2 fois" },
      ],
      missionIcon: "🖱",
      missionTag: "PROTOCOLE 01",
      missionTtl: "PREMIER LISTENER",
      bannerIcon: "🖱",
      bannerTtl: "REACTION INSTALLEE",
      bannerSub: "Chaque clic declenche le callback.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        "// Cree 3 boutons (id 'b1', 'b2', 'b3') avec text 'Action 1', 'Action 2', 'Action 3'.\n// Sur chacun, attache un listener click qui logge l'id du bouton clique.\n// Declenche un clic sur b2.\n",
      placeholder: "// event.target.id ou closure sur l'id",
      narrator:
        "Plusieurs boutons, un comportement different par bouton : utilise event.target ou une closure pour identifier lequel a ete clique. Declenche un clic sur b2 et logge son id.",
      hint: "['b1','b2','b3'].forEach((id, i) => { const b = document.createElement('button'); b.id = id; b.textContent = 'Action ' + (i+1); b.addEventListener('click', (e) => console.log(e.target.id)); document.body.appendChild(b); });\ndocument.getElementById('b2').click();",
      briefing: {
        title: "event.target",
        content: `
### event.target
La propriete **target** de l'evenement pointe sur **l'element qui a declenche** l'evenement. Tres utile quand plusieurs elements partagent un listener.

\`document.addEventListener('click', (e) => {\`
\`  console.log(e.target.tagName, e.target.id);\`
\`});\`

### Pattern : un listener pour plusieurs elements
Plutot que d'attacher 10 listeners individuels :

\`monteneur.addEventListener('click', (e) => {\`
\`  if (e.target.matches('.btn-action')) {\`
\`    handleAction(e.target.dataset.id);\`
\`  }\`
\`});\`

C'est la **delegation d'evenements** — plus performant et plus simple a maintenir.

### event.currentTarget vs event.target
- **target** : element qui a declenche (peut etre un enfant).
- **currentTarget** : element sur lequel le listener est attache.

### preventDefault
Annule le comportement par defaut : empeche un <a> de naviguer, un submit de poster, un Enter de retour ligne dans certains inputs.

\`a.addEventListener('click', (e) => { e.preventDefault(); ... });\`

**A retenir :** event.target est ton ami pour ecrire **un seul listener pour N elements**.
        `,
      },
      objectives: [
        { id: "o2a", label: "Attacher un listener sur les 3 boutons" },
        { id: "o2b", label: "Logger 'b2' apres un clic programmatique" },
      ],
      missionIcon: "🎮",
      missionTag: "PROTOCOLE 02",
      missionTtl: "CIBLAGE EVENEMENT",
      bannerIcon: "🎮",
      bannerTtl: "ENNEMI IDENTIFIE",
      bannerSub: "Le listener sait qui a declenche le clic.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Cree un <input id='nom'>, ajoute-le au body.\n// Attache un listener 'input' qui logge 'Salut <valeur>' a chaque changement.\n// Modifie input.value et dispatche un event 'input' manuellement.\n",
      placeholder: "// addEventListener('input', ...) + dispatchEvent",
      narrator:
        "Reagis a la frappe utilisateur. Sur un <input>, attache un listener 'input' qui logge 'Salut <valeur>'. Pour tester sans clavier reel, modifie input.value et dispatche un Event('input') manuellement.",
      hint: "const inp = document.createElement('input');\ninp.id = 'nom';\ndocument.body.appendChild(inp);\ninp.addEventListener('input', () => console.log('Salut ' + inp.value));\ninp.value = 'Luna';\ninp.dispatchEvent(new Event('input'));",
      briefing: {
        title: "Evenement input + dispatchEvent",
        content: `
### L'evenement 'input'
Se declenche **a chaque modification de la valeur** d'un <input>/<textarea>/<select>. Pour la frappe au clavier, copier-coller, autofill — tout est detecte.

\`input.addEventListener('input', () => {\`
\`  console.log(input.value);\`
\`});\`

### vs 'change'
- **change** ne se declenche **qu'a la perte de focus** (apres validation).
- **input** est plus reactif (frappe par frappe).

### Lire la valeur
\`input.value\` retourne **toujours une string**, meme pour un type="number".

### Modifier programmatiquement
\`input.value = 'Luna';\` change la valeur **mais ne declenche PAS l'event 'input'** (sinon boucle infinie).

### dispatchEvent
Pour declencher un evenement manuellement :
\`input.dispatchEvent(new Event('input'));\`
\`btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));\`

Utile pour les tests automatises et certaines integrations.

**A retenir :** pour un champ texte, 'input' est presque toujours le bon evenement.
        `,
      },
      objectives: [
        { id: "o3a", label: "Attacher un listener 'input'" },
        { id: "o3b", label: "Logger 'Salut Luna' (ou similaire)" },
      ],
      missionIcon: "⌨",
      missionTag: "PROTOCOLE 03",
      missionTtl: "LECTURE EN DIRECT",
      bannerIcon: "⌨",
      bannerTtl: "FRAPPE SUIVIE",
      bannerSub: "Chaque modification est captee.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Cree un <form><input id='pwd' type='password'><button type='submit'>OK</button></form>.\n// Attache un listener 'submit' qui empeche le submit reel et logge 'Login attempt: ' + valeur.\n// Definis input.value = 'secret' puis declenche form.requestSubmit() ou simule submit.\n",
      placeholder: "// preventDefault + dispatchEvent submit",
      narrator:
        "Empeche un formulaire de soumettre pour le navigateur (preventDefault) et fais ton propre traitement a la place. Logge la tentative de login.",
      hint: "const form = document.createElement('form');\nconst input = document.createElement('input');\ninput.id = 'pwd'; input.type = 'password';\nconst btn = document.createElement('button'); btn.type = 'submit'; btn.textContent = 'OK';\nform.appendChild(input); form.appendChild(btn);\ndocument.body.appendChild(form);\nform.addEventListener('submit', (e) => { e.preventDefault(); console.log('Login attempt: ' + input.value); });\ninput.value = 'secret';\nform.dispatchEvent(new Event('submit'));",
      briefing: {
        title: "Submit + preventDefault",
        content: `
### L'evenement 'submit'
Se declenche quand un formulaire est soumis (clic submit, Enter, form.requestSubmit()).

\`form.addEventListener('submit', (e) => {\`
\`  e.preventDefault();    // empeche le rechargement page\`
\`  // ... ton code ...\`
\`});\`

### Pourquoi preventDefault ?
Par defaut, un submit envoie les donnees a l'URL d'**action** du formulaire et **recharge la page**. Pour une app moderne (SPA, ajax), on intercepte et on envoie via fetch.

### Lire les champs
\`new FormData(form)\` produit un objet avec toutes les valeurs :
\`const data = new FormData(form);\`
\`data.get('email');\`

### Validation native
Le navigateur valide deja **type="email"**, **required**, **minlength**, etc. Si invalide, le submit n'est pas declenche.

\`if (!form.checkValidity()) { ... }\`

**A retenir :** un submit-handler typique fait 3 choses : preventDefault, lit les champs, envoie en ajax (ou met a jour l'UI).
        `,
      },
      objectives: [
        { id: "o4a", label: "Utiliser e.preventDefault() dans le handler" },
        { id: "o4b", label: "Logger une string contenant 'secret'" },
      ],
      missionIcon: "📨",
      missionTag: "PROTOCOLE 04",
      missionTtl: "FORMULAIRE INTERCEPTE",
      bannerIcon: "📨",
      bannerTtl: "SUBMIT MAITRISE",
      bannerSub: "Le navigateur ne rafraichit plus la page, ton code prend le relais.",
      bannerXp: "⚡ +75 XP",
    },
  ],
};
