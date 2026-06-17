"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Pixel-art 3D brand logo — Nebula Command.
 *
 * The scene is rendered at a deliberately tiny internal resolution
 * (PIXEL_RES²) then upscaled with `image-rendering: pixelated`, which gives
 * true chunky pixels. Everything is flat-shaded and low-poly so the facets
 * read like pixel clusters, and the palette sticks to the nebula theme
 * (cyan / orange / gold / dark blue).
 *
 * Composition:
 *  - the fleet crest (voxel shield: gold border, night-blue field, cyan star)
 *    spinning on its axis like a planet, with a slight axial tilt and a slow
 *    gravitational wobble around the barycenter
 *  - an inner cyan ring + an outer ring with 4 cube satellites, both rotating
 *    on crossing axes
 *  - a voxel ship that orbits the whole logo on a tilted path, nose forward
 *
 * Hovering the logo eases the animation to a stop (and back).
 */

// Internal render resolution. High enough that the crest motif is crisp and
// readable — the pixel-art feel comes from the voxel geometry itself, the
// upscale only adds a faint grain at large display sizes.
const PIXEL_RES = 288;

const PALETTE = {
  cyan: 0x00f0ff,
  darkBlue: 0x1a2744,
  orange: 0xff6b2c,
  gold: 0xffc844,
  hull: 0xc8d6f0,
  night: 0x0a1628,
} as const;

/**
 * Fleet crest bitmap — 1 char = 1 voxel.
 * A = gold border, B = night-blue field, C = cyan code emblem,
 * D = orange star, . = empty.
 *
 * Motif: an orange star (l'espace) shining above the `</>` symbol (le code) —
 * the fleet's coat of arms. Classic écusson silhouette, tapering to a point.
 */
const CREST_BITMAP = [
  ".AAAAAAAAAAAAA.",
  "AABBBBBBBBBBBAA",
  "ABBBBBBDBBBBBBA",
  "ABBBBBDDDBBBBBA",
  "ABBBBBBDBBBBBBA",
  "ABBDBBBBBBBDBBA",
  "ABBBCBBBCBCBBBA",
  "ABBCBBBBCBBCBBA",
  "ABCBBBBCBBBBCBA",
  "ABBCBBCBBBBCBBA",
  "ABBBCBCBBBCBBBA",
  "ABBBBBBBBBBBBBA",
  ".ABBBBBBBBBBBA.",
  "..ABBBBBBBBBA..",
  "...ABBBBBBBA...",
  "....ABBBBBA....",
  ".....ABBBA.....",
  "......AAA......",
];

const CREST_VOXEL = 0.145;

/**
 * Builds the fleet crest as 3 InstancedMeshes (one per colour) from the
 * bitmap above — true voxel pixel-art, cheap to render.
 */
function buildCrest(): THREE.Group {
  const crest = new THREE.Group();

  const materials: Record<string, THREE.MeshStandardMaterial> = {
    A: new THREE.MeshStandardMaterial({
      color: PALETTE.gold,
      metalness: 0.8,
      roughness: 0.3,
      flatShading: true,
    }),
    B: new THREE.MeshStandardMaterial({
      color: PALETTE.darkBlue,
      metalness: 0.5,
      roughness: 0.5,
      flatShading: true,
    }),
    C: new THREE.MeshStandardMaterial({
      color: PALETTE.cyan,
      emissive: PALETTE.cyan,
      emissiveIntensity: 0.8,
      flatShading: true,
    }),
    D: new THREE.MeshStandardMaterial({
      color: PALETTE.orange,
      emissive: PALETTE.orange,
      emissiveIntensity: 0.9,
      flatShading: true,
    }),
  };

  // Collect voxel positions per colour.
  const positions: Record<string, Array<[number, number]>> = { A: [], B: [], C: [], D: [] };
  const rows = CREST_BITMAP.length;
  const cols = CREST_BITMAP[0].length;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const ch = CREST_BITMAP[r][c];
      if (ch in positions) positions[ch].push([c, r]);
    }
  }

  const voxelGeometry = new THREE.BoxGeometry(CREST_VOXEL, CREST_VOXEL, CREST_VOXEL * 1.6);
  const dummy = new THREE.Object3D();

  for (const key of ["A", "B", "C", "D"] as const) {
    const list = positions[key];
    const instanced = new THREE.InstancedMesh(voxelGeometry, materials[key], list.length);
    list.forEach(([c, r], i) => {
      dummy.position.set(
        (c - (cols - 1) / 2) * CREST_VOXEL,
        ((rows - 1) / 2 - r) * CREST_VOXEL,
        // The emblem (code + star) pops out slightly from the field.
        key === "C" || key === "D" ? CREST_VOXEL * 0.3 : 0
      );
      dummy.updateMatrix();
      instanced.setMatrixAt(i, dummy.matrix);
    });
    instanced.instanceMatrix.needsUpdate = true;
    crest.add(instanced);
  }

  return crest;
}

