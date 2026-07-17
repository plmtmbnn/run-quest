"use client";

import { motion } from "framer-motion";
import { Moon, Calendar } from "lucide-react";
import { useSound } from "@/hooks/use-sound";
import { useTimelineStore } from "@/store/timeline-store";

export function RestControls() {
  const { doAction, ff, gameState } = useTimelineStore();
  const { playSound } = useSound();

  if (!gameState) return null;

  const handleRestDay = () => {
    playSound("click");
    doAction("rest");
  };

  const handleRestWeek = () => {
    playSound("click");
    ff("week");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-t border-gray-100 dark:border-slate-800/80 px-6 py-4 shadow-[0_-8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_-8px_30px_rgb(0,0,0,0.3)] flex justify-center items-center gap-4">
      <div className="max-w-md w-full flex gap-3">
        <button
          type="button"
          onClick={handleRestDay}
          className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-wider bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 border border-slate-950 dark:border-slate-50 active:scale-95 transition-all transform shadow-sm cursor-pointer"
        >
          <Moon className="h-4 w-4" />
          <span>Rest (1 Day)</span>
        </button>
        <button
          type="button"
          onClick={handleRestWeek}
          className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-wider bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-850 text-slate-900 dark:text-white border-2 border-slate-900 dark:border-slate-100 active:scale-95 transition-all transform shadow-sm cursor-pointer"
        >
          <Calendar className="h-4 w-4" />
          <span>Rest (1 Week)</span>
        </button>
      </div>
    </div>
  );
}
