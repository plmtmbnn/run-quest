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

  const setShoes = (val: Parameters<typeof _setShoes>[0]) => {
    playSound("click");
    _setShoes(val);
  };
  const toggleNutrition = (val: Parameters<typeof _toggleNutrition>[0]) => {
    playSound("click");
    _toggleNutrition(val);
  };
  const toggleGear = (val: Parameters<typeof _toggleGear>[0]) => {
    playSound("click");
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
      className="min-h-screen bg-background pb-24 text-gray-900 dark:text-white"
    >
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[#E5E7EB] bg-surface/90 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <button
            id="back-to-home"
            type="button"
            onClick={() => {
              playSound("click");
              router.back();
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-200 hover:border-blue-500 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
            <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-2">
              <span className="text-xl">👟</span>
              <h2 className="font-heading text-lg font-bold text-gray-800 dark:text-gray-100">
                {t("preparation.shoes.title" as TranslationKey)}
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <OptionCard
                id="shoe-daily"
                selected={preparation.shoes === "daily_trainer"}
                onClick={() => setShoes("daily_trainer")}
                title={t(
                  "preparation.shoes.daily_trainer.name" as TranslationKey,
                )}
                desc={t(
                  "preparation.shoes.daily_trainer.desc" as TranslationKey,
                )}
                badges={[
                  {
                    text: "⚖️ Balanced",
                    color:
                      "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200",
                  },
                ]}
              />
              <OptionCard
                id="shoe-carbon"
                selected={preparation.shoes === "carbon_racer"}
                onClick={() => setShoes("carbon_racer")}
                title={t(
                  "preparation.shoes.carbon_racer.name" as TranslationKey,
                )}
                desc={t(
                  "preparation.shoes.carbon_racer.desc" as TranslationKey,
                )}
                badges={[
                  {
                    text: "⚡ + Pace",
                    color:
                      "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300",
                  },
                  {
                    text: "⚠️ + Fatigue",
                    color:
                      "bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300",
                  },
                ]}
              />
              <OptionCard
                id="shoe-lightweight"
                selected={preparation.shoes === "lightweight"}
                onClick={() => setShoes("lightweight")}
                title={t(
                  "preparation.shoes.lightweight.name" as TranslationKey,
                )}
                desc={t("preparation.shoes.lightweight.desc" as TranslationKey)}
                badges={[
                  {
                    text: "🏃 Lightweight",
                    color:
                      "bg-sky-100 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300",
                  },
                  {
                    text: "📉 Comfort",
                    color:
                      "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300",
                  },
                ]}
              />
              <OptionCard
                id="shoe-trail"
                selected={preparation.shoes === "trail"}
                onClick={() => setShoes("trail")}
                title={t("preparation.shoes.trail.name" as TranslationKey)}
                desc={t("preparation.shoes.trail.desc" as TranslationKey)}
                badges={[
                  {
                    text: "🥾 + Trail Grip",
                    color:
                      "bg-orange-100 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300",
                  },
                  {
                    text: "🐢 - Road Speed",
                    color:
                      "bg-amber-100 dark:bg-amber-950/40 text-amber-750 dark:text-amber-300",
                  },
                ]}
              />
            </div>
          </section>

          {/* Category: Nutrition */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-2">
              <span className="text-xl">🥤</span>
              <h2 className="font-heading text-lg font-bold text-gray-800 dark:text-gray-100">
                {t("preparation.nutrition.title" as TranslationKey)}
              </h2>
            </div>
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
                      "bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300",
                  },
                  {
                    text: "📉 Energy Crash Risk",
                    color:
                      "bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300",
                  },
                ]}
              />
            </div>
          </section>

          {/* Category: Gear */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-2">
              <span className="text-xl">🎒</span>
              <h2 className="font-heading text-lg font-bold text-gray-800 dark:text-gray-100">
                {t("preparation.gear.title" as TranslationKey)}
              </h2>
            </div>
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
                      "bg-cyan-100 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300",
                  },
                  {
                    text: "⚖️ Heavy",
                    color:
                      "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200",
                  },
                ]}
                isMultiSelect
              />
            </div>
          </section>

          {/* Category: Warmup */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-2">
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
                      "bg-gray-100 dark:bg-slate-805 text-gray-700 dark:text-gray-200",
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
            <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-2">
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
            <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-2">
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
          <div className="rounded-3xl border-2 border-[#E5E7EB] bg-white dark:bg-slate-900 p-6 shadow-sm">
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
          <div className="rounded-[2rem] border-2 border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-[0_8px_24px_rgba(0,0,0,0.05)] flex flex-col gap-3">
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
}

function OptionCard({
  id,
  selected,
  onClick,
  title,
  desc,
  badges = [],
  isMultiSelect = false,
}: OptionCardProps) {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      className={`group relative flex w-full flex-col text-left bg-white dark:bg-slate-900 rounded-[2rem] border-2 p-5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 active:scale-[0.99] ${
        selected
          ? "border-orange-500 shadow-md ring-1 ring-orange-500"
          : "border-[#E5E7EB] hover:border-orange-350 hover:shadow-sm"
      }`}
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
