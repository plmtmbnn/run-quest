"use client";

import { motion } from "framer-motion";
import { Briefcase, Settings, Share2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  SponsorNotification,
  SponsorOfferBadge,
} from "@/components/economy/sponsor-notification";
import { WorkSelectorModal } from "@/components/economy/work-selector-modal";
// New Sprint 26 Imports
import { RaceCalendar } from "@/components/scheduling/race-calendar";
import { RaceEntryModal } from "@/components/scheduling/race-entry-modal";
import { DailyStatsCard } from "@/components/share/daily-stats-card";
import { ShareModal } from "@/components/share/share-modal";
import { GameClock } from "@/components/ui/game-clock";
import { RestControls } from "@/components/ui/rest-controls";
import { formatCurrency } from "@/economy/currency-converter";
import {
  earnAchievementBonus,
  earnChampionshipBonus,
  earnRacePrize,
} from "@/economy/earning-engine";
import type { EntryValidation } from "@/economy/race-entry-engine";
import {
  processRaceEntry,
  validateRaceEntry,
} from "@/economy/race-entry-engine";
import { SPONSORS } from "@/economy/sponsorship-types";
import type { WorkTypeId } from "@/economy/work-types";
import { getWorkTypeById } from "@/economy/work-types";
import {
  applyAction,
  createWorkAction,
  getAvailableWorkActions,
} from "@/engine/timeline/actions";
import { useSound } from "@/hooks/use-sound";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";
import { useRunnerStore } from "@/runner/runner-store";
import {
  completeRace,
  getScheduleById,
  getTodaysRaces,
  getUpcomingRaces,
  getRegisteredRaces,
  registerForRace,
} from "@/scheduling/race-calendar-engine";
import type { RaceOccurrence, CategoryId } from "@/scheduling/race-calendar-types";
import { isChampionship } from "@/scheduling/race-schedule-database";
import { useSocialStore } from "@/social/social-store";
import { storageRepository } from "@/storage/storage-repository";
import type { StoredDailyBoard } from "@/storage/types"; // Still needed for now, but will be phased out
import { useGameStore } from "@/store/game-store";
import { usePlayerStore } from "@/store/player-store";
import { useSettingsStore } from "@/store/settings-store";
import { useTimelineStore } from "@/store/timeline-store";
import { useTrainingStore } from "@/training/training-store";
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
  const [selectedRaceOccurrence, setSelectedRaceOccurrence] =
    useState<RaceOccurrence | null>(null);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [entryValidation, setEntryValidation] =
    useState<EntryValidation | null>(null);

  // Work selector modal state
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [dismissedOffers, setDismissedOffers] = useState<string[]>([]);
  const availableWorkActions = gameState
    ? getAvailableWorkActions(gameState)
    : [];

  const activeOfferId = gameState?.sponsorship?.pendingOffers?.find(
    (id) => !dismissedOffers.includes(id),
  );
  const activeOffer = activeOfferId ? SPONSORS[activeOfferId] : null;

  const handleSelectWork = (workTypeId: WorkTypeId) => {
    playSound("click");
    setIsWorkModalOpen(false);

    if (!gameState) return;

    const workType = getWorkTypeById(workTypeId);
    if (!workType) return;

    // Create work action with the selected work type
    const workAction = createWorkAction(workType);

    // Apply the action
    const nextState = applyAction(gameState, workAction);
    setGameState(nextState);
  };

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
  const todaysRaces = gameState
    ? getTodaysRaces(gameState.scheduling, gameState, currentDayIndex)
    : [];
  const upcomingRaces = gameState
    ? getUpcomingRaces(gameState.scheduling, currentDayIndex)
    : [];
  const registeredRaces = gameState
    ? getRegisteredRaces(gameState.scheduling, currentDayIndex)
    : [];

  // Handle race selection from calendar
  const handleRaceSelect = (race: RaceOccurrence) => {
    if (!gameState) return;
    
    // Sprint 29 Task 2: Prevent re-joining finished/past races
    if (race.isCompleted) {
      console.warn("Cannot start a race that has already been completed");
      return;
    }
    
    // Sprint 29 Task 2: Prevent starting races that have passed
    if (race.dayIndex < currentDayIndex) {
      console.warn("Cannot start a race from the past");
      return;
    }
    
    const onlyRegister = race.dayIndex > currentDayIndex;
    const isRegistered = race.isRegistered;
    
    // Sprint 29 Task 3: Prevent re-registering for already registered races
    if (isRegistered && onlyRegister) {
      console.warn("Already registered for this race");
      return;
    }
    
    const validation = validateRaceEntry(
      gameState.economy,
      gameState,
      race.tier,
      { ...race.prerequisites, entryFee: race.entryFee },
      { onlyRegister, isRegistered },
    );
    setEntryValidation(validation);
    setSelectedRaceOccurrence(race);
    setIsEntryModalOpen(true);
  };

  // Handle confirmation from RaceEntryModal
  const handleConfirmRaceEntry = (categoryId?: CategoryId) => {
    if (!gameState || !selectedRaceOccurrence || !entryValidation?.canEnter)
      return;

    const categories = selectedRaceOccurrence.categories ?? [];
    const selectedCategory = categories.find((c) => c.id === categoryId) ?? categories[0];

    const actualFee = selectedCategory ? selectedCategory.fee : selectedRaceOccurrence.entryFee;
    const actualDistance = selectedCategory ? selectedCategory.distance : 5;
    const actualMaxEntrants = selectedCategory?.maxEntrants ?? selectedRaceOccurrence.maxEntrants ?? 100;
    const raceNameWithCategory = selectedCategory
      ? `${selectedRaceOccurrence.name} (${selectedCategory.name})`
      : selectedRaceOccurrence.name;

    const onlyRegister = selectedRaceOccurrence.dayIndex > currentDayIndex;
    const isRegistered = selectedRaceOccurrence.isRegistered;

    const {
      economy: updatedEconomy,
      gameState: newGameStateFromProcess,
      success,
    } = processRaceEntry(
      gameState.economy,
      gameState,
      selectedRaceOccurrence.tier,
      raceNameWithCategory,
      { ...selectedRaceOccurrence.prerequisites, entryFee: actualFee },
      { onlyRegister, isRegistered, distanceInKm: actualDistance },
    );

    if (success) {
      // Update global game state with new economy and energy
      setGameState({ ...newGameStateFromProcess, economy: updatedEconomy });

      // Register for the race in scheduling state
      if (!isRegistered) {
        const updatedScheduling = registerForRace(
          newGameStateFromProcess.scheduling,
          selectedRaceOccurrence.scheduleId,
          selectedRaceOccurrence.dayIndex,
          selectedCategory?.id,
        );
        setGameState((prev) => ({ ...prev!, scheduling: updatedScheduling }));
      }

      if (onlyRegister) {
        playSound("success");
      } else {
        // Compete action energy deduction
        doAction("compete");

        const raceSchedule = getScheduleById(selectedRaceOccurrence.scheduleId);

        const scenarioForBriefing: DailyChallenge = {
          id: selectedRaceOccurrence.raceId,
          date: new Date().toISOString(),
          environment: {
            weather: "sunny",
            temperature: 20,
            humidity: 50,
            wind: { direction: "north", speed: 10 },
            timeOfDay: "morning",
          },
          race: {
            title: {
              en: raceNameWithCategory,
              id: raceNameWithCategory,
            },
            description: {
              en: selectedRaceOccurrence.description,
              id: selectedRaceOccurrence.description,
            },
            distance: actualDistance,
            surface: "road",
            elevation: "flat",
            checkpoints: [],
          },
          objective: { targetTime: Math.round(actualDistance * 300) }, // 5:00 min/km pace baseline target
          storySeed: { mood: "competitive" },

          tier: selectedRaceOccurrence.tier,
          entryFee: actualFee,
          scheduleId: selectedRaceOccurrence.scheduleId,
          isChampionship: isChampionship(raceSchedule!),
          totalEntrants: actualMaxEntrants,
          prerequisites: selectedRaceOccurrence.prerequisites,
        };

        setChallenge(scenarioForBriefing);
        router.push("/briefing");
      }
    } else {
      console.error("Race entry failed despite validation indicating success.");
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
      className="min-h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white flex flex-col pb-28 pt-[max(1rem,env(safe-area-inset-top))]"
    >
      {/* Header */}
      <header className="px-4 md:px-6 pt-6 md:pt-10 pb-3 md:pb-4 flex justify-between items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs md:text-sm font-medium text-gray-400 uppercase tracking-widest mb-1">
            RunQuest
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white font-heading truncate">
            {t("home.title" as TranslationKey)}
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1 truncate">
            {t("home.subtitle" as TranslationKey)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            playSound("click");
            router.push("/settings");
          }}
          className="rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center p-2 md:p-2.5 bg-white dark:bg-slate-900 border-2 border-[#E5E7EB] dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 shadow-sm transition-all active:scale-95 mt-2 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
          aria-label={t("settings.title" as TranslationKey)}
        >
          <Settings className="h-4.5 w-4.5 md:h-5 md:w-5" />
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 px-4 md:px-6 py-3 md:py-4 flex flex-col gap-4 md:gap-6">
        <GameClock />

        {/* Player Stats Panel (Updated to show Money) */}
        {player && gameState && (
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl md:rounded-[2rem] p-4 md:p-5 lg:p-6 text-white shadow-xl shadow-orange-500/20 flex flex-col gap-4 md:gap-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col gap-3 md:gap-3.5 min-w-0 w-full relative z-10">
              <div className="flex flex-col gap-0.5 md:gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] md:text-[10px] text-orange-100 uppercase tracking-widest font-black">
                    {t("home.player_profile" as TranslationKey)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      playSound("click");
                      setIsShareOpen(true);
                    }}
                    className="flex items-center justify-center min-h-[32px] min-w-[32px] p-1 rounded-full hover:bg-white/10 text-orange-100 hover:text-white transition active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                    aria-label={t("share.stats.title" as TranslationKey)}
                  >
                    <Share2 className="h-3 w-3 md:h-3.5 md:w-3.5" />
                  </button>
                </div>
                <span className="text-base md:text-lg lg:text-xl font-black font-heading truncate">
                  {player.name ||
                    `Runner #${player.id.slice(0, 5).toUpperCase()}`}
                </span>
              </div>
              <nav
                aria-label="Quick navigation"
                className="flex flex-wrap gap-1.5"
              >
                <button
                  type="button"
                  onClick={() => {
                    playSound("click");
                    router.push("/training");
                  }}
                  aria-label={t("home.daily_training" as TranslationKey)}
                  className="inline-flex items-center gap-1.5 self-start text-[9px] md:text-[10px] uppercase font-black tracking-wider bg-white/10 hover:bg-white/20 active:scale-95 px-2.5 md:px-3 py-2 md:py-1.5 rounded-full transition-all border border-white/10 min-h-[36px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  {t("home.daily_training" as TranslationKey)} →
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playSound("click");
                    router.push("/profile");
                  }}
                  aria-label={t("home.runner_profile" as TranslationKey)}
                  className="inline-flex items-center gap-1.5 self-start text-[10px] uppercase font-black tracking-wider bg-white/10 hover:bg-white/20 active:scale-95 px-3 py-2 md:py-1.5 rounded-full transition-all border border-white/10 min-h-[36px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  {t("home.runner_profile" as TranslationKey)} →
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playSound("click");
                    router.push("/social");
                  }}
                  aria-label="Social Hub"
                  className="inline-flex items-center gap-1.5 self-start text-[10px] uppercase font-black tracking-wider bg-white/10 hover:bg-white/20 active:scale-95 px-3 py-2 md:py-1.5 rounded-full transition-all border border-white/10 relative min-h-[36px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
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
                  aria-label={t("history.title" as TranslationKey)}
                  className="inline-flex items-center gap-1.5 self-start text-[10px] uppercase font-black tracking-wider bg-white/10 hover:bg-white/20 active:scale-95 px-3 py-2 md:py-1.5 rounded-full transition-all border border-white/10 min-h-[36px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  {t("history.title" as TranslationKey)} →
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playSound("click");
                    router.push("/economy");
                  }}
                  aria-label="Economy"
                  className="inline-flex items-center gap-1.5 self-start text-[10px] uppercase font-black tracking-wider bg-white/10 hover:bg-white/20 active:scale-95 px-3 py-2 md:py-1.5 rounded-full transition-all border border-white/10 min-h-[36px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  💰 Economy →
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playSound("click");
                    router.push("/sponsors");
                  }}
                  aria-label="Sponsors"
                  className="inline-flex items-center gap-1.5 self-start text-[10px] uppercase font-black tracking-wider bg-white/10 hover:bg-white/20 active:scale-95 px-3 py-2 md:py-1.5 rounded-full transition-all border border-white/10 relative min-h-[36px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  🤝 Sponsors →
                  {(gameState?.sponsorship?.pendingOffers?.length ?? 0) > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-4 min-w-[16px] px-1 bg-purple-500 text-white text-[8px] font-black rounded-full flex items-center justify-center shadow-md shadow-purple-500/30 animate-pulse">
                      {gameState?.sponsorship?.pendingOffers?.length ?? 0}
                    </span>
                  )}
                </button>
              </nav>
            </div>
          </div>
        )}

        {/* Race Calendar */}
        {gameState && (
          <RaceCalendar
            todayRaces={todaysRaces}
            upcomingRaces={upcomingRaces}
            registeredRaces={registeredRaces}
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

      {/* Work Selector Modal */}
      {isWorkModalOpen && gameState && (
        <WorkSelectorModal
          gameState={gameState}
          onSelectWork={handleSelectWork}
          onClose={() => setIsWorkModalOpen(false)}
        />
      )}

      {/* Sponsor Offer Notification */}
      {activeOffer && (
        <SponsorNotification
          sponsor={activeOffer}
          onView={() => {
            playSound("click");
            router.push("/sponsors");
          }}
          onDismiss={() => {
            playSound("click");
            setDismissedOffers((prev) => [...prev, activeOffer.id]);
          }}
        />
      )}

      {/* Floating Rest Controls */}
      <RestControls />
    </motion.div>
  );
}
