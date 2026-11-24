import type { ChapterData } from "@/data/courses/html/types";

export const chapter3: ChapterData = {
  slug: "chapitre-3",
  tag: "MISSION : PLANS DE CONSTRUCTION",
  title: "PLANS DE\nCONSTRUCTION",
  subtitle: "Structs, méthodes, enums et match : modéliser la flotte",
  totalXp: 164,
  completionBadge: "📐",
  completionBadgeLabel: "ARCHITECTE NAVAL",
  steps: [
    {
      startCode: `// Définis la struct Vaisseau avec deux champs :
//   nom : String
//   coque : u32

fn main() {
    // Crée un Vaisseau nommé "Aurore" avec 100 de coque,
    // puis affiche son nom et sa coque
}
`,
      placeholder: "// struct Vaisseau { nom: String, coque: u32 }",
      narrator:
        "La forge tourne, la mémoire est sûre. Il est temps de dessiner des plans : une struct regroupe sous un même nom tout ce qui décrit un vaisseau.",
      hint: `struct Vaisseau {
    nom: String,
    coque: u32,
}

fn main() {
    let aurore = Vaisseau {
        nom: String::from("Aurore"),
        coque: 100,
    };
    println!("{} : coque {}", aurore.nom, aurore.coque);
}`,
      briefing: {
        title: "Structs : regrouper des données",
        content: `
### Définir
Une **struct** décrit la forme d'une donnée : des champs nommés, chacun avec son type.

\`struct Vaisseau { nom: String, coque: u32 }\`

Par convention, le nom d'une struct s'écrit en **PascalCase**, ses champs en **snake_case**.

### Instancier
\`let aurore = Vaisseau { nom: String::from("Aurore"), coque: 100 };\`

Tous les champs sont obligatoires : oublier \`coque\` est une erreur de compilation. Aucun champ ne reste à moitié initialisé.

### Lire un champ
\`aurore.nom\`, \`aurore.coque\`

### Modifier un champ
L'instance entière doit être déclarée \`let mut\`. Rust ne permet pas de rendre un seul champ mutable.

### String::from
Le champ \`nom\` est une \`String\` (texte possédé) : la struct est **propriétaire** de son nom, et le libère avec elle.

**Mission :** définis \`Vaisseau\`, crée l'Aurore avec 100 de coque, puis affiche ses deux champs.
        `,
      },
      objectives: [
        { id: "o1a", label: "Définir la struct Vaisseau" },
        { id: "o1b", label: "Créer une instance et lire ses champs" },
      ],
      missionIcon: "📐",
      missionTag: "PROTOCOLE 01",
      missionTtl: "PREMIER PLAN",
      bannerIcon: "📐",
      bannerTtl: "PLAN TRACÉ",
      bannerSub: "L'Aurore existe : ses données tiennent en une seule pièce.",
      bannerXp: "⚡ +41 XP",
    },
    {
      startCode: `struct Vaisseau {
    nom: String,
    coque: u32,
}

// Ajoute un bloc impl Vaisseau avec :
//   - new(nom: &str) -> Self : crée un vaisseau avec 100 de coque
//   - est_operationnel(&self) -> bool : vrai si coque > 50

fn main() {
    // Crée un vaisseau avec Vaisseau::new("Aurore")
    // et affiche son nom et est_operationnel()
}
`,
      placeholder: "// impl Vaisseau { fn new(...) -> Self { ... } }",
      narrator:
        "Un plan ne vole pas tout seul. Le bloc impl attache des comportements à ta struct : un constructeur pour la bâtir, des méthodes pour l'interroger.",
      hint: `struct Vaisseau {
    nom: String,
    coque: u32,
}

impl Vaisseau {
    fn new(nom: &str) -> Self {
        Vaisseau { nom: String::from(nom), coque: 100 }
    }

    fn est_operationnel(&self) -> bool {
        self.coque > 50
    }
}

fn main() {
    let aurore = Vaisseau::new("Aurore");
    println!("{} opérationnel : {}", aurore.nom, aurore.est_operationnel());
}`,
      briefing: {
        title: "impl : méthodes et constructeur",
        content: `
### Le bloc impl
\`impl Vaisseau { ... }\` regroupe les fonctions liées à la struct.

### Fonction associée : le constructeur
\`fn new(nom: &str) -> Self\`

- pas de \`self\` en paramètre : elle s'appelle sur le **type**, avec \`Vaisseau::new("Aurore")\`
- \`Self\` est un raccourci pour le type du bloc, ici \`Vaisseau\`
- \`new\` est une convention, pas un mot-clé

### Méthode : avec &self
\`fn est_operationnel(&self) -> bool\`

- \`&self\` **emprunte** l'instance en lecture : la méthode ne la consomme pas
- on l'appelle avec un point : \`aurore.est_operationnel()\`
- dans le corps, \`self.coque\` lit le champ

### Les trois formes de self
- \`&self\` : lecture seule (le plus courant)
- \`&mut self\` : la méthode modifie l'instance
- \`self\` : la méthode consomme l'instance, inutilisable ensuite

La loi de propriété s'applique aussi aux méthodes.

**Mission :** ajoute le bloc \`impl\` avec \`new\` et \`est_operationnel\`, puis utilise-les dans \`main\`.
        `,
      },
      objectives: [
        { id: "o2a", label: "Écrire un constructeur new qui renvoie Self" },
        { id: "o2b", label: "Écrire et appeler une méthode avec &self" },
      ],
      missionIcon: "⚙",
      missionTag: "PROTOCOLE 02",
      missionTtl: "MISE EN SERVICE",
      bannerIcon: "⚙",
      bannerTtl: "VAISSEAU ARMÉ",
      bannerSub: "Ton plan sait se construire et répondre de son état.",
      bannerXp: "⚡ +41 XP",
    },
    {
      startCode: `// Définis l'enum Etat avec trois variantes : Amarre, EnVol, EnPanne
//
// Écris signaler(etat: Etat) avec un match qui affiche :
//   Amarre  -> "Vaisseau à quai"
//   EnVol   -> "Vaisseau en vol"
//   EnPanne -> "Vaisseau en panne"

fn main() {
    // Appelle signaler(Etat::EnVol)
}
`,
      placeholder: "// enum Etat { Amarre, EnVol, EnPanne }",
      narrator:
        "Un vaisseau est à quai, en vol ou en panne : jamais deux à la fois, jamais autre chose. Un enum liste les cas possibles, et match oblige à tous les traiter.",
      hint: `enum Etat {
    Amarre,
    EnVol,
    EnPanne,
}

fn signaler(etat: Etat) {
    match etat {
        Etat::Amarre => println!("Vaisseau à quai"),
        Etat::EnVol => println!("Vaisseau en vol"),
        Etat::EnPanne => println!("Vaisseau en panne"),
    }
}

fn main() {
    signaler(Etat::EnVol);
}`,
      briefing: {
        title: "Enums et match exhaustif",
        content: `
### Un enum : une liste fermée de cas
\`enum Etat { Amarre, EnVol, EnPanne }\`

Une valeur de type \`Etat\` est **exactement une** de ces variantes. On les écrit \`Etat::EnVol\`.

Plus de texte libre comme \`"en vol"\` ou \`"envol"\` : une faute de frappe devient une erreur de compilation.

### match : traiter chaque cas
\`match etat { Etat::Amarre => ..., Etat::EnVol => ..., Etat::EnPanne => ... }\`

- chaque **bras** associe un motif à une action, avec \`=>\`
- les bras sont séparés par des virgules

### L'exhaustivité
Le compilateur exige que **tous** les cas soient couverts. Si un jour tu ajoutes la variante \`EnReparation\`, chaque \`match\` incomplet refusera de compiler : impossible d'oublier un cas.

Le motif \`_\` attrape tout le reste, mais il désactive cette protection. Ici, écris les trois bras.

**À retenir :** un enum ferme la liste des possibles, \`match\` garantit qu'aucun n'est oublié.

**Mission :** définis \`Etat\`, écris \`signaler\` avec un bras par variante, puis signale un vaisseau en vol.
        `,
      },
      objectives: [
        { id: "o3a", label: "Définir un enum à trois variantes" },
        { id: "o3b", label: "Couvrir chaque variante dans un match" },
      ],
      missionIcon: "🚦",
      missionTag: "PROTOCOLE 03",
      missionTtl: "ÉTATS DE VOL",
      bannerIcon: "🚦",
      bannerTtl: "TOUS LES CAS COUVERTS",
      bannerSub: "Aucun état de vol ne peut plus t'échapper.",
      bannerXp: "⚡ +41 XP",
    },
    {
      startCode: `// Définis l'enum Ordre :
//   Decoller              (sans donnée)
//   Viser(u32)            (un cap en degrés)
//   Transmettre(String)   (un message)
//
// Écris executer(ordre: Ordre) avec un match
// qui affiche la donnée portée par chaque variante

fn main() {
    // Exécute Ordre::Viser(90)
    // puis Ordre::Transmettre(String::from("Forge prête"))
}
`,
      placeholder: "// enum Ordre { Decoller, Viser(u32), Transmettre(String) }",
      narrator:
        "Les ordres de la flotte ne se ressemblent pas : viser demande un cap, transmettre demande un message. En Rust, chaque variante transporte ses propres données.",
      hint: `enum Ordre {
    Decoller,
    Viser(u32),
    Transmettre(String),
}

fn executer(ordre: Ordre) {
    match ordre {
        Ordre::Decoller => println!("Décollage"),
        Ordre::Viser(cap) => println!("Cap sur {} degrés", cap),
        Ordre::Transmettre(message) => println!("Message : {}", message),
    }
}

fn main() {
    executer(Ordre::Viser(90));
    executer(Ordre::Transmettre(String::from("Forge prête")));
}`,
      briefing: {
        title: "Variantes avec données",
        content: `
### Chaque variante porte ce qu'il lui faut
\`enum Ordre { Decoller, Viser(u32), Transmettre(String) }\`

- \`Decoller\` ne porte rien
- \`Viser(u32)\` porte un cap
- \`Transmettre(String)\` porte un message

Une valeur \`Ordre\` est une seule de ces variantes, avec **ses** données et pas celles des autres. Un cap sans ordre de visée, ça ne peut pas s'écrire.

### Créer
\`Ordre::Viser(90)\`
\`Ordre::Transmettre(String::from("Forge prête"))\`

### Déstructurer dans le match
\`Ordre::Viser(cap) => println!("Cap sur {} degrés", cap),\`

Le motif \`Viser(cap)\` fait deux choses : il vérifie la variante **et** sort la donnée dans la variable \`cap\`, utilisable dans le bras.

### Pourquoi c'est puissant
Dans d'autres langages, on bricole un objet avec un champ \`type\` et des champs parfois vides. Ici, les états invalides sont **impossibles à représenter**. C'est le socle de \`Option\` et \`Result\`, au prochain chapitre.

**Mission :** définis \`Ordre\`, écris \`executer\`, puis donne l'ordre de viser à 90 degrés et de transmettre un message.
        `,
      },
      objectives: [
        { id: "o4a", label: "Définir des variantes qui portent des données" },
        { id: "o4b", label: "Extraire ces données dans les bras du match" },
      ],
      missionIcon: "📜",
      missionTag: "PROTOCOLE 04",
      missionTtl: "CARNET D'ORDRES",
      bannerIcon: "📜",
      bannerTtl: "FLOTTE MODÉLISÉE",
      bannerSub: "Tes plans rendent les états invalides impossibles.",
      bannerXp: "⚡ +41 XP",
    },
  ],
};
