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

// Pixel font, reserved for short headings: it becomes unreadable at small
// sizes.
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

// The nonce-based CSP requires dynamic rendering: a page pre-rendered at build
// time would have no nonce and its scripts would be blocked. Set on the root
// layout, `force-dynamic` applies to every route.
export const dynamic = "force-dynamic";

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
      className={`${shareTechMono.variable} ${exo2.variable} ${jetbrainsMono.variable} ${silkscreen.variable} h-full w-full`}
    >
      <body className="min-h-full w-full bg-nebula-bg-darkest text-nebula-text font-body text-base m-0 p-0">
        <AuthSessionProvider>{children}</AuthSessionProvider>
        {/*
          Vercel audience measurement with no cookie or persistent identifier,
          so no prior consent needed (docs/RGPD.md §2). Inert outside Vercel.
        */}
        <Analytics />
      </body>
    </html>
  );
}
