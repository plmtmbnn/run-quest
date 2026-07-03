import { describe, expect, it } from "vitest";
import {
  calculatePreparationScore,
  detectActiveSynergies,
} from "@/engine/scoring/preparation-score";
import { generateDailyRaceBoard } from "@/services/challenge/generator";
import type { Preparation } from "@/types/engine";

describe("Preparation Synergies & Anti-synergies", () => {
  const basePrep: Preparation = {
    shoes: "daily_trainer",
    nutrition: ["water"],
    gear: [],
    warmup: "dynamic",
    pacing: "steady",
    mindset: "calm",
  };

  it("should detect Zen Runner synergy for calm mindset, conservative pacing, and warmup", () => {
    const prep: Preparation = {
      ...basePrep,
      mindset: "calm",
      pacing: "conservative",
      warmup: "dynamic",
    };
    const active = detectActiveSynergies(prep, "road", "sunny");
    expect(active).toContain("zen_runner");

    const mods = calculatePreparationScore(prep, "road", "sunny");
    // Zen runner fatigueModifier penalty should be reduced (-1.0)
    expect(mods.fatigueModifier).toBeLessThan(0);
  });

  it("should detect Speed Demon synergy for aggressive pacing, carbon shoes, and caffeine", () => {
    const prep: Preparation = {
      ...basePrep,
      shoes: "carbon_racer",
      pacing: "aggressive",
      nutrition: ["caffeine"],
    };
    const active = detectActiveSynergies(prep, "road", "sunny");
    expect(active).toContain("speed_demon");

    const mods = calculatePreparationScore(prep, "road", "sunny");
    // Base carbon racer pace mod (-15) + aggressive (-12) + caffeine (-8) + warmup dynamic (-2) + speed demon (-12) = -49s/km
    expect(mods.basePaceModifier).toBe(-49);
    expect(mods.fatigueModifier).toBeGreaterThan(6); // high fatigue penalty
  });

  it("should detect Injury Risk anti-synergy if carbon racers are worn with no warmup", () => {
    const prep: Preparation = {
      ...basePrep,
      shoes: "carbon_racer",
      warmup: "none",
    };
    const active = detectActiveSynergies(prep, "road", "sunny");
    expect(active).toContain("injury_risk");

    const mods = calculatePreparationScore(prep, "road", "sunny");
    // Injury risk adds 8s/km penalty
    expect(mods.basePaceModifier).toBeGreaterThan(-15); // carbon racer bonus is mitigated by warmup penalty (+6) and injury risk (+8)
  });
});

describe("Daily Board Themes & Rarities", () => {
  it("should generate a board with procedurally assigned themes and scaled rewards", () => {
    const board = generateDailyRaceBoard("2026-07-03");

    expect(board).toHaveProperty("theme");
    expect(board.theme).toBeTruthy();
    expect(board.theme?.rewardMultiplier).toBeGreaterThan(1.0);

    // Check scaled rewards
    for (const entry of board.entries) {
      expect(entry.reward).toBeGreaterThan(100);
      expect(entry.scenario.objective.bonusCondition).toBeTruthy();
    }
  });
});