/** Tiny voxel spaceship built from boxes (pixel-art friendly). */
function buildShip(): THREE.Group {
  const ship = new THREE.Group();

  const hullMat = new THREE.MeshStandardMaterial({
    color: PALETTE.hull,
    flatShading: true,
    roughness: 0.6,
    metalness: 0.3,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: PALETTE.orange,
    flatShading: true,
    roughness: 0.5,
    metalness: 0.4,
  });
  const cockpitMat = new THREE.MeshStandardMaterial({
    color: PALETTE.cyan,
    emissive: PALETTE.cyan,
    emissiveIntensity: 0.9,
    flatShading: true,
  });
  const engineMat = new THREE.MeshStandardMaterial({
    color: PALETTE.orange,
    emissive: PALETTE.orange,
    emissiveIntensity: 1.4,
    flatShading: true,
  });

  // Hull — elongated along +X (direction of travel).
  const hull = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.11, 0.14), hullMat);
  ship.add(hull);

  // Nose cap.
  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.1), accentMat);
  nose.position.x = 0.25;
  ship.add(nose);

  // Cockpit canopy.
  const cockpit = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 0.1), cockpitMat);
  cockpit.position.set(0.06, 0.09, 0);
  ship.add(cockpit);

  // Wings (single flat box crossing the hull).
  const wings = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.03, 0.46), accentMat);
  wings.position.x = -0.08;
  ship.add(wings);

  // Wingtip lights.
  const tipGeo = new THREE.BoxGeometry(0.06, 0.05, 0.06);
  const tipL = new THREE.Mesh(tipGeo, cockpitMat);
  tipL.position.set(-0.08, 0, 0.25);
  const tipR = tipL.clone();
  tipR.position.z = -0.25;
  ship.add(tipL, tipR);

  // Engine block + glow.
  const engine = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.09, 0.11), engineMat);
  engine.position.x = -0.26;
  ship.add(engine);

  return ship;
}

