"use client";

import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";
import { generateDailyRaceBoard } from "@/services/challenge/generator";
import { storageRepository } from "@/storage/storage-repository";
import type { StoredDailyBoard } from "@/storage/types";
import { useGameStore } from "@/store/game-store";
import { usePlayerStore } from "@/store/player-store";
import type { RaceEntry } from "@/types/engine";

export function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const player = usePlayerStore((state) => state.player);
  const { setChallenge } = useGameStore();

  const todayStr = dayjs().format("YYYY-MM-DD");
  const board = generateDailyRaceBoard(todayStr);

  const [boardStatus, setBoardStatus] = useState<StoredDailyBoard | null>(null);

  useEffect(() => {
    let status = storageRepository.loadDailyBoard();
    if (!status || status.boardId !== todayStr) {
      status = {
        version: 1,
        boardId: todayStr,
        entriesRemaining: 1,
        selectedEntryId: null,
        completedEntryId: null,
      };
      storageRepository.saveDailyBoard(status);
    }
    setBoardStatus(status);
  }, [todayStr]);

  const handleSelectRace = (entry: RaceEntry) => {
    if (!boardStatus) return;

    // Save active choice to storage
    const updatedStatus: StoredDailyBoard = {
      ...boardStatus,
      entriesRemaining: 0,
      selectedEntryId: entry.scenario.id,
    };
    storageRepository.saveDailyBoard(updatedStatus);
    setBoardStatus(updatedStatus);

    // Load active challenge to Zustand and navigate to briefing
    setChallenge(entry.scenario);
    router.push("/briefing");
  };

  const formatTargetTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const renderStars = (difficulty: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={
            i <= difficulty ? "text-amber-500 font-bold" : "text-gray-200"
          }
        >
          ★
        </span>,
      );
    }
    return <div className="flex gap-0.5 text-xs">{stars}</div>;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "road":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "trail":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "track":
        return "bg-amber-50 text-amber-600 border-amber-100";
      default:
        return "bg-purple-50 text-purple-600 border-purple-100";
    }
  };

  const isBoardCompleted = boardStatus?.completedEntryId !== null;

  return (
    <div className="min-h-screen bg-[#FFFDF8] flex flex-col pb-12">
      {/* Header */}
      <header className="px-6 pt-10 pb-4">
        <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-1">
          RunQuest
        </p>
        <h1 className="text-3xl font-bold text-gray-900 font-heading">
          {isBoardCompleted
            ? t("home.completed" as TranslationKey)
            : t("home.title" as TranslationKey)}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isBoardCompleted
            ? t("home.completed_subtitle" as TranslationKey)
            : t("home.subtitle" as TranslationKey)}
        </p>
      </header>

      {/* Main Container */}
      <main className="flex-1 px-6 py-4 flex flex-col gap-6">
        {/* Player Stats Panel */}
        {player && (
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 text-white shadow-md flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-blue-200 uppercase tracking-wider font-semibold">
                  Player Profile
                </span>
                <span className="text-lg font-bold font-heading">
                  Runner #{player.id.slice(0, 5).toUpperCase()}
                </span>
              </div>
              <button
                type="button"
                onClick={() => router.push("/history")}
                className="inline-flex items-center gap-1.5 self-start text-[10px] uppercase font-bold tracking-wider bg-white/10 hover:bg-white/20 active:scale-95 px-3 py-1 rounded-full transition-all border border-white/10"
              >
                View History →
              </button>
            </div>
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <span className="text-xs text-blue-200 uppercase font-medium">
                  {t("home.stats.streak" as TranslationKey)}
                </span>
                <span className="text-xl font-bold flex items-center gap-1 mt-0.5">
                  🔥 {player.statistics.currentStreak}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-blue-200 uppercase font-medium">
                  {t("home.stats.runs" as TranslationKey)}
                </span>
                <span className="text-xl font-bold mt-0.5">
                  {player.statistics.totalRuns}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-blue-200 uppercase font-medium">
                  {t("home.stats.distance" as TranslationKey)}
                </span>
                <span className="text-xl font-bold mt-0.5">
                  {player.statistics.totalDistance} km
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Daily Entry Tracker */}
        <div className="flex items-center justify-between bg-white border-2 border-[#E5E7EB] rounded-2xl px-6 py-4 shadow-sm">
          <span className="text-sm font-bold text-gray-700">
            Daily Entry Tickets:
          </span>
          <span className="bg-indigo-50 border border-indigo-100 text-indigo-750 text-xs font-black px-3.5 py-1.5 rounded-full">
            {boardStatus ? boardStatus.entriesRemaining : 1} Remaining
          </span>
        </div>

        {/* Race Entries List */}
        <div className="flex flex-col gap-4">
          {board.entries.map((entry) => {
            const isCompleted =
              boardStatus?.completedEntryId === entry.scenario.id;
            const isSelected =
              boardStatus?.selectedEntryId === entry.scenario.id;
            const isLocked =
              !isCompleted &&
              !isSelected &&
              boardStatus?.entriesRemaining === 0;

            let buttonText = "Choose Race";
            let buttonStyle = "bg-blue-600 hover:bg-blue-700 text-white";

            if (isCompleted) {
              buttonText = "✓ Completed";
              buttonStyle =
                "bg-emerald-50 text-emerald-700 border-2 border-emerald-200 cursor-not-allowed";
            } else if (isSelected) {
              buttonText = "Resume Race →";
              buttonStyle =
                "bg-indigo-600 hover:bg-indigo-700 text-white animate-pulse";
            } else if (isLocked) {
              buttonText = "🔒 Locked";
              buttonStyle =
                "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200";
            }

            return (
              <div
                key={entry.id}
                className={`bg-white rounded-3xl border-2 border-[#E5E7EB] shadow-sm p-6 flex flex-col gap-4 transition-all duration-205 ${
                  isLocked
                    ? "opacity-60"
                    : "hover:border-blue-500/50 hover:shadow-md"
                }`}
              >
                {/* Badges */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${getCategoryColor(
                        entry.category,
                      )}`}
                    >
                      {entry.category}
                    </span>
                    <span className="text-[10px] font-bold text-gray-450 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1">
                      {entry.surface.toUpperCase()}
                    </span>
                  </div>
                  {renderStars(entry.difficulty)}
                </div>

                {/* Main Content */}
                <div>
                  <h3 className="text-lg font-black text-gray-900 font-heading leading-tight mb-1">
                    {entry.title.en}
                  </h3>
                  <p className="text-xs text-gray-550 leading-relaxed">
                    Run a {entry.distance}km course with a target time of{" "}
                    {formatTargetTime(entry.scenario.objective.targetTime)}.
                  </p>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-2 bg-gray-50/50 rounded-2xl p-3 text-center text-xs">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold">
                      Distance
                    </span>
                    <span className="font-bold text-gray-800">
                      {entry.distance} KM
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 border-l border-gray-200">
                    <span className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold">
                      Target Time
                    </span>
                    <span className="font-bold text-gray-800">
                      {formatTargetTime(entry.scenario.objective.targetTime)}
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  type="button"
                  disabled={isCompleted || isLocked}
                  onClick={() => handleSelectRace(entry)}
                  className={`w-full font-bold text-sm py-3.5 rounded-full transition-all duration-200 ${buttonStyle}`}
                >
                  {buttonText}
                </button>
              </div>
            );
          })}
        </div>

        {/* Player ID (dev helper) */}
        {player && (
          <p className="text-xs text-center text-gray-300 select-all">
            ID: {player.id.slice(0, 8)}
          </p>
        )}
      </main>
    </div>
  );
}
