"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface SplitCalloutProps {
  km: number;
  splitTime: number; // Time for this specific km in seconds
  cumulativeTime: number; // Total time so far in seconds
  comparisonTime?: number; // PB split time for comparison (optional)
  onDismiss?: () => void;
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
 * Get performance status based on comparison to PB
 */
function getPerformanceStatus(
  splitTime: number,
  comparisonTime?: number,
): {
  status: "faster" | "slower" | "way_slower" | "neutral";
  difference: number;
  gradient: string;
  icon: string;
} {
  if (!comparisonTime) {
    return {
      status: "neutral",
      difference: 0,
      gradient: "from-blue-500 to-indigo-600",
      icon: "⏱️",
    };
  }

  const diff = splitTime - comparisonTime;

  if (diff <= -5) {
    // 5+ seconds faster
    return {
      status: "faster",
      difference: diff,
      gradient: "from-emerald-500 to-green-600",
      icon: "🔥",
    };
  } else if (diff < 0) {
    // Slightly faster
    return {
      status: "faster",
      difference: diff,
      gradient: "from-green-500 to-emerald-600",
      icon: "💪",
    };
  } else if (diff <= 5) {
    // Slightly slower
    return {
      status: "slower",
      difference: diff,
      gradient: "from-amber-500 to-orange-600",
      icon: "⚠️",
    };
  } else {
    // Way slower
    return {
      status: "way_slower",
      difference: diff,
      gradient: "from-rose-500 to-red-600",
      icon: "🚨",
    };
  }
}

/**
 * Get motivational message based on performance
 */
function getMotivationalMessage(
  status: "faster" | "slower" | "way_slower" | "neutral",
  difference: number,
): string {
  if (status === "faster") {
    if (difference <= -5) {
      return "CRUSHING IT! Way ahead of your PB!";
    }
    return `${Math.abs(difference)}s FASTER than your PB pace!`;
  } else if (status === "slower") {
    return `${difference}s slower - pick it up!`;
  } else if (status === "way_slower") {
    return `${difference}s behind - DIG DEEPER!`;
  }
  return "Keep your pace steady!";
}

/**
 * SplitCallout - Dramatic kilometer split time notification
 * Displays large animated callout with PB comparison
 */
export function SplitCallout({
  km,
  splitTime,
  cumulativeTime,
  comparisonTime,
  onDismiss,
}: SplitCalloutProps) {
  const [visible, setVisible] = useState(true);
  const performance = getPerformanceStatus(splitTime, comparisonTime);
  const message = getMotivationalMessage(
    performance.status,
    performance.difference,
  );

  useEffect(() => {
    // Auto-dismiss after 3 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        onDismiss?.();
      }, 300); // Wait for fade out animation
    }, 3000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
          }}
          className="fixed top-20 left-0 right-0 z-50 flex justify-center px-4"
        >
          <div
            className={`bg-gradient-to-r ${performance.gradient} rounded-3xl px-8 py-6 shadow-2xl border-4 border-white/20 max-w-lg w-full`}
          >
            {/* Kilometer Marker */}
            <div className="text-center mb-3">
              <span className="text-white/80 text-sm font-bold uppercase tracking-widest">
                Kilometer {km}
              </span>
            </div>

            {/* Split Time - Large Display */}
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-3">
                <span className="text-6xl">{performance.icon}</span>
                <span className="font-mono font-black text-white text-6xl md:text-7xl drop-shadow-lg">
                  {formatTime(splitTime)}
                </span>
              </div>
            </div>

            {/* Performance Comparison Message */}
            {comparisonTime && (
              <div className="text-center mb-3">
                <p className="text-white font-bold text-lg md:text-xl">
                  {message}
                </p>
              </div>
            )}

            {/* Cumulative Time */}
            <div className="text-center border-t-2 border-white/30 pt-3">
              <span className="text-white/80 text-xs uppercase tracking-wider font-bold">
                Total Time
              </span>
              <div className="font-mono font-bold text-white text-2xl">
                {formatTime(cumulativeTime)}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook to manage split callout queue
 */
export function useSplitCalloutQueue() {
  const [activeSplit, setActiveSplit] = useState<{
    km: number;
    splitTime: number;
    cumulativeTime: number;
    comparisonTime?: number;
  } | null>(null);

  const [lastKmShown, setLastKmShown] = useState(0);

  const triggerSplitCallout = (
    km: number,
    splitTime: number,
    cumulativeTime: number,
    comparisonTime?: number,
  ) => {
    // Only trigger for whole kilometers
    const wholeKm = Math.floor(km);
    if (wholeKm === lastKmShown || wholeKm === 0) {
      return;
    }

    setActiveSplit({
      km: wholeKm,
      splitTime,
      cumulativeTime,
      comparisonTime,
    });
    setLastKmShown(wholeKm);
  };

  const dismissSplitCallout = () => {
    setActiveSplit(null);
  };

  return {
    activeSplit,
    triggerSplitCallout,
    dismissSplitCallout,
  };
}
