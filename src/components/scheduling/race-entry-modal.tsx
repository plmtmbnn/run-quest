/**
 * Race Entry Modal Component (Sprint 26 - Task 6)
 * 
 * Entry confirmation showing costs, prerequisites, and prize info.
 */

"use client";

import type { RaceOccurrence } from "../../scheduling/race-calendar-types";
import type { EntryValidation } from "../../economy/race-entry-engine";

interface RaceEntryModalProps {
  race: RaceOccurrence;
  validation: EntryValidation;
  currentBalance: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function RaceEntryModal({
  race,
  validation,
  currentBalance,
  onConfirm,
  onCancel,
}: RaceEntryModalProps) {
  const canAfford = currentBalance >= race.entryFee;
  const hasAllPrereqs = validation.blockers.length === 0;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="max-w-lg w-full rounded-lg border border-gray-700 bg-gray-900 p-6 space-y-5">
        {/* Header */}
        <div className="text-center">
          <span className={`text-4xl ${race.color}`}>{race.icon}</span>
          <h2 className="text-2xl font-bold text-white mt-2">{race.name}</h2>
          <p className="text-sm text-gray-400 mt-1 capitalize">
            {race.tier} Event • Day {race.dayIndex}
          </p>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm text-center">
          {race.description}
        </p>

        {/* Cost Breakdown */}
        <div className="rounded-lg bg-gray-800/50 border border-gray-700 p-4 space-y-2">
          <h3 className="font-semibold text-white text-sm">Entry Summary</h3>

          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Entry Fee</span>
            <span className={`font-bold ${canAfford ? "text-yellow-400" : "text-red-400"}`}>
              ${race.entryFee}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Energy Required</span>
            <span className="font-bold text-blue-400">25 EP</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Your Balance</span>
            <span className={`font-bold ${canAfford ? "text-green-400" : "text-red-400"}`}>
              ${currentBalance}
            </span>
          </div>

          <hr className="border-gray-700" />

          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Prize Pool</span>
            <span className="font-bold text-green-400">${race.prizePool}</span>
          </div>

          {race.maxEntrants && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Entrants</span>
              <span className={race.isFull ? "text-red-400 font-bold" : "text-gray-300"}>
                {race.entrants ?? 0}/{race.maxEntrants}
                {race.isFull ? " (FULL)" : ""}
              </span>
            </div>
          )}
        </div>

        {/* Prerequisites Blockers */}
        {validation.blockers.length > 0 && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 space-y-2">
            <h3 className="font-semibold text-red-400 text-sm">❌ Requirements Not Met</h3>
            {validation.blockers.map((blocker, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <span className="text-red-400 mt-0.5">•</span>
                <div>
                  <p className="text-gray-300">{blocker.reason}</p>
                  {blocker.howToResolve && (
                    <p className="text-gray-500 text-xs italic mt-0.5">
                      💡 {blocker.howToResolve}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Warnings */}
        {validation.warnings.length > 0 && hasAllPrereqs && (
          <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-3">
            {validation.warnings.map((w, idx) => (
              <p key={idx} className="text-yellow-300 text-sm">{w}</p>
            ))}
          </div>
        )}

        {/* Prize Distribution */}
        <div className="rounded-lg bg-gray-800/30 p-3">
          <h3 className="font-semibold text-white text-xs mb-2">🏆 Prize Distribution</h3>
          <div className="grid grid-cols-5 gap-1 text-center text-xs">
            <div>
              <div className="text-yellow-400 font-bold">1st</div>
              <div className="text-gray-400">40%</div>
            </div>
            <div>
              <div className="text-gray-300 font-bold">2nd</div>
              <div className="text-gray-400">25%</div>
            </div>
            <div>
              <div className="text-orange-400 font-bold">3rd</div>
              <div className="text-gray-400">15%</div>
            </div>
            <div>
              <div className="text-gray-400 font-bold">4th</div>
              <div className="text-gray-500">10%</div>
            </div>
            <div>
              <div className="text-gray-400 font-bold">5th</div>
              <div className="text-gray-500">5%</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!canAfford || !hasAllPrereqs || race.isFull || race.isCompleted}
            className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all ${
              canAfford && hasAllPrereqs && !race.isFull && !race.isCompleted
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
            }`}
          >
            {race.isCompleted
              ? "Completed"
              : race.isFull
                ? "Race Full"
                : !canAfford
                  ? `Need $${race.entryFee - currentBalance} More`
                  : !hasAllPrereqs
                    ? "Requirements Not Met"
                    : `Enter Race - $${race.entryFee}`}
          </button>
        </div>
      </div>
    </div>
  );
}
