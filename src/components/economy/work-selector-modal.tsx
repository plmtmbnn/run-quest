/**
 * Work Selector Modal (Sprint 26.5 - Task 1.4)
 *
 * UI for selecting different work types with varying pay and requirements.
 */

"use client";

import { useState } from "react";
import type { WorkType, WorkTypeId } from "@/economy/work-types";
import {
  getAllWorkTypesWithStatus,
  getWorkEfficiency,
} from "@/economy/work-types";
import type { GameState } from "@/engine/timeline/time-types";
import { useSettingsStore } from "@/store/settings-store";
import { formatCurrency } from "@/economy/currency-converter";

interface WorkSelectorModalProps {
  gameState: GameState;
  onSelectWork: (workTypeId: WorkTypeId) => void;
  onClose: () => void;
}

export function WorkSelectorModal({
  gameState,
  onSelectWork,
  onClose,
}: WorkSelectorModalProps) {
  const preferredCurrency = useSettingsStore((state) => state.settings.preferredCurrency) || "USD";
  const [selectedWorkType, setSelectedWorkType] = useState<WorkTypeId | null>(
    null,
  );
  const lastJobChangeDay = (gameState.flags.lastJobChangeDay as number) ?? -7;
  const cooldownDaysRemaining = Math.max(0, 7 - (gameState.dayIndex - lastJobChangeDay));
  const workOptions = getAllWorkTypesWithStatus(gameState);

  const currentJobId = (gameState.flags.activeJobId as WorkTypeId) || null;

  const [outcome, setOutcome] = useState<null | 'accepted' | 'rejected'>(null);

  const handleConfirm = () => {
    if (selectedWorkType && cooldownDaysRemaining <= 0) {
      // Simple binary decision (e.g., 70% acceptance chance)
      const accepted = Math.random() < 0.7;
      if (accepted) {
        onSelectWork(selectedWorkType);
        setOutcome('accepted');
      } else {
        setOutcome('rejected');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] text-slate-800 dark:text-white shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E5E7EB] dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-center shrink-0">
          <h2 className="text-2xl font-black font-heading tracking-tight text-slate-900 dark:text-white">💼 Choose Work Type</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Select a job to accept as your active job
          </p>
        </div>

        {/* Work Options List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {workOptions.map(
            ({ workType, unlocked, estimatedPay, missingRequirements }) => {
              const efficiency = getWorkEfficiency(workType, estimatedPay);
              const isSelected = selectedWorkType === workType.id;

              return (
                <button
                  type="button"
                  key={workType.id}
                  onClick={() => unlocked && setSelectedWorkType(workType.id)}
                  disabled={!unlocked || workType.id === currentJobId}
                  className={`
                  w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none flex flex-col
                  ${
                    unlocked
                      ? isSelected
                        ? "border-indigo-500 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-500/10 shadow-sm"
                        : "border-[#E5E7EB] bg-white dark:border-slate-800 dark:bg-slate-900 hover:border-slate-300 hover:bg-slate-50 dark:hover:border-slate-700 dark:hover:bg-slate-800 hover:scale-[1.01]"
                      : "border-slate-200 bg-slate-50/50 dark:border-slate-800/50 dark:bg-slate-900/50 opacity-60 cursor-not-allowed"
                  }
                `}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Icon & Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center justify-center w-14 h-14 bg-white dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm shrink-0">
                          <span className="text-3xl">{workType.icon}</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-black font-heading tracking-tight text-slate-800 dark:text-white">
                            {workType.name}
                          </h3>
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                            {workType.description}
                          </p>
                        </div>
                      </div>

                      {/* Stats Row */}
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-500/10 px-3 py-1.5 rounded-xl border border-green-100 dark:border-green-500/20">
                          <span className="text-sm">💰</span>
                          <span className="text-sm font-bold text-green-700 dark:text-green-400 tracking-tight">
                            {formatCurrency(workType.pay.min, preferredCurrency)}
                            {workType.pay.max !== workType.pay.min &&
                              ` - ${formatCurrency(workType.pay.max, preferredCurrency)}`}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-100 dark:border-amber-500/20">
                          <span className="text-sm">⚡</span>
                          <span className="text-sm font-bold text-amber-700 dark:text-amber-400 tracking-tight">
                            {workType.energyCost} EP
                          </span>
                        </div>

                        {unlocked && (
                          <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-500/20">
                            <span className="text-sm">📊</span>
                            <span className="text-sm font-bold text-blue-700 dark:text-blue-400 tracking-tight">
                              {formatCurrency(efficiency, preferredCurrency)}/EP
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Your Estimated Pay */}
                      {unlocked && estimatedPay !== workType.pay.min && (
                        <div className="mt-3 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 px-3 py-2 rounded-xl inline-block">
                          <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                            Est. Pay:{" "}
                            <span className="font-black text-sm ml-1">
                              {formatCurrency(estimatedPay, preferredCurrency)}
                            </span>
                          </span>
                        </div>
                      )}

                      {/* Locked Requirements */}
                      {!unlocked && missingRequirements.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {missingRequirements.map((req, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-bold uppercase tracking-wider text-[10px] rounded-lg border border-red-200 dark:border-red-900/30"
                            >
                              🔒 {req}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Side Effects */}
                      {workType.effects &&
                        Object.keys(workType.effects).length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {workType.effects.health && (
                              <span
                                className={`px-2.5 py-1 font-bold uppercase tracking-wider text-[10px] rounded-lg border ${
                                  workType.effects.health > 0
                                    ? "bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/30"
                                    : "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30"
                                }`}
                              >
                                Health {workType.effects.health > 0 ? "+" : ""}
                                {workType.effects.health}
                              </span>
                            )}
                            {workType.effects.intellect && (
                              <span className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider text-[10px] rounded-lg border border-purple-200 dark:border-purple-900/30">
                                Intellect +{workType.effects.intellect}
                              </span>
                            )}
                            {workType.effects.charisma && (
                              <span className="px-2.5 py-1 bg-pink-50 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400 font-bold uppercase tracking-wider text-[10px] rounded-lg border border-pink-200 dark:border-pink-900/30">
                                Charisma +{workType.effects.charisma}
                              </span>
                            )}
                          </div>
                        )}
                    </div>

                    {/* Right: Selection Indicator */}
                    {unlocked && (
                      <div className="flex-shrink-0">
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                            <span className="text-white text-sm">✓</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            },
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E5E7EB] dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {cooldownDaysRemaining > 0 ? (
              <span className="text-amber-600 dark:text-amber-500 font-bold flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/20 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-900/30">
                ⏳ Cooldown: {cooldownDaysRemaining}d remaining
              </span>
            ) : selectedWorkType ? (
              <span>
                Current energy:{" "}
                <span className="text-slate-900 dark:text-white font-black text-base">
                  {gameState.energy}
                </span>{" "}
                / {gameState.energyMax}
              </span>
            ) : (
              <span>Select a work type to apply</span>
            )}
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold border border-[#E5E7EB] dark:border-slate-700 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedWorkType || cooldownDaysRemaining > 0}
              className={`
                flex-1 sm:flex-none px-8 py-3 rounded-xl font-black transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none
                ${
                  selectedWorkType && cooldownDaysRemaining <= 0
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-[#E5E7EB] dark:border-slate-700"
                }
              `}
            >
              Apply Job
            </button>
          </div>
        </div>
        {/* Outcome Message */}
        {outcome && (
          <div className={`px-6 py-3 text-center font-black tracking-wide text-sm ${outcome === 'accepted' ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20' : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20'}`}>
            {outcome === 'accepted' ? '🎉 JOB APPLIED!' : '❌ JOB REJECTED'}
          </div>
        )}
      </div>
    </div>
  );
}
