import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nebula Command — Protocole 01 : Initialisation de la Station",
  description: "Déploie les systèmes de défense de ta station orbitale",
};

export default function ChapterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
