"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  Dices,
  Flame,
  HelpCircle,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSound } from "@/hooks/use-sound";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";
import { storageRepository } from "@/storage/storage-repository";
import { usePlayerStore } from "@/store/player-store";
import { useSettingsStore } from "@/store/settings-store";
import { generateRunnerName } from "@/utils/name-generator";

import { detectDeviceCountry } from "@/utils/device-location";
import { SearchableCountrySelect } from "@/components/ui/searchable-country-select";
import { type CountryData, getCountryByCode } from "@/config/countries-data";
import type { CurrencyCode } from "@/economy/currency-config";

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { t, language } = useTranslation();
  const { setLanguage, setPreferredCurrency } = useSettingsStore();
  const { playSound } = useSound();
  const player = usePlayerStore((state) => state.player);
  const setPlayerName = usePlayerStore((state) => state.setPlayerName);
  const setNationality = usePlayerStore((state) => state.setNationality);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for prev, 1 for next
  const [nameInput, setNameInput] = useState("");
  const [hasInitializedName, setHasInitializedName] = useState(false);
  const [hasNameError, setHasNameError] = useState(false);

  // Dynamic device locale detection
  const [selectedNationality, setSelectedNationality] = useState(() =>
    player?.nationality ? player.nationality : detectDeviceCountry()
  );
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(() => {
    const initialCountry = getCountryByCode(player?.nationality || detectDeviceCountry());
    return initialCountry.defaultCurrency;
  });

  useEffect(() => {
    if (player?.name && !hasInitializedName) {
      setNameInput(player.name);
      setHasInitializedName(true);
    }
  }, [player?.name, hasInitializedName]);

  const slides = [
    {
      titleKey: "onboarding.slide_1.title",
      subtitleKey: "onboarding.slide_1.subtitle",
      contentKey: "onboarding.slide_1.content",
      icon: <Flame className="w-16 h-16 md:w-20 md:h-20 text-orange-500 animate-pulse drop-shadow-[0_0_15px_rgba(249,115,22,0.4)]" />,
      color: "from-orange-500/10 via-orange-100/20 to-amber-200/10",
      bgGradient: "from-orange-500 to-amber-500",
      accent: "border-orange-200",
    },
    {
      titleKey: "onboarding.slide_2.title",
      subtitleKey: "onboarding.slide_2.subtitle",
      contentKey: "onboarding.slide_2.content",
      icon: (
        <Compass
          className="w-16 h-16 md:w-20 md:h-20 text-indigo-500 animate-bounce drop-shadow-[0_0_15px_rgba(99,102,241,0.4)]"
          style={{ animationDuration: "3s" }}
        />
      ),
      color: "from-blue-500/10 via-blue-100/20 to-indigo-200/10",
      bgGradient: "from-indigo-500 to-blue-600",
      accent: "border-blue-200",
    },
    {
      titleKey: "onboarding.slide_3.title",
      subtitleKey: "onboarding.slide_3.subtitle",
      contentKey: "onboarding.slide_3.content",
      icon: <HelpCircle className="w-16 h-16 md:w-20 md:h-20 text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]" />,
      color: "from-emerald-500/10 via-emerald-100/20 to-teal-200/10",
      bgGradient: "from-emerald-500 to-teal-600",
      accent: "border-emerald-200",
    },
    {
      titleKey: "onboarding.slide_4.title",
      subtitleKey: "onboarding.slide_4.subtitle",
      contentKey: "onboarding.slide_4.content",
      icon: <User className="w-16 h-16 md:w-20 md:h-20 text-violet-500 drop-shadow-[0_0_15px_rgba(139,92,246,0.4)]" />,
      color: "from-violet-500/10 via-violet-100/20 to-purple-200/10",
      bgGradient: "from-violet-500 to-purple-600",
      accent: "border-violet-200",
    },
  ];

  const isLastSlide = currentSlide === slides.length - 1;
  const progress = ((currentSlide + 1) / slides.length) * 100;

  const handleRegenerate = () => {
    playSound("click");
    setNameInput(generateRunnerName());
    setHasNameError(false);
  };

  const setSlideWithDirection = (newSlide: number) => {
    setDirection(newSlide > currentSlide ? 1 : -1);
    setCurrentSlide(newSlide);
  };

  const handleNext = () => {
    playSound("click");
    if (!isLastSlide) {
      setSlideWithDirection(currentSlide + 1);
      return;
    }
    if (!nameInput.trim()) {
      setHasNameError(true);
      return;
    }
    setPlayerName(nameInput.trim());
    setNationality(selectedNationality);
    setPreferredCurrency(selectedCurrency);
    storageRepository.saveSettings({
      version: 1,
      theme: "light", // Forced light theme globally
      language,
      reducedMotion: false,
      sound: true,
      hasCompletedOnboarding: true,
      preferredCurrency: selectedCurrency,
      hapticFeedback: true,
      preferences: {
        preferredSurface: "any",
        preferredDistance: "any",
      },
    });
    onComplete();
  };

  const handleBack = () => {
    if (currentSlide === 0) return;
    playSound("click");
    setSlideWithDirection(currentSlide - 1);
  };

  // Keyboard navigation (left/right arrows; Enter/Space handled by buttons natively)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft" && currentSlide > 0) {
        e.preventDefault();
        handleBack();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlide, nameInput]);

  const activeSlide = slides[currentSlide];

  // Motion variants for slide transition
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring" as const, stiffness: 350, damping: 30 },
        opacity: { duration: 0.2 },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { type: "spring" as const, stiffness: 350, damping: 30 },
        opacity: { duration: 0.2 },
      },
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white flex flex-col justify-between p-4 sm:p-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] relative overflow-hidden"
    >
      {/* Decorative Brand Glow Circles */}
      <div className="absolute top-[-20%] left-[-30%] w-[100%] h-[60%] rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-30%] w-[100%] h-[60%] rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="flex justify-between items-center max-w-md mx-auto w-full pt-2 sm:pt-4 z-10">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Flame className="w-5 h-5 text-white animate-pulse" />
          </div>
          <span className="font-heading font-black text-sm uppercase tracking-widest text-slate-800 dark:text-white">
            RunQuest
          </span>
        </div>

        {/* Pill-styled Language Selector from UI Guidelines */}
        <div className="flex bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 p-1 rounded-full shadow-sm relative">
          <button
            type="button"
            onClick={() => {
              playSound("click");
              setLanguage("en");
            }}
            aria-pressed={language === "en"}
            className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wider transition-all duration-200 min-h-[32px] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 ${
              language === "en"
                ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => {
              playSound("click");
              setLanguage("id");
            }}
            aria-pressed={language === "id"}
            className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wider transition-all duration-200 min-h-[32px] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 ${
              language === "id"
                ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            ID
          </button>
        </div>
      </header>

      {/* Main Slide Card Container */}
      <main className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full py-4 sm:py-6 z-10">
        <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] shadow-sm hover:shadow-md overflow-hidden flex flex-col min-h-[460px] sm:min-h-[520px] relative transition-all duration-300">
          {/* Top visual graphic area */}
          <div className="h-36 sm:h-44 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-center border-b border-slate-100 dark:border-slate-800/80 relative overflow-hidden">
            {/* Slide specific abstract background glow */}
            <div className={`absolute inset-0 bg-gradient-to-b ${activeSlide.color} opacity-40 blur-md`} />

            <motion.div
              key={currentSlide}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35, type: "spring", stiffness: 125 }}
              className="z-10"
            >
              {activeSlide.icon}
            </motion.div>
          </div>

          {/* Slide Text Content Container */}
          <div className="flex-1 p-5 sm:p-8 flex flex-col justify-between overflow-hidden">
            <div className="flex-1 relative min-h-[180px]">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentSlide}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="w-full flex flex-col gap-3"
                >
                  <h2 className="font-heading font-black text-2xl md:text-3xl text-slate-800 dark:text-white leading-tight">
                    {t(activeSlide.titleKey as TranslationKey)}
                  </h2>
                  <p className="font-heading font-extrabold text-sm text-indigo-600 dark:text-indigo-400 leading-snug">
                    {t(activeSlide.subtitleKey as TranslationKey)}
                  </p>

                  {currentSlide === 3 ? (
                    <div className="flex flex-col gap-4 mt-2">
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {t(activeSlide.contentKey as TranslationKey)}
                      </p>
                      <div className="flex flex-col gap-2 w-full">
                        {/* Runner Name Input */}
                        <div className="flex gap-2.5 items-center">
                          <input
                            type="text"
                            value={nameInput}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNameInput(val);
                              if (val.trim()) {
                                setHasNameError(false);
                              }
                            }}
                            maxLength={24}
                            aria-label={t("onboarding.slide_4.title" as TranslationKey)}
                            aria-invalid={hasNameError}
                            aria-describedby={hasNameError ? "onboarding-name-error" : undefined}
                            className={`flex-grow min-h-[44px] border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white border-slate-200 dark:border-slate-800 font-bold transition-all ${
                              hasNameError
                                ? "border-rose-500 focus:ring-rose-500"
                                : "focus:border-indigo-500"
                            }`}
                            placeholder="Runner Name"
                          />
                          <button
                            type="button"
                            onClick={handleRegenerate}
                            className="min-h-[44px] min-w-[44px] p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 active:scale-95 text-slate-600 dark:text-slate-350 transition flex items-center justify-center shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
                            title="Roll for random name"
                            aria-label="Roll for random name"
                          >
                            <Dices className="w-5 h-5" />
                          </button>
                        </div>
                        {hasNameError && (
                          <p
                            id="onboarding-name-error"
                            role="alert"
                            aria-live="assertive"
                            className="text-xs text-rose-600 dark:text-rose-400 font-bold px-1 animate-pulse"
                          >
                            ⚠️ {t("onboarding.name_error" as TranslationKey)}
                          </p>
                        )}

                        {/* Searchable Country Selector */}
                        <div className="mt-1">
                          <SearchableCountrySelect
                            selectedCode={selectedNationality}
                            label={t("onboarding.nationality.title" as TranslationKey) || "Nationality"}
                            onSelect={(country) => {
                              setSelectedNationality(country.code);
                              setSelectedCurrency(country.defaultCurrency);
                            }}
                          />
                        </div>

                        {/* Preferred Currency Pill Selector */}
                        <div className="flex flex-col gap-1.5 mt-1">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            💳 {t("onboarding.currency.title" as TranslationKey) || "Default Currency"}
                          </span>
                          <div className="grid grid-cols-4 gap-1.5">
                            {(["USD", "EUR", "JPY", "IDR"] as CurrencyCode[]).map((curr) => {
                              const symbols: Record<CurrencyCode, string> = {
                                USD: "$",
                                EUR: "€",
                                JPY: "¥",
                                IDR: "Rp",
                              };
                              const isActive = selectedCurrency === curr;
                              return (
                                <button
                                  key={curr}
                                  type="button"
                                  onClick={() => {
                                    playSound("click");
                                    setSelectedCurrency(curr);
                                  }}
                                  className={`py-2 px-1 rounded-xl text-xs font-extrabold transition-all border text-center ${
                                    isActive
                                      ? "bg-indigo-500 text-white border-indigo-500 shadow-sm shadow-indigo-500/30"
                                      : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900"
                                  }`}
                                >
                                  {curr} <span className="opacity-75">{symbols[curr]}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                      {t(activeSlide.contentKey as TranslationKey)}
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Carousel indicator dots (accessible tablist) */}
            <div
              role="tablist"
              aria-label="Onboarding progress"
              className="flex gap-2.5 justify-center mt-6 sm:mt-8"
            >
              {slides.map((slide, idx) => (
                <button
                  key={slide.titleKey}
                  type="button"
                  role="tab"
                  aria-selected={idx === currentSlide}
                  aria-label={`${t("onboarding.slide_" + (idx + 1) + ".title" as TranslationKey)} (${idx + 1} of ${slides.length})`}
                  onClick={() => {
                    playSound("click");
                    setSlideWithDirection(idx);
                  }}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 ${
                    idx === currentSlide
                      ? "bg-indigo-500 w-8"
                      : "w-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700"
                  }`}
                />
              ))}
            </div>

            {/* Linear progress bar */}
            <div
              className="mt-4 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"
              role="progressbar"
              aria-valuenow={currentSlide + 1}
              aria-valuemin={1}
              aria-valuemax={slides.length}
              aria-label="Onboarding step"
            >
              <div
                className="h-full rounded-full bg-indigo-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Actions footer */}
      <footer className="max-w-md mx-auto w-full pb-2 sm:pb-4 z-10">
        <div className="flex gap-3">
          {/* Back button (hidden on first slide) */}
          {currentSlide > 0 && (
            <button
              type="button"
              onClick={handleBack}
              aria-label="Back to previous slide"
              className="shrink-0 min-h-[44px] min-w-[44px] px-4 rounded-[2rem] text-sm font-black bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 text-slate-600 dark:text-slate-300 shadow-sm active:scale-95 transition flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="group flex-1 min-h-[44px] py-3.5 rounded-[2rem] text-sm font-black bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/20 active:scale-95 transition flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
          >
            <span>
              {isLastSlide
                ? t("onboarding.start" as TranslationKey)
                : t("onboarding.next" as TranslationKey)}
            </span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </footer>
    </motion.div>
  );
}
