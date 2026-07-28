import { describe, expect, it } from "vitest";

describe("Parallax Environment Logic", () => {
  const getSpeedMultiplier = (pacingPlan: string): number => {
    switch (pacingPlan) {
      case "sprint":
        return 2.0;
      case "push":
      case "aggressive":
        return 1.5;
      case "jog":
      case "conservative":
        return 0.5;
      default:
        return 1.0;
    }
  };

  const getEnvironmentType = (surface: string, override?: string): string => {
    if (override) return override;
    switch (surface) {
      case "road":
        return "road";
      case "trail":
        return "trail";
      case "track":
        return "stadium";
      default:
        return "road";
    }
  };

  it("maps surface to environment type correctly", () => {
    expect(getEnvironmentType("track")).toBe("stadium");
    expect(getEnvironmentType("road")).toBe("road");
    expect(getEnvironmentType("trail")).toBe("trail");
    expect(getEnvironmentType("road", "beach")).toBe("beach");
  });

  it("calculates pacing speed multipliers correctly", () => {
    expect(getSpeedMultiplier("sprint")).toBe(2.0);
    expect(getSpeedMultiplier("push")).toBe(1.5);
    expect(getSpeedMultiplier("cruise")).toBe(1.0);
    expect(getSpeedMultiplier("jog")).toBe(0.5);
  });
});
