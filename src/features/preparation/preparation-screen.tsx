"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  Bookmark,
  Check,
  Clock,
  Flame,
  Info,
  Layers,
  MapPin,
  Plus,
  Share2,
  ShoppingBag,
  Sliders,
  Sparkles,
  Trash2,
  Wind,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadoutCard } from "@/components/share/loadout-card";
import { ShareModal } from "@/components/share/share-modal";
import { ScreenTour } from "@/components/tour/screen-tour";
import { OptionCard } from "@/components/ui/option-card";
import { useSound } from "@/hooks/use-sound";
import type { TranslationKey } from "@/i18n/use-translation";
import { useTranslation } from "@/i18n/use-translation";
import { makeRegistrationKey } from "@/scheduling/race-calendar-engine";
import { generateDailyChallenge } from "@/services/challenge/generator";
import { useShopStore } from "@/shop/shop-store";
import { useExpenseStore } from "@/store/expense-store";
import type { Distance } from "@/store/focus-progression-store";
import { useGameStore } from "@/store/game-store";
import { useGhostStore } from "@/store/ghost-store";
import { useLoadoutStore } from "@/store/loadout-store";
import { usePreparationStore } from "@/store/preparation-store";
import { useTimelineStore } from "@/store/timeline-store";

export function PreparationScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const [runTour, setRunTour] = useState(false);
  const lang = (language === "id" ? "id" : "en") as "en" | "id";
  const { currentChallenge } = useGameStore();
  const dayIndex = useTimelineStore((state) => state.gameState?.dayIndex ?? 0);
  const schedulingState = useTimelineStore(
    (state) => state.gameState?.scheduling,
  );
  const { hasItem, getItemQuantity } = useShopStore();
  const { storedGhosts, selectedGhostIds, toggleSelectGhost } = useGhostStore();
  const { getLoadoutsForDistance, useLoadout, createLoadout, deleteLoadout } =
    useLoadoutStore();

  const challenge =
    currentChallenge || generateDailyChallenge(dayIndex.toString());

  // Loadout state
  const [showLoadoutSelector, setShowLoadoutSelector] = useState(false);
  const [showSaveLoadout, setShowSaveLoadout] = useState(false);
  const [loadoutName, setLoadoutName] = useState("");
  const [activeLoadoutId, setActiveLoadoutId] = useState<string | null>(null);
  const [appliedToast, setAppliedToast] = useState<string | null>(null);

  // Get loadouts for current race distance with fallback
  const raceDistance = challenge.race.distance;
  const availableLoadouts = (() => {
    const matching = getLoadoutsForDistance(raceDistance as Distance);
    if (matching.length > 0) return matching;
    return useLoadoutStore.getState().loadouts;
  })();

  useEffect(() => {
    if (!schedulingState) return;

    const scheduleId = currentChallenge?.scheduleId;
    if (
      !scheduleId ||
      scheduleId.startsWith("parkrun_") ||
      scheduleId.startsWith("focus_") ||
      scheduleId.startsWith("quick_")
    ) {
      return;
    }

    const instanceKey = makeRegistrationKey(scheduleId, dayIndex);
    const completedDay =
      schedulingState.completedRaces[instanceKey] ??
      schedulingState.completedRaces[`${scheduleId}_${dayIndex}`];

    const isThisOccurrenceDone = completedDay === dayIndex;

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
    setPreparation,
  } = usePreparationStore();
  const { playSound } = useSound();

  const isTrailRace = challenge.race.surface === "trail";
  const isHotWeather = challenge.environment.temperature >= 25;
  const isColdWeather = challenge.environment.temperature <= 10;
  const isRainyWeather = challenge.environment.weather === "rain";

  const setShoes = (val: Parameters<typeof _setShoes>[0]) => {
    if (!hasItem("shoes", val)) return;
    if (
      !isTrailRace &&
      (val === "trail" ||
        val === "aggressive_trail" ||
        val === "minimalist_trail")
    ) {
      return;
    }
    if (isTrailRace && (val === "stability" || val === "max_cushion")) {
      return;
    }
    playSound("click");
    _setShoes(val);
  };

  const getShoeOptions = () => {
    const roadShoes: {
      id: import("@/types/engine").Shoe;
      disabled: boolean;
    }[] = [
      { id: "daily_trainer", disabled: false },
      { id: "carbon_racer", disabled: false },
      { id: "lightweight", disabled: false },
      { id: "stability", disabled: false },
      { id: "max_cushion", disabled: false },
      { id: "marathon_racer", disabled: false },
      { id: "speed_flats", disabled: false },
      { id: "plated_supershoe", disabled: false },
    ];

    const trailShoes: {
      id: import("@/types/engine").Shoe;
      disabled: boolean;
    }[] = [
      { id: "trail", disabled: false },
      { id: "aggressive_trail", disabled: false },
      { id: "minimalist_trail", disabled: false },
      { id: "ultra_trail", disabled: false },
    ];

    const allOptions = isTrailRace ? [...roadShoes, ...trailShoes] : roadShoes;
    return allOptions.filter((shoe) => hasItem("shoes", shoe.id));
  };
  const toggleNutrition = (val: Parameters<typeof _toggleNutrition>[0]) => {
    if (!hasItem("nutrition", val) || getItemQuantity("nutrition", val) <= 0)
      return;
    playSound("click");
    if (
      preparation.nutrition.length >= 3 &&
      !preparation.nutrition.includes(val)
    ) {
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

  // Loadout handlers
  const handleLoadLoadout = (loadoutId: string) => {
    const loadout = useLoadoutStore.getState().getLoadoutById(loadoutId);
    if (!loadout) return;

    playSound("success");

    const prep = loadout.preparation;

    // Shoe ownership & terrain validation: fallback to daily_trainer if not owned/valid
    const isShoeOwned = hasItem("shoes", prep.shoes);
    const isShoeValidForTerrain = isTrailRace
      ? prep.shoes !== "stability" && prep.shoes !== "max_cushion"
      : prep.shoes !== "trail" &&
        prep.shoes !== "aggressive_trail" &&
        prep.shoes !== "minimalist_trail";

    const selectedShoe =
      isShoeOwned && isShoeValidForTerrain ? prep.shoes : "daily_trainer";

    // Nutrition ownership validation
    const validNutrition = prep.nutrition.filter(
      (n) => hasItem("nutrition", n) && getItemQuantity("nutrition", n) > 0,
    );

    const validQuantities: Record<string, number> = {};
    validNutrition.forEach((n) => {
      const ownedQty = getItemQuantity("nutrition", n);
      const requestedQty = prep.nutritionQuantities?.[n] ?? 1;
      validQuantities[n] = Math.min(requestedQty, Math.max(1, ownedQty));
    });

    // Gear ownership validation
    const validGear = prep.gear.filter((g) => hasItem("gear", g));

    setPreparation({
      shoes: selectedShoe,
      nutrition: validNutrition,
      gear: validGear,
      warmup: prep.warmup,
      pacing: prep.pacing,
      mindset: prep.mindset,
      nutritionQuantities: validQuantities,
    });

    // Mark loadout as used & update active selection UI state
    useLoadout(loadoutId);
    setActiveLoadoutId(loadoutId);
    setAppliedToast(loadout.name);
    setShowLoadoutSelector(false);
  };

  const handleSaveLoadout = () => {
    if (!loadoutName.trim()) {
      alert("Please enter a loadout name");
      return;
    }

    if (![5, 10, 21.1, 42.2].includes(raceDistance)) {
      alert(
        "Loadouts are only supported for 5K, 10K, Half Marathon, and Marathon distances",
      );
      return;
    }

    playSound("success");
    createLoadout({
      name: loadoutName,
      distance: raceDistance as Distance,
      preparation: { ...preparation },
      autoApply: false,
    });

    setLoadoutName("");
    setShowSaveLoadout(false);
  };

  const handleDeleteLoadout = (loadoutId: string) => {
    if (confirm("Are you sure you want to delete this loadout?")) {
      playSound("click");
      deleteLoadout(loadoutId);
    }
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
🥤 Nutrition: ${
    preparation.nutrition.length > 0
      ? preparation.nutrition
          .map((n) => {
            const qty = preparation.nutritionQuantities?.[n] ?? 1;
            const name = t(`preparation.nutrition.${n}.name` as TranslationKey);
            return qty > 1 ? `${name} (x${qty})` : name;
          })
          .join(", ")
      : "None"
  }
🔥 ${t(`preparation.warmup.${preparation.warmup}.name` as TranslationKey)}
📊 ${t(`preparation.pacing.${preparation.pacing}.name` as TranslationKey)}
🧠 ${t(`preparation.mindset.${preparation.mindset}.name` as TranslationKey)}
🎒 Gear: ${preparation.gear.length > 0 ? preparation.gear.map((g) => t(`preparation.gear.${g}.name` as TranslationKey)).join(", ") : "None"}

${t("share.loadout.cta" as TranslationKey)} https://runquest.game`;

  const CATEGORY_TABS = [
    {
      id: "shoes",
      label: t("preparation.shoes.title" as TranslationKey),
      icon: "👟",
    },
    {
      id: "nutrition",
      label: t("preparation.nutrition.title" as TranslationKey),
      icon: "🥤",
    },
    {
      id: "gear",
      label: t("preparation.gear.title" as TranslationKey),
      icon: "🎒",
    },
    {
      id: "warmup",
      label: t("preparation.warmup.title" as TranslationKey),
      icon: "🧘",
    },
    {
      id: "pacing",
      label: t("preparation.pacing.title" as TranslationKey),
      icon: "📉",
    },
    {
      id: "mindset",
      label: t("preparation.mindset.title" as TranslationKey),
      icon: "🧠",
    },
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
          <div className="flex-1 min-w-0">
            <h1 className="font-heading font-black text-lg sm:text-xl md:text-2xl text-slate-800 dark:text-white">
              {t("preparation.title" as TranslationKey)}
            </h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t("preparation.subtitle" as TranslationKey)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRunTour(true)}
            className="rounded-full min-h-[38px] px-3 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-400/50 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 shrink-0"
            aria-label="Start Preparation Tour"
          >
            <span>🧭</span>
            <span>{t("tour.button" as TranslationKey)}</span>
          </button>
        </div>

        <div
          id="tour-prep-tabs"
          className="border-t border-slate-100 dark:border-slate-800/80 px-4 sm:px-6 py-2 overflow-x-auto scrollbar-none flex gap-2"
        >
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
          {/* Quick Loadout Section */}
          <section
            id="section-loadout"
            className="rounded-[2rem] border border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-heading font-black text-sm sm:text-base text-slate-800 dark:text-white">
                    {t("preparation.loadout_presets.title" as TranslationKey)}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t(
                      "preparation.loadout_presets.subtitle" as TranslationKey,
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    playSound("click");
                    setShowSaveLoadout(true);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all active:scale-95 flex items-center gap-1.5 min-h-[36px]"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>
                    {t(
                      "preparation.loadout_presets.save_button" as TranslationKey,
                    )}
                  </span>
                </button>
                {availableLoadouts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      playSound("click");
                      setShowLoadoutSelector(true);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 flex items-center gap-1.5 min-h-[36px]"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>
                      {t(
                        "preparation.loadout_presets.manage_button" as TranslationKey,
                      )}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Applied Loadout Toast Banner */}
            {appliedToast && (
              <div className="mb-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>
                    ⚡ Loadout applied: <strong>{appliedToast}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAppliedToast(null)}
                  className="p-1 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-all text-emerald-700 dark:text-emerald-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Loadout Selection Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
              {availableLoadouts.length > 0 ? (
                availableLoadouts.map((loadout) => {
                  const isActive = activeLoadoutId === loadout.id;
                  return (
                    <button
                      key={loadout.id}
                      type="button"
                      onClick={() => handleLoadLoadout(loadout.id)}
                      className={`shrink-0 px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all active:scale-95 flex items-center gap-2 ${
                        isActive
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20"
                          : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30"
                      }`}
                    >
                      <span>⚡ {loadout.name}</span>
                      <span
                        className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                          isActive
                            ? "bg-indigo-700 text-white"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {loadout.distance === "all"
                          ? "ALL"
                          : `${loadout.distance}K`}
                      </span>
                    </button>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic py-1">
                  {t(
                    "preparation.loadout_presets.no_loadouts" as TranslationKey,
                  )}
                </p>
              )}
            </div>
          </section>

          <section
            id="section-shoes"
            className="flex flex-col gap-4 scroll-mt-28"
          >
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
                  (!isTrailRace &&
                    (shoe.id === "trail" ||
                      shoe.id === "aggressive_trail" ||
                      shoe.id === "minimalist_trail")) ||
                  (isTrailRace &&
                    (shoe.id === "stability" || shoe.id === "max_cushion"));

                return (
                  <OptionCard
                    key={shoe.id}
                    id={`shoe-${shoe.id}`}
                    selected={preparation.shoes === shoe.id}
                    onClick={() => setShoes(shoe.id)}
                    title={t(
                      `preparation.shoes.${shoe.id}.name` as TranslationKey,
                    )}
                    desc={t(
                      `preparation.shoes.${shoe.id}.desc` as TranslationKey,
                    )}
                    badges={[
                      ...(() => {
                        const badges = [];
                        if (shoe.id === "daily_trainer") {
                          badges.push({
                            text: t(
                              "preparation.badges.balanced" as TranslationKey,
                            ),
                            color:
                              "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
                          });
                        } else if (shoe.id === "carbon_racer") {
                          badges.push(
                            {
                              text: t(
                                "preparation.badges.pace_up" as TranslationKey,
                              ),
                              color:
                                "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40",
                            },
                            {
                              text: t(
                                "preparation.badges.fatigue_up" as TranslationKey,
                              ),
                              color:
                                "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40",
                            },
                          );
                        } else if (shoe.id === "lightweight") {
                          badges.push(
                            {
                              text: t(
                                "preparation.badges.lightweight" as TranslationKey,
                              ),
                              color:
                                "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-900/40",
                            },
                            {
                              text: t(
                                "preparation.badges.comfort_down" as TranslationKey,
                              ),
                              color:
                                "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40",
                            },
                          );
                        } else if (shoe.id === "trail") {
                          badges.push(
                            {
                              text: t(
                                "preparation.badges.trail_grip" as TranslationKey,
                              ),
                              color:
                                "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40",
                            },
                            {
                              text: t(
                                "preparation.badges.road_speed_down" as TranslationKey,
                              ),
                              color:
                                "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40",
                            },
                          );
                        } else if (shoe.id === "stability") {
                          badges.push(
                            {
                              text: t(
                                "preparation.badges.stability" as TranslationKey,
                              ),
                              color:
                                "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/40",
                            },
                            {
                              text: t(
                                "preparation.badges.heavy" as TranslationKey,
                              ),
                              color:
                                "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40",
                            },
                          );
                        } else if (shoe.id === "max_cushion") {
                          badges.push(
                            {
                              text: t(
                                "preparation.badges.comfort" as TranslationKey,
                              ),
                              color:
                                "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40",
                            },
                            {
                              text: t(
                                "preparation.badges.slow" as TranslationKey,
                              ),
                              color:
                                "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40",
                            },
                          );
                        } else if (shoe.id === "aggressive_trail") {
                          badges.push(
                            {
                              text: t(
                                "preparation.badges.grip" as TranslationKey,
                              ),
                              color:
                                "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40",
                            },
                            {
                              text: t(
                                "preparation.badges.trail_only" as TranslationKey,
                              ),
                              color:
                                "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
                            },
                          );
                        } else if (shoe.id === "minimalist_trail") {
                          badges.push(
                            {
                              text: t(
                                "preparation.badges.lightweight" as TranslationKey,
                              ),
                              color:
                                "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-900/40",
                            },
                            {
                              text: t(
                                "preparation.badges.comfort_down" as TranslationKey,
                              ),
                              color:
                                "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40",
                            },
                          );
                        } else if (shoe.id === "marathon_racer") {
                          badges.push({
                            text: t(
                              "preparation.badges.pace_up" as TranslationKey,
                            ),
                            color:
                              "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40",
                          });
                        } else if (shoe.id === "ultra_trail") {
                          badges.push({
                            text: t(
                              "preparation.badges.grip" as TranslationKey,
                            ),
                            color:
                              "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40",
                          });
                        } else if (shoe.id === "speed_flats") {
                          badges.push({
                            text: t(
                              "preparation.badges.lightweight" as TranslationKey,
                            ),
                            color:
                              "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-900/40",
                          });
                        } else if (shoe.id === "plated_supershoe") {
                          badges.push({
                            text: t(
                              "preparation.badges.pace_up" as TranslationKey,
                            ),
                            color:
                              "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/40",
                          });
                        }

                        if (isDisabled) {
                          badges.push({
                            text: isTrailRace
                              ? t(
                                  "preparation.badges.road_only" as TranslationKey,
                                )
                              : t(
                                  "preparation.badges.trail_only_prohibited" as TranslationKey,
                                ),
                            color:
                              "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40",
                          });
                        }

                        return badges;
                      })(),
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

          <section
            id="section-nutrition"
            className="flex flex-col gap-4 scroll-mt-28"
          >
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
                {
                  id: "water" as const,
                  nameKey: "preparation.nutrition.water.name",
                  descKey: "preparation.nutrition.water.desc",
                  badges: [
                    {
                      text: t(
                        "preparation.badges.hydration_stability" as TranslationKey,
                      ),
                      color:
                        "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40",
                    },
                  ],
                },
                {
                  id: "electrolyte" as const,
                  nameKey: "preparation.nutrition.electrolyte.name",
                  descKey: "preparation.nutrition.electrolyte.desc",
                  badges: [
                    {
                      text: t(
                        "preparation.badges.reduced_cramp_risk" as TranslationKey,
                      ),
                      color:
                        "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-900/40",
                    },
                  ],
                },
                {
                  id: "energy_gel" as const,
                  nameKey: "preparation.nutrition.energy_gel.name",
                  descKey: "preparation.nutrition.energy_gel.desc",
                  badges: [
                    {
                      text: t(
                        "preparation.badges.energy_boost" as TranslationKey,
                      ),
                      color:
                        "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40",
                    },
                    {
                      text: t(
                        "preparation.badges.stomach_stress_risk" as TranslationKey,
                      ),
                      color:
                        "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40",
                    },
                  ],
                },
                {
                  id: "caffeine" as const,
                  nameKey: "preparation.nutrition.caffeine.name",
                  descKey: "preparation.nutrition.caffeine.desc",
                  badges: [
                    {
                      text: t(
                        "preparation.badges.early_focus" as TranslationKey,
                      ),
                      color:
                        "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/40",
                    },
                    {
                      text: t(
                        "preparation.badges.energy_crash_risk" as TranslationKey,
                      ),
                      color:
                        "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40",
                    },
                  ],
                },
                {
                  id: "energy_bar" as const,
                  nameKey: "preparation.nutrition.energy_bar.name",
                  descKey: "preparation.nutrition.energy_bar.desc",
                  badges: [
                    {
                      text: t("preparation.badges.energy" as TranslationKey),
                      color:
                        "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40",
                    },
                    {
                      text: t(
                        "preparation.badges.slow_absorption" as TranslationKey,
                      ),
                      color:
                        "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40",
                    },
                  ],
                },
                {
                  id: "hydration_mix" as const,
                  nameKey: "preparation.nutrition.hydration_mix.name",
                  descKey: "preparation.nutrition.hydration_mix.desc",
                  badges: [
                    {
                      text: t("preparation.badges.hydration" as TranslationKey),
                      color:
                        "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40",
                    },
                    {
                      text: t("preparation.badges.energy" as TranslationKey),
                      color:
                        "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40",
                    },
                  ],
                },
                {
                  id: "salt_tablets" as const,
                  nameKey: "preparation.nutrition.salt_tablets.name",
                  descKey: "preparation.nutrition.salt_tablets.desc",
                  badges: [
                    {
                      text: t(
                        "preparation.badges.cramp_prevention" as TranslationKey,
                      ),
                      color:
                        "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-900/40",
                    },
                  ],
                },
                {
                  id: "caffeine_gum" as const,
                  nameKey: "preparation.nutrition.caffeine_gum.name",
                  descKey: "preparation.nutrition.caffeine_gum.desc",
                  badges: [
                    {
                      text: t("preparation.badges.focus" as TranslationKey),
                      color:
                        "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/40",
                    },
                  ],
                },
                {
                  id: "beetroot_juice" as const,
                  nameKey: "preparation.nutrition.beetroot_juice.name",
                  descKey: "preparation.nutrition.beetroot_juice.desc",
                  badges: [
                    {
                      text: t("preparation.badges.pace_up" as TranslationKey),
                      color:
                        "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40",
                    },
                  ],
                },
                {
                  id: "isotonic_drink" as const,
                  nameKey: "preparation.nutrition.isotonic_drink.name",
                  descKey: "preparation.nutrition.isotonic_drink.desc",
                  badges: [
                    {
                      text: t("preparation.badges.hydration" as TranslationKey),
                      color:
                        "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40",
                    },
                  ],
                },
                {
                  id: "protein_bar" as const,
                  nameKey: "preparation.nutrition.protein_bar.name",
                  descKey: "preparation.nutrition.protein_bar.desc",
                  badges: [
                    {
                      text: t("preparation.badges.energy" as TranslationKey),
                      color:
                        "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40",
                    },
                  ],
                },
                {
                  id: "carb_chews" as const,
                  nameKey: "preparation.nutrition.carb_chews.name",
                  descKey: "preparation.nutrition.carb_chews.desc",
                  badges: [
                    {
                      text: t(
                        "preparation.badges.energy_boost" as TranslationKey,
                      ),
                      color:
                        "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40",
                    },
                  ],
                },
                {
                  id: "endurance_gel_plus" as const,
                  nameKey: "preparation.nutrition.endurance_gel_plus.name",
                  descKey: "preparation.nutrition.endurance_gel_plus.desc",
                  badges: [
                    {
                      text: t(
                        "preparation.badges.energy_boost" as TranslationKey,
                      ),
                      color:
                        "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40",
                    },
                  ],
                },
              ]
                .filter(
                  (nut) =>
                    hasItem("nutrition", nut.id) &&
                    getItemQuantity("nutrition", nut.id) > 0,
                )
                .map((nut) => {
                  const ownedQty = getItemQuantity("nutrition", nut.id);
                  const isSelected = preparation.nutrition.includes(nut.id);
                  const currentQty =
                    preparation.nutritionQuantities?.[nut.id] ?? 1;
                  const isDisabled =
                    !hasItem("nutrition", nut.id) || ownedQty <= 0;

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
                              onIncrease: () =>
                                _setNutritionQuantity(
                                  nut.id,
                                  Math.min(ownedQty, currentQty + 1),
                                ),
                              onDecrease: () =>
                                _setNutritionQuantity(nut.id, currentQty - 1),
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

          <section
            id="section-gear"
            className="flex flex-col gap-4 scroll-mt-28"
          >
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
                {
                  id: "cap" as const,
                  nameKey: "preparation.gear.cap.name",
                  descKey: "preparation.gear.cap.desc",
                  badges: [
                    {
                      text: t("preparation.badges.sun_rain" as TranslationKey),
                      color:
                        "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/40",
                    },
                  ],
                },
                {
                  id: "sunglasses" as const,
                  nameKey: "preparation.gear.sunglasses.name",
                  descKey: "preparation.gear.sunglasses.desc",
                  badges: [
                    {
                      text: t(
                        "preparation.badges.glare_block" as TranslationKey,
                      ),
                      color:
                        "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/40",
                    },
                  ],
                },
                {
                  id: "arm_sleeves" as const,
                  nameKey: "preparation.gear.arm_sleeves.name",
                  descKey: "preparation.gear.arm_sleeves.desc",
                  badges: [
                    {
                      text: t("preparation.badges.warmth" as TranslationKey),
                      color:
                        "bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border border-pink-200/60 dark:border-pink-900/40",
                    },
                  ],
                },
                {
                  id: "hydration_vest" as const,
                  nameKey: "preparation.gear.hydration_vest.name",
                  descKey: "preparation.gear.hydration_vest.desc",
                  badges: [
                    {
                      text: t("preparation.badges.capacity" as TranslationKey),
                      color:
                        "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-900/40",
                    },
                    {
                      text: t("preparation.badges.heavy" as TranslationKey),
                      color:
                        "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
                    },
                  ],
                },
                {
                  id: "lightweight_jacket" as const,
                  nameKey: "preparation.gear.lightweight_jacket.name",
                  descKey: "preparation.gear.lightweight_jacket.desc",
                  badges: [
                    {
                      text: t("preparation.badges.windproof" as TranslationKey),
                      color:
                        isColdWeather || isRainyWeather
                          ? "bg-indigo-100 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-100 border border-indigo-300 dark:border-indigo-700"
                          : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/40",
                    },
                    {
                      text: t(
                        "preparation.badges.water_resistant" as TranslationKey,
                      ),
                      color: isRainyWeather
                        ? "bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-100 border border-blue-300 dark:border-blue-700"
                        : "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40",
                    },
                  ],
                  className:
                    isColdWeather || isRainyWeather
                      ? "ring-2 ring-indigo-500/50"
                      : "",
                },
                {
                  id: "compression_socks" as const,
                  nameKey: "preparation.gear.compression_socks.name",
                  descKey: "preparation.gear.compression_socks.desc",
                  badges: [
                    {
                      text: t("preparation.badges.recovery" as TranslationKey),
                      color:
                        "bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border border-pink-200/60 dark:border-pink-900/40",
                    },
                    {
                      text: t("preparation.badges.comfort" as TranslationKey),
                      color:
                        "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40",
                    },
                  ],
                },
                {
                  id: "trail_gaiters" as const,
                  nameKey: "preparation.gear.trail_gaiters.name",
                  descKey: "preparation.gear.trail_gaiters.desc",
                  badges: [
                    {
                      text: t(
                        "preparation.badges.debris_protection" as TranslationKey,
                      ),
                      color:
                        "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40",
                    },
                    {
                      text: t(
                        "preparation.badges.trail_only" as TranslationKey,
                      ),
                      color:
                        "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
                    },
                  ],
                },
                {
                  id: "moisture_wicking_shirt" as const,
                  nameKey: "preparation.gear.moisture_wicking_shirt.name",
                  descKey: "preparation.gear.moisture_wicking_shirt.desc",
                  badges: [
                    {
                      text: t(
                        "preparation.badges.breathable" as TranslationKey,
                      ),
                      color: isHotWeather
                        ? "bg-sky-100 dark:bg-sky-900/60 text-sky-900 dark:text-sky-100 border border-sky-300 dark:border-sky-700"
                        : "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-900/40",
                    },
                    {
                      text: t(
                        "preparation.badges.hot_weather" as TranslationKey,
                      ),
                      color: isHotWeather
                        ? "bg-rose-100 dark:bg-rose-900/60 text-rose-900 dark:text-rose-100 border border-rose-300 dark:border-rose-700"
                        : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40",
                    },
                  ],
                  className: isHotWeather ? "ring-2 ring-rose-500/50" : "",
                },
                {
                  id: "running_belt" as const,
                  nameKey: "preparation.gear.running_belt.name",
                  descKey: "preparation.gear.running_belt.desc",
                  badges: [
                    {
                      text: t("preparation.badges.capacity" as TranslationKey),
                      color:
                        "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/40",
                    },
                  ],
                },
                {
                  id: "headband" as const,
                  nameKey: "preparation.gear.headband.name",
                  descKey: "preparation.gear.headband.desc",
                  badges: [
                    {
                      text: t("preparation.badges.sun_rain" as TranslationKey),
                      color:
                        "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/40",
                    },
                  ],
                },
                {
                  id: "running_backpack" as const,
                  nameKey: "preparation.gear.running_backpack.name",
                  descKey: "preparation.gear.running_backpack.desc",
                  badges: [
                    {
                      text: t("preparation.badges.capacity" as TranslationKey),
                      color:
                        "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-900/40",
                    },
                    {
                      text: t("preparation.badges.heavy" as TranslationKey),
                      color:
                        "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
                    },
                  ],
                },
              ]
                .filter((g) => hasItem("gear", g.id))
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

          <section
            id="section-warmup"
            className="flex flex-col gap-4 scroll-mt-28"
          >
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

          <section
            id="section-pacing"
            className="flex flex-col gap-4 scroll-mt-28"
          >
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
                    text: t(
                      "preparation.badges.high_dnf_risk" as TranslationKey,
                    ),
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

          <section
            id="section-mindset"
            className="flex flex-col gap-4 scroll-mt-28"
          >
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

          <section
            id="section-ghosts"
            className="flex flex-col gap-4 scroll-mt-28"
          >
            <div className="flex items-center gap-2.5 border-b border-[#E5E7EB] dark:border-slate-800 pb-2.5">
              <span className="text-xl">👻</span>
              <h2 className="font-heading font-black text-base md:text-lg text-slate-800 dark:text-white">
                Ghost Runners ({selectedGhostIds.length}/3)
              </h2>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-auto">
                Live Comparison
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select up to 3 translucent ghost runners to visually race against
              during your run.
            </p>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              {storedGhosts.map((ghost) => {
                const isSelected = selectedGhostIds.includes(ghost.id);
                return (
                  <button
                    key={ghost.id}
                    type="button"
                    onClick={() => toggleSelectGhost(ghost.id)}
                    className={`p-4 rounded-2xl border text-left transition-all active:scale-95 flex flex-col gap-2 ${
                      isSelected
                        ? "bg-indigo-500/10 border-indigo-500 text-slate-800 dark:text-white shadow-sm"
                        : "bg-white dark:bg-slate-900 border-[#E5E7EB] dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: ghost.avatarColor }}
                        />
                        <span className="font-heading font-black text-xs md:text-sm">
                          {ghost.name}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {ghost.type}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                      <span>
                        Target: {Math.floor(ghost.finalTime / 60)}m{" "}
                        {ghost.finalTime % 60}s
                      </span>
                      <span className="text-indigo-600 dark:text-indigo-400">
                        {isSelected ? "Selected ✓" : "+ Add"}
                      </span>
                    </div>
                  </button>
                );
              })}
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
                <p className="leading-relaxed">
                  {challenge.race.description[lang]}
                </p>
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
        <ScreenTour
          run={runTour}
          onFinish={() => setRunTour(false)}
          steps={[
            {
              target: "body",
              placement: "center",
              title: t(
                "tour.screens.preparation.welcome.title" as TranslationKey,
              ),
              content: t(
                "tour.screens.preparation.welcome.content" as TranslationKey,
              ),
              skipBeacon: true,
            },
            {
              target: "#tour-prep-tabs",
              title: t(
                "tour.screens.preparation.shoes.title" as TranslationKey,
              ),
              content: t(
                "tour.screens.preparation.shoes.content" as TranslationKey,
              ),
            },
            {
              target: "#section-shoes",
              title: t(
                "tour.screens.preparation.shoes.title" as TranslationKey,
              ),
              content: t(
                "tour.screens.preparation.shoes.content" as TranslationKey,
              ),
            },
            {
              target: "#section-nutrition",
              title: t(
                "tour.screens.preparation.nutrition.title" as TranslationKey,
              ),
              content: t(
                "tour.screens.preparation.nutrition.content" as TranslationKey,
              ),
            },
            {
              target: "#section-gear",
              title: t("tour.screens.preparation.gear.title" as TranslationKey),
              content: t(
                "tour.screens.preparation.gear.content" as TranslationKey,
              ),
            },
            {
              target: "#section-warmup",
              title: t(
                "tour.screens.preparation.warmup.title" as TranslationKey,
              ),
              content: t(
                "tour.screens.preparation.warmup.content" as TranslationKey,
              ),
            },
            {
              target: "#ready-race-cta",
              title: t(
                "tour.screens.preparation.pacing.title" as TranslationKey,
              ),
              content: t(
                "tour.screens.preparation.pacing.content" as TranslationKey,
              ),
            },
          ]}
        />
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
                  {gameResult === "good" &&
                    t("preparation.warmup_challenge.good" as TranslationKey)}
                  {gameResult === "normal" &&
                    t("preparation.warmup_challenge.normal" as TranslationKey)}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleTapWarmup}
                  className="w-full py-3.5 px-6 rounded-2xl text-xs font-black text-white bg-indigo-500 hover:bg-indigo-600 shadow-md shadow-indigo-500/20 active:scale-95 transition-all uppercase tracking-wider cursor-pointer min-h-[44px]"
                >
                  {t(
                    "preparation.warmup_challenge.tap_button" as TranslationKey,
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showSaveLoadout && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-6 max-w-md w-full shadow-2xl flex flex-col gap-5 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-indigo-500" />
                <h3 className="font-heading font-black text-lg text-slate-800 dark:text-white">
                  {t(
                    "preparation.loadout_presets.modal_title" as TranslationKey,
                  )}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSaveLoadout(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t(
                "preparation.loadout_presets.modal_subtitle" as TranslationKey,
              )}
            </p>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                {t("preparation.loadout_presets.name_label" as TranslationKey)}
              </label>
              <input
                type="text"
                value={loadoutName}
                onChange={(e) => setLoadoutName(e.target.value)}
                placeholder={t(
                  "preparation.loadout_presets.name_placeholder" as TranslationKey,
                )}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                autoFocus
              />
            </div>

            {/* Configuration Summary Preview */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <div className="flex items-center gap-2">
                <span>👟</span>
                <span className="font-bold">
                  {t(
                    `preparation.shoes.${preparation.shoes}.name` as TranslationKey,
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>🥤</span>
                <span>
                  {preparation.nutrition.length > 0
                    ? preparation.nutrition
                        .map((n) =>
                          t(
                            `preparation.nutrition.${n}.name` as TranslationKey,
                          ),
                        )
                        .join(", ")
                    : "None"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>📈</span>
                <span>
                  {t(
                    `preparation.pacing.${preparation.pacing}.name` as TranslationKey,
                  )}{" "}
                  •{" "}
                  {t(
                    `preparation.mindset.${preparation.mindset}.name` as TranslationKey,
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSaveLoadout(false)}
                className="flex-1 py-3 rounded-2xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all min-h-[44px]"
              >
                {t("common.cancel" as TranslationKey)}
              </button>
              <button
                type="button"
                onClick={handleSaveLoadout}
                className="flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-white bg-indigo-500 hover:bg-indigo-600 transition-all shadow-md shadow-indigo-500/20 active:scale-95 min-h-[44px]"
              >
                {t("preparation.loadout_presets.save" as TranslationKey)}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLoadoutSelector && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col gap-5 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-500" />
                <h3 className="font-heading font-black text-lg text-slate-800 dark:text-white">
                  {t(
                    "preparation.loadout_presets.manager_title" as TranslationKey,
                  )}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLoadoutSelector(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t(
                "preparation.loadout_presets.manager_subtitle" as TranslationKey,
              )}{" "}
              ({raceDistance}K)
            </p>

            <div className="flex flex-col gap-3">
              {availableLoadouts.length > 0 ? (
                availableLoadouts.map((loadout) => {
                  const isDefaultPreset = [
                    "5k-speed",
                    "10k-balanced",
                    "half-endurance",
                    "marathon-conservative",
                  ].includes(loadout.id);
                  return (
                    <div
                      key={loadout.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col gap-3 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-heading font-black text-sm text-slate-800 dark:text-white">
                            {loadout.name}
                          </h4>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              isDefaultPreset
                                ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                                : "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                            }`}
                          >
                            {isDefaultPreset
                              ? t(
                                  "preparation.loadout_presets.preset_badge" as TranslationKey,
                                )
                              : t(
                                  "preparation.loadout_presets.custom_badge" as TranslationKey,
                                )}
                          </span>
                        </div>
                        {!isDefaultPreset && (
                          <button
                            type="button"
                            onClick={() => handleDeleteLoadout(loadout.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-all"
                            title="Delete Loadout"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
                        <div>
                          👟{" "}
                          {t(
                            `preparation.shoes.${loadout.preparation.shoes}.name` as TranslationKey,
                          )}
                        </div>
                        <div>
                          🧘{" "}
                          {t(
                            `preparation.warmup.${loadout.preparation.warmup}.name` as TranslationKey,
                          )}
                        </div>
                        <div>
                          📊{" "}
                          {t(
                            `preparation.pacing.${loadout.preparation.pacing}.name` as TranslationKey,
                          )}
                        </div>
                        <div>
                          🧠{" "}
                          {t(
                            `preparation.mindset.${loadout.preparation.mindset}.name` as TranslationKey,
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleLoadLoadout(loadout.id)}
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-500 hover:bg-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-1.5 min-h-[38px]"
                      >
                        <Check className="w-4 h-4" />
                        <span>
                          {t(
                            "preparation_custom.apply_loadout" as TranslationKey,
                          )}
                        </span>
                      </button>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-4">
                  {t(
                    "preparation.loadout_presets.no_loadouts" as TranslationKey,
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
