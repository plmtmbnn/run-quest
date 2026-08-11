"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  Apple,
  Brain,
  ChevronDown,
  ChevronUp,
  Droplet,
  FastForward,
  Gauge,
  Heart,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { useState } from "react";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";
import type { PacingPlan } from "@/types/engine";
import { EnhancedStandings } from "./enhanced-standings";

type NavSection = "stats" | "actions" | "leaderboard" | null;

interface Runner {
  id: string;
  name: string;
  distance: number;
  isPlayer: boolean;
  isDNF: boolean;
  dnfReason?: string;
  pace?: number;
  previousDistance?: number;
}

interface MobileRaceNavbarProps {
  stats: {
    energy: number;
    hydration: number;
    focus: number;
    pace: number;
    heartRate: number;
  };
  currentKm: number;
  raceDistance: number;
  runners: Runner[];
  activeConsumables: Record<string, number>;
  onConsumeItem: (itemKey: string) => void;
  onPacingChange: (pacing: PacingPlan) => void;
  onSimSpeedChange: (speed: 1 | 2 | 5) => void;
  isFinished: boolean;
  isPaused: boolean;
  currentPacing: PacingPlan;
  simSpeed: 1 | 2 | 5; // Add simulation speed prop
}

export function MobileRaceNavbar({
  stats,
  currentKm,
  raceDistance,
  runners,
  activeConsumables,
  onConsumeItem,
  onPacingChange,
  onSimSpeedChange,
  isFinished,
  isPaused,
  currentPacing,
  simSpeed,
}: MobileRaceNavbarProps) {
  const [activeSection, setActiveSection] = useState<NavSection>(null);
  const { t } = useTranslation();

  const toggleSection = (section: NavSection) => {
    setActiveSection(activeSection === section ? null : section);
  };

  // Sort runners by distance
  const sortedRunners = [...runners].sort((a, b) => b.distance - a.distance);
  const playerPosition = sortedRunners.findIndex((r) => r.isPlayer) + 1;

  // Format pace (stats.pace is in seconds per km)
  const formatPace = (seconds: number) => {
    if (!seconds || seconds <= 0) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Nutrition item metadata - mirror of CONSUMABLE_META from race-screen.tsx
  const NUTRITION_META: Record<string, { label: string; icon: string }> = {
    water: { label: "Purified Water", icon: "💧" },
    energy_bar: { label: "Energy Bar", icon: "🍫" },
    electrolyte: { label: "Electrolytes", icon: "⚡" },
    electrolytes: { label: "Electrolytes", icon: "⚡" },
    salt_tablets: { label: "Salt Tablets", icon: "🧂" },
    energy_gel: { label: "Energy Gel", icon: "🔋" },
    caffeine: { label: "Caffeine Shot", icon: "🧠" },
    hydration_mix: { label: "Pro Hydration", icon: "🥤" },
    caffeine_gum: { label: "Caffeine Gum", icon: "⚡" },
    beetroot_juice: { label: "Beetroot Juice", icon: "🧃" },
    isotonic_drink: { label: "Isotonic Drink", icon: "🥤" },
    protein_bar: { label: "Protein Bar", icon: "🍫" },
    carb_chews: { label: "Carb Chews", icon: "🍬" },
    endurance_gel_plus: { label: "Endurance Gel+", icon: "⚡" },
  };

  // Get available nutrition items from activeConsumables with proper labels
  const availableNutrition = Object.entries(activeConsumables)
    .filter(([_, qty]) => qty > 0)
    .map(([key, qty]) => ({
      key,
      ...(NUTRITION_META[key] || { label: key, icon: "💊" }),
      qty,
    }))
    .slice(0, 6); // Show up to 6 types

  // Pacing strategy options - all tactical choices from engine.PacingPlan
  const PACING_OPTIONS: {
    value: PacingPlan;
    label: string;
    desc: string;
    icon: string;
  }[] = [
    { value: "jog", label: "Jog", desc: "Conserve fatigue", icon: "🐢" },
    { value: "cruise", label: "Cruise", desc: "Steady pace", icon: "🏃" },
    { value: "push", label: "Push", desc: "Attack segments", icon: "⚡" },
    { value: "sprint", label: "Sprint", desc: "Max speed kick!", icon: "🔥" },
    {
      value: "negative_split",
      label: "Negative Split",
      desc: "Slow start, fast finish",
      icon: "🔄",
    },
    {
      value: "steady",
      label: "Steady",
      desc: "Even effort throughout",
      icon: "➖",
    },
    {
      value: "aggressive",
      label: "Aggressive",
      desc: "Early intensity",
      icon: "🔥",
    },
    {
      value: "conservative",
      label: "Conservative",
      desc: "Save energy for end",
      icon: "🛡️",
    },
  ];

  // Simulation speed options with proper numeric literals
  const SPEED_OPTIONS = [
    {
      value: 1 as const,
      label: "1x Slow",
      icon: "🐢",
      desc: "20s/km strategic",
    },
    {
      value: 2 as const,
      label: "2x Normal",
      icon: "⚖️",
      desc: "10s/km balanced",
    },
    { value: 5 as const, label: "5x Fast", icon: "⚡", desc: "5s/km reactive" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Expanded Panel */}
      <AnimatePresence>
        {activeSection && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <div className="max-h-[300px] overflow-y-auto p-4">
              {/* Stats Panel */}
              {activeSection === "stats" && (
                <div className="space-y-3">
                  {/* Energy */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {t("race.mobile_navbar.energy" as TranslationKey)}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                        {stats.energy.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${
                          stats.energy > 60
                            ? "bg-emerald-500"
                            : stats.energy > 30
                              ? "bg-amber-500"
                              : "bg-rose-500"
                        }`}
                        style={{ width: `${stats.energy}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  {/* Hydration */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Droplet className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {t("race.mobile_navbar.hydration" as TranslationKey)}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                        {stats.hydration.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${
                          stats.hydration > 60
                            ? "bg-blue-500"
                            : stats.hydration > 30
                              ? "bg-amber-500"
                              : "bg-rose-500"
                        }`}
                        style={{ width: `${stats.hydration}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  {/* Focus */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-purple-500" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {t("race.mobile_navbar.focus" as TranslationKey)}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                        {stats.focus.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${
                          stats.focus > 60
                            ? "bg-purple-500"
                            : stats.focus > 30
                              ? "bg-amber-500"
                              : "bg-rose-500"
                        }`}
                        style={{ width: `${stats.focus}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  {/* Heart Rate */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-rose-500" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {t("race.mobile_navbar.heart_rate" as TranslationKey)}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                        {stats.heartRate.toFixed(0)}{" "}
                        {t("race.mobile_navbar.bpm" as TranslationKey)}
                      </span>
                    </div>
                  </div>

                  {/* Pace */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-indigo-500" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {t(
                            "race.mobile_navbar.current_pace" as TranslationKey,
                          )}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                        {formatPace(stats.pace)} /km
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions Panel */}
              {activeSection === "actions" && (
                <div className="space-y-4">
                  {/* Speed Control - Sprint 40 addition */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <FastForward className="w-4 h-4 text-amber-500" />
                      {t(
                        "race.mobile_navbar.simulation_speed" as TranslationKey,
                      )}
                    </h4>
                    <div className="flex gap-2">
                      {SPEED_OPTIONS.map((option) => (
                        <button
                          key={option.value.toString()}
                          onClick={() => onSimSpeedChange(option.value)}
                          disabled={isFinished || isPaused}
                          className={`
                            px-3 py-2 rounded-lg text-xs font-bold transition-all active:scale-95
                            ${
                              simSpeed === option.value
                                ? "bg-amber-500 text-white shadow-sm"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            }
                            disabled:opacity-50 disabled:cursor-not-allowed
                          `}
                        >
                          <span className="text-base block mb-0.5">
                            {option.icon}
                          </span>
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pacing Strategy */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-indigo-500" />
                      {t(
                        "race.mobile_navbar.pacing_strategy" as TranslationKey,
                      )}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {PACING_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => onPacingChange(option.value)}
                          disabled={isFinished || isPaused}
                          className={`
                            px-3 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95
                            ${
                              currentPacing === option.value
                                ? "bg-emerald-500 text-white shadow-lg ring-2 ring-emerald-400"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            }
                            disabled:opacity-50 disabled:cursor-not-allowed
                          `}
                        >
                          <div className="text-lg mb-1">{option.icon}</div>
                          <div className="font-bold text-sm">
                            {option.label}
                          </div>
                          <div className="text-[9px] opacity-70 mt-0.5">
                            {option.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Nutrition */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      {t("race.mobile_navbar.nutrition" as TranslationKey)}
                    </h4>
                    {availableNutrition.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {availableNutrition.map((item) => (
                          <button
                            key={item.key}
                            onClick={() => onConsumeItem(item.key)}
                            disabled={isFinished || isPaused}
                            className={`
                              px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95
                              bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300
                              ${isFinished || isPaused ? "opacity-50 cursor-not-allowed" : ""}
                            `}
                          >
                            <div className="text-base mb-1">{item.icon}</div>
                            {item.label}
                            <div className="text-[9px] font-mono mt-0.5">
                              ×{item.qty}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-slate-100 dark:bg-slate-800/30 rounded-lg p-4 text-center">
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          No consumables available
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Leaderboard Panel - Enhanced Standings */}
              {activeSection === "leaderboard" && (
                <div className="space-y-2">
                  <EnhancedStandings
                    runners={sortedRunners}
                    raceDistance={raceDistance}
                    showMobileVersion={true}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Bar */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_16px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.3)]">
        {/* Mini Indicators (always visible) */}
        <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400">
                {stats.energy.toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400">
                #{playerPosition}
              </span>
            </div>
          </div>
          <div className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400">
            {currentKm.toFixed(1)} / {raceDistance} km
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-0">
          <button
            onClick={() => toggleSection("stats")}
            className={`
              flex flex-col items-center justify-center py-3 transition-all active:scale-95
              ${
                activeSection === "stats"
                  ? "bg-emerald-500/10 dark:bg-emerald-500/20 border-t-2 border-emerald-500"
                  : "bg-transparent border-t-2 border-transparent"
              }
            `}
          >
            <Activity
              className={`w-5 h-5 mb-1 ${activeSection === "stats" ? "text-emerald-500" : "text-slate-500 dark:text-slate-400"}`}
            />
            <span
              className={`text-[10px] font-bold ${activeSection === "stats" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-600 dark:text-slate-400"}`}
            >
              {t("race.mobile_navbar.stats" as TranslationKey)}
            </span>
            {activeSection === "stats" ? (
              <ChevronDown className="w-3 h-3 mt-0.5 text-emerald-500" />
            ) : (
              <ChevronUp className="w-3 h-3 mt-0.5 text-slate-400" />
            )}
          </button>

          <button
            onClick={() => toggleSection("actions")}
            className={`
              flex flex-col items-center justify-center py-3 transition-all active:scale-95
              ${
                activeSection === "actions"
                  ? "bg-indigo-500/10 dark:bg-indigo-500/20 border-t-2 border-indigo-500"
                  : "bg-transparent border-t-2 border-transparent"
              }
            `}
          >
            <Apple
              className={`w-5 h-5 mb-1 ${activeSection === "actions" ? "text-indigo-500" : "text-slate-500 dark:text-slate-400"}`}
            />
            <span
              className={`text-[10px] font-bold ${activeSection === "actions" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400"}`}
            >
              {t("race.mobile_navbar.actions" as TranslationKey)}
            </span>
            {activeSection === "actions" ? (
              <ChevronDown className="w-3 h-3 mt-0.5 text-indigo-500" />
            ) : (
              <ChevronUp className="w-3 h-3 mt-0.5 text-slate-400" />
            )}
          </button>

          <button
            onClick={() => toggleSection("leaderboard")}
            className={`
              flex flex-col items-center justify-center py-3 transition-all active:scale-95
              ${
                activeSection === "leaderboard"
                  ? "bg-amber-500/10 dark:bg-amber-500/20 border-t-2 border-amber-500"
                  : "bg-transparent border-t-2 border-transparent"
              }
            `}
          >
            <Trophy
              className={`w-5 h-5 mb-1 ${activeSection === "leaderboard" ? "text-amber-500" : "text-slate-500 dark:text-slate-400"}`}
            />
            <span
              className={`text-[10px] font-bold ${activeSection === "leaderboard" ? "text-amber-600 dark:text-amber-400" : "text-slate-600 dark:text-slate-400"}`}
            >
              {t("race.mobile_navbar.board" as TranslationKey)}
            </span>
            {activeSection === "leaderboard" ? (
              <ChevronDown className="w-3 h-3 mt-0.5 text-amber-500" />
            ) : (
              <ChevronUp className="w-3 h-3 mt-0.5 text-slate-400" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
