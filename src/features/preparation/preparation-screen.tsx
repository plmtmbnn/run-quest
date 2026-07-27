"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  Flame,
  Info,
  MapPin,
  Share2,
  ShoppingBag,
  Sparkles,
  Wind,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useExpenseStore } from "@/store/expense-store";
import { LoadoutCard } from "@/components/share/loadout-card";
import { ShareModal } from "@/components/share/share-modal";
import { useSound } from "@/hooks/use-sound";
import type { TranslationKey } from "@/i18n/use-translation";
import { useTranslation } from "@/i18n/use-translation";
import { generateDailyChallenge } from "@/services/challenge/generator";
import { makeRegistrationKey } from "@/scheduling/race-calendar-engine";
import { useGameStore } from "@/store/game-store";
import { usePreparationStore } from "@/store/preparation-store";
import { useShopStore } from "@/shop/shop-store";
import { useTimelineStore } from "@/store/timeline-store";

export function PreparationScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const lang = (language === "id" ? "id" : "en") as "en" | "id";
  const { currentChallenge } = useGameStore();
  const dayIndex = useTimelineStore((state) => state.gameState?.dayIndex ?? 0);
  const schedulingState = useTimelineStore(
    (state) => state.gameState?.scheduling,
  );
  const { hasItem, getItemQuantity } = useShopStore();

  const challenge =
    currentChallenge || generateDailyChallenge(dayIndex.toString());

  useEffect(() => {
    if (!schedulingState) return;

    const scheduleId = currentChallenge?.scheduleId;
    if (!scheduleId) {
      return;
    }

    const instanceKey = makeRegistrationKey(scheduleId, dayIndex);
    const isThisOccurrenceDone =
      schedulingState.completedRaces[instanceKey] !== undefined ||
      schedulingState.completedRaces[`${scheduleId}_${dayIndex}`] !== undefined;

    if (isThisOccurrenceDone) {
      router.replace("/");
    }
  }, [schedulingState, currentChallenge?.scheduleId, dayIndex, router]);

  const {
    preparation,
    setShoes: _setShoes,
    toggleNutrition: _toggleNutrition,
    setNutritionQuantity: _setNutritionQuantity,
    toggleGear: _toggleGear,
    setWarmup: _setWarmup,
    setPacing: _setPacing,
    setMindset: _setMindset,
    setWarmupBonus,
  } = usePreparationStore();
  const { playSound } = useSound();

  const isTrailRace = challenge.race.surface === "trail";
  const isHotWeather = challenge.environment.temperature >= 25;
  const isColdWeather = challenge.environment.temperature <= 10;
  const isRainyWeather = challenge.environment.weather === "rain";

  const setShoes = (val: Parameters<typeof _setShoes>[0]) => {
    if (!hasItem("shoes", val)) return;
    if (!isTrailRace && (val === "trail" || val === "aggressive_trail" || val === "minimalist_trail")) {
      return;
    }
    if (isTrailRace && (val === "stability" || val === "max_cushion")) {
      return;
    }
    playSound("click");
    _setShoes(val);
  };

  const getShoeOptions = () => {
    const roadShoes: { id: import("@/types/engine").Shoe; disabled: boolean }[] = [
      { id: "daily_trainer", disabled: false },
      { id: "carbon_racer", disabled: false },
      { id: "lightweight", disabled: false },
      { id: "stability", disabled: false },
      { id: "max_cushion", disabled: false },
    ];
    
    const trailShoes: { id: import("@/types/engine").Shoe; disabled: boolean }[] = [
      { id: "trail", disabled: false },
      { id: "aggressive_trail", disabled: false },
      { id: "minimalist_trail", disabled: false },
    ];
    
    const allOptions = isTrailRace ? [...roadShoes, ...trailShoes] : roadShoes;
    return allOptions.filter((shoe) => hasItem("shoes", shoe.id));
  };
  const toggleNutrition = (val: Parameters<typeof _toggleNutrition>[0]) => {
    if (!hasItem("nutrition", val) || getItemQuantity("nutrition", val) <= 0) return;
    playSound("click");
    if (preparation.nutrition.length >= 3 && !preparation.nutrition.includes(val)) {
      return;
    }
    _toggleNutrition(val);
  };
  const toggleGear = (val: Parameters<typeof _toggleGear>[0]) => {
    if (!hasItem("gear", val)) return;
    playSound("click");
    if (preparation.gear.length >= 2 && !preparation.gear.includes(val)) {
      return;
    }
    _toggleGear(val);
  };
  const setWarmup = (val: Parameters<typeof _setWarmup>[0]) => {
    playSound("click");
    _setWarmup(val);
  };
  const setPacing = (val: Parameters<typeof _setPacing>[0]) => {
    playSound("click");
    _setPacing(val);
  };
  const setMindset = (val: Parameters<typeof _setMindset>[0]) => {
    playSound("click");
    _setMindset(val);
  };

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [showWarmupGame, setShowWarmupGame] = useState(false);
  const [warmupProgress, setWarmupProgress] = useState(0);
  const [direction, setDirection] = useState(1);
  const [gameResult, setGameResult] = useState<
    "perfect" | "good" | "normal" | null
  >(null);
  const [isStopped, setIsStopped] = useState(false);

  const scrollToCategory = (id: string) => {
    playSound("click");
    const el = document.getElementById(`section-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    if (!showWarmupGame || isStopped) return;

    const interval = setInterval(() => {
      setWarmupProgress((prev) => {
        let next = prev + direction * 5;
        if (next >= 100) {
          next = 100;
          setDirection(-1);
        } else if (next <= 0) {
          next = 0;
          setDirection(1);
        }
        return next;
      });
    }, 25);

    return () => clearInterval(interval);
  }, [showWarmupGame, direction, isStopped]);

  const handleTapWarmup = () => {
    if (isStopped) return;
    setIsStopped(true);

    let outcome: "perfect" | "good" | "normal" = "normal";
    if (warmupProgress >= 45 && warmupProgress <= 55) {
      outcome = "perfect";
      playSound("success");
    } else if (warmupProgress >= 30 && warmupProgress <= 70) {
      outcome = "good";
      playSound("click");
    } else {
      playSound("tick");
    }

    setGameResult(outcome);
    setWarmupBonus(outcome);

    setTimeout(() => {
      router.push("/race");
    }, 1500);
  };

  const handleStartSimulation = () => {
    if (useExpenseStore.getState().hasUnpaidExpenses()) {
      alert(t("expenses.unpaid_warning" as TranslationKey));
      return;
    }
    playSound("click");

    const energyCost = 25;
    const currentEnergy = useTimelineStore.getState().gameState?.energy || 100;
    const isLowEnergy = currentEnergy < energyCost;

    if (isLowEnergy && currentChallenge) {
      useGameStore.getState().setActiveGhost?.({
        runnerName: "LOW_ENERGY_DNF_RISK",
        splits: [0],
      });
    }

    if (preparation.warmup !== "none") {
      setShowWarmupGame(true);
      setWarmupProgress(0);
      setDirection(1);
      setGameResult(null);
      setIsStopped(false);
    } else {
      setWarmupBonus("normal");
      router.push("/race");
    }
  };

  const shareTitle = t("share.loadout.title" as TranslationKey);
  const shareText = `⚙️ RunQuest — ${t("share.loadout.title" as TranslationKey)}
🏁 ${challenge.race.title[lang]}

👟 ${t(`preparation.shoes.${preparation.shoes}.name` as TranslationKey)}
🥤 Nutrition: ${preparation.nutrition.length > 0 ? preparation.nutrition.map((n) => {
  const qty = preparation.nutritionQuantities?.[n] ?? 1;
  const name = t(`preparation.nutrition.${n}.name` as TranslationKey);
  return qty > 1 ? `${name} (x${qty})` : name;
}).join(", ") : "None"}
🔥 ${t(`preparation.warmup.${preparation.warmup}.name` as TranslationKey)}
📊 ${t(`preparation.pacing.${preparation.pacing}.name` as TranslationKey)}
🧠 ${t(`preparation.mindset.${preparation.mindset}.name` as TranslationKey)}
🎒 Gear: ${preparation.gear.length > 0 ? preparation.gear.map((g) => t(`preparation.gear.${g}.name` as TranslationKey)).join(", ") : "None"}

${t("share.loadout.cta" as TranslationKey)} https://runquest.game`;

  const CATEGORY_TABS = [
    { id: "shoes", label: t("preparation.shoes.title" as TranslationKey), icon: "👟" },
    { id: "nutrition", label: t("preparation.nutrition.title" as TranslationKey), icon: "🥤" },
    { id: "gear", label: t("preparation.gear.title" as TranslationKey), icon: "🎒" },
    { id: "warmup", label: t("preparation.warmup.title" as TranslationKey), icon: "🧘" },
    { id: "pacing", label: t("preparation.pacing.title" as TranslationKey), icon: "📉" },
    { id: "mindset", label: t("preparation.mindset.title" as TranslationKey), icon: "🧠" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28 lg:pb-24 text-slate-800 dark:text-white"
    >
      <header className="sticky top-0 z-20 border-b border-[#E5E7EB] dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 sm:px-6 py-3.5">
          <button
            id="back-to-home"
            type="button"
            onClick={() => {
              playSound("click");
              router.back();
            }}
            className="flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </button>
          <div>
            <h1 className="font-heading font-black text-lg sm:text-xl md:text-2xl text-slate-800 dark:text-white">
              {t("preparation.title" as TranslationKey)}
            </h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t("preparation.subtitle" as TranslationKey)}
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800/80 px-4 sm:px-6 py-2 overflow-x-auto scrollbar-none flex gap-2">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => scrollToCategory(tab.id)}
              className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 sm:gap-8 px-4 sm:px-6 py-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-8 sm:gap-10">
          <section id="section-shoes" className="flex flex-col gap-4 scroll-mt-28">
            <div className="flex items-center gap-2.5 border-b border-[#E5E7EB] dark:border-slate-800 pb-2.5">
              <span className="text-xl">👟</span>
              <h2 className="font-heading font-black text-base md:text-lg text-slate-800 dark:text-white">
                {t("preparation.shoes.title" as TranslationKey)}
              </h2>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-auto capitalize">
                {challenge.race.surface}
              </span>
            </div>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              {getShoeOptions().map((shoe) => {
                const isDisabled = 
                  (!isTrailRace && (shoe.id === "trail" || shoe.id === "aggressive_trail" || shoe.id === "minimalist_trail")) ||
                  (isTrailRace && (shoe.id === "stability" || shoe.id === "max_cushion"));
                
                return (
                  <OptionCard
                    key={shoe.id}
                    id={`shoe-${shoe.id}`}
                    selected={preparation.shoes === shoe.id}
                    onClick={() => setShoes(shoe.id)}
                    title={t(`preparation.shoes.${shoe.id}.name` as TranslationKey)}
                    desc={t(`preparation.shoes.${shoe.id}.desc` as TranslationKey)}
                    badges={[ 
                      ...(() => {
                        const badges = [];
                        if (shoe.id === "daily_trainer") {
                          badges.push({
                            text: t("preparation.badges.balanced" as TranslationKey),
                            color: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
                          });
                        } else if (shoe.id === "carbon_racer") {
                          badges.push(
                            {
                              text: t("preparation.badges.pace_up" as TranslationKey),
                              color: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40",
                            },
                            {
                              text: t("preparation.badges.fatigue_up" as TranslationKey),
                              color: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40",
                            }
                          );
                        } else if (shoe.id === "lightweight") {
                          badges.push(
                            {
                              text: t("preparation.badges.lightweight" as TranslationKey),
                              color: "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-900/40",
                            },
                            {
                              text: t("preparation.badges.comfort_down" as TranslationKey),
                              color: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40",
                            }
                          );
                        } else if (shoe.id === "trail") {
                          badges.push(
                            {
                              text: t("preparation.badges.trail_grip" as TranslationKey),
                              color: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40",
                            },
                            {
                              text: t("preparation.badges.road_speed_down" as TranslationKey),
                              color: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40",
                            }
                          );
                        } else if (shoe.id === "stability") {
                          badges.push(
                            {
                              text: t("preparation.badges.stability" as TranslationKey),
                              color: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/40",
                            },
                            {
                              text: t("preparation.badges.heavy" as TranslationKey),
                              color: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40",
                            }
                          );
                        } else if (shoe.id === "max_cushion") {
                          badges.push(
                            {
                              text: t("preparation.badges.comfort" as TranslationKey),
                              color: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40",
                            },
                            {
                              text: t("preparation.badges.slow" as TranslationKey),
                              color: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40",
                            }
                          );
                        } else if (shoe.id === "aggressive_trail") {
                          badges.push(
                            {
                              text: t("preparation.badges.grip" as TranslationKey),
                              color: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40",
                            },
                            {
                              text: t("preparation.badges.trail_only" as TranslationKey),
                              color: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
                            }
                          );
                        } else if (shoe.id === "minimalist_trail") {
                          badges.push(
                            {
                              text: t("preparation.badges.lightweight" as TranslationKey),
                              color: "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-900/40",
                            },
                            {
                              text: t("preparation.badges.comfort_down" as TranslationKey),
                              color: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40",
                            }
                          );
                        }
                        
                        if (isDisabled) {
                          badges.push({
                            text: isTrailRace
                              ? t("preparation.badges.road_only" as TranslationKey)
                              : t("preparation.badges.trail_only_prohibited" as TranslationKey),
                            color: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40",
                          });
                        }
                        
                        return badges;
                      })()
                    ]}
                    disabled={isDisabled}
                  />
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => router.push("/shop")}
              className="w-full py-3.5 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 rounded-2xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] min-h-[44px]"
            >
              <ShoppingBag className="w-4 h-4 text-indigo-500" />
              {t("preparation.get_more_shoes" as TranslationKey)}
            </button>
          </section>

          <section id="section-nutrition" className="flex flex-col gap-4 scroll-mt-28">
            <div className="flex items-center gap-2.5 border-b border-[#E5E7EB] dark:border-slate-800 pb-2.5">
              <span className="text-xl">🥤</span>
              <h2 className="font-heading font-black text-base md:text-lg text-slate-800 dark:text-white">
                {t("preparation.nutrition.title" as TranslationKey)}
              </h2>
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 ml-auto">
                {preparation.nutrition.length}/3
              </span>
            </div>
            {isHotWeather && (
              <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 p-3.5 rounded-2xl text-xs font-medium">
                {t("preparation.nutrition.hot_weather_tip" as TranslationKey)}
              </div>
            )}
            {isColdWeather && (
              <div className="bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-blue-800 dark:text-blue-300 p-3.5 rounded-2xl text-xs font-medium">
                {t("preparation.nutrition.cold_weather_tip" as TranslationKey)}
              </div>
            )}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              {[
                { id: "water" as const, nameKey: "preparation.nutrition.water.name", descKey: "preparation.nutrition.water.desc", badges: [{ text: t("preparation.badges.hydration_stability" as TranslationKey), color: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40" }] },
                { id: "electrolyte" as const, nameKey: "preparation.nutrition.electrolyte.name", descKey: "preparation.nutrition.electrolyte.desc", badges: [{ text: t("preparation.badges.reduced_cramp_risk" as TranslationKey), color: "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-900/40" }] },
                { id: "energy_gel" as const, nameKey: "preparation.nutrition.energy_gel.name", descKey: "preparation.nutrition.energy_gel.desc", badges: [{ text: t("preparation.badges.energy_boost" as TranslationKey), color: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40" }, { text: t("preparation.badges.stomach_stress_risk" as TranslationKey), color: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40" }] },
                { id: "caffeine" as const, nameKey: "preparation.nutrition.caffeine.name", descKey: "preparation.nutrition.caffeine.desc", badges: [{ text: t("preparation.badges.early_focus" as TranslationKey), color: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/40" }, { text: t("preparation.badges.energy_crash_risk" as TranslationKey), color: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40" }] },
                { id: "energy_bar" as const, nameKey: "preparation.nutrition.energy_bar.name", descKey: "preparation.nutrition.energy_bar.desc", badges: [{ text: t("preparation.badges.energy" as TranslationKey), color: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40" }, { text: t("preparation.badges.slow_absorption" as TranslationKey), color: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40" }] },
                { id: "hydration_mix" as const, nameKey: "preparation.nutrition.hydration_mix.name", descKey: "preparation.nutrition.hydration_mix.desc", badges: [{ text: t("preparation.badges.hydration" as TranslationKey), color: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40" }, { text: t("preparation.badges.energy" as TranslationKey), color: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40" }] },
                { id: "salt_tablets" as const, nameKey: "preparation.nutrition.salt_tablets.name", descKey: "preparation.nutrition.salt_tablets.desc", badges: [{ text: t("preparation.badges.cramp_prevention" as TranslationKey), color: "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-900/40" }] },
                { id: "caffeine_gum" as const, nameKey: "preparation.nutrition.caffeine_gum.name", descKey: "preparation.nutrition.caffeine_gum.desc", badges: [{ text: t("preparation.badges.focus" as TranslationKey), color: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/40" }] },
              ].filter((nut) => hasItem("nutrition", nut.id) && getItemQuantity("nutrition", nut.id) > 0)
              .map((nut) => {
                const ownedQty = getItemQuantity("nutrition", nut.id);
                const isSelected = preparation.nutrition.includes(nut.id);
                const currentQty = preparation.nutritionQuantities?.[nut.id] ?? 1;
                const isDisabled = !hasItem("nutrition", nut.id) || ownedQty <= 0;

                return (
                  <OptionCard
                    key={nut.id}
                    id={`nutr-${nut.id}`}
                    selected={isSelected}
                    isMultiSelect={true}
                    onClick={() => toggleNutrition(nut.id)}
                    title={`${t(nut.nameKey as TranslationKey)} ${ownedQty > 0 ? (t("preparation.owned_count" as TranslationKey) || "").replace("{count}", String(ownedQty)) : ""}`}
                    desc={t(nut.descKey as TranslationKey)}
                    badges={nut.badges}
                    disabled={isDisabled}
                    quantityControl={
                      isSelected
                        ? {
                            count: currentQty,
                            maxCount: Math.min(4, Math.max(1, ownedQty)),
                            onIncrease: () => _setNutritionQuantity(nut.id, Math.min(ownedQty, currentQty + 1)),
                            onDecrease: () => _setNutritionQuantity(nut.id, currentQty - 1),
                          }
                        : undefined
                    }
                  />
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => router.push("/shop")}
              className="w-full py-3.5 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 rounded-2xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] min-h-[44px]"
            >
              <ShoppingBag className="w-4 h-4 text-indigo-500" />
              {t("preparation.get_more_nutrition" as TranslationKey)}
            </button>
          </section>

          <section id="section-gear" className="flex flex-col gap-4 scroll-mt-28">
            <div className="flex items-center gap-2.5 border-b border-[#E5E7EB] dark:border-slate-800 pb-2.5">
              <span className="text-xl">🎒</span>
              <h2 className="font-heading font-black text-base md:text-lg text-slate-800 dark:text-white">
                {t("preparation.gear.title" as TranslationKey)}
              </h2>
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 ml-auto">
                {preparation.gear.length}/2
              </span>
            </div>
            {isHotWeather && (
              <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 p-3.5 rounded-2xl text-xs font-medium">
                {t("preparation.gear.hot_weather_tip" as TranslationKey)}
              </div>
            )}
            {isColdWeather && (
              <div className="bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-blue-800 dark:text-blue-300 p-3.5 rounded-2xl text-xs font-medium">
                {t("preparation.gear.cold_weather_tip" as TranslationKey)}
              </div>
            )}
            {isRainyWeather && (
              <div className="bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-blue-800 dark:text-blue-300 p-3.5 rounded-2xl text-xs font-medium">
                {t("preparation.gear.rainy_weather_tip" as TranslationKey)}
              </div>
            )}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              {[
                { id: "cap" as const, nameKey: "preparation.gear.cap.name", descKey: "preparation.gear.cap.desc", badges: [{ text: t("preparation.badges.sun_rain" as TranslationKey), color: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/40" }] },
                { id: "sunglasses" as const, nameKey: "preparation.gear.sunglasses.name", descKey: "preparation.gear.sunglasses.desc", badges: [{ text: t("preparation.badges.glare_block" as TranslationKey), color: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/40" }] },
                { id: "arm_sleeves" as const, nameKey: "preparation.gear.arm_sleeves.name", descKey: "preparation.gear.arm_sleeves.desc", badges: [{ text: t("preparation.badges.warmth" as TranslationKey), color: "bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border border-pink-200/60 dark:border-pink-900/40" }] },
                { id: "hydration_vest" as const, nameKey: "preparation.gear.hydration_vest.name", descKey: "preparation.gear.hydration_vest.desc", badges: [{ text: t("preparation.badges.capacity" as TranslationKey), color: "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-900/40" }, { text: t("preparation.badges.heavy" as TranslationKey), color: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700" }] },
                { id: "lightweight_jacket" as const, nameKey: "preparation.gear.lightweight_jacket.name", descKey: "preparation.gear.lightweight_jacket.desc", badges: [{ text: t("preparation.badges.windproof" as TranslationKey), color: isColdWeather || isRainyWeather ? "bg-indigo-100 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-100 border border-indigo-300 dark:border-indigo-700" : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/40" }, { text: t("preparation.badges.water_resistant" as TranslationKey), color: isRainyWeather ? "bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-100 border border-blue-300 dark:border-blue-700" : "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40" }], className: (isColdWeather || isRainyWeather) ? "ring-2 ring-indigo-500/50" : "" },
                { id: "compression_socks" as const, nameKey: "preparation.gear.compression_socks.name", descKey: "preparation.gear.compression_socks.desc", badges: [{ text: t("preparation.badges.recovery" as TranslationKey), color: "bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border border-pink-200/60 dark:border-pink-900/40" }, { text: t("preparation.badges.comfort" as TranslationKey), color: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40" }] },
                { id: "trail_gaiters" as const, nameKey: "preparation.gear.trail_gaiters.name", descKey: "preparation.gear.trail_gaiters.desc", badges: [{ text: t("preparation.badges.debris_protection" as TranslationKey), color: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40" }, { text: t("preparation.badges.trail_only" as TranslationKey), color: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700" }] },
                { id: "moisture_wicking_shirt" as const, nameKey: "preparation.gear.moisture_wicking_shirt.name", descKey: "preparation.gear.moisture_wicking_shirt.desc", badges: [{ text: t("preparation.badges.breathable" as TranslationKey), color: isHotWeather ? "bg-sky-100 dark:bg-sky-900/60 text-sky-900 dark:text-sky-100 border border-sky-300 dark:border-sky-700" : "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-900/40" }, { text: t("preparation.badges.hot_weather" as TranslationKey), color: isHotWeather ? "bg-rose-100 dark:bg-rose-900/60 text-rose-900 dark:text-rose-100 border border-rose-300 dark:border-rose-700" : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40" }], className: isHotWeather ? "ring-2 ring-rose-500/50" : "" },
              ].filter((g) => hasItem("gear", g.id))
              .map((gear) => (
                <OptionCard
                  key={gear.id}
                  id={`gear-${gear.id}`}
                  selected={preparation.gear.includes(gear.id)}
                  onClick={() => toggleGear(gear.id)}
                  title={t(gear.nameKey as TranslationKey)}
                  desc={t(gear.descKey as TranslationKey)}
                  badges={gear.badges}
                  isMultiSelect
                  className={gear.className}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => router.push("/shop")}
              className="w-full py-3.5 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 rounded-2xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] min-h-[44px]"
            >
              <ShoppingBag className="w-4 h-4 text-indigo-500" />
              {t("preparation.get_more_gear" as TranslationKey)}
            </button>
          </section>

          <section id="section-warmup" className="flex flex-col gap-4 scroll-mt-28">
            <div className="flex items-center gap-2.5 border-b border-[#E5E7EB] dark:border-slate-800 pb-2.5">
              <span className="text-xl">🧘</span>
              <h2 className="font-heading font-black text-base md:text-lg text-slate-800 dark:text-white">
                {t("preparation.warmup.title" as TranslationKey)}
              </h2>
            </div>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
              <OptionCard
                id="warm-none"
                selected={preparation.warmup === "none"}
                onClick={() => setWarmup("none")}
                title={t("preparation.warmup.none.name" as TranslationKey)}
                desc={t("preparation.warmup.none.desc" as TranslationKey)}
                badges={[
                  {
                    text: t("preparation.warmup.none.name" as TranslationKey),
                    color:
                      "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
                  },
                ]}
              />
              <OptionCard
                id="warm-dynamic"
                selected={preparation.warmup === "dynamic"}
                onClick={() => setWarmup("dynamic")}
                title={t("preparation.warmup.dynamic.name" as TranslationKey)}
                desc={t("preparation.warmup.dynamic.desc" as TranslationKey)}
                badges={[
                  {
                    text: t("preparation.badges.balanced" as TranslationKey),
                    color:
                      "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40",
                  },
                ]}
              />
              <OptionCard
                id="warm-full"
                selected={preparation.warmup === "full"}
                onClick={() => setWarmup("full")}
                title={t("preparation.warmup.full.name" as TranslationKey)}
                desc={t("preparation.warmup.full.desc" as TranslationKey)}
                badges={[
                  {
                    text: t("preparation.badges.ignore_pain" as TranslationKey),
                    color:
                      "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40",
                  },
                  {
                    text: t("preparation.badges.fatigue_up" as TranslationKey),
                    color:
                      "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40",
                  },
                ]}
              />
            </div>
          </section>

          <section id="section-pacing" className="flex flex-col gap-4 scroll-mt-28">
            <div className="flex items-center gap-2.5 border-b border-[#E5E7EB] dark:border-slate-800 pb-2.5">
              <span className="text-xl">📉</span>
              <h2 className="font-heading font-black text-base md:text-lg text-slate-800 dark:text-white">
                {t("preparation.pacing.title" as TranslationKey)}
              </h2>
            </div>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              <OptionCard
                id="pace-neg"
                selected={preparation.pacing === "negative_split"}
                onClick={() => setPacing("negative_split")}
                title={t(
                  "preparation.pacing.negative_split.name" as TranslationKey,
                )}
                desc={t(
                  "preparation.pacing.negative_split.desc" as TranslationKey,
                )}
                badges={[
                  {
                    text: t("preparation.badges.early_focus" as TranslationKey),
                    color:
                      "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40",
                  },
                ]}
              />
              <OptionCard
                id="pace-steady"
                selected={preparation.pacing === "steady"}
                onClick={() => setPacing("steady")}
                title={t("preparation.pacing.steady.name" as TranslationKey)}
                desc={t("preparation.pacing.steady.desc" as TranslationKey)}
                badges={[
                  {
                    text: t("preparation.badges.rhythm" as TranslationKey),
                    color:
                      "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/40",
                  },
                ]}
              />
              <OptionCard
                id="pace-aggressive"
                selected={preparation.pacing === "aggressive"}
                onClick={() => setPacing("aggressive")}
                title={t(
                  "preparation.pacing.aggressive.name" as TranslationKey,
                )}
                desc={t("preparation.pacing.aggressive.desc" as TranslationKey)}
                badges={[
                  {
                    text: t("preparation.badges.fast_start" as TranslationKey),
                    color:
                      "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40",
                  },
                  {
                    text: t("preparation.badges.high_dnf_risk" as TranslationKey),
                    color:
                      "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40",
                  },
                ]}
              />
              <OptionCard
                id="pace-conservative"
                selected={preparation.pacing === "conservative"}
                onClick={() => setPacing("conservative")}
                title={t(
                  "preparation.pacing.conservative.name" as TranslationKey,
                )}
                desc={t(
                  "preparation.pacing.conservative.desc" as TranslationKey,
                )}
                badges={[
                  {
                    text: t("preparation.badges.ultra_safe" as TranslationKey),
                    color:
                      "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
                  },
                ]}
              />
            </div>
          </section>

          <section id="section-mindset" className="flex flex-col gap-4 scroll-mt-28">
            <div className="flex items-center gap-2.5 border-b border-[#E5E7EB] dark:border-slate-800 pb-2.5">
              <span className="text-xl">🧠</span>
              <h2 className="font-heading font-black text-base md:text-lg text-slate-800 dark:text-white">
                {t("preparation.mindset.title" as TranslationKey)}
              </h2>
            </div>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
              <OptionCard
                id="mind-calm"
                selected={preparation.mindset === "calm"}
                onClick={() => setMindset("calm")}
                title={t("preparation.mindset.calm.name" as TranslationKey)}
                desc={t("preparation.mindset.calm.desc" as TranslationKey)}
                badges={[
                  {
                    text: t("preparation.badges.low_stress" as TranslationKey),
                    color:
                      "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40",
                  },
                ]}
              />
              <OptionCard
                id="mind-confident"
                selected={preparation.mindset === "confident"}
                onClick={() => setMindset("confident")}
                title={t(
                  "preparation.mindset.confident.name" as TranslationKey,
                )}
                desc={t("preparation.mindset.confident.desc" as TranslationKey)}
                badges={[
                  {
                    text: t("preparation.badges.morale_up" as TranslationKey),
                    color:
                      "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40",
                  },
                ]}
              />
              <OptionCard
                id="mind-fearless"
                selected={preparation.mindset === "fearless"}
                onClick={() => setMindset("fearless")}
                title={t("preparation.mindset.fearless.name" as TranslationKey)}
                desc={t("preparation.mindset.fearless.desc" as TranslationKey)}
                badges={[
                  {
                    text: t("preparation.badges.ignore_pain" as TranslationKey),
                    color:
                      "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40",
                  },
                  {
                    text: t("preparation.badges.crash_risk" as TranslationKey),
                    color:
                      "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40",
                  },
                ]}
              />
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-6 lg:sticky lg:top-28 lg:h-[fit-content]">
          <div className="rounded-[2rem] border border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <h3 className="font-heading font-black text-sm text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Info className="h-4 w-4 text-indigo-500" />
              {t("preparation.conditions" as TranslationKey)}
            </h3>
            <div className="flex flex-col gap-4 text-sm">
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  {t("challenge.briefing.surface_type" as TranslationKey)}
                </p>
                <p className="font-heading font-black text-sm text-slate-800 dark:text-white">
                  {challenge.race.title[lang]}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {t("challenge.briefing.distance" as TranslationKey)}
                    </p>
                    <p className="font-mono font-bold text-sm text-slate-700 dark:text-slate-200">
                      {challenge.race.distance} km
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    <Flame className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {t("challenge.briefing.weather_temp" as TranslationKey)}
                    </p>
                    <p className="font-mono font-bold text-sm text-slate-700 dark:text-slate-200">
                      {t(
                        `challenge.weather.${challenge.environment.weather}` as TranslationKey,
                      )}{" "}
                      {challenge.environment.temperature}°C
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    <Wind className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {t("challenge.briefing.surface_type" as TranslationKey)}
                    </p>
                    <p className="font-heading font-black text-xs text-slate-700 dark:text-slate-200 capitalize">
                      {t(
                        `challenge.surface.${challenge.race.surface}` as TranslationKey,
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {t("challenge.briefing.target_time" as TranslationKey)}
                    </p>
                    <p className="font-mono font-bold text-sm text-slate-700 dark:text-slate-200">
                      {Math.floor(challenge.objective.targetTime / 60)}m
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-t border-[#E5E7EB] dark:border-slate-800 pt-3 text-xs text-amber-800 dark:text-amber-300 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl p-3.5 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">{challenge.race.description[lang]}</p>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex rounded-[2rem] border border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-lg shadow-slate-900/5 dark:shadow-slate-950/40 backdrop-blur-md flex-col gap-3">
            {useExpenseStore.getState().hasUnpaidExpenses() && (
              <div className="p-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{t("expenses.unpaid_warning" as TranslationKey)}</span>
              </div>
            )}
            <button
              id="ready-race-cta"
              type="button"
              disabled={useExpenseStore.getState().hasUnpaidExpenses()}
              onClick={handleStartSimulation}
              className={`w-full py-3.5 rounded-2xl text-xs md:text-sm font-black uppercase tracking-wider transition-all duration-200 shadow-md flex items-center justify-center gap-2 min-h-[44px] ${
                useExpenseStore.getState().hasUnpaidExpenses()
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none"
                  : "bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white shadow-indigo-500/20"
              }`}
            >
              {t("preparation.ready" as TranslationKey)} →
            </button>
            <button
              type="button"
              onClick={() => {
                playSound("click");
                setIsShareOpen(true);
              }}
              className="w-full py-3 rounded-2xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 min-h-[44px]"
            >
              <Share2 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <span>{t("share.loadout.button" as TranslationKey)}</span>
            </button>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-slate-900/95 border-t border-[#E5E7EB] dark:border-slate-800 backdrop-blur-md z-30 lg:hidden flex items-center gap-3 shadow-lg">
        <button
          type="button"
          disabled={useExpenseStore.getState().hasUnpaidExpenses()}
          onClick={handleStartSimulation}
          className={`flex-1 py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 shadow-md flex items-center justify-center gap-2 min-h-[44px] ${
            useExpenseStore.getState().hasUnpaidExpenses()
              ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none"
              : "bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white shadow-indigo-500/20"
          }`}
        >
          <span>{t("preparation.ready" as TranslationKey)}</span> →
        </button>
        <button
          type="button"
          onClick={() => {
            playSound("click");
            setIsShareOpen(true);
          }}
          className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 active:scale-95 transition-all flex items-center justify-center min-w-[44px] min-h-[44px]"
          aria-label={t("share.loadout.button" as TranslationKey)}
        >
          <Share2 className="h-5 w-5 text-slate-500 dark:text-slate-400" />
        </button>
      </div>

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        shareText={shareText}
        shareTitle={shareTitle}
        fileName={`runquest-loadout-${challenge.date}.png`}
      >
        <LoadoutCard
          preparation={preparation}
          raceTitle={challenge.race.title[lang]}
          lang={lang}
          date={challenge.date}
        />
      </ShareModal>

      {showWarmupGame && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-6 max-w-md w-full shadow-2xl flex flex-col gap-6 text-center">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-indigo-500 dark:text-indigo-400 font-bold">
                {t("preparation.warmup_challenge.badge" as TranslationKey)}
              </span>
              <h3 className="font-heading font-black text-lg text-slate-800 dark:text-white mt-1">
                {t("preparation.warmup_challenge.title" as TranslationKey)}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {t("preparation.warmup_challenge.desc" as TranslationKey)}
              </p>
            </div>

            <div className="relative w-full h-8 bg-slate-100 dark:bg-slate-950 rounded-full border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center">
              <div className="absolute left-[30%] right-[30%] h-full bg-amber-400/20 dark:bg-amber-400/10 border-l border-r border-amber-400/30" />

              <div className="absolute left-[45%] right-[45%] h-full bg-emerald-500/20 dark:bg-emerald-500/30 border-l border-r border-emerald-500/50 flex items-center justify-center">
                <span className="text-[8px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest pointer-events-none">
                  {t("preparation.warmup_challenge.target" as TranslationKey)}
                </span>
              </div>

              <div
                className="absolute w-2.5 h-full bg-indigo-500 shadow-md shadow-indigo-500/30 rounded-full transition-all duration-75"
                style={{ left: `calc(${warmupProgress}% - 4px)` }}
              />
            </div>

            <div className="flex flex-col gap-4 items-center">
              {gameResult ? (
                <div
                  className={`text-xs font-black px-4 py-2.5 rounded-2xl uppercase tracking-wider
                    ${gameResult === "perfect" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40" : ""}
                    ${gameResult === "good" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40" : ""}
                    ${gameResult === "normal" ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700" : ""}
                  `}
                >
                  {gameResult === "perfect" &&
                    t("preparation.warmup_challenge.perfect" as TranslationKey)}
                  {gameResult === "good" && t("preparation.warmup_challenge.good" as TranslationKey)}
                  {gameResult === "normal" && t("preparation.warmup_challenge.normal" as TranslationKey)}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleTapWarmup}
                  className="w-full py-3.5 px-6 rounded-2xl text-xs font-black text-white bg-indigo-500 hover:bg-indigo-600 shadow-md shadow-indigo-500/20 active:scale-95 transition-all uppercase tracking-wider cursor-pointer min-h-[44px]"
                >
                  {t("preparation.warmup_challenge.tap_button" as TranslationKey)}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

interface BadgeProp {
  text: string;
  color: string;
}

interface OptionCardProps {
  id: string;
  selected: boolean;
  onClick: () => void;
  title: string;
  desc: string;
  badges?: BadgeProp[];
  isMultiSelect?: boolean;
  disabled?: boolean;
  className?: string;
  quantityControl?: {
    count: number;
    maxCount: number;
    onIncrease: () => void;
    onDecrease: () => void;
  };
}

function OptionCard({
  id,
  selected,
  onClick,
  title,
  desc,
  badges = [],
  isMultiSelect = false,
  disabled = false,
  className = "",
  quantityControl,
}: OptionCardProps) {
  const { t } = useTranslation();
  return (
    <div
      id={id}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={disabled ? undefined : onClick}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`group relative flex w-full flex-col text-left rounded-[2rem] p-4 sm:p-5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:scale-[0.99] min-h-[120px] ${
        selected
          ? "bg-indigo-50/50 dark:bg-indigo-950/30 border-2 border-indigo-500 dark:border-indigo-500 shadow-md shadow-indigo-500/10"
          : "bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md"
      } ${
        disabled
          ? "opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
          : "cursor-pointer"
      } ${className}`}
    >
      <div className="flex w-full items-start justify-between mb-2 gap-2">
        <h3 className="font-heading font-black text-sm md:text-base text-slate-800 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {title}
        </h3>
        {/* Selection indicator */}
        <div
          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center border-2 transition-all mt-0.5 ${
            isMultiSelect ? "rounded-md" : "rounded-full"
          } ${
            selected
              ? "border-indigo-500 bg-indigo-500 text-white shadow-sm"
              : "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 group-hover:border-indigo-400 dark:group-hover:border-indigo-400"
          }`}
        >
          {selected && (
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
              role="img"
              aria-label="Checked"
            >
              <title>Checked</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3 flex-grow">
        {desc}
      </p>
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
          {badges.map((badge) => (
            <span
              key={badge.text}
              className={`rounded-md px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase ${badge.color}`}
            >
              {badge.text}
            </span>
          ))}
        </div>
      )}

      {selected && quantityControl && (
        <div
          className="mt-3 flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800/80 pt-3 w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
            {(t("preparation.qty_format" as TranslationKey) || "")
              .replace("{count}", String(quantityControl.count))
              .replace("{max}", String(quantityControl.maxCount))}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                quantityControl.onDecrease();
              }}
              disabled={quantityControl.count <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 disabled:opacity-40 font-mono font-bold text-base transition-all active:scale-95"
            >
              -
            </button>
            <span className="w-6 text-center font-mono font-bold text-sm text-slate-800 dark:text-white">
              {quantityControl.count}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                quantityControl.onIncrease();
              }}
              disabled={quantityControl.count >= quantityControl.maxCount || quantityControl.count >= 4}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 disabled:opacity-40 font-mono font-bold text-base transition-all active:scale-95"
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
