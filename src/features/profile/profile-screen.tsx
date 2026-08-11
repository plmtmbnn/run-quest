"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Award,
  Brain,
  Droplets,
  Flame,
  Plus,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { PBTracker } from "@/components/runner/pb-tracker";
import { useSound } from "@/hooks/use-sound";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";
import {
  calculateLifetimeDistance,
  calculateRunningStreak,
  calculateTotalRaceTime,
  getFatigueLevel,
  getFitnessLevel,
  getReadinessLevel,
} from "@/runner/runner-selectors";
import { useRunnerStore } from "@/runner/runner-store";
import { usePlayerStore } from "@/store/player-store";
import { useTrainingStore } from "@/training/training-store";

interface AttributeUpgradeCardProps {
  name: string;
  value: number;
  desc: string;
  icon: React.ReactNode;
  onUpgrade: () => void;
  canUpgrade: boolean;
  bgClass: string;
}

function AttributeUpgradeCard({
  name,
  value,
  desc,
  icon,
  onUpgrade,
  canUpgrade,
  bgClass,
}: AttributeUpgradeCardProps) {
  const { t } = useTranslation();
  return (
    <div
      className={`border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-5 shadow-sm flex flex-col justify-between gap-4 ${bgClass}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-2.5 items-start">
          <div className="p-2.5 bg-white/75 dark:bg-slate-900/60 rounded-2xl flex-shrink-0 shadow-sm">
            {icon}
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-sm text-slate-800 dark:text-white leading-tight">
              {name}
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal mt-1.5">
              {desc}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
            {t("profile.attributes.value_label" as TranslationKey)}
          </span>
          <span className="text-lg font-black font-mono text-slate-800 dark:text-white mt-0.5">
            {value} / 100
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full">
        <div className="flex-grow bg-slate-100/50 dark:bg-slate-800/40 h-2.5 rounded-full overflow-hidden border border-slate-200/30 dark:border-slate-700/30">
          <div
            className="bg-gradient-to-r from-orange-500 to-amber-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${value}%` }}
          />
        </div>

        {canUpgrade && (
          <button
            type="button"
            onClick={onUpgrade}
            className="h-8 w-8 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-500/20 active:scale-90 transition hover:rotate-90 duration-200 cursor-pointer"
            aria-label={`Upgrade ${name}`}
          >
            <Plus className="h-4.5 w-4.5" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Runner Profile screen.
 * Displays the runner's persistent profile and long-term progression metrics.
 */
export function ProfileScreen() {
  const router = useRouter();
  const { runnerState, setRunnerState } = useRunnerStore();
  const profile = runnerState.profile;
  const player = usePlayerStore((state) => state.player);
  const { t } = useTranslation();
  const { playSound } = useSound();

  // Get player name from player store
  const playerName =
    player?.name ||
    `Runner #${player?.id.slice(0, 5).toUpperCase() || "00000"}`;

  const { trainingState } = useTrainingStore();

  const handleUpgradeAttribute = (
    attr: "speedAttr" | "staminaAttr" | "hydrationAttr" | "willpowerAttr",
  ) => {
    if ((profile.skillPoints || 0) <= 0) return;

    const updatedProfile = {
      ...profile,
      skillPoints: (profile.skillPoints || 0) - 1,
      [attr]: (profile[attr] || 10) + 5,
    };

    setRunnerState({
      ...runnerState,
      profile: updatedProfile,
      lastUpdated: new Date().toISOString(),
    });

    playSound("success");
  };

  const handleUnlockPerk = (perkId: string, cost: number = 1) => {
    if ((profile.skillPoints || 0) < cost) return;
    const activePerks = profile.activePerks || [];
    if (activePerks.includes(perkId)) return;

    const updatedProfile = {
      ...profile,
      skillPoints: (profile.skillPoints || 0) - cost,
      activePerks: [...activePerks, perkId],
    };

    setRunnerState({
      ...runnerState,
      profile: updatedProfile,
      lastUpdated: new Date().toISOString(),
    });

    playSound("success");
  };

  const xpNeeded = (profile.level || 1) * 100;
  const xpPercent = Math.min(100, ((profile.xp || 0) / xpNeeded) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="min-h-screen bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white flex flex-col pb-16"
    >
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 border-b border-[#E5E7EB] dark:border-gray-800 bg-white/95 dark:bg-slate-900/90 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white dark:bg-slate-900 transition hover:bg-gray-55 active:scale-95"
              aria-label="Back to Home"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="font-heading text-xl font-bold text-slate-900 dark:text-white">
                {t("home.runner_profile" as TranslationKey)}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("profile.subtitle" as TranslationKey)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.push("/shop")}
            className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950 border border-blue-200/50 px-3.5 py-1.5 rounded-full text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition active:scale-95 shadow-sm"
          >
            <span>🏪</span>
            <span>{t("nav.shop" as TranslationKey)}</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto w-full max-w-3xl px-6 py-6 flex-1 flex flex-col gap-6">
        {/* Level and XP Section */}
        <div className="bg-gradient-to-br from-blue-900/80 to-indigo-950 rounded-[2rem] p-6 text-white shadow-xl shadow-blue-950/30 border border-blue-800/30 flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Award className="h-6 w-6 text-yellow-400" />
              <span className="font-heading font-black text-xl">
                {t("profile.level.runner" as TranslationKey, {
                  level: profile.level || 1,
                })}
              </span>
            </div>
            <span className="text-xs bg-white/10 px-3 py-1 rounded-full border border-white/10 font-mono">
              {t("profile.level.xp_progress" as TranslationKey, {
                current: profile.xp || 0,
                needed: xpNeeded,
              })}
            </span>
          </div>
          <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden border border-white/5">
            <div
              className="bg-gradient-to-r from-yellow-400 to-amber-500 h-full transition-all duration-500 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
          {(profile.skillPoints || 0) > 0 && (
            <div className="text-xs font-semibold text-yellow-300 animate-pulse mt-1">
              {t("profile.level.skill_points_available" as TranslationKey, {
                points: profile.skillPoints,
                plural: profile.skillPoints > 1 ? "s" : "",
              })}
            </div>
          )}
        </div>

        {/* RPG Attributes Upgrades */}
        <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-6 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center mb-2 border-b border-[#E5E7EB] dark:border-slate-800 pb-2">
            <h2 className="font-heading text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              {t("profile.attributes.title" as TranslationKey)}
            </h2>
            {(profile.skillPoints || 0) > 0 && (
              <span className="text-xs font-bold bg-orange-50/40 dark:bg-orange-950/10 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full animate-bounce">
                {t("profile.attributes.points_available" as TranslationKey, {
                  points: profile.skillPoints,
                })}
              </span>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <AttributeUpgradeCard
              name="Speed (Aerobic Power)"
              value={profile.speedAttr || 10}
              desc="Lowers base race pace directly. Run faster over all segments."
              icon={<Zap className="h-5 w-5 text-yellow-500" />}
              onUpgrade={() => handleUpgradeAttribute("speedAttr")}
              canUpgrade={
                (profile.skillPoints || 0) > 0 &&
                (profile.speedAttr || 10) < 100
              }
              bgClass="bg-amber-50/40 dark:bg-amber-950/10 border-amber-100/30 dark:border-amber-900/30"
            />
            <AttributeUpgradeCard
              name="Stamina (Endurance)"
              value={profile.staminaAttr || 10}
              desc="Reduces physical fatigue build-up rate during checkpoints."
              icon={<Flame className="h-5 w-5 text-red-500" />}
              onUpgrade={() => handleUpgradeAttribute("staminaAttr")}
              canUpgrade={
                (profile.skillPoints || 0) > 0 &&
                (profile.staminaAttr || 10) < 100
              }
              bgClass="bg-rose-50/40 dark:bg-rose-950/10 border-rose-100/30 dark:border-rose-900/30"
            />
            <AttributeUpgradeCard
              name="Hydration (Efficiency)"
              value={profile.hydrationAttr || 10}
              desc="Reduces fluid depletion rate per kilometer."
              icon={<Droplets className="h-5 w-5 text-blue-500" />}
              onUpgrade={() => handleUpgradeAttribute("hydrationAttr")}
              canUpgrade={
                (profile.skillPoints || 0) > 0 &&
                (profile.hydrationAttr || 10) < 100
              }
              bgClass="bg-sky-50/40 dark:bg-sky-950/10 border-sky-100/30 dark:border-sky-900/30"
            />
            <AttributeUpgradeCard
              name="Willpower (Grit)"
              value={profile.willpowerAttr || 10}
              desc="Mitigates penalties for exhaustion, dehydration, and fatigue."
              icon={<Brain className="h-5 w-5 text-purple-500" />}
              onUpgrade={() => handleUpgradeAttribute("willpowerAttr")}
              canUpgrade={
                (profile.skillPoints || 0) > 0 &&
                (profile.willpowerAttr || 10) < 100
              }
              bgClass="bg-purple-50/40 dark:bg-purple-950/10 border-purple-100/30 dark:border-purple-900/30"
            />
          </div>
        </div>

        {/* Perk Tree */}
        <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-6 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center mb-2 border-b border-[#E5E7EB] dark:border-slate-800 pb-2">
            <h2 className="font-heading text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              {t("profile.perks.title" as TranslationKey)}
            </h2>
            <div className="flex items-center gap-2">
              {(profile.skillPoints || 0) > 0 && (
                <span className="text-xs font-bold bg-orange-50/40 dark:bg-orange-950/10 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full animate-bounce">
                  {t("profile.perks.points_available" as TranslationKey, {
                    points: profile.skillPoints,
                  })}
                </span>
              )}
              <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                {t("profile.perks.subtitle" as TranslationKey)}
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                id: "hill_specialist",
                name: "Hill Specialist",
                desc: "Nullifies climb penalties: no +20s/km pace penalty and no +1.5x fatigue increase on uphill segments.",
                effects: [
                  "No pace penalty on climbs",
                  "No fatigue increase on climbs",
                ],
                icon: "⛰️",
                cost: 1,
                bgClass:
                  "bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-100/30 dark:border-emerald-900/30",
              },
              {
                id: "iron_stomach",
                name: "Iron Stomach",
                desc: "Energy gels restore +50 stamina instead of +30, and provide double momentum boost (+1.6 vs +0.8) during races.",
                effects: [
                  "+20 extra stamina from gels",
                  "Double momentum gain",
                ],
                icon: "🍳",
                cost: 1,
                bgClass:
                  "bg-amber-50/40 dark:bg-amber-950/10 border-amber-100/30 dark:border-amber-900/30",
              },
            ].map((perk) => {
              const activePerks = profile.activePerks || [];
              const isUnlocked = activePerks.includes(perk.id);
              const canUnlock =
                (profile.skillPoints || 0) >= perk.cost && !isUnlocked;
              return (
                <div
                  key={perk.id}
                  className={`border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-5 shadow-sm flex flex-col justify-between gap-3 ${perk.bgClass} relative`}
                >
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    {isUnlocked ? (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        ✓ Active
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-slate-200/60 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border border-slate-300/30 dark:border-slate-700/30">
                        Locked
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2.5 items-start pr-16">
                    <div className="h-10 w-10 bg-white/70 dark:bg-slate-900/60 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
                      {perk.icon}
                    </div>
                    <div>
                      <h3 className="font-heading font-extrabold text-sm text-slate-800 dark:text-white leading-tight">
                        {perk.name}
                      </h3>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed mt-1.5">
                        {perk.desc}
                      </p>
                    </div>
                  </div>

                  {/* Effects List */}
                  <div className="flex flex-col gap-1 px-1">
                    {perk.effects.map((effect, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                          ▸
                        </span>
                        <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                          {effect}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Cost Badge & Unlock Button */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2 py-1 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {t("profile.perks.cost_label" as TranslationKey)}
                      </span>
                      <span className="text-xs font-black font-mono text-orange-600 dark:text-orange-400">
                        {perk.cost} SP
                      </span>
                    </div>
                    <button
                      type="button"
                      disabled={isUnlocked || !canUnlock}
                      onClick={() => handleUnlockPerk(perk.id, perk.cost)}
                      className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition duration-200 border ${
                        isUnlocked
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 cursor-default"
                          : canUnlock
                            ? "bg-orange-500 hover:bg-orange-600 text-white cursor-pointer border-orange-500 shadow-md shadow-orange-500/20 active:scale-95"
                            : "bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-45 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {isUnlocked
                        ? t("profile.perks.unlocked" as TranslationKey)
                        : canUnlock
                          ? t("profile.perks.unlock_now" as TranslationKey)
                          : t(
                              "profile.perks.insufficient_sp" as TranslationKey,
                            )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Centralized Shop Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 rounded-[2rem] p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl flex-shrink-0">
              🏪
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-white">
                {t("profile.shop_banner.title" as TranslationKey)}
              </h2>
              <p className="text-xs text-blue-100 mt-0.5">
                {t("profile.shop_banner.desc" as TranslationKey)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.push("/shop")}
            className="px-5 py-2.5 rounded-xl bg-white text-blue-600 font-bold text-xs hover:bg-blue-50 transition active:scale-95 shadow flex-shrink-0"
          >
            {t("profile.shop_banner.visit_button" as TranslationKey)}
          </button>
        </div>

        {/* Training History & Adaptation Status */}
        <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-6 shadow-sm flex flex-col gap-5">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-3">
            <h2 className="font-heading text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              {t("profile.training.title" as TranslationKey)}
            </h2>
            <button
              type="button"
              onClick={() => router.push("/training")}
              className="text-xs font-bold text-indigo-500 hover:text-indigo-600 transition"
            >
              {t("profile.training.open_planner" as TranslationKey)}
            </button>
          </div>

          {/* Pending Adaptations */}
          {trainingState.adaptationQueue.length > 0 ? (
            <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl p-4 flex flex-col gap-2">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>⏳</span>{" "}
                {t("profile.training.pending_adaptations" as TranslationKey, {
                  count: trainingState.adaptationQueue.length,
                })}
              </span>
              <div className="space-y-1.5">
                {trainingState.adaptationQueue.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-xs"
                  >
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      Matures on Day {item.date}
                    </span>
                    <span className="font-mono font-bold text-emerald-500">
                      +{item.fitnessGain.toFixed(1)} Fitness
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 dark:text-slate-500 italic bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              {t("profile.training.no_adaptations" as TranslationKey)}
            </div>
          )}

          {/* Training History Log */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {t("profile.training.recent_sessions" as TranslationKey)}
            </h3>
            {trainingState.trainingHistory.length > 0 ? (
              <div className="space-y-2">
                {trainingState.trainingHistory
                  .slice(-7)
                  .reverse()
                  .map((day, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-400">
                          Day {day.date}
                        </span>
                        <span className="font-bold text-slate-800 dark:text-white">
                          {day.activity}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-[11px]">
                        {day.effect.fitness > 0 && (
                          <span className="text-emerald-500 font-bold">
                            +{day.effect.fitness} Fit
                          </span>
                        )}
                        {day.effect.fatigue > 0 ? (
                          <span className="text-orange-500">
                            +{day.effect.fatigue} Fat
                          </span>
                        ) : day.effect.fatigue < 0 ? (
                          <span className="text-emerald-500">
                            {day.effect.fatigue} Fat
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                {t("profile.training.no_sessions" as TranslationKey)}
              </p>
            )}
          </div>
        </div>

        {/* Personal Best Tracker */}
        <PBTracker showPredictions={true} />

        {/* Career Statistics & Lifetime Metrics */}
        <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-6 shadow-sm flex flex-col gap-6">
          {/* Runner Name */}
          <div>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
              {t("profile.career.title" as TranslationKey)}
            </h2>
            <p className="text-lg font-bold text-slate-800 dark:text-white">
              {playerName}
            </p>
          </div>

          <hr className="border-gray-100 dark:border-slate-800" />

          {/* Lifetime Stats */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
                {t("profile.career.lifetime_distance" as TranslationKey)}
              </h2>
              <p className="text-lg font-mono font-black text-slate-800 dark:text-white">
                {calculateLifetimeDistance(profile)}
              </p>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
                {t("profile.career.total_runs" as TranslationKey)}
              </h2>
              <p className="text-lg font-mono font-black text-slate-800 dark:text-white">
                {profile.totalRuns}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
                {t("profile.career.total_race_time" as TranslationKey)}
              </h2>
              <p className="text-lg font-mono font-black text-slate-800 dark:text-white">
                {calculateTotalRaceTime(profile)}
              </p>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
                {t("profile.career.training_days" as TranslationKey)}
              </h2>
              <p className="text-lg font-mono font-black text-slate-800 dark:text-white">
                {profile.totalTrainingDays}
              </p>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-slate-800" />

          {/* Current Metrics */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
                {t("profile.career.current_fitness" as TranslationKey)}
              </h2>
              <p className="text-slate-700 dark:text-gray-200">
                <span className="font-extrabold text-slate-800 dark:text-white">
                  {profile.currentFitness}
                </span>
                <span className="text-xs text-gray-400 uppercase ml-1">
                  ({getFitnessLevel(profile)})
                </span>
              </p>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
                {t("profile.career.current_fatigue" as TranslationKey)}
              </h2>
              <p className="text-slate-700 dark:text-gray-200">
                <span className="font-extrabold text-slate-800 dark:text-white">
                  {profile.currentFatigue}
                </span>
                <span className="text-xs text-gray-400 uppercase ml-1">
                  ({getFatigueLevel(profile)})
                </span>
              </p>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-slate-800" />

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
                {t("profile.career.readiness" as TranslationKey)}
              </h2>
              <p className="text-slate-700 dark:text-gray-200">
                <span className="font-extrabold text-slate-800 dark:text-white">
                  {profile.currentReadiness}
                </span>
                <span className="text-xs text-gray-400 uppercase ml-1">
                  ({getReadinessLevel(profile)})
                </span>
              </p>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
                {t("profile.career.running_streak" as TranslationKey)}
              </h2>
              <p className="text-lg font-bold text-slate-800 dark:text-white">
                {calculateRunningStreak(profile)}{" "}
                {t("common.days" as TranslationKey)}
              </p>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-slate-800" />

          {/* Preferences */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
                {t("profile.career.preferred_surface" as TranslationKey)}
              </h2>
              <p className="text-sm font-semibold text-slate-700 dark:text-gray-300 capitalize">
                {profile.preferredSurface ||
                  t("profile.career.not_set" as TranslationKey)}
              </p>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
                {t("profile.career.preferred_distance" as TranslationKey)}
              </h2>
              <p className="text-sm font-semibold text-slate-700 dark:text-gray-300 capitalize">
                {profile.preferredDistance ||
                  t("profile.career.not_set" as TranslationKey)}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
              {t("profile.career.preferred_strategy" as TranslationKey)}
            </h2>
            <p className="text-sm font-semibold text-slate-700 dark:text-gray-300 capitalize">
              {profile.preferredStrategy ||
                t("profile.career.not_set" as TranslationKey)}
            </p>
          </div>
        </div>
      </main>
    </motion.div>
  );
}
