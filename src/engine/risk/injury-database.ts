/**
 * Injury Database (Sprint 24)
 *
 * Definitions of all injury types with their characteristics.
 */

import type {
  AffectedAttribute,
  Injury,
  InjurySeverity,
  InjuryType,
  Treatment,
} from "./injury-types";
import { TREATMENT_OPTIONS } from "./injury-types";

/**
 * Base template for each injury type.
 */
interface InjuryTemplate {
  type: InjuryType;
  label: string;
  description: string;
  minRecoveryDays: number;
  maxRecoveryDays: number;
  affectedAttribute: AffectedAttribute;
  severityDistribution: {
    minor: number; // probability weight
    moderate: number;
    severe: number;
  };
}

/**
 * All injury type definitions.
 */
export const INJURY_TEMPLATES: Record<InjuryType, InjuryTemplate> = {
  muscle_strain: {
    type: "muscle_strain",
    label: "Muscle Strain",
    description: "Overstretched or torn muscle fibers",
    minRecoveryDays: 3,
    maxRecoveryDays: 10,
    affectedAttribute: "speed",
    severityDistribution: { minor: 60, moderate: 30, severe: 10 },
  },
  stress_fracture: {
    type: "stress_fracture",
    label: "Stress Fracture",
    description: "Small crack in bone from repetitive stress",
    minRecoveryDays: 14,
    maxRecoveryDays: 42,
    affectedAttribute: "all",
    severityDistribution: { minor: 20, moderate: 50, severe: 30 },
  },
  tendinitis: {
    type: "tendinitis",
    label: "Tendinitis",
    description: "Inflammation of tendons from overuse",
    minRecoveryDays: 7,
    maxRecoveryDays: 21,
    affectedAttribute: "stamina",
    severityDistribution: { minor: 40, moderate: 45, severe: 15 },
  },
  fatigue_syndrome: {
    type: "fatigue_syndrome",
    label: "Overtraining Syndrome",
    description: "Systemic fatigue from insufficient recovery",
    minRecoveryDays: 10,
    maxRecoveryDays: 28,
    affectedAttribute: "all",
    severityDistribution: { minor: 30, moderate: 50, severe: 20 },
  },
  minor_pain: {
    type: "minor_pain",
    label: "Minor Ache",
    description: "General soreness and discomfort",
    minRecoveryDays: 1,
    maxRecoveryDays: 5,
    affectedAttribute: "stamina",
    severityDistribution: { minor: 80, moderate: 20, severe: 0 },
  },
};

/**
 * Performance penalties by severity (as decimal percentage).
 */
const SEVERITY_PENALTIES: Record<InjurySeverity, number> = {
  minor: 0.1, // 10% penalty
  moderate: 0.25, // 25% penalty
  severe: 0.5, // 50% penalty
};

/**
 * Risk of worsening by severity (as decimal percentage).
 */
const WORSENING_RISK: Record<InjurySeverity, number> = {
  minor: 0.3, // 30% chance
  moderate: 0.5, // 50% chance
  severe: 0.8, // 80% chance
};

/**
 * Select a random severity based on distribution weights.
 */
function selectSeverity(
  distribution: { minor: number; moderate: number; severe: number },
  random: number, // 0-1
): InjurySeverity {
  const total =
    distribution.minor + distribution.moderate + distribution.severe;
  const normalized = random * total;

  if (normalized < distribution.minor) return "minor";
  if (normalized < distribution.minor + distribution.moderate)
    return "moderate";
  return "severe";
}

/**
 * Generate a specific injury instance.
 */
export function createInjury(
  type: InjuryType,
  dayIndex: number,
  random: number, // 0-1 for deterministic generation
): Injury {
  const template = INJURY_TEMPLATES[type];

  // Use random to derive severity
  const severity = selectSeverity(template.severityDistribution, random);

  // Calculate recovery days based on severity
  const recoveryRange = template.maxRecoveryDays - template.minRecoveryDays;
  const severityFactor =
    severity === "severe" ? 1.0 : severity === "moderate" ? 0.6 : 0.3;
  const recoveryDays = Math.round(
    template.minRecoveryDays + recoveryRange * severityFactor,
  );

  // Determine available treatments (severe injuries get all options)
  const treatments: Treatment[] = [TREATMENT_OPTIONS.rest];
  if (severity !== "minor") {
    treatments.push(TREATMENT_OPTIONS.active_recovery);
  }
  if (severity === "severe") {
    treatments.push(TREATMENT_OPTIONS.medical);
  }

  return {
    id: `injury-${type}-${dayIndex}`,
    type,
    severity,
    affectedAttribute: template.affectedAttribute,
    performancePenalty: SEVERITY_PENALTIES[severity],
    recoveryDaysRemaining: recoveryDays,
    recoveryDaysTotal: recoveryDays,
    riskOfWorsening: WORSENING_RISK[severity],
    acquiredOnDay: dayIndex,
    treatmentOptions: treatments,
  };
}

/**
 * Get a human-readable description of an injury.
 */
export function getInjuryDescription(injury: Injury): string {
  const template = INJURY_TEMPLATES[injury.type];
  const penaltyPercent = Math.round(injury.performancePenalty * 100);
  const worseningPercent = Math.round(injury.riskOfWorsening * 100);

  return `${template.label} (${injury.severity}) - ${template.description}. 
Performance reduced by ${penaltyPercent}%. 
${injury.recoveryDaysRemaining} days recovery remaining. 
Racing increases worsening risk to ${worseningPercent}%.`;
}
