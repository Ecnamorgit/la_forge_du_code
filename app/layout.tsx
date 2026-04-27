import type { Metadata } from "next";
import { Share_Tech_Mono, Exo_2, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-tech",
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
  title: "CodeForge — Nebula Command",
  description:
    "Plateforme d'apprentissage du code gamifiée — Univers Nebula Command",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${shareTechMono.variable} ${exo2.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="h-full overflow-hidden bg-nebula-bg-darkest text-nebula-text font-body text-base m-0 p-0">
        {children}
      </body>
    </html>
  );
}
