// coach-rules.ts
// Rule definitions that map telemetry conditions to coach insights.
//
// Each rule is a pure function: (telemetry) → CoachInsight | null.
// A rule returns null when the condition is not met.
//
// Rules MUST:
//   - Only reference data present in the telemetry argument.
//   - Never invent or assume values not supplied.
//   - Remain side-effect free.

import type {
  CoachInsight,
  RaceTelemetry,
  TrainingTelemetry,
} from "./coach-types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Standard deviation of an array of numbers. Returns 0 for empty arrays.
 */
function _stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

// ---------------------------------------------------------------------------
// Race Rules
// ---------------------------------------------------------------------------

/**
 * All race rule evaluators.
 * Each receives a RaceTelemetry and returns one CoachInsight or null.
 */
export type RaceRule = (t: RaceTelemetry) => CoachInsight | null;

// -- Pacing ------------------------------------------------------------------

export const ruleNegativeSplit: RaceRule = (t) => {
  if (t.outcome === "dns" || t.outcome === "dnf") return null;
  if (!t.negativeSplit) return null;
  const diff = Math.round(t.firstHalfPace - t.secondHalfPace);
  return {
    id: "pacing_negative_split",
    category: "pacing",
    confidence: "high",
    messageKey: "pacing.negative_split",
    params: { diff },
    priority: 80,
  };
};

export const rulePositiveSplit: RaceRule = (t) => {
  if (t.outcome === "dns" || t.outcome === "dnf") return null;
  if (t.negativeSplit) return null;
  const diff = Math.round(t.secondHalfPace - t.firstHalfPace);
  if (diff < 10) return null; // Ignore negligible splits.
  return {
    id: "pacing_positive_split",
    category: "pacing",
    confidence: "high",
    messageKey: "pacing.positive_split",
    params: { diff },
    priority: 85,
  };
};

export const ruleEarlyAttack: RaceRule = (t) => {
  if (!t.attackedEarly) return null;
  return {
    id: "pacing_early_attack",
    category: "pacing",
    confidence: "medium",
    messageKey: "pacing.early_attack",
    params: { temperature: t.temperature },
    priority: 90,
  };
};

export const ruleErraticPacing: RaceRule = (t) => {
  if (t.outcome === "dns") return null;
  // paceVariability is pre-computed std dev of per-km times.
  if (t.paceVariability < 15) return null;
  return {
    id: "pacing_erratic",
    category: "pacing",
    confidence: "medium",
    messageKey: "pacing.erratic",
    params: { variability: Math.round(t.paceVariability) },
    priority: 70,
  };
};

// -- Hydration ---------------------------------------------------------------

export const ruleDelayedHydration: RaceRule = (t) => {
  if (t.firstDehydrationKm === -1) return null;
  if (t.firstDehydrationKm < 0) return null;
  return {
    id: "hydration_delayed",
    category: "hydration",
    confidence: "high",
    messageKey: "hydration.delayed",
    params: { km: t.firstDehydrationKm },
    priority: 88,
  };
};

export const ruleGoodHydration: RaceRule = (t) => {
  if (t.outcome === "dns") return null;
  if (t.lowestHydration < 60) return null;
  if (t.finalHydration < 55) return null;
  return {
    id: "hydration_good",
    category: "hydration",
    confidence: "high",
    messageKey: "hydration.good",
    params: { lowestHydration: Math.round(t.lowestHydration) },
    priority: 40,
  };
};

// -- Fatigue & Risk ----------------------------------------------------------

export const ruleSustainedHighRisk: RaceRule = (t) => {
  if (t.riskExposure.high < 3) return null;
  return {
    id: "risk_sustained_high",
    category: "risk",
    confidence: "medium",
    messageKey: "risk.sustained_high",
    params: { km: t.riskExposure.high },
    priority: 75,
  };
};

export const ruleLowFinalEnergy: RaceRule = (t) => {
  if (t.outcome === "dns") return null;
  if (t.finalEnergy > 20) return null;
  return {
    id: "fatigue_low_final_energy",
    category: "fatigue",
    confidence: "high",
    messageKey: "fatigue.low_final_energy",
    params: { finalEnergy: Math.round(t.finalEnergy) },
    priority: 82,
  };
};

export const ruleFinishedWithReserves: RaceRule = (t) => {
  if (t.outcome === "dns" || t.outcome === "dnf") return null;
  if (t.finalEnergy < 60) return null;
  if (t.outcome !== "gold" && t.outcome !== "silver") return null;
  return {
    id: "fatigue_reserves_gold",
    category: "fatigue",
    confidence: "medium",
    messageKey: "fatigue.reserves_with_goal",
    params: { finalEnergy: Math.round(t.finalEnergy) },
    priority: 45,
  };
};

// -- Environmental Adaptation ------------------------------------------------

export const ruleHotConditions: RaceRule = (t) => {
  if (t.temperature < 28 && t.weather !== "hot") return null;
  if (t.attackedEarly) return null; // early_attack rule takes priority
  if (t.outcome === "dns") return null;
  return {
    id: "environment_hot_managed",
    category: "environment",
    confidence: "medium",
    messageKey: "environment.hot_managed",
    params: { temperature: t.temperature },
    priority: 50,
  };
};

