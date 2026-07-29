import { describe, it, expect, beforeEach } from "vitest";
import { calculateGhostDistanceAtTime, getGhostGapMeters } from "../../components/race/ghost-runner";
import type { GhostRunner } from "../../store/ghost-store";
import { LeaderboardService } from "../../services/leaderboard/leaderboard-service";
import { calculateSpectatorCount } from "../../components/race/spectator-mode";
import { getUpcomingMilestoneMarkers } from "../achievements/race-achievements";
import { getComboMultiplier } from "../../components/race/combo-streak";
import { earnRacePrize } from "../../economy/earning-engine";
import type { EconomyState } from "../../economy/economy-types";
import type { GameState } from "../timeline/time-types";

describe("Sprint 37: Social Competition & Community Engagement Tests", () => {
  // ── 1. Ghost Runner Interpolation Tests ────────────────────────────────────
  describe("Ghost Runner Interpolation", () => {
    const testGhost: GhostRunner = {
      id: "ghost_test_1",
      name: "Test Runner",
      type: "personal",
      distance: 5,
      splitTimes: [0, 240, 480, 720, 960, 1200], // 4m/km
      finalTime: 1200,
      avatarColor: "#3b82f6",
    };

    it("calculates exact km position at split checkpoints", () => {
      expect(calculateGhostDistanceAtTime(testGhost, 0)).toBe(0);
      expect(calculateGhostDistanceAtTime(testGhost, 240)).toBe(1);
      expect(calculateGhostDistanceAtTime(testGhost, 480)).toBe(2);
      expect(calculateGhostDistanceAtTime(testGhost, 1200)).toBe(5);
    });

    it("interpolates position smoothly between split checkpoints", () => {
      // At 120s (halfway through 1st km), distance should be 0.5km
      const distHalfway = calculateGhostDistanceAtTime(testGhost, 120);
      expect(distHalfway).toBeCloseTo(0.5, 2);

      // At 360s (halfway through 2nd km), distance should be 1.5km
      const dist15 = calculateGhostDistanceAtTime(testGhost, 360);
      expect(dist15).toBeCloseTo(1.5, 2);
    });

    it("calculates gap meters accurately between player and ghost", () => {
      // Ghost at 2.5km, player at 2.0km -> 500m ahead
      const gap = getGhostGapMeters(2.0, 2.5);
      expect(gap).toBe(500);

      // Ghost at 1.8km, player at 2.0km -> -200m behind
      const gapBehind = getGhostGapMeters(2.0, 1.8);
      expect(gapBehind).toBe(-200);
    });
  });

  // ── 2. Leaderboard & Activity Feed Service Tests ─────────────────────────
  describe("Leaderboard & Activity Feed Service", () => {
    it("returns top entries for daily leaderboard", () => {
      const entries = LeaderboardService.getLeaderboard("daily");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].rank).toBe(1);
    });

    it("allows pushing new global activity feed items", () => {
      const initialCount = LeaderboardService.getActivityFeed().length;
      LeaderboardService.pushActivity({
        playerName: "Test Runner",
        achievement: "Set new course record!",
        distance: "5K",
        time: "17:30",
        type: "record",
      });
      const updatedFeed = LeaderboardService.getActivityFeed();
      expect(updatedFeed.length).toBeGreaterThan(initialCount);
      expect(updatedFeed.some((item) => item.playerName === "Test Runner")).toBe(true);
    });
  });

  // ── 3. Spectator Mode Simulation Tests ──────────────────────────────────
  describe("Spectator Mode Simulation", () => {
    it("scales spectator count with runner level and race distance", () => {
      const lowLevelCount = calculateSpectatorCount(1, 0);
      const highLevelCount = calculateSpectatorCount(10, 0);
      expect(highLevelCount).toBeGreaterThan(lowLevelCount);

      const midRaceCount = calculateSpectatorCount(10, 5);
      expect(midRaceCount).toBeGreaterThan(0);
    });
  });

  // ── 4. Milestone Markers & Achievement Preview Tests ─────────────────────
  describe("Milestone Markers", () => {
    it("returns halfway and finish milestone markers for upcoming distances", () => {
      const markers = getUpcomingMilestoneMarkers(1.0, 5.0, 1, 3);
      expect(markers.length).toBeGreaterThan(0);
      expect(markers.some((m) => m.id === "ms_halfway")).toBe(true);
      expect(markers.some((m) => m.id === "ms_finish")).toBe(true);
    });
  });

  // ── 5. Combo Multiplier Tests ───────────────────────────────────────────
  describe("Combo Multipliers", () => {
    it("scales multipliers based on combo count", () => {
      expect(getComboMultiplier(0)).toBe(1.0);
      expect(getComboMultiplier(3)).toBe(1.2);
      expect(getComboMultiplier(6)).toBe(1.5);
      expect(getComboMultiplier(11)).toBe(2.0);
      expect(getComboMultiplier(16)).toBe(2.5);
    });
  });

  // ── 6. Win Streak Economy Prize Multiplier Tests ───────────────────────
  describe("Win Streak Prize Multiplier", () => {
    const mockEconomy: EconomyState = {
      currentBalance: 1000,
      totalEarned: 1000,
      totalSpent: 0,
      transactions: [],
      lastTransactionDay: 1,
    };

    const mockGameState: GameState = {
      dayIndex: 10,
      phase: "active_day",
      calendar: [],
      schedules: {},
      runners: [],
      sponsorship: {
        availableSponsors: [],
        currentSponsor: undefined,
        reputationScore: 50,
        contractDayRemaining: 0,
        completedRacesCount: 0,
      },
      expenses: {
        activeExpenses: [],
        paymentHistory: [],
        unpaidMandatoryCount: 0,
        lastExpenseProcessedDay: 0,
      },
      economy: mockEconomy,
    };

    it("applies streak bonus multipliers to prize money", () => {
      const noStreakResult = earnRacePrize(mockEconomy, mockGameState, 100, 10, 1, "5K Championship", 0);
      const streak2Result = earnRacePrize(mockEconomy, mockGameState, 100, 10, 1, "5K Championship", 2);
      const streak5Result = earnRacePrize(mockEconomy, mockGameState, 100, 10, 1, "5K Championship", 5);

      expect(streak2Result.prize).toBeGreaterThan(noStreakResult.prize);
      expect(streak5Result.prize).toBeGreaterThan(streak2Result.prize);
    });
  });
});
