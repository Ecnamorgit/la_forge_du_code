import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-nebula-bg-darkest px-6 text-center text-nebula-text">
      <div className="font-tech text-xs uppercase tracking-[0.4em] text-nebula-orange">
        ◈ Secteur introuvable
      </div>
      <h1 className="font-display text-6xl text-nebula-cyan sm:text-7xl">404</h1>
      <p className="max-w-md text-sm text-nebula-text-secondary">
        Cette coordonnée ne mène à aucune station connue. Retourne au poste de
        commandement.
      </p>
      <Link
        href="/"
        className="font-tech text-sm uppercase tracking-[0.2em] border border-nebula-cyan px-6 py-3 text-nebula-cyan transition-colors hover:bg-nebula-cyan hover:text-nebula-bg-darkest"
      >
        &gt; Retour à la base
      </Link>
    </main>
  );
}
