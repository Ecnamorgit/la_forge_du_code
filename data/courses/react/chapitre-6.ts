import type { ChapterData } from "@/data/courses/html/types";

export const chapitre6: ChapterData = {
  slug: "chapitre-6",
  tag: "MISSION : CONSOLE DE COMMANDE",
  title: "REACT &\nFORMULAIRES",
  subtitle: "Branche une console de saisie reactive et transmets des donnees fiables",
  totalXp: 280,
  completionBadge: "🎛",
  completionBadgeLabel: "OPERATEUR DE CONSOLE",
  steps: [
    {
      startCode:
        "// Le Spectre a sabote la console de saisie du poste de commande.\n// L'etat nom existe deja, mais le champ ci-dessous n'ecoute plus le clavier.\nimport { useState } from 'react';\n\nfunction ConsoleSaisie() {\n  const [nom, setNom] = useState('');\n  return (\n    <input value={nom} />\n  );\n}\n",
      spectreTrap:
        "J'ai coupé le fil entre ton clavier et l'état, Cadet. Tape tout ce que tu veux, ce champ n'en gardera pas une lettre — retrouve l'onChange manquant, si tu en es capable.",
      placeholder: "// <input value={nom} onChange={(e) => setNom(e.target.value)} />",
      narrator:
        "Un input controle affiche exactement ce que contient l'etat React, jamais autre chose. Pour taper au clavier, tu dois mettre a jour l'etat a chaque frappe : c'est le role de onChange. Sans lui, ton champ affiche l'etat mais ignore totalement tes frappes au clavier.",
      hint: "import { useState } from 'react';\n\nfunction ConsoleSaisie() {\n  const [nom, setNom] = useState('');\n  return (\n    <input value={nom} onChange={(e) => setNom(e.target.value)} />\n  );\n}",
      briefing: {
        title: "L'input controle : value + onChange",
        content: `
### Le champ fige
\`<input value={nom} />\`

React affiche la valeur de \`nom\`, mais rien ne la modifie. Chaque frappe clavier est ignoree : le champ reste colle a sa valeur initiale. C'est le symptome numero un du debutant React.

### Le duo obligatoire
Un champ CONTROLE porte TOUJOURS les deux props ensemble :
\`<input\`
\`  value={nom}\`
\`  onChange={(e) => setNom(e.target.value)}\`
\`/>\`

- \`value\` : ce que React AFFICHE (la source de verite reste l'etat)
- \`onChange\` : ce qui se passe a CHAQUE frappe (met a jour l'etat)

### e.target.value
L'evenement \`onChange\` recoit un objet \`e\`. \`e.target\` designe l'element DOM du champ, et \`e.target.value\` son contenu actuel — celui que l'utilisateur vient de taper.

### Le piege classique
\`<input value={nom} />\` sans onChange -> champ fige, lecture seule malgre lui.
\`<input onChange={...} />\` sans value -> champ NON controle, React ne sait plus ce qu'il doit afficher.

Un input controle a besoin des DEUX props ensemble, jamais l'une sans l'autre.

**A retenir :** value affiche l'etat, onChange le met a jour. Sans onChange, un input controle refuse toute saisie.
        `,
      },
      objectives: [
        { id: "o1a", label: "Ajouter onChange sur l'input controle" },
        { id: "o1b", label: "Appeler setNom(e.target.value) dans le handler" },
      ],
      missionIcon: "🎛",
      missionTag: "PROTOCOLE 01",
      missionTtl: "CONSOLE VERROUILLEE",
      bannerIcon: "🎛",
      bannerTtl: "SAISIE RESTAUREE",
      bannerSub: "Le champ repond de nouveau a chaque frappe.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        "// La console de saisie a maintenant deux champs : nom et email.\n// Regroupe-les dans un SEUL etat objet formulaire, pas deux useState separes.\nimport { useState } from 'react';\n\nfunction FormulaireContact() {\n  const [nom, setNom] = useState('');\n  const [email, setEmail] = useState('');\n  return (\n    <form>\n      <input name='nom' value={nom} onChange={(e) => setNom(e.target.value)} />\n      <input name='email' value={email} onChange={(e) => setEmail(e.target.value)} />\n    </form>\n  );\n}\n",
      placeholder: "// const [formulaire, setFormulaire] = useState({ nom: '', email: '' });",
      narrator:
        "Deux champs, deux useState : ca fonctionne encore, mais un formulaire de dix champs voudrait dire dix etats separes a synchroniser a la main. Regroupe nom et email dans un seul objet d'etat, et mets-le a jour par copie avec une cle calculee.",
      hint: "import { useState } from 'react';\n\nfunction FormulaireContact() {\n  const [formulaire, setFormulaire] = useState({ nom: '', email: '' });\n\n  function handleChange(e) {\n    const { name, value } = e.target;\n    setFormulaire({ ...formulaire, [name]: value });\n  }\n\n  return (\n    <form>\n      <input name='nom' value={formulaire.nom} onChange={handleChange} />\n      <input name='email' value={formulaire.email} onChange={handleChange} />\n    </form>\n  );\n}",
      briefing: {
        title: "Un objet d'etat pour plusieurs champs",
        content: `
### Le probleme des useState multiplies
Deux champs, deux useState : ca marche, mais un formulaire de dix champs voudrait dire dix useState, dix setters, dix onChange ecrits a la main.

### Un seul objet, une seule source de verite
\`const [formulaire, setFormulaire] = useState({ nom: '', email: '' });\`

Chaque champ devient une propriete de \`formulaire\` : \`formulaire.nom\`, \`formulaire.email\`.

### Le spread pour ne pas ecraser les autres champs
\`setFormulaire({ ...formulaire, nom: 'Lia' });\`

Sans le spread \`...formulaire\`, mettre a jour \`nom\` effacerait \`email\` : le nouvel objet ne contiendrait QUE la propriete listee explicitement.

### Une cle calculee : [name]
Ecrire un handler different par champ redevient repetitif. La solution : un SEUL handleChange qui lit \`e.target.name\` (le nom de l'input, ex: \`nom\` ou \`email\`) et met a jour la BONNE propriete grace a une cle calculee :
\`const { name, value } = e.target;\`
\`setFormulaire({ ...formulaire, [name]: value });\`

\`[name]\` entre crochets dans un objet litteral signifie : utilise la VALEUR de la variable \`name\` comme nom de propriete, pas le mot "name" litteral.

### Relier le name de l'input a la cle
Pour que \`e.target.name\` corresponde a la bonne propriete, chaque \`<input>\` doit porter un attribut \`name\` identique au nom de la propriete : \`<input name='nom' .../>\`.

**A retenir :** un objet d'etat regroupe les champs lies. Mets-le a jour par spread + cle calculee pour ne jamais ecraser les autres proprietes.
        `,
      },
      objectives: [
        { id: "o2a", label: "Regrouper nom et email dans useState({ ... })" },
        { id: "o2b", label: "Mettre a jour par spread avec une cle calculee [name]" },
      ],
      missionIcon: "🗂",
      missionTag: "PROTOCOLE 02",
      missionTtl: "ETAT GROUPE",
      bannerIcon: "🗂",
      bannerTtl: "ETAT REGROUPE",
      bannerSub: "Un seul objet pilote tous les champs du formulaire.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Le formulaire ne fait rien a la soumission : Entree recharge toute la page.\n// Ajoute un gestionnaire de soumission SUR le <form>, pas sur le bouton.\n// Empeche le rechargement avec e.preventDefault().\nimport { useState } from 'react';\n\nfunction FormulaireContact() {\n  const [formulaire, setFormulaire] = useState({ nom: '', email: '' });\n\n  function handleChange(e) {\n    const { name, value } = e.target;\n    setFormulaire({ ...formulaire, [name]: value });\n  }\n\n  return (\n    <form>\n      <input name='nom' value={formulaire.nom} onChange={handleChange} />\n      <input name='email' value={formulaire.email} onChange={handleChange} />\n      <button type='submit'>Envoyer</button>\n    </form>\n  );\n}\n",
      placeholder: "// function handleSubmit(e) { e.preventDefault(); ... }  puis <form onSubmit={handleSubmit}>",
      narrator:
        "Un <form> HTML classique recharge toute la page a la soumission : dans une SPA, ce rechargement detruit l'etat de l'application. Attache un gestionnaire onSubmit SUR le formulaire, et appelle e.preventDefault() pour reprendre le controle.",
      hint: "import { useState } from 'react';\n\nfunction FormulaireContact() {\n  const [formulaire, setFormulaire] = useState({ nom: '', email: '' });\n\n  function handleChange(e) {\n    const { name, value } = e.target;\n    setFormulaire({ ...formulaire, [name]: value });\n  }\n\n  function handleSubmit(e) {\n    e.preventDefault();\n    console.log('Transmission envoyee :', formulaire);\n  }\n\n  return (\n    <form onSubmit={handleSubmit}>\n      <input name='nom' value={formulaire.nom} onChange={handleChange} />\n      <input name='email' value={formulaire.email} onChange={handleChange} />\n      <button type='submit'>Envoyer</button>\n    </form>\n  );\n}",
      briefing: {
        title: "onSubmit et e.preventDefault()",
        content: `
### Le comportement natif du navigateur
Un <form> HTML classique, sans JavaScript, RECHARGE la page a la soumission (touche Entree ou clic sur un bouton submit). Dans une SPA React, ce rechargement detruit tout l'etat de l'application.

### Le piege classique : le handler sur le bouton
\`<button onClick={handleSubmit}>Envoyer</button>\`

Ca semble marcher au clic... mais appuyer sur Entree dans un champ ne declenche PAS le onClick du bouton : seule la soumission du <form> capture les DEUX cas (clic ET Entree).

### La bonne cible : le <form>
\`<form onSubmit={handleSubmit}>\`

onSubmit se declenche que la soumission vienne d'un clic sur le bouton submit ou de la touche Entree dans un champ.

### e.preventDefault()
\`function handleSubmit(e) {\`
\`  e.preventDefault();\`
\`  // ... traiter formulaire ...\`
\`}\`

Sans cet appel, meme un onSubmit bien branche laisse le navigateur recharger la page une fois ton code execute.

### Le type du bouton
\`<button type='submit'>\` (le defaut dans un <form>) declenche onSubmit. \`<button type='button'>\` ne le declenche JAMAIS — reserve-le aux actions qui ne soumettent rien (annuler, etape precedente...).

**A retenir :** onSubmit se pose sur le <form>, jamais sur le bouton. e.preventDefault() est obligatoire pour eviter le rechargement.
        `,
      },
      objectives: [
        { id: "o3a", label: "Attacher onSubmit sur le <form>, pas sur le bouton" },
        { id: "o3b", label: "Appeler e.preventDefault() dans le handler de soumission" },
      ],
      missionIcon: "📨",
      missionTag: "PROTOCOLE 03",
      missionTtl: "PROTOCOLE DE TRANSMISSION",
      bannerIcon: "📨",
      bannerTtl: "TRANSMISSION MAITRISEE",
      bannerSub: "Le formulaire transmet ses donnees sans recharger la page.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Le poste de commandement refuse les transmissions incompletes.\n// Desactive le bouton Envoyer tant que nom OU email est vide.\n// Le calcul doit deriver de l'etat formulaire, jamais d'une valeur figee.\nimport { useState } from 'react';\n\nfunction FormulaireContact() {\n  const [formulaire, setFormulaire] = useState({ nom: '', email: '' });\n\n  function handleChange(e) {\n    const { name, value } = e.target;\n    setFormulaire({ ...formulaire, [name]: value });\n  }\n\n  function handleSubmit(e) {\n    e.preventDefault();\n    console.log('Transmission envoyee :', formulaire);\n  }\n\n  return (\n    <form onSubmit={handleSubmit}>\n      <input name='nom' value={formulaire.nom} onChange={handleChange} />\n      <input name='email' value={formulaire.email} onChange={handleChange} />\n      <button type='submit'>Envoyer</button>\n    </form>\n  );\n}\n",
      placeholder: "// <button type='submit' disabled={!formulaire.nom || !formulaire.email}>Envoyer</button>",
      narrator:
        "Zero controle cote client, et un formulaire vide part quand meme en transmission. Calcule disabled a partir de l'etat formulaire : le bouton doit refuser le clic tant qu'un champ requis est vide, et se debloquer automatiquement des que l'etat change.",
      hint: "import { useState } from 'react';\n\nfunction FormulaireContact() {\n  const [formulaire, setFormulaire] = useState({ nom: '', email: '' });\n\n  function handleChange(e) {\n    const { name, value } = e.target;\n    setFormulaire({ ...formulaire, [name]: value });\n  }\n\n  function handleSubmit(e) {\n    e.preventDefault();\n    console.log('Transmission envoyee :', formulaire);\n  }\n\n  return (\n    <form onSubmit={handleSubmit}>\n      <input name='nom' value={formulaire.nom} onChange={handleChange} />\n      <input name='email' value={formulaire.email} onChange={handleChange} />\n      <button type='submit' disabled={!formulaire.nom || !formulaire.email}>\n        Envoyer\n      </button>\n    </form>\n  );\n}",
      briefing: {
        title: "disabled derive de l'etat",
        content: `
### Le bouton ne sait rien tout seul
\`<button disabled={false}>Envoyer</button>\`

Ce bouton n'est JAMAIS desactive : disabled est fige a false, quel que soit le contenu du formulaire. Une valeur figee ne PEUT PAS reagir a un changement d'etat.

### Calculer disabled a partir de l'etat
\`<button disabled={!formulaire.nom || !formulaire.email}>Envoyer</button>\`

Cette expression se RE-EVALUE a chaque rendu : des que nom ET email sont non vides, disabled devient false et le bouton redevient cliquable.

### Lire l'expression
\`!formulaire.nom\` -> vrai si nom est une chaine vide (une chaine vide est "falsy" en JS).
\`!formulaire.nom || !formulaire.email\` -> vrai si nom EST vide OU email EST vide -> alors disabled.

### Validation plus poussee
Le meme principe s'etend a des regles plus riches :
\`const emailValide = formulaire.email.includes('@');\`
\`<button disabled={!formulaire.nom || !emailValide}>Envoyer</button>\`

### Le piege classique
\`<button disabled={false}>\` ou \`<button>\` (sans disabled du tout) laissent l'utilisateur soumettre un formulaire vide ou invalide. Le controle cote client reste un confort — la validation reelle se fait toujours cote serveur — mais un bouton qui reagit a l'etat evite les erreurs evidentes avant meme l'envoi.

**A retenir :** disabled doit toujours deriver de l'etat courant, jamais d'une valeur figee comme true ou false.
        `,
      },
      objectives: [
        { id: "o4a", label: "Calculer disabled a partir de l'etat formulaire" },
        { id: "o4b", label: "Desactiver le bouton tant qu'un champ requis est vide" },
      ],
      missionIcon: "🔒",
      missionTag: "PROTOCOLE 04",
      missionTtl: "VERROU DE VALIDATION",
      bannerIcon: "🎛",
      bannerTtl: "CONSOLE OPERATIONNELLE",
      bannerSub: "Le bouton d'envoi refuse toute transmission tant que le formulaire est incomplet.",
      bannerXp: "⚡ +75 XP",
    },
  ],
};
