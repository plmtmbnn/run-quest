"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { RaceAchievement } from "@/engine/achievements/race-achievements";

interface MicroAchievementPopupProps {
  /** Queue of achievements to display */
  queue: (RaceAchievement & { isFirstTime: boolean; instanceId: string })[];
  onDismiss: (instanceId: string) => void;
}

/**
 * Renders up to 3 simultaneously visible achievement popups stacked from the
 * top-right corner. Each auto-dismisses after 2.5 seconds.
 */
export function MicroAchievementPopup({ queue, onDismiss }: MicroAchievementPopupProps) {
  // Only show the top 3 from the queue
  const visible = queue.slice(0, 3);

  return (
    <div className="fixed top-20 right-4 z-40 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {visible.map((achievement, stackIndex) => (
          <SingleAchievement
            key={achievement.instanceId}
            achievement={achievement}
            stackIndex={stackIndex}
            onDismiss={() => onDismiss(achievement.instanceId)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface SingleAchievementProps {
  achievement: RaceAchievement & { isFirstTime: boolean; instanceId: string };
  stackIndex: number;
  onDismiss: () => void;
}

function SingleAchievement({ achievement, stackIndex, onDismiss }: SingleAchievementProps) {
  const [shouldShow, setShouldShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldShow(false);
      // Give exit animation time to complete before removing from queue
      setTimeout(onDismiss, 300);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!shouldShow) return null;

  return (
    <motion.div
      layout
      initial={{ x: 120, opacity: 0, scale: 0.85 }}
      animate={{
        x: 0,
        opacity: 1,
        scale: 1,
        // Stack visually — items below are slightly smaller
        ...(stackIndex > 0 && { opacity: 1 - stackIndex * 0.1, scale: 1 - stackIndex * 0.03 }),
      }}
      exit={{ x: 80, opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      style={{ transformOrigin: "right center" }}
      className="pointer-events-auto w-64 max-w-[90vw]"
    >
      <div
        className={`
          relative flex items-center gap-3 p-3 pr-4
          rounded-2xl border shadow-lg backdrop-blur-sm
          bg-gradient-to-r from-white/95 to-orange-50/95
          dark:from-gray-900/95 dark:to-orange-950/30
          border-orange-200/80 dark:border-orange-800/60
          shadow-orange-500/10
        `}
      >
        {/* Icon bubble */}
        <motion.div
          initial={{ scale: 0.5, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.05 }}
          className="shrink-0 w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/50 border border-orange-200 dark:border-orange-800 flex items-center justify-center text-xl shadow-sm"
        >
          {achievement.icon}
        </motion.div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-black text-slate-800 dark:text-white leading-tight">
              {achievement.title.en}
            </span>
            {achievement.isFirstTime && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 600, damping: 15, delay: 0.15 }}
                className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-600 dark:text-amber-400"
              >
                🏆 FIRST!
              </motion.span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 dark:text-gray-400 leading-tight mt-0.5 line-clamp-2">
            {achievement.description.en}
          </p>
        </div>

        {/* Shimmer glow overlay */}
        <motion.div
          initial={{ opacity: 0.6, x: -40 }}
          animate={{ opacity: 0, x: 80 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none"
        />
      </div>
    </motion.div>
  );
}
