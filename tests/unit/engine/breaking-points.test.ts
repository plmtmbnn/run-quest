import { describe, expect, it } from "vitest";
import {
  BREAKING_POINTS,
  getBreakingPoint,
} from "@/engine/breaking-points/breaking-database";
import { BreakingPointEngine } from "@/engine/breaking-points/breaking-engine";
import { advanceSimulation } from "@/engine/simulation/engine";
import type { SimulationInput, SimulationState } from "@/types/engine";
import { SeededRandom } from "@/utils/random/seeded-random";

describe("Breaking Point System", () => {
  const createBaseState = (
    overrides?: Partial<SimulationState>,
  ): SimulationState => {
    return {
      distanceCovered: 0,
      totalDistance: 10,
      energy: 100,
      hydration: 100,
      focus: 100,
      fatigue: 0,
      confidence: 100,
      accumulatedTime: 0,
      eventsResolved: [],
      muscleFatigue: 0,
      mentalFatigue: 0,
      momentum: 50,
      paceStability: 80,
      riskLevel: 20,
      opponents: [],
      shownBreakingPoints: [],
      ...overrides,
    };
  };

  it("should retrieve side stitch if conditions are met", () => {
    // Stitch triggers at distanceCovered > 3 && < 15 && energy < 70 && muscleFatigue > 35
    const state = createBaseState({
      distanceCovered: 4,
      energy: 60,
      muscleFatigue: 40,
    });

    const shown = new Set<string>();
    const bp = getBreakingPoint(state, shown);
    expect(bp).not.toBeNull();
    expect(bp?.type).toBe("stitch");
  });

  it("should not retrieve side stitch if it was already shown", () => {
    const state = createBaseState({
      distanceCovered: 4,
      energy: 60,
      muscleFatigue: 40,
    });

    const shown = new Set<string>(["stitch"]);
    const bp = getBreakingPoint(state, shown);
    expect(bp).toBeNull();
  });

  it("should detect and create active breaking point in engine", () => {
    const state = createBaseState({
      distanceCovered: 4,
      energy: 60,
      muscleFatigue: 40,
    });

    const bpEngine = new BreakingPointEngine();
    const activeBp = bpEngine.checkForBreakingPoint(state);
    expect(activeBp).not.toBeNull();
    expect(activeBp?.breakingPoint.type).toBe("stitch");
    expect(activeBp?.resolved).toBe(false);

    // Subsequent checks should return the active unresolved breaking point
    const activeBp2 = bpEngine.checkForBreakingPoint(state);
    expect(activeBp2).toBe(activeBp);
  });

  it("should execute deterministic recovery success or failure using SeededRandom", () => {
    const state = createBaseState({
      distanceCovered: 4,
      energy: 60,
      muscleFatigue: 40,
    });

    const bpEngine = new BreakingPointEngine();
    const activeBp = bpEngine.checkForBreakingPoint(state);
    expect(activeBp).not.toBeNull();

    // Side stitch options: slow_breathe (90% success), push_through_stitch (30% success)
    const randomSuccess = new SeededRandom(42); // Seeded random for testing success
    const resSuccess = bpEngine.attemptRecovery(
      "slow_breathe",
      state,
      randomSuccess,
    );
    expect(resSuccess).not.toBeNull();
    expect(resSuccess?.recovered).toBe(true);
    expect(activeBp?.resolved).toBe(true);

    const bpEngine2 = new BreakingPointEngine();
    const activeBp2 = bpEngine2.checkForBreakingPoint(state);
    expect(activeBp2).not.toBeNull();

    // Option with lower chance
    const randomFailure = new SeededRandom(55555);
    const resFailure = bpEngine2.attemptRecovery(
      "push_through_stitch",
      state,
      randomFailure,
    );
    expect(resFailure).not.toBeNull();
    expect(activeBp2?.resolved).toBe(true);
  });

  it("should integrate breaking points into advanceSimulation step execution", () => {
    const challenge = {
      id: "ch_test",
      date: "2026-07-13",
      environment: {
        weather: "sunny" as const,
        temperature: 20,
        humidity: 50,
        wind: { direction: "north" as const, speed: 5 },
        timeOfDay: "morning" as const,
      },
      race: {
        title: { en: "Test Race", id: "Tes" },
        description: { en: "Test desc", id: "Tes" },
        distance: 10,
        surface: "road" as const,
        elevation: "flat" as const,
        checkpoints: [],
      },
      objective: { targetTime: 3000 },
      storySeed: { mood: "optimistic" as const },
    };

    const input: SimulationInput = {
      player: { id: "player_test" },
      challenge,
      preparation: {
        shoes: "daily_trainer",
        nutrition: [],
        gear: [],
        warmup: "none",
        pacing: "steady",
        mindset: "calm",
      },
      seed: 42,
    };

    // Pre-create state where stitch conditions are met, and we are stepping into km 4
    const state = createBaseState({
      distanceCovered: 3.1, // next km will be 4.1
      energy: 65,
      muscleFatigue: 45,
      totalDistance: 10,
    });

    const nextStep = advanceSimulation(
      input,
      state,
      undefined,
      undefined,
      true,
    );
    expect(nextStep.type).toBe("breaking_point");
    if (nextStep.type === "breaking_point") {
      expect(nextStep.breakingPoint.breakingPoint.type).toBe("stitch");
      expect(nextStep.state.activeBreakingPoint).not.toBeNull();
      expect(nextStep.state.activeBreakingPoint?.resolved).toBe(false);

      // Verify base onset effects were applied immediately (stamina -5, confidence -10)
      expect(nextStep.state.energy).toBe(60); // 65 - 5
      expect(nextStep.state.confidence).toBe(90); // 100 - 10
    }
  });

  it("should resolve active breaking point in advanceSimulation when recovery choice is passed", () => {
    const challenge = {
      id: "ch_test",
      date: "2026-07-13",
      environment: {
        weather: "sunny" as const,
        temperature: 20,
        humidity: 50,
        wind: { direction: "north" as const, speed: 5 },
        timeOfDay: "morning" as const,
      },
      race: {
        title: { en: "Test Race", id: "Tes" },
        description: { en: "Test desc", id: "Tes" },
        distance: 10,
        surface: "road" as const,
        elevation: "flat" as const,
        checkpoints: [],
      },
      objective: { targetTime: 3000 },
      storySeed: { mood: "optimistic" as const },
    };

    const input: SimulationInput = {
      player: { id: "player_test" },
      challenge,
      preparation: {
        shoes: "daily_trainer",
        nutrition: [],
        gear: [],
        warmup: "none",
        pacing: "steady",
        mindset: "calm",
      },
      seed: 42,
    };

    const stitchPoint = BREAKING_POINTS.find((b) => b.id === "stitch");
    if (!stitchPoint) {
      throw new Error("Stitch breaking point not found");
    }

    // Pre-create state with an active unresolved stitch breaking point
    const mockState = createBaseState({
      distanceCovered: 4.1,
      energy: 60, // stitch onset applied
      confidence: 90, // stitch onset applied
      totalDistance: 10,
      shownBreakingPoints: ["stitch"],
      activeBreakingPoint: {
        breakingPoint: stitchPoint,
        km: 4.1,
        timestamp: Date.now(),
        resolved: false,
      },
    });

    // Call advanceSimulation with recovery choice "slow_breathe"
    const nextStep = advanceSimulation(
      input,
      mockState,
      "slow_breathe",
      undefined,
      true,
    );

    // It should resolve the breaking point, apply slow_breathe effects (energy: 10, confidence: 10, pace: 8)
    // and proceed to simulate step or finish
    expect(nextStep.state.activeBreakingPoint?.resolved).toBe(true);
    expect(nextStep.state.activeBreakingPoint?.recoveryAttempted).toBe(
      "slow_breathe",
    );
    // Since stitch option "slow_breathe" has 90% recoveryChance and seed 42, it recovered
    expect(nextStep.state.activeBreakingPoint?.recovered).toBe(true);

    // Assert that the recovery event was logged in eventsResolved
    expect(
      nextStep.state.eventsResolved.some(
        (e) => e.title.en === "Sharp side stitch!",
      ),
    ).toBe(true);
  });
});
