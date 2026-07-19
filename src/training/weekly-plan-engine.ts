/**
 * Weekly Plan Engine (Sprint 30 - Task 3)
 * 
 * Core logic for generating, validating, and managing weekly training plans.
 * Auto-generates plans every Monday based on runner state and upcoming races.
 */

import { v4 as uuidv4 } from "uuid";
import type { RunnerState } from "../runner/runner-types";
import type { RaceOccurrence } from "../scheduling/race-calendar-types";
import type {
  WeeklyPlan,
  PlannedActivity,
  PlanTemplate,
  PlanValidation,
  AdherenceMetrics,
  DailyActivity,
} from "./training-types";
import {
  PLAN_TEMPLATES,
  selectOptimalTemplate,
  isHardActivity,
  getActivityEnergyCost,
  RECOVERY_TEMPLATE,
} from "./plan-templates";

/**
 * Generate a weekly training plan based on current runner state
 */
export function generateWeeklyPlan(
  startDayIndex: number,
  runnerState: RunnerState,
  upcomingRaces: RaceOccurrence[] = []
): WeeklyPlan {
  const weekStartDay = getWeekStartDay(startDayIndex);
  const weekEndDay = weekStartDay + 6;

  // Check if there's a race in the next 14 days
  const hasUpcomingRace = upcomingRaces.some(
    (race) => race.dayIndex >= weekStartDay && race.dayIndex <= weekStartDay + 14
  );

  // Check if there was a race in the past 7 days
  const hadRecentRace = upcomingRaces.some(
    (race) => race.isCompleted && race.dayIndex >= weekStartDay - 7 && race.dayIndex < weekStartDay
  );

  // Select appropriate template
  let template: PlanTemplate;
  
  if (hadRecentRace) {
    // Post-race recovery week
    template = RECOVERY_TEMPLATE;
  } else if (hasUpcomingRace) {
    // Taper week before race - reduce volume by 30%
    const baseTemplate = selectOptimalTemplate(
      runnerState.profile.currentFitness || 50,
      runnerState.profile.currentFatigue || 30,
      false
    );
    template = createTaperTemplate(baseTemplate);
  } else {
    // Normal training week
    template = selectOptimalTemplate(
      runnerState.profile.currentFitness || 50,
      runnerState.profile.currentFatigue || 30,
      false
    );
  }

  // Generate planned activities for the week
  const plannedActivities: PlannedActivity[] = template.weeklyActivities.map(
    (activity, index) => ({
      dayIndex: weekStartDay + index,
      dayOfWeek: index as 0 | 1 | 2 | 3 | 4 | 5 | 6,
      activity,
      isCompleted: false,
      energyCost: getActivityEnergyCost(activity),
    })
  );

  // Create the weekly plan
  const plan: WeeklyPlan = {
    id: uuidv4(),
    weekStartDay,
    weekEndDay,
    plannedActivities,
    templateUsed: template.id as any,
    createdAt: Date.now(),
    adherenceRate: 0,
    coachFeedback: [],
    isActive: true,
  };

  // Check for races and apply race-aware adjustments
  for (const race of upcomingRaces) {
    if (isTaperWeek(startDayIndex, race) || isRaceWeek(startDayIndex, race) || isRecoveryWeek(startDayIndex, race)) {
      const adjustedPlan = adjustPlanForRace(plan, race);
      plan.plannedActivities = adjustedPlan.plannedActivities;
      break;
    }
  }

  // Validate and add feedback
  const validation = validateWeeklyPlan(plan, runnerState);
  plan.coachFeedback = generatePlanFeedback(plan, validation, hasUpcomingRace, hadRecentRace);

  return plan;
}

/**
 * Create a tapered version of a template (30% volume reduction)
 */
function createTaperTemplate(baseTemplate: PlanTemplate): PlanTemplate {
  const taperedActivities = baseTemplate.weeklyActivities.map((activity) => {
    // Convert hard sessions to easier versions
    if (activity === "Long Run") return "Easy Run";
    if (activity === "Interval Training") return "Tempo Run";
    if (activity === "Hill Repeats") return "Easy Run";
    // Keep easy runs and rest days
    return activity;
  });

  return {
    ...baseTemplate,
    id: "taper",
    name: "Taper Week",
    description: "Reduced volume before race day",
    weeklyActivities: taperedActivities,
    totalVolume: Math.round(baseTemplate.totalVolume * 0.7),
  };
}

/**
 * Get Monday's dayIndex for the current week
 */
export function getWeekStartDay(currentDayIndex: number): number {
  // Assuming dayIndex 0 is a Monday, calculate the start of the current week
  const dayOfWeek = currentDayIndex % 7;
  return currentDayIndex - dayOfWeek;
}

