"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import BrandLogo from "@/components/ui/BrandLogo";
import AvatarBadge from "@/components/avatar/AvatarBadge";
import { useUser } from "@/lib/use-user";

interface DashboardNavProps {
  userName: string;
}

export default function DashboardNav({ userName }: DashboardNavProps) {
  const { data: session } = useSession();
  const { state } = useUser();
  const displayName = session?.user?.username || userName;

  return (
    <header className="relative z-50 flex h-16 items-center justify-between border-b border-nebula-border/70 bg-nebula-bg-darkest/80 px-4 backdrop-blur-md lg:px-6">
      <Link href="/dashboard" className="flex items-center gap-3 transition-opacity hover:opacity-80">
        <BrandLogo size={40} />
        <div className="hidden font-tech text-base tracking-widest sm:block">
          <span className="text-nebula-cyan">NEBULA</span>
          <span className="ml-1 text-nebula-text-secondary">COMMAND</span>
        </div>
      </Link>

      <nav className="flex items-center gap-4 lg:gap-8">
        <Link
          href="/learn"
          className="font-tech text-xs uppercase tracking-widest text-nebula-text-secondary transition-colors hover:text-nebula-cyan lg:text-sm"
        >
          Cursus
        </Link>
        <Link
          href="/leaderboard"
          className="font-tech text-xs uppercase tracking-widest text-nebula-text-secondary transition-colors hover:text-nebula-cyan lg:text-sm"
        >
          Classement
        </Link>
        <span className="hidden font-tech text-xs uppercase tracking-widest text-nebula-text-dim cursor-not-allowed lg:inline lg:text-sm">
          Pratique
        </span>
      </nav>

      <div className="flex items-center gap-2 lg:gap-3">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="hidden font-tech text-xs uppercase tracking-widest text-nebula-text-dim transition-colors hover:text-nebula-red sm:inline"
        >
          Déconnexion
        </button>
        <Link
          href="/profil"
          className="block rounded-full transition-all hover:scale-105"
          aria-label={`Profil de ${displayName}`}
        >
          {state.species ? (
            <AvatarBadge
              species={state.species}
              uniformColor={state.uniformColor}
              size={40}
            />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-nebula-cyan/50 bg-nebula-bg-panel/70 font-tech text-sm font-bold uppercase tracking-widest text-nebula-cyan hover:border-nebula-cyan hover:shadow-[0_0_10px_rgba(0,240,255,0.3)]">
              {displayName.slice(0, 1).toUpperCase()}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
