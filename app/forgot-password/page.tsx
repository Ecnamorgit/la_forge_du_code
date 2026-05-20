"use client";

import Link from "next/link";
import { useState } from "react";

import BrandLogo from "@/components/ui/BrandLogo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // Silent — server already returns 200 in all paths.
    } finally {
      setSubmitted(true);
      setPending(false);
    }
  };

  return (
    <div className="relative h-full overflow-y-auto">
      <div className="fixed inset-0 z-0 pointer-events-none bg-nebula-bg" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-nebula-stars opacity-25" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-[rgba(3,6,13,0.5)]" />

      <div className="relative z-10 flex min-h-full items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-fade-up">
          <Link
            href="/login"
            className="mb-8 inline-flex items-center gap-2 font-tech text-xs uppercase tracking-widest text-nebula-text-secondary transition-colors hover:text-nebula-cyan"
          >
            ← Retour à la connexion
          </Link>

          <div className="rounded-sm border border-nebula-cyan/40 bg-nebula-bg-panel/85 p-8 backdrop-blur-md shadow-[0_0_40px_rgba(0,240,255,0.08)]">
            <div className="mb-6 flex flex-col items-center text-center">
              <BrandLogo size={64} className="mb-3" />
              <h1 className="font-tech text-2xl tracking-[0.2em] text-nebula-cyan [text-shadow:0_0_18px_rgba(0,240,255,0.3)]">
                MOT DE PASSE OUBLIÉ
              </h1>
              <p className="mt-1 font-tech text-[10px] uppercase tracking-[0.3em] text-nebula-text-dim">
                On t&apos;envoie un lien de réinitialisation
              </p>
            </div>

            {submitted ? (
              <div className="text-center">
                <div className="mb-3 text-5xl">📨</div>
                <p className="mb-6 font-body text-sm leading-relaxed text-nebula-text-secondary">
                  Si un compte existe avec l&apos;adresse <strong className="break-all text-nebula-cyan">{email}</strong>,
                  un lien de réinitialisation vient d&apos;être envoyé. Vérifie aussi ton dossier <strong>spam</strong>.
                </p>
                <p className="font-tech text-[11px] uppercase tracking-wider text-nebula-text-dim">
                  Le lien expire dans 1h.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <label htmlFor="email" className="block">
                  <span className="mb-1.5 block font-tech text-[10px] uppercase tracking-[0.25em] text-nebula-text-dim">
                    Email
                  </span>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-sm border border-nebula-border bg-nebula-bg-darkest/60 px-3 py-2.5 font-tech text-sm text-nebula-text outline-none transition-colors focus:border-nebula-cyan"
                  />
                </label>

                <button
                  type="submit"
                  disabled={pending}
                  className="w-full rounded-sm bg-nebula-cyan px-6 py-3 font-tech text-sm font-bold uppercase tracking-[0.18em] text-nebula-bg-darkest shadow-[0_4px_0_var(--cyan-dim)] transition-all enabled:hover:translate-y-px enabled:hover:shadow-[0_3px_0_var(--cyan-dim)] enabled:active:translate-y-[3px] enabled:active:shadow-none disabled:opacity-50"
                >
                  {pending ? "Envoi..." : "> Envoyer le lien"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
