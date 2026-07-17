/**
 * Injury Panel Component (Sprint 24)
 *
 * Displays active injuries, recovery status, and treatment options.
 */

"use client";

import { INJURY_TEMPLATES } from "@/engine/risk/injury-database";
import type {
  Injury,
  InjuryState,
  TreatmentType,
} from "@/engine/risk/injury-types";
import { getInjuryStatusSummary } from "@/engine/risk/risk-engine";

interface InjuryPanelProps {
  injuryState: InjuryState;
  availableMoney: number;
  onApplyTreatment?: (injuryId: string, treatmentType: TreatmentType) => void;
}

export function InjuryPanel({
  injuryState,
  availableMoney,
  onApplyTreatment,
}: InjuryPanelProps) {
  const statusSummary = getInjuryStatusSummary(injuryState);

  if (injuryState.activeInjuries.length === 0) {
    return (
      <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{statusSummary.icon}</span>
          <div>
            <h3 className="font-semibold text-green-400">Healthy</h3>
            <p className="text-sm text-gray-400">{statusSummary.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Status Summary */}
      <div
        className={`rounded-lg border p-4 ${
          statusSummary.status === "severe"
            ? "border-red-500/30 bg-red-500/10"
            : statusSummary.status === "moderate"
              ? "border-orange-500/30 bg-orange-500/10"
              : "border-yellow-500/30 bg-yellow-500/10"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">{statusSummary.icon}</span>
          <div>
            <h3 className={`font-semibold ${statusSummary.color}`}>
              Injury Status
            </h3>
            <p className="text-sm text-gray-400">{statusSummary.message}</p>
          </div>
        </div>
      </div>

      {/* Individual Injuries */}
      <div className="space-y-2">
        {injuryState.activeInjuries.map((injury) => (
          <InjuryCard
            key={injury.id}
            injury={injury}
            availableMoney={availableMoney}
            onApplyTreatment={onApplyTreatment}
          />
        ))}
      </div>
    </div>
  );
}

interface InjuryCardProps {
  injury: Injury;
  availableMoney: number;
  onApplyTreatment?: (injuryId: string, treatmentType: TreatmentType) => void;
}

function InjuryCard({
  injury,
  availableMoney,
  onApplyTreatment,
}: InjuryCardProps) {
  const template = INJURY_TEMPLATES[injury.type];
  const penaltyPercent = Math.round(injury.performancePenalty * 100);
  const progressPercent = Math.round(
    ((injury.recoveryDaysTotal - injury.recoveryDaysRemaining) /
      injury.recoveryDaysTotal) *
      100,
  );

  const severityColor =
    injury.severity === "severe"
      ? "text-red-400"
      : injury.severity === "moderate"
        ? "text-orange-400"
        : "text-yellow-400";

  const severityBorder =
    injury.severity === "severe"
      ? "border-red-500/30"
      : injury.severity === "moderate"
        ? "border-orange-500/30"
        : "border-yellow-500/30";

  return (
    <div className={`rounded-lg border ${severityBorder} bg-gray-800/50 p-3`}>
      {/* Header */}
      <div className="mb-2 flex items-start justify-between">
        <div>
          <h4 className={`font-semibold ${severityColor}`}>{template.label}</h4>
          <p className="text-xs text-gray-400 capitalize">
            {injury.severity} severity
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-gray-300">
            {injury.recoveryDaysRemaining} days
          </div>
          <div className="text-xs text-gray-500">remaining</div>
        </div>
      </div>

      {/* Description */}
      <p className="mb-2 text-sm text-gray-400">{template.description}</p>

      {/* Impact */}
      <div className="mb-3 flex items-center gap-4 text-xs">
        <div>
          <span className="text-gray-500">Performance: </span>
          <span className="font-semibold text-red-400">-{penaltyPercent}%</span>
        </div>
        <div>
          <span className="text-gray-500">Affects: </span>
          <span className="font-semibold text-gray-300 capitalize">
            {injury.affectedAttribute}
          </span>
        </div>
      </div>

      {/* Recovery Progress */}
      <div className="mb-3">
        <div className="mb-1 flex justify-between text-xs">
          <span className="text-gray-500">Recovery Progress</span>
          <span className="text-gray-400">{progressPercent}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-700">
          <div
            className="h-full bg-green-500 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Treatment Options */}
      {onApplyTreatment && injury.treatmentOptions.length > 1 && (
        <div className="space-y-1">
          <div className="text-xs font-semibold text-gray-400">
            Treatment Options:
          </div>
          <div className="flex gap-2">
            {injury.treatmentOptions
              .filter((t) => t.id !== "rest")
              .map((treatment) => {
                const canAfford = availableMoney >= treatment.cost;
                return (
                  <button
                    key={treatment.id}
                    onClick={() => onApplyTreatment(injury.id, treatment.id)}
                    disabled={!canAfford}
                    className={`flex-1 rounded px-2 py-1.5 text-xs font-medium transition-colors ${
                      canAfford
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-700 text-gray-500 cursor-not-allowed"
                    }`}
                    title={treatment.description}
                  >
                    {treatment.label}
                    <div className="text-[10px] opacity-80">
                      ${treatment.cost} • -{treatment.daysReduced}d
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* Warning */}
      {injury.severity !== "minor" && (
        <div className="mt-2 rounded bg-orange-500/10 px-2 py-1 text-xs text-orange-400">
          ⚠️ Racing injured has {Math.round(injury.riskOfWorsening * 100)}%
          chance of worsening
        </div>
      )}
    </div>
  );
}
