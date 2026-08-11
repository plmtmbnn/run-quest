"use client";

import { motion } from "framer-motion";
import { Clock, Target, TrendingDown, TrendingUp } from "lucide-react";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";

interface PaceProjectorProps {
  currentPace: number; // seconds per km
  distanceCovered: number; // current km
  totalDistance: number; // race distance in km
  accumulatedTime: number; // seconds elapsed
  personalBest?: number; // PB in seconds for this distance
  isPaused: boolean;
  simSpeed: 1 | 2 | 5;
}

export function PaceProjector({
  currentPace,
  distanceCovered,
  totalDistance,
  accumulatedTime,
  personalBest,
  isPaused,
  simSpeed,
}: PaceProjectorProps) {
  const { t } = useTranslation();

  // Don't show until we have at least 1km of data
  if (distanceCovered <= 0 || accumulatedTime <= 0) return null;

  // Calculate projected finish time
  const avgPace = accumulatedTime / distanceCovered;
  const predictedFinish = avgPace * totalDistance;

  // Delta to personal best
  const deltaToPB = personalBest ? predictedFinish - personalBest : null;

  // Pace needed from here to beat PB
  const remainingDistance = totalDistance - distanceCovered;
  const paceNeededToBeatPB =
    personalBest && remainingDistance > 0
      ? (personalBest - accumulatedTime) / remainingDistance
      : null;

  // Coach tip based on race context
  const getCoachTip = (): string => {
    const progress = distanceCovered / totalDistance;
    if (deltaToPB !== null && deltaToPB > 30)
      return t(
        "challenge.race.pace_projector.coach_tip_slow" as TranslationKey,
      );
    if (deltaToPB !== null && deltaToPB < -10)
      return t(
        "challenge.race.pace_projector.coach_tip_start" as TranslationKey,
      );
    if (progress > 0.8)
      return t("challenge.race.pace_projector.coach_tip_end" as TranslationKey);
    if (progress > 0.4)
      return t("challenge.race.pace_projector.coach_tip_mid" as TranslationKey);
    return t("challenge.race.pace_projector.coach_tip_start" as TranslationKey);
  };

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatPace = (seconds: number): string => {
    if (!seconds || seconds <= 0) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isAhead = deltaToPB !== null && deltaToPB < 0;
  const isClose = deltaToPB !== null && Math.abs(deltaToPB) < 15;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full bg-gradient-to-r from-slate-50 to-orange-50/30 dark:from-gray-900 dark:to-orange-950/10 border border-slate-200 dark:border-gray-800 rounded-[1.5rem] p-3 md:p-4"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {/* Predicted Finish */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-slate-400 dark:text-gray-500 font-bold flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {t("challenge.race.pace_projector.predicted" as TranslationKey)}
          </span>
          <motion.span
            key={predictedFinish.toFixed(0)}
            initial={{ scale: 1.1, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-sm md:text-base font-black font-mono text-slate-800 dark:text-white"
          >
            {formatTime(predictedFinish)}
          </motion.span>
        </div>

        {/* Delta to PB */}
        {deltaToPB !== null && (
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-slate-400 dark:text-gray-500 font-bold flex items-center gap-1">
              {isAhead ? (
                <TrendingUp className="w-3 h-3 text-emerald-500" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500" />
              )}
              {isAhead
                ? t("challenge.race.pace_projector.ahead_pb" as TranslationKey)
                : t(
                    "challenge.race.pace_projector.behind_pb" as TranslationKey,
                  )}
            </span>
            <motion.span
              key={deltaToPB.toFixed(1)}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className={`text-sm md:text-base font-black font-mono ${
                isAhead
                  ? "text-emerald-600 dark:text-emerald-400"
                  : isClose
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-red-600 dark:text-red-400"
              }`}
            >
              {isAhead ? "-" : "+"}
              {Math.abs(deltaToPB).toFixed(1)}s
            </motion.span>
          </div>
        )}

        {/* Pace Needed to Beat PB */}
        {paceNeededToBeatPB !== null && paceNeededToBeatPB > 0 && (
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-slate-400 dark:text-gray-500 font-bold flex items-center gap-1">
              <Target className="w-3 h-3" />
              {t("challenge.race.pace_projector.pace_needed" as TranslationKey)}
            </span>
            <span
              className={`text-sm md:text-base font-black font-mono ${
                currentPace <= paceNeededToBeatPB + 2
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatPace(paceNeededToBeatPB)}
              <span className="text-[9px] text-slate-400 dark:text-gray-500 ml-1">
                /km
              </span>
            </span>
          </div>
        )}

        {/* Coach Tip */}
        <div className="flex flex-col gap-0.5 col-span-2 md:col-span-1">
          <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-slate-400 dark:text-gray-500 font-bold">
            💬 Coach
          </span>
          <motion.span
            key={distanceCovered}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[11px] md:text-xs font-semibold text-slate-600 dark:text-gray-300 italic leading-tight"
          >
            &ldquo;{getCoachTip()}&rdquo;
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
}
