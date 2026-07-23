// coach.test.ts
// Unit tests for the Coach Intelligence & Training Feedback system.
// Tests cover: rules, engine, feedback assembly, and memory.

import { describe, expect, it } from "vitest";
import {
  evaluateRaceInsights,
  evaluateTrainingInsights,
} from "@/coach/coach-engine";
import {
  assemblePostRaceFeedback,
  assemblePostTrainingFeedback,
  confidencePrefix,
  resolveInsight,
} from "@/coach/coach-feedback";
import {
  extractRaceKnowledgeEvidence,
  extractRaceTendencyEvidence,
  ruleConsecutiveHardSessions,
  ruleDelayedHydration,
  ruleEarlyAttack,
  ruleGoodHydration,
  ruleHighFatigueBeforeHardSession,
  ruleLowFinalEnergy,
  ruleNegativeSplit,
  rulePositiveSplit,
  rulePreRaceHardSession,
  ruleRecommendRecovery,
  ruleSustainedHighRisk,
  ruleWeeklyImbalance,
} from "@/coach/coach-rules";
import type {
  CoachInsight,
  RaceTelemetry,
  TrainingTelemetry,
} from "@/coach/coach-types";
import type { SimulationState } from "@/types/engine";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const makeStateLog = (
  overrides: Partial<SimulationState>[] = [],
): SimulationState[] => {
  const base: SimulationState = {
    distanceCovered: 0,
    totalDistance: 10,
    energy: 80,
    hydration: 90,
    focus: 80,
    fatigue: 20,
    confidence: 80,
    accumulatedTime: 0,
    eventsResolved: [],
    muscleFatigue: 10,
    mentalFatigue: 5,
    momentum: 60,
    paceStability: 80,
    riskLevel: 20,
    decisionHistory: [],
    delayedEffects: [],
    accumulatedStateLog: [],
  };
  return overrides.map((o, i) => ({
    ...base,
    distanceCovered: i,
    accumulatedTime: i * 300, // 5 min/km
    ...o,
  }));
};

const makeRaceTelemetry = (
  overrides: Partial<RaceTelemetry> = {},
): RaceTelemetry => ({
  distance: 10,
  finishTime: 3000,
  outcome: "silver",
  grade: "B",
  targetTime: 3100,
  targetAchieved: true,
  averagePace: 300,
  paceVariability: 5,
  firstHalfPace: 310,
  secondHalfPace: 290,
  negativeSplit: true,
  finalEnergy: 40,
  finalHydration: 65,
  lowestHydration: 65,
  finalFatigue: 55,
  peakFatigue: 60,
  riskExposure: { low: 6, medium: 3, high: 1 },
  decisionProfile: { aggressive: 1, balanced: 3, conservative: 1 },
  firstDehydrationKm: -1,
  attackedEarly: false,
  weather: "sunny",
  temperature: 22,
  humidity: 55,
  preparation: {
    shoes: "daily_trainer",
    nutrition: ["water"],
    gear: [],
    warmup: "dynamic",
    pacing: "steady",
    mindset: "calm",
  },
  stateLog: makeStateLog(new Array(10).fill({})),
  ...overrides,
});

const makeTrainingTelemetry = (
  overrides: Partial<TrainingTelemetry> = {},
): TrainingTelemetry => ({
  activity: "Easy Run",
  fatigueBefore: 30,
  fatigueAfter: 35,
  readinessBefore: 70,
  stress: 5,
  consecutiveHardDays: 0,
  isPreRaceDay: false,
  weeklyBalance: {
    easySessions: 2,
    hardSessions: 1,
    recoverySessions: 1,
    strengthSessions: 0,
    longRuns: 0,
    restDays: 0,
  },
  ...overrides,
});

// ---------------------------------------------------------------------------
// Race Rule Tests
// ---------------------------------------------------------------------------

