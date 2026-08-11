import { describe, expect, it } from "vitest";
import {
  createInitialBreathingState,
  getBreathingCategory,
  processBreathingControlSuccess,
  updateBreathingState,
} from "@/engine/simulation/breathing-engine";

describe("Breathing Control Engine", () => {
  it("maps heart rate to breathing category correctly", () => {
    expect(getBreathingCategory(135).category).toBe("calm");
    expect(getBreathingCategory(160).category).toBe("elevated");
    expect(getBreathingCategory(180).category).toBe("labored");
    expect(getBreathingCategory(195).category).toBe("gasping");
  });

  it("determines control availability based on HR and cooldown", () => {
    let state = createInitialBreathingState(130);
    expect(state.canControl).toBe(false);

    // HR > 180 triggers control availability when cooldown is 0
    state = updateBreathingState(state, 185);
    expect(state.canControl).toBe(true);

    // Process successful exercise -> starts 2 min cooldown
    const now = 100000;
    const { nextState } = processBreathingControlSuccess(state, now);
    expect(nextState.cooldownRemainingMs).toBe(120000);
    expect(nextState.canControl).toBe(false);

    // Before cooldown expires (60s later), canControl remains false even at high HR
    const updatedDuringCooldown = updateBreathingState(
      nextState,
      190,
      now + 60000,
    );
    expect(updatedDuringCooldown.canControl).toBe(false);

    // After 2 min (120s later), canControl becomes true again at high HR
    const updatedAfterCooldown = updateBreathingState(
      nextState,
      185,
      now + 120001,
    );
    expect(updatedAfterCooldown.canControl).toBe(true);
  });

  it("applies rewards on breathing control success", () => {
    const state = createInitialBreathingState(185);
    const result = processBreathingControlSuccess(state);

    expect(result.focusBonus).toBe(5);
    expect(result.heartRateReduction).toBe(10);
    expect(result.nextState.heartRateBpm).toBe(175);
  });
});
