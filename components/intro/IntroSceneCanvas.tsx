"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

import { INTRO_FX, type Fx, type SceneFx } from "@/lib/intro-fx";

/**
 * Pixelated three.js mini-cinematic for an intro scene.
 *
 * The scene's PNG stays a plain <Image>; a transparent three.js canvas
 * on top animates only the effects (glitches, halos, beams,
 * particles) described in `INTRO_FX`. The camera drift is a CSS animation
 * on the container: image and effects move together, and WebGL has
 * no texture to load.
 *
 * The internal render, at low resolution, is upscaled without smoothing to stay
 * pixel art. three.js is only imported on mount; if WebGL fails,
 * the <Image> is shown alone.
 */

type ThreeModule = typeof import("three");

/** Aspect ratio of the scene-N.png files (1024×571). */
const IMG_ASPECT = 1024 / 571;
/** Internal render width, in px. */
const RENDER_WIDTH = 320;
/** About 20 frames/s, enough for slow effects. */
const TICK_MS = 50;

/** Wrapper CSS animation class for the configured drift. */
const CAMERA_CLASS: Record<SceneFx["camera"]["kind"], string> = {
  pan: "animate-intro-cam-pan",
  sway: "animate-intro-cam-sway",
  "zoom-in": "animate-intro-cam-zoom-in",
  "zoom-out": "animate-intro-cam-zoom-out",
};

