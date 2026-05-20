"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { unlockAudio } from "@/lib/audio";



interface LevelNode {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  icon: string;
  
  spriteRow: number;
  spriteFrame: number;
  
  size: number;
  
  x: number;
  y: number;
  status: "available" | "locked" | "completed";
}

const HTML_LEVELS: LevelNode[] = [
  {
    id: "ch1",
    slug: "chapitre-1",
    title: "INITIALISATION DE LA STATION",
    subtitle: "Protocole 01 — Les bases HTML",
    icon: "📡",
    spriteRow: 0, 
    spriteFrame: 0,
    size: 100,
    x: 15,
    y: 65,
    status: "available",
  },
  {
    id: "ch2",
    slug: "chapitre-2",
    title: "SYSTÈMES DE NAVIGATION",
    subtitle: "Protocole 02 — Liens & navigation",
    icon: "🧭",
    spriteRow: 1, 
    spriteFrame: 1,
    size: 80,
    x: 35,
    y: 40,
    status: "locked",
  },
  {
    id: "ch3",
    slug: "chapitre-3",
    title: "BASE DE DONNÉES VISUELLE",
    subtitle: "Protocole 03 — Images & médias",
    icon: "🖼️",
    spriteRow: 1, 
    spriteFrame: 3,
    size: 70,
    x: 55,
    y: 58,
    status: "locked",
  },
  {
    id: "ch4",
    slug: "chapitre-4",
    title: "ARSENAL TACTIQUE",
    subtitle: "Protocole 04 — Listes & tableaux",
    icon: "📋",
    spriteRow: 0, 
    spriteFrame: 2,
    size: 90,
    x: 75,
    y: 30,
    status: "locked",
  },
  {
    id: "ch5",
    slug: "chapitre-5",
    title: "CENTRE DE COMMANDEMENT",
    subtitle: "Protocole 05 — Formulaires",
    icon: "🎛️",
    spriteRow: 2,
    spriteFrame: 0,
    size: 130,
    x: 88,
    y: 60,
    status: "locked",
  },
];


const SHEET_W = 2816;
const SHEET_H = 1536;
const FRAME_W = 704;
const FRAME_H = 512;

