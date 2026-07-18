/**
 * Race Entry Modal Component (Sprint 26 - Task 6)
 *
 * Entry confirmation showing costs, prerequisites, and prize info.
 */

"use client";

import { formatCurrency } from "@/economy/currency-converter";
import { useSettingsStore } from "@/store/settings-store";
import { useTimelineStore } from "@/store/timeline-store";
import { formatGameDate } from "@/engine/timeline/calendar";
import type { EntryValidation } from "../../economy/race-entry-engine";
import { useState } from "react";
import { getEnergyCostForDistance } from "../../economy/race-entry-engine";
import type { CategoryId, RaceCategory, RaceOccurrence } from "../../scheduling/race-calendar-types";

interface RaceEntryModalProps {
  race: RaceOccurrence;
  validation: EntryValidation;
  currentBalance: number;
  onConfirm: (categoryId?: CategoryId) => void;
  onCancel: () => void;
}

export function RaceEntryModal({
  race,
  validation,
  currentBalance,
  onConfirm,
  onCancel,
}: RaceEntryModalProps) {
  const preferredCurrency =
    useSettingsStore((state) => state.settings.preferredCurrency) || "USD";
  const currentDayIndex = useTimelineStore((state) => state.gameState?.dayIndex ?? 0);

  const categories = race.categories ?? [];
  const [selectedCatId, setSelectedCatId] = useState<CategoryId>(
    race.selectedCategoryId || (categories[0]?.id ?? "5k")
  );

  const activeCategory: RaceCategory | undefined = categories.find(
    (c) => c.id === selectedCatId
  );

  const activeEntryFee = activeCategory ? activeCategory.fee : race.entryFee;
  const activeMaxEntrants = activeCategory?.maxEntrants ?? race.maxEntrants;
  const activePrizeInfo = activeCategory ? activeCategory.prizeInfo : `Est. Pool: ${formatCurrency(race.prizePool, preferredCurrency)}`;
  const activeDistance = activeCategory ? activeCategory.distance : 5;
  const activeEnergyCost = getEnergyCostForDistance(activeDistance);

  const canAfford = currentBalance >= activeEntryFee;
  const hasAllPrereqs = validation.blockers.length === 0;
  const isRaceDay = race.dayIndex === currentDayIndex;

  const getButtonState = () => {
    if (race.isCompleted) return { disabled: true, text: "Completed", color: "" };
    if (race.isRegistered) {
      if (isRaceDay) {
        return { disabled: false, text: "Start Race", color: "bg-indigo-600 hover:bg-indigo-700 text-white" };
      } else {
        return { disabled: true, text: "Already Registered", color: "" };
      }
    }
    if (race.isFull) return { disabled: true, text: "Race Full", color: "" };
    if (!canAfford) return { disabled: true, text: `Need ${formatCurrency(activeEntryFee - currentBalance, preferredCurrency)} More`, color: "" };
    if (!hasAllPrereqs) return { disabled: true, text: "Requirements Not Met", color: "" };
    
    return { 
      disabled: false, 
      text: `Enter Race - ${formatCurrency(activeEntryFee, preferredCurrency)}`, 
      color: "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg shadow-emerald-500/20" 
    };
  };

  const btnState = getButtonState();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="max-w-lg w-full max-h-[90vh] flex flex-col rounded-[2rem] border border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
        
        {/* Header - Fixed */}
        <div className="text-center p-6 shrink-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 z-10">
          <span className={`text-4xl ${race.color}`}>{race.icon}</span>
          <h2 className="text-2xl font-black font-heading text-slate-800 dark:text-white mt-2">{race.name}</h2>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-1 capitalize">
            {race.tier} Event • {formatGameDate(race.dayIndex)}
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          {/* Category Selector Pills */}
          {categories.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                Select Race Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {categories.map((cat) => {
                  const isSelected = cat.id === selectedCatId;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      disabled={race.isRegistered}
                      onClick={() => setSelectedCatId(cat.id)}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                        isSelected
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-[1.02]"
                          : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                      } ${race.isRegistered ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      <span className="text-xs font-black uppercase tracking-wider">{cat.name}</span>
                      <span className={`text-[10px] mt-0.5 font-semibold ${isSelected ? "text-indigo-100" : "text-slate-400 dark:text-slate-500"}`}>
                        {formatCurrency(cat.fee, preferredCurrency)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Description */}
          <p className="text-slate-600 dark:text-slate-300 text-sm text-center">{race.description}</p>

          {/* Cost Breakdown */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-[#E5E7EB] dark:border-slate-700 p-4 space-y-2">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Entry Summary</h3>

            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-gray-400">Entry Fee</span>
              <span
                className={`font-bold ${canAfford ? "text-yellow-600 dark:text-yellow-400" : "text-red-500 dark:text-red-400"}`}
              >
                {formatCurrency(activeEntryFee, preferredCurrency)}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-gray-400">Energy Required</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{activeEnergyCost} EP</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-gray-400">Your Balance</span>
              <span
                className={`font-bold ${canAfford ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}
              >
                {formatCurrency(currentBalance, preferredCurrency)}
              </span>
            </div>

            <hr className="border-[#E5E7EB] dark:border-slate-700" />

            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-gray-400">Prize Pool / Info</span>
              <span className="font-bold text-green-600 dark:text-green-400 text-right">
                {activePrizeInfo}
              </span>
            </div>

            {activeMaxEntrants && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-gray-400">Entrants</span>
                <span
                  className={
                    race.isFull ? "text-red-500 dark:text-red-400 font-bold" : "text-slate-600 dark:text-gray-300"
                  }
                >
                  {race.entrants ?? 0}/{activeMaxEntrants}
                  {race.isFull ? " (FULL)" : ""}
                </span>
              </div>
            )}
          </div>

        {/* Prerequisites Blockers */}
        {validation.blockers.length > 0 && (
          <div className="rounded-xl bg-red-50/40 dark:bg-red-500/10 border border-red-100/30 dark:border-red-500/30 p-3 space-y-2">
            <h3 className="font-bold text-red-600 dark:text-red-400 text-sm">
              ❌ Requirements Not Met
            </h3>
            {validation.blockers.map((blocker, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                <div>
                  <p className="text-slate-700 dark:text-gray-300">{blocker.reason}</p>
                  {blocker.howToResolve && (
                    <p className="text-slate-500 dark:text-gray-500 text-xs italic mt-0.5">
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
          <div className="rounded-xl bg-amber-50/40 dark:bg-yellow-500/10 border border-amber-100/30 dark:border-yellow-500/30 p-3">
            {validation.warnings.map((w, idx) => (
              <p key={idx} className="text-amber-700 dark:text-yellow-300 text-sm">
                {w}
              </p>
            ))}
          </div>
        )}

        {/* Prize Distribution */}
        <div className="rounded-xl bg-slate-50 dark:bg-gray-800/30 p-3 border border-[#E5E7EB] dark:border-slate-800/0">
          <h3 className="font-bold text-slate-800 dark:text-white text-xs mb-2">
            🏆 Prize Distribution
          </h3>
          <div className="grid grid-cols-5 gap-1 text-center text-xs">
            <div>
              <div className="text-yellow-500 dark:text-yellow-400 font-bold">1st</div>
              <div className="text-slate-500 dark:text-gray-400">40%</div>
            </div>
            <div>
              <div className="text-slate-400 dark:text-gray-300 font-bold">2nd</div>
              <div className="text-slate-500 dark:text-gray-400">25%</div>
            </div>
            <div>
              <div className="text-orange-500 dark:text-orange-400 font-bold">3rd</div>
              <div className="text-slate-500 dark:text-gray-400">15%</div>
            </div>
            <div>
              <div className="text-slate-400 dark:text-gray-400 font-bold">4th</div>
              <div className="text-slate-400 dark:text-gray-550">10%</div>
            </div>
            <div>
              <div className="text-slate-400 dark:text-gray-400 font-bold">5th</div>
              <div className="text-slate-400 dark:text-gray-550">5%</div>
            </div>
          </div>
        </div>

        </div>

        {/* Actions - Fixed */}
        <div className="p-6 shrink-0 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 z-10">
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 px-4 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white font-bold transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(selectedCatId)}
              disabled={btnState.disabled}
              className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                !btnState.disabled
                  ? btnState.color
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-[#E5E7EB] dark:border-slate-700"
              }`}
            >
              {btnState.text}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
