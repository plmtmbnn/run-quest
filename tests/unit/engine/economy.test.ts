import { describe, expect, it } from "vitest";

// Mock localStorage in Vitest Node environment before loading persistence
const mockStorage: Record<string, string> = {};
global.window = {} as any;
global.localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => {
    mockStorage[key] = value;
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    for (const key in mockStorage) delete mockStorage[key];
  },
  length: 0,
  key: (index: number) => "",
};

import { advanceSimulation } from "@/engine/simulation/engine";
import { completeRace, updateTrainingDay } from "@/runner/runner-engine";
import { loadRunnerState, saveRunnerState } from "@/runner/runner-persistence";
import { DEFAULT_RUNNER_STATE } from "@/runner/runner-types";
import type { DailyChallenge, SimulationInput } from "@/types/engine";

const mockChallenge: DailyChallenge = {
  id: "economy_challenge",
  date: "2026-07-11",
  environment: {
    weather: "sunny",
    temperature: 20,
    humidity: 50,
    wind: { direction: "east", speed: 5 },
    timeOfDay: "morning",
  },
  race: {
    title: { en: "Test Race", id: "Uji Lari" },
    description: { en: "A simple 5K test race", id: "Uji lari 5K sederhana" },
    distance: 5,
    surface: "road",
    elevation: "flat",
    checkpoints: [],
  },
  objective: {
    targetTime: 1600,
  },
  storySeed: {
    mood: "optimistic",
  },
};

const baseInput: SimulationInput = {
  player: { id: "player_test" },
  challenge: mockChallenge,
  preparation: {
    shoes: "daily_trainer",
    nutrition: ["water"],
    gear: [],
    warmup: "dynamic",
    pacing: "steady",
    mindset: "calm",
  },
  seed: 12345,
};

describe("RPG Economy & Warm-up Minigames", () => {
  it("should award coins correctly on race completions", () => {
    // Reset state
    saveRunnerState({
      ...DEFAULT_RUNNER_STATE,
      profile: {
        ...DEFAULT_RUNNER_STATE.profile,
        coins: 100,
      },
    });

    completeRace(5, 1200, 0.7, 50, 150);

    const updated = loadRunnerState();
    expect(updated.profile.coins).toBe(250); // 100 + 150
  });

  it("should award coins correctly on daily training days", () => {
    // Reset state
    saveRunnerState({
      ...DEFAULT_RUNNER_STATE,
      profile: {
        ...DEFAULT_RUNNER_STATE.profile,
        coins: 100,
      },
    });

    updateTrainingDay(3, 0.5, true, 20, 30);

    const updated = loadRunnerState();
    expect(updated.profile.coins).toBe(130); // 100 + 30
  });

  it("should boost starting energy offset based on warmupBonus", () => {
    // Test normal warmup
    const normalInput = {
      ...baseInput,
      preparation: {
        ...baseInput.preparation,
        warmupBonus: "normal" as const,
      },
    };
    const stepNormal = advanceSimulation(
      normalInput,
      undefined,
      undefined,
      undefined,
      true,
    );
    if (stepNormal.type === "finished") throw new Error("Expected step");

    // Test perfect warmup (+15 energy offset)
    const perfectInput = {
      ...baseInput,
      preparation: {
        ...baseInput.preparation,
        warmupBonus: "perfect" as const,
      },
    };
    const stepPerfect = advanceSimulation(
      perfectInput,
      undefined,
      undefined,
      undefined,
      true,
    );
    if (stepPerfect.type === "finished") throw new Error("Expected step");

    // Perfect warmup starting energy should be higher than normal warmup starting energy
    expect(stepPerfect.state.energy).toBeGreaterThan(stepNormal.state.energy);
    expect(stepPerfect.state.energy - stepNormal.state.energy).toBe(15);
  });
});
