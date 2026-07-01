import { describe, expect, it } from "vitest";
import {
  generateCoachPreview,
  generateForecast,
  generateHiddenConditions,
  generateTomorrowPreview,
} from "@/engine/anticipation/anticipation-engine";
import { generateRaceAnalysis } from "@/engine/intelligence/intelligence-engine";
import type { DailyChallenge } from "@/types/engine";

const mockChallengeBase: DailyChallenge = {
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
  analysis: {
    hazards: [],
    hiddenConditions: [],
    recommendations: [],
  },
};

const mockAnalysis = generateRaceAnalysis(mockChallengeBase, 12345);

describe("Anticipation Engine", () => {
  it("generates deterministic forecast with the same seed", () => {
    const forecast1 = generateForecast(123, mockChallengeBase.environment, 0.8);
    const forecast2 = generateForecast(123, mockChallengeBase.environment, 0.8);
    expect(forecast1).toEqual(forecast2);
  });

  it("produces 100% accurate forecast when accuracy parameter is 1.0", () => {
    const forecast = generateForecast(999, mockChallengeBase.environment, 1.0);
    expect(forecast.weather).toBe(mockChallengeBase.environment.weather);
    expect(forecast.temperature).toBe(
      mockChallengeBase.environment.temperature,
    );
    expect(forecast.humidity).toBe(mockChallengeBase.environment.humidity);
    expect(forecast.confidence).toBe(100);
  });

  it("allows weather and temperature perturbation when accuracy is lower", () => {
    // With 0.0 accuracy, it should perturb because random.next() (which is 0-1) is almost certainly > 0.0.
    const forecast = generateForecast(111, mockChallengeBase.environment, 0.0);
    // Since we picked alternative weathers, it should be different from the true 'hot' weather
    expect(forecast.weather).not.toBe(mockChallengeBase.environment.weather);
    expect(forecast.confidence).toBe(0);
  });

  it("generates hidden conditions correctly mapped from analysis hazards and hiddenConditions", () => {
    const hidden = generateHiddenConditions(555, mockAnalysis);
    expect(hidden.length).toBeGreaterThan(0);

    for (const h of hidden) {
      expect(h.visibility).toBe("hidden");
      expect(h.revealTrigger).toBeDefined();
      expect(typeof h.id).toBe("string");
      expect(["hazard", "condition", "event"]).toContain(h.category);
    }
  });

  it("produces contextual coach recommendations", () => {
    const forecast = generateForecast(888, mockChallengeBase.environment, 1.0);
    const coachPreview = generateCoachPreview(888, mockChallengeBase, forecast);

    expect(coachPreview.title.en).toBeDefined();
    expect(coachPreview.summary.en).toBeDefined();
    expect(coachPreview.recommendation.en).toBeDefined();
  });

  it("compiles a complete TomorrowPreview deterministically", () => {
    const preview1 = generateTomorrowPreview(
      777,
      mockChallengeBase,
      mockAnalysis,
      0.9,
      "trail",
      3,
    );
    const preview2 = generateTomorrowPreview(
      777,
      mockChallengeBase,
      mockAnalysis,
      0.9,
      "trail",
      3,
    );

    expect(preview1).toEqual(preview2);
    expect(preview1.distance).toBe(mockChallengeBase.race.distance);
    expect(preview1.surface).toBe(mockChallengeBase.race.surface);
    expect(preview1.difficulty).toBe(3);
    expect(preview1.category).toBe("trail");
    expect(preview1.knownConditions).toContain("distance");
    expect(preview1.knownConditions).toContain("forecast");
  });
});
