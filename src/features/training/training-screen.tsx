"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";
import { useRunnerStore } from "@/runner/runner-store";
import { processAdaptationQueue } from "@/training/adaptation-engine";
import { generateCoachRecommendation } from "@/training/coach-recommendation";
import {
  getCurrentWeekTrainingHistory,
  recordTrainingActivity,
} from "@/training/training-engine";
import { useTrainingStore } from "@/training/training-store";
import type { DailyActivity } from "@/training/training-types";
import { useTimelineStore } from "@/store/timeline-store";

/**
 * Daily Training screen.
 * Allows players to choose and record their daily training activity.
 */
export function TrainingScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { trainingState } = useTrainingStore();
  const { runnerState } = useRunnerStore();
  const dayIndex = useTimelineStore((s) => s.gameState?.dayIndex ?? 0);
  const [selectedActivity, setSelectedActivity] =
    useState<DailyActivity | null>(null);
  const coachRecommendation = generateCoachRecommendation(dayIndex);

  // Process any pending adaptations when the screen loads.
  processAdaptationQueue(dayIndex);

  // Get the current week's training history.
  const currentWeekTraining = getCurrentWeekTrainingHistory(dayIndex);

  // Handle activity selection.
  const handleSelectActivity = (activity: DailyActivity) => {
    setSelectedActivity(activity);
  };

  // Handle recording the activity.
  const handleRecordActivity = () => {
    if (!selectedActivity) return;

    recordTrainingActivity(selectedActivity, dayIndex);
    router.push("/profile"); // Redirect to the Runner Profile after recording.
  };

  // Define the available activities.
  const activities: DailyActivity[] = [
    "Recovery Run",
    "Easy Run",
    "Tempo Run",
    "Interval Training",
    "Long Run",
    "Hill Repeats",
    "Strength Training",
    "Mobility Session",
    "Full Rest",
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        {/* Header Navbar */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← {t("history.back_home" as TranslationKey)}
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Daily Training</h1>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>

        {/* Coach Recommendation */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">
            Coach's Recommendation
          </h2>
          <p className="text-blue-700 font-medium">
            {coachRecommendation.message}
          </p>
          <p className="text-sm text-blue-600 mt-1">
            {coachRecommendation.reason}
          </p>
        </div>

        {/* Current Runner State */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <h3 className="text-sm font-semibold text-gray-600">Fitness</h3>
            <p className="text-lg font-bold text-gray-800">
              {runnerState.profile.currentFitness}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <h3 className="text-sm font-semibold text-gray-600">Fatigue</h3>
            <p className="text-lg font-bold text-gray-800">
              {runnerState.profile.currentFatigue}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <h3 className="text-sm font-semibold text-gray-600">Readiness</h3>
            <p className="text-lg font-bold text-gray-800">
              {runnerState.profile.currentReadiness}
            </p>
          </div>
        </div>

        {/* Activity Selection */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Choose Today's Activity
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {activities.map((activity) => {
              const isSelected = selectedActivity === activity;
              const isRecommended =
                activity === coachRecommendation.recommendation;

              return (
                <button
                  type="button"
                  key={activity}
                  onClick={() => handleSelectActivity(activity)}
                  className={`p-3 rounded-lg text-left transition-all ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 hover:bg-gray-200"
                  } ${
                    isRecommended && !isSelected
                      ? "border-2 border-blue-500"
                      : ""
                  }`}
                >
                  <h3 className="font-semibold">{activity}</h3>
                  {isRecommended && !isSelected && (
                    <p className="text-xs text-blue-600 mt-1">Recommended</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Weekly Training Balance */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            This Week's Training
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Easy Sessions</span>
              <span className="font-semibold">
                {trainingState.weeklyBalance.easySessions} / 3
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hard Sessions</span>
              <span className="font-semibold">
                {trainingState.weeklyBalance.hardSessions} / 2
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Recovery Sessions</span>
              <span className="font-semibold">
                {trainingState.weeklyBalance.recoverySessions} / 2
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Strength Sessions</span>
              <span className="font-semibold">
                {trainingState.weeklyBalance.strengthSessions} / 1
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Long Runs</span>
              <span className="font-semibold">
                {trainingState.weeklyBalance.longRuns} / 1
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Rest Days</span>
              <span className="font-semibold">
                {trainingState.weeklyBalance.restDays} / 2
              </span>
            </div>
          </div>
        </div>

        {/* Current Week's Training History */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            This Week's Activities
          </h2>
          {currentWeekTraining.length > 0 ? (
            <ul className="space-y-2">
              {currentWeekTraining.map((day) => (
                <li
                  key={day.date}
                  className="flex justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <span className="text-gray-600">
                    {new Date(day.date).toLocaleDateString()}
                  </span>
                  <span className="font-semibold">{day.activity}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No activities recorded this week.</p>
          )}
        </div>

        {/* Record Activity Button */}
        <button
          type="button"
          onClick={handleRecordActivity}
          disabled={!selectedActivity}
          className={`w-full py-3 rounded-lg font-semibold transition-all ${
            selectedActivity
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Record Activity
        </button>
      </div>
    </div>
  );
}
