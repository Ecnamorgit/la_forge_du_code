import type { ChapterData } from "./types";

export const chapitre5: ChapterData = {
  slug: "chapitre-5",
  tag: "MISSION : CONSOLE DE COMMANDE",
  title: "CENTRE DE\nCOMMANDEMENT",
  subtitle: "Concois la console qui recoit les ordres de l'equipage",
  totalXp: 250,
  completionBadge: "🎛",
  completionBadgeLabel: "OPERATEUR DE CONSOLE",
  steps: [
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Console de commande</title>\n  </head>\n  <body>\n    <h1>Console de la station</h1>\n    \n  </body>\n</html>',
      placeholder: "<!-- Cree un formulaire avec un champ texte etiquete -->",
      narrator:
        "L'equipage doit pouvoir saisir son identifiant. Mets en place un premier formulaire avec un champ texte et son etiquette.",
      hint: 'Place un <form>, un <label for="callsign">Indicatif</label>, puis un <input type="text" id="callsign" name="callsign"> a l\'interieur.',
      briefing: {
        title: "Le formulaire et son premier champ",
        content: `
### La balise <form>
**<form>** regroupe tous les champs qu'un utilisateur va remplir. C'est l'enveloppe du formulaire.

### Le champ texte : <input type="text">
- **<input>** est une balise **auto-fermante** (pas de </input>).
- L'attribut **type="text"** indique un champ texte simple.
- **name** : nom logique du champ (utilise quand on envoie le formulaire).
- **id** : identifiant unique (utilise par le <label>).

### Le <label>
\`<label for="callsign">Indicatif</label>\`

L'attribut **for** doit correspondre au **id** du champ. Cliquer sur le label active le champ.

**Bonne pratique :** chaque champ merite un label clair.
        `,
      },
      objectives: [
        { id: "o1a", label: "Ajouter une balise <form>" },
        { id: "o1b", label: "Mettre un <input type=\"text\"> avec son <label>" },
      ],
      missionIcon: "📝",
      missionTag: "PROTOCOLE 01",
      missionTtl: "PREMIER CHAMP",
      bannerIcon: "🪪",
      bannerTtl: "IDENTIFICATION ACTIVE",
      bannerSub: "L'equipage peut saisir son indicatif d'appel.",
      bannerXp: "⚡ +60 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Console de commande</title>\n  </head>\n  <body>\n    <h1>Console de la station</h1>\n    <form>\n      <label for="callsign">Indicatif</label>\n      <input type="text" id="callsign" name="callsign">\n      \n    </form>\n  </body>\n</html>',
      placeholder: "<!-- Ajoute un champ email et un champ password -->",
      narrator:
        "Toutes les donnees ne se traitent pas pareil. Ajoute un email pour les notifications et un mot de passe pour l'authentification.",
      hint: 'Ajoute <input type="email"> et <input type="password"> avec leurs <label> respectifs.',
      briefing: {
        title: "Les types de champ",
        content: `
### type="email"
Active une **validation automatique** : le navigateur verifie que la saisie contient bien un @.
Sur mobile, il affiche meme un clavier avec le @ en evidence.

### type="password"
Le texte saisi est **masque** par des points. Indispensable pour les mots de passe.

### Astuce
Le **type** ne change pas seulement l'apparence : il change le clavier mobile, la validation, l'autocompletion du navigateur, etc.

\`<input type="email" id="mail" name="mail">\`
\`<input type="password" id="pwd" name="pwd">\`

**Reflexe :** choisis le bon type, le HTML fait le reste.
        `,
      },
      objectives: [
        { id: "o2a", label: "Ajouter un <input type=\"email\">" },
        { id: "o2b", label: "Ajouter un <input type=\"password\">" },
      ],
      missionIcon: "🔐",
      missionTag: "PROTOCOLE 02",
      missionTtl: "TYPES SPECIALISES",
      bannerIcon: "📧",
      bannerTtl: "CANAUX SECURISES",
      bannerSub: "Email et mot de passe sont reconnus par le navigateur.",
      bannerXp: "⚡ +60 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Console de commande</title>\n  </head>\n  <body>\n    <h1>Console de la station</h1>\n    <form>\n      <label for="callsign">Indicatif</label>\n      <input type="text" id="callsign" name="callsign">\n\n      <label for="mail">Email</label>\n      <input type="email" id="mail" name="mail">\n\n      <label for="pwd">Mot de passe</label>\n      <input type="password" id="pwd" name="pwd">\n      \n    </form>\n  </body>\n</html>',
      placeholder: "<!-- Ajoute un message libre et un bouton d'envoi -->",
      narrator:
        "Un commandant doit pouvoir rediger un rapport. Ajoute un <textarea> pour un message libre et un <button> pour soumettre le formulaire.",
      hint: 'Utilise <textarea id="msg" name="msg"></textarea> et <button type="submit">Envoyer</button>.',
      briefing: {
        title: "Texte long et soumission",
        content: `
### La balise <textarea>
- Sert pour les **messages longs** (au lieu d'un <input> d'une seule ligne).
- N'est **pas** auto-fermante : on ouvre **<textarea>** et on ferme **</textarea>**.

### Le bouton de soumission
- **<button type="submit">Envoyer</button>** declenche l'envoi du formulaire.
- Sans formulaire (<form>), un bouton type submit n'a rien a envoyer.

### Exemple
\`<label for="msg">Rapport</label>\`
\`<textarea id="msg" name="msg"></textarea>\`
\`<button type="submit">Envoyer</button>\`

**A retenir :** trois types de boutons existent — **submit** (par defaut), **reset** (efface), **button** (action JS).
        `,
      },
      objectives: [
        { id: "o3a", label: "Ajouter une balise <textarea>" },
        { id: "o3b", label: "Ajouter un <button type=\"submit\">" },
      ],
      missionIcon: "💬",
      missionTag: "PROTOCOLE 03",
      missionTtl: "RAPPORT DETAILLE",
      bannerIcon: "📨",
      bannerTtl: "RAPPORT TRANSMIS",
      bannerSub: "Le formulaire peut etre soumis avec un message libre.",
      bannerXp: "⚡ +60 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Console de commande</title>\n  </head>\n  <body>\n    <h1>Console de la station</h1>\n    <form>\n      <label for="callsign">Indicatif</label>\n      <input type="text" id="callsign" name="callsign">\n\n      <label for="mail">Email</label>\n      <input type="email" id="mail" name="mail">\n\n      <label for="pwd">Mot de passe</label>\n      <input type="password" id="pwd" name="pwd">\n\n      <label for="msg">Rapport</label>\n      <textarea id="msg" name="msg"></textarea>\n\n      <button type="submit">Envoyer</button>\n      \n    </form>\n  </body>\n</html>',
      placeholder: "<!-- Ajoute un menu deroulant <select> pour la destination -->",
      narrator:
        "Derniere etape : l'equipage doit choisir sa destination dans une liste preetablie. Cree un menu deroulant avec <select> et plusieurs <option>.",
      hint: 'Ajoute <label for="dest">Destination</label> et <select id="dest" name="dest"><option>Mars</option><option>Lune</option></select> avec au moins deux options.',
      briefing: {
        title: "Le menu deroulant",
        content: `
### La balise <select>
Affiche une **liste deroulante**. L'utilisateur choisit une valeur parmi plusieurs.

### Chaque choix : <option>
\`<select id="dest" name="dest">\`
\`  <option>Mars</option>\`
\`  <option>Lune</option>\`
\`  <option>Europe (lune de Jupiter)</option>\`
\`</select>\`

### Pourquoi un select ?
- Quand les choix sont **predefinis et limites**.
- Plus compact qu'une serie de cases a cocher.

**Astuce :** mets l'option par defaut en premier — c'est elle qui s'affiche au depart.
        `,
      },
      objectives: [
        { id: "o4a", label: "Ajouter une balise <select>" },
        { id: "o4b", label: "Placer au moins deux <option>" },
      ],
      missionIcon: "🛸",
      missionTag: "PROTOCOLE 04",
      missionTtl: "CHOIX DE DESTINATION",
      bannerIcon: "🪐",
      bannerTtl: "CONSOLE OPERATIONNELLE",
      bannerSub:
        "Le centre de commandement accepte tous les ordres : identite, message et destination.",
      bannerXp: "⚡ +70 XP",
    },
  ],
};