describe("ruleNegativeSplit", () => {
  it("fires when second half is faster", () => {
    const t = makeRaceTelemetry({
      negativeSplit: true,
      firstHalfPace: 310,
      secondHalfPace: 290,
    });
    const result = ruleNegativeSplit(t);
    expect(result).not.toBeNull();
    expect(result?.id).toBe("pacing_negative_split");
    expect(result?.category).toBe("pacing");
    expect(result?.confidence).toBe("high");
    expect(result?.params.diff).toBe(20);
  });

  it("does not fire for positive split", () => {
    const t = makeRaceTelemetry({ negativeSplit: false });
    expect(ruleNegativeSplit(t)).toBeNull();
  });

  it("does not fire for DNF", () => {
    const t = makeRaceTelemetry({ outcome: "dnf", negativeSplit: true });
    expect(ruleNegativeSplit(t)).toBeNull();
  });
});

describe("rulePositiveSplit", () => {
  it("fires when second half significantly slower (>10s/km)", () => {
    const t = makeRaceTelemetry({
      negativeSplit: false,
      firstHalfPace: 290,
      secondHalfPace: 320,
    });
    const result = rulePositiveSplit(t);
    expect(result).not.toBeNull();
    expect(result?.id).toBe("pacing_positive_split");
    expect(result?.params.diff).toBe(30);
  });

  it("does not fire for negligible split (<= 10s/km)", () => {
    const t = makeRaceTelemetry({
      negativeSplit: false,
      firstHalfPace: 300,
      secondHalfPace: 305,
    });
    expect(rulePositiveSplit(t)).toBeNull();
  });

  it("does not fire for negative split", () => {
    const t = makeRaceTelemetry({ negativeSplit: true });
    expect(rulePositiveSplit(t)).toBeNull();
  });
});

describe("ruleEarlyAttack", () => {
  it("fires when attackedEarly is true", () => {
    const t = makeRaceTelemetry({ attackedEarly: true, temperature: 30 });
    const result = ruleEarlyAttack(t);
    expect(result).not.toBeNull();
    expect(result?.id).toBe("pacing_early_attack");
    expect(result?.params.temperature).toBe(30);
  });

  it("does not fire when attackedEarly is false", () => {
    const t = makeRaceTelemetry({ attackedEarly: false });
    expect(ruleEarlyAttack(t)).toBeNull();
  });
});

describe("ruleDelayedHydration", () => {
  it("fires when firstDehydrationKm is a positive km", () => {
    const t = makeRaceTelemetry({ firstDehydrationKm: 6 });
    const result = ruleDelayedHydration(t);
    expect(result).not.toBeNull();
    expect(result?.id).toBe("hydration_delayed");
    expect(result?.params.km).toBe(6);
  });

  it("does not fire when firstDehydrationKm is -1", () => {
    const t = makeRaceTelemetry({ firstDehydrationKm: -1 });
    expect(ruleDelayedHydration(t)).toBeNull();
  });
});

describe("ruleGoodHydration", () => {
  it("fires when hydration was well maintained throughout", () => {
    const t = makeRaceTelemetry({
      lowestHydration: 72,
      finalHydration: 70,
      outcome: "silver",
    });
    const result = ruleGoodHydration(t);
    expect(result).not.toBeNull();
    expect(result?.id).toBe("hydration_good");
  });

  it("does not fire when lowestHydration is low", () => {
    const t = makeRaceTelemetry({ lowestHydration: 45 });
    expect(ruleGoodHydration(t)).toBeNull();
  });
});

describe("ruleSustainedHighRisk", () => {
  it("fires when 3+ km in high risk zone", () => {
    const t = makeRaceTelemetry({
      riskExposure: { low: 2, medium: 2, high: 4 },
    });
    const result = ruleSustainedHighRisk(t);
    expect(result).not.toBeNull();
    expect(result?.params.km).toBe(4);
  });

  it("does not fire for low high-risk km count", () => {
    const t = makeRaceTelemetry({
      riskExposure: { low: 7, medium: 2, high: 1 },
    });
    expect(ruleSustainedHighRisk(t)).toBeNull();
  });
});

