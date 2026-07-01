import { describe, expect, it } from "vitest";
import { generateRaceAnalysis } from "@/engine/intelligence/intelligence-engine";
import type { DailyChallenge } from "@/types/engine";

const mockChallengeBase: Omit<DailyChallenge, "analysis"> = {
  id: "test_challenge",
  date: "2026-06-30",
  environment: {
    weather: "hot",
    temperature: 34,
    humidity: 85,
    wind: { direction: "south", speed: 18 },
    timeOfDay: "afternoon",
  },
  race: {
    title: { en: "Desert Run", id: "Lari Gurun" },
    description: {
      en: "A dry run in extreme heat",
      id: "Lari kering di tengah panas ekstrem",
    },
    distance: 10.2,
    surface: "trail",
    elevation: "hilly",
    checkpoints: [],
  },
  objective: {
    targetTime: 3600,
  },
  storySeed: {
    mood: "survival",
  },
};

describe("Race Intelligence Engine", () => {
  it("generates deterministic analyses with the same seed", () => {
    const analysis1 = generateRaceAnalysis(mockChallengeBase, 12345);
    const analysis2 = generateRaceAnalysis(mockChallengeBase, 12345);
    expect(analysis1).toEqual(analysis2);
  });

  it("produces segment distances summing up precisely to the total distance", () => {
    const analysis = generateRaceAnalysis(mockChallengeBase, 54321);
    const totalSegmentDistance = analysis.segments.reduce(
      (sum, seg) => sum + seg.distance,
      0,
    );
    // Float rounding precision check
    expect(totalSegmentDistance).toBeCloseTo(
      mockChallengeBase.race.distance,
      4,
    );
  });

  it("creates contextual recommendations and warnings for extreme heat and hilly terrain", () => {
    const analysis = generateRaceAnalysis(mockChallengeBase, 7890);
    expect(
      analysis.briefing.warnings.some(
        (w) => w.en.includes("heat") || w.en.includes("exhaustion"),
      ),
    ).toBe(true);
    expect(
      analysis.briefing.warnings.some(
        (w) => w.en.includes("hills") || w.en.includes("fatigue"),
      ),
    ).toBe(true);
    expect(
      analysis.briefing.recommendations.some((r) =>
        r.en.includes("Electrolytes"),
      ),
    ).toBe(true);
  });

  it("generates weather timeline with correct checkpoints terminating at the total distance", () => {
    const analysis = generateRaceAnalysis(mockChallengeBase, 999);
    const weatherTimeline = analysis.weather;

    expect(weatherTimeline.checkpoints[0]).toBe(0);
    expect(
      weatherTimeline.checkpoints[weatherTimeline.checkpoints.length - 1],
    ).toBe(mockChallengeBase.race.distance);
    expect(weatherTimeline.temperature.length).toBe(
      weatherTimeline.checkpoints.length,
    );
    expect(weatherTimeline.humidity.length).toBe(
      weatherTimeline.checkpoints.length,
    );
  });
});
