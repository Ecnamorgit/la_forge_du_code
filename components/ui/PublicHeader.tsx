import Link from "next/link";

import BrandLogo from "@/components/ui/BrandLogo";

/**
 * Header for the public pages (landing, codex). The shell and the brand block
 * are shared; each page passes its own actions as `children`.
 */
export default function PublicHeader({ children }: { children: React.ReactNode }) {
  return (
    <header className="relative z-50 flex h-16 items-center justify-between border-b border-nebula-border/70 bg-nebula-bg-darkest/80 px-4 backdrop-blur-md sm:px-6">
      {/* Below `sm`, the navigation takes up almost the full width: only the
          icon is shown, and the name is still announced via aria-label. */}
      <Link
        href="/"
        aria-label="La Forge du Code — accueil"
        className="flex min-w-0 items-center gap-2 sm:gap-3"
      >
        <BrandLogo size={40} />
        <div className="hidden font-tech tracking-widest sm:block sm:text-base">
          <span className="text-nebula-cyan">LA FORGE</span>
          <span className="ml-1 text-nebula-text-secondary">DU CODE</span>
        </div>
      </Link>

      <nav className="flex shrink-0 items-center gap-3 sm:gap-6">{children}</nav>
    </header>
  );
}