/**
 * Check if it's time to generate a new plan (Monday)
 */
export function shouldGenerateNewPlan(
  currentDayIndex: number,
  lastPlanStartDay: number
): boolean {
  const currentWeekStart = getWeekStartDay(currentDayIndex);
  return currentWeekStart > lastPlanStartDay;
}

/**
 * Validate a weekly plan for safety and effectiveness
 */
export function validateWeeklyPlan(
  plan: WeeklyPlan,
  runnerState: RunnerState
): PlanValidation {
  const warnings: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  const activities = plan.plannedActivities.map((p) => p.activity);

  // Count activity types
  const hardDays = activities.filter(isHardActivity).length;
  const restDays = activities.filter((a) => a === "Full Rest").length;

  // Rule 1: Maximum 2 hard days per week
  if (hardDays > 2) {
    warnings.push(`⚠️ ${hardDays} hard days scheduled - high injury risk. Consider replacing one with an easy run.`);
    score -= 20;
  }

  // Rule 2: Minimum 1 rest day per week
  if (restDays === 0) {
    warnings.push("⚠️ No rest days scheduled - overtraining risk. Add at least one full rest day.");
    score -= 25;
  }

  // Rule 3: Check hard day spacing (minimum 48 hours apart)
  const hardDaySpacing = validateHardDaySpacing(activities);
  if (!hardDaySpacing) {
    warnings.push("⚠️ Hard days are back-to-back. Allow 48+ hours between intense sessions.");
    score -= 15;
  }

  // Rule 4: High fatigue warning
  if ((runnerState.profile.currentFatigue || 0) > 70 && hardDays > 1) {
    warnings.push("⚠️ Your fatigue is high. Consider a recovery week instead.");
    score -= 10;
  }

  // Positive feedback
  if (hardDays === 2 && hardDaySpacing) {
    suggestions.push("✅ Great plan! Your hard days are well-spaced for optimal recovery.");
  }

  if (restDays >= 1 && restDays <= 2) {
    suggestions.push("✅ Good balance of training and recovery.");
  }

  // Suggestions for improvement
  if (hardDays === 1) {
    suggestions.push("💡 Tip: Consider adding a second quality session for faster improvement.");
  }

  if (restDays > 2 && (runnerState.profile.currentFitness || 0) > 50) {
    suggestions.push("💡 You could handle more volume - consider adding another easy run.");
  }

  const isValid = warnings.length === 0;

  return {
    isValid,
    warnings,
    suggestions,
    score: Math.max(0, score),
  };
}

/**
 * Check if hard days are properly spaced (48h+ apart)
 */
export function validateHardDaySpacing(activities: DailyActivity[]): boolean {
  const hardDayIndices = activities
    .map((activity, index) => (isHardActivity(activity) ? index : -1))
    .filter((index) => index !== -1);

  // Check if any two hard days are adjacent
  for (let i = 0; i < hardDayIndices.length - 1; i++) {
    if (hardDayIndices[i + 1] - hardDayIndices[i] === 1) {
      return false; // Back-to-back hard days
    }
  }

  return true;
}

/**
 * Generate coach feedback on plan quality
 */
export function generatePlanFeedback(
  plan: WeeklyPlan,
  validation: PlanValidation,
  hasUpcomingRace: boolean = false,
  hadRecentRace: boolean = false
): string[] {
  const feedback: string[] = [];

  // Race-specific feedback
  if (hadRecentRace) {
    feedback.push("🎉 Great race! This week is for recovery - easy efforts only.");
  } else if (hasUpcomingRace) {
    feedback.push("🏁 Race coming up! This is your taper week. Focus on rest and light runs.");
  }

  // Add validation warnings and suggestions
  feedback.push(...validation.warnings);
  feedback.push(...validation.suggestions);

  // General encouragement
  if (validation.score >= 80) {
    feedback.push("👍 This is a solid, balanced training plan. Stay consistent!");
  } else if (validation.score >= 60) {
    feedback.push("⚡ Decent plan, but consider the suggestions above for optimization.");
  }

  return feedback;
}

/**
 * Calculate plan adherence metrics
 */
export function calculateAdherence(plan: WeeklyPlan): AdherenceMetrics {
  const totalPlanned = plan.plannedActivities.length;
  const completed = plan.plannedActivities.filter((p) => p.isCompleted);
  const totalCompleted = completed.length;
  const swapped = completed.filter((p) => p.reason === "swapped").length;
  const missed = plan.plannedActivities.filter(
    (p) => !p.isCompleted && p.dayIndex < Date.now()
  ).length;

  const completionRate = totalPlanned > 0 
    ? Math.round((totalCompleted / totalPlanned) * 100) 
    : 0;

  const substitutionRate = totalCompleted > 0 
    ? Math.round((swapped / totalCompleted) * 100) 
    : 0;

  return {
    completionRate,
    substitutionRate,
    missedWorkouts: missed,
    totalPlanned,
    totalCompleted,
  };
}

