import type { ChapterData } from "@/data/courses/html/types";

export const chapitre1: ChapterData = {
  slug: "chapitre-1",
  tag: "MISSION : LANGAGE SERPENT",
  title: "PYTHON &\nFONDAMENTAUX",
  subtitle: "Apprends le langage le plus polyvalent de l'industrie",
  totalXp: 280,
  completionBadge: "🐍",
  completionBadgeLabel: "PROGRAMMEUR PYTHON",
  steps: [
    {
      startCode:
        "# Declare trois variables :\n#   nom    = 'Lia' (str)\n#   niveau = 5 (int)\n#   actif  = True (bool)\n# Affiche un message : 'Pilote Lia, niveau 5, actif: True'.\n# Utilise une f-string.\n",
      placeholder: "# print(f\"Pilote {nom}, niveau {niveau}, actif: {actif}\")",
      narrator:
        "Python est l'un des langages les plus utilises au monde : data science, AI, scripts, web (Django/FastAPI). Sa syntaxe est minimaliste — pas d'accolades, pas de point-virgules. L'indentation FAIT la structure du code.",
      hint: "nom = 'Lia'\nniveau = 5\nactif = True\nprint(f\"Pilote {nom}, niveau {niveau}, actif: {actif}\")",
      briefing: {
        title: "Variables, types et f-strings",
        content: `
### Pas de let / const / var
En Python, on déclare une variable juste en lui assignant une valeur :
\`nom = 'Lia'\`

L'inference de type fait tout. Pas besoin d'annotation (mais possible : \`nom: str = 'Lia'\`).

### Les types primitifs
- **str** : texte ('...' ou "...")
- **int** : entier (5, -42)
- **float** : decimal (3.14)
- **bool** : True / False (avec majuscule)
- **None** : équivalent de null/undefined

Vérifie avec \`type(variable)\`.

### print et f-strings
\`print()\` affiche dans la console.

Les **f-strings** sont l'équivalent des template literals JS :
\`print(f"Bonjour {nom}, tu as {age} ans")\`

Le \`f\` devant la string active l'interpolation.

### Indentation = structure
Pas d'accolades en Python. Les blocs sont définis par l'indentation (4 espaces par convention) :
\`if niveau >= 5:\`
\`    print("Senior")\`
\`else:\`
\`    print("Junior")\`

Mal indenter = erreur de syntaxe.

### Convention de nommage
- Variables et fonctions : \`snake_case\` (pas camelCase comme JS)
- Constantes : \`UPPER_CASE\`
- Classes : \`PascalCase\`

**À retenir :** Pas de declarations explicites. f-strings pour l'interpolation. Indentation = structure.
        `,
      },
      objectives: [
        { id: "o1a", label: "Déclarer trois variables typees implicitement" },
        { id: "o1b", label: "Utiliser une f-string pour le print" },
      ],
      missionIcon: "🐍",
      missionTag: "PROTOCOLE 01",
      missionTtl: "PREMIÈRES VARIABLES",
      bannerIcon: "🐍",
      bannerTtl: "PYTHON INITIALISE",
      bannerSub: "Tu maitrises la syntaxe de base de Python.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        "# Definis une fonction calculer_xp(niveau, bonus) qui retourne niveau * 10 + bonus.\n# Appelle-la avec niveau=5, bonus=20 et affiche le resultat.\n",
      placeholder: "# def calculer_xp(niveau, bonus):",
      narrator:
        "En Python, une fonction se déclare avec le mot-clé 'def'. Pas de parenthèses superflues, pas d'accolades. La logique reside dans l'indentation. Cree ta première fonction.",
      hint: "def calculer_xp(niveau, bonus):\n    return niveau * 10 + bonus\n\nresultat = calculer_xp(5, 20)\nprint(resultat)",
      briefing: {
        title: "Fonctions en Python",
        content: `
### La syntaxe def
\`def nom_fonction(param1, param2):\`
\`    return param1 + param2\`

- \`def\` déclare une fonction
- Les deux points \`:\` ouvrent le bloc
- L'indentation delimite le corps
- \`return\` rend une valeur (optionnel — sinon retourne None)

### Paramètres par défaut
\`def saluer(nom, formel=False):\`
\`    if formel:\`
\`        return f"Bonjour M. {nom}"\`
\`    return f"Salut {nom}"\`

### Arguments nommes (kwargs)
\`calculer_xp(niveau=5, bonus=20)\`
Très lisible quand il y a plusieurs paramètres.

### Annotations de type (optionnelles mais recommandees)
\`def calculer_xp(niveau: int, bonus: int) -> int:\`
\`    return niveau * 10 + bonus\`

Comme TypeScript pour JS, **mypy** est le typechecker pour Python.

### Lambdas (fonctions anonymes)
\`carre = lambda x: x * x\`
Plus limitees qu'en JS — une seule expression, pas de blocs.

### Docstrings
La première chaîne d'une fonction sert de documentation :
\`def calculer_xp(niveau, bonus):\`
\`    """Calcule l'XP a partir du niveau et d'un bonus."""\`
\`    return niveau * 10 + bonus\`

Outils comme \`help(calculer_xp)\` la lisent.

**À retenir :** def + : + indentation. Les annotations de type sont la voie pro.
        `,
      },
      objectives: [
        { id: "o2a", label: "Déclarer une fonction avec def" },
        { id: "o2b", label: "L'appeler et afficher le résultat" },
      ],
      missionIcon: "⚙",
      missionTag: "PROTOCOLE 02",
      missionTtl: "FONCTIONS",
      bannerIcon: "⚙",
      bannerTtl: "FONCTION CRÉÉE",
      bannerSub: "Tu sais structurer du code en fonctions Python.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "# Cree une liste 'pilotes' contenant : 'Lia', 'Max', 'Eva'.\n# Parcours la avec une boucle for et affiche : 'Pilote N°1 : Lia', etc.\n# Indice : utilise enumerate() pour avoir l'index.\n",
      placeholder: "# for i, nom in enumerate(pilotes): ...",
      narrator:
        "Les listes sont l'équivalent des tableaux JS. La boucle 'for' Python est plus elegante : elle itere directement sur les éléments, pas sur les index. enumerate() te donne les deux à la fois.",
      hint: "pilotes = ['Lia', 'Max', 'Eva']\nfor i, nom in enumerate(pilotes):\n    print(f\"Pilote N°{i + 1} : {nom}\")",
      briefing: {
        title: "Listes et boucles for",
        content: `
### Déclarer une liste
\`pilotes = ['Lia', 'Max', 'Eva']\`

Comme un Array JS. Accès par index : \`pilotes[0]\`, longueur : \`len(pilotes)\`.

### Méthodes utiles
- \`liste.append(x)\` -> ajoute à la fin (= push)
- \`liste.remove(x)\` -> supprime la PREMIÈRE occurrence
- \`liste.pop()\` -> retire et retourne le dernier
- \`liste.sort()\` -> tri en place
- \`sorted(liste)\` -> retourne une nouvelle liste triee
- \`x in liste\` -> teste l'appartenance

### La boucle for
Itere DIRECTEMENT sur les éléments :
\`for nom in pilotes:\`
\`    print(nom)\`

Pas besoin de \`for (i = 0; i < length; i++)\` comme en C/JS classique.

### enumerate pour l'index
\`for i, nom in enumerate(pilotes):\`
\`    print(i, nom)\`

### range pour des nombres
\`for i in range(10):\` -> 0 a 9
\`for i in range(5, 10):\` -> 5 a 9
\`for i in range(0, 100, 2):\` -> pairs de 0 a 98

### List comprehensions
LA fonctionnalité Python iconique. Écrit une boucle + map/filter en une ligne :

\`carres = [x * x for x in range(10)]\`
\`actifs = [p for p in pilotes if p.actif]\`

Beaucoup plus lisible qu'un map().filter() une fois habitue.

### while
Comme partout :
\`while compteur > 0:\`
\`    compteur -= 1\`

**À retenir :** Listes Python = arrays JS. for itere sur les éléments, pas les index. enumerate quand tu veux les deux.
        `,
      },
      objectives: [
        { id: "o3a", label: "Créer une liste et la parcourir avec for" },
        { id: "o3b", label: "Utiliser enumerate pour accéder à l'index" },
      ],
      missionIcon: "📋",
      missionTag: "PROTOCOLE 03",
      missionTtl: "LISTES & BOUCLES",
      bannerIcon: "📋",
      bannerTtl: "ITERATION MAÎTRISÉE",
      bannerSub: "Tu manipules les structures de base de Python.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "# Cree un dictionnaire 'pilote' avec :\n#   nom='Lia', niveau=5, vaisseau='Phoenix'\n# Affiche le niveau, puis ajoute un champ 'badge' = 'gold'.\n# Enfin, parcours et affiche toutes les paires cle:valeur.\n",
      placeholder: "# pilote = {'cle': valeur, ...} / for k, v in pilote.items():",
      narrator:
        "Le dictionnaire Python est l'équivalent des objets JS. Clé:valeur, structure souple, omnipresent. Comprendre ses méthodes est un passage oblige pour tout Pythoniste.",
      hint: "pilote = {\n    'nom': 'Lia',\n    'niveau': 5,\n    'vaisseau': 'Phoenix'\n}\n\nprint(pilote['niveau'])\n\npilote['badge'] = 'gold'\n\nfor clé, valeur in pilote.items():\n    print(f\"{clé}: {valeur}\")",
      briefing: {
        title: "Dictionnaires et au-dela",
        content: `
### Déclarer un dictionnaire
\`pilote = { 'nom': 'Lia', 'niveau': 5 }\`

Comme un objet JS, mais les clés sont entre quotes.

### Accéder, modifier, supprimer
\`pilote['nom']\` -> lecture (erreur si absent)
\`pilote.get('nom')\` -> lecture safe (None si absent)
\`pilote.get('nom', 'inconnu')\` -> avec valeur par défaut
\`pilote['badge'] = 'gold'\` -> ajout / modification
\`del pilote['niveau']\` -> suppression
\`'nom' in pilote\` -> teste l'existence

### Itérer
\`for cle in pilote:\` -> les clés
\`for valeur in pilote.values():\` -> les valeurs
\`for cle, valeur in pilote.items():\` -> les deux

### Dict comprehension
Comme les list comprehensions, mais pour dicts :
\`carres = { x: x*x for x in range(5) }\`

### Au-dela : la suite logique
- **Classes** : programmation orientee objet avec \`class\`
- **Modules** : organiser le code en fichiers, \`import module\`
- **pip** : installer des packages (\`pip install requests\`)
- **virtualenv** : isoler les dependances par projet
- **Frameworks web** : **Django** (full-featured), **FastAPI** (moderne, async, types-natifs)
- **Data** : **pandas**, **numpy**, **matplotlib** — le standard de la science des données
- **AI/ML** : **PyTorch**, **TensorFlow**, **scikit-learn**

### Python vs JavaScript pour les devs JS
- Python : plus lisible, ecosysteme data/IA enorme, moins rapide
- JS : meilleur pour le web full-stack, async natif, plus rapide en V8

Apprendre Python en complement de JS te rend embauchable dans 2x plus de roles.

**À retenir :** Dict = objet JS avec quotes sur les clés. .get() pour accéder safe, .items() pour itérer clé+valeur.
        `,
      },
      objectives: [
        { id: "o4a", label: "Créer un dictionnaire et lire une valeur" },
        { id: "o4b", label: "Ajouter une clé et itérer avec .items()" },
      ],
      missionIcon: "📚",
      missionTag: "PROTOCOLE 04",
      missionTtl: "DICTIONNAIRES",
      bannerIcon: "🐍",
      bannerTtl: "PYTHON OPÉRATIONNEL",
      bannerSub: "Tu peux désormais lire et écrire du Python idiomatique.",
      bannerXp: "⚡ +75 XP",
    },
  ],
};