export default function CourseMapPage() {
  const params = useParams();
  const course = params.course as string;
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const mounted = true;

  return (
    <div className="relative h-full overflow-hidden">
      {/* Background */}
      <div
        className="fixed inset-0 z-0 pointer-events-none bg-center bg-cover bg-no-repeat"
        style={{
          backgroundImage:
            course === "html" ? "url('/spacebackgroundorange.png')" : undefined,
        }}
      />
      <div className="fixed inset-0 bg-nebula-stars z-0 pointer-events-none opacity-30" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-[rgba(3,6,13,0.22)]" />

      {/* Top bar */}
      <div className="relative z-20 flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-tech text-nebula-text-secondary text-sm tracking-wider hover:text-nebula-cyan transition-colors"
        >
          ← RETOUR
        </Link>
        <h1
          className="font-tech text-nebula-cyan text-lg tracking-[0.25em]"
          style={{ textShadow: "0 0 20px rgba(0, 240, 255, 0.3)" }}
        >
          CURSUS {course.toUpperCase()}
        </h1>
        <div className="w-20" />
      </div>

      {/* Map area */}
      <div
        className="relative z-10 mx-auto"
        style={{
          width: "100%",
          maxWidth: 1200,
          height: "calc(100vh - 80px)",
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.8s ease 0.2s",
        }}
      >
        {/* Connection lines between nodes */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          viewBox="0 0 1200 700"
          preserveAspectRatio="xMidYMid meet"
        >
          {HTML_LEVELS.slice(0, -1).map((node, i) => {
            const next = HTML_LEVELS[i + 1];
            const x1 = (node.x / 100) * 1200;
            const y1 = (node.y / 100) * 700;
            const x2 = (next.x / 100) * 1200;
            const y2 = (next.y / 100) * 700;
            const isActive =
              node.status !== "locked" && next.status !== "locked";
            return (
              <line
                key={`line-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={
                  isActive ? "rgba(0, 240, 255, 0.25)" : "rgba(42, 58, 85, 0.4)"
                }
                strokeWidth={isActive ? 2 : 1}
                strokeDasharray={isActive ? "none" : "8 6"}
              />
            );
          })}
        </svg>

        {/* Level nodes */}
        {HTML_LEVELS.map((node, i) => (
          <LevelNodeComponent
            key={node.id}
            node={node}
            course={course}
            index={i}
            mounted={mounted}
            hovered={hoveredId === node.id}
            onHover={(id) => setHoveredId(id)}
          />
        ))}
      </div>
    </div>
  );
}

function LevelNodeComponent({
  node,
  course,
  index,
  mounted,
  hovered,
  onHover,
}: {
  node: LevelNode;
  course: string;
  index: number;
  mounted: boolean;
  hovered: boolean;
  onHover: (id: string | null) => void;
}) {
  const isLocked = node.status === "locked";
  const customNodeImages: Partial<Record<LevelNode["id"], string>> = {
    ch1: "/planete-verte.png",
    ch2: "/rouge.png",
    ch3: "/gaz.png",
    ch4: "/dry.png",
    ch5: "/anneau.png",
  };
  const customImage = customNodeImages[node.id];
  const scale = node.size / FRAME_W;
  const visualHeight = customImage ? node.size : node.size * (FRAME_H / FRAME_W);

  const spriteStyle: React.CSSProperties = {
    width: node.size,
    height: node.size * (FRAME_H / FRAME_W),
    backgroundImage: "url(/sprites/celestial-objects.png)",
    backgroundPosition: `${-(node.spriteFrame * FRAME_W) * scale}px ${-(node.spriteRow * FRAME_H) * scale}px`,
    backgroundSize: `${SHEET_W * scale}px ${SHEET_H * scale}px`,
    imageRendering: "pixelated",
  };

  const content = (
    <div
      className="absolute group"
      style={{
        left: `${node.x}%`,
        top: `${node.y}%`,
        transform: "translate(-50%, -50%)",
        opacity: mounted ? 1 : 0,
        transition: `all 0.6s ease ${0.2 + index * 0.15}s`,
      }}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Glow ring behind planet */}
      {!isLocked && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
          style={{
            width: node.size + 20,
            height: node.size + 20,
            background:
              "radial-gradient(circle, rgba(0,240,255,0.08) 0%, transparent 70%)",
            animation: "station-pulse 4s ease-in-out infinite",
          }}
        />
      )}

      {/* Planet sprite */}
      {customImage ? (
        <div
          className={`relative transition-transform duration-300 ${
            isLocked ? "opacity-30 grayscale" : "cursor-pointer"
          } ${hovered && !isLocked ? "scale-110" : ""}`}
          style={{
            width: node.size,
            height: node.size,
            backgroundImage: `url(${customImage})`,
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
            imageRendering: "pixelated",
          }}
        />
      ) : (
        <div
          className={`relative transition-transform duration-300 ${
            isLocked ? "opacity-30 grayscale" : "cursor-pointer"
          } ${hovered && !isLocked ? "scale-110" : ""}`}
          style={spriteStyle}
        />
      )}

      {/* Label below */}
      <div
        className="absolute left-1/2 -translate-x-1/2 text-center whitespace-nowrap pointer-events-none"
        style={{ top: visualHeight + 8 }}
      >
        <span className="font-tech text-[10px] tracking-widest text-nebula-text-dim block">
          {node.icon} CH.{index + 1}
        </span>
        {hovered && (
          <div
            className="mt-1 px-3 py-2 rounded border border-nebula-border bg-nebula-bg-panel/90 backdrop-blur-sm"
            style={{
              animation: "fb-in 0.2s ease both",
              minWidth: 180,
            }}
          >
            <p
              className={`font-tech text-xs tracking-wider mb-1 ${isLocked ? "text-nebula-text-dim" : "text-nebula-cyan"}`}
            >
              {node.title}
            </p>
            <p className="font-body text-[10px] text-nebula-text-secondary">
              {node.subtitle}
            </p>
            {isLocked && (
              <p className="font-tech text-[9px] text-nebula-text-dim mt-1 tracking-wider">
                🔒 VERROUILLÉ
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (isLocked) return content;

  return (
    <Link href={`/learn/${course}/${node.slug}`} onClick={() => unlockAudio()}>
      {content}
    </Link>
  );
}
