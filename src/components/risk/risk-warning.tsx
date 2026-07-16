/**
 * Risk Warning Component (Sprint 24)
 * 
 * Displays pre-race risk assessment and warnings.
 */

"use client";

import type { RiskAssessment } from "@/engine/risk/risk-engine";

interface RiskWarningProps {
  riskAssessment: RiskAssessment;
  onProceed?: () => void;
  onCancel?: () => void;
  showActions?: boolean;
}

export function RiskWarning({
  riskAssessment,
  onProceed,
  onCancel,
  showActions = false,
}: RiskWarningProps) {
  const {
    riskLabel,
    riskColor,
    warnings,
    performancePenalty,
    canRaceSafely,
    probability,
  } = riskAssessment;

  const riskIcon =
    riskAssessment.riskLevel === "low"
      ? "✅"
      : riskAssessment.riskLevel === "moderate"
        ? "⚡"
        : riskAssessment.riskLevel === "high"
          ? "⚠️"
          : "❌";

  const borderColor =
    riskAssessment.riskLevel === "low"
      ? "border-green-500/30"
      : riskAssessment.riskLevel === "moderate"
        ? "border-yellow-500/30"
        : riskAssessment.riskLevel === "high"
          ? "border-orange-500/30"
          : "border-red-500/30";

  const bgColor =
    riskAssessment.riskLevel === "low"
      ? "bg-green-500/10"
      : riskAssessment.riskLevel === "moderate"
        ? "bg-yellow-500/10"
        : riskAssessment.riskLevel === "high"
          ? "bg-orange-500/10"
          : "bg-red-500/10";

  return (
    <div className={`rounded-lg border ${borderColor} ${bgColor} p-4 space-y-3`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{riskIcon}</span>
          <div>
            <h3 className={`font-semibold ${riskColor}`}>{riskLabel}</h3>
            <p className="text-xs text-gray-400">
              {Math.round(probability * 100)}% injury probability
            </p>
          </div>
        </div>
        {!canRaceSafely && (
          <div className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-400">
            NOT RECOMMENDED
          </div>
        )}
      </div>

      {/* Performance Penalties */}
      {performancePenalty.overallPenalty > 0 && (
        <div className="rounded bg-gray-800/50 p-3">
          <div className="mb-1 text-xs font-semibold text-gray-400">
            Current Performance Impact:
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-bold text-red-400">
                -{Math.round(performancePenalty.speedPenalty * 100)}%
              </div>
              <div className="text-xs text-gray-500">Speed</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-400">
                -{Math.round(performancePenalty.staminaPenalty * 100)}%
              </div>
              <div className="text-xs text-gray-500">Stamina</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-400">
                -{Math.round(performancePenalty.overallPenalty * 100)}%
              </div>
              <div className="text-xs text-gray-500">Overall</div>
            </div>
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-1">
          {warnings.map((warning, index) => (
            <div
              key={index}
              className="text-sm text-gray-300 flex items-start gap-2"
            >
              <span className="mt-0.5 shrink-0">{warning.split(" ")[0]}</span>
              <span>{warning.substring(warning.indexOf(" ") + 1)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {showActions && onProceed && onCancel && (
        <div className="flex gap-2 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded bg-gray-700 px-4 py-2 font-medium text-gray-300 hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onProceed}
            className={`flex-1 rounded px-4 py-2 font-medium transition-colors ${
              canRaceSafely
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            {canRaceSafely ? "Race Anyway" : "Race at Risk"}
          </button>
        </div>
      )}

      {/* Advice */}
      {!canRaceSafely && (
        <div className="rounded bg-blue-500/10 border border-blue-500/30 p-2 text-xs text-blue-300">
          💡 Tip: Use Rest action to recover, or apply treatment to speed up
          recovery
        </div>
      )}
    </div>
  );
}
