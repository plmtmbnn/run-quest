"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw, Check, AlertTriangle } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import type { DailyActivity, WeeklyPlan, PlannedActivity } from "@/training/training-types";
import { getActivityEnergyCost, isHardActivity } from "@/training/plan-templates";
import { getWeekStartDay } from "@/training/weekly-plan-engine";
import { useTranslation, type TranslationKey } from "@/i18n/use-translation";
import type { RunnerState } from "@/runner/runner-types";
import { v4 as uuidv4 } from "uuid";

const ALL_ACTIVITIES: DailyActivity[] = [
  "Easy Run",
  "Tempo Run",
  "Interval Training",
  "Long Run",
  "Hill Repeats",
  "Recovery Run",
  "Strength Training",
  "Mobility Session",
  "Full Rest",
];

const ESTIMATED_KM: Record<DailyActivity, number> = {
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

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface CustomPlanBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  currentDayIndex: number;
  runnerState: RunnerState;
  onApplyPlan: (plan: WeeklyPlan) => void;
}

export function CustomPlanBuilder({
  isOpen,
  onClose,
  currentDayIndex,
  runnerState,
  onApplyPlan,
}: CustomPlanBuilderProps) {
  const { t } = useTranslation();
  const weekStartDay = getWeekStartDay(currentDayIndex);

  // Initial 7-day activities state
  const [activities, setActivities] = useState<DailyActivity[]>([
    "Easy Run",
    "Full Rest",
    "Easy Run",
    "Full Rest",
    "Tempo Run",
    "Long Run",
    "Full Rest",
  ]);

  const handleActivityChange = useCallback((index: number, activity: DailyActivity) => {
    setActivities((prev) => {
      const updated = [...prev];
      updated[index] = activity;
      return updated;
    });
  }, []);

  const handleReset = useCallback(() => {
    setActivities([
      "Easy Run",
      "Full Rest",
      "Easy Run",
      "Full Rest",
      "Tempo Run",
      "Long Run",
      "Full Rest",
    ]);
  }, []);

  // Compute stats
  const totalVolume = useMemo(() => {
    return activities.reduce((sum, act) => sum + (ESTIMATED_KM[act] || 0), 0);
  }, [activities]);

  const totalEp = useMemo(() => {
    return activities.reduce((sum, act) => sum + getActivityEnergyCost(act), 0);
  }, [activities]);

  const hardDaysCount = useMemo(() => {
    return activities.filter(isHardActivity).length;
  }, [activities]);

  const restDaysCount = useMemo(() => {
    return activities.filter((act) => act === "Full Rest").length;
  }, [activities]);

  // Validation checks
  const warnings = useMemo(() => {
    const list: string[] = [];

    if (hardDaysCount > 2) {
      list.push("Too many quality sessions (>2 hard days increases injury risk)");
    }
    if (restDaysCount === 0) {
      list.push("No rest days scheduled (Rest is required for muscle adaptation)");
    }

    // Check adjacent hard days
    const hardIndices = activities
      .map((act, i) => (isHardActivity(act) ? i : -1))
      .filter((i) => i !== -1);

    for (let i = 0; i < hardIndices.length - 1; i++) {
      if (hardIndices[i + 1] - hardIndices[i] === 1) {
        list.push("Back-to-back quality sessions detected (Space hard days by 48 hours)");
        break;
      }
    }

    return list;
  }, [activities, hardDaysCount, restDaysCount]);

  const handleApply = useCallback(() => {
    const plannedActivities: PlannedActivity[] = activities.map((activity, index) => ({
      dayIndex: weekStartDay + index,
      dayOfWeek: index as 0 | 1 | 2 | 3 | 4 | 5 | 6,
      activity,
      isCompleted: false,
      energyCost: getActivityEnergyCost(activity),
    }));

    const customPlan: WeeklyPlan = {
      id: uuidv4(),
      weekStartDay,
      weekEndDay: weekStartDay + 6,
      plannedActivities,
      templateUsed: "custom",
      createdAt: Date.now(),
      adherenceRate: 0,
      coachFeedback: warnings.map((msg) => ({ key: msg })),
      isActive: true,
    };

    onApplyPlan(customPlan);
    onClose();
  }, [activities, weekStartDay, warnings, onApplyPlan, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="font-heading text-lg md:text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                <span>🛠️</span> {t("training.create_custom_plan" as TranslationKey)}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Customize your weekly activities day by day
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Day Selection Rows */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {activities.map((activity, idx) => {
              const dayNum = weekStartDay + idx;
              const isPast = dayNum < currentDayIndex;
              const isToday = dayNum === currentDayIndex;
              const isHard = isHardActivity(activity);
              const cost = getActivityEnergyCost(activity);

              return (
                <div
                  key={idx}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all ${
                    isToday
                      ? "border-indigo-500/50 bg-indigo-500/5 dark:bg-indigo-500/10 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-[120px]">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                        isToday
                          ? "bg-indigo-500 text-white"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {DAY_LABELS[idx]}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-white block">
                        Day {dayNum} {isToday ? "(Today)" : ""}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ~{ESTIMATED_KM[activity]} km
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-1">
                    <select
                      value={activity}
                      disabled={isPast}
                      onChange={(e) => handleActivityChange(idx, e.target.value as DailyActivity)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-xs md:text-sm font-semibold rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-50"
                    >
                      {ALL_ACTIVITIES.map((act) => (
                        <option key={act} value={act}>
                          {t(`training.activities.${act.toLowerCase().replace(/ /g, "_")}` as TranslationKey) || act}
                        </option>
                      ))}
                    </select>

                    <div
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold shrink-0 flex items-center gap-1 ${
                        cost === 0
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : isHard
                          ? "bg-red-500/10 text-red-600 dark:text-red-400"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      <span>⚡</span>
                      <span>{cost} EP</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Warnings display */}
            {warnings.length > 0 && (
              <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Coach Guidance Warnings:</span>
                </div>
                <ul className="list-disc list-inside text-xs space-y-1 pl-1 opacity-90">
                  {warnings.map((warn, i) => (
                    <li key={i}>{warn}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Summary Banner */}
          <div className="p-4 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 grid grid-cols-4 gap-2 text-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
                Est. Distance
              </span>
              <span className="text-sm md:text-base font-black text-slate-800 dark:text-white font-mono">
                {totalVolume} km
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
                Total EP Cost
              </span>
              <span className="text-sm md:text-base font-black text-amber-500 font-mono">
                {totalEp} EP
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
                Hard Days
              </span>
              <span
                className={`text-sm md:text-base font-black font-mono ${
                  hardDaysCount > 2 ? "text-red-500" : "text-slate-800 dark:text-white"
                }`}
              >
                {hardDaysCount} / 2
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
                Rest Days
              </span>
              <span
                className={`text-sm md:text-base font-black font-mono ${
                  restDaysCount === 0 ? "text-red-500" : "text-slate-800 dark:text-white"
                }`}
              >
                {restDaysCount}
              </span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-white dark:bg-slate-900">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={handleApply}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs md:text-sm font-bold shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Apply Custom Plan</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
