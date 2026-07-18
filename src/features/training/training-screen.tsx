"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Zap, TrendingUp, Heart, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";
import { useRunnerStore } from "@/runner/runner-store";
import { useTimelineStore } from "@/store/timeline-store";
import { processAdaptationQueue } from "@/training/adaptation-engine";
import { generateCoachRecommendation } from "@/training/coach-recommendation";
import {
  getCurrentWeekTrainingHistory,
  recordTrainingActivity,
} from "@/training/training-engine";
import { useTrainingStore } from "@/training/training-store";
import type { DailyActivity } from "@/training/training-types";

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
  const energy = useTimelineStore((s) => s.gameState?.energy ?? 0);
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

    // Deduct EP via train action in timeline
    useTimelineStore.getState().doAction("train");

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
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white flex flex-col pb-16"
    >
      {/* Sticky Header - matching profile-screen.tsx style */}
      <header className="sticky top-0 z-10 border-b border-[#E5E7EB] dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between w-full">
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
                Daily Training
              </h1>
              <p className="text-xs text-slate-400">
                Choose your workout and build your runner
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
      <main className="mx-auto w-full max-w-3xl px-6 py-6 flex-1 flex flex-col gap-6">

        {/* Coach Recommendation - matching profile-screen.tsx card style */}
        <div className="bg-gradient-to-br from-blue-900/80 to-indigo-950 rounded-[2rem] p-6 text-white shadow-xl shadow-blue-950/30 border border-blue-800/30 flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center gap-2">
            <span className="text-2xl">👨‍🏫</span>
            <div>
              <h2 className="font-heading text-lg font-bold text-white">
                Coach's Recommendation
              </h2>
              <p className="text-xs text-blue-300 mt-0.5">
                Based on your current training state
              </p>
            </div>
          </div>
          <div className="bg-black/20 rounded-xl p-4 border border-white/5">
            <p className="text-blue-200 font-medium text-sm md:text-base">
              {coachRecommendation.message}
            </p>
            <p className="text-blue-400 text-xs md:text-sm mt-2 opacity-80">
              {coachRecommendation.reason}
            </p>
          </div>
        </div>

        {/* Current Runner State - Revamped to match profile-screen.tsx */}
        <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-6 shadow-sm flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500"></div>
          <div className="flex justify-between items-center mb-1">
            <h2 className="font-heading text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
              <span>📊</span> Current State
            </h2>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl text-center border border-slate-100 dark:border-slate-800 shadow-sm transition-transform hover:scale-[1.02]">
              <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">💪 Fitness</h3>
              <p className="text-3xl font-black font-heading text-green-600 dark:text-green-400">
                {runnerState.profile.currentFitness}
              </p>
              <p className="text-[9px] font-medium text-slate-400 mt-1 uppercase tracking-wider">Training level</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl text-center border border-slate-100 dark:border-slate-800 shadow-sm transition-transform hover:scale-[1.02]">
              <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">😓 Fatigue</h3>
              <p className="text-3xl font-black font-heading text-orange-600 dark:text-orange-400">
                {runnerState.profile.currentFatigue}
              </p>
              <p className="text-[9px] font-medium text-slate-400 mt-1 uppercase tracking-wider">Recovery needed</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl text-center border border-slate-100 dark:border-slate-800 shadow-sm transition-transform hover:scale-[1.02]">
              <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">⚡ Readiness</h3>
              <p className="text-3xl font-black font-heading text-blue-600 dark:text-blue-400">
                {runnerState.profile.currentReadiness}
              </p>
              <p className="text-[9px] font-medium text-slate-400 mt-1 uppercase tracking-wider">Ready to train</p>
            </div>
          </div>
        </div>

        {/* Energy indicator - matching profile-screen.tsx style */}
        <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-2xl border border-orange-100 dark:border-orange-900/30 text-orange-500">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-heading font-black text-slate-800 dark:text-white text-base">
                  Energy Points
                </h3>
                <p className="text-[11px] font-bold text-slate-400 mt-0.5 tracking-wider uppercase">
                  Required: 30 EP to train
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-3xl font-black text-orange-500 dark:text-orange-400 font-heading">
                {energy}
              </span>
              <span className={`text-[10px] font-bold mt-1 tracking-wider uppercase ${energy >= 30 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                {energy >= 30 ? '✓ Sufficient' : '✗ Need more'}
              </span>
            </div>
          </div>
          <div className="mt-5 w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-400 to-amber-500 h-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(100, (energy / 100) * 100)}%` }}
            />
          </div>
        </div>

        {/* Activity Selection - Revamped to match profile-screen.tsx */}
        <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-6 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center mb-1 border-b border-[#E5E7EB] dark:border-slate-800 pb-3">
            <h2 className="font-heading text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
              <span>🏃‍♂️</span> Choose Today's Activity
            </h2>
          </div>
          
          <div className="grid gap-3 sm:grid-cols-2">
            {activities.map((activity) => {
              const isSelected = selectedActivity === activity;
              const isRecommended =
                activity === coachRecommendation.recommendation;

              // Activity metadata for enhanced display
              const activityMeta: Record<string, {emoji: string, desc: string, color: string}> = {
                "Recovery Run": { emoji: "🚶", desc: "Light, easy-paced run for active recovery", color: "text-green-600 dark:text-green-400" },
                "Easy Run": { emoji: "🏃", desc: "Comfortable pace, conversational effort", color: "text-blue-600 dark:text-blue-400" },
                "Tempo Run": { emoji: "⚡", desc: "Sustained hard effort, race pace training", color: "text-orange-600 dark:text-orange-400" },
                "Interval Training": { emoji: "🔥", desc: "High intensity bursts with recovery", color: "text-red-600 dark:text-red-400" },
                "Long Run": { emoji: "🏃‍♂️", desc: "Extended distance at comfortable pace", color: "text-purple-600 dark:text-purple-400" },
                "Hill Repeats": { emoji: "⛰️", desc: "Uphill sprints for power and strength", color: "text-amber-600 dark:text-amber-400" },
                "Strength Training": { emoji: "💪", desc: "Resistance work for injury prevention", color: "text-cyan-600 dark:text-cyan-400" },
                "Mobility Session": { emoji: "🧘", desc: "Flexibility and range of motion work", color: "text-emerald-600 dark:text-emerald-400" },
                "Full Rest": { emoji: "😴", desc: "Complete rest for full recovery", color: "text-slate-600 dark:text-slate-400" },
              };
              
              const meta = activityMeta[activity] || { emoji: "❓", desc: "Training activity", color: "text-slate-400" };

              return (
                <button
                  key={activity}
                  type="button"
                  onClick={() => handleSelectActivity(activity)}
                  className={`
                    border-2 rounded-2xl p-4 transition-all duration-300 shadow-sm flex flex-col gap-3 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none
                    ${isSelected 
                      ? "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-500 dark:border-indigo-400 ring-4 ring-indigo-500/10 scale-[1.02]" 
                      : isRecommended 
                        ? "bg-blue-50/50 dark:bg-slate-800/40 border-blue-200 dark:border-blue-500/30 hover:bg-blue-50 dark:hover:bg-slate-800/70 hover:scale-[1.01]" 
                        : "bg-slate-50/50 dark:bg-slate-900/40 border-[#E5E7EB] dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:scale-[1.01]"
                    }
                    ${isSelected ? "" : "hover:border-slate-300 dark:hover:border-slate-600/70"}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-white dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm shrink-0">
                      <span className={`text-2xl ${meta.color}`}>{meta.emoji}</span>
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold font-heading text-slate-800 dark:text-white text-sm">{activity}</h3>
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 hidden sm:block">{meta.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end h-6 mt-1">
                    {isRecommended && !isSelected && (
                      <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-blue-200 dark:border-blue-800">
                        Coach's Pick
                      </span>
                    )}
                    {isSelected && (
                      <span className="text-[10px] bg-indigo-500 text-white px-2.5 py-1 rounded-full font-bold uppercase tracking-wider shadow-md shadow-indigo-500/20">
                        Selected ✓
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Weekly Training Balance - Revamped to match profile-screen.tsx */}
        <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-6 shadow-sm flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-indigo-500 to-transparent"></div>
          <div className="flex justify-between items-center mb-1">
            <h2 className="font-heading text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
              <span>📅</span> This Week's Training
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "Easy Sessions", value: trainingState.weeklyBalance.easySessions, max: 3, color: "text-green-600 dark:text-green-400", bar: "bg-green-500", icon: "🏃" },
              { label: "Hard Sessions", value: trainingState.weeklyBalance.hardSessions, max: 2, color: "text-orange-600 dark:text-orange-400", bar: "bg-orange-500", icon: "⚡" },
              { label: "Recovery Sessions", value: trainingState.weeklyBalance.recoverySessions, max: 2, color: "text-blue-600 dark:text-blue-400", bar: "bg-blue-500", icon: "🧘" },
              { label: "Strength Sessions", value: trainingState.weeklyBalance.strengthSessions, max: 1, color: "text-cyan-600 dark:text-cyan-400", bar: "bg-cyan-500", icon: "💪" },
              { label: "Long Runs", value: trainingState.weeklyBalance.longRuns, max: 1, color: "text-purple-600 dark:text-purple-400", bar: "bg-purple-500", icon: "🏃‍♂️" },
              { label: "Rest Days", value: trainingState.weeklyBalance.restDays, max: 2, color: "text-slate-600 dark:text-slate-400", bar: "bg-slate-500", icon: "😴" },
            ].map((item, index) => (
              <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-transform hover:scale-[1.02] flex flex-col items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm mb-2">
                  <span className="text-xl">{item.icon}</span>
                </div>
                <h3 className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 text-center">{item.label}</h3>
                <p className={`text-2xl font-black font-heading ${item.color}`}>
                  {item.value} <span className="text-sm text-slate-400 font-bold">/ {item.max}</span>
                </p>
                <div className="mt-3 w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`${item.bar} h-full transition-all duration-1000 ease-out`}
                    style={{ width: `${(item.value / item.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Week's Training History - Revamped to match profile-screen.tsx */}
        <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-6 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center mb-1 border-b border-[#E5E7EB] dark:border-slate-800 pb-3">
            <h2 className="font-heading text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
              <span>📋</span> This Week's Activities
            </h2>
          </div>
          
          {currentWeekTraining.length > 0 ? (
            <div className="space-y-3">
              {currentWeekTraining.map((day, index) => (
                <div
                  key={day.date}
                  className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-transform hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-700 shadow-sm">
                      <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        D{day.date}
                      </span>
                    </div>
                    <span className="font-black font-heading text-slate-800 dark:text-white">{day.activity}</span>
                  </div>
                  <span className="text-xl text-green-500">✓</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800/30">
              <span className="text-4xl mb-3 block opacity-80">📅</span>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">No activities recorded this week.</p>
              <p className="text-slate-400 dark:text-slate-500 text-xs mt-1 font-medium">Start training to see your progress!</p>
            </div>
          )}
        </div>

        {/* Record Activity Button - Revamped to match profile-screen.tsx */}
        {(() => {
          const hasEnoughEnergy = energy >= 30;
          const canRecord = selectedActivity && hasEnoughEnergy;
          const buttonText = !hasEnoughEnergy
            ? "Need 30 EP to Train"
            : "Record Activity";
          
          return (
            <button
              type="button"
              onClick={handleRecordActivity}
              disabled={!canRecord}
              className={`w-full py-4 rounded-[1.25rem] font-bold text-lg transition-all shadow-md focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                canRecord
                  ? "bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/20 active:scale-[0.98]"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed border border-[#E5E7EB] dark:border-slate-700"
              }`}
            >
              {buttonText}
            </button>
          );
        })()}
      </main>
    </motion.div>
  );
}