export const ruleHotConditionsStruggled: RaceRule = (t) => {
  if (t.temperature < 28 && t.weather !== "hot") return null;
  if (t.outcome !== "dnf" && t.finalHydration > 40) return null;
  return {
    id: "environment_hot_struggled",
    category: "environment",
    confidence: "high",
    messageKey: "environment.hot_struggled",
    params: { temperature: t.temperature },
    priority: 87,
  };
};

// -- Decision Making ---------------------------------------------------------

export const ruleDominantlyAggressive: RaceRule = (t) => {
  const total =
    t.decisionProfile.aggressive +
    t.decisionProfile.balanced +
    t.decisionProfile.conservative;
  if (total === 0) return null;
  if (t.decisionProfile.aggressive / total < 0.6) return null;
  return {
    id: "decision_dominant_aggressive",
    category: "decision_making",
    confidence: "medium",
    messageKey: "decision.dominant_aggressive",
    params: { count: t.decisionProfile.aggressive },
    priority: 65,
  };
};

export const ruleDominantlyConservative: RaceRule = (t) => {
  const total =
    t.decisionProfile.aggressive +
    t.decisionProfile.balanced +
    t.decisionProfile.conservative;
  if (total === 0) return null;
  if (t.decisionProfile.conservative / total < 0.6) return null;
  return {
    id: "decision_dominant_conservative",
    category: "decision_making",
    confidence: "medium",
    messageKey: "decision.dominant_conservative",
    params: { count: t.decisionProfile.conservative },
    priority: 60,
  };
};

// -- DNF / DNS ---------------------------------------------------------------

export const ruleDNF: RaceRule = (t) => {
  if (t.outcome !== "dnf") return null;
  const cause = t.finalHydration <= 0 ? "dehydration" : "energy depletion";
  return {
    id: "outcome_dnf",
    category: "fatigue",
    confidence: "high",
    messageKey: "outcome.dnf",
    params: { cause },
    priority: 100,
  };
};

// -- Recovery Recommendation -------------------------------------------------

export const ruleRecommendRecovery: RaceRule = (t) => {
  if (t.finalFatigue < 60) return null;
  return {
    id: "recommend_recovery",
    category: "recovery",
    confidence: "high",
    messageKey: "recommend.recovery",
    params: { finalFatigue: Math.round(t.finalFatigue) },
    priority: 95,
  };
};

/**
 * All race rules executed in sequence by the engine.
 */
export const RACE_RULES: RaceRule[] = [
  ruleDNF,
  ruleRecommendRecovery,
  ruleEarlyAttack,
  rulePositiveSplit,
  ruleNegativeSplit,
  ruleErraticPacing,
  ruleDelayedHydration,
  ruleGoodHydration,
  ruleSustainedHighRisk,
  ruleLowFinalEnergy,
  ruleFinishedWithReserves,
  ruleHotConditions,
  ruleHotConditionsStruggled,
  ruleDominantlyAggressive,
  ruleDominantlyConservative,
];

// ---------------------------------------------------------------------------
// Training Rules
// ---------------------------------------------------------------------------

export type TrainingRule = (t: TrainingTelemetry) => CoachInsight | null;

export const ruleConsecutiveHardSessions: TrainingRule = (t) => {
  if (t.consecutiveHardDays < 2) return null;
  return {
    id: "training_consecutive_hard",
    category: "recovery",
    confidence: "high",
    messageKey: "training.consecutive_hard",
    params: { days: t.consecutiveHardDays },
    priority: 90,
  };
};

export const ruleHighFatigueBeforeHardSession: TrainingRule = (t) => {
  const hardActivities: string[] = [
    "Tempo Run",
    "Interval Training",
    "Long Run",
    "Hill Repeats",
  ];
  if (!hardActivities.includes(t.activity)) return null;
  if (t.fatigueBefore < 60) return null;
  return {
    id: "training_hard_with_high_fatigue",
    category: "fatigue",
    confidence: "high",
    messageKey: "training.hard_with_high_fatigue",
    params: { fatigue: Math.round(t.fatigueBefore) },
    priority: 88,
  };
};

export const ruleRecoverySessionEffect: TrainingRule = (t) => {
  if (t.activity !== "Recovery Run" && t.activity !== "Mobility Session")
    return null;
  const fatigueReduced = t.fatigueBefore - t.fatigueAfter;
  if (fatigueReduced < 3) return null;
  return {
    id: "training_recovery_effective",
    category: "recovery",
    confidence: "medium",
    messageKey: "training.recovery_effective",
    params: { reduced: Math.round(fatigueReduced) },
    priority: 50,
  };
};

export const ruleHighStressAdaptation: TrainingRule = (t) => {
  if (t.stress < 10) return null;
  return {
    id: "training_high_stress_needs_recovery",
    category: "fatigue",
    confidence: "high",
    messageKey: "training.high_stress_needs_recovery",
    params: { activity: t.activity },
    priority: 85,
  };
};

