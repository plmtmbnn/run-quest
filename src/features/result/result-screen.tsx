"use client";

import { motion } from "framer-motion";
import { Award, BookOpen, Camera, Check, ChevronDown, ChevronUp, Clock, Copy, Home, Share2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CoachQuoteCard } from "@/components/share/coach-quote-card";
import { EventHighlightCard } from "@/components/share/event-highlight-card";
import { RaceReportCard } from "@/components/share/race-report-card";
import { ShareModal } from "@/components/share/share-modal";
import { PostRaceAnalytics } from "@/components/race/post-race-analytics";
import { EnhancedStandings } from "@/components/race/enhanced-standings";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";
import { saveRunToHistory } from "@/runner/run-history";
import { useRunnerStore } from "@/runner/runner-store";
import type { RunRecord } from "@/runner/runner-types";
import { generateDailyChallenge } from "@/services/challenge/generator";
import { analyzeRacePerformance, type RaceAnalytics } from "@/services/analytics/race-analytics";
import {
  isNewPersonalBest,
  loadGhostRun,
  saveGhostRun,
} from "@/social/ghost-engine";
import {
  applyRpChangeWithProtection,
  calculateRankPointsChange,
  getTierAndDivision,
} from "@/social/ranking-engine";
import { setPBIfFaster } from "@/runner/personal-best";
import { useSound } from "@/hooks/use-sound";
import { useSocialStore } from "@/social/social-store";
import { useGameStore } from "@/store/game-store";
import { usePlayerStore } from "@/store/player-store";
import { usePreparationStore } from "@/store/preparation-store";
import { useTimelineStore } from "@/store/timeline-store";
import type { RaceEvent } from "@/types/engine";
import { isHighlightShareable } from "@/utils/highlight-utils";
import { ScreenTour } from "@/components/tour/screen-tour";

