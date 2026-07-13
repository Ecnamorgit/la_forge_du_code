# Spec — Réconcilier la bible §3 avec les cours (tâche 4)

> Rédigé le 2026-07-13. Réécrit la section §3 de la bible narrative pour qu'elle
> documente fidèlement les métaphores réellement employées par les cours livrés,
> au lieu d'un mapping incomplet et sur-militarisé qui les contredit.
> Source : [analyse_coherence_modules.md](../../analyse_coherence_modules.md) (fracture #4).
> Décision validée : **la bible suit les cours** (les cours = source de vérité).

## 1. Objectif

Transformer [conception_storytelling.md](../../conception_storytelling.md) §3
« Intégration Pédagogique du Storytelling » en une **carte de vérité
`concept → métaphore de jeu`**, complète et fidèle aux cours HTML/CSS/JS livrés.
Cela résout la contradiction bible↔cours sans toucher une seule ligne de cours.

## 2. Décisions validées

- **Sens** : la bible suit les cours. Aucun fichier de cours n'est modifié.
- **Ton** : ingénierie/dock (on retire « action militaire », « Boucliers et
  Armement », « tourelles », « mines magnétiques », « chasseurs d'attaque »).
- **Couverture** : tous les chapitres des 3 cursus complets (HTML 8, CSS 10, JS 12).
- **Hors périmètre** : les cursus « aperçu » (SQL, etc.) ; les autres sections de
  la bible (§1 « Académie Militaire », §2, §4) — chantiers distincts si souhaité.

## 3. Contenu cible du nouveau §3

Format : une phrase d'intro reformulée, puis **3 sous-sections** (une par cursus),
chacune avec un titre non-militarisé et un tableau `concept → métaphore` dérivé du
cours. Les métaphores ci-dessous sont extraites des `tag`/`subtitle`/`narrator`/
`briefing` réels (relevés à l'audit).

**Intro** : « Chaque technologie enseignée correspond à un **geste d'ingénierie ou de
survie** sur la station : » (au lieu de « action militaire ou de survie »).

### 📡 Cursus HTML — Reconstruction du Dock d'Orbite
| Concept | Métaphore de jeu (cours) |
|---|---|
| `<!DOCTYPE>` / `<html>` (ch1) | Poser les fondations et sceller l'enceinte de la base |
| `<a href>` (ch2) | Ouvrir une passerelle de transmission (canal interne/externe) |
| `<img>` (ch3) | Brancher un capteur visuel / caméra de la soute |
| Listes `<ul>/<li>` (ch4) | Dresser l'inventaire de la soute |
| Formulaires `<form>/<label>/<input>` (ch5) | Enregistrer et cataloguer les cargaisons |
| `<header>/<main>/<footer>` + ARIA (ch6) | Structurer les compartiments de la console (accessibles à tous) |
| Méta `lang`/`charset`/`viewport` (ch7) | Régler la fréquence de l'en-tête de transmission |
| `<video>` (ch8) | Connecter le retour vidéo de surveillance |

### 🎨 Cursus CSS — Console Graphique du Dock
| Concept | Métaphore de jeu (cours) |
|---|---|
| Balise `<style>` (ch1) | Brancher la console graphique du dock |
| Sélecteurs / classes / couleur (ch2) | Cibler un module et régler la palette tactique |
| Box model `width`/`height` (ch3) | Réserver le volume des modules pressurisés |
| Flexbox (ch4) | Aligner les vaisseaux en formation dans le hangar |
| Grid (ch5) | Tracer la carte tactique (cartographie stellaire) |
| `position` (ch6) | Verrouiller l'ancrage orbital d'un module |
| Pseudo-classes `:hover`/`:focus` (ch7) | Donner des signes de vie aux consoles réactives |
| Responsive `max-width`/media (ch8) | Adapter l'affichage aux terminaux de l'équipage |
| Transitions / animations (ch9) | Adoucir la dynamique visuelle du dock |
| Variables CSS (ch10) | Centraliser la « peau de nébuleuse » (design réutilisable) |

### ⚡ Cursus JavaScript — Automatisation des Systèmes
| Concept | Métaphore de jeu (cours) |
|---|---|
| `console.log` / variables (ch1) | Émettre le premier signal radio |
| Opérateurs & conditions (ch2) | Calcul tactique et prise de décision |
| Fonctions (ch3) | Encapsuler des modules de commande réutilisables |
| Tableaux & boucles (ch4) | Tenir et parcourir l'inventaire tactique |
| Objets & méthodes (ch5) | Structurer les registres (fiches de vaisseau) |
| `map`/`filter`/`reduce` (ch6) | Traiter les données de la flotte en masse |
| DOM (ch7) | Manipuler la console physique de la station |
| Événements (ch8) | Tenir un poste de garde qui réagit aux signaux |
| Promises / async (ch9) | Gérer les communications longue distance |
| `localStorage` (ch10) | Graver la mémoire de bord persistante |
| `fetch` (ch11) | Établir la liaison satellite avec le central |
| API REST / verbes HTTP (ch12) | Respecter les protocoles de la flotte |

### Sous-titres à reformuler
- « Cursus HTML : Reconstruction Structurelle » → « Cursus HTML — Reconstruction du Dock d'Orbite »
- « Cursus CSS : Boucliers et Armement » → « Cursus CSS — Console Graphique du Dock »
- « Cursus JavaScript : Automatisation des Systèmes » → conservé (déjà fidèle).

## 4. Fichier touché
- `docs/conception_storytelling.md` — **uniquement la section §3** (lignes ~40-68). Le
  reste du document est inchangé.

## 5. Vérification
- Le §3 ne contient plus les termes militarisés bannis : `militaire`, `armement`,
  `Boucliers` (comme titre de section), `tourelle`, `mines magnétiques`, `chasseurs d'attaque`.
- Chaque cursus complet a une ligne par chapitre livré (HTML 8, CSS 10, JS 12).
- Markdown valide (tables bien formées) ; le reste du fichier intact (diff limité à §3).

## 6. Critères d'acceptation
- [ ] §3 est une carte `concept → métaphore` couvrant tous les chapitres HTML/CSS/JS livrés.
- [ ] Ton ingénierie ; plus aucun terme militarisé banni dans §3.
- [ ] Aucun fichier de cours modifié.
- [ ] Sous-titres HTML et CSS reformulés ; intro « geste d'ingénierie ou de survie ».
