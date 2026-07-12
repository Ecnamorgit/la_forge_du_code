import type { ChapterData } from "./types";

export const chapitre5: ChapterData = {
  slug: "chapitre-5",
  tag: "DOCK D'ORBITE : TRANSPORTS",
  title: "LE MENU\nDEROULANT",
  subtitle: "Configure les formulaires d'enregistrement des cargaisons",
  totalXp: 250,
  completionBadge: "📝",
  completionBadgeLabel: "OFFICIER DES LOGISTIQUES",
  steps: [
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Enregistrement Soute</title>\n  </head>\n  <body>\n    \n  </body>\n</html>',
      placeholder: "<!-- Cree un formulaire avec un champ texte etiquete -->",
      narrator:
        "Cadet, nous devons cataloguer les conteneurs arrivant sur le dock. Ajoute un formulaire <form> contenant un champ de texte associé à un label pour saisir le 'Nom de l\\'equipement'. Le label doit porter le texte exact 'Nom de l\\'equipement :'.",
      hint: 'Utilise <form><label for="equipement">Nom de l\'equipement :</label><input type="text" id="equipement" /></form>.',
      briefing: {
        title: "Le formulaire et son premier champ",
        content: `
*« Pas d'enregistrement sans étiquette. Lie chaque \`<label>\` à son champ par le \`for\`/\`id\` — un formulaire mal étiqueté, c'est une cargaison sans manifeste. »* — **Kira**

### La balise <form>
C'est le conteneur principal de tous tes champs de saisie. Elle dit au navigateur : *"Ce qui est a l'interieur est une suite de questions dont je veux collecter les reponses."*

### Le Label et l'Input
- **<label>** : affiche le texte decrivant ce que l'utilisateur doit saisir.
- **<input type="text">** : cree un champ de saisie de texte brut.
- **Liaison** : l'attribut **for** du label doit correspondre a l'**id** de l'input.

\`<form>\`
\`  <label for="code">Code :</label>\`
\`  <input type="text" id="code" />\`
\`</form>\`
        `,
      },
      objectives: [
        { id: "o1a", label: "Creer un element <form>" },
        { id: "o1b", label: "Ajouter un <label> et un <input> lies" },
      ],
      docRefs: ["html/form", "html/label", "html/input"],
      missionIcon: "📝",
      missionTag: "PROTOCOLE 01",
      missionTtl: "CONTENEUR FORMULAIRE",
      bannerIcon: "📁",
      bannerTtl: "STRUCTURE DU FORMULAIRE ACTIVÉE",
      bannerSub: "Le canal de transmission des donnees est configure.",
      bannerXp: "⚡ +50 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Enregistrement Soute</title>\n  </head>\n  <body>\n    <form>\n      <label for="equipement">Nom de l\'equipement :</label>\n      <input type="text" id="equipement" />\n      \n    </form>\n  </body>\n</html>',
      placeholder: "<!-- Ajoute un champ email et un champ password -->",
      narrator:
        "Sécurisons l'accès à l'inventaire du dock. Ajoute deux nouveaux champs de saisie : un champ de type 'email' (label 'Email de l\\'operateur :') et un champ de type 'password' (label 'Mot de passe de securite :').",
      hint: 'Ajoute des inputs avec type="email" et type="password" associes a leurs labels via des id uniques.',
      briefing: {
        title: "Champs Email et Password",
        content: `
### Les types d'input
HTML5 propose des types de saisie adaptes :
- **type="email"** : verifie automatiquement que la saisie correspond a une adresse de transmission valide.
- **type="password"** : masque les caracteres tapes a l'ecran pour la securite du dock.

\`<label for="pass">Cle :</label>\`
\`<input type="password" id="pass" />\`
        `,
      },
      objectives: [
        { id: "o2a", label: "Ajouter un champ de saisie email" },
        { id: "o2b", label: "Ajouter un champ de saisie password" },
      ],
      docRefs: ["html/input", "html/label"],
      missionIcon: "🔑",
      missionTag: "PROTOCOLE 02",
      missionTtl: "SECURISATION DE BORD",
      bannerIcon: "🔐",
      bannerTtl: "CHAMPS SECURISES ETABLIS",
      bannerSub: "L'identite de l'operateur et sa cle de cryptage sont configurables.",
      bannerXp: "⚡ +60 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Enregistrement Soute</title>\n  </head>\n  <body>\n    <form>\n      <label for="equipement">Nom de l\'equipement :</label>\n      <input type="text" id="equipement" />\n      <label for="email">Email de l\'operateur :</label>\n      <input type="email" id="email" />\n      <label for="pass">Mot de passe de securite :</label>\n      <input type="password" id="pass" />\n      \n    </form>\n  </body>\n</html>',
      placeholder: "<!-- Ajoute un message libre et un bouton d'envoi -->",
      narrator:
        "L'officier doit pouvoir consigner des notes de vol sur l'état des conteneurs. Ajoute une zone de texte multiligne <textarea> (label 'Commentaires additionnels :') et un bouton d'envoi final.",
      hint: 'Utilise <textarea id="notes"></textarea> et <button type="submit">Transmettre</button>.',
      briefing: {
        title: "Textarea et Soumission",
        content: `
### La balise <textarea>
Contrairement a l'input simple, **<textarea>** est une balise double qui permet de saisir **plusieurs lignes de texte** (par exemple pour decrire des degats sur un conteneur).

### Le bouton de soumission
Pour envoyer le formulaire au dock central, on utilise la balise **<button>** avec l'attribut **type="submit"**.
        `,
      },
      objectives: [
        { id: "o3a", label: "Ajouter une zone de texte multiligne <textarea>" },
        { id: "o3b", label: "Ajouter un bouton de soumission" },
      ],
      docRefs: ["html/textarea", "html/button"],
      missionIcon: "💾",
      missionTag: "PROTOCOLE 03",
      missionTtl: "NOTES ET TRANSMISSION",
      bannerIcon: "🚀",
      bannerTtl: "TRANSMISSION PRETE",
      bannerSub: "Les notes d'inspection peuvent etre envoyees.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Enregistrement Soute</title>\n  </head>\n  <body>\n    <form>\n      <label for="equipement">Nom de l\'equipement :</label>\n      <input type="text" id="equipement" />\n      <label for="email">Email de l\'operateur :</label>\n      <input type="email" id="email" />\n      <label for="pass">Mot de passe de securite :</label>\n      <input type="password" id="pass" />\n      <label for="notes">Commentaires additionnels :</label>\n      <textarea id="notes"></textarea>\n      <button type="submit">Transmettre</button>\n      \n    </form>\n  </body>\n</html>',
      placeholder: "<!-- Ajoute un menu deroulant <select> pour la destination -->",
      narrator:
        "Il reste à définir le secteur orbital de destination. Crée un menu déroulant <select> (label 'Destination du conteneur :') avec 3 options : 'Secteur Alpha', 'Secteur Beta' et 'Secteur Gamma'.",
      hint: 'Utilise <select id="destination"><option value="alpha">Secteur Alpha</option>...</select> et associe-le a son label.',
      briefing: {
        title: "La liste deroulante : <select> et <option>",
        content: `
### La balise <select>
Elle propose une liste fermee de choix :
- **<select>** declare la liste.
- **<option>** declare chaque choix possible.

\`<select id="destination">\`
\`  <option value="alpha">Secteur Alpha</option>\`
\`  <option value="beta">Secteur Beta</option>\`
\`</select>\`
        `,
      },
      objectives: [
        { id: "o4a", label: "Ajouter un menu deroulant <select>" },
        { id: "o4b", label: "Ajouter des options avec leurs attributs value" },
      ],
      docRefs: ["html/select"],
      missionIcon: "🔽",
      missionTag: "PROTOCOLE 04",
      missionTtl: "AFFECTATION DU SECTEUR",
      bannerIcon: "🛰",
      bannerTtl: "LOGISTIQUE TERMINEE",
      bannerSub: "Le manifeste d'enregistrement de soute est complet.",
      bannerXp: "⚡ +70 XP",
    },
  ],
};
