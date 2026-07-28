import { describe, expect, it } from "vitest";
import {
  calculateBodyStress,
  getStressLevel,
} from "@/engine/simulation/body-stress-engine";
import type { SimulationState } from "@/types/engine";

describe("Body Stress Engine", () => {
  it("determines stress level thresholds correctly", () => {
    expect(getStressLevel(15)).toBe("normal");
    expect(getStressLevel(45)).toBe("fatigued");
    expect(getStressLevel(75)).toBe("stressed");
    expect(getStressLevel(90)).toBe("critical");
  });

  it("calculates body stress for all 6 body zones", () => {
    const mockState: Partial<SimulationState> = {
      mentalFatigue: 50,
      muscleFatigue: 40,
      focus: 80,
      hydration: 70,
      energy: 60,
      fatigue: 35,
      riskLevel: 25,
      distanceCovered: 5,
      totalDistance: 10,
    };

    const stress = calculateBodyStress(mockState as SimulationState);

    expect(stress.head.percentage).toBeGreaterThan(0);
    expect(stress.lungs.percentage).toBe(35); // (30 * 0.5 + 40 * 0.5)
    expect(stress.core.percentage).toBeGreaterThan(0);
    expect(stress.quads.percentage).toBe(34); // (40 * 0.85)
    expect(stress.calves.percentage).toBe(30); // (40 * 0.75)
    expect(stress.feet.percentage).toBeGreaterThan(0);
  });

  it("maps active breaking point injuries to affected body zones", () => {
    const mockState: Partial<SimulationState> = {
      mentalFatigue: 20,
      muscleFatigue: 30,
      activeBreakingPoint: {
        breakingPoint: {
          id: "cramp_quads",
          type: "cramp",
          severity: "critical",
          trigger: () => true,
          onsetMessage: { en: "Severe quad cramp!", id: "Severe quad cramp!" },
          symptoms: { en: "Cramping", id: "Cramping" },
          effects: {},
          recoveryOptions: [],
          priority: 1,
        },
        km: 3,
        timestamp: Date.now(),
        resolved: false,
      },
    };

    const stress = calculateBodyStress(mockState as SimulationState);

    expect(stress.quads.hasInjury).toBe(true);
    expect(stress.quads.level).toBe("critical");
    expect(stress.quads.injuryMessage).toBe("Severe quad cramp!");
  });
});
