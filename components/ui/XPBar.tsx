"use client";

interface XPBarProps {
  xp: number;
  maxXp: number;
}

export default function XPBar({ xp, maxXp }: XPBarProps) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="font-tech text-[11px] text-nebula-cyan tracking-wider">XP</span>
      <div className="w-[110px] h-2.5 bg-nebula-bg-mid border border-nebula-border relative overflow-hidden rounded-sm">
        <div
          className="h-full bg-gradient-to-r from-nebula-cyan to-[#00FF88] shadow-[0_0_8px_rgba(0,240,255,0.4)] transition-[width] duration-700"
          style={{
            width: `${(xp / maxXp) * 100}%`,
            transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)",
          }}
        />
      </div>
      <span className="font-tech text-[11px] text-nebula-green min-w-[58px]">
        {xp} / {maxXp}
      </span>
      <div className="font-tech text-[10px] px-2 py-0.5 border border-nebula-cyan-dim text-nebula-cyan bg-nebula-cyan-faint rounded-sm">
        LVL 1
      </div>
    </div>
  );
}
