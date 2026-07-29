import type { Metadata } from "next";

import { LORE_SECTIONS } from "@/lib/lore";
import PublicHeader from "@/components/ui/PublicHeader";
import TrialCtaLink from "@/components/ui/TrialCtaLink";

export const metadata: Metadata = {
  title: "Codex — Nebula Command",
  description:
    "L'univers de Nebula Command : la Coalition, la menace Spectre et le rôle du Cadet-Ingénieur.",
};

export default function CodexPage() {
  return (
    <div className="relative min-h-screen w-full">
      <div className="fixed inset-0 z-0 bg-nebula-bg" />
      <div className="fixed inset-0 z-0 bg-nebula-stars opacity-30" />

      <PublicHeader>
        <TrialCtaLink className="rounded-sm bg-nebula-cyan px-4 py-2 font-tech text-xs font-bold uppercase tracking-widest text-nebula-bg-darkest sm:text-sm">
          Essayer sans compte
        </TrialCtaLink>
      </PublicHeader>

      <main className="relative z-10 mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="mb-3 font-display text-2xl tracking-[0.06em] text-nebula-cyan sm:text-4xl">
          CODEX
        </h1>
        <p className="mb-12 font-tech text-[10px] uppercase tracking-[0.35em] text-nebula-text-dim sm:text-xs">
          [ Archives de la Coalition Nebula ]
        </p>

        {LORE_SECTIONS.map((section) => (
          <section key={section.id} id={section.id} className="mb-12">
            <h2 className="mb-4 font-tech text-xl uppercase tracking-widest text-nebula-orange sm:text-2xl">
              {section.title}
            </h2>
            {section.body.map((paragraph, i) => (
              <p
                key={i}
                className="mb-4 font-body text-base leading-relaxed text-nebula-text-secondary sm:text-lg"
              >
                {paragraph}
              </p>
            ))}
          </section>
        ))}

        <div className="mt-16 border-t border-nebula-border/70 pt-8 text-center">
          <p className="mb-5 font-body text-base text-nebula-text-secondary">
            La flotte a besoin d&apos;ingénieurs.
          </p>
          <TrialCtaLink className="inline-block rounded-sm bg-nebula-cyan px-8 py-4 font-tech text-sm font-bold uppercase tracking-[0.18em] text-nebula-bg-darkest shadow-[0_4px_0_var(--cyan-dim)]">
            {"> "}Première mission
          </TrialCtaLink>
        </div>
      </main>
    </div>
  );
}
