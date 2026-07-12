import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBadge } from "@/lib/badges-catalog";
import { sanitizeShareName, parseShareXp } from "@/lib/share";

/**
 * Public landing page for a shared success card. Carries the OG/Twitter meta so
 * LinkedIn/X render the dynamic image (app/api/share/[badge]/route.tsx), and
 * gives visitors a CTA into the app. No auth, no personal data beyond a pseudo.
 */

type Params = Promise<{ badge: string }>;
type Search = Promise<{ u?: string; xp?: string }>;

function appBase(): string {
  return process.env.APP_URL ?? "http://localhost:3000";
}

function imageUrl(badge: string, pseudo: string, xp: number): string {
  const params = new URLSearchParams({ u: pseudo, xp: String(xp) });
  return `${appBase()}/api/share/${badge}?${params.toString()}`;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}): Promise<Metadata> {
  const { badge } = await params;
  const def = getBadge(badge);
  if (!def) return { title: "Badge inconnu — Nebula Command" };

  const sp = await searchParams;
  const pseudo = sanitizeShareName(sp.u);
  const xp = parseShareXp(sp.xp);
  const title = `${pseudo} a debloque « ${def.label} » sur Nebula Command`;
  const image = imageUrl(badge, pseudo, xp);

  return {
    title,
    description: def.description,
    openGraph: {
      title,
      description: def.description,
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: def.description,
      images: [image],
    },
  };
}

export default async function SharePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { badge } = await params;
  const def = getBadge(badge);
  if (!def) notFound();

  const sp = await searchParams;
  const pseudo = sanitizeShareName(sp.u);
  const xp = parseShareXp(sp.xp);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-nebula-bg px-6 text-center">
      <div className="w-full max-w-md rounded-sm border border-nebula-cyan bg-nebula-bg-panel/80 p-8 shadow-[0_0_60px_rgba(0,240,255,0.12)]">
        <div className="font-tech text-xs uppercase tracking-[0.3em] text-nebula-text-dim">
          Nebula Command
        </div>
        <div className="my-5 text-6xl">{def.icon}</div>
        <h1 className="font-tech text-2xl tracking-wider text-nebula-cyan">
          {def.label}
        </h1>
        <p className="mt-2 font-body text-nebula-text-secondary">{def.description}</p>
        <p className="mt-4 font-tech text-sm tracking-wider text-nebula-green">
          {pseudo}
          {xp > 0 ? ` · +${xp} XP` : ""}
        </p>
        <Link
          href="/signup"
          className="mt-8 inline-block rounded-sm bg-nebula-cyan px-8 py-3 font-tech text-sm font-bold uppercase tracking-widest text-nebula-bg-darkest shadow-[0_4px_0_var(--cyan-dim)] transition-all hover:translate-y-px"
        >
          Rejoindre la flotte →
        </Link>
      </div>
    </div>
  );
}
