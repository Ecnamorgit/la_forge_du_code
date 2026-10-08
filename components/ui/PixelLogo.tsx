"use client";

import { useEffect, useRef } from "react";

/**
 * Logo pixel art : l'écusson de la flotte Coalition Nebula, en pseudo-3D.
 *
 * Bitmaps dessinés à la main et agrandis sans lissage (voir
 * docs/PIXEL_ART_GUIDE.md). L'écusson tourne sur son axe vertical comme une
 * pièce, avec une tranche dorée visible pendant la rotation. Un chasseur
 * humain poursuit une soucoupe extraterrestre sur une orbite elliptique
 * inclinée en lui tirant dessus ; les vaisseaux passent derrière l'écusson.
 * Avec `fx` (menu principal), les tirs ratés traversent tout l'écran.
 *
 * Tout est rendu dans une petite scène hors écran (SCENE² pixels d'art) puis
 * agrandi, à environ 15 images/s. Image fixe sous prefers-reduced-motion.
 */

const PALETTE: Record<string, string> = {
  K: "#03060d", // contour
  F: "#ffc844", // or clair (lumière en haut à droite)
  G: "#d9942b", // or moyen
  g: "#8a5416", // or ombré
  n: "#1a2744", // fond clair
  N: "#0a1628", // fond
  s: "#050a14", // fond ombré
  O: "#ff6b2c", // étoile orange
  o: "#6b2d13", // étoile ombrée
  W: "#ffd964", // cœur de l'étoile
  C: "#00f0ff", // code cyan
  c: "#00a8b8", // code cyan foncé
  H: "#c8d6e5", // coque humaine
  h: "#6b7d99", // coque humaine ombrée
  E: "#ff6b2c", // réacteur
  v: "#7dffb8", // dôme alien clair
  V: "#00b35f", // coque alien
  u: "#006b39", // coque alien ombrée
  M: "#ff2d55", // feux alien
};

/** Écusson 24×26 : un caractère par pixel, `.` pour la transparence. */
const CREST: string[] = [
  "..KKKKKKKKKKKKKKKKKKKK..",
  ".KFFFFFFFFFFFFFFFFFFFFK.",
  "KGFFFFFFFFFFFFFFFFFFFFFK",
  "KGGnnnnnnnnnnOOnnnnnnFFK",
  "KGGnnnnnnnnOWWOnnnnnnFFK",
  "KGGNNNNNNOOWWWWOONNNNFFK",
  "KGGNNNNNNNNOWWONNNNNNFFK",
  "KGGNNNNNNNNNOONNNNNNNFFK",
  "KGGNNNNNNNNNNNNNNNNNNFFK",
  "KGGNNNNNNNNNNNNNNNNNNFFK",
  "KGGNNNNCCNNNCCNCCNNNNFFK",
  "KGGNNNCCNNNNCNNNCCNNNFFK",
  "KGGNNCCNNNNCCNNNNCCNNFFK",
  "KGGNCCNNNNNCNNNNNNCCNFFK",
  "KGGNNCCNNNCCNNNNNCCNNFFK",
  ".KGGNNCCNNCNNNNNCCNNFFK.",
  "..KGGNNCCNNNNNNCCNNFFK..",
  "...KGGNNNNNNNNNNNNFFK...",
  "....KGGNNNNNNNNNNFFK....",
  ".....KGGsNNNNNNsFFK.....",
  "......KGGsssssssFK......",
  ".......KGGssssFFK.......",
  "........KGGssFFK........",
  ".........KGGFFK.........",
  "..........KGFK..........",
  "...........KK...........",
];

/** Chasseur humain 13×7, nez vers la droite, retourné au dessin si besoin. */
const HUMAN_SHIP: string[] = [
  "....H........",
  "....HH.......",
  ".EHhHHHHHh...",
  "EEHHHCCHHHHO.",
  ".EHhHHHHHh...",
  "....HH.......",
  "....H........",
];

/** Soucoupe extraterrestre 13×6, symétrique. */
const ALIEN_SHIP: string[] = [
  "....vvvvv....",
  "..vVVVVVVVv..",
  ".VVVVVVVVVVV.",
  "uMuuMuuMuuMuu",
  ".uVVVVVVVVVu.",
  "...uu...uu...",
];

