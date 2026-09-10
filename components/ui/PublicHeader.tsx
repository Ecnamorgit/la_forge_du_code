import Link from "next/link";

import BrandLogo from "@/components/ui/BrandLogo";

/**
 * En-tête des pages publiques (landing, codex).
 *
 * La coque et le bloc de marque sont partagés ; chaque page passe ses propres
 * actions en `children`. Sans ce composant, un lien ajouté à la navigation
 * n'apparaîtrait que sur l'une des pages.
 */
export default function PublicHeader({ children }: { children: React.ReactNode }) {
  return (
    <header className="relative z-50 flex h-16 items-center justify-between border-b border-nebula-border/70 bg-nebula-bg-darkest/80 px-4 backdrop-blur-md sm:px-6">
      {/* Sous `sm`, la navigation (Codex · Se connecter · S'inscrire) occupe
          presque toute la largeur : le nom écrit se tronquait en « LA FO… ».
          On ne garde que le pictogramme ; le nom reste annoncé aux lecteurs
          d'écran via aria-label, et le héros l'affiche en grand juste dessous. */}
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
