"use client";

import { Moon, Calendar, Coffee } from "lucide-react";
import { useSound } from "@/hooks/use-sound";
import { useTimelineStore } from "@/store/timeline-store";
import { deriveDate } from "@/engine/timeline/calendar";

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

  const { age, yearOffset, month, week, dayOfWeek } = deriveDate(gameState);
  const currentYear = yearOffset + 1;
  const currentMonth = month + 1;
  const currentWeek = week + 1;
  const currentDay = dayOfWeek + 1;

  const energyPercent = (gameState.energy / gameState.energyMax) * 100;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-t border-gray-100 dark:border-slate-800/80 px-3 py-2 md:px-4 md:py-2.5 shadow-[0_-8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_-8px_30px_rgb(0,0,0,0.3)] flex flex-col gap-1.5 md:gap-2">
      {/* Row 1: [ Rest (1 Day) ] [ Rest (1 Week) ] */}
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

      {/* Row 2: [ Calendar & Age ] [ Energy Bar ] */}
      <div className="w-full flex items-center justify-between gap-2">
        {/* Calendar & Age Badge */}
        <div className="flex items-center gap-1.5 shrink-0 text-[10px] md:text-[11px] font-bold text-slate-700 dark:text-slate-300">
          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700/60 font-mono">
            Y{currentYear} M{currentMonth} W{currentWeek} D{currentDay}
          </span>
          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700/60 font-semibold">
            Age {age}
          </span>
        </div>

        {/* Energy Bar */}
        <div className="flex-1 flex items-center gap-1.5 md:gap-2 max-w-[200px] md:max-w-xs">
          <Coffee className="h-3.5 w-3.5 text-orange-500 shrink-0" />
          <div className="relative flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                energyPercent > 50 ? "bg-emerald-400" :
                energyPercent > 20 ? "bg-amber-400" : "bg-rose-400"
              }`}
              style={{ width: energyPercent + "%" }}
            />
          </div>
          <span className="text-[10px] md:text-xs font-black text-slate-600 dark:text-slate-300 shrink-0 text-right">
            {Math.round(gameState.energy)}/{gameState.energyMax}
          </span>
        </div>
      </div>
    </div>
  );
}
