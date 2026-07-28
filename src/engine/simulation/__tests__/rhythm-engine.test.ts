import { describe, expect, it } from "vitest";
import {
  calculateTargetSPM,
  createInitialRhythmState,
  evaluateRhythmHit,
} from "@/engine/simulation/rhythm-engine";

describe("Cadence & Rhythm Engine", () => {
  it("calculates target SPM within 170-180 range", () => {
    expect(calculateTargetSPM(10)).toBe(170);
    expect(calculateTargetSPM(20)).toBe(175);
    expect(calculateTargetSPM(30)).toBe(180);
    expect(calculateTargetSPM(50)).toBe(180); // Max clamped at 180
  });

  it("evaluates perfect hits (<= 25ms)", () => {
    const result = evaluateRhythmHit(15, 0);
    expect(result.accuracy).toBe("perfect");
    expect(result.efficiencyBoost).toBe(0.02);
    expect(result.comboCount).toBe(1);
  });

  it("evaluates good hits (26-50ms)", () => {
    const result = evaluateRhythmHit(40, 2);
    expect(result.accuracy).toBe("good");
    expect(result.efficiencyBoost).toBe(0.01);
    expect(result.comboCount).toBe(3);
  });

  it("evaluates misses (> 50ms) and resets combo", () => {
    const result = evaluateRhythmHit(75, 5);
    expect(result.accuracy).toBe("miss");
    expect(result.efficiencyBoost).toBe(0);
    expect(result.comboCount).toBe(0);
  });

  it("applies combo bonus at 10+ consecutive hits", () => {
    const result = evaluateRhythmHit(10, 9);
    expect(result.accuracy).toBe("perfect");
    expect(result.comboCount).toBe(10);
    // Base 0.02 + combo bonus 0.03 = 0.05
    expect(result.efficiencyBoost).toBe(0.05);
  });

  it("initializes initial rhythm state properly", () => {
    const state = createInitialRhythmState(14);
    expect(state.spm).toBe(172);
    expect(state.comboCount).toBe(0);
    expect(state.activeEfficiencyBoost).toBe(0);
    expect(state.isMinimized).toBe(false);
  });
});
