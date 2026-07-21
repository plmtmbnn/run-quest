"use client";

import { useMemo } from "react";
import { Trophy, Clock, TrendingUp, Target, Zap, AlertCircle } from "lucide-react";
import {
  getAllPBs,
  predictFromBestPB,
  getDistanceCategory,
  getStandardDistance,
  formatTime,
} from "@/runner/personal-best";
import type { DistanceCategory } from "@/runner/personal-best";

const CATEGORIES: { key: DistanceCategory; label: string; emoji: string; distanceKm: number }[] = [
  { key: "5K", label: "5K", emoji: "🏃", distanceKm: 5 },
  { key: "10K", label: "10K", emoji: "⚡", distanceKm: 10 },
  { key: "HM", label: "Half Marathon", emoji: "🏅", distanceKm: 21.1 },
  { key: "FM", label: "Full Marathon", emoji: "🏆", distanceKm: 42.2 },
  { key: "Ultra", label: "Ultra (50K+)", emoji: "🌄", distanceKm: 50 },
];

const CONFIDENCE_COLORS: Record<"high" | "medium" | "low", string> = {
  high: "text-emerald-500 dark:text-emerald-400",
  medium: "text-amber-500 dark:text-amber-400",
  low: "text-rose-500 dark:text-rose-400",
};

const CONFIDENCE_LABELS: Record<"high" | "medium" | "low", string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

interface PBTrackerProps {
  /** Show the prediction cards in addition to PBs */
  showPredictions?: boolean;
}

export function PBTracker({ showPredictions = true }: PBTrackerProps) {
  const allPBs = useMemo(() => getAllPBs(), []);

  const pbsByCategory = useMemo(() => {
    const map: Record<string, (typeof allPBs)[0] | null> = {};
    for (const cat of CATEGORIES) {
      map[cat.key] = allPBs.find((pb) => pb.category === cat.key) ?? null;
    }
    return map;
  }, [allPBs]);

  const hasPBs = allPBs.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center">
          <Trophy className="h-5 w-5 text-orange-500" />
        </div>
        <div>
          <h2 className="font-heading text-xl font-bold text-gray-900 dark:text-white">
            Personal Bests
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Your fastest recorded times per distance
          </p>
        </div>
      </div>

      {/* PB Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map((cat) => {
          const pb = pbsByCategory[cat.key];
          return (
            <div
              key={cat.key}
              className={`relative rounded-[1.5rem] border-2 p-5 flex flex-col gap-3 transition-all ${
                pb
                  ? "border-orange-200 dark:border-orange-900/60 bg-gradient-to-br from-orange-50 to-orange-50/30 dark:from-orange-950/20 dark:to-slate-900/50"
                  : "border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/50"
              }`}
            >
              {/* Category Label */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{cat.emoji}</span>
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                      {cat.label}
                    </span>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">
                      {cat.distanceKm} km
                    </p>
                  </div>
                </div>
                {pb && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400">
                    PB
                  </span>
                )}
              </div>

              {pb ? (
                <>
                  {/* Best Time */}
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-orange-500 shrink-0 mb-0.5" />
                      <span className="text-2xl font-black font-mono text-gray-900 dark:text-white tracking-tight">
                        {formatTime(pb.finishTime)}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 font-mono pl-5">
                      {Math.floor(pb.averagePace / 60)}:{String(Math.floor(pb.averagePace % 60)).padStart(2, "0")} /km avg
                    </p>
                  </div>

                  {/* Date */}
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-slate-800 pt-2">
                    Set on {new Date(pb.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 gap-2 text-center">
                  <AlertCircle className="h-8 w-8 text-gray-300 dark:text-slate-700" />
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                    No PB yet
                  </p>
                  <p className="text-[10px] text-gray-300 dark:text-slate-700">
                    Complete a {cat.label} race to set your first PB
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Predictions Section */}
      {showPredictions && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center">
              <TrendingUp className="h-4.5 w-4.5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-gray-900 dark:text-white">
                Predicted Finish Times
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Based on Riegel&apos;s formula from your best PB
              </p>
            </div>
          </div>

          {!hasPBs ? (
            <div className="rounded-[1.5rem] border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 p-6 text-center">
              <Target className="h-8 w-8 text-gray-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Complete at least one race to unlock predictions
              </p>
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/80">
                    <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold">
                      Distance
                    </th>
                    <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold">
                      Predicted Time
                    </th>
                    <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold">
                      Confidence
                    </th>
                    <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold hidden sm:table-cell">
                      Based On
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {CATEGORIES.map((cat) => {
                    const prediction = predictFromBestPB(cat.distanceKm);
                    const hasPBForThis = pbsByCategory[cat.key] !== null;

                    return (
                      <tr
                        key={cat.key}
                        className="border-b border-gray-50 dark:border-slate-800/60 last:border-0 hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{cat.emoji}</span>
                            <div>
                              <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs">
                                {cat.label}
                              </span>
                              <p className="text-[10px] text-gray-400 dark:text-gray-500">
                                {cat.distanceKm} km
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono">
                          {hasPBForThis ? (
                            <div className="flex items-center gap-1.5">
                              <Trophy className="h-3 w-3 text-orange-500" />
                              <span className="font-black text-orange-600 dark:text-orange-400 text-sm">
                                {formatTime(pbsByCategory[cat.key]!.finishTime)}
                              </span>
                              <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-orange-100 dark:bg-orange-950/50 text-orange-500">
                                Actual PB
                              </span>
                            </div>
                          ) : prediction ? (
                            <div className="flex items-center gap-1.5">
                              <Zap className="h-3 w-3 text-blue-400" />
                              <span className="font-bold text-gray-700 dark:text-gray-300 text-sm">
                                ~{formatTime(prediction.predictedTime)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-600 text-xs italic">
                              —
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {hasPBForThis ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                              ✓ Confirmed
                            </span>
                          ) : prediction ? (
                            <span
                              className={`text-[10px] font-bold ${CONFIDENCE_COLORS[prediction.confidence]}`}
                            >
                              {CONFIDENCE_LABELS[prediction.confidence]}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-[10px]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          {hasPBForThis ? (
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 italic">
                              —
                            </span>
                          ) : prediction ? (
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                              Your {prediction.basedOn} PB
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400 dark:text-gray-600 italic">
                              No data yet
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {hasPBs && (
            <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center">
              💡 Predictions use Riegel&apos;s Formula: T₂ = T₁ × (D₂/D₁)^1.06
            </p>
          )}
        </div>
      )}
    </div>
  );
}
