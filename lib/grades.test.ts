import { describe, it, expect } from "vitest";
import {
  GRADES,
  gradeFromXp,
  levelFromXp,
  nextGrade,
  xpIntoGrade,
} from "./grades";

describe("gradeFromXp", () => {
  it("starts at the Cadet grade", () => {
    expect(gradeFromXp(0).id).toBe("cadet");
    expect(gradeFromXp(399).id).toBe("cadet");
  });

  it("reaches Aspirant at the exact threshold", () => {
    expect(gradeFromXp(400).id).toBe("aspirant");
  });

  it("keeps progressing beyond 1000 XP, unlike the old Or rank", () => {
    expect(gradeFromXp(1000).id).toBe("aspirant");
    expect(gradeFromXp(2500).id).toBe("lieutenant");
    expect(gradeFromXp(7000).id).toBe("capitaine");
  });

  it("reaches Amiral only beyond the course's 9312 XP", () => {
    expect(gradeFromXp(9312).id).not.toBe("amiral");
    expect(gradeFromXp(10000).id).toBe("amiral");
  });
});

describe("nextGrade", () => {
  it("announces the next grade", () => {
    expect(nextGrade(0)?.id).toBe("aspirant");
  });

  it("returns null at the last grade", () => {
    expect(nextGrade(10000)).toBeNull();
  });
});

describe("xpIntoGrade", () => {
  it("measures progress within the current grade", () => {
    expect(xpIntoGrade(600)).toEqual({ current: 200, span: 800 });
  });

  it("returns a full bar at the last grade", () => {
    const { current, span } = xpIntoGrade(12000);
    expect(current).toBe(span);
  });
});

describe("levelFromXp", () => {
  it("starts at level 1", () => {
    expect(levelFromXp(0)).toBe(1);
  });

  it("rises quickly at first", () => {
    expect(levelFromXp(16)).toBe(2);
    expect(levelFromXp(64)).toBe(3);
  });

  it("tops out at 25 at the end of the course, not 94", () => {
    expect(levelFromXp(9312)).toBe(25);
  });

  it("never goes down as XP rises", () => {
    let prev = 0;
    for (let xp = 0; xp <= 12000; xp += 137) {
      const lvl = levelFromXp(xp);
      expect(lvl).toBeGreaterThanOrEqual(prev);
      prev = lvl;
    }
  });
});

describe("GRADES", () => {
  it("is sorted by ascending threshold", () => {
    const thresholds = GRADES.map((g) => g.threshold);
    expect([...thresholds].sort((a, b) => a - b)).toEqual(thresholds);
  });
});
