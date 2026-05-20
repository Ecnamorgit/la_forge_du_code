"use client";

interface HPBarProps {
  currentStep: number;
}

export default function HPBar({ currentStep }: HPBarProps) {
  const pct = 25 + currentStep * 25;

  return (
    <div className="px-4 py-2 pb-3 border-b border-nebula-border bg-nebula-bg-dark shrink-0">
      <div className="font-tech text-[10px] text-nebula-text-dim tracking-widest mb-1.5 flex justify-between uppercase">
        <span>Intégrité du bouclier</span>
        <span className="text-nebula-cyan">{pct}%</span>
      </div>
      <div className="h-2 bg-nebula-bg-mid border border-nebula-border rounded-sm overflow-hidden">
        <div
          className="h-full transition-[width] duration-1000 ease-in-out rounded-sm"
          style={{
            width: `${pct}%`,
            background: pct <= 25
              ? "linear-gradient(90deg, #FF2D55, #FF6B2C)"
              : pct <= 50
                ? "linear-gradient(90deg, #FF6B2C, #FFB800)"
                : "linear-gradient(90deg, #00F0FF, #00FF88)",
            boxShadow: pct <= 25
              ? "0 0 8px rgba(255,45,85,0.4)"
              : pct <= 50
                ? "0 0 8px rgba(255,107,44,0.4)"
                : "0 0 8px rgba(0,240,255,0.4)",
          }}
        />
      </div>
    </div>
  );
}
