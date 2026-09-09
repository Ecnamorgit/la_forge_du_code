import Link from "next/link";

import { prisma } from "@/lib/db";
import { TokenError, consumeToken } from "@/lib/tokens";

interface PageProps {
  params: Promise<{ token: string }>;
}

type Outcome =
  | { status: "ok"; email: string }
  | { status: "error"; reason: TokenError["reason"] | "unknown"; message: string };

async function verify(token: string): Promise<Outcome> {
  try {
    const { userId } = await consumeToken({ token, kind: "email_verify" });
    const user = await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: new Date() },
      select: { email: true },
    });
    return { status: "ok", email: user.email };
  } catch (err) {
    if (err instanceof TokenError) {
      return { status: "error", reason: err.reason, message: err.message };
    }
    return {
      status: "error",
      reason: "unknown",
      message: "Une erreur est survenue. Réessaie dans quelques instants.",
    };
  }
}

export default async function VerifyEmailPage({ params }: PageProps) {
  const { token } = await params;
  const result = await verify(token);

  return (
    <div className="relative h-full overflow-y-auto">
      <div className="fixed inset-0 z-0 pointer-events-none bg-nebula-bg" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-nebula-stars opacity-25" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-[rgba(3,6,13,0.5)]" />

      <div className="relative z-10 flex min-h-full items-center justify-center px-6 py-12">
        <div
          className={`w-full max-w-md animate-fade-up rounded-sm border bg-nebula-bg-panel/85 p-8 text-center backdrop-blur-md ${
            result.status === "ok"
              ? "border-nebula-cyan/50 shadow-[0_0_40px_rgba(0,240,255,0.12)]"
              : "border-nebula-red/50 shadow-[0_0_40px_rgba(255,60,80,0.1)]"
          }`}
        >
          {result.status === "ok" ? (
            <>
              <div className="mb-3 text-5xl">✅</div>
              <h1 className="mb-3 font-tech text-2xl tracking-[0.18em] text-nebula-cyan [text-shadow:0_0_18px_rgba(0,240,255,0.3)]">
                ADRESSE VÉRIFIÉE
              </h1>
              <p className="mb-6 font-body text-sm leading-relaxed text-nebula-text-secondary">
                Ton compte <strong className="break-all text-nebula-green">{result.email}</strong> est
                opérationnel. Tu peux maintenant te connecter.
              </p>
              <Link
                href="/login"
                className="inline-block rounded-sm bg-nebula-cyan px-6 py-2.5 font-tech text-xs font-bold uppercase tracking-widest text-nebula-bg-darkest shadow-[0_4px_0_var(--cyan-dim)] transition-all hover:translate-y-px hover:shadow-[0_3px_0_var(--cyan-dim)] active:translate-y-[3px] active:shadow-none"
              >
                {"> "}Se connecter
              </Link>
            </>
          ) : (
            <>
              <div className="mb-3 text-5xl">⚠️</div>
              <h1 className="mb-3 font-tech text-2xl tracking-[0.18em] text-nebula-red [text-shadow:0_0_18px_rgba(255,60,80,0.3)]">
                LIEN INVALIDE
              </h1>
              <p className="mb-6 font-body text-sm leading-relaxed text-nebula-text-secondary">
                {result.message}
              </p>
              <div className="flex flex-col items-center gap-3">
                <Link
                  href="/login"
                  className="inline-block rounded-sm border border-nebula-cyan-dim bg-transparent px-5 py-2.5 font-tech text-xs uppercase tracking-widest text-nebula-cyan transition-all hover:border-nebula-cyan hover:bg-nebula-cyan-faint"
                >
                  Se connecter
                </Link>
                <p className="font-tech text-[11px] uppercase tracking-wider text-nebula-text-dim">
                  Tu peux demander un nouveau lien depuis la page de connexion.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
