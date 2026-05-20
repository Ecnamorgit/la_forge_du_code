import Link from "next/link";

interface StatsCardProps {
  username: string;
  level: number;
  totalXp: number;
  rank: string;
  badges: number;
  streak: number;
}

export default function StatsCard({
  username,
  level,
  totalXp,
  rank,
  badges,
  streak,
}: StatsCardProps) {
  return (
    <aside className="rounded-sm border border-nebula-border/80 bg-nebula-bg-panel/85 p-6 shadow-[0_0_30px_rgba(0,240,255,0.06)] backdrop-blur-md">
      {/* Avatar + name */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="relative mb-3">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-nebula-cyan bg-nebula-bg-darkest font-tech text-3xl font-bold text-nebula-cyan shadow-[0_0_24px_rgba(0,240,255,0.25)]">
            {username.slice(0, 1).toUpperCase()}
          </div>
          <div className="absolute -bottom-1 -right-1 rounded-sm border border-nebula-orange bg-nebula-bg-darkest px-1.5 py-0.5 font-tech text-[10px] uppercase tracking-widest text-nebula-orange">
            LV {level}
          </div>
        </div>
        <div className="font-tech text-lg tracking-wider text-nebula-cyan">
          @{username}
        </div>
        <Link
          href="/profil"
          className="mt-1 font-tech text-[11px] uppercase tracking-widest text-nebula-text-secondary transition-colors hover:text-nebula-cyan"
        >
          Modifier
        </Link>
      </div>

      {/* Stats grid 2x2 */}
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Total XP" value={totalXp} accent="cyan" />
        <Stat label="Rang" value={rank} accent="orange" />
        <Stat label="Badges" value={badges} accent="blue" />
        <Stat label="Streak" value={`${streak}j`} accent="green" />
      </div>

      {/* CTA */}
      <Link
        href="/profil"
        className="mt-6 block rounded-sm border border-nebula-cyan-dim bg-transparent px-4 py-2.5 text-center font-tech text-xs uppercase tracking-widest text-nebula-cyan transition-all hover:border-nebula-cyan hover:bg-nebula-cyan-faint"
      >
        Voir le profil →
      </Link>
    </aside>
  );
}

const ACCENTS: Record<string, { border: string; text: string }> = {
  cyan: { border: "border-nebula-cyan/40", text: "text-nebula-cyan" },
  orange: { border: "border-nebula-orange/40", text: "text-nebula-orange" },
  blue: { border: "border-nebula-blue/40", text: "text-nebula-blue" },
  green: { border: "border-nebula-green-dim", text: "text-nebula-green" },
};

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent: keyof typeof ACCENTS;
}) {
  const a = ACCENTS[accent];
  return (
    <div
      className={`rounded-sm border ${a.border} bg-nebula-bg-darkest/50 px-3 py-2.5`}
    >
      <div className={`font-tech text-xl font-bold ${a.text}`}>{value}</div>
      <div className="font-tech text-[10px] uppercase tracking-widest text-nebula-text-dim">
        {label}
      </div>
    </div>
  );
}