/** Deterministic hash in [0, 1), for flickers and particles. */
function hash(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/** Small soft radial texture (halo / particle). */
function makeSoftCircle(THREE: ThreeModule): import("three").Texture {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(255,255,255,0.5)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.LinearFilter;
  return tex;
}

/** Texture of repeated horizontal stripes (scanlines). */
function makeStripes(THREE: ThreeModule): import("three").Texture {
  const c = document.createElement("canvas");
  c.width = 4;
  c.height = 8;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "rgba(255,255,255,1)";
  ctx.fillRect(0, 0, 4, 3);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.NearestFilter;
  return tex;
}

/** Soft horizontal gradient (sweep bar). */
function makeGradientBar(THREE: ThreeModule): import("three").Texture {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 4;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 64, 0);
  g.addColorStop(0, "rgba(255,255,255,0)");
  g.addColorStop(0.5, "rgba(255,255,255,1)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 4);
  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.LinearFilter;
  return tex;
}

interface IntroSceneCanvasProps {
  sceneId: number;
  src: string;
  alt: string;
}

export default function IntroSceneCanvas({
  sceneId,
  src,
  alt,
}: IntroSceneCanvasProps) {
  const holderRef = useRef<HTMLDivElement>(null);
  const config: SceneFx | undefined = INTRO_FX[sceneId];

  useEffect(() => {
    const holder = holderRef.current;
    if (!holder || !config) return;

    let cancelled = false;
    let interval: number | undefined;
    let cleanupThree: (() => void) | undefined;

    (async () => {
      const THREE = await import("three");
      if (cancelled) return;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
      } catch {
        // WebGL unavailable: only the static <Image> is shown.
        return;
      }

      const scene = new THREE.Scene();
      const disposables: Array<{ dispose(): void }> = [];
      const track = <T extends { dispose(): void }>(obj: T): T => {
        disposables.push(obj);
        return obj;
      };

      const softCircle = track(makeSoftCircle(THREE));
      const stripes = track(makeStripes(THREE));
      const gradientBar = track(makeGradientBar(THREE));

      // World: a rectangle the size of the image, height 1.
      const W = IMG_ASPECT;
      const H = 1;
      const toWorld = (nx: number, ny: number): [number, number] => [
        (nx - 0.5) * W,
        (0.5 - ny) * H,
      ];

      const camera = new THREE.OrthographicCamera(
        -W / 2,
        W / 2,
        H / 2,
        -H / 2,
        0.1,
        10
      );
      camera.position.z = 1;

      const renderHeight = Math.round(RENDER_WIDTH / IMG_ASPECT);
      renderer.setPixelRatio(1);
      renderer.setSize(RENDER_WIDTH, renderHeight, false);
      const el = renderer.domElement;
      el.style.position = "absolute";
      el.style.inset = "0";
      el.style.width = "100%";
      el.style.height = "100%";
      el.style.imageRendering = "pixelated";
      holder.appendChild(el);

      const additive = (color: string, opacity = 0) =>
        track(
          new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity,
            blending: THREE.AdditiveBlending,
            depthTest: false,
          })
        );

      // Build the effects and their update functions.
      const updates: Array<(t: number) => void> = [];

      config.effects.forEach((fx: Fx, fxIndex: number) => {
        const seed = sceneId * 31 + fxIndex * 7;
        switch (fx.kind) {
          case "flicker": {
            const [cx, cy] = toWorld(fx.x + fx.w / 2, fx.y + fx.h / 2);
            const mat = additive(fx.color);
            const mesh = new THREE.Mesh(
              track(new THREE.PlaneGeometry(fx.w * W, fx.h * H)),
              mat
            );
            mesh.position.set(cx, cy, 0.1);
            scene.add(mesh);
            updates.push((t) => {
              const step = Math.floor((t / fx.period) * 6) + seed;
              mat.opacity = hash(step) > 0.55 ? 0.08 + hash(step * 3) * 0.14 : 0;
            });
            break;
          }
          case "pulse": {
            const [cx, cy] = toWorld(fx.x, fx.y);
            const mat = track(
              new THREE.SpriteMaterial({
                map: softCircle,
                color: fx.color,
                transparent: true,
                opacity: 0,
                blending: THREE.AdditiveBlending,
                depthTest: false,
              })
            );
            const sprite = new THREE.Sprite(mat);
            sprite.position.set(cx, cy, 0.1);
            const d = fx.r * H * 2.6;
            sprite.scale.set(d, d, 1);
            scene.add(sprite);
            updates.push((t) => {
              const s = 0.5 + 0.5 * Math.sin((t / fx.period) * Math.PI * 2 + seed);
              mat.opacity = 0.1 + s * 0.24;
              const k = d * (0.92 + s * 0.16);
              sprite.scale.set(k, k, 1);
            });
            break;
          }
          case "sparks": {
            const RAYS = 8;
            const LIFE = 0.55;
            const [cx, cy] = toWorld(fx.x, fx.y);
            const mat = track(
              new THREE.SpriteMaterial({
                map: softCircle,
                color: fx.color,
                transparent: true,
                opacity: 0,
                blending: THREE.AdditiveBlending,
                depthTest: false,
              })
            );
            const sprites: import("three").Sprite[] = [];
            for (let i = 0; i < RAYS; i++) {
              const sp = new THREE.Sprite(mat);
              sp.position.set(cx, cy, 0.12);
              sp.scale.set(0.02 * H, 0.02 * H, 1);
              sprites.push(sp);
              scene.add(sp);
            }
            updates.push((t) => {
              const age = (t + hash(seed) * fx.period) % fx.period;
              const alive = age < LIFE;
              mat.opacity = alive ? (1 - age / LIFE) * 0.85 : 0;
              if (!alive) return;
              const burst = Math.floor((t + hash(seed) * fx.period) / fx.period);
              sprites.forEach((sp, i) => {
                const a = (i / RAYS) * Math.PI * 2 + hash(burst + i) * 0.8;
                const r = age * 0.12 * (0.6 + hash(burst * 5 + i) * 0.8);
                sp.position.set(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0.12);
              });
            });
            break;
          }
          case "particles": {
            const geometry = track(new THREE.BufferGeometry());
            const positions = new Float32Array(fx.count * 3);
            const phases: number[] = [];
            for (let i = 0; i < fx.count; i++) {
              phases.push(hash(seed + i * 13) * 100);
              positions[i * 3 + 2] = 0.08;
            }
            geometry.setAttribute(
              "position",
              new THREE.BufferAttribute(positions, 3)
            );
            const mat = track(
              new THREE.PointsMaterial({
                color: fx.color,
                size: 2,
                sizeAttenuation: false,
                map: softCircle,
                transparent: true,
                opacity: 0.55,
                blending: THREE.AdditiveBlending,
                depthTest: false,
              })
            );
            const points = new THREE.Points(geometry, mat);
            scene.add(points);
            const [dx, dy] = fx.dir;
            const len = Math.hypot(dx, dy) || 1;
            updates.push((t) => {
              const attr = geometry.getAttribute(
                "position"
              ) as import("three").BufferAttribute;
              for (let i = 0; i < fx.count; i++) {
                const travel = (t + phases[i]) * fx.speed;
                // Pseudo-random start position + translation, wrapped
                // into the area (modulo) for a continuous flow.
                const px =
                  (hash(seed + i * 3) + (travel * dx) / len / fx.w) % 1;
                const py =
                  (hash(seed + i * 3 + 1) + (travel * dy) / len / fx.h) % 1;
                const nx = fx.x + ((px + 1) % 1) * fx.w;
                const ny = fx.y + ((py + 1) % 1) * fx.h;
                const [wx, wy] = toWorld(nx, ny);
                attr.setXY(i, wx, wy);
              }
              attr.needsUpdate = true;
            });
            break;
          }
          case "beam": {
            const [x1, y1] = toWorld(fx.from[0], fx.from[1]);
            const [x2, y2] = toWorld(fx.to[0], fx.to[1]);
            const length = Math.hypot(x2 - x1, y2 - y1);
            const angle = Math.atan2(y2 - y1, x2 - x1);
            const mat = additive(fx.color, 0.3);
            const mesh = new THREE.Mesh(
              track(new THREE.PlaneGeometry(length, 0.012 * H)),
              mat
            );
            mesh.position.set((x1 + x2) / 2, (y1 + y2) / 2, 0.1);
            mesh.rotation.z = angle;
            scene.add(mesh);
            updates.push((t) => {
              const s = 0.5 + 0.5 * Math.sin((t / fx.period) * Math.PI * 2 + seed);
              mat.opacity = 0.16 + s * 0.4;
              mesh.scale.y = 0.7 + s * 0.9;
            });
            break;
          }
          case "drift": {
            const mat = track(
              new THREE.SpriteMaterial({
                map: softCircle,
                color: fx.color,
                transparent: true,
                opacity: 0.5,
                depthTest: false,
              })
            );
            const sprite = new THREE.Sprite(mat);
            sprite.scale.set(fx.size * H * 2, fx.size * H, 1);
            scene.add(sprite);
            updates.push((t) => {
              const u = ((t / fx.period + hash(seed)) % 1 + 1) % 1;
              const nx = fx.x + u * fx.w;
              const ny =
                fx.y + fx.h / 2 + Math.sin(u * Math.PI * 2 + seed) * fx.h * 0.15;
              const [wx, wy] = toWorld(nx, ny);
              sprite.position.set(wx, wy, 0.05);
            });
            break;
          }
          case "scanlines": {
            const [cx, cy] = toWorld(fx.x + fx.w / 2, fx.y + fx.h / 2);
            const tex = track(stripes.clone());
            tex.repeat.set(1, (fx.h * H) / 0.012);
            const mat = track(
              new THREE.MeshBasicMaterial({
                map: tex,
                color: fx.color,
                transparent: true,
                opacity: 0.1,
                blending: THREE.AdditiveBlending,
                depthTest: false,
              })
            );
            const mesh = new THREE.Mesh(
              track(new THREE.PlaneGeometry(fx.w * W, fx.h * H)),
              mat
            );
            mesh.position.set(cx, cy, 0.1);
            scene.add(mesh);
            updates.push((t) => {
              tex.offset.y = -t / fx.period;
              mat.opacity = 0.07 + hash(Math.floor(t * 9) + seed) * 0.07;
            });
            break;
          }
          case "sweep": {
            const barW = fx.w * 0.22 * W;
            const mat = track(
              new THREE.MeshBasicMaterial({
                map: gradientBar,
                color: fx.color,
                transparent: true,
                opacity: 0.24,
                blending: THREE.AdditiveBlending,
                depthTest: false,
              })
            );
            const mesh = new THREE.Mesh(
              track(new THREE.PlaneGeometry(barW, fx.h * H)),
              mat
            );
            scene.add(mesh);
            updates.push((t) => {
              const u = (t / fx.period) % 1;
              const nx = fx.x + u * fx.w;
              const [wx, wy] = toWorld(nx, fx.y + fx.h / 2);
              mesh.position.set(wx, wy, 0.1);
              mat.opacity = 0.14 + Math.sin(u * Math.PI) * 0.18;
            });
            break;
          }
        }
      });

      const start = performance.now();
      const renderFrame = () => {
        const t = (performance.now() - start) / 1000;
        for (const update of updates) update(t);
        renderer.render(scene, camera);
      };
      renderFrame();
      interval = window.setInterval(renderFrame, TICK_MS);

      cleanupThree = () => {
        for (const d of disposables) d.dispose();
        renderer.dispose();
        // One canvas is mounted per scene: without immediate release,
        // WebGL contexts pile up until the browser limit.
        renderer.forceContextLoss();
        if (holder.contains(el)) holder.removeChild(el);
      };
    })();

    return () => {
      cancelled = true;
      if (interval !== undefined) window.clearInterval(interval);
      cleanupThree?.();
    };
  }, [sceneId, config]);

  return (
    <div className={CAMERA_CLASS[config?.camera.kind ?? "sway"]}>
      <div ref={holderRef} className="relative">
        <Image
          src={src}
          alt={alt}
          width={640}
          height={360}
          priority
          className="h-auto max-h-[300px] w-full max-w-[560px] object-cover sm:max-h-[360px]"
          style={{ imageRendering: "pixelated" }}
        />
      </div>
    </div>
  );
}
