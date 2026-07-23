import { describe, it, expect, beforeEach } from "vitest";
import { DEFAULT_RUNNER_PROFILE, DEFAULT_RUNNER_STATE } from "@/runner/runner-types";
import { generateWeeklyPlan, calculateAdherence } from "@/training/weekly-plan-engine";
import { recordTrainingActivity } from "@/training/training-engine";
import { generateCoachRecommendation } from "@/training/coach-recommendation";
import { loadRunnerState, saveRunnerState } from "@/runner/runner-persistence";
import { loadTrainingState, saveTrainingState } from "@/training/training-store";
import { DEFAULT_TRAINING_STATE } from "@/training/training-types";
import type { RaceOccurrence } from "@/scheduling/race-calendar-types";

describe("Sprint 32: Training Performance Overhaul Tests", () => {
  beforeEach(() => {
    // Reset local storage mock state before each test
    saveRunnerState({
      profile: { ...DEFAULT_RUNNER_PROFILE, currentFitness: 30, currentFatigue: 10, currentReadiness: 80 },
      lastUpdated: new Date().toISOString(),
    });
    saveTrainingState({
      ...DEFAULT_TRAINING_STATE,
      trainingHistory: [],
      adaptationQueue: [],
    });
  });

  it("Task 1: Default starting fitness is set to Beginner Tier (fitness 30, fatigue 10, readiness 80)", () => {
    expect(DEFAULT_RUNNER_PROFILE.currentFitness).toBe(30);
    expect(DEFAULT_RUNNER_PROFILE.currentFatigue).toBe(10);
    expect(DEFAULT_RUNNER_PROFILE.currentReadiness).toBe(80);
  });

  it("Task 2: generateWeeklyPlan respects explicit templateId selection", () => {
    const runnerState = loadRunnerState();
    const plan = generateWeeklyPlan(0, runnerState, [], "performance");
    expect(plan.templateUsed).toBe("performance");
    expect(plan.plannedActivities.length).toBe(7);
    expect(plan.plannedActivities[1].activity).toBe("Interval Training");
  });

  it("Task 4: recordTrainingActivity applies immediate fitness gain (30%), updates fatigue/readiness & increments totalTrainingDays", () => {
    const initialRunner = loadRunnerState();
    const initialFitness = initialRunner.profile.currentFitness; // 30
    const initialTrainingDays = initialRunner.profile.totalTrainingDays; // 0

    recordTrainingActivity("Tempo Run", 0);

    const updatedRunner = loadRunnerState();
    // Tempo run has fitness 2 in ACTIVITY_EFFECTS, 30% immediate = 0.6
    expect(updatedRunner.profile.currentFitness).toBeCloseTo(initialFitness + 0.6, 1);
    expect(updatedRunner.profile.totalTrainingDays).toBe(initialTrainingDays + 1);

    // Check that remaining 70% (1.4) was queued for adaptation
    const trainingState = loadTrainingState();
    expect(trainingState.adaptationQueue.length).toBe(1);
    expect(trainingState.adaptationQueue[0].fitnessGain).toBeCloseTo(1.4, 1);
  });

  it("Task 5: calculateAdherence correctly uses currentDayIndex for missed workouts", () => {
    const runnerState = loadRunnerState();
    const plan = generateWeeklyPlan(0, runnerState, []);

    // On day 0 (start of week), 0 workouts should be missed
    const adherenceStart = calculateAdherence(plan, 0);
    expect(adherenceStart.missedWorkouts).toBe(0);

    // On day 3, without completing any workouts, days 0, 1, 2 are missed (3 workouts)
    const adherenceMid = calculateAdherence(plan, 3);
    expect(adherenceMid.missedWorkouts).toBe(3);
  });

  it("Task 9: Coach recommendations are race-aware", () => {
    const upcomingRaces: RaceOccurrence[] = [
      {
        scheduleId: "race_1",
        raceId: "race_5k_1",
        name: "City 5K",
        description: "Fast 5K",
        locationId: "city_park",
        tier: "local",
        entryFee: 20,
        prizePool: 100,
        icon: "🏆",
        color: "blue",
        dayIndex: 5,
        registrationOpensAt: 0,
        registrationClosesAt: 4,
        isCompleted: false,
        isRegistered: true,
        isFull: false,
      },
    ];

    // Day 4 (1 day before race): recommendation should be Full Rest + race prep tip
    const recDay4 = generateCoachRecommendation(4, upcomingRaces);
    expect(recDay4.recommendation).toBe("Full Rest");
    expect(recDay4.message).toContain("big race tomorrow");

    // Day 3 (2 days before race): recommendation should be Taper
    const recDay3 = generateCoachRecommendation(3, upcomingRaces);
    expect(recDay3.message).toContain("Taper");
  });
});
