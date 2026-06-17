"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, use } from "react";

import BrandLogo from "@/components/ui/BrandLogo";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default function ResetPasswordPage({ params }: PageProps) {
  const { token } = use(params);
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 8) {
      setError("Minimum 8 caractères.");
      return;
    }

    setPending(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Réinitialisation impossible");
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
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
              <BrandLogo size={72} className="mb-4" />
              <h1 className="font-tech text-2xl tracking-[0.18em] text-nebula-cyan [text-shadow:0_0_18px_rgba(0,240,255,0.3)]">
                NOUVEAU MOT DE PASSE
              </h1>
              <p className="mt-1 font-tech text-[10px] uppercase tracking-[0.3em] text-nebula-text-dim">
                Choisis un nouveau secret de mission
              </p>
            </div>

            {done ? (
              <div className="text-center">
                <div className="mb-3 text-5xl">✅</div>
                <p className="mb-4 font-body text-sm leading-relaxed text-nebula-text-secondary">
                  Mot de passe mis à jour. Redirection vers la connexion...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <label htmlFor="password" className="block">
                  <span className="mb-1.5 block font-tech text-[10px] uppercase tracking-[0.25em] text-nebula-text-dim">
                    Nouveau mot de passe (min. 8 caractères)
                  </span>
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={128}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-sm border border-nebula-border bg-nebula-bg-darkest/60 px-3 py-2.5 font-tech text-sm text-nebula-text outline-none transition-colors focus:border-nebula-cyan"
                  />
                </label>
                <label htmlFor="confirm" className="block">
                  <span className="mb-1.5 block font-tech text-[10px] uppercase tracking-[0.25em] text-nebula-text-dim">
                    Confirme
                  </span>
                  <input
                    id="confirm"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={128}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full rounded-sm border border-nebula-border bg-nebula-bg-darkest/60 px-3 py-2.5 font-tech text-sm text-nebula-text outline-none transition-colors focus:border-nebula-cyan"
                  />
                </label>

                {error && (
                  <p className="font-tech text-xs text-nebula-red">
                    {"> "}ERREUR : {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={pending}
                  className="w-full rounded-sm bg-nebula-cyan px-6 py-3 font-tech text-sm font-bold uppercase tracking-[0.18em] text-nebula-bg-darkest shadow-[0_4px_0_var(--cyan-dim)] transition-all enabled:hover:translate-y-px enabled:hover:shadow-[0_3px_0_var(--cyan-dim)] enabled:active:translate-y-[3px] enabled:active:shadow-none disabled:opacity-50"
                >
                  {pending ? "Enregistrement..." : "> Mettre à jour"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