const CREST_W = CREST[0].length;
const CREST_H = CREST.length;
const SHIP_W = HUMAN_SHIP[0].length;
const SHIP_H = HUMAN_SHIP.length;
const ALIEN_W = ALIEN_SHIP[0].length;
const ALIEN_H = ALIEN_SHIP.length;

/** Taille de la scène en pixels d'art : écusson centré, place pour l'orbite. */
const SCENE = 44;
const CX = SCENE / 2;
const CY = SCENE / 2;

/** Orbite (px d'art) : ellipse large, légèrement abaissée à l'avant. */
const ORBIT_RX = 15;
const ORBIT_RY = 6;
const ORBIT_Y_OFFSET = 1;

/** Rotation de l'écusson : pause face au spectateur, puis demi-tour lent. */
const SPIN_PERIOD = 7; // s par cycle de demi-tour
const SPIN_HOLD = 4.4; // s face au spectateur à chaque cycle

/** Environ 7 s par orbite ; le chasseur suit la soucoupe. */
const SHIP_OMEGA = (2 * Math.PI) / 7;
const CHASE_GAP = 1.55; // rad entre le chasseur et sa proie

const TWINKLE_MS = 420;
const TICK_MS = 66; // environ 15 images/s

/** Tirs laser (espace de la scène, px d'art). */
const BOLT_SPEED = 42; // px d'art/s
const BURST_EVERY = 1.7; // s entre deux rafales de deux tirs
const SCREEN_BOLT_SPEED = 1100; // px CSS/s une fois sortis du logo
const MAX_SCREEN_BOLTS = 3;

/**
 * Scintillement : pour chaque image, surcharges [ligne, colonne, couleur]
 * appliquées à l'écusson. L'image 0 est l'écusson de base.
 */
const TWINKLE_FRAMES: Array<Array<[number, number, string]>> = [
  [],
  // L'étoile chauffe : rayons latéraux.
  [
    [5, 8, "O"],
    [5, 17, "O"],
  ],
  // Éclat maximal : pointes dorées, rayons allongés, cœur brillant.
  [
    [5, 7, "O"],
    [5, 8, "O"],
    [5, 17, "O"],
    [5, 18, "O"],
    [3, 12, "W"],
    [3, 13, "W"],
    [7, 12, "W"],
    [7, 13, "W"],
    [5, 10, "W"],
    [5, 15, "W"],
  ],
  // Refroidissement.
  [
    [5, 8, "O"],
    [5, 17, "O"],
  ],
];

/** Multiplie une couleur #rrggbb par `f` (0..1) pour assombrir revers et arrière-plan. */
function shade(hex: string, f: number): string {
  const val = parseInt(hex.slice(1), 16);
  const r = Math.round(((val >> 16) & 0xff) * f);
  const g = Math.round(((val >> 8) & 0xff) * f);
  const b = Math.round((val & 0xff) * f);
  return `rgb(${r},${g},${b})`;
}

/** Dessine un bitmap de caractères sur un nouveau canvas, à l'échelle 1:1. */
function rasterise(
  bitmap: string[],
  overrides: Array<[number, number, string]> = [],
  brightness = 1,
  remap?: (key: string) => string
): HTMLCanvasElement {
  const rows = bitmap.length;
  const cols = bitmap[0].length;
  const canvas = document.createElement("canvas");
  canvas.width = cols;
  canvas.height = rows;
  const ctx = canvas.getContext("2d")!;
  const over = new Map<number, string>();
  for (const [r, c, key] of overrides) over.set(r * cols + c, key);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let key = over.get(r * cols + c) ?? bitmap[r][c];
      if (remap) key = remap(key);
      const color = PALETTE[key];
      if (!color) continue;
      ctx.fillStyle = brightness === 1 ? color : shade(color, brightness);
      ctx.fillRect(c, r, 1, 1);
    }
  }
  return canvas;
}

type Sprites = {
  crestFront: HTMLCanvasElement[];
  crestBack: HTMLCanvasElement[];
  crestRim: HTMLCanvasElement;
  human: HTMLCanvasElement;
  humanFar: HTMLCanvasElement;
  alien: HTMLCanvasElement;
  alienFar: HTMLCanvasElement;
};

