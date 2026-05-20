interface HintBoxProps {
  show: boolean;
  html: string;
}

export default function HintBox({ show, html }: HintBoxProps) {
  if (!show) return null;

  return (
    <div className="fixed bottom-5 left-1/2 z-[250] w-[calc(100%-40px)] max-w-[460px] -translate-x-1/2 rounded-sm border border-l-2 border-l-nebula-cyan border-nebula-cyan-dim bg-nebula-bg-panel px-4 py-3 shadow-[0_0_20px_rgba(0,240,255,0.1)] animate-slide-up-in">
      <div className="mb-1.5 font-tech text-[10px] uppercase tracking-widest text-nebula-cyan">
        📡 Transmission d&apos;ARIA
      </div>
      <div
        className="font-body text-sm leading-relaxed text-nebula-text"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
