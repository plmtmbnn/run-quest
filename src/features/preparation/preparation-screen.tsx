"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Flame,
  Info,
  MapPin,
  Share2,
  Sparkles,
  Wind,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadoutCard } from "@/components/share/loadout-card";
import { ShareModal } from "@/components/share/share-modal";
import { useSound } from "@/hooks/use-sound";
import type { TranslationKey } from "@/i18n/use-translation";
import { useTranslation } from "@/i18n/use-translation";
import { generateDailyChallenge } from "@/services/challenge/generator";
import { storageRepository } from "@/storage/storage-repository";
import { useGameStore } from "@/store/game-store";
import { usePreparationStore } from "@/store/preparation-store";
import { useTimelineStore } from "@/store/timeline-store";

export function PreparationScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const lang = (language === "id" ? "id" : "en") as "en" | "id";
  const { currentChallenge } = useGameStore();
  const dayIndex = useTimelineStore((state) => state.gameState?.dayIndex ?? 0);

  const challenge =
    currentChallenge || generateDailyChallenge(dayIndex.toString());

  useEffect(() => {
    const daily = storageRepository.loadDaily();
    if (
      daily &&
      daily.challengeId === challenge.id &&
      daily.status === "completed"
    ) {
      router.replace("/");
    }
  }, [challenge.id, router]);

  const {
    preparation,
    setShoes: _setShoes,
    toggleNutrition: _toggleNutrition,
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
    // Prevent selecting trail shoes for road races and vice versa
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
    
    return isTrailRace ? [...roadShoes, ...trailShoes] : roadShoes;
  };
  const toggleNutrition = (val: Parameters<typeof _toggleNutrition>[0]) => {
    playSound("click");
    if (preparation.nutrition.length >= 3 && !preparation.nutrition.includes(val)) {
      return; // Prevent adding more than 3 nutrition items
    }
    _toggleNutrition(val);
  };
  const toggleGear = (val: Parameters<typeof _toggleGear>[0]) => {
    playSound("click");
    if (preparation.gear.length >= 2 && !preparation.gear.includes(val)) {
      return; // Prevent adding more than 2 gear items
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
    playSound("click");
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
🥤 Nutrition: ${preparation.nutrition.length > 0 ? preparation.nutrition.map((n) => t(`preparation.nutrition.${n}.name` as TranslationKey)).join(", ") : "None"}
🔥 ${t(`preparation.warmup.${preparation.warmup}.name` as TranslationKey)}
📊 ${t(`preparation.pacing.${preparation.pacing}.name` as TranslationKey)}
🧠 ${t(`preparation.mindset.${preparation.mindset}.name` as TranslationKey)}
🎒 Gear: ${preparation.gear.length > 0 ? preparation.gear.map((g) => t(`preparation.gear.${g}.name` as TranslationKey)).join(", ") : "None"}

${t("share.loadout.cta" as TranslationKey)} https://runquest.game`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="min-h-screen bg-[#fffdf8] dark:bg-[#090d16] pb-24 text-gray-900 dark:text-white"
    >
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 dark:border-slate-800 bg-[#ffffff]/90 dark:bg-[#111827]/90 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <button
            id="back-to-home"
            type="button"
            onClick={() => {
              playSound("click");
              router.back();
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 transition-all duration-200 hover:border-blue-500 dark:hover:border-blue-400 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">
              {t("preparation.title" as TranslationKey)}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-300">
              {t("preparation.subtitle" as TranslationKey)}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-8 px-6 py-6 lg:grid-cols-[1fr_320px]">
        {/* Left Side: Preparation Options */}
        <div className="flex flex-col gap-10">
          {/* Category: Shoes */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-2">
              <span className="text-xl">👟</span>
              <h2 className="font-heading text-lg font-bold text-gray-800 dark:text-gray-100">
                {t("preparation.shoes.title" as TranslationKey)}
              </h2>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto capitalize">
                {challenge.race.surface}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
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
                            text: "⚖️ Balanced",
                            color: "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200",
                          });
                        } else if (shoe.id === "carbon_racer") {
                          badges.push(
                            {
                              text: "⚡ + Pace",
                              color: "bg-emerald-100 dark:bg-emerald-955/40 text-emerald-800 dark:text-emerald-300",
                            },
                            {
                              text: "⚠️ + Fatigue",
                              color: "bg-red-100 dark:bg-red-955/40 text-red-800 dark:text-red-300",
                            }
                          );
                        } else if (shoe.id === "lightweight") {
                          badges.push(
                            {
                              text: "🏃 Lightweight",
                              color: "bg-sky-100 dark:bg-sky-955/40 text-sky-800 dark:text-sky-300",
                            },
                            {
                              text: "📉 Comfort",
                              color: "bg-amber-100 dark:bg-amber-955/40 text-amber-800 dark:text-amber-300",
                            }
                          );
                        } else if (shoe.id === "trail") {
                          badges.push(
                            {
                              text: "🥾 + Trail Grip",
                              color: "bg-orange-100 dark:bg-orange-955/40 text-orange-800 dark:text-orange-300",
                            },
                            {
                              text: "🐢 - Road Speed",
                              color: "bg-amber-100 dark:bg-amber-955/40 text-amber-750 dark:text-amber-300",
                            }
                          );
                        } else if (shoe.id === "stability") {
                          badges.push(
                            {
                              text: "⚖️ Stability",
                              color: "bg-blue-100 dark:bg-blue-955/40 text-blue-800 dark:text-blue-300",
                            },
                            {
                              text: "⚠️ Heavy",
                              color: "bg-red-100 dark:bg-red-955/40 text-red-800 dark:text-red-300",
                            }
                          );
                        } else if (shoe.id === "max_cushion") {
                          badges.push(
                            {
                              text: "🛡️ Comfort",
                              color: "bg-emerald-100 dark:bg-emerald-955/40 text-emerald-800 dark:text-emerald-300",
                            },
                            {
                              text: "🐢 Slow",
                              color: "bg-amber-100 dark:bg-amber-955/40 text-amber-750 dark:text-amber-300",
                            }
                          );
                        } else if (shoe.id === "aggressive_trail") {
                          badges.push(
                            {
                              text: "🥾 Grip",
                              color: "bg-orange-100 dark:bg-orange-955/40 text-orange-800 dark:text-orange-300",
                            },
                            {
                              text: "🏔️ Trail Only",
                              color: "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200",
                            }
                          );
                        } else if (shoe.id === "minimalist_trail") {
                          badges.push(
                            {
                              text: "🏃 Lightweight",
                              color: "bg-sky-100 dark:bg-sky-955/40 text-sky-800 dark:text-sky-300",
                            },
                            {
                              text: "📉 Comfort",
                              color: "bg-amber-100 dark:bg-amber-955/40 text-amber-800 dark:text-amber-300",
                            }
                          );
                        }
                        
                        if (isDisabled) {
                          badges.push({
                            text: isTrailRace ? "🚫 Road Only" : "🚫 Trail Only",
                            color: "bg-red-100 dark:bg-red-955/40 text-red-800 dark:text-red-300",
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
          </section>

          {/* Category: Nutrition */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-2">
              <span className="text-xl">🥤</span>
              <h2 className="font-heading text-lg font-bold text-gray-800 dark:text-gray-100">
                {t("preparation.nutrition.title" as TranslationKey)}
              </h2>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                {preparation.nutrition.length}/3
              </span>
            </div>
            {isHotWeather && (
              <div className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 p-2 rounded-lg">
                {t("preparation.nutrition.hot_weather_tip" as TranslationKey)}
              </div>
            )}
            {isColdWeather && (
              <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 p-2 rounded-lg">
                {t("preparation.nutrition.cold_weather_tip" as TranslationKey)}
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <OptionCard
                id="nutr-water"
                selected={preparation.nutrition.includes("water")}
                onClick={() => toggleNutrition("water")}
                title={t("preparation.nutrition.water.name" as TranslationKey)}
                desc={t("preparation.nutrition.water.desc" as TranslationKey)}
                badges={[
                  {
                    text: "💧 Hydration Stability",
                    color:
                      "bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300",
                  },
                ]}
              />
              <OptionCard
                id="nutr-elect"
                selected={preparation.nutrition.includes("electrolyte")}
                onClick={() => toggleNutrition("electrolyte")}
                title={t(
                  "preparation.nutrition.electrolyte.name" as TranslationKey,
                )}
                desc={t(
                  "preparation.nutrition.electrolyte.desc" as TranslationKey,
                )}
                badges={[
                  {
                    text: "🧪 Reduced Cramp Risk",
                    color:
                      "bg-teal-100 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300",
                  },
                ]}
              />
              <OptionCard
                id="nutr-gel"
                selected={preparation.nutrition.includes("energy_gel")}
                onClick={() => toggleNutrition("energy_gel")}
                title={t(
                  "preparation.nutrition.energy_gel.name" as TranslationKey,
                )}
                desc={t(
                  "preparation.nutrition.energy_gel.desc" as TranslationKey,
                )}
                badges={[
                  {
                    text: "⚡ Mid-Race Energy Boost",
                    color:
                      "bg-yellow-100 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-300",
                  },
                  {
                    text: "🤢 Stomach Stress Risk",
                    color:
                      "bg-orange-100 dark:bg-orange-950/40 text-orange-800 dark:text-orange-350",
                  },
                ]}
              />
              <OptionCard
                id="nutr-caff"
                selected={preparation.nutrition.includes("caffeine")}
                onClick={() => toggleNutrition("caffeine")}
                title={t(
                  "preparation.nutrition.caffeine.name" as TranslationKey,
                )}
                desc={t(
                  "preparation.nutrition.caffeine.desc" as TranslationKey,
                )}
                badges={[
                  {
                    text: "🧠 Early Focus",
                    color:
                      "bg-purple-100 dark:bg-purple-955/40 text-purple-800 dark:text-purple-300",
                  },
                  {
                    text: "📉 Energy Crash Risk",
                    color:
                      "bg-rose-100 dark:bg-rose-955/40 text-rose-800 dark:text-rose-300",
                  },
                ]}
              />
              <OptionCard
                id="nutr-energy-bar"
                selected={preparation.nutrition.includes("energy_bar")}
                onClick={() => toggleNutrition("energy_bar")}
                title={t("preparation.nutrition.energy_bar.name" as TranslationKey)}
                desc={t("preparation.nutrition.energy_bar.desc" as TranslationKey)}
                badges={[
                  {
                    text: "⚡ Energy",
                    color:
                      "bg-yellow-100 dark:bg-yellow-955/40 text-yellow-800 dark:text-yellow-300",
                  },
                  {
                    text: "🐢 Slow Absorption",
                    color:
                      "bg-orange-100 dark:bg-orange-955/40 text-orange-800 dark:text-orange-300",
                  },
                ]}
              />
              <OptionCard
                id="nutr-hydration-mix"
                selected={preparation.nutrition.includes("hydration_mix")}
                onClick={() => toggleNutrition("hydration_mix")}
                title={t("preparation.nutrition.hydration_mix.name" as TranslationKey)}
                desc={t("preparation.nutrition.hydration_mix.desc" as TranslationKey)}
                badges={[
                  {
                    text: "💧 Hydration",
                    color:
                      "bg-blue-100 dark:bg-blue-955/40 text-blue-800 dark:text-blue-300",
                  },
                  {
                    text: "⚡ Energy",
                    color:
                      "bg-yellow-100 dark:bg-yellow-955/40 text-yellow-800 dark:text-yellow-300",
                  },
                ]}
              />
              <OptionCard
                id="nutr-salt-tablets"
                selected={preparation.nutrition.includes("salt_tablets")}
                onClick={() => toggleNutrition("salt_tablets")}
                title={t("preparation.nutrition.salt_tablets.name" as TranslationKey)}
                desc={t("preparation.nutrition.salt_tablets.desc" as TranslationKey)}
                badges={[
                  {
                    text: "🧂 Cramp Prevention",
                    color:
                      "bg-teal-100 dark:bg-teal-955/40 text-teal-800 dark:text-teal-300",
                  },
                  {
                    text: "🌡️ Hot Weather",
                    color: isHotWeather
                      ? "bg-red-200 dark:bg-red-900/60 text-red-900 dark:text-red-100"
                      : "bg-red-100 dark:bg-red-955/40 text-red-800 dark:text-red-300",
                  },
                ]}
                className={isHotWeather ? "ring-2 ring-red-500" : ""}
              />
              <OptionCard
                id="nutr-caffeine-gum"
                selected={preparation.nutrition.includes("caffeine_gum")}
                onClick={() => toggleNutrition("caffeine_gum")}
                title={t("preparation.nutrition.caffeine_gum.name" as TranslationKey)}
                desc={t("preparation.nutrition.caffeine_gum.desc" as TranslationKey)}
                badges={[
                  {
                    text: "🧠 Focus",
                    color: isColdWeather
                      ? "bg-purple-200 dark:bg-purple-900/60 text-purple-900 dark:text-purple-100"
                      : "bg-purple-100 dark:bg-purple-955/40 text-purple-800 dark:text-purple-300",
                  },
                  {
                    text: "⚠️ Jitters",
                    color:
                      "bg-rose-100 dark:bg-rose-955/40 text-rose-800 dark:text-rose-300",
                  },
                ]}
                className={isColdWeather ? "ring-2 ring-purple-500" : ""}
              />
            </div>
          </section>

          {/* Category: Gear */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-2">
              <span className="text-xl">🎒</span>
              <h2 className="font-heading text-lg font-bold text-gray-800 dark:text-gray-100">
                {t("preparation.gear.title" as TranslationKey)}
              </h2>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                {preparation.gear.length}/2
              </span>
            </div>
            {isHotWeather && (
              <div className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 p-2 rounded-lg">
                {t("preparation.gear.hot_weather_tip" as TranslationKey)}
              </div>
            )}
            {isColdWeather && (
              <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 p-2 rounded-lg">
                {t("preparation.gear.cold_weather_tip" as TranslationKey)}
              </div>
            )}
            {isRainyWeather && (
              <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 p-2 rounded-lg">
                {t("preparation.gear.rainy_weather_tip" as TranslationKey)}
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <OptionCard
                id="gear-cap"
                selected={preparation.gear.includes("cap")}
                onClick={() => toggleGear("cap")}
                title={t("preparation.gear.cap.name" as TranslationKey)}
                desc={t("preparation.gear.cap.desc" as TranslationKey)}
                badges={[
                  {
                    text: "🧢 Sun/Rain",
                    color:
                      "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300",
                  },
                ]}
                isMultiSelect
              />
              <OptionCard
                id="gear-glasses"
                selected={preparation.gear.includes("sunglasses")}
                onClick={() => toggleGear("sunglasses")}
                title={t("preparation.gear.sunglasses.name" as TranslationKey)}
                desc={t("preparation.gear.sunglasses.desc" as TranslationKey)}
                badges={[
                  {
                    text: "🕶️ Glare Block",
                    color:
                      "bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300",
                  },
                ]}
                isMultiSelect
              />
              <OptionCard
                id="gear-sleeves"
                selected={preparation.gear.includes("arm_sleeves")}
                onClick={() => toggleGear("arm_sleeves")}
                title={t("preparation.gear.arm_sleeves.name" as TranslationKey)}
                desc={t("preparation.gear.arm_sleeves.desc" as TranslationKey)}
                badges={[
                  {
                    text: "🧣 Warmth",
                    color:
                      "bg-pink-100 dark:bg-pink-950/40 text-pink-800 dark:text-pink-300",
                  },
                ]}
                isMultiSelect
              />
              <OptionCard
                id="gear-vest"
                selected={preparation.gear.includes("hydration_vest")}
                onClick={() => toggleGear("hydration_vest")}
                title={t(
                  "preparation.gear.hydration_vest.name" as TranslationKey,
                )}
                desc={t(
                  "preparation.gear.hydration_vest.desc" as TranslationKey,
                )}
                badges={[
                  {
                    text: "🎒 Capacity",
                    color:
                      "bg-cyan-100 dark:bg-cyan-955/40 text-cyan-800 dark:text-cyan-300",
                  },
                  {
                    text: "⚖️ Heavy",
                    color:
                      "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200",
                  },
                ]}
                isMultiSelect
              />
              <OptionCard
                id="gear-jacket"
                selected={preparation.gear.includes("lightweight_jacket")}
                onClick={() => toggleGear("lightweight_jacket")}
                title={t("preparation.gear.lightweight_jacket.name" as TranslationKey)}
                desc={t("preparation.gear.lightweight_jacket.desc" as TranslationKey)}
                badges={[
                  {
                    text: "🌬️ Windproof",
                    color: isColdWeather || isRainyWeather
                      ? "bg-indigo-200 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-100"
                      : "bg-indigo-100 dark:bg-indigo-955/40 text-indigo-800 dark:text-indigo-300",
                  },
                  {
                    text: "💧 Water-Resistant",
                    color: isRainyWeather
                      ? "bg-blue-200 dark:bg-blue-900/60 text-blue-900 dark:text-blue-100"
                      : "bg-blue-100 dark:bg-blue-955/40 text-blue-800 dark:text-blue-300",
                  },
                ]}
                isMultiSelect
                className={(isColdWeather || isRainyWeather) ? "ring-2 ring-indigo-500" : ""}
              />
              <OptionCard
                id="gear-socks"
                selected={preparation.gear.includes("compression_socks")}
                onClick={() => toggleGear("compression_socks")}
                title={t("preparation.gear.compression_socks.name" as TranslationKey)}
                desc={t("preparation.gear.compression_socks.desc" as TranslationKey)}
                badges={[
                  {
                    text: "🩸 Recovery",
                    color:
                      "bg-pink-100 dark:bg-pink-955/40 text-pink-800 dark:text-pink-300",
                  },
                  {
                    text: "🏃 Comfort",
                    color:
                      "bg-emerald-100 dark:bg-emerald-955/40 text-emerald-800 dark:text-emerald-300",
                  },
                ]}
                isMultiSelect
              />
              <OptionCard
                id="gear-gaiters"
                selected={preparation.gear.includes("trail_gaiters")}
                onClick={() => toggleGear("trail_gaiters")}
                title={t("preparation.gear.trail_gaiters.name" as TranslationKey)}
                desc={t("preparation.gear.trail_gaiters.desc" as TranslationKey)}
                badges={[
                  {
                    text: "🥾 Debris Protection",
                    color:
                      "bg-orange-100 dark:bg-orange-955/40 text-orange-800 dark:text-orange-300",
                  },
                  {
                    text: "🏔️ Trail Only",
                    color:
                      "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200",
                  },
                ]}
                isMultiSelect
              />
              <OptionCard
                id="gear-shirt"
                selected={preparation.gear.includes("moisture_wicking_shirt")}
                onClick={() => toggleGear("moisture_wicking_shirt")}
                title={t("preparation.gear.moisture_wicking_shirt.name" as TranslationKey)}
                desc={t("preparation.gear.moisture_wicking_shirt.desc" as TranslationKey)}
                badges={[
                  {
                    text: "💨 Breathable",
                    color: isHotWeather
                      ? "bg-sky-200 dark:bg-sky-900/60 text-sky-900 dark:text-sky-100"
                      : "bg-sky-100 dark:bg-sky-955/40 text-sky-800 dark:text-sky-300",
                  },
                  {
                    text: "🌡️ Hot Weather",
                    color: isHotWeather
                      ? "bg-red-200 dark:bg-red-900/60 text-red-900 dark:text-red-100"
                      : "bg-red-100 dark:bg-red-955/40 text-red-800 dark:text-red-300",
                  },
                ]}
                isMultiSelect
                className={isHotWeather ? "ring-2 ring-red-500" : ""}
              />
            </div>
          </section>

          {/* Category: Warmup */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-2">
              <span className="text-xl">🧘</span>
              <h2 className="font-heading text-lg font-bold text-gray-800 dark:text-gray-100">
                {t("preparation.warmup.title" as TranslationKey)}
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <OptionCard
                id="warm-none"
                selected={preparation.warmup === "none"}
                onClick={() => setWarmup("none")}
                title={t("preparation.warmup.none.name" as TranslationKey)}
                desc={t("preparation.warmup.none.desc" as TranslationKey)}
                badges={[
                  {
                    text: "🛌 Cold Start",
                    color:
                      "bg-gray-800 dark:bg-slate-805 text-gray-200 dark:text-gray-200",
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
                    text: "⚖️ Optimal",
                    color:
                      "bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-300",
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
                    text: "🔥 High Readiness",
                    color:
                      "bg-orange-100 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300",
                  },
                  {
                    text: "🔋 Energy Cost",
                    color:
                      "bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300",
                  },
                ]}
              />
            </div>
          </section>

          {/* Category: Pacing */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-2">
              <span className="text-xl">📉</span>
              <h2 className="font-heading text-lg font-bold text-gray-800 dark:text-gray-100">
                {t("preparation.pacing.title" as TranslationKey)}
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
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
                    text: "🧠 Strategic",
                    color:
                      "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300",
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
                    text: "⏱️ Rhythm",
                    color:
                      "bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300",
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
                    text: "🚀 Fast Start",
                    color:
                      "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300",
                  },
                  {
                    text: "💀 High DNF Risk",
                    color:
                      "bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300",
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
                    text: "🛡️ Ultra Safe",
                    color:
                      "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200",
                  },
                ]}
              />
            </div>
          </section>

          {/* Category: Mindset */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-2">
              <span className="text-xl">🧠</span>
              <h2 className="font-heading text-lg font-bold text-gray-800 dark:text-gray-100">
                {t("preparation.mindset.title" as TranslationKey)}
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <OptionCard
                id="mind-calm"
                selected={preparation.mindset === "calm"}
                onClick={() => setMindset("calm")}
                title={t("preparation.mindset.calm.name" as TranslationKey)}
                desc={t("preparation.mindset.calm.desc" as TranslationKey)}
                badges={[
                  {
                    text: "🧘 Low Stress",
                    color:
                      "bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300",
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
                    text: "⭐ Morale Up",
                    color:
                      "bg-yellow-100 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-300",
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
                    text: "🔥 Ignore Pain",
                    color:
                      "bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300",
                  },
                  {
                    text: "⚠️ Crash Risk",
                    color:
                      "bg-orange-100 dark:bg-orange-950/40 text-orange-800 dark:text-orange-350",
                  },
                ]}
              />
            </div>
          </section>
        </div>

        {/* Right Side: Sticky Race briefing and CTA */}
        <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:h-[fit-content]">
          {/* Race Conditions Summary */}
          <div className="rounded-3xl border-2 border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <h3 className="font-heading font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              Conditions
            </h3>
            <div className="flex flex-col gap-4 text-sm">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {t("challenge.briefing.surface_type" as TranslationKey)}
                </p>
                <p className="font-bold text-gray-800 dark:text-gray-100">
                  {challenge.race.title[lang]}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase">
                      {t("challenge.briefing.distance" as TranslationKey)}
                    </p>
                    <p className="font-semibold text-gray-700 dark:text-gray-200">
                      {challenge.race.distance} km
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase">
                      {t("challenge.briefing.weather_temp" as TranslationKey)}
                    </p>
                    <p className="font-semibold text-gray-700 dark:text-gray-200">
                      {t(
                        `challenge.weather.${challenge.environment.weather}` as TranslationKey,
                      )}{" "}
                      {challenge.environment.temperature}°C
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase">
                      {t("challenge.briefing.surface_type" as TranslationKey)}
                    </p>
                    <p className="font-semibold text-gray-700 dark:text-gray-200">
                      {t(
                        `challenge.surface.${challenge.race.surface}` as TranslationKey,
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase">
                      {t("challenge.briefing.target_time" as TranslationKey)}
                    </p>
                    <p className="font-semibold text-gray-700 dark:text-gray-200">
                      {Math.floor(challenge.objective.targetTime / 60)}m
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-t border-[#E5E7EB] dark:border-slate-800/40 pt-3 text-xs text-orange-650 dark:text-orange-350 bg-orange-50 dark:bg-orange-950/20 rounded-[1.5rem] p-3 flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <p>{challenge.race.description[lang]}</p>
              </div>
            </div>
          </div>

          {/* Sticky ready CTA */}
          <div className="rounded-[2rem] border-2 border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-[0_8px_24px_rgba(0,0,0,0.05)] flex flex-col gap-3">
            <button
              id="ready-race-cta"
              type="button"
              onClick={handleStartSimulation}
              className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-black text-base py-4 rounded-[1.5rem] transition-all duration-200 shadow-md shadow-orange-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 flex items-center justify-center gap-2"
            >
              {t("preparation.ready" as TranslationKey)} →
            </button>
            <button
              type="button"
              onClick={() => {
                playSound("click");
                setIsShareOpen(true);
              }}
              className="w-full border-2 border-orange-500 bg-orange-50 dark:bg-orange-950/20 text-orange-605 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 active:scale-[0.98] font-black text-sm py-3 rounded-[1.5rem] transition duration-200 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              <Share2 className="h-4.5 w-4.5" />
              <span>{t("share.loadout.button" as TranslationKey)}</span>
            </button>
          </div>
        </div>
      </main>

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
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-gray-950/90 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-[2rem] p-6 max-w-md w-full shadow-2xl flex flex-col gap-6 text-center">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-orange-500 dark:text-orange-400 font-extrabold">
                Warm-up Timing Challenge
              </span>
              <h3 className="font-heading text-lg font-black text-slate-800 dark:text-white mt-1">
                Prime Your Muscle Memory!
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-2">
                Tap when the slider is exactly in the center green zone to boost
                your starting stamina!
              </p>
            </div>

            <div className="relative w-full h-8 bg-slate-100 dark:bg-gray-950 rounded-full border border-slate-200 dark:border-gray-800 overflow-hidden flex items-center">
              <div className="absolute left-[30%] right-[30%] h-full bg-yellow-400/20 dark:bg-yellow-400/10 border-l border-r border-yellow-400/30" />

              <div className="absolute left-[45%] right-[45%] h-full bg-emerald-500/30 dark:bg-emerald-500/20 border-l border-r border-emerald-500/50 flex items-center justify-center">
                <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest pointer-events-none">
                  Target
                </span>
              </div>

              <div
                className="absolute w-2.5 h-full bg-orange-500 dark:bg-orange-450 shadow-lg rounded-full transition-all duration-75"
                style={{ left: `calc(${warmupProgress}% - 4px)` }}
              />
            </div>

            <div className="flex flex-col gap-4 items-center">
              {gameResult ? (
                <div
                  className={`text-xs font-black px-4 py-2.5 rounded-2xl uppercase tracking-wider
                    ${gameResult === "perfect" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20" : ""}
                    ${gameResult === "good" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400 border border-yellow-500/20" : ""}
                    ${gameResult === "normal" ? "bg-slate-100 text-slate-800 dark:bg-gray-800 dark:text-gray-405 border border-slate-300/30" : ""}
                  `}
                >
                  {gameResult === "perfect" &&
                    "⭐ PERFECT WARM-UP (+15% Stamina) ⭐"}
                  {gameResult === "good" && "👍 GOOD WARM-UP (+5% Stamina)"}
                  {gameResult === "normal" && "Ready! (Normal Starting Stats)"}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleTapWarmup}
                  className="w-full py-4 px-6 rounded-[1.5rem] text-xs font-black text-white bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20 active:scale-95 transition-all transform uppercase tracking-widest cursor-pointer"
                >
                  TAP WARM-UP!
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
}: OptionCardProps) {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group relative flex w-full flex-col text-left bg-white dark:bg-slate-900 rounded-[2rem] border-2 p-5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 active:scale-[0.99] $
        selected
          ? "border-orange-500 shadow-md ring-1 ring-orange-500"
          : "border-[#E5E7EB] hover:border-orange-350 hover:shadow-sm"
        disabled
          ? "opacity-60 cursor-not-allowed border-gray-200 dark:border-slate-700"
          : ""
        ${className}
      `}
    >
      <div className="flex w-full items-start justify-between mb-2">
        <h3 className="font-heading font-semibold text-gray-900 dark:text-white leading-snug group-hover:text-orange-600 transition-colors duration-150">
          {title}
        </h3>
        {/* Selection indicator */}
        <div
          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center border-2 transition-all ${
            isMultiSelect ? "rounded-md" : "rounded-full"
          } ${
            selected
              ? "border-orange-500 bg-orange-500 text-white"
              : "border-gray-300 bg-white dark:bg-slate-900 group-hover:border-orange-450"
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
      <p className="text-xs text-gray-500 dark:text-gray-300 leading-relaxed mb-4 flex-grow">
        {desc}
      </p>
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {badges.map((badge) => (
            <span
              key={badge.text}
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${badge.color}`}
            >
              {badge.text}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
