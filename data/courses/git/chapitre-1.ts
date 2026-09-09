import type { ChapterData } from "@/data/courses/html/types";

export const chapitre1: ChapterData = {
  slug: "chapitre-1",
  tag: "MISSION : JOURNAL DE BORD",
  title: "GIT &\nVERSIONS",
  subtitle: "Trace, sauvegarde et collabore sur ton code",
  totalXp: 280,
  completionBadge: "🗂",
  completionBadgeLabel: "ARCHIVISTE DU CODE",
  steps: [
    {
      startCode:
        "# Initialise un depot Git dans le dossier courant.\n# Ajoute tous les fichiers a la zone de staging.\n# Cree le premier commit avec le message 'Initial commit'.\n",
      placeholder: "# git init / git add . / git commit -m \"...\"",
      narrator:
        "Tout projet professionnel commence par un depot Git. Cet outil enregistre chaque modification de ton code dans un journal de bord, te permettant de revenir en arriere et de collaborer. Pose les fondations.",
      hint: "git init\ngit add .\ngit commit -m \"Initial commit\"",
      briefing: {
        title: "Les trois zones de Git",
        content: `
### git init
Cree un dossier cache \`.git\` qui contient tout l'historique. C'est la racine de ton journal.

### Les trois zones
Git sépare ton travail en trois espaces distincts :

1. **Working directory** : tes fichiers tels que tu les modifies
2. **Staging area (index)** : la liste des changements PRETS a être enregistres
3. **Repository** : l'historique des commits

\`Working --[git add]--> Staging --[git commit]--> Repository\`

### git add
Sélectionne ce qui ira dans le prochain commit. \`git add .\` ajoute tout, \`git add fichier.js\` cible un seul fichier.

### git commit
Photographie l'état de la staging area. Le message (\`-m\`) décrit ce qui change. Un bon commit = un changement coherent + un message clair.

\`git commit -m "Ajoute la mission radar"\`

**À retenir :** Modifie -> ajoute (add) -> grave (commit). Trois étapes, trois zones.
        `,
      },
      objectives: [
        { id: "o1a", label: "Lancer git init dans le projet" },
        { id: "o1b", label: "Stager les fichiers et créer le premier commit" },
      ],
      missionIcon: "🗂",
      missionTag: "PROTOCOLE 01",
      missionTtl: "PREMIER COMMIT",
      bannerIcon: "🗂",
      bannerTtl: "DEPOT INITIALISE",
      bannerSub: "Ton journal de bord est ouvert. Toute modification sera tracee.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        "# Tu viens de modifier deux fichiers.\n# 1. Affiche l'etat actuel (fichiers modifies, stages, non suivis).\n# 2. Affiche l'historique compact des commits.\n",
      placeholder: "# git status / git log --oneline",
      narrator:
        "Avant de commiter, un bon developpeur inspecte toujours l'état du depot. Apprends a lire le statut courant et à consulter l'historique pour savoir ou tu en es.",
      hint: "git status\ngit log --oneline",
      briefing: {
        title: "Inspecter le depot",
        content: `
### git status
Te dit en permanence :
- Quels fichiers sont MODIFIES mais pas encore ajoutes (rouge)
- Quels fichiers sont STAGES (vert)
- Quels fichiers ne sont PAS SUIVIS (untracked)

C'est la commande que tu vas taper le plus souvent dans ta carriere. Littéralement.

### git log
Affiche l'historique complet des commits. Très verbeux par défaut. Les options utiles :

\`git log --oneline\` -> une ligne par commit
\`git log --graph\` -> ajoute un graphique des branches
\`git log -5\` -> seulement les 5 derniers commits

### git diff
Bonus : affiche les modifications précises ligne par ligne, AVANT de commiter.
\`git diff\` -> changements non stages
\`git diff --staged\` -> changements stages prets à commiter

### Le .gitignore
Liste les fichiers que Git doit IGNORER (node_modules, .env, fichiers builds...). Cree un fichier \`.gitignore\` à la racine du projet. C'est obligatoire pour tout projet propre.

**À retenir :** \`status\` avant chaque action. \`log\` pour le passe. \`diff\` pour le present.
        `,
      },
      objectives: [
        { id: "o2a", label: "Utiliser git status pour voir l'état" },
        { id: "o2b", label: "Consulter l'historique avec git log --oneline" },
      ],
      missionIcon: "🔍",
      missionTag: "PROTOCOLE 02",
      missionTtl: "INSPECTION",
      bannerIcon: "🔍",
      bannerTtl: "ÉTAT DECRYPTE",
      bannerSub: "Tu sais lire le statut et l'historique du depot.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "# Cree une branche 'feature/radar' et bascule dessus.\n# Apres avoir fait tes commits, reviens sur main et fusionne la branche.\n",
      placeholder: "# git checkout -b ... / git merge ...",
      narrator:
        "Les branches permettent de développer plusieurs fonctionnalités en parallele sans casser la version stable. Cree une branche feature, travaille dessus, puis fusionne-la dans main.",
      hint: "git checkout -b feature/radar\n# ... travail et commits ...\ngit checkout main\ngit merge feature/radar",
      briefing: {
        title: "Branches et fusion",
        content: `
### Qu'est-ce qu'une branche ?
Une branche est une ligne de developpement parallele. Chaque commit que tu fais sur une branche reste isole de \`main\` jusqu'a la fusion.

### Créer et basculer
\`git branch feature/radar\` -> cree la branche
\`git checkout feature/radar\` -> bascule dessus
\`git checkout -b feature/radar\` -> les deux en une commande (raccourci classique)

Alternative moderne : \`git switch feature/radar\` et \`git switch -c feature/radar\`.

### Convention de nommage
- \`feature/xxx\` -> nouvelle fonctionnalite
- \`fix/xxx\` -> correction de bug
- \`refactor/xxx\` -> reorganisation sans changement de comportement

### git merge
Fusionne les commits d'une autre branche dans la branche courante.
1. \`git checkout main\` (la branche qui REÇOIT)
2. \`git merge feature/radar\` (la branche qui DONNE)

### Les conflits
Si deux branches modifient la même ligne, Git ne peut pas décider tout seul. Il ouvre le fichier avec des marqueurs \`<<<<<<<\` et te demande de choisir. C'est normal, ca arrive à tout le monde.

**À retenir :** Une fonctionnalite = une branche. Ne jamais coder directement sur main.
        `,
      },
      objectives: [
        { id: "o3a", label: "Créer et basculer sur une branche feature" },
        { id: "o3b", label: "Revenir sur main et fusionner avec git merge" },
      ],
      missionIcon: "🌿",
      missionTag: "PROTOCOLE 03",
      missionTtl: "BRANCHES",
      bannerIcon: "🌿",
      bannerTtl: "FUSION REUSSIE",
      bannerSub: "Ta branche feature est integree à la base stable.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "# Lie ton depot local a un depot distant sur GitHub.\n# URL : https://github.com/cadet/codeforge.git\n# Puis pousse la branche main vers le serveur.\n",
      placeholder: "# git remote add origin ... / git push -u origin main",
      narrator:
        "Ton depot local doit être sauvegarde et partage. Connecte-le a un serveur distant (GitHub, GitLab) et envoie ton historique pour que toute l'équipe puisse y accéder.",
      hint: "git remote add origin https://github.com/cadet/codeforge.git\ngit push -u origin main",
      briefing: {
        title: "Travailler avec un remote",
        content: `
### Qu'est-ce qu'un remote ?
Un "remote" est une copie distante de ton depot, hebergee sur un serveur (GitHub, GitLab, Bitbucket). Par convention, il s'appelle \`origin\`.

### Configurer le remote
\`git remote add origin https://github.com/user/repo.git\`

Tu peux vérifier avec \`git remote -v\`.

### git push
Envoie tes commits LOCAUX vers le remote.
\`git push -u origin main\` -> la première fois (le \`-u\` memorise la liaison)
\`git push\` -> les fois suivantes

### git pull
Recupere les commits distants et les fusionne dans ta branche locale. A faire AVANT chaque \`push\` si tu travailles en équipe.

### git clone
Pour récupérer un projet existant depuis zéro :
\`git clone https://github.com/user/repo.git\`

### Le workflow complet en équipe
1. \`git pull\` -> récupérer les changements de l'équipe
2. Coder + \`git add\` + \`git commit\`
3. \`git pull\` (encore une fois pour être sur)
4. \`git push\` -> envoyer ton travail
5. Ouvrir une **Pull Request** sur GitHub pour faire reviser le code

**À retenir :** Local = ton brouillon. Remote = la source de verite partagee. Push pour partager, pull pour recevoir.
        `,
      },
      objectives: [
        { id: "o4a", label: "Ajouter un remote nomme origin" },
        { id: "o4b", label: "Pousser la branche main avec git push -u" },
      ],
      missionIcon: "🛰",
      missionTag: "PROTOCOLE 04",
      missionTtl: "REMOTE & PUSH",
      bannerIcon: "🗂",
      bannerTtl: "CODE PARTAGE",
      bannerSub: "Ton journal de bord est désormais accessible à toute la flotte.",
      bannerXp: "⚡ +75 XP",
    },
  ],
};
