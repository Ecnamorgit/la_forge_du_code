const DOC_TOKEN_RE = /\[\[doc:([a-z0-9/-]+)(?:\|([^\]]+))?\]\]/g;

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Liste les ids de fiches référencés par des tokens [[doc:ID]] dans le contenu. */
export function extractDocTokenIds(content: string): string[] {
  const ids: string[] = [];
  for (const m of content.matchAll(DOC_TOKEN_RE)) ids.push(m[1]);
  return ids;
}

interface RenderOpts {
  resolveDocTerm?: (id: string) => string | undefined;
}

/**
 * Rend le markdown maison des leçons et des fiches.
 * Identique à l'ancien parseBriefing, plus le token [[doc:ID|texte]].
 */
export function renderLessonMarkdown(
  content: string,
  opts: RenderOpts = {}
): string {
  if (!content) return "";

  const escaped = escapeHtml(content);

  return escaped
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "";

      let formatted = line;

      // Token doc -> chip cliquable (avant gras/code, qui ne le touchent pas).
      formatted = formatted.replace(DOC_TOKEN_RE, (_full, id, label) => {
        const text =
          label != null ? label : escapeHtml(opts.resolveDocTerm?.(id) ?? id);
        return `<button type="button" data-doc-id="${id}" class="doc-chip inline-flex items-center gap-1 rounded-sm border border-nebula-cyan/40 bg-nebula-cyan-faint/30 px-1.5 py-0.5 align-baseline font-code text-xs text-nebula-cyan transition-colors hover:border-nebula-cyan hover:bg-nebula-cyan-faint/60">📖 ${text}</button>`;
      });

      formatted = formatted.replace(
        /`([^`]+)`/g,
        '<code class="bg-nebula-bg-editor px-1.5 py-0.5 rounded text-nebula-cyan font-code text-xs font-mono">$1</code>'
      );
      formatted = formatted.replace(
        /\*\*([^*]+)\*\*/g,
        '<strong class="text-nebula-orange font-bold">$1</strong>'
      );

      const finalTrimmed = formatted.trim();

      if (finalTrimmed.startsWith("### ")) {
        return `<h4 class="text-nebula-cyan font-tech text-lg mt-8 mb-4 tracking-widest uppercase border-b border-nebula-cyan/20 pb-2">${finalTrimmed.slice(4)}</h4>`;
      }

      if (finalTrimmed.startsWith("- ")) {
        return `<li class="ml-4 mb-3 text-nebula-text/85 list-none flex gap-2.5 text-base leading-relaxed"><span class="text-nebula-cyan shrink-0 mt-0.5">◈</span><span>${finalTrimmed.slice(2)}</span></li>`;
      }

      return `<p class="mb-5 last:mb-0 text-base leading-relaxed">${formatted}</p>`;
    })
    .join("");
}
