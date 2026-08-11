// medical-treatments.ts
// Medical treatment options for injury recovery.

import type { InjurySeverity } from "./injury-types";

/**
 * A medical treatment option available to the runner.
 */
export interface Treatment {
  id: string;
  name: string;
  description: string;
  cost: number;
  recoverySpeedup: number; // Multiplier: 0.5 = cuts recovery time in half, 1.0 = no effect
  injurySeverityApplicable: InjurySeverity[];
  availableAtLevel: number;
  successRate: number; // 0-1, chance that treatment is effective
  instantHeal?: boolean; // If true, injury is immediately healed
}

/**
 * Available medical treatments.
 */
export const TREATMENTS: Treatment[] = [
  {
    id: "rest",
    name: "Rest",
    description: "Natural recovery through rest and time",
    cost: 0,
    recoverySpeedup: 1.0, // No speedup, natural healing
    injurySeverityApplicable: ["minor", "moderate", "major", "critical"],
    availableAtLevel: 1,
    successRate: 1.0, // Always works, just takes time
    instantHeal: false,
  },
  {
    id: "ice_compression",
    name: "Ice & Compression",
    description: "DIY treatment for minor injuries using ice and compression",
    cost: 50,
    recoverySpeedup: 0.8, // 20% faster recovery
    injurySeverityApplicable: ["minor"],
    availableAtLevel: 1,
    successRate: 0.95, // 95% success rate
    instantHeal: false,
  },
  {
    id: "physiotherapy",
    name: "Physiotherapy Session",
    description:
      "Professional treatment to speed recovery and prevent recurrence",
    cost: 200,
    recoverySpeedup: 0.7, // 30% faster recovery
    injurySeverityApplicable: ["minor", "moderate"],
    availableAtLevel: 5,
    successRate: 0.9, // 90% success rate
    instantHeal: false,
  },
  {
    id: "sports_medicine",
    name: "Sports Medicine Specialist",
    description:
      "Expert treatment for serious injuries with advanced techniques",
    cost: 500,
    recoverySpeedup: 0.6, // 40% faster recovery
    injurySeverityApplicable: ["moderate", "major"],
    availableAtLevel: 10,
    successRate: 0.85, // 85% success rate
    instantHeal: false,
  },
  {
    id: "surgery",
    name: "Surgical Intervention",
    description: "Required for critical injuries, provides fastest recovery",
    cost: 2000,
    recoverySpeedup: 0.5, // 50% faster recovery
    injurySeverityApplicable: ["major", "critical"],
    availableAtLevel: 15,
    successRate: 0.8, // 80% success rate
    instantHeal: false,
  },
  {
    id: "miracle_cure",
    name: "Miracle Cure",
    description: "Experimental treatment that can instantly heal any injury",
    cost: 5000,
    recoverySpeedup: 0.0, // Not applicable for instant heal
    injurySeverityApplicable: ["minor", "moderate", "major", "critical"],
    availableAtLevel: 20,
    successRate: 0.7, // 70% success rate
    instantHeal: true, // Instantly heals the injury
  },
];

/**
 * Get treatment by ID.
 */
export function getTreatmentById(treatmentId: string): Treatment | null {
  return TREATMENTS.find((t) => t.id === treatmentId) || null;
}

/**
 * Get treatments applicable to a specific injury severity.
 */
export function getTreatmentsForSeverity(
  severity: InjurySeverity,
): Treatment[] {
  return TREATMENTS.filter((treatment) =>
    treatment.injurySeverityApplicable.includes(severity),
  );
}

/**
 * Get treatments that the runner can afford and is at the right level for.
 */
export function getAvailableTreatments(
  severity: InjurySeverity,
  runnerLevel: number,
  currentBalance: number,
): Treatment[] {
  return getTreatmentsForSeverity(severity).filter((treatment) => {
    // Check level requirement
    if (runnerLevel < treatment.availableAtLevel) {
      return false;
    }

    // Check affordability (except for rest which is free)
    if (treatment.id !== "rest" && currentBalance < treatment.cost) {
      return false;
    }

    return true;
  });
}

/**
 * Get the most cost-effective treatment for a given severity and budget.
 */
export function getBestTreatmentForBudget(
  severity: InjurySeverity,
  runnerLevel: number,
  currentBalance: number,
): Treatment | null {
  const availableTreatments = getAvailableTreatments(
    severity,
    runnerLevel,
    currentBalance,
  );

  if (availableTreatments.length === 0) {
    return null;
  }

  // Sort by recovery speedup (lower is better) and then by cost (lower is better)
  availableTreatments.sort((a, b) => {
    // Prefer instant heal
    if (a.instantHeal && !b.instantHeal) return -1;
    if (!a.instantHeal && b.instantHeal) return 1;

    // Prefer better recovery speedup
    if (a.recoverySpeedup !== b.recoverySpeedup) {
      return a.recoverySpeedup - b.recoverySpeedup;
    }

    // Prefer lower cost
    return a.cost - b.cost;
  });

  return availableTreatments[0];
}

/**
 * Calculate the cost of treating all current injuries with the best available treatments.
 */
export function calculateTotalTreatmentCost(
  injuries: Array<{ severity: InjurySeverity }>,
  runnerLevel: number,
): number {
  let totalCost = 0;

  for (const injury of injuries) {
    const bestTreatment = getBestTreatmentForBudget(
      injury.severity,
      runnerLevel,
      Number.MAX_SAFE_INTEGER, // Assume unlimited budget for calculation
    );

    if (bestTreatment && bestTreatment.id !== "rest") {
      totalCost += bestTreatment.cost;
    }
  }

  return totalCost;
}
