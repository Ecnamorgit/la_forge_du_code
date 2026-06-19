# Original User Request

## Initial Request — 2026-06-18T15:12:38+02:00

Concevoir un dossier complet d'architecture conceptuelle, de conformité légale et d'intégration pédagogique pour intégrer les documentations de référence (ex: MDN, Python, SQLBolt) au sein des capsules d'exercices de CodeForge, sans codage de l'application.

Working directory: c:/Users/joan7/Desktop/projet fil rouge/codeforge/docs/research_docs_integration
Integrity mode: development

## Requirements

### R1. Analyse de Conformité Légale (Licences et Droit d'Auteur)
L'équipe doit analyser les contraintes juridiques liées à l'intégration ou à l'affichage des documentations officielles de chacun des 14 domaines d'étude de CodeForge. L'étude doit couvrir les licences applicables (Creative Commons, MIT, etc.), l'autorisation de mise en iFrame (en-têtes HTTP X-Frame-Options/CSP) et les droits de citation/reproduction de contenu.

### R2. Conception UX/UI et Pédagogie (Capsules d'Apprentissage)
L'équipe doit concevoir une intégration visuelle et pédagogique des documentations à côté de l'éditeur de code (Monaco). L'objectif est d'aider l'étudiant à apprendre en autonomie sans surcharger son espace de travail (ex: écran partagé, infobulles, recherche contextuelle intégrée).

### R3. Architecture Technique et Faisabilité
L'équipe doit proposer plusieurs scénarios techniques d'intégration (ex: iFrame direct, requêtes API vers des agrégateurs comme DevDocs.io, stockage local hors-ligne, ou scraping légal) avec une analyse comparative de faisabilité.

## Acceptance Criteria

### Rapports et Livrables
- [ ] Un fichier principal `integration_study.md` rédigé en Markdown contenant l'analyse complète.
- [ ] Une **matrice de conformité légale** sous forme de tableau Markdown recouvrant les 14 documentations associées aux cursus (HTML, CSS, JS, React, TS, Git, SQL, Node, Tests, DevOps, MongoDB, Sécurité, Python, Algo). Pour chaque doc : licence, possibilité d'iFrame (oui/non/partiel), et stratégie légale d'intégration préconisée.
- [ ] Au moins **deux schémas d'interface UX/UI en Mermaid** illustrant l'intégration de la doc dans le workspace étudiant (ex: vue bureau avec volet latéral, et vue mobile/split-screen).
- [ ] Un **schéma d'architecture technique en Mermaid** illustrant le flux d'échange de données entre le navigateur de l'étudiant, le serveur CodeForge et la source de documentation.
- [ ] Une analyse comparative des options techniques (iFrames, APIs tierces, Hébergement local) détaillant les avantages, inconvénients et risques (ex: maintenance, temps de chargement, coupure réseau).
