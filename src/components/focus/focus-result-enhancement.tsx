"use client";

import { motion } from "framer-motion";
import {
  Award,
  Clock,
  Flame,
  Medal,
  RotateCcw,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { checkChallengeCompletion } from "@/engine/focus/challenge-generator";
import { useSound } from "@/hooks/use-sound";
import {
  type Distance,
  useFocusProgressionStore,
} from "@/store/focus-progression-store";
import { useGameStore } from "@/store/game-store";
import type { Outcome, SimulationResult } from "@/types/engine";

interface FocusResultEnhancementProps {
  result: SimulationResult;
  distance: Distance;
  position?: number; // Optional position from standings
  onRaceAgain: () => void;
  onBackToFocus: () => void;
}

/**
 * Enhanced result screen for Focus Mode
 * Shows progression updates, achievements, and quick race-again option
 */
export function FocusResultEnhancement({
  result,
  distance,
  position = 10, // Default to 10th place if not provided
  onRaceAgain,
  onBackToFocus,
}: FocusResultEnhancementProps) {
  const router = useRouter();
  const { playSound } = useSound();

  const {
    personalBests,
    updatePersonalBest,
    recordRaceResult,
    checkAndUnlockProgression,
    addAchievement,
    availableChallenges,
    completeChallenge,
    sessionStats,
  } = useFocusProgressionStore();

  const currentPB = personalBests[distance];
  const finishTime = result.finishTime;
  const isNewPB = !currentPB || finishTime < currentPB.time;
  const isPodium = position <= 3;
  const isWin = position === 1;

  useEffect(() => {
    // Record race result
    recordRaceResult(distance, finishTime, position, 50); // Assuming 50 runners

    // Check for personal best
    if (isNewPB) {
      playSound("success");
      updatePersonalBest({
        distance,
        time: finishTime,
        date: Date.now(),
        position: position,
        totalRunners: 50,
        isPR: true,
      });
    }

    // Check completed challenges
    availableChallenges.forEach((challenge) => {
      if (challenge.distance === distance && !challenge.completed) {
        const completed = checkChallengeCompletion(challenge, {
          time: finishTime,
          position: position,
          splits: [], // Would need to extract from stateLog
        });

        if (completed) {
          playSound("success");
          completeChallenge(challenge.id);

          // Award achievement if reward type is achievement
          if (challenge.reward.type === "achievement") {
            addAchievement({
              id: challenge.reward.value,
              name: challenge.description,
              description: `Completed: ${challenge.description}`,
              icon: "🏆",
              unlockedAt: Date.now(),
              rarity: challenge.difficulty >= 4 ? "epic" : "rare",
            });
          }
        }
      }
    });

    // Check for progression unlocks
    checkAndUnlockProgression();
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const timeDifference = currentPB ? finishTime - currentPB.time : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div
          className={`p-6 rounded-t-2xl ${
            isWin
              ? "bg-gradient-to-r from-amber-400 to-yellow-500"
              : isPodium
                ? "bg-gradient-to-r from-indigo-500 to-purple-600"
                : "bg-gradient-to-r from-slate-600 to-slate-700"
          }`}
        >
          <div className="text-center text-white">
            <div className="text-6xl mb-2">
              {isWin ? "🥇" : isPodium ? (position === 2 ? "🥈" : "🥉") : "🏁"}
            </div>
            <h2 className="font-heading font-black text-3xl mb-1">
              {isWin ? "VICTORY!" : isPodium ? "PODIUM!" : "RACE COMPLETE"}
            </h2>
            <p className="text-sm opacity-90">
              {position === 1 && "You won the race!"}
              {position === 2 && "Second place finish!"}
              {position === 3 && "Bronze medal!"}
              {position > 3 && `Finished ${position}th place`}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 space-y-6">
          {/* Main Time */}
          <div className="text-center">
            <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-2">
              FINISH TIME
            </div>
            <div className="font-mono font-bold text-5xl text-slate-900 dark:text-white">
              {formatTime(finishTime)}
            </div>

            {isNewPB && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mt-3 inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-full"
              >
                <Trophy className="w-4 h-4" />
                <span className="font-bold text-sm">NEW PERSONAL BEST!</span>
              </motion.div>
            )}

            {!isNewPB && currentPB && (
              <div
                className={`mt-3 text-sm font-mono font-bold ${
                  timeDifference > 0
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {timeDifference > 0 ? "+" : ""}
                {formatTime(Math.abs(timeDifference))} vs PB
              </div>
            )}
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <Medal className="w-5 h-5 mx-auto mb-2 text-indigo-500" />
              <div className="font-mono font-bold text-2xl">{position}</div>
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                Position
              </div>
            </div>

            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <Clock className="w-5 h-5 mx-auto mb-2 text-indigo-500" />
              <div className="font-mono font-bold text-2xl">{distance}K</div>
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                Distance
              </div>
            </div>

            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <TrendingUp className="w-5 h-5 mx-auto mb-2 text-indigo-500" />
              <div className="font-mono font-bold text-2xl">
                {Math.floor(finishTime / distance / 60)}:
                {String(Math.floor((finishTime / distance) % 60)).padStart(
                  2,
                  "0",
                )}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                Avg Pace
              </div>
            </div>
          </div>

          {/* Session Progress */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4">
            <div className="text-center mb-3">
              <div className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
                TODAY'S SESSION
              </div>
            </div>
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="font-mono font-bold text-2xl text-indigo-600 dark:text-indigo-400">
                  {sessionStats.racesCompleted}
                </div>
                <div className="text-[9px] uppercase font-bold text-slate-600 dark:text-slate-400">
                  Races
                </div>
              </div>
              <div className="text-center">
                <div className="font-mono font-bold text-2xl text-emerald-600 dark:text-emerald-400">
                  {sessionStats.prsAchieved}
                </div>
                <div className="text-[9px] uppercase font-bold text-slate-600 dark:text-slate-400">
                  PRs
                </div>
              </div>
              <div className="text-center">
                <div className="font-mono font-bold text-2xl text-amber-600 dark:text-amber-400">
                  {sessionStats.podiumFinishes}
                </div>
                <div className="text-[9px] uppercase font-bold text-slate-600 dark:text-slate-400">
                  Podiums
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => {
                playSound("click");
                onRaceAgain();
              }}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-heading font-black text-lg py-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <RotateCcw className="w-5 h-5" />
              RACE AGAIN
            </button>

            <button
              onClick={() => {
                playSound("click");
                onBackToFocus();
              }}
              className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 text-slate-900 dark:text-white font-bold py-3 rounded-xl transition-all active:scale-95"
            >
              Back to Focus Mode
            </button>
          </div>

          {/* Motivational Message */}
          <div className="text-center text-sm text-slate-600 dark:text-slate-400">
            {isNewPB && "You're getting faster! Keep pushing your limits."}
            {!isNewPB &&
              isPodium &&
              "Great race! Can you beat your personal best next time?"}
            {!isNewPB &&
              !isPodium &&
              "Every race makes you stronger. Try again!"}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
