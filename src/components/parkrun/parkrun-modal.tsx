"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Play, Clock, Zap, TrendingUp, X, MapPin, Users } from "lucide-react";
import { useParkrunStore, type ParkrunEvent } from "@/store/parkrun-store";
import { useLoadoutStore } from "@/store/loadout-store";
import { useGameStore } from "@/store/game-store";
import { generateRaceChallenge } from "@/services/challenge/generator";
import { useSound } from "@/hooks/use-sound";
import { useTimelineStore } from "@/store/timeline-store";
import type { Surface, Elevation } from "@/types/engine";
import type { Distance } from "@/store/focus-progression-store";

interface ParkrunModalProps {
  onClose: () => void;
}

/**
 * Parkrun Modal - Quick access to always-available races
 * Shows in Career Mode for immediate racing without registration
 */
export function ParkrunModal({ onClose }: ParkrunModalProps) {
  const router = useRouter();
  const { playSound } = useSound();
  const { availableParkruns, getBestTime } = useParkrunStore();
  const { getLoadoutsForDistance } = useLoadoutStore();
  const { setChallenge } = useGameStore();
  
  const [selectedParkrun, setSelectedParkrun] = useState<ParkrunEvent | null>(null);
  const [selectedLoadout, setSelectedLoadout] = useState<string | null>(null);
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };
  
  const currentDayIndex = useTimelineStore((state) => state.gameState?.dayIndex ?? 0);

  const handleStartParkrun = (parkrun: ParkrunEvent) => {
    playSound("success");
    
    // Generate race challenge
    const challenge = generateRaceChallenge({
      scheduleId: `parkrun_${parkrun.id}`,
      dayIndex: currentDayIndex,
      distance: parkrun.distance,
      surface: "road" as Surface,
      elevation: "flat" as Elevation,
      tier: (parkrun.difficulty === "easy" ? "local" : parkrun.difficulty === "medium" ? "regional" : "national") as any,
      raceName: { en: parkrun.name, id: parkrun.name },
      entryFee: parkrun.entryFee,
    });
    
    setChallenge(challenge);
    router.push("/preparation");
  };
  
  const groupedParkruns = availableParkruns.reduce((acc, pr) => {
    if (!acc[pr.distance]) acc[pr.distance] = [];
    acc[pr.distance].push(pr);
    return acc;
  }, {} as Record<number, ParkrunEvent[]>);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-black text-2xl mb-1">Quick Races</h2>
              <p className="text-sm opacity-90">
                Available anytime • Lower rewards • Great for practice
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {Object.entries(groupedParkruns).map(([distance, parkruns]) => (
            <div key={distance} className="mb-6">
              <h3 className="font-heading font-black text-lg mb-3">
                {distance}K Races
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                {parkruns.map((parkrun) => {
                  const bestTime = getBestTime(parkrun.id);
                  const loadouts = getLoadoutsForDistance(parkrun.distance as Distance);
                  
                  return (
                    <motion.div
                      key={parkrun.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-heading font-black text-base">
                            {parkrun.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                            <MapPin className="w-3 h-3" />
                            {parkrun.location}
                          </div>
                        </div>
                        <span
                          className={`
                            text-[9px] uppercase font-bold px-2 py-1 rounded-full
                            ${
                              parkrun.difficulty === "easy"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : parkrun.difficulty === "medium"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                            }
                          `}
                        >
                          {parkrun.difficulty}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                        {parkrun.description}
                      </p>
                      
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="text-center p-2 bg-white dark:bg-slate-900 rounded-lg">
                          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                            Entry
                          </div>
                          <div className="font-mono font-bold text-sm">
                            {parkrun.entryFee}
                          </div>
                        </div>
                        
                        <div className="text-center p-2 bg-white dark:bg-slate-900 rounded-lg">
                          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                            Energy
                          </div>
                          <div className="font-mono font-bold text-sm flex items-center justify-center gap-1">
                            <Zap className="w-3 h-3 text-amber-500" />
                            {parkrun.energyCost}
                          </div>
                        </div>
                        
                        <div className="text-center p-2 bg-white dark:bg-slate-900 rounded-lg">
                          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                            Rewards
                          </div>
                          <div className="font-mono font-bold text-sm">
                            {Math.floor(parkrun.prizeMultiplier * 100)}%
                          </div>
                        </div>
                      </div>
                      
                      {bestTime && (
                        <div className="mb-3 p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                          <div className="text-[9px] uppercase font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                            Your Best
                          </div>
                          <div className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                            {formatTime(bestTime)}
                          </div>
                        </div>
                      )}
                      
                      <button
                        onClick={() => handleStartParkrun(parkrun)}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-2 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Start Race
                      </button>
                      
                      {loadouts.length > 0 && (
                        <div className="mt-2 text-[10px] text-center text-slate-500 dark:text-slate-400">
                          {loadouts.length} loadout{loadouts.length > 1 ? "s" : ""} available
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
