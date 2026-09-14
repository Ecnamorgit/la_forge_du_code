import { CHARACTERS } from "@/lib/characters";

interface HintBoxProps {
  show: boolean;
  /**
   * Texte de l'indice, affiché tel quel. Beaucoup d'indices contiennent du code
   * HTML ou JSX à recopier : il doit se lire, jamais s'interpréter (constat
   * EXE-04 de l'audit de sécurité du 2026-09-12).
   */
  text: string;
}

export default function HintBox({ show, text }: HintBoxProps) {
  if (!show) return null;

  return (
    <div className="fixed bottom-5 left-1/2 z-[250] w-[calc(100%-40px)] max-w-[460px] -translate-x-1/2 rounded-sm border border-l-2 border-l-nebula-cyan border-nebula-cyan-dim bg-nebula-bg-panel px-4 py-3 shadow-[0_0_20px_rgba(0,240,255,0.1)] animate-slide-up-in">
      <div className="mb-1.5 font-tech text-[10px] uppercase tracking-widest text-nebula-cyan">
        {CHARACTERS.help.glyph} {CHARACTERS.help.name}
        <span className="terminal-cursor">_</span>
      </div>
      <div className="whitespace-pre-wrap break-words font-body text-sm leading-relaxed text-nebula-text">
        {text}
      </div>
    </div>
  );
}
