"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface PRCelebrationProps {
  previousTime: number; // Previous PB in seconds
  newTime: number; // New time in seconds
  distance: number; // Race distance in km
  onDismiss: () => void;
  onShare: () => void;
}

/**
 * Format seconds to MM:SS format
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Calculate improvement between times
 */
function calculateImprovement(previousTime: number, newTime: number): number {
  return previousTime - newTime;
}

/**
 * Get improvement message based on time difference
 */
function getImprovementMessage(improvement: number): string {
  if (improvement >= 60) {
    const minutes = Math.floor(improvement / 60);
    const seconds = improvement % 60;
    return `🎉 ${minutes}m ${seconds}s FASTER!`;
  } else if (improvement >= 30) {
    return `🎉 ${improvement}s FASTER!`;
  } else if (improvement >= 10) {
    return `⚡ ${improvement}s improvement!`;
  } else {
    return `🔥 New PB by ${improvement}s!`;
  }
}

/**
 * PRCelebration - Personal Record celebration animation
 * Shows confetti, PB comparison, and social share prompt
 */
export function PRCelebration({
  previousTime,
  newTime,
  distance,
  onDismiss,
  onShare,
}: PRCelebrationProps) {
  const [visible, setVisible] = useState(true);
  const [confettiPieces, setConfettiPieces] = useState<
    {
      id: number;
      x: number;
      y: number;
      color: string;
      size: number;
      rotation: number;
    }[]
  >([]);

  const improvement = calculateImprovement(previousTime, newTime);
  const improvementMessage = getImprovementMessage(improvement);

  useEffect(() => {
    // Generate confetti pieces
    const pieces = [];
    const colors = [
      "#10b981",
      "#3b82f6",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#fbbf24",
    ];

    for (let i = 0; i < 150; i++) {
      pieces.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
        rotation: Math.random() * 360,
      });
    }

    setConfettiPieces(pieces);

    // Auto-dismiss after 8 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 8000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 300);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* CSS Confetti Animation */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {confettiPieces.map((piece) => (
              <motion.div
                key={piece.id}
                initial={{
                  x: `${piece.x}%`,
                  y: "100vh",
                  opacity: 0,
                  rotate: piece.rotation,
                }}
                animate={{
                  x: `${piece.x + (Math.random() - 0.5) * 20}%`,
                  y: "-20vh",
                  opacity: [0, 1, 0],
                  rotate: [
                    piece.rotation,
                    piece.rotation + 360,
                    piece.rotation + 720,
                  ],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  delay: Math.random() * 2,
                  ease: "easeOut",
                }}
                style={{
                  position: "absolute",
                  width: `${piece.size}px`,
                  height: `${piece.size}px`,
                  backgroundColor: piece.color,
                  borderRadius: Math.random() > 0.5 ? "50%" : "0",
                  top: 0,
                  left: 0,
                }}
              />
            ))}
          </div>

          {/* Background Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-purple-900/40 to-slate-900/90 backdrop-blur-lg" />

          {/* Main Card */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="relative bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 rounded-3xl p-8 md:p-12 max-w-lg w-full shadow-2xl border-4 border-yellow-400/30"
          >
            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white font-bold text-xl transition-all"
            >
              ×
            </button>

            {/* NEW PR Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                className="bg-white text-amber-600 px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wider shadow-lg border-2 border-amber-400"
              >
                🏆 NEW PERSONAL RECORD! 🏆
              </motion.div>
            </div>

            {/* Main Content */}
            <div className="text-center space-y-6 mt-6">
              {/* Celebration Emoji */}
              <motion.div
                initial={{ scale: 0, rotate: 10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                className="text-8xl"
              >
                🎉
              </motion.div>

              {/* Congratulations */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-4xl md:text-5xl font-heading font-black text-white"
              >
                Congratulations!
              </motion.h2>

              {/* Improvement Display */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white/20 backdrop-blur-sm rounded-2xl p-6"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80 text-sm uppercase font-bold tracking-wider">
                      Previous Best
                    </span>
                    <span className="font-mono font-bold text-white text-xl">
                      {formatTime(previousTime)}
                    </span>
                  </div>
                  <div className="flex justify-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 }}
                      className="text-4xl"
                    >
                      ↓
                    </motion.div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80 text-sm uppercase font-bold tracking-wider">
                      New Record
                    </span>
                    <span className="font-mono font-bold text-emerald-400 text-2xl">
                      {formatTime(newTime)}
                    </span>
                  </div>
                  <div className="border-t-2 border-white/30 pt-3">
                    <span className="text-white/80 text-sm uppercase font-bold tracking-wider">
                      Improvement
                    </span>
                    <div className="font-mono font-bold text-emerald-400 text-3xl">
                      {improvementMessage}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Distance Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 }}
                className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl"
              >
                <span className="font-bold text-white uppercase tracking-wider">
                  {distance}km
                </span>
              </motion.div>

              {/* Share Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                onClick={onShare}
                className="w-full bg-white text-amber-600 hover:bg-amber-50 font-bold py-4 rounded-2xl text-lg transition-all shadow-lg hover:shadow-xl"
              >
                📤 Share Your Achievement
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook to detect if a new personal record was achieved
 */
export function usePRDetection(
  currentTime: number,
  distance: number,
  playerProfile: any,
) {
  const [isNewPR, setIsNewPR] = useState(false);
  const [previousTime, setPreviousTime] = useState<number | null>(null);

  useEffect(() => {
    if (!playerProfile?.runHistory) {
      setIsNewPR(false);
      return;
    }

    // Find previous best time for this distance
    const previousRuns = playerProfile.runHistory.filter(
      (run: any) => run.distance === distance,
    );

    if (previousRuns.length === 0) {
      // First time at this distance - always a PR!
      setIsNewPR(true);
      setPreviousTime(null);
    } else {
      // Sort by time (ascending) and get the best
      const sortedRuns = [...previousRuns].sort(
        (a: any, b: any) => a.finishTime - b.finishTime,
      );
      const bestTime = sortedRuns[0].finishTime;

      if (currentTime < bestTime) {
        setIsNewPR(true);
        setPreviousTime(bestTime);
      } else {
        setIsNewPR(false);
        setPreviousTime(null);
      }
    }
  }, [currentTime, distance, playerProfile]);

  return { isNewPR, previousTime };
}
