import { describe, expect, it } from "vitest";

import { TRACK_EVENTS, isTrackEvent } from "./track";

describe("isTrackEvent", () => {
  it("accepts the three funnel events", () => {
    expect(TRACK_EVENTS).toEqual(["landing_vue", "essai_lance", "inscription"]);
    for (const name of TRACK_EVENTS) {
      expect(isTrackEvent(name)).toBe(true);
    }
  });

  it("rejects everything else", () => {
    expect(isTrackEvent("autre_chose")).toBe(false);
    expect(isTrackEvent("")).toBe(false);
    expect(isTrackEvent(null)).toBe(false);
    expect(isTrackEvent(42)).toBe(false);
    expect(isTrackEvent({ name: "landing_vue" })).toBe(false);
  });
});
