"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSound } from "@/hooks/use-sound";
import type { SimulationResult } from "@/types/engine";
import type { DailyChallenge } from "@/types/engine";

interface PhotoFinishProps {
  /** The simulation result containing final standings */
  result: SimulationResult;
  /** The challenge data */
  challenge: DailyChallenge;
  /** Player's name */
  playerName: string;
  /** Language for translations */
  lang: "en" | "id";
  /** Callback when photo finish animation completes */
  onComplete: () => void;
}

/**
 * Full-screen overlay that triggers when a race ends with a very close margin (< 1 second).
 * Shows a dramatic slow-motion photo finish animation with split-screen comparison.
 */
export function PhotoFinish({ result, challenge, playerName, lang, onComplete }: PhotoFinishProps) {
  const { playSound } = useSound();
  const [isPlaying, setIsPlaying] = useState(true);
  const [showWinner, setShowWinner] = useState(false);
  const [replayCount, setReplayCount] = useState(0);
  const animationFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  // Extract final standings from result
  const finalState = result.stateLog?.[result.stateLog.length - 1];
  
  // Get player and closest opponent for photo finish
  const getPhotoFinishParticipants = () => {
    if (!finalState || !finalState.opponents) return { player: null, opponent: null, margin: 0 };
    
    const player = finalState.opponents.find(o => o.id === "player_local") || {
      id: "player_local",
      name: playerName,
      distanceCovered: finalState.distanceCovered,
      accumulatedTime: result.finishTime,
      isDNF: false,
    };
    
    // Find closest opponent (non-DNF, smallest time difference)
    const validOpponents = finalState.opponents.filter(o => !o.isDNF && o.id !== "player_local");
    
    if (validOpponents.length === 0) return { player, opponent: null, margin: 0 };
    
    const opponentsWithMargin = validOpponents.map(opp => ({
      opp,
      margin: Math.abs(result.finishTime - opp.accumulatedTime)
    }));
    
    opponentsWithMargin.sort((a, b) => a.margin - b.margin);
    const closest = opponentsWithMargin[0];
    
    return {
      player,
      opponent: closest.opp,
      margin: closest.margin
    };
  };

  const { player, opponent, margin } = getPhotoFinishParticipants();
  
  // Determine winner
  const determineWinner = () => {
    if (!player || !opponent) return playerName;
    return player.accumulatedTime <= opponent.accumulatedTime ? playerName : opponent.name;
  };

  const winner = determineWinner();
  const isPlayerWinner = winner === playerName;
  
  // Format time difference
  const formatMargin = (seconds: number) => {
    if (seconds < 0.01) return "0.001s";
    if (seconds < 0.1) return `${(seconds * 1000).toFixed(0)}ms`;
    return `${seconds.toFixed(3)}s`;
  };

  // Play sounds in sequence
  useEffect(() => {
    if (!isPlaying) return;
    
    const sounds = [
      { name: "success" as const, delay: 0 },
      { name: "success" as const, delay: 500 },
      { name: "success" as const, delay: 1500 },
    ];
    
    sounds.forEach(({ name, delay }) => {
      setTimeout(() => playSound(name), delay);
    });
    
    // Start the animation timer
    startTimeRef.current = Date.now();
    
    // Show winner after animation
    const winnerTimer = setTimeout(() => {
      setShowWinner(true);
      playSound("success");
    }, 2000);
    
    // Complete after full animation
    const completeTimer = setTimeout(() => {
      setIsPlaying(false);
      onComplete();
    }, 4000);
    
    return () => {
      clearTimeout(winnerTimer);
      clearTimeout(completeTimer);
    };
  }, [isPlaying, playSound, onComplete]);

  const handleReplay = useCallback(() => {
    setShowWinner(false);
    setReplayCount(prev => prev + 1);
    startTimeRef.current = Date.now();
    
    setTimeout(() => {
      setShowWinner(true);
      playSound("success");
    }, 2000);
  }, [playSound]);

  const handleSkip = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsPlaying(false);
    onComplete();
  }, [onComplete]);

  // Translations
  const translations = {
    en: {
      photo_finish: "PHOTO FINISH!",
      winner: "WINNER",
      by_margin: "by {margin}",
      replay: "Watch Again",
      skip: "Continue",
    },
    id: {
      photo_finish: "FOTO FINISH!",
      winner: "PEMENANG",
      by_margin: "dengan selisih {margin}",
      replay: "Tonton Lagi",
      skip: "Lanjut",
    }
  };

  const t = translations[lang];

  if (!player || !opponent) {
    // Fallback for single-runner races
    return (
      <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-6 z-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            className="text-6xl mb-4"
          >
            🏁
          </motion.div>
          <h2 className="text-2xl font-black text-white mb-2">
            {t.photo_finish}
          </h2>
          <p className="text-slate-400 mb-6">
            {t.winner}: {playerName}
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSkip}
            className="px-8 py-3 bg-orange-500 text-white rounded-full font-bold text-lg hover:bg-orange-600 transition-colors"
          >
            {t.skip}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full max-w-4xl relative"
      >
        {/* Close/Skip button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleSkip}
          className="absolute -top-4 right-0 text-slate-400 hover:text-white text-2xl z-10 bg-slate-900/50 rounded-full h-10 w-10 flex items-center justify-center border border-slate-700"
        >
          ✕
        </motion.button>

        {/* Main photo finish container */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-700/60 bg-slate-900/80 shadow-2xl shadow-orange-500/10">
          
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-4 border-b border-slate-700/50"
          >
            <motion.h1
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.3 }}
              className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 uppercase tracking-wider"
            >
              {t.photo_finish}
            </motion.h1>
            <p className="text-slate-400 text-sm mt-1">
              {challenge.race.distance}km • {challenge.environment.weather}
            </p>
          </motion.div>

          {/* Split screen comparison */}
          <div className="relative flex h-64 md:h-80 bg-slate-800/50">
            
            {/* Player side */}
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 20 }}
              className="flex-1 flex flex-col items-center justify-center p-4 border-r border-slate-700/40"
            >
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-center"
              >
                <div className="text-4xl mb-2">🏃♂️</div>
                <p className="text-white font-bold text-lg">{playerName}</p>
                <p className="text-slate-400 text-sm">
                  {new Date(player.accumulatedTime * 1000).toISOString().substring(14, 19)}.{String(player.accumulatedTime % 1).padStart(3, '0')}
                </p>
              </motion.div>
            </motion.div>

            {/* Opponent side */}
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 20 }}
              className="flex-1 flex flex-col items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-center"
              >
                <div className="text-4xl mb-2">🏃♂️</div>
                <p className="text-white font-bold text-lg">{opponent.name}</p>
                <p className="text-slate-400 text-sm">
                  {new Date(opponent.accumulatedTime * 1000).toISOString().substring(14, 19)}.{String(opponent.accumulatedTime % 1).padStart(3, '0')}
                </p>
              </motion.div>
            </motion.div>

            {/* Finish line animation */}
            <AnimatePresence>
              {isPlaying && !showWinner && (
                <motion.div
                  initial={{ left: "-10%" }}
                  animate={{ left: "110%" }}
                  transition={{ 
                    duration: 2,
                    ease: "linear",
                    delay: 0.8
                  }}
                  className="absolute top-0 bottom-0 w-1 bg-white/80 shadow-[0_0_20px_white]"
                />
              )}
            </AnimatePresence>

            {/* Winner overlay */}
            <AnimatePresence>
              {showWinner && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm flex flex-col items-center justify-center"
                >
                  <motion.div
                    initial={{ scale: 0.5, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    className="text-6xl mb-4"
                  >
                    {isPlayerWinner ? "🏆" : "🥈"}
                  </motion.div>
                  
                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl font-black text-white uppercase tracking-wider"
                  >
                    {t.winner}
                  </motion.h2>
                  
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl text-amber-400 font-bold mt-2"
                  >
                    {winner}
                  </motion.p>
                  
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-slate-400 text-sm mt-2"
                  >
                    {t.by_margin.replace('{margin}', formatMargin(margin))}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer with replay button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: showWinner ? 1.5 : 3 }}
            className="flex justify-center gap-4 py-4 border-t border-slate-700/50"
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleReplay}
              className="px-6 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-full font-semibold border border-slate-600/50 transition-colors"
            >
              {t.replay}
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSkip}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold transition-colors"
            >
              {t.skip}
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Helper function to check if a race result qualifies for photo finish
 */
export function isPhotoFinish(result: SimulationResult, playerName: string = "You"): boolean {
  const finalState = result.stateLog?.[result.stateLog.length - 1];
  if (!finalState || !finalState.opponents) return false;
  
  // Find player and closest opponent
  const player = finalState.opponents.find(o => o.id === "player_local") || {
    id: "player_local",
    accumulatedTime: result.finishTime,
  };
  
  const validOpponents = finalState.opponents.filter(o => !o.isDNF && o.id !== "player_local");
  if (validOpponents.length === 0) return false;
  
  const closestOpponent = validOpponents.reduce((closest, opp) => {
    const margin = Math.abs(result.finishTime - opp.accumulatedTime);
    const closestMargin = Math.abs(result.finishTime - closest.accumulatedTime);
    return margin < closestMargin ? opp : closest;
  }, validOpponents[0]);
  
  const margin = Math.abs(result.finishTime - closestOpponent.accumulatedTime);
  
  // Photo finish if margin is less than 1 second
  return margin < 1.0 && margin > 0.01;
}
