import type { Metadata } from "next";
import Link from "next/link";

import BrandLogo from "@/components/ui/BrandLogo";
import IntroCinematicMount from "@/components/intro/IntroCinematicMount";
import ReplayIntroButton from "@/components/intro/ReplayIntroButton";
import PixelImage from "@/components/ui/PixelImage";
import PublicHeader from "@/components/ui/PublicHeader";
import TrackLandingView from "@/components/ui/TrackLandingView";
import TrialCtaLink from "@/components/ui/TrialCtaLink";
import { buildHomeJsonLd, HOME_TITLE, serializeJsonLd, SITE_DESCRIPTION, siteUrl } from "@/lib/seo";

// Canonical URLs resolve against `metadataBase` (APP_URL): copies served on
// another host point search engines back to the site.
export const metadata: Metadata = {
  title: HOME_TITLE,
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden overflow-y-auto">
      {/* Structured data for search engines: not executed, so the CSP does not apply. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildHomeJsonLd(siteUrl())) }}
      />
      {/* Intro cinematic, played on the first visit */}
      <IntroCinematicMount />
      {/* Anonymous view counting */}
      <TrackLandingView />

      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-nebula-bg" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-nebula-stars opacity-30" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-[rgba(3,6,13,0.55)]" />

      {/* Decorative planets, hidden on mobile. Their alt text is for search
          engines; aria-hidden keeps screen readers on the content. */}
      <div aria-hidden="true" className="pointer-events-none fixed left-[6%] top-[24%] z-[5] hidden opacity-50 md:block">
        <PixelImage
          src="/planet-gas-v2.png"
          alt="Planète gazeuse bleue à anneaux, en pixel art"
          width={140}
          height={140}
          className="animate-planet-rotate drop-shadow-[0_0_30px_rgba(0,240,255,0.2)]"
        />
      </div>
      <div aria-hidden="true" className="pointer-events-none fixed right-[5%] top-[55%] z-[5] hidden opacity-50 md:block">
        <PixelImage
          src="/planet-dry-v2.png"
          alt="Planète désertique orange criblée de cratères, en pixel art"
          width={170}
          height={170}
          className="animate-planet-rotate drop-shadow-[0_0_30px_rgba(255,107,44,0.2)]"
        />
      </div>
      <div aria-hidden="true" className="pointer-events-none fixed left-[10%] bottom-[8%] z-[5] hidden opacity-35 lg:block">
        <PixelImage
          src="/planet-red-v2.png"
          alt="Planète de lave rouge sillonnée de fissures, en pixel art"
          width={90}
          height={90}
          className="drop-shadow-[0_0_20px_rgba(255,107,44,0.2)]"
        />
      </div>

      {/* Navigation */}
      <PublicHeader>
        <Link
          href="/codex"
          className="whitespace-nowrap font-tech text-xs uppercase tracking-widest text-nebula-text-secondary transition-colors hover:text-nebula-cyan sm:text-sm"
        >
          Codex
        </Link>
        <Link
          href="/login"
          className="whitespace-nowrap font-tech text-xs uppercase tracking-widest text-nebula-text-secondary transition-colors hover:text-nebula-cyan sm:text-sm"
        >
          Se connecter
        </Link>
        <Link
          href="/signup"
          className="rounded-sm bg-nebula-cyan px-3 py-2 font-tech text-xs font-bold uppercase tracking-widest text-nebula-bg-darkest shadow-[0_3px_0_var(--cyan-dim)] transition-all hover:translate-y-px hover:shadow-[0_2px_0_var(--cyan-dim)] active:translate-y-[3px] active:shadow-none sm:px-4 sm:text-sm"
        >
          S&apos;inscrire
        </Link>
      </PublicHeader>

      {/* Content: fills the height below the navigation from lg up */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col px-4 py-8 sm:px-6 sm:py-10 lg:min-h-[calc(100vh-4rem)]">
        {/* Hero, which takes the remaining space */}
        <section className="flex flex-1 flex-col items-center justify-center py-8 text-center animate-slide-down">
          <BrandLogo
            size={128}
            priority
            fx
            className="mb-8 drop-shadow-[0_0_30px_rgba(0,240,255,0.3)]"
          />

          <h1
            className="mb-5 font-display text-2xl tracking-[0.06em] text-nebula-cyan sm:text-4xl lg:text-5xl"
            style={{
              textShadow:
                "0 0 24px rgba(0, 240, 255, 0.35), 0 0 50px rgba(0, 240, 255, 0.12)",
            }}
          >
            LA FORGE DU CODE
          </h1>

          <div className="mb-6 h-px w-48 bg-gradient-to-r from-transparent via-nebula-cyan to-transparent sm:w-72" />

          <p className="mb-3 max-w-2xl font-body text-base leading-relaxed text-nebula-text-secondary sm:text-lg lg:text-xl">
            Apprends à coder dans un univers spatial où chaque chapitre est une
            mission. HTML, CSS, JavaScript, React et 10 autres cursus — débloque
            tes protocoles et construis ta station orbitale.
          </p>
          <p className="mb-10 font-tech text-[10px] uppercase tracking-[0.35em] text-nebula-text-dim sm:text-xs sm:tracking-[0.4em]">
            [ Coalition Nebula · plateforme d&apos;apprentissage pour cadets de la flotte ]
          </p>

          <div className="flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
            <TrialCtaLink className="rounded-sm bg-nebula-cyan px-6 py-3 text-center font-tech text-sm font-bold uppercase tracking-[0.18em] text-nebula-bg-darkest shadow-[0_4px_0_var(--cyan-dim)] transition-all hover:translate-y-px hover:shadow-[0_3px_0_var(--cyan-dim)] active:translate-y-[3px] active:shadow-none sm:px-8 sm:py-4 sm:text-base">
              {"> "}Essayer sans compte
            </TrialCtaLink>
            <Link
              href="/signup"
              className="rounded-sm border border-nebula-cyan-dim bg-transparent px-6 py-3 text-center font-tech text-sm font-bold uppercase tracking-[0.18em] text-nebula-cyan transition-all hover:border-nebula-cyan hover:bg-nebula-cyan-faint sm:px-8 sm:py-4 sm:text-base"
            >
              S&apos;inscrire
            </Link>
          </div>

          <div className="mt-6">
            <ReplayIntroButton />
          </div>
        </section>

        {/* Highlights, at the bottom of the screen */}
        <section className="mx-auto grid w-full max-w-5xl shrink-0 grid-cols-1 gap-5 animate-fade-up md:grid-cols-3 lg:gap-6">
          <FeatureCard
            icon="/feature-courses-v2.png"
            iconAlt="Terminal de mission vert en pixel art, symbole des cursus structurés"
            title="Cursus structurés"
            description="Des protocoles progressifs : HTML, CSS et JavaScript. Chaque chapitre est une mission."
          />
          <FeatureCard
            icon="/feature-badges-v2.png"
            iconAlt="Médaille dorée en pixel art, symbole de l'XP et des badges"
            title="XP & badges"
            description="Gagne de l'expérience, débloque des badges, monte en grade. Ta progression est sauvegardée."
          />
          <FeatureCard
            icon="/feature-editor-v2.png"
            iconAlt="Écran d'ordinateur affichant du code, symbole de l'éditeur intégré"
            title="Éditeur intégré"
            description="Code directement dans le navigateur avec un éditeur professionnel et un retour instantané."
          />
        </section>

        <footer className="mt-6 mb-2 shrink-0 text-center font-tech text-[10px] uppercase tracking-[0.35em] text-nebula-text-secondary sm:mt-8 sm:text-xs sm:tracking-[0.4em]">
          © {new Date().getFullYear()} La Forge du Code
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  iconAlt,
  title,
  description,
}: {
  icon: string;
  /** Read by search engines; hidden from screen readers, the title says it already. */
  iconAlt: string;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-sm border border-nebula-cyan/30 bg-nebula-bg-panel/90 p-5 backdrop-blur-md shadow-[0_0_20px_rgba(0,240,255,0.06)] transition-colors hover:border-nebula-cyan/60 lg:p-6">
      <div aria-hidden="true" className="mb-4 flex h-16 w-16 items-center justify-center">
        <PixelImage
          src={icon}
          alt={iconAlt}
          width={64}
          height={64}
          className="h-full w-full object-contain"
        />
      </div>
      <h2 className="mb-2 font-tech text-base tracking-wider text-nebula-cyan lg:text-lg">
        {title}
      </h2>
      <p className="font-body text-sm leading-relaxed text-nebula-text-secondary">
        {description}
      </p>
    </article>
  );
}
