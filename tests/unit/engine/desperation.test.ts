import { describe, expect, it } from "vitest";
import { DesperationEngine } from "@/engine/desperation/desperation-engine";
import { advanceSimulation } from "@/engine/simulation/engine";
import type {
  DailyChallenge,
  SimulationInput,
  SimulationState,
} from "@/types/engine";
import { SeededRandom } from "@/utils/random/seeded-random";

const mockChallenge: DailyChallenge = {
  id: "test_challenge",
  date: "2026-07-13",
  environment: {
    weather: "sunny",
    temperature: 20,
    humidity: 50,
    wind: { direction: "north", speed: 5 },
    timeOfDay: "morning",
  },
  race: {
    title: { en: "Test Race", id: "Balapan Uji" },
    description: { en: "Test desc", id: "Uji desk" },
    distance: 5,
    surface: "road",
    elevation: "flat",
    checkpoints: [],
  },
  objective: {
    targetTime: 1200,
  },
  storySeed: { mood: "optimistic" },
};

const mockInput: SimulationInput = {
  player: { id: "player_test" },
  challenge: mockChallenge,
  preparation: {
    shoes: "daily_trainer",
    nutrition: [],
    gear: [],
    warmup: "none",
    pacing: "steady",
    mindset: "calm",
  },
  seed: 42,
  runnerProfile: {
    id: "p_1",
    displayName: "Runner",
    createdAt: new Date().toISOString(),
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
    willpowerAttr: 50,
    inventory: {},
  },
};

