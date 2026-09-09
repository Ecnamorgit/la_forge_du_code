import type { ChapterData } from "@/data/courses/html/types";

export const chapitre4: ChapterData = {
  slug: "chapitre-4",
  tag: "MISSION : CARTOGRAPHIE STELLAIRE",
  title: "REACT ROUTER &\nNAVIGATION",
  subtitle: "Cree une vraie SPA avec plusieurs pages",
  totalXp: 280,
  completionBadge: "🗺",
  completionBadgeLabel: "NAVIGATEUR SPATIAL",
  steps: [
    {
      startCode:
        "// Importe BrowserRouter, Routes, Route depuis 'react-router-dom'.\n// Cree une App qui affiche :\n//   - Accueil sur '/'\n//   - APropos sur '/about'\n// Les deux composants existent deja.\nfunction Accueil() { return <h1>Accueil</h1>; }\nfunction APropos() { return <h1>A propos</h1>; }\n\nfunction App() {\n  return <div>...</div>;\n}\n",
      placeholder: "// <BrowserRouter><Routes><Route path='...' element={...} /></Routes></BrowserRouter>",
      narrator:
        "Une Single Page Application affiche différentes vues sans recharger le navigateur. React Router transforme l'URL en variable d'état : chaque chemin correspond a un composant. Cree ta première carte de navigation.",
      hint: "import { BrowserRouter, Routes, Route } from 'react-router-dom';\n\nfunction Accueil() { return <h1>Accueil</h1>; }\nfunction APropos() { return <h1>À propos</h1>; }\n\nfunction App() {\n  return (\n    <BrowserRouter>\n      <Routes>\n        <Route path='/' element={<Accueil />} />\n        <Route path='/about' element={<APropos />} />\n      </Routes>\n    </BrowserRouter>\n  );\n}",
      briefing: {
        title: "Setup du routeur",
        content: `
### Installation
\`npm install react-router-dom\`

C'est la bibliotheque de routing standard de l'ecosysteme React.

### Les trois composants de base
- **BrowserRouter** : englobe toute ton application, active le routing
- **Routes** : conteneur pour la liste des routes
- **Route** : une règle "ce chemin -> ce composant"

\`<BrowserRouter>\`
\`  <Routes>\`
\`    <Route path='/' element={<Accueil />} />\`
\`    <Route path='/about' element={<APropos />} />\`
\`  </Routes>\`
\`</BrowserRouter>\`

### path et élément
- \`path\` : le chemin URL à matcher
- \`element\` : le composant à afficher (entre accolades, JSX)

### Le wildcard 404
\`<Route path='*' element={<NotFound />} />\` -> capture tout ce qui ne matche pas les autres routes. À placer en DERNIER.

### SPA vs Multi-Page App
Une SPA charge le JS une seule fois. La navigation change UNIQUEMENT l'URL et le composant affiche, sans rechargement complet. C'est rapide, fluide, et c'est ce qui rend les apps modernes confortables.

**À retenir :** BrowserRouter englobe l'app, Routes liste les règles, Route mappe chemin -> composant.
        `,
      },
      objectives: [
        { id: "o1a", label: "Englober dans <BrowserRouter>" },
        { id: "o1b", label: "Définir deux <Route> avec path et élément" },
      ],
      missionIcon: "🗺",
      missionTag: "PROTOCOLE 01",
      missionTtl: "PREMIÈRE CARTE",
      bannerIcon: "🗺",
      bannerTtl: "ROUTES ACTIVES",
      bannerSub: "Ton application répond à deux URLs différentes.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        "// Ajoute un menu de navigation en haut de l'App.\n// Deux liens : 'Accueil' (vers '/') et 'A propos' (vers '/about').\n// IMPORTANT : utilise <Link>, PAS <a href=...>.\n",
      placeholder: "// <Link to='...'>Texte</Link>",
      narrator:
        "Les balises <a> classiques rechargent toute la page et detruisent l'état de ton app. React Router fournit <Link> : même apparence, mais navigation SPA sans rechargement.",
      hint: "import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';\n\nfunction App() {\n  return (\n    <BrowserRouter>\n      <nav>\n        <Link to='/'>Accueil</Link>\n        {' | '}\n        <Link to='/about'>À propos</Link>\n      </nav>\n      <Routes>\n        <Route path='/' element={<Accueil />} />\n        <Route path='/about' element={<APropos />} />\n      </Routes>\n    </BrowserRouter>\n  );\n}",
      briefing: {
        title: "Navigation avec <Link>",
        content: `
### Le piège classique
\`<a href='/about'>A propos</a>\` -> recharge ENTIEREMENT la page.

Résultat : l'app perd tout son état React, refait tous les fetchs, le user voit un flash blanc. C'est exactement ce qu'une SPA cherche à éviter.

### La solution : <Link>
\`<Link to='/about'>A propos</Link>\` -> modifie l'URL et le composant, sans rechargement.

Visuellement c'est un \`<a>\` (tu peux le styler comme tel), mais le comportement est intercepte par React Router.

### NavLink : pour le menu actif
\`<NavLink to='/about'>A propos</NavLink>\`

NavLink ajoute automatiquement la classe \`active\` quand l'URL match. Très utile pour styler le lien courant.

\`<NavLink\`
\`  to='/about'\`
\`  className={({ isActive }) => isActive ? 'on' : ''}\`
\`>...</NavLink>\`

### Layout partage
Souvent, le menu reste affiche sur toutes les pages. Pour ne pas le repeter, on utilise un **layout** avec un composant \`<Outlet />\` ou la route imbriquee s'affiche. C'est l'étape suivante quand tu auras plus de pages.

**À retenir :** Toujours <Link to=...> dans une SPA. Jamais <a href=...> pour la navigation interne.
        `,
      },
      objectives: [
        { id: "o2a", label: "Importer Link depuis react-router-dom" },
        { id: "o2b", label: "Ajouter deux <Link to='...'> dans un <nav>" },
      ],
      missionIcon: "🧭",
      missionTag: "PROTOCOLE 02",
      missionTtl: "LIENS SPA",
      bannerIcon: "🧭",
      bannerTtl: "NAVIGATION FLUIDE",
      bannerSub: "Tes liens ne rechargent plus la page.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Ajoute une route '/vaisseaux/:id' qui affiche le composant FicheVaisseau.\n// FicheVaisseau doit lire l'id depuis l'URL avec useParams et l'afficher.\nfunction FicheVaisseau() {\n  return <div>Vaisseau : ???</div>;\n}\n",
      placeholder: "// const { id } = useParams();",
      narrator:
        "Les vraies applications ont des pages dynamiques : '/vaisseau/42', '/profil/lia'... Avec une route parametree et le hook useParams, tu accedes à la valeur de l'URL depuis le composant.",
      hint: "import { useParams } from 'react-router-dom';\n\nfunction FicheVaisseau() {\n  const { id } = useParams();\n  return <div>Vaisseau : {id}</div>;\n}\n\n// Dans App :\n// <Route path='/vaisseaux/:id' element={<FicheVaisseau />} />",
      briefing: {
        title: "Routes dynamiques et useParams",
        content: `
### Le \`:\` magique
\`<Route path='/vaisseaux/:id' element={<Fiche />} />\`

Le segment \`:id\` est dynamique. Toute URL comme \`/vaisseaux/1\`, \`/vaisseaux/abc\`, \`/vaisseaux/phoenix\` match cette route.

### Le hook useParams
À l'intérieur du composant cible, on recupere les params :
\`const { id } = useParams();\`

Pareil qu'avec Express côté serveur — même convention.

### Plusieurs params
\`path='/flotte/:flotteId/vaisseau/:vaisseauId'\`
\`const { flotteId, vaisseauId } = useParams();\`

### Combiner avec un fetch
Le pattern le plus commun : lire l'id, fetcher la ressource correspondante :

\`function Fiche() {\`
\`  const { id } = useParams();\`
\`  const [data, setData] = useState(null);\`
\`  useEffect(() => {\`
\`    fetch('/api/vaisseaux/' + id).then(r => r.json()).then(setData);\`
\`  }, [id]);  // attention : id dans les deps !\`
\`  if (!data) return <div>Chargement...</div>;\`
\`  return <div>{data.nom}</div>;\`
\`}\`

### useSearchParams pour les ?query
Pour les filtres dans l'URL (\`/vaisseaux?classe=combat\`) :
\`const [searchParams] = useSearchParams();\`
\`const classe = searchParams.get('classe');\`

**À retenir :** :param dans la route + useParams() dans le composant = pages dynamiques type-safe.
        `,
      },
      objectives: [
        { id: "o3a", label: "Définir une route avec :id" },
        { id: "o3b", label: "Lire l'id avec useParams et l'afficher" },
      ],
      missionIcon: "🎯",
      missionTag: "PROTOCOLE 03",
      missionTtl: "ROUTES DYNAMIQUES",
      bannerIcon: "🎯",
      bannerTtl: "URL DECODEE",
      bannerSub: "Tes pages s'adaptent au contenu demande dans l'URL.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Composant Login : un bouton 'Se connecter'.\n// Au clic, redirige programmatiquement vers '/dashboard'.\n// Indice : useNavigate.\nfunction Login() {\n  return <button>Se connecter</button>;\n}\n",
      placeholder: "// const navigate = useNavigate(); navigate('/dashboard');",
      narrator:
        "Tous les changements de page ne viennent pas d'un clic sur un Link. Après un login, un formulaire, ou une action API, tu dois rediriger l'utilisateur via du code. Le hook useNavigate est fait pour ca.",
      hint: "import { useNavigate } from 'react-router-dom';\n\nfunction Login() {\n  const navigate = useNavigate();\n  return (\n    <button onClick={() => navigate('/dashboard')}>\n      Se connecter\n    </button>\n  );\n}",
      briefing: {
        title: "Navigation programmatique",
        content: `
### Le hook useNavigate
\`const navigate = useNavigate();\`

\`navigate\` est une fonction qui change l'URL. Équivalent code de \`<Link>\`.

### Usages courants
\`navigate('/dashboard');\` -> redirige
\`navigate(-1);\` -> retour arriere (comme bouton Back du navigateur)
\`navigate(1);\` -> avancer
\`navigate('/login', { replace: true });\` -> remplace l'historique (utile après logout pour que Back ne revienne pas)

### Après une action async
\`async function onSubmit() {\`
\`  await api.creerVaisseau(data);\`
\`  navigate('/vaisseaux');  // redirige apres succes\`
\`}\`

### Protection de route
Pour rediriger un utilisateur non connecte vers \`/login\` :

\`function RouteProtegee({ children }) {\`
\`  const { user } = useAuth();\`
\`  if (!user) return <Navigate to='/login' replace />;\`
\`  return children;\`
\`}\`

\`<Route path='/dashboard' element={<RouteProtegee><Dashboard /></RouteProtegee>} />\`

### Le composant <Navigate>
Alternative declarative a \`navigate()\` :
\`if (!data) return <Navigate to='/404' />;\`

Plus lisible dans certains cas, surtout pour les redirections conditionnelles dans le rendu.

### Les autres hooks utiles
- **useLocation** : info sur l'URL courante (pathname, search, state)
- **useSearchParams** : lire et modifier les ?query
- **useMatch** : tester si l'URL match un pattern

**À retenir :** useNavigate pour rediriger via code. Navigate (composant) pour les redirections conditionnelles dans le rendu.
        `,
      },
      objectives: [
        { id: "o4a", label: "Importer et utiliser useNavigate" },
        { id: "o4b", label: "Rediriger vers /dashboard au clic" },
      ],
      missionIcon: "🚀",
      missionTag: "PROTOCOLE 04",
      missionTtl: "NAVIGATION CODE",
      bannerIcon: "🗺",
      bannerTtl: "SPA MAÎTRISÉE",
      bannerSub: "Tu controles entierement la navigation de ton application.",
      bannerXp: "⚡ +75 XP",
    },
  ],
};