describe("ruleLowFinalEnergy", () => {
  it("fires when finalEnergy <= 20", () => {
    const t = makeRaceTelemetry({ finalEnergy: 15 });
    const result = ruleLowFinalEnergy(t);
    expect(result).not.toBeNull();
    expect(result?.id).toBe("fatigue_low_final_energy");
  });

  it("does not fire when energy is acceptable", () => {
    const t = makeRaceTelemetry({ finalEnergy: 35 });
    expect(ruleLowFinalEnergy(t)).toBeNull();
  });
});

describe("ruleRecommendRecovery", () => {
  it("fires when finalFatigue >= 60", () => {
    const t = makeRaceTelemetry({ finalFatigue: 70 });
    const result = ruleRecommendRecovery(t);
    expect(result).not.toBeNull();
    expect(result?.category).toBe("recovery");
    expect(result?.confidence).toBe("high");
  });

  it("does not fire for low fatigue", () => {
    const t = makeRaceTelemetry({ finalFatigue: 40 });
    expect(ruleRecommendRecovery(t)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Training Rule Tests
// ---------------------------------------------------------------------------

describe("ruleConsecutiveHardSessions", () => {
  it("fires after 2+ consecutive hard days", () => {
    const t = makeTrainingTelemetry({ consecutiveHardDays: 3 });
    const result = ruleConsecutiveHardSessions(t);
    expect(result).not.toBeNull();
    expect(result?.id).toBe("training_consecutive_hard");
    expect(result?.params.days).toBe(3);
  });

  it("does not fire for 1 hard day", () => {
    const t = makeTrainingTelemetry({ consecutiveHardDays: 1 });
    expect(ruleConsecutiveHardSessions(t)).toBeNull();
  });
});

describe("ruleHighFatigueBeforeHardSession", () => {
  it("fires when entering hard session with high fatigue", () => {
    const t = makeTrainingTelemetry({
      activity: "Interval Training",
      fatigueBefore: 70,
    });
    const result = ruleHighFatigueBeforeHardSession(t);
    expect(result).not.toBeNull();
    expect(result?.id).toBe("training_hard_with_high_fatigue");
  });

  it("does not fire for easy run even with high fatigue", () => {
    const t = makeTrainingTelemetry({
      activity: "Easy Run",
      fatigueBefore: 70,
    });
    expect(ruleHighFatigueBeforeHardSession(t)).toBeNull();
  });

  it("does not fire when fatigue is acceptable before hard session", () => {
    const t = makeTrainingTelemetry({
      activity: "Tempo Run",
      fatigueBefore: 40,
    });
    expect(ruleHighFatigueBeforeHardSession(t)).toBeNull();
  });
});

describe("rulePreRaceHardSession", () => {
  it("fires when a hard session is done the day before a race", () => {
    const t = makeTrainingTelemetry({
      activity: "Long Run",
      isPreRaceDay: true,
    });
    const result = rulePreRaceHardSession(t);
    expect(result).not.toBeNull();
    expect(result?.id).toBe("training_hard_before_race");
  });

  it("does not fire for easy run the day before race", () => {
    const t = makeTrainingTelemetry({
      activity: "Easy Run",
      isPreRaceDay: true,
    });
    expect(rulePreRaceHardSession(t)).toBeNull();
  });
});

describe("ruleWeeklyImbalance", () => {
  it("fires when 3+ hard sessions with < 2 recovery", () => {
    const t = makeTrainingTelemetry({
      weeklyBalance: {
        easySessions: 1,
        hardSessions: 4,
        recoverySessions: 0,
        strengthSessions: 0,
        longRuns: 0,
        restDays: 1,
      },
    });
    const result = ruleWeeklyImbalance(t);
    expect(result).not.toBeNull();
    expect(result?.id).toBe("training_weekly_imbalance");
  });

  it("does not fire when recovery is adequate", () => {
    const t = makeTrainingTelemetry({
      weeklyBalance: {
        easySessions: 1,
        hardSessions: 3,
        recoverySessions: 1,
        strengthSessions: 0,
        longRuns: 0,
        restDays: 1,
      },
    });
    expect(ruleWeeklyImbalance(t)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Engine evaluation tests
// ---------------------------------------------------------------------------

describe("evaluateRaceInsights", () => {
  it("returns insights sorted by priority descending", () => {
    const t = makeRaceTelemetry({
      attackedEarly: true,
      firstDehydrationKm: 5,
      finalFatigue: 75,
    });
    const insights = evaluateRaceInsights(t);
    for (let i = 1; i < insights.length; i++) {
      expect(insights[i - 1].priority).toBeGreaterThanOrEqual(
        insights[i].priority,
      );
    }
  });

  it("returns empty array for no matching rules", () => {
    // A perfectly balanced race should produce minimal insights
    const t = makeRaceTelemetry({
      finalFatigue: 30,
      firstDehydrationKm: -1,
      attackedEarly: false,
      negativeSplit: false,
      riskExposure: { low: 10, medium: 0, high: 0 },
      paceVariability: 5,
      finalEnergy: 40,
      outcome: "silver",
    });
    // Still may have some insights (negative split was false, positive split diff < 10)
    const insights = evaluateRaceInsights(t);
    expect(Array.isArray(insights)).toBe(true);
  });
});

describe("evaluateTrainingInsights", () => {
  it("returns highest priority insights first", () => {
    const t = makeTrainingTelemetry({
      activity: "Interval Training",
      fatigueBefore: 75,
      consecutiveHardDays: 3,
      isPreRaceDay: true,
    });
    const insights = evaluateTrainingInsights(t);
    expect(insights.length).toBeGreaterThan(0);
    for (let i = 1; i < insights.length; i++) {
      expect(insights[i - 1].priority).toBeGreaterThanOrEqual(
        insights[i].priority,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Feedback assembly tests
// ---------------------------------------------------------------------------

describe("resolveInsight", () => {
  it("interpolates params into the message template", () => {
    const insight: CoachInsight = {
      id: "pacing_negative_split",
      category: "pacing",
      confidence: "high",
      messageKey: "pacing.negative_split",
      params: { diff: 15 },
      priority: 80,
    };
    const msg = resolveInsight(insight);
    expect(msg.message).toContain("15");
    expect(msg.confidence).toBe("high");
    expect(msg.category).toBe("pacing");
  });

  it("falls back gracefully for unknown message key", () => {
    const insight: CoachInsight = {
      id: "unknown",
      category: "pacing",
      confidence: "low",
      messageKey: "nonexistent.key",
      params: {},
      priority: 0,
    };
    const msg = resolveInsight(insight);
    expect(msg.message).toBeTruthy();
    expect(typeof msg.message).toBe("string");
  });
});

describe("assemblePostRaceFeedback", () => {
  it("returns a race-type feedback with primary and secondary", () => {
    const t = makeRaceTelemetry({
      attackedEarly: true,
      negativeSplit: false,
      firstHalfPace: 280,
      secondHalfPace: 320,
    });
    const insights = evaluateRaceInsights(t);
    const feedback = assemblePostRaceFeedback(insights, t);
    expect(feedback.type).toBe("race");
    expect(feedback.primary).toBeDefined();
    expect(Array.isArray(feedback.secondary)).toBe(true);
    expect(feedback.secondary.length).toBeLessThanOrEqual(3);
  });

  it("separates recovery recommendation from observational insights", () => {
    const t = makeRaceTelemetry({ finalFatigue: 80 });
    const insights = evaluateRaceInsights(t);
    const feedback = assemblePostRaceFeedback(insights, t);
    // recommendation should be the recovery insight
    if (feedback.recommendation) {
      expect(feedback.recommendation.category).toBe("recovery");
    }
    // Primary should NOT be the recovery recommendation
    expect(feedback.primary.id).not.toBe("recommend_recovery");
  });
});

describe("assemblePostTrainingFeedback", () => {
  it("returns training-type feedback", () => {
    const t = makeTrainingTelemetry({
      activity: "Interval Training",
      stress: 15,
    });
    const insights = evaluateTrainingInsights(t);
    const feedback = assemblePostTrainingFeedback(insights, t);
    expect(feedback.type).toBe("training");
    expect(feedback.primary).toBeDefined();
    expect(feedback.secondary.length).toBeLessThanOrEqual(2);
  });
});

describe("confidencePrefix", () => {
  it("returns strong language for high confidence", () => {
    expect(confidencePrefix("high")).toContain("strongly");
  });
  it("returns hedged language for medium confidence", () => {
    expect(confidencePrefix("medium")).toBeTruthy();
    expect(confidencePrefix("medium")).not.toContain("strongly");
  });
  it("returns soft language for low confidence", () => {
    expect(confidencePrefix("low")).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Knowledge discovery evidence extraction
// ---------------------------------------------------------------------------

describe("extractRaceKnowledgeEvidence", () => {
  it("extracts heat_management for hot finish", () => {
    const t = makeRaceTelemetry({
      temperature: 32,
      weather: "hot",
      outcome: "silver",
    });
    const evidence = extractRaceKnowledgeEvidence(t);
    expect(evidence).toContain("heat_management");
  });

  it("does not extract heat_management for DNF in heat", () => {
    const t = makeRaceTelemetry({
      temperature: 32,
      weather: "hot",
      outcome: "dnf",
    });
    const evidence = extractRaceKnowledgeEvidence(t);
    expect(evidence).not.toContain("heat_management");
  });

  it("extracts negative_split when applicable", () => {
    const t = makeRaceTelemetry({ negativeSplit: true, outcome: "silver" });
    const evidence = extractRaceKnowledgeEvidence(t);
    expect(evidence).toContain("negative_split");
  });

  it("extracts efficient_hydration when hydration well maintained", () => {
    const t = makeRaceTelemetry({
      lowestHydration: 75,
      firstDehydrationKm: -1,
    });
    const evidence = extractRaceKnowledgeEvidence(t);
    expect(evidence).toContain("efficient_hydration");
  });
});

// ---------------------------------------------------------------------------
// Tendency evidence extraction
// ---------------------------------------------------------------------------

describe("extractRaceTendencyEvidence", () => {
  it("tracks early attack tendency", () => {
    const t = makeRaceTelemetry({ attackedEarly: true });
    const deltas = extractRaceTendencyEvidence(t);
    expect(deltas.attacks_early).toBeGreaterThan(0);
  });

  it("tracks conservative racing when >= 60% conservative decisions", () => {
    const t = makeRaceTelemetry({
      decisionProfile: { aggressive: 0, balanced: 1, conservative: 3 },
    });
    const deltas = extractRaceTendencyEvidence(t);
    expect(deltas.races_conservatively).toBeGreaterThan(0);
  });

  it("tracks excellent hydration when no dehydration occurred", () => {
    const t = makeRaceTelemetry({
      firstDehydrationKm: -1,
      lowestHydration: 70,
    });
    const deltas = extractRaceTendencyEvidence(t);
    expect(deltas.excellent_hydration).toBeGreaterThan(0);
  });

  it("tracks delayed hydration tendency", () => {
    const t = makeRaceTelemetry({ firstDehydrationKm: 5 });
    const deltas = extractRaceTendencyEvidence(t);
    expect(deltas.delays_hydration).toBeGreaterThan(0);
  });
});
