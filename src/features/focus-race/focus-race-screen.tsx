"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/use-translation";
import { useSettingsStore } from "@/store/settings-store";
import { usePreparationStore } from "@/store/preparation-store";
import { useGameStore } from "@/store/game-store";
import { generateRaceChallenge } from "@/services/challenge/generator";
import { OptionCard } from "@/components/ui/option-card";
import { NUTRITION_CATALOG, SHOES_CATALOG } from "@/shop/shop-catalog";
import type { TranslationKey } from "@/i18n/use-translation";
import { ArrowLeft, Target, Trophy, Navigation, Play, Zap } from "lucide-react";
import { useSound } from "@/hooks/use-sound";
import type { Surface, Elevation } from "@/types/engine";

type DistanceOption = {
  id: string;
  label: string;
  distance: number;
};

const DISTANCE_OPTIONS: DistanceOption[] = [
  { id: "5k", label: "5K Run", distance: 5 },
  { id: "10k", label: "10K Run", distance: 10 },
  { id: "half", label: "Half Marathon", distance: 21.1 },
  { id: "full", label: "Marathon", distance: 42.2 },
];

const TARGET_POSITIONS = [
  { id: "1st", label: "1st Place", desc: "Aiming for the absolute top", icon: "🥇" },
  { id: "podium", label: "Podium (Top 3)", desc: "Securing a medal position", icon: "🏆" },
  { id: "top10", label: "Top 10%", desc: "Highly competitive finish", icon: "⭐" },
  { id: "finisher", label: "Finisher", desc: "Just trying to complete the race", icon: "🏁" },
];

export function FocusRaceScreen() {
  const router = useRouter();
  const language = useSettingsStore((state) => state.settings.language);
  const lang = (language === "id" ? "id" : "en") as "en" | "id";
  const setGameMode = useSettingsStore((state) => state.setGameMode);
  const { t } = useTranslation();
  const { playSound } = useSound();
  const { preparation, setShoes, toggleNutrition, setNutritionQuantity } = usePreparationStore();
  const { setChallenge, setFocusTargetPosition } = useGameStore();

  const [activeTab, setActiveTab] = useState<"race" | "gear" | "nutrition">("race");
  const [selectedDistance, setSelectedDistance] = useState<number>(5);
  const [selectedTarget, setSelectedTarget] = useState<string>("finisher");

  const handleStartRace = () => {
    playSound("success");
    
    // Generate a custom challenge based on the selected distance
    const challenge = generateRaceChallenge({
      scheduleId: "focus_race",
      dayIndex: 1,
      distance: selectedDistance,
      surface: "road" as Surface,
      elevation: "flat" as Elevation,
      tier: "local",
      raceName: { en: "Focus Event", id: "Event Fokus" },
      entryFee: 0,
    });

    setChallenge(challenge);
    setFocusTargetPosition(selectedTarget);
    router.push("/race");
  };

  const handleBack = () => {
    playSound("click");
    // If they want to exit focus mode, send them back to onboarding
    // since they have no career state
    setGameMode("career"); // Or just "easy"
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 font-sans text-slate-800 dark:text-slate-200">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-[#E5E7EB] dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <div>
              <h1 className="font-heading font-black text-lg">Focus Mode</h1>
              <p className="text-[10px] uppercase font-bold tracking-wider text-indigo-500">Single Race Simulation</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-2xl mb-8 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab("race")}
            className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "race"
                ? "bg-white dark:bg-slate-900 shadow-sm text-indigo-600 dark:text-indigo-400"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            <Navigation className="w-4 h-4" />
            Race Settings
          </button>
          <button
            onClick={() => setActiveTab("gear")}
            className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "gear"
                ? "bg-white dark:bg-slate-900 shadow-sm text-indigo-600 dark:text-indigo-400"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            <Trophy className="w-4 h-4" />
            Shoes & Gear
          </button>
          <button
            onClick={() => setActiveTab("nutrition")}
            className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "nutrition"
                ? "bg-white dark:bg-slate-900 shadow-sm text-indigo-600 dark:text-indigo-400"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            <Zap className="w-4 h-4" />
            Nutrition
          </button>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-8"
        >
          {activeTab === "race" && (
            <>
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Navigation className="w-5 h-5 text-indigo-500" />
                  <h2 className="font-heading font-black text-lg">Select Distance</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {DISTANCE_OPTIONS.map((opt) => (
                    <OptionCard
                      key={opt.id}
                      id={`dist-${opt.id}`}
                      selected={selectedDistance === opt.distance}
                      onClick={() => setSelectedDistance(opt.distance)}
                      title={opt.label}
                      desc={`${opt.distance} km`}
                      className="min-h-[100px]"
                    />
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-rose-500" />
                  <h2 className="font-heading font-black text-lg">Target Position</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {TARGET_POSITIONS.map((pos) => (
                    <OptionCard
                      key={pos.id}
                      id={`target-${pos.id}`}
                      selected={selectedTarget === pos.id}
                      onClick={() => setSelectedTarget(pos.id)}
                      title={`${pos.icon} ${pos.label}`}
                      desc={pos.desc}
                    />
                  ))}
                </div>
              </section>
            </>
          )}

          {activeTab === "gear" && (
            <section>
              <div className="mb-4">
                <h2 className="font-heading font-black text-lg">Select Shoes</h2>
                <p className="text-xs text-slate-500">All shoes are unlocked in Focus Mode.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {SHOES_CATALOG.map((shoe) => (
                  <OptionCard
                    key={shoe.id}
                    id={`shoe-${shoe.id}`}
                    selected={preparation.shoes === shoe.id}
                    onClick={() => setShoes(shoe.id as any)}
                    title={shoe.name[lang]}
                    desc={shoe.description[lang]}
                    badges={[
                      ...(shoe.stats?.paceBonus ? [{ text: `+${shoe.stats.paceBonus} Pace`, color: "bg-indigo-50 text-indigo-600" }] : []),
                      ...(shoe.stats?.staminaBonus ? [{ text: `+${shoe.stats.staminaBonus} Stamina`, color: "bg-emerald-50 text-emerald-600" }] : [])
                    ]}
                  />
                ))}
              </div>
            </section>
          )}

          {activeTab === "nutrition" && (
            <section>
              <div className="mb-4">
                <h2 className="font-heading font-black text-lg">Select Nutrition</h2>
                <p className="text-xs text-slate-500">Pick what to carry during your race.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {NUTRITION_CATALOG.map((item) => {
                  const qty = preparation.nutritionQuantities?.[item.id as any] || (preparation.nutrition.includes(item.id as any) ? 1 : 0);
                  return (
                    <OptionCard
                      key={item.id}
                      id={`nutr-${item.id}`}
                      selected={preparation.nutrition.includes(item.id as any)}
                      onClick={() => {
                        toggleNutrition(item.id as any);
                      }}
                      title={item.name[lang]}
                      desc={item.description[lang]}
                      quantityControl={{
                        count: qty || 1,
                        maxCount: 5,
                        onIncrease: () => setNutritionQuantity(item.id as any, (qty || 1) + 1),
                        onDecrease: () => setNutritionQuantity(item.id as any, (qty || 1) - 1),
                      }}
                    />
                  );
                })}
              </div>
            </section>
          )}
        </motion.div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-[#E5E7EB] dark:border-slate-800 z-50">
        <div className="max-w-4xl mx-auto flex justify-end">
          <button
            onClick={handleStartRace}
            className="w-full md:w-auto py-3.5 px-8 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-black uppercase tracking-wider transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" />
            Start Simulation
          </button>
        </div>
      </div>
    </div>
  );
}
