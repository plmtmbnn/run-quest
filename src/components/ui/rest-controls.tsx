"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Calendar, Coffee, Moon } from "lucide-react";
import { useCallback, useMemo } from "react";
import { deriveDate } from "@/engine/timeline/calendar";
import { useSound } from "@/hooks/use-sound";
import { useTimelineStore } from "@/store/timeline-store";

interface RestButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
}

function RestButton({
  onClick,
  icon,
  label,
  primary = false,
}: RestButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className={`flex-1 inline-flex items-center justify-center gap-2 min-h-[44px] md:min-h-[48px] py-2.5 px-3 md:px-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-black uppercase tracking-wider transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/80 ${
        primary
          ? "bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 border border-slate-950 dark:border-slate-50 shadow-md shadow-slate-900/10 dark:shadow-none"
          : "bg-white dark:bg-slate-900/90 hover:bg-slate-100/80 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 border-2 border-slate-200 dark:border-slate-700/80 shadow-xs"
      }`}
      aria-label={label}
      title={label}
    >
      {icon}
      <span className="truncate">{label}</span>
    </motion.button>
  );
}

export function RestControls() {
  const doAction = useTimelineStore((state) => state.doAction);
  const ff = useTimelineStore((state) => state.ff);
  const gameState = useTimelineStore((state) => state.gameState);
  const pendingEvents = useTimelineStore((state) => state.pendingEvents);
  const { playSound } = useSound();

  const handleRestDay = useCallback(() => {
    playSound("click");
    doAction("rest");
  }, [doAction, playSound]);

  const handleRestWeek = useCallback(() => {
    playSound("click");
    if (!gameState) return;
    ff("week");
  }, [gameState, ff, playSound]);

  const { age, yearOffset, month, week, dayOfWeek } = useMemo(
    () =>
      gameState
        ? deriveDate(gameState)
        : { age: 0, yearOffset: 0, month: 0, week: 0, dayOfWeek: 0 },
    [gameState],
  );

  const currentYear = useMemo(() => yearOffset + 1, [yearOffset]);
  const currentMonth = useMemo(() => month + 1, [month]);
  const currentWeek = useMemo(() => week + 1, [week]);
  const currentDay = useMemo(() => dayOfWeek + 1, [dayOfWeek]);

  if (!gameState) return null;

  const energy = Math.max(0, Math.min(gameState.energy, gameState.energyMax));
  const energyMax = Math.max(1, gameState.energyMax); // Avoid division by zero
  const energyPercent =
    gameState.energyMax > 0
      ? (gameState.energy / gameState.energyMax) * 100
      : 0;

  const hasHaltedRaceEvent = pendingEvents.some(
    (e) => e.type === "competition",
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 px-3.5 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-6 md:pt-3 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.4)]">
      <div className="max-w-4xl mx-auto flex flex-col gap-2 md:gap-2.5">
        {/* Row 1: Action Buttons [ Rest (1 Day) ] [ Rest (1 Week) ] */}
        <div className="w-full flex gap-2 md:gap-3">
          <RestButton
            onClick={handleRestDay}
            icon={<Moon className="h-4 w-4 md:h-4.5 md:w-4.5 shrink-0" />}
            label="Rest (1 Day)"
            primary
          />
          <RestButton
            onClick={handleRestWeek}
            icon={<Calendar className="h-4 w-4 md:h-4.5 md:w-4.5 shrink-0" />}
            label="Rest (1 Week)"
          />
        </div>

        {/* Pending Events Feedback — Halted Rest Warning */}
        <AnimatePresence>
          {hasHaltedRaceEvent && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -4 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="w-full bg-amber-500/10 dark:bg-amber-500/15 border border-amber-300/80 dark:border-amber-700/60 rounded-xl px-3 py-2 flex items-center gap-2 text-amber-800 dark:text-amber-200 shadow-xs">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 animate-pulse" />
                <span className="text-xs md:text-xs font-bold truncate">
                  Rest halted: Registered race tomorrow!
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Row 2: Status Meta & Energy Bar */}
        <div className="w-full flex items-center justify-between gap-2.5 md:gap-4">
          {/* Calendar & Age Badges */}
          <div className="flex items-center gap-1.5 shrink-0 text-[10px] sm:text-[11px] md:text-xs font-bold text-slate-700 dark:text-slate-200">
            <span className="bg-slate-100/90 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200/90 dark:border-slate-700/70 font-mono tracking-tight shadow-2xs">
              Y{currentYear} M{currentMonth} W{currentWeek} D{currentDay}
            </span>
            <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-lg border border-indigo-200/80 dark:border-indigo-800/50 font-semibold shadow-2xs">
              Age {age}
            </span>
          </div>

          {/* Energy Level Bar */}
          <div className="flex-1 flex items-center gap-1.5 md:gap-2 max-w-[180px] sm:max-w-[220px] md:max-w-xs">
            <Coffee
              className={`h-4 w-4 shrink-0 transition-colors ${
                energyPercent > 50
                  ? "text-emerald-500 dark:text-emerald-400"
                  : energyPercent > 20
                    ? "text-amber-500 dark:text-amber-400"
                    : "text-rose-500 dark:text-rose-400"
              }`}
              aria-hidden="true"
            />
            <div
              className="relative flex-1 h-2.5 md:h-3 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden border border-slate-200/80 dark:border-slate-700/70"
              role="progressbar"
              aria-valuenow={Math.round(gameState.energy)}
              aria-valuemin={0}
              aria-valuemax={gameState.energyMax}
              aria-label={`Energy level: ${Math.round(energy)}/${energyMax}`}
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  energyPercent > 50
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.35)]"
                    : energyPercent > 20
                      ? "bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_10px_rgba(245,158,11,0.35)]"
                      : "bg-gradient-to-r from-rose-500 to-red-400 shadow-[0_0_10px_rgba(244,63,94,0.35)]"
                }`}
                style={{ width: `${energyPercent}%` }}
              />
            </div>
            <span className="text-[11px] md:text-xs font-black text-slate-700 dark:text-slate-200 shrink-0 text-right font-mono">
              {Math.round(gameState.energy)}/{gameState.energyMax}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
