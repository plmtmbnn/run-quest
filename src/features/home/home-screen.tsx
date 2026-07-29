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
import { GameStats } from "@/components/ui/game-clock";
import { RestControls } from "@/components/ui/rest-controls";
import { HealthStatusWidget } from "@/components/health/health-status-widget";
import { ExpenseWidget } from "@/components/home/expense-widget";
import { ProductTour } from "@/components/tour/product-tour";
// Sprint 33 Imports
import { RaceDayAlert } from "@/components/alerts/race-day-alert";
import { getCountryByCode } from "@/config/countries-data";
import { formatCurrency } from "@/economy/currency-converter";
import { formatCompact } from "@/utils/format-compact";
import { generateRaceChallenge } from "@/services/challenge/generator";
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
import { generateCoachRecommendation } from "@/training/coach-recommendation";
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

  // Sprint 33: Race Day Alert State
  const [showRaceAlert, setShowRaceAlert] = useState(false);
  const [todaysRace, setTodaysRace] = useState<RaceOccurrence | null>(null);

  // Tour State
  const [runTour, setRunTour] = useState(false);

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

  // Sprint 33: Check for race day alerts
  useEffect(() => {
    if (!gameState) return;
    
    const racesToday = getTodaysRaces(gameState.scheduling, gameState, currentDayIndex);
    
    if (racesToday.length > 0) {
      const alertKey = `race_alert_shown_${currentDayIndex}`;
      const hasShown = localStorage.getItem(alertKey);
      
      if (!hasShown) {
        setTodaysRace(racesToday[0]);
        setShowRaceAlert(true);
      }
    }
  }, [gameState, currentDayIndex]);

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
        const raceSchedule = getScheduleById(selectedRaceOccurrence.scheduleId);

        // Determine surface and elevation based on race name/description
        // Trail races typically have "trail" in the ID or name
        const isTrailRace = 
          selectedRaceOccurrence.scheduleId.toLowerCase().includes("trail") ||
          selectedRaceOccurrence.name.toLowerCase().includes("trail") ||
          selectedRaceOccurrence.description.toLowerCase().includes("trail");
        
        const surface = isTrailRace ? "trail" : "road";
        
        // Determine elevation from race characteristics
        const hasHills = 
          selectedRaceOccurrence.name.toLowerCase().includes("hill") ||
          selectedRaceOccurrence.description.toLowerCase().includes("hill") ||
          selectedRaceOccurrence.description.toLowerCase().includes("climb") ||
          selectedRaceOccurrence.description.toLowerCase().includes("elevation");
        
        const hasMountain = 
          selectedRaceOccurrence.description.toLowerCase().includes("mountain") ||
          selectedRaceOccurrence.description.toLowerCase().includes("summit") ||
          selectedRaceOccurrence.description.toLowerCase().includes("peak");
        
        const elevation = hasMountain ? "hilly" : hasHills ? "rolling" : "flat";

        // Generate race challenge with dynamic weather based on race parameters
        const scenarioForBriefing = generateRaceChallenge({
          scheduleId: selectedRaceOccurrence.scheduleId,
          dayIndex: currentDayIndex,
          distance: actualDistance,
          surface,
          elevation,
          tier: selectedRaceOccurrence.tier,
          raceName: {
            en: raceNameWithCategory,
            id: raceNameWithCategory,
          },
          entryFee: actualFee,
          region: selectedRaceOccurrence.locationId,
          routeProfileId: selectedRaceOccurrence.routeProfileId,
        });

        // Add additional properties that aren't in the base scenario
        const enrichedScenario: DailyChallenge = {
          ...scenarioForBriefing,
          isChampionship: isChampionship(raceSchedule!),
          totalEntrants: actualMaxEntrants,
          prerequisites: selectedRaceOccurrence.prerequisites,
        };

        setChallenge(enrichedScenario);
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

  const { currentWeeklyPlan } = useTrainingStore();
  const todaysActivity = currentWeeklyPlan?.plannedActivities.find(
    (pa) => pa.dayIndex === currentDayIndex
  );
  const coachTip = generateCoachRecommendation(currentDayIndex, registeredRaces);

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
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5 md:mt-1 truncate">
            {t("home.subtitle" as TranslationKey)}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              playSound("click");
              setRunTour(true);
            }}
            className={`rounded-full min-h-[44px] px-3.5 bg-amber-500/10 dark:bg-amber-500/20 border-2 border-amber-400/50 dark:border-amber-500/40 hover:bg-amber-500/20 dark:hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 ${
              (player?.statistics?.totalRuns ?? 0) === 0 ? "animate-pulse ring-2 ring-amber-400/50" : ""
            }`}
            aria-label="Start Tour"
            title="Start Feature Tour"
          >
            <span className="text-sm">🧭</span>
            <span>{t("tour.button" as TranslationKey)}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              playSound("click");
              router.push("/settings");
            }}
            className="rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center p-2 md:p-2.5 bg-white dark:bg-slate-900 border-2 border-[#E5E7EB] dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 shadow-sm transition-all active:scale-95 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
            aria-label={t("settings.title" as TranslationKey)}
          >
            <Settings className="h-4.5 w-4.5 md:h-5 md:w-5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 px-4 md:px-6 py-3 md:py-4 flex flex-col gap-4 md:gap-6">
        <div id="tour-game-stats">
          <GameStats />
        </div>
        <div id="tour-health-status">
          <HealthStatusWidget />
        </div>
        <div id="tour-expenses">
          <ExpenseWidget />
        </div>

        {/* Today's Training Card & Coach Tip */}
        {todaysActivity && (
          <div id="tour-daily-training" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl md:rounded-[2rem] p-4 md:p-5 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-lg shadow-sm">
                  🏃
                </div>
                <div>
                  <h3 className="font-heading font-black text-sm text-slate-800 dark:text-white">
                    {t("home.todays_training" as TranslationKey)}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {todaysActivity.isCompleted ? t("home.training_completed" as TranslationKey) : t("home.training_scheduled" as TranslationKey)}
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-lg">
                ⚡ {todaysActivity.energyCost} EP
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-800 dark:text-white">
                {todaysActivity.activity}
              </span>
              <button
                type="button"
                onClick={() => {
                  playSound("click");
                  router.push("/training");
                }}
                className="px-3.5 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-500/20 active:scale-95"
              >
                {todaysActivity.isCompleted ? t("home.view_training_plan" as TranslationKey) : `${t("training.start_workout" as TranslationKey)} →`}
              </button>
            </div>

            {coachTip && (
              <div className="mt-1 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2 border border-slate-100 dark:border-slate-800">
                <span className="text-base shrink-0">💡</span>
                <div>
                  <span className="font-bold text-slate-800 dark:text-white block">{t("home.coach_tip" as TranslationKey)}:</span>
                  <span>{coachTip.message}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Player Stats Panel (Enhanced Athlete Card) */}
        {player && gameState && (
          <div className="bg-gradient-to-br from-orange-500 via-amber-600 to-orange-600 rounded-2xl md:rounded-[2rem] p-4 sm:p-5 md:p-6 text-white shadow-xl shadow-orange-500/20 flex flex-col gap-4 md:gap-5 relative overflow-hidden">
            {/* Decorative Glow Blobs */}
            <div className="absolute top-0 right-0 w-40 h-40 md:w-56 md:h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 md:w-40 md:h-40 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col gap-4 min-w-0 w-full relative z-10">
              {/* Header: Flag, Name, Level & Share */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-xl shrink-0 shadow-inner">
                    {getCountryByCode(player.nationality || "ID").flag}
                  </div>
                  <div className="min-w-0 flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-orange-100 uppercase tracking-widest font-black">
                        {t("home.player_profile" as TranslationKey)}
                      </span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                        Lvl {runnerState?.profile?.level || 1}
                      </span>
                    </div>
                    <span className="text-lg md:text-xl font-black font-heading truncate drop-shadow-sm">
                      {player.name || `Runner #${player.id.slice(0, 5).toUpperCase()}`}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playSound("click");
                    setIsShareOpen(true);
                  }}
                  className="flex items-center justify-center min-h-[44px] min-w-[44px] p-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white transition active:scale-95 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 shadow-sm"
                  aria-label={t("share.stats.title" as TranslationKey)}
                  title={t("share.stats.title" as TranslationKey)}
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>

              {/* XP Progress Bar */}
              {runnerState?.profile && (
                <div className="flex flex-col gap-1.5 bg-black/10 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
                  <div className="flex justify-between items-center text-[11px] font-black">
                    <span className="text-orange-100 flex items-center gap-1">
                      <span>⚡ XP Progress</span>
                    </span>
                    <span className="font-mono text-white">
                      {runnerState.profile.xp || 0} / {(runnerState.profile.level || 1) * 100} XP
                      {Boolean(runnerState.profile.skillPoints) && (
                        <span className="ml-2 px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-900 font-extrabold text-[9px]">
                          🌟 {runnerState.profile.skillPoints} SP
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-amber-300 to-yellow-100 rounded-full transition-all duration-500 shadow-sm"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            ((runnerState.profile.xp || 0) /
                              ((runnerState.profile.level || 1) * 100)) *
                              100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Quick Athlete Mini-Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10 flex flex-col">
                  <span className="text-[9px] uppercase font-bold text-orange-100 tracking-wider">
                    {t("home.stats.runs" as TranslationKey) || "Races"}
                  </span>
                  <span className="font-mono font-black text-sm md:text-base mt-0.5 text-white">
                    🏃 {formatCompact(player.statistics.totalRuns || 0)}
                  </span>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10 flex flex-col">
                  <span className="text-[9px] uppercase font-bold text-orange-100 tracking-wider">
                    {t("home.stats.streak" as TranslationKey) || "Streak"}
                  </span>
                  <span className="font-mono font-black text-sm md:text-base mt-0.5 text-white">
                    🔥 {player.statistics.currentStreak || 0}d
                  </span>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10 flex flex-col">
                  <span className="text-[9px] uppercase font-bold text-orange-100 tracking-wider">
                    {t("home.stats.distance" as TranslationKey) || "Distance"}
                  </span>
                  <span className="font-mono font-black text-sm md:text-base mt-0.5 text-white">
                    📏 {formatCompact(player.statistics.totalDistance || 0)} km
                  </span>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10 flex flex-col">
                  <span className="text-[9px] uppercase font-bold text-orange-100 tracking-wider">
                    {t("home.stats.rating" as TranslationKey) || "Rating / Wins"}
                  </span>
                  <span className="font-mono font-black text-sm md:text-base mt-0.5 text-white truncate">
                    🏆 {formatCompact((gameState.flags?.rating as number) ?? 1500)} <span className="opacity-75 text-[10px]">({gameState.flags?.career_wins || 0}W)</span>
                  </span>
                </div>
              </div>

              {/* Categorized Quick Navigation Bar */}
              <nav
                aria-label="Quick navigation"
                className="flex flex-wrap gap-1.5 pt-1"
              >
                <button
                  type="button"
                  onClick={() => {
                    playSound("click");
                    router.push("/training");
                  }}
                  aria-label={t("home.daily_training" as TranslationKey)}
                  className="inline-flex items-center gap-1.5 text-[10px] uppercase font-black tracking-wider bg-white/15 hover:bg-white/25 active:scale-95 px-3 py-2 rounded-xl transition-all border border-white/15 min-h-[38px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  🏃 {t("home.daily_training" as TranslationKey)} →
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playSound("click");
                    router.push("/profile");
                  }}
                  aria-label={t("home.runner_profile" as TranslationKey)}
                  className="inline-flex items-center gap-1.5 text-[10px] uppercase font-black tracking-wider bg-white/15 hover:bg-white/25 active:scale-95 px-3 py-2 rounded-xl transition-all border border-white/15 min-h-[38px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  👤 {t("home.runner_profile" as TranslationKey)} →
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playSound("click");
                    router.push("/social");
                  }}
                  aria-label={t("nav.social" as TranslationKey)}
                  className="inline-flex items-center gap-1.5 text-[10px] uppercase font-black tracking-wider bg-white/15 hover:bg-white/25 active:scale-95 px-3 py-2 rounded-xl transition-all border border-white/15 relative min-h-[38px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  💬 {t("nav.social" as TranslationKey)} →
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
                  className="inline-flex items-center gap-1.5 text-[10px] uppercase font-black tracking-wider bg-white/15 hover:bg-white/25 active:scale-95 px-3 py-2 rounded-xl transition-all border border-white/15 min-h-[38px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  📜 {t("history.title" as TranslationKey)} →
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playSound("click");
                    router.push("/shop");
                  }}
                  aria-label={t("nav.shop" as TranslationKey)}
                  className="inline-flex items-center gap-1.5 text-[10px] uppercase font-black tracking-wider bg-blue-500/30 hover:bg-blue-500/40 active:scale-95 px-3 py-2 rounded-xl transition-all border border-blue-400/40 min-h-[38px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
                >
                  🏪 {t("nav.shop" as TranslationKey)} →
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playSound("click");
                    router.push("/economy");
                  }}
                  aria-label={t("nav.economy" as TranslationKey)}
                  className="inline-flex items-center gap-1.5 text-[10px] uppercase font-black tracking-wider bg-white/15 hover:bg-white/25 active:scale-95 px-3 py-2 rounded-xl transition-all border border-white/15 min-h-[38px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  💰 {t("nav.economy" as TranslationKey)} →
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playSound("click");
                    router.push("/sponsors");
                  }}
                  aria-label={t("sponsors.title" as TranslationKey)}
                  className="inline-flex items-center gap-1.5 text-[10px] uppercase font-black tracking-wider bg-white/15 hover:bg-white/25 active:scale-95 px-3 py-2 rounded-xl transition-all border border-white/15 relative min-h-[38px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  🤝 {t("sponsors.title" as TranslationKey)} →
                  {(gameState?.sponsorship?.pendingOffers?.length ?? 0) > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-4 min-w-[16px] px-1 bg-purple-500 text-white text-[8px] font-black rounded-full flex items-center justify-center shadow-md shadow-purple-500/30 animate-pulse">
                      {gameState?.sponsorship?.pendingOffers?.length ?? 0}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playSound("click");
                    router.push("/how-to-play");
                  }}
                  aria-label={t("how_to_play.title" as TranslationKey)}
                  className="inline-flex items-center gap-1.5 text-[10px] uppercase font-black tracking-wider bg-indigo-500/30 hover:bg-indigo-500/40 active:scale-95 px-3 py-2 rounded-xl transition-all border border-indigo-400/40 min-h-[38px] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
                >
                  📖 {t("how_to_play.title" as TranslationKey)} →
                </button>

                {(player?.statistics?.totalRuns ?? 0) === 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      playSound("click");
                      setRunTour(true);
                    }}
                    aria-label="Start Tour"
                    className="inline-flex items-center gap-1.5 text-[10px] uppercase font-black tracking-wider bg-amber-500/30 hover:bg-amber-500/40 active:scale-95 px-3 py-2 rounded-xl transition-all border border-amber-400/40 min-h-[38px] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 animate-pulse"
                  >
                    🧭 {t("tour.button" as TranslationKey)}
                  </button>
                )}
              </nav>
            </div>
          </div>
        )}

        {/* Race Calendar */}
        {gameState && (
          <div id="tour-race-calendar">
            <RaceCalendar
              todayRaces={todaysRaces}
              upcomingRaces={upcomingRaces}
              registeredRaces={registeredRaces}
              onRaceClick={handleRaceSelect}
            />
          </div>
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
          <p className="text-xs text-center text-gray-300 dark:text-gray-500 select-all">
            {t("home.player_id" as TranslationKey)}: {player.id.slice(0, 8)}
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
      <div id="tour-rest-controls">
        <RestControls />
      </div>

      {/* Sprint 33: Race Day Alert */}
      {todaysRace && (
        <RaceDayAlert
          isOpen={showRaceAlert}
          onClose={() => {
            setShowRaceAlert(false);
            localStorage.setItem(`race_alert_shown_${currentDayIndex}`, 'true');
          }}
          raceTitle={todaysRace.name}
          raceDistance={todaysRace.categories?.[0]?.distance || 5}
          autoCloseDelay={5000}
        />
      )}

      {/* Product Tour */}
      <ProductTour run={runTour} onFinish={() => setRunTour(false)} />
    </motion.div>
  );
}
