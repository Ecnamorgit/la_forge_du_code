import Link from "next/link";
import Image from "next/image";

import BrandLogo from "@/components/ui/BrandLogo";
import IntroCinematicMount from "@/components/intro/IntroCinematicMount";
import ReplayIntroButton from "@/components/intro/ReplayIntroButton";
import PublicHeader from "@/components/ui/PublicHeader";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden overflow-y-auto">
      {/* Cinématique d'intro (auto-play 1re visite, rejouable) */}
      <IntroCinematicMount />

      {/* Background layers */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-nebula-bg" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-nebula-stars opacity-30" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-[rgba(3,6,13,0.55)]" />

      {/* Decorative planets — hidden under md to keep mobile clean */}
      <div className="pointer-events-none fixed left-[6%] top-[24%] z-[5] hidden opacity-50 md:block">
        <Image
          src="/planet-gas-v2.png"
          alt=""
          width={140}
          height={140}
          className="animate-planet-rotate drop-shadow-[0_0_30px_rgba(0,240,255,0.2)]"
          style={{ imageRendering: "pixelated" }}
        />
      </div>
      <div className="pointer-events-none fixed right-[5%] top-[55%] z-[5] hidden opacity-50 md:block">
        <Image
          src="/planet-dry-v2.png"
          alt=""
          width={170}
          height={170}
          className="animate-planet-rotate drop-shadow-[0_0_30px_rgba(255,107,44,0.2)]"
          style={{ imageRendering: "pixelated" }}
        />
      </div>
      <div className="pointer-events-none fixed left-[10%] bottom-[8%] z-[5] hidden opacity-35 lg:block">
        <Image
          src="/planet-red-v2.png"
          alt=""
          width={90}
          height={90}
          className="drop-shadow-[0_0_20px_rgba(255,107,44,0.2)]"
          style={{ imageRendering: "pixelated" }}
        />
      </div>

      {/* Nav */}
      <PublicHeader>
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

      {/*
        Content wrapper :
        - min-h-[calc(100%-4rem)] occupies remaining viewport below the nav
        - flex column distributes hero, features, footer along the height
      */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col px-4 py-8 sm:px-6 sm:py-10 lg:min-h-[calc(100vh-4rem)]">
        {/* Hero — takes the slack so the screen feels balanced */}
        <section className="flex flex-1 flex-col items-center justify-center py-8 text-center animate-fade-down">
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
            NEBULA COMMAND
          </h1>

          <div className="mb-6 h-px w-48 bg-gradient-to-r from-transparent via-nebula-cyan to-transparent sm:w-72" />

          <p className="mb-3 max-w-2xl font-body text-base leading-relaxed text-nebula-text-secondary sm:text-lg lg:text-xl">
            Apprends à coder dans un univers spatial gamifié. HTML, CSS,
            JavaScript, React et 10 autres cursus — débloque tes protocoles et
            construis ta station orbitale.
          </p>
          <p className="mb-10 font-tech text-[10px] uppercase tracking-[0.35em] text-nebula-text-dim sm:text-xs sm:tracking-[0.4em]">
            [ Plateforme d&apos;apprentissage pour cadets de la flotte ]
          </p>

          <div className="flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
            <Link
              href="/signup"
              className="rounded-sm bg-nebula-cyan px-6 py-3 text-center font-tech text-sm font-bold uppercase tracking-[0.18em] text-nebula-bg-darkest shadow-[0_4px_0_var(--cyan-dim)] transition-all hover:translate-y-px hover:shadow-[0_3px_0_var(--cyan-dim)] active:translate-y-[3px] active:shadow-none sm:px-8 sm:py-4 sm:text-base"
            >
              {"> "}Démarrer la mission
            </Link>
            <Link
              href="/login"
              className="rounded-sm border border-nebula-cyan-dim bg-transparent px-6 py-3 text-center font-tech text-sm font-bold uppercase tracking-[0.18em] text-nebula-cyan transition-all hover:border-nebula-cyan hover:bg-nebula-cyan-faint sm:px-8 sm:py-4 sm:text-base"
            >
              J&apos;ai déjà un compte
            </Link>
          </div>

          <div className="mt-6">
            <ReplayIntroButton />
          </div>
        </section>

        {/* Features — band at bottom of the viewport */}
        <section className="mx-auto grid w-full max-w-5xl shrink-0 grid-cols-1 gap-5 animate-fade-up md:grid-cols-3 lg:gap-6">
          <FeatureCard
            icon="/feature-courses-v2.png"
            title="Cursus structurés"
            description="Des protocoles progressifs : HTML, CSS et JavaScript. Chaque chapitre est une mission."
          />
          <FeatureCard
            icon="/feature-badges-v2.png"
            title="XP & badges"
            description="Gagne de l'expérience, débloque des badges, monte en grade. Ta progression est sauvegardée."
          />
          <FeatureCard
            icon="/feature-editor-v2.png"
            title="Éditeur intégré"
            description="Code directement dans le navigateur avec un éditeur professionnel et un feedback instantané."
          />
        </section>

        <footer className="mt-6 mb-2 shrink-0 text-center font-tech text-[10px] uppercase tracking-[0.35em] text-nebula-text-dim sm:mt-8 sm:text-xs sm:tracking-[0.4em]">
          © {new Date().getFullYear()} Nebula Command
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-sm border border-nebula-cyan/30 bg-nebula-bg-panel/90 p-5 backdrop-blur-md shadow-[0_0_20px_rgba(0,240,255,0.06)] transition-colors hover:border-nebula-cyan/60 lg:p-6">
      <div className="mb-4 flex h-16 w-16 items-center justify-center">
        <Image
          src={icon}
          alt=""
          width={64}
          height={64}
          className="h-full w-full object-contain"
          style={{ imageRendering: "pixelated" }}
        />
      </div>
      <h3 className="mb-2 font-tech text-base tracking-wider text-nebula-cyan lg:text-lg">
        {title}
      </h3>
      <p className="font-body text-sm leading-relaxed text-nebula-text-secondary">
        {description}
      </p>
    </article>
  );
}