export default function ThreeLogoCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isHoveredRef = useRef(false);
  const speedRef = useRef(1);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Hover is tracked on the BrandLogo wrapper for a larger hit zone.
    const parentContainer = container.parentElement || container;
    const onMouseEnter = () => {
      isHoveredRef.current = true;
    };
    const onMouseLeave = () => {
      isHoveredRef.current = false;
    };
    parentContainer.addEventListener("mouseenter", onMouseEnter);
    parentContainer.addEventListener("mouseleave", onMouseLeave);

    // 1. Scene & camera — square frame, wide enough for the ship's orbit.
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    // Far enough that the ship's full orbit (radius 2.6 + hull) always stays
    // inside the square frustum — the ship is never clipped by the canvas.
    camera.position.z = 6.3;

    // 2. Renderer — LOW internal resolution + nearest-neighbour upscale
    //    = real pixel-art look. No antialias, ever.
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(1);
    renderer.setSize(PIXEL_RES, PIXEL_RES, false);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.imageRendering = "pixelated";
    container.appendChild(renderer.domElement);

    // 3. Core — the fleet crest, spinning on its axis like a planet
    //    (continuous Y spin + slight axial tilt) AND gravitating around the
    //    barycenter (small circular drift).
    const core = buildCrest();
    core.rotation.z = 0.1; // axial tilt, planet-style
    scene.add(core);

    // 4. Inner ring — chunky square cross-section (radialSegments: 4) and few
    //    tubular segments so the facets look voxelised.
    const innerRingGeometry = new THREE.TorusGeometry(1.55, 0.07, 4, 26);
    const innerRingMaterial = new THREE.MeshStandardMaterial({
      color: PALETTE.cyan,
      emissive: PALETTE.cyan,
      emissiveIntensity: 0.55,
      roughness: 0.3,
      metalness: 0.5,
      flatShading: true,
    });
    const innerRing = new THREE.Mesh(innerRingGeometry, innerRingMaterial);
    innerRing.rotation.x = Math.PI / 3.2;
    scene.add(innerRing);

    // 5. Outer ring — darker, with 4 cube satellites at 90°.
    const outerRingGeometry = new THREE.TorusGeometry(2.15, 0.05, 4, 34);
    const outerRingMaterial = new THREE.MeshStandardMaterial({
      color: PALETTE.darkBlue,
      emissive: PALETTE.cyan,
      emissiveIntensity: 0.18,
      roughness: 0.4,
      metalness: 0.7,
      flatShading: true,
    });
    const outerRing = new THREE.Mesh(outerRingGeometry, outerRingMaterial);
    outerRing.rotation.x = -Math.PI / 5;
    outerRing.rotation.y = Math.PI / 9;
    scene.add(outerRing);

    const satelliteGeometry = new THREE.BoxGeometry(0.14, 0.14, 0.14);
    const satelliteMaterial = new THREE.MeshStandardMaterial({
      color: PALETTE.cyan,
      emissive: PALETTE.cyan,
      emissiveIntensity: 1.0,
      flatShading: true,
    });
    for (let i = 0; i < 4; i++) {
      const satellite = new THREE.Mesh(satelliteGeometry, satelliteMaterial);
      const angle = (i * Math.PI) / 2;
      satellite.position.set(Math.cos(angle) * 2.15, Math.sin(angle) * 2.15, 0);
      outerRing.add(satellite);
    }

    // 6. Ship — orbits the whole logo on a tilted plane, nose forward.
    const shipOrbit = new THREE.Group();
    shipOrbit.rotation.z = Math.PI / 14;
    shipOrbit.rotation.x = Math.PI / 7;
    scene.add(shipOrbit);

    const ship = buildShip();
    ship.scale.setScalar(1.05);
    shipOrbit.add(ship);
    const SHIP_RADIUS = 2.6;
    let shipAngle = Math.PI / 3;

    // 7. Lights — cyan key from the front, orange rim, dark-blue ambient.
    const ambientLight = new THREE.AmbientLight(PALETTE.night, 2.2);
    scene.add(ambientLight);

    const rimLight = new THREE.DirectionalLight(PALETTE.orange, 3.8);
    rimLight.position.set(3, 4, 2);
    scene.add(rimLight);

    const keyLight = new THREE.PointLight(PALETTE.cyan, 6.5, 15);
    keyLight.position.set(0, 0, 3);
    scene.add(keyLight);

    // 8. Animation loop.
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Ease the global speed toward 0 on hover, back to 1 on leave.
      const targetSpeed = isHoveredRef.current ? 0 : 1;
      speedRef.current = THREE.MathUtils.lerp(speedRef.current, targetSpeed, 0.07);
      const speed = speedRef.current;
      const time = Date.now() * 0.001;

      // Crest: planet-like spin on its (tilted) axis + gravitation around
      // the barycenter.
      core.rotation.y += 0.012 * speed;
      core.position.x = Math.cos(time * 0.8) * 0.09 * speed;
      core.position.y = Math.sin(time * 1.1) * 0.07 * speed;

      // Rings: crossing rotations.
      innerRing.rotation.z -= 0.012 * speed;
      innerRing.rotation.y += 0.004 * speed;
      outerRing.rotation.z += 0.007 * speed;
      outerRing.rotation.y += 0.002 * speed;

      // Ship: circular orbit in the tilted plane, nose along the path.
      shipAngle += 0.016 * speed;
      ship.position.set(
        Math.cos(shipAngle) * SHIP_RADIUS,
        0,
        Math.sin(shipAngle) * SHIP_RADIUS
      );
      ship.rotation.y = -shipAngle - Math.PI / 2;
      // Light banking into the turn.
      ship.rotation.z = Math.PI / 16;

      // Key light slowly orbits for moving glints.
      keyLight.position.x = Math.sin(time * 1.8) * 2.5;
      keyLight.position.z = Math.cos(time * 1.8) * 2.5;

      renderer.render(scene, camera);
    };

    animate();

    // 9. Clean-up — dispose everything reachable from the scene.
    return () => {
      cancelAnimationFrame(animationFrameId);
      parentContainer.removeEventListener("mouseenter", onMouseEnter);
      parentContainer.removeEventListener("mouseleave", onMouseLeave);

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          if (obj instanceof THREE.InstancedMesh) obj.dispose();
          obj.geometry.dispose();
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => m.dispose());
        }
      });
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full flex items-center justify-center"
      style={{ minWidth: "100%", minHeight: "100%" }}
    />
  );
}
