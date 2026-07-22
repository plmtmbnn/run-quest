import { describe, expect, it } from "vitest";
import {
  DEFAULT_SCHEDULING_STATE,
} from "@/scheduling/race-calendar-types";
import {
  getTodaysRaces,
  getUpcomingRaces,
  getRegisteredRaces,
  registerForRace,
} from "@/scheduling/race-calendar-engine";
import { createInitialState } from "@/engine/timeline";

describe("Race Calendar Scheduling Engine", () => {
  it("returns available races for today's dayIndex", () => {
    const gameState = createInitialState(123);
    const schedulingState = DEFAULT_SCHEDULING_STATE;

    const todaysRaces = getTodaysRaces(schedulingState, gameState, 0);
    expect(Array.isArray(todaysRaces)).toBe(true);
  });

  it("registers for a race and lists it in getRegisteredRaces", () => {
    let schedulingState = DEFAULT_SCHEDULING_STATE;

    schedulingState = registerForRace(schedulingState, "monthly_nusantara_10k", 27);
    expect(schedulingState.registered["monthly_nusantara_10k"]).toBe(27);

    const registered = getRegisteredRaces(schedulingState, 0);
    expect(registered.length).toBeGreaterThan(0);
    expect(registered.some((r) => r.scheduleId === "monthly_nusantara_10k")).toBe(true);
  });

  it("filters upcoming races within horizon", () => {
    const schedulingState = DEFAULT_SCHEDULING_STATE;
    const upcoming = getUpcomingRaces(schedulingState, 0, 30);
    expect(Array.isArray(upcoming)).toBe(true);
  });
});
