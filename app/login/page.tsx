"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Suspense, useState } from "react";

import BrandLogo from "@/components/ui/BrandLogo";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("from") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [unverified, setUnverified] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setUnverified(false);
    setResent(false);
    setPending(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setPending(false);

    if (!res || res.error) {
      // Auth.js v5 doesn't reliably surface the CredentialsSignin code through
      // signIn({ redirect: false }), so we follow up with our own check to
      // distinguish "wrong password" from "email unverified".
      try {
        const check = await fetch("/api/auth/check-verification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = (await check.json().catch(() => ({}))) as { unverified?: boolean };
        if (data.unverified) {
          setUnverified(true);
          setError("Ton email n'est pas encore vérifié. Clique sur le lien envoyé à l'inscription.");
          return;
        }
      } catch {
        // Ignore — fall through to the generic error message below.
      }
      setError("Email ou mot de passe invalide");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  const handleResend = async () => {
    setResending(true);
    setResent(false);
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResent(true);
    } catch {
      // Silent on the server side already; we just acknowledge here.
      setResent(true);
    } finally {
      setResending(false);
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
            href="/"
            className="mb-8 inline-flex items-center gap-2 font-tech text-xs uppercase tracking-widest text-nebula-text-secondary transition-colors hover:text-nebula-cyan"
          >
            ← Retour à l&apos;accueil
          </Link>

          <div className="rounded-sm border border-nebula-cyan/40 bg-nebula-bg-panel/85 p-8 backdrop-blur-md shadow-[0_0_40px_rgba(0,240,255,0.08)]">
            <div className="mb-6 flex flex-col items-center text-center">
              <BrandLogo size={64} className="mb-3" />
              <h1 className="font-tech text-2xl tracking-[0.2em] text-nebula-cyan [text-shadow:0_0_18px_rgba(0,240,255,0.3)]">
                CONNEXION
              </h1>
              <p className="mt-1 font-tech text-[10px] uppercase tracking-[0.3em] text-nebula-text-dim">
                Accède à ta station orbitale
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field
                label="Email"
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={setEmail}
              />
              <Field
                label="Mot de passe"
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={setPassword}
              />

              {error && (
                <p className="font-tech text-xs text-nebula-red">
                  {"> "}ERREUR : {error}
                </p>
              )}

              {unverified && (
                <div className="rounded-sm border border-nebula-orange-dim bg-nebula-orange-faint/20 p-3">
                  {resent ? (
                    <p className="font-tech text-[11px] uppercase tracking-wider text-nebula-green">
                      ✓ Si l&apos;adresse existe, un nouveau lien vient d&apos;être envoyé. Vérifie ta boîte (et le spam).
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resending || !email}
                      className="font-tech text-[11px] uppercase tracking-wider text-nebula-orange transition-colors hover:text-nebula-cyan disabled:opacity-50"
                    >
                      {resending ? "Envoi..." : "→ Renvoyer le lien de vérification"}
                    </button>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-sm bg-nebula-cyan px-6 py-3 font-tech text-sm font-bold uppercase tracking-[0.18em] text-nebula-bg-darkest shadow-[0_4px_0_var(--cyan-dim)] transition-all enabled:hover:translate-y-px enabled:hover:shadow-[0_3px_0_var(--cyan-dim)] enabled:active:translate-y-[3px] enabled:active:shadow-none disabled:opacity-50"
              >
                {pending ? "Connexion..." : "> Se connecter"}
              </button>

              <div className="text-center">
                <Link
                  href="/forgot-password"
                  className="font-tech text-[11px] uppercase tracking-wider text-nebula-text-dim transition-colors hover:text-nebula-cyan"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            </form>

            <div className="mt-6 text-center font-tech text-xs uppercase tracking-widest text-nebula-text-secondary">
              Pas encore de compte ?{" "}
              <Link
                href="/signup"
                className="text-nebula-cyan hover:underline"
              >
                S&apos;inscrire
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginSkeleton() {
  return (
    <div className="relative h-full overflow-y-auto">
      <div className="fixed inset-0 z-0 pointer-events-none bg-nebula-bg" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-nebula-stars opacity-25" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-[rgba(3,6,13,0.5)]" />
      <div className="relative z-10 flex min-h-full items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-sm border border-nebula-cyan/40 bg-nebula-bg-panel/85 p-8 backdrop-blur-md">
          <p className="font-tech text-xs uppercase tracking-widest text-nebula-text-secondary">
            Chargement...
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  id,
  value,
  onChange,
  ...rest
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "id">) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block font-tech text-[10px] uppercase tracking-[0.25em] text-nebula-text-dim">
        {label}
      </span>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-sm border border-nebula-border bg-nebula-bg-darkest/60 px-3 py-2.5 font-tech text-sm text-nebula-text outline-none transition-colors focus:border-nebula-cyan"
        {...rest}
      />
    </label>
  );
}
