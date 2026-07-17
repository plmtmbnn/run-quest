import { describe, expect, it } from "vitest";
import {
  calculateWorkPay,
  getAllWorkTypesWithStatus,
  getWorkTypeById,
  isWorkTypeUnlocked,
} from "../../../src/economy/work-types";
import type { GameState } from "../../../src/engine/timeline/time-types";

const mockGameState = (overrides: Partial<GameState> = {}): GameState => {
  return {
    dayIndex: 0,
    startAge: 18,
    lifespan: 80,
    seed: 12345,
    energy: 100,
    energyMax: 100,
    resources: { money: 500 },
    stats: { health: 100, intellect: 10, charisma: 10, strength: 10 },
    skills: { running: 0 },
    relationships: {},
    routine: {},
    flags: { career_wins: 0 },
    economy: {
      currentBalance: 500,
      transactions: [],
      totalEarned: 0,
      totalSpent: 0,
      lastTransactionDay: 0,
    },
    sponsorship: {
      sponsorsAvailable: [],
      pendingOffers: [],
      rejectedOffers: [],
      offerReceivedDay: {},
      rejectionCount: {},
      lifetimeSponsorEarnings: 0,
      monthlyStipendLastClaimed: 0,
      signedAtDay: 0,
    },
    scheduling: { registeredRaces: {} },
    ...overrides,
  } as unknown as GameState;
};

describe("Work Types Engine", () => {
  describe("getWorkTypeById", () => {
    it("returns correct work type config by ID", () => {
      const wt = getWorkTypeById("coaching");
      expect(wt).toBeDefined();
      expect(wt?.name).toBe("Running Coach");
    });

    it("returns undefined for unknown ID", () => {
      expect(getWorkTypeById("astronaut" as any)).toBeUndefined();
    });
  });

  describe("isWorkTypeUnlocked", () => {
    it("unlocks part-time work for anyone over 16", () => {
      const state = mockGameState({ startAge: 16, dayIndex: 0 });
      const wt = getWorkTypeById("part_time");
      expect(wt).toBeDefined();
      expect(isWorkTypeUnlocked(wt!, state)).toBe(true);
    });

    it("locks coaching if player running skill is too low", () => {
      const state = mockGameState({ startAge: 21, skills: { running: 10 } }); // requires 35
      const wt = getWorkTypeById("coaching");
      expect(wt).toBeDefined();
      expect(isWorkTypeUnlocked(wt!, state)).toBe(false);
    });

    it("unlocks coaching if player running skill meets requirement", () => {
      const state = mockGameState({ startAge: 21, skills: { running: 40 } });
      const wt = getWorkTypeById("coaching");
      expect(wt).toBeDefined();
      expect(isWorkTypeUnlocked(wt!, state)).toBe(true);
    });
  });

  describe("calculateWorkPay", () => {
    it("calculates correct base pay for part-time", () => {
      const state = mockGameState();
      const wt = getWorkTypeById("part_time");
      expect(wt).toBeDefined();
      const pay = calculateWorkPay(wt!, state);
      expect(pay).toBe(30);
    });

    it("scales coaching pay with player running skill", () => {
      const stateLowRunning = mockGameState({
        startAge: 21,
        skills: { running: 30 },
      });
      const stateHighRunning = mockGameState({
        startAge: 21,
        skills: { running: 50 },
      });
      const wt = getWorkTypeById("coaching");
      expect(wt).toBeDefined();

      const payLow = calculateWorkPay(wt!, stateLowRunning);
      const payHigh = calculateWorkPay(wt!, stateHighRunning);
      expect(payHigh).toBeGreaterThan(payLow);
    });
  });
});
