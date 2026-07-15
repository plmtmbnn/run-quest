import { beforeEach, describe, expect, it, vi } from "vitest";
import { isNewPersonalBest } from "@/social/ghost-engine";
import {
  applyRpChangeWithProtection,
  calculateRankPointsChange,
  getTierAndDivision,
} from "@/social/ranking-engine";
import {
  createRivalAIData,
  getAdaptiveDifficultyMultiplier,
  simulateRivalTraining,
  simulateRivalsDay,
  type RivalAIData,
} from "@/social/rival-engine";
import {
  getTrend,
  getTimeDeltaVsLastRun,
  getPersonalBestTime,
  getWinStreak,
  getAverageFinishTime,
  saveRunToHistory,
  getLatestRun,
  getPreviousRun,
} from "@/runner/run-history";
import type { RunnerProfile, RunRecord } from "@/runner/runner-types";

// ─── Shared fixtures ─────────────────────────────────────────────────────────

const MOCK_PROFILE: RunnerProfile = {
  id: "test_runner",
  displayName: "Test Runner",
  createdAt: new Date().toISOString(),
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
  coins: 100,
  inventory: {},
  rankPoints: 0,
};

describe("Social & Competition Layer Ranks", () => {
  it("should map RP to correct Tiers and Divisions", () => {
    expect(getTierAndDivision(0)).toEqual({ tier: "Bronze", division: 5 });
    expect(getTierAndDivision(99)).toEqual({ tier: "Bronze", division: 5 });
    expect(getTierAndDivision(100)).toEqual({ tier: "Bronze", division: 4 });
    expect(getTierAndDivision(450)).toEqual({ tier: "Bronze", division: 1 });
    expect(getTierAndDivision(500)).toEqual({ tier: "Silver", division: 5 });
    expect(getTierAndDivision(950)).toEqual({ tier: "Silver", division: 1 });
    expect(getTierAndDivision(2500)).toEqual({ tier: "Elite", division: null });
    expect(getTierAndDivision(3200)).toEqual({ tier: "Elite", division: null });
  });

  it("should calculate correct RP changes based on outcomes and milestones", () => {
    const r1 = calculateRankPointsChange("gold", false, false, false, false);
    expect(r1.rpChange).toBe(100);

    const r2 = calculateRankPointsChange("silver", false, true, false, true);
    expect(r2.rpChange).toBe(60 + 30 + 15);

    const r3 = calculateRankPointsChange("dnf", false, true, true, false);
    expect(r3.rpChange).toBe(-20);
  });

  it("should prevent demotion below major tier thresholds", () => {
    expect(applyRpChangeWithProtection(510, -20)).toBe(500);
    expect(applyRpChangeWithProtection(490, -20)).toBe(470);
    expect(applyRpChangeWithProtection(1050, -80)).toBe(1000);
  });
});

describe("Ghost Run Engine", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(),
      setItem: vi.fn(),
    });
  });

  it("should check qualifications for a new Personal Best correctly", () => {
    const mockGet = vi.spyOn(localStorage, "getItem");
    mockGet.mockReturnValue(null);
    expect(isNewPersonalBest("test_challenge", 1200)).toBe(true);

    mockGet.mockReturnValue(
      JSON.stringify({
        challengeId: "test_challenge",
        finishTime: 1500,
        splits: [300, 300, 300, 300, 300],
      }),
    );
    expect(isNewPersonalBest("test_challenge", 1200)).toBe(true);
    expect(isNewPersonalBest("test_challenge", 1600)).toBe(false);
  });
});

// ─── Rival Engine Tests ──────────────────────────────────────────────────────