function buildSprites(): Sprites {
  return {
    crestFront: TWINKLE_FRAMES.map((f) => rasterise(CREST, f)),
    // Même motif sur les deux faces ; le revers est seulement assombri.
    crestBack: TWINKLE_FRAMES.map((f) => rasterise(CREST, f, 0.85)),
    // Tranche : silhouette de l'écusson en or, qui figure l'épaisseur de la pièce.
    crestRim: rasterise(CREST, [], 1, (key) =>
      key === "." ? "." : key === "K" ? "K" : "G"
    ),
    human: rasterise(HUMAN_SHIP),
    humanFar: rasterise(HUMAN_SHIP, [], 0.55),
    alien: rasterise(ALIEN_SHIP),
    alienFar: rasterise(ALIEN_SHIP, [], 0.55),
  };
}

/** Tir laser dans l'espace de la scène. */
type Bolt = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Devant ou derrière l'écusson (fixé à la création). */
  front: boolean;
  /** Tir visé à côté, qui peut sortir de la scène. */
  miss: boolean;
};

/** Tir qui traverse l'écran (px CSS). */
type ScreenBolt = { x: number; y: number; vx: number; vy: number };

/** Position sur l'orbite à l'angle `a`. */
function orbitPos(a: number) {
  return {
    x: CX + Math.cos(a) * ORBIT_RX,
    y: CY + ORBIT_Y_OFFSET + Math.sin(a) * ORBIT_RY,
    front: Math.sin(a) > 0,
    movingRight: -Math.sin(a) > 0,
  };
}

function drawShipSprite(
  scene: CanvasRenderingContext2D,
  sprite: HTMLCanvasElement,
  x: number,
  y: number,
  w: number,
  h: number,
  flip: boolean
) {
  const px = Math.round(x - w / 2);
  const py = Math.round(y - h / 2);
  scene.save();
  if (flip) {
    scene.translate(px + w, py);
    scene.scale(-1, 1);
    scene.drawImage(sprite, 0, 0);
  } else {
    scene.drawImage(sprite, px, py);
  }
  scene.restore();
}

function drawScene(
  scene: CanvasRenderingContext2D,
  sprites: Sprites,
  t: number,
  bolts: Bolt[]
) {
  scene.imageSmoothingEnabled = false;
  scene.clearRect(0, 0, SCENE, SCENE);

  const twinkle = Math.floor((t * 1000) / TWINKLE_MS) % TWINKLE_FRAMES.length;

  // Poursuite
  const alienA = t * SHIP_OMEGA;
  const humanA = alienA - CHASE_GAP;
  const alien = orbitPos(alienA);
  const human = orbitPos(humanA);

  const drawBolts = (front: boolean) => {
    scene.fillStyle = PALETTE.C;
    for (const b of bolts) {
      if (b.front !== front) continue;
      const x = Math.round(b.x);
      const y = Math.round(b.y);
      // Tête de 2 px et traîne de 1 px plus sombre, opposée au déplacement.
      scene.fillStyle = PALETTE.C;
      scene.fillRect(x, y, Math.abs(b.vx) > Math.abs(b.vy) ? 2 : 1, Math.abs(b.vx) > Math.abs(b.vy) ? 1 : 2);
      scene.fillStyle = PALETTE.c;
      scene.fillRect(
        Math.round(x - Math.sign(b.vx)),
        Math.round(y - Math.sign(b.vy)),
        1,
        1
      );
    }
  };

  const drawShips = (front: boolean) => {
    if (alien.front === front) {
      drawShipSprite(
        scene,
        front ? sprites.alien : sprites.alienFar,
        alien.x,
        alien.y,
        ALIEN_W,
        ALIEN_H,
        !alien.movingRight
      );
    }
    if (human.front === front) {
      drawShipSprite(
        scene,
        front ? sprites.human : sprites.humanFar,
        human.x,
        human.y,
        SHIP_W,
        SHIP_H,
        !human.movingRight
      );
    }
  };

  drawShips(false);
  drawBolts(false);

  // Écusson : pause face au spectateur, puis demi-tour sur l'axe vertical
  // (easeInOutCubic).
  const cycle = t % SPIN_PERIOD;
  const halfTurns = Math.floor(t / SPIN_PERIOD);
  let progress = 0;
  if (cycle > SPIN_HOLD) {
    const u = (cycle - SPIN_HOLD) / (SPIN_PERIOD - SPIN_HOLD);
    progress = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
  }
  const cos = Math.cos(Math.PI * (halfTurns + progress));
  const facing = Math.abs(cos);
  const crest = cos >= 0 ? sprites.crestFront : sprites.crestBack;

  scene.save();
  scene.translate(CX, CY);
  // Tranche dorée, un peu plus large que la face, dessinée seulement pendant
  // la rotation pour garder l'écusson net au repos.
  if (facing < 0.97) {
    const rimScale = facing + 2.5 / CREST_W;
    scene.save();
    scene.scale(rimScale, 1);
    scene.drawImage(sprites.crestRim, -CREST_W / 2, -CREST_H / 2);
    scene.restore();
  }
  if (facing > 0.06) {
    // Échelle non signée : le motif n'est jamais inversé, quelle que soit la
    // face.
    scene.scale(facing, 1);
    scene.drawImage(crest[twinkle], -CREST_W / 2, -CREST_H / 2);
  }
  scene.restore();

  drawBolts(true);
  drawShips(true);
}

