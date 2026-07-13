"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "@/i18n/use-translation";
import type { SimulationResult } from "@/types/engine";

interface RaceOutcomeCinematicProps {
  result: SimulationResult;
  onComplete: () => void;
  allowSkip?: boolean;
}

/**
 * Victory/Defeat Cinematic Component
 * Creates emotional moments after race completion
 */
export function RaceOutcomeCinematic({
  result,
  onComplete,
  allowSkip = true,
}: RaceOutcomeCinematicProps) {
  const { t } = useTranslation();
  const [canSkip, setCanSkip] = useState(false);
  const [showSkipHint, setShowSkipHint] = useState(false);

  const isVictory =
    result.outcome === "gold" ||
    result.outcome === "silver" ||
    result.outcome === "bronze";
  const isPersonalBest = (result as any).isPersonalBest || false;
  const isClose = result.grade === "A" || result.grade === "B";

  useEffect(() => {
    // Allow skip after 2 seconds
    const skipTimer = setTimeout(() => {
      setCanSkip(true);
      setShowSkipHint(true);
    }, 2000);

    // Hide skip hint after 3 seconds
    const hintTimer = setTimeout(() => {
      setShowSkipHint(false);
    }, 5000);

    // Auto-complete after 5 seconds
    const autoComplete = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => {
      clearTimeout(skipTimer);
      clearTimeout(hintTimer);
      clearTimeout(autoComplete);
    };
  }, [onComplete]);

  const handleSkip = () => {
    if (canSkip && allowSkip) {
      onComplete();
    }
  };

  // Determine cinematic type
  if (isPersonalBest) {
    return (
      <PersonalBestCinematic
        result={result}
        onSkip={handleSkip}
        canSkip={canSkip}
        showSkipHint={showSkipHint}
      />
    );
  }

  if (isVictory) {
    return (
      <VictoryCinematic
        result={result}
        onSkip={handleSkip}
        canSkip={canSkip}
        showSkipHint={showSkipHint}
        isClose={isClose}
      />
    );
  }

  return (
    <DefeatCinematic
      result={result}
      onSkip={handleSkip}
      canSkip={canSkip}
      showSkipHint={showSkipHint}
      isClose={isClose}
    />
  );
}

/**
 * Victory Cinematic
 */
