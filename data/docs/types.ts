export interface DocExample {
  code: string;
  caption?: string;
}

export interface DocEntry {
  /** Identifiant stable, ex. "html/doctype". */
  id: string;
  /** Domaine, ex. "html". */
  domain: string;
  /** Terme affiché par défaut dans un lien inline, ex. "<!DOCTYPE html>". */
  term: string;
  /** Titre de la fiche. */
  title: string;
  /** Résumé en une phrase (aperçu / cluster). */
  summary: string;
  /** Corps en markdown maison (même parser que le briefing). */
  body: string;
  /** Bloc syntaxe optionnel. */
  syntax?: string;
  /** Exemples optionnels. */
  examples?: DocExample[];
  /** Pièges courants. */
  pitfalls?: string[];
  /** Autres fiches liées (ids). */
  related?: string[];
  /** Lien externe optionnel vers la doc officielle. */
  official?: { label: string; url: string };
}
