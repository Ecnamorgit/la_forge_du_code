import type { Metadata } from "next";
import { Share_Tech_Mono, Exo_2, JetBrains_Mono, Silkscreen } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import AuthSessionProvider from "@/components/auth/SessionProvider";
import "./globals.css";

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-tech",
  display: "swap",
});

// True bitmap/pixel face — used ONLY for short display headings (hero titles,
// page H1) so the typography matches the pixel-art direction. Never for body or
// long labels: pixel fonts get unreadable at small sizes.
const silkscreen = Silkscreen({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const exo2 = Exo_2({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-code",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: "La Forge du Code — Coalition Nebula",
  description:
    "Plateforme d'apprentissage du code où chaque chapitre est une mission — univers Coalition Nebula",
  openGraph: {
    type: "website",
    siteName: "La Forge du Code",
    locale: "fr_FR",
    title: "La Forge du Code — Coalition Nebula",
    description:
      "Apprends à coder dans un univers spatial où chaque chapitre est une mission. HTML, CSS, JavaScript, React.",
  },
  twitter: {
    card: "summary_large_image",
    title: "La Forge du Code — Coalition Nebula",
    description:
      "Apprends à coder dans un univers spatial où chaque chapitre est une mission. HTML, CSS, JavaScript, React.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      //AJout : W full pour la largeur garantie
      className={`${shareTechMono.variable} ${exo2.variable} ${jetbrainsMono.variable} ${silkscreen.variable} h-full w-full`}
    >
      <body className="min-h-full w-full bg-nebula-bg-darkest text-nebula-text font-body text-base m-0 p-0">
        <AuthSessionProvider>{children}</AuthSessionProvider>
        {/*
          Mesure d'audience Vercel : sans cookie et sans identifiant persistant,
          donc hors du champ du consentement préalable — c'est ce qui permet de
          la poser ici plutôt que derrière une bannière. Voir docs/RGPD.md §2.
          Inerte hors déploiement Vercel : en local, le script ne se charge pas.
        */}
        <Analytics />
      </body>
    </html>
  );
}
