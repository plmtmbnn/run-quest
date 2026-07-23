"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Settings, Zap, TrendingUp, Heart, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { type TranslationKey, useTranslation } from "../../i18n/use-translation";
import { useRunnerStore } from "../../runner/runner-store";
import { useTimelineStore } from "../../store/timeline-store";
import { processAdaptationQueue } from "../../training/adaptation-engine";
import { generateCoachRecommendation } from "../../training/coach-recommendation";
import { useTrainingStore } from "../../training/training-store";
import type { DailyActivity, PlanTemplate } from "../../training/training-types";
import { initializeWeeklyPlanState } from "../../training/training-store";
import { WeeklyCalendarGrid } from "../../components/training/weekly-calendar-grid";
import { PlanTemplateSelector } from "../../components/training/plan-template-selector";
import { CoachFeedbackPanel } from "../../components/training/coach-feedback-panel";
import { getRegisteredRaces } from "../../scheduling/race-calendar-engine";
import { getWeekStartDay } from "../../training/weekly-plan-engine";
import { recordTrainingActivity } from "../../training/training-engine";
import { loadRunnerState } from "../../runner/runner-persistence";
import { CustomPlanBuilder } from "../../components/training/custom-plan-builder";
import { TrainingResultsOverlay, type WorkoutStatDiff } from "../../components/training/training-results-overlay";

/**
 * Weekly Training Planner Screen (Sprint 30 - Task 9)
 * Replaces the daily training screen with a comprehensive weekly planner.
 */
