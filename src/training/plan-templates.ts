/**
 * Training Plan Templates (Sprint 30 - Task 2)
 * 
 * Pre-defined weekly training templates for different experience levels.
 * Each template provides a balanced week of training activities.
 */

import type { PlanTemplate, DailyActivity } from "./training-types";

/**
 * Beginner Template - Low volume, high recovery
 * Perfect for new runners building base fitness
 */
export const BEGINNER_TEMPLATE: PlanTemplate = {
  id: "beginner",
  name: "Beginner Plan",
  description: "Easy introduction to consistent training. Focus on building habit and base endurance.",
  difficulty: "beginner",
  weeklyActivities: [
    "Easy Run",          // Monday - 5km
    "Full Rest",         // Tuesday
    "Easy Run",          // Wednesday - 5km
    "Full Rest",         // Thursday
    "Tempo Run",         // Friday - 4km
    "Long Run",          // Saturday - 8km
    "Full Rest",         // Sunday
  ],
  targetFitness: 20,
  maxFatigue: 40,
  totalVolume: 22,
  icon: "🌱",
};

/**
 * Base Building Template - Moderate volume
 * For runners with some experience looking to increase consistency
 */
export const BASE_BUILDING_TEMPLATE: PlanTemplate = {
  id: "base",
  name: "Base Building",
  description: "Balanced weekly volume with one quality session. Build aerobic foundation.",
  difficulty: "intermediate",
  weeklyActivities: [
    "Easy Run",          // Monday - 6km
    "Easy Run",          // Tuesday - 5km
    "Tempo Run",         // Wednesday - 6km
    "Easy Run",          // Thursday - 5km
    "Full Rest",         // Friday
    "Long Run",          // Saturday - 12km
    "Full Rest",         // Sunday
  ],
  targetFitness: 40,
  maxFatigue: 60,
  totalVolume: 34,
  icon: "🏃",
};

/**
 * Performance Template - High intensity
 * For experienced runners targeting race performance
 */
export const PERFORMANCE_TEMPLATE: PlanTemplate = {
  id: "performance",
  name: "Performance Peak",
  description: "Two quality sessions per week. Build speed and race fitness.",
  difficulty: "advanced",
  weeklyActivities: [
    "Easy Run",          // Monday - 6km
    "Interval Training", // Tuesday - 5km + intervals
    "Recovery Run",      // Wednesday - 4km
    "Tempo Run",         // Thursday - 8km
    "Easy Run",          // Friday - 5km
    "Long Run",          // Saturday - 15km
    "Strength Training", // Sunday
  ],
  targetFitness: 60,
  maxFatigue: 75,
  totalVolume: 43,
  icon: "⚡",
};

/**
 * Recovery Week Template - Active recovery
 * For recovery after hard training blocks or races
 */
export const RECOVERY_TEMPLATE: PlanTemplate = {
  id: "recovery",
  name: "Recovery Week",
  description: "Light training for active recovery. Maintain fitness while reducing fatigue.",
  difficulty: "beginner",
  weeklyActivities: [
    "Recovery Run",      // Monday - 4km
    "Full Rest",         // Tuesday
    "Easy Run",          // Wednesday - 5km
    "Full Rest",         // Thursday
    "Recovery Run",      // Friday - 4km
    "Easy Run",          // Saturday - 6km
    "Full Rest",         // Sunday
  ],
  targetFitness: 30,
  maxFatigue: 30,
  totalVolume: 19,
  icon: "🛌",
};

/**
 * All available training templates
 */
export const PLAN_TEMPLATES: PlanTemplate[] = [
  BEGINNER_TEMPLATE,
  BASE_BUILDING_TEMPLATE,
  PERFORMANCE_TEMPLATE,
  RECOVERY_TEMPLATE,
];

/**
 * Get template by ID
 */
export function getTemplateById(id: string): PlanTemplate | undefined {
  return PLAN_TEMPLATES.find((template) => template.id === id);
}

/**
 * Select optimal template based on runner's current fitness and fatigue
 */
export function selectOptimalTemplate(
  fitness: number,
  fatigue: number,
  isRecoveryWeek: boolean = false
): PlanTemplate {
  // If explicitly a recovery week, use recovery template
  if (isRecoveryWeek) {
    return RECOVERY_TEMPLATE;
  }

  // High fatigue (>70) - force recovery week
  if (fatigue > 70) {
    return RECOVERY_TEMPLATE;
  }

  // Low fitness (<30) - beginner template
  if (fitness < 30) {
    return BEGINNER_TEMPLATE;
  }

  // Moderate fatigue (50-70) with good fitness - base building
  if (fatigue > 50 && fitness >= 30 && fitness < 60) {
    return BASE_BUILDING_TEMPLATE;
  }

  // High fitness (60+) and manageable fatigue - performance
  if (fitness >= 60 && fatigue <= 50) {
    return PERFORMANCE_TEMPLATE;
  }

  // Medium fitness (30-60) - base building
  if (fitness >= 30 && fitness < 60) {
    return BASE_BUILDING_TEMPLATE;
  }

  // Default to base building for edge cases
  return BASE_BUILDING_TEMPLATE;
}

/**
 * Check if an activity is considered "hard" training
 */
export function isHardActivity(activity: DailyActivity): boolean {
  return [
    "Tempo Run",
    "Interval Training",
    "Long Run",
    "Hill Repeats",
  ].includes(activity);
}

/**
 * Check if an activity is considered "easy" training
 */
export function isEasyActivity(activity: DailyActivity): boolean {
  return [
    "Recovery Run",
    "Easy Run",
  ].includes(activity);
}

/**
 * Check if an activity is rest or recovery
 */
export function isRestActivity(activity: DailyActivity): boolean {
  return [
    "Full Rest",
    "Mobility Session",
    "Strength Training",
  ].includes(activity);
}

/**
 * Get estimated energy cost for an activity
 */
export function getActivityEnergyCost(activity: DailyActivity): number {
  const energyCosts: Record<DailyActivity, number> = {
    "Full Rest": 0,
    "Mobility Session": 15,
    "Recovery Run": 20,
    "Easy Run": 30,
    "Strength Training": 35,
    "Tempo Run": 45,
    "Hill Repeats": 50,
    "Interval Training": 55,
    "Long Run": 60,
  };

  return energyCosts[activity] || 30;
}
