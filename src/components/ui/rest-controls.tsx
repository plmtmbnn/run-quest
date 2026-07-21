"use client";

import { Moon, Calendar, Coffee } from "lucide-react";
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

  const energyPercent = (gameState.energy / gameState.energyMax) * 100;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-t border-gray-100 dark:border-slate-800/80 px-3 py-2 md:px-4 md:py-2.5 shadow-[0_-8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_-8px_30px_rgb(0,0,0,0.3)] flex flex-col gap-1.5 md:gap-2">
      {/* [ Rest (1 Day) ] [ Rest (1 Week) ] */}
      <div className="w-full flex gap-1.5 md:gap-2">
        <button
          type="button"
          onClick={handleRestDay}
          className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 md:py-3 px-3 md:px-4 rounded-xl md:rounded-2xl text-[11px] md:text-xs font-black uppercase tracking-wider bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 border border-slate-950 dark:border-slate-50 active:scale-95 transition-all shadow-sm cursor-pointer"
        >
          <Moon className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
          <span className="truncate">Rest (1 Day)</span>
        </button>
        <button
          type="button"
          onClick={handleRestWeek}
          className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 md:py-3 px-3 md:px-4 rounded-xl md:rounded-2xl text-[11px] md:text-xs font-black uppercase tracking-wider bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-900 dark:border-slate-100 active:scale-95 transition-all shadow-sm cursor-pointer"
        >
          <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
          <span className="truncate">Rest (1 Week)</span>
        </button>
      </div>

      {/* Energy Bar */}
      <div className="w-full flex items-center gap-2 md:gap-2.5">
        <Coffee className="h-3.5 w-3.5 md:h-4 md:w-4 text-orange-500 shrink-0" />
        <div className="relative flex-1 h-2 md:h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              energyPercent > 50 ? "bg-emerald-400" :
              energyPercent > 20 ? "bg-amber-400" : "bg-rose-400"
            }`}
            style={{ width: energyPercent + "%" }}
          />
        </div>
        <span className="text-[10px] md:text-xs font-black text-slate-600 dark:text-slate-300 shrink-0 w-14 text-right">
          {Math.round(gameState.energy)}/{gameState.energyMax}
        </span>
      </div>
    </div>
  );
}
