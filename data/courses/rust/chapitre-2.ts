import type { ChapterData } from "@/data/courses/html/types";

export const chapter2: ChapterData = {
  slug: "chapitre-2",
  tag: "MISSION : LOI DE PROPRIÉTÉ",
  title: "LOI DE\nPROPRIÉTÉ",
  subtitle: "Ownership, emprunts et slices : la mémoire sans fuite",
  totalXp: 164,
  completionBadge: "🔑",
  completionBadgeLabel: "GARDIEN DE LA MÉMOIRE",
  steps: [
    {
      startCode: `fn main() {
    let plan = String::from("Coque Alpha");
    let copie = plan;
    println!("Plan original : {}", plan);
    println!("Copie : {}", copie);
}
`,
      spectreTrap:
        "J'ai déplacé ton plan, Cadet. La variable plan ne possède plus rien, et ton compilateur refuse de décoller. Rends-lui sa valeur... si tu comprends la loi.",
      placeholder: "// Répare le déplacement de plan",
      narrator:
        "Chaque valeur Rust a un seul propriétaire. Quand tu l'affectes à une autre variable, elle déménage : l'ancienne variable est vide.",
      hint: `fn main() {
    let plan = String::from("Coque Alpha");
    let copie = plan.clone();
    println!("Plan original : {}", plan);
    println!("Copie : {}", copie);
}`,
      briefing: {
        title: "Ownership : un seul propriétaire",
        content: `
### Les trois règles
- chaque valeur a **un propriétaire**
- il n'y en a **qu'un seul** à la fois
- quand le propriétaire sort de portée, la valeur est **libérée**

Pas de ramasse-miettes, pas de \`free\` à écrire : la mémoire est rendue au bon moment, à coup sûr.

### Le déplacement (move)
\`let copie = plan;\`

La \`String\` ne se duplique pas : elle **déménage** dans \`copie\`. Après cette ligne, \`plan\` n'est plus utilisable, et le compilateur répond :

\`error[E0382]: borrow of moved value: plan\`

C'est ce qui empêche deux variables de libérer deux fois la même mémoire.

### Deux réparations
- **Dupliquer** : \`let copie = plan.clone();\` crée une vraie copie, chacune a son propriétaire
- **Emprunter** : \`let copie = &plan;\` prête la valeur sans la céder (prochaine étape)

### Et les nombres ?
Les types simples (\`u32\`, \`bool\`, \`f64\`) sont **copiés** automatiquement : \`let b = a;\` laisse \`a\` intact.

**Mission :** le Spectre a provoqué un déplacement. Répare le code pour que \`plan\` et \`copie\` s'affichent tous les deux.
        `,
      },
      objectives: [
        { id: "o1a", label: "Repérer le déplacement de plan" },
        { id: "o1b", label: "Garder plan utilisable (clone ou emprunt)" },
      ],
      missionIcon: "🔑",
      missionTag: "PROTOCOLE 01",
      missionTtl: "PLAN DÉROBÉ",
      bannerIcon: "🔑",
      bannerTtl: "PROPRIÉTÉ RESTAURÉE",
      bannerSub: "Chaque valeur a de nouveau un propriétaire clair.",
      bannerXp: "⚡ +41 XP",
    },
    {
      startCode: `// Écris mesurer : elle emprunte un plan (&String)
// et renvoie sa longueur (usize) avec .len()

fn main() {
    let plan = String::from("Coque Alpha");
    // Appelle mesurer en prêtant plan, puis affiche plan ET sa longueur
}
`,
      placeholder: "// fn mesurer(plan: &String) -> usize",
      narrator:
        "Cloner tout le temps coûte cher. Mieux vaut prêter : la fonction consulte ton plan, puis te le rend intact.",
      hint: `fn mesurer(plan: &String) -> usize {
    plan.len()
}

fn main() {
    let plan = String::from("Coque Alpha");
    let longueur = mesurer(&plan);
    println!("{} mesure {} caractères", plan, longueur);
}`,
      briefing: {
        title: "Emprunter avec &",
        content: `
### Le problème
Passer une \`String\` à une fonction la **déplace** : après l'appel, tu ne l'as plus.

### La référence
Le symbole **&** crée une **référence** : un prêt en lecture seule.

- dans la signature : \`fn mesurer(plan: &String) -> usize\`
- à l'appel : \`mesurer(&plan)\`

La fonction lit la valeur, mais n'en devient pas propriétaire. À la fin de l'appel, le prêt se termine et \`plan\` est toujours à toi.

### Ce que le compilateur garantit
Une référence ne peut jamais **survivre** à la valeur qu'elle désigne. Le pointeur vers une zone déjà libérée, cause classique de pannes et de failles, n'existe pas en Rust.

### Autant de lecteurs qu'on veut
Tu peux créer plusieurs références \`&\` vers la même valeur en même temps : personne ne modifie, donc aucun conflit.

**À retenir :** \`&\` prête, sans céder.

**Mission :** écris \`mesurer\`, prête-lui \`plan\`, puis affiche le plan **et** sa longueur.
        `,
      },
      objectives: [
        { id: "o2a", label: "Déclarer un paramètre emprunté avec &" },
        { id: "o2b", label: "Prêter plan à l'appel et le réutiliser ensuite" },
      ],
      missionIcon: "🤝",
      missionTag: "PROTOCOLE 02",
      missionTtl: "PRÊT SOUS CONTRÔLE",
      bannerIcon: "🤝",
      bannerTtl: "EMPRUNT VALIDÉ",
      bannerSub: "Tu prêtes tes données sans jamais les perdre.",
      bannerXp: "⚡ +41 XP",
    },
    {
      startCode: `// Écris renforcer : elle emprunte une coque en mutable (&mut String)
// et lui ajoute " +blindage" avec push_str

fn main() {
    // Déclare coque (mutable) avec String::from("Coque Alpha"),
    // prête-la à renforcer, puis affiche-la
}
`,
      placeholder: "// fn renforcer(coque: &mut String)",
      narrator:
        "Lire ne suffit pas toujours : il faut parfois modifier la pièce prêtée. Rust l'autorise, à une condition stricte : un seul atelier y touche à la fois.",
      hint: `fn renforcer(coque: &mut String) {
    coque.push_str(" +blindage");
}

fn main() {
    let mut coque = String::from("Coque Alpha");
    renforcer(&mut coque);
    println!("{}", coque);
}`,
      briefing: {
        title: "Emprunt mutable : &mut",
        content: `
### Prêter pour modifier
Une référence \`&\` est en lecture seule. Pour modifier la valeur prêtée, il faut un **emprunt mutable** :

- la variable est déclarée \`let mut coque\`
- la signature demande \`coque: &mut String\`
- l'appel prête avec \`renforcer(&mut coque)\`

Le mot \`mut\` apparaît aux trois endroits : rien ne se modifie par surprise.

### La règle d'or
À un instant donné, pour une même valeur :
- **soit** autant de références \`&\` que tu veux
- **soit** une seule référence \`&mut\`

Jamais les deux. Deux ateliers ne peuvent donc pas marteler la même pièce en même temps : c'est ce qui élimine les **accès concurrents** dès la compilation.

### push_str
\`coque.push_str(" +blindage");\` ajoute du texte à la fin d'une \`String\`.

**À retenir :** plusieurs lecteurs **ou** un seul écrivain.

**Mission :** écris \`renforcer\`, prête-lui \`coque\` en mutable, puis affiche la coque renforcée.
        `,
      },
      objectives: [
        { id: "o3a", label: "Déclarer un paramètre &mut String" },
        { id: "o3b", label: "Prêter une variable mutable avec &mut" },
      ],
      missionIcon: "🛡",
      missionTag: "PROTOCOLE 03",
      missionTtl: "BLINDAGE",
      bannerIcon: "🛡",
      bannerTtl: "COQUE RENFORCÉE",
      bannerSub: "Un seul écrivain à la fois : aucune collision possible.",
      bannerXp: "⚡ +41 XP",
    },
    {
      startCode: `// Écris indicatif : elle reçoit un &str
// et renvoie ses 5 premiers octets sous forme de &str

fn main() {
    let nom = String::from("ALPHA-7 Forge orbitale");
    // Appelle indicatif(&nom) et affiche le résultat
}
`,
      placeholder: "// fn indicatif(nom: &str) -> &str",
      narrator:
        "Dernière pièce de la loi : la tranche. Une slice désigne un morceau d'une donnée sans rien copier. Le vaisseau ne porte que ce dont il a besoin.",
      hint: `fn indicatif(nom: &str) -> &str {
    &nom[0..5]
}

fn main() {
    let nom = String::from("ALPHA-7 Forge orbitale");
    println!("Indicatif : {}", indicatif(&nom));
}`,
      briefing: {
        title: "Slices et &str",
        content: `
### Une vue sur un morceau
Une **slice** est une référence vers une portion de données. Elle ne possède rien et ne copie rien.

\`&nom[0..5]\` désigne les octets 0 à 4 de \`nom\`.

- \`[0..5]\` : du début jusqu'à 5 exclu
- \`[..5]\` : même chose, en plus court
- \`[6..]\` : de 6 jusqu'à la fin

### String ou &str ?
- \`String\` : un texte **possédé**, modifiable, stocké sur le tas
- \`&str\` : une **vue** sur du texte, en lecture seule

Un texte littéral comme \`"titane"\` est déjà un \`&str\`.

### La bonne signature
Demande \`&str\` plutôt que \`&String\` dans tes paramètres : la fonction accepte alors les deux. \`indicatif(&nom)\` fonctionne car Rust convertit \`&String\` en \`&str\` tout seul.

### La slice reste liée à sa source
Tant que la slice existe, la \`String\` d'origine ne peut être ni modifiée ni détruite. Le compilateur le vérifie.

**À retenir :** une slice emprunte un morceau, sans copie.

**Mission :** écris \`indicatif\`, qui renvoie les 5 premiers octets du nom, puis affiche l'indicatif.
        `,
      },
      objectives: [
        { id: "o4a", label: "Recevoir et renvoyer un &str" },
        { id: "o4b", label: "Découper une slice avec [0..5]" },
      ],
      missionIcon: "✂",
      missionTag: "PROTOCOLE 04",
      missionTtl: "DÉCOUPE DE PRÉCISION",
      bannerIcon: "✂",
      bannerTtl: "LOI MAÎTRISÉE",
      bannerSub: "Propriété, emprunt, slice : ta mémoire est étanche.",
      bannerXp: "⚡ +41 XP",
    },
  ],
};
