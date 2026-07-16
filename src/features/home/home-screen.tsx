"use client";

import { motion } from "framer-motion";
import { Settings, Share2, Sparkles } from "lucide-react";
import { GameClock } from "@/components/ui/game-clock";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DailyStatsCard } from "@/components/share/daily-stats-card";
import { ShareModal } from "@/components/share/share-modal";
import { useSound } from "@/hooks/use-sound";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";
import { useRunnerStore } from "@/runner/runner-store";
import { useSocialStore } from "@/social/social-store";
import { storageRepository } from "@/storage/storage-repository";
import type { StoredDailyBoard } from "@/storage/types"; // Still needed for now, but will be phased out
import { useGameStore } from "@/store/game-store";
import { usePlayerStore } from "@/store/player-store";
import { useSettingsStore } from "@/store/settings-store";
import { useTrainingStore } from "@/training/training-store";
import { useTimelineStore } from "@/store/timeline-store";

// New Sprint 26 Imports
import { RaceCalendar } from "@/components/scheduling/race-calendar";
import { RaceEntryModal } from "@/components/scheduling/race-entry-modal";
import { getTodaysRaces, getUpcomingRaces, completeRace, registerForRace } from "@/scheduling/race-calendar-engine";
import { validateRaceEntry, processRaceEntry } from "@/economy/race-entry-engine";
import type { RaceOccurrence } from "@/scheduling/race-calendar-types";
import type { EntryValidation } from "@/economy/race-entry-engine";
import { earnAchievementBonus, earnRacePrize, earnChampionshipBonus } from "@/economy/earning-engine";
import { getScheduleById } from "@/scheduling/race-calendar-engine";
import { isChampionship } from "@/scheduling/race-schedule-database";
import type { DailyChallenge } from "@/types/engine";

