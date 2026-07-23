"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, TrendingUp, Heart, ShieldCheck, Zap, Sparkles, Clock, ArrowRight } from "lucide-react";
import type { DailyActivity } from "@/training/training-types";
import { ACTIVITY_EFFECTS } from "@/training/training-effects";

export interface WorkoutStatDiff {
  fitnessBefore: number;
  fitnessAfter: number;
  fatigueBefore: number;
  fatigueAfter: number;
  readinessBefore: number;
  readinessAfter: number;
  epUsed: number;
  xpGained: number;
}

interface TrainingResultsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  activity: DailyActivity;
  statsDiff: WorkoutStatDiff;
}

export function TrainingResultsOverlay({
  isOpen,
  onClose,
  activity,
  statsDiff,
}: TrainingResultsOverlayProps) {
  if (!isOpen) return null;

  const effect = ACTIVITY_EFFECTS[activity];
  const fitnessDelta = Number((statsDiff.fitnessAfter - statsDiff.fitnessBefore).toFixed(1));
  const fatigueDelta = Number((statsDiff.fatigueAfter - statsDiff.fatigueBefore).toFixed(1));
  const readinessDelta = Number((statsDiff.readinessAfter - statsDiff.readinessBefore).toFixed(1));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-5 text-center relative overflow-hidden"
        >
          {/* Top Decorative Banner */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />

          {/* Header */}
          <div className="flex flex-col items-center gap-2 pt-2">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="font-heading text-2xl font-black text-slate-800 dark:text-white">
              Workout Complete!
            </h2>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
              <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-700 dark:text-slate-300">
                {activity}
              </span>
              <span className="text-amber-500 font-mono font-black flex items-center gap-0.5">
                ⚡ -{statsDiff.epUsed} EP
              </span>
            </div>
          </div>

          {/* Stat Changes Cards */}
          <div className="grid grid-cols-3 gap-3">
            {/* Fitness */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl p-3 flex flex-col items-center">
              <TrendingUp className="w-4 h-4 text-emerald-500 mb-1" />
              <span className="text-[10px] font-bold uppercase text-slate-400">Fitness</span>
              <span className="text-sm font-black font-mono text-slate-800 dark:text-white mt-0.5">
                {Math.round(statsDiff.fitnessBefore)} → {Math.round(statsDiff.fitnessAfter)}
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald-500 mt-0.5">
                +{fitnessDelta}
              </span>
            </div>

            {/* Fatigue */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl p-3 flex flex-col items-center">
              <Heart className="w-4 h-4 text-orange-500 mb-1" />
              <span className="text-[10px] font-bold uppercase text-slate-400">Fatigue</span>
              <span className="text-sm font-black font-mono text-slate-800 dark:text-white mt-0.5">
                {Math.round(statsDiff.fatigueBefore)} → {Math.round(statsDiff.fatigueAfter)}
              </span>
              <span
                className={`text-[11px] font-mono font-bold mt-0.5 ${
                  fatigueDelta > 0 ? "text-orange-500" : "text-emerald-500"
                }`}
              >
                {fatigueDelta > 0 ? `+${fatigueDelta}` : fatigueDelta}
              </span>
            </div>

            {/* Readiness */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl p-3 flex flex-col items-center">
              <ShieldCheck className="w-4 h-4 text-indigo-500 mb-1" />
              <span className="text-[10px] font-bold uppercase text-slate-400">Readiness</span>
              <span className="text-sm font-black font-mono text-slate-800 dark:text-white mt-0.5">
                {Math.round(statsDiff.readinessBefore)} → {Math.round(statsDiff.readinessAfter)}
              </span>
              <span
                className={`text-[11px] font-mono font-bold mt-0.5 ${
                  readinessDelta >= 0 ? "text-emerald-500" : "text-rose-500"
                }`}
              >
                {readinessDelta >= 0 ? `+${readinessDelta}` : readinessDelta}
              </span>
            </div>
          </div>

          {/* Delayed Adaptation & XP info */}
          <div className="space-y-2 text-left bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/40">
            {effect.adaptationDays && effect.fitness > 0 ? (
              <div className="flex items-start gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                <Clock className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Delayed Adaptation Queued</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    +{(effect.fitness * 0.7).toFixed(1)} additional fitness gain matures in {effect.adaptationDays} days.
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Recovery session helps lower fatigue for upcoming efforts.</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-700/30 text-xs">
              <span className="font-bold text-slate-600 dark:text-slate-400">XP Earned:</span>
              <span className="font-mono font-black text-indigo-500">+{statsDiff.xpGained} XP</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold rounded-2xl text-sm shadow-lg shadow-indigo-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
