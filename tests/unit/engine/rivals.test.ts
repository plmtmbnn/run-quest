import { describe, expect, it } from "vitest";
import { advanceSimulation } from "@/engine/simulation/engine";
import type { DailyChallenge, SimulationInput } from "@/types/engine";

const mockChallenge: DailyChallenge = {
  id: "rivals_challenge",
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

describe("AI Rivals & Active Pacing Simulation", () => {
  it("should generate 3 to 5 opponents at race start", () => {
    // Generate initial state at km 0
    const startStep = advanceSimulation(
      baseInput,
      undefined,
      undefined,
      undefined,
      true,
    );
    if (startStep.type === "finished")
      throw new Error("Expected step or decision");
    const state = startStep.state;
    // Clear decision timeline to prevent random event yields in tests
    state.decisionTimeline = {};

    // Simulate kilometer 1
    const stepRes = advanceSimulation(
      baseInput,
      state,
      undefined,
      undefined,
      true,
    );
    expect(stepRes.type).toBe("step");
    if (stepRes.type === "step") {
      const opponents = stepRes.state.opponents;
      expect(opponents).toBeDefined();
      expect(opponents!.length).toBeGreaterThanOrEqual(3);
      expect(opponents!.length).toBeLessThanOrEqual(5);

      for (const opp of opponents!) {
        expect(opp.name).toBeTruthy();
        expect(opp.archetype).toBeTruthy();
        expect(opp.distanceCovered).toBe(1);
        expect(opp.accumulatedTime).toBeGreaterThan(0);
        expect(opp.isDNF).toBe(false);
      }
    }
  });

  it("should adjust player pace and fatigue when changing pacing strategy mid-race", () => {
    // Generate initial state at km 0 and clear decision timeline
    const startStep = advanceSimulation(
      baseInput,
      undefined,
      undefined,
      undefined,
      true,
    );
    if (startStep.type === "finished")
      throw new Error("Expected step or decision");
    const state = startStep.state;
    state.decisionTimeline = {};

    // Step 1: Simulate kilometer 1 with default pacing (steady)
    const step1 = advanceSimulation(
      baseInput,
      state,
      undefined,
      undefined,
      true,
    );
    expect(step1.type).toBe("step");
    if (step1.type !== "step") throw new Error("Expected step type");

    const timeAtKm1 = step1.state.accumulatedTime;
    const energyAtKm1 = step1.state.energy;

    // Step 2: Simulate kilometer 2 with "jog" (conserve) pacing
    const step2 = advanceSimulation(
      baseInput,
      step1.state,
      undefined,
      "jog",
      true,
    );
    expect(step2.type).toBe("step");
    if (step2.type !== "step") throw new Error("Expected step type");

    const paceAtKm2 = step2.state.accumulatedTime - timeAtKm1;
    const energyLostAtKm2 = energyAtKm1 - step2.state.energy;

    // Step 3: Simulate kilometer 3 with "sprint" pacing
    const step3 = advanceSimulation(
      baseInput,
      step2.state,
      undefined,
      "sprint",
      true,
    );
    expect(step3.type).toBe("step");
    if (step3.type !== "step") throw new Error("Expected step type");

    const paceAtKm3 = step3.state.accumulatedTime - step2.state.accumulatedTime;
    const energyLostAtKm3 = step2.state.energy - step3.state.energy;

    // Sprinting should be much faster than jogging (paceSeconds is lower)
    expect(paceAtKm3).toBeLessThan(paceAtKm2);
    // Sprinting should consume much more energy than jogging
    expect(energyLostAtKm3).toBeGreaterThan(energyLostAtKm2);
  });

  it("should generate a Nemesis opponent if currentNemesis exists in runnerProfile", () => {
    const inputWithNemesis: SimulationInput = {
      ...baseInput,
      runnerProfile: {
        id: "player_test",
        displayName: "Test Runner",
        createdAt: "",
        totalRuns: 0,
        totalDistance: 0,
        totalRaceTime: 0,
        totalTrainingDays: 0,
        currentWeek: 1,
        currentSeason: 1,
        currentFitness: 50,
        currentFatigue: 0,
        currentReadiness: 100,
        consistency: 0,
        level: 1,
        xp: 0,
        skillPoints: 0,
        speedAttr: 10,
        staminaAttr: 10,
        hydrationAttr: 10,
        willpowerAttr: 10,
        coins: 100,
        inventory: {},
        currentNemesis: {
          name: "Nemesis John",
          archetype: "steady",
          wins: 0,
          losses: 0,
        },
      },
    };

    const startStep = advanceSimulation(
      inputWithNemesis,
      undefined,
      undefined,
      undefined,
      true,
    );
    if (startStep.type === "finished")
      throw new Error("Expected step or decision");
    const state = startStep.state;
    state.decisionTimeline = {};

    const stepRes = advanceSimulation(
      inputWithNemesis,
      state,
      undefined,
      undefined,
      true,
    );
    if (stepRes.type !== "step") throw new Error("Expected step type");

    const opponents = stepRes.state.opponents;
    expect(opponents).toBeDefined();
    const nemesis = opponents!.find((o) => o.isNemesis);
    expect(nemesis).toBeDefined();
    expect(nemesis!.name).toBe("Nemesis John");
  });
});