export function HomeScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const lang = (language === "id" ? "id" : "en") as "en" | "id";

  const player = usePlayerStore((state) => state.player);
  const { setChallenge } = useGameStore();
  const { settings } = useSettingsStore();
  const { playSound } = useSound();
  const { runnerState, setRunnerState } = useRunnerStore();
  const { trainingState } = useTrainingStore();

  // Access game state from timeline store (Sprint 23)
  const gameState = useTimelineStore((state) => state.gameState);
  const setGameState = useTimelineStore((state) => state.setGameState);
  const doAction = useTimelineStore((state) => state.doAction);

  // Derived values from gameState
  const currentDayIndex = gameState?.dayIndex ?? 0;
  const currentBalance = gameState?.economy.currentBalance ?? 0;

  // New state for Race Calendar and Entry Modal
  const [selectedRaceOccurrence, setSelectedRaceOccurrence] = useState<RaceOccurrence | null>(null);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [entryValidation, setEntryValidation] = useState<EntryValidation | null>(null);

  const recentRivalActivities = useSocialStore(
    (s) =>
      s.rivalActivities.filter(
        (a) => a.timestamp === "Just now" || a.timestamp === "2h ago",
      ).length,
  );

  // Quest claiming (updated to remove coins and only affect XP)
  const claimQuest = (questId: string) => {
    if (!runnerState || !gameState) return;
    const profile = runnerState.profile;
    const claims = profile.questClaims || {};
    if (claims[questId] === currentDayIndex.toString()) return; // Use dayIndex for daily quests

    const xpGained = 50;

    let xp = (profile.xp || 0) + xpGained;
    let level = profile.level || 1;
    let skillPoints = profile.skillPoints || 0;
    let xpNeeded = level * 100;
    while (xp >= xpNeeded) {
      xp -= xpNeeded;
      level += 1;
      skillPoints += 3;
      xpNeeded = level * 100;
    }

    const updatedProfile = {
      ...profile,
      xp,
      level,
      skillPoints,
      questClaims: {
        ...claims,
        [questId]: currentDayIndex.toString(),
      },
    };

    setRunnerState({
      ...runnerState,
      profile: updatedProfile,
      lastUpdated: new Date().toISOString(),
    });

    // Money is now handled by economy engine
    // If quests should give money, call earnAchievementBonus here.
    // Example: earnAchievementBonus(gameState.economy, gameState, `Quest: ${questId}`);

    playSound("success");
  };

  const [isShareOpen, setIsShareOpen] = useState(false);

  const shareTitle = t("share.stats.title" as TranslationKey);
  const shareText = `📊 RunQuest — ${t("share.stats.title" as TranslationKey)}:\n🏃 Runner #${player?.id.slice(0, 8).toUpperCase()}\n\n🔥 Streak: ${player?.statistics.currentStreak} Days\n⚡ Total Runs: ${player?.statistics.totalRuns}\n📏 Total Distance: ${player?.statistics.totalDistance} km\n⭐ Perfect Runs: ${player?.statistics.perfectRuns || 0}\n\n${t("share.stats.cta" as TranslationKey)} https://runquest.game`;

  // Daily race board status is now more for internal tracking and will be phased out
  const todayStr = currentDayIndex.toString();
  const [boardStatus, setBoardStatus] = useState<StoredDailyBoard | null>(null);

  useEffect(() => {
    // This old board status is still here for compatibility but its logic will be superseded by schedulingState
    let status = storageRepository.loadDailyBoard();
    if (!status || status.boardId !== todayStr) {
      status = {
        version: 1,
        boardId: todayStr,
        entriesRemaining: 0, // No longer directly used for race availability
        selectedEntryId: null,
        completedEntryId: null,
      };
      storageRepository.saveDailyBoard(status);
    }
    setBoardStatus(status);
  }, [todayStr]);

  // New: Get races from scheduling engine
  const todaysRaces = gameState ? getTodaysRaces(gameState.scheduling, gameState, currentDayIndex) : [];
  const upcomingRaces = gameState ? getUpcomingRaces(gameState.scheduling, currentDayIndex) : [];

  // Handle race selection from calendar
  const handleRaceSelect = (race: RaceOccurrence) => {
    if (!gameState) return;
    const validation = validateRaceEntry(gameState.economy, gameState, race.tier, race.prerequisites);
    setEntryValidation(validation);
    setSelectedRaceOccurrence(race);
    setIsEntryModalOpen(true);
  };

  // Handle confirmation from RaceEntryModal
  const handleConfirmRaceEntry = () => {
    if (!gameState || !selectedRaceOccurrence || !entryValidation?.canEnter) return;

    const { economy: updatedEconomy, gameState: newGameStateFromProcess, success } = processRaceEntry(
      gameState.economy,
      gameState,
      selectedRaceOccurrence.tier,
      selectedRaceOccurrence.name,
      selectedRaceOccurrence.prerequisites
    );

    if (success) {
      // Update global game state with new economy and energy
      setGameState({ ...newGameStateFromProcess, economy: updatedEconomy });

      // Register for the race in scheduling state
      const updatedScheduling = registerForRace(newGameStateFromProcess.scheduling, selectedRaceOccurrence.scheduleId, currentDayIndex);
      setGameState(prev => ({ ...prev!, scheduling: updatedScheduling }));

      // This doAction("compete") now only deducts energy, money is handled by processRaceEntry
      // It's still here if there are other side effects for 'compete' action in timeline.ts
      doAction("compete"); 

      // Set challenge for briefing screen - need to adapt RaceOccurrence to DailyChallenge
      // We'll create a DailyChallenge (Scenario) object from RaceOccurrence details.
      const raceSchedule = getScheduleById(selectedRaceOccurrence.scheduleId); // Get full schedule details

      const scenarioForBriefing: DailyChallenge = {
        id: selectedRaceOccurrence.raceId,
        date: new Date().toISOString(), // Use current date for now
        environment: { 
          weather: "sunny", // Placeholder, could derive from location/schedule
          temperature: 20,
          humidity: 50,
          wind: { direction: "north", speed: 10 },
          timeOfDay: "morning",
        },
        race: { 
          title: { en: selectedRaceOccurrence.name, id: selectedRaceOccurrence.name },
          description: { en: selectedRaceOccurrence.description, id: selectedRaceOccurrence.description },
          distance: 5, // Placeholder - needs actual distance from raceId
          surface: "road", // Placeholder - needs actual surface from raceId
          elevation: "flat", // Placeholder
          checkpoints: [],
        },
        objective: { targetTime: 1800 }, // Placeholder for targetTime
        storySeed: { mood: "competitive" }, // Placeholder
        
        // New Sprint 26 properties from RaceOccurrence
        tier: selectedRaceOccurrence.tier,
        entryFee: selectedRaceOccurrence.entryFee,
        scheduleId: selectedRaceOccurrence.scheduleId,
        // isChampionship derived from schedule tier
        isChampionship: isChampionship(raceSchedule!), // Use helper to determine championship status
        totalEntrants: selectedRaceOccurrence.entrants, 
        prerequisites: selectedRaceOccurrence.prerequisites,
      };

      setChallenge(scenarioForBriefing);
      router.push("/briefing");
    } else {
      console.error("Race entry failed despite validation indicating success.");
      // Potentially show an in-game error message to the player
    }
    setIsEntryModalOpen(false);
    setSelectedRaceOccurrence(null);
  };

  const handleCancelRaceEntry = () => {
    setIsEntryModalOpen(false);
    setSelectedRaceOccurrence(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="min-h-screen bg-background flex flex-col pb-12"
    >
      {/* Header */}
      <header className="px-6 pt-10 pb-4 flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-1">
            RunQuest
          </p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-heading">
            {t("home.title" as TranslationKey)}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t("home.subtitle" as TranslationKey)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            playSound("click");
            router.push("/settings");
          }}
          className="rounded-full p-2.5 bg-white dark:bg-slate-900 border-2 border-[#E5E7EB] dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 shadow-sm transition-all active:scale-95 mt-2"
          aria-label="Settings"
        >
          <Settings className="h-5 w-5" />
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 px-6 py-4 flex flex-col gap-6">
        <GameClock />

        {/* Player Stats Panel (Updated to show Money) */}
        {player && gameState && (
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-[2rem] p-6 text-white shadow-md flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-blue-200 uppercase tracking-wider font-semibold">
                    {t("home.player_profile" as TranslationKey)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      playSound("click");
                      setIsShareOpen(true);
                    }}
                    className="p-1 rounded-full hover:bg-white/10 text-blue-200 hover:text-white transition active:scale-90"
                    aria-label="Share career stats"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <span className="text-lg font-bold font-heading">
                  {player.name ||
                    `Runner #${player.id.slice(0, 5).toUpperCase()}`}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playSound("click");
                    router.push("/training");
                  }}
                  className="inline-flex items-center gap-1.5 self-start text-[10px] uppercase font-bold tracking-wider bg-white/10 hover:bg-white/20 active:scale-95 px-3 py-1 rounded-full transition-all border border-white/10"
                >
                  {t("home.daily_training" as TranslationKey)} →
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playSound("click");
                    router.push("/profile");
                  }}
                  className="inline-flex items-center gap-1.5 self-start text-[10px] uppercase font-bold tracking-wider bg-white/10 hover:bg-white/20 active:scale-95 px-3 py-1 rounded-full transition-all border border-white/10"
                >
                  {t("home.runner_profile" as TranslationKey)} →
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playSound("click");
                    router.push("/social");
                  }}
                  className="inline-flex items-center gap-1.5 self-start text-[10px] uppercase font-bold tracking-wider bg-white/10 hover:bg-white/20 active:scale-95 px-3 py-1 rounded-full transition-all border border-white/10 relative"
                >
                  Social Hub →
                  {recentRivalActivities > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-4 min-w-[16px] px-1 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center shadow-md shadow-rose-500/30 animate-pulse">
                      {recentRivalActivities}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playSound("click");
                    router.push("/history");
                  }}
                  className="inline-flex items-center gap-1.5 self-start text-[10px] uppercase font-bold tracking-wider bg-white/10 hover:bg-white/20 active:scale-95 px-3 py-1 rounded-full transition-all border border-white/10"
                >
                  {t("history.title" as TranslationKey)} →
                </button>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <span className="text-xs text-blue-200 uppercase font-medium">
                  {t("home.stats.money" as TranslationKey)}
                </span>
                <span className="text-xl font-bold flex items-center gap-1 mt-0.5">
                  💰 {currentBalance}
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

        {/* Race Calendar */}
        {gameState && (
          <RaceCalendar
            todayRaces={todaysRaces}
            upcomingRaces={upcomingRaces}
            onRaceClick={handleRaceSelect}
          />
        )}

        {/* Race Entry Modal */}
        {isEntryModalOpen && selectedRaceOccurrence && entryValidation && (
          <RaceEntryModal
            race={selectedRaceOccurrence}
            validation={entryValidation}
            currentBalance={currentBalance}
            onConfirm={handleConfirmRaceEntry}
            onCancel={handleCancelRaceEntry}
          />
        )}

        {/* Player ID (dev helper) */}
        {player && (
          <p className="text-xs text-center text-gray-300 select-all">
            ID: {player.id.slice(0, 8)}
          </p>
        )}

        {/* Navigation to new economy/sponsorship pages */}
        <div className="flex justify-center gap-4 mt-4">
          <button
            type="button"
            onClick={() => {
              playSound("click");
              router.push("/economy");
            }}
            className="text-xs uppercase font-bold tracking-wider text-blue-400 hover:text-blue-300 transition-colors"
          >
            💰 Economy
          </button>
          <button
            type="button"
            onClick={() => {
              playSound("click");
              router.push("/sponsors");
            }}
            className="text-xs uppercase font-bold tracking-wider text-purple-400 hover:text-purple-300 transition-colors"
          >
            🤝 Sponsors
          </button>
        </div>
      </main>

      {player && (
        <ShareModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          shareText={shareText}
          shareTitle={shareTitle}
          fileName={`runquest-stats-${player.id.slice(0, 8)}.png`}
        >
          <DailyStatsCard
            player={player}
            lang={language as "en" | "id"}
            date={currentDayIndex.toString()}
          />
        </ShareModal>
      )}
    </motion.div>
  );
}