export const ruleRestDayEffect: TrainingRule = (t) => {
  if (t.activity !== "Full Rest") return null;
  return {
    id: "training_rest_day",
    category: "recovery",
    confidence: "high",
    messageKey: "training.rest_day",
    params: { fatigueBefore: Math.round(t.fatigueBefore) },
    priority: 60,
  };
};

export const rulePreRaceHardSession: TrainingRule = (t) => {
  if (!t.isPreRaceDay) return null;
  const hardActivities: string[] = [
    "Interval Training",
    "Long Run",
    "Hill Repeats",
  ];
  if (!hardActivities.includes(t.activity)) return null;
  return {
    id: "training_hard_before_race",
    category: "risk",
    confidence: "high",
    messageKey: "training.hard_before_race",
    params: { activity: t.activity },
    priority: 92,
  };
};

export const ruleWeeklyImbalance: TrainingRule = (t) => {
  const { hardSessions, recoverySessions, restDays } = t.weeklyBalance;
  const totalHeavy = hardSessions;
  const totalRecovery = recoverySessions + restDays;
  if (totalHeavy < 3) return null;
  if (totalRecovery >= 2) return null;
  return {
    id: "training_weekly_imbalance",
    category: "weekly_balance",
    confidence: "medium",
    messageKey: "training.weekly_imbalance",
    params: { hardSessions, recoveryDays: totalRecovery },
    priority: 70,
  };
};

/**
 * All training rules executed in sequence by the engine.
 */
export const TRAINING_RULES: TrainingRule[] = [
  rulePreRaceHardSession,
  ruleConsecutiveHardSessions,
  ruleHighFatigueBeforeHardSession,
  ruleHighStressAdaptation,
  ruleWeeklyImbalance,
  ruleRecoverySessionEffect,
  ruleRestDayEffect,
];

// ---------------------------------------------------------------------------
// Knowledge Discovery Evidence Rules
// ---------------------------------------------------------------------------

/**
 * Maps a race to knowledge discovery evidence IDs it supports.
 * Returns an array of evidence IDs (may be empty).
 */
export const extractRaceKnowledgeEvidence = (t: RaceTelemetry): string[] => {
  const evidence: string[] = [];

  // Heat Management: finished without DNF/DNS in hot conditions
  if (
    (t.temperature >= 28 || t.weather === "hot") &&
    t.outcome !== "dnf" &&
    t.outcome !== "dns"
  ) {
    evidence.push("heat_management");
  }

  // Negative Split: consistently ran second half faster
  if (t.negativeSplit && t.outcome !== "dns" && t.outcome !== "dnf") {
    evidence.push("negative_split");
  }

  // Efficient Hydration: finished without major dehydration
  if (t.lowestHydration >= 60 && t.firstDehydrationKm === -1) {
    evidence.push("efficient_hydration");
  }

  // Conservative Racer: finished safely from a conservative approach
  if (
    t.decisionProfile.conservative >= 2 &&
    t.outcome !== "dnf" &&
    t.finalEnergy >= 30
  ) {
    evidence.push("conservative_racing");
  }

  return evidence;
};

// ---------------------------------------------------------------------------
// Tendency Evidence Rules
// ---------------------------------------------------------------------------

/**
 * Maps a race telemetry to tendency evidence updates.
 * Returns a map of tendencyId → delta (positive = more evidence for this tendency).
 */
export const extractRaceTendencyEvidence = (
  t: RaceTelemetry,
): Record<string, number> => {
  const updates: Record<string, number> = {};

  if (t.attackedEarly) {
    updates.attacks_early = (updates.attacks_early ?? 0) + 1;
  }

  const total =
    t.decisionProfile.aggressive +
    t.decisionProfile.balanced +
    t.decisionProfile.conservative;

  if (total > 0) {
    if (t.decisionProfile.conservative / total >= 0.6) {
      updates.races_conservatively = (updates.races_conservatively ?? 0) + 1;
    }
    if (t.decisionProfile.aggressive / total >= 0.6) {
      updates.races_aggressively = (updates.races_aggressively ?? 0) + 1;
    }
  }

  if (t.firstDehydrationKm === -1 && t.lowestHydration >= 60) {
    updates.excellent_hydration = (updates.excellent_hydration ?? 0) + 1;
  } else if (t.firstDehydrationKm !== -1) {
    updates.delays_hydration = (updates.delays_hydration ?? 0) + 1;
  }

  if (t.negativeSplit) {
    updates.negative_splitter = (updates.negative_splitter ?? 0) + 1;
  }

  return updates;
};

export const extractTrainingTendencyEvidence = (
  t: TrainingTelemetry,
): Record<string, number> => {
  const updates: Record<string, number> = {};

  if (t.consecutiveHardDays >= 2) {
    updates.poor_recovery_habits = (updates.poor_recovery_habits ?? 0) + 1;
  }

  const recoveryActivities: string[] = [
    "Recovery Run",
    "Mobility Session",
    "Full Rest",
  ];
  if (recoveryActivities.includes(t.activity) && t.fatigueBefore >= 60) {
    updates.good_recovery_habits = (updates.good_recovery_habits ?? 0) + 1;
  }

  return updates;
};
