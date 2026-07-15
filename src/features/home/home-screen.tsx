"use client";

import dayjs from "dayjs";
import { motion } from "framer-motion";
import { Settings, Share2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DailyStatsCard } from "@/components/share/daily-stats-card";
import { ShareModal } from "@/components/share/share-modal";
import { useSound } from "@/hooks/use-sound";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";
import { useRunnerStore } from "@/runner/runner-store";
import { generateDailyRaceBoard } from "@/services/challenge/generator";
import { useSocialStore } from "@/social/social-store";
import { storageRepository } from "@/storage/storage-repository";
import type { StoredDailyBoard } from "@/storage/types";
import { useGameStore } from "@/store/game-store";
import { usePlayerStore } from "@/store/player-store";
import { useSettingsStore } from "@/store/settings-store";
import { useTrainingStore } from "@/training/training-store";
import type { RaceEntry } from "@/types/engine";
import { useTimelineStore } from "@/store/timeline-store";

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
  const dayIndex = useTimelineStore((state) => state.gameState?.dayIndex ?? 0);
  const recentRivalActivities = useSocialStore(
    (s) =>
      s.rivalActivities.filter(
        (a) => a.timestamp === "Just now" || a.timestamp === "2h ago",
      ).length,
  );

  const claimQuest = (questId: string) => {
    const profile = runnerState.profile;
    const claims = profile.questClaims || {};
    if (claims[questId] === todayStr) return;

    const coinsGained = 50;
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
      coins: (profile.coins || 0) + coinsGained,
      xp,
      level,
      skillPoints,
      questClaims: {
        ...claims,
        [questId]: todayStr,
      },
    };

    setRunnerState({
      ...runnerState,
      profile: updatedProfile,
      lastUpdated: new Date().toISOString(),
    });

    playSound("success");
  };

  const [isShareOpen, setIsShareOpen] = useState(false);

  const shareTitle = t("share.stats.title" as TranslationKey);
  const shareText = `📊 RunQuest — ${t("share.stats.title" as TranslationKey)}:
🏃 Runner #${player?.id.slice(0, 8).toUpperCase()}

🔥 Streak: ${player?.statistics.currentStreak} Days
⚡ Total Runs: ${player?.statistics.totalRuns}
📏 Total Distance: ${player?.statistics.totalDistance} km
⭐ Perfect Runs: ${player?.statistics.perfectRuns || 0}

${t("share.stats.cta" as TranslationKey)} https://runquest.game`;

  const todayStr = dayjs().format("YYYY-MM-DD");
  const board = generateDailyRaceBoard(todayStr);

  const [boardStatus, setBoardStatus] = useState<StoredDailyBoard | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

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

  // Countdown timer logic
  useEffect(() => {
    const getSecondsUntilMidnight = () => {
      const now = new Date();
      const midnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        0,
      );
      return Math.max(
        0,
        Math.floor((midnight.getTime() - now.getTime()) / 1000),
      );
    };

    setSecondsLeft(getSecondsUntilMidnight());

    const timer = setInterval(() => {
      setSecondsLeft(getSecondsUntilMidnight());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

    playSound("click");
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

  const formatCountdown = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
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

  const getPreferenceScore = (entry: RaceEntry) => {
    let score = 0;
    const { preferredSurface, preferredDistance } = settings.preferences;

    if (preferredSurface !== "any" && entry.surface === preferredSurface) {
      score += 1;
    }

    if (preferredDistance !== "any") {
      const d = entry.distance;
      const cat = d <= 5 ? "short" : d <= 12 ? "medium" : "long";
      if (cat === preferredDistance) {
        score += 1;
      }
    }

    return score;
  };

  const hasActivePreferences =
    settings.preferences.preferredSurface !== "any" ||
    settings.preferences.preferredDistance !== "any";

  // Sort board entries (Completed first, then Active/Selected, then by Preference Score)
  const sortedEntries = [...board.entries].sort((a, b) => {
    const isCompletedA = boardStatus?.completedEntryId === a.scenario.id;
    const isCompletedB = boardStatus?.completedEntryId === b.scenario.id;
    if (isCompletedA && !isCompletedB) return -1;
    if (!isCompletedA && isCompletedB) return 1;

    const isSelectedA = boardStatus?.selectedEntryId === a.scenario.id;
    const isSelectedB = boardStatus?.selectedEntryId === b.scenario.id;
    if (isSelectedA && !isSelectedB) return -1;
    if (!isSelectedA && isSelectedB) return 1;

    const scoreA = getPreferenceScore(a);
    const scoreB = getPreferenceScore(b);
    return scoreB - scoreA;
  });

  const maxScore = Math.max(...sortedEntries.map(getPreferenceScore));
  const isBoardCompleted = boardStatus?.completedEntryId !== null;

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
            {isBoardCompleted
              ? t("home.completed" as TranslationKey)
              : t("home.title" as TranslationKey)}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isBoardCompleted
              ? t("home.completed_subtitle" as TranslationKey)
              : t("home.subtitle" as TranslationKey)}
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
        {/* Player Stats Panel */}
        {player && (
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

        {/* Countdown Timer for Daily Reset */}
        {isBoardCompleted && (
          <div className="bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-600 rounded-3xl p-6 shadow-sm flex flex-col items-center gap-3 text-center border-dashed">
            <span className="text-xs uppercase font-extrabold tracking-widest text-amber-700 bg-amber-50 px-3.5 py-1 rounded-full animate-pulse">
              {t("home.next_race_in" as TranslationKey)}
            </span>
            <span className="text-3xl font-black font-heading text-slate-850 dark:text-slate-100 tracking-tight">
              {formatCountdown(secondsLeft)}
            </span>
            <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
              {t("home.countdown_desc" as TranslationKey)}
            </p>
          </div>
        )}

        {/* Daily Theme Banner */}
        {board.theme && (
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-950/20 dark:to-orange-950/20 border-2 border-amber-500/20 dark:border-amber-500/10 rounded-3xl p-5 flex flex-col gap-1.5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-2.5 py-0.5 rounded-full">
                {lang === "id" ? "TEMA HARI INI" : "TODAY'S THEME"}
              </span>
              <h2 className="font-heading text-sm font-bold text-gray-850 dark:text-gray-200">
                {board.theme.name[lang]}
              </h2>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {board.theme.description[lang]}
            </p>
          </div>
        )}

        {/* Daily Quest Board */}
        {player && (
          <div className="bg-white dark:bg-slate-900 border-2 border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-6 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center mb-2 border-b border-[#E5E7EB] dark:border-slate-800 pb-2">
              <h2 className="font-heading text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <span>📋</span> Daily Quest Board
              </h2>
              <span className="text-xs text-gray-400 font-medium">
                Claim rewards for completing daily runs
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {[
                {
                  id: "daily_race",
                  name: "Race Completion",
                  desc: "Complete today's Daily Race challenge.",
                  completed: boardStatus?.completedEntryId !== null,
                  claimed:
                    runnerState.profile.questClaims?.daily_race === todayStr,
                  bgClass:
                    "bg-sky-50 dark:bg-sky-950/20 border-sky-100 dark:border-sky-900/30 text-sky-850 dark:text-sky-300",
                  icon: "🏃‍♂️",
                },
                {
                  id: "daily_upgrade",
                  name: "Career Upgrade",
                  desc: "Spend career points to upgrade attributes.",
                  completed:
                    runnerState.profile.speedAttr +
                      runnerState.profile.staminaAttr +
                      runnerState.profile.hydrationAttr +
                      runnerState.profile.willpowerAttr >
                    40,
                  claimed:
                    runnerState.profile.questClaims?.daily_upgrade === todayStr,
                  bgClass:
                    "bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30 text-amber-850 dark:text-amber-300",
                  icon: "⚡",
                },
                {
                  id: "daily_training",
                  name: "Daily Training",
                  desc: "Record today's training or recovery activity.",
                  completed: (trainingState.trainingHistory || []).some(
                    (day) => day.date === dayIndex,
                  ),
                  claimed:
                    runnerState.profile.questClaims?.daily_training ===
                    todayStr,
                  bgClass:
                    "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-850 dark:text-emerald-300",
                  icon: "🔋",
                },
              ].map((quest) => {
                const canClaim = quest.completed && !quest.claimed;
                return (
                  <div
                    key={quest.id}
                    className={`flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border rounded-[2rem] shadow-sm transition-all ${quest.bgClass}`}
                  >
                    <div className="flex gap-3 items-start text-center sm:text-left w-full sm:w-auto">
                      <div className="h-10 w-10 rounded-2xl bg-white/70 dark:bg-slate-900/60 flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
                        {quest.claimed ? "✅" : quest.icon}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-800 dark:text-white leading-tight">
                          {quest.name}
                        </h4>
                        <p className="text-[10px] opacity-80 mt-1 leading-normal">
                          {quest.desc}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!canClaim}
                      onClick={() => claimQuest(quest.id)}
                      className={`py-2.5 px-5 rounded-[1.5rem] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all transform active:scale-95 border w-full sm:w-auto
                        ${
                          quest.claimed
                            ? "bg-slate-200 dark:bg-slate-850 border-slate-250 dark:border-slate-800 text-slate-500 cursor-not-allowed"
                            : canClaim
                              ? "bg-orange-500 hover:bg-orange-600 border-orange-500 text-white cursor-pointer shadow-md shadow-orange-500/20"
                              : "bg-white/40 dark:bg-slate-900/30 border-white/20 dark:border-slate-800/20 text-slate-400 cursor-not-allowed opacity-50"
                        }
                      `}
                    >
                      {quest.claimed ? (
                        "Claimed"
                      ) : (
                        <>
                          <span>Claim</span>
                          <span className="font-mono text-[9px] bg-black/10 px-1.5 py-0.5 rounded-full">
                            +50 RC
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Daily Entry Tracker */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 border-2 border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] px-6 py-4 shadow-sm">
          <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
            {t("home.entry_tickets" as TranslationKey)}
          </span>
          <span className="bg-orange-50 border border-orange-100 text-orange-700 text-xs font-black px-3.5 py-1.5 rounded-full">
            {boardStatus ? boardStatus.entriesRemaining : 1}{" "}
            {t("home.remaining" as TranslationKey)}
          </span>
        </div>

        {/* Race Entries List */}
        <div className="flex flex-col gap-4">
          {sortedEntries.map((entry) => {
            const isCompleted =
              boardStatus?.completedEntryId === entry.scenario.id;
            const isSelected =
              boardStatus?.selectedEntryId === entry.scenario.id;
            const isLocked =
              !isCompleted &&
              !isSelected &&
              boardStatus?.entriesRemaining === 0;

            const score = getPreferenceScore(entry);
            const isRecommended =
              hasActivePreferences && maxScore > 0 && score === maxScore;

            const lang = language === "id" ? "id" : "en";

            let buttonText = t("home.choose_race" as TranslationKey);
            let buttonStyle =
              "bg-primary hover:bg-primary-dark text-white rounded-[1.5rem]";

            if (isCompleted) {
              buttonText = t("home.completed_badge" as TranslationKey);
              buttonStyle =
                "bg-emerald-50 text-emerald-700 border-2 border-emerald-200 rounded-[1.5rem] cursor-not-allowed";
            } else if (isSelected) {
              buttonText = t("home.resume_race" as TranslationKey);
              buttonStyle =
                "bg-orange-500 hover:bg-orange-600 text-white rounded-[1.5rem] animate-pulse shadow-md shadow-orange-500/20";
            } else if (isLocked) {
              buttonText = t("home.locked" as TranslationKey);
              buttonStyle =
                "bg-slate-100 text-slate-400 rounded-[1.5rem] border border-slate-200 cursor-not-allowed";
            }

            return (
              <div
                key={entry.id}
                className={`bg-white dark:bg-slate-900 rounded-[2rem] border-2 shadow-sm p-6 flex flex-col gap-4 transition-all duration-200 ${
                  isLocked ? "opacity-60" : "hover:shadow-md"
                } ${isRecommended ? "border-amber-300 dark:border-amber-500 ring-2 ring-amber-100 dark:ring-amber-900" : "border-[#E5E7EB] dark:border-slate-800"}`}
              >
                {/* Badges */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2 items-center">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${getCategoryColor(
                        entry.category,
                      )}`}
                    >
                      {t(
                        `challenge.surface.${entry.category}` as TranslationKey,
                      )}
                    </span>
                    {entry.surface !== entry.category && (
                      <span className="text-[10px] font-bold text-gray-450 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1">
                        {t(
                          `challenge.surface.${entry.surface}` as TranslationKey,
                        ).toUpperCase()}
                      </span>
                    )}
                    {isRecommended && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 uppercase tracking-wide">
                        <Sparkles className="h-2.5 w-2.5 text-amber-550 fill-amber-500" />{" "}
                        {t("home.recommended" as TranslationKey)}
                      </span>
                    )}
                  </div>
                  {renderStars(entry.difficulty)}
                </div>

                {/* Main Content */}
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white font-heading leading-tight mb-1">
                    {entry.title[lang]}
                  </h3>
                  <p className="text-xs text-gray-550 dark:text-gray-300 leading-relaxed">
                    {entry.scenario.race.description[lang]}
                  </p>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50/50 dark:bg-slate-800/50 rounded-[1.5rem] p-3 text-center text-xs">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold">
                      {t("history.distance" as TranslationKey)}
                    </span>
                    <span className="font-bold text-gray-800 dark:text-gray-100">
                      {entry.distance} KM
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 border-l border-slate-200 dark:border-slate-750">
                    <span className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold">
                      {t("home.target_time" as TranslationKey)}
                    </span>
                    <span className="font-bold text-gray-800 dark:text-gray-100">
                      {formatTargetTime(entry.scenario.objective.targetTime)}
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  type="button"
                  disabled={isCompleted || isLocked}
                  onClick={() => handleSelectRace(entry)}
                  className={`w-full font-bold text-sm py-3.5 rounded-[1.5rem] transition-all duration-200 ${buttonStyle}`}
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
            date={todayStr}
          />
        </ShareModal>
      )}
    </motion.div>
  );
}