describe("Rival AI Progression Engine", () => {
  it("should create rival data with correct defaults", () => {
    const rival = createRivalAIData(
      "test_rival",
      "Test Rival",
      500,
      "frontrunner",
    );
    expect(rival.id).toBe("test_rival");
    expect(rival.name).toBe("Test Rival");
    expect(rival.baseRp).toBe(500);
    expect(rival.currentRp).toBe(500);
    expect(rival.archetype).toBe("frontrunner");
    expect(rival.trainingFocus).toBe("speed");
    expect(rival.recentRpChanges).toEqual([]);
  });

  it("should assign correct training focus based on archetype", () => {
    const speedRival = createRivalAIData("sr", "Speedy", 300, "frontrunner");
    expect(speedRival.trainingFocus).toBe("speed");

    const steadyRival = createRivalAIData("rr", "Runner", 300, "steady");
    expect(steadyRival.trainingFocus).toBe("stamina");

    const splitRival = createRivalAIData("rs", "Splitter", 300, "splitter");
    expect(splitRival.trainingFocus).toBe("balanced");
  });

  it("should return adaptive multiplier based on player vs rival RP gap", () => {
    // Player far ahead — rivals train harder
    expect(getAdaptiveDifficultyMultiplier(1000, 500, 500)).toBe(1.4);
    expect(getAdaptiveDifficultyMultiplier(700, 500, 500)).toBe(1.2);
    expect(getAdaptiveDifficultyMultiplier(600, 500, 500)).toBe(1.1);

    // Player far behind — rivals ease up
    expect(getAdaptiveDifficultyMultiplier(200, 500, 500)).toBe(0.7);
    expect(getAdaptiveDifficultyMultiplier(300, 500, 500)).toBe(0.85);
    expect(getAdaptiveDifficultyMultiplier(400, 500, 500)).toBe(0.95);

    // Close match — normal
    expect(getAdaptiveDifficultyMultiplier(550, 500, 500)).toBe(1.0);
    expect(getAdaptiveDifficultyMultiplier(450, 500, 500)).toBe(1.0);
  });

  it("should simulate a training cycle and return RP change", () => {
    const rival: RivalAIData = {
      ...createRivalAIData("tr", "Test Rival", 500, "steady"),
      currentRp: 500,
    };
    const result = simulateRivalTraining(rival, MOCK_PROFILE, 42);

    expect(result).not.toBeNull();
    expect(typeof result!.rpChange).toBe("number");
    expect(typeof result!.distance).toBe("number");
    expect(result!.distance).toBeGreaterThan(0);
    expect(result!.description.en).toContain("Test Rival");
  });

  it("should return a rest day with small RP loss sometimes", () => {
    // Run many times to hit a rest day
    const rival: RivalAIData = {
      ...createRivalAIData("tr", "Test Rival", 500, "steady"),
      currentRp: 500,
    };
    let foundRest = false;
    for (let i = 0; i < 100; i++) {
      const result = simulateRivalTraining(rival, MOCK_PROFILE, i);
      if (result && result.rpChange < 0) {
        foundRest = true;
        break;
      }
    }
    expect(foundRest).toBe(true);
  });

  it("should simulate a full day of rival progression", () => {
    const rivals: RivalAIData[] = [
      createRivalAIData("r1", "Rival 1", 500, "frontrunner"),
      createRivalAIData("r2", "Rival 2", 600, "steady"),
      createRivalAIData("r3", "Rival 3", 700, "splitter"),
    ];

    const { updatedRivals, activities } = simulateRivalsDay(
      rivals,
      MOCK_PROFILE,
      42,
    );

    expect(updatedRivals.length).toBe(3);
    // Each rival should have updated currentRp
    expect(updatedRivals[0].currentRp).toBeDefined();
    expect(updatedRivals[0].lastActivityDate).not.toBeNull();
    // Activities should contain training results
    expect(activities.length).toBeGreaterThanOrEqual(0);
    expect(activities.length).toBeLessThanOrEqual(3);
  });

  it("should increase rival RP when player is far ahead", () => {
    const playerAhead: RunnerProfile = {
      ...MOCK_PROFILE,
      rankPoints: 1500,
    };
    const rival: RivalAIData = {
      ...createRivalAIData("tr", "Test Rival", 500, "steady"),
      currentRp: 500,
    };

    // Run multiple simulations — rivals should gain more RP when player is ahead
    let totalGain = 0;
    for (let i = 0; i < 50; i++) {
      const result = simulateRivalTraining(rival, playerAhead, i);
      if (result) totalGain += result.rpChange;
    }
    expect(totalGain).toBeGreaterThan(0);
  });
});

// ─── Run History Tests ───────────────────────────────────────────────────────

