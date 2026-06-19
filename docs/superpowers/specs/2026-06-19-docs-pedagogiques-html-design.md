# Spec — Docs pédagogiques contextuelles (pilote HTML)

- **Date** : 2026-06-19
- **Auteur** : Joan (+ Claude, brainstorming)
- **Statut** : Design validé, prêt pour le plan d'implémentation
- **Recherche source** : `docs/research_docs_integration/integration_study.md`

## 1. Objectif

Rendre le parcours plus pédagogique : quand un élève ne comprend pas la logique
d'un concept, il accède **en un clic** à une explication ciblée sur **son cas
précis** (ex. `<!DOCTYPE html>` → la fiche dédiée), à côté de son code.

But comportemental : que l'élève consulte **notre** doc plutôt que d'ouvrir un
assistant IA externe. La réponse doit donc être instantanée, en français, dans
l'univers du jeu, et pointue.

## 2. Décisions de conception

| Sujet | Décision | Raison |
| :--- | :--- | :--- |
| Contenu des fiches | **Clean-room** (rédigé par l'équipe), pas de doc officielle recopiée | Zéro charge légale ; français ; cohérent avec l'univers nebula |
| Lien officiel | Optionnel, en bas de fiche, ouvre un onglet | Lier ≠ reproduire → 100 % sûr, même pour sources NC (MongoDB, Pro Git) |
| Périmètre v1 | **HTML uniquement**, bout en bout | Prouver le mécanisme avant d'industrialiser les 13 autres domaines |
| Surface UI | **Panneau latéral coulissant** (slide-over desktop / drawer mobile), à la demande | Lecture à côté du code (anti split-attention) sans réécrire le layout |
| Déclencheurs | **Liens inline** dans le briefing **+** **cluster « Références de cette étape »** | Renvoi précis sur le mot + découverte des fiches pertinentes |
| Thème | **Nebula** (sombre, cyan/orange) | La recherche décrivait un thème menthe clair qui ne correspond PAS à l'app réelle |

## 3. Modèle de données

Bibliothèque de fiches **séparée** des chapitres (réutilisable entre
étapes/chapitres). Un chapitre *référence* des fiches par id ; il ne les
*contient* pas.

```
data/docs/
  types.ts            // interface DocEntry
  html/
    index.ts          // registre: Record<entryId, DocEntry>
    doctype.ts
    html-element.ts
    head.ts
    ...
```

```ts
interface DocEntry {
  id: string;            // "html/doctype"
  domain: string;        // "html"
  term: string;          // "<!DOCTYPE html>"  (texte par défaut du lien)
  title: string;         // "La déclaration de type de document"
  summary: string;       // 1 phrase (hover/aperçu)
  body: string;          // markdown maison (même parser que le briefing)
  syntax?: string;       // bloc syntaxe
  examples?: { code: string; caption?: string }[];
  pitfalls?: string[];   // pièges courants
  related?: string[];    // autres entryId ("html/html-element")
  official?: { label: string; url: string }; // lien externe optionnel
}
```

## 4. Mécanisme de lien (le « renvoi précis »)

### 4.a Liens inline
Token dans le markdown de briefing :

```
La déclaration [[doc:html/doctype|<!DOCTYPE html>]] dit au navigateur…
```

- `parseBriefing` (existant) est étendu pour transformer `[[doc:ID|texte]]` en
  un **chip cliquable** (style nebula-cyan, icône 📖) qui ouvre le panneau sur `ID`.
- `|texte` optionnel : si absent, on affiche le `term` de la fiche.

### 4.b Cluster par étape
Champ optionnel sur `Step` :

```ts
interface Step {
  // ...existant
  docRefs?: string[];   // ["html/doctype", "html/html-element"]
}
```

Rendu sous le briefing : bloc « 📖 RÉFÉRENCES DE CETTE ÉTAPE » listant les fiches
(term + summary), chacune ouvrant le panneau.

Les deux déclencheurs pointent vers le **même** registre.
**Rétro-compatible** : sans token ni `docRefs`, le rendu actuel est inchangé.

## 5. Le panneau coulissant (`DocPanel`)

Composant `components/docs/DocPanel.tsx`, monté une fois dans `ChapterClient`,
piloté par un état léger (`entryId` ouvert, ou `null`).

- **Desktop (≥ lg)** : glisse depuis la droite, ~380–420px, en overlay au-dessus
  du workspace (pas de réécriture du layout 2-zones). Le code reste visible.
- **Mobile (< lg)** : drawer depuis le bas (~85% hauteur), cohérent avec les
  onglets existants.
- **Ouverture/fermeture** : clic sur chip/réf → ouvre ; `Échap`, clic sur le
  voile, ou ✕ → ferme. Animation transform/opacity, respecte
  `prefers-reduced-motion`.
- **Contenu rendu** : `title` → `summary` → `body` → `syntax`/`examples` →
  `pitfalls` → chips `related` → footer d'attribution.
- **Markdown** : réutilise le **même parser** que le briefing. Le parser est
  factorisé depuis `ChapterClient` vers `lib/markdown.ts` (les deux l'utilisent).

### Hors périmètre v1 (YAGNI)
Double-clic mot-clé dans Monaco, recherche full-text, bouton « Try in editor ».
Ajouts ultérieurs sur le même socle.

## 6. Conformité légale & attribution

- `body` = contenu original → aucune obligation de licence sur la fiche.
- Notion issue d'une source CC-BY-SA → le **lien `official`** suffit (lier ≠
  reproduire). Sûr même pour les sources NC (MongoDB, Pro Git) plus tard.
- Footer générique par fiche : « Fiche de référence CodeForge — rédigée par
  l'équipe. Pour aller plus loin : [doc officielle] ».
- `official` ouvre dans un onglet (`target="_blank" rel="noopener noreferrer"`).

**Conclusion légale** : rien d'externe hébergé, rien mis en cache, aucun risque
pour un site commercial.

## 7. Livrables du pilote HTML

1. `data/docs/types.ts` + `data/docs/html/` avec **~6–8 fiches clés** du
   chapitre 1 : `doctype`, `html-element`, `head`, `title`, `body`, `meta`,
   `h1`, imbrication.
2. `lib/markdown.ts` : parser factorisé (extrait de `ChapterClient`) + support
   du token `[[doc:ID|texte]]`.
3. `components/docs/DocPanel.tsx` (slide-over/drawer) + `DocChip` (lien inline)
   + bloc « Références de cette étape ».
4. Câblage dans `ChapterClient` / workspace + champ `docRefs?` sur `Step`
   (`data/courses/html/types.ts`).
5. Annotation du **chapitre 1 HTML** (tokens inline + `docRefs`) comme
   démonstration vivante.

**Non inclus** : les 13 autres domaines, chapitres HTML 2–8 (mêmes moules
ensuite), Monaco hover, recherche.

## 8. Tests

- **Unitaires (vitest)** :
  - parser : `[[doc:ID|texte]]` → chip ; `term` par défaut si `|texte` absent ;
    échappement HTML préservé.
  - intégrité du registre : chaque `docRefs`, `related` et token inline pointe
    vers un id existant (garde-fou anti-lien-mort).
- **E2E (playwright)** sur le chapitre 1 HTML :
  - clic sur un chip → panneau ouvert avec la bonne fiche ;
  - `Échap` ferme ;
  - le cluster « Références » ouvre la bonne entrée.

## 9. Suite (hors v1)

Industrialisation : appliquer le même moule aux chapitres HTML 2–8 puis aux 13
autres domaines ; selon licence, certaines fiches pointeront vers un lien
externe plutôt qu'une fiche locale (MongoDB, Pro Git). Évolutions UI possibles :
hover Monaco, recherche full-text, « Try in editor ».
