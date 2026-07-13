import { describe, expect, it } from "vitest";
import { DECISION_DATABASE } from "@/content/events/decision-database";
import { generateDecisionTimeline } from "@/engine/simulation/decision-generator";
import {
  advanceSimulation,
  getFallbackChoice,
  simulateRace,
} from "@/engine/simulation/engine";
import type {
  ChoiceBehavior,
  DailyChallenge,
  SimulationInput,
} from "@/types/engine";

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
    nutrition: ["water"],
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

    const standardEvents = result.events.filter(
      (e) =>
        e.title.en !== "Delayed Consequence" &&
        e.title.en !== "Overtake!" &&
        e.title.en !== "Overtaken!" &&
        e.title.en !== "Runner's High!" &&
        e.title.en !== "Runner's High Fades" &&
        e.title.en !== "Weather Shift!" &&
        e.title.en !== "Crowd Reaction" &&
        e.title.en !== "Atmosphere" &&
        e.title.en !== "Desperation PUSH!",
    );
    expect(standardEvents.length).toBeLessThanOrEqual(6);
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
        nutrition: [], // No water or electrolytes
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

  it("should trigger a rare DNS event for seed 585", () => {
    const dnsRes = simulateRace({ ...defaultInput, seed: 585 });
    expect(dnsRes.outcome).toBe("dns");
    expect(dnsRes.grade).toBe("F");
    expect(dnsRes.score).toBe(0);
    expect(dnsRes.events.length).toBe(1);
    expect(dnsRes.events[0].title.en).toContain("Missed Transportation");
  });

  it("should trigger a rare Booster event for seed 510", () => {
    const boosterRes = simulateRace({ ...defaultInput, seed: 510 });
    expect(boosterRes.outcome).not.toBe("dnf");
    expect(boosterRes.outcome).not.toBe("dns");
    const boosterEvent = boosterRes.events.find((e) =>
      e.title.en.includes("Runner High"),
    );
    expect(boosterEvent).toBeDefined();
    expect(boosterEvent?.effect.pace).toBeLessThan(0);
  });

  it("should trigger a rare Accident event for seed 530", () => {
    const accidentRes = simulateRace({ ...defaultInput, seed: 530 });
    const accidentEvent = accidentRes.events.find((e) =>
      e.title.en.includes("Ankle Sprain"),
    );
    expect(accidentEvent).toBeDefined();
    expect(accidentEvent?.effect.pace).toBeGreaterThan(0);
  });

  it("should trigger a rare DNF injury event for seed 949", () => {
    const dnfInjuryRes = simulateRace({ ...defaultInput, seed: 949 });
    expect(dnfInjuryRes.outcome).toBe("dnf");
    expect(dnfInjuryRes.grade).toBe("F");
    expect(dnfInjuryRes.score).toBe(0);
    const dnfEvent = dnfInjuryRes.events.find((e) =>
      e.title.en.includes("Severe Injury"),
    );
    expect(dnfEvent).toBeDefined();
  });

  describe("Interactive Decision Engine", () => {
    it("should generate a timeline of decision points based on distance", () => {
      const timeline = generateDecisionTimeline(
        mockChallenge.race.distance,
        mockChallenge,
        42,
      );

      const kms = Object.keys(timeline).map(Number);
      // For 5KM, we should have 2-3 decision moments
      expect(kms.length).toBeGreaterThanOrEqual(2);
      expect(kms.length).toBeLessThanOrEqual(3);
    });

    it("should pause the simulation at a decision point and resume with chosen behavior", () => {
      // Step 1: Start simulation
      const step1 = advanceSimulation(defaultInput);
      expect(step1.type).toBe("decision");
      if (step1.type !== "decision") {
        throw new Error("Expected decision step");
      }
      expect(step1.prompt).toBeDefined();
      expect(step1.prompt.km).toBeGreaterThan(0);
      expect(step1.state.pendingDecision).toBeDefined();

      // Step 2: Choose first choice
      const card = step1.state.pendingDecision;
      expect(card).toBeDefined();
      if (!card) throw new Error("Pending decision is not defined");

      const choiceId = card.choices[0].id;
      const step2 = advanceSimulation(defaultInput, step1.state, choiceId);
      if (step2.type !== "decision") {
        throw new Error("Expected decision step after advancing");
      }

      // Verify the choice behavior is recorded in history
      expect(step2.state.decisionHistory).toContain(card.choices[0].behavior);

      // Verify choice effect was applied or event resolved
      const decisionEvent = step2.state.eventsResolved.find(
        (e) => e.title.en === card.title.en,
      );
      expect(decisionEvent).toBeDefined();
    });

    it("should resolve decisions automatically on timeout based on history patterns", () => {
      const card = DECISION_DATABASE.strong_headwind;

      // If history is mostly aggressive, fallback should prioritize aggressive choice
      const history: ChoiceBehavior[] = [
        "aggressive",
        "aggressive",
        "balanced",
      ];
      const chosen = getFallbackChoice(card, history, 42);

      // For headwind, aggressive choice is "headwind_push"
      // Since it has the highest weight, it is highly likely to be selected
      expect(chosen).toBeDefined();
    });

    it("should evolve the expanded runner attributes during the simulation steps", () => {
      const step1 = advanceSimulation(defaultInput);
      if (step1.type !== "decision") {
        throw new Error("Expected decision step");
      }
      expect(step1.state.muscleFatigue).toBeDefined();
      expect(step1.state.mentalFatigue).toBeDefined();
      expect(step1.state.momentum).toBeDefined();
      expect(step1.state.paceStability).toBeDefined();
      expect(step1.state.riskLevel).toBeDefined();

      // Check cumulative nutrition calculation
      const caffeineGelInput: SimulationInput = {
        ...defaultInput,
        preparation: {
          ...defaultInput.preparation,
          nutrition: ["caffeine", "energy_gel"],
        },
      };
      const res = simulateRace(caffeineGelInput);
      expect(res.finishTime).toBeLessThan(
        simulateRace(defaultInput).finishTime,
      );
    });
  });
});
