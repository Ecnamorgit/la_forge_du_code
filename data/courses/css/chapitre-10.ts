import type { ChapterData } from "@/data/courses/html/types";

export const chapitre10: ChapterData = {
  slug: "chapitre-10",
  tag: "MISSION : ARCHITECTURE MAINTENABLE",
  title: "VARIABLES\nCSS",
  subtitle: "Centralise et reutilise tes valeurs de design",
  totalXp: 240,
  completionBadge: "🧩",
  completionBadgeLabel: "ARCHITECTE DE DESIGN",
  steps: [
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Variables CSS</title>\n    <style>\n      body { background: #03060d; color: white; font-family: sans-serif; padding: 40px; }\n      .btn-primary { background: #00b8d4; color: black; padding: 12px 24px; }\n      .alert-bar { background: #00b8d4; color: black; padding: 10px; }\n      .link-active { color: #00b8d4; }\n      \n    </style>\n  </head>\n  <body>\n    <button class="btn-primary">OK</button>\n    <div class="alert-bar">Alerte</div>\n    <a class="link-active">Lien actif</a>\n  </body>\n</html>',
      placeholder: "/* Definis une variable --color-primary sur :root */",
      narrator:
        "La couleur #00b8d4 est dupliquee 3 fois. Le jour ou on change la couleur de marque, il faut tout remplacer. Defini une variable --color-primary sur :root.",
      hint: "Ajoute en haut du <style> : :root { --color-primary: #00b8d4; }",
      briefing: {
        title: "Definir une variable CSS",
        content: `
### Variables CSS = Custom Properties
Une variable CSS est une valeur reutilisable, definie une fois, accessible partout.

### Syntaxe
- **Definition** : double-tiret en prefixe, dans un selecteur.
- **Utilisation** : var(--nom).

\`:root {\`
\`  --color-primary: #00b8d4;\`
\`  --color-success: #00ff88;\`
\`  --font-stack: 'Inter', sans-serif;\`
\`  --radius: 4px;\`
\`}\`

### Pourquoi :root ?
**:root** = la balise <html>. Y definir une variable la rend disponible **sur toute la page**.

### Variables locales
Tu peux aussi definir des variables dans un selecteur specifique. Elles ne seront visibles que dans ses enfants.

\`.card {\`
\`  --card-padding: 20px;\`
\`  padding: var(--card-padding);\`
\`}\`

### Avantage VS preprocesseurs (Sass)
- Sass : variables resolues a la compilation, statiques.
- CSS : variables **dynamiques**, modifiables a chaud (par media query, par classe, par JS).

**A retenir :** une variable CSS bien nommee est une **intention** (--color-primary), pas une description (--blue-light).
        `,
      },
      objectives: [
        { id: "o1a", label: "Definir une variable --color-primary dans :root" },
        { id: "o1b", label: "Utiliser une couleur valide en valeur" },
      ],
      missionIcon: "🎯",
      missionTag: "PROTOCOLE 01",
      missionTtl: "DECLARATION CENTRALE",
      bannerIcon: "🎯",
      bannerTtl: "VARIABLE EN PLACE",
      bannerSub: "La couleur primaire a un nom logique.",
      bannerXp: "⚡ +55 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Variables CSS</title>\n    <style>\n      :root { --color-primary: #00b8d4; }\n      body { background: #03060d; color: white; font-family: sans-serif; padding: 40px; }\n      .btn-primary { background: #00b8d4; color: black; padding: 12px 24px; }\n      .alert-bar { background: #00b8d4; color: black; padding: 10px; }\n      .link-active { color: #00b8d4; }\n      \n    </style>\n  </head>\n  <body>\n    <button class="btn-primary">OK</button>\n    <div class="alert-bar">Alerte</div>\n    <a class="link-active">Lien actif</a>\n  </body>\n</html>',
      placeholder: "/* Remplace les 3 occurrences de #00b8d4 par var(--color-primary) */",
      narrator:
        "La variable est definie mais pas utilisee. Remplace les 3 hex codes #00b8d4 par var(--color-primary).",
      hint: "Sur .btn-primary, .alert-bar et .link-active, remplace #00b8d4 par var(--color-primary).",
      briefing: {
        title: "Utiliser var()",
        content: `
### Syntaxe var()
\`background: var(--color-primary);\`
\`color: var(--color-primary);\`

### Valeur de secours
\`background: var(--color-primary, #00b8d4);\`
Si --color-primary n'est pas defini, le navigateur utilise #00b8d4.

### Cas typique : theme switcher
\`:root {\`
\`  --bg: #fff;\`
\`  --text: #000;\`
\`}\`

\`[data-theme="dark"] {\`
\`  --bg: #000;\`
\`  --text: #fff;\`
\`}\`

\`body { background: var(--bg); color: var(--text); }\`

Ajouter data-theme="dark" sur <html> bascule tout le site en sombre.

### Performance
**Aucune perte.** Les variables CSS sont natives, resolues en temps reel sans cout perceptible.

**A retenir :** des qu'une couleur ou une valeur de design apparait 2 fois, **en faire une variable**.
        `,
      },
      objectives: [
        { id: "o2a", label: "Utiliser var(--color-primary) au moins 3 fois" },
        { id: "o2b", label: "Ne plus avoir de #00b8d4 en dur dans les regles" },
      ],
      missionIcon: "♻",
      missionTag: "PROTOCOLE 02",
      missionTtl: "REUTILISATION",
      bannerIcon: "♻",
      bannerTtl: "COULEUR CENTRALISEE",
      bannerSub: "Changer la valeur de la variable suffit pour repercuter partout.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Variables CSS</title>\n    <style>\n      :root { --color-primary: #00b8d4; }\n      body { background: #03060d; color: white; font-family: sans-serif; padding: 40px; }\n      .card { background: #0a1322; padding: 20px; margin: 12px; border-radius: 4px; }\n      .card-warning { background: #0a1322; padding: 20px; margin: 12px; border-radius: 4px; border-left: 4px solid orange; }\n      \n    </style>\n  </head>\n  <body>\n    <div class="card">Carte standard</div>\n    <div class="card-warning">Carte d\'alerte</div>\n  </body>\n</html>',
      placeholder: "/* Ajoute --space-md et --radius et utilise-les */",
      narrator:
        "Ajoute deux variables --space-md (16px) et --radius (4px) sur :root, et remplace les paddings et border-radius des cartes par var(...).",
      hint: "Sur :root : --space-md: 16px; --radius: 4px;\nSur .card et .card-warning : padding: var(--space-md); border-radius: var(--radius);",
      briefing: {
        title: "Variables pour l'espacement et le rayon",
        content: `
### Au-dela des couleurs
Les variables ne sont pas reservees aux couleurs. **Espacements, rayons, tailles de police, durees d'animation** sont d'excellents candidats.

### Pattern "design tokens"
\`:root {\`
\`  /* Couleurs */\`
\`  --color-primary: #00b8d4;\`
\`  --color-bg: #03060d;\`
\`  --color-text: #fff;\`
\`  \`
\`  /* Espacements */\`
\`  --space-xs: 4px;\`
\`  --space-sm: 8px;\`
\`  --space-md: 16px;\`
\`  --space-lg: 32px;\`
\`  \`
\`  /* Rayons */\`
\`  --radius-sm: 3px;\`
\`  --radius-md: 6px;\`
\`  --radius-pill: 999px;\`
\`  \`
\`  /* Animations */\`
\`  --transition-fast: 0.15s ease;\`
\`}\`

### Pourquoi nommer par taille (sm/md/lg) plutot que valeur (16/32) ?
Si demain tu decides que ton "medium" passe de 16 a 18 px, tu changes UNE variable. Si tu nommais --space-16, il faudrait aussi renommer la variable.

**A retenir :** un bon nommage de variables suit l'**intention**, pas la valeur.
        `,
      },
      objectives: [
        { id: "o3a", label: "Definir --space-md (ou similaire)" },
        { id: "o3b", label: "Utiliser var() pour padding ou border-radius" },
      ],
      missionIcon: "📐",
      missionTag: "PROTOCOLE 03",
      missionTtl: "TOKENS DE DESIGN",
      bannerIcon: "📐",
      bannerTtl: "SYSTEME COHERENT",
      bannerSub: "Espacements et rayons sont partages.",
      bannerXp: "⚡ +60 XP",
    },
    {
      startCode:
        '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Variables CSS</title>\n    <style>\n      :root {\n        --color-primary: #00b8d4;\n        --color-bg: #03060d;\n        --color-text: #ffffff;\n      }\n      body { background: var(--color-bg); color: var(--color-text); font-family: sans-serif; padding: 40px; }\n      .panel { background: #0a1322; padding: 20px; }\n      \n    </style>\n  </head>\n  <body>\n    <div class="panel">Panneau de bord</div>\n  </body>\n</html>',
      placeholder: "/* Cree un theme clair sur [data-theme=light] */",
      narrator:
        "Cree un theme clair en redefinissant --color-bg en blanc et --color-text en noir, dans un selecteur [data-theme=\"light\"]. Le panneau changera automatiquement sans toucher au reste du CSS.",
      hint: '[data-theme="light"] { --color-bg: #ffffff; --color-text: #000000; }',
      briefing: {
        title: "Theming via les variables",
        content: `
### Le plus beau cas d'usage
Les variables CSS shinent dans le **theming**. Un theme = un set de variables redefinies dans un selecteur.

### Pattern
\`:root {\`
\`  /* theme par defaut (sombre) */\`
\`  --color-bg: #03060d;\`
\`  --color-text: #ffffff;\`
\`}\`

\`[data-theme="light"] {\`
\`  --color-bg: #ffffff;\`
\`  --color-text: #000000;\`
\`}\`

### Activer le theme
\`<html data-theme="light">\`

Ou via JS :
\`document.documentElement.dataset.theme = "light";\`

### Avantages
- **Zero refactor CSS** : seules les variables changent.
- **Transition possible** : ajoute transition: background 0.3s sur body pour un fondu doux entre themes.
- **Multi-themes triviaux** : --theme-dark, --theme-light, --theme-sepia...

### Cas plus avance
Un site peut detecter automatiquement la preference systeme :
\`@media (prefers-color-scheme: light) {\`
\`  :root {\`
\`    --color-bg: #fff;\`
\`    --color-text: #000;\`
\`  }\`
\`}\`

**A retenir :** une fois ton design system extrait en variables, ajouter un dark/light mode prend 10 minutes.
        `,
      },
      objectives: [
        { id: "o4a", label: 'Cibler [data-theme="light"] (ou similaire)' },
        { id: "o4b", label: "Redefinir --color-bg ou --color-text" },
      ],
      missionIcon: "🌗",
      missionTag: "PROTOCOLE 04",
      missionTtl: "THEME ALTERNATIF",
      bannerIcon: "🌗",
      bannerTtl: "DESIGN SYSTEM COMPLET",
      bannerSub: "Tu maitrises les variables CSS pour theming et maintenance.",
      bannerXp: "⚡ +60 XP",
    },
  ],
};