describe("Run History Engine", () => {
  it("should save a run to history", () => {
    const profile = { ...MOCK_PROFILE, runHistory: [] as RunRecord[] };
    const record: RunRecord = {
      challengeId: "race_1",
      date: "2026-07-15T10:00:00Z",
      distance: 5,
      finishTime: 1800,
      grade: "A",
      score: 850,
      outcome: "gold",
    };
    const updated = saveRunToHistory(profile, record);
    expect(updated.runHistory?.length).toBe(1);
    expect(updated.runHistory?.[0]).toEqual(record);
  });

  it("should replace duplicate challengeId", () => {
    const profile: RunnerProfile = {
      ...MOCK_PROFILE,
      runHistory: [
        {
          challengeId: "race_1",
          date: "2026-07-14T10:00:00Z",
          distance: 5,
          finishTime: 2000,
          grade: "B",
          score: 700,
          outcome: "silver",
        },
      ],
    };
    const record: RunRecord = {
      challengeId: "race_1",
      date: "2026-07-15T10:00:00Z",
      distance: 5,
      finishTime: 1800,
      grade: "A",
      score: 850,
      outcome: "gold",
    };
    const updated = saveRunToHistory(profile, record);
    expect(updated.runHistory?.length).toBe(1);
    expect(updated.runHistory?.[0].finishTime).toBe(1800);
  });

  it("should trim to MAX_RUN_HISTORY entries", () => {
    let profile: RunnerProfile = { ...MOCK_PROFILE, runHistory: [] };
    let p: RunnerProfile = { ...MOCK_PROFILE, runHistory: [] };
    for (let i = 0; i < 30; i++) {
      p = saveRunToHistory(p, {
        challengeId: `race_${i}`,
        date: `2026-07-${String(i % 30).padStart(2, "0")}T10:00:00Z`,
        distance: 5,
        finishTime: 1800 + i * 10,
        grade: "B",
        score: 700,
        outcome: "finish",
      });
    }
    expect(p.runHistory?.length).toBe(25);
  });

  it("should return correct latest and previous runs", () => {
    let p: RunnerProfile = { ...MOCK_PROFILE, runHistory: [] };
    p = saveRunToHistory(p, {
      challengeId: "race_1",
      date: "2026-07-13T10:00:00Z",
      distance: 5,
      finishTime: 2000,
      grade: "B",
      score: 700,
      outcome: "silver",
    });
    p = saveRunToHistory(p, {
      challengeId: "race_2",
      date: "2026-07-14T10:00:00Z",
      distance: 5,
      finishTime: 1900,
      grade: "A",
      score: 800,
      outcome: "gold",
    });
    p = saveRunToHistory(p, {
      challengeId: "race_3",
      date: "2026-07-15T10:00:00Z",
      distance: 5,
      finishTime: 1800,
      grade: "A",
      score: 850,
      outcome: "gold",
    });

    expect(getLatestRun(p)?.challengeId).toBe("race_3");
    expect(getPreviousRun(p)?.challengeId).toBe("race_2");
  });

  it("should calculate time delta correctly", () => {
    let p: RunnerProfile = { ...MOCK_PROFILE, runHistory: [] };
    p = saveRunToHistory(p, {
      challengeId: "race_1",
      date: "2026-07-14T10:00:00Z",
      distance: 5,
      finishTime: 2000,
      grade: "B",
      score: 700,
      outcome: "silver",
    });
    p = saveRunToHistory(p, {
      challengeId: "race_2",
      date: "2026-07-15T10:00:00Z",
      distance: 5,
      finishTime: 1800,
      grade: "A",
      score: 800,
      outcome: "gold",
    });

    expect(getTimeDeltaVsLastRun(p)).toBe(-200); // 200 seconds faster
  });

  it("should return null for insufficient data", () => {
    const p: RunnerProfile = { ...MOCK_PROFILE, runHistory: [] };
    expect(getTimeDeltaVsLastRun(p)).toBeNull();
    expect(getTrend(p)).toBeNull();
    expect(getPersonalBestTime(p)).toBeNull();
    expect(getAverageFinishTime(p)).toBeNull();
  });

  it("should detect improving trend", () => {
    let p: RunnerProfile = { ...MOCK_PROFILE, runHistory: [] };
    // Times go down over time (getting faster) = improving
    // Since saveRunToHistory prepends, we save oldest first:
    // race_0=2000, race_1=1900, race_2=1850, race_3=1800, race_4=1750
    // Array order: [1750, 1800, 1850, 1900, 2000]
    // But getTrend compares runs[i] vs runs[i-1], so it sees 1800>1750 (worse), 1850>1800 (worse)...
    // Actually the array represents chronological order from newest to oldest.
    // Trend checks: if runs[i].finishTime < runs[i-1].finishTime => improving (faster).
    // With array [1750, 1800, ...]: 1800 < 1750? No. So it's declining.
    // We need array where each subsequent is lower: save newest first.
    const times = [1750, 1800, 1850, 1900, 2000]; // newest first
    for (let i = 0; i < times.length; i++) {
      p = saveRunToHistory(p, {
        challengeId: `race_${i}`,
        date: `2026-07-${String(i + 1).padStart(2, "0")}T10:00:00Z`,
        distance: 5,
        finishTime: times[i],
        grade: "B" as const,
        score: 700 + (times.length - 1 - i) * 20,
        outcome: "finish" as const,
      });
    }
    // Array after prepending: [2000, 1900, 1850, 1800, 1750]
    // getTrend: runs[1]=1900 < runs[0]=2000 => improving++, etc.
    expect(getTrend(p)).toBe("improving");
  });

  it("should detect declining trend", () => {
    let p: RunnerProfile = { ...MOCK_PROFILE, runHistory: [] };
    // Times go up over time (getting slower) = declining
    const times = [2000, 1900, 1850, 1800, 1750]; // newest first
    for (let i = 0; i < times.length; i++) {
      p = saveRunToHistory(p, {
        challengeId: `race_${i}`,
        date: `2026-07-${String(i + 1).padStart(2, "0")}T10:00:00Z`,
        distance: 5,
        finishTime: times[i],
        grade: "B" as const,
        score: 800 - (times.length - 1 - i) * 20,
        outcome: "finish" as const,
      });
    }
    // Array after prepending: [1750, 1800, 1850, 1900, 2000]
    expect(getTrend(p)).toBe("declining");
  });

  it("should detect steady trend", () => {
    let p: RunnerProfile = { ...MOCK_PROFILE, runHistory: [] };
    const times = [1800, 1805, 1798, 1802, 1800];
    for (let i = 0; i < times.length; i++) {
      p = saveRunToHistory(p, {
        challengeId: `race_${i}`,
        date: `2026-07-${String(i + 1).padStart(2, "0")}T10:00:00Z`,
        distance: 5,
        finishTime: times[i],
        grade: "B" as const,
        score: 780,
        outcome: "finish" as const,
      });
    }
    expect(getTrend(p)).toBe("steady");
  });

  it("should calculate personal best time", () => {
    let p: RunnerProfile = { ...MOCK_PROFILE, runHistory: [] };
    p = saveRunToHistory(p, {
      challengeId: "race_1",
      date: "2026-07-13T10:00:00Z",
      distance: 5,
      finishTime: 2000,
      grade: "C",
      score: 600,
      outcome: "finish",
    });
    p = saveRunToHistory(p, {
      challengeId: "race_2",
      date: "2026-07-14T10:00:00Z",
      distance: 5,
      finishTime: 1800,
      grade: "A",
      score: 850,
      outcome: "gold",
    });
    p = saveRunToHistory(p, {
      challengeId: "race_3",
      date: "2026-07-15T10:00:00Z",
      distance: 5,
      finishTime: 1900,
      grade: "B",
      score: 750,
      outcome: "silver",
    });

    expect(getPersonalBestTime(p)).toBe(1800);
  });

  it("should calculate win streak", () => {
    let p: RunnerProfile = { ...MOCK_PROFILE, runHistory: [] };
    // Save oldest first so newest golds end up at index 0
    p = saveRunToHistory(p, {
      challengeId: "race_1",
      date: "2026-07-13T10:00:00Z",
      distance: 5,
      finishTime: 1900,
      grade: "B",
      score: 700,
      outcome: "bronze",
    });
    p = saveRunToHistory(p, {
      challengeId: "race_2",
      date: "2026-07-14T10:00:00Z",
      distance: 5,
      finishTime: 1800,
      grade: "A",
      score: 850,
      outcome: "gold",
    });
    p = saveRunToHistory(p, {
      challengeId: "race_3",
      date: "2026-07-15T10:00:00Z",
      distance: 5,
      finishTime: 1750,
      grade: "S",
      score: 950,
      outcome: "gold",
    });
    // Array after prepends: [gold, gold, bronze] => win streak = 2
    expect(getWinStreak(p)).toBe(2);
  });

  it("should calculate average finish time", () => {
    let p: RunnerProfile = { ...MOCK_PROFILE, runHistory: [] };
    p = saveRunToHistory(p, {
      challengeId: "race_1",
      date: "2026-07-13T10:00:00Z",
      distance: 5,
      finishTime: 1800,
      grade: "A",
      score: 850,
      outcome: "gold",
    });
    p = saveRunToHistory(p, {
      challengeId: "race_2",
      date: "2026-07-14T10:00:00Z",
      distance: 5,
      finishTime: 1700,
      grade: "A",
      score: 880,
      outcome: "gold",
    });

    expect(getAverageFinishTime(p)).toBe(1750);
  });
});
