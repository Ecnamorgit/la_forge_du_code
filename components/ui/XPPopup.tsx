interface XPPopupProps {
  show: boolean;
  label: string;
}

export default function XPPopup({ show, label }: XPPopupProps) {
  if (!show) return null;

  return (
    <div className="pointer-events-none fixed right-7 top-[70px] z-[300] flex items-center gap-2.5 rounded-sm border border-nebula-cyan bg-nebula-bg-panel px-5 py-3 font-tech text-sm tracking-wider text-nebula-cyan shadow-[0_0_28px_rgba(0,240,255,0.2)] animate-slide-down-in">
      âš¡ {label}
    </div>
  );
}
