"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Globe, X } from "lucide-react";
import { LeaderboardService, type ActivityFeedItem } from "@/services/leaderboard/leaderboard-service";

interface MiniLiveActivityFeedProps {
  isRaceActive: boolean;
}

export function LiveActivityFeed({ isRaceActive }: MiniLiveActivityFeedProps) {
  const [currentEvent, setCurrentEvent] = useState<ActivityFeedItem | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (!isRaceActive || isDismissed) return;

    // Load current activities
    const feed = LeaderboardService.getActivityFeed();
    if (feed.length > 0) {
      setCurrentEvent(feed[0]);
    }

    // Periodically cycle or introduce subtle simulated live feed events
    const interval = setInterval(() => {
      const latest = LeaderboardService.getActivityFeed();
      const randomIdx = Math.floor(Math.random() * latest.length);
      if (latest[randomIdx]) {
        setCurrentEvent(latest[randomIdx]);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [isRaceActive, isDismissed]);

  if (!isRaceActive || isDismissed || !currentEvent) return null;

  return (
    <div className="fixed top-20 right-4 z-40 max-w-xs pointer-events-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentEvent.id}
          initial={{ opacity: 0, x: 20, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.9 }}
          className="bg-white/90 dark:bg-slate-900/90 border border-[#E5E7EB] dark:border-slate-800 rounded-2xl p-3 shadow-lg backdrop-blur-md flex items-start gap-2.5"
        >
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 shrink-0">
            <Trophy className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <Globe className="w-3 h-3 text-indigo-400" />
                Global Feed
              </span>
              <button
                type="button"
                onClick={() => setIsDismissed(true)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full"
                title="Dismiss mini feed"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-white truncate mt-0.5">
              {currentEvent.playerName}
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 font-sans">
              {currentEvent.achievement}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
