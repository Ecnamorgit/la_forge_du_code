import { describe, it, expect } from "vitest";
import { combatThemeForCourse } from "./combat-theme";

describe("combatThemeForCourse", () => {
  it("html → repair", () => {
    expect(combatThemeForCourse("html")).toBe("repair");
  });
  it("css → field", () => {
    expect(combatThemeForCourse("css")).toBe("field");
  });
  it("javascript → turret", () => {
    expect(combatThemeForCourse("javascript")).toBe("turret");
  });
  it("tout autre cursus tombe sur turret par défaut", () => {
    expect(combatThemeForCourse("sql")).toBe("turret");
    expect(combatThemeForCourse("react")).toBe("turret");
    expect(combatThemeForCourse("typescript")).toBe("turret");
  });
});
