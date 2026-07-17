/**
 * Work Selector Modal (Sprint 26.5 - Task 1.4)
 *
 * UI for selecting different work types with varying pay and requirements.
 */

"use client";

import { useState } from "react";
import type { WorkType, WorkTypeId } from "@/economy/work-types";
import {
  calculateWorkPay,
  getAllWorkTypesWithStatus,
  getWorkEfficiency,
} from "@/economy/work-types";
import type { GameState } from "@/engine/timeline/time-types";

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
  const [selectedWorkType, setSelectedWorkType] = useState<WorkTypeId | null>(
    null,
  );
  const workOptions = getAllWorkTypesWithStatus(gameState);

  const handleConfirm = () => {
    if (selectedWorkType) {
      const selectedOption = workOptions.find(
        (opt) => opt.workType.id === selectedWorkType,
      );
      if (selectedOption && selectedOption.workType.energyCost >= 40) {
        const confirmText = `This work type requires ${selectedOption.workType.energyCost} energy. Are you sure you want to proceed?`;
        if (!globalThis.confirm?.(confirmText)) {
          return;
        }
      }
      onSelectWork(selectedWorkType);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Choose Work Type</h2>
          <p className="text-gray-400 mt-1">
            Select how you want to earn money today
          </p>
        </div>

        {/* Work Options List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {workOptions.map(
            ({ workType, unlocked, estimatedPay, missingRequirements }) => {
              const efficiency = getWorkEfficiency(workType, estimatedPay);
              const isSelected = selectedWorkType === workType.id;

              return (
                <button
                  key={workType.id}
                  onClick={() => unlocked && setSelectedWorkType(workType.id)}
                  disabled={!unlocked}
                  className={`
                  w-full text-left p-4 rounded-lg border-2 transition-all
                  ${
                    unlocked
                      ? isSelected
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-gray-700 bg-gray-800 hover:border-gray-600 hover:bg-gray-750"
                      : "border-gray-800 bg-gray-900 opacity-60 cursor-not-allowed"
                  }
                `}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Icon & Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{workType.icon}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {workType.name}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {workType.description}
                          </p>
                        </div>
                      </div>

                      {/* Stats Row */}
                      <div className="flex items-center gap-4 text-sm mt-3">
                        <div className="flex items-center gap-1">
                          <span className="text-green-400">💰</span>
                          <span className="text-white font-medium">
                            ${workType.pay.min}
                            {workType.pay.max !== workType.pay.min &&
                              ` - $${workType.pay.max}`}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">⚡</span>
                          <span className="text-gray-300">
                            {workType.energyCost} energy
                          </span>
                        </div>

                        {unlocked && (
                          <div className="flex items-center gap-1">
                            <span className="text-blue-400">📊</span>
                            <span className="text-gray-300">
                              ${efficiency.toFixed(2)}/energy
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Your Estimated Pay */}
                      {unlocked && estimatedPay !== workType.pay.min && (
                        <div className="mt-2 px-3 py-1 bg-blue-500/20 rounded inline-block">
                          <span className="text-sm text-blue-300">
                            Your pay:{" "}
                            <span className="font-semibold">
                              ${estimatedPay}
                            </span>
                          </span>
                        </div>
                      )}

                      {/* Locked Requirements */}
                      {!unlocked && missingRequirements.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {missingRequirements.map((req, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded"
                            >
                              🔒 {req}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Side Effects */}
                      {workType.effects &&
                        Object.keys(workType.effects).length > 0 && (
                          <div className="mt-2 flex gap-2 text-xs">
                            {workType.effects.health && (
                              <span
                                className={
                                  workType.effects.health > 0
                                    ? "text-green-400"
                                    : "text-red-400"
                                }
                              >
                                Health {workType.effects.health > 0 ? "+" : ""}
                                {workType.effects.health}
                              </span>
                            )}
                            {workType.effects.intellect && (
                              <span className="text-purple-400">
                                Intellect +{workType.effects.intellect}
                              </span>
                            )}
                            {workType.effects.charisma && (
                              <span className="text-pink-400">
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
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
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
        <div className="px-6 py-4 border-t border-gray-700 flex justify-between items-center">
          <div className="text-sm text-gray-400">
            {selectedWorkType ? (
              <span>
                Current energy:{" "}
                <span className="text-white font-medium">
                  {gameState.energy}
                </span>{" "}
                / {gameState.energyMax}
              </span>
            ) : (
              <span>Select a work type to continue</span>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedWorkType}
              className={`
                px-6 py-2 rounded font-medium transition-colors
                ${
                  selectedWorkType
                    ? "bg-blue-600 hover:bg-blue-500 text-white"
                    : "bg-gray-700 text-gray-500 cursor-not-allowed"
                }
              `}
            >
              Start Working
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
