import { describe, expect, it } from "vitest";
import { AtmosphereEngine } from "@/engine/atmosphere/atmosphere-engine";
import { CrowdEngine } from "@/engine/atmosphere/crowd-engine";
import type { DailyChallenge, SimulationState } from "@/types/engine";

describe("CrowdEngine & AtmosphereEngine", () => {
  const crowdEngine = new CrowdEngine();
  const atmosphereEngine = new AtmosphereEngine();

  const mockChallenge = (
    surface: "road" | "trail" | "track",
    weather: "sunny" | "rain",
    timeOfDay: "morning" | "night",
  ): DailyChallenge => ({
    id: "challenge_test",
    date: "2026-07-13",
    environment: {
      weather,
      temperature: 20,
      humidity: 50,
      wind: { direction: "north", speed: 5 },
      timeOfDay,
    },
    race: {
      title: { en: "Test Race", id: "Balapan Uji" },
      description: { en: "Test desc", id: "Uji desk" },
      distance: 10,
      surface,
      elevation: "flat",
      checkpoints: [],
    },
    objective: {
      targetTime: 2400,
    },
    storySeed: { mood: "optimistic" },
  });

  describe("CrowdEngine", () => {
    it("should generate rival close commentary", () => {
      const state = {
        distanceCovered: 3,
        totalDistance: 10,
        energy: 80,
        hydration: 80,
        focus: 80,
        fatigue: 20,
        confidence: 80,
        accumulatedTime: 800,
        opponents: [
          {
            id: "opp_1",
            name: "Rival",
            archetype: "steady",
            distanceCovered: 3,
            accumulatedTime: 800,
            energy: 80,
            hydration: 80,
            isDNF: false,
            paceSeconds: 270,
          },
        ],
      } as SimulationState;

      const result = crowdEngine.generateReaction(state, true);
      expect(result).toBeDefined();
      expect(result?.intensity).toBe("intense");
      expect(result?.commentary.en).toContain("gap narrows");
    });

    it("should return final km finish line cheer in the final kilometer", () => {
      const state = {
        distanceCovered: 9.1,
        totalDistance: 10,
        energy: 80,
        hydration: 80,
        focus: 80,
        fatigue: 20,
        confidence: 80,
        accumulatedTime: 2300,
        opponents: [
          {
            id: "opp_1",
            name: "Rival",
            archetype: "steady",
            distanceCovered: 9,
            accumulatedTime: 2350,
            energy: 80,
            hydration: 80,
            isDNF: false,
            paceSeconds: 270,
          },
        ],
      } as SimulationState;

      const result = crowdEngine.generateReaction(state, false);
      expect(result).toBeDefined();
      expect(result?.intensity).toBe("high");
      expect(result?.commentary.en).toContain("finish line");
    });
  });

  describe("AtmosphereEngine", () => {
    it("should return atmosphere on km 3, 6, 9 etc.", () => {
      const challenge = mockChallenge("road", "sunny", "morning");
      const state = {
        distanceCovered: 3,
        totalDistance: 10,
        energy: 80,
        hydration: 80,
        focus: 80,
        fatigue: 20,
        confidence: 80,
        accumulatedTime: 700,
      } as SimulationState;

      const result = atmosphereEngine.generateAtmosphere(state, challenge);
      expect(result).toBeDefined();
      expect(result?.en).toContain("morning dew sparkles");
      expect(result?.en).toContain("hard asphalt");
    });

    it("should return null on other km markers", () => {
      const challenge = mockChallenge("road", "sunny", "morning");
      const state = {
        distanceCovered: 4,
        totalDistance: 10,
        energy: 80,
        hydration: 80,
        focus: 80,
        fatigue: 20,
        confidence: 80,
        accumulatedTime: 700,
      } as SimulationState;

      const result = atmosphereEngine.generateAtmosphere(state, challenge);
      expect(result).toBeNull();
    });
  });
});