export function ResultScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const [runTour, setRunTour] = useState(false);
  const lang = (language === "id" ? "id" : "en") as "en" | "id";
  const { playSound } = useSound();

  const { lastResult, currentChallenge, clearState } = useGameStore();
  const { reset } = usePreparationStore();
  const { runnerState, setRunnerState } = useRunnerStore();
  const player = usePlayerStore((state) => state.player);
  
  // Get player name from player store
  const playerName = player?.name || `Runner #${player?.id.slice(0, 5).toUpperCase() || "00000"}`;

  // Ranking States
  const [hasProcessed, setHasProcessed] = useState(false);
  const [rpGained, setRpGained] = useState(0);
  const [rpBreakdown, setRpBreakdown] = useState<
    { reason: string; change: number }[]
  >([]);
  const [newRp, setNewRp] = useState(0);
  const [rankedUp, setRankedUp] = useState(false);

  // Share States
  const [isReportShareOpen, setIsReportShareOpen] = useState(false);
  const [isSummaryCopied, setIsSummaryCopied] = useState(false);
  const [activeCoachQuote, setActiveCoachQuote] = useState<string | null>(null);
  const [activeEventHighlight, setActiveEventHighlight] =
    useState<RaceEvent | null>(null);
  const [isHighlightsExpanded, setIsHighlightsExpanded] = useState(false);

  const handleCopySummary = () => {
    if (!challenge) return;
    playSound("click");
    const summaryText = `🏃 RunQuest Victory Certificate 🏆\n📍 ${challenge.race.title[lang]}\n🏁 Distance: ${challenge.race.distance} km\n⏱️ Time: ${formatTime(finishTime)}\n🏅 Medal: ${outcome.toUpperCase()} | Grade: ${grade} | Score: ${score}/100\n🎮 Play at runquest.game`;
    navigator.clipboard.writeText(summaryText).then(() => {
      setIsSummaryCopied(true);
      setTimeout(() => setIsSummaryCopied(false), 2500);
    });
  };
  
  // Analytics state
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [raceAnalytics, setRaceAnalytics] = useState<RaceAnalytics | null>(null);

  const dayIndex = useTimelineStore((state) => state.gameState?.dayIndex ?? 0);
  const challenge =
    currentChallenge || generateDailyChallenge(dayIndex.toString());
  
  const { preparation } = usePreparationStore();

  useEffect(() => {
    if (!lastResult || hasProcessed) return;
    setHasProcessed(true);

    const profile = runnerState.profile;
    const initialRp = profile.rankPoints || 0;
    const outcome = lastResult.outcome;
    const isPerfect = lastResult.grade === "S";

    // Check if player beat active nemesis / rivals in the race
    let didBeatNemesis = false;
    const finalState = lastResult.stateLog?.[lastResult.stateLog.length - 1];
    if (finalState && finalState.opponents) {
      const nemesis = finalState.opponents.find((opp) => opp.isNemesis);
      if (nemesis) {
        if (outcome !== "dnf" && outcome !== "dns") {
          if (
            nemesis.isDNF ||
            lastResult.finishTime < nemesis.accumulatedTime
          ) {
            didBeatNemesis = true;
          }
        }
      }
    }

    // Check if they beat their PB Ghost
    const currentGhost = loadGhostRun(challenge.id);
    const didBeatGhost =
      currentGhost && outcome !== "dnf" && outcome !== "dns"
        ? lastResult.finishTime < currentGhost.finishTime
        : false;

    // Check if they ran under target time
    const underTargetTime =
      outcome !== "dnf" && outcome !== "dns"
        ? lastResult.finishTime < challenge.objective.targetTime
        : false;

    // Identify which known rivals were in this race
    const KNOWN_RIVAL_NAMES = [
      "Marcus 'The Machine' Rivera",
      "Ellie 'Lightning' Park",
      "Kenji 'Silent Storm' Nakamura",
      "Sarah 'Ironheart' Chen",
      "Alex 'The Natural' Santos",
      "Maria 'Momentum' Gonzalez",
    ];
    const KNOWN_RIVAL_IDS: Record<string, string> = {
      "Marcus 'The Machine' Rivera": "marcus_rivera",
      "Ellie 'Lightning' Park": "ellie_park",
      "Kenji 'Silent Storm' Nakamura": "kenji_nakamura",
      "Sarah 'Ironheart' Chen": "sarah_chen",
      "Alex 'The Natural' Santos": "alex_santos",
      "Maria 'Momentum' Gonzalez": "maria_gonzalez",
    };

    let rivalRelationships = { ...(profile.rivalRelationships || {}) };
    if (finalState && finalState.opponents) {
      for (const opp of finalState.opponents) {
        const rivalId = KNOWN_RIVAL_NAMES.includes(opp.name)
          ? KNOWN_RIVAL_IDS[opp.name]
          : null;
        if (rivalId) {
          const existing = rivalRelationships[rivalId] || {
            wins: 0,
            losses: 0,
            lastEncounter: null,
            relationshipLevel: 0,
            totalEncounters: 0,
            closestMargin: Infinity,
            biggestWin: 0,
            biggestLoss: 0,
          };

          const playerBeatRival =
            outcome !== "dnf" &&
            outcome !== "dns" &&
            (opp.isDNF || lastResult.finishTime < opp.accumulatedTime);

          const margin = opp.isDNF
            ? Infinity
            : Math.abs(lastResult.finishTime - opp.accumulatedTime);

          rivalRelationships = {
            ...rivalRelationships,
            [rivalId]: {
              ...existing,
              wins: existing.wins + (playerBeatRival ? 1 : 0),
              losses: existing.losses + (playerBeatRival ? 0 : 1),
              lastEncounter: new Date().toISOString(),
              relationshipLevel:
                existing.relationshipLevel + (playerBeatRival ? 5 : -5),
              totalEncounters: existing.totalEncounters + 1,
              closestMargin: Math.min(existing.closestMargin, margin),
              biggestWin: playerBeatRival
                ? Math.max(existing.biggestWin, margin)
                : existing.biggestWin,
              biggestLoss: playerBeatRival
                ? existing.biggestLoss
                : Math.max(existing.biggestLoss, margin),
            },
          };
        }
      }
    }

    // Calculate RP change
    const { rpChange, breakdown } = calculateRankPointsChange(
      outcome,
      isPerfect,
      didBeatNemesis,
      didBeatGhost,
      underTargetTime,
    );

    const nextRp = applyRpChangeWithProtection(initialRp, rpChange);
    setNewRp(nextRp);
    setRpGained(rpChange);
    setRpBreakdown(breakdown);

    // Save personal best ghost if applicable
    if (outcome !== "dnf" && outcome !== "dns") {
      const splits = (lastResult.stateLog || [])
        .filter((s) => s.distanceCovered > 0)
        .map((s, index, arr) => {
          const prev = index === 0 ? lastResult.stateLog[0] : arr[index - 1];
          return s.accumulatedTime - prev.accumulatedTime;
        });

      const dayIndex = useTimelineStore.getState().gameState?.dayIndex;

      if (isNewPersonalBest(challenge.id, lastResult.finishTime, challenge.race.distance)) {
        saveGhostRun(
          challenge.id,
          playerName,
          lastResult.finishTime,
          splits,
          dayIndex,
          challenge.race.distance,
        );
        
        // Also save to the new PB tracking system
        setPBIfFaster(
          challenge.race.distance,
          lastResult.finishTime,
          challenge.id,
        );
      }

      // Add distance to club contribution if joined, and simulate competition day
      useSocialStore
        .getState()
        .simulateCompetitionDay(
          challenge.race.distance,
          profile.rankPoints || 0,
          dayIndex,
        );
      
      // Generate race analytics
      try {
        const analytics = analyzeRacePerformance(lastResult, challenge, preparation);
        setRaceAnalytics(analytics);
      } catch (error) {
        console.error("Failed to generate race analytics:", error);
      }
    }

    // Update profile
    const { tier: oldTier } = getTierAndDivision(initialRp);
    const { tier: newTier, division: newDiv } = getTierAndDivision(nextRp);

    if (newTier !== oldTier) {
      setRankedUp(true);
    }

    // Save run to history
    const runRecord: RunRecord = {
      challengeId: challenge.id,
      date: new Date().toISOString(),
      distance: challenge.race.distance,
      finishTime: lastResult.finishTime,
      grade: lastResult.grade,
      score: lastResult.score,
      outcome: lastResult.outcome,
    };
    const profileWithHistory = saveRunToHistory(profile, runRecord);

    const updatedProfile = {
      ...profileWithHistory,
      rankPoints: nextRp,
      rankTier: newTier,
      rankDivision: newDiv,
      rivalRelationships,
      clubContribution: profile.clubId
        ? Number(
            ((profile.clubContribution || 0) + challenge.race.distance).toFixed(
              2,
            ),
          )
        : profile.clubContribution,
    };

    setRunnerState({
      ...runnerState,
      profile: updatedProfile,
      lastUpdated: new Date().toISOString(),
    });
  }, [lastResult, hasProcessed, runnerState, challenge, setRunnerState]);

  // Safely fallback if result is missing (navigated directly)
  if (!lastResult) {
    return (
      <div className="min-h-screen bg-[#fffdf8] dark:bg-[#090d16] flex flex-col items-center justify-center p-6 text-center text-gray-900 dark:text-white">
        <h2 className="text-xl font-bold mb-2">
          {t("challenge.result.no_results_title" as TranslationKey)}
        </h2>
        <p className="text-gray-500 dark:text-gray-300 mb-6 text-sm">
          {t("challenge.result.no_results_desc" as TranslationKey)}
        </p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all"
        >
          {t("challenge.result.go_home" as TranslationKey)}
        </button>
      </div>
    );
  }

  const { finishTime, score, grade, outcome, story } = lastResult;

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    return h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
  };

  const formatPace = (seconds: number) => {
    if (!seconds || seconds <= 0) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}/km`;
  };

  // Filter out km 0 and compute splits
  const splits = (lastResult.stateLog || [])
    .filter((state) => state.distanceCovered > 0)
    .map((state, index, arr) => {
      const prev = index === 0 ? lastResult.stateLog[0] : arr[index - 1];
      const splitTime = state.accumulatedTime - prev.accumulatedTime;
      return {
        km: state.distanceCovered,
        time: splitTime,
        energy: state.energy,
        hydration: state.hydration,
        focus: state.focus,
      };
    });

  const fastestSplit =
    splits.length > 0 ? Math.min(...splits.map((s) => s.time)) : 0;

  const getRunners = () => {
    const finalState =
      lastResult.stateLog && lastResult.stateLog.length > 0
        ? lastResult.stateLog[lastResult.stateLog.length - 1]
        : null;

    const list: Array<{
      id: string;
      name: string;
      distance: number;
      isPlayer: boolean;
      isDNF: boolean;
      dnfReason?: string;
    }> = [
      {
        id: "player",
        name: playerName,
        distance: outcome === "dnf" ? (finalState?.distanceCovered ?? 0) : challenge.race.distance,
        isPlayer: true,
        isDNF: outcome === "dnf",
      },
    ];

    if (finalState && finalState.opponents) {
      for (const opp of finalState.opponents) {
        list.push({
          id: opp.id,
          name: opp.name,
          distance: opp.isDNF ? opp.distanceCovered : challenge.race.distance,
          isPlayer: false,
          isDNF: opp.isDNF,
        });
      }
    }

    return list;
  };

  const getMockComments = () => {
    const comments: {
      id: string;
      author: string;
      avatar: string;
      text: string;
      time: string;
    }[] = [];

    // Coach Sarah
    let sarahText =
      "Solid effort out there! Consistency is the foundation of improvement.";
    if (outcome === "gold") {
      sarahText =
        "Incredible race! Your pacing strategy and split times were executed to perfection. Gold medal well deserved!";
    } else if (outcome === "dnf") {
      sarahText =
        "Don't beat yourself up. Physical depletion happens. Let's adjust attributes in the Career tab and prepare properly next time.";
    } else if (outcome === "silver" || outcome === "bronze") {
      sarahText =
        "Excellent podium finish! You paced yourself well. A bit more speed attribute and you'll grab gold.";
    }
    comments.push({
      id: "coach-sarah",
      author: "Coach Sarah",
      avatar: "👩🏫",
      text: sarahText,
      time: "2m ago",
    });

    // Rival Alex
    let alexText = "Nice run today! I'm keeping an eye on your splits.";
    if (outcome === "gold") {
      alexText =
        "Wow, you flew past the pack! That final split was insane. Respect!";
    } else if (outcome === "dnf") {
      alexText =
        "Ouch, looked like a rough day out there. Rest up, we have another match tomorrow.";
    } else {
      alexText =
        "Good race! You had a solid cadence. I'm upgrading my speed stat to catch you next time.";
    }
    comments.push({
      id: "rival-alex",
      author: "Alex (Rival)",
      avatar: "🏃♂️",
      text: alexText,
      time: "10m ago",
    });

    // GritBot
    let botText = "beep boop... optimal efficiency detected. cadence stable.";
    if (outcome === "dnf") {
      botText =
        "beep boop... critical battery low. energy depletion detected at final segment. suggest hydration focus.";
    } else if (grade === "S" || grade === "A") {
      botText =
        "beep boop... precision execution! pace variance < 3%. grade validation optimal.";
    }
    comments.push({
      id: "gritbot",
      author: "GritBot",
      avatar: "🤖",
      text: botText,
      time: "1h ago",
    });

    return comments;
  };

  const getOutcomeColor = () => {
    switch (outcome) {
      case "gold":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/30";
      case "silver":
        return "text-gray-400 dark:text-gray-500 bg-gray-400/10 border-gray-400/30";
      case "bronze":
        return "text-amber-600 bg-amber-600/10 border-amber-600/30";
      case "finish":
        return "text-blue-500 bg-blue-500/10 border-blue-500/30";
      case "dnf":
        return "text-red-500 bg-red-500/10 border-red-500/30";
      case "dns":
        return "text-red-500 bg-red-500/10 border-red-500/30";
    }
  };

  const handleBackHome = () => {
    clearState();
    reset();
    router.push("/");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="min-h-screen bg-[#fffdf8] dark:bg-[#090d16] pb-24 text-gray-900 dark:text-white"
    >
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 dark:border-slate-800 bg-[#ffffff]/90 dark:bg-[#111827]/90 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <h1 className="font-heading text-xl font-bold text-gray-900 dark:text-white">
            {t("challenge.result.title" as TranslationKey)}
          </h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRunTour(true)}
              className="rounded-full min-h-[38px] px-3 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-400/50 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
              aria-label="Start Result Tour"
            >
              <span>🧭</span>
              <span>{t("tour.button" as TranslationKey)}</span>
            </button>
            <button
              type="button"
              onClick={handleBackHome}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 transition hover:bg-gray-50 dark:hover:bg-slate-800 active:scale-95"
              aria-label="Go Home"
            >
              <Home className="h-4.5 w-4.5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8 flex flex-col gap-8">
        {/* Core Stats Overview */}
        <div id="tour-result-summary" className="rounded-[2rem] border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col md:flex-row items-center gap-8 justify-around">
          {/* Medal / DNF Icon */}
          <div
            className={`flex flex-col items-center p-6 rounded-2xl border ${getOutcomeColor()}`}
          >
            <Award className="h-16 w-16 mb-2" />
            <span className="text-xs uppercase tracking-widest font-bold">
              {t(
                `challenge.result.outcome_${outcome}` as TranslationKey,
              ).toUpperCase()}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-400 dark:text-gray-500 dark:text-gray-500 uppercase tracking-widest mb-1">
              {t("challenge.result.grade" as TranslationKey)}
            </span>
            <span className="text-6xl font-black font-heading text-gray-900 dark:text-white">
              {grade}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-400 dark:text-gray-500 dark:text-gray-500 uppercase tracking-widest mb-1">
              {t("history.score" as TranslationKey)}
            </span>
            <span className="text-4xl font-extrabold text-blue-600">
              {score}
            </span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              {t("challenge.result.score_out_of" as TranslationKey)}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-400 dark:text-gray-500 dark:text-gray-500 uppercase tracking-widest mb-1">
              {t("challenge.result.time" as TranslationKey)}
            </span>
            <div className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-gray-100 text-2xl mt-2">
              <Clock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              <span>{formatTime(finishTime)}</span>
            </div>
          </div>
        </div>

        {/* RP & Ranking Progression Card */}
        {rpGained !== 0 && (
          <div className="rounded-[2rem] border-2 border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/20 dark:bg-indigo-950/10 p-6 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <div>
                  <h3 className="font-heading font-black text-sm text-indigo-900 dark:text-indigo-200 dark:text-indigo-200">
                    Rank Points Progress
                  </h3>
                  <p className="text-[10px] text-gray-500">
                    Your progression in the competitive league
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`text-lg font-black font-heading ${rpGained > 0 ? "text-emerald-600" : "text-rose-600"}`}
                >
                  {rpGained > 0 ? `+${rpGained}` : rpGained} RP
                </span>
              </div>
            </div>

            {/* Rank Tier Display */}
            <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-indigo-50 dark:border-indigo-950/40">
              <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-xl font-bold text-indigo-600 dark:text-indigo-400 shadow-inner">
                {getTierAndDivision(newRp).tier[0]}
              </div>
              <div className="flex-grow">
                <h4 className="font-bold text-sm text-slate-800 dark:text-white leading-tight">
                  {getTierAndDivision(newRp).tier}{" "}
                  {getTierAndDivision(newRp).division &&
                    `Division ${getTierAndDivision(newRp).division}`}
                </h4>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                  {newRp} Total RP
                </p>
              </div>
              {rankedUp && (
                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold uppercase px-2.5 py-1 rounded-full animate-bounce">
                  Rank Up! 🎉
                </span>
              )}
            </div>

            {/* RP Breakdown */}
            <div className="flex flex-col gap-1.5 text-xs text-slate-600 dark:text-slate-300 dark:text-slate-350">
              <span className="text-[10px] uppercase font-bold text-gray-405 tracking-wider">
                Breakdown
              </span>
              {rpBreakdown.map((item, idx) => (
                <div key={idx} className="flex justify-between font-mono">
                  <span>{item.reason}</span>
                  <span
                    className={
                      item.change > 0 ? "text-emerald-500" : "text-rose-500"
                    }
                  >
                    {item.change > 0 ? `+${item.change}` : item.change} RP
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Visual Share Card Preview */}
        <div className="flex flex-col gap-4 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 border border-indigo-500/20 dark:border-indigo-500/30 rounded-[2.5rem] p-5 sm:p-7 shadow-2xl relative overflow-hidden backdrop-blur-xl hover:border-indigo-500/40 transition-all duration-300">
          {/* Decorative Radial Ambient Glows */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header Row */}
          <div className="flex items-center justify-between gap-3 relative z-10 px-1 border-b border-slate-800/80 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-400/20 text-indigo-400">
                <Camera className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-heading font-black text-xs md:text-sm uppercase tracking-wider text-slate-100">
                  {t("result.share_card" as TranslationKey)}
                </h3>
                <p className="text-[10.5px] text-slate-400 font-medium">
                  High-res official performance breakdown
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono font-extrabold text-slate-300">
                800 × 450 PNG
              </span>
            </div>
          </div>

          {/* Race Report Card Frame Preview */}
          <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-slate-950/90 p-3 sm:p-5 flex items-center justify-center shadow-inner relative z-10">
            <div className="scale-[0.55] sm:scale-[0.75] md:scale-[0.85] origin-center my-[-90px] sm:my-[-45px] pointer-events-none transition-transform duration-200">
              <RaceReportCard
                challenge={challenge}
                outcome={outcome}
                grade={grade}
                score={score}
                finishTime={finishTime}
                lang={lang}
                date={challenge.date}
              />
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10 pt-1">
            <button
              type="button"
              onClick={() => {
                playSound("click");
                setIsReportShareOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl text-xs md:text-sm font-black transition-all active:scale-95 shadow-lg shadow-indigo-500/30 border border-indigo-400/30 min-h-[46px]"
            >
              <Share2 className="h-4 w-4" />
              <span>{t("result.download_png" as TranslationKey)}</span>
            </button>

            <button
              type="button"
              onClick={handleCopySummary}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-xs md:text-sm font-black transition-all active:scale-95 border min-h-[46px] ${
                isSummaryCopied
                  ? "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/25"
                  : "bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border-slate-700/80 hover:border-slate-600"
              }`}
            >
              {isSummaryCopied ? (
                <>
                  <Check className="h-4 w-4 text-white" />
                  <span>{t("result.summary_copied" as TranslationKey)}</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-slate-300" />
                  <span>{t("result.copy_stats_text" as TranslationKey)}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Rival Leaderboard - Enhanced Standings */}
        {getRunners().length > 0 && (
          <section className="rounded-[2rem] border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col gap-4">
            <EnhancedStandings
              runners={getRunners()}
              raceDistance={challenge.race.distance}
              showMobileVersion={false}
            />
          </section>
        )}

        {/* Narrative & Highlights Section */}
        <section className="rounded-[2rem] border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-heading font-black text-lg text-slate-900 dark:text-white">
                  {story.headline[lang]}
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {t("result.story_summary" as TranslationKey)}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-extrabold uppercase tracking-wider">
              {story.highlights.length} {t("result.story_headline" as TranslationKey)}
            </span>
          </div>

          {/* Story Summary Card */}
          <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-amber-500/5 dark:from-amber-500/10 dark:via-orange-500/10 dark:to-amber-500/10 border border-amber-500/20 shadow-sm relative overflow-hidden">
            <p className="text-xs md:text-sm leading-relaxed font-medium text-slate-700 dark:text-slate-200">
              {story.summary[lang]}
            </p>
          </div>

          {/* Highlights Dropdown */}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setIsHighlightsExpanded(!isHighlightsExpanded)}
              className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/70 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 transition-all active:scale-[0.99]"
            >
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <span>⚡</span>
                <span>{t("result.story_headline" as TranslationKey)} ({story.highlights.length})</span>
              </span>
              <ChevronDown 
                className={`h-4 w-4 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${
                  isHighlightsExpanded ? "rotate-180" : ""
                }`}
              />
            </button>
            
            {isHighlightsExpanded && (
              <div className="flex flex-col gap-2.5">
                {story.highlights.map((h, idx) => {
                  const event = lastResult.events.find(
                    (e) =>
                      h.en.includes(`At km ${e.km}:`) ||
                      h.id.includes(`Di km ${e.km}:`),
                  );
                  const isShareable = isHighlightShareable(h, idx);

                  return (
                    <div
                      key={`highlight-${idx}-${h.en}`}
                      className="text-xs text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-950/50 border border-slate-200/70 dark:border-slate-800 hover:border-amber-400/50 dark:hover:border-amber-600/50 rounded-xl p-3.5 flex items-center justify-between gap-3 transition-all shadow-sm"
                    >
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        <span className="text-amber-500 font-bold shrink-0 mt-0.5">⚡</span>
                        <span className="leading-relaxed font-medium">{h[lang]}</span>
                      </div>
                      {isShareable && (
                        <button
                          type="button"
                          onClick={() => {
                            if (event) {
                              setActiveEventHighlight(event);
                            } else {
                              setActiveCoachQuote(h[lang]);
                            }
                          }}
                          className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-amber-500/10 hover:border-amber-400/50 text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 transition active:scale-95 shrink-0 shadow-xs"
                          aria-label="Share race moment"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Coaching Lessons learned */}
        <section className="rounded-[2rem] border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-heading font-black text-lg text-gray-800 dark:text-gray-100">
                  {t("result.lessons_learned" as TranslationKey)}
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {t("result.tactical_advice" as TranslationKey)}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold uppercase tracking-wider">
              {story.lessons.length} {t("result.takeaways" as TranslationKey)}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {story.lessons.map((lesson, idx) => (
              <div
                key={`lesson-${idx}-${lesson.en}`}
                className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-800/40 dark:to-blue-950/20 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700/60 transition-all duration-200 shadow-sm flex items-start gap-3.5"
              >
                <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-blue-500/10 dark:bg-blue-500/25 border border-blue-400/30 text-blue-600 dark:text-blue-300 font-mono font-black text-xs shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm leading-relaxed text-slate-700 dark:text-slate-200 font-medium">
                    {lesson[lang]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Splits Analysis */}
        {splits.length > 0 && (
          <section className="rounded-[2rem] border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-3">
              <Clock className="h-5 w-5 text-orange-500" />
              <h2 className="font-heading text-lg font-bold text-gray-800 dark:text-gray-100">
                {t("result.interactive_splits" as TranslationKey)}
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-500 dark:text-gray-400 dark:text-gray-500">
                <thead className="text-[10px] text-slate-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase bg-slate-50 dark:bg-slate-800 dark:bg-gray-800/40 rounded-xl">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-center">
                      KM
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Split Time
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Energy
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Hydration
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Pace Bar
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150/40 dark:divide-slate-800">
                  {splits.map((s) => {
                    const isFastest = s.time === fastestSplit;
                    return (
                      <tr
                        key={s.km}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 dark:hover:bg-slate-700/20"
                      >
                        <td className="px-4 py-3 font-bold text-center text-slate-700 dark:text-white font-mono">
                          {s.km}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-800 dark:text-gray-200 dark:text-gray-300 flex items-center gap-1">
                          {formatPace(s.time)}
                          {isFastest && (
                            <span
                              className="text-[10px] text-amber-500 animate-pulse"
                              title="Fastest Split"
                            >
                              ⚡
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono">
                          {s.energy.toFixed(0)}%
                        </td>
                        <td className="px-4 py-3 font-mono">
                          {s.hydration.toFixed(0)}%
                        </td>
                        <td className="px-4 py-3 w-1/3">
                          <div className="h-2 w-full bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${isFastest ? "bg-amber-400" : "bg-orange-500"}`}
                              style={{
                                width: `${Math.min(100, Math.max(10, (fastestSplit / s.time) * 100))}%`,
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Deep Dive Analytics Button & Section */}
        {raceAnalytics && (
          <>
            {!showAnalytics && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAnalytics(true)}
                className="w-full py-4 rounded-[2rem] border-2 border-dashed border-orange-300 dark:border-orange-700 bg-gradient-to-r from-orange-50 to-purple-50 dark:from-orange-900/10 dark:to-purple-900/10 hover:from-orange-100 hover:to-purple-100 dark:hover:from-orange-900/20 dark:hover:to-purple-900/20 transition-all"
              >
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5 text-orange-500" />
                  <span className="font-heading text-lg font-bold text-orange-600 dark:text-orange-400">
                    {t("race.analytics.deep_dive" as TranslationKey) || "🔍 Deep Dive Analytics"}
                  </span>
                  <Sparkles className="h-5 w-5 text-purple-500" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {t("race.analytics.deep_dive_desc" as TranslationKey) || "Pace charts, energy analysis, what-if scenarios & more"}
                </p>
              </motion.button>
            )}
            
            {showAnalytics && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <PostRaceAnalytics analytics={raceAnalytics} lang={lang} />
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAnalytics(false)}
                  className="w-full mt-4 py-3 rounded-[2rem] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-center gap-2">
                    <ChevronUp className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                      {t("race.analytics.collapse" as TranslationKey) || "Collapse Analytics"}
                    </span>
                  </div>
                </motion.button>
              </motion.div>
            )}
          </>
        )}

        {/* Strava-style Mock Comments Feed */}
        <section className="rounded-[2rem] border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-3">
            <span className="text-lg">💬</span>
            <h2 className="font-heading text-lg font-bold text-gray-800 dark:text-gray-100">
              Social Comments Feed
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {getMockComments().map((comment, index) => (
              <div
                key={index}
                className="flex gap-3 items-start border-b border-slate-150/40 dark:border-slate-800/40 pb-3 last:border-0 last:pb-0"
              >
                <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-lg flex-shrink-0">
                  {comment.avatar}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 dark:text-white">
                      {comment.author}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">
                      {comment.time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-gray-300 mt-1 leading-relaxed">
                    {comment.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Action Button Section */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
          <button
            type="button"
            onClick={() => setIsReportShareOpen(true)}
            className="flex-grow flex items-center justify-center gap-2 px-6 py-4 border-2 border-orange-500 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 active:scale-[0.98] rounded-[1.5rem] text-base font-semibold transition duration-200"
          >
            <Share2 className="h-5 w-5" />
            <span>{t("challenge.result.share" as TranslationKey)}</span>
          </button>

          <button
            type="button"
            onClick={handleBackHome}
            className="flex-grow flex items-center justify-center gap-2 px-6 py-4 bg-orange-500 text-white hover:bg-orange-600 active:scale-[0.98] rounded-[1.5rem] text-base font-black shadow-md shadow-orange-500/20 transition duration-200"
          >
            <span>{t("challenge.result.back_home" as TranslationKey)}</span>
          </button>
        </div>
      </main>

      {/* Main performance share modal */}
      <ShareModal
        isOpen={isReportShareOpen}
        onClose={() => setIsReportShareOpen(false)}
        shareTitle={t("share.native_title" as TranslationKey)}
        shareText={`🏃‍♂️ RunQuest Daily Challenge: ${challenge.race.title[lang]}!
🏆 ${t(`challenge.result.outcome_${outcome}` as TranslationKey)} (${grade} Grade)
⏱️ ${t("challenge.result.time" as TranslationKey)}: ${formatTime(finishTime)}
🔥 ${t("history.score" as TranslationKey)}: ${score}/1000
📖 "${story.headline[lang]}"

Play now at: https://runquest.game`}
        fileName={`runquest-result-${challenge.date}.png`}
      >
        <RaceReportCard
          challenge={challenge}
          outcome={outcome}
          grade={grade}
          score={score}
          finishTime={finishTime}
          lang={lang}
          date={challenge.date}
        />
      </ShareModal>

      {/* Coach quote lesson share modal */}
      <ShareModal
        isOpen={activeCoachQuote !== null}
        onClose={() => setActiveCoachQuote(null)}
        shareTitle={t("share.coach.title" as TranslationKey)}
        shareText={`🎓 RunQuest Coach Tip:
"${activeCoachQuote}"
🏁 ${challenge.race.title[lang]} — Grade ${grade}

Get training lessons at https://runquest.game`}
        fileName={`runquest-coach-${challenge.date}.png`}
      >
        {activeCoachQuote && (
          <CoachQuoteCard
            lesson={activeCoachQuote}
            raceTitle={challenge.race.title[lang]}
            grade={grade}
            lang={lang}
            date={challenge.date}
          />
        )}
      </ShareModal>

      {/* Event highlight moment share modal */}
      <ShareModal
        isOpen={activeEventHighlight !== null}
        onClose={() => setActiveEventHighlight(null)}
        shareTitle={t("share.event.title" as TranslationKey)}
        shareText={(() => {
          if (!activeEventHighlight) return "";
          const effects: string[] = [];
          if (activeEventHighlight.effect.stamina !== 0) {
            effects.push(
              `${activeEventHighlight.effect.stamina > 0 ? "+" : ""}${activeEventHighlight.effect.stamina} Stamina`,
            );
          }
          if (activeEventHighlight.effect.hydration !== 0) {
            effects.push(
              `${activeEventHighlight.effect.hydration > 0 ? "+" : ""}${activeEventHighlight.effect.hydration} Hydration`,
            );
          }
          if (activeEventHighlight.effect.morale !== 0) {
            effects.push(
              `${activeEventHighlight.effect.morale > 0 ? "+" : ""}${activeEventHighlight.effect.morale} Focus`,
            );
          }
          if (activeEventHighlight.effect.pace !== 0) {
            effects.push(
              `${activeEventHighlight.effect.pace > 0 ? "+" : "-"}${Math.abs(activeEventHighlight.effect.pace)}s/km Pace`,
            );
          }
          const effectsStr =
            effects.length > 0 ? effects.join(", ") : "No impact";

          return `📍 RunQuest Race Moment [Km ${activeEventHighlight.km}]:
💥 ${activeEventHighlight.title[lang]}
💬 "${activeEventHighlight.description[lang]}"
⚡ Impact: ${effectsStr}

Experience the run at https://runquest.game`;
        })()}
        fileName={`runquest-moment-${challenge.date}-km${activeEventHighlight?.km}.png`}
      >
        {activeEventHighlight && (
          <EventHighlightCard
            event={activeEventHighlight}
            raceTitle={challenge.race.title[lang]}
            lang={lang}
            date={challenge.date}
          />
        )}
      </ShareModal>

      {/* Screen Tour */}
      <ScreenTour
        run={runTour}
        onFinish={() => setRunTour(false)}
        steps={[
          {
            target: "body",
            placement: "center",
            title: t("tour.screens.result.welcome.title" as TranslationKey),
            content: t("tour.screens.result.welcome.content" as TranslationKey),
            skipBeacon: true,
          },
          {
            target: "#tour-result-summary",
            title: t("tour.screens.result.summary.title" as TranslationKey),
            content: t("tour.screens.result.summary.content" as TranslationKey),
          },
        ]}
      />
    </motion.div>
  );
}