function VictoryCinematic({
  result,
  onSkip,
  canSkip,
  showSkipHint,
  isClose,
}: {
  result: SimulationResult;
  onSkip: () => void;
  canSkip: boolean;
  showSkipHint: boolean;
  isClose: boolean;
}) {
  const coachQuote = isClose
    ? "THAT WAS INCREDIBLE! What a finish!"
    : "I KNEW you had it in you! Brilliant race!";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={canSkip ? onSkip : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-green-900"
    >
      {/* Confetti Effect */}
      <ConfettiAnimation />

      {/* Main Content */}
      <div className="text-center px-6 max-w-2xl">
        {/* Trophy Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.8, delay: 0.2 }}
          className="mb-6"
        >
          <div className="text-9xl">🏆</div>
        </motion.div>

        {/* Victory Text */}
        <motion.h1
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-6xl font-black text-yellow-300 mb-4 drop-shadow-lg"
        >
          VICTORY!
        </motion.h1>

        {/* Grade Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.8 }}
          className="inline-block mb-6"
        >
          <div className="bg-yellow-400 text-green-900 text-4xl font-black px-8 py-4 rounded-full border-4 border-yellow-200 shadow-xl">
            Grade {result.grade}
          </div>
        </motion.div>

        {/* Coach Quote */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/20"
        >
          <div className="text-sm text-yellow-200 font-semibold mb-2">
            💬 YOUR COACH
          </div>
          <p className="text-2xl text-white font-semibold italic">
            "{coachQuote}"
          </p>
        </motion.div>
      </div>

      {/* Skip Hint */}
      <AnimatePresence>
        {showSkipHint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-8 text-white/60 text-sm"
          >
            Click anywhere to continue
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * Defeat Cinematic
 */
function DefeatCinematic({
  result,
  onSkip,
  canSkip,
  showSkipHint,
  isClose,
}: {
  result: SimulationResult;
  onSkip: () => void;
  canSkip: boolean;
  showSkipHint: boolean;
  isClose: boolean;
}) {
  const coachQuote = isClose
    ? "You were SO close. We'll get them next time."
    : "Sometimes we learn more from defeats than victories. Let's analyze and come back stronger.";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={canSkip ? onSkip : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
    >
      {/* Main Content */}
      <div className="text-center px-6 max-w-2xl">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6, delay: 0.2 }}
          className="mb-6"
        >
          <div className="text-8xl">{isClose ? "😤" : "😔"}</div>
        </motion.div>

        {/* Result Text */}
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-5xl font-black text-slate-300 mb-4"
        >
          {isClose ? "So Close!" : "Not This Time"}
        </motion.h1>

        {/* Grade Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.8 }}
          className="inline-block mb-6"
        >
          <div className="bg-slate-700 text-slate-200 text-3xl font-black px-6 py-3 rounded-full border-2 border-slate-600 shadow-xl">
            Grade {result.grade}
          </div>
        </motion.div>

        {/* Coach Quote */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/10"
        >
          <div className="text-sm text-slate-400 font-semibold mb-2">
            💬 YOUR COACH
          </div>
          <p className="text-xl text-slate-200 font-medium italic">
            "{coachQuote}"
          </p>
        </motion.div>

        {/* Motivation */}
        {isClose && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-6"
          >
            <p className="text-orange-400 font-bold text-lg">
              ⚡ REMATCH AVAILABLE NOW
            </p>
          </motion.div>
        )}
      </div>

      {/* Skip Hint */}
      <AnimatePresence>
        {showSkipHint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-8 text-white/40 text-sm"
          >
            Click anywhere to continue
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * Personal Best Cinematic
 */
function PersonalBestCinematic({
  result,
  onSkip,
  canSkip,
  showSkipHint,
}: {
  result: SimulationResult;
  onSkip: () => void;
  canSkip: boolean;
  showSkipHint: boolean;
}) {
  const coachQuote =
    "You just REWROTE your own record! This is what we've been building toward!";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={canSkip ? onSkip : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900"
    >
      {/* Fireworks Effect */}
      <FireworksAnimation />

      {/* Main Content */}
      <div className="text-center px-6 max-w-2xl">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.8, delay: 0.2 }}
          className="mb-6"
        >
          <div className="text-9xl">⚡</div>
        </motion.div>

        {/* Main Text */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-3xl text-yellow-300 font-bold mb-2">
            🎉 PERSONAL BEST! 🎉
          </h2>
          <h1 className="text-7xl font-black text-white mb-4 drop-shadow-lg">
            NEW RECORD
          </h1>
        </motion.div>

        {/* Time Display */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.8 }}
          className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6 border-2 border-white/30"
        >
          <div className="text-6xl font-mono font-black text-yellow-300">
            {formatTime(result.finishTime)}
          </div>
        </motion.div>

        {/* Coach Quote */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/20"
        >
          <div className="text-sm text-yellow-200 font-semibold mb-2">
            💬 YOUR COACH
          </div>
          <p className="text-2xl text-white font-semibold italic">
            "{coachQuote}"
          </p>
        </motion.div>
      </div>

      {/* Skip Hint */}
      <AnimatePresence>
        {showSkipHint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-8 text-white/60 text-sm"
          >
            Click anywhere to continue
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * Confetti Animation Component
 */
function ConfettiAnimation() {
  const confettiPieces = Array.from({ length: 50 });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {confettiPieces.map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * window.innerWidth,
            y: -20,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            y: window.innerHeight + 20,
            rotate: Math.random() * 720 - 360,
            opacity: 0,
          }}
          transition={{
            duration: Math.random() * 2 + 2,
            delay: Math.random() * 0.5,
            ease: "easeIn",
          }}
          className="absolute w-3 h-3 rounded-full"
          style={{
            backgroundColor: [
              "#FFD700",
              "#FFA500",
              "#FF6347",
              "#98FB98",
              "#87CEEB",
            ][Math.floor(Math.random() * 5)],
          }}
        />
      ))}
    </div>
  );
}

/**
 * Fireworks Animation Component
 */
function FireworksAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{
            duration: 1.5,
            delay: i * 0.5,
            repeat: Infinity,
            repeatDelay: 1.5,
          }}
          className="absolute rounded-full border-4 border-yellow-400"
          style={{
            left: `${30 + i * 20}%`,
            top: `${20 + i * 15}%`,
            width: "100px",
            height: "100px",
          }}
        />
      ))}
    </div>
  );
}

/**
 * Format time helper
 */
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}
