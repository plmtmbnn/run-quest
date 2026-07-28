"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface FinishLineSequenceProps {
  finalTime: number; // Total race time in seconds
  initialHeartRate: number; // BPM at finish
  onComplete: () => void;
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
 * FinishLineSequence - Emotional finish line recovery animation
 * Shows runner collapsing, breathing heavily, and gradually recovering
 */
export function FinishLineSequence({
  finalTime,
  initialHeartRate,
  onComplete,
}: FinishLineSequenceProps) {
  const [phase, setPhase] = useState<
    "crossing" | "collapse" | "breathing" | "recovery" | "complete"
  >("crossing");
  const [heartRate, setHeartRate] = useState(initialHeartRate);
  const [breathingRate, setBreathingRate] = useState(2.0); // Fast breathing (breaths per second)
  const [showSkip, setShowSkip] = useState(false);

  useEffect(() => {
    // Sequence timeline
    const timers: NodeJS.Timeout[] = [];

    // Phase 1: Crossing (0-1s)
    timers.push(
      setTimeout(() => {
        setPhase("collapse");
      }, 1000)
    );

    // Phase 2: Collapse (1-2s)
    timers.push(
      setTimeout(() => {
        setPhase("breathing");
      }, 2000)
    );

    // Phase 3: Heavy breathing + HR decrease (2-4s)
    // Gradually decrease heart rate and breathing
    const breathingInterval = setInterval(() => {
      setHeartRate((prev) => Math.max(140, prev - 5));
      setBreathingRate((prev) => Math.max(0.8, prev - 0.15));
    }, 200);
    timers.push(breathingInterval as any);

    timers.push(
      setTimeout(() => {
        clearInterval(breathingInterval);
        setPhase("recovery");
      }, 4000)
    );

    // Phase 4: Recovery (4-5s)
    timers.push(
      setTimeout(() => {
        setPhase("complete");
        onComplete();
      }, 5000)
    );

    // Show skip option after 2 seconds
    timers.push(
      setTimeout(() => {
        setShowSkip(true);
      }, 2000)
    );

    return () => {
      timers.forEach((timer) => clearTimeout(timer as any));
    };
  }, [onComplete]);

  const handleSkip = () => {
    setPhase("complete");
    onComplete();
  };

  // Handle keyboard skip
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showSkip) {
        handleSkip();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [showSkip]);

  if (phase === "complete") {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-lg flex items-center justify-center"
      >
        <div className="max-w-2xl w-full px-6 flex flex-col items-center gap-8">
          {/* Runner Silhouette Animation */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            {phase === "crossing" && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="text-9xl"
              >
                🏃
              </motion.div>
            )}

            {phase === "collapse" && (
              <motion.div
                initial={{ rotate: 0, y: 0 }}
                animate={{ rotate: 45, y: 20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="text-9xl"
              >
                🧎
              </motion.div>
            )}

            {(phase === "breathing" || phase === "recovery") && (
              <>
                {/* Collapsed Runner */}
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: breathingRate,
                    repeat: phase === "breathing" ? Infinity : 0,
                    ease: "easeInOut",
                  }}
                  className="text-9xl"
                >
                  {phase === "breathing" ? "🧎" : "🧍"}
                </motion.div>

                {/* Breathing Indicator */}
                {phase === "breathing" && (
                  <motion.div
                    animate={{
                      scale: [0.5, 1.2, 0.5],
                      opacity: [0.3, 0.7, 0.3],
                    }}
                    transition={{
                      duration: breathingRate,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 rounded-full border-4 border-blue-400"
                  />
                )}
              </>
            )}
          </div>

          {/* Status Text */}
          <div className="text-center space-y-4">
            {phase === "crossing" && (
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-5xl font-heading font-black text-white"
              >
                Race Complete!
              </motion.h2>
            )}

            {phase === "collapse" && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-2xl text-slate-300 italic"
              >
                *Heavy breathing*
              </motion.p>
            )}

            {phase === "breathing" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                <p className="text-xl text-slate-300">Recovering...</p>
                <div className="flex items-center justify-center gap-6">
                  <div className="flex flex-col items-center">
                    <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                      Heart Rate
                    </span>
                    <span className="text-3xl font-mono font-bold text-rose-400">
                      {Math.round(heartRate)} BPM
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                      Breathing
                    </span>
                    <span className="text-3xl font-mono font-bold text-blue-400">
                      {breathingRate > 1.5
                        ? "Fast"
                        : breathingRate > 1
                          ? "Slowing"
                          : "Calm"}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {phase === "recovery" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <p className="text-xl text-emerald-400">Recovered</p>
                <div className="border-t-2 border-slate-700 pt-4">
                  <span className="text-sm uppercase tracking-wider text-slate-400 font-bold">
                    Final Time
                  </span>
                  <div className="text-6xl font-mono font-black text-white mt-2">
                    {formatTime(finalTime)}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Calculating Results Text */}
          {(phase === "breathing" || phase === "recovery") && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-sm text-slate-400"
            >
              Calculating results...
            </motion.p>
          )}

          {/* Skip Prompt */}
          {showSkip && (phase === "crossing" || phase === "collapse" || phase === "breathing" || phase === "recovery") && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleSkip}
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              Press any key to skip
            </motion.button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
