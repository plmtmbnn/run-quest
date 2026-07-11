import { describe, expect, it } from "vitest";
import { simulateRace } from "@/engine/simulation/engine";
import type { DailyChallenge, SimulationInput } from "@/types/engine";

const mockChallenge: DailyChallenge = {
  id: "progression_challenge",
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

describe("Simulation Progression Systems", () => {
  it("should finish faster with higher fitness", () => {
    const lowFitnessInput: SimulationInput = {
      ...baseInput,
      runnerProfile: {
        id: "low_fit",
        displayName: "Low Fitness",
        createdAt: "",
        totalRuns: 0,
        totalDistance: 0,
        totalRaceTime: 0,
        totalTrainingDays: 0,
        currentWeek: 1,
        currentSeason: 1,
        currentFitness: 20,
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
      },
    };

    const highFitnessInput: SimulationInput = {
      ...baseInput,
      runnerProfile: {
        id: "high_fit",
        displayName: "High Fitness",
        createdAt: "",
        totalRuns: 0,
        totalDistance: 0,
        totalRaceTime: 0,
        totalTrainingDays: 0,
        currentWeek: 1,
        currentSeason: 1,
        currentFitness: 90,
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
      },
    };

    const lowResult = simulateRace(lowFitnessInput);
    const highResult = simulateRace(highFitnessInput);

    expect(highResult.finishTime).toBeLessThan(lowResult.finishTime);
  });

  it("should finish faster with higher Speed attribute", () => {
    const lowSpeedInput: SimulationInput = {
      ...baseInput,
      runnerProfile: {
        id: "low_speed",
        displayName: "Low Speed",
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
      },
    };

    const highSpeedInput: SimulationInput = {
      ...baseInput,
      runnerProfile: {
        id: "high_speed",
        displayName: "High Speed",
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
        speedAttr: 80,
        staminaAttr: 10,
        hydrationAttr: 10,
        willpowerAttr: 10,
      },
    };

    const lowResult = simulateRace(lowSpeedInput);
    const highResult = simulateRace(highSpeedInput);

    expect(highResult.finishTime).toBeLessThan(lowResult.finishTime);
  });

  it("should consume less energy with higher Stamina attribute", () => {
    const lowStaminaInput: SimulationInput = {
      ...baseInput,
      runnerProfile: {
        id: "low_stamina",
        displayName: "Low Stamina",
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
      },
    };

    const highStaminaInput: SimulationInput = {
      ...baseInput,
      runnerProfile: {
        id: "high_stamina",
        displayName: "High Stamina",
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
        staminaAttr: 90,
        hydrationAttr: 10,
        willpowerAttr: 10,
      },
    };

    const lowResult = simulateRace(lowStaminaInput);
    const highResult = simulateRace(highStaminaInput);

    const lastLowState = lowResult.stateLog[lowResult.stateLog.length - 1];
    const lastHighState = highResult.stateLog[highResult.stateLog.length - 1];

    expect(lastHighState.energy).toBeGreaterThan(lastLowState.energy);
  });

  it("should consume less water with higher Hydration attribute", () => {
    const lowHydrationInput: SimulationInput = {
      ...baseInput,
      runnerProfile: {
        id: "low_hydration",
        displayName: "Low Hydration",
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
      },
    };

    const highHydrationInput: SimulationInput = {
      ...baseInput,
      runnerProfile: {
        id: "high_hydration",
        displayName: "High Hydration",
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
        hydrationAttr: 90,
        willpowerAttr: 10,
      },
    };

    const lowResult = simulateRace(lowHydrationInput);
    const highResult = simulateRace(highHydrationInput);

    const lastLowState = lowResult.stateLog[lowResult.stateLog.length - 1];
    const lastHighState = highResult.stateLog[highResult.stateLog.length - 1];

    expect(lastHighState.hydration).toBeGreaterThan(lastLowState.hydration);
  });
});