/**
 * Swap a planned activity with a new one
 */
export function swapActivity(
  plan: WeeklyPlan,
  dayIndex: number,
  newActivity: DailyActivity
): WeeklyPlan {
  const updatedActivities = plan.plannedActivities.map((pa) => {
    if (pa.dayIndex === dayIndex) {
      return {
        ...pa,
        activity: newActivity,
        energyCost: getActivityEnergyCost(newActivity),
      };
    }
    return pa;
  });

  return {
    ...plan,
    plannedActivities: updatedActivities,
    templateUsed: "custom", // Mark as custom after manual edit
  };
}

/**
 * Mark activity as completed
 */
export function completeActivity(
  plan: WeeklyPlan,
  dayIndex: number,
  actualActivity: DailyActivity
): WeeklyPlan {
  const updatedActivities = plan.plannedActivities.map((pa) => {
    if (pa.dayIndex === dayIndex) {
      const wasSwapped = pa.activity !== actualActivity;
      return {
        ...pa,
        isCompleted: true,
        actualActivity: wasSwapped ? actualActivity : undefined,
        completedAt: Date.now(),
        reason: wasSwapped ? "swapped" : "completed",
      } as PlannedActivity;
    }
    return pa;
  });

  // Recalculate adherence
  const updatedPlan: WeeklyPlan = {
    ...plan,
    plannedActivities: updatedActivities,
  };

  const adherence = calculateAdherence(updatedPlan);
  updatedPlan.adherenceRate = adherence.completionRate;

  return updatedPlan;
}

/**
 * Get today's planned activity from the current plan
 */
export function getTodaysPlannedActivity(
  plan: WeeklyPlan | null,
  currentDayIndex: number
): PlannedActivity | null {
  if (!plan) return null;

  return plan.plannedActivities.find((pa) => pa.dayIndex === currentDayIndex) || null;
}

/**
 * Check if race is within 7 days (taper week)
 */
export function isTaperWeek(dayIndex: number, race: RaceOccurrence): boolean {
  return race.dayIndex >= dayIndex && race.dayIndex <= dayIndex + 7;
}

/**
 * Check if race is on this day (race week)
 */
export function isRaceWeek(dayIndex: number, race: RaceOccurrence): boolean {
  return race.dayIndex === dayIndex;
}

/**
 * Check if race was within past 3 days (recovery week)
 */
export function isRecoveryWeek(dayIndex: number, race: RaceOccurrence): boolean {
  return race.isCompleted && race.dayIndex < dayIndex && race.dayIndex >= dayIndex - 3;
}

/**
 * Adjust plan activities based on race timing
 */
export function adjustPlanForRace(plan: WeeklyPlan, race: RaceOccurrence): WeeklyPlan {
  const weekStartDay = plan.weekStartDay;
  const updatedActivities = plan.plannedActivities.map((pa) => {
    const dayDiff = race.dayIndex - pa.dayIndex;
    if (isRaceWeek(pa.dayIndex, race)) {
      // Race day: mostly rest with light tempo if needed
      return { ...pa, activity: "Easy Run" as DailyActivity, energyCost: getActivityEnergyCost("Easy Run") };
    }
    if (isTaperWeek(pa.dayIndex, race) && !isRaceWeek(pa.dayIndex, race)) {
      // Taper week: easy runs and recovery
      if (pa.activity === "Interval Training" || pa.activity === "Hill Repeats" || pa.activity === "Long Run") {
        return { ...pa, activity: "Easy Run" as DailyActivity, energyCost: getActivityEnergyCost("Easy Run") };
      }
      return { ...pa, activity: "Easy Run" as DailyActivity, energyCost: getActivityEnergyCost("Easy Run") };
    }
    if (isRecoveryWeek(pa.dayIndex, race)) {
      // Recovery week after race: more rest, easy runs
      return { ...pa, activity: "Easy Run" as DailyActivity, energyCost: getActivityEnergyCost("Easy Run") };
    }
    return pa;
  });

  return {
    ...plan,
    plannedActivities: updatedActivities,
  };
}

/**
 * Check if a day is in the current week
 */
export function isInCurrentWeek(dayIndex: number, weekStartDay: number): boolean {
  return dayIndex >= weekStartDay && dayIndex <= weekStartDay + 6;
}