describe("DesperationEngine", () => {
  const engine = new DesperationEngine();

  describe("calculateCondition", () => {
    it("should return winning when player has lowest time (leading)", () => {
      const state = {
        distanceCovered: 2,
        totalDistance: 5,
        energy: 80,
        hydration: 80,
        focus: 80,
        fatigue: 20,
        confidence: 80,
        accumulatedTime: 500,
        opponents: [
          {
            id: "opp_1",
            name: "Opponent 1",
            archetype: "steady",
            distanceCovered: 2,
            accumulatedTime: 550,
            energy: 80,
            hydration: 80,
            isDNF: false,
            paceSeconds: 275,
          },
        ],
      } as SimulationState;
      expect(engine.calculateCondition(state)).toBe("winning");
    });

    it("should return losing when player is far behind", () => {
      const state = {
        distanceCovered: 2,
        totalDistance: 5,
        energy: 80,
        hydration: 80,
        focus: 80,
        fatigue: 20,
        confidence: 80,
        accumulatedTime: 600,
        opponents: [
          {
            id: "opp_1",
            name: "Opponent 1",
            archetype: "steady",
            distanceCovered: 2,
            accumulatedTime: 550,
            energy: 80,
            hydration: 80,
            isDNF: false,
            paceSeconds: 275,
          },
        ],
      } as SimulationState;
      expect(engine.calculateCondition(state)).toBe("losing");
    });

    it("should return close when player is within 5 seconds", () => {
      const state = {
        distanceCovered: 2,
        totalDistance: 5,
        energy: 80,
        hydration: 80,
        focus: 80,
        fatigue: 20,
        confidence: 80,
        accumulatedTime: 553,
        opponents: [
          {
            id: "opp_1",
            name: "Opponent 1",
            archetype: "steady",
            distanceCovered: 2,
            accumulatedTime: 550,
            energy: 80,
            hydration: 80,
            isDNF: false,
            paceSeconds: 275,
          },
        ],
      } as SimulationState;
      expect(engine.calculateCondition(state)).toBe("close");
    });
  });

  describe("calculateMentalState", () => {
    it("should return resigned when very low energy and confidence", () => {
      const state = {
        distanceCovered: 2,
        totalDistance: 5,
        energy: 10,
        hydration: 80,
        focus: 80,
        fatigue: 90,
        confidence: 20,
        accumulatedTime: 500,
      } as SimulationState;
      expect(engine.calculateMentalState(state)).toBe("resigned");
    });

    it("should return desperate when energy or confidence is low", () => {
      const state = {
        distanceCovered: 2,
        totalDistance: 5,
        energy: 35,
        hydration: 80,
        focus: 80,
        fatigue: 65,
        confidence: 70,
        accumulatedTime: 500,
      } as SimulationState;
      expect(engine.calculateMentalState(state)).toBe("desperate");
    });

    it("should return determined under normal circumstances", () => {
      const state = {
        distanceCovered: 2,
        totalDistance: 5,
        energy: 80,
        hydration: 80,
        focus: 80,
        fatigue: 20,
        confidence: 80,
        accumulatedTime: 500,
      } as SimulationState;
      expect(engine.calculateMentalState(state)).toBe("determined");
    });
  });

  describe("checkDesperationTrigger", () => {
    it("should trigger when entering final kilometer", () => {
      const state = {
        distanceCovered: 4, // final km for distance 5
        totalDistance: 5,
        energy: 80,
        hydration: 80,
        focus: 80,
        fatigue: 20,
        confidence: 80,
        accumulatedTime: 500,
      } as SimulationState;
      const trigger = engine.checkDesperationTrigger(state, 50);
      expect(trigger).toBeDefined();
      expect(trigger?.trigger).toBe("final_km");
    });

    it("should not trigger before final kilometer", () => {
      const state = {
        distanceCovered: 2,
        totalDistance: 5,
        energy: 80,
        hydration: 80,
        focus: 80,
        fatigue: 20,
        confidence: 80,
        accumulatedTime: 500,
      } as SimulationState;
      const trigger = engine.checkDesperationTrigger(state, 50);
      expect(trigger).toBeNull();
    });
  });

  describe("resolveChoice", () => {
    it("should resolve options deterministically using SeededRandom", () => {
      const random = new SeededRandom(1234);
      // test high willpower sprint resolve
      const result = engine.resolveChoice("desperation_sprint", 90, random);
      expect(result).toBeDefined();
      expect(result?.recovered).toBe(true);
      expect(result?.effects.pace).toBe(-35);
    });
  });

  describe("Integration in advanceSimulation", () => {
    it("should trigger desperation step at the final km", () => {
      const startState: SimulationState = {
        distanceCovered: 4,
        totalDistance: 5,
        energy: 85,
        hydration: 85,
        focus: 85,
        fatigue: 15,
        confidence: 85,
        accumulatedTime: 900,
        eventsResolved: [],
        muscleFatigue: 0,
        mentalFatigue: 0,
        momentum: 50,
        paceStability: 50,
        riskLevel: 0,
        shownBreakingPoints: [],
        hasTriggeredDesperation: false,
        desperationMode: null,
      };

      const step = advanceSimulation(
        mockInput,
        startState,
        undefined,
        undefined,
        true,
      );
      expect(step.type).toBe("desperation");
      if (step.type === "desperation") {
        expect(step.state.desperationMode).toBeDefined();
      }
    });

    it("should apply results when desperation option choiceId is resolved", () => {
      const stateWithDesperation: SimulationState = {
        distanceCovered: 4,
        totalDistance: 5,
        energy: 85,
        hydration: 85,
        focus: 85,
        fatigue: 15,
        confidence: 85,
        accumulatedTime: 900,
        eventsResolved: [],
        muscleFatigue: 0,
        mentalFatigue: 0,
        momentum: 50,
        paceStability: 50,
        riskLevel: 0,
        shownBreakingPoints: [],
        hasTriggeredDesperation: false,
        desperationMode: {
          trigger: "final_km",
          condition: "winning",
          mentalState: "determined",
          boostAvailable: true,
        },
      };

      const step = advanceSimulation(
        mockInput,
        stateWithDesperation,
        "desperation_sprint",
        undefined,
        true,
      );
      const finalState =
        step.type === "finished"
          ? step.result.stateLog[step.result.stateLog.length - 1]
          : step.state;

      expect(finalState).toBeDefined();
      expect(finalState.hasTriggeredDesperation).toBe(true);
      expect(finalState.desperationMode).toBeNull();
      // Verifies that a push event gets added to resolved events log
      const pushEvent = finalState.eventsResolved.find(
        (e) => e.title.en === "Desperation PUSH!",
      );
      expect(pushEvent).toBeDefined();
    });
  });
});
