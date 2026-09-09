import type { ChapterData } from "@/data/courses/html/types";

export const chapitre8: ChapterData = {
  slug: "chapitre-8",
  tag: "MISSION : RÉACTIVITÉ",
  title: "ÉVÉNEMENTS\n",
  subtitle: "Réagis aux commandes du pilote et aux interactions du terminal",
  totalXp: 270,
  completionBadge: "⚡",
  completionBadgeLabel: "OPÉRATEUR RÉACTIF",
  steps: [
    {
      startCode:
        "// Crée un <button>Tirer</button>, ajoute-le au body.\n// Attache un listener click qui logge 'PEW' à chaque clic.\n// Déclenche 2 clics programmatiquement (btn.click()).\n",
      placeholder: "// addEventListener('click', ...) puis .click()",
      narrator:
        "Premier événement : un clic sur un bouton. Crée le bouton, attache un listener qui logge 'PEW', puis simule 2 clics pour vérifier que le listener marche.",
      hint: "const btn = document.createElement('button');\nbtn.textContent = 'Tirer';\ndocument.body.appendChild(btn);\nbtn.addEventListener('click', () => console.log('PEW'));\nbtn.click();\nbtn.click();",
      briefing: {
        title: "addEventListener",
        content: `
*« Une station qui n'écoute pas ses capteurs est déjà perdue. Un \`addEventListener\`, c'est un poste de garde : il réagit à chaque signal. »* — **Kira**

### Schéma général
\`element.addEventListener('type-event', callback);\`

Le callback est appelé à chaque fois que l'événement se produit sur l'élément.

### Les événements les plus courants
- **click** : clic souris (ou tap mobile)
- **submit** : formulaire soumis
- **input** : changement dans un <input>/<textarea>
- **change** : changement valide (perte de focus pour les <input>)
- **keydown / keyup** : touche du clavier pressée/relâchée
- **mouseenter / mouseleave** : survol souris
- **focus / blur** : champ actif/désactivé

### Le callback reçoit un objet event
\`btn.addEventListener('click', (event) => {\`
\`  console.log(event.target);   // l'élément cliqué\`
\`  console.log(event.type);     // 'click'\`
\`});\`

### Déclencher programmatiquement
\`btn.click();\`
Équivaut à un vrai clic, le listener est appelé.

### removeEventListener
Pour détacher un listener, il faut la **MÊME référence de fonction** que celle passée à add. Donc impossible avec une arrow inline anonyme — il faut nommer.

\`const onClick = () => console.log('!');\`
\`btn.addEventListener('click', onClick);\`
\`btn.removeEventListener('click', onClick);\`

**À retenir :** un événement = un callback. Attache, le navigateur fait le reste.
        `,
      },
      objectives: [
        { id: "o1a", label: "Utiliser addEventListener('click', ...)" },
        { id: "o1b", label: "Logger 'PEW' au moins 2 fois" },
      ],
      docRefs: ["js/events"],
      missionIcon: "🖱",
      missionTag: "PROTOCOLE 01",
      missionTtl: "PREMIER LISTENER",
      bannerIcon: "🖱",
      bannerTtl: "RÉACTION INSTALLÉE",
      bannerSub: "Chaque clic est détecté.",
      bannerXp: "⚡ +75 XP",
    },
    {
      startCode:
        "// Crée un <button>Action</button>, ajoute-le au body.\n// Attache un listener click qui logge 'Action exécutée' à chaque clic.\n// Déclenche 1 clic programmatiquement (btn.click()).\n",
      placeholder: "// addEventListener('click', ...) puis .click()",
      narrator:
        "Second événement : un clic sur un bouton. Crée le bouton, attache un listener qui logge 'Action exécutée', puis simule 1 clic pour vérifier que le listener marche.",
      hint: "const btn = document.createElement('button');\nbtn.textContent = 'Action';\ndocument.body.appendChild(btn);\nbtn.addEventListener('click', () => console.log('Action exécutée'));\nbtn.click();",
      briefing: {
        title: "addEventListener",
        content: `
### Schéma général
\`element.addEventListener('type-event', callback);\`

Le callback est appelé à chaque fois que l'événement se produit sur l'élément.

### Les événements les plus courants
- **click** : clic souris (ou tap mobile)
- **submit** : formulaire soumis
- **input** : changement dans un <input>/<textarea>
- **change** : changement valide (perte de focus pour les <input>)
- **keydown / keyup** : touche du clavier pressée/relâchée
- **mouseenter / mouseleave** : survol souris
- **focus / blur** : champ actif/désactivé

### Le callback reçoit un objet event
\`btn.addEventListener('click', (event) => {\`
\`  console.log(event.target);   // l'élément cliqué\`
\`  console.log(event.type);     // 'click'\`
\`});\`

### Déclencher programmatiquement
\`btn.click();\`
Équivaut à un vrai clic, le listener est appelé.

### removeEventListener
Pour détacher un listener, il faut la **MÊME référence de fonction** que celle passée à add. Donc impossible avec une arrow inline anonyme — il faut nommer.

\`const onClick = () => console.log('!');\`
\`btn.addEventListener('click', onClick);\`
\`btn.removeEventListener('click', onClick);\`

**À retenir :** un événement = un callback. Attache, le navigateur fait le reste.
        `,
      },
      objectives: [
        { id: "o2a", label: "Utiliser addEventListener('click', ...)" },
        { id: "o2b", label: "Logger 'Action exécutée' une fois" },
      ],
      missionIcon: "🖱",
      missionTag: "PROTOCOLE 02",
      missionTtl: "ACTION VALIDÉE",
      bannerIcon: "🖱",
      bannerTtl: "RÉPONSE À L'ACTION",
      bannerSub: "L'action est détectée.",
      bannerXp: "⚡ +75 XP",
    },
    {
      startCode:
        "// Crée un <input type='text' id='commande'>, ajoute-le au body.\n// Attache un listener 'input' qui logge 'Commande : <valeur>' à chaque changement.\n// Modifie input.value et dispatche un event 'input' manuellement.\n",
      placeholder: "// addEventListener('input', ...) + dispatchEvent",
      narrator:
        "Réagis à la frappe utilisateur. Sur un <input>, attache un listener 'input' qui logge 'Commande : <valeur>'. Pour tester sans clavier réel, modifie input.value et dispatche un Event('input') manuellement.",
      hint: "const inp = document.createElement('input');\ninp.type = 'text';\ninp.id = 'commande';\ndocument.body.appendChild(inp);\ninp.addEventListener('input', () => console.log('Commande : ' + inp.value));\ninp.value = 'Déplacement';\ninp.dispatchEvent(new Event('input'));",
      briefing: {
        title: "Événement input + dispatchEvent",
        content: `
### L'événement 'input'
Se declenche **à chaque modification de la valeur** d'un <input>/<textarea>/<select>. Pour la frappe au clavier, copier-coller, autofill — tout est detecte.

\`input.addEventListener('input', () => {\`
\`  console.log(input.value);\`
\`});\`

### vs 'change'
- **change** ne se declenche **qu'a la perte de focus** (après validation).
- **input** est plus réactif (frappe par frappe).

### Lire la valeur
\`input.value\` retourne **toujours une string**, même pour un type="number".

### Modifier programmatiquement
\`input.value = 'Déplacement';\` change la valeur **mais ne declenche PAS l'event 'input'** (sinon boucle infinie).

### dispatchEvent
Pour déclencher un événement manuellement :
\`input.dispatchEvent(new Event('input'));\`
\`btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));\`

Utile pour les tests automatises et certaines integrations.

**À retenir :** pour un champ texte, 'input' est presque toujours le bon événement.
        `,
      },
      objectives: [
        { id: "o3a", label: "Attacher un listener 'input'" },
        { id: "o3b", label: "Logger 'Commande : Déplacement'" },
      ],
      missionIcon: "⌨",
      missionTag: "PROTOCOLE 03",
      missionTtl: "LECTURE EN DIRECT",
      bannerIcon: "⌨",
      bannerTtl: "FRAPPE SUIVIE",
      bannerSub: "Chaque modification est captee.",
      bannerXp: "⚡ +75 XP",
    },
    {
      startCode:
        "// Crée un <form><input id='commande' type='text'><button type='submit'>OK</button></form>.\n// Attache un listener 'submit' qui empeche le submit reel et logge 'Commande reçue : ' + valeur.\n// Definis input.value = 'Déplacement' puis declenche form.requestSubmit() ou simule submit.\n",
      placeholder: "// preventDefault + dispatchEvent submit",
      narrator:
        "Empêche un formulaire de soumettre pour le navigateur (preventDefault) et fais ton propre traitement à la place. Logge la commande reçue.",
      hint: "const form = document.createElement('form');\nconst input = document.createElement('input');\ninput.id = 'commande'; input.type = 'text';\nconst btn = document.createElement('button'); btn.type = 'submit'; btn.textContent = 'OK';\nform.appendChild(input); form.appendChild(btn);\ndocument.body.appendChild(form);\nform.addEventListener('submit', (e) => { e.preventDefault(); console.log('Commande reçue : ' + input.value); });\ninput.value = 'Déplacement';\nform.dispatchEvent(new Event('submit'));",
      briefing: {
        title: "Submit + preventDefault",
        content: `
### L'événement 'submit'
Se declenche quand un formulaire est soumis (clic submit, Enter, form.requestSubmit()).

\`form.addEventListener('submit', (e) => {\`
\`  e.preventDefault();    // empeche le rechargement page\`
\`  // ... ton code ...\`
\`});\`

### Pourquoi preventDefault ?
Par défaut, un submit envoie les données à l'URL d'**action** du formulaire et **recharge la page**. Pour une app moderne (SPA, ajax), on intercepte et on envoie via fetch.

### Lire les champs
\`new FormData(form)\` produit un objet avec toutes les valeurs :
\`const data = new FormData(form);\`
\`data.get('email');\`

### Validation native
Le navigateur valide déjà **type="email"**, **required**, **minlength**, etc. Si invalide, le submit n'est pas declenche.

\`if (!form.checkValidity()) { ... }\`

**À retenir :** un submit-handler typique fait 3 choses : preventDefault, lit les champs, envoie en ajax (ou met à jour l'UI).
        `,
      },
      objectives: [
        { id: "o4a", label: "Utiliser e.preventDefault() dans le handler" },
        { id: "o4b", label: "Logger une string contenant 'Déplacement'" },
      ],
      missionIcon: "📨",
      missionTag: "PROTOCOLE 04",
      missionTtl: "FORMULAIRE INTERCEPTE",
      bannerIcon: "📨",
      bannerTtl: "SUBMIT MAÎTRISE",
      bannerSub: "Le navigateur ne rafraichit plus la page, ton code prend le relais.",
      bannerXp: "⚡ +75 XP",
    },
  ],
};