import type { ChapterData } from "@/data/courses/html/types";

export const chapitre7: ChapterData = {
  slug: "chapitre-7",
  tag: "MISSION : INTERACTIONS REACTIVES",
  title: "PSEUDO\nCLASSES",
  subtitle: "Donne vie aux éléments selon leur état",
  totalXp: 240,
  completionBadge: "🪄",
  completionBadgeLabel: "INVOCATEUR DE STYLES",
  steps: [
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Pseudos</title>\n    <style>\n      body { background: #03060d; color: white; font-family: sans-serif; padding: 40px; }\n      .btn { background: #00b8d4; color: black; padding: 12px 24px; border: none; font-weight: bold; cursor: pointer; }\n      \n    </style>\n  </head>\n  <body>\n    <button class="btn">Lancer la mission</button>\n  </body>\n</html>',
      placeholder: "/* Change la couleur de fond du bouton au survol */",
      narrator:
        "Un bouton sans feedback est mort. Quand le curseur passe dessus, change sa couleur de fond avec la pseudo-classe :hover.",
      hint: "Ajoute une règle : .btn:hover { background: #00ff88; }",
      briefing: {
        title: "Pseudo-classe :hover",
        content: `
### Qu'est-ce qu'une pseudo-classe ?
Une **pseudo-classe** cible un élément selon son **état** plutôt que sa classe statique. Format : **selecteur:pseudo-classe**.

### :hover
Cible un élément **quand le curseur le survole**.

\`.btn:hover {\`
\`  background: #00ff88;\`
\`}\`

### Autres pseudo-classes courantes
- **:focus** : élément actuellement sélectionné (input, bouton, lien)
- **:active** : élément en cours de clic
- **:visited** : lien déjà visité
- **:disabled** : champ désactivé
- **:checked** : checkbox/radio cochée

### Astuce UX
- **Toujours** un :hover sur un élément cliquable. Sans feedback, l'utilisateur ne sait pas si c'est interactif.
- Ajoute **transition: background 0.2s** sur l'élément de base pour adoucir le changement.

**A retenir :** :hover, c'est la base du langage du web. Aucun bon site n'en fait l'économie.
        `,
      },
      objectives: [
        { id: "o1a", label: "Cibler .btn:hover" },
        { id: "o1b", label: "Changer une propriété (background, color, etc.)" },
      ],
      missionIcon: "👆",
      missionTag: "PROTOCOLE 01",
      missionTtl: "REACTION AU SURVOL",
      bannerIcon: "👆",
      bannerTtl: "FEEDBACK ACTIF",
      bannerSub: "Le bouton réagit au passage de souris.",
      bannerXp: "⚡ +55 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Pseudos</title>\n    <style>\n      body { background: #03060d; color: white; font-family: sans-serif; padding: 40px; }\n      .field { background: #0a1322; color: white; padding: 10px; border: 2px solid #1a2744; width: 240px; }\n      \n    </style>\n  </head>\n  <body>\n    <input class="field" placeholder="Indicatif d\'appel">\n  </body>\n</html>',
      placeholder: "/* Marque le champ actif avec une bordure cyan */",
      narrator:
        "Quand un utilisateur clique dans un champ, il faut le signaler clairement. Utilise :focus pour donner une bordure cyan au champ actif. C'est essentiel pour l'accessibilité clavier.",
      hint: "Ajoute : .field:focus { border-color: #00f0ff; outline: none; }",
      briefing: {
        title: "Pseudo-classe :focus",
        content: `
### :focus
Cible un élément **quand il est sélectionné** (clic, navigation au clavier via Tab).

### Pourquoi c'est critique
Les utilisateurs au clavier (handicap moteur, préférences personnelles, simple confort) **dépendent** d'un :focus visible pour savoir où ils sont. **Le supprimer sans le remplacer est une faute d'accessibilité grave.**

### Le piège outline: none
Beaucoup de devs font :
\`input:focus { outline: none; }\`
... car le contour bleu par défaut est "moche". **Problème :** l'élément n'a plus AUCUN indicateur visuel d'activation.

### La solution
Remplace par autre chose : bordure colorée, ombre extérieure, ring coloré.
\`.field:focus {\`
\`  border-color: #00f0ff;\`
\`  outline: none;            /* OK car on a remplacé */\`
\`}\`

### :focus-visible (bonus moderne)
Variante qui ne s'affiche **que** quand le focus vient du clavier (pas du clic souris). Plus subtil pour les utilisateurs souris.

**A retenir :** ne JAMAIS retirer le focus sans le remplacer.
        `,
      },
      objectives: [
        { id: "o2a", label: "Cibler .field:focus" },
        { id: "o2b", label: "Changer border ou box-shadow (feedback visuel)" },
      ],
      missionIcon: "🎯",
      missionTag: "PROTOCOLE 02",
      missionTtl: "INDICATEUR DE FOCUS",
      bannerIcon: "🎯",
      bannerTtl: "FOCUS ACCESSIBLE",
      bannerSub: "Le champ actif est clairement signalé.",
      bannerXp: "⚡ +60 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Pseudos</title>\n    <style>\n      body { background: #03060d; color: white; font-family: sans-serif; padding: 40px; }\n      .quote { background: #0a1322; padding: 20px 30px; border-left: 4px solid #00b8d4; position: relative; max-width: 500px; }\n      \n    </style>\n  </head>\n  <body>\n    <div class="quote">L\'avenir appartient à ceux qui codent tôt.</div>\n  </body>\n</html>',
      placeholder: "/* Ajoute des guillemets avec ::before */",
      narrator:
        "La citation manque de style. Ajoute un guillemet ouvrant géant en haut à gauche avec le pseudo-élément ::before.",
      hint: 'Ajoute : .quote::before { content: "\\201C"; font-size: 48px; color: #00b8d4; position: absolute; top: 0; left: 8px; }',
      briefing: {
        title: "Pseudo-éléments ::before et ::after",
        content: `
### Différence avec une pseudo-classe
- **Pseudo-classe** (:hover) : cible un élément selon son état.
- **Pseudo-élément** (::before, ::after) : **ajoute du contenu** avant/après un élément, sans toucher au HTML.

### Syntaxe
**Toujours** avec **content:** sinon rien ne s'affiche.

\`.quote::before {\`
\`  content: "\\201C";    /* guillemet ouvrant */\`
\`  font-size: 48px;\`
\`}\`

### Cas d'utilisation typiques
- **Icones décoratives** sans polluer le HTML.
- **Guillemets** automatiques pour les citations.
- **Numérotation** automatique de listes.
- **Tooltip** texte au survol.
- **Décorations visuelles** (rubans, flèches, ombres complexes).

### ::after
Même principe, ajoute après l'élément.
\`.btn::after { content: " →"; }\`

### Astuce
Tu peux les positionner en absolute si le parent est position: relative.

**A retenir :** ::before/::after sont des "éléments virtuels" — ils acceptent presque toutes les propriétés CSS.
        `,
      },
      objectives: [
        { id: "o3a", label: "Définir .quote::before avec content" },
        { id: "o3b", label: "Le styler (font-size ou color)" },
      ],
      missionIcon: "🎨",
      missionTag: "PROTOCOLE 03",
      missionTtl: "DÉCORATION VIRTUELLE",
      bannerIcon: "🎨",
      bannerTtl: "ÉLÉMENT FANTOME CRÉÉ",
      bannerSub: "::before ajoute un contenu visuel sans toucher au HTML.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Pseudos</title>\n    <style>\n      body { background: #03060d; color: white; font-family: sans-serif; padding: 40px; }\n      ul { list-style: none; padding: 0; max-width: 360px; }\n      li { background: #0a1322; padding: 10px 16px; margin: 0; border-bottom: 1px solid #1a2744; }\n      \n    </style>\n  </head>\n  <body>\n    <ul>\n      <li>Mission 1</li>\n      <li>Mission 2</li>\n      <li>Mission 3</li>\n      <li>Mission 4</li>\n      <li>Mission 5</li>\n    </ul>\n  </body>\n</html>',
      placeholder: "/* Alterne la couleur de fond une ligne sur deux */",
      narrator:
        "La liste est terne. Donne aux lignes paires une couleur de fond différente pour créer un effet \"zebrures\" lisible. Utilise :nth-child(even).",
      hint: "Ajoute : li:nth-child(even) { background: #14253d; }",
      briefing: {
        title: "Pseudo-classe :nth-child()",
        content: `
### Cibler par position
**:nth-child()** cible un élément selon sa **position dans son parent**.

### Valeurs courantes
- **:nth-child(1)** : le 1er enfant.
- **:nth-child(odd)** : 1, 3, 5, 7...
- **:nth-child(even)** : 2, 4, 6, 8...
- **:nth-child(3n)** : 3, 6, 9, 12... (un sur trois)
- **:nth-child(3n+1)** : 1, 4, 7, 10... (le 1er d'un trio)

### Exemple zebrures
\`li:nth-child(even) {\`
\`  background: #14253d;\`
\`}\`

### Autres pseudos de position
- **:first-child** = :nth-child(1)
- **:last-child** : le dernier enfant
- **:only-child** : seul enfant
- **:first-of-type** : 1er du **même type** dans le parent

### Cas d'utilisation
- Tables alternées.
- Galeries grid 3 colonnes (3n).
- Première / dernière ligne stylées différemment.

**Astuce :** :nth-child est calculé à partir du **parent**, pas du selecteur. Si tu écris li:nth-child(2) mais que le 2ème enfant n'est pas un <li>, rien ne match.
        `,
      },
      objectives: [
        { id: "o4a", label: "Utiliser li:nth-child(even) ou :nth-child(odd)" },
        { id: "o4b", label: "Appliquer un background différent" },
      ],
      missionIcon: "📊",
      missionTag: "PROTOCOLE 04",
      missionTtl: "CIBLAGE PAR POSITION",
      bannerIcon: "📊",
      bannerTtl: "MOTIF EN ZEBRURE",
      bannerSub: "Les lignes alternent leur couleur de fond automatiquement.",
      bannerXp: "⚡ +60 XP",
    },
  ],
};