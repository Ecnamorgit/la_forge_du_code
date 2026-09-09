import type { ChapterData } from "@/data/courses/html/types";

export const chapitre6: ChapterData = {
  slug: "chapitre-6",
  tag: "MISSION : CONSOLE DE COMMANDE",
  title: "REACT &\nFORMULAIRES",
  subtitle: "Branche une console de saisie reactive et transmets des données fiables",
  totalXp: 280,
  completionBadge: "🎛",
  completionBadgeLabel: "OPÉRATEUR DE CONSOLE",
  steps: [
    {
      startCode:
        "// Le Spectre a sabote la console de saisie du poste de commande.\n// L'etat nom existe deja, mais le champ ci-dessous n'ecoute plus le clavier.\nimport { useState } from 'react';\n\nfunction ConsoleSaisie() {\n  const [nom, setNom] = useState('');\n  return (\n    <input value={nom} />\n  );\n}\n",
      spectreTrap:
        "J'ai coupé le fil entre ton clavier et l'état, Cadet. Tape tout ce que tu veux, ce champ n'en gardera pas une lettre — retrouve l'onChange manquant, si tu en es capable.",
      placeholder: "// <input value={nom} onChange={(e) => setNom(e.target.value)} />",
      previewMount: "ConsoleSaisie",
      narrator:
        "Un input contrôle affiche exactement ce que contient l'état React, jamais autre chose. Pour taper au clavier, tu dois mettre à jour l'état à chaque frappe : c'est le rôle de onChange. Sans lui, ton champ affiche l'état mais ignore totalement tes frappes au clavier.",
      hint: "import { useState } from 'react';\n\nfunction ConsoleSaisie() {\n  const [nom, setNom] = useState('');\n  return (\n    <input value={nom} onChange={(e) => setNom(e.target.value)} />\n  );\n}",
      briefing: {
        title: "L'input contrôle : value + onChange",
        content: `
### Le champ fige
\`<input value={nom} />\`

React affiche la valeur de \`nom\`, mais rien ne la modifie. Chaque frappe clavier est ignoree : le champ reste colle à sa valeur initiale. C'est le symptome numero un du débutant React.

### Le duo obligatoire
Un champ CONTRÔLE porte TOUJOURS les deux props ensemble :
\`<input\`
\`  value={nom}\`
\`  onChange={(e) => setNom(e.target.value)}\`
\`/>\`

- \`value\` : ce que React AFFICHE (la source de verite reste l'état)
- \`onChange\` : ce qui se passe à CHAQUE frappe (met à jour l'état)

### e.target.value
L'événement \`onChange\` reçoit un objet \`e\`. \`e.target\` désigne l'élément DOM du champ, et \`e.target.value\` son contenu actuel — celui que l'utilisateur vient de taper.

### Le piège classique
\`<input value={nom} />\` sans onChange -> champ fige, lecture seule malgre lui.
\`<input onChange={...} />\` sans value -> champ NON contrôle, React ne sait plus ce qu'il doit afficher.

Un input contrôle a besoin des DEUX props ensemble, jamais l'une sans l'autre.

**À retenir :** value affiche l'état, onChange le met à jour. Sans onChange, un input contrôle refuse toute saisie.
        `,
      },
      objectives: [
        { id: "o1a", label: "Ajouter onChange sur l'input contrôle" },
        { id: "o1b", label: "Appeler setNom(e.target.value) dans le handler" },
      ],
      missionIcon: "🎛",
      missionTag: "PROTOCOLE 01",
      missionTtl: "CONSOLE VERROUILLEE",
      bannerIcon: "🎛",
      bannerTtl: "SAISIE RESTAUREE",
      bannerSub: "Le champ répond de nouveau à chaque frappe.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        "// La console de saisie a maintenant deux champs : nom et email.\n// Regroupe-les dans un SEUL etat objet formulaire, pas deux useState separes.\nimport { useState } from 'react';\n\nfunction FormulaireContact() {\n  const [nom, setNom] = useState('');\n  const [email, setEmail] = useState('');\n  return (\n    <form>\n      <input name='nom' value={nom} onChange={(e) => setNom(e.target.value)} />\n      <input name='email' value={email} onChange={(e) => setEmail(e.target.value)} />\n    </form>\n  );\n}\n",
      placeholder: "// const [formulaire, setFormulaire] = useState({ nom: '', email: '' });",
      previewMount: "FormulaireContact",
      narrator:
        "Deux champs, deux useState : ca fonctionne encore, mais un formulaire de dix champs voudrait dire dix états separes à synchroniser à la main. Regroupe nom et email dans un seul objet d'état, et mets-le à jour par copie avec une clé calculée.",
      hint: "import { useState } from 'react';\n\nfunction FormulaireContact() {\n  const [formulaire, setFormulaire] = useState({ nom: '', email: '' });\n\n  function handleChange(e) {\n    const { name, value } = e.target;\n    setFormulaire({ ...formulaire, [name]: value });\n  }\n\n  return (\n    <form>\n      <input name='nom' value={formulaire.nom} onChange={handleChange} />\n      <input name='email' value={formulaire.email} onChange={handleChange} />\n    </form>\n  );\n}",
      briefing: {
        title: "Un objet d'état pour plusieurs champs",
        content: `
### Le problème des useState multiplies
Deux champs, deux useState : ca marche, mais un formulaire de dix champs voudrait dire dix useState, dix setters, dix onChange ecrits à la main.

### Un seul objet, une seule source de verite
\`const [formulaire, setFormulaire] = useState({ nom: '', email: '' });\`

Chaque champ devient une propriété de \`formulaire\` : \`formulaire.nom\`, \`formulaire.email\`.

### Le spread pour ne pas ecraser les autres champs
\`setFormulaire({ ...formulaire, nom: 'Lia' });\`

Sans le spread \`...formulaire\`, mettre à jour \`nom\` effacerait \`email\` : le nouvel objet ne contiendrait QUE la propriété listee explicitement.

### Une clé calculée : [name]
Écrire un handler différent par champ redevient repetitif. La solution : un SEUL handleChange qui lit \`e.target.name\` (le nom de l'input, ex: \`nom\` ou \`email\`) et met à jour la BONNE propriété grâce a une clé calculée :
\`const { name, value } = e.target;\`
\`setFormulaire({ ...formulaire, [name]: value });\`

\`[name]\` entre crochets dans un objet litteral signifie : utilise la VALEUR de la variable \`name\` comme nom de propriété, pas le mot "name" litteral.

### Relier le name de l'input à la clé
Pour que \`e.target.name\` corresponde à la bonne propriété, chaque \`<input>\` doit porter un attribut \`name\` identique au nom de la propriété : \`<input name='nom' .../>\`.

**À retenir :** un objet d'état regroupe les champs lies. Mets-le à jour par spread + clé calculée pour ne jamais ecraser les autres propriétés.
        `,
      },
      objectives: [
        { id: "o2a", label: "Regrouper nom et email dans useState({ ... })" },
        { id: "o2b", label: "Mettre à jour par spread avec une clé calculée [name]" },
      ],
      missionIcon: "🗂",
      missionTag: "PROTOCOLE 02",
      missionTtl: "ÉTAT GROUPE",
      bannerIcon: "🗂",
      bannerTtl: "ÉTAT REGROUPE",
      bannerSub: "Un seul objet pilote tous les champs du formulaire.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Le formulaire ne fait rien a la soumission : Entree recharge toute la page.\n// Ajoute un gestionnaire de soumission SUR le <form>, pas sur le bouton.\n// Empeche le rechargement avec e.preventDefault().\nimport { useState } from 'react';\n\nfunction FormulaireContact() {\n  const [formulaire, setFormulaire] = useState({ nom: '', email: '' });\n\n  function handleChange(e) {\n    const { name, value } = e.target;\n    setFormulaire({ ...formulaire, [name]: value });\n  }\n\n  return (\n    <form>\n      <input name='nom' value={formulaire.nom} onChange={handleChange} />\n      <input name='email' value={formulaire.email} onChange={handleChange} />\n      <button type='submit'>Envoyer</button>\n    </form>\n  );\n}\n",
      placeholder: "// function handleSubmit(e) { e.preventDefault(); ... }  puis <form onSubmit={handleSubmit}>",
      previewMount: "FormulaireContact",
      narrator:
        "Un <form> HTML classique recharge toute la page à la soumission : dans une SPA, ce rechargement detruit l'état de l'application. Attache un gestionnaire onSubmit SUR le formulaire, et appelle e.preventDefault() pour reprendre le contrôle.",
      hint: "import { useState } from 'react';\n\nfunction FormulaireContact() {\n  const [formulaire, setFormulaire] = useState({ nom: '', email: '' });\n\n  function handleChange(e) {\n    const { name, value } = e.target;\n    setFormulaire({ ...formulaire, [name]: value });\n  }\n\n  function handleSubmit(e) {\n    e.preventDefault();\n    console.log('Transmission envoyée :', formulaire);\n  }\n\n  return (\n    <form onSubmit={handleSubmit}>\n      <input name='nom' value={formulaire.nom} onChange={handleChange} />\n      <input name='email' value={formulaire.email} onChange={handleChange} />\n      <button type='submit'>Envoyer</button>\n    </form>\n  );\n}",
      briefing: {
        title: "onSubmit et e.preventDefault()",
        content: `
### Le comportement natif du navigateur
Un <form> HTML classique, sans JavaScript, RECHARGE la page à la soumission (touche Entrée ou clic sur un bouton submit). Dans une SPA React, ce rechargement detruit tout l'état de l'application.

### Le piège classique : le handler sur le bouton
\`<button onClick={handleSubmit}>Envoyer</button>\`

Ca semble marcher au clic... mais appuyer sur Entrée dans un champ ne declenche PAS le onClick du bouton : seule la soumission du <form> capture les DEUX cas (clic ET Entrée).

### La bonne cible : le <form>
\`<form onSubmit={handleSubmit}>\`

onSubmit se declenche que la soumission vienne d'un clic sur le bouton submit ou de la touche Entrée dans un champ.

### e.preventDefault()
\`function handleSubmit(e) {\`
\`  e.preventDefault();\`
\`  // ... traiter formulaire ...\`
\`}\`

Sans cet appel, même un onSubmit bien branche laisse le navigateur recharger la page une fois ton code execute.

### Le type du bouton
\`<button type='submit'>\` (le défaut dans un <form>) declenche onSubmit. \`<button type='button'>\` ne le declenche JAMAIS — reserve-le aux actions qui ne soumettent rien (annuler, étape precedente...).

**À retenir :** onSubmit se pose sur le <form>, jamais sur le bouton. e.preventDefault() est obligatoire pour éviter le rechargement.
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
      bannerTtl: "TRANSMISSION MAÎTRISÉE",
      bannerSub: "Le formulaire transmet ses données sans recharger la page.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Le poste de commandement refuse les transmissions incompletes.\n// Desactive le bouton Envoyer tant que nom OU email est vide.\n// Le calcul doit deriver de l'etat formulaire, jamais d'une valeur figee.\nimport { useState } from 'react';\n\nfunction FormulaireContact() {\n  const [formulaire, setFormulaire] = useState({ nom: '', email: '' });\n\n  function handleChange(e) {\n    const { name, value } = e.target;\n    setFormulaire({ ...formulaire, [name]: value });\n  }\n\n  function handleSubmit(e) {\n    e.preventDefault();\n    console.log('Transmission envoyee :', formulaire);\n  }\n\n  return (\n    <form onSubmit={handleSubmit}>\n      <input name='nom' value={formulaire.nom} onChange={handleChange} />\n      <input name='email' value={formulaire.email} onChange={handleChange} />\n      <button type='submit'>Envoyer</button>\n    </form>\n  );\n}\n",
      placeholder: "// <button type='submit' disabled={!formulaire.nom || !formulaire.email}>Envoyer</button>",
      previewMount: "FormulaireContact",
      narrator:
        "Zéro contrôle côté client, et un formulaire vide part quand même en transmission. Calcule disabled à partir de l'état formulaire : le bouton doit refuser le clic tant qu'un champ requis est vide, et se debloquer automatiquement des que l'état change.",
      hint: "import { useState } from 'react';\n\nfunction FormulaireContact() {\n  const [formulaire, setFormulaire] = useState({ nom: '', email: '' });\n\n  function handleChange(e) {\n    const { name, value } = e.target;\n    setFormulaire({ ...formulaire, [name]: value });\n  }\n\n  function handleSubmit(e) {\n    e.preventDefault();\n    console.log('Transmission envoyée :', formulaire);\n  }\n\n  return (\n    <form onSubmit={handleSubmit}>\n      <input name='nom' value={formulaire.nom} onChange={handleChange} />\n      <input name='email' value={formulaire.email} onChange={handleChange} />\n      <button type='submit' disabled={!formulaire.nom || !formulaire.email}>\n        Envoyer\n      </button>\n    </form>\n  );\n}",
      briefing: {
        title: "disabled dérive de l'état",
        content: `
### Le bouton ne sait rien tout seul
\`<button disabled={false}>Envoyer</button>\`

Ce bouton n'est JAMAIS désactive : disabled est fige a false, quel que soit le contenu du formulaire. Une valeur figee ne PEUT PAS reagir a un changement d'état.

### Calculer disabled à partir de l'état
\`<button disabled={!formulaire.nom || !formulaire.email}>Envoyer</button>\`

Cette expression se RE-EVALUE à chaque rendu : des que nom ET email sont non vides, disabled devient false et le bouton redevient cliquable.

### Lire l'expression
\`!formulaire.nom\` -> vrai si nom est une chaîne vide (une chaîne vide est "falsy" en JS).
\`!formulaire.nom || !formulaire.email\` -> vrai si nom EST vide OU email EST vide -> alors disabled.

### Validation plus poussee
Le même principe s'etend à des règles plus riches :
\`const emailValide = formulaire.email.includes('@');\`
\`<button disabled={!formulaire.nom || !emailValide}>Envoyer</button>\`

### Le piège classique
\`<button disabled={false}>\` ou \`<button>\` (sans disabled du tout) laissent l'utilisateur soumettre un formulaire vide ou invalide. Le contrôle côté client reste un confort — la validation réelle se fait toujours côté serveur — mais un bouton qui réagit à l'état évite les erreurs evidentes avant même l'envoi.

**À retenir :** disabled doit toujours deriver de l'état courant, jamais d'une valeur figee comme true ou false.
        `,
      },
      objectives: [
        { id: "o4a", label: "Calculer disabled à partir de l'état formulaire" },
        { id: "o4b", label: "Desactiver le bouton tant qu'un champ requis est vide" },
      ],
      missionIcon: "🔒",
      missionTag: "PROTOCOLE 04",
      missionTtl: "VERROU DE VALIDATION",
      bannerIcon: "🎛",
      bannerTtl: "CONSOLE OPÉRATIONNELLE",
      bannerSub: "Le bouton d'envoi refuse toute transmission tant que le formulaire est incomplet.",
      bannerXp: "⚡ +75 XP",
    },
  ],
};
