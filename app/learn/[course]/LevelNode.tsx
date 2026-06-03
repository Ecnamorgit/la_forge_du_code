"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { unlockAudio } from "@/lib/audio";
import { useUser } from "@/lib/use-user";
import { isChapterComplete } from "@/lib/user-store";
import type { ChapterMetaFull } from "@/lib/courses-meta";

export interface LevelNode {
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
}

const SHEET_W = 2816;
const SHEET_H = 1536;
const FRAME_W = 704;
const FRAME_H = 512;

const CUSTOM_NODE_IMAGES: Record<string, string> = {
  ch1: "/planet-green.png",
  ch2: "/planet-red.png",
  ch3: "/planet-gas.png",
  ch4: "/planet-dry.png",
  ch5: "/planet-ring.png",
};

interface LevelNodeProps {
  node: LevelNode;
  course: string;
  index: number;
  chaptersMeta: ChapterMetaFull[];
}

type NodeStatus = "available" | "locked" | "completed";

export default function LevelNodeComponent({
  node,
  course,
  index,
  chaptersMeta,
}: LevelNodeProps) {
  const [hovered, setHovered] = useState(false);
  const { state } = useUser();

  const status: NodeStatus = useMemo(() => {
    const chapters = chaptersMeta;
    const metaIndex = chapters.findIndex((c) => c.slug === node.slug);
    if (metaIndex === -1) return "locked";

    const meta = chapters[metaIndex];
    const isComplete = isChapterComplete(
      state,
      course,
      meta.slug,
      meta.totalSteps
    );

    if (metaIndex === 0) {
      return isComplete ? "completed" : "available";
    }

    const prevMeta = chapters[metaIndex - 1];
    const prevDone = isChapterComplete(
      state,
      course,
      prevMeta.slug,
      prevMeta.totalSteps
    );

    if (!prevDone) return "locked";
    return isComplete ? "completed" : "available";
  }, [node.slug, course, state]);

  const isLocked = status === "locked";
  const isCompleted = status === "completed";
  const customImage = CUSTOM_NODE_IMAGES[node.id];
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
      className="absolute group animate-fade-up-stagger"
      style={{
        left: `${node.x}%`,
        top: `${node.y}%`,
        transform: "translate(-50%, -50%)",
        animationDelay: `${0.2 + index * 0.15}s`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {!isLocked && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
          style={{
            width: node.size + 20,
            height: node.size + 20,
            background: isCompleted
              ? "radial-gradient(circle, rgba(0,255,136,0.10) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(0,240,255,0.08) 0%, transparent 70%)",
            animation: "station-pulse 4s ease-in-out infinite",
          }}
        />
      )}

      {customImage ? (
        <Image
          src={customImage}
          alt={node.title}
          width={node.size}
          height={node.size}
          className={`relative object-contain transition-transform duration-300 animate-rotate-slow ${
            isLocked ? "opacity-30 grayscale" : "cursor-pointer"
          } ${hovered && !isLocked ? "scale-110" : ""}`}
          style={{ imageRendering: "pixelated" }}
        />
      ) : (
        <div
          className={`relative transition-transform duration-300 animate-rotate-slow ${
            isLocked ? "opacity-30 grayscale" : "cursor-pointer"
          } ${hovered && !isLocked ? "scale-110" : ""}`}
          style={spriteStyle}
        />
      )}

      {isCompleted && (
        <div
          className="pointer-events-none absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border border-nebula-green bg-nebula-bg-darkest font-tech text-sm text-nebula-green shadow-[0_0_10px_rgba(0,255,136,0.4)]"
          aria-hidden="true"
        >
          ✓
        </div>
      )}

      <div
        className="absolute left-1/2 -translate-x-1/2 text-center whitespace-nowrap pointer-events-none"
        style={{ top: visualHeight + 8 }}
      >
        <span
          className={`font-tech text-[10px] tracking-widest block ${
            isCompleted ? "text-nebula-green" : "text-nebula-text-dim"
          }`}
        >
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
              className={`font-tech text-xs tracking-wider mb-1 ${
                isLocked
                  ? "text-nebula-text-dim"
                  : isCompleted
                    ? "text-nebula-green"
                    : "text-nebula-cyan"
              }`}
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
            {isCompleted && (
              <p className="font-tech text-[9px] text-nebula-green mt-1 tracking-wider">
                ✓ COMPLÉTÉ
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (isLocked) return content;

  return (
    <Link
      href={`/learn/${course}/${node.slug}`}
      onClick={() => unlockAudio()}
      onMouseEnter={() => {
        void import("@monaco-editor/react");
      }}
    >
      {content}
    </Link>
  );
}
