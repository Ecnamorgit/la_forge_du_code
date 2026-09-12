"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";

import BrandLogo from "@/components/ui/BrandLogo";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [emailWarning, setEmailWarning] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setEmailWarning(null);

    // Client-side guards (the server re-validates everything).
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setError("Le mot de passe doit contenir au moins une lettre et un chiffre.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setPending(true);

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        emailSent?: boolean;
        emailError?: string | null;
      };

      setPending(false);

      if (!res.ok) {
        setError(data.error ?? "Inscription impossible");
        return;
      }

      // Automatically sign in the user to trigger immediate onboarding
      const loginRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (loginRes?.error) {
        // Fallback if auto-login failed: show completion notice
        setSentTo(email);
      } else {
        window.location.href = "/dashboard";
      }
    } catch {
      setError("Erreur réseau. Réessayez.");
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
            href="/"
            className="mb-8 inline-flex items-center gap-2 font-tech text-xs uppercase tracking-widest text-nebula-text-secondary transition-colors hover:text-nebula-cyan"
          >
            ← Retour à l&apos;accueil
          </Link>

          <div className="rounded-sm border border-nebula-cyan/40 bg-nebula-bg-panel/85 p-8 backdrop-blur-md shadow-[0_0_40px_rgba(0,240,255,0.08)]">
            {sentTo ? (
              <div className="text-center">
                <div className="mb-3 text-5xl">📡</div>
                <h1 className="mb-3 font-tech text-2xl tracking-[0.18em] text-nebula-cyan [text-shadow:0_0_18px_rgba(0,240,255,0.3)]">
                  VÉRIFIE TA BOÎTE MAIL
                </h1>
                {/* Même message que l'adresse soit libre ou déjà inscrite
                    (constat SRV-05) : l'e-mail reçu dit la suite. */}
                <p className="mb-5 font-body text-sm leading-relaxed text-nebula-text-secondary">
                  On vient d&apos;envoyer un e-mail à
                  <br />
                  <strong className="break-all text-nebula-cyan">{sentTo}</strong>
                </p>
                <p className="mb-6 font-body text-xs leading-relaxed text-nebula-text-dim">
                  Suis les instructions qu&apos;il contient pour continuer.
                  Pense à vérifier ton dossier <strong>spam</strong>.
                </p>
                {emailWarning && (
                  <div
                    role="alert"
                    className="mb-4 rounded-sm border border-nebula-red/70 bg-nebula-red/15 px-3 py-2 text-left font-tech text-[11px] uppercase tracking-wider text-nebula-red"
                  >
                    {emailWarning}
                  </div>
                )}
                <Link
                  href="/login"
                  className="inline-block rounded-sm border border-nebula-cyan-dim bg-transparent px-5 py-2.5 font-tech text-xs uppercase tracking-widest text-nebula-cyan transition-all hover:border-nebula-cyan hover:bg-nebula-cyan-faint"
                >
                  Retour à la connexion
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6 flex flex-col items-center text-center">
                  <BrandLogo size={72} className="mb-4" />
                  <h1 className="font-display text-xl tracking-[0.06em] text-nebula-cyan [text-shadow:0_0_16px_rgba(0,240,255,0.28)] sm:text-2xl">
                    INSCRIPTION
                  </h1>
                  <p className="mt-1 font-tech text-[10px] uppercase tracking-[0.3em] text-nebula-text-dim">
                    Rejoins la flotte Nebula
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Field
                    label="Adresse e-mail"
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={setEmail}
                  />
                  <Field
                    label="Pseudo (2-16 caractères)"
                    id="username"
                    type="text"
                    autoComplete="username"
                    required
                    minLength={2}
                    maxLength={16}
                    pattern="[a-zA-Z0-9_\-]+"
                    value={username}
                    onChange={setUsername}
                  />
                  <Field
                    label="Mot de passe (min. 8, lettre + chiffre)"
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={128}
                    value={password}
                    onChange={setPassword}
                  />
                  <Field
                    label="Confirme le mot de passe"
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={128}
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                  />

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
                    {pending ? "Création..." : "> Démarrer la mission"}
                  </button>
                </form>

                <div className="mt-6 text-center font-tech text-xs uppercase tracking-widest text-nebula-text-secondary">
                  Déjà un compte ?{" "}
                  <Link
                    href="/login"
                    className="text-nebula-cyan hover:underline"
                  >
                    Se connecter
                  </Link>
                </div>
              </>
            )}
          </div>
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
