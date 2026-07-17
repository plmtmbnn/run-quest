import { describe, expect, it } from "vitest";
import {
  acceptOffer,
  checkForNewOffers,
  getRaceBonus,
  getWinBonus,
  rejectOffer,
} from "../../../src/economy/sponsorship-engine";
import type { SponsorshipState } from "../../../src/economy/sponsorship-types";
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
    skills: { running: 10 },
    relationships: {},
    routine: {},
    flags: { career_wins: 0, rating: 1500 },
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

describe("Sponsorship Engine", () => {
  describe("checkForNewOffers", () => {
    it("does not offer if requirements are not met", () => {
      const state = mockGameState({ flags: { career_wins: 0, rating: 1500 } });
      const { sponsorshipState, newOffers } = checkForNewOffers(
        state.sponsorship,
        state,
      );
      expect(newOffers).toHaveLength(0);
      expect(sponsorshipState.pendingOffers).toHaveLength(0);
    });

    it("sends offer from Local Runner Shop when requirements met", () => {
      const state = mockGameState({ flags: { career_wins: 3, rating: 1650 } });
      const { sponsorshipState, newOffers } = checkForNewOffers(
        state.sponsorship,
        state,
      );
      expect(newOffers).toContain("local_runner_shop");
      expect(sponsorshipState.pendingOffers).toContain("local_runner_shop");
    });
  });

  describe("acceptOffer / rejectOffer", () => {
    it("transitions state correctly when offer accepted", () => {
      const state = mockGameState({ flags: { career_wins: 3, rating: 1650 } });
      const checkRes = checkForNewOffers(state.sponsorship, state);

      const accepted = acceptOffer(
        checkRes.sponsorshipState,
        "local_runner_shop",
        10,
      );
      expect(accepted.currentSponsor).toBe("local_runner_shop");
      expect(accepted.pendingOffers).not.toContain("local_runner_shop");
      expect(accepted.signedAtDay).toBe(10);
    });

    it("transitions state correctly when offer rejected and obeys cooldown", () => {
      const state = mockGameState({
        flags: { career_wins: 3, rating: 1650 },
        dayIndex: 5,
      });
      const checkRes = checkForNewOffers(state.sponsorship, state);

      const rejected = rejectOffer(
        checkRes.sponsorshipState,
        "local_runner_shop",
      );
      expect(rejected.currentSponsor).toBeUndefined();
      expect(rejected.pendingOffers).not.toContain("local_runner_shop");
      expect(rejected.rejectedOffers).toContain("local_runner_shop");

      // Cooldown check: on day 10 (less than 30 days later), it should not re-offer
      const stateDay10 = { ...state, dayIndex: 10, sponsorship: rejected };
      const checkDay10 = checkForNewOffers(rejected, stateDay10);
      expect(checkDay10.newOffers).not.toContain("local_runner_shop");

      // Cooldown check: on day 40 (more than 30 days later), it should re-offer!
      const stateDay40 = { ...state, dayIndex: 40, sponsorship: rejected };
      const checkDay40 = checkForNewOffers(rejected, stateDay40);
      expect(checkDay40.newOffers).toContain("local_runner_shop");
    });
  });

  describe("benefits calculation", () => {
    it("calculates race and win bonuses for local sponsor", () => {
      const activeState: SponsorshipState = {
        currentSponsor: "local_runner_shop",
        sponsorsAvailable: [],
        pendingOffers: [],
        rejectedOffers: [],
        offerReceivedDay: {},
        rejectionCount: {},
        lifetimeSponsorEarnings: 0,
        monthlyStipendLastClaimed: 0,
        signedAtDay: 0,
      };

      expect(getRaceBonus(activeState)).toBe(10);
      expect(getWinBonus(activeState)).toBe(25);
    });
  });
});
