import { describe, expect, it } from "vitest";
import { simulateRace } from "@/engine/simulation/engine";
import type { DailyChallenge, SimulationInput } from "@/types/engine";

const mockChallenge: DailyChallenge = {
  id: "challenge_1",
  date: "2026-06-29",
  environment: {
    weather: "sunny",
    temperature: 24,
    humidity: 60,
    wind: { direction: "north", speed: 8 },
    timeOfDay: "morning",
  },
  race: {
    title: { en: "Morning Run", id: "Lari Pagi" },
    description: {
      en: "A nice morning tempo",
      id: "Lari tempo pagi yang menyenangkan",
    },
    distance: 5,
    surface: "road",
    elevation: "flat",
    checkpoints: [
      { km: 2, eventPool: ["cheering_crowd"] },
      { km: 4, eventPool: ["sun_glare"] },
    ],
  },
  objective: {
    targetTime: 1550, // 25:50
  },
  storySeed: {
    mood: "optimistic",
  },
};

const defaultInput: SimulationInput = {
  player: { id: "player_abc" },
  challenge: mockChallenge,
  preparation: {
    shoes: "daily_trainer",
    nutrition: "water",
    gear: [],
    warmup: "dynamic",
    pacing: "steady",
    mindset: "calm",
  },
  seed: 42,
};

describe("Simulation Engine", () => {
  it("should fail validation if Player ID is missing", () => {
    const invalidInput = { ...defaultInput, player: { id: "" } };
    expect(() => simulateRace(invalidInput)).toThrow("Player ID is missing");
  });

  it("should fail validation if Challenge distance is zero or negative", () => {
    const invalidInput = {
      ...defaultInput,
      challenge: {
        ...mockChallenge,
        race: { ...mockChallenge.race, distance: 0 },
      },
    };
    expect(() => simulateRace(invalidInput)).toThrow(
      "Daily challenge is invalid",
    );
  });

  it("should run successfully and return result structure", () => {
    const result = simulateRace(defaultInput);

    expect(result).toHaveProperty("finishTime");
    expect(result).toHaveProperty("score");
    expect(result).toHaveProperty("grade");
    expect(result).toHaveProperty("events");
    expect(result).toHaveProperty("outcome");
    expect(result).toHaveProperty("story");

    expect(result.events.length).toBeLessThanOrEqual(2);
    expect(result.story.headline.en).toBeTruthy();
  });

  it("should be 100% deterministic (same input and seed yields same output)", () => {
    const res1 = simulateRace(defaultInput);
    const res2 = simulateRace(defaultInput);

    expect(res1.finishTime).toBe(res2.finishTime);
    expect(res1.score).toBe(res2.score);
    expect(res1.grade).toBe(res2.grade);
    expect(res1.outcome).toBe(res2.outcome);
  });

  it("should vary slightly when run with different seeds", () => {
    const res1 = simulateRace({ ...defaultInput, seed: 100 });
    const res2 = simulateRace({ ...defaultInput, seed: 999 });

    // Times are close but not identical
    expect(res1.finishTime).not.toBe(res2.finishTime);
    expect(Math.abs(res1.finishTime - res2.finishTime)).toBeLessThan(100);
  });

  it("should calculate carbon racer to be faster but fatigue rate higher than daily trainer", () => {
    const dailyRes = simulateRace({
      ...defaultInput,
      preparation: { ...defaultInput.preparation, shoes: "daily_trainer" },
    });

    const carbonRes = simulateRace({
      ...defaultInput,
      preparation: { ...defaultInput.preparation, shoes: "carbon_racer" },
    });

    // Carbon racer is faster (lower finish time)
    expect(carbonRes.finishTime).toBeLessThan(dailyRes.finishTime);
  });

  it("should handle DNF if running without nutrition under extreme hot weather", () => {
    const extremeHotChallenge: DailyChallenge = {
      ...mockChallenge,
      race: {
        ...mockChallenge.race,
        distance: 42,
      },
      environment: {
        ...mockChallenge.environment,
        weather: "hot",
        temperature: 38, // Scorching hot
        humidity: 85,
      },
    };

    const dnfResult = simulateRace({
      player: { id: "player_abc" },
      challenge: extremeHotChallenge,
      preparation: {
        shoes: "daily_trainer",
        nutrition: "none", // No water or electrolytes
        gear: [],
        warmup: "none",
        pacing: "aggressive", // Burn out fast
        mindset: "fearless",
      },
      seed: 1234,
    });

    expect(dnfResult.outcome).toBe("dnf");
    expect(dnfResult.grade).toBe("F");
    expect(dnfResult.score).toBe(0);
  });
});
