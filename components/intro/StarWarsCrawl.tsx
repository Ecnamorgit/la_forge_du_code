"use client";

import { useState } from "react";

interface StarWarsCrawlProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export default function StarWarsCrawl({ onComplete, onSkip }: StarWarsCrawlProps) {
  const [paused, setPaused] = useState(false);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-nebula-bg-darkest font-tech text-yellow-400">
      {/* Fond d'étoiles spatial bien visible */}
      <div className="pointer-events-none absolute inset-0 bg-nebula-stars opacity-85" />

      {/* Halo lumineux supérieur d'horizon spatial */}
      <div className="pointer-events-none absolute top-0 z-20 h-28 w-full bg-gradient-to-b from-nebula-bg-darkest via-nebula-bg-darkest/95 to-transparent" />

      {/* Fondu d'ombrage inférieur */}
      <div className="pointer-events-none absolute bottom-0 z-20 h-28 w-full bg-gradient-to-t from-nebula-bg-darkest via-nebula-bg-darkest/90 to-transparent" />

      {/* Conteneur 3D Perspective — Largeur max augmentée à 5xl pour remplir l'écran */}
      <div className="starwars-crawl-container z-10 flex h-[78vh] w-[92vw] max-w-5xl items-center justify-center px-4 sm:px-8">
        <div
          className={`starwars-crawl-content text-center ${
            paused ? "[animation-play-state:paused]" : ""
          }`}
          onAnimationEnd={onComplete}
        >
          {/* En-tête Épisode Grand Format */}
          <div className="mb-16 flex flex-col items-center gap-3">
            <span className="font-tech text-sm tracking-[0.45em] uppercase text-nebula-cyan sm:text-base">
              --- TRANSMISSION SPATIALE REÇUE ---
            </span>
            <h1 className="font-tech text-3xl font-bold uppercase tracking-[0.25em] text-yellow-400 sm:text-5xl lg:text-6xl drop-shadow-[0_0_20px_rgba(255,230,0,0.4)]">
              NEBULA COMMAND
            </h1>
            <h2 className="font-tech text-base uppercase tracking-[0.3em] text-nebula-cyan sm:text-xl">
              Épisode I : Le Glitch Originel
            </h2>
          </div>

          {/* Section 1 : L'Univers & Le Lore */}
          <div className="mb-14 space-y-6">
            <h3 className="font-tech text-2xl font-bold uppercase tracking-widest text-nebula-orange sm:text-4xl">
              I. La Coalition Nebula
            </h3>
            <p className="font-body text-lg leading-relaxed text-yellow-300 sm:text-2xl lg:text-3xl">
              Au 23ème siècle, l&apos;humanité a essaimé dans la galaxie, établissant un réseau de
              stations orbitales reliées par la <strong className="text-yellow-100 font-semibold">Coalition Nebula</strong>.
            </p>
            <p className="font-body text-lg leading-relaxed text-yellow-300 sm:text-2xl lg:text-3xl">
              Cette infrastructure galactique géante ne tient que grâce à un ensemble de technologies
              logicielles ancestrales et hautement standardisées : <strong className="text-nebula-cyan font-semibold">les Protocoles Systèmes</strong> (HTML pour la structure physique des stations, CSS pour la répartition de l&apos;énergie et des boucliers, JavaScript pour l&apos;automatisation des tourelles et des réacteurs).
            </p>
          </div>

          {/* Section 2 : La Menace */}
          <div className="mb-14 space-y-6">
            <h3 className="font-tech text-2xl font-bold uppercase tracking-widest text-nebula-red sm:text-4xl">
              II. La Menace : L&apos;Entité "Null" (Le Glitch)
            </h3>
            <p className="font-body text-lg leading-relaxed text-yellow-300 sm:text-2xl lg:text-3xl">
              Une entité cybernétique extraterrestre connue sous le nom de <strong className="text-nebula-spectre font-semibold">Null (ou Le Glitch)</strong> se propage à travers les réseaux, corrompant les lignes de code des stations.
            </p>
            <p className="font-body text-lg leading-relaxed text-yellow-300 sm:text-2xl lg:text-3xl">
              Une station dont le code est corrompu perd son oxygène, désactive ses boucliers et dérive dans le vide avant d&apos;être capturée.
            </p>
          </div>

          {/* Section 3 : Le Rôle du Joueur */}
          <div className="mb-20 space-y-6">
            <h3 className="font-tech text-2xl font-bold uppercase tracking-widest text-nebula-green sm:text-4xl">
              III. Le Rôle du Cadet en Ingénierie
            </h3>
            <p className="font-body text-lg leading-relaxed text-yellow-300 sm:text-2xl lg:text-3xl">
              L&apos;apprenant commence en tant que <strong className="text-yellow-100 font-semibold">Cadet fraîchement diplômé</strong> de l&apos;Académie Militaire Spatiale. Armé de sa console de programmation (l&apos;éditeur Monaco), il est envoyé sur le front.
            </p>
            <p className="font-body text-lg leading-relaxed text-yellow-300 sm:text-2xl lg:text-3xl">
              Sa mission : voyager de station en station, nettoyer le code corrompu, restaurer les systèmes de survie, et programmer les défenses automatiques pour repousser les vagues d&apos;invasion du Null.
            </p>
          </div>

          <div className="py-12 font-tech text-base uppercase tracking-[0.3em] text-nebula-cyan sm:text-xl">
            === FIN DE LA TRANSMISSION ===
          </div>
        </div>
      </div>

      {/* Barre de commandes en bas */}
      <div className="z-30 mt-2 flex items-center gap-4">
        <button
          onClick={() => setPaused(!paused)}
          className="rounded-sm border border-nebula-border bg-nebula-bg-panel/90 px-5 py-2.5 font-tech text-xs uppercase tracking-widest text-nebula-cyan hover:border-nebula-cyan sm:text-sm"
        >
          {paused ? "▶ Reprendre" : "⏸ Pause"}
        </button>
        {onSkip && (
          <button
            onClick={onSkip}
            className="rounded-sm bg-nebula-cyan px-6 py-2.5 font-tech text-xs font-bold uppercase tracking-widest text-nebula-bg-darkest transition-all hover:brightness-110 sm:text-sm"
          >
            Passer aux Scènes →
          </button>
        )}
      </div>
    </div>
  );
}
