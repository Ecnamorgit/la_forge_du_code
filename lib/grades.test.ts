import { describe, it, expect } from "vitest";
import {
  GRADES,
  gradeFromXp,
  levelFromXp,
  nextGrade,
  xpIntoGrade,
} from "./grades";

describe("gradeFromXp", () => {
  it("démarre au grade Cadet", () => {
    expect(gradeFromXp(0).id).toBe("cadet");
    expect(gradeFromXp(399).id).toBe("cadet");
  });

  it("passe Aspirant au seuil exact", () => {
    expect(gradeFromXp(400).id).toBe("aspirant");
  });

  it("continue à progresser au-delà de 1000 XP, contrairement à l'ancien rang Or", () => {
    expect(gradeFromXp(1000).id).toBe("aspirant");
    expect(gradeFromXp(2500).id).toBe("lieutenant");
    expect(gradeFromXp(7000).id).toBe("capitaine");
  });

  it("atteint Amiral seulement au-delà des 9312 XP du cursus", () => {
    expect(gradeFromXp(9312).id).not.toBe("amiral");
    expect(gradeFromXp(10000).id).toBe("amiral");
  });
});

describe("nextGrade", () => {
  it("annonce le grade suivant", () => {
    expect(nextGrade(0)?.id).toBe("aspirant");
  });

  it("retourne null au dernier grade", () => {
    expect(nextGrade(10000)).toBeNull();
  });
});

describe("xpIntoGrade", () => {
  it("mesure l'avancée dans le grade courant", () => {
    expect(xpIntoGrade(600)).toEqual({ current: 200, span: 800 });
  });

  it("rend une barre pleine au dernier grade", () => {
    const { current, span } = xpIntoGrade(12000);
    expect(current).toBe(span);
  });
});

describe("levelFromXp", () => {
  it("démarre au niveau 1", () => {
    expect(levelFromXp(0)).toBe(1);
  });

  it("monte vite au début", () => {
    expect(levelFromXp(16)).toBe(2);
    expect(levelFromXp(64)).toBe(3);
  });

  it("plafonne à 25 au bout du cursus, pas à 94", () => {
    expect(levelFromXp(9312)).toBe(25);
  });

  it("ne recule jamais quand l'XP monte", () => {
    let prev = 0;
    for (let xp = 0; xp <= 12000; xp += 137) {
      const lvl = levelFromXp(xp);
      expect(lvl).toBeGreaterThanOrEqual(prev);
      prev = lvl;
    }
  });
});

describe("GRADES", () => {
  it("est trié par seuil croissant", () => {
    const seuils = GRADES.map((g) => g.threshold);
    expect([...seuils].sort((a, b) => a - b)).toEqual(seuils);
  });
});
