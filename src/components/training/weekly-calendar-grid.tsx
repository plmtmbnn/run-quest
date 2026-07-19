"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { WeeklyPlan, PlannedActivity, DailyActivity } from "@/training/training-types";
import { getActivityEnergyCost } from "@/training/plan-templates";
import { DayPlannerCell } from "./day-planner-cell";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";

interface WeeklyCalendarGridProps {
  plan: WeeklyPlan;
  currentDayIndex: number;
  onDayClick: (dayIndex: number) => void;
  onActivityComplete: (dayIndex: number, activity: DailyActivity) => void;
  /** When set, this day is expanded on mount and scrolled into view (used by "Create Custom Plan"). */
  autoExpandDayIndex?: number;
}

export function WeeklyCalendarGrid({
  plan,
  currentDayIndex,
  onDayClick,
  onActivityComplete,
  autoExpandDayIndex,
}: WeeklyCalendarGridProps) {
  const { t } = useTranslation();
  const [pickerDay, setPickerDay] = useState<PlannedActivity | null>(
    autoExpandDayIndex !== undefined
      ? plan.plannedActivities.find((pa) => pa.dayIndex === autoExpandDayIndex) ??
          null
      : null,
  );
  const gridRef = useRef<HTMLDivElement>(null);

  // Scroll the auto-expanded day into view when requested
  useEffect(() => {
    if (autoExpandDayIndex === undefined) return;
    const id = window.setTimeout(() => {
      gridRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 50);
    return () => window.clearTimeout(id);
  }, [autoExpandDayIndex]);

  // Get today's activity
  const todaysActivity = plan.plannedActivities.find(
    (pa) => pa.dayIndex === currentDayIndex
  );

  // Day names for display (localized)
  const dayNames = [
    t("training.days.mon" as TranslationKey),
    t("training.days.tue" as TranslationKey),
    t("training.days.wed" as TranslationKey),
    t("training.days.thu" as TranslationKey),
    t("training.days.fri" as TranslationKey),
    t("training.days.sat" as TranslationKey),
    t("training.days.sun" as TranslationKey),
  ];

  // Translate a DailyActivity enum value into its display label
  const tActivity = (activity: DailyActivity): string => {
    const keyMap: Record<DailyActivity, TranslationKey> = {
      "Recovery Run": "training.activities.recovery_run",
      "Easy Run": "training.activities.easy_run",
      "Tempo Run": "training.activities.tempo_run",
      "Interval Training": "training.activities.interval_training",
      "Long Run": "training.activities.long_run",
      "Hill Repeats": "training.activities.hill_repeats",
      "Strength Training": "training.activities.strength_training",
      "Mobility Session": "training.activities.mobility_session",
      "Full Rest": "training.activities.full_rest",
    };
    return t(keyMap[activity]);
  };

  // Emoji per activity (mirrors DayPlannerCell metadata)
  const activityEmoji: Record<DailyActivity, string> = {
    "Recovery Run": "🚶",
    "Easy Run": "🏃",
    "Tempo Run": "⚡",
    "Interval Training": "🔥",
    "Long Run": "🏃♂️",
    "Hill Repeats": "⛰️",
    "Strength Training": "💪",
    "Mobility Session": "🧘",
    "Full Rest": "😴",
  };
  const getActivityEmoji = (activity: DailyActivity): string =>
    activityEmoji[activity] || "❓";

  // Get status for each day
  const getDayStatus = (activity: PlannedActivity) => {
    if (activity.isCompleted) {
      return activity.reason === "swapped" ? "swapped" : "completed";
    }
    if (activity.dayIndex < currentDayIndex) {
      return "missed";
    }
    return "planned";
  };

  // Handle day click
  const handleDayClick = (dayIndex: number) => {
    if (dayIndex < currentDayIndex) {
      // Can't modify past days
      return;
    }
    const day = plan.plannedActivities.find((pa) => pa.dayIndex === dayIndex);
    if (day) setPickerDay(day);
    onDayClick(dayIndex);
  };

  // Handle activity completion (from modal)
  const handleCompleteActivity = (
    dayIndex: number,
    activity: DailyActivity
  ) => {
    onActivityComplete(dayIndex, activity);
    setPickerDay(null);
  };

  return (
    <div ref={gridRef} className="w-full overflow-x-auto">
      {/* Desktop Grid */}
      <div
        role="list"
        aria-label={t("training.weekly_planner" as TranslationKey)}
        className="hidden md:grid grid-cols-7 gap-2 md:gap-3 min-w-[600px]"
      >
        {plan.plannedActivities.map((activity, index) => {
          const dayStatus = getDayStatus(activity);
          const isToday = activity.dayIndex === currentDayIndex;
          const isPast = activity.dayIndex < currentDayIndex;

          return (
            <motion.div
              key={activity.dayIndex}
              role="listitem"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex flex-col gap-2"
            >
              <DayPlannerCell
                dayIndex={activity.dayIndex}
                dayOfWeek={dayNames[index]}
                plannedActivity={activity.activity}
                actualActivity={activity.actualActivity}
                isCompleted={activity.isCompleted}
                isToday={isToday}
                isRest={activity.activity === "Full Rest"}
                energyCost={activity.energyCost}
                status={dayStatus}
                onClick={() => handleDayClick(activity.dayIndex)}
                isExpanded={pickerDay?.dayIndex === activity.dayIndex}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Mobile List (stacked) */}
      <div
        role="list"
        aria-label={t("training.weekly_planner" as TranslationKey)}
        className="md:hidden flex flex-col gap-3"
      >
        {plan.plannedActivities.map((activity, index) => {
          const dayStatus = getDayStatus(activity);
          const isToday = activity.dayIndex === currentDayIndex;
          const isPast = activity.dayIndex < currentDayIndex;

          return (
            <motion.div
              key={activity.dayIndex}
              role="listitem"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex flex-col gap-2"
            >
              <DayPlannerCell
                dayIndex={activity.dayIndex}
                dayOfWeek={dayNames[index]}
                plannedActivity={activity.activity}
                actualActivity={activity.actualActivity}
                isCompleted={activity.isCompleted}
                isToday={isToday}
                isRest={activity.activity === "Full Rest"}
                energyCost={activity.energyCost}
                status={dayStatus}
                onClick={() => handleDayClick(activity.dayIndex)}
                isExpanded={pickerDay?.dayIndex === activity.dayIndex}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Activity Picker Modal (mobile-first bottom sheet / responsive dialog) */}
      <AnimatePresence>
        {pickerDay && (
          <ActivityPickerModal
            day={pickerDay}
            dayLabel={
              dayNames[
                plan.plannedActivities.findIndex(
                  (pa) => pa.dayIndex === pickerDay.dayIndex,
                )
              ]
            }
            currentDayIndex={currentDayIndex}
            t={t}
            tActivity={tActivity}
            getActivityEmoji={getActivityEmoji}
            onSelect={(activity) =>
              handleCompleteActivity(pickerDay.dayIndex, activity)
            }
            onClose={() => setPickerDay(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Responsive activity picker: bottom sheet on mobile (< sm), centered dialog on sm+.
 */
function ActivityPickerModal({
  day,
  dayLabel,
  currentDayIndex,
  t,
  tActivity,
  getActivityEmoji,
  onSelect,
  onClose,
}: {
  day: PlannedActivity;
  dayLabel: string;
  currentDayIndex: number;
  t: (key: TranslationKey) => string;
  tActivity: (activity: DailyActivity) => string;
  getActivityEmoji: (activity: DailyActivity) => string;
  onSelect: (activity: DailyActivity) => void;
  onClose: () => void;
}) {
  const isPast = day.dayIndex < currentDayIndex;
  const options = getActivityOptions(day.activity);

  // Scroll lock + Escape to close
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (isPast) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center">
      {/* Tap-away backdrop */}
      <button
        type="button"
        aria-label={t("training.choose_activity" as TranslationKey)}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm sm:bg-black/60"
      />

      {/* Panel: bottom sheet on mobile, dialog on sm+ */}
      <motion.div
        initial={{ y: "100%", opacity: 0.6 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0.6 }}
        transition={{ type: "spring", stiffness: 350, damping: 35 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="activity-picker-title"
        className="relative w-full sm:max-w-md bg-white dark:bg-slate-900 border-t border-[#E5E7EB] dark:border-slate-800 sm:border sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl shadow-black/30 max-h-[80vh] flex flex-col"
      >
        {/* Grab handle (mobile affordance) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <span className="h-1.5 w-10 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-4 sm:pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col">
            <h3
              id="activity-picker-title"
              className="font-heading font-black text-lg text-slate-800 dark:text-white"
            >
              {t("training.choose_activity" as TranslationKey)}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {dayLabel} · Day {day.dayIndex}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
          >
            <span className="text-lg leading-none" aria-hidden="true">
              ×
            </span>
          </button>
        </div>

        {/* Options */}
        <div className="px-5 py-4 overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex flex-col gap-2.5">
            {options.map((option) => {
              const energy = getActivityEnergyCost(option);
              const isCurrent = option === day.activity;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onSelect(option)}
                  className={`w-full min-h-[52px] flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all text-left focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none
                    ${
                      isCurrent
                        ? "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-500 dark:border-indigo-400"
                        : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.99]"
                    }`}
                >
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0 text-xl">
                    {getActivityEmoji(option)}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-bold text-sm text-slate-800 dark:text-white truncate">
                      {tActivity(option)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span aria-hidden="true">⚡</span>
                      {energy} EP
                    </span>
                  </span>
                  {isCurrent && (
                    <span className="text-indigo-500 dark:text-indigo-400 text-sm shrink-0 font-black">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Get activity options for completion (similar activities)
 */
function getActivityOptions(currentActivity: DailyActivity): DailyActivity[] {
  // For rest days, only show rest and light activities
  if (currentActivity === "Full Rest") {
    return ["Full Rest", "Mobility Session", "Recovery Run"];
  }

  // For easy runs, show similar intensity options (unique)
  if (currentActivity === "Easy Run" || currentActivity === "Recovery Run") {
    const base: DailyActivity[] = ["Recovery Run", "Easy Run", "Mobility Session", "Strength Training"];
    return Array.from(new Set([currentActivity, ...base]));
  }

  // For hard activities, show similar intensity options (unique)
  if (
    currentActivity === "Tempo Run" ||
    currentActivity === "Interval Training" ||
    currentActivity === "Long Run" ||
    currentActivity === "Hill Repeats"
  ) {
    const base: DailyActivity[] = ["Tempo Run", "Interval Training", "Easy Run", "Strength Training"];
    return Array.from(new Set([currentActivity, ...base]));
  }

  // For strength/mobility, show similar options (unique)
  const base: DailyActivity[] = ["Strength Training", "Mobility Session", "Recovery Run", "Easy Run"];
  return Array.from(new Set([currentActivity, ...base]));
}