import { describe, expect, it } from "vitest";

import { streakMultiplier } from "./quiz";

describe("streakMultiplier", () => {
  it("grows by a quarter per correct answer like /quiz in the bot", () => {
    expect([1, 2, 3, 4].map(streakMultiplier)).toEqual([1, 1.25, 1.5, 1.75]);
  });

  it("stops at ×3", () => {
    expect(streakMultiplier(9)).toBe(3);
    expect(streakMultiplier(50)).toBe(3);
  });
});