type PixelLogoProps = {
  /** Taille du logo en px CSS ; le canvas déborde pour l'orbite. */
  size: number;
  /** Menu principal : les tirs laser ratés s'échappent et traversent l'écran. */
  fx?: boolean;
};

export default function PixelLogo({ size, fx = false }: PixelLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const screenRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));
    const cssSize = size * 1.5;
    const backing = Math.round(cssSize * dpr);
    canvas.width = backing;
    canvas.height = backing;

    const sprites = buildSprites();
    const sceneCanvas = document.createElement("canvas");
    sceneCanvas.width = SCENE;
    sceneCanvas.height = SCENE;
    const sceneCtx = sceneCanvas.getContext("2d")!;

    // Calque des tirs qui traversent l'écran (menu principal seulement).
    const screenCanvas = screenRef.current;
    const screenCtx = screenCanvas?.getContext("2d") ?? null;
    const screenBolts: ScreenBolt[] = [];
    const sizeScreen = () => {
      if (!screenCanvas) return;
      screenCanvas.width = Math.round(window.innerWidth * dpr);
      screenCanvas.height = Math.round(window.innerHeight * dpr);
    };
    sizeScreen();
    if (screenCanvas) window.addEventListener("resize", sizeScreen);

    const bolts: Bolt[] = [];
    let lastBurst = -Infinity;
    let burstShots = 0;
    let nextShotAt = 0;

    const fireBolt = (t: number) => {
      const alien = orbitPos(t * SHIP_OMEGA);
      const human = orbitPos(t * SHIP_OMEGA - CHASE_GAP);
      // Une partie des tirs part à côté de la soucoupe : ce sont eux qui
      // peuvent sortir du logo.
      const miss = Math.random() < 0.45;
      const wide = miss ? (Math.random() < 0.5 ? -1 : 1) * (2.5 + Math.random() * 2) : 0;
      const dx = alien.x - human.x;
      const dy = alien.y - human.y;
      const len = Math.hypot(dx, dy) || 1;
      // Décalage perpendiculaire des tirs ratés.
      const px = (-dy / len) * wide;
      const py = (dx / len) * wide;
      const tx = dx + px;
      const ty = dy + py;
      const tlen = Math.hypot(tx, ty) || 1;
      bolts.push({
        x: human.x + (tx / tlen) * 4,
        y: human.y + (ty / tlen) * 2,
        vx: (tx / tlen) * BOLT_SPEED,
        vy: (ty / tlen) * BOLT_SPEED,
        front: human.front,
        miss,
      });
    };

    const stepBolts = (t: number, dt: number) => {
      // Rafales de deux tirs à rythme régulier.
      if (t - lastBurst >= BURST_EVERY) {
        lastBurst = t;
        burstShots = 2;
        nextShotAt = t;
      }
      if (burstShots > 0 && t >= nextShotAt) {
        fireBolt(t);
        burstShots--;
        nextShotAt = t + 0.14;
      }

      const alien = orbitPos(t * SHIP_OMEGA);
      for (let i = bolts.length - 1; i >= 0; i--) {
        const b = bolts[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        // Soucoupe touchée : le tir disparaît.
        if (!b.miss && Math.hypot(b.x - alien.x, b.y - alien.y) < 3) {
          bolts.splice(i, 1);
          continue;
        }
        const out =
          b.x < -2 || b.x > SCENE + 2 || b.y < -2 || b.y > SCENE + 2;
        if (!out) continue;
        bolts.splice(i, 1);
        // Les tirs ratés sortent du logo et traversent l'écran.
        if (
          screenCtx &&
          b.miss &&
          screenBolts.length < MAX_SCREEN_BOLTS
        ) {
          const rect = canvas.getBoundingClientRect();
          const artScale = rect.width / SCENE;
          const vlen = Math.hypot(b.vx, b.vy) || 1;
          screenBolts.push({
            x: rect.left + b.x * artScale,
            y: rect.top + b.y * artScale,
            vx: (b.vx / vlen) * SCREEN_BOLT_SPEED,
            vy: (b.vy / vlen) * SCREEN_BOLT_SPEED,
          });
        }
      }
    };

    const drawScreenBolts = (dt: number) => {
      if (!screenCtx || !screenCanvas) return;
      screenCtx.clearRect(0, 0, screenCanvas.width, screenCanvas.height);
      if (screenBolts.length === 0) return;
      const rect = canvas.getBoundingClientRect();
      const artScale = Math.max(2, rect.width / SCENE);
      for (let i = screenBolts.length - 1; i >= 0; i--) {
        const b = screenBolts[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        const margin = 80;
        if (
          b.x < -margin ||
          b.x > window.innerWidth + margin ||
          b.y < -margin ||
          b.y > window.innerHeight + margin
        ) {
          screenBolts.splice(i, 1);
          continue;
        }
        screenCtx.save();
        screenCtx.scale(dpr, dpr);
        screenCtx.translate(b.x, b.y);
        screenCtx.rotate(Math.atan2(b.vy, b.vx));
        screenCtx.imageSmoothingEnabled = false;
        // Tir en pixels d'art : cœur brillant et traîne plus sombre.
        screenCtx.fillStyle = PALETTE.C;
        screenCtx.fillRect(0, -artScale / 2, artScale * 3, artScale);
        screenCtx.fillStyle = PALETTE.c;
        screenCtx.fillRect(-artScale * 2, -artScale / 2, artScale * 2, artScale);
        screenCtx.restore();
      }
    };

    const render = (t: number, dt: number) => {
      stepBolts(t, dt);
      drawScene(sceneCtx, sprites, t, bolts);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, backing, backing);
      ctx.drawImage(sceneCanvas, 0, 0, backing, backing);
      drawScreenBolts(dt);
    };

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reducedMotion) {
      // Pose fixe : écusson de face, deux vaisseaux visibles.
      drawScene(sceneCtx, sprites, Math.PI / (2 * SHIP_OMEGA), []);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(sceneCanvas, 0, 0, backing, backing);
      if (screenCanvas) window.removeEventListener("resize", sizeScreen);
      return;
    }

    const start = performance.now();
    let prev = 0;
    const interval = window.setInterval(() => {
      const t = (performance.now() - start) / 1000;
      render(t, Math.min(t - prev, 0.2));
      prev = t;
    }, TICK_MS);
    render(0, 0);

    return () => {
      window.clearInterval(interval);
      if (screenCanvas) window.removeEventListener("resize", sizeScreen);
    };
  }, [size, fx]);

  const glow = Math.max(4, Math.round(size / 14));
  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: size * 1.5,
          height: size * 1.5,
          imageRendering: "pixelated",
          filter: `drop-shadow(0 0 ${glow}px rgba(0,240,255,0.28))`,
        }}
      />
      {fx && (
        <canvas
          ref={screenRef}
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            width: "100vw",
            height: "100vh",
            pointerEvents: "none",
            zIndex: 40,
            imageRendering: "pixelated",
          }}
        />
      )}
    </>
  );
}
