import type { ChapterData } from "@/data/courses/html/types";

export const chapitre2: ChapterData = {
  slug: "chapitre-2",
  tag: "MISSION : ANALYSE DES DONNEES",
  title: "OPERATIONS\n& DECISIONS",
  subtitle: "Calculs, comparaisons et structures de decision",
  totalXp: 200,
  completionBadge: "🧮",
  completionBadgeLabel: "ANALYSTE TACTIQUE",
  steps: [
    {
      startCode:
        "const carburant = 80;\nconst consommation = 12;\n// Affiche le carburant restant apres deux heures\n",
      placeholder: "// Utilise les operateurs arithmetiques",
      narrator:
        "Premier calcul tactique. Soustrais deux heures de consommation au carburant et affiche le resultat.",
      hint:
        "Ecris : console.log(carburant - consommation * 2); — la multiplication est faite avant la soustraction.",
      briefing: {
        title: "Les operateurs arithmetiques",
        content: `
### Les operateurs principaux
- **+** addition
- **-** soustraction
- **\\*** multiplication
- **/** division
- **%** modulo (reste de la division)

### Priorite
JS respecte la priorite usuelle : **\\*** et **/** avant **+** et **-**.
Pour forcer l'ordre, utilise des parentheses : \`(a + b) * c\`.

### Exemple
\`const total = (10 + 5) * 2; // 30\`

**Mission :** calcule **carburant - consommation * 2** et logue le resultat (qui doit valoir 56).
        `,
      },
      objectives: [
        { id: "o1a", label: "Utiliser une operation arithmetique" },
        { id: "o1b", label: "Afficher le bon resultat (56)" },
      ],
      missionIcon: "➗",
      missionTag: "PROTOCOLE 01",
      missionTtl: "PREMIER CALCUL",
      bannerIcon: "🧮",
      bannerTtl: "CALCUL CONFIRME",
      bannerSub: "Le rapport de consommation est exact.",
      bannerXp: "⚡ +50 XP",
    },
    {
      startCode:
        "const niveauOxygene = 35;\n// Affiche true si le niveau est superieur a 50, sinon false\n",
      placeholder: "// Utilise un operateur de comparaison",
      narrator:
        "On veut savoir si l'oxygene est suffisant. Une comparaison renvoie **true** ou **false** — c'est ce qu'on appelle un booleen.",
      hint: "Ecris : console.log(niveauOxygene > 50);",
      briefing: {
        title: "Comparaisons et booleens",
        content: `
### Les operateurs de comparaison
- **>** strictement superieur
- **<** strictement inferieur
- **>=** superieur ou egal
- **<=** inferieur ou egal
- **===** strictement egal (recommande)
- **!==** strictement different

### Ce qu'ils retournent
Toujours un **booleen** : true ou false.

### Exemple
\`const enAlerte = niveauOxygene < 40; // true\`

**Astuce :** preferer **===** a **==** evite des pieges (\`"5" == 5\` est true mais \`"5" === 5\` est false).

**Mission :** affiche le resultat de **niveauOxygene > 50** (doit afficher \`false\` ici).
        `,
      },
      objectives: [
        { id: "o2a", label: "Utiliser un operateur de comparaison" },
        { id: "o2b", label: "Afficher false dans ce contexte" },
      ],
      missionIcon: "⚖",
      missionTag: "PROTOCOLE 02",
      missionTtl: "TEST BOOLEEN",
      bannerIcon: "✅",
      bannerTtl: "VERDICT TRANCHE",
      bannerSub: "Tu sais comparer deux valeurs.",
      bannerXp: "⚡ +50 XP",
    },
    {
      startCode:
        'const niveauBouclier = 25;\n// Si le bouclier est sous 30, affiche "ALERTE", sinon "OK"\n',
      placeholder: "// Utilise if / else",
      narrator:
        "L'equipage doit etre prevenu si le bouclier est trop bas. Implemente une condition.",
      hint:
        'Utilise : if (niveauBouclier < 30) { console.log("ALERTE"); } else { console.log("OK"); }',
      briefing: {
        title: "Conditions : if / else",
        content: `
### Syntaxe
\`if (condition) {\`
\`  // execute si vrai\`
\`} else {\`
\`  // execute sinon\`
\`}\`

### Exemple
\`if (carburant <= 0) {\`
\`  console.log("Plus de carburant !");\`
\`} else {\`
\`  console.log("Continuer la mission");\`
\`}\`

### A retenir
- La **condition** est evaluee comme un booleen.
- Les **accolades** \`{ ... }\` regroupent les instructions a executer.
- **else** est optionnel.

**Mission :** affiche \`"ALERTE"\` si le bouclier est sous 30, sinon \`"OK"\`.
        `,
      },
      objectives: [
        { id: "o3a", label: "Utiliser un if / else" },
        { id: "o3b", label: 'Afficher "ALERTE" ici (bouclier = 25)' },
      ],
      missionIcon: "🛡",
      missionTag: "PROTOCOLE 03",
      missionTtl: "CONDITIONS DE VOL",
      bannerIcon: "🚨",
      bannerTtl: "REPONSE ADAPTEE",
      bannerSub: "Le systeme reagit selon l'etat du bouclier.",
      bannerXp: "⚡ +50 XP",
    },
    {
      startCode:
        'const temperature = 72;\n// 3 zones : sous 20 -> "FROID", entre 20 et 80 -> "OK", au-dessus -> "CRITIQUE"\n',
      placeholder: "// Utilise if / else if / else",
      narrator:
        "Trois zones de temperature a gerer. Empile plusieurs conditions avec **else if**.",
      hint:
        'Utilise : if (t < 20) { ... } else if (t <= 80) { ... } else { ... }',
      briefing: {
        title: "Plusieurs branches : else if",
        content: `
### Chainer les conditions
\`if (t < 20) {\`
\`  console.log("FROID");\`
\`} else if (t <= 80) {\`
\`  console.log("OK");\`
\`} else {\`
\`  console.log("CRITIQUE");\`
\`}\`

### Ordre important
JS teste les conditions **dans l'ordre** et s'arrete a la premiere vraie. Place donc les plus specifiques d'abord.

### Plus tard
Pour beaucoup de cas, on utilise **switch** ou des objets de correspondance — pour l'instant, **if/else if/else** suffit.

**Mission :** ici t = 72, le programme doit afficher \`"OK"\`.
        `,
      },
      objectives: [
        { id: "o4a", label: "Utiliser au moins un else if" },
        { id: "o4b", label: 'Afficher "OK" pour t = 72' },
      ],
      missionIcon: "🌡",
      missionTag: "PROTOCOLE 04",
      missionTtl: "TROIS ZONES",
      bannerIcon: "🧭",
      bannerTtl: "CLASSIFICATION FINE",
      bannerSub: "Le systeme distingue trois etats distincts.",
      bannerXp: "⚡ +50 XP",
    },
  ],
};