export function TrainingScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { runnerState } = useRunnerStore();
  const { trainingState, currentWeeklyPlan, planHistory, lastPlanGenerated, 
          setCurrentPlan, generateNewPlan, completeActivity, swapActivity, 
          getAdherenceMetrics } = useTrainingStore();
  const dayIndex = useTimelineStore((s) => s.gameState?.dayIndex ?? 0);
  const energy = useTimelineStore((s) => s.gameState?.energy ?? 0);
  const scheduling = useTimelineStore((s) => s.gameState?.scheduling);
  const upcomingRaces = scheduling ? getRegisteredRaces(scheduling, dayIndex) : [];

  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PlanTemplate | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isFeedbackExpanded, setIsFeedbackExpanded] = useState(true);
  const [autoExpandDayIndex, setAutoExpandDayIndex] = useState<number | undefined>(
    undefined,
  );
  const [isCustomBuilderOpen, setIsCustomBuilderOpen] = useState(false);
  const [workoutOverlay, setWorkoutOverlay] = useState<{
    isOpen: boolean;
    activity: DailyActivity;
    statsDiff: WorkoutStatDiff;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  // Initialize weekly plan state on mount
  useEffect(() => {
    setMounted(true);
    initializeWeeklyPlanState();
  }, []);

  // Process any pending adaptations when the screen loads
  useEffect(() => {
    processAdaptationQueue(dayIndex);
  }, [dayIndex]);

  // Check if we need to generate a new plan (Monday)
  useEffect(() => {
    if (!currentWeeklyPlan) {
      // No plan exists - generate one
      handleGenerateNewPlan();
    } else {
      // Check if it's a new week (Monday)
      const currentWeekStart = getWeekStartDay(dayIndex);
      if (currentWeekStart > currentWeeklyPlan.weekStartDay) {
        handleGenerateNewPlan();
      }
    }
  }, [dayIndex, currentWeeklyPlan?.weekStartDay]);

  // Handle generating a new plan
  const handleGenerateNewPlan = useCallback(() => {
    if (isGeneratingPlan) return;
    
    setIsGeneratingPlan(true);
    try {
      generateNewPlan(dayIndex, runnerState, upcomingRaces);
      setSelectedTemplate(null);
    } finally {
      setIsGeneratingPlan(false);
    }
  }, [dayIndex, runnerState, upcomingRaces, isGeneratingPlan, generateNewPlan]);

  // Handle selecting a template
  const handleSelectTemplate = useCallback(
    (template: PlanTemplate) => {
      setSelectedTemplate(template);

      const hasId = Boolean((template as { id?: string }).id);
      if (hasId) {
        generateNewPlan(dayIndex, runnerState, upcomingRaces, (template as { id: string }).id);
      } else {
        setIsCustomBuilderOpen(true);
      }
    },
    [dayIndex, runnerState, upcomingRaces, generateNewPlan],
  );

  // Handle day selection
  const handleDayClick = useCallback((dayIndex: number) => {
    setSelectedDayIndex(dayIndex);
  }, []);

  // Handle activity completion / swap via calendar picker
  const handleActivityComplete = useCallback((dayIndex: number, activity: DailyActivity) => {
    swapActivity(dayIndex, activity);
  }, [swapActivity]);

  // Handle starting today's workout
  const handleStartWorkout = useCallback(() => {
    if (!currentWeeklyPlan) return;
    
    const todaysActivity = currentWeeklyPlan.plannedActivities.find(
      (pa) => pa.dayIndex === dayIndex
    );
    
    if (todaysActivity) {
      const fitnessBefore = runnerState.profile.currentFitness;
      const fatigueBefore = runnerState.profile.currentFatigue;
      const readinessBefore = runnerState.profile.currentReadiness;

      // 1. Deduct EP via train action in timeline (variable EP)
      useTimelineStore.getState().doAction("train", todaysActivity.energyCost);
      
      // 2. Record the training activity (updates fitness/fatigue/readiness & adaptation queue)
      recordTrainingActivity(todaysActivity.activity, dayIndex);

      // 3. Complete the activity in the plan
      completeActivity(dayIndex, todaysActivity.activity);

      // 4. Fetch updated stats for overlay feedback
      const updatedRunner = loadRunnerState();
      const statsDiff: WorkoutStatDiff = {
        fitnessBefore,
        fitnessAfter: updatedRunner.profile.currentFitness,
        fatigueBefore,
        fatigueAfter: updatedRunner.profile.currentFatigue,
        readinessBefore,
        readinessAfter: updatedRunner.profile.currentReadiness,
        epUsed: todaysActivity.energyCost,
        xpGained: 20,
      };

      setWorkoutOverlay({
        isOpen: true,
        activity: todaysActivity.activity,
        statsDiff,
      });
    }
  }, [currentWeeklyPlan, dayIndex, runnerState, completeActivity]);

  // Get today's planned activity
  const todaysActivity = currentWeeklyPlan?.plannedActivities.find(
    (pa) => pa.dayIndex === dayIndex
  );

  // Get adherence metrics
  const adherence = getAdherenceMetrics(dayIndex);

  // Get coach feedback
  const coachFeedback = currentWeeklyPlan?.coachFeedback || [];

  // Check if we have enough energy for today's workout
  const hasEnoughEnergy = energy >= (todaysActivity?.energyCost || 30);
  const canStartWorkout = todaysActivity && hasEnoughEnergy;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white flex flex-col pb-16">
        <header className="sticky top-0 z-10 border-b border-[#E5E7EB] dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 px-4 md:px-6 py-4 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div>
                <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
                <div className="h-3.5 w-48 bg-slate-200 dark:bg-slate-800 animate-pulse rounded mt-1" />
              </div>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 md:px-6 py-6 flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </main>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white flex flex-col pb-16"
    >
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 border-b border-[#E5E7EB] dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 px-4 md:px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white dark:bg-slate-900 transition hover:bg-gray-50 dark:hover:bg-slate-800 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
              aria-label="Back to Home"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="font-heading text-xl font-black text-slate-800 dark:text-white">
                {t("training.weekly_planner" as TranslationKey)}
              </h1>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {t("training.plan_your_week")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-full text-xs font-black text-orange-400 font-mono shadow-sm">
            <span>⚡</span>
            <span>{energy} EP</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto w-full max-w-6xl px-4 md:px-6 py-6 flex-1 flex flex-col gap-4 md:gap-6">
        {/* Loading state */}
        {isGeneratingPlan && !currentWeeklyPlan && (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {/* Main content when plan exists */}
        {currentWeeklyPlan && !isGeneratingPlan && (
          <>
            {/* Template Selector */}
            <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-4 md:p-6 shadow-sm">
              <PlanTemplateSelector
                currentFitness={runnerState.profile.currentFitness}
                currentFatigue={runnerState.profile.currentFatigue}
                onSelectTemplate={handleSelectTemplate}
                selectedTemplateId={selectedTemplate?.id}
              />
            </div>

            {/* Week Header */}
            <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-4 md:p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
              <div className="min-w-0">
                <h2 className="font-heading text-xl md:text-2xl font-black text-slate-800 dark:text-white truncate">
                  {t("training.this_weeks_plan")}
                </h2>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {`Week ${currentWeeklyPlan.weekStartDay} - ${currentWeeklyPlan.weekEndDay}`}
                </p>
              </div>

              {/* Adherence stat */}
              <div className="w-full md:w-auto md:min-w-[200px] shrink-0">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {t("training.adherence")}
                  </span>
                  <span className="text-sm font-black text-green-600 dark:text-green-400">
                    {adherence.completionRate}%
                    <span className="text-slate-400 dark:text-slate-500 font-medium ml-1.5 text-xs">
                      ({adherence.totalCompleted}/{adherence.totalPlanned})
                    </span>
                  </span>
                </div>
                <div
                  className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={adherence.completionRate}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={t("training.adherence")}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000 ease-out"
                    style={{ width: `${adherence.completionRate}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Weekly Calendar Grid */}
            <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-4 md:p-6 shadow-sm">
              <WeeklyCalendarGrid
                plan={currentWeeklyPlan}
                currentDayIndex={dayIndex}
                onDayClick={handleDayClick}
                onActivityComplete={handleActivityComplete}
                autoExpandDayIndex={autoExpandDayIndex}
              />
            </div>

            {/* Coach Feedback & Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Coach Feedback */}
              <div className="lg:col-span-1">
                <CoachFeedbackPanel
                  feedback={coachFeedback}
                  isExpanded={isFeedbackExpanded}
                  onToggle={() => setIsFeedbackExpanded(!isFeedbackExpanded)}
                />
              </div>

              {/* Weekly Stats */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-4 md:p-6 shadow-sm h-full">
                  <h3 className="font-heading font-black text-lg text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                    <span>📊</span> {t("training.weekly_stats")}
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Volume */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center w-10 h-10 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm mx-auto mb-2">
                        <span className="text-lg text-green-600 dark:text-green-400">🏃</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        {t("training.volume")}
                      </h4>
                      <p className="text-2xl font-black text-slate-800 dark:text-white">
                        {currentWeeklyPlan.plannedActivities.reduce((sum, pa) => {
                          // Estimate distance based on activity type
                          const distanceMap: Record<DailyActivity, number> = {
                            "Recovery Run": 4,
                            "Easy Run": 6,
                            "Tempo Run": 8,
                            "Interval Training": 5,
                            "Long Run": 15,
                            "Hill Repeats": 5,
                            "Strength Training": 0,
                            "Mobility Session": 0,
                            "Full Rest": 0,
                          };
                          return sum + (distanceMap[pa.activity] || 0);
                        }, 0)} km
                      </p>
                    </div>

                    {/* Energy Cost */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center w-10 h-10 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm mx-auto mb-2">
                        <span className="text-lg text-yellow-600 dark:text-yellow-400">⚡</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        {t("training.energy_cost")}
                      </h4>
                      <p className="text-2xl font-black text-slate-800 dark:text-white">
                        {currentWeeklyPlan.plannedActivities.reduce((sum, pa) => sum + pa.energyCost, 0)} EP
                      </p>
                    </div>

                    {/* Hard Days */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center w-10 h-10 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm mx-auto mb-2">
                        <span className="text-lg text-red-600 dark:text-red-400">🔥</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        {t("training.hard_days")}
                      </h4>
                      <p className="text-2xl font-black text-slate-800 dark:text-white">
                        {currentWeeklyPlan.plannedActivities.filter(pa => 
                          ["Tempo Run", "Interval Training", "Long Run", "Hill Repeats"].includes(pa.activity)
                        ).length}
                      </p>
                    </div>

                    {/* Rest Days */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center w-10 h-10 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm mx-auto mb-2">
                        <span className="text-lg text-blue-600 dark:text-blue-400">😴</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        {t("training.rest_days")}
                      </h4>
                      <p className="text-2xl font-black text-slate-800 dark:text-white">
                        {currentWeeklyPlan.plannedActivities.filter(pa => pa.activity === "Full Rest").length}
                      </p>
                    </div>
                  </div>

                  {/* Adherence Progress */}
                  <div className="mt-6">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      {t("training.plan_adherence")}
                    </h4>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all duration-1000 ease-out"
                        style={{ width: `${adherence.completionRate}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span>{adherence.completionRate}% {t("training.complete")}</span>
                      <span>{adherence.missedWorkouts} {t("training.missed")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          <button
            type="button"
            onClick={handleGenerateNewPlan}
            disabled={isGeneratingPlan}
            className="flex-1 py-3 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {t("training.regenerate_plan")}
          </button>

          <button
            type="button"
            onClick={handleStartWorkout}
            disabled={!canStartWorkout}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all shadow-md focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
              canStartWorkout
                ? "bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/20 active:scale-[0.98]"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700"
            }`}
          >
            {todaysActivity ? 
              hasEnoughEnergy ? 
                `${t("training.start_workout")} - ${todaysActivity.activity}` : 
                `${t("training.need_energy")} (${todaysActivity.energyCost} EP)` :
              t("training.no_workout_today")}
          </button>
        </div>
      </main>

      {/* Custom Plan Builder Modal */}
      <CustomPlanBuilder
        isOpen={isCustomBuilderOpen}
        onClose={() => setIsCustomBuilderOpen(false)}
        currentDayIndex={dayIndex}
        runnerState={runnerState}
        onApplyPlan={(newPlan) => {
          setCurrentPlan(newPlan);
          setSelectedTemplate(null);
        }}
      />

      {/* Post-Training Results Feedback Overlay */}
      {workoutOverlay && (
        <TrainingResultsOverlay
          isOpen={workoutOverlay.isOpen}
          onClose={() => setWorkoutOverlay(null)}
          activity={workoutOverlay.activity}
          statsDiff={workoutOverlay.statsDiff}
        />
      )}
    </motion.div>
  );
}