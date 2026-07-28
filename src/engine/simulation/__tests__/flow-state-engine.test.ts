import { describe, expect, it } from "vitest";
import {
  applyFlowScoreDelta,
  createInitialFlowState,
  evaluateKmFlowDelta,
  getFlowLevelAndZoneStatus,
} from "@/engine/simulation/flow-state-engine";

describe("Flow State Engine", () => {
  it("initializes flow state correctly", () => {
    const state = createInitialFlowState();
    expect(state.score).toBe(0);
    expect(state.level).toBe("building");
    expect(state.isInTheZone).toBe(false);
    expect(state.consecutiveOptimalPaceKm).toBe(0);
  });

  it("determines flow levels and hysteresis correctly", () => {
    // 0-30 -> building
    expect(getFlowLevelAndZoneStatus(20, false)).toEqual({
      level: "building",
      isInTheZone: false,
    });

    // 31-60 -> flowing
    expect(getFlowLevelAndZoneStatus(45, false)).toEqual({
      level: "flowing",
      isInTheZone: false,
    });

    // 61+ -> enters zone
    expect(getFlowLevelAndZoneStatus(61, false)).toEqual({
      level: "zone",
      isInTheZone: true,
    });

    // Hysteresis: stays in zone when score drops to 55 (above 50)
    expect(getFlowLevelAndZoneStatus(55, true)).toEqual({
      level: "zone",
      isInTheZone: true,
    });

    // Deactivates zone when score drops below 50
    expect(getFlowLevelAndZoneStatus(48, true)).toEqual({
      level: "flowing",
      isInTheZone: false,
    });
  });

  it("evaluates km flow deltas accurately", () => {
    // Target pace: 300s/km. Actual pace: 305s/km (within 5% margin = 15s)
    const evalResult = evaluateKmFlowDelta({
      actualPaceSeconds: 305,
      targetPaceSeconds: 300,
      hasActiveBreakingPoint: false,
      energy: 50,
    });

    // +5 (pace) +3 (no breaking point) +5 (energy between 40-70) = +13
    expect(evalResult.delta).toBe(13);
    expect(evalResult.isPaceOptimal).toBe(true);
  });

  it("applies penalties and clamps score between 0 and 100", () => {
    let state = createInitialFlowState();
    state = applyFlowScoreDelta(state, 50);
    expect(state.score).toBe(50);
    expect(state.level).toBe("flowing");

    // Add +30 -> total 80 -> reaches The Zone
    state = applyFlowScoreDelta(state, 30);
    expect(state.score).toBe(80);
    expect(state.isInTheZone).toBe(true);
    expect(state.level).toBe("zone");

    // Apply breaking point penalty (-20) -> 60 (still in zone due to hysteresis)
    state = applyFlowScoreDelta(state, -20);
    expect(state.score).toBe(60);
    expect(state.isInTheZone).toBe(true);

    // Apply bad decision penalty (-15) -> 45 (drops below 50, exits zone)
    state = applyFlowScoreDelta(state, -15);
    expect(state.score).toBe(45);
    expect(state.isInTheZone).toBe(false);
    expect(state.level).toBe("flowing");

    // Penalty beyond 0 clamps to 0
    state = applyFlowScoreDelta(state, -100);
    expect(state.score).toBe(0);
    expect(state.level).toBe("building");
  });
});
