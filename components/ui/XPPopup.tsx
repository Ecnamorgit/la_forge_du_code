interface XPPopupProps {
  show: boolean;
  label: string;
  /**
   * Décale la pastille vers le bas quand elle s'affiche en même temps que le
   * popup XP principal (ordre accompli, badge de conduite, message de liaison).
   */
  secondary?: boolean;
}

export default function XPPopup({ show, label, secondary }: XPPopupProps) {
  if (!show) return null;

  return (
    <div
      className={`pointer-events-none fixed right-7 z-[300] flex max-w-[min(340px,calc(100vw-3.5rem))] items-center gap-2.5 rounded-sm border border-nebula-cyan bg-nebula-bg-panel px-5 py-3 font-tech text-sm tracking-wider text-nebula-cyan shadow-[0_0_28px_rgba(0,240,255,0.2)] animate-slide-down-in ${
        secondary ? "top-[132px]" : "top-[70px]"
      }`}
    >
      ⚡ {label}
    </div>
  );
}
