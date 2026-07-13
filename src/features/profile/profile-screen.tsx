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
import { useSound } from "@/hooks/use-sound";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";
import {
  calculateLifetimeDistance,
  calculateRunningStreak,
  getFatigueLevel,
  getFitnessLevel,
  getReadinessLevel,
} from "@/runner/runner-selectors";
import { useRunnerStore } from "@/runner/runner-store";

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
  return (
    <div
      className={`border-2 rounded-[2rem] p-5 shadow-sm flex flex-col justify-between gap-4 ${bgClass}`}
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
            <p className="text-[11px] opacity-80 leading-normal mt-1.5">
              {desc}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] opacity-60 uppercase tracking-wider font-semibold">
            Value
          </span>
          <span className="text-lg font-black font-mono mt-0.5">
            {value} / 100
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full">
        <div className="flex-grow bg-white/40 dark:bg-black/25 h-2.5 rounded-full overflow-hidden border border-white/10">
          <div
            className="bg-orange-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${value}%` }}
          />
        </div>

        {canUpgrade && (
          <button
            type="button"
            onClick={onUpgrade}
            className="h-8 w-8 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-500/25 active:scale-90 transition hover:rotate-90 duration-200 cursor-pointer"
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
  const { t } = useTranslation();
  const { playSound } = useSound();

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

  const handleBuyConsumable = (
    item: "energy_gel" | "electrolytes" | "caffeine_gum",
    cost: number,
  ) => {
    if ((profile.coins || 0) < cost) return;

    const currentInventory = profile.inventory || {
      energy_gel: 0,
      electrolytes: 0,
      caffeine_gum: 0,
    };
    const updatedInventory = {
      ...currentInventory,
      [item]: (currentInventory[item] || 0) + 1,
    };

    const updatedProfile = {
      ...profile,
      coins: (profile.coins || 0) - cost,
      inventory: updatedInventory,
    };

    setRunnerState({
      ...runnerState,
      profile: updatedProfile,
      lastUpdated: new Date().toISOString(),
    });

    playSound("success");
  };

  const handleBuyShoes = (
    shoeId: "carbon_racer" | "lightweight",
    name: string,
    cost: number,
    paceBonus: number,
    maxDurability: number,
  ) => {
    if ((profile.coins || 0) < cost) return;

    const updatedProfile = {
      ...profile,
      coins: (profile.coins || 0) - cost,
      equippedShoes: {
        id: shoeId,
        name,
        durability: maxDurability,
        maxDurability,
        paceBonus,
      },
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
      className="min-h-screen bg-background flex flex-col pb-16"
    >
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 border-b border-[#E5E7EB] bg-surface/90 px-6 py-4 backdrop-blur-md">
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
              <h1 className="font-heading text-xl font-bold text-gray-900 dark:text-white">
                {t("home.runner_profile" as TranslationKey)}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-300">
                Your long-term progression and career stats
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-yellow-100 dark:bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-full text-xs font-black text-yellow-600 dark:text-yellow-400 font-mono shadow-sm">
            <span>🪙</span>
            <span>{(profile.coins || 0).toLocaleString()} RC</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto w-full max-w-3xl px-6 py-6 flex-1 flex flex-col gap-6">
        {/* Level and XP Section */}
        <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-3xl p-6 text-white shadow-md flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Award className="h-6 w-6 text-yellow-400" />
              <span className="font-heading font-black text-xl">
                Level {profile.level || 1} Runner
              </span>
            </div>
            <span className="text-xs bg-white/10 px-3 py-1 rounded-full border border-white/10 font-mono">
              {profile.xp || 0} / {xpNeeded} XP
            </span>
          </div>
          <div className="w-full bg-black/20 h-3 rounded-full overflow-hidden border border-white/5">
            <div
              className="bg-gradient-to-r from-yellow-400 to-amber-500 h-full transition-all duration-500"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
          {(profile.skillPoints || 0) > 0 && (
            <div className="text-xs font-semibold text-yellow-300 animate-pulse mt-1">
              ⚡ You have {profile.skillPoints} Skill Points available to spend
              below!
            </div>
          )}
        </div>

        {/* RPG Attributes Upgrades */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-[#E5E7EB] dark:border-slate-800 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center mb-2 border-b border-[#E5E7EB] dark:border-slate-800 pb-2">
            <h2 className="font-heading text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <span>🏃</span> RPG Attributes
            </h2>
            {(profile.skillPoints || 0) > 0 && (
              <span className="text-xs font-bold bg-orange-100 text-orange-850 dark:bg-orange-950/40 dark:text-orange-350 px-3 py-1 rounded-full animate-bounce">
                {profile.skillPoints} Points Available
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
              bgClass="bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30 text-amber-900 dark:text-amber-300"
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
              bgClass="bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30 text-rose-900 dark:text-rose-300"
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
              bgClass="bg-sky-50 dark:bg-sky-950/20 border-sky-100 dark:border-sky-900/30 text-sky-900 dark:text-sky-300"
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
              bgClass="bg-purple-50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900/30 text-purple-900 dark:text-purple-300"
            />
          </div>
        </div>

        {/* Perk Tree */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-[#E5E7EB] dark:border-slate-800 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center mb-2 border-b border-[#E5E7EB] dark:border-slate-800 pb-2">
            <h2 className="font-heading text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <span>✨</span> Runner Perks
            </h2>
            <span className="text-xs text-gray-400 font-medium">
              Spend Skill Points to unlock passive buffs
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                id: "hill_specialist",
                name: "Hill Specialist",
                desc: "Completely ignores climbing pace and fatigue penalties during hilly race segments.",
                icon: "⛰️",
                bgClass:
                  "bg-emerald-55/40 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-900 dark:text-emerald-300",
              },
              {
                id: "iron_stomach",
                name: "Iron Stomach",
                desc: "Stamina Gels used mid-race restore +50% energy instead of +25%.",
                icon: "🍳",
                bgClass:
                  "bg-amber-55/40 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30 text-amber-900 dark:text-amber-300",
              },
            ].map((perk) => {
              const activePerks = profile.activePerks || [];
              const isUnlocked = activePerks.includes(perk.id);
              const canUnlock = (profile.skillPoints || 0) >= 1 && !isUnlocked;
              return (
                <div
                  key={perk.id}
                  className={`border-2 rounded-[2rem] p-5 shadow-sm flex flex-col justify-between gap-4 ${perk.bgClass}`}
                >
                  <div className="flex gap-2.5 items-start">
                    <div className="h-10 w-10 bg-white/70 dark:bg-slate-900/60 rounded-2xl flex items-center justify-center text-xl flex-shrink-0">
                      {perk.icon}
                    </div>
                    <div>
                      <h3 className="font-heading font-extrabold text-sm leading-tight">
                        {perk.name}
                      </h3>
                      <p className="text-[10px] opacity-80 leading-normal mt-1">
                        {perk.desc}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isUnlocked || !canUnlock}
                    onClick={() => handleUnlockPerk(perk.id)}
                    className={`w-full py-2 rounded-xl text-xs font-black uppercase tracking-wider transition duration-200 border ${
                      isUnlocked
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 cursor-default"
                        : canUnlock
                          ? "bg-orange-500 hover:bg-orange-600 text-white cursor-pointer border-orange-500 shadow-md shadow-orange-500/20 active:scale-95"
                          : "bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-650 cursor-not-allowed opacity-45 border-slate-200 dark:border-slate-850"
                    }`}
                  >
                    {isUnlocked ? "Unlocked" : "Unlock (1 Skill Point)"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Consumables Shop */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-[#E5E7EB] dark:border-slate-800 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center mb-2 border-b border-[#E5E7EB] dark:border-slate-800 pb-2">
            <h2 className="font-heading text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <span>🛒</span> Gear & Nutrition Shop
            </h2>
            <span className="text-xs text-gray-400 font-medium">
              Equip consumables to use mid-race
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                id: "energy_gel" as const,
                name: "Energy Gel",
                icon: "🔋",
                desc: "Restores +25% Stamina / Energy mid-race.",
                cost: 30,
                bgClass:
                  "bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-[1.5rem]",
              },
              {
                id: "electrolytes" as const,
                name: "Electrolyte Chews",
                icon: "💧",
                desc: "Restores +20% Hydration mid-race.",
                cost: 25,
                bgClass:
                  "bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/30 rounded-[1.5rem]",
              },
              {
                id: "caffeine_gum" as const,
                name: "Caffeine Gum",
                icon: "🧠",
                desc: "Restores +20% Focus / Willpower mid-race.",
                cost: 40,
                bgClass:
                  "bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/30 rounded-[1.5rem]",
              },
            ].map((item) => {
              const qty = profile.inventory?.[item.id] || 0;
              const canAfford = (profile.coins || 0) >= item.cost;
              return (
                <div
                  key={item.id}
                  className={`p-4 flex flex-col justify-between gap-3 text-center sm:text-left ${item.bgClass}`}
                >
                  <div className="flex flex-col gap-1.5">
                    <span className="text-3xl text-center sm:text-left">
                      {item.icon}
                    </span>
                    <div className="flex justify-between items-baseline w-full gap-1">
                      <h3 className="font-bold text-xs text-gray-850 dark:text-white truncate">
                        {item.name}
                      </h3>
                      <span className="text-[10px] bg-white/70 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono font-bold text-slate-650 dark:text-gray-400 flex-shrink-0">
                        Qty: {qty}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-450 leading-snug">
                      {item.desc}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={!canAfford}
                    onClick={() => handleBuyConsumable(item.id, item.cost)}
                    className={`py-2 px-3 w-full rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all transform active:scale-95 border
                      ${
                        canAfford
                          ? "bg-orange-500 hover:bg-orange-600 border-orange-500 text-white cursor-pointer shadow-md shadow-orange-500/20"
                          : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-850 text-slate-400 dark:text-slate-650 cursor-not-allowed opacity-45"
                      }
                    `}
                  >
                    <span>🪙</span>
                    <span>{item.cost} RC</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gear Shop (Shoes) */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-[#E5E7EB] dark:border-slate-800 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center mb-2 border-b border-[#E5E7EB] dark:border-slate-800 pb-2">
            <h2 className="font-heading text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <span>👟</span> Super Shoe Shop
            </h2>
            <span className="text-xs text-gray-400 font-medium">
              Equip shoes to gain pace bonuses
            </span>
          </div>

          {/* Currently Equipped Shoes Card */}
          <div className="p-4 rounded-[1.5rem] bg-orange-500/5 border border-orange-500/20 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">👟</span>
              <div>
                <h3 className="font-black text-sm text-slate-800 dark:text-white">
                  {profile.equippedShoes
                    ? profile.equippedShoes.name
                    : "Standard Running Shoes"}
                </h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  {profile.equippedShoes
                    ? `Pace Boost: -${profile.equippedShoes.paceBonus}s/km`
                    : "No extra pace bonuses. Standard performance."}
                </p>
              </div>
            </div>
            {profile.equippedShoes && (
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                  Durability
                </span>
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-white mt-1">
                  {profile.equippedShoes.durability} /{" "}
                  {profile.equippedShoes.maxDurability} races
                </span>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 mt-2">
            {[
              {
                id: "lightweight" as const,
                name: "Lightweight Trainers",
                paceBonus: 6,
                maxDurability: 5,
                cost: 100,
                desc: "High durability. Gives a moderate pace boost of -6s/km.",
                bgClass:
                  "bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/30 rounded-[1.5rem]",
              },
              {
                id: "carbon_racer" as const,
                name: "Carbon Plated Super Shoes",
                paceBonus: 15,
                maxDurability: 3,
                cost: 250,
                desc: "Low durability. Gives a massive pace boost of -15s/km.",
                bgClass:
                  "bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-[1.5rem]",
              },
            ].map((shoe) => {
              const canAfford = (profile.coins || 0) >= shoe.cost;
              return (
                <div
                  key={shoe.id}
                  className={`p-4 flex flex-col justify-between gap-3 text-center sm:text-left ${shoe.bgClass}`}
                >
                  <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-xs text-gray-850 dark:text-white">
                      {shoe.name}
                    </h3>
                    <p className="text-[10px] text-gray-500 dark:text-gray-450 leading-snug">
                      {shoe.desc}
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-gray-400 font-mono mt-1">
                      <span>Pace: -{shoe.paceBonus}s/km</span>
                      <span>Durability: {shoe.maxDurability} races</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={!canAfford}
                    onClick={() =>
                      handleBuyShoes(
                        shoe.id,
                        shoe.name,
                        shoe.cost,
                        shoe.paceBonus,
                        shoe.maxDurability,
                      )
                    }
                    className={`py-2 px-3 w-full rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all transform active:scale-95 border
                      ${
                        canAfford
                          ? "bg-orange-500 hover:bg-orange-600 border-orange-500 text-white cursor-pointer shadow-md shadow-orange-500/20"
                          : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-850 text-slate-400 dark:text-slate-650 cursor-not-allowed opacity-45"
                      }
                    `}
                  >
                    <span>🪙</span>
                    <span>{shoe.cost} RC</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Career Statistics & Lifetime Metrics */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-[#E5E7EB] dark:border-slate-800 p-6 shadow-sm flex flex-col gap-6">
          {/* Runner Name */}
          <div>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
              Runner Name
            </h2>
            <p className="text-lg font-bold text-gray-800 dark:text-gray-150">
              {profile.displayName}
            </p>
          </div>

          <hr className="border-gray-100 dark:border-slate-800" />

          {/* Lifetime Stats */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
                Lifetime Distance
              </h2>
              <p className="text-lg font-bold text-gray-850 dark:text-white">
                {calculateLifetimeDistance(profile)}
              </p>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
                Total Runs
              </h2>
              <p className="text-lg font-bold text-gray-855 dark:text-white">
                {profile.totalRuns}
              </p>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-slate-800" />

          {/* Current Metrics */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
                Current Fitness
              </h2>
              <p className="text-gray-700 dark:text-gray-200">
                <span className="font-extrabold text-gray-850 dark:text-white">
                  {profile.currentFitness}
                </span>{" "}
                <span className="text-xs text-gray-400 uppercase">
                  ({getFitnessLevel(profile)})
                </span>
              </p>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
                Current Fatigue
              </h2>
              <p className="text-gray-700 dark:text-gray-200">
                <span className="font-extrabold text-gray-850 dark:text-white">
                  {profile.currentFatigue}
                </span>{" "}
                <span className="text-xs text-gray-400 uppercase">
                  ({getFatigueLevel(profile)})
                </span>
              </p>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-slate-800" />

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
                Today's Race Readiness
              </h2>
              <p className="text-gray-700 dark:text-gray-200">
                <span className="font-extrabold text-gray-850 dark:text-white">
                  {profile.currentReadiness}
                </span>{" "}
                <span className="text-xs text-gray-400 uppercase">
                  ({getReadinessLevel(profile)})
                </span>
              </p>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
                Running Streak
              </h2>
              <p className="text-lg font-bold text-gray-850 dark:text-white">
                {calculateRunningStreak(profile)} days
              </p>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-slate-800" />

          {/* Preferences */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
                Preferred Surface
              </h2>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">
                {profile.preferredSurface || "Not set"}
              </p>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
                Preferred Distance
              </h2>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">
                {profile.preferredDistance || "Not set"}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
              Preferred Strategy
            </h2>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">
              {profile.preferredStrategy || "Not set"}
            </p>
          </div>
        </div>
      </main>
    </motion.div>
  );
}
