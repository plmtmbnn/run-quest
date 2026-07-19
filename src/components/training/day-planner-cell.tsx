"use client";

import { motion } from "framer-motion";
import type { DailyActivity } from "@/training/training-types";
import { getActivityEnergyCost } from "@/training/plan-templates";

interface DayPlannerCellProps {
  dayIndex: number;
  dayOfWeek: string;
  plannedActivity: DailyActivity;
  actualActivity?: DailyActivity;
  isCompleted: boolean;
  isToday: boolean;
  isRest: boolean;
  energyCost: number;
  status: "planned" | "completed" | "swapped" | "missed";
  onClick: () => void;
  isExpanded: boolean;
}

export function DayPlannerCell({
  dayIndex,
  dayOfWeek,
  plannedActivity,
  actualActivity,
  isCompleted,
  isToday,
  isRest,
  energyCost,
  status,
  onClick,
  isExpanded,
}: DayPlannerCellProps) {
  // Activity metadata for display
  const activityMeta: Record<DailyActivity, { emoji: string; color: string }> = {
    "Recovery Run": { emoji: "🚶", color: "text-green-600 dark:text-green-400" },
    "Easy Run": { emoji: "🏃", color: "text-blue-600 dark:text-blue-400" },
    "Tempo Run": { emoji: "⚡", color: "text-orange-600 dark:text-orange-400" },
    "Interval Training": { emoji: "🔥", color: "text-red-600 dark:text-red-400" },
    "Long Run": { emoji: "🏃♂️", color: "text-purple-600 dark:text-purple-400" },
    "Hill Repeats": { emoji: "⛰️", color: "text-amber-600 dark:text-amber-400" },
    "Strength Training": { emoji: "💪", color: "text-cyan-600 dark:text-cyan-400" },
    "Mobility Session": { emoji: "🧘", color: "text-emerald-600 dark:text-emerald-400" },
    "Full Rest": { emoji: "😴", color: "text-slate-600 dark:text-slate-400" },
  };

  const meta = activityMeta[plannedActivity] || { emoji: "❓", color: "text-slate-400" };
  const displayActivity = actualActivity || plannedActivity;
  const displayMeta = activityMeta[displayActivity] || meta;

  // Status styling
  const getStatusStyles = () => {
    switch (status) {
      case "completed":
        return "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-700/30";
      case "swapped":
        return "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-700/30";
      case "missed":
        return "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-700/30 opacity-60";
      case "planned":
        return "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700";
    }
  };

  // Today styling
  const todayStyles = isToday
    ? "ring-2 ring-indigo-500 dark:ring-indigo-400 shadow-md shadow-indigo-500/10"
    : "hover:border-slate-300 dark:hover:border-slate-600";

  // Rest day styling
  const restStyles = isRest
    ? "border-dashed border-slate-300 dark:border-slate-600"
    : "border-solid";

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`flex flex-col gap-1 cursor-pointer ${isExpanded ? 'md:col-span-1' : ''}`}
    >
      <div
        onClick={onClick}
        className={`
          p-3 md:p-4 rounded-xl border-2 transition-all duration-200
          ${getStatusStyles()}
          ${todayStyles}
          ${restStyles}
          ${status === "missed" ? "cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {dayOfWeek}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              Day {dayIndex}
            </span>
          </div>
          {isToday && (
            <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Today
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
            <span className={`text-lg ${displayMeta.color}`}>{displayMeta.emoji}</span>
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-bold text-sm text-slate-800 dark:text-white truncate">
              {displayActivity}
            </span>
            {status === "swapped" && actualActivity && (
              <span className="text-xs text-slate-500 dark:text-slate-400 line-through ml-1">
                {plannedActivity}
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 flex justify-between items-center text-xs">
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">⚡</span>
            <span className="font-bold text-slate-600 dark:text-slate-300">
              {energyCost} EP
            </span>
          </div>
          {isCompleted && status !== "missed" && (
            <span className="text-green-500 font-bold">✓ Completed</span>
          )}
          {status === "missed" && (
            <span className="text-red-500 font-bold">✗ Missed</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}