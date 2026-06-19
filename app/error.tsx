"use client";

/**
 * Frontière d'erreur des routes (App Router). Affichée si un segment lève une
 * erreur au rendu. Message générique — aucune stacktrace exposée à l'utilisateur.
 */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-nebula-bg-darkest px-6 text-center text-nebula-text">
      <div className="font-tech text-xs uppercase tracking-[0.4em] text-nebula-red">
        ◈ Anomalie système
      </div>
      <h1 className="font-display text-4xl text-nebula-cyan sm:text-5xl">
        Une erreur est survenue
      </h1>
      <p className="max-w-md text-sm text-nebula-text-secondary">
        Le vaisseau a renconté une turbulence inattendue. Réessaie — si le
        problème persiste, reviens un peu plus tard.
      </p>
      <button
        onClick={reset}
        className="font-tech text-sm uppercase tracking-[0.2em] border border-nebula-cyan px-6 py-3 text-nebula-cyan transition-colors hover:bg-nebula-cyan hover:text-nebula-bg-darkest"
      >
        &gt; Réessayer
      </button>
    </main>
  );
}
